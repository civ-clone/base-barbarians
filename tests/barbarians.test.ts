import { describe, it } from 'mocha';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import { nearPole, polarRows } from '../lib/polar';
import Added from '@civ-clone/core-player/Rules/Added';
import Advance from '@civ-clone/core-science/Advance';
import { Attila } from '@civ-clone/base-civilization-barbarian/Leaders';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Government from '@civ-clone/core-government/Government';
import LeadsGroup from '../Rules/LeadsGroup';
import LeavesMap from '../Rules/LeavesMap';
import { Land, Water } from '@civ-clone/core-terrain/Types';
import NavalTransport from '@civ-clone/base-unit-type-naval-transport/NavalTransport';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Rule from '@civ-clone/core-rule/Rule';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Spawning from '../Rules/Spawning';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import anyoneHas from '../lib/anyoneHas';
import barbarianPlayer from '../lib/barbarianPlayer';
import cityGold from '../lib/cityGold';
import { expect } from 'chai';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import leadsGroup from '../lib/leadsGroup';
import leavesMap from '../lib/leavesMap';
import payRansom from '../lib/ransom';
import spawnUnits from '../lib/spawnUnits';
import spawning from '../lib/spawning';
import waterBodyHasAtLeast from '../lib/waterBody';
import worldOf from '../lib/worldOf';

class Lawless extends Government {}
class Raider extends Unit {}
class Leader extends Unit {}
class Wheel extends Advance {}
class Sea extends Water {}
class Shore extends Land {}

// A ship that takes `capacity` units.
class Ship extends Unit implements Partial<NavalTransport> {
  private _carried: Unit[] = [];
  private _capacity: number;

  constructor(capacity: number, player: Player, tile: Tile) {
    super(null, player, tile, new RuleRegistry());

    this._capacity = capacity;
  }

  cargo(): Unit[] {
    return this._carried;
  }

  stow(unit: Unit): boolean {
    if (this._carried.length >= this._capacity) {
      return false;
    }

    this._carried.push(unit);

    return true;
  }
}

const startingAdvances = 'test:player/added/starting-advances',
  // A game whose new players get a government and a treasury, and, from a rule `startingAdvances` names, an advance.
  setUp = async (world?: World) => {
    const game = new Game(),
      map = world ?? (await generateWorld(undefined, game.rules)),
      advanced: Player[] = [];

    game.rules.register(
      new Added(
        new Effect((player: Player): void => {
          game.playerGovernments.register(
            new PlayerGovernment(player, undefined, game.rules)
          );
          game.playerTreasuries.register(
            new PlayerTreasury(player, Gold, game.rules)
          );
        })
      ),
      new Added(
        startingAdvances,
        new Effect((player: Player): void => {
          advanced.push(player);
        })
      )
    );

    return { advanced, game, world: map };
  };

describe('spawning', (): void => {
  it('allows barbarians only when every Spawning rule does, and always with none', (): void => {
    const rules = new RuleRegistry(),
      turn = new Turn();

    expect(spawning(rules, turn)).true;

    rules.register(new Spawning(new Effect((): boolean => true)));

    expect(spawning(rules, turn)).true;

    rules.register(
      new Spawning(new Effect((turn: Turn): boolean => turn.value() > 0))
    );

    expect(spawning(rules, turn)).false;

    turn.increment();

    expect(spawning(rules, turn)).true;
  });
});

describe('barbarianPlayer', (): void => {
  it('adds the barbarians in the government given, with the rules named held off, and gives Barbarian and Attila back', async (): Promise<void> => {
    const { advanced, game, world } = await setUp(),
      spawned: Player[] = [];

    game.engine.on('player:spawned', (player: Player) => spawned.push(player));

    const player = barbarianPlayer(game, world, {
      government: Lawless,
      heldOff: [startingAdvances, 'test:not-registered'],
    });

    expect(isBarbarian(player)).true;
    expect(player.civilization()).instanceOf(Barbarian);
    expect(player.civilization().leader()).instanceOf(Attila);
    expect(game.playerGovernments.getByPlayer(player).current()).instanceOf(
      Lawless
    );
    expect(advanced).eql([]);
    expect(spawned).eql([player]);
    expect(game.rules.getById(startingAdvances)!.enabled()).true;
    expect(game.civilizations.includes(Barbarian)).false;
    expect(game.leaders.includes(Attila)).false;
    // Nobody is queued yet, so it isn't queued either.
    expect(game.currentPlayers.length).equal(0);

    expect(barbarianPlayer(game, world, { government: Lawless })).equal(player);
    expect(game.players.length).equal(1);
  });

  it('leaves a rule that was already off off, and without heldOff holds nothing off', async (): Promise<void> => {
    const { advanced, game, world } = await setUp();

    game.rules.getById(startingAdvances)!.disable();

    barbarianPlayer(game, world, {
      government: Lawless,
      heldOff: [startingAdvances],
    });

    expect(game.rules.getById(startingAdvances)!.enabled()).false;
    expect(advanced).eql([]);

    const second = await setUp();

    barbarianPlayer(second.game, second.world, { government: Lawless });

    expect(second.advanced.length).equal(1);
  });

  it('joins the queue of a turn already under way', async (): Promise<void> => {
    const { game, world } = await setUp(),
      other = new Player(game.rules);

    game.currentPlayers.register(other);

    const player = barbarianPlayer(game, world, { government: Lawless });

    expect(game.currentPlayers.entries()).eql([other, player]);
  });

  it('gives Barbarian and Attila back when adding the player throws', async (): Promise<void> => {
    const { game, world } = await setUp();

    game.rules.register(
      new Added(
        new Effect((): void => {
          throw new Error('no');
        })
      )
    );

    expect(() =>
      barbarianPlayer(game, world, {
        government: Lawless,
        heldOff: [startingAdvances],
      })
    ).throw('no');
    expect(game.rules.getById(startingAdvances)!.enabled()).true;
    expect(game.civilizations.includes(Barbarian)).false;
    expect(game.leaders.includes(Attila)).false;
  });
});

describe('spawnUnits', (): void => {
  it('makes one of each type in order, stowing them aboard a ship and dropping any it has no room for', async (): Promise<void> => {
    const world = await generateWorld(),
      tile = world.get(1, 1),
      player = new Player(),
      onLand = spawnUnits(player, tile, [Raider, Leader], new RuleRegistry());

    expect(onLand.map((unit) => unit.constructor)).eql([Raider, Leader]);
    expect(onLand.every((unit) => unit.tile() === tile)).true;
    expect(onLand.every((unit) => unit.player() === player)).true;

    const ship = new Ship(2, player, tile),
      aboard = spawnUnits(
        player,
        tile,
        [Raider, Raider, Leader],
        new RuleRegistry(),
        ship as unknown as NavalTransport
      );

    expect(aboard.length).equal(2);
    expect(ship.cargo()).eql(aboard);
    expect(aboard.every((unit) => unit.busy() instanceof Stowed)).true;
    expect(aboard.every((unit) => !unit.active())).true;
  });
});

describe('payRansom', (): void => {
  it('pays the gold given and says so', async (): Promise<void> => {
    const game = new Game(),
      player = new Player(game.rules),
      leader = {} as Unit,
      heard: unknown[][] = [];

    game.playerTreasuries.register(
      new PlayerTreasury(player, Gold, game.rules)
    );
    game.engine.on('barbarians:ransom', (...args: unknown[]) =>
      heard.push(args)
    );

    payRansom(game, player, leader, 150);

    expect(
      game.playerTreasuries.getByPlayerAndType(player, Gold).value()
    ).equal(150);
    expect(heard).eql([[player, leader, 150]]);
  });

  it('pays nothing, and says nothing, to a player with no treasury (civ-clone/web-renderer#963)', async (): Promise<void> => {
    const game = new Game(),
      player = new Player(game.rules),
      heard: unknown[][] = [];

    game.engine.on('barbarians:ransom', (...args: unknown[]) =>
      heard.push(args)
    );

    expect(() => payRansom(game, player, {} as Unit, 150)).not.throw();
    expect(heard).eql([]);
  });
});

describe('waterBodyHasAtLeast', (): void => {
  it('counts the water joined to a square, stopping once it has seen enough', async (): Promise<void> => {
    // A 10 × 10 sea with a 2 × 2 lake walled off at its corner (rows and columns 0–2 are land but for the lake).
    const world = await generateWorld(generateGenerator(10, 10, Sea));

    world.entries().forEach((tile: Tile): void => {
      const x = tile.x(),
        y = tile.y();

      if ((x === 2 || y === 2) && x <= 2 && y <= 2) {
        tile.setTerrain(new Shore());
      }

      // Wrapping edges: wall the lake off from the far side too.
      if ((x === 9 || y === 9) && (x <= 2 || x === 9) && (y <= 2 || y === 9)) {
        tile.setTerrain(new Shore());
      }
    });

    expect(waterBodyHasAtLeast(world.get(0, 0), 4)).true;
    expect(waterBodyHasAtLeast(world.get(0, 0), 5)).false;
    expect(waterBodyHasAtLeast(world.get(5, 5), 16)).true;
    expect(waterBodyHasAtLeast(world.get(2, 2), 1)).false;
  });
});

describe('worldOf', (): void => {
  it("is the world of the first standing city, else the first unit's, else null", async (): Promise<void> => {
    const world = await generateWorld(),
      other = await generateWorld(),
      city = (map: World, destroyed: boolean) =>
        ({
          destroyed: () => destroyed,
          tile: () => map.get(0, 0),
        } as unknown as City),
      unit = { tile: () => other.get(0, 0) } as unknown as Unit;

    expect(
      worldOf({
        cities: { entries: () => [city(other, true), city(world, false)] },
        units: { entries: () => [unit] },
      })
    ).equal(world);
    expect(
      worldOf({
        cities: { entries: () => [city(world, true)] },
        units: { entries: () => [unit] },
      })
    ).equal(other);
    expect(
      worldOf({ cities: { entries: () => [] }, units: { entries: () => [] } })
    ).null;
  });
});

describe('anyoneHas', (): void => {
  it('asks every player, in the game or gone', (): void => {
    const game = new Game(),
      [first, second] = [new Player(), new Player()].map(
        (player: Player): PlayerResearch => {
          const research = new PlayerResearch(
            player,
            game.advances,
            game.rules
          );

          game.playerResearch.register(research);

          return research;
        }
      );

    expect(anyoneHas(game.playerResearch, Wheel)).false;

    second.addAdvance(Wheel);

    expect(anyoneHas(game.playerResearch, Wheel)).true;
    expect(first.completed(Wheel)).false;
  });
});

describe('cityGold', (): void => {
  it("shares out the owner's gold by the city's size, over all its citizens and one", (): void => {
    const player = new Player(),
      sizes = new Map<unknown, number>(),
      cities = [4, 2, 1].map((size: number) => {
        const city = { player: () => player } as unknown as City;

        sizes.set(city, size);

        return city;
      }),
      dependencies = (gold: number) => ({
        cities: { getByPlayer: () => cities },
        cityGrowth: {
          getByCity: (city: City) => ({ size: () => sizes.get(city)! }),
        },
        playerTreasuries: {
          getByPlayerAndType: () => ({ value: () => gold }),
        },
      });

    // 7 citizens: 100 × 4 ÷ 8 = 50, 100 × 2 ÷ 8 = 25, 100 × 1 ÷ 8 = 12.5, kept whole.
    expect(
      cities.map((city: City) => cityGold(city, dependencies(100) as any))
    ).eql([50, 25, 12]);
    expect(cityGold(cities[0], dependencies(0) as any)).equal(0);
  });
});

describe('polar', (): void => {
  it('scales rows of a map of another height, and finds squares that near the top or bottom', async (): Promise<void> => {
    const world = await generateWorld(generateGenerator(100, 10, Terrain));

    // 2 of 50 rows on a 100-row map is 4.
    expect(polarRows(100, 2, 50)).equal(4);
    expect(polarRows(40, 3, 50)).equal(2);
    expect(
      [0, 3, 4, 95, 96, 99].map((y) => nearPole(world.get(0, y), 2, 50))
    ).eql([true, true, false, false, true, true]);
  });
});

describe('leadsGroup and leavesMap', (): void => {
  it("give the caller's own answer while no rule is registered, and the rules' once one is", async (): Promise<void> => {
    const rules = new RuleRegistry(),
      world = await generateWorld(),
      leader = new Leader(null, new Player(), world.get(0, 0), rules),
      raider = new Raider(null, new Player(), world.get(0, 0), rules),
      asked: unknown[] = [],
      fallback =
        (answer: boolean) =>
        (subject: unknown): boolean => {
          asked.push(subject);

          return answer;
        };

    expect(leadsGroup(rules, leader, fallback(true))).true;
    expect(leadsGroup(rules, raider, fallback(false))).false;
    expect(leavesMap(rules, world.get(0, 0), fallback(true))).true;
    expect(asked).eql([leader, raider, world.get(0, 0)]);

    rules.register(
      new LeadsGroup(
        new Criterion((unit: Unit): boolean => unit instanceof Leader),
        new Effect((): boolean => true)
      ),
      new LeavesMap(new Effect((tile: Tile): boolean => tile.y() === 0))
    );

    expect(leadsGroup(rules, leader, fallback(false))).true;
    expect(leadsGroup(rules, raider, fallback(true))).false;
    expect(leavesMap(rules, world.get(0, 0), fallback(false))).true;
    expect(leavesMap(rules, world.get(0, 1), fallback(true))).false;
    expect(asked.length).equal(3);

    // A rule switched off is as good as none.
    rules
      .entries()
      .filter((rule: Rule): boolean => rule instanceof LeavesMap)
      .forEach((rule: Rule): void => rule.disable());

    expect(leavesMap(rules, world.get(0, 1), fallback(true))).true;
  });
});

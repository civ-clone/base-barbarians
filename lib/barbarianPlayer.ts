import addPlayer, { AddPlayerGame } from '@civ-clone/base-player/lib/addPlayer';
import { Attila } from '@civ-clone/base-civilization-barbarian/Leaders';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import World from '@civ-clone/core-world/World';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

export type BarbarianPlayerGame = AddPlayerGame &
  Pick<Game, 'currentPlayers' | 'playerGovernments'>;

export type BarbarianPlayerOptions = {
  // The government the barbarians have for good, made afresh for the new player.
  government: new () => Government;
  // The ids of `Added` rules held off while the player is added, such as the one that gives a new player its starting
  //  advances: the barbarians never have an advance, and `Player`'s `Added` rules run before its civilization is set,
  //  so `isBarbarian` can't tell them apart there. An id that isn't registered is passed over.
  heldOff?: string[];
};

/**
 * The barbarian player: the one the game has, or a new one, made at the first spawn so that a new game and an old save
 * take the same path and nobody takes an empty turn before the barbarians are due.
 *
 * It claims `Barbarian` and `Attila` through `addPlayer`, which wants both in the registries and takes them out again,
 * so they are registered just for that: they are never offered to anyone else. `player:spawned` is emitted for the
 * host to give it its client. Its government is set to `government`, which the rule set keeps it in.
 *
 * The spawn runs as a turn starts. When that turn's players are already queued, the new player joins the end of the
 * queue, so its first raiders move this turn; queued later, the queue already holds it.
 */
export const barbarianPlayer = (
  game: BarbarianPlayerGame,
  world: World,
  { government: GovernmentType, heldOff = [] }: BarbarianPlayerOptions
): Player => {
  const existing = game.players
    .entries()
    .find((player: Player): boolean => isBarbarian(player));

  if (existing) {
    return existing;
  }

  const held = heldOff.map((id: string) => {
    const rule = game.rules.getById(id);

    return { rule, enabled: rule?.enabled() ?? false };
  });

  if (!game.civilizations.includes(Barbarian)) {
    game.civilizations.register(Barbarian);
  }

  if (!game.leaders.includes(Attila)) {
    game.leaders.register(Attila);
  }

  held.forEach(({ rule }) => rule?.disable());

  let player: Player;

  try {
    player = addPlayer(game, world, {
      civilization: Barbarian,
      leader: Attila,
    });
  } finally {
    held.forEach(({ rule, enabled }) => {
      if (enabled) {
        rule!.enable();
      }
    });

    if (game.civilizations.includes(Barbarian)) {
      game.civilizations.unregister(Barbarian);
    }

    if (game.leaders.includes(Attila)) {
      game.leaders.unregister(Attila);
    }
  }

  game.playerGovernments.getByPlayer(player).set(new GovernmentType());

  if (game.currentPlayers.length > 0 && !game.currentPlayers.includes(player)) {
    game.currentPlayers.register(player);
  }

  return player;
};

export default barbarianPlayer;

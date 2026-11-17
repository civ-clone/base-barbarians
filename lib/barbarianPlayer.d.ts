import { AddPlayerGame } from '@civ-clone/base-player/lib/addPlayer';
import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import World from '@civ-clone/core-world/World';
export type BarbarianPlayerGame = AddPlayerGame &
  Pick<Game, 'currentPlayers' | 'playerGovernments'>;
export type BarbarianPlayerOptions = {
  government: new () => Government;
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
export declare const barbarianPlayer: (
  game: BarbarianPlayerGame,
  world: World,
  { government: GovernmentType, heldOff }: BarbarianPlayerOptions
) => Player;
export default barbarianPlayer;

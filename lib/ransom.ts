import { Game } from '@civ-clone/core-game';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';

export type RansomGame = Pick<Game, 'engine' | 'playerTreasuries'>;

/**
 * Pays `player` `gold` for the barbarian leader `leader` and says so (`barbarians:ransom`: player, leader, gold).
 * Whichever rule decides that a leader is ransomed, and for how much, pays through this, so the gold and the notice are
 * the same for every rule set.
 */
export const payRansom = (
  game: RansomGame,
  player: Player,
  leader: Unit,
  gold: number
): void => {
  game.playerTreasuries.getByPlayerAndType(player, Gold).add(gold);

  game.engine.emit('barbarians:ransom', player, leader, gold);
};

export default payRansom;

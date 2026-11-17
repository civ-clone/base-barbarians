"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payRansom = void 0;
const Gold_1 = require("@civ-clone/base-city-yield-gold/Gold");
/**
 * Pays `player` `gold` for the barbarian leader `leader` and says so (`barbarians:ransom`: player, leader, gold).
 * Whichever rule decides that a leader is ransomed, and for how much, pays through this, so the gold and the notice are
 * the same for every rule set.
 */
const payRansom = (game, player, leader, gold) => {
    game.playerTreasuries.getByPlayerAndType(player, Gold_1.default).add(gold);
    game.engine.emit('barbarians:ransom', player, leader, gold);
};
exports.payRansom = payRansom;
exports.default = exports.payRansom;
//# sourceMappingURL=ransom.js.map
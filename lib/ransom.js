"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payRansom = void 0;
const Gold_1 = require("@civ-clone/base-city-yield-gold/Gold");
/**
 * Pays `player` `gold` for the barbarian leader `leader` and says so (`barbarians:ransom`: player, leader, gold).
 * Whichever rule decides that a leader is ransomed, and for how much, pays through this, so the gold and the notice are
 * the same for every rule set. A player with no gold treasury to pay into is paid nothing, and nothing is said
 * (civ-clone/web-renderer#963).
 */
const payRansom = (game, player, leader, gold) => {
    const [treasury] = game.playerTreasuries
        .getByPlayer(player)
        .filter((playerTreasury) => playerTreasury.yield() === Gold_1.default);
    if (!treasury) {
        return;
    }
    treasury.add(gold);
    game.engine.emit('barbarians:ransom', player, leader, gold);
};
exports.payRansom = payRansom;
exports.default = exports.payRansom;
//# sourceMappingURL=ransom.js.map
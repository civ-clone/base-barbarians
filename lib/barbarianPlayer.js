"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barbarianPlayer = void 0;
const addPlayer_1 = require("@civ-clone/base-player/lib/addPlayer");
const Leaders_1 = require("@civ-clone/base-civilization-barbarian/Leaders");
const Barbarian_1 = require("@civ-clone/base-civilization-barbarian/Barbarian");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
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
const barbarianPlayer = (game, world, { government: GovernmentType, heldOff = [] }) => {
    const existing = game.players
        .entries()
        .find((player) => (0, isBarbarian_1.default)(player));
    if (existing) {
        return existing;
    }
    const held = heldOff.map((id) => {
        var _a;
        const rule = game.rules.getById(id);
        return { rule, enabled: (_a = rule === null || rule === void 0 ? void 0 : rule.enabled()) !== null && _a !== void 0 ? _a : false };
    });
    if (!game.civilizations.includes(Barbarian_1.default)) {
        game.civilizations.register(Barbarian_1.default);
    }
    if (!game.leaders.includes(Leaders_1.Attila)) {
        game.leaders.register(Leaders_1.Attila);
    }
    held.forEach(({ rule }) => rule === null || rule === void 0 ? void 0 : rule.disable());
    let player;
    try {
        player = (0, addPlayer_1.default)(game, world, {
            civilization: Barbarian_1.default,
            leader: Leaders_1.Attila,
        });
    }
    finally {
        held.forEach(({ rule, enabled }) => {
            if (enabled) {
                rule.enable();
            }
        });
        if (game.civilizations.includes(Barbarian_1.default)) {
            game.civilizations.unregister(Barbarian_1.default);
        }
        if (game.leaders.includes(Leaders_1.Attila)) {
            game.leaders.unregister(Leaders_1.Attila);
        }
    }
    game.playerGovernments.getByPlayer(player).set(new GovernmentType());
    if (game.currentPlayers.length > 0 && !game.currentPlayers.includes(player)) {
        game.currentPlayers.register(player);
    }
    return player;
};
exports.barbarianPlayer = barbarianPlayer;
exports.default = exports.barbarianPlayer;
//# sourceMappingURL=barbarianPlayer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavesMap = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether a barbarian on `tile` leaves the map, as one near a pole may, and whether a group may be landed there. A rule
 * set registers one when its answer isn't the one a barbarian client assumes (`leavesMap`).
 */
class LeavesMap extends Rule_1.default {
}
exports.LeavesMap = LeavesMap;
exports.default = LeavesMap;
//# sourceMappingURL=LeavesMap.js.map
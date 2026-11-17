"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leavesMap = void 0;
const LeavesMap_1 = require("../Rules/LeavesMap");
/**
 * Whether a barbarian on `tile` leaves the map: any `LeavesMap` rule that answers yes, or, with none registered,
 * `fallback(tile)`, the caller's own answer. Asking draws nothing.
 */
const leavesMap = (ruleRegistry, tile, fallback) => ruleRegistry.get(LeavesMap_1.default).length === 0
    ? fallback(tile)
    : ruleRegistry.process(LeavesMap_1.default, tile).some(Boolean);
exports.leavesMap = leavesMap;
exports.default = exports.leavesMap;
//# sourceMappingURL=leavesMap.js.map
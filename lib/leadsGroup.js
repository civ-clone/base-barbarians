"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsGroup = void 0;
const LeadsGroup_1 = require("../Rules/LeadsGroup");
/**
 * Whether `unit` leads its barbarian group: any `LeadsGroup` rule that answers yes, or, with none registered,
 * `fallback(unit)`, the caller's own answer. Asking draws nothing.
 */
const leadsGroup = (ruleRegistry, unit, fallback) => ruleRegistry.get(LeadsGroup_1.default).length === 0
    ? fallback(unit)
    : ruleRegistry.process(LeadsGroup_1.default, unit).some(Boolean);
exports.leadsGroup = leadsGroup;
exports.default = exports.leadsGroup;
//# sourceMappingURL=leadsGroup.js.map
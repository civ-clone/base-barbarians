import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Whether `unit` leads its barbarian group: any `LeadsGroup` rule that answers yes, or, with none registered,
 * `fallback(unit)`, the caller's own answer. Asking draws nothing.
 */
export declare const leadsGroup: (
  ruleRegistry: RuleRegistry,
  unit: Unit,
  fallback: (unit: Unit) => boolean
) => boolean;
export default leadsGroup;

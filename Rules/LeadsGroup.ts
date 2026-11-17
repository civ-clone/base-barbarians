import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Whether a barbarian unit leads its group: the unit a defeated group's ransom is paid for, which keeps to its escort
 * rather than fighting. A rule set registers one when its leader isn't the one a barbarian client assumes (`leadsGroup`).
 */
export class LeadsGroup extends Rule<[Unit], boolean> {}

export default LeadsGroup;

import Rule from '@civ-clone/core-rule/Rule';
import Tile from '@civ-clone/core-world/Tile';
/**
 * Whether a barbarian on `tile` leaves the map, as one near a pole may, and whether a group may be landed there. A rule
 * set registers one when its answer isn't the one a barbarian client assumes (`leavesMap`).
 */
export declare class LeavesMap extends Rule<[Tile], boolean> {}
export default LeavesMap;

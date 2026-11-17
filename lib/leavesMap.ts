import LeavesMap from '../Rules/LeavesMap';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';

/**
 * Whether a barbarian on `tile` leaves the map: any `LeavesMap` rule that answers yes, or, with none registered,
 * `fallback(tile)`, the caller's own answer. Asking draws nothing.
 */
export const leavesMap = (
  ruleRegistry: RuleRegistry,
  tile: Tile,
  fallback: (tile: Tile) => boolean
): boolean =>
  ruleRegistry.get(LeavesMap).length === 0
    ? fallback(tile)
    : ruleRegistry.process(LeavesMap, tile).some(Boolean);

export default leavesMap;

import Rule from '@civ-clone/core-rule/Rule';
import Turn from '@civ-clone/core-turn-based-game/Turn';
/**
 * Whether barbarians may appear this turn. Every `Spawning` rule has to pass before a landing or an uprising is tried
 * (`lib/spawning`), so a rule set gates them on its own terms (the turn, the level, a setting) and a variant can add a
 * gate of its own.
 */
export declare class Spawning extends Rule<[Turn], boolean> {}
export default Spawning;

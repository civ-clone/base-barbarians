# base-barbarians

Barbarian mechanics for a rule set to use: the gate on when barbarians may appear, the barbarian player, spawning a
group (aboard a ship or not), ransom, a city's worth to raiders, and what the barbarians' client asks a rule set.

A library: it registers no rules and has no entry point. The rule set keeps its own rule ids, numbers, units and
registration, and builds them on these. See `civ1-barbarians` for Civilization's.

## Rules

- `Rules/Spawning`: `Spawning`, a `Rule<[Turn], boolean>`: whether barbarians may appear this turn.
  `lib/spawning`'s `spawning(ruleRegistry, turn)` is true when every `Spawning` rule allows it, and with none
  registered. A rule set gates every landing and uprising on it; a variant can add a gate of its own.
- `Rules/LeadsGroup`: `LeadsGroup`, a `Rule<[Unit], boolean>`: whether a barbarian unit leads its group.
  `lib/leadsGroup`'s `leadsGroup(ruleRegistry, unit, fallback)` is true when any rule says so, and is `fallback(unit)`
  while none is registered.
- `Rules/LeavesMap`: `LeavesMap`, a `Rule<[Tile], boolean>`: whether a barbarian on a square leaves the map (near a
  pole, say), and so whether a group may be landed there. `lib/leavesMap`'s `leavesMap(ruleRegistry, tile, fallback)`
  works as `leadsGroup` does.

`LeadsGroup` and `LeavesMap` are for the barbarians' client (`simple-ai-client`'s `BarbarianClient`), which falls back
to Civilization's answers (the group's Diplomat; 2 of 50 rows from the top or bottom edge): a rule set whose answers
differ registers rules, and one whose answers are the same registers none. Asking draws nothing.

## Helpers

- `lib/barbarianPlayer`: `barbarianPlayer(game, world, { government, heldOff })`, the game's barbarian player, or a new
  one made through `base-player`'s `addPlayer` with `base-civilization-barbarian`'s `Barbarian` and `Attila`, which
  are registered just for that and taken out again. `heldOff` names `Added` rules switched off while it is added (the
  rule that gives a new player its starting advances, say) and switched back on after, if they were on. Its
  government is a new `government`. A player added while a turn's players are queued joins the end of the queue.
- `lib/spawnUnits`: `spawnUnits(player, tile, types, ruleRegistry, transport?)`, one unit of each type in order,
  stowed aboard `transport` when given (inactive until landed; one it has no room for is removed again), and
  `createUnit`.
- `lib/ransom`: `payRansom(game, player, leader, gold)` pays `gold` and emits `barbarians:ransom` (player, leader,
  gold).
- `lib/cityGold`: `cityGold(city, { cities, cityGrowth, playerTreasuries })`, a city's owner's gold shared out among
  its citizens: gold × size ÷ (the owner's citizens + 1), in whole gold. Civilization and Civilization II both work a
  raider's target and an uprising's chance out this way.
- `lib/polar`: `polarRows(height, rows, mapRows)` and `nearPole(tile, rows, mapRows)`, a distance from the top or
  bottom edge given for a map `mapRows` high, scaled to the map played on.
- `lib/waterBody`: `waterBodyHasAtLeast(tile, size)`, whether the water `tile` is in has at least `size` squares.
- `lib/worldOf`: `worldOf({ cities, units })`, the world, from any standing city or any unit, or `null`.
- `lib/anyoneHas`: `anyoneHas(playerResearchRegistry, Advance)`, whether any player, in the game or gone, has it.

The events are the rule set's to emit, under the names the renderer listens for: `barbarians:raiders-at-sea`,
`barbarians:uprising`, `barbarians:landed` and `barbarians:ransom` (this one from `payRansom`).

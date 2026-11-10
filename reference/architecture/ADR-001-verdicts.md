# ADR-001: the roll verdict schema (R-165.61, 2026-11-10)

**Types:** `src/game/gen2/verdicts.types.ts` (types only; tsc clean). **Frozen inputs:** reach.md, bands.md, help.md, touch.md at
t-designer-reach@030a4093; A1 at t-engine-putback@41c2e248 (GraphBrief.softFalls -> Gen2Meta.softFalls -> softFallStage -> softOn).

## Context
- The builder judges reach by closed-form constants that the flight proved wrong (reach.md §4): single apex 10 px high, single gap
  33-69 px short, double gap 57-98 short, Easy's double-rise clamp 113.9 under the single's own 123 climb. So "levelCheck passed" did
  not mean "a player meets what the builder thought".
- A roll's result today is `errors: string[]` plus side lists (`falls`, `flagMiss`, `windowMiss`, promises11's breach strings). An
  empty array reads as a pass; a missing check reads the same. seedListBreaches filters promise strings by substring
  (`b.includes('double')`) to decide which setting a promise applies to.
- Falls: `Gen2Meta.falls[].kind` is 'soft' | 'water' | 'void', inferred from the gap's rule; how the bottom is DRAWN is a separate
  path (w1Pits, heartFalls, painted pit floors). The 11-10 window: every Normal life lost was a pit under a raised piece, and the deadly
  drop looks like the safe one. Nothing in the schema ties a drop's outcome to its look.

## Decision
1. **A verdict is a name, not a string.** `VerdictName` is a closed union (16 names). A check that can fail adds its name first. A
   `Verdict` carries the name, the setting, where (x0..x1, section uid) and the `Measure` (measured, limit, spare, the spec row).
2. **A roll's outcome is a tagged union** `RollVerdict`: accepted with no verdicts, or refused with a non-empty tuple. No "accepted
   with warnings". The seed list proves a seed only when BOTH settings are `accepted: true`.
3. **Setting-aware arcs.** Reach is a `FlownArc` per move and `ReachScope` ('normal-1-1' | 'easy-any'), the flick being the move the
   builder lays to (bands.md §1). Bands are a `BandTable` keyed by `SectionKind` x `Difficulty`; `'none'` is a value (Easy's double
   gap), so "no such section on this setting" is stated, not missing. A stage with no flown scope (Normal past 1-1: reach.md flew 1-1 on Normal and Easy only) fails
   `reach.unflown`: the Engine must fly it before rolling against it, never fall back to the old constants.
4. **Blocks have spare.** A teach or test is judged both ways: `block.lesser-passes` (the lesser move clears it), `block.taught-fails`,
   and `block.spare-thin` (under 5 px, bands.md §1, because 25 fps loses ~3 px of apex).
5. **Headroom is its own verdict.** Every section that asks for a reach figure records `headroom` (clear height above the take-off
   and flight); `headroom.cuts-arc` fails it.
6. **Every drop is stated, with what it ends in AND how it looks.** `Drop` = soft (`SoftEnd`: put-back, floor, climb-out; `SoftLook`:
   ground, pit-floor art) | lethal (`LethalEnd`: water, void; `LethalLook`: water art, void-dark; plus a required `Warning`: Dot's line
   and the sign). The two looks never overlap, so a lethal drop drawn as ground is a type error in a typed list and `drop.look-lies` on
   the built stage. A route gap with no Drop record is `drop.untyped`.
7. **The fall policy comes from the stage's brief, and is a verdict.** `FallPolicy` 'no-lethal' (1-1: A1's `softFalls: true`, both
   settings), 'land-soft', 'per-gap'. `StageDrops<'no-lethal'>` is `SoftDrop[]` at compile time; at run time any lethal drop on a
   no-lethal stage fails `drop.lethal-in-no-lethal` by name. A1 makes land falls soft in the engine but leaves water lethal
   ("anywhere that is not water", types.ts A1 hunk): so a water gap in a 1-1 roll is exactly what this verdict refuses. The verdict
   reads the brief, never `isGen2Stage` (1-1 is not in GEN2_STAGES, game.ts:86-96).
8. **One promise definition feeds both readers.** `PromiseDef { id, stages, settings, judge }` in one `PromiseRegistry`: promises11.ts
   and seedListBreaches both read it, and the setting filter is `settings`, not a substring.

## What it rules out
- A pass by silence (an empty errors array from a check that never ran): accepted is a tag; every check returns verdicts by name.
- Rolling any stage against the old closed-form reach (JUMP_RISE as an apex, reachJump, maxGap's double 229.8, Easy's x0.95 rise).
- A "double" teach one jump climbs, or a bounce teach a plain double climbs, passing because the taught move works.
- A lethal drop that looks like ground, a soft drop painted as water, a lethal drop with no warning, a gap nobody classified.
- Any lethal drop in 1-1 on Easy or Normal, water included, by accident of which world list a stage is in.
- A promise judged in the test but not in the list builder (or the reverse), or applied to the wrong setting by string match.

## Consequences
- Engine packet E0 (PACKETS.md) implements it: reach.ts data mirrored from reach.md with each row's `source`; verdicts.ts judges;
  levelCheck's reach calls move to the arcs; `Gen2Meta.errors` becomes derived from `RollVerdict` (callers read `errors` unchanged).
- **Every 1-1 roll moves** (clamps change) and most proven seeds will fail until the re-lay (R-165.72). E0 lands with Content's re-lay
  in one PR, never alone on main. The Critic runs `tools/engine/lockall.ts --check` against main's recorded lock: only 1-1 may move;
  5-7 and 5-9 must not (or the PR names each that does).
- Normal past 1-1 has no arc: those stages are not judged by `arc.*` until flown (`reach.unflown` is reported, not enforced,
  outside 1-1 and Easy, until the Designer flies them; the PM tracks it as an R-id).
- The bundle cost is a few KB of data (reach.ts) and code; well inside the 31 KB room.

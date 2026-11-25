# ENG-NOISE (11-25) REPORT: the cast's one channel as a { way, x, y, r } seam; the noise toys re-proved on a REAL World 3 row
**EXACT NEXT STEP (box 1 handed over on the 28-minute clock):** in src/game/gen2/worlds/w3Noise.test.ts make the DROP toy's section build its
own 400 px drop (the way down stacks storeys 110-150 px apart: no roll of 40 has a clear 400 px column over a floor, so 'no roll lays the
moss toy'): `sectionOf` for 'moss'/'stone' = two pieces, `top` (branch, w [200, 240], place start) and `floor` (bank, w [TOY_W, TOY_W], place
{ kind: 'jump', after: 'top', dy: [400, 400], gapPx: [8, 20] }, landing: true, quiet on moss), sleeper socket on `floor` at the t that puts it
300 px past where he lands; `dropOnto` stands him at top's far end (teleported(cast)) and walks him off (frames with right held) instead of
sim.fly; built()'s 'fits' for the drops = the floor's start 300 px short of the sleeper. Run the file (about 90 s): want 7/7, then the GREEN
and planted lines into the table below. Then item 3 (the gates) on a chattr-frozen worktree of the head, then merge t-eng-w3's head (no
force), re-run w3Noise + castNoise + noiseRow there, push to t-eng-w3, send the lead the hash and one line per toy.
Branch t-eng-noise-wip from t-eng-w3 c1008d8ed (BASE). Started 1:45 PM ET (hook stamp); lead's re-scope approved (toys by 3:30 PM, landed by 5:00 PM, stop 6:00 PM ET).

## What main ALREADY has for noise (ENG-NOISE 11-19: 015e4209 + b85e5aee, report c59928a4 on t-eng-noise): ENG-LURE and the 3-3/3-5 builders start here
castPlay.ts:197 his landing -> landingNoise(x, y, t, fell, hero) (hero.quiet from the platform he stands on); castPlay.ts:274 take() (NEW, the seam),
:280 noise(), :285 soundAt(box), :294 ring(i, t) (a sounding thing's bellNoise at its place); engine.ts:4499 blowNoise (punchNoise once a swing,
none when the blow rang a thing: atk.rang), engine.ts:4621 a blow that reaches a SoundPost rings it; heroNoise.ts:44 landingNoise reads
`ground.quiet`; types.ts:323 Platform.quiet; gen2/types.ts:385 SectionPiece.quiet; gen2/soundLay.ts (a prop socket tagged 'sounding' ->
CastData.sounds); castPlay.types.ts SoundPost; roster.ts:56 TAUGHT.noise 3 (no World 1-2 cast hears a blow). Tests: castNoise.test.ts,
gen2/noiseRow.test.ts (a toy kit). 3-5.md/3-3.md's "NOT wired: no caller outside heroNoise.ts" lines are stale (Design's to correct).

## Done-items
1. **The seam (castPlay.types.ts CastEvent `{ way: 'noise' } & Sound`, i.e. { way, x, y, r, t, from }; castPlay.ts `take(e)`)**: the channel's
   one way in; the step reaches each event by its way (`reach`: 'noise' -> hearAll). noise() and ring() go through take(); the engine still
   calls noise() (lead's ruling: the existing cast tests byte-unchanged). ENG-LIGHT adds `{ way: 'light' }` + its case + its caller only.
   Test castNoise.test.ts 'the seam': GREEN on 70392a065; RED with the seam stashed (take is not a function). castNoise + noiseRow: 14/14.
2. **Toys on the 3-1 DRAFT row** (src/game/gen2/worlds/w3Noise.test.ts): readyDraft('3-1') (kit w3, travel down), World 3's own ocelot row
   (W3_CAST) and def (registry castDef('ocelot', 3), asserted on the cast member), ONE test-only section added to that row's pool in the test
   (W3_DOWN, the draft row and w3.ts untouched). On the head of this commit (run alone, 4/7; the 3 drop tests wait on the next step):
| Toy (3-1 draft, Normal) | GREEN | Plant (the real code's piece off, in the file) |
|---|---|---|
| struck stone calls World 3's ocelot | drawn 0.10 s after the strike from 420 px, goal = the stone (929), closest 4 px; heard [bell] only | `ring` -> null: never drawn, never sent: RED caught |
| punch wakes a sleeper in 240 px | 200 px: woke; 300 px: slept; heard [punch] | punch dropped at the seam (`take`): sleeps on: RED caught |
| 400 px drop: moss vs stone | NOT YET (next step) | quiet ignored (hero.quiet false): written, not yet run on a roll |
   Harness notes: a teleport (stand/fly) is not a fall: `teleported(cast)` resets the cast's fall as a flag's respawn does (calm);
   the call row's stone must sit inside the ocelot's own patch (patrolMin/MaxX: flags and jumps cut patches on the way down).
3. **Gates:** not run yet (box 2: lockall vs main AND base, tierBots 9/9, suite 3 shards + the CI tool line, the CLAUDE.md list, frozen head).

## Polish check
Nothing drawn changed (no art, sprite, screen or text): the seam is a type and a method; the toys are a test. A struck stone still has
no look of its own and rings with the stand-in sound (11-19's, named then): ENG-LURE's chime.

## Pushback
- The packet's core was already in main (above); sent to the lead first thing, re-scope approved.
- The toy floor is 1000 px (not 11-19's 1400): the draft's down tower's storeys are 1140 px wide (gen2 refused 1400 by name).
- **For 3-3/3-5/3-8/3-9's builders (found on the real row): 3-1's sections hold 2.3 x tension (~0.72) = ~1.66 threat; W3_CAST's ocelot
  costs 3, so NO socket on 3-1's budget can lay World 3's ocelot** (pipeline.ts:3558, :3609). A W3 cast stage needs heat for it or a node
  threat ask (nodeAsks: kinds named, budget bypassed). The toy pays a test-only lay cost of 1 (body W3_CAST's, def the registry's) and
  sits in phases ten/ketsu (a ki section lands inside the 5 s opening, where no animal stands: pipeline.ts:3521).

## Suggestions
- Design: correct 3-5.md:62-64 and 3-3.md:53-54 "NOT wired" to the file:line list above, so ENG-LURE/ENG-VINE packets start from fact.

## Unresolved
The drop toy (moss vs stone), the gates, the landing on t-eng-w3, the turnover note. Lessons applied: D113 (waits in the background), D115, D119, D120 (the pushback did not end the box), D128, D134, D138.

## Method update
level.md (proposed): an engine packet's "NOT wired" line carries the `git grep` it was read from, re-run on the packet's BASE the day it is
written (this packet re-ordered a job main had for six days).

## Turnover note
reference/handoffs/engine-core.md: NOT YET (rewritten at the task's end, with the landing).

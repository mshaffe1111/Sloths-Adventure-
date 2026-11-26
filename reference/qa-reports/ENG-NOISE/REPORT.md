# ENG-NOISE (11-25) REPORT: the cast's one channel as a { way, x, y, r } seam; the noise toys re-proved on a REAL World 3 row
**EXACT NEXT STEP (box 2 handed over on the 28-minute clock, 2:30 PM ET):** item 1 is DONE (the three toys GREEN on the real 3-1 draft
row, plants caught: w3Noise 7/7, with castNoise + noiseRow 21/21, at d05aa5321). Item 2, the gates, is RUNNING in box 2 on a chattr-frozen
worktree of d05aa5321 (this hand-over commit adds only this REPORT): lockall --out head --check BASE, then the head lock compared to MAIN's
by lockall's own rule; tierBots; the CI tool line (gates.yml:157); the suite in 3 shards. Box 2 finishes and records ONLY those (D138) and
sends the lead one line per gate. Box 3, once the lead forwards them all green: (1) `git fetch origin t-eng-w3 t-eng-noise-wip`, check out
t-eng-noise-wip's head, merge origin/t-eng-w3 (no force; it stood at c1008d8ed = BASE at this hand-over, so a no-op unless FIX-CARD-DOWN,
ENG-DARK or ENG-DOWNBOT landed; name every conflict); (2) if the merge brought code: tsc, w3Noise + castNoise + noiseRow, the CI tool line on
the merged head; else w3Noise + castNoise + noiseRow alone; (3) the gate lines into item 3 below, push t-eng-noise-wip, then
`git push origin HEAD:t-eng-w3`, ls-remote both; (4) rewrite reference/handoffs/engine-core.md; send the lead the landed hash.
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
   (W3_DOWN, the draft row and w3.ts untouched). Box 2 (the drop toy): 7/7 run alone; with castNoise + noiseRow 21/21:
| Toy (3-1 draft, Normal) | GREEN | Plant (the real code's piece off, in the file) |
|---|---|---|
| struck stone calls World 3's ocelot | drawn 0.10 s after the strike from 420 px, goal = the stone (929), closest 4 px; heard [bell] only | `ring` -> null: never drawn, never sent: RED caught |
| punch wakes a sleeper in 240 px | 200 px: woke; 300 px: slept; heard [punch] | punch dropped at the seam (`take`): sleeps on: RED caught |
| 400 px drop: moss vs stone | he walks off the section's own top (a 392 px fall as the roll lays it): moss slept, heard []; stone woke, heard [landing]; the sleeper 303/305 px from where he landed | the ground's quiet ignored (hero.quiet false): woke, heard [landing]: RED caught |
   Harness notes: a teleport (stand/fly) is not a fall: `teleported(cast)` resets the cast's fall as a flag's respawn does (calm);
   the call row's stone must sit inside the ocelot's own patch (patrolMin/MaxX: flags and jumps cut patches on the way down).
   The drop toy builds its own drop (no roll of 3-1's way down has a clear 400 px column: its storeys stack 110-150 px apart): a top
   branch and an 800 px floor `jump` dy 400 under it, 8-20 px across. Three things the real row taught (each in the file): the section
   must fit one storey (1140 px; 1000 px of floor made it 1231, 860 made 1165); the tower lays every other storey right to left, so the
   top stands on either side (dropTop looks both ways, he walks off toward the floor); the roll's tempo scales a laid drop (pipeline.ts
   dy x T.rise: 392-407 px on 3-1's rolls), so the toy takes the fall as laid within 10 px and prints it. A walk-off lands about 140 px
   in, so the sleeper sits at t 0.55 (about 300 px past the landing, measured on the landing frame).
3. **Gates (box 2, on frozen d05aa5321):** tsc PASS. Locks recorded from frozen worktrees: BASE c1008d8ed and MAIN cdffdc627 are the same
   lock (3264 builds, 102/102 stages unchanged: t-eng-w3's base moves no listed stage against main). Box 2's gate lines, all GREEN on
   frozen d05aa5321: tsc PASS; lockall --check 102/102 unchanged vs BASE and vs MAIN; tierBots 9/9; the CI tool line (gates.yml:157)
   350/351 pass, 1 todo, 0 fail; the suite 4,054/4,057 pass, 3 todo, 0 fail (shards 1182 pass/0 fail/2 todo, 1499/0/1 todo, 1373/0);
   seedListChunk passed with only src/game/gen2/proven unfrozen.
   Box 3: merged origin/t-eng-w3 (0f49129dd, FIX-CARD-DOWN) into t-eng-noise-wip with no conflicts (merge 1b78d0c8); on the merged
   head tsc PASS; w3Noise + castNoise + noiseRow 21/21; dotGuideDown 8/8 (the card fix that rode in).

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
The gates, the landing on t-eng-w3, the turnover note. Lessons applied: D113 (waits in the background), D115, D119, D120 (the pushback did not end the box), D128, D134, D138.

## Method update
level.md (proposed): an engine packet's "NOT wired" line carries the `git grep` it was read from, re-run on the packet's BASE the day it is
written (this packet re-ordered a job main had for six days).

## Turnover note
reference/handoffs/engine-core.md: NOT YET (rewritten at the task's end, with the landing).

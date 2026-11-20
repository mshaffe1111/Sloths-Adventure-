# VAR-19: 1-9's variety pass (R-165.291). Engine member (level half), 2026-11-19

Branch `t-var-19` from t-int-12 ce4ad461; ENG-285b's final model merged (t-eng-285 @ ba6b225b, 6ff32bb7d) before any relist (D40).
Method: reference/methods/level.md (rules 1-29); STEP 0 sent 1:54 PM ET, the lead's GO 1:55 PM ET (D1-D3; R1 YES, R2 YES).
Lessons applied: D40 (model merged before the relist), D59 (no gate left running at report), D79 (whole-screen stills), D86 (the full
CLAUDE.md list), D87 (long commands in the background), VAR-1b (suite after the first data change).

## 1. What was wrong (measured on ce4ad461 vs origin/main 6e7b85f8; probes in probes/ and VAR-1's runs/steps/adds9)
1. The arrival and the ONE rest (`w1-19-rest`, maxPerStage 6, laid 5x a roll) were all root hops: "JJJJ" every rest. Easy's "jJJJ x4"
   was stair>rest, miss>rest, roost>rest, hunters>rest; it carried the likeness to 1-8 (N 54%, E 60%) and 1-2 (N 65%).
2. "Nothing new" N16/E16: 1-9's letters were B E F J j on every layout. The posted boa read as F, 1-2's snake fight (beats.ts).
3. "Enemy by a landing" E16 (N16 known): every boa read 24-89 px from a landing, measured from its patrol span, though a boa never
   walks (predators/core.ts `immobile`). From its body the stair's boa is 210 px past its landing.
4. Normal's dead walk 3.1 s at x 140: the arrival walked 800 px to its first jump.

## 2. Reader fixes (own commits, the lead's rulings R1/R2 1:55 PM ET; planted tests in tools/inspect/posted.test.ts, in gates.yml)
| Fix | Commit | Planted | funcheck, every stage, before -> after |
|---|---|---|---|
| R1: a posted animal stillness beats (kit row immobile + beatenBy.still) reads as the freeze, letter L, not F; meter family kept creature:<kind> | be0306859 | fix off: "a posted animal ... reads as the freeze" N+E RED (2 fail); on: 5/5 | only 1-9 "nothing new" moves: N 16 -> 0, E 16 -> 0 |
| R2: enemyJobs measures a posted animal from its body, a walking one from its patrol span; LANDING_CLEAR 150 unchanged | 79c9be2af | fix off: "enemy by a landing" RED; on: green | only 1-9 "enemy by a landing" moves: N 16 -> 0, E 16 -> 0 |
Immobile kit rows today: W1 boa, W6 frog (beatenBy.still: reads L too), W7 sentry (not still-beaten: reads as before).
tools/validate/validate.test.ts (not in CI, ciTests.known.json debt) has 5 reds, the same 5 on ce4ad461 (chase outrun, 3 route, 1 beats).

## 3. Level data
Every piece is World 1's inventory (moss_stone banks and roots, Matt's painted 50 px boulder, the W1 climb vine, the mushroom): no new
art, no Hugging Face. Commits d0b421832, 47adbbbb2, cfcadf997 and the dips commit (section 5).
| Piece | What | Why |
|---|---|---|
| w1-19-arrival (reworked) | an 80 px foot, a narrow root dip (first move ~2.0 s from spawn, runway-bound, R-165.308), up onto the old bough over its own dip (the teach's flag stands on it), a boulder, a dip, a root dip at its end | dead walk 3.1 s at x 140; a rolled stage's flag 1,500-2,400 px before the teach |
| w1-19-rest | the roots, now laid ONCE a roll | it was laid 5x: "jJJJ" |
| w1-19-rest-crook (new) | over a root dip, a step up onto the high crook (boulder), over the dip off its end, root up/down home | 1-9's own rest |
| w1-19-rest-stair (new) | root up/down, a boulder on the floor, a root up, a boulder on the bough, root down/up/down | 1-9's own rest |
| w1-19-rest-wall (new) | root up, down to the wall's foot, its vine (212 px) onto the high bough, root up, two drops, root up/down | 1-9's own rest |
| w1-19-rest-bounce (new) | root up/down, a mushroom bounces him 150 px onto the old bough, root up, two drops, root up/down | 1-9's own rest |
| rests' join | entry.join 'walk' (ENG-LOOK2); beats keep their rolled join (walked in, the seam ran past the quiet line) | the rolled jump read "J" at every rest |
| stair beat / miss beat (the lead's ruling (a) 3:33 PM) | a narrow root dip in the opening bank (stair 'ad','ae'; miss 'ad','w1' same length); each boa on its own root, same place | dead walk on the approaches |
Refusals met on the way, each fixed at its cause: a boulder stacked on a boulder overhangs its base (gen2: a stone drawn past its lip); a
walked rise is capped under a single's reach (pipeline riseCap: a 150 px crook is never a double); the arrival's flag socket is ignored on a
rolled stage (ROLLED_FLAGS places the teach's flag on a clear wide piece); the quiet line (4 s) reads only a narrow dip between roots as a
jump (steps up are bumps, walked drops nothing).

## 4. funcheck (relisted head cfcadf997; files funcheck-*.txt here). 1-9 vs base ce4ad461
CLEARED: like the stage before N (12 -> 0) and E (15 -> 0), like an earlier stage N (6 -> 0), nothing new N/E (R1), repeat E (11 -> 0),
enemy by a landing N/E (R2); also gone: nothing bites, padding, one tempo, looks like an earlier stage (N and E). No other stage moved
(every non-1-9 line identical to the R2 run). funknown NOT yet lowered (do it in the final commit: only 1-9's entries, only down).
LEFT: Normal "dead walk" 16 layouts (known 15; main's old 1-9: 12). After the dips (dead-N-after-dips.txt, buckets of 500 px:
layouts, longest s): teach approach x~2500 13 lay. 4.0 s; stair 10 lay. 3.1 s (was 15, 3.7); miss approach 8500-9000 8+6 lay. 3.7 s;
and walks over 2.5 s at many rest-to-beat seams (x 10000-20500, 1-9 lay. each, up to 4.7 s at 11500). No layout is clean yet.

## 5. EXACT NEXT STEP (VAR-19 stopped at ~350k context, the lead's box; VAR-19b finishes)
1. Head: 68df60759 on t-var-19. 1-9's list in it was relisted on that exact data (100 proven of 100, quiet line under 4 s on 100).
2. Dead walk N to under 15 layouts: run `reference/qa-reports/VAR-19/probes/dead.ts 1-9 1 16 normal`; for each bucket name the seam
   (section before / after). The seam walks are rest end (root down) + rolled join + a beat's walk-in bank: try ending each rest on a
   root DOWN of 200 px (shorter flat), and each beat's first bank (320) cut to ~200. Re-measure; 6 fresh seeds (seedlist --worker 0/1
   --count 6 --part), relist, funcheck.
3. Then: the suite (3 background shards; it has NOT run on any data head yet: the run on cfcadf997 was stopped when the data moved),
   castBots 1-9 1-40 x tiers x both, the full CLAUDE.md list, coveragecheck, registrycheck, every list --check, lockall --intended 1-9,
   funknown lowered for 1-9 only, stills (whole screen, upright + sideways, N + E, every changed beat; the opening's first 3 s clip).
4. Not yet run anywhere: castBots, tierBots (no 1-1 change: should be untouched), gates, stills. Nothing here is GREEN.

## 6. Learned (proposed level.md rules)
- **Probe fresh seeds before a relist** (cost: 58 min of a relist that kept 0 of thousands; the lead's countermeasure: seedlist fails fast,
  roadmapped). Check: `seedlist <stage> --worker 0/1 --count 6 --part x.json` keeps 6 of 6 before the real relist.
- **`build()` rolls from the proven list**: a probe on unlisted data measures the OLD plans. Relist (or part-check) before measuring.
- **On the route only a narrow dip between two roots is a move**: straight steps up are bumps, walked drops nothing, a 50 px boulder a
  bump. The quiet line (4 s) and dead walk (2.5 s) both need a dip every ~600 px. A walked rise is capped under a single's reach.
- **The suite must not run while data changes**: test files load the working tree per file.
- Reader (for the lead's roadmap, my view): the dead walk counts the walk up to a posted boa (which the player must do slowly, to time the
  freeze) as dead; the beat's own L carries a fight time but the approach before it does not. If the walk inside a posted boa's engage
  (150 px, Easy 195) is part of the freeze, the reader is wrong there; if not, the beats need dips. Not decided by me.

## 7. VAR-19b (written 4:19 PM ET 11-19; data pass on t-var-19; files in reference/qa-reports/VAR-19b/). STOPPED at the context box: NOT GREEN
### 7.1 EXACT NEXT STEP (for the next member: read only this subsection and 7.2)
1. Head: the commit that adds this section on t-var-19 (data + list at 2e06b856a; relisted 100/104, `seedlist 1-9 --check` PASS).
2. ONE funcheck breach left, 1-9's own: Easy "repeat" 13 layouts (known 8) (funcheck-2e06b856a.txt; Normal repeat 6, known 12, better).
   Cause (probes/reps.ts -> repeat-easy.tsv): the run "jJJJ" = a beat's tail hop (j) then three dip-jumps (J); the rests are now all
   narrow root dips, so every rest reads JJJJ (Easy has fewer boa stops between). Fix by DATA in the rests (w1Arc19.ts rest(), restStair,
   restCrook): break the J runs with moves that are not J (a boulder hop, a wider dip walked into and stepped out of = 'h', not in the
   string; vary note value/height), keeping a move every <=440 px (dead walk 0) and each rest's LENGTH (shorter rests throw 'no section
   fits node n15' on raw seed 2: the node time budget). Re-run probes/seams.ts (N, E: must stay 0), probes/reps.ts (E under 8 layouts),
   w1Arc19.test.ts (8/8), probe 6 fresh seeds, relist, --check, funcheck (no other stage moves: diff non-1-9 lines vs
   VAR-19/funcheck-r2.txt), then funknown lowered for 1-9 only, only down (FUNCHECK_WRITE=1 on that final head; 1-9's lines only).
3. Then VAR-19c's item 4 as the packet says (suite in 3 background shards, castBots 1-40 x tiers x both, the full CLAUDE.md list,
   coveragecheck, registrycheck, every list --check, lockall --intended 1-9) and item 5 (stills N+E both ways, opening clip).
### 7.2 Numbers (all on 2e06b856a unless named)
- Dead walk per seam (probes/seams.ts, ends from the steps' own x): Normal 236 walks on 16/16 layouts -> 0 on 0/16; Easy -> 0 on 0/16.
  Table: VAR-19b/dead-walk-seams.md. funcheck: dead walk GONE on both settings; also lower: N nothing bites 5 (16), N enemy by a
  landing 10 (16), E 10 (13), E nothing bites 7 (16), N repeat 6 (12); gone: N/E padding, N one tempo, nothing new, looks like an earlier
  stage, E like an earlier stage. Every non-1-9 line identical to VAR-19's r2 run.
- Modelled time (probes/times.ts, 100 listed layouts; gen2.modelled): Normal typical min 184 s / median 189 s, fast 146 / 149; Easy
  typical 186 / 191, fast 148 / 151. Base a1cf0c8e6: Normal typical 220 / 223, fast 175 / 177; Easy 223 / 225, 177 / 178. None under
  120 s. Built length layout 1: ~27,700 px (base ~34,500).
- Tests: w1Arc19.test.ts 8/8 (tests 2 and 8 read the five rests: they still expected VAR-19's old single rest). Planted fault for the
  new 'each rest laid once' assert NOT run (name it: UNRUN). The suite, castBots, gates: UNRUN (VAR-19c).
- Stills: layout 1 Normal, 20 seams, upright + sideways shot at 2e06b856a (shooter in /tmp, not kept); sideways contact sheet cropped
  to the play band: VAR-19b/stills-L1-normal-sideways.jpg. They move with the repeat fix: re-shoot on the final head.
### 7.3 What changed (w1Arc19.ts, data only)
Rests: walk-in 140, roots 160-220, last up 140 + down 120 (rest, crook, stair, wall, bounce; petals moved off dips the route walked into
for them, same count); arrival tail 100/100; beats: walk-in 120-140 (read-load keeps 320), narrow dips at forest's tail and before its
freeze boa, stair's opening (120) and tail, read-load on the high bough (90) and after the trap bough (90), hunters between the moss and
the boa and after the boa, old boa before its moss (moss ~327 px back from the boa, was 308), roost's rock -> a dip; read-roost/bare tails
short; the exit bough two dips. trapUnit takes an optional step (unused now). Every boa on the same piece at the same place.
### 7.4 Polish check (sideways sheet)
Rough, named: the rests read as a saw-tooth of identical 160 px root notches (x20700 the plainest): the same thing the repeat flag
sees; the repeat fix should vary them (a boulder, a longer bough). A Dot line box covers the lower middle of every still: the shooter
does not tap the opening line away (a tool limit, not the stage). Every dip is a walkable root notch; boas, props and petals stand on
ground; no gap or overhang seen.
### 7.5 Learned (proposed, for the lead)
- **R-165.310 (reader, NOT changed, law 22):** tools/validate/core.ts deadWalks (181-201) takes t0/t1 from the steps' clock (Step.t:
  movement + fights + waits, core.ts:25) but its xAt (183-188) and busyBetween (169-178, called at 196) read Sample.base, the movement
  clock. They drift apart by every fight and wait (~25 s by 1-9's exit), so a dead walk's x is wrong late in a stage and a climb's busy
  time is subtracted from the wrong interval (VAR-19's 'C>J 3.9 s' at the wall rest). probes/seams.ts names ends from the steps' own x.
- **ENGINE-WORTHY:** read-load's trap pair is not laid on raw seeds 2 and 4 when the beat's FIRST piece is 140-200 px wide (320 lays it;
  the distance to the trap is not the cause: 680 px kept, still failed). The boa lands on a2 at its middle with no load. Not traced
  further; read-load keeps 320 (comment in readTrap).
- Rule for level.md: **a move every <=440 px of walk, read from the route**: a move is a step UP or a dip's take-off; walked drops,
  painted boulders and a hop DOWN are not moves; the route walks into a dip that holds petals. Section walk-in <=140, tail <=260.
- Rule: **dips alone make a repeat**: after a dead-walk pass, run the repeat probe; vary the move kinds, not only their spacing.
- Lessons applied: D30 (times from date), D57 (ReadNotifications at pushes), D59 (nothing left running), D83 (probes import relative),
  D87 (long runs in the background), D90 (read only VAR-19 4-6, cropped stills, output to files), rule 27 (numbers from the built stage).
## 8. VAR-19c (written 5:44 PM ET 11-19; rests varied from 1-9's own pieces; files in reference/qa-reports/VAR-19c/). STOPPED by the lead's ruling (~342k real context): NOT GREEN
### 8.1 EXACT NEXT STEP for VAR-19d (read only 8.1 and 8.2)
1. Head: the commit that adds this section on t-var-19 (data + list at 8e1d33126; `seedlist 1-9 --check` PASS, 100 seeds).
2. ONE RED: w1Arc19.test.ts 7/8, test 3 "a roost's boa in its roost's reach" on raw seed 1, both settings. Cause (probes/roost2.ts): a
   rolled flag lands on the roost's bough (x 14013), its safe approach pushes the 'stay' boa off, the lay re-seats it on the bough before
   the limb, 592 px from the roost. Pre-existing: the base list (837269b5f) lists 3 such layouts (L37 both, L85 Easy), this list 2 (L100
   both) (probes/roostlist.ts). The lead's ruling (5:23 PM ET): level.md rule 19, NOT rest data (law 22); the engine root is R-165.312.
   Do: (a) the test's rule ("a designed stay boa sits in its roost's reach") into tools/engine/listRules.ts's judge with a planted case
   (red with the judge off); (b) 6 fresh seeds (`seedlist 1-9 --worker 0/1 --count 6 --part x.json`), relist (`--count 100`), --check;
   (c) roostlist.ts 1 100 = 0; w1Arc19.test.ts 8/8; re-run probes seams (VAR-19b) N/E = 0 and str.ts N/E (repeat targets below);
   (d) funcheck, non-1-9 lines vs VAR-19c/funcheck-8e1d33126.txt identical, then FUNCHECK_WRITE=1 for 1-9's lines only, only down.
3. Then the packet's gates: the suite in 3 background shards; castBots 1-9 1-40 x 5 bots x both; the full CLAUDE.md list; coveragecheck,
   registrycheck, paintcheck (the boulders: protoArt isPaintedRock, 50 px moss_stone; nothing code-drawn added), every list --check,
   lockall vs main --intended 1-9; the planted fault for 'each rest laid once' (test 2, UNRUN since VAR-19b); the opening clip.
   Re-shoot stills only if the relist moves layout 1 (`node reference/qa-reports/VAR-19c/stills19c.mjs 5199 <out> 1-9 1 $(npx tsx
   reference/qa-reports/VAR-19c/probes/spots.ts 1-9 1 normal)`, DIFF=easy for Easy; taps Dot's card .dg-bub).
### 8.2 Numbers (all on 8e1d33126, layouts 1-16 unless named)
- funcheck repeat: Normal 1 layout (known 12; VAR-19b 6), Easy 1 (known 8; VAR-19b 13). Dead walk 0 both settings (probes seams.ts).
  funcheck 1-9: nothing new or worse; dead walk, padding, nothing new, looks like, one tempo gone; N enemy by a landing 7 (16).
- List: 100 proven of 101 tried; quiet line longest 2.8 s, median 2.6 s. Modelled time (100 layouts): Normal typical min 185 / median
  189 s, fast 146 / 149; Easy 187 / 190, 148 / 150. None under 120 s.
- Stills (layout 1, both settings, upright + sideways, 30 spots: each rest at 1/4, 1/2, 3/4 and every seam; Dot's cards read 2 s, shot,
  tapped on the card): 90 N + 83 E, cards logged in VAR-19c/cards-1-9-*-L1.txt; cropped sheets VAR-19c/stills-L1-*.jpg.
### 8.3 What changed (w1Arc19.ts rest(), restCrook, restStair, restWall, restBounce; data only; lengths, ids, flags, seeds, petals kept)
- Each rest opens on a step up and (four of five) a knot gap, carries its own move, and closes on a knot gap or a step: the knots (a
  wide walked hollow with a boulder), the crook (onto the crook over its boulder, off over the long drop, a second boulder), the stair
  (two boulders, high then low), the wall (the vine), the bounce (a boulder up front, the mushroom). Strings went from 'JJJJJ' rests to
  e.g. 'jJjj', 'jCJj', 'hjhhJhJ'.
### 8.4 Polish check (sheets, cropped)
- Rests read as different shapes; the saw-tooth is gone. Rough spots, named: the 80 px knot gaps are still small root notches (one or
  two per rest, no longer a run); some Dot cards (kit tips "Big ones take several hits", "Flick up to hop") sit over the ground below
  him mid-screen (the card's place is engine, not this data); a sheet's crop cut the top of one card (x24056 Easy upright: the crop,
  not the game). The boulders draw as Matt's painted slab rock.
### 8.5 Lessons applied, method update, unresolved
- Lessons: D30 (times from date), D57 (notifications at pushes), D59 (no background run left: vite stopped), D90 (lean reads, files),
  D46/law 22 (the roost boa reported, not tuned around), level.md 19 (the test's rule to the judge, ruled for VAR-19d).
- Method update (proposed level.md World 1 notes): the route reads a boulder off its top, a bump under ~240 px and a dip under ~250 px as
  JUMPS; only a step up onto a wide bough (h) and an 80 px gap between level boughs (j) are not; a boulder where a jump lands makes the lay
  refuse every roll (stair, crook); a rest's last move must sit ~120 px from its end (read-load's 320 px walk-in). Probes str.ts/steps.ts.
- Unresolved: test 3 (above); funknown not lowered (after VAR-19d's relist); turnover note not rewritten (stopped by the lead).
  My first safe-keeping commit (c60c353f0) carries VAR-19b's Claude-Session link by mistake; every later one carries mine.

## 9. VAR-19d (written 10:04 PM ET 11-19 by `date`; rule 19 into the list's judge, relist, plainWalk's reds traced; files in reference/qa-reports/VAR-19d/). STOPPED at the lead's box (11:15 PM): NOT GREEN
### 9.1 EXACT NEXT STEP for Friday's member (read 9.1 and 9.2 only)
1. Head: a10bbf8bc on t-var-19 (base 0b1f9e46; seedlist 1-9 --check PASS, 100 seeds; w1Arc19.test 10/10 + 1 todo).
2. Open on 1-9, each with the lead's ruling (11-19):
   (a) R-165.327 (the lead's number): the list judge refuses a layout where a socket predator was re-seated off its designed piece (rule 19
       generalized, beside listRules.ts lureBreaches), planted on read-bare's L1 boa (RED today: probes/bareboa.ts 1 normal: its flag socket
       is flag('a') on 'in', the lay put the flag on 'b' at x 19736 beside the boa's socket (b at 0.55), and the boa sits 380 px back on s1
       at 19281, 65 px past the step's top). Relist. The placer root stays R-165.312 (the todo test at the end of w1Arc19.test.ts).
   (b) R-165.328: the hunters' eagle strikes past its rounds' end (L1 rounds 22273..23502, it struck him at 23518 standing in the exit gap
       at 23502; L2/L3 the same, 23802/23812). Check 1-7's eagle kit (its rounds / passAt): if the rounds bound where it may strike, an engine
       fix + plant; if a dive may by design carry past, cite the line and move the hunters' exit step out of its reach in data.
   (c) funcheck repeat on 1-9 Normal 2 of 16 (VAR-19c 1; L3, L10 "jJJj" x4 at x 6762, stair -> rest-wall), Easy 1 of 16. Shapes tried
       for rest-stair (bough 200/260/320 x boulder 0/0.5/1, --count 16): Normal 3-4 on each (16-seed lists), 2 on the 100-seed list.
       Vary the move in the sections that make it (str.ts per section), never by a rule change. funknown 1-9 was lowered tonight to
       repeat 1/1 on e8e4684d0, so funcheck FAILS "worse" on 1-9 repeat until (c) is fixed (do NOT raise the entry: law 22).
3. Then plainWalk.test.ts "one-jump steps" (it fails on (a) and (b) only now: probes/replay.ts 1-9 1..3 logs each failure's cause), the
   suite in 3 background shards, castBots 1-9 1-40 x 5 bots x both, the full CLAUDE.md list, coveragecheck, registrycheck, every list
   --check, lockall vs 0b1f9e46 (lock-base) --intended 1-9, FUNCHECK_WRITE=1 for 1-9 only on the final head, then the opening clip (Normal,
   upright, 3 s) and cropped stills of one rest of each kind (stills19c.mjs, tap Dot's card ON .dg-bub). Rule 29: shots last, on the green head.
### 9.2 What was done (each RED planted, then GREEN)
- **Rule 19 into the list's judge:** tools/engine/listRules.ts `lureBreaches` = the engine's own lureLay.ts `lureFaults` (it had no caller
  outside its tests) on the stage as played, in `listJudge` (no slot: the roll is rerolled) and `asPlayedBreaches` (--check). Planted in
  tools/engine/seedlist.test.ts ('a lure post as played works on an animal that fears it'): every boa in a post's reach stood 600 px back;
  RED with the judge's rule off ("normal: the judge", plant-rule19-judge-off.txt), GREEN on (plant-rule19-judge-on.txt). Probe lureall.ts over
  EVERY listed stage: only 1-9 lays lure posts; it fired on exactly the 2 known bad builds (listed seed 1, both settings); no other stage moves.
  6 fresh seeds kept 6/6 (seed 1 rerolled 3 times to a clean roll, probes/judged.ts). roostlist 0/100 both settings.
- **w1Arc19.test lays the listed layouts as Play does** (the lead's ruling A): built() = buildPlayStage on provenSeeds + playFinish (was raw
  seeds 1-4 with no judge, so the raw roll the list refuses kept test 3 red whatever the list held). The raw defect stays visible: todo test
  'R-165.312: raw seed 1 keeps the roost boa on its roost (flag placer)' (red today, so todo).
- **plainWalk.test.ts 'one-jump steps' was red on 1-9 (10 lines), identical on 0b1f9e46 (the suite never ran on VAR-19/19b/19c); green on
  INT-12 ce4ad461 and on main** (main has no w1Arc19.ts). Bisect: VAR-19 a1cf0c8e6 red (a 56 px step, later gone), VAR-19b 837269b5f red
  (the hunters' 'out'), VAR-19c adds read-bare s1 and the rest-stair. probes/replay.ts (the test replayed verbatim on one sim, each failure's
  cause logged) found: rest-stair = a real death (from the 21 px slot under k2's face he fell through to y 1139); the hunters' 'out' and
  read-bare's s1 = an eagle's and a boa's hits on the lean-away flick (the plain flick before woke them), NOT the geometry; probes/flick.ts:
  every lean-away flick there climbs in isolation.
- **rest-stair fixed at the source:** k2 at the bough's far end, flush with u (down onto the bough, up the boulder, walk on). Centred on a
  320 px bough Easy's landing softener (easyMode.ts easyHoldSoften ~162: it widens a landing toward where he jumps from by min(gap-4,
  gap-room+6), so over a walkable pocket it leaves ~37 px whatever the data's gap) grew k2 back into a 37 px notch; flush leaves none. Planted
  in w1Arc19.test.ts ('the boulder stair's second boulder leaves its bough flush or at least Pokey's width each side', Pokey = the engine's
  44 px): RED on the old data ("21 px of bough left of the boulder, 30 px right"), GREEN now, both settings.
- **Reverted (not needed, by the replay):** a walk-off for the hunters' 'out' and a walked join for read-bare (the lead's first ruling read
  them as geometry); both moved the hits, fixed nothing. Their planted test removed with them.
- **'each rest laid once' plant** (w1Arc19.test test 2, UNRUN since VAR-19b): plant-rest-once.sh (link()'s maxPerStage 1 -> 5 AND the list
  rebuilt, since the test reads the list): RED "each rest laid once (... rest-crook ... rest-crook)", restored clean.
- **BUILD-19's 10 planted faults:** 10/10 CAUGHT. Its golden-seed plant was stale since VAR-19c's rests (each of the five carries the seed):
  it now takes the seed out of all five (the script takes several edits a fault).
- **funknown 1-9 lowered** on e8e4684d0 (4 lowered, 10 deleted; every other stage's entries as they were; knowncheck PASS). Superseded by
  (c): the rest-stair fix after it raised 1-9 repeat.
- **Suite** (3 shards on e8e4684d0, before the rest-stair fix): 3844 tests, 2 fail, 3 todo: seeds.test 6-1 seed 69793 (inherited: same red on
  0b1f9e46; t-int-13 carries ENG-285b's re-curation, the lead) and plainWalk one-jump (above). NOT re-run on the final head: UNRUN.
- **lockall:** vs main --intended 1-9: 14 other stages move (1-6, 1-7, 1-8, 2-1, 3-8, 4-4, 6-1, 6-3, 6-6, 6-7, 7-5, 7-9, 8-3, 8-5): the 125
  commits t-var-19 carries over main, not this work: 0b1f9e46 vs e8e4684d0 --intended 1-9 = 102/102 unchanged (lockall builds raw rolls).
- UNRUN tonight (name them): castBots (started, stopped when the data moved), the CLAUDE.md list after the suite, coveragecheck,
  registrycheck, every other list --check, stills, the clip. paintcheck: no tool by that name; by hand: nothing code-drawn added (the only
  data change is k2's place; the boulders stay protoArt isPaintedRock moss_stone).
### 9.3 Numbers on a10bbf8bc
- List: 100 proven of 101 tried; quiet line longest 2.8 s, median 2.6 s; seedlist 1-9 --check PASS (verdicts refuse 0 of 100).
- w1Arc19.test: 9 pass + 1 todo (R-165.312). roostlist 1-100: 0 out of reach, both settings. lureall 1-9: 0 of 200 builds faulted.
- Dead walk (VAR-19b seams.ts) 0 rows on Normal and Easy. Repeat (str.ts / funcheck): Normal 2 of 16 (L3, L10: "jJJj" x4 at x 6762, in
  stair -> rest-wall, sections this work did not touch: the relist reshuffles which rolls are listed), Easy 1 of 16.
- funcheck (funcheck-final-shape.txt): 1-9 "repeat" Normal worse (2 vs known 1); every other 1-9 line clean; the 22-23 worse/new lines
  on 1-1..1-6 are identical to VAR-19c's run on 8e1d33126 (inherited).
- plainWalk one-jump via probes/replay.ts 1-9 1..3: only (a) read-bare's boa (L1 x 19193) and (b) the hunters' eagle (L1-L3 'out').
### 9.4 Polish check
- No stills or clip tonight (rule 29: the bots are not green; the layout still moves). Rough spots, named: 1-9 repeat Normal 3 / Easy
  1 of 16; read-bare's boa on s1's lip (a); the hunters' eagle past its rounds (b). Dot's kit-tip cards over the ground mid-screen
  sideways: R-165.316 (the card placer), not this work.
### 9.5 Learned, method update, lessons applied, misses
- Learned: (1) a test that plays every face on ONE sim carries the cast's state from face to face: replay it with causes logged before
  reading a red as geometry (probes/replay.ts); (2) Easy's landing softener re-narrows any walkable pocket to ~37 px: flush or none;
  (3) when a list's judge changes, a test that lays RAW seeds keeps reading rolls the list refuses: tests read the listed layouts (D19).
- Proposed level.md rule (World 1 notes): "a block on a bough sits flush with an end or leaves at least Pokey's width (44 px) each side,
  on Easy too (easyHoldSoften widens toward the jump)", check: w1Arc19.test 'the boulder stair'. Proposed for the roadmap: plainWalk's
  one-jump test runs on Easy too (it plays Normal only, so Easy's softener-made notches are judged by nothing: probes/notches.ts found
  1-1/1-2/1-8 Easy pockets 32-40 px, uncalibrated, not gated).
- Method update: probes notches.ts / replay.ts / flick.ts / where.ts / bareboa.ts / lureall.ts / judged.ts (VAR-19d/probes).
- Lessons applied: D19 (tests and judges read what Play builds), D46/law 22 (no rule loosened; the raw defect kept as a todo; repeat not
  raised), D57 (notifications read at pushes), D59 (no background run left), D86 (the full list named, UNRUN named), D90 (lean reads,
  output to files), "prove a change is needed; revert what isn't" (the hunters/read-bare reverts), D15 (the notch probe's threshold
  checked against shipped stages before gating it: not gated).
- MISSES (own them): D30 broken: three messages to the lead carried hand-typed times ahead of the clock (9:55, 10:09, 10:12 PM; delivered
  9:48, 9:55, 9:56 PM). No committed file carries a typed time. I also first read the hunters/read-bare reds as geometry and changed data
  before replaying the test: one wasted relist.

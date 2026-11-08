# RED TEAM 3: THE PLAN (2026-11-06)

Scope: ENGINE-PLAN.md, CHUNK-POOL-BRIEF.md, NODES.md, WORLD-RULEBOOK.md, W1-NEW-SECTIONS.md, W1-ART-AUDIT.md, STUDIO-PRACTICE.md,
the repo's LAWS / PLAN-TO-80 / STAGE-RULES / CONTINUOUS-IMPROVEMENT / LESSONS / lead-now / IDEAS / daily 11-05 / HELPERS, checked
against engine-core 4ec76da73 (`ec/`). KNOWN-ISSUES.md items are not re-reported. Ranked by threat to "high-B engine, A+ indie".
Paths in `ec/` are engine-core; `rt/` is the red-team folder; `ref/` is the repo's reference/.

---

## F1. The plan builds stages before the game's core is frozen: Matt's "polish pushed mid-build" failure, scheduled in
**Owner: lead (order), engine (freeze), designer (block numbers).** Threat: highest.

**What breaks.** ENGINE-PLAN's Steps 0-7 are all generator work. Four of the six causes of the 55 have no step at all, yet Step 4
builds 1-3 to 1-9 and Steps 5/7 re-prove W2-W10. The missing lanes change the very numbers the sections are built on. When they
land, every built section's block rule and reach goes stale. That is "re-engineering under a built stage", the failure Matt named.

**Evidence.**
- PLAN-TO-80 "Why it's a 55": #1 hazards don't bite, #2 every enemy dies the same way, #5 bosses, #6 frame rate and feel (APK under 20 fps).
- lead-now "The 55": "#1 ... #2 ... hang move R-160.1 ... #5 ... #6 WebGL ... Still UNASSIGNED on ROADMAP ... After 1-1 is proven, these
  run as their own lanes". None of them is in ENGINE-PLAN's order.
- Some of those lanes change movement: PLAN-TO-80 A.6 "platform speed into the jump (R-152.7); check apex hang (R-156)"; A.5 a new move
  (hang under branches); A.3 stomp "bounces higher over pits".
- The block rule is hard-coded to today's physics with almost no slack. NODES §8.7 (amended): "B2a, rise block: 130-145 px, under
  gen2's clamp (riseLimit × 0.95 = 148 px)". That is 3 px of headroom. In `ec/src/game/gen2/worlds/w1.ts` the numbers are literals:
  `bankW(..., [-220, -200], ...)` at :528-529, `gDoubleGaps([[0.85, 0.89], ...])` at :335, :341, :565. Only one site derives a value
  from physics (`DOUBLE_RISE + 70`, :191).
- The windows also leave out the engine's own help. The lip hoist is `FORGIVE.normal.mantle: 26` (physics.ts:41: "onto a face whose
  top is up to this far over his feet"), so a single jump reaches about 108 + 26 = 134 px, inside B2a's 130-145 window. And
  `ASSIST.gaps 0.2`, "a fifth less on stage 1-1" (physics.ts:73).
- A second, conflicting constant: `ec/src/game/dotGuidePerch.ts:526 export const JUMP_RISE = 190` against physics.ts:133 `JUMP_RISE ... ~108`.
- Enemies are placed "by the node's job" in Step 3 (ENGINE-PLAN Layer 4 item 7), before enemies HAVE jobs (R-159.1 combat
  triangle, unassigned).

**Why.** "Proof on 1-1" only proves the generator. The research Matt approved says "freeze the core before scaling from 1 world to 10"
(PLAN-TO-80, "The approach"). The core is feel, moves, enemies and hazards, not just the generator.

**Fix.**
- Insert a **Step 0.5, "freeze the core"**, before Step 4. It covers:
  - the feel items (R-152.7, R-156);
  - the move set (R-160.1 hang);
  - enemy jobs (R-159.1);
  - hazard behaviours (R-154, R-158);
  - a device frame-rate floor.
- After the freeze, a change to physics or moves needs Matt's sign-off and an automatic re-proof of every built stage.
- Make every block number derived: `DOUBLE_RISE`, `JUMP_RISE + mantle`, `reachJump()` and the ASSIST terms. Add a unit test that fails
  when a block window overlaps what a single jump plus forgiveness can reach on either setting.
- Delete or rename the second JUMP_RISE.

---

## F2. Content cost is underestimated about 5-7x. Pools are per stage, not per world, and the stage tags are never read
**Owner: designer + planner.** Threat: very high (sameness AND a cost that sinks the plan).

**What breaks.** ENGINE-PLAN Risks: "Every world needs about 30-40 sections." 1-1 alone already holds more than that and still doesn't
build: 8/16 rolls fail on dry cells (KNOWN-ISSUES 1, cited as a measure only). Almost all of its sections are tagged for 1-1 only. And the
pipeline ignores the `feel`/`not` tags, so 1-2 will be dealt 1-1's sections. 1-2 will then feel like 1-1, which is Matt's own "real
test" (lead-now: "the real test is how 1-2 feels compared to 1-1").

**Evidence.**
- `grep "feel: [" ec/.../w1.ts` finds 65 tagged sections, and **46 of them are `feel: ['1-1']` only**. Only 9 list 1-2.
- `w1.ts:1268` builds `W1_SECTIONS` from every section. `w1.ts:1283` puts all of them in the manifest: `sections: [...W1_SECTIONS]`.
- `feel` and `not` are read only in w1.test.ts (:9, :28, :37). No pipeline file reads them (grep finds no `.feel` or `.not` in gen2/*.ts).
  CHUNK-POOL-BRIEF step 2's "`not`: Meeca's note or hibiscus (1-2), punch (1-3)..." is not enforced by construction.
- The target ratio, 3:1 sections to slots per stage (ENGINE-PLAN Layer 2), times about 13 slots per stage (NODES §8.4 graphs) gives about 39 sections a stage.
  If, as in 1-1, most of those serve one stage, a world needs about 150-270, not 30-40. Later worlds re-skin in their own art
  (LABELS rule 4), so sections don't carry across worlds as-is.

**Fix.**
- The pipeline treats `feel`/`not` as a hard filter, with a gate: no section outside the stage's feel set may be dealt.
- Measure the **reuse ratio** (stages a section serves) and target 3 or more for every non-signature section. Variety then comes from
  sub-blocks and dials, not from one-stage sections.
- Make 1-2's measured new-section count the cost yardstick, not "30-40".
- Re-state the risk line in ENGINE-PLAN with the real number.

---

## F3. The gates fail open past 1-1 and are anchored to the 55-rated game
**Owner: engine-core (stage.ts), lead (bar).** Threat: very high.

**What breaks.** The pass lines exist for one stage. Every other stage passes them silently. The variety bars ask only "no worse than
old 1-1", and one line punishes extra variety.

**Evidence.**
- `ec/src/game/passLines.ts:25-32`: `REFERENCE` has only `'1-1'`. At :63-64, `const ref = REFERENCE[id]; if (!ref) return [];`. For
  1-2 to 10-9 the splits and two-road lines report nothing.
- `ec/src/game/stageVariety.ts:112-125`: "CALIBRATED ON OLD 1-1 ... DISTINCT: ... at least as much as old 1-1's do (0.237)". gen2
  1-1 already scores 0.524 (same comment), so the bar is slack and drives nothing upward.
- `ec/reference/engine/stage-reports/1-1.md`: "standing kinds: 5, line <= 4" is a FAIL for having MORE kinds. That breaks CLAUDE.md's
  "Variety comes from more pieces", and NODES §7.3 quotes Matt: "how else are you going to get variety if you're still judging
  everything off of one stage?"
- The same stage must match old 1-1's medians (splits ≥ 34, two-road ≥ 0.61, float ≤ 0.253) AND not look like old 1-1 (cosine < 0.78).
  Those pull against each other.

**Fix.**
- A missing reference row is a **FAIL**, never an empty list. NOT RUN counts as not passed in every report.
- Each stage's lines come from its brief and the game plan (Layer 1): a target per world and slot role, not one old stage.
- Drop the "≤" caps that cap variety (standing kinds, float) except where a Matt rule sets them.
- Add one bar above the floor: an A+ reference set, for example what Matt rated highest, with the bar set relative to that.

---

## F4. Players get one random roll. The plan judges medians and shows Matt hand-picked rolls
**Owner: QA + lead.** Threat: high.

**What breaks.** A seed per play means each player meets one roll. The plan's evidence is medians and three chosen rolls, so the
worst roll ships unseen.

**Evidence.**
- `passLines.ts:65`: `const s = median(measured.map((m) => m.splits)), t = median(...)`. Half the rolls can be below the line.
- stage.ts `--roll A|B|C`: "1-1 as the test link's picker builds it" (stage.ts:49-53, `setPick11`). Matt played A (79191), B (110867)
  and C (118786) (W1-ART-AUDIT "How this was measured").
- ENGINE-PLAN Step 0: "★ Matt plays 3 rolls". CHUNK-POOL-BRIEF step 6: "Three rolls of 1-1".

**Fix.**
- Gate every line on the **worst roll**, or the 10th percentile over 16 or more rolls, never the median.
- At each star, Matt plays one roll drawn at random and the roll the gates score worst, next to the best. The test link says which is which.

---

## F5. The new variety ruler is being fitted to 3 data points from 1 person
**Owner: planner (measure), lead (protocol).** Threat: high (it becomes the judge of 90 stages).

**What breaks.** Overfitting. Any measure ranks 3 items in Matt's order by chance 1 time in 6.

**Evidence.** lead-now TOMORROW 1: the new measure "must (1) rank Matt's B > C > A or explain why not". Matt is a single, expert, admitted-biased
tester (PLAN-TO-80: "even with me being biased"). It is calibrated on one stage, old 1-1.

**Fix.**
- Matt ranks 8-10 rolls blind (labels hidden), plus 3-4 shipped stages he has already called good or sludge.
- Fit the measure on half and test it on the other half.
- Add the real-player signals from F6.
- Say the confidence plainly when reporting to Matt.

---

## F6. No human playtest loop in the plan. The 18 real players' data is unused and kids are never tested
**Owner: lead (player-data role), QA.** Threat: high (fun, fairness and "Easy for kids" are what players feel).

**What breaks.** Every Layer-5 gate is a bot or a static measure. The only human judge is Matt on picked rolls. An A+ needs data on
where real players die, stall and quit.

**Evidence.**
- lead-now TOMORROW 1c: "about 18 people have played the QA test link; recordings in Matt's Google Sheet (playRecorder.ts: every touch,
  Pokey 10x/s, hurt, lives, checkpoints)". It isn't in ENGINE-PLAN's layers, gates or order.
- The operating agreement names "a player-data role as standing roles", but no step uses it.
- (The deeper cause behind KNOWN-ISSUES 10: the hand-set kid bot can't be fixed without this loop.)

**Fix.**
- Layer 5 gains a **player gate** at each star: deaths per node, the share of runs past each T and X, time stuck, and quits.
- It runs on the recordings from a test-link build sent to the QA group.
- The Easy setting must show a kid (or the persona bots fitted to the recordings) completing it, with deaths under an agreed line.
- Fit FT_KID and FT_ADULT to the recordings before Easy is tuned against them.

---

## F7. The order is wrong in three places, and the team model contradicts Step 4
**Owner: lead.** Threat: high (rework and drift).

**Evidence and why.**
1. **Step 1 (1-2) comes before Step 2 (the game plan: "every move's taught-at, its returns", the ladder and move-required gates) and
   Step 3 (hearts, flags, enemies, finds).** 1-1 and 1-2 are then "proved" against a plan that doesn't exist yet, and have to be
   re-proved and replayed by Matt after Steps 2 and 3. The cold-helper test also measures a how-to with two passes missing.
2. **Step 4: "1-3 to 1-9 from briefs by 2-3 helpers in parallel"** against NODES §5's world ledger ("saved as stages are built"; each
   graph, tempo profile and signature in at most 2 stages a world) and the neighbour rule (N = 2). Parallel builders can't see each
   other's choices, so they break the caps by construction. That is the Cognition Flappy-Bird drift (STUDIO-PRACTICE §5).
3. **lead-now TEAM: "builders own a world"** against Step 4's 2-3 helpers on ONE world. The two models disagree, and the plan doesn't say which wins.

**Fix.**
- Order the work as 0, then 0.5 (F1), then Step 2's W1 data and Step 3's passes, then 1-2 by the cold helper.
- For parallel stages, a **ledger reservation**: a builder claims a graph, tempo profile and signature in the shared ledger before
  building. The ledger rejects a third use. Neighbours build in sequence, or against each other's claims.
- One world, one owner document (F10). Parallel helpers are shifts under it.

---

## F8. The world ledger contradicts per-play graph rolls
**Owner: designer.** Threat: medium-high (sameness, or the caps get quietly dropped).

**What breaks.**
- NODES §4 says "A roll picks one [graph] the brief allows", per play.
- NODES §5 says "a stage graph ... may appear in at most 2 stages" of a world.
- Sprint has 4 graphs (A-D). If each stage rolls among A-D, every graph appears in every sprint stage, so the cap is broken by
  construction. If each stage gets a private subset, 9 stages and 2 uses each need about 9 graphs per archetype a world, or each stage
  gets about 1 graph, which kills per-play structural variety.
- NODES §4 also admits every graph is "JUDGMENT ... no shipped game publishes its graph list".

**Fix.**
- Define the cap as: a graph sits in at most 2 stages' ALLOWED sets.
- Author graphs per world to the count that math needs, and measure it.
- Or drop the per-play graph roll and roll dials only, if variety holds without it (measured).

---

## F9. No whole-game budget: the meter math doesn't close
**Owner: Matt (scope), lead (measure).** Threat: high (the plan stalls mid-world).

**Evidence.**
- ENGINE-PLAN Cost: "under 90% for the week, 'that leaves 10 for 5 days'", which is about 2% a day.
- The measured burn is "about 2%/h" (daily 11-05: 67% at 4:23 PM, 73% at 7:16 PM), and lead-now's tonight push ran "75% -> ~81%".
- On 11-05 about 14% of the weekly meter went in, and 1-1 still FAILS most gates (stage-reports/1-1.md: quiet, pass lines, stage lines,
  neighbours, old-1-1, props, required move, tests all FAIL).
- The plan budgets only this week: "The rest is next week". The whole game is 90 stages, 10 kits, re-proving W5-W8, plus the F1
  lanes, the bosses and WebGL. STUDIO-PRACTICE §5: multi-agent runs cost "about 15x the tokens", and the team model grows to 8 builders.

**Fix.**
- A **scope ledger** for Matt (one multiple-choice question): stages per world as a decision, for example 6 strong stages plus a boss
  instead of 9.
- Cost per stage measured at 1-2 and projected to the end, with a kill line: if a W1 stage costs more than X% of the meter, cut the count.
- Builder headcount grows only when the cost per stage falls.

---

## F10. The team model doesn't fit helpers that forget, can't overhear, and bill by the hour
**Owner: lead.** Threat: medium-high.

**Evidence.**
- HELPERS.md: a helper "is retired" "when its context is near full". So "own a world" (9 stages, weeks) outlives every helper.
- CHUNK-POOL-BRIEF Who: "Planner: steps 1 and 3 ... (the bottleneck)" and "Engine needs go to the planner".
- The planner missed orders three times in one evening (lead-now: "D39 x3 tonight (orders read 20-60 min late)").
- PLAN-TO-80: the gameplay jobs "hold engine.ts one at a time". WebGL, the combat triangle and the hang move are all serial on one file.
- Eight builders queue on one planner and one engine.ts.

**Fix.**
- "Owner" = a **world bible file**: kit, ledger, progress checklist starting all-failing, decisions with dates. Helpers are shifts that
  read and update it (STUDIO-PRACTICE §5, the harness post).
- Split the planner's ownership by module (graph and deal; place rules; kit data).
- Make the kit data-only, so a builder adds sections without engine changes.
- Cut engine.ts into owned modules before the serial lanes start.

---

## F11. Performance is unmeasured on the stage being rebuilt
**Owner: engine (perf).** Threat: medium-high ("silky smooth" is a pass/fail rule).

**Evidence.**
- `ec/tools/perf/limits.json` scenarios: `ctest-mix14, 1-4, 2-6, 3-3, 4-1, 7-3, 8-4`. No 1-1, no gen2 W1 roll.
- drawcheck counts canvas calls with a "fake" clock (limits.json "why": "its clock fake"), not device frame time.
- PLAN-TO-80 #6: "APK under 20 fps".
- W1-ART-AUDIT §3 swaps code-drawn pieces to painted atlas art. That is more `drawImage` per frame on 1-1, and nothing checks it.

**Fix.**
- Add 1-1's worst-density rolls (by piece count) to drawcheck.
- Add a real-device frame-time run, the APK on a low-end phone, at every star, with a 30 fps floor at the 1st-percentile frame.

---

## F12. Gates pile up with no way back, and judgment numbers block like physics
**Owner: lead (gate policy).** Threat: medium-high (the satisfiable space shrinks until nothing builds, or rulers stay wrong).

**Evidence.**
- daily 11-05: "about 15 new gates" in one day, and 8/16 rolls build.
- Many lines are self-labelled JUDGMENT: the NODES §8.8 cadence ("The values are JUDGMENT"), the §7.3 shares ("JUDGMENT"), §8.7's
  margins ("JUDGMENT on the 15-20 px margins").
- Law 22, "No rule is loosened to pass" (ENGINE-PLAN What stops), forbids changing a wrong line. The era measure had to be replaced
  after Matt played ("the old ruler was blind", lead-now TOMORROW 1).
- The defect-to-gate loop (CONTINUOUS-IMPROVEMENT L3 "the default") only adds gates.

**Fix.**
- Tag every gate HARD (physics, safety, a Matt rule) or TARGET (judgment). TARGETs report and rank rolls but don't block until they are
  validated against player data (F6).
- Each retro reviews one gate with evidence. A line corrected on evidence is not a loosening if the evidence is logged.

---

## F13. The art plan collapses variety, and the budget isn't split by world
**Owner: art + lead.** Threat: medium.

**Evidence.**
- W1-ART-AUDIT §3.4: "Thin stones → the painted boulder (moss_stone at 50 px)". That's 17-22 stones a roll (§2), all becoming one
  round 50 px picture, against CLAUDE.md "Variety comes from more pieces ... new art via Hugging Face".
- §4 misquotes the money rule: "CLAUDE.md: 2 total, keep about 5". The real rule is $72 total (Matt checked $71.83), keep about $15.
- After the reserve, about $57 is left for 10 worlds, polish backgrounds and the brick sets. The plan's Art section has no per-world split.

**Fix.**
- Per-world art budget in ENGINE-PLAN (about $5 a world, measured against the 1-1 sunrise at $2.85).
- 2-3 boulder or stone variants for W1 now (the audit's own §4 list).
- Correct the audit's budget line.

---

## F14. The proof layer depends on the code the plan retires
**Owner: engine-core.** Threat: medium.

**Evidence.**
- ENGINE-PLAN What stops: "The mixer ... retired as their ideas land in gen2."
- `ec/tools/engine/stage.ts:21-41` imports `mixer/stages`, `mixer/spec`, `mixer/library`, `mixer/support`, `mixer/catalog`,
  `mixer/propSupport`, `mixer/stillSpots`, `mixer/codeVariety` and `mixer/nodePieces`.
- So retiring the mixer breaks stage.ts. Or the mixer never retires, and the "new replaces old" law is broken.

**Fix.** Move the checks into a neutral `src/game/checks/` before any retirement. A gate fails if stage.ts imports `mixer/`.

---

## F15. Three different length targets
**Owner: designer.** Threat: low-medium.

**Evidence.**
- CHUNK-POOL-BRIEF step 5: "length 120-150 s".
- stage-reports/1-1.md: "length (Normal 167-185 s in 160-195 ...)".
- ENGINE-PLAN: "at least 2:00, with no cap".

**Fix.** One source (the brief's length band, Layer 3) that stage.ts reads.

---

## F16. The A+ list the plan doesn't mention at all
**Owner: lead (lanes), designer.** Threat: medium (each one alone caps the grade).

**Evidence.** grep finds no audio, music, sound or haptic in ENGINE-PLAN.md, CHUNK-POOL-BRIEF.md or NODES.md. Yet `ec/src/audio/` has
`conductor.ts`, `composer.ts`, `adaptive.ts` and `acts.ts`, which could follow node jobs (rest, test, signature). Also missing or thin:
- **Bosses:** "stay hand-built" with no step (R-161 unassigned).
- **Story:** Dot lines "only where a Matt-approved line fits" (NODES §1 rest). Rolled rest positions mean generated stages may go silent,
  and no gate checks a stage has its story beats.
- **Onboarding:** past 1-1, no first-play check across W1's ladder.
- **Play Store:** ENGINE-PLAN only cites gates.yml. PLAY-STORE-RULES §6 isn't in any step's star.
- **Checkpoints:** "before the hard part" (Layer 4 item 7), with no gate named until Step 3.

**Fix.**
- Add Layer 1 fields for each node job's audio cue and story beat.
- A story-beat gate (every brief's `must` beat realised).
- A boss lane with a date.
- PLAY-STORE §6 at every star, not only at merge.

---

## Suspicions (opinion or weak evidence)
- **A seed per play may cost replay and mastery.** Players can't replay a stage they loved, and the golden seed moves each play.
  Speedrun and collect-a-thon play suffer. Consider a fixed "stage of record" per stage, with rolls as a remix after it's cleared.
- **The node code (A T T T P F R X R S E) may become the designer's product instead of the game.** Three days of notation,
  validity rules V1-V20 and graphs, while the 1-1 report still fails basic play lines (quiet, required move).
- **Spelunky is a weak model for a 2-minute authored platformer.** Spelunky's rooms are short and the game is roguelike. Mario-style
  stages live on one strong concept per stage (STUDIO-PRACTICE §1, Hayashida), and a 13-slot deal of 10-20 s chunks may read as a
  medley rather than one idea. The Signature node is the only "concept"; consider a per-stage gimmick that threads through all nodes.
- **The supervisor plus designer plus lead triple-review is slow and reviews words, not play.** Most catches on 11-05 were story and
  tags, not feel.
- **Rolling the dials per play may make difficulty uneven between players of the same stage.** Fairness and leaderboards suffer.

---

## STOP (the 3 things)
1. **Stop building stages (Step 4 on) before the core is frozen** (feel, moves, enemy jobs, hazards, device fps). This is the exact
   100-stages-then-polish failure (F1, F7).
2. **Stop anchoring gates to old 1-1 and to Matt's 3 picked rolls.** Lines from a 55-rated stage, medians, a ruler fitted to B > C > A,
   and lines that fail open on other stages (F3, F4, F5).
3. **Stop writing one-stage sections and blocking on judgment numbers.** 46 of 65 sections serve only 1-1, the feel tags are unread,
   and 15 gates landed in a day with no way back (F2, F12).

## MISSING (the 3 that matter most)
1. **A "freeze the core" milestone (vertical slice)**: feel, move set, enemy jobs, hazards that bite and the frame-rate floor locked and
   Matt-rated before content scales, with block rules derived from physics (F1).
2. **A human data loop as a gate**: the 18 players' recordings, a kid on Easy, deaths and quits per node at every star (F6).
3. **A whole-game scope and cost budget**: stages per world, art dollars per world, meter per stage measured at 1-2, and a cut line
   Matt picks (F9, F13).

Total findings: 16 ranked (F1-F16) + 5 suspicions.

---

## Round 2: cross-examination of RT-PLAYER.md and RT-ENGINE.md, from the plan's chair (2026-11-06)

### F5 re-ranked: from #5 down to a low process note
The coordinator's correction holds:
- The planner computed three lines and reported that only piece-distinctness matched B > C > A.
- It called the C vs A gap (0.008) noise and tuned no weight (engine-chunks f9a324e8; stageVariety.ts:112-125 records the calibration on old 1-1).
- So there was no overfit. The work was honest.

What remains is a smaller **brief** defect. lead-now TOMORROW 1 made "must rank Matt's B > C > A" an acceptance line. That line invites fitting on 3 points, and only the helper's restraint stopped it. Fix: acceptance lines for a ruler need a holdout set (F5's own fix stands). It no longer belongs in the top 10; it folds into F12, judgment numbers used as pass lines.

### (1) Which of their findings are symptoms of a plan or process hole

| Their finding | Plan or process hole it comes from |
|---|---|
| ENGINE 1: stage.ts `--roll` measures the MIXER's 1-1 in its stage lines, tests and stills | **H1. No identity check on the proof.** A gate never asserts it measured the stage that ships. Same root as my F14: the proof layer was built on the mixer and grafted onto gen2. |
| ENGINE 3: a failed gen2 roll is still built and played (135/400 builds carry errors, 0 throw) | **H2. Fail-open defaults.** A missing or failed result means "carry on". The plan's "a seed per play" (ENGINE-PLAN §The decision) never says "only proved seeds ship". |
| ENGINE 6: the V-rules never fail a roll in the pipeline | H2 again. The V-rules exist only as a report line in stage.ts:343. The plan's "the engine rejects a string" (NODES §8.3) was never made a construction rule. |
| PLAYER F1: raw keys on screen ("hint.1-1.double") | H2 again: `M.tips?.[m] ?? m` (pipeline.ts:1805) falls back to the id.<br>**H3. "Done" is judged on data, not on the screen.** The stills were NOT RUN (stage-reports/1-1.md), and no gate reads what the player sees. Law 2 ("judge the real screen") has no automatic check on gen2 output. |
| My F3: `if (!ref) return []` (passLines.ts:64) | H2: a missing reference row passes. |
| PLAYER F2: nothing can hurt for about 3 minutes; 0 enemies; 6 hearts with no threat | **H4. The core lanes are out of the plan** (my F1).<br>**H5. Placement passes come after the stages they place into** (my F7: Step 3 after Steps 0-1).<br>The brief also turned "nothing costs a life in 1-1" into a gate, with no "something must matter" counterpart. |
| PLAYER F3: the double jump is never explained on A and B; mirroring flips the order of praise and teach | **H6. "Teach" is defined for the bot, not for the player.** The move-required gate proves the move is NEEDED, not that it was SHOWN and SAID first. NODES §8.0's T row ("shown; then a safe check") has no gate for "shown". |
| PLAYER F9: the brief's "must" squirrels are missing; B and C skip the designed opening | H6 again. The brief's `must` field is not a gate (my F16, the story-beat gate). |
| PLAYER F4 and ENGINE 7: every roll "ships long", 30% over its ceiling; a dead ceiling trims the rest | My F15 (three length targets). The plan's length rule changed three times without one source the code reads. |
| PLAYER F5: 12-13 checkpoints (a flag every ~17 s) | H5. The ENGINE-PLAN Layer 4 item 7 rule ("a checkpoint before the hard part") waits for Step 3, while Matt plays now. |
| PLAYER F6, F7: backdrop logs look like real logs; red plants read as thorns | **H7. No readability check.** The art audit (W1-ART-AUDIT) judged platform kinds one by one, never "can a player tell what's solid or dangerous". Nothing in Layer 5 asks it. |
| PLAYER F10 and ENGINE 4: Easy differs from Normal on 8% of seeds and can lose a teach; the kid re-lands on a log he walks off | My F6 (no human data, hand-set kid bot). ENGINE-PLAN Layer 4 item 10 ("Easy as its own profile") was ordered last. |
| ENGINE 5: the build takes p95 552 ms on a desktop, which can stall a phone | My F11. The perf gate never plays gen2 1-1 and has no build-time budget. "Seed per play" was planned without a cost line. |
| ENGINE 8: crumble may never be required, against Matt's 11-02 ruling | **H8. Matt's rulings live in prose, not tests.** ENGINE-PLAN's "Matt's decided numbers and rules" list has no test for each line, so the code drifts from them unseen. |
| ENGINE 2: the roofed-drop fix is beaten by a road that steps down 4 px or more | CONTINUOUS-IMPROVEMENT's "planted failure" covers one shape, not its family. Yokoten was applied to places, not to variants of the same defect. |

### (2) What they reveal together: "done" means "the report is green", not "the game is right"
- ENGINE-PLAN defines done as "its brief builds, every gate passes, and Matt plays it". In practice every part of that can be satisfied
  by something next to the thing that ships:
  - the gates graded the mixer's stage;
  - the pipeline marks a roll failed and the game plays it anyway;
  - the V-rules print but never block;
  - Dot's words were proved in data and broke on screen;
  - pass lines for any stage but 1-1 are empty;
  - Matt plays picked seeds.
- **Every failure fails open.** A missing input, a failed roll or a child process that lost its state produces PASS or "carry on" instead of FAIL.
- The plan also measures the generator's honesty, not the player's experience. 1-1 passes "nothing costs a life" by having no threat
  at all, and passes "teaches" by having a bot need the move while the player is never told it.
- Matt's polish bar (Law 1, STAGE-RULES §5b) is checked by people at the end. The bad stage still gets that far, so the people end up
  as the only working gate. That is exactly the "escapes to Matt" law 14 makes the lead's miss.
- **The process hole.** The plan adds gates (an L3 countermeasure each time) but never states three invariants every gate inherits:
  1. **Identity:** it measured the build that ships. It asserts the seed, the engine and the pick.
  2. **Fail-closed:** missing, NOT RUN, error or fallback is a FAIL.
  3. **Player surface:** at least one check reads what the player sees and hears. That covers on-screen text, teach before use in
     walking order, a threat after the teach phase, the brief's `must` beats, readability, length and the HUD.

  Without these, each new gate adds one more place to fail open.

### (3) Revised top 5
1. **NEW, top: "done" is generator-centric and fails open** (H1, H2, H3). The evidence is ENGINE 1, 3 and 6, PLAYER F1, my F3 and F14.
   - Fix: write a definition of done as "the shipped build, as played on a phone, passes", with the three invariants above as a gate-template law.
   - Ship only proved seeds (ENGINE 3's list).
   - NOT RUN counts as not done.
   - Owner: lead (law), engine-core (stage.ts), pipeline.
2. **The core isn't frozen, and hazards and enemies are absent** (my F1, plus PLAYER F2). A 3-minute stage with nothing at stake is the
   55's "plain" in its purest form. The freeze-the-core step includes the W1 kit's creatures and hazards before more stages are built.
   Owner: lead and engine.
3. **Content cost is understated and the stage tags are unread** (my F2). Unchanged; the other reports don't touch it.
4. **No player-experience gate and no human data** (my F6, plus H6, H7, H8; PLAYER F3, F6, F7, F9, F10; ENGINE 8).
   - A player-surface checklist, run automatically on stills and the DOM: no id-shaped text, a teach line before the first required
     use, the `must` beats present, a solid/hazard readability check, and one test for each of Matt's rulings.
   - Then the 18 players' recordings and a kid on Easy at every star.
   - Owner: QA and the lead.
5. **The order and the whole-game budget** (my F7 and F9). Placement (Step 3) and the game plan (Step 2) come before 1-2. A meter and
   scope ledger lets Matt pick the stage count.

Then my F4 (medians and picked rolls; ENGINE 3 makes it worse: about a third of seeds are failed rolls), F11 (perf, with ENGINE 5's
build-time stall added), F10, F8, F12 (now including F5's brief defect), F13, F15, F16, F14 (folded into #1).

### Revised STOP
1. **Stop calling it done on proxies:** a stage measured in a different process, data instead of the screen, medians, picked seeds,
   fallbacks that pass.
2. **Stop building stages before the core is frozen:** feel, moves, enemies and hazards in the kit, device fps.
3. **Stop writing one-stage sections and adding judgment numbers as blocking gates,** including acceptance lines like "must rank B > C > A".

### Revised MISSING
1. **A fail-closed, end-to-end proof of the shipped build:** identity asserted, proved seeds only, NOT RUN = FAIL, plus the
   player-surface checklist.
2. **A freeze-the-core vertical slice,** including W1's first threats, rated by Matt before content scales.
3. **A human data loop plus a whole-game scope and cost budget,** so fun, Easy and the stage count are decided on evidence.

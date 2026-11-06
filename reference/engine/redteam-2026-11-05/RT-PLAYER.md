# RED TEAM 1: THE PLAYER, gen2 1-1 (engine-core 4ec76da73)

Premortem: "1-1 shipped and players quit after it." Proofs use Rolls A=79191, B=110867, C=118786, built through the real game path
(`generateStage` with `setPick11`, QA build), and the dev server on :8771 at deviceScaleFactor 1.
- Scratch tools: `scratchpad/rtp/dump.ts` dumps every roll and setting to `rtp/stages.json`; `old.ts` builds old 1-1 and the mixer 1-1;
  `line.ts`; `tele.mjs` (paused stills); `live.mjs` (real-time play from an x).
- Screenshots: `redteam/shots-player/`.
- Ranked by how much each one hurts the player.

## F1. Dot says raw string keys on screen: "hint.1-1.double", "coach.run", "hint.1-1.noMoss" (BLOCKER)
- **What breaks:** every gen2 Dot tip shows its id, not its words.
  - Roll C at x 7040: Dot's bubble reads **"hint.1-1.double"**.
  - Roll A: the start says "coach.run" (x 666), and the only warning before the first lethal fall says "hint.1-1.noMoss" (x 32390).
  - Roll B: "hint.1-1.high" and "hint.1-1.noMoss".
  - Roll C: "hint.1-1.gaps" and "coach.nice" too.
- **Proof:**
  - Still: `shots-player/rawkey-C-normal-412x915-x7040-t1.png`.
  - The DOM text: `"×3 Dot hint.1-1.double"`.
  - The engine's onGuide log: A `coach.run / hint.1-1.noMoss`.
  - `engineGuideLine('hint.1-1.double','1-1')` gives `{text:"hint.1-1.double", kind:"info"}` (rtp/line.ts). It is also not classed as a teach line, so the double-jump move watch never arms.
- **Why:** `pipeline.ts:1805` uses `const text = M.tips?.[m] ?? m`. `w1World()` (w1.ts:1278ff) has no `tips` map, so the id falls through as the text. `swapLine` matches on normalised words, so an id never matches a row in `dotLinesData.ts`, where these rows DO exist (lines 96-103).
- **Fix:**
  - Resolve tip ids through `dotLinesData` (the `text`/`pad`/`keys` columns) in fillSockets.
  - Throw on an id with no row.
  - Add a gate: no hint text matching `/^[a-z]+(\.[\w-]+)+$/`.
- **Layer:** engine pipeline + gates (no gate caught a dotted id reaching the screen).

## F2. Nothing in 1-1 can hurt Pokey for about 3 minutes, then one unannounced lethal drop. Zero enemies, zero hazards, 6 useless hearts
- **What breaks:**
  - On every roll and both settings: `enemies 0`, no hazards, no vines or ropes, and every listed fall is `soft` (rtp/dump.ts output).
  - The player walks about 200 s (modelled typical) with no fail state. Celeste and Rayman teach risk early; here the first consequence comes at the very end.
  - On Normal, Roll A x 32300 (log chain, its lower log 32174-32375 at y 1129), walking right drops him to y 1484 and costs a life (×3 to ×2). Proof: `live.mjs A normal ... 32300`, `shots-player/nomoss-A-normal-412x915-x32300-t0.png` (shows −1).
  - The only warning is the raw "hint.1-1.noMoss" (F1), which fires at x 32390, past the edge he can already walk off at 32375.
  - Meanwhile 6 hearts are laid (A at x 4531, 10344, 16299, 22833, 29192, 34669) on a stage with no damage source. A fall costs a whole life, not a heart, so the hearts are pickups that do nothing. Old 1-1 had 2 and the mixer 0.
- **Why:**
  - `w1World` manifest `creatures: [], props: [], pairs: []` (w1.ts:1283), so no creature or receptor socket can ever be filled.
  - Hearts come from `stageGenerator.ts:2867` (every second flag) with no threat check.
- **Fix:**
  - Give W1's kit its creatures (the snakes and frogs the brief allows; at least 1-2 gentle, stompable foes after the teach phase).
  - Lay hearts only after real risk (ENGINE-PLAN §7: "a heart only after real risk").
  - Make the log chain's lethal drop a soft pit, OR introduce lethal falls earlier with a readable warning placed at the section's entry, not mid-section.
- **Layer:** kit data + engine pipeline (hearts).

## F3. Double jump is never explained on Rolls A and B, and on unmirrored w1-double-teach the praise comes before the gaps and the teach after
- **What breaks:**
  - A's hints are `coach.run`, `noMoss`. B's are `high`, `noMoss`. Neither has a double-jump line, though both lay a double-teach section (A: w1-dip-double-teach at 4731; B: w1-bank-double-teach at 6343).
  - The lesson system has no `double` LessonId (lessons.ts:16-18), so nothing else covers it.
  - Old 1-1 said "Flick up again in the air to jump twice" (rtp/old.ts output).
  - In `w1-double-teach` (w1.ts:565) the groups run [rest + **coach.nice**] → gaps → [rest + **hint.1-1.double**]. Unmirrored, Dot says "Nice!" before the gaps and explains the double jump after them. Roll C only gets it right because s3 rolled `mirrored: true` (hint at 7034, gaps, nice at 9801).
- **Why:** `w1-dip-double-teach` and `w1-bank-double-teach` (w1.ts:939, 946) carry no dot socket. The order in double-teach assumes left-to-right and mirroring flips it.
- **Fix:**
  - Every section with `teaches:` must carry a teach tip placed before its first required use, in walking order after mirroring.
  - Gate: for each taught move, the tip's x is less than the first gap that needs it, and it is a `move` row.
- **Layer:** kit data + gates.

## F4. The first stage of the game is too long: every roll "ships long", 30% over its own ceiling, and Easy is LONGER than Normal
- **What breaks:**
  - The repairs note on all three rolls: `ships long: no shorter meets the floors and the goal (typical 201-215 s, fast 164-176 s, ceiling 153 s)`.
  - Easy is wider and slower than Normal on every roll:

    | Roll | Exit x, Normal | Exit x, Easy | Typical, Normal | Typical, Easy |
    |---|---|---|---|---|
    | A | 36200 | 38584 | 200.7 s | 213.5 s |
    | B | 36282 | 38769 | | |
    | C | 38827 | 41603 | 214.8 s | 229.8 s |

  - A kid on "Little explorer" gets the longest version of the slowest stage (about 3:50, or longer at kid speed) with no danger and no enemies. Old 1-1 typical was 191 s.
- **Why:** Easy lays Normal's plan with Easy's wider margins and landing pads (pipeline.ts:2410-2420, `landingPad: EASY_LANDING`). The length loop accepts "ships long" as a repair instead of a failure.
- **Fix:**
  - Treat "ships long" over the ceiling as a FAIL for 1-1, and drop a section (the pool has many).
  - Hold Easy's total to at most Normal's: shrink the rests, or drop one practise section on Easy.
- **Layer:** engine pipeline + gates.

## F5. 12-13 checkpoints in one 3-minute stage: a flag every ~17 s
- **What breaks:**
  - A's flags are at 2010, 4651, 7634 … 34739: 12 on Normal and 13 on Easy (C Easy 13).
  - Old 1-1 had 9. Matt's rule is "a checkpoint before the hard part, not everywhere".
  - With no fail state until the end (F2), these are meaningless interruptions and visual noise, and they devalue the one flag that matters.
- **Proof:** rtp/dump.ts output, `cps`.
- **Fix:** place flags by risk (before the log chain, before the bough descent), 4-6 per stage. A gate should cap the count and flag any flag on a stretch with no risk ahead.
- **Layer:** engine pipeline.

## F6. Painted backdrop logs look exactly like the logs you stand on (bough/log sections)
- **What breaks:** high up, the near backdrop changes to a fallen-log layer whose logs have the same colour, scale and moss as the platform logs. On a 412 px-tall screen the player cannot tell which log holds him.
- **Proof:**
  - Roll A sideways x 26800 (bough descent) and x 33300 (log chain): `shots-player/sec-A-normal-915x412-x26800.png`, `-x33300.png`, contact sheet `contact2.png` (top right, middle right).
  - The lethal drop of F2 sits in exactly this art.
- **Why:** the backdrop layer has no value or contrast separation from the platform art. Known issue 9 names mushrooms only; this is the same root, wider.
- **Fix:**
  - Darken or blur and desaturate the near-backdrop logs.
  - Give platform logs a rim light or edge highlight.
  - Or use a canopy backdrop with no log shapes behind standable logs.
- **Layer:** art + render.

## F7. Red spiky plants on top of the ledges read as thorns
- **What breaks:** the `w1-ledges` stone ledges (Roll A x ~11100-12700, sideways) carry red spiky bromeliads dead centre on top. They are the classic platformer "thorns, don't land here" read. A kid will avoid the ledges and an adult will hesitate. They are harmless decor, in a world where Matt's own rule makes thorns a hurt hazard.
- **Proof:** `shots-player/zoom-ledges-A11200.png`.
- **Fix:** keep spiky red dressing off standable tops (use flowers or moss tufts), or keep it to edges and backgrounds. Add a decor rule: no "spiky" dressing on a landing surface.
- **Layer:** kit data (dress) + rules.

## F8. Pickups and upper ledges sit under the HUD when held sideways
- **What breaks:** at 915x412, Roll A x 11200, the upper-ledge flowers are drawn under the lives badge "×3" and the progress log, which fades out over them. The player can't see what he's reaching for, and the HUD flickers translucent.
- **Proof:** `shots-player/sec-A-normal-915x412-x11200.png`, `zoom-ledges-A11200.png`.
- **Why:** the camera keeps the ground about 45% down the screen in landscape (`cmp-old-normal-915x412-x2600.png` shows old 1-1 does the same, so the camera is game-wide). Gen2's upper tier at y 609 over a floor at 762 then puts its pickups in the top 80 px.
- **Fix:** in landscape, either bias the camera upward when a tier is above, or cap pickup height above the floor so it stays under HUD-bottom + 20 px. Add a clip gate for collectibles under the HUD at the 915x412 still spots.
- **Layer:** engine (camera) + gates.

## F9. Every roll is missing the brief's "must" squirrels, and B and C skip the designed opening altogether
- **What breaks:**
  - Fills show decor `bootprint` only; the squirrel socket `sq` is never filled on any roll, A included.
  - B and C open on `w1-meadow` (phases `['rest','start']`, w1.ts:373), which has `needs: ['jump']`, low stumps and a dip at x 1773 (B), and no arrival beat.
  - `w1-morning-path` (the "flat and safe, squirrels, coach.run" arrival) is only in A.
- **Proof:** rtp/dump.ts fills: A `('decor','bootprint')`, no `sq`; section lists start `w1-meadow` on B and C.
- **Why:** the manifest's `decor: []` / `creatures: []` (w1.ts:1283) can't fill `sq`. meadow is allowed in `start`.
- **Fix:**
  - Fill the W1 decor list (squirrels).
  - Drop `start` from meadow's phases, so 1-1 always opens on an arrive section.
  - Add a gate: brief "must" items are present on every roll.
- **Layer:** kit data + gates.

## F10. On Easy, a soft fall can put the kid back on a low catch log he walks straight off again
- **What breaks:** Roll A Easy, holding right from x 34400. He falls (34774, y 1372), is put back at 34612 y 1088 (the lower log 34387-34636), walks off again, and so on: 4 cycles in 4 s.
- **Proof:** `live.mjs A easy 412 915 34400`: t0 [34774,1372], t1 [34612,1088], t2 [34775,1371], t3 [34623,1088]; `shots-player/nomoss-A-easy-412x915-x34400-t*.png`.
- **Why:** the put-back point is the pit's catch log, not the last safe ledge before the jump. The next platforms are 144-258 px above that log.
- **Fix:** put the player back at the last ledge he jumped FROM (the route's previous node), not the nearest platform under the fall.
- **Layer:** engine.

## Lesser findings
- **F11.** Bounce has no Dot line on any gen2 roll; old 1-1 had "Land on the mushroom to bounce up high". The lesson card may cover it, so this is low. The bouncers at A x 8200 are green leaf cups next to a decorative non-bouncy painted mushroom (`sec-A-normal-915x412-x8200.png`). The hint words in the data say "mushroom", so the thing that bounces and the thing called a mushroom are different objects. Layer: art/kit.
- **F12.** In portrait, 412x915, the lower 35% of the screen is underground dirt (`hint-A-normal-412x915-x2000.png`, `rawkey-C-normal-412x915-x7040-t1.png`). Upright play is squeezed into a band. This is game-wide (camera), but gen2 1-1 has more rises and upper tiers that suffer from it.

## Suspicions (not proved)
- Dot kept "Slide slowly to run. Flick fast to kick." up through x 21300-36150 in my paused stills. It may be a teleport-triggered struggle line, but a "kick" tip on a stage with no enemies is wrong if a real player triggers it.
- No variety of threat across 3+ minutes is likely the main quit reason. FT_KID / FT_ADULT runs not done (time).
- The ending is a door on a dirt block ("Touch the door!"), with no celebration beat visible in the still (`sec-A-normal-915x412-x36150.png`).

Total: 12 findings (10 ranked + 2 lesser) + 3 suspicions.

## Round 2: cross-examination from the player's chair

Proof script: `scratchpad/rtp/r2.ts` (buildGen2Stage on seeds 3 and 124, plus A, B and C on Easy, with build time, errors, hints, bouncy count and teach sections).

### (1) What a player would actually feel, from the other two teams' top findings

**ENGINE #3 (failed rolls are still played): CONFIRMED, and the player feels it hard.**
- Seed 3 Normal: 4 errors (`pool short at slot 4 (n4 teach …)`, `slot 6 (n6 fork: no bounce section left)`, `slot 12 (n12 reward …)`).
- That stage has **0 bouncy platforms**: no mushroom anywhere, though the brief teaches bounce.
- Its teach sections are `w1-learn, w1-dip-double-teach, w1-double-teach`: two double-jump teaches back to back.
- To a player that is a gap-only stage, and with the reward slot short the golden seed is probably missing too.
- On a seed per play, about a third of players would meet that. Severity: top 3.

**ENGINE #4 (Easy plans its own stage): CONFIRMED, and it lands on the kid.**
- Seed 124 Normal: 0 errors, 5 bouncy, teaches `learn, dip-double-teach, hop-bounce`.
- Seed 124 Easy: 4 errors, **0 bouncy**, teaches `learn, bank-double-teach, dip-double-teach`.
- So the "Little explorer" on that seed gets a different and worse stage than the adult: no mushrooms at all, and two double teaches in a row.
- Together with my F3 (double jump not explained on most rolls), the kid is asked to double-jump twice without being told how. Severity: top 3 for kids.

**ENGINE #5 (slow build): CONFIRMED.**
- Seed 124 Easy took 821 ms to build on this desktop (A, B and C Easy: 103-130 ms).
- At ~3-5x slower on a phone, that is a 2.5-4 s frozen tap on "Play". A player reads that as "the game hung".
- Felt only when per-play seeds go live. Medium.

**ENGINE #1 (stage.ts gates and stills measure the MIXER's 1-1): not felt directly, but it is WHY my F1 shipped.** See (2).

**ENGINE #2 (roofed-drop hole in levelCheck): not felt today.** Their own check of two real cases found a side way in. Low for players until a case with no way in is proved.

**PLAN F4 (one random roll, judged on medians and picked rolls): CONFIRMED by my data.**
- Rolls A and B miss the double-jump line, and only C has it.
- Matt's 3 picked rolls already span "taught" and "not taught", and seed 3 or 124 Easy is far worse than any of them.
- The worst roll is what quits players.

**PLAN F6 (no human or kid playtest loop): CONFIRMED in spirit.**
- Every one of my top 3 (raw ids on screen, no fail state for 3 minutes, an untaught double) is obvious to the first human who plays.
- None of them is caught by a bot or a static gate.

### (2) What two findings together show that neither saw alone

**a. My F1 (raw Dot ids) + ENGINE #1 (stills shot on the mixer stage).**
- The mixer's hints are real words ("Jump the little gaps").
- So every "proof still" the gates produced for `--roll A|B|C` showed correct Dot lines, while the real gen2 roll says "hint.1-1.double".
- The gate's evidence actively hid the blocker. That is two failures: no text gate, and stills from the wrong stage.
- Fix both: a dotted-id text gate, and stills taken with the pick passed in the URL and asserted (`gen2.seed`) on the page.

**b. My F2 (zero threat, hearts that do nothing) + ENGINE #3 (failed rolls played).**
- The level check says ok on every one of those rolls, because a stage with no enemies and soft pits is trivially "beatable".
- Our gates prove "can be finished", never "has something to do".
- No gate fails "0 enemies, 0 hazards, 6 hearts", so a threat-free and lesson-free stage passes everything.
- Needed: a content-floor gate per brief (≥N threats after the teach phase, each `teaches` move has a tip and a required use, and hearts ≤ the risk spots).

**c. My F4 (Easy longer than Normal) + ENGINE #4 (Easy re-plans) + ENGINE #7 (dead ceiling).**
- The length loop trims Normal toward the floor against a ceiling nobody can meet.
- Easy then lays that plan wider, or plans its own.
- Nothing ever compares Easy's length or content with Normal's, so the kid setting is the long, least-taught version.
- Needed: one gate pairing Normal and Easy of the same seed (Easy time ≤ Normal + 10%, same section list, same teach set).

**d. My F3 (teach order flips on mirroring) + PLAN F5 (a variety ruler fitted to 3 rolls).**
- Mirroring is counted as variety, but it silently reverses the teach order inside a section.
- A variety measure that rewards mirrored sections rewards broken teaching.
- Needed: sections declare whether they may mirror, and teach sections may not unless their sockets are order-tagged.

### (3) What I now rank differently

**Raise:**
- ENGINE #3 and #4, as player findings, to my #2 and #3. A stage with no mushrooms, or a kid's stage different from and worse than the adult's, outranks my backdrop-log and checkpoint findings.
- My F3 (untaught double): with seed 124 Easy, the kid gets two double teaches and no line.

**Lower:**
- My F5 (12 checkpoints) to the "lesser" list. It is noise, not a quit reason.
- My F8 (pickups under the HUD sideways): its main cause is the game-wide camera.

**Unchanged:** F1 (raw ids) stays #1. It is visible to every player on every roll and no gate catches it.

**Revised top 5 (player):**
1. raw Dot ids (F1)
2. failed rolls played, with no mushrooms or teach (ENGINE #3)
3. Easy plans a worse stage than Normal (ENGINE #4, with my F4)
4. no threat for 3 minutes, then one unannounced lethal fall, with useless hearts (F2)
5. double jump untaught or taught out of order (F3)

# Water and swimming: what shipped games do, what our rules say, what our code does (2026-11-05)

Water and swim researcher, for the lead (session_019iachLiuwNTAZUBSJWUmR3) and the level designer. Branch `research-water-swim`.

## Planned vs actual time

- **Planned:** about 2 h, due 1:30 PM ET.
- **Actual:** 10:59 AM to 11:22 AM ET, about 23 min (from `TZ=America/New_York date` at the start, at 11:17, and at 11:20 before the push).
- **That is under half the plan. Here is why, so the lead can check it:**
  - TinyFish fetches came back in 0.3-4 s each. Fetches over the size limit were saved to disk, and I copied them into the source files with a script instead of retyping them.
  - The engine measures run in seconds (`RealPlay`).
  - Every method step was done: the fetch test, my own search first, our research, our code, a headless run on 6-7, and the deliverable with (a) to (d).
- **What I could not do, named plainly:**
  - Video sources (GDC talks, Game Maker's Toolkit, Design Delve) are YouTube or Escapist video. I could not open them, so none is cited.
  - The fan wikis behind bot walls were blocked: Fandom, breezewiki, raymanpc, Sonic Retro and TV Tropes "Harmless Water Level". The web.archive.org copies returned 503.
  - I did not page the lead's 11-02 transcript to find Gemini's "water laws" section. It is 11 days of events. See finding C1 and the ask in §e.

Numbers are marked **measured** (from a run or the code) or **estimate**. Sources are in `sources/` with their URL and read date. A citation reads `S06:7` (source file, line) or `file:line` for our code.

---

## a. Findings, each with its source

### Shipped games (searched before reading our research)

| # | Finding | Source (saved file:line, URL in the file) |
|---|---|---|
| F1 | **2D Mario has no air meter.** "Mario naturally sinks in water and swims upwards when the player presses the jump button [...] There is no air meter, allowing Mario to stay underwater indefinitely." The 3D games add one. | S09:29 (mariowiki.com/Swimming) |
| F2 | **SMB3: swim speed = walk speed = 1.5 px a frame. A run is 2.5 px and a P-run 3.5.** So a swim is 0.60 of a run and 0.43 of a P-run (arithmetic). | S05:9 (tasvideos SMB3) |
| F3 | **Celeste's shipped code: no air limit.**<br>• Swim at the surface is 80 against a run of 90 (0.89 of a run). Fully under it is 60 (0.67).<br>• With no up or down held, she rises to the top by herself.<br>• The full dash works in water.<br>• Entering water refills stamina.<br>• Jump out at the surface, or pop up onto a ledge. | S20:3-14, S18:28, S18:3141-3240 (NoelFB/Celeste Player.cs) |
| F4 | **Sonic 1:**<br>• Air counts down in whole seconds.<br>• Warning dings at 25, 20 and 15 s left, the first one 5 s after going under.<br>• Panic music at 12 s left.<br>• At 0 the controls lock and he loses a life.<br>Two sources agree: the disassembly and StrategyWiki ("18 seconds, with warning bells after 5, 10, and 15 seconds [...] about 12 seconds"). StrategyWiki says of the music: "designed to induce panic, making it potentially harder to save him". | S25:7-19 (s1disasm), S02:5 |
| F5 | **DKC Returns cut water entirely:** the old water stages "felt slow... It just wasn't the kind of gameplay we were looking for" (Tanabe, Nintendo). | S03:7, S04:5 |
| F6 | **What players said about water stages:**<br>• They are a good "change of pace as long as there weren't a bunch of them in a row".<br>• DKC1's were "few and far between".<br>• A level "where the water level changed [...] had platforming AND swimming" was a favourite.<br>• Complaints: "swimming controls are often loose", and graphics that made it "hard to tell where the platform edges were".<br>• A swordfish ride made water better. | S04:10, 15, 13, 12, 14, 17 |
| F7 | **DKC Tropical Freeze put an air meter back:**<br>• Running out costs health, not a life ("you'll start taking damage").<br>• Air comes back "by touching bubbles or getting out of the water".<br>• The partners give speed boosts. Some currents can be swum against "only by using" Dixie's propeller.<br>• A one-use Blue Balloon refills the air. | S06:7, 17-19, 25 |
| F8 | **The breath meter was attacked as a step back:** "after an entire trilogy where the heroes could hold their breath indefinitely, Donkey Kong now has the lung capacity of an airsickness bag". This article is source 8 in Gemini's own reference list. | S23:6 (gamecola) |
| F9 | **SNES DKC: no air meter.** The Kongs swim the way 2D Mario does, and Enguarde the swordfish is the fast ride. Funky Kong in Tropical Freeze's Switch version has no air meter (goggles). | S09:51, 53 |
| F10 | **Ori and the Blind Forest:**<br>• Dirty (purple) water deals "continual damage" until the Ginso Tree is cleansed.<br>• After that, the water is swum with breath, and "you will be able to hit an air pocket long before you run out of breath". Hold a button to swim faster.<br>• A Moon Studios staff member confirms dirty water is a gate: "you're not supposed to get there before the water is cleansed".<br>• Reviewers called the rising-water escape "needlessly punishing". | S11:6-10, S12:6 |
| F11 | **Ori and the Will of the Wisps:**<br>• Breathing underwater is a skill you buy.<br>• Swim Dash is a later skill: "dash your way through to safety" and launch out of the water.<br>• Bubbles are launch pads, not air.<br>• Water fills an arena room during a fight. | S10:4, 9, 6, 12 |
| F12 | **Kirby: no drowning.** "Swimming characters are not at risk of drowning [...] and can remain underwater indefinitely." The one exception is Mass Attack.<br>• Dream Land swims by repeated jumps.<br>• Kine the fish is the smooth, fast swimmer.<br>• Forgotten Land cut underwater sections over fears they "would be difficult to control" (Nintendo Dream interview). | S19:5, 7, 9, 17 |
| F13 | **Hollow Knight: acid hurts** ("an instant hazard that knocks you back and drains a mask": search snippet only) until Isma's Tear lets the Knight swim in it. An ability unlocks the water. | S28:3-5; S19:20 (rogueranker snippet) |
| F14 | **Shovel Knight's water stage:** the guide never mentions an air meter or drowning. Under water the jump is higher and floatier, and bubbles are platforms. | S08:9 |
| F15 | **SMB Wonder's Dolphin Kick badge gives a burst forward**, "powerful enough to allow the player to easily swim against currents". The NSMB Frog and Penguin suits did the same. | S21:3-7, S09:37 |
| F16 | **Rayman Origins:**<br>• "each new world provides a new ability [...] those moves stay with you forever".<br>• Swimming is gained in the Sea of Serendipity (raymanpc snippet, page blocked).<br>• No source I read says whether Origins has an air limit, so I make no claim. | S27:3-10 |
| F17 | **Badland (mobile):** "a one-button physics game: touching the screen causes [them] to fly forward and upward; releasing your finger allows them to float". That is the 2D Mario and Kirby swim, done with one touch. Its complaint is unpredictable floaty physics. | S26:5-7 |
| F18 | **Design writing on water (uliwitness, after Design Delve):**<br>• Water is best as "one special set piece that doesn't take too long", or short sections "interrupted by equally long 'above water'".<br>• Complaints: "currents that push me back", slower movement, and "Slave to the Cooldown" (air timers that undo progress).<br>• The cure: "Can you make your character a faster swimmer?", and "a mechanic that pops up for short stretches [...] quickly over". | S01:8, 10, 16, 26, 44, 48 |
| F19 | **Scott Rogers, *Level Up!* (2010):**<br>• "Don't expect players to be able to differentiate between water that is safe and water that is deadly [...] water within a single environment should be one or the other."<br>• Exits "clearly marked": ledges, ramps, ladders, "this is where I get out".<br>• Swimming is a "slow-moving move". "Alternate between fast experiences and slow ones."<br>• Ask "Does air matter?" | S22:48, 61, 15, 24, 69 |
| F20 | **Real sloths:**<br>• Swim at 13.5 m a minute.<br>• Move about trees at 4 m a minute, with a ground maximum of 3 m.<br>• That is 3.4x their tree pace and 4.5x their ground pace (arithmetic).<br>• Hold their breath up to 40 min (Goffart 1971; Britton 1941).<br>• WWF: "strong swimmers". | S24:5-20 |

**What the games agree on (my reading of F1-F20):**
- **Breath:** no air meter (F1, F3, F9, F12, F14), or air that is easy to keep (F10's air pockets "long before you run out").
- **Death:** where air kills outright (F4), it is the most-hated part.
- **Speed:** a swim is slower than a run in the base games (F2: 0.60; F3: 0.67-0.89). Every series that wanted water to feel good added a fast mode: Enguarde, Kine, the Dolphin Kick, Dixie, Swim Dash and Penguin Mario (F9, F12, F15, F7, F11). Retro cut water because it "felt slow" (F5).
- **Length:** short, set apart, and not back to back (F6, F18, F19).

### Our research, every line about water (searched after)

| # | Finding | Source |
|---|---|---|
| C1 | **The "in and out every 15-20 s" rule has no source text in the repo.** It appears only in the lead's triage row (`reference/research/GEMINI-VARIETY-2026-11-02.md:19`). That row summarises a report whose text is "kept in the lead session transcript of 2026-11-02 ~7:10 PM ET". Its section 3 was "water laws (buoyancy, clear exits, in-and-out)" (`GEMINI-VARIETY-2026-11-02.md:28`).<br>The saved full report (`-full.txt`, 181 lines, and the `.docx`) is a different paste. A search of both finds no "in and out", no "15 to 20" with water, and no "drown". This is the pattern `reference/methods/research-ledger.md` step 1 warns about ("the 11-02 triage turned out to be about an earlier paste"). | grep of both files (run 2026-11-05) |
| C2 | **The only Gemini text we hold says World 6 water is SLOW:** "W6: Deep Mangrove ... Volumetric Slow-Downs (wading/swimming)" and "High water [...] dampens movement until drained". | `GEMINI-VARIETY-2026-11-02-full.txt:124`; docx offset 23983 |
| C3 | **Matt's 11-04 research says the opposite:**<br>• "shockingly fast, buoyant swimmers—moving three times faster in water than on land [...] zero oxygen-timer stress" (line 372).<br>• "multiply maxHorizontalSpeed by 1.8 [...] gravity -0.2 g [...] hydro-dash [...] 1.4x normal jump height" (lines 653-655).<br>The 3x matches the biology (F20: 3.4x). The 1.8x is Gemini's own number, with no source. The "30% muscle-mass" label is a misreading: muscle is 25-30% of a sloth's body weight, not a swimming fact (S24:14). | `MATT-RESEARCH-2026-11-04-full.txt:372, 652-655`; summary `MATT-RESEARCH-2026-11-04.md:17, 29` |
| C4 | **The ledgers already flagged speed:** "Swimming is slow, not fast [...] 150 vs 285 px/s" and "the swim stage (R-5.22) must flip this number". | `ledger/LEDGER-2026-11-04-part1.md:219, 264-265, 465-466`; `ledger/LEDGER-2026-11-04-part2.md:164-167, 188` |
| C5 | **Gemini PCG research:** the first beat introduces a prop "(e.g. [...] a rising water sluice) in a zero-risk environment", and it names "low-tide/high-tide shifts" as a one-off twist. | `reference/GEMINI-PCG-RESEARCH.md:35, 42` |
| C6 | **Rhythm-group lengths** (the only sourced time numbers that fit a swim beat): "bursts (rhythm groups) 10-14 s [...] Normal, 6-8 s [...] Easy, 15-20 s a chase". The "15-20 s" in our papers is the chase and finale group (X-8). It is not a water number. | `reference/STAGE-RULES.md:173`; `ledger/LEDGER-2026-11-02-full.md:78, 125, 360` |
| C7 | **engine-2026-11-05 R1-R4 hold nothing on swimming.** R4 mentions only that Dadish 3 "adds ride-on and water helpers". | `reference/research/engine-2026-11-05/R4-mobile-and-architecture.md:234` |

### Our code, measured

All runs use the real engine (`RealPlay`, 30 fps), as `src/game/gen2/w6Swim.test.ts` does. Script: `measure/swim-measure.ts`. Outputs are saved next to it.

| # | Measured fact | Where |
|---|---|---|
| M1 | **Run vs swim.** Run: **276 px/s measured** (PHYS.maxRun 285). Swim: **150 px/s measured, 0.53 of a run** ("about half a run, so the water feels like water"). | `src/game/physics.ts:9`; `src/game/swim.ts:34-35`; `measure/swim-measure.out.txt:2,6` |
| M2 | **No breath.** Pokey floats with his feet 46 px under the top; his 38 px hurt box sits 8 px under the line. A dive with down held lasts **3.23 s measured**, then he comes up by himself (back at 3.27 s). After a 1 s dive he is back up 0.27 s after letting go. **No way to be under longer than about 3.3 s.** | `swim.ts:31, 43-45`; `fight.ts:260`; out:7-9 |
| M3 | **6-7's root well is the only calm water in the game.** It is 330 px wide (8.7 body widths of 38 px) and 72 px deep when up, with both banks 8 px over the water (climb-out allows 70). It is the same on all 16 shipped rolls.<br>• The whole swim is **2.2 s**, about **1% of a 32,000-36,000 px stage**.<br>• Crossing it measured 1.93 s.<br>• The first-swim moment, with no steering, is 2.10 s. | `w6Rooms.ts:70-86`; `swim.ts:49`; out:3-5, 12-28 |
| M4 | **Ways out:** a flick up is a full jump (vy -640, lands on the far bank 0.57 s later), or swim into a bank. No life or heart is lost. | `swim.ts:46-47, 150-159`; out:10-11 |
| M5 | **How dirty or fast water kills** (`engine.ts:2500-2537`):<br>• Below the stage's `waterY` + 20 px, or a river's surface + 8 px: `loseLife('water')`.<br>• The safe kinds put him back on the bank with no life lost: teaching pools (`safeWater`, waterTeach LV-8), 2-1's teaching river, and 2-8's rising teaching river ("goes back down for the next try").<br>• 6-8's rising tide is deadly dirty water. It is tuned never to catch a player who keeps moving: Normal rises 24 px/s and creeps 6 px/s within 320 px; Easy rises 16 and creeps 3.<br>• 2-8's flood basins give 26-30 s, and the first two are safe. | `engine.ts:2500-2537`; `risingTide.ts:5-10, 44-45`; `w2Sections.ts:1011-1041` |
| M6 | **The W6 tide is not swim water.** It is a mudflat that "sweeps you back" with a force of 190 and slows him to 0.78, 0.72 or 0.5 of a run (low, rising, high). | `zones.ts:12, 195-221, 374-396` |
| M7 | **The validator's bot cannot swim.** `tools/validate/*.ts` has no swim, calm or pool code (grep). So "time under on the bot run" is always 0. | grep of `tools/validate` |
| M8 | **INVENTORY.md (branch engine-mixer) does not list the calm well, 6-8's tide or 2-8's basins.** Under "water" it lists only 4-3's `tides43`. It also lists 32 W6 tide zones on 3 stages, 161 W2 `rivers` and `waterSigns` in W1-W5. | `origin/engine-mixer:reference/engine/INVENTORY.md:150, 460-477` |
| M9 | **The key idea, run on the real well (speed trial, `measure/speed-trial.out.txt`).** I raised `SWIM.speed` in memory, scaling acceleration with it. The far bank still climbs out at every speed, so there is no tunnelling past the 8 px touch window (`swim.ts:51-52`), up to 17 px a frame. Crossings of the 330 px well:<br>• 0.53x: 1.90 s<br>• 1.0x: 1.07 s<br>• 1.25x: 0.87 s<br>• 1.5x: 0.77 s<br>• 1.8x: 0.67 s<br>**A faster swim in today's well is over in under a second.** "Suddenly fast" needs long water, not just a new number. | out:1-6 |
| M10 | **The safe-vs-deadly rule, run on 6-7.** On **all 16 rolls**, deadly dirty water (an open column down to `waterY` 790) sits **483-634 px** from the calm well. That is within one sideways screen (844 px). Today the two kinds are told apart only by the painted art (`badWaterArt` vs `calmWaterArt`) and Pokey's line "Clean, calm water. I can swim in this!" Rogers' rule (F19) asks for one kind per place or strong cues. | `measure/rules-on-6-7.out.txt`; `swim.ts:2-7, 68` |

---

## b. Rules the engine can enforce, ranked by how strongly the sources agree

Numbers marked (est.) are my estimate, to be tested in play. Everything else is sourced or measured.

1. **No breath meter and no drowning in calm water, ever.**
   - *Why:* F1, F3, F9, F12 and F14 have none. F4 and F8 show the hate when air kills. F18 ("Slave to the Cooldown"). C3 ("zero oxygen-timer stress"). Built today (M2).
   - *Gate:* no calm water body deals damage or starts a timer.
   - *What it changes:* "time under" is not a survival number, so do not gate on it (see §c).

2. **A dive is short, and he comes up by himself.**
   - *The rule:* down held takes him under for at most 3 s, then he floats up. Built: `swim.ts:43-45`, 3.27 s measured.
   - *If an underwater passage is ever built* (none exists): he must reach a surface or air pocket within one rhythm group (10-14 s Normal, 6-8 s Easy; C6). Sonic's first warning comes 5 s in (F4). Ori puts pockets "long before you run out" (F10).
   - *Gate:* the longest time with no surface above him, measured in the real engine, ≤ 14 s Normal and ≤ 8 s Easy.

3. **Each kind of water reads at a glance.** Calm water swims; dirty or fast water costs a life.
   - *The rule:* calm and deadly water never share one screen (844 px sideways, est.) unless a bank divides them and the stage has already shown both. Otherwise they need strong painted and spoken cues.
   - *Why:* F19 (Rogers), F10 (Ori's purple water), F13 (acid).
   - *Gate:* the nearest open column to deadly water from any calm pool is > 844 px, or the stage carries a "two waters" line before the first one.
   - *Today:* **6-7 fails on all 16 rolls (M10).** That is a finding for the designer, not a rule change.

4. **Swim speed: at least a run (Matt decides the number, §d).**
   - *Why:* Matt's R-5.22 ("suddenly fast"), F20 (3.4x in life), C3, F5 (Retro cut slow water), F18 ("a faster swimmer"), and every series' fast mode (F7, F9, F11, F12, F15).
   - *Against:* F2 and F3 (0.60-0.89 in the base swim of SMB3 and Celeste).
   - *Today:* 0.53 (M1).
   - *Gate:* the steady swim speed in the real engine is ≥ the chosen multiple of `PHYS.maxRun`.
   - *Tested:* up to 1.8x the banks still work (M9).

5. **Beat length, and the surface cadence that goes with it.**
   - *The rule:* one swim beat (from entering calm water to leaving it, or to a rest he floats at) lasts one rhythm group: **10-14 s Normal, 6-8 s Easy**. It is followed by at least as long on land, or at a rest.
   - *Why:* C6 for the numbers. F18 for "equally long above water". F6 and F19 for pace changes.
   - *What it means at each speed* (est., from M1 and M9): 10-14 s of water is 1,500-2,100 px at today's 150 px/s, 2,850-4,000 px at 1.0x and 3,550-5,000 px at 1.25x. **Today's 330 px well is a 2.2 s beat (M3), a teach rather than a swim.**
   - *The swim stage (R-5.22, spec 6-9):* chains beats with floating rests between them, like a chase stage's groups (15-20 s groups, C6).
   - *Gate:* each beat's time in water in the real engine is inside the band.

6. **Wide, clear exits.**
   - *The rule:* each end of a swim body is a bank whose top is ≤ 70 px over the water (`SWIM.climbOut`, `swim.ts:49`) and is clearly drawn as a ledge or ramp. Past it is a landing at least 3 body widths wide (114 px; 38 px body, `swim.ts:51`).
   - *Why:* F19, F3 (ledge pop and jump out), and the "3-4 body-width landing aprons" from Gemini's section 5 (`GEMINI-VARIETY-2026-11-02.md:28`; a summary line, see C1).
   - *Gate:* lip ≤ 70 px and apron ≥ 114 px at every exit.
   - *Today:* **6-7 passes:** lips 8 px, aprons 220 and 300 px on all 16 rolls (`measure/rules-on-6-7.out.txt`).

7. **The first swim is taught with zero risk.**
   - *The rule:* the first calm water has a ground floor and no hazard in it, and he says what calm water is.
   - *Why:* C5 (Ki: "zero-risk"), F10 and F16 (a story beat unlocks the water).
   - *Built:* 6-7's well (`w6Rooms.ts:11-13`), with a 2.10 s first-swim moment (M3) and two lines (`swim.ts:67-70`, awaiting Matt's approval per that file).
   - *Gate:* the stage that teaches swimming has no deadly piece within the first calm pool.

8. **Currents are taught going with the flow, and can always be beaten.**
   - *The rule:* the first current carries him forward. An opposing current never brings his net speed below 0.5 of a run (est.) without a burst that beats it (DKTF's Dixie, Wonder's Dolphin Kick).
   - *Why:* F18 complaint ("currents that push me back"), F7, F15.
   - *Gate:* net upstream speed in the real engine ≥ 0.5 × maxRun, or a teach line plus a burst source in the same section.

9. **Rising and falling water pushes the pace but never catches a moving player, and is taught on a safe pass first.**
   - *Why:* F4 (Sonic's rising passage), F10 (Ori's escape: "needlessly punishing"), F6 (the praised changing water level), F11 (the room filling).
   - *Built:* 6-8's tide never catches a careful player (`risingTide.ts:5-10`, tested in `w6Stages.test.ts`). 2-8's first two basins are safe and give 26-30 s (M5). 6-7's raise and lower is a puzzle.
   - *Gate:* a bot that never stops is never caught, and the first rise on each stage is a safe one.

10. **How often swimming returns.**
    - *The rule:* swimming is a core move once 6-7 teaches it. In W6, W7, W8 and W10 at least 1 stage in 3 has a swim beat where calm water is drawn. **No two swim-heavy stages in a row.** None in W9 (lava only, Matt's element rule, ENGINE-SPEC:1509).
    - *The 1-in-3 ratio is (est.).* No source gives it for water. It copies the spec's ladder for the other core moves (ENGINE-SPEC:1540-1546). The "not in a row" part is sourced (F6, F18).
    - *W6:* 6-7 teaches. **6-9 is the whole swim stage** (spec:1602). 6-8 is the hand-built Stilt Climb with deadly water (spec:1606). So W6 has 2 swim stages of 10 if 6-8 is out.
    - *W7, W8, W10:* each needs drawn calm-water art (temple pools, karst ponds, the camp river, spec:1600) before it can count.
    - *Gate:* the spec's "dropped move" gate (spec:1615), reading a real swim row (spec:1490: the row does not exist yet).

11. **Bubbles are not air.** With no breath, bubbles are launch pads or platforms (Ori WotW, F11; Shovel Knight, F14), or a current's visible marker. They are never pickups that refill something.
    - *Gate:* none needed. It is a design note for the piece list.

12. **Touch controls stay one-thumb.**
    - *The rule:* steer with the left thumb, flick up to leap out (built, M4). Do not add 360° steering; if the swim stage wants a burst, it is a flick.
    - *Why:* Kirby cut 3D underwater over control fears (F12). The one-touch rise and sink of F1, F12 and F17 works on phones. Players complain about loose swim controls (F6).

---

## c. Where the spec's water lines are wrong or unsourced (ENGINE-SPEC on `origin/engine-spec`, 875c16b2)

| Spec line | Says | Problem |
|---|---|---|
| 1511-1512 | "before 6-7, water costs a life everywhere [...] on replay too" | **Wrong for what is built.** 2-1's teaching river, 2-8's rising teaching river and the waterTeach safe pools put him back on the bank with no life lost (`engine.ts:2503-2527`). |
| 1588 | "Shallow or pre-6-7 water is `swim: no`, so it costs a life" | **Wrong.** Shallow calm water is a wade and never costs a life (`swim.ts:28-29`; `w6Rooms.ts:11` "The water never costs a life"). "Can't swim" and "costs a life" are two separate fields. |
| 1589 | "(the research's rules, adopted)" | **Unsourced.** The rules come from the lead's triage row of a paste that is not in the repo (C1). The only Gemini text we hold says W6 water is a slow-down (C2). |
| 1590 | "at most 15-20 s under before a surface or an exit" | **Unsourced** (C1). The 15-20 s in our papers is the chase group (C6). **It cannot apply:** Pokey floats at the top and cannot be under more than about 3.3 s (M2). Replace it with rule b5 (beat length 10-14 s Normal, 6-8 s Easy, C6) and rule b2 (dive). |
| 1591 | "wide, clear exits, at least 3-4 body widths of bank or a ramp out" | **Part-sourced:** Rogers (F19) on clear exits, and Gemini's landing apron (summary line only). "Body width" is undefined; use 38 px (`swim.ts:51`). It also needs the lip limit (≤ 70 px, `swim.ts:49`). See b6. |
| 1592 | "no slow drag: Pokey is fast in water" | **Contradicts the code** (0.53 of a run, M1) and the only Gemini text (C2). Sourced to Matt (R-5.22) and the 11-04 research (C3). **No number:** it needs Matt's call (§d). |
| 1593 | "currents and bubbles as the variety" | **No currents exist** in calm water today (`swim.ts` has none). "Bubbles" must not mean air (b11). It needs b8's limit on currents. |
| 1594 | "rising and falling water from the tide zone, already built" | **Wrong piece.** The tide zone is a mudflat that sweeps him back (M6), not swim water. What is built is 6-7's well (raise and lower), 6-8's deadly rising tide and 2-8's basins (M5). No calm swim water rises and falls on its own yet. |
| 1596, 1618 | "The gate measures each swim beat's time under on the bot run and fails over 20 s"; gate 5 | **Can never fail:**<br>• The bot does not swim, so its time under is 0 (M7).<br>• A real player is capped at about 3.3 s under (M2).<br>Replace it with b5's beat-length gate in the real engine (`RealPlay`, as `w6Swim.test.ts` and `measure/swim-measure.ts` do), plus b6's lip and apron check. |
| 1546 vs 1598, 1606 | 1546: "swim [...] echo 6-8, 6-9"; 1598: "6-8 and 6-9 echo"; 1606: "6-8 is out" | **The spec contradicts itself.** 6-8 is the Stilt Climb over deadly water, so it cannot echo swimming. |
| 1600 | "W6-W8 and W10 at least 1 stage in 3" | **The ratio is unsourced for water** (b10). It is fine as a starting number marked as an estimate, but needs "no two in a row" (F6, F18). It counts only where calm water is drawn, and that art exists only in W6 (`calmWaterArt.ts`). |
| 1490-1491 | "swimming have no row in the table" | **True, and it blocks the dropped-move gate** for swim (b10). |
| (missing) | — | **No line separates calm and deadly water on one screen.** 6-7 fails rule b3 on all 16 rolls (M10). |
| ROADMAP R-5.22, MATT-DIRECTION:155-156 | "in and out of the water every 15-20 s" | **The same unsourced line, copied** (C1). It should be re-sourced or replaced by b5 when the lead updates them. The wording is the lead's to change, not this report's. |

---

## d. Matt's call (one question, multiple choice)

**"When Pokey swims in clean water, how fast should he go compared with his run?"**

- **A. Keep today's speed: about half a run.** "Water feels like water." This is what every hated water level does (F5, F18). It goes against R-5.22.
- **B. The same as his run.** Water stops being a slow-down but is not a thrill.
- **C. A quarter faster than his run (recommended).** It feels "suddenly fast" with room to steer on a phone at 30 fps: about 12 px a frame, and the banks still work (M9). Real sloths are 3.4x (F20), but a game needs readable speed.
- **D. Nearly twice his run** (Gemini's 1.8x, C3). The most exciting, but 17 px a frame is hard to read on a phone, and today's well is crossed in 0.67 s (M9).

**My recommendation:** C, plus one more step: the swim stage (6-9) gets long water, 3,500-5,000 px a beat (b5). Whichever speed Matt picks, the 330 px well is too short to feel fast (M9).

---

## e. What the lead may want next (not done here; the lead decides)

- **Recover Gemini's section 3 ("water laws").** It is in the lead's own transcript of 11-02 at about 7:10 PM ET (C1). With that text, C1 and spec line 1590 could be checked against the source itself rather than declared unsourced.
- **Add a "two waters" note to 6-7** (b3, M10). That is the designer's call. Law 22: fix the stage or engine, never loosen the rule.
- **Add a swim row to the move table** (spec:1490) so the dropped-move gate can read it.

## Method update (Law 4; for `reference/methods/research-ledger.md`)

- **What worked:**
  - **Large fetches land on disk.** A TinyFish fetch over the size limit is saved to a tool-results file. A three-line Python script copies `results[i].text` into `sources/` verbatim. That is faster and more exact than retyping, and it keeps whole pages.
  - **Shipped code beats wikis for numbers.** Celeste's `Player.cs` and the Sonic disassembly gave exact constants where the fan wikis were bot-walled. Find a disassembly with `gh api search/code q='<word> repo:<owner>/<repo>'`, then fetch it with raw.githubusercontent.com through TinyFish.
  - **Measuring a rule's gate in the real engine** (`RealPlay`) showed it can never fail (M2, M7). A check that reads only the spec would have missed it.
- **What failed, and why:** Fandom, breezewiki, raymanpc, Sonic Retro and TV Tropes are bot-walled. web.archive.org returned 503. YouTube talks cannot be read. Next time, go to official manuals (Nintendo's e-manual PDFs worked) and shipped code first.
- **Proposed edit to step 1** (the lead decides whether to apply it): add *"and every rule a triage row states must point at a line in a saved file; a row whose source text is not saved is marked UNSOURCED until the text is saved (the 11-02 'water laws', WATER-SWIM.md C1)."*

## Files

- `sources/S01-S28*.txt`: 24 saved sources, each with URL, read date and verbatim text or excerpts. numbers S13, S14, S15 and S17 are unused (empty, blocked, 404 or off-topic fetches); S22 holds only the water passages of a copyrighted book.
- `measure/swim-measure.ts`: real-engine measures. Run with `npx tsx reference/research/water-swim-2026-11-05/measure/swim-measure.ts [--rules|--speed]`. It changes nothing in the game; `--speed` overrides `SWIM` in memory only.
- `measure/swim-measure.out.txt`, `measure/rules-on-6-7.out.txt`, `measure/speed-trial.out.txt`: the outputs quoted above.

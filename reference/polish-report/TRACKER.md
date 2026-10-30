# Polish report tracker: every item, who has it, where it stands

Last updated 2026-10-29 ~8:15 PM ET.

Source: Matt's polish report (reference/polish-report/polish-report-1.txt, 2026-10-29) and the story audit (reference/story-report/). The
lead keeps this current every time something starts, reports, passes review, merges or is decided. "HF" = the art is made on Hugging Face
(Matt, 2026-10-29: all art from Hugging Face). Nothing is marked done until it passed the lead's review and is merged into the work branch.

Status words:
- **live**: on the live site (in `main`: release PR #48 at af9272f, hotfix #49 at 192cd16).
- **merged-not-live**: merged into the work branch (ccr) after PR #48 was cut (72305c0), so it reaches players with the next release.
- **running**: a helper is on it now. **waiting-on-Matt**: blocked on Matt's answer or Matt's action.
- **queued**: agreed, not started. **dropped**: replaced or cancelled. **done**: finished outside the game code (a doc).
- **unclear**: the record doesn't show it; the reason is given.

Owners are the helper names in STATUS.md's table (branch name), or "unowned". Evidence is a commit on ccr or main, or a STATUS note.

## Where we stand (counts)

| | Game audit (VI, AN, CT, SN, ST, DOT, LV, UI, PF: 129) | Beyond the report (X: 20) | Story audit (16) | All (165) |
|---|---|---|---|---|
| live | 69 | 8 | 0 | 77 |
| merged-not-live | 35 | 6 | 8 | 49 |
| running | 4 | 3 | 0 | 7 |
| waiting-on-Matt | 13 | 1 | 0 | 14 |
| queued | 5 | 1 | 7 | 13 |
| dropped | 0 | 1 | 0 | 1 |
| done (doc) | 0 | 0 | 1 | 1 |
| unclear | 3 | 0 | 0 | 3 |

Unowned: 13 (CT-8 step 2, CT-29, LV-17, LV-18, PF-2, X-14, S-6, S-7, S-8, S-9, S-10, S-12 stage lines, the SR leftovers).

The biggest blocks: Matt's listen of the 27 sound-effect previews (SN-1/3/9/10, X-17), and Build 1 from Matt's other session (AN-1/2/3,
SN-4, DOT-3, UI-6/7/8), which never reached GitHub (no polish-build1 branch on origin; engine.ts still shows "⭐ SOLAR INVINCIBLE (8s)!").

## Visuals (18)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| VI-1 | A dark outline around every painted backdrop strip |  | polish-edges | merged-not-live | 75f1b04 merge (94ab14d: edge fix on the outer 4 px only, crisp lines kept) |
| VI-2 | Backdrops are blurry in portrait | HF | polish-a1 (code) + hf-art-backdrops via polish-edges (native strips) | merged-not-live | code live 4044622; native strips 4f93153 in 75f1b04 |
| VI-3 | Backdrops pop in after the stage starts |  | polish-a1 | live | bebbf7e (618586e merge) |
| VI-4 | Mirror seams and "inkblot" twins where strips repeat |  | polish-a1 | live | cf92109, bc47854 |
| VI-5 | A white halo on the World 1 canopy strips |  | polish-edges | merged-not-live | 75f1b04 (REPORT.md: halo gone on the native repaints) |
| VI-6 | Magenta leaking on World 5 dusk and twilight |  | polish-edges | merged-not-live | 75f1b04 (REPORT.md: spill 0.0-0.1%) |
| VI-7 | Grey seams in the soil, including on the new generator |  | polish-a1 | live | 62a25a7 |
| VI-8 | Ground tiles repeat and band | HF | hf-art-ground | merged-not-live | 4e2ba1f, 5114dea; merge 0d3d710 |
| VI-9 | Pit water is code-drawn in Worlds 1, 3, 4 and 5 | HF | hf-art-stage | live | round 3 5e66912; merge 29697ae |
| VI-10 | Exit door and checkpoint flags are code-drawn in every world but World 5 | HF | hf-art-stage | live | 5e66912 (open gates lit from inside); 29697ae |
| VI-11 | Shimmy ropes are a dashed yellow line | HF | hf-art-bosses | live | b582d91 (painted lair ropes); merge d691b5b |
| VI-12 | Pickups and the thorn gate are vector shapes | HF | hf-art-stage | live | 29697ae |
| VI-13 | World 5's props are pastel stickers with thick outlines | HF | hf-art-ground | merged-not-live | 4e2ba1f (18 props repainted, carved water signs); 0d3d710 |
| VI-14 | Boss lairs: one painted, the rest code-drawn, while finished lair art sits unused | HF | hf-art-bosses | live | b582d91, a29669d; d691b5b |
| VI-15 | Boss projectiles, hazards and danger rings are vector shapes | HF | hf-art-bosses | live | b582d91, 00120b7 (painted weak-point ring); d691b5b |
| VI-16 | Code-drawn stand-ins still in shipped stages | HF | hf-art-stage (the rest: hazard-anim, X-18) | live | 29697ae; what is still code-drawn is listed in reference/prop-sheets/qa-notes/hazard-anim/SWEEP.md |
| VI-17 | World 1 and World 5 look the same every visit | HF | hf-art-ground | merged-not-live | fa33eac, ad3fc59 (dressing sets, no mirrored sets); 0d3d710 |
| VI-18 | Smaller visual notes | HF | hf-art-ground (W6 water) + hf-art-bosses (4-D bridge, counter, 5-M title) + polish-edges (W4 grade) | merged-not-live | bosses' part live (d691b5b); W6 water fa33eac and W4 grade 615566d in ccr only |

## Animation and feel (11)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| AN-1 | Losing a life has no beat |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | never pushed: no polish-build1 on origin; PLAN.md decision 1 |
| AN-2 | The invulnerability blink is uneven at 30 fps |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | as AN-1 |
| AN-3 | Pop-up text is constant and arcade-style |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | as AN-1; engine.ts 2846 still floats "⭐ SOLAR INVINCIBLE (8s)!" (story-a placeholder sweep lists the rest) |
| AN-4 | The background stutters while you run |  | polish-a1 | live | cf92109 |
| AN-5 | No landing dust, a five-dot take-off puff and flat circle hit sparks | HF | hf-art-bosses | live | b582d91 (painted dust and sparks, pooled particles); d691b5b |
| AN-6 | Enemy hurt flash uses canvas filters |  | polish-c | live | cbc9af3 (one shared hurt flash); stone sentry follow-up d23f46a in ccr |
| AN-7 | Venom Fang's lunge is a straight, stiff tube | HF | hf-art-bosses | live | b582d91 (painted bending body); d691b5b |
| AN-8 | The Tarantula Queen's animation clips are unused |  | hf-art-bosses | live | b582d91, e1609ed (her tea beat); d691b5b |
| AN-9 | Haptics only on button presses, and none on iPhone |  | polish-a2 | live | f97d19a (Vibration setting) |
| AN-10 | Screen shake is random jitter with no setting |  | polish-c | live | a6cd8ce (Full / Gentle / Off) |
| AN-11 | The Stage Cleared card doesn't move |  | polish-c | live | b4973f9 |

## Controls (29)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| CT-1 | A one-thumb running jump loses 40% of its distance about half the time |  | polish-controls | live | c5a04e9 (Build 2, merge e41ec03) |
| CT-2 | Pad: you can't climb a liana, and pushing up again on a trunk leaps off |  | polish-controls | live | cda420b |
| CT-3 | Ordinary climbing strokes leap off a trunk or liana |  | polish-controls | live | c0f84cd, 8e0bdcc |
| CT-4 | Stopping on a trunk overshoots about 90 px, then a thumb left slightly sideways drops him off |  | polish-controls | live | 977bf4f, 751dfb9 |
| CT-5 | The other thumb's straight-up flick lets go of a vine |  | polish-controls | merged-not-live | 1c56c3d (Build 4, Matt's call; merge 7459610); BUILD4.md: 8/10 → 0/13 |
| CT-6 | A back swipe from the screen edge can leave the game |  | polish-controls | live | f071aab, 0307205 |
| CT-7 | Resting the action thumb fires a mega, and its next flick is eaten |  | polish-controls | live | 211a855 |
| CT-8 | The two halves of the screen behave differently |  | step 1 polish-a2; step 2 unowned | queued | step 1 live 0f5862e; step 2 (any lone first finger steers at once) not started (BUILD3.md: "gets added when CT-8 lands") |
| CT-9 | Short quick flicks on the ground do nothing, or punch |  | polish-controls | live | b15264b |
| CT-10 | A jump near a trunk grabs the trunk |  | polish-controls | live | 4da35a1 |
| CT-11 | The thumb's arc reverses the steering at take-off |  | polish-controls | live | c5a04e9 |
| CT-12 | Jump height jitters, and a jump right after a hit comes out low |  | polish-controls | live | 7cd120a |
| CT-13 | The Pad lesson's text is false |  | polish-controls | merged-not-live | 53bbb94 (tap = short hop, as the lesson says; Matt) |
| CT-14 | No feedback in Screen mode, and iPhones have no vibration |  | polish-controls | live | 9baee8f; stronger ring c821d97 (World 1 only, Matt) merged-not-live |
| CT-15 | The palm rule eats second-thumb taps |  | polish-controls | live | 98d9f53 (Build 3, merge 434b2f3) |
| CT-16 | A gripping palm, or a finger whose lift was never reported, can take over steering |  | polish-controls | live | c4187dc |
| CT-17 | Punches wait for the finger to lift |  | polish-controls | live | de26e52, ab0f077 |
| CT-18 | Pad buttons have no extra touch area |  | polish-controls | live | cebef47 |
| CT-19 | The Pad's default side |  | polish-controls | merged-not-live | 7883958 (movement left by default; Matt) |
| CT-20 | Circle-carving can leak out of Meeca's stage |  | polish-a2 | live | 512b0fd |
| CT-21 | Rope hop ignores the flick lean |  | polish-controls | live | 55167f7 |
| CT-22 | A still press counts as a punch |  | polish-controls | live | bf5deb7 |
| CT-23 | Two "20 degree" constants differ |  | polish-controls | live | daad983 |
| CT-24 | airAgain speed threshold |  | polish-controls | live | aad84ad |
| CT-25 | Pad re-renders React every move |  | polish-controls | live | 40466fd |
| CT-26 | Jump while Pad held up gives no new press |  | polish-controls | live | 8cc9740 |
| CT-27 | Should a Pad tap be a short hop (Matt decides) |  | polish-controls | merged-not-live | 53bbb94, c5a342e (35°+ standing flick carries at 0.75 run; Matt) |
| CT-28 | No sensitivity or handedness settings in Screen mode |  | polish-controls | live | 622d42b |
| CT-29 | Tilt mode needs building |  | unowned | queued | later (2-3 days + phone testing); see matt-decisions |

## Sound and music (10)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| SN-1 | The old "pingy" effects are the default |  | polish-sfx | waiting-on-Matt | whole set rebuilt from 148 CC0 recordings, 7882dd1 (on polish-sfx, 18 commits not merged); Matt to hear 27 previews (STATUS line 3) |
| SN-2 | Effects swing 20 dB in loudness |  | polish-a2 | live | 67f45e2, 48a579f |
| SN-3 | Silent or wrong sounds at key moments |  | polish-sfx | waiting-on-Matt | as SN-1 |
| SN-4 | Every boss tell sounds like a jaguar |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | never pushed (see AN-1); polish-sfx's boss slam may cover part, not checked |
| SN-5 | The victory sting fires in the level, so the Stage Cleared card has only star chimes |  | polish-a2 | live | 01d78be |
| SN-6 | Pausing switches to the World 1 tune |  | polish-a2 | live | 3260357 |
| SN-7 | Nothing ducks under speech, and Dot is silent in play |  | polish-a2 | live | fa38809 |
| SN-8 | Some instruments jump in volume at their loop point |  | polish-audio | merged-not-live | 312c742 (seamless loops), carried in music v3; merge dc837c4 |
| SN-9 | Ambience is fully synthesized |  | polish-sfx | waiting-on-Matt | as SN-1 (ambience beds in the rebuild) |
| SN-10 | The boss intro card plays no sound |  | polish-sfx | waiting-on-Matt | as SN-1 |

## Story (8)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| ST-1 | Story scenes are blurry, stand on a code-drawn strip, and sometimes don't match the words | HF | polish-a1 (code) + story-art (art) | merged-not-live | code live 153ff76; art 7d8cde6, dec38b0, 13ac343; merge 1c0103f |
| ST-2 | Characters aren't lit like the scene, and their shadows are weak | HF | story-art | merged-not-live | 32f9f03 (rim + tint, two-layer contact shadows); 1c0103f |
| ST-3 | Meeca's carvings never pay off |  | w5-rebuild | running | STATUS table: "World 5 rebuild (LV-10, ST-3)"; origin/w5-rebuild 6d67bf45 |
| ST-4 | The Stage Cleared clue repeats every world |  | story-a | merged-not-live | 58890fd (a clue per stage), via story-art 1c0103f |
| ST-5 | The exit has three names and the same victory line everywhere |  | story-a (also in Build 1) | merged-not-live | 58890fd ("shrine" everywhere, a shrine line per world) |
| ST-6 | Boss quotes and aim text read as placeholder |  | story-a + polish-dot | merged-not-live | 58890fd; 8d68479 (boss quotes, SR-41) |
| ST-7 | The ending card's copy is out of date |  | story-a | merged-not-live | 58890fd |
| ST-8 | Placeholder stage names |  | story-a | merged-not-live | 58890fd, 1b78695 (generic mission names deleted) |

## Dot (17)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| DOT-1 | Tips are used up when they're sent, not when they're shown |  | polish-dot | merged-not-live | 776c001 (final/README "Her memory (DOT-1)"); merge ccc2b5d |
| DOT-2 | Puzzle rooms give the solution as you walk in |  | polish-dot | merged-not-live | 776c001, 8d68479 (4-4 ring and rocks line gone) |
| DOT-3 | Boss lines too long to read mid-fight |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | never pushed (see AN-1) |
| DOT-4 | Dot never explains the locked ring wall in 1-9 |  | polish-dot | merged-not-live | A2's a3500b9 reverted 6252643 for polish-dot's; final/README: 1-9's ring hint row removed |
| DOT-5 | Skip tips sits on the very first coach line |  | polish-dot | unclear | A2's fix 3fe32f2 reverted d88870e (2:15 PM ET, "polish-dot's version wins"); polish-dot's report doesn't name it, and DotGuide.tsx 397 still offers Skip tips on "her very first tip on this phone" |
| DOT-6 | Lines get cut and replayed |  | polish-dot | unclear | A2's fix 8f05f6a reverted a707270; not named in polish-dot's report |
| DOT-7 | Reading time is lost to Dot's flight |  | polish-dot | unclear | A2's fix 7615469 reverted acfe91a; not named in polish-dot's report |
| DOT-8 | World 5 has no calm rules |  | polish-dot | merged-not-live | DotGuide.tsx 250 "calm in every world (DOT-8)"; A2's b2421fb reverted 6806a10 |
| DOT-9 | Just reminders drops first-time explanations |  | polish-dot | merged-not-live | 776c001 (final/README "DOT-9") |
| DOT-10 | Death help is always generic |  | polish-dot | merged-not-live | engine side live (f7f26c5 keeps lostTo); Dot reads it, DotGuide.tsx 350 |
| DOT-11 | Stuck help runs on a clock |  | polish-dot | merged-not-live | 776c001 (no nags on a clock) |
| DOT-12 | Unreviewed and over-long lines |  | polish-dot | merged-not-live | every new line under 10 words; the lead approves Dot lines now (Matt), LINES-FOR-MATT.md approval 4:45 PM ET |
| DOT-13 | Move lines that don't name the thumb move |  | polish-dot | merged-not-live | 776c001 (DOT-13 rewrites approved) |
| DOT-14 | The Hush Fern secret is solved for you every time |  | polish-dot | merged-not-live | 776c001 |
| DOT-15 | The idol lesson points at a hidden relic and says "up high" |  | polish-dot | merged-not-live | 776c001 |
| DOT-16 | Two bosses get no coaching |  | polish-dot | merged-not-live | 776c001 (Crocus Rex and the Queen coached) |
| DOT-17 | Small things |  | polish-dot | merged-not-live | 776c001; W5-8 line sweep running (STATUS line 3) |

## Levels (18)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| LV-1 | The mode is invisible, and a new game silently starts on Easy |  | polish-a1 | live | ed92ff4 |
| LV-2 | Normal's difficulty curve goes flat, then backwards |  | polish-levels | running | W4 Normal 2143465 merged-not-live; W3/W4 combinations 849b93a1 on the branch; Matt: go, option A (STATUS line 3) |
| LV-3 | Decide whether Easy holds back the double jump |  | — (Matt decides) | waiting-on-Matt | PLAN.md decision 5 (the other three there are decided) |
| LV-4 | Easy is kinder on new-generator stages than on the old ones |  | polish-levels | live | bcd6688; final f094a38 |
| LV-5 | Easy loses more lives than Normal in places |  | polish-levels | live | bcd6688, 439e0c4 |
| LV-6 | Some Easy targets are hollow |  | polish-a2 | live | 1205a6e (65% of Normal) |
| LV-7 | Switching from Easy to Normal mid-game is a cliff |  | polish-levels | live | bcd6688 |
| LV-8 | Water kills before it's taught |  | polish-levels | live | bcd6688 |
| LV-9 | Checkpoints too far apart on Normal |  | polish-a2 | live | 28ae335, 6fdeff7 |
| LV-10 | World 5 is padded and never changes |  | w5-rebuild | running | STATUS table; origin/w5-rebuild 6d67bf45 |
| LV-11 | Players get stuck in dips |  | polish-a2 | live | df29100, ce4057f |
| LV-12 | One jump in 4-8 failed every scripted try in both modes |  | polish-a2 | live | 6be0b17 |
| LV-13 | In 4-5 the eagle's first strike lands with the nearest bush 196 px away |  | polish-a2 | live | d72e4e3, b44f3e6 |
| LV-14 | Hits nobody teaches |  | polish-levels | live | 7ed4a10 |
| LV-15 | Stage lengths at the extremes |  | polish-levels | live | 7ed4a10, 439e0c4 |
| LV-16 | Look-alike stages |  | gen2-w8 (measure: gen2-lookalike) | running | Matt chose C for World 8 (e3d270d); gen2-lookalike's 31d0341 (3 commits) not on ccr |
| LV-17 | Bosses' third phases repeat a template |  | unowned | queued | with bosses 6-10, 7-10, 8-10, after Worlds 7 and 8 pass (Matt, today) |
| LV-18 | Secrets and replay |  | unowned | queued | later |

## Screens (15)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| UI-1 | In portrait the win card hides Pokey |  | polish-a1 | live | 848d5ca |
| UI-2 | Nothing counts up |  | polish-c | live | b4973f9 |
| UI-3 | The confetti is a still image |  | polish-a1 | live | 848d5ca |
| UI-4 | The clue line repeats every world |  | story-a (same as ST-4) | merged-not-live | 58890fd |
| UI-5 | The boss intro and ending cards use the old plain style |  | polish-c | live | d974f39, 8107b20 |
| UI-6 | Card screens ignore notch safe areas |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | never pushed (see AN-1) |
| UI-7 | Boss HUD flashes the wrong name, and Dot covers the boss bar |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | never pushed |
| UI-8 | Power-up HUD timers don't match the engine |  | Build 1 (Matt's other session, polish-build1) | waiting-on-Matt | never pushed |
| UI-9 | Medals earned show only as a separate pop-up |  | polish-c | live | b4973f9 |
| UI-10 | The flowers chip means different things on different cards |  | polish-c | live | b4973f9 |
| UI-11 | The map's star total says /300 |  | polish-a1 | live | ea286c4 |
| UI-12 | Small misfits |  | polish-c | live | 303e1a5 |
| UI-13 | Five font families plus strays, and two overlapping stylesheets |  | polish-c | live | cbc9af3 |
| UI-14 | Text as small as 9-10.5 px |  | polish-a1 | live | 3b4df48 |
| UI-15 | The control-test page is reachable in the shipped game |  | polish-c | live | cbc9af3; testers' #ctest link restored by hotfix #49 (1c203ed) |

## Performance (3)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| PF-1 | iPhones in portrait drop frames |  | polish-pf1 (PF-1b running: baking procedural art) | merged-not-live | b4337d7 (40-54% faster upright; pf1/MEASUREMENTS.md) |
| PF-2 | The download is heavy |  | unowned | queued | later |
| PF-3 | Leftovers |  | polish-c | live | 027ae2c |

## Beyond the report (Matt's other asks, same tracking)

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| X-1 | World 7 vine anchors (lintels) and tall temple walls | HF | hf-art-blocking, gen2-w7 wires | merged-not-live | art live cbe3dbf; wiring e949275, merge 56c2b81; W7 round 5 running |
| X-2 | World 4 painted waterfalls + wet stone pillar (code streams rejected) | HF | painted-swaps | live | d058654; merge 24f4cd0 |
| X-3 | World 6 ledge set for 6-8 (deck, boardwalk, root shelf, wedged branch) | HF | w6-stilt-climb | live | 1b9f3dd |
| X-4 | Swim poses missing the satchel (tread, under) | HF | hf-art-pokey | live | a6cbeeb; merge 84b977d |
| X-5 | 7-4 Pokey frames: pole stubs and paws repainted, 2x sharper | HF | hf-art-pokey, w7-slide | live | 0633f65; merge 5bb3089 |
| X-6 | 7-3 ring of chairs | HF | hf-w7-chairs, gen2-w7 wires | merged-not-live | art live 6f96c87; wiring in 56c2b81 |
| X-7 | Stone Sentry guard for 7-5 | HF (exists) | gen2-w7 | merged-not-live | 56c2b81 |
| X-8 | Floating capital-letter lesson labels; no speech box over Pokey | | polish-dot | merged-not-live | 776c001 ("no words floating in the world", bubble 24 px clear of Pokey) |
| X-9 | Music: varied songs per world, adaptive, Hugging Face models allowed | HF | polish-audio | running | v3 approved (Matt), wired df6a639, merge dc837c4 (not live); v4 title/menu/map approved 7:50 PM ET, being wired |
| X-10 | QA batch E: replay 2 fps, Facebook iPhone blur dropped steering, load stutters | | qa-fix-e | live | af28879; the replay's 2 fps root cause still needs an Android replay (not owned) |
| X-11 | Spider webs and swing glow (painted-swaps) | | painted-swaps | live | 24f4cd0 |
| X-12 | Control-test opening too hard for first-timers: Easy gaps sized to Easy reach + two more flags | | qa-fix-e | live | af28879, 0be1db4, cc4a1bf |
| X-13 | Classic-family effects redo (no orchestra), tuned to each stage's key | | polish-audio | dropped | replaced by the real-sound rebuild (X-17; Matt 4:05 PM ET: the classic set is "crap" too); orchestral set deleted be15945 |
| X-14 | Pokey teeter / step-back frames at a ledge's end (painted; the slide is a stand-in) | HF | unowned | queued | drawn step back only (48d39fa) |
| X-15 | 6-8 Stilt Climb (W6 special) | HF ledge set | w6-stilt-climb | live | 1b9f3dd |
| X-16 | Upright looks faded next to sideways (strips fitted to view height) | HF + code | polish-edges | merged-not-live | 65bae59, 94ab14d; merge 75f1b04; round 4 d1b21a2d (5 more skies) passed, merges for test link v7; 11 skies held |
| X-17 | Sound effects "pings everywhere, sounds like pinball": real stone/wood/water sounds, varied, capped repeats | HF/CC0 audio | polish-sfx | waiting-on-Matt | 7882dd1 (27 previews); Matt to listen |
| X-18 | Falling-rock warning drawn as grey squares; sweep all repeating effects drawn as code shapes | HF + code | hazard-anim | running | round 1 live (a8c522f, 66e6706; merge 323056b); what's left: hazard-anim/SWEEP.md "Not fixed" |
| X-19 | Seams and cleanness across every stage; walk tool + seam detector a required check | tool + HF | polish-clean (+5 sweep branches) | running | origin/polish-clean 311c3753 (seam detector, sweep report by cause and owner) |
| X-20 | Bounce plants painted per world (Matt) | HF | hf-art-ground | merged-not-live | ff5ada6, 32ad06c; merge 0d3d710 |

## Story audit (reference/story-report/: "the road to A+" S-1 to S-11, SR-1 to SR-43, story-a's report)

Matt's seven calls (2026-10-29, "Yes, all seven"): slowness costs once at the World 6 tea; Pokey's parents in one painted background with no
words; add Dot's lost pocket; the player's thumb does the let-go; three keepsakes in the finale, the rest in the satchel; the garden hub later
(after steps 1-8); a playable prologue morning if there's time. Since 4:45 PM ET the lead approves all Dot and story lines (Matt).

| Item | What | Art | Owner (branch) | Status | Evidence |
|---|---|---|---|---|---|
| S-1 | Step 1: every written-out line edit, file by file | | story-a | merged-not-live | 10a0d4d, 72374c9; via story-art 1c0103f (the stage-line Flicker edits are S-12) |
| S-2 | Step 2: the three new scenes (the reunion, Pokey's answer to Dot, the General's motive in three layers) | | story-a | merged-not-live | 10a0d4d; 1c0103f |
| S-3 | Step 3: the new finale running order, keepsakes cut to three (the rest to the satchel later) | | story-a | merged-not-live | 10a0d4d (other six kept as KEEPSAKE_LINES) |
| S-4 | Step 4: the played let-go in the tower (thumbs) | | story-a + story-art (wall-grip pose) | merged-not-live | 10a0d4d; 8e85ed1 (Pokey's painted wall grip and reach) |
| S-5 | Step 5: Dot's ~80 in-stage lines and SR-38 to SR-43 | | polish-dot | merged-not-live | the Dot rework 776c001 and round 2 8d68479 (SR-38 to SR-43); merge ccc2b5d |
| S-6 | Step 6: the satchel screen and Pokey's journal | | unowned | queued | not started |
| S-7 | Step 7: ending cards for every character (painted cards) | HF | unowned | queued | not started |
| S-8 | Step 8: Dot's lost pocket, The Notch, the Under the Ruins note, the snail | HF (small finds) | unowned | queued | not started |
| S-9 | Step 9: the garden hub, the map warming up, guardian relics, the council chamber scene | HF | unowned | queued | later (Matt: after 1-8) |
| S-10 | Step 10: the playable prologue morning, story coats, the General counting real falls | | unowned | queued | later, if time |
| S-11 | Pokey's parents: one painted background behind the singing-storm memory | HF | story-art | merged-not-live | 39377d6, 5aa7222 (parents in the storm, the empty nest); 1c0103f |
| S-12 | Flicker plan (mother's-jealousy lines, his stuttering light) | | cutscenes story-a; stage lines unowned | queued | cutscenes in 10a0d4d (merged-not-live); stage barks in dotLinesData still undone (way.6-6 has no Flicker; 0 Flicker lines in dotLinesData.ts) |
| S-13 | Cast Bible fixes: Dot is "she"; add Flicker's entry | | story-a | done | Cast Bible doc (2026-10-29) |
| SR-1..37 | Matt's story review rows 1-37 | | story-a | merged-not-live | 72374c9 |
| SR-38..43 | Dot in play and menu text | | polish-dot | merged-not-live | 8d68479 |
| SR leftovers | SR-36's optional snacks line, the General's optional blanket line, the "Nobody" count (SR-2/4/5/6), the General's nine-line intro on every retry, story-a's own new lines | | unowned (lead approves) | queued | story-a-report.md "NOT done from the SR list" and "POLISH CHECK" |

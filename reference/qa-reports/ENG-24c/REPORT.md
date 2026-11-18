# ENG-24c REPORT: 2-4's raft look (R-165.288) and the glow that agrees with the log (R-165.289)
Engine, t-eng-24c from origin/t-meter-3 42459a5c (main + ENG-24 + METER-3). Started 4:17 PM ET 11-18 (by `date`). Packet
reference/packets/2026-11-18/ENG-24c.md (lead branch). The lead's GO on both departures from the packet's letter: 4:31 PM ET.
Final head: GATE_HEAD (the gate table names the head each ran on).

## EXACT NEXT STEP (lead)
Merge t-eng-24c with BUILD-24b's 2-4 (no conflict on the scratch merge with origin/t-build-24 8f02391f). The 2-4 builder then sets
`look: 'raft'` on w2Arc24.ts `slow24` (one word, "What the 2-4 builder wires" below) and re-runs 2-4's stageSheets/game.test pins (2-4 gains
'kit-pieces'). Rule on the debt in "Found" 1 (the judge's flight leaves out the press-frame climb).

## Done-items (packet) and evidence
1. **R-165.288 the raft.** `RiverRow.look: 'raft'` (gen2/riverLay.ts) -> layRiver puts it on each carrier's `DriftInfo.look` (river.ts, new
   optional field, draw only). Drawn (the lead's GO 4:31 PM: painted art first):
   - on World 2's painted water (every World 2 stage once its sheet loads: engine.ts withoutPaintedLogs hands EVERY drift platform to
     riverArt.ts drawRiverLog, so the code-drawn spanArt raft would never have shown in World 2): World 2's PAINTED raft, puzzle-kit#raft
     (the art 2-4.md:39/:60 names; w2.json "in game"), placed exactly as puzzlePlay.ts places the sluice raft (deck = the carrier's top);
   - where no painted sheet draws (the drawn layer): platformPlan gives it the 'raft' look, spanArt's raft painter (the packet's), never
     rotated to a barge or a pad; logs keep their river looks;
   - preloaded: a gen2 stage whose kit places a raft row asks for the kit's sheet (gen2/game.ts gen2Rafts / laysRafts -> stageSheets
     'kit-pieces'), read from the kit's data (no stage id). No stage laid today places one, so no stage's sheets change (tested).
   - art = collider: his feet on the raft's plank deck (stills/2-4-N-up-raft-feet-zoom3x.jpg); the test pins the deck at the carrier's top.
   Planted test (riverRaft.test.ts 6/6): a raft row draws the painted raft from the kit's sheet and a log row the painted log; the drawn
   layer; the judge reads a raft row exactly as its log row; laid by gen2 on ENG-24's toy (a `raft` row, TOY_RIVERS.raft) clean both settings.
2. **R-165.289 the glow agrees with the log** (letGoCue.ts; engine.ts letGoNow):
   - **Precomputed once, no per-frame flight.** The swing is a pure function of the vine clock, so per liana, hold and facing ONE table:
     every press of one swing as the engine plays it (physics.ts pressLaunchesFrom, split out of pressLaunches with pressLaunches/pressWindow
     unchanged: the sweet spot, a beat early, a beat late) at two clocks half a frame apart, each flown by the judge's own flight
     (gen2/riverLay.ts letGoFall: flyLaunch + airStep with the turn push, split out of lianaDrops). Each frame: the press for the vine's phase,
     the logs at the landing time on the river's clock (fallOnLog, split out of lianaDrops). Facing back: the same flight on the mirrored
     vine (exact: the swing, the leap and the air step are mirror-symmetric). Rebuilt only when his hold rests at a new length; while his
     grip moves the river says nothing. **Perf:** a table 0.19 ms (0.56 ms with the gates running alongside), the per-frame read 0.26 us
     (tools/bench2.mts); one table per take-hold, none on stages with no river under a liana (1-6 test: 0 tables).
   - **The judge is byte-identical**: lianaDrops before/after on 42 cases (7 rows x 3 lianas x 2 settings: tools/judgeDump.mts) IDENTICAL to
     the last digit; 4 values pinned in letGoCue.test.ts 4.
   - **The read is tighter than the judge's, from measurement** (CUE in letGoCue.ts; "Found" 1): the press climbs his hold one frame
     first, and the catch is read 8 px narrower on both readings of the river clock. Over a river the glow goes out the frame the moment
     passes (World 1's still fades: the old fade left a fading glow over the water ~4 frames).
   - **Planted test on ENG-24's toy (letGoCue.test.ts 1)**: over two whole log cycles, the DRAWN glow every frame vs each frame's let-go
     pressed FOR REAL (RealPlay through the game's own InputEngine, a flick, as the phone sends it): long, gap280 (Easy deep), the raft row,
     both settings, and facing back. Result: **0 frames lit over water in all 7 cases; lit on 83-97% of the frames whose let-go lands**
     (long N 204/213, long E 188/201, gap280 N 92/111, deep E 188/193, raft N 174/195, raft E 208/214, long E back 188/213).
     PLANTED in the same read: World 1's glow alone lit over water on 7 / 11 / 24 / 0 / 4 / 4 / 0 frames (gap280 Normal 24: BUILD-24's
     finding). 1-6 unchanged (test 2: the drawn glow equals World 1's ease frame by frame on every 1-6 liana both ways, no table flown).
   - Fallback (no glow over a log river) NOT needed: the full fix shipped.
3. **The check list**: the gate table below (every item, one head).
4. **Stills and clips** (stills/, shot on the REAL page on a scratch merge of origin/t-build-24 + this branch with `slow24` set to 'raft'
   locally, never committed; 2-4 layout 1; the lead's GO 4:31 PM): beat 1's liana, Normal: glow lit with a log coming under the landing
   (N-up/side-glow-lit), dark (N-up/side-glow-dark), the lit press landed on a log (N-up/side-landed-on-log); Easy lit/dark; the clips
   2-4-N-up/side-glow-clip.mp4 (a hang through the log cycle, then a press at a lit frame onto a log and one at a dark frame splashing back);
   the raft in play at beat 9 (N-up/side-raft, the feet zoom, 2-4-N-up-raft-clip.mp4: the middle bot's real run onto it).

## Found (outside the packet; for the lead)
1. **The judge and the bot fly a let-go the engine does not quite make** (debt like R-165.285): a jump press is also Up (inputEngine.ts
   triggerTouchUp sets state.up), so the press frame climbs his hold 5 px before he leaves (engine.ts swingStep climb), and an early press
   keeps climbing while it waits for the sweet spot; and lianaDrops reads the logs one frame ahead of the engine (the engine moves the logs,
   then him). Read exactly as the judge, the glow lit over water on 0-5 frames per case (probe, FakeInput thumbs). The judge is left as it
   was (no list moves); the glow corrects for it (CUE). Suggest: model the press-frame climb in pressLaunches for the judge and the bot.
2. **The leaf**: a player who has cleared 4-1 has the glide (skills.ts), and a let-go with the jump HELD opens it and glides ~250 px past
   where the judge, the bot and the glow read (probe trace). A first-time 2-4 player has no leaf; the tests take it off. A returning player
   who taps lands as read. Not fixed: the lead's call (the judge/bot could fly the glide when held, or the glow read both).
3. **Reaction time**: the glow is a "now" cue; on gap280 its lit windows are short. A thumb pressing ~0.2 s after the glow lights can miss
   the end of a short window. Not in the packet; a design question (light the glow only when a let-go now AND one a thumb's lag later both
   land, as the bot's dropOnLog aims).
4. Seen on the scratch merge (not mine): pink petals drawn in the soil band under 2-4's river (BUILD-24b); a tsc error in
   src/game/flagSpan.test.ts:42 (LevelConfig.secret 'thornbark') on origin/t-build-24 + this branch (this branch's tsc is clean).
5. BUILD-24's clip24.mjs never set the lianas' angles per frame (render alone does not move them): my shoot.mjs records and applies them.

## What the 2-4 builder wires
- w2Arc24.ts: `slow24: { dir: 1, speed: 70, logW: 200, logs: 2, safe: true, look: 'raft' }` (and any Easy twin of it). Nothing else: the
  glow needs no data (any liana over a log river), the preload follows the kit's data.
- Then 2-4's sheet pins (stageSheets.test / game.test, if 2-4 has one) gain 'kit-pieces'; drawcheck 2-4 both ways (the raft is one
  drawImage like the log it replaces).

## Gate table
GATE_TABLE

## Method used
reference/roles/ENGINE.md day one (base lock saved before any edit, lockall --check after), methods/stage-fix.md + render-fix.md,
level.md rules 12 (planted faults), 14, 16, 21, 23 (proven on a rolled toy row), 27 (judged the built stage), 29 (stills on the head).

## Lessons applied
D19 (the test reads the DRAWN glow, what the screen draws; my first test read the target and a plant slipped past it: fixed),
D20/D30 (times from `date`; ONE MISS: my 5:13 PM status to the lead carried a typed time, the real `date` read 5:09-5:11; corrected to the
lead), D36 (git status / ls-remote at each push), D43 (no stage id in engine code; generality PASS), D57 (inbox read at each step: one
lead GO sat 19 min unread early on), D59 (no gate left running at the report), D79 (whole-screen pass on the stills: Found 4),
D81/D86 (the full CLAUDE.md list), D83 (report tools take ROOT, no absolute repo paths in tsc's scope).

## Method update (proposed)
- methods/render-fix.md (or gates.md): "A cue that promises an outcome (a glow, a 'now') is tested against the outcome made for real on
  the engine, frame by frame, through the real input path, and on what is DRAWN, not the variable behind it." (letGoCue.test 1 caught the
  fade-over-water only after the test moved to the drawn value.)
- level.md rule 21 add: "A model the judge and the bot share is measured against RealPlay through useRealInput, not FakeInput: FakeInput's
  bare tap gave 1-3 false frames the real touch press never gives."

## Learned (for the next engineer / builder)
- Measure before tuning: three hand-picked variants of the cue were each worse in some case; the frame-by-frame trace (model path vs the
  engine's) found the two real causes (the press climb, the log clock) in minutes.
- `withFixtureConfig`/`withTestStage` are synchronous: an `await` inside drops the fixture. RealPlay.swing keeps the engine's sweetSnap:
  clear it.

## Turnover note
reference/handoffs/engine-core.md §0zm.

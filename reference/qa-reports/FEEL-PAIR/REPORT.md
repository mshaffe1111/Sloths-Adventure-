# FEEL-PAIR: the two-vine climb alone, for Matt's feel test (R-165.170). t-feel-pair from t-int-2@465023ef. Opus 5.5 xhigh
**Matt's way in (test link):** title, gear (top corner), **About** tab, top row **"Vine pair test"**, **Play** (or `#autostart=1&level=feel-pair`).
Leave by the pause menu. QA build only: test-link build shows the row (checked), ship build does not (row 0); planted: drop the gate, test red.
## Done-items (6/6)
1. **Pair as one grab, speed on the piece** (vinePair.ts, engine.ts): `Vine.climbSpeed` (up and down), `Vine.pair` (gap 40); up from between or
   beside either strand takes both. Single 220 px/s, reach 54/60, rustle all unchanged. vinePair.test.ts 4/4 by touch, 390 and 1034 wide;
   planted: base engine climbs the pair at 220.0 and takes nothing 64 px off (2 red). Per frame: single 7.33 px, pair 2x 14.67.
2. **Room** (feelPairStage.ts): kapok single and draped pair 160 apart, 720 px up (about 3 storeys), sound floor, one walk across the top, flag on
   it, nothing hurts, no door. feelPairRoom.test.ts 5/5 (layout, QA-only, step off the top costs nothing with the engine's own loseLife).
3. **Speed sign** at the pair's foot: 2x, a tap by it 1.6x (and back). The tap is no punch (test; browser: 352 px/s, punching false).
4. **Stopwatch** (FeelPairClock.tsx), grab to standing on top: One vine 3.5 s, Two vines 2x 1.9 s, 1.6x 2.3 s (climb alone 3.27/1.64/2.05).
5. **Stills + clips** here, upright and sideways: entry, room, each climb mid-way, top, sign, clock; one mp4 per climb per orientation.
6. **Checks:** tsc PASS; suite 3125 pass, 2 todo (base's), 1 fail fixed after (11 px text, 09f18a12; textSize re-run PASS); ship build + chunkcheck
   PASS; artcheck, drawcheck, clipcheck (83 known), knowncheck, generality, roadmapcheck, kbdcheck, seedlist 1-1 (257), tools tests 33/33, tierBots
   7/7 PASS; lock 102/102 stages unchanged. **buildcheck red, same as base within noise** (p95 535/480 ms vs base 542/439; R-165.163).
## Polish check (fixed from my own stills)
Soil filled half the sideways view (level height cut to the floor); the single's trunk under a long plank read as a post and beam (now the kapok's own
perch); the single was off an upright screen (moved 160 from the pair); the stopwatch sat where his head climbs sideways (moved under the lives); its
lines jumped when the sign switched (fixed order); sign lettering too small (bigger, rebaked on canvas loss and font arrival, tested).
## Placeholders (the painted pair is the lead's art call)
Liana = World 1's painted shimmy vine on a code path (loop and trailing ends are code); pair's bough = stock branch art; sign text = code lettering on the
kit's painted post; stopwatch = plain dark panel (QA tool). **No arms-out frames:** the climb clip is a side view, so on a pair it runs longer pulls
(cycle 1.5x the height) with a +-0.07 rad sway. Arms-out needs new frames.
## Pushback / suggestions / unresolved
- New optional fields in types.ts (Architect's): `Vine.pair`, `Vine.climbSpeed`, `PlayerState.climbPair`; the packet asked for speed on the piece.
- At 2x the camera's ease trails a little (feet 45% vs 50% of a sideways view; upright 50 vs 52). Not touched: 1-4 piece 5 owns climb framing (D40).
- Suggestion: the stage time estimates' `CLIMB = 220` (w3Sections, w4Stage43, w6Stages, w8Lantern) read CLIMB_SPEED. Unresolved: none.
## Method / lessons / turnover
Method written: reference/methods/feel-room.md (+ README row). Lessons: D1/D2, D6, D19, D30, D37 (loseLife unstubbed), D40, D41, D43. My miss: the
11 px text, caught by the suite; I now read textSize before UI CSS. Turnover: reference/handoffs/engine-core.md section 0h (a6c596f9).

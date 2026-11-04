# w1-rhythm notes (helper, branch w1-rhythm; lead session_019iachLiuwNTAZUBSJWUmR3)

## Contract (restated 2026-11-04)
1. Step 1, due ~2:15 PM ET: `src/game/beatTrace.ts` + tests. BPM, bars of 4 beats, a pattern of beat / off-beat / half-note hits;
   Pokey's real run and jump (physics.ts, engine tick); a surface placed under his feet at each landing (research 11-04 line 597).
   Tests prove: clumsy thumb (15% less air speed, 100 ms late, feet 6-8 px inside), landing on screen at take-off upright and sideways,
   a flat safe 200 px apron at each node's entrance and exit with a checkpoint at the entrance. Propose World 1's tempo.
2. Step 2, due ~2:45 PM ET, BEFORE wiring: plan for 1-2 and 1-5 to the lead: map shape each (different from each other and from 1-1,
   1-3, 1-4), 6-8 nodes on the research's tension curve (intro 1/2.5 s, ramp 1/1.2 s, spike, rest + Dot line, counter-melody pair,
   climax, cool-down), per node pacing tag / mechanic pair / BPM + pattern / exact pieces and art (existing World 1 art only, no HF), the
   collectible teased from a rest; 1-5 = follow Meeca's trail. One-page table + top-down still per stage.
3. Step 3, due ~5:30 PM ET: build it. No fillTo in either; 2-5 min first-timer Normal, never under 2 min skilled; Easy gentler; fun gate
   counts for 1-2 and 1-5 fall (funknown.json lowered); first-timer runs marked "old bot"; stills upright + sideways; botrec in order
   1-1/1-2/1-3 and 1-4/1-5/1-6; the full CLAUDE.md checks in order; Polish check with stills.
Files: mine = beatTrace.ts and the 1-2 / 1-5 builders. Not mine: engine.ts (w8-rope2), tools/inspect/firsttimer.ts (bot-fix).
Merge origin/ccr-0d59a91c-oy3imz before starting and before every push.

## Log
- 12:43 PM ET start. Branch from origin/ccr-0d59a91c-oy3imz (3342b2cf base at start). node_modules missing in the container:
  `npm install --legacy-peer-deps` as CI does (package-lock not committed; removed after install).
- Facts checked in code: engine sim slices 1/60 (engine.ts STEP) but realPlay steps whole 1/30 frames (update(DT)); the pad is read once a
  frame. Jump: vy = -jumpV, cut to -cutV on release, 0.72 gravity near the top while held (engine.ts ~2180-2230). Walls are only solid
  platforms 50 px or taller (engine.ts ~2268): a branch is never a face. Camera's landing framing: cameraFollow.ts AHEAD/showBoth.
- Measured (beatTrace.test.ts): engine vs tracer landing, run from rest then full speed, 3-5 (no early-stage assist):
  jump 0: 184.2 vs 185.1; jump +60: 147.4 vs 155.9; jump -100: 211.6 vs 218.4; hop 0: 110.5 vs 108.6; hop +30: 82.6 vs 87.4;
  double 0: 285.3 vs 297.7; +60: 266.8 vs 277.5; -100: 313.2 vs 327.8 (tracer at 1/60). At 1/30 the tracer is within 9.3 px: SLOP = 10.
- Tracer limits found: a flat single-jump gap comes out at ~104 px (the game's own take-off slack, 70 px, is the binding try: the
  level check's 175 x 0.97 - 70 = 99.75 agrees); a flat hop leaves no gap (refused); a face (stump/bank) rise up to 70 px Normal,
  42 Easy; a branch rise up to 90 both. Doubles cross ~200 px.
- Tempo proposal: World 1 home 92 BPM; 1-2 at 88, 1-5 at 96. A full jump is in the air 0.650 s and a beat at 92 is 0.652 s: a jump on
  the beat lands on the next beat. Hop ~0.44 s (two-thirds of a beat), double ~1.05 s (fills a half-note). Note the research gives
  World 2 two tempos (85 at line 524, 90 at line 597): World 2 will need to sit above World 1 when it is rebuilt.
- 1:00 PM ET lead scope update read (5 messages): 1-1 to 1-5 rebuilt tonight; BPM from the stage's music (stageMusic + themeById), not
  typed; avoided lines + hazard spots + dead walks in the API; the same gap 4 times refused; plans by ~3:00, build by ~6:30.
  W1_BPM proposal withdrawn (the lead's call: the beat is the music's beat).
- FACT (App.tsx 275-278): musicSalt is random each session, and stageMusic(…, salt) picks a different piece: 1-2 plays at 128.2 / 132.8 /
  137.0 / 131.4 / 128.2 / 128.3 / 133.9 / 130.8 BPM over salts 0,1,2,3,12345,99999,777777,31337; 1-5 at 136.0-138.0. stageBpm uses
  salt 0. To make the heard beat match the built one, the music's tempo has to lock to stageBpm (audio, not my files): asked the lead.
- 2:24-2:59 PM ET (lead's rulings 1-5 read at 2:24):
  - Cherry-picked w8-rope2's validator commit (rhythm-token repeats, proto.bpm). Dropped its N/O/Y letter fixture row: that letter map
    isn't on the lead branch yet. 1-2/1-5 pass bpm. 1-2 normal "repeat" is gone on all 16 layouts.
  - Lead-branch merge brought w1Pits.ts: an unmarked floorless gap in World 1 paints as WATER. Every 1-2/1-5 floor gap was water, and
    there were 27-37 px slits. Floor pieces are now pit:'drop', and slits under 40 px are closed (the lower piece reaches under). Test:
    16 rolls, Normal and Easy.
  - Template repeat (variety.ts): 1-2's two climax halves rolled the same bars on 3 of 32. The second half now never repeats the first.
    Test over 16 rolls in both stages.
  - Ruling 2, a bite on the bough leg:
    - Thorns: none in World 1. They'd need engine.ts and HF art, so not tonight.
    - Rotten wood, taught over the canopy's base bough. Then rotten bough stretches with fallZones (w1-rhythm-b's hook). The fall is a
      heart and back on Normal, free on Easy, and never a landing on the floor leg.
    - Dot: hint.1-2.rotten (needs Matt).
  - DEFECT (mine, this morning): I called 1-5's crate-looking snap twigs "the existing crumble art". In fact any crumbleAfter piece draws
    as World 7's ruin slab (protoArt). 5 Whys: I judged the look from a still without asking why a World 1 twig looked like a crate. The
    art routes by crumbleAfter (a World 7 field), and nothing tests a world's art per piece.
    Countermeasure:
    - 1-2/1-5 use Platform.creak (merged origin/w1-rhythm-b).
    - The creak frame shows at rest.
    - stage15 test: twigs carry creak, never crumbleAfter.
    - Rule for myself: any piece that looks wrong for its world gets traced to its draw path before I name it.
  - DEFECT (mine): I typed a message time ("3:02") instead of checking it. It was about 2:50. Countermeasure: `date` in the same step as
    every message.

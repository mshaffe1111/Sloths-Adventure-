# Reach: what Pokey really does at 30 fps (R-165.60, flown 2026-11-09)

**Source of every number here:** `reference/specs/sims/flight.ts`, which flies the real engine (`src/game/engine.ts` through
`realPlay.ts`, one `update(1/30)` per frame) on stage 1-1, seed 1, in a bare world, with the game's own `InputEngine` on the controls.
Saved runs: `reference/specs/sims/out/normal.txt`, `easy.txt`, `normal-25fps-apex.txt`, and the double with Jump held in `normal-ddist-with-hold.txt`, `easy-ddist-with-hold.txt`.

**One command per setting (about 2 minutes):** `npx tsx reference/specs/sims/flight.ts normal all` (or `easy`). One table:
replace `all` with `consts`, `apex`, `rise`, `rshare`, `dist`, `ddist`, `bdist`, `touch` or `harness`.

**Tolerance:** rises and single-jump gaps ±2 px (1 px search, take-off spots 0.5 px apart); double-jump gaps ±3 px (spots 2.4 px
apart, second press every 1-2 frames). Shares are of the tries listed in each table, not of players.

**Scope:** stage 1-1 on Normal and any stage on Easy (the early-stage help is full on both: `assistNow() = 1`). Normal from stage 25
(no help: second jump 540 not 604.8, stand 11.4 px not 15.8) was NOT flown.

## 1. The words
- **hold**: Jump kept down. **flick**: a touch flick, lifted at once; the input holds it 220 ms (`MIN_TOUCH_JUMP_HOLD_MS`).
  **tap**: the Pad's Jump button tapped; the input holds it 80 ms (`PAD_HOP_MS`), so it is a hop.
- **block**: a solid piece 50 px or taller (a bank, a stone). **thin**: under 50 px (a log, a bough).
- **climbs**: ends standing on the top. Higher than the apex, because the engine lifts him on: 26 px at a block's lip
  (`FORGIVE.mantle`, engine.ts:2295) and 20 px onto any top his falling feet are just under (`catchDrop` 14 + 6, engine.ts:2382).

## 2. Flown reach (Normal 1-1 and Easy are the same unless two figures are given)

| Move | Apex of his feet over the floor | Highest top he climbs: block / thin | Widest level gap, lip to lip (block far side): from 70 px before the lip / from the last ground frame / any timing |
|---|---|---|---|
| Single, hold | 97.8 | 123 / 117 | N 137 / 223 / 244 · E 141 / 227 / 246 (the Critic's finer flight found 246 on Normal too: design to 246) |
| Single, flick | 97.2 | 123 / 117 | N 128 / 213 / 239 · E 132 / 217 / 243 |
| Single, Pad tap | 61.7 | 87 / 81 | N 77 / 163 / 184 |
| Double, hold | 189.0 (second press 2 frames after the first; 180.8 at worst, 2-12 frames) | 214 / 208 | N 292 / 379 / 409 · E 296 / 383 / 411 (the Critic's finer flight: 408 / 412) |
| Double, flick | 187.0 (172.7 at worst) | 212 / 206 | N 283 / 370 / 396 · E 287 / 374 / 400 |
| Double, Pad tap,tap | 124.4 (73.5 at worst) | 150 / 144 | N 191 / 278 / 299 · E 195 / 282 / 299 |
| Bounce (floor mushroom, cap 30 px up) | 197.6 over the floor = 167.6 over the cap (198.1 with Jump held) | 223 / 217 over the floor | N 179 · E 183 (mushroom at the lip; 20 px less per 20 px it stands back) |
| Bounce + air jump | 289.1 over the floor = 259.1 over the cap | 317 / 309 over the floor | 340 (mushroom at the lip, best moment) |

"Any timing" for one press includes the 6 coyote frames (0.214 s Normal 1-1, 0.248 s Easy) and, after them, the air jump the same
press still fires. At 25 fps (one 40 ms step per frame) the apexes drop about 3 px: single 95.4, double 185.7, bounce 194.8,
bounce + air jump 285.6.

## 3. The readings (packet: gaps.py L, k and the three far-side rule sets), settled by the engine
- **L, how far his centre may pass the lip and still stand:** 44 x (0.26 + 0.10) = **15.8 px** on 1-1 and on Easy (engine.ts:2381).
  That is gaps.py's L = 15.8. L = 0 and L = 22 are not the engine.
- **k, airborne frames before the jump registers:** by the engine's timer, 6 frames on Normal 1-1 (coyote 0.133 + 0.08 s) and 7 on
  Easy (0.167 + 0.08 s). The frame count was not flown on its own: a later press still fires the air jump, and "any timing" in §2
  covers both. At full run each late frame is worth about 9.5 px (285 px/s); the flown span from the last ground frame to the best
  late press is 223 to 244.
- **Far side:** the real rule is the **generous** kind, with the engine's own figures, not gaps.py's. A falling foot lands when his
  centre is within 15.8 + `landPx` (8 Normal, 12 Easy) = **23.8 / 27.8 px** of the edge (gaps.py took 22 + 8 = 30) and his feet were
  no more than 20 px under the top; a block also hoists him from up to 26 px under its top (thin pieces: no hoist). "Medium" and
  "strict" are not the engine. Flown block against thin: 0-6 px apart on gaps, 6 px on rises.

## 4. The builder's constants against the flight

| Constant (file) | Builder | Flown | Verdict |
|---|---|---|---|
| `JUMP_RISE` (physics.ts) | 107.8 | apex 97.8 | **Wrong as an apex: 10.0 too high** (closed form; the game steps). As "the highest top he climbs" it is 15 too LOW (123 block) |
| `DOUBLE_RISE` (physics.ts) | 184.5 | apex 189.0 hold, 187.0 flick; climbs 214 / 212 | On 1-1 and Easy: 4.5 too low as an apex (the +12% second jump), 28-30 too low as a climb. Stage 25 Normal: not flown |
| `BOUNCE_REACH` (pipeline.ts), over the cap | 258.0 | 259.1 with the air jump; the bounce's own part 167.6 against 181.3 | **Bounce alone 13.7 too high**; the sum is right within 1.1 only because the +12% second jump pays it back (1-1 and Easy) |
| `reachJump(0, single)` | 174.7 | widest gap 244 (N), 246 (E); 223 from the last ground frame; 208 with his centre at the lip | **Short by 33 to 69 px**, by reading |
| `reachJump(0, double)` | 313.2 | hold 409 (N), 411 (E); flick 396 / 400; flick from the last ground frame 370 | **Short by 57 to 98 px** (57 to 95 on the Critic's 408) |
| `maxGap(0, single)` Normal / Easy | 143.3 / 113.6 | a flick from 70 px before the lip crosses 128 / 132 | Easy **confirmed** (18 px spare). Normal: needs the take-off within 55 px of the lip, not 70: **15 px over its own slack claim** |
| `maxGap(0, double)` Normal / Easy | 229.8 / 203.6 | a double flick from 70 px before the lip crosses 283 / 287 | Safe, but **below the single's 244**: every double gap it can lay is a gap one jump crosses |
| `riseLimit` single, laid x0.9: Normal / Easy | 79.5 / 63.0 | single climbs 123 block, 117 thin; a Pad tap 87 | **Confirmed** as a safe single rise |
| `riseLimit` double, laid x0.95: Normal / Easy | 143.7 / 113.9 | single climbs 123; double flick 212 | Normal **confirmed**. Easy **wrong by at least 14 px**: 113.9 is under the single's 123, so on Easy no "double" rise needs the double (bands.md needs 128-132) |
| `LAND_HALF` (physics.ts) | 21 | 23.8 Normal, 27.8 Easy (falling onto it); 15.8 standing | Off by 3 to 7 px |
| `TAKEOFF_SLACK` | 70 | see `maxGap` single | Holds on Easy, 15 px short on Normal |

The 11-07 outside review said: single about +10 px, bounce about +14 px too high, distance 20-50 px short. Flown: **+10.0, +13.7, and
33-69 px short** (57-98 for the double). The review stands; the distance gap is wider than it said.

## 5. The harness, proved first (packet: "prove the harness before you trust it")
`flight.ts harness` flies realPlay's `FakeInput` beside the game's `InputEngine`:
- **The press keep makes no difference in flight.** FakeInput keeps a press 0.160 s; the game 0.167 s (Normal) or 0.233 s (Easy).
  The engine uses or buffers a press on the frame it reads it (engine.ts:2192-2223), and its own buffer does the rest: a press up to
  5 frames (Normal) or 8 frames (Easy) before landing still jumps, the same with either input. Widest single: 244 / 244 px.
- **The minimum hold is the real difference.** FakeInput has none: a one-frame press rises 29.6 px. The game holds a flick 220 ms
  (97.2 px) and a Pad tap 80 ms (61.7 px). So any realPlay test that "taps" with `press` alone flies a hop no player can make.
- **The setting.** `RealPlay` takes none; `setDifficulty('easy')` before `new RealPlay(...)` sets it (the engine reads `isEasy()` in
  its constructor). flight.ts does this from its first argument.

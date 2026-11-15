# R-165.228: is 1-1 the hardest of World 1? The table first (POLISH-5, 12:44 AM ET 11-14, head 556ec00 + 1-2/1-3 relists; nothing changed in 1-1 yet)
Geometry: each stage's first 40 listed layouts, both settings, built as the game builds them (RealPlay). Measure: the relay test's own
rules copied read-only (w1.relay.test.ts:119 gapsOf, :78 risesOf): a double gap = a level gap over 246 px (one jump's reach); a rise over
the climb = a top over 117/123 px above where he takes off, no mushroom. Median (min-max) per layout. Tool: scratchpad measure.mts.
| Stage | Setting | Double gaps | of them unfloored tests | Rises over one jump | Widest level gap px |
|---|---|---|---|---|---|
| **1-1** | Normal | **2 (2-6)** | 1 (1-2) | **3 (1-4)** | **255 (253-256)** |
| **1-1** | Easy | 0 | 0 | **3 (1-4)** | 97 (87-113) |
| 1-2 | Normal | 0 | 0 | 0 | 128 (109-138) |
| 1-2 | Easy | 0 | 0 | 0 | 102 (70-110) |
| 1-3 | both | 1 (1-1) | 0 | 0 | 468 (460-479; floored, one) |
| 1-4 | Normal / Easy | 0 | 0 | 18 / 19 (a climb stage: its rises are vine/limb steps) | 0 |
| 1-5 | Normal | 0 | 0 | 5 (4-7) | 143 (141-143) |
| 1-5 | Easy | 0 | 0 | 5 (5-7) | 113 (110-113) |

Bots: castBots (tools/inspect/castBots.ts, the real engine), layouts 1-10 each, both settings. Pass = shrine with the goal full, no rescue.
| Stage | first-timer kid N / E | first-timer adult N / E | child N / E median s | middle N / E median s | expert N median s |
|---|---|---|---|---|---|
| **1-1** | **0/10 / 0/10 (every run stuck and put on 1-3 times: a bot "rescue", firsttimer.ts:2060)** | **0/10 / 0/10 (every run stuck and put on 1-3 times: a bot "rescue", firsttimer.ts:2060)** | **482 / 329** (9/10, 9/10) | 216 / 209 | 192 |
| 1-2 | 10/10 / 10/10 | 10/10 / 10/10 | 362 (7/10) / 239 | 165 / 162 | 143 |
| 1-3 | 10/10 / 10/10 | 10/10 / 10/10 | 455 / 309 | 231 / 209 | 196 |
| 1-4 | 6/10 / 8/10 | 10/10 / 9/10 | 255 (6/10) / 207 (4/10) | 173 / 130 | 277 |
| 1-5 | 9/10 / 10/10 | 9/10 / 10/10 | 394 / 275 | 194 / 180 | 168 |
**Read:** Matt is right. 1-1 is the only stage where both first-timer bots need a rescue on every run, on both settings; the child bot is
slowest there (482 s); it alone asks double gaps on Normal (2, up to 6) AND rises over one jump on both settings (3, up to 4; Easy too).
The lever: Normal keeps ONE double test (w1.relay "(a) teach first" needs at least one, after its practice gap); cut the extra double gaps
and the rises over the climb (a stair or a mushroom where a rise stays), then re-measure until 1-1 is the gentlest row above.
Logs: castBots full output and the geometry lines are in POLISH-5's REPORT gates/ folder when the item is done.

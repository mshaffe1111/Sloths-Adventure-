# ENG-24e line (t-eng-24e): the river TAIL on 2-4, the tail liana, the drawn end

ENG-24e's and ENG-24f's own write-ups are in reference/handoffs/engine-core.md §0zq-24e and §0zq-24f (the tail, the drawn end, the
lead's ruling of 11-19 9:12 PM ET). This file holds ENG-24g's section; INT-14 merges t-eng-24e.

## ENG-24g (11-20; packet reference/packets/2026-11-20/ENG-24g.md): the bot catches a liana over the tail; OVER_TAIL 90; castBots PASS

Base: t-eng-24e 4c34eb81 (ENG-24f's final). Evidence: reference/qa-reports/ENG-24e/g/.

### 1. The trace (before any fix): what the bot actually did

castBots 2-4 on 6040e41c (ENG-24f, cast24f.txt) failed Normal: child 4/40, middle 1/40, expert 4/40, nearly all `time goal 0/1`.
Three of those runs, traced frame by frame on 4c34eb81 (g/trace24.mts, g/trace24g.txt): child, middle and expert seed 2 Normal.

- All three cleared beats 1-3, then at beat 4 (river 10155-10893, its tail 430, the liana at 11003, 110 px past the logs' end)
  boarded a log, rode it to x ~10894 (where the logs go under), dropped with it into the safe river, were set back on the near bank,
  and boarded the next log: again and again, ~1100 s, to the 1200 s cap. No jump was ever made for the liana; no life lost.
- Why: firsttimer.ts `vineFromLog` looked for a liana only over the logs' window (`q.x < d.x1`). A liana hung past where the logs go
  under (over the tail, up to `riverEnd(d)`) was invisible to it. ENG-24f's guess was right.

### 2. The fix (the bot's only, never the data or the judge) and the plant (level.md rule 21)

- `SKILLS.vineOverTail` (firsttimer.ts): `vineFromLog` looks for a liana over the river's whole water (`riverEnd(d)`); on a tailed
  river it takes off only short of the painted end (`x <= d.x1 - 10`: past it the log is under, no floor, engine.ts drift loop); a
  liana over the tail is never "the one he just left" (no let-go from it lands on a log: a log under it means a let-go that fell
  short). Untailed rivers: unchanged (`riverEnd(d) === d.x1` with no tail; the take-off and retry clauses need a tail).
- The toy: lianaRiverToys.ts `tail` (World 2's `twin` + a 430 px tail, DEEP; its one liana 90 px past where the logs go under,
  340 long: 2-4's beat 4 on Normal). The test asserts the case first: a tailed river, the liana over the tail (past `x1`, before the
  far bank), no liana over the logs' window, and the judge's own reach (`riverLay.ts logCatches`: a jump off a log catches it).
- PLANTED, tools/inspect/lianaRide.test.ts 'A VINE OVER THE TAIL' (CI: gates.yml's engine tools' tests), child/middle/expert x
  variants 1-5, Normal, the real InputEngine:
  - GREEN with the skill: 15/15 to the shrine, 0 rescues, each caught the liana off a log (12 lives in all) (g/plant24g-green.txt);
  - RED on the old reach (the bot's lines reverted to `q.x < d.x1`, the toy at its first 110): 13/15 rescued, 139 lives,
    the test's "with the skill" line FAILS (g/plant24g-red.txt). The test's own PLANTED half (the skill off) asserts >= 12 of 15
    rescued.

### 3. castBots before / after (2-4 seeds 1-40, 5 bots, both settings, the gate's own input: FakeInput)

| run | child N | middle N | expert N | child E | middle E | kid N | adult N |
|---|---|---|---|---|---|---|---|
| ENG-24f 6040e41c (cast24f.txt) | 4/40 | 1/40 | 4/40 | 40/40 | 40/40 | 21/40 | 9/40 |
| ENG-24g d9b0854c, OVER_TAIL 110 (g/cast24g.txt) | 38/40 | 40/40 | 40/40 | 40/40 | 40/40 | 22/40 | 36/40 |
| OVER_TAIL 90, before the retry (g/cast24g90.txt) | 38/40 | 40/40 | 40/40 | 40/40 | 40/40 | 30/40 | 38/40 |
| **bc8c896c: OVER_TAIL 90 + the retry (g/cast24g90b.txt)** | **40/40** | **40/40** | **40/40** | **40/40** | **40/40** | 30/40 | 38/40 |

(kid and adult, the first-timers, are printed, not the bar; kid Easy 39/40, adult Easy 40/40 throughout. `--input touch`, the phone's
own minimum hold, at OVER_TAIL 110: child/middle/expert 40/40 both settings, g/cast24g-touch.txt; context only, never the gate.)

**The child's misses at 110, traced (a design finding, the lead's ruling B):** seeds 14 and 19 rode beat 4's logs to the cap. From a
log, a jump catches the tail liana only from the last 45 px of the logs' window at the child's own hold: 2.9% of (take-off x, swing
moment) pairs; middle/expert 11.4% from the last 85 px; a run on the log reaches 4.3% (g/window24.mts). `logCatches` passes because
it asks only that SOME take-off catches. The lever is boxed in: the tail >= 418-423 px (no log-only crossing, rideAcross), FAR lands
a let-go <= 360 px past the anchor. The lead (9:45 AM ET): OVER_TAIL 90 (child 5.1% / 5.2% from the last 65 px; FAR 20 px spare).

**The child's misses at 90 (seeds 8, 29), traced (g/trace24g-retry.txt):** seed 8 caught the liana off a log at 112.3 s; the
let-go can fire only after 1 s on the vine (World 1's tester-calibrated `swingT > 1`, untouched), so it fired at the swing's dead
end (a 0.99, om 0.15) and his 0.144 s press lag put the leap on the back swing: into the tail ~200 px short. From then on `swungOn`
("never the one he just left") never expired: `vineFromLog` never aimed at that liana again, to the 1200 s cap. A bot fault, fixed
under the same skill (a liana over the tail is never "just left"). Seeds 8 / 29 after: shrine 333 / 342 s.

### 4. The data (w2Arc24.ts) and what holds it

- `OVER_TAIL` 110 -> 90 (the lead's ruling B, 11-20 9:45 AM ET); `TAIL_24` 430 unchanged; Easy rows unchanged (no tail).
- Relist 2-4: 100 of 100 kept, the quiet line <= 4 s on all 100, the list file byte-identical (g/relist24g.txt).
- rideAcross24 s1/s2 (g/rideAcross24g.txt): Normal beats 4 and 6 never crossed on a log alone; Easy crossed (no tail, the ruling).
- The judge: every listed seed builds clean on both settings (the relist); river / 2-4 test files 40/40 (g/rivertests24g.txt:
  riverTail, lianaRiver, w2Arc24, w2Stages, judgedTable, riverRaft); bot test files 46/46 (g/bottests24g.txt: lianaRide, riverRide,
  firsttimer, castBots).

### 5. Gate table (the joint head, ENG-24h merged)

(filled in on the joint head)

### Polish check

No drawing changed on this line in ENG-24g (the bot, the toy, one data constant). The liana moved 20 px nearer the reeds on beats 4
and 6 (Normal): the lead judges the stills of the moved liana from ENG-24h's joint-head shots (2c + the clip, draw only).

### Learned (for the next builder)

- A bot skill written for one placement ("a liana over the logs") silently refuses the next placement ("over the tail"): when the
  judge gains a case (tailLianaFaults, levelCheck 3a'), the bot's matching skill is checked against the same case with a planted toy
  the same day. Proposed for level.md rule 21: "a new JUDGE case is a new mechanic: its bot toy comes with it."
- `logCatches`-style "some take-off catches" reach checks hide how thin a window is: report the share (as the drop judge does) when
  a beat is laid on one. Proposed: tailLianaFaults also reports the stand-jump catch share from a log for the child's hold, and the
  lead sets its floor.
- Trace before fixing: both rounds of child misses were different causes (a thin window; then a memory that never expired).

### Lessons applied

D15 (test the measuring tool before trusting it: the bot was traced and planted before castBots was believed); D19 (the gate calls
the same code: castBots on its own default input, the touch run kept as context only); level.md rules 21 and 28 (the toy first, RED
and GREEN; every miss traced before it was fixed); law 22 (no judge or gate changed; the data moved only on the lead's ruling).

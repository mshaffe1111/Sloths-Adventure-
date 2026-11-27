# ENG-STONE29: the wide snap stone (130 px) with its own flown band (R-165.490)

**EXACT NEXT STEP:** the CI tool line PASSED on a6ac7316b; lockall --check and the 6 suite shards are running on its frozen worktree. When they end:
record each total in §1b, commit, push, ls-remote, and send the lead the landing hash, the band, the stills (stills/, shot) and each
shard's totals (lead only; BUILD-29-c handed over). KID_RUNS_59 (firstTimerBot.test.ts) is the release line's inherited red: name it.

Base: t-eng-29 098047713 (ENG-29-e's barge/guard/drum on t-eng-29-wip untouched). Code candidate: a6ac7316b (gates below are of it).

## 1. Done-items

**The measurement (rule 24, on the real engine).** `tools/engine/snapBand.ts` (new): engine.ts at 30 fps (realPlay) with the game's own
InputEngine (Pad source, a tap's 80 ms hold), rows of 1, 3 and 5 stones level with the banks, both settings. Two ways across, both a tap hop:
HOP (2-5's snapClock.ts rig: a tap on each landing, d 0/2/4) and BEAT (BUILD-29's court29.ts RUN: right held, a tap on every count). New
read: IN STEP WITH THE BAR (he stands on stone i only between his landing and the tap on count i+1: one stone a count). Output:
reference/qa-reports/ENG-STONE29/flown/snapBand-*.txt.
- 80 px control: HOP never swims at 20-50 px on either setting (2-5's flown 30-40 inside it; snapClock.ts read 60 a swim at d4: so does
  this rig, `HOP W80 G 60: not clean (n3 d4 swam ...)`). The 80 px band is unchanged.
- 130 px: HOP is not its way (at 40+ px his second hop lands short). BEAT is. Below the band his feet bridge the water and he runs stone
  to stone OFF the beat (Normal G30: stone 1 frames 34-39, stone 2 from 40: two stones in one count). The band is a PACE:
  `(130 + water) / count` = **258-281 px/s**, the frames in step at every count flown 0.65-0.87 s, Normal and Easy (sweep, 1 px steps):

| count here (s) | in step at water (px) | pace (px/s) |
|---|---|---|
| 0.65 N | 38-60 | 258-292 |
| 0.6947 E | 47-73 | 255-292 |
| 0.70 N | 49-73 | 256-290 |
| 0.7125 N (2-9's court) | 49, 51-75 | 251-288 |
| 0.75 N | 54, 56-85 | 245-287 |
| 0.7526 E | 60-86 | 252-287 |
| 0.80 N | 71-100 | 251-288 |
| 0.8105 E | 74-104 | 252-289 |
| 0.825 E (2-9's court) | 78-104 | 252-284 |
| 0.85 N | 84-109 | 252-281 |
| 0.8684 E | 89-121 | 252-289 |
| 0.90 N / 0.926 E | 98-116 / 105-121 | 253-273 / 254-271 (narrowing) |
| 0.984 E, 1.04 E | none | none |

  (0.60 N reads 262-302: its floor is the one count under 258.) So SNAP_WIDE.count is 0.65-0.87 s and the pace 258-281.
- **Lay numbers for BUILD-29 (fly before use):** Normal (0.7125 s) **130 + 62** (band 54-70); Easy (0.825 s) **130 + 92** (band 83-102).
  **Easy 130 + 50 is OFF the beat** (two stones in one count): Easy needs its own water (an Easy twin row).

**The judge's model (snapBeat, new in rideLay.ts):** stone i stood from the hop's landing after the tap on count i to the tap on count i+1
(the flight's own tap rounding). It matches the flights count for count: BUILD-29-b's Normal 130+60 (in step x2 [12--] 41%, x3 [1---] 16%, x5
0%, the wave x5 [12--] 65%) and this flight's Easy 130+90 (x2 [12--] 39%, x3 [1---] 14%, the wave x5 [12--] 63%). It also reads how far off
the beat the best count's tap may be: 2 in step ONE 13 frames early / 21 late; the wave of 5 TWO 34 / 21; **3 in step ONE 13 early / 0 late**.

**The lead's ruling (A)** on that read: the wide stone is judged by SLACK, 0.2 s (6 frames) early AND late on each setting; the pace band per
setting from the row's own count; 80 px unchanged.

**The piece (rideLay.ts):** `PadRow.snap.w` (80 or 130; 80 when absent); `SNAP_WIDE = { w 130, pace [258, 281], count [0.65, 0.87], air
13/30, inStep 3, slack 0.2 }`; `SNAP_WIDTHS = [80, 130]`; layPads lays the row's width and throws on any other ("a 100 px snap stone; the
flown stones are 80 and 130 px"). snapFaults judges each width by its own band: 80 exactly as before (30-40, inStep 3, window 0.9, Easy never
under Normal); 130 by the pace on the setting judged (Normal and an unset call on Normal's count, an Easy build on Easy's), the count range,
one width a run, inStep 3, a wave ahead only, and the slack on Normal and Easy. Any other width refused by name ("100 px wide, not the flown
80 or 130"). No stage id, seed or x in engine code (generalitycheck PASS).

**Toys each way (src/game/gen2/snapRow.test.ts, 17 tests, all pass):**
- the model against both flights, count for count (above);
- laid: 130 px wide at a pitch of 192; another width throws; SNAP_LAY.w 80 and SNAP_FAIR.gap 30-40 unchanged;
- PASS: Normal the wave of 5 at 130 + 54 / 62 / 70 and 2 in step at 62; Easy the wave of 5 at 83 / 92 / 102 and 2 in step at 92; the
  counts: the wave of 5 [12--] (ONE or TWO), 3 in step [1---];
- REFUSED by name: 130 + 30 ("a pitch of 160 px over a 0.7125 s count is 225 px/s, not 258-281 (one stone a count)"); 130 + 90 on Normal
  (309 px/s: he swims); Normal's 62 on Easy's count (233 px/s); a 0.5 s count ("outside the flown 0.65-0.87 s"); 4 in step; 100 px wide; a
  run mixing 80 and 130; 3 in step on Normal and on Easy ("safe on [1---], and its best tap may be only 13 frames early and 0 frames late,
  under 6 frames (0.2 s) each way");
- 80 px: 30 still passes; 60 still refused ("60 px of water ... not 30-40").

GATES (frozen worktree of a6ac7316b, `git status` empty after): see §1b.

## 1b. Gates (all on a chattr-frozen worktree of a6ac7316b; `git status` empty after each)
- tsc: clean. generalitycheck: PASS (71 engine files, 26 literals, 26 known). snapRow.test.ts: 17/17.
- The CI tool line (gates.yml line 157): 427 tests, 426 pass, 0 fail, 1 todo (chase bots ENG-B4, a standing TODO), exit 0.
- lockall --layouts 16 --check against a record of 098047713 (3,264 builds of 102 stages): "lock: 102/102 stages unchanged", exit 0 (2-5 among them: its 80 px stones untouched).
- The suite, 6 shards round robin (the CLAUDE.md glob, 657 files): (running)
- drawcheck: not run; no new draw path (the snap stone's own drawer, scaled by width as before).

## 2. Polish check
Stills at 2x (deviceScaleFactor 2), a REAL engine frame: 2-5 on the designed roll, its widest snap pond re-laid at run time as the wide stone
(130 px, 62 px of water: the court's Normal pitch of 192; the pond holds 2), Pokey pinned by his feet. Script: stills/still.mjs.
- stills/wide-sideways-on-stone.jpg (844x390): Pokey standing on the wide stone; its top level with both banks, its jaw drawn open (the
  count's frame), the second stone beside it. The stone is about 1.5x his width and reads as a floor he stands on. Good.
- stills/wide-upright-bank.jpg (390x844): Pokey on the bank beside the wide stone on the water: the scale at a glance. Good.
- stills/wide-upright-on-stone.jpg: Pokey is on the stone but faded: the pinned stone bit him and he is blinking through his safe spell (the
  pin keeps him on it through count 4). Real play state, not a draw fault; the bank still is the clean upright view.
- stills/wide-sideways-bank.jpg: the bank, sideways.
- Fixed on the way: the first two takes were unusable (the goal card over the pond; Pokey pinned a body height in the air, because p.y is
  his feet, as realPlay.stand sets it). Both fixed in the script; these are the third take.
- ART: REUSE holds. snapStoneArt.ts scales the painted sheet by width (SNAP_DRAW_W 1.08, height in proportion: drawn 140 x 82 at 130), so
  the 130 stone is the same painting larger, never stretched; its mossy lid, seam and jaw read the same. No new draw path (drawcheck not
  required by the packet's rule; no art lane needed). If the lead wants a longer, lower stone rather than a bigger one, that is an art
  lane piece: 'w2-snapstone-wide', 5 frames like the 80's, about 260 x 140 per frame.

## 3. Pushback
- The packet's "130 at the measured band keeps the design's counts (in-step 3 safe only from ONE)": the flight says 3 in step on the wide
  stone is safe only on ONE with 0 frames late, so a child a frame behind the drum is bitten. Raised before building; the lead ruled (A):
  refused by the slack, beat 5 goes to 2 in step (the lead's design call).
- BUILD-29's Easy 130 + 50 is off the beat; the court's Easy row needs about 92.
- A gap band alone cannot judge the wide stone: its band moves with the bar's count (one stone a count). The judge reads the pace.

## 4. Suggestions
- (art, optional) a wide sheet only if the lead wants the 130 stone lower than in proportion (§2).
- (BUILD-29) fly 130 + 62 Normal / 130 + 92 Easy in the court before use; beat 5 to 2 in step (the lead's ruling).

## 5. Unresolved
- The stills are a run-time re-lay of 2-5's pond, not a built stage holding the wide stone (no stage lays one yet: 2-9 will).
- BUILD-29 still flies 130 + 62 / 130 + 92 in the court before use.

## 6. Method update
- level.md / STAGE-RULES: a stone crossed on the beat is judged by its PACE (pitch over the count) and by the SLACK of its best count, not by
  a fixed gap or a window to leave the bank. Fly the band over the counts it will be used at, both settings, in 1 px steps.

## 7. Turnover note
reference/handoffs/engine-core.md §0zs-STONE29 (the commit after this REPORT's gates).

Lessons applied: D115 (every run on a chattr-frozen worktree), D128 (stamps from `date`), D134 (next step pushed and ls-remote checked
before any hand-over), D138 (no new work past a hand-over), D140 (ReadNotifications at each step), D141/CI #93 (the CI tool line on every
candidate). A slip: candidate 1's commit took its message from a heredoc on the commit line itself (D119 says no heredoc in a commit
chain); it committed whole, and candidate 2 on took the message from a file.

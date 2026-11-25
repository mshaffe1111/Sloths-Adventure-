# DATA-1125: the 11-24 afternoon tester runs read against the bots on the players' own layouts (R-165.421, R-165.422)
Branch t-data-1125 (carries DATA-1124/1124b's files forward; that branch is not on main). Data analyst, DATA-DAILY packet. Start 8:56 AM
ET 11-25. Lessons applied: a label is what the game BUILT, not what was asked (LESSONS:85; here the castBots variant), window found from
column F alone, sums checked against report.py's own totals, P-numbers only, castBots on the build the players had (lists checked by
hash), one player's runs never counted as many players.

## 0. A method defect found first: every earlier castBots comparison ran the NEIGHBOURING layout
castBots/RealPlay take the **0-based index** of the list entry (RealPlay -> setLayoutVariant(v) -> the list's (v+1)-th plan). The runs
log the layout's **gen2 seed**. analyst.md said "the logged `seed n` IS variant n": proven wrong today by building each one
(`RealPlay('1-4', 6).stage.gen2.seed` = 7; `RealPlay('1-4', 5)` = 6). And 24 of 1-4's 100 list entries are re-rolled seeds (plan key
`62405:2`): they look like live rolls but are castable. DATA-1124's "unlisted roll 99738" is **variant 90**, so its "#90" bot runs were
the 99738 layout and its "#28" runs were list seed 29; 1-2 #83, 1-5 #63 and DATA-1124b's casts are each one layout off, and its
"live rolls" (1-4 P36, 1-7, 1-9) may be castable. **Countermeasure (a tool, not a note):** tools/playtesters/variantOf.ts maps
`<stage> <logged seed> [list]` to the castBots variant and proves each answer by building the stage and reading gen2.seed back; it
refuses a list hash that is not the checkout's and says "a live roll" only when the seed is on no plan. Proven on 9 cases (this
window's 6, 99738, 28, and a made-up 12345 -> live roll). analyst.md's rule is corrected. DATA-1124/1124b's bot tables need a re-cast
(EXACT step in §6).

## 1. The window
Sessions rows **5997-6127** (131 rows, 0 unreadable, 5 sessions; report.py: "131 rows read, 0 without readable data, 5 sessions,
2 players"). All build 0.10.2 (F = 2026-11-22T16:43:02-05:00, main cdffdc627). Arrived 11-24 4:44 PM to 5:33 PM ET. **2 players, 6
runs, 2 finishes.** P-numbers from the whole tab's first arrivals (rows 2-5996: 36 keys before the window, unchanged).

| Player | Stage | Setting | Seed (variant) | End | Finish s | Play s | Lives / put-backs / hurts: where |
|---|---|---|---|---|---|---|---|
| P24 (expert) | 1-6 | Normal | 16 (15) | left | - | 15 | opened, left before the first section |
| P24 | 1-6 | Normal | 31 (30) | finish | 236 | 235 | 0 / 4 / 4, all w1-16-chain (x 13,498-15,762) |
| P24 | 1-4 | Normal | 30117 (21) | finish | 183 | 185 | 0 / 0 / 2 (y 4517, y 2466) |
| P27 (child) | 1-4 | Normal | 52 (51) | left | - | 17 | none; left on the start floor, a new run a minute later |
| P27 | 1-4 | Normal | 62405 (53) | **left** | - | **1788** | **3 / 0 / 15, every one a falling kapok pod** (below) |
| P27 | 1-4 | Normal | 6 (5) | **quit** | - | 182 | none; best height y 8520 (bottom fifth) |
Sum: 6 runs = report.py's STAGES lines (6; no 1-1 run). No World 2 run, no stuckHelp, no rescue (players have none).
Surveys (chips only): P24 on 1-4 and 1-6 both fun 5, long "About right", knew "Always". P27 sent none (no survey on leave or quit).
Phones: P24 median 30.0 fps, 1 stall over 100 ms in 7 min. P27 median 30.3 fps, 58 stalls over 100 ms in 33 min of 1-4, 26 of them
draw-bound (d >= 100 ms); P27's sound was off (muted or hidden) on all 374 fps samples, so the pods' tell was read by eye only.

**P27's 30 minutes on 1-4 (variant 53), placed on the rebuilt layout:** best height y 7056; the 15 hurts are the layout's pods
(stage.pods, cost "heart"): 9 at the grown-beat pod over x 430 and 4 at its partner over x 670 (both land on the y 7293 platform,
clock pods-grown: off 1.0 s, warn 1.5 s, on 1.7 s; 4 of the 9 while climbing that pod's own vine), 2 at the steady pod over x 786
(lands y 8159). That pair is **w1-14-under-fire** (the plan's 9th section, job "test", difficulty 6; the only grown pair at that
height), straight after w1-14-pods and w1-14-push with one rest between. All 3 lives were lost there; the child never got above it.
The game's own section line cannot show this: on 1-4 the section ids follow x only (report.py flags it), so every line reads
going-up / rotting / roots.

## 2. Bots vs players on the same layouts (castBots, all five bots, both settings, 54 runs on a worktree at cdffdc627; variants by
variantOf.ts), biggest gap first
1. **1-4 #53, w1-14-under-fire: the child took 13 pod hits and 3 lives in 20+ minutes; no bot takes more than 4 hits there.** Child
   bot Normal: 287 s, 1 hit, 0 lives (fails only on a 20 s rescue at x 1036, "fell back down 8 times"); middle 188 s, 4 hits; expert
   250 s, 4 hits; kid 123 s and adult 122 s, 1 hit each. castBots files every pod hit as `other`, so no bot report can name the pods.
   One player, one layout: P27's pattern (also 2782 s and a 1927 s leave on 1-4 Easy in DATA-1124), not yet a children's pattern.
   **Train:** the child bot's pod timing (it should miss the grown beat at the child's rate), and castBots' hitBy should name `pod`.
2. **The expert bot is worse than the expert player on both of P24's layouts.** 1-4 #21: P24 183 s, 0 lives, 2 hurts, no stop; the
   expert bot fails at 234 s with 4 rescues at x 112-224 ("the way on is 281 px down") and 3 hits. 1-6 #30: P24 236 s, 0 lives; the
   expert bot 260 s and 2 lives to pits. And on P27's quit layout 1-4 #5 the expert bot runs out the 1200 s cap (middle 297 s, child
   259 s). The "way on is down" stop was DATA-1124's gap 2; it holds on the correct layouts. **Train:** the bot's search for a way
   down on a climb; the 1-4 #5 timeout is a bot defect to trace (`--rows`).
3. **1-6 #30, a pit at x 29,128 (w1-16-creaky-landing, far wall 225 px up): the kid bot falls in 3 times and the child bot 8 (rescued,
   642 s, 2 pit lives); P24 crossed it in about 9 s.** No child has played 1-6 Normal yet, so this is bot-only: watch it.

## 3. Calibration (no code)
No 1-1 run in the window, so report.py's touch, jump hold, press-to-lip and steering numbers (measured on 1-1 layouts only) did not
move, and tierBots' 1-1 match is untouched. No World 2 run: nothing on R-165.413 (a kid on moving logs) or R-165.398 (the lip family).
What the window does say for the tiers: the child tier needs a pod-timing error rate (gap 1) before 1-4 Normal can be judged by bots.

## 4. Opportunities (ranked by players affected x severity)
1. **1-4 Normal is where the child gives up: 3 runs, 0 finishes, 1 quit, 2 leaves; 3 lives and 30 minutes at w1-14-under-fire.**
   Candidates for the Designer: under-fire (a test, difficulty 6) comes two sections after the pods are taught, with one rest; a
   checkpoint inside it; the grown beat's tell for a child playing muted (sound off all session); Dot's help after repeated pod hits
   (stuckHelp only watches wall-jumping). 1 player (P27), 3 runs; with DATA-1124's 1-4 Easy runs, 6 child runs on 1-4, 1 finish.
2. **w1-16-chain is where 1-6 Normal costs hearts: 2 of 2 players who played it.** P24 4 put-backs + 4 hurts here (0 elsewhere); P36
   in DATA-1124b 65 s, 4 put-backs, 5 hurts. Both still finished and P24 rated 1-6 fun 5: a hard spot, not yet a quit spot.
3. **Leaving with no rating.** P27's 3 runs ended in 2 leaves and a quit; none sent a survey (DATA-1124b's open item; P27 sent none in
   DATA-1124 either). A one-chip "why did you stop?" on leave would say whether it was the pods, the length or the layout.
4. **The expert likes World 1's middle:** 1-4 and 1-6 both fun 5, "About right", "Always knew" (one player).

## 5. Asked to check
- **1-4's start (R-165.441, the soil column over the start floor):** 4 starts on 0.10.2, no death, no quit and no stall over one
  frame (132-175 ms) at the start; one leave at 17 s on the start floor (P27, seed 52, a new run a minute later; the data cannot say
  why). Every one of the 4 starts logs `blank` at x 140: three picture sheets (w14-fluff, w1m-pod-fall, w14-kapokpod-burst) not yet
  loaded when play began. That is a loading gap, separate from the soil column, which the data cannot see.
- **1-6 Normal's troughs (R-165.440, x ~27,900 and ~46,000):** P24 (#30) crossed x 27,400-28,400 in 3.9 s with no stop or turn-back
  (into the trough at y 841, out over x 27,694), and x 45,500-46,500 in 5.4 s (a short turn-back on the gorge swing, no stop). No
  stall, death or quit at either. One expert run only.

## 6. Hand-over
- Last read row: **6127** (analyst.md updated). Aggregates: tools/playtesters/profiles/window-1125.json (an addendum like 1124/1124b:
  the runs, surveys as chips, phones, and the 54 castBots rows).
- **EXACT NEXT STEP (the re-cast):** in a worktree at cdffdc627 (0.10.2) with `npm install --no-audit --no-fund --legacy-peer-deps`,
  feed DATA-1124/1124b's logged seeds (window-1124.json / window-1124b.json `stage seed list` per run) to
  `npx tsx tools/playtesters/variantOf.ts`, then castBots on the variants it prints (0.10.1 runs on release-0.10.1 4a8c1decd), and
  replace those reports' bot tables; the 1-4 Easy child finding (y 5000-5999) is the one to re-check first.

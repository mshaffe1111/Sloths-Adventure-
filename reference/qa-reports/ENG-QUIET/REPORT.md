# ENG-QUIET: is a wait for ONE on 2-9's drum "quiet"? (Engine, from t-build-29 4c3ff9d8)

## EXACT NEXT STEP (box 1 hand-over; the lead RULED B + the locked let-go wait, C not in, no clock cap)
Candidate: t-eng-quiet-b = 88b5611b4, cut from t-eng-29 28c848dbd (G6 in it; a fast-forward of t-eng-29). It holds: beats.ts
'lianaDrop'/'logCatch' move beats (V, busy for s.dt); score.ts:1156 skips move:lianaDrop/logCatch; route.ts let-go wait = lockedLianas'
wait on a stage with a tempo (grid's if none or Infinity); planted tools/inspect/letGoBeat.test.ts (both tests RED on the old code, seen:
'no move beat for the lianaDrop at x 3105'; 'wait 0.300, want 0.283'), added to gates.yml:157. tsc clean. NOTHING ELSE RUN on it yet.
Next, in order, ReadNotifications first (D140):
1. lockall: on origin/main `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-main.json`, then on the candidate `--check lock-main.json`
   with NO --intended: no layout may move (inspector-only change). `npx tsx tools/engine/seedlist.ts 2-4 --check` (and every listed stage's).
2. The real change's verdicts: apply `git diff 28c848dbd 88b5611b4 -- tools` onto a t-build-29 worktree (2-9 lives only there) and run
   probes/verdicts.ts 6 (its A column is now the tree) + SECT=1 for 2-9: expect let-go 2.6, twist 2.6-3.1; 2-4 worst 3.3-3.4; name every
   fail -> pass, NO pass -> fail; restCheck changes named (2-1, 2-2, 2-4, 2-7, 2-9 seen with the simulation).
3. 2-4's and 2-9's meter: tools/difficulty (score.ts) on 2-4 and 2-9 must not refuse (no 'unpriced piece move:lianaDrop').
4. Gates once on the final hash: tsc, the CI tool line (gates.yml:157), the suite shards (totals for THAT hash), tierBots, generalitycheck.
5. Land: `git push origin t-eng-quiet-b:t-eng-29` (fast-forward, never force); send the lead the hash.

## The answer in one line
The model does not price a wait for ONE as quiet: it hardly prices one at all. Of 2-9's six over-4 s stretches, two (the let-go and
the twist) are quiet because of a model hole (a let-go has no beat). The other four are walking, a ride, and a probe slip. A clock rule
clears none of them.

## 1. 2-9's six, broken into parts (Normal, seeds 1-3, 5, 6; seed 4 throws 'pool is spent' on this tree; parts29-s*.txt, probes/parts.ts)
| beat | over 4 s | walking | waiting for a clock (in the model) | other | why |
|---|---|---|---|---|---|
| gate | 4.9 | 4.6 + 0.24 drop | 0 | 0 | the opening walk (start section into 'hear'), no clock in the model at all |
| let-go | 5.4-5.8 | 1.5-1.9 | 0.33 (lianaDrop wait/2) | boarding swing 0.98 hidden (C); let-go 2.91 = swing-out 1.37 + flat 1.20 + wait 0.33, NO beat (B) | B |
| twist | 5.7-6.8 | 1.9-3.1 | 0.38 | swing 0.98 hidden (C); let-go 2.76 = 1.18 + 1.20 + 0.38, no beat (B) | B |
| terrace | 10.5-12.0 (this tree, N6) | 1.05-2.5 | 1.43 (half a bar for a bucket) | the ride, half a turn: 8.55 | a RIDE; route.ts:417-420 + beats.ts:131 count 0.5 s busy |
| barge | 5.5 | 0 | 0 | the hop on 0.40 hidden (C); 5.05 riding the logs across 1440 px | a ride |
| shrine | 5.0-5.3 raw | 5.1 | 0 | after the posted snapper | quietOf counts only the share before the goal (listRules.ts:38): 0.19, so 0.95 s. NOT over: quiet29.ts skipped the share |

Why the let-go and twist wait 5.4-6.8 s when a bar is 2.85 s: they do not wait for ONE. The model's clock wait there is 0.33-0.38 s. The
let-go move ('lianaDrop', route.ts:482) has no case in findBeats (beats.ts switch, ~:131), so the whole let-go is "nothing to do". It does
not wait for one particular ONE: route.ts:481 prices the let-go from the UNLOCKED grid (lianaDrops: every phase pair, worst 0.67/0.77 s);
the court is LOCKED (lockedDrops: worst 0.17 s, a press on ONE lands, window 2.1 s). Small, but the model is the wrong one.

C (a tie in the beat clock): when the 'river crossing: read the logs' beat (dur 1.0, beats.ts:343) sits at the same base as the move onto
the river, the move sorts first and its busy time runs INSIDE the 1 s read (beats.ts:371 sorts by base only; analyze.ts:44 takes the
max). The swing (0.98) or the hop (0.40) counts as nothing.

## 2. 2-5 (the other clocked stage): how it passes
Counted worst 3.4-3.7 s on seeds 1-6 (parts25-s*.txt). Every stretch over 2.5 s is walking (plus the C-hidden hop or jump, 5 a seed). No
let-go and no wheel on its route, so no clock wait is priced anywhere. It passes because its walks are short, not because its clocks
are priced differently.

## 3. The rule
Proposal (the brief's): a wait on a VISIBLE and AUDIBLE clock counts busy for at most one period of that clock; the rest is quiet. Toys
(probes/toys.ts, toys.txt; P = 2.85 s):
- a one-bar clock wait: busy (0.00 s quiet). Now: 2.85 quiet inside a move's time, 0.00 as a beat's dur.
- a 3-bar idle wait on the clock: 5.70 s quiet, OVER 4. Now: 8.55 inside a move, 0.00 as a dur (a dur is busy with no cap, today).
- a plain stand, no clock: quiet (2.85 / 4.50; the 4.5 s one is over).
On 2-9 it clears NOTHING: let-go 5.4 -> 5.1, twist 5.7-6.8 -> 5.3-6.4, terrace 10.5 -> 9.1. The model's clock waits are 0.3-1.4 s.

What does clear beats, per section (probes/verdicts.ts SECT=1; both only shrink a stretch, never lengthen one):
- B (a let-go or log catch is a move beat, busy for its whole time, like a swing): let-go -> 2.6, twist -> 2.6-3.1. CLEARS BOTH.
  This is the written rule, not a new one: STAGE-RULES line 160 "timing choices ... vines count as action". The model missed a kind.
- C (at one base, a wait comes before the move): barge 5.5 -> 5.1, let-go -> 4.4-4.8. Clears nothing alone.
- With B + C, still over 4 s (the DESIGNER's: something to do, or shorter): gate 4.9 (a walk), terrace 10.5-12.0 (a ride), barge 5.1
  (a ride).

## 4. Listed stages' verdicts (seeds 1-6 each, as the tree has it and with B, C, B+C; verdicts-all.txt)
16 listed stages (1-1..1-9, 2-1, 2-2, 2-3, 2-4, 2-5, 2-7, 2-9), seeds 1-6 Normal, quietOf's measure. Monotone checked on every run
(0 cases where B, C or B+C made a stretch longer), so NO pass can turn into a fail: every proven seed list still passes the quiet line.
Fail -> pass on these raw seeds (the lists are fixed; only a rebuild would take them): 2-1 s3 4.5 -> 3.5 (B), s5 4.2 -> 3.5 (C); 2-2 s6
4.2 -> 3.9 (C); 2-4 s2, s3 4.1 -> 3.3 (B; 2-4's worst falls 4.0-4.1 -> 3.3-3.4 on all six: 48 let-gos/catches). 2-9: no flip (the
terrace ride keeps it over). Every other stage: the same number each way.
Beyond the quiet line, B and C move other readings: restCheck's no-rest bursts (an inspector report only, not a list gate) change on
2-1, 2-2, 2-4 (7-8 -> 0), 2-7, 2-9; and B needs score.ts:1156 to skip `move:lianaDrop`/`move:logCatch` (priced by lianaChallenges from
the segs) or the meter refuses the new beats as unpriced. So B is a beats.ts + score.ts change, with 2-4's and 2-9's lock and meter rows
to re-check.

## Lessons applied
D128 (stamps from `date`), D134 (next step at the top, pushed before the hand-over), D140 (ReadNotifications each step), D145 (a 2-5
number is not a 2-9 ruling: 2-5's pass was read from its own stretches), D130 (the stretch's own parts, not the section label).

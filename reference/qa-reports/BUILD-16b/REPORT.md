# BUILD-16b REPORT: 1-6 First Lianas, finished from BUILD-16's handover (R-165.203). IN PROGRESS
t-build-16 from 9b167cf2; packet reference/packets/2026-11-14/BUILD-16b.md (lead's branch ccr-ea739a2f-dfcee4). Lead rulings 10:36,
10:40, 10:49 AM ET and 11:00 AM ET (option A, the petal seal). BUILD-16's REPORT (../BUILD-16/REPORT.md) is the design and first build.

## EXACT NEXT STEP
(filled at the stop)

## ENGINE LINES (for the xhigh integrator, line by line at merge; the lead's 11:00 condition)
(filled after the last edit, cites checked last: D52)

## Done-items, heads named per number
(filled)

## Meter findings (R-165.239, a tools member's; NOT changed here, LAWS 22)
- **Every liana is scored twice.** tools/inspect/route.ts:402 adds the grab from a bank (`plat` to `liana`, note 'added', `from` set:
  beats.ts:120 labels it "swing on a liana") and :413 the let-go onto a bank (`liana` to `plat`, no `from`: labelled "swing on to the
  next liana", though no liana follows); score.ts:247 scores each as a full 2.32-bit release window. 1-6 Normal: 14 lianas, 22 swings.
- **Every swing costs a life**, even over the soft moss with the root stair back: score.ts:247 hard-codes `cost: 'life'`; a jump's cost
  comes from costAt(st, softPits, ...) (score.ts:227). Easy's swings are over moss on every beat.
- Effect on 1-6: the meter's peak half (MIX 0.5/0.5, score.ts:69) sees two beats' lianas in one 30 s (PEAK_WINDOW, score.ts:68) as ~21
  points a minute even with ONE liana a beat; Easy ~3 would need every liana 30 s from the next, ~70 s more of root hops on Easy.

## Learned (proposed level.md changes; the lead decides)
(filled)

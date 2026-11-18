# POLISH-8 PLAN (t-polish-8; R-165.228). Opus 5.5 high. Started 4:41 AM ET 11-14. Box: 60 min or 400k tokens.
Base: origin/t-polish-7 tip 38d5596 (81a13bf + REPORT/gate-log commits only; no code after 81a13bf).
Lead ruling: the ONE kept double teach's rise on Normal into Easy's band, 128-132 (today 136-140).

Where it lives (checked in code): w1.ts `riseFace` lays every D/T face at D_RISE (137-140); the teach rise is beat `T` (dip and bank
teaches) and w1-double-teach's head riseFace. Easy is clamped to 132 by pipeline riseCap (reach.ts BANDS 'double-teach-rise' easy hi).
The judge (pipeline judged11 -> verdicts classify) reads EVERY double rise block as 'double-teach-rise' (Normal 136-140), so a 130 teach
rise on Normal would be band.out: the judge needs the teach rise as its own row, not a looser shared band (law 22).

1. w1.ts: TEACH_RISE [-131,-129] (1 px inside 128-132, the bands' convention), riseFace(dy) param, used by T and w1-double-teach's teach
   rise only; the bank teach's second D, the practice gap, the test gap unchanged. exitDy follows (-130 / -130 / -268).
2. reach.ts BANDS 'double-teach-first' easy 128-132 / normal 128-132 (source: the lead's ruling 11-14); verdicts TAUGHT + lesserOf;
   pipeline judged11: in a teach node, the FIRST double rise block is that kind. bands.md row.
3. Tests: verdicts.test planted (Normal teach-first 136 -> band.out; 128/130/132 clean both settings); src/game/w1DoubleTeach.test.ts:
   every listed 1-1 layout, both settings, each double-teach section's teach rise measured 128-132 (red with TEACH_RISE = D_RISE).
4. ONE relist (--merge <list order> --in-order); first run 9652 kept or re-picked by the pin rule; roll-pinned tests.
5. castBots 1-1 layouts 1-10 kid+adult both settings; tierBots calibration re-run + recommit (CLAUDE.md: any 1-1 change).
6. Full CLAUDE.md checks, buildcheck alone. Stills of the teach before/after, upright + sideways, built setting printed. REPORT.

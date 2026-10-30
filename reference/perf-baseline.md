# Frame-time baseline per phone (PERFORMANCE-RULES.md §8.6)

QA compares each new test link's control-test numbers against these. A build more than 10% worse on any of them doesn't go to the testers.
Taken from Matt's live control test of release #52 (version 2026-10-30T12:25:45-04:00), 2026-10-30 12:43-12:53 PM ET, upright, profiler off.

| Phone | Run | fps | over 50 ms | over 100 ms | worst frame | quality held | sound lag (ms per 5 s) |
|---|---|---|---|---|---|---|---|
| Pixel 11 Pro XL (PowerVR) | uyzl | 29.6-30.0 | ~15 a minute | 0 in 20 s | 75 ms | q0 | 0-11 |
| Samsung (Adreno 730) | xlzi (end only) | 29.9-30.0 | 0 | 0 | 50 ms | q0 | 0-4 |
| OnePlus 2020 (Adreno 619, 4 GB) | jsd9, first 16 s | 9-13 | — | ~37 a minute | 2039 ms (1400 ms browser long task) | q0 to q2 by 14.5 s | 626-762 |
| OnePlus 2020 | jsd9, 80-97 s | 23.6-29.4 | — | — | — | q2, then q1 | 205-295 |

Before (this morning's build, 08:37): about 27 fps with 10-11 stalls a minute on the Pixel and the Samsung, q2 held; OnePlus 10-19 fps.

Known left (next build): the OnePlus start (stage readying under the title card was held back in #52), Samsung hitches at checkpoint flags
(their bake lands on first sight without the readying), OnePlus sound (live orchestra: the recorded music fixes it).

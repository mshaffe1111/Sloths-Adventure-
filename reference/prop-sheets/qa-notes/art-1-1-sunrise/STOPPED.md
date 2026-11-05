# 1-1 sunrise redo: paused 2026-11-05, 12:50 PM ET (lead's pause: art polish moved to next week)

Nothing is wired. 1-1 still plays the old w1sunrise far/sky/mid; `src/assets/backdrops` is untouched on this branch.

## Found
- Orchids: the old far + sky prompt asked for them (`tools/art/hfbackdrops/spec-F6.json`: "a flowering branch with white orchids at
  one edge"). New prompt (`tools/art/sunrise11/make_spec.py` FAR) drops it; flowers, orchids, rain are in the negatives. 0 of 7 new far
  takes has orchids.
- Cut trunk: `starts2.py` lays a piece hard against x=0, so a tree sits in a join band and the seamless join cuts it.
  `tools/art/sunrise11/cut.py mid` now refuses such a take (failed all 8 of round M: 0.30-0.44 of the height painted in a band);
  `tools/art/sunrise11/starts.py` lays pieces between ground-only margins (all 12 of round M2 passed: 0.000).

## Candidates (`candidates/A|B|C/`: game-ready far 2159x1302, sky 2159x513, mid 2113x1302, each < 250 KB; `candidates-ingame.jpg`)
- A: far 7 + mid E-s76-7. Cleanest far seam. Mid crowns bright, flat-topped, close behind the squirrels at the start.
- B: far 113 + mid G-s68-23. Clean far. Mid dark and low (crown tops row 761 of 1302).
- C: far 97 + mid F-s68-7. Small cloud "ear" at the far's join. Mid lowest (row 802).
- Open issue: all three mids are shorter than the old (row 532) and the other W1 mids (498-589); B/C read as low bush.
  Round M3 (taller starts H/I, `starts.py ... 320 122|125`) was launched 12:49 PM ET, before the pause was read; its 8 takes are in the
  bucket under `sunrise11/sun11-M3/props`, not reviewed.
- Rejected fars: 23 (rain streaks), 41 and 59 (seams at bands 240/320/420), 83 (cloud ear). Rejected mids: F-s68-23, F-s76-23 (rain),
  G-s68-7, G-s76-7 (square-cut crown, blue specks), E-s68-7 (black bar on the ground).
- "Low view over the creek": 1-1's build has no water; the low shot is the lowest floor (x 8992).

## Spend (estimate: minutes x $2.75/h, `tools/art/sunrise11/jobs.txt` has the job ids)
F 4 min, M 6, M2 8, hdF 3, F2 6, hdF2 3, hdM 2.5, M3 ~6 (running at pause): about 38.5 min, about $1.95 of the $5 cap.

## To resume
Judge M3 (cut.py mid, then the native pass), send the lead the candidates sheet, wire the pick over w1sunrise-far/-sky/-mid
(`tools/art/sunrise11/finish.py`), then every gate. None of the gates have run.

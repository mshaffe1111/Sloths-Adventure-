# Hugging Face spend log (art director)

Rules (lead, 11-06 9:14 AM ET, from Matt's "use Hugging Face when needed"): each job gets a one-line ask to the lead first (what, why it
can't be free, estimated cost) and a written OK (jobs under $1 may go in one batch ask); $15 stays untouched (Matt's reserve); about $70
was left in total on 11-06; every job is logged here; the token never goes in code, commits, files or messages.

| Date (ET) | Job | Lead's OK | Cost | Result |
|---|---|---|---|---|
| 2026-11-06 9:40 AM | sheet-10 keepers 3x Real-ESRGAN (approved, cap $0.50) | lead 9:27 AM | **$0**: run locally on CPU instead (tools/art/edges/defringe.py --esrgan, anime6b weights from the Real-ESRGAN GitHub release, git-ignored) | 6 pieces (not 9: I miscounted; sheet 10 has 6 keepers once the pink rope and the 2 holds are out). Kept 5 as improved, 1 flagged (see reference/art/cut/up3x/README.md) |
| 2026-11-06 9:45-9:55 AM | 1-1 near strip repaint: near11-N img2img 8 takes (6aede8020e0338d1bb817d84, ~5.3 min) + near11-hd native pass 2 takes (6aede9b60e0338d1bb81815b, ~2.5 min), rtx-pro-6000 ~$2.75/h | lead 9:35 AM, cap $1 | ~$0.36 (estimate from GPU minutes) | kept A (w1sun3-nearA-s62-23), backup B; reference/art/near11/ |

Running total today: ~$0.36. Left: about $70 - $0.36; $15 reserve untouched.

## Picture list 1 (R-165.100, Content; the lead's decision 11-11, packet reference/packets/2026-11-11/CONTENT-HF-LIST1.md; cap $6.50)
Logged before launch (start/end in UTC; ET to Matt). Spec and starts: tools/art/hflist1/. rtx-pro-6000 at about $2.75/h.

| Job | What | Takes | Est. before | Job id | Start (UTC) | End (UTC) | Minutes | Cost |
|---|---|---|---|---|---|---|---|---|
| hfl1-A | item 1: P-08-c, P-08-d, P-10-a, P-10-d at 2000 px, s52/s60 x 2 seeds | 16 | ~$0.85 | pending | | | | |
| hfl1-B | item 1: P-11-a, P-11-c, P-11-d at 2000 px, s52/s60 x 2 seeds | 12 | ~$0.65 | pending | | | | |
| hfl1-C | item 2: 4 ground strips, square ends, s52/s60 x 2 seeds | 16 | ~$0.55 | pending | | | | |
| hfl1-D | item 3: 3 natural stumps s60/s68 x 2; item 4: 4 side-on slabs s62/s68 x 2 | 28 | ~$0.90 | pending | | | | |
| hfl1-hd | item 2: circular native pass on the 4 picked strips | 4 | ~$0.50 | later | | | | |


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
| hfl1-A | item 1: P-08-c, P-08-d, P-10-a, P-10-d at 2000 px, s52/s60 x 2 seeds | 16 | ~$0.85 | 6af42dc6ab34849891adf054 | 2026-11-11 08:56:38 | 09:10:29 | 13.8 | $0.63 |
| hfl1-B | item 1: P-11-a, P-11-c, P-11-d at 2000 px, s52/s60 x 2 seeds | 12 | ~$0.65 | 6af42de69737d9a9e092b8ac | 2026-11-11 08:57:10 | 09:06:57 | 9.8 | $0.45 |
| hfl1-C | item 2: 4 ground strips, square ends, s52/s60 x 2 seeds | 16 | ~$0.55 | 6af42deaab34849891adf05e | 2026-11-11 08:57:14 | 09:04:12 | 7.0 | $0.32 |
| hfl1-D | item 3: 3 natural stumps s60/s68 x 2; item 4: 4 side-on slabs s62/s68 x 2 | 28 | ~$0.90 | 6af42ded9737d9a9e092b8ae | 2026-11-11 08:57:17 | 09:09:06 | 11.8 | $0.54 |
| hfl1-hd | item 2: circular native pass on the 4 picked strips | 4 | ~$0.50 | 6af4317dab34849891adf3bb | 2026-11-11 09:12:30 | 09:14:32 | 2.0 | $0.09 |

List 1 total: 44.5 GPU minutes, **$2.04** (cap $6.50; minutes are job creation to its last output, so an upper bound). 76 takes: 72 img2img + 4 native-pass strips. $15 reserve untouched.

## 2026-11-12
Matt, 11:20 AM ET: "treat this as final budget" ($63.53; he may add more later, unknown). Plan every job against it; ~$10 reserve.
: Matt hands Hugging Face to the lead
Matt, 11:17 AM ET: "Hugging Face is 100 up to you. Get what you need when you need. Balance is 63.53. You can use it however."
Balance: **$63.53**. The lead decides every job; each one is logged here with what it bought; about $10 kept in reserve.

| When | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 12:00 PM | ART-W1 r1a 6af5f0ca (hive/stone x3 seeds, 12 takes), ~5.5 min | lead (ART-W1 packet, $6 cap) | ~$0.25 | hanging hive + slung stone shapes; every take had a bough/pool painted round it |
| 12:01 PM | ART-W1 r1b 6af5f0f0 (handles/tendril, 12 takes), ~4 min | lead (packet) | ~$0.18 | knotted vine handle, tendril-to-peg |
| 12:01 PM | ART-W1 r1c 6af5f0f3 (anchor/link/clump, 9 takes), ~4 min | lead (packet) | ~$0.18 | anchor bough (too long), link vine shape |
| 12:17 PM | ART-W1 r2a 6af5f4a6 (hive landed/hanging, stone landed, 12 takes), ~6.5 min | lead (packet) | ~$0.30 | hanging hive 67; every landed hive broken open (not used) |
| 12:18 PM | ART-W1 r2b 6af5f4ed (tendril cut, clump, link, 12 takes), ~4.5 min | lead (packet) | ~$0.21 | tendril stake, link vine, clump candidates |
| 12:18 PM | ART-W1 r2c 6af5f4f0 (stone hanging, sprung, handle, anchor, 12 takes), ~6 min | lead (packet) | ~$0.28 | sprung vine, stone 41, handle 67 |
| 12:38 PM | ART-W1 r3 6af5f99e (img2img from paste-ups, 20 takes), ~7 min | lead (packet) | ~$0.32 | landed stone x2; landed hive x8 takes (~$0.13) made AFTER the lead's 12:31 hive hold, which reached me at 12:50: not used, Matt's sheet replaces them |
| 12:49 PM | ART-W1 r3b 6af5fc0c (anchor at the trap's shape, 8 takes), ~4.5 min | lead (packet) | ~$0.21 | anchorArm 41, anchorArch 5 |
ART-W1 total: ~42 GPU-min, **~$1.93** of its $6 cap (rtx-pro-6000 ~$2.75/h, from job start to its last file in the bucket). Contact sheet: reference/qa-reports/ART-W1/contact-sheet-1.jpg on t-w1-art.

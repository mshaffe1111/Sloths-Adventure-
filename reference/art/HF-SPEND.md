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
| 2:22 PM | ART-W1B sky13-F 6af611f1 (1-3 sunrise far img2img from the cleaned old far, 4 takes), ~4.5 min | lead (ART-W1B packet, $6 cap) | ~$0.21 | s70-23: no orchids, log or branch (s60s kept the start's grey boxes) |
| 2:26 PM | ART-W1B r4 6af612d1 (root-hoop anchor set/cut, long liana, 11 takes), ~3.6 min | lead (packet) | ~$0.17 | rootSet-5 (tendril knotted to a living root), rootCut-17 (snapped living root); the long liana takes all painted sloths/scenery: not used |
| 2:45 PM | ART-W1B sky13-hdF 6af61765 (native pass round the circle), ~2 min | lead (packet) | ~$0.09 | the far at 2160 px; its join still 7.7 (the take's ends painted apart) |
| 3:28 PM | ART-W1B sky13-S 6af62170 (the 1024 px band round the join repainted whole, 4 takes), ~3 min | lead (packet) | ~$0.14 | s55-7: join 1.69 vs 0.69 between any two columns, no visible join |
ART-W1B total: ~13 GPU-min, **~$0.61** of its $6 cap (estimates from GPU minutes).

## 2026-11-13 (ART, t-art-1113; the lead's packet cap $15, ~$10 reserve kept)
Route: this credential is refused for the bucket mount and repo writes (403), so the work runs in one rtx-pro-6000 HF sandbox (~$2.75/h),
billed from creation to terminate; probes were cpu-basic jobs of seconds.

| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 10:33 AM | 4 cpu-basic probe jobs (seconds each: which part is refused; bucket mount and repo writes 403) | ART (packet) | ~$0.00 | the route: a sandbox |
| 10:34 AM-12:06 PM | sandbox 6af72e1c29dd05ff03651469 (rtx-pro-6000), 92 min: climb1 12 edits; climb2 10; props1 42 stills (1-5 set, 1-4 pieces); fruit1 31 (9 fruit + guarana); props2 10 (sign, mark redos); props3 12 (oropendola, ant); props4 8 + props6 8 (dusk img2img); props5 8 (guarana on grey, down sign); oro1 6 edits; props7 4 (creek). ~2 min idle at 10:51 (a watcher bug, own miss) | ART (packet cap $15) | ~$4.22 | Pokey's two-hand climb (packed), 1-5's set + dusk set, 1-4's pieces, 9 fruit + golden guarana (all cut, catalogued); creek, flyer, ant takes for the next session |
ART 11-13 total: ~92 GPU-min, **~$4.22** of its $15 cap (minutes x $2.75/60, creation to terminate). Balance ~$58.7 (from ~$62.9 at the packet).
| 12:10-12:18 PM | sandbox 6af7448629dd05ff03653f5e (rtx-pro-6000), 8 min, attempt 3: creek8 6 img2img (the creek's join band repainted, creek-53 s45/s55, creek-11 s50); ant2 6 Qwen-Edit leg edits (leafcutter-11) | ART (packet) | ~$0.37 | w15-creek (band s45-9); the ant walk's two strides (antA-s1, antB-s2) |
ART 11-13 running total: ~100 GPU-min, **~$4.59** of its $15 cap. Balance ~$58.3.

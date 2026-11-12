# Hugging Face spend log (art director)

Rules (lead, 11-06 9:14 AM ET, from Matt's "use Hugging Face when needed"): each job gets a one-line ask to the lead first (what, why it
can't be free, estimated cost) and a written OK (jobs under $1 may go in one batch ask); $15 stays untouched (Matt's reserve); about $70
was left in total on 11-06; every job is logged here; the token never goes in code, commits, files or messages.

| Date (ET) | Job | Lead's OK | Cost | Result |
|---|---|---|---|---|
| 2026-11-06 9:40 AM | sheet-10 keepers 3x Real-ESRGAN (approved, cap $0.50) | lead 9:27 AM | **$0**: run locally on CPU instead (tools/art/edges/defringe.py --esrgan, anime6b weights from the Real-ESRGAN GitHub release, git-ignored) | 6 pieces (not 9: I miscounted; sheet 10 has 6 keepers once the pink rope and the 2 holds are out). Kept 5 as improved, 1 flagged (see reference/art/cut/up3x/README.md) |
| 2026-11-06 9:45-9:55 AM | 1-1 near strip repaint: near11-N img2img 8 takes (6aede8020e0338d1bb817d84, ~5.3 min) + near11-hd native pass 2 takes (6aede9b60e0338d1bb81815b, ~2.5 min), rtx-pro-6000 ~$2.75/h | lead 9:35 AM, cap $1 | ~$0.36 (estimate from GPU minutes) | kept A (w1sun3-nearA-s62-23), backup B; reference/art/near11/ |

Running total today: ~$0.36. Left: about $70 - $0.36; $15 reserve untouched.

## 2026-11-12 ART-W1 (1-3 trap pieces; GPU cap $6, decided by the lead in the ART-W1-TRAPS packet)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 12:00-12:53 PM | w1traps r1a/b/c, r2a/b/c, r3, r3b (8 jobs, ids in tools/art/w1traps/jobs.txt), rtx-pro-6000 ~$2.75/h | lead (packet) | ~$1.93 (42 GPU-min) | 109 takes; 22 candidates on reference/qa-reports/ART-W1/contact-sheet-1.jpg (hive, stone, handles, anchor, link, clump; all states) |

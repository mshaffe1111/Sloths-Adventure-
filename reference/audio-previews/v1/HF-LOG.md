# Hugging Face spend log (Matt's credit; cap: $3, raised to $6 for the three-world pilot)

| when (ET) | job | hardware | run time | cost |
|---|---|---|---|---|
| 2026-10-29 2:41 PM | ACE-Step 1.5 (MIT licence, commercial use allowed) World 3 pilot, round 1: a calm and a danger theme, 70 s, cut in chunks | a10g-small | 4 min 23 s | about $0.07 |
| 2026-10-29 2:49 PM | round 2: 100 s each, cut on a fixed bar grid (90.7 bpm, D minor): 8 calm + 8 danger chunks of 4 bars (10.6 s), mono 24 kbps | a10g-small | 2 min 42 s | about $0.05 |
| 2026-10-29 3:22 PM | round 3: Worlds 1, 3 and 9, each in its own style (described in words), calm + danger, 8 chunks each, packed into one carrier PNG | a10g-small | 4 min 18 s | about $0.07 |
| | **total** | | 11 min 23 s | **about $0.19** |

Costs are the run time at the a10g-small list rate (about $1/hour). The results are in Matt's private bucket
`hf://buckets/mshaffe111/sloths-audio-pilot` (v2_calm_0-7.ogg, v2_danger_0-7.ogg, summary2.json; the job scripts are pilot.py and pilot2.py).

What the pilot would cost a phone, measured on the files: 16 chunks of 10.6 s, so a world with a calm and a danger set holds about 16 MB
decoded (mono, 24 kHz), or 11 MB at 16 kHz. Calm alone is 8 MB / 5.4 MB. The download is about 0.5 MB a world. Reaching the 5 MB target
means about 6 chunks per set at 16 kHz.

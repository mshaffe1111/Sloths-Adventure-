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

## 2026-11-14 (ART-678, t-art-678; the lead's packet cap $8, ~$10+ reserve kept)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 11:33 PM-12:14 AM | sandbox 6af7e49d29dd05ff03665cdd (rtx-pro-6000), 41 min creation to terminate: ~8 min model downloads (a parallel stills start OOMed but overlapped the Qwen-Image download), 12 harpy Qwen-Edits + 4 perch-feet edits (~70 s each), 24 sheet stills (~50 s each), CPU cuts, ~4 min copying back (cuts 46 parts, raws 115 parts) | lead (ART-678 packet) | ~$1.88 | 25 shipped pieces (src/assets/w1-678/) from 6 sheets + 8 harpy frames: **~$0.075 a shipped piece**; plus 40 raw takes kept (reference/art/hf678/raw/, q95) so a re-pick costs nothing |
ART-678 total: ~41 GPU-min, **~$1.88** of its $8 cap (minutes x $2.75/60). Balance ~$56.4 (from ~$58.3).

## 2026-11-14 (BUILD-18, t-build-18; the lead's packet cap $3)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 8:17-8:26 PM | sandbox 6af9086223985fb9cd82c12e (rtx-pro-6000), about 9 min creation to terminate: 12 Qwen-Image + style LoRA takes (4 pieces x 3 seeds, ~21 s each after a ~2 min load), keyed and cut in the sandbox (/w/key18.py, /w/ship18.py), back by hf_sandbox_fs | lead (BUILD-18 packet; ruling A 8:19 PM: all four) | ~$0.41 | 4 shipped pieces (src/assets/w1-18/): palm nut, cannonball fruit (in game, rollingPiece.ts), palm crown, cannonball trunk with fruit stalks (laid as data, drawn when the inventory-dressing piece lands): **~$0.10 a piece**; the keyed takes' sheet in reference/art/hf18/ |
BUILD-18 total: ~9 GPU-min, **~$0.41** of its $3 cap (minutes x $2.75/60). Balance ~$56.0 (from ~$56.4).

## 2026-11-15 (ENG-LOOK2, t-eng-look2; the lead's packet cap $3, ONE job)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 11:12-11:17 AM | sandbox 6af9d9c129dd05ff0368e675 (rtx-pro-6000), about 6 min creation to terminate: 8 Qwen-Image + style LoRA 0.9 takes (2 prompts x 4 seeds, 1792x768, ~27 s each after a 36 s load), spec tools/art/hfbough/spec-bough.json; 3 takes back by hf_sandbox_fs (reference/art/hfbough/, takes-sheet.jpg) | lead (ENG-LOOK2 packet, step 4) | ~$0.28 | 1 shipped piece (src/assets/w1-18/hf18-bough.webp: 3 joinable bough variants from take a-53, cut.py), catalogued hf18/hf18-bough at scale: **~$0.28 a piece** |
ENG-LOOK2 total: ~6 GPU-min, **~$0.28** of its $3 cap (minutes x $2.75/60). Balance ~$55.7 (from ~$56.0).

## 2026-11-15 (ART-18, t-art-18; the lead's packet cap $4, ONE sandbox)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 11:54 AM-12:23 PM | sandbox 6af9e3a229dd05ff0368f022 (rtx-pro-6000), 29 min creation to terminate: 16 palm takes (Qwen-Image + style LoRA 0.6/0.85, 4 prompts x 4 seeds, 928x1664, ~33 s each after a 33 s load; spec tools/art/hfpalm/spec-palm.json), 6 hanging-leaf takes (spec-leaf.json, 1024x1024), keyed and cut in the sandbox (tools/art/hfpalm/cut.py, nutpt.py), back by hf_sandbox_fs | lead (ART-18 packet, step 1 + step 2's one batch) | ~$1.34 | 5 shipped palms (src/assets/w1-18/hf18-palm-{a,b,c,back-a,back-b}.webp, catalogued, in game) and 4 painted hanging-leaf clusters cut for World 1's front leaves (reference/art/hfpalm/leaves/, not wired: R-number in the ART-18 report): **~$0.27 a shipped palm, ~$0.15 a piece**; take sheets reference/art/hfpalm/ |
ART-18 total: ~29 GPU-min, **~$1.34** of its $4 cap (minutes x $2.75/60). Balance ~$54.4 (from ~$55.7).

## 2026-11-15 (ART-W2, t-art-w2; the lead's packet cap $5, ONE sandbox)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 12:31-12:41 PM | sandbox 6af9ec6a23985fb9cd8391e2 (rtx-pro-6000), about 11 min creation to terminate: 8 img2img takes (shallow backwater strip from the deep tile + W2 stones, s50/s62; long log from logLong, s40/s52; ~8 s each after a 39 s load) + 22 Qwen-Image + style LoRA 0.85 takes (7 prompts x 3-4 seeds, ~21 s each); spec tools/art/hfw2/spec-w2i.json + spec-w2.json; back as two carriers by hf_sandbox_fs (saved to files, not read into context) | lead (ART-W2 packet) | ~$0.50 | 9 shipped pieces (src/assets/w2-1115/): shallow backwater strip, long log, small pad + sunk, big sunk pad, ripple decal, crown bud + open flower, bent-bamboo bounce: **~$0.06 a piece**; all 30 takes kept (reference/art/hfw2/takes/) |
ART-W2 total: ~11 GPU-min, **~$0.50** of its $5 cap (minutes x $2.75/60). Balance ~$53.9 (from ~$54.4, ART-18's figure on origin/t-art-18). Logged 12:46 PM ET.

## 2026-11-14 (ENG-19a, t-eng-19; the lead's packet: ONE job, cap $2)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 8:19-8:29 PM | sandbox 6af9089523985fb9cd82c13a (rtx-pro-6000, 40 min hard timeout), ~10 min creation to terminate: batch 1 spec-roost.json 6 t2i takes (267 s); batch 2 spec-roost2.json started, 2 of 6 done when the session stopped at its 40% context line | ENG-19a (packet) | ~$0.46 | batch 1 judged (reference/qa-reports/ENG-19/clips/roost-batch1-sheet.png): every take runs its limbs off the top edge (a cut end reads as sawn wood), 31 has eggs; 71 the nearest. Nothing kept: batch 2 is the next step |
ENG-19a total: ~10 GPU-min, **~$0.46** of its $2 cap (minutes x $2.75/60). Balance ~$55.9 (from ~$56.4).

## 2026-11-15 (ENG-19b, t-eng-19b; the same $2 cap as ENG-19a: ~$1.54 left of it)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 11:08-11:16 AM | sandbox 6af9d8d329dd05ff0368e5a2 (rtx-pro-6000, 40 min hard timeout), ~8 min creation to terminate: spec-roost2.json, 6 t2i takes (~52 s each), CPU cut (hf1113/cutprops.py), 2 parts copied back | ENG-19b (packet step 1) | ~$0.37 | the roost: roostb-101 picked at 190 px tiles (whole piece in frame, nest and feather read; 113/97 run off the edge, 71 a little tree on a mound, 83 a cut stump, 127's nest too small at 145 units); shipped src/assets/w1-19/w1-roost.webp (593x435, 75 KB, 1.63 of Pokey); raws not kept |
ENG-19 total (a+b): ~18 GPU-min, **~$0.83** of its $2 cap (minutes x $2.75/60). Balance ~$55.5 (from ~$55.9).
(BUILD-19 merge, 11-18: ENG-19a/b ran beside BUILD-18, ENG-LOOK2, ART-18 and ART-W2 from the same ~$56.4; each "Balance" above is its own branch's figure. Combined: ~$53.9 - ~$0.83 = ~$53.1.)

## 2026-11-18 (ART-22P, t-art-22p; the lead's packet cap $4, ONE sandbox)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 10:14-10:21 AM | sandbox 6afdc0ade41aae15936c90c1 (rtx-pro-6000), about 7.4 min creation to terminate: 8 img2img takes (the shipped petal recoloured lavender / white, tools/art/hf22p/starts.py; s45/s58 x seeds 11/23, ~11 s each after a ~2 min load) + 6 Qwen-Image + style LoRA 0.8 text-to-image takes (lavender hyacinth x4, white lily x2, ~20 s each); spec tools/art/hf22p/spec-22pi.json + spec-22p.json; picks back by hf_sandbox_fs (reference/art/hf22p/) | lead (ART-22P packet) | ~$0.34 | 1 shipped piece (src/assets/pickups/petal-hyacinth.webp, 2-2's pickup and HUD counter): $0.34 a piece; 14 takes, ~$0.02 a take |
| 11:06-11:11 AM | sandbox 6afdccfce41aae15936ca35a (rtx-pro-6000), about 4.4 min creation to terminate: 4 img2img takes of World 2's drift-petal paste-up (tools/art/hf22p/driftstart.py: the game's own lavender and white petals; s40/s52 x seeds 11/23, 1536x1152, ~19 s each after the load), cut in the sandbox by drift.py; spec tools/art/hf22p/spec-drift.json | lead (ART-22P follow-on, 11:04 AM message) | ~$0.20 | 1 shipped sheet of 12 drifting petals (src/assets/flora/petals-river.webp, World 2's weather): ~$0.017 a petal |
ART-22P total: ~11.8 GPU-min, **~$0.54** of its $4 cap (minutes x $2.75/60). Balance ~$53.4 (from ~$53.9, the last figure on main; later branches' spend not on main is not counted here). Logged (first job) 10:23 AM ET. Second job logged 11:13 AM ET.
(INT-12 merge, 11-18: ART-22P's "~$53.4" above does not count ENG-19a/b's ~$0.83, which reached main through BUILD-19 in the same integration. Combined: ~$53.9 - ~$0.83 - ~$0.54 = ~$52.5.)

## 2026-11-18 (ENG-25, t-eng-25; the lead's packet cap $3, ONE job)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 12:54-12:57 PM | sandbox 6afde63d545f95df1c0678df (rtx-pro-6000), about 4 min creation to terminate: 6 img2img takes (Qwen-Image + style LoRA 1.0, s50/s58/s66 x seeds 11/23, 1792x320, ~8 s each after the model load) of a 4-frame paste-up from World 2's own boulder (kits/w2.webp#boulder recoloured to the river stone's grey-brown; tools/art/hf25/starts.py, spec.json, run.sh); back as one carrier by hf_sandbox_fs (saved to files) | lead (ENG-25 packet, step 3) | ~$0.18 | 1 shipped piece, the snap stone's 4-frame sheet (src/assets/w2-1118/w2-snapstone.webp, built from take s50-11 by tools/art/hf25/ship.py; catalogued w2-1118/w2-snapstone): **~$0.18 a piece**; all 6 takes kept (reference/art/hf25/takes/) |
ENG-25 total: ~4 GPU-min, **~$0.18** of its $3 cap (minutes x $2.75/60). Balance ~$53.7 (from ~$53.9, the last balance on main; branches not yet merged may log jobs of their own). Logged 1:21 PM ET.
(INT-13 merge, 11-19: ENG-25's "~$53.7" above does not count ENG-19a/b (~$0.83) and ART-22P (~$0.54), merged at INT-12. Combined: ~$52.5 - ~$0.18 = ~$52.3.)

## 2026-11-18 (ART-W2A, t-art-w2a; the lead's packet cap $4, ONE sandbox)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 6:04-6:50 PM | sandbox 6afe2efd545f95df1c06c8a8 (rtx-pro-6000), 46 min creation to terminate (~2 min image pull, ~1 min model download): 42 Qwen-Image-Edit-2511 edits (no LoRA; ~53 s each at 1024, 45 s for the heron) from Matt's Happy poses and w2Heron on flat grey (reference/art/hfw2a/starts/): round 1, 21 (walk A + paddle per little one, the looking heron, 3 seeds each); round 2, 12 (walk B "far foot forward": came back the SAME frame, unused); round 3, 9 (the passing frame: legs together); cut in the sandbox (tools/art/hfw2a/cut.py), back by hf_sandbox_fs | lead (ART-W2A packet) | ~$2.11 | 10 pieces picked (tools/art/hfw2a/picks.json): duck/otter/capy walk A + walk B (passing) + paddle, the looking heron: **~$0.21 a piece**; round 2's 12 takes (~$0.55) were the waste |
ART-W2A total: ~46 GPU-min, **~$2.11** of its $4 cap (minutes x $2.75/60). Balance ~$51.3 (from ~$53.4, ART-22P's figure on origin/t-art-22p; branches not yet on main are not counted). Logged 6:51 PM ET.
(INT-13 merge, 11-19: ART-W2A's "~$51.3" above starts from ART-22P's figure and does not count ENG-19a/b (~$0.83) or ENG-25 (~$0.18). Combined: ~$52.3 - ~$2.11 = ~$50.2.)

## 2026-11-18 (ART-W2B, t-art-w2b; the lead's packet cap $4, ONE sandbox)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 8:24-8:49 PM | sandbox 6afe4fba545f95df1c06e370 (rtx-pro-6000), 25 min creation to terminate (~1 min model download): 15 Qwen-Image-Edit-2511 edits (no LoRA) from paste-up starts on flat grey + World 2's own wood pieces as the style reference (reference/art/hfw2b/starts/; tools/art/hfw2b/make_spec.py): round 1, 12 (the noria x4 at 1024, ~95 s each; the dry bucket x3, a spill fallback x2, the millrace lip x3 at 1024x512/384, ~72 s each); round 2, 3 (the spill FROM the picked dry take); cut in the sandbox (tools/art/hfw2b/cut.py), back by hf_sandbox_fs | lead (ART-W2B packet) | ~$1.15 | 4 pieces + 1 mirror shipped (tools/art/hfw2b/picks.json: noria wheel-s37, bucket-s23, spill spillc-s37 (+ its mirror), lip-s11): **~$0.29 a piece**; the 2 spill fallbacks from the start (~$0.08) went unused |
ART-W2B total: ~25 GPU-min, **~$1.15** of its $4 cap (minutes x $2.75/60). Balance ~$50.2 (from ~$51.3, ART-W2A's figure on origin/t-art-w2a; branches not yet on main are not counted). Logged 8:52 PM ET.
(INT-13 merge, 11-19: ART-W2B's "~$50.2" above starts from ART-W2A's figure and does not count ENG-19a/b (~$0.83) or ENG-25 (~$0.18). Combined: ~$50.2 - ~$1.15 = ~$49.0.)

## 2026-11-19 (PAINT-292, t-paint-292; the lead's ruling: ONE upscale job of the two thick plank frames, cap $1)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 5:55-6:02 PM | sandbox 6aff7e454fdc5ab3c55a6bc5 (cpu-upgrade, no GPU, no token forwarded), about 7 min create to terminate: torch CPU + spandrel, ai-forever/Real-ESRGAN RealESRGAN_x4.pth (pure super-resolution, no repaint) on w1-log-plank-a | the lead, 5:39 PM ruling 4 | about $0.01 (CPU minutes; the job page has the exact charge) | NOTHING shipped: the run was still on CPU when the member's context box closed, and this container cannot reach huggingface.co or the sandbox URL, so a result could only come back as base64 through the member's context (~50k+ tokens a frame). Terminated. PAINT-292b's EXACT NEXT STEP names the way to finish it. |
PAINT-292 total: about $0.01 of its $1 cap. Balance about $52.5 (main's last figure; unchanged at the cent level). Logged 6:10 PM ET.
(INT-14 merge, 11-20: PAINT-292's "about $52.5" above is main's figure and does not count the INT-13 merges above. Combined: ~$49.0 - ~$0.01 = ~$49.0.)


## 2026-11-20 (ENG-ROCK, t-eng-rock; the lead's ruling C, cap $2, ONE sandbox)
| When (ET) | Job | Decided by | Cost | What it bought |
|---|---|---|---|---|
| 12:54-1:00 PM | sandbox 6b0089504fdc5ab3c55bb2ae (rtx-pro-6000, ostris/aitoolkit), about 7 min creation to terminate (42 s model load, ~3 min of takes, ~3 min cutting): 9 Qwen-Image img2img takes (style LoRA 1.0, 1536x768, ~13 s each) from ONE start (tools/art/hfrock/starts.py: the World 2 kit boulder on flat grey, left stretched low-wide, right squeezed tall; s52/s60/s68 x seeds 11/23/37), each take two rocks; keyed and cut in the sandbox (tools/art/hfrock/cut.py), 18 cuts back by hf_sandbox_fs (the bucket refused the forwarded token, 403) | lead (ENG-ROCK ruling C; pick 1:05 PM) | ~$0.32 | 2 pieces shipped (src/assets/w2-rocks/w2-rocks.webp: rock-a = s68-11-L, rock-b = s60-37-L, each cut at the boulder's 388:179 shape): **~$0.16 a piece**; the 9 tall cuts (reference/art/hfrock/takes/*-R.webp) catalogued unassigned (a 50 px hop rock cannot seat them), the other 7 low cuts kept in the same folder |
ENG-ROCK total: ~7 GPU-min, **~$0.32** of its $2 cap (minutes x $2.75/60). Balance ~$49.9 (from ~$50.2, ART-W2B's figure, origin/t-int-14 reference/art/HF-SPEND.md:131, as the lead ruled; the INT-14 merge note at :139 there gives a combined ~$49.0, so counting every branch: ~$48.7). Logged 1:08 PM ET.

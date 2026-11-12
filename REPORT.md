# AS-1 report: shrinking the video and art, measured. Branch t-assets-compress from origin/main @585ef376 (live 0.9.6). Nothing under src/ changed.
**Comparison page:** `reference/art/compress-trials/index.html` (stills, listening clips and data beside it). **Full ranked list:** `reference/art/compress-trials/ranked-assets.csv`. **Inventory:** `inventory.csv` there. **Tools:** `tools/assets/` (inventory, draw-size probe, trials, comparison, projection).

## What ships (vite build of 585ef376: 1,020 files, 176.9 MB)
- **Images 112.8 MB:** 597 lossy WebP, every one with alpha, none animated. They are already compressed: I read each file's quantizer (`vp8q.py`, checked against fresh encodes), and they sit at about q80 (94 files, 22 MB), q85 (232 files, 41 MB), q90 (237 files, 40 MB) and q95 (28 files, 7 MB). The sky layers are about q83; the backdrops' other layers and the story HD pictures are q89 to q95.
- **"Video" 53.6 MB is music:** all 113 .webm are Opus audio (81 stereo, 32 mono, 100 minutes, 32 to 96 kb/s). The game ships no video. The 49 full mixes are 38.6 MB of it.
- **Sound** 5.5 MB (273 mp3). **Code** 4.2 MB (the main JS chunk alone is 3.9 MB, the biggest single file).
- **No few giant files:** the top 20 files are 18% of the game, the top 50 are 33%, the top 100 are 49% and the top 200 are 67%. Every saving has to be spread across hundreds of files.
- **Loading:** every asset is referenced by URL (`import.meta.glob ... ?url`, `new URL`), so nothing is decoded until a screen asks for it. The probe tracked fetch() only, so this report has no per-file load timing.
- **Over 4096 px (R-3.12):** queen-anim 2048x8172, seamstress-anim 2048x6664, soldier-anim 2048x5721. Prowler and croc are exactly 4096 wide.
- **Drawn size:** a probe (`drawprobe.mjs`) played 30 stages (each world's 1st, 5th and lair) and 30 story screens, upright and sideways, on a 3x phone at full picture quality, following every canvas drawn into another canvas. 282 images (67.8 MB) were seen. Only **7 small files (1.0 MB)** are stored more than 2x bigger than they are ever drawn. Resizing is not a real lever here.

## Trials and the whole game at each setting (MB)
| Setting | Images | Music | Saved | Web | App |
|:--|--:|--:|--:|--:|--:|
| Today (0.9.6) | 112.8 | 53.6 | 0 | 176.9 | 188.0 |
| Art q90, music M1 | 110.7 | 43.8 | 11.8 | 165.1 | 176.2 |
| **Art q82, music M1 (my pick)** | **96.1** | **43.8** | **26.4** | **150.5** | **~161.6** |
| Art q82, music M2 | 96.1 | 38.4 | 31.8 | 145.1 | ~156.2 |
| Art q75, music M3 | 81.1 | 32.9 | 52.4 | 124.5 | ~135.6 |

- **Art:** all 597 WebP encoded at q90 / q82 / q75 (libwebp method 6, lossless alpha). A file already at or below a setting stays as it is, because re-encoding it only adds loss. The 7 over-stored files are also cut to 50% or 75%, keeping 2x the largest drawn size. Savings: q90 1.7 MB, q82 16.7 MB (backdrops 7.2, story 2.1, enemies 1.8), q75 31.7 MB.
- **Music:** re-encoding today's Opus would stack a second loss on the first, so the trial recorded 10 mixes and one stage's stems fresh from the game's synth (`tools/music/record.mjs`) and encoded them at each bitrate. M1 = mix 64 kb/s, stereo stems 56, mono stems 32 (today 80 / 64 / 40); M2 = 56 / 48 / 28; M3 = 48 / 40 / 24. Savings: M1 9.8 MB, M2 15.2 MB, M3 20.7 MB. Below M1 the 8 to 12 kHz band (shimmer, cymbals) loses detail fast: noise there climbs from -13 dB at 80 kb/s to -9 at 56 and -4 at 48 on Story Dusk.

## My pick: art q82 + music M1, about 26 MB (15%) off, app about 188 → 162 MB
I flipped original against each setting on all six hard cases, at 1:1 zoomed 3x and at phone size. At phone size I can't tell q82 from the original anywhere. q75 visibly softens the jaguar's fur hatching at 1:1 and adds 8x8 block edges to the World 10 night sky gradient (+5% edge energy on block borders, no colour shift: an earlier teal cast I saw was my own contrast stretch), so q75 fails the no-visible-loss bar. q90 saves almost nothing, because the files are already near it. On music, M1 keeps the highs, but **I can't listen**: the call is ears-first. The clips on the page (today, M1, M2, M3 and a high-bitrate reference) are there for Matt on headphones and on the phone speaker.

## Risks
1. **Second generation:** the q82 files are re-encoded from lossy q85 to q95 files. If the original lossless masters exist (the HF starts under tools/art), encoding from them is cleaner and slightly smaller.
2. **Music is a re-record:** the new files must pass the loop-seam check (`tools/music/seam.py`) and a listen in every place they play, layered stems included. The tier bots and calibration are not affected (no 1-1 gameplay change).
3. **Probe coverage:** 315 images were never seen (World 5's Meeca stage creatures, the title clips, some story art); those get only the re-encode, never a resize. A drawn size above 1x is a floor, not an exact number (stretched caches). Each of the 7 resizes needs its frame rectangles scaled in the same change.
4. **App size** assumes the APK shrinks byte for byte (WebP and Opus don't compress further in the zip). Google Play caps an app bundle's base download (about 200 MB, to check before the closed test); 188 MB is close to it, and this buys headroom.
5. **Found on the way:** `stage-w8.beat.webm` is nearly silent (peak -35 dB, mean -62 dB, 226 KB): a broken stem or a deliberate hush, worth a listen. Some mixes peak above full scale before encoding (signature 1.68, score_mercy 1.63).

## The 10 biggest animation sheets (lead's question: fewer frames or skeletal instead?)
| sheet | KB | px | frames | frame w x h (median) | clips | packing | see-through in frames | near-duplicates |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|
| queen-anim.webp | 2748 | 2048x8172 | 184 | 369x203 | 14 | 88% | 48% | 0 |
| prowler-anim.webp | 2063 | 4096x2951 | 172 | 385x176 | 13 | 93% | 53% | 0 |
| soldier-anim.webp | 2005 | 2048x5721 | 179 | 211x299 | 10 | 94% | 37% | 0 |
| croc-anim.webp | 1920 | 4096x2056 | 117 | 360x150 | 13 | 77% | 48% | 0 (+25 reused) |
| seamstress-anim.webp | 1884 | 2048x6664 | 100 | 341x326 | 4 | 89% | 44% | 10 |
| flicker-anim.webp | 1805 | 2048x2544 | 307 | 131x108 | 13 | 82% | 39% | 0 |
| goldsnake-anim.webp | 1515 | 2048x2578 | 155 | 174x147 | 9 | 91% | 55% | 0 (+1 reused) |
| jaguar-anim.webp | 1298 | 2048x2554 | 70 | 378x180 | 6 | 87% | 50% | 0 |
| pell-anim.webp | 1272 | 2048x3512 | 122 | 206x277 | 7 | 89% | 41% | 0 |
| eagle-anim.webp | 1063 | 2048x2545 | 52 | 318x252 | 4 | 83% | 55% | 0 |
These 10 sheets are 17.2 MB and 1,458 frames. They are already packed tight (77 to 94% of each sheet is frames), each frame is cropped to its creature (37 to 55% see-through inside a frame is just the silhouette), and almost no frame repeats (10 near-duplicates in the seamstress; the croc already reuses 25). Their clips play at 8 to 16 fps. So compression has little left to take, and the size is the frame count. Halving the frames would roughly halve these 17 MB, but motion at 4 to 8 fps would look choppy against Matt's polish bar. Shortening the longest clips is the gentler cut. Skeletal animation would be far smaller, but it is a re-authoring job with a different (rigged) look, not a compression setting.

## Top 50 files by size (running total of the 176.9 MB build)
| # | KB | running MB (%) | file |
|--:|--:|--:|:--|
| 1 | 3890 | 3.8 (2.1%) | built JS: assets/index-CRPGLEz5.js |
| 2 | 2749 | 6.48 (3.7%) | enemies/queen-anim.webp |
| 3 | 2063 | 8.5 (4.8%) | enemies/prowler-anim.webp |
| 4 | 2006 | 10.46 (5.9%) | enemies/soldier-anim.webp |
| 5 | 1920 | 12.33 (7.0%) | enemies/croc-anim.webp |
| 6 | 1884 | 14.17 (8.0%) | enemies/seamstress-anim.webp |
| 7 | 1805 | 15.93 (9.0%) | characters/flicker-anim.webp |
| 8 | 1516 | 17.41 (9.8%) | enemies/goldsnake-anim.webp |
| 9 | 1369 | 18.75 (10.6%) | music/storyDusk.mix.webm |
| 10 | 1298 | 20.02 (11.3%) | enemies/jaguar-anim.webp |
| 11 | 1273 | 21.26 (12.0%) | enemies/pell-anim.webp |
| 12 | 1242 | 22.48 (12.7%) | music/world9~c.mix.webm |
| 13 | 1241 | 23.69 (13.4%) | music/jennifur.mix.webm |
| 14 | 1236 | 24.9 (14.1%) | music/ending.mix.webm |
| 15 | 1222 | 26.09 (14.7%) | music/signature.mix.webm |
| 16 | 1205 | 27.27 (15.4%) | music/score_bloom.mix.webm |
| 17 | 1202 | 28.44 (16.1%) | title/clip-pair-laugh.webp |
| 18 | 1198 | 29.61 (16.7%) | music/score_finale.mix.webm |
| 19 | 1128 | 30.71 (17.4%) | music/map-3.mix.webm |
| 20 | 1124 | 31.81 (18.0%) | music/score_mercy.mix.webm |
| 21 | 1070 | 32.85 (18.6%) | sfxrec/takes.mp3 |
| 22 | 1064 | 33.89 (19.2%) | enemies/eagle-anim.webp |
| 23 | 1051 | 34.92 (19.7%) | music/storyStorm.mix.webm |
| 24 | 1050 | 35.95 (20.3%) | music/world3~c.mix.webm |
| 25 | 1049 | 36.97 (20.9%) | music/world8~c.mix.webm |
| 26 | 1018 | 37.96 (21.5%) | music/results~c.mix.webm |
| 27 | 1012 | 38.95 (22.0%) | enemies/ocelot-anim.webp |
| 28 | 988 | 39.92 (22.6%) | music/world7~c.mix.webm |
| 29 | 970 | 40.86 (23.1%) | music/map-7.mix.webm |
| 30 | 941 | 41.78 (23.6%) | characters/cels-4.webp |
| 31 | 933 | 42.69 (24.1%) | title/clip-pokey-cheer.webp |
| 32 | 931 | 43.6 (24.7%) | music/score_pokey.mix.webm |
| 33 | 922 | 44.5 (25.2%) | characters/cels-6.webp |
| 34 | 895 | 45.38 (25.7%) | props/w5-props.webp |
| 35 | 873 | 46.23 (26.1%) | characters/cels-5.webp |
| 36 | 870 | 47.08 (26.6%) | music/world4~c.mix.webm |
| 37 | 858 | 47.92 (27.1%) | music/map-9.mix.webm |
| 38 | 834 | 48.73 (27.6%) | music/world6~c.mix.webm |
| 39 | 825 | 49.54 (28.0%) | w6to10/creatures/sentry-anim-0.webp |
| 40 | 788 | 50.31 (28.4%) | props/w3-props.webp |
| 41 | 778 | 51.07 (28.9%) | music/world2~c.mix.webm |
| 42 | 765 | 51.81 (29.3%) | music/score_dread.mix.webm |
| 43 | 760 | 52.56 (29.7%) | title/clip-pokey-look.webp |
| 44 | 759 | 53.3 (30.1%) | enemies/turtle-anim.webp |
| 45 | 740 | 54.02 (30.5%) | story/hd/meeca-1.webp |
| 46 | 740 | 54.74 (30.9%) | story/live/council.webp |
| 47 | 739 | 55.46 (31.4%) | props/w2-props.webp |
| 48 | 736 | 56.18 (31.8%) | title/clip-meeca-wave.webp |
| 49 | 726 | 56.89 (32.2%) | story/hd/meeca-0.webp |
| 50 | 726 | 57.6 (32.6%) | music/world1~c.mix.webm |

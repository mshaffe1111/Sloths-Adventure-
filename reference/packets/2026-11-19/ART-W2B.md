# ART-W2B: 2-6's water wheel painted (rim + spokes, the buckets dry and spilling, the millrace lip): Hugging Face first; wired into wheelDraw.ts.
Art + engine draw, Opus 5.5 high. Written 8:17 PM ET 11-18 (by `date` in the same command); tonight's 2-6 half of ART-W2B (2-7's boat, letter,
door and weir are a later job). BOX: show-first sheet to the lead in 60 min; hash by 11:15 PM ET (cutoff 11:30); or 400k REAL context.
Hugging Face cap: $4 (the lead's call; balance ~$51.3; reserve ~$10). Hugging Face environment. A FRESH member. Keep reads lean.
Role card reference/roles/ENGINE.md + reference/methods/hf-art.md (the token never leaves the environment: never in code, commits, files,
messages or memory, law 8; log every job in reference/art/HF-SPEND.md with what it bought and the balance after; "build an animation's
frames from ONE painted take cell"). Read STAGE-RULES §4-5b (painted, to scale with Pokey), LESSONS.md once (D57/D87: call
ReadNotifications whenever a notice says pending, at every push and before every report; D79 whole screen; D81 drawcheck), ENG-26's
REPORT on origin/t-eng-26 ("What ART-W2B must paint": the sizes in px and Pokeys; hook wheelDraw.ts drawWheel(ctx, wheel, buckets, seen);
the 'back' layer + afterGround hook ENG-26b added), 2-6's design (origin/t-design-26 reference/design/2-6.md line 61: the art asks), and
the art to match: World 2's props (src/assets/props/w2-props.webp, dressnew-w2.webp, puzzle-kit raft) and ART-W2A's REPORT (origin/t-art-w2a:
how it matched Matt's painter with Qwen-Image-Edit and keyed cleanly).
BASE: branch t-art-w2b from t-eng-26's head when you start (ENG-26b is working there tonight: pull its latest; do not push to t-eng-26).
1. SHOW FIRST (60 min): the rim + spokes at R180 (360 px across, 4.0 Pokeys; R160/R200 scale from it or own takes, say which), the bucket
   (120 px trough, 1.35 Pokeys, ~34 px walls, its floor = the platform top) dry and spilling, the millrace lip; matched to World 2's
   painter; a contact sheet at game size on a 2-6/W2 backdrop, upright + sideways crops, edges at 3x on light and dark. WAIT for the OK.
2. Wire: drawWheel paints the rim/spokes on the 'back' layer, the buckets' art = their floors (art = collider), spilling near the top;
   inventory + master catalog labelled (world, use, footing, layer, ship size); no image over 4096 px; perf: time the draw (ENG-26 counted
   1 save/restore, 2 arcs, 1 spoke path, 4N fillRects per wheel per frame: the painted one must stay within PERFORMANCE-RULES §1).
3. Checks for a draw change: tsc, the suite (background), BASE_PATH build + chunkcheck, artcheck, drawcheck, clipcheck, knowncheck,
   generality, roadmapcheck, artUse.test, the CI tool line, lockall vs main (no layout moves).
4. Polish: stills on ENG-26b's ?fixture=wheel (upright + sideways, whole screen): Pokey boarding, mid-ride, stepping off; a clip.
REPORT reference/qa-reports/ART-W2B/REPORT.md: hash, HF jobs + cost + balance, the sheet, stills/clip, perf numbers, Polish check, Learned.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries REAL context % and a time from `date` run in the same command.

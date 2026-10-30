# tools/: making art, animation and the test link

None of this ships in the game: `tsconfig.json` excludes `tools/`, and Vite never imports it. Pictures, clips and model weights stay out of git (`tools/.gitignore`). They live on Hugging Face or get rebuilt.

## Setup

- **Python 3.11+**:
  `pip install --break-system-packages huggingface_hub pillow numpy scipy torch spandrel`
  `torch` and `spandrel` are only needed for `upscale/`.
- **Node 20+.** The screenshot scripts import `playwright`; install it with `npm i -D playwright` or use a global copy, then `npx playwright install chromium`.
- **ffmpeg**, for the preview videos.
- **Hugging Face access**: either set `HF_TOKEN` in the environment, or log in once with `hf auth login`. The scripts read `HF_TOKEN` first, then the saved login.
  - Never write the token into a file, a script, a commit or memory.
  - Jobs receive it as a job secret, never as a plain environment value.

All paths are worked out from each script's own location. `tools/art/` is the working folder: downloads land in `tools/art/gen/stills`, `tools/art/gen/clips`, `tools/art/reanim/in` and so on, which git ignores.

## tools/art/: the Hugging Face pipeline

| Folder | What it does |
|---|---|
| `gen/` | Generation jobs on Hugging Face (see below) |
| `gen/spec-*.json` | Every job spec that was run, with its exact prompts, seeds and start pictures. Copy one to start a new job. |
| `gen/jobs.txt` | Log of launched jobs: tag and job id |
| `jw.py` | Status and last log lines of a job: `python3 tools/art/jw.py <job id>` |
| `jobwatch.py`, `trainwatch.py`, `prowl/job/wait.py` | Wait on jobs until they finish |
| `style/` | The game-wide style model: dataset build (`build.py`), launch (`launch.py`), ai-toolkit config (`slothadv_style_v1.yaml`) |
| `motion/` | The motion model for Wan 2.2 I2V: `build.py` makes the clip dataset, `launch.py` is v1, `launch2.py` is v2 (82 clips in `clips2/`), plus the yaml configs |
| `train/` | Character models (`pokey_qwen_v1.yaml`); `clips.py` holds `key()` (cuts the flat grey background out of a frame) and the clip-sheet helpers; `liveplates.py` makes the moving story plates; `infer/` holds older inference and launch scripts |
| `reanim/` | Re-animating creatures already in the game: `extract.py` cuts their old poses out of the atlas, upscales them and writes `meta.json`; `pack.py` packs chosen clip frames into `src/assets/enemies/<c>-anim.webp` and `src/game/<c>AnimData.ts`; `pack_free.py` does the same for a creature with no old atlas (the golden snake, from `gold.json`); `preview_anim.py` renders a grid video of the packed sequences at game speed |
| `prowl/` | The Shadow Prowler: clip jobs, `pack_anim.py` and the preview |
| `w5/` | World 5 creatures (2026-10-26), for sessions whose connector can neither download from HF nor write its repos. HF jobs mount the bucket `mshaffe111/w5-xfer` at `/out`: `w5cpu.py` (clip contact sheets, start pictures from the game's atlases or from story cels such as Pell's, `cels:lp`, with a lantern's painted glow cut, `reanim/pack.py` packing, carrier PNGs), `w5gpu.py` (on-model edits with or without the character models, Wan clips with flip/tone fixes and `clean`, which paints an edit's lantern glow, ground shadow and pale sticker outline back to the grey before the clip), `w5train.py` (trains the five new creature models from the concept takes; spec from `make_train_spec.py`). Back on the machine: `unpack_carrier.py`, `repack.py` (pick frames into the game's sheet; several all-frames sheets join with `+`; `--ground` puts each frame's feet on the line, `--derim` cuts a sticker outline, `--k/--units` add the scale), `pack_poses.py` (a model's pose stills into a creature atlas), `meeca_carve.py`, `pack_blanket.py` (the blanket stills, one darned patch on both), `edit_meta.py`, `preview_sheet.py`; `jobargs.py`, `make_clip_specs.py` and `make_pell_specs.py` (Meeca's stage: Pell, the soldiers, the blanket) write the job args and specs. `train_w5creatures.py` is the local retrain route. |
| `medals/` | The Trophy Room's painted medals (2026-10-26): `make_spec.py` writes `gen/spec-medals.json` (four tier medallions and the emblems, on flat grey), `medals_gpu.py` runs it as one GPU job with the style model, writing to the bucket `mshaffe111/w5-xfer` under `medals/` (raw pictures, contact sheets, carrier PNGs); `picks.json` names the takes used; `pack.py <unpacked dir>` cuts them from the grey and packs `src/assets/medals/medals.webp` + `src/game/medalAtlasData.ts` (each medallion's enamel middle and radius, where the emblem sits) and a close-up `sheet.png` |
| `w5puzzle/cut.py [w5puzzle\|w6\|w1to4]` | Cuts Matt's Gemini sheets for Meeca's puzzle stage, World 6 and the Worlds 1-4 puzzle upgrades (the sheets are kept in git under `reference/prop-sheets/<folder>/`) into one transparent PNG per cell plus a contact sheet, in `tools/art/<folder>/cut/` |
| `w6/swim/` | Pokey's World 6 swimming (2026-10-27, not wired in): `swimgpu.py` is the HF job (Pokey-model stills, then Wan clips with the motion model, results in the bucket `mshaffe111/w5-xfer` under `w6swim/`, clips also as carrier PNGs), `make_specs.py` writes the specs and job args, `loops.py`/`strip.py` pick loop frames, `cut.py` keys and scales the picks in `picks.json` to the standard hero (`frames/`, `frames/meta.json` with waterline anchors), `preview.py` makes the contact sheet and GIFs. `jobs.txt` logs the jobs and the spend. The chosen frames are copied into git at `reference/animation-sheets/pokey-swim/` (pictures under `tools/` are ignored). |
| `hfbatch/` (every-stage pieces) | The painted checkpoint post, exit gates (one per world), pit water (Worlds 1, 3, 4, 5), pickups, Thorn Gate, story finds and 4-8's netting (2026-10-29, wired in by `src/game/stageArt.ts`): `stagestarts.py` pastes each start up from the game's own painted art (kits, World 5's pennant and totem, World 6's water strip; `open <takes dir>` makes round 2's open-gate starts from the picked shut takes), `make_stage_spec.py <commit>` writes `spec-hfb-stage-<n>.json` for `w6to10/img2imggpu.py` (bucket `mshaffe111/w5-xfer` under `hfbatch/stage/`), `stagecut.py <takes dir>` keys, cleans and packs the picks in `stage-picks.json` into `src/assets/props/stage-art.webp`, `gates/w<N>.webp`, `pitwater/w<N>.webp` and `src/game/stageArtData.ts`, with review sheets under `reference/prop-sheets/qa-notes/hf-art-stage/`. `jobs.txt` logs the jobs and spend. Shots: `tools/art/shot-stage-art-all.sh`. |
| `anim/` | Matt's Gemini characters animated (2026-10-28, not wired in): `prep_starts.py` lays the chosen cut-out cells (`w5puzzle/cut.py`) on the grey as small WebPs for the bucket, `make_specs.py` writes `spec-anim.json`, `animgpu.py` is the HF job (Wan 2.2 + the motion model, results in `mshaffe111/w5-xfer` under `anim/`, as carrier PNGs too), `fetchcpu.py` brings old `slothadv-gen` clips (crab, piranha) into the bucket on a CPU job, `loops.py`/`strip.py` pick frames, `cut.py` keys and scales the picks in `picks.json` (every move of a character at one scale, from its Gemini cell) into `frames/<name>/`, `preview.py` makes the GIFs and contact sheet. `jobs.txt` logs the jobs and the spend. The chosen frames are copied into git at `reference/animation-sheets/<name>/`. |
| `hazard/` | The repeating hazard animations made painted (2026-10-29, Matt: the falling rocks' code squares): `gritcut.py` keys the Hugging Face pebble takes (start `hfbatch/pebblestart.py`, spec `hfbatch/make_pebbles_spec.py`) into `src/assets/props/w4-grit.webp` and `src/game/w4GritData.ts` with a review sheet; `rec-rocks.mjs` records a stage's falling rocks at a true 30 fps (the page's clock stepped frame by frame) upright and sideways; `shots.mjs` takes before/after stills of each swept effect (run it against a dev server of the base branch for the before set); `shadows.mjs` draws the old code shadows beside the soft shadow sprite on a real frame. |
| `w7slide/` | 7-4's slide art (2026-10-29, not wired in): `envstarts.py`/`envstarts2.py` paste up img2img starts from the World 7 kit and made props, `pokeycells.py` cuts Pokey's from-behind cells off slomatt/02 (with the satchel check), `seamstarts.py` rolls a texture so its seams sit inside for a repaint, `make_spec.py` writes the specs and the `hf_jobs` args, `slidegpu.py` is the HF job (it reads itself and its spec from raw GitHub at a pushed commit, the starts from `reference/prop-sheets/qa-notes/7-4-slide-art/starts/`, writes to `mshaffe111/w5-xfer` under `w7slide/`), `cut.py` keys, makes the textures seamless and packs `picks.json` into `src/assets/w7slide/` with `manifest.json`. `jobs.txt` logs the jobs and the spend. |
| `rope/` | Pokey's shimmy rope crossing and the painted rope (2026-10-29, wired in): `cut.py` cuts Matt's Gemini rope sheet (`reference/prop-sheets/gemini-batch-2026-10-29/pokey-rope-hand-over-hand.jpg`) into `frames/f1..f7` with the sheet's own rope painted out except under the paws, each with its grip on the rope and torso middle (`frames/meta.json`); `pack.py` packs the frames named in `picks.json` into `src/assets/hero/hero-rope.webp` + `src/game/heroRopeData.ts`; `pack_kit.py` cuts World 2's painted rope (its kit liana) into a seamless tile and the swing frame's lashed post into `src/assets/props/rope-kit.webp` + `src/game/ropeKitData.ts`. The Hugging Face in-betweens: `prep_start.py` (the start picture), `ropegpu.py` (the job: `anim/animgpu.py` with the last frame pinned, `PASS=1|2`), `cutclip.py` (clip frames cut like the cells); `jobs.txt` logs the jobs, the spend and why the clips were not used. `preview.py` renders the packed cycle at game timing (video + strip); `shot-rope.mjs` and `rec-rope.mjs` screenshot and record 1-3's rope in the real game. |
| `edges/` | Clean cut-out edges on the painted backdrop strips (2026-10-29, polish report VI-1, VI-5, VI-6). **Every new near, mid or canopy strip goes through it.** `defringe.py <src> <dst>` trusts only paint away from the cut, bleeds it 16 px outward (normalised Gaussian fill), enlarges colour and alpha with Real-ESRGAN (`--esrgan`, needs `torch spandrel` and `upscale/anime6b.pth`), erodes the alpha 1 px and feathers it with hair vines protected, then draws an even 1.6 px ink line at 0.42x the local colour (`--ink`); `--unmix r,g,b` takes a light key's halo out (W1 canopy), `--despill` the magenta spill (World 5), `--keep-line` keeps a strip's own clean ink line (World 5). `run_all.py` rebuilds every strip from its pinned source commit: Matt's native-resolution near and mid strips (hf-art-backdrops, already joined) cleaned in place with the ink line scaled to them (`--px`); the 2048 ones (W1 canopy, World 5's moods) through A1's seamless join first (`scripts/strip-seamless.py`, VI-4), then the edge fix (add a row to `RECIPES` for a new one; `--only` for single files, `--clean` for the no-ink take, `--out` to compare). `unpanel.py` cut the unkeyed background panels out of w5dusk2-near; `grade.py` (and `defringe.py --grade`) warms World 4 (VI-18). `measure.py` prints edge brightness (rim vs the paint inside, how even the edge is, magenta spill), `proof.py` the before/after crops and table, `shots.mjs` the in-game upright and sideways shots (`PORT=` for a second server) |
| `upscale/up.py` | 4× upscale with Real-ESRGAN. Needs `RealESRGAN_x4plus_anime_6B.pth` from the Real-ESRGAN GitHub releases, placed beside it as `anime6b.pth` |
| `w2art/`, `w3/`, `w3b/`, `w3c/`, `packprops.py`, `packkits.py`, `cutprops.py` | Cutting Matt's Gemini prop and kit sheets into atlases (`src/assets/props/w2-props.webp` + `src/game/w2PropsData.ts`, `w3-props`, `src/assets/kits/w*.webp` + `kitAtlasData.ts`, the World 1 `proto/props*-atlas.webp` + `proto*AtlasData.ts`) |
| `shot-*.mjs`, `burst-enemy.mjs`, `rec-enemy.mjs`, `probe-*.mjs` | Playwright screenshots against the dev server on port 4301 (`npx vite --port=4301 --host=127.0.0.1 --strictPort`). They use the dev hooks `window.__play(id)` and `window.__engine()`. `shot-gold.mjs <stage> <type> '<json poses>'` forces an enemy into poses. Add `?lessons=off` to skip the lesson cards. Output goes to `tools/art/eshots/`. |
| `storydoc/extract.ts` | Pulls the story text out of `src/game/story*.ts` for review documents |

### Generating

All jobs run on Hugging Face with `run_job(image='ostris/aitoolkit:latest', flavor='rtx-pro-6000')`, at about $2.75 an hour.

1. **Stills.** Run `python3 -I tools/art/gen/launch_stills.py tools/art/gen/spec-X.json`. This uses Qwen-Image plus the style model or a character model. The results land in `mshaffe111/slothadv-gen/stills/`.
2. **On-model edits.** Run `launch_edit.py`. This uses Qwen-Image-Edit-2509 with reference pictures, e.g. a new pose of a character from a picture of it.
3. **Clips.** Run `launch_clips.py spec.json [gpus]`.
   - It uses Wan 2.2 I2V with the motion model (the spec's `"motion"` block names the high- and low-noise files).
   - Start pictures are 1024 square on flat grey; clips come out at 832×480 (or 704×704) with 49 frames.
   - Results land in `slothadv-gen/clips/<name>.zip`.
4. **Download.** Run `python3 -I tools/art/gen/fetch.py stills <prefix>` or `fetch.py clips <names...>`. This also makes contact sheets (`gen/clips/<name>_sheet.jpg`).
5. **Pick frames.** Look at the sheets. `gen/loopfind.py <clip> <minlen>` finds loop points by matching outlines.
6. **Pack.** Run `UP=<px per old px> KEY=tight python3 -I tools/art/reanim/pack.py <creature> '{"seq": ["clip", [frames]]}'`.
   - Aim for 3–4 sheet pixels per game unit.
   - Use `KEY=tight` for grey-skinned creatures.
7. **Wire in.** In the creature's sprite file, use `makeCreatureAnim` from `src/game/creatureAnim.ts`, and keep the old single poses as the fallback.

## tools/testlink/: Matt's private playable test link

The test link is https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb. After every round of changes, rebuild and republish it **in place** (same URL) so Matt can play before anything is pushed.

```
python3 tools/testlink/build.py "what this build adds"
```

Then publish with the Artifact tool: `url` = the link above, `file_path` = `tools/testlink/dist/index.html`, `root` = `tools/testlink`, `files` = the map in `tools/testlink/filesmap.json`. `build.py`'s header explains the 511-file limit and how to clear old files.

## tools/inspect/: the stage inspector

Reads every stage's layout (read-only use of `src/game`) and reports beats along the main route, dead time, rests, look-alike stages, goal shares, length, jump difficulty and noisy-thumb bot success per jump (an edge-level model, not an engine run). Writes `tools/inspect/out/report.json` and `report.html` (git ignores `out/`); `--html <path>` and `--seed <n>` change the defaults.

```
npx tsx tools/inspect/inspect.ts --worlds 1-5
npx tsx --test tools/inspect/analyze.test.ts
```

**The first-timer bot** (`--firsttimer`, `firsttimer.ts`, `firsttimerReport.ts`; the pre-QA pass, HANDOFF §6) plays every stage in the
REAL engine (`src/game/realPlay.ts`) the way a new player on a phone does, on Easy with a kid's thumb and on Normal with an adult's: it
goes the way the stage leads, flicks a plain short jump only when stopped or at an edge (a double only where a single failed), climbs a
trunk it touches, stands at a puzzle and is put past it, and heeds warnings and Dot's tips about a second after they are on screen. The
thumb follows Matt's Gemini research (latency N(+90 ms, 65 ms) kid / N(+30, 30) adult, hold noise 80 / 35 ms, 8% / 3% of flicks cut to a
2-frame tap, drift ~N(+4, 2) px/s with reversal dead time, log-normal late lift-off, 0.4 s hesitation and a 133-200 ms thumb swap before
a tap). Dot is followed through the game's own guide queue. It reports, per stage and setting: harm in the first 5 s (and holding right
from frame one), the first hit of each kind against the tip that teaches it, stuck spots (8 s without progress) and loops, hits and
lives a minute, Dot's repeats, gaps under 10 s, lines up 20 s+ with their thing out of reach, re-teaching and long lines; and the
Gemini gates (survival per jump 85% / 70%, minimum input window 300 / 167 ms measured in the engine, peak stress per burst 2.5 / 5.5,
backtracking ratio). Every finding names the `reference/STAGE-RULES.md` rule it breaks. A table and a worst-first list go into
`report.html`, everything into `report.json` (`firstTimer`).

```
npx tsx tools/inspect/inspect.ts --worlds 1-4 --firsttimer [--ft-trials 2] [--ft-windows 12] [--stages 1-7,2-2] [--seed 1]
npx tsx --test tools/inspect/firsttimer.test.ts
FT_TRACE=1 ...   # every jump the bot tries, on stderr;  FT_FRAMES=16.8,18.7 ...   # every frame in that stretch of play
```

**Pacing and difficulty bands** (`pacing.ts`, `bands.ts`; every run). Pacing measures, per stage and setting on the inspector's own
route and beats, action density, rhythm groups (bursts and their actions), rest pads, the longest walk with no action and a tension
curve in 9 parts, against Gemini's event density table and sawtooth (STAGE-RULES §2 "Pacing", "Tension"); a pacing block on each card
and a worst-first list. Bands score every stage 0-100 per setting (first-timer lives lost a minute, the noisy bots' hardest jumps, peak
stress, the narrowest input window, dead time, length; with `--firsttimer`, else the inspector's parts alone), chart each world's band
and flag STAGE-RULES §1b (a world below the one before, a stage above the next world's middle or below the previous one's, the per-jump
floors). Both go into `report.json` (`stages[].pacing`, `bands`).

```
npx tsx --test tools/inspect/pacing.test.ts tools/inspect/bands.test.ts
```

(`--seed` reaches the hand-built stages only: the inspector builds the generated ones, 5-6 to 5-9 and Worlds 6-10, from their designed attempt, so every seed shows the same layout there. The 200-roll tool below builds them the way the game does.)

### The 200-roll tool (how much a stage changes from roll to roll)

Gemini's expressive range analysis (`reference/GEMINI-PCG-RESEARCH.md` part 3, Smith & Whitehead 2010), with the thresholds of `reference/STAGE-RULES.md` §2. Every stage is built `--rolls` times through the game's own entry path (`setLayoutVariant` + `generateStage`, so the generated stages make their validator re-rolls; `eraRoll.ts`), and each roll is measured on the inspector's route and beats: quick-player length, dead time and the longest quiet stretch, beats a minute, the action mix, linearity, leniency, height range, the pieces, props and puzzle rooms it uses. Per stage: how many different layouts and action orders, the variety score (mean 1 - cosine of action 3-grams over every pair of rolls, target 0.35+) and the distance between the same 20 s of two rolls, two heat maps (straightness x forgiveness, length x quiet time), and the rolls that break a rule (under 2:00 / 1:40 for a climb, a quiet stretch over 4 s, quiet time over a fifth of the stage, the level check, looking like the same roll of another stage of the world, and on `--bots` rolls the kid and adult jump bots), with the worst rolls listed as `?layout=N` to replay. Runs the stages in worker processes (`--jobs`, default all cores): Worlds 1-5 x 200 rolls took 13 minutes on 4 cores (51 when other helpers had the machine busy), plus about 3 for the look-alike pass; `--rolls N` and `--stages` cut it down, `--raw file` keeps every roll and `--from file` redraws the report from it without rolling. Writes `tools/inspect/out/era.json` and `era.html`.

```
npx tsx tools/inspect/era.ts --worlds 1-5 --rolls 200 [--html out.html] [--json out.json] [--jobs 4] [--bots 10] [--look 25] [--stages 1-4,5-6] [--raw rolls.json | --from rolls.json]
```

`src/game/rollGuard.test.ts` (in the suite) samples 10 rolls of every World 1-4 stage and fails if one is under 2:00 or fails the level check.

### The stage walk and the seam detector (required for any change to a look)

Matt, 2026-10-29: "what we lack the most is seams and putting that extra cleanness on things." Shots at spots a helper chose miss most
of it, so every helper that changes a look attaches a clean walk of the stages it touched, upright and sideways, with the detector's
counts before and after (`reference/LEAD-PLAYBOOK.md`, "walk the stages, not the spots").

```
pip install opencv-python-headless scipy          # once (numpy and Pillow are already there)
npx tsx tools/inspect/walk.mjs --stages 1-2,5-1   # a stage both ways: about 3-5 minutes each on 4 cores
npx tsx tools/inspect/walk.mjs --worlds 1-10 --jobs 3   # everything (stages, boss lairs, 4-D, 5-M): a few hours
```

`walk.mjs` makes a development build (or reuses `--dist DIR`), starts each stage in it at 390x844 and 844x390 (dpr 2), stops the game's
own loop and runs the engine one 30 fps frame at a time, with Pokey moved along the inspector's main route (`route.ts`, worked out from
the stage exactly as the browser built it) at a brisk run, unhurt and never blinking. It saves a frame every half screen (`--step`), the
canvas with a log of every draw call on it (`walkHook.js`: each picture's file, source rect, box, blow-up and clip; each code fill or
line), the phone's screen with the HUD, and a 4 s clip from the middle of the stage (`--clip S`). Then `seams.py` reads the frames and
writes, per stage and orientation, `finds/*.jpg` (a crop of each finding, boxed), `sheet.jpg` (the contact sheet, findings marked),
`clip.mp4` and `seams.json`; and for the run `seams.md` (counts per stage and the causes, most spots first) and `seams.json`. The canvas
pictures are deleted once read (`--keep-canvas` keeps them). Options: `--orient up,side`, `--seed N` (the roll), `--out DIR`
(default `/tmp/walk`), `--no-detect`, `--jobs N`, `--dprocs N`.

What the detector flags (one finding per cause per frame, with every spot of that cause in the frame listed under it):
- **line**: a hard straight line where the colour steps (a tile join, a strip join, a cut-out edge, a code ground column's side) or a thin
  dark or light line. `edge` when it lies on a drawn piece's edge or clip (high confidence); a step inside one picture only when long.
- **fringe**: a light halo or a dark ring round a cut-out (measured on the picture file; a `proof` crop of the file, x3 on dark and grey).
- **key**: magenta or green key colour on a cut-out's soft edge, or near-pure key colour on screen.
- **repeat**: the same piece drawn several times close together, or the same patch of pixels again within the screen.
- **style**: a picture blown up far more (blurry) or with a far heavier outline than the pieces round it.
- **shape**: a code-drawn shape still showing: flat rects, ellipses, paths, code lines and dashed lines, code-made textures (a pattern of
  code fills, a code-made canvas used as a piece of the world: the green pit blocks), flat areas under code fills.
- **float**: a prop with a flat solid base and a 6-80 px gap under it to the ledge below (the stage's colliders).
- **hud**: HUD or text cut off by the screen's edges, or text on top of other text.

Re-run the detector alone: `python3 tools/inspect/seams.py DIR [--stages 1-2] [--one DIR/1-2/up] [--report-only]`. The walk is driven
by the route, not by the first-timer bot: he never gets stuck, so every part of the stage is seen, but his feet slide along the route
(on a vine or rope he is moved, not swinging). 4-D (Dot's flight) and 7-4 (the slide) run on a clock with right held.

## tools/control-test-collector.gs

This is the Google Apps Script behind the touch-control test (`#ctest`). It writes testers' recordings into Matt's Google Sheet. The real key lives only in Matt's deployed script and in the page, and is not repeated here.

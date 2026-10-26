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

## tools/control-test-collector.gs

This is the Google Apps Script behind the touch-control test (`#ctest`). It writes testers' recordings into Matt's Google Sheet. The real key lives only in Matt's deployed script and in the page, and is not repeated here.

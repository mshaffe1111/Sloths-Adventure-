# Method: Hugging Face art (all kinds)
Last proven: 2026-11-01, branch hf-backdrops2 (f0ce3abd and later). Produced 11 full backdrop sets, 30+ middle/near strips and 9
far+sky pictures in about 3 hours, for about $12 of GPU. Owner of the last update: the hf-backdrops2 art helper.

## When to use it
Any painted art for the game: backdrops, props, stills. Painted art is required for anything that changes a major part of the look
(STAGE-RULES §4). Never hand Matt a Gemini prompt.

## Steps

**1. The token.** It never goes in code, commits, files, messages or memory. Jobs get it only as the secret
`{"HF_TOKEN": "$HF_TOKEN"}`; the connector fills it in.

**2. Model and job.**
- Model: Qwen/Qwen-Image with the style LoRA `mshaffe111/slothadv-style-lora` / `slothadv_style_v1.safetensors`.
- Docker image `ostris/aitoolkit:latest`, flavor `rtx-pro-6000` (about $2.75/h), `timeout: "1h"`, `detach: true`.
- Volume `hf://buckets/mshaffe111/w5-xfer:/out:rw`.
- The command curls the GPU script and the spec from raw GitHub at a pushed commit. Example:
  `make_spec2.py args <spec> <commit>` in `tools/art/hfbackdrops`.
  - Nothing is written to the bucket by hand.
  - Starts are read from `raw.githubusercontent.com/.../<commit>/...`, so push before you launch.

**3. GPU scripts** (all take `SPEC`, `SUB`, `TAG` env; `PART`/`PARTS` split a spec across jobs):
- `tools/art/w6to10/stillsgpu.py`: text to image.
- `tools/art/w6to10/img2imggpu.py`: img2img from starts.
- `tools/art/hfbatch/striphdgpu.py`: the native-resolution pass. Real-ESRGAN first, then style-model img2img at s25 in overlapping
  full-height tiles round the strip as a circle, so it stays seamless.

**4. Settings that worked.**
- Text to image: 1792x1200 (wide pictures), 30 steps, true_cfg 4, style LoRA 0.8.
- img2img: style LoRA 1.0. 2 strengths x 2 seeds per strip is enough to get a keeper; 3-5 seeds for text to image.
  - middle strips s68/s76;
  - near strips s62/s68;
  - repaint-in-place (keep the layout, finish the crowns) s52/s60.
- Native pass: s25, tile width 1024, `pre: esrgan`.
  - transparent strips on grey (128,128,128);
  - opaque pictures on black (0,0,0).

**5. Starts.** img2img always works from a paste-up start, never a bare prompt, for anything that must key out:
- the world's own painted pieces, cut and rearranged, on flat magenta (255,0,255);
- see `tools/art/hfbackdrops/starts2.py` for the rules: ragged overlapping joins, a continuous ground band, crown blobs, no
  half-transparent pixels, nothing floating.

**6. Parallel runs.** One job is about 8-16 takes, about 10 min including the ~50 s model load. Split big specs with PART/PARTS or
`make_spec2.py <round> <commit> k n` and launch 4-6 jobs at once. Ten jobs ran in parallel today with no queueing.

**7. Getting files back** (the bucket is private, and this machine can't download it):
- Jobs pack their outputs, byte for byte, into greyscale `carrier-*.png` files under 6 MB.
- `hf_fs attach hf://buckets/mshaffe111/w5-xfer/<path>` saves the file under the session's `tool-results/` dir. Copy it from there,
  then `python3 -I tools/art/w5/unpack_carrier.py <carrier.png> <dir>`.
- At most about 8 MB of attachments per hf_fs call: attach 2-3 carriers per call.
- A single PNG can be attached the same way (it shows inline; the saved copy is the full-size file).

**8. Logging spend.**
- Every job id, its start and end time (UTC in the log, ET to Matt) and the estimated cost go in the job log (here
  `tools/art/hfbackdrops/jobs.txt`).
- Cost = minutes x $2.75/60.
- Keep a running total.

**9. Cost per piece** (2026-11-01):
- img2img takes about $0.04 each (25-35 s per 2048x1104 take).
- Text to image about $0.07 each (45 s at 1792x1200).
- Native pass about $0.12 per strip.
- A finished middle or near strip, including 4 takes and the native pass, is about $0.30; a full set (far+sky+mid+near) is about $1.

## The bar
Painted, never flat or blurry. No seams, bands or notches. Crowns whole. Colours graded to the world's light. Pokey reads clearly
against it, upright and sideways. (Example: `reference/prop-sheets/qa-notes/hf-backdrops2/w3-before-after.jpg`, 3-2 and 3-8.)

## Checks before reporting
Contact sheets of every take next to its start, before picking. Then the game shots, both ways up. Then the repo gates (CLAUDE.md
"Checks").

## Pitfalls we already paid for
- **2026-10-31: text to image on magenta does not keep the key.** It painted skies, rain and clouds behind the subject. For anything
  transparent, use img2img from a paste-up.
- **2026-10-31: loose pieces in a start become junk at s72.** They came back as floating roots, upside-down palms and creature-like
  plants. Drop everything not joined to the ground (starts2.py; process.py keyfull drops floating pieces again after keying).
- **2026-10-29: the style model in text to image painted a giant sloth's head into a sky.** For sky-only pictures, run the LoRA at
  0.0001 (effectively off).
- **2026-10-29: "no frame, no panel" in the positive prompt painted frames.** Negatives go only in `neg`.
- **2026-11-01: one text-to-image take came back with a white border frame** (w10gale seed 59) **and one with a flat band of sky**
  (seed 71). Run 4-5 seeds and look at every take.
- **2026-11-01: rich colour must be asked for.** A prompt mood like "mist" or "gale" gives pale, empty pictures. The lead sent them
  back: they read as a big pale area with nothing in it on a phone. Ask for "dark silhouetted ... in the middle distance, rich
  saturated colour, strong contrast".

## Tried and didn't work
- Text to image for transparent strips: no key (see above).
- s72+ img2img on loose paste-ups: junk shapes.
- Repainting an old strip in place to fix its tops at s52-60 works. Above s60 it changes the strip too much, so grade it back to the
  old colours with `tools/art/hfbackdrops/matchold.py`.
- Upright skies from tallstart starts at s30-s58: the start's straight join or smoke slab survives every strength. The sky needs a new
  painted donor (spec-K, 2026-11-01).

- Sky-only text-to-image donors (spec-K, 2026-11-01) stacked above the old far strips, then s30: still failed. Those far strips have
  trunks and crowns running off their top edge, so any sky above shows them cut off under a soft band. No sky can fix it: the far
  strip itself must be repainted with its own sky (the far + sky in one picture way, hf-backdrops.md step 2).

## To try
- Repaint the 9 old far sets without an upright sky the far + sky way (text to image from a prompt matching the old strip, or img2img
  of the old strip with sky room added above at s60+).

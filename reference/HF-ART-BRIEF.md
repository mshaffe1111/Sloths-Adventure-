# Hugging Face art: the shared brief for every art helper (lead, 2026-10-29)

Matt, 2026-10-29: "I've reloaded the Hugging Face. It has $91... all art that's needed... Anything on that audit sheet plus anything
additional has to come from here. I'm not going to do any more Google Gemini stuff." So every new sheet is made on Hugging Face. The
Gemini prompts already written (reference/prop-sheets/gemini-prompts/, reference/polish-report/polish-report-1.txt VI-*) are the content
spec; turn them into HF jobs.

## How (copy the worked example, don't invent a pipeline)
- Worked example, start to finish: the 7-3 ring of chairs on branch `hf-w7-chairs` (tools/art/hfbatch/chairstart2.py builds a start
  collage from the world's own painted pieces; make_chairs_spec.py writes the spec, two strengths x two seeds, style LoRA
  `mshaffe111/slothadv-style-lora`; tools/art/w6to10/img2imggpu.py runs on the GPU; chairscut.py keys, despills, grades and makes the review
  sheet; tools/art/hfbatch/jobs.txt logs every job, its run time and spend). Read that branch first: `git show hf-w7-chairs:<path>`.
- Starts are force-added under tools/art/hfbatch/starts/ and read from GitHub raw at a pinned commit of your branch: push before launching.
- Use the Hugging Face MCP tools (mcp__Hugging_Face__hf_jobs, hf_fs; load with ToolSearch). Raw takes go to the bucket
  `mshaffe111/w5-xfer` under hfbatch/<your area>/.
- The HF token NEVER goes in code, commits, files or memory.
- img2img from the world's own painted kit keeps the style. Text-to-image alone drifts; use it only for a start you then img2img.
- Pokey: use `mshaffe111/pokey-qwen-lora` (pokey_qwen_v1.safetensors; see tools/art/w6/swim/ for how the swim stills used it). Satchel
  rule: strap over his LEFT shoulder, bag on his RIGHT hip; seen from behind the strap runs from screen-left to a bag at screen-right. Check
  every Pokey frame on dark; a drifted face, colour or satchel fails.
- Cost: log run time x ~$2.75/h in jobs.txt. Each helper has a cap in its brief; stop at it and report. hf_whoami shows no balance.

## What passes (the lead reviews every sheet before anything goes in; Matt sees nothing unreviewed)
STAGE-RULES §4 and §5b. In short:
1. Painted, in the world's own style (soft cel shading, thin dark outline, light from the upper left, evenly lit so the game adds the dark).
2. Nothing copy-pasted: variants differ, strips tile with no visible seam or band, no two neighbours alike.
3. It reads as what it is at phone size (look at it at game size, x0.3 or so, on dark and on mid-grey).
4. Clean key: no magenta fringe (clamp r and b toward g on the fringe; see tools/art/cutprops.py, geminicut.cut_cell), no smears, melted
   shapes, extra limbs, text or stray sparkles.
5. Assets under 1 MiB each where possible, never over 4 MiB; webp.
Make a review sheet per piece under reference/prop-sheets/qa-notes/<your area>/ with every candidate and the pick on dark and mid-grey,
look at it yourself the way Matt will on a phone, redo what fails (within budget), and name any rough spot plainly. Report with a "Polish
check" section.

## Repo rules
- Your own worktree and branch (named in your brief), made from ccr-0d59a91c-oy3imz. Push it (git push -u origin <branch>). No PR.
- Before committing: git checkout -- dev-dist; rm -f dev-dist/registerSW.js.
- If your brief says to wire the art in: replace the code-drawn look outright (no on/off switch, the old path deleted), and run the gate:
  npx tsc --noEmit -p . ; npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts
  src/components/*.test.ts src/components/**/*.test.ts tools/inspect/*.test.ts tools/gen2/*.test.ts ; npx vite build. Screenshots of the
  game before and after, upright (390x844) and sideways (844x390), with the pre-installed Playwright Chromium.

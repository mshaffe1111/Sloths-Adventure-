# TASK R-165.100 (Hugging Face picture list 1)   to: Content   model: claude-opus-5-5   effort: medium (R-165.91)   due: <dispatch + about 2.5 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-c2-art-cut`. Read with `git show origin/ccr-ca657d3c-n09zty:<path>`:
reference/roles/README.md, reference/roles/CONTENT.md, reference/LAWS.md, reference/methods/hf-art.md (all of it: the model, the
scripts, the settings that worked, the traps), reference/art/HF-SPEND.md, reference/art/PROMPTS-2026-11-11.md ("Picture list 1"),
STAGE-RULES.md "What may float". The starts are Matt's sheets in reference/art-incoming/matt-2026-11-11b/ and the cut pieces on
t-c2-art-cut (src/assets/w1-1111b/, catalogue in matt-2026-11-11b/cut/).
## Objective
Run picture list 1 on Hugging Face with Matt's style model and cut the results like every batch: the 7 set pieces that came out too
small, redrawn at 2000 px side view; the 4 ground strips with square ends that tile; three World 1 natural flat-top stumps (broken and
rotted level, moss top, no saw cuts); sheet 02's four earth slabs redrawn side-on.
## Frozen inputs
- Budget: cap $5.50 for the whole list (minutes x $2.75/60, hf-art.md §9). Log every job in reference/art/HF-SPEND.md before and after
  (job id, start and end in UTC in the log, the cost). Stop and report if a job would pass the cap. The $15 reserve is never touched.
- The token never goes in code, a commit, a file or a message: jobs get it only as the secret the connector fills in (hf-art.md §1).
- If this session has no Hugging Face connector, do NOT look for another way: prepare and push the spec, and send the lead ONE message
  with the exact job to launch (image, flavor, command, secret name, volume); the lead launches it and tells you the job id.
- Img2img keeps Matt's design (strength low enough that the shape and the composition stay his); text to image only for item 3.
- Side view only; no text; World 1 pieces natural only (no saw cuts, rope, planks or carving). Every piece gets the world fit, and the
  pinkscan and flatness tests, as in CONTENT-R-165.85-cut.md.
- Pick the best take per piece by eye at 2x on dark and light grounds; reject the rest with a one-line reason.
## Files
- WRITE: tools/art/ (spec files for this list only), reference/art/HF-SPEND.md, src/assets/w1-1111c/ (the kept PNGs),
  reference/art-incoming/hf-list1/ (the takes kept for review, contact sheets, catalog.csv, CATALOG.md, REPORT.md),
  reference/handoffs/art-director.md.
## Definition of done (the Critic checks each)
1. Each of the 18 pieces has a kept take or a stated reason it failed; the 2000 px pieces are at least 1500 px on the long side.
2. The ground strips tile: two copies side by side show no seam at 2x (a still of each).
3. The stumps are natural (no saw rings, no cut faces) and have flat moss tops that pass the flatness test.
4. HF-SPEND.md lists every job with its cost; the total is under $5.50.
5. Catalogue with world fit; pinkscan 0; no file over 4 MiB; the turnover note rewritten.
## Return
Branch t-c2-art-cut (continue it), pushed (git ls-remote). REPORT.md in the 7 sections plus "Method used" and "Lessons applied". Then
ONE send_message to the lead, 8 lines or fewer. Then stop.
## Attempt
1

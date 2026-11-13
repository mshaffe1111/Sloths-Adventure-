# REPORT: R-165.100, Hugging Face picture list 1, Content, attempt 2, 2026-11-11
## Attempt 2 (the critic's four items; no new HF job, spend still $2.04)
1. **wrapfix.py:** RGB is blended only. In the fade zone the alpha is snapped under 200 and gets a 1 px anti-aliased rim; the strips were re-cut and pinkscan is 0.
   Semi-clear px per column, first 160 px against mid-strip:
   - P-01-a: 3.2/3.1 against 3.3/2.9
   - P-03-a: 3.2/4.0 against 3.2/2.9
   - P-03-b: 3.7/3.5 against 3.1/2.7
   - P-04-c: 3.3/3.1 against 2.8/2.3
   A plain min(end, start) alpha left a notch at the zone's end, so the alpha is ramped instead (still snapped, so no ghost). I looked at the light-ground 2x pairs (sheets/seam-pairs-light-2x.jpg).
   Named: P-03-a and P-03-b each have one leaf tip under the band with a square-cut end (from the take; small).
2. **HF1-stump-medium:** dropped and marked redo in list 2. Every take has a lid-like top, and none passes both flatness and a natural look.
3. **Stairs and palisade:**
   - Stairs P-08-c: NOT usable, dropped; redo side-on in list 2.
   - Palisade P-11-c: far background in W2/W10 only until list 2. Both are in the catalogue.
4. **World fit:** every piece names all ten worlds, checked by script.
5. **hf-art.md:** the alpha rule added (plus the native-pass seam, the tools/ ignore, and repaint-in-place keeping the angle).
Kept set: 16 (was 18). redo/ holds the two previews.

## Attempt 1
## Method used
hf-art.md as written:
- Qwen-Image with the style LoRA (1.0), img2imggpu.py and striphdgpu.py, rtx-pro-6000.
- Starts: magenta paste-ups (tools/art/hflist1/starts.py), kept in reference/ because tools/ ignores pictures.
- Specs and job args: make_specs.py; the jobs fetch the script, the spec and the starts from raw GitHub at a pushed commit.
- Five jobs, each logged in HF-SPEND.md before launch and after.
- Results came back through carriers (hf_fs attach) and were unpacked, then keyed with the 11-11b cutter, edgefix and pinkscan.
- Picks were made by eye, on dark and light.
- The strips got the circular native pass, then wrapfix.py.
- The token was only ever the job secret.
## Lessons applied
img2img from paste-ups, never text-to-image on magenta (hf-art :77). Repaint in place at s52/s60 (:36). Every take looked at next to its
start (takes-*.jpg) before picking. Flatness and pinkscan run on every kept piece; made things never W1.
## 1. Done-items
1. All 18 pieces kept (none failed). Long sides 1698-1888 px (every one at least 1500).
2. Strips tile. Wrap colour difference (target under 6): P-01-a 0.9, P-03-a 1.5, P-03-b 1.6, P-04-c 2.5. Seam stills: sheets/seam-*.jpg.
3. Stumps are natural, with no saw rings or cut faces, and their moss tops pass the flatness test (55% / 50% / 51%). The first pick for the short stump (39%) was swapped for s60-23.
4. HF-SPEND.md: all 5 jobs with ids, UTC start and end, and cost. Total **$2.04**, under the $6.50 cap.
5. Catalogue with world fit and By world; pinkscan 0; no file over 4 MiB. Turnover note rewritten.
   Size added: 19 MB of PNGs and 12 MB of reference (starts, strip sources, sheets).
## 2. Polish check
Every kept piece looked at on dark and light; strip seams at 2x. Named:
- P-04-c has a faint see-through ghost along its top edge where the two ends' grass was blended.
- Specks under the stumps and scaffold were removed.
- The cliff ledge kept only the drips that touch it.
## 3. Pushback
- **P-08-c stairs and P-11-c palisade are still angled.** The packet fixes item 1 at s52/s60 (repaint in place), which keeps Matt's 3/4 composition. A true side view needs a new side-on start, like item 4's.
- **The native pass alone does not make a seam tile** (it repaints, but the seam stays: wrap differences 3.8-16.2). wrapfix.py's cross-fade is what passes; hf-art.md §4 should say so.
## 4. Suggestions
- A list-2 item (about $0.30): side-on starts for the stairs and the palisade at s62/s68.
## 5. Unresolved
Nothing placed (by design).
## 6. Method update (hf-art.md)
- Pictures under tools/ are git-ignored: put starts in reference/.
- The native pass keeps the input's seam: cross-fade the wrap after it (wrapfix.py).
- Key 2000 px takes in a background run (keying 28 takes takes over 2 minutes).
## 7. Turnover note
reference/handoffs/art-director.md rewritten (§0c) in this commit.

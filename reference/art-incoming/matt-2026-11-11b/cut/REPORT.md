# REPORT: R-165.85 batch 4 (Matt's 11 sheets of 11-11 from the lead's prompts), Content, 2026-11-11
## Method used
The same cutter and every check from the start: edgefix, the widened pinkscan, the 3 px flatness test, world fit with made things
never W1, and the zero-under-alpha re-save (visible pixels unchanged). New for soft art on magenta: softfix.py unmixes steam, mist,
waterfall and glow as an overlay on the ground; waterfix.py moves the waterfall's leftover violet back to blue; pitfix.py recolours
the pit's magenta-hued shadow to near-black. cutter/README.md has the order.
## Lessons applied
Soft edges are unmixed, never erased by hue (trap 13). Every piece was looked at on dark, light and jungle green before reporting.
## 1. Done-items
1. 45 kept, 0 rejected; per-sheet counts match (01-03 and 05-11: 4 each, 04: 5). No labels on these sheets. Pinkscan 0 on all 45.
2. catalog.csv + CATALOG.md: every field; sizes 108-965 px (no 600 px floor this batch, per the lead).
3. sheets/ by kind on dark and light, all looked at; soft pieces also checked on jungle green.
4. Gaps: W1 ground band, a W1 pit, W1 hazards, W7 columns and stairs, W9 lava, W4 cliff and falls, W2 made things filled.
5. Diff in reference/ + src/assets/w1-1111b/ only; **8.3 MB added** (6.4 MB PNGs + 1.9 MB reference); no file over 4 MiB.
## 2. Polish check
Clean on all grounds. Named: the nettles keep a warm pink-orange glow (painted); the pit has a thin dark line across its top (painted).
Angled, not side view: sheet 02, the 08 stairs, the 11 palisade. Too small for their on-screen size: P-08-c, P-08-d, P-10-a,
P-10-d, P-11-a, P-11-c, P-11-d (set pieces at 300-500 px).
## 3. Pushback
The strips don't tile end to end as painted (rounded, outlined ends; P-01-a has a colour seam). Ask for strips with straight,
matching ends, and for 2000 px exports.
## 4. Suggestions
A tiling pass (trim the strips' ends square and cross-fade a 16 px seam) is a cheap code-side fix if Matt can't re-export.
## 5. Unresolved
Nothing placed (by design).
## 6. Method update
For soft art on magenta: unmix as overlay (softfix.py), then fix any hue that the unmix shifts (waterfix.py); check on three grounds.
## 7. Turnover note
reference/handoffs/art-director.md updated in this commit (§0b).

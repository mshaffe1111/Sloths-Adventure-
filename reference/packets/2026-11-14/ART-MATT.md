# ART-MATT: cut Matt's 11-14 sheets (R-165.230), size them against Pokey, the lead judges. CPU first; HF only where named.
Opus 5.5 high (art). Written 1:38 AM ET 11-14 by the lead. Branch t-art-matt from origin/t-art-678b@a93e335 (has recut.py, the 'support'
layer and tonight's catalog rows). Read first: reference/art/PROMPTS-2026-11-14.md (what each sheet is for), reference/methods/hf-art.md,
reference/qa-reports/ART-678b/REPORT.md (recut.py, halo root cause), STAGE-RULES §4-§5b, LESSONS D61, D62.
Matt's sheets (on the lead branch): reference/art/matt/2026-11-14/ sheet1-vine-tie-leaf-lid.webp, sheet2-pods-dust.webp,
sheet3-pits.webp (all 1024 px on WHITE), ant-poses.jpg (1024 px on magenta: reference only, his walk frames come later).
## The lead's judgement of the sheets (do these, in order)
1. **Size first:** 1024 px sheets give pieces of 250-470 px: upscale locally (tools/art/upscale, anime6b, $0) to at least the 600 px
   floor at ship size; say per piece what the ship size is in units and whether it stays crisp at 3 px/unit.
2. **Sheet 3 (1-1 pits) PASS:** pit floor with rounded mossy ends (dead-flat top), the mushroom boulder (wide flat bottom), left and right
   pit lips. Key the white (border flood, keep the line: recut.py's method), catalog, beside-Pokey sheet.
3. **Sheet 1 (1-4 tie) PASS with one cut rule:** World 1 has no made things: the SAWN log (end rings) must not ship: crop each tie to the
   knot + loop only (the coils over the bough read as a wrap); the three states (taut / straining / snapped + fibres) must align on the
   same knot box so they swap without a jump. The leaf lid (leaves hanging from a pole) as one tileable-or-stretchable piece.
4. **Sheet 2 (1-4 pods): dust and bark chips PASS; the PODS FAIL:** no bold dark outline (the game's style) and they read as garlic.
   Fix with Hugging Face img2img on Matt's pod (his design kept), the style LoRA, prompt: a ridged tan-brown jungle seed pod with a husk,
   darker stripes, bold dark outline; 4 takes per state (hanging, falling), cap $1.00, log in HF-SPEND, terminate at once. Lead judges.
5. A contact sheet per sheet: each piece on light, dark and a real 1-4/1-1 frame beside Pokey at 89.1 u, ship size printed (D62).
   Nothing wired. Catalog rows -> CATALOG-MASTER.csv -> inventory.
BOX: 90 minutes or 40% context (400k of your 1M window; you can't see the figure, the lead quotes it; don't stop on a guess, D64):
push, REPORT (30 lines + Learned) with EXACT NEXT STEP, stop. Gates: artcheck, knowncheck, tsc + art tests if inventory changes.
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.

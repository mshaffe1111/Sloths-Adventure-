# ART-MATT PLAN (t-art-matt from t-art-678b@a93e335), written 1:38 AM ET 11-14. R-165.230.
Packet: reference/packets/2026-11-14/ART-MATT.md (lead branch ccr-ea739a2f-dfcee4). Sheets: reference/art/matt/2026-11-14/.
1. Size: each sheet is opaque on white, so upscale the WHOLE sheet 4x with Real-ESRGAN anime6b on CPU (tools/art/upscale/up.py;
   opaque input, so no transparent-edge smear), then cut at 3 px/unit from the 4096 px sheet. Every piece >= 600 px on its long side.
2. Cutter: tools/art/hfmatt/ (cut.json + cut.py reusing hf678/recut.py's cut_piece/finish on a white key). Sheet 3: pit floor,
   mushroom boulder, pit lip L/R (border flood, line kept). Sheet 1: three tie states cropped to knot + loop only (no sawn log),
   all on ONE knot box so they swap with no jump; leaf lid as one stretch piece (pole + leaves). Sheet 2: dust (soft: unmixed
   from white as alpha), bark chips.
3. Pods: HF img2img on Matt's pod (hanging, falling), style LoRA, 4 takes each, cap $1.00, logged in HF-SPEND, job ended at once.
4. Contact sheet per sheet: each piece on light, dark and a real 1-1 / 1-4 frame beside Pokey at 89.1 u, ship size printed.
5. Catalog rows (tools/art/hfmatt/rows.py) -> CATALOG-MASTER.csv -> catalog_master.py --emit. Nothing wired.
6. Gates: artcheck, knowncheck, tsc + art tests (inventory changes). REPORT.md + art-director.md §0f.

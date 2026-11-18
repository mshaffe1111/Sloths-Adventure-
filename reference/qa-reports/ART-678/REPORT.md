# ART-678 REPORT (t-art-678), 12:16 AM ET 11-14. Box stopped by context (~80%; the lead approved a lean finish at ~40%).
**Done:** one HF sandbox, one queued script, 6 sheets x 4 seeds (24 stills) + 12 harpy Qwen-Edits + 4 perch-feet edits; picks PASSED by
the lead (snake-37, moss-37, snag-23, nuts-53, post-53, under-11/53, harpy s2 + perch feet). 25 cuts in src/assets/w1-678/ (lossless,
3 px/unit); 40 raw takes kept (reference/art/hf678/raw/, q95). Sandbox terminated 12:14 AM ET.
**Spend:** ~$1.88 of the $8 cap (41 billed min), ~$0.075 per shipped piece (HF-SPEND.md). Balance ~$56.4.
**Not done (cut scope, named):** catalog rows/inventory, beside-Pokey sheets, the 1-1 underlayer mock-up, despill, the beak-safe re-cut,
the drape split, the full Checks. All in HANDOVER.md with the lead's 5 FAILS, in order. Nothing is placed or imported by code.
**Gates run:** artcheck PASS (no image over 4096 px); knowncheck PASS; roadmapcheck could not check (shallow clone: "proofs cannot be checked", FAIL; I changed no ROADMAP line). tsc/tests/build/perf NOT run (no code changed;
the next session runs the full Checks after the catalog rows).
**Polish check:** cuts-sheet = first cut (underlayer and drape cells FAILED, re-cut OK: fix-sheet not committed, the band shows grass top,
roots, stones, solid to the bottom); perch-sheet: feet grip, beak keyed on ahead/blink (FAIL, open); halos (FAIL, open, the lead's).
**Lessons applied:** D41 (89.1), D59 (terminated before stopping), D55 (context % in every message), D57 (queue read at each push),
11-13 route (sandbox, sbx.py parts), Crocus grey-key lesson (missed for the harpy start: own miss).
**Method update (hf-art.md §10, proven on its first batch):** sheets work: one take = 4-5 related pieces, same light; $0.075 a piece
against ~$0.20-0.40 before. Add: key_top for opaque bands; hand boxes where pieces touch; never two models at once; copies by a helper.
**EXACT NEXT STEP:** a fresh art session reads reference/qa-reports/ART-678/HANDOVER.md and fixes FAILS 1-5 in order (CPU only).
## Learned
Ask for 4-5 pieces a sheet with a stated layout (Qwen-Image honours "top left / bottom right" well), pull only contact sheets yourself,
and hand every bulk copy to a helper; check each piece's blob box before trusting the auto cut.

# AUDIT of the art inventory (R-165.104 parts A + B1-B4, merged)   to: Critic   model: claude-opus-5-5   effort: medium
Assume it is wrong; prove where. Read CONTENT-ART-DIRECTOR-catalog.md beside this file, roles/CRITIC.md, LESSONS.md D37-D40.
Branch t-art-catalog-a@34146615 (merged master; ls-remote must match); parts at t-art-catalog-b1@5217fd14, b2@d64d061d, b3@040a156,
b4@8f192e8.
- Completeness: every image under src/assets (count it yourself) and every kept cut piece appears once in CATALOG-MASTER.csv; print
  sources minus overlap; the 83 B2/B4 clashes kept once; no row lacks world, engine_slot or layer.
- Engine truth (D37): spot-check 15 in-game rows across worlds and layers: engine_slot, footing and used_in match the code file:line.
  Spot-check 10 footing lines on platform rows against the image (is the walk line where the painted top is?).
- Ten-world rule: spot-check 20 re-tagged older pieces by looking at them; made things never W1.
- ship_px and the claimed savings (36 MB) recomputed for 20 rows.
- No tester text, no HF job, nothing under src/.
Return ONE send_message to the lead, 12 lines or fewer, opening "INVENTORY: PASS or REJECT"; each finding as file | rule | evidence | fix.

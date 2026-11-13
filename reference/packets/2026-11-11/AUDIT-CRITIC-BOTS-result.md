# AUDIT of the tier bots (R-165.59), the build   to: Critic   model: claude-opus-5-5   effort: high
Assume it is wrong; prove where. Read CRITIC-BOTS-R-165.59.md (the packet) beside this file, roles/CRITIC.md, LESSONS.md D37-D39.
Branch t-bots-tiers at the head the builder named (164e4cf8 or later; `git ls-remote` must match). Report:
reference/qa-reports/R-165.59/REPORT.md and BOTS.md.
- Done-item 1: every mapped field traced to its profiles file:field and percentile; spot-check five by opening the JSON yourself.
- Done-item 2: re-run the calibration yourself on origin/main (variants 1-40, 40 runs per tier/setting) and compare to BOTS.md's
  table line by line. The builder names misses (expert Normal 1 rescue; middle Easy 2 rescues): confirm they are misses as the packet
  defines them and that no tolerance was changed. Any tuned field: say which, and whether it still traces to a real number.
- Done-item 3: on t-engine-putback@41c2e248, Normal lives 0 in every tier; check the middle Normal loops (8-10 put-backs at
  mushroom-chain, chain-back, log-chain-rise) by watching one run: is it the bot's limit or the stage?
- The builder changed late lift-off for the tier bots only ("re-arms every frame, so KID/ADULT never let go"): prove the bug on
  FT_KID with a short run, and that KID/ADULT output is still identical after del(.ms).
- tierBots.test.ts 7/7 and red; tsc; no file under src/ touched; P-numbers only (grep for names and codes).
- Stills middle-v3-stuck-*: look at them; is the 70 px step over a drop a stage flaw today's verdicts catch?
Return ONE send_message to the lead, 15 lines or fewer, opening "BOTS: PASS or REJECT"; each violation as file:line | rule | evidence |
exact fix.

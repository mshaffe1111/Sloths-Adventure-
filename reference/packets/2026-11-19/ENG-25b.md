# ENG-25b: 2-5's last two pieces before its build: the snapper bot skill bonk-after-the-snap (+ toy) and the meter's snap run-window channel.
Engine, Opus 5.5 high. Written 6:28 PM ET 11-18 (by `date` in the same command); pulled from Fri into tonight's free slot. BOX: hash by 10:30 PM
ET (cutoff 11:30), or 50% REAL context (past 400k the lead stops you); then the EXACT NEXT STEP pushed. A FRESH member; you do not build 2-5.
Role card reference/roles/ENGINE.md. Read FIRST: reference/methods/level.md (Building rules, esp. 21: the bots before the lay), LESSONS.md
once (D57/D87: call ReadNotifications whenever a notice says pending, at every push and before every report; long commands in the
BACKGROUND; D59, D80, D86: the FULL CLAUDE.md check list), ENG-25's REPORT (origin/t-eng-25 reference/qa-reports/ENG-25/REPORT.md:
"Suggestions" 1-2, "Unresolved"), 2-5's final design (origin/t-design-24 reference/design/2-5.md: NEW 2's bot line, the snapper, the
snap stones that bite on four, the run windows), METER-3's REPORT (origin/t-meter-3: how a channel is added, coveragecheck).
BASE: branch t-eng-25b from origin/t-eng-25 (21668b61: snap stones + snapper rows + stone art). Engine/tools only: no shipped stage moves.
1. The snapper bot skill bonk-after-the-snap (tools/inspect/firsttimer.ts SKILLS): wait for the snap, then bonk (stomp) inside the flown
   window; fly the stomp's bounce height on the real engine (InputEngine, 30 fps), both settings. Planted toy on ENG-25's snapper row:
   RED without the skill, GREEN with it. tierBots must still match the testers (reference/qa-reports/R-165.59/BOTS.md; recommit
   calibration only if the run row changes, and say so). Also trace ENG-25's "3 of 24 held toy runs lost a life to water (the tap at a
   stone's lip)": a bot fault (its own commit + plant) or a stone-lip fact the 2-5 builder must know (say which).
2. The meter's snap channel (tools/difficulty score.ts): a snap run priced by its window as log2(1 + cycle / window) (2-5.md), the way
   pad:snap's channel works; a plant; coveragecheck PASS; 2-5's design targets pasted beside what the meter reads on the toy.
3. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on your final head (D86): tsc, the suite (background), BASE_PATH build + chunkcheck, artcheck,
   drawcheck, clipcheck, knowncheck, generality, roadmapcheck (unshallow), kbdcheck, buildcheck (alone), seedlist 1-1 --check, the CI tool
   line exactly as gates.yml has it (add your tests), tierBots, coveragecheck, registrycheck, lockall vs main (no layout may move).
4. Note for INT-13: tomorrow ENG-285 changes the judges' air model; your skill's toy is re-run on it after merge.
REPORT reference/qa-reports/ENG-25b/REPORT.md: hash, toys red/green, the flown bounce numbers, the meter's reading, gate table, what the 2-5
builder needs, Learned.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries REAL context % and a time from `date` run in the same command.

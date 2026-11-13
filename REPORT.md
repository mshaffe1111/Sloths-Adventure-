# FIX-A REPORT (Engine, t-fixa; base origin/ccr-ea739a2f-dfcee4 = main 0.9.7 src; stills shot on c035e8a7; report on 9530a0182)
**Done** (each planted red then green; real page = vite dev, default settings: Normal/Tips, Easy/Help; stills reference/qa-reports/FIX-A/stills):
1. R-165.175 Dot's card. Measured first (before-*.txt): cards left at ~1.05x reading time; real 1-2: 4 of 6 down before their reading time
   (petals card cut at 1.5 s by the jump lesson, then dropped as stale: the blind-test "didn't know what she collected"). Now: a tap clears it
   (card above the touch layer eats the touch: every tap that landed on it reached no punch or jump); unread it stays 3x (FADE_K) with a 1.2 s slow
   fade; +N badge = cards a tapping player then sees (tested); 1-1 teaches "Tap here when you've read it. I'll wait!" on her first read card
   until he taps once (device key). Phone-only rules (tools keep them off, bots unchanged): a done tip stays its reading time; a plain lesson
   never cuts a card mid-read; a cut card comes back in full; reading time counts from on-screen; no mid-read blink. After (after-*.txt):
   1-2 untapped every card but the hazard-cut one >= its reading time, the petals card back in full; 0 blinks. dotTapClear.test.ts (14).
2. R-165.171 "Flick up to hop up or over." / pad "Press Jump to hop up or over." (+ keys "Press Space to hop up or over.", see Pushback).
3. R-165.165 "Down in the hollow, on the low ledge." 4. R-165.166 Golden Eyelash Viper: journal name, lore, plural; grep test over src/.
5. R-165.147 stage teach outranks stock lessons (first when waiting; a read stock tip yields, comes back once). 1-3 real page, 4 combos:
   shown at x 2598-2626, first trap 3291 (dotTeachRank.test.ts). 6. R-165.155: already on main (80f0a5d1); real page 15 of 13 reads 13/13.
7. R-165.158 About: What's ours (music line) + Our story › + Inspired by › (30 lines, words diffed exactly vs STORY-LINES; pair waits).
**Polish check**: about-*.jpg (fresh/old, both ways; sideways Back+title one row after the first shot wasted the short view; titles now
stand out), dot-card(-more,-next)-*.jpg (hint italic, +2 badge), teach-1-3-*.jpg, goal-1-3-*.jpg, jump-1-2-*.jpg, satchel-*.jpg.
**Gates (run so far, on 533b37a2+)**: tsc PASS; knowncheck, generalitycheck, roadmapcheck, artcheck PASS; unit suite 2421 ok / 0 not ok at the 1:45 stop (still running, not finished). NOT RUN yet: vite build, chunkcheck, drawcheck, clipcheck, kbdcheck, buildcheck, seedlist 1-1, tool tests, tierBots.
**Lock**: lockall --layouts 16 vs base: 102/102 stages unchanged.
**Unresolved**: in 3 of 10 scripted 1-2 runs the tap at the mushroom bounce missed a perched card sliding with the camera (a punch went to the game);
lines held longer while busy; a find naming what was found (R-165.175 row, not in packet). The keeper's "29 games" vs 30 lines shown.
**Pushback**: the keys line in item 2 is mine (keyboard said "jump the gap" too): keeper to approve. Item 6 was already fixed in main.
**Learned**: measure the real page before touching the queue: three of the five root causes (cut, stale drop, blink) were not in any
summary. Method update (in-play-text.md): "nothing closes on a tap" is now "her card clears on a tap and eats it"; readtime.mjs is the check.
Lessons applied: D50 (defaults), D19 (gate calls the screen's code), D23 (base stamped), D54 (grep whole src). Note: engine-core.md 0i.
**EXACT NEXT STEP** (stopped at the lead's 1:45 PM box; its message reached me at 2:03 PM, my miss: I did not read the queue for 74 min):
1. On t-fixa HEAD: rerun the CLAUDE.md "Checks" in order (unit suite to the end; BASE_PATH=/Sloths-Adventure-/ npx vite build; chunkcheck;
   drawcheck; clipcheck, which now walks About > Our story / Inspired by; kbdcheck; buildcheck; seedlist 1-1 --check; the tool tests;
   tierBots). tierBots/seedlist should not move (the tools' queue keeps fadeK 1, readDone off); if they do, stop and report, never re-record.
2. The keeper approves the keys line ("Press Space to hop up or over.") or gives words.
3. Optional polish (named, not done): pin a perched card on screen while up, so a tap never misses it mid-slide.

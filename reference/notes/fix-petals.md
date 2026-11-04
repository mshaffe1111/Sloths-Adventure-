# fix-petals: helper notes

## Now (2026-11-04 2:22 PM ET): R-6.38 redo (a90c542f) and validator items (fa647a9e) pushed, all gates PASS, reported to the lead and QS at 2:22 PM ET; waiting on their verdicts
- R-155 1-5 moved to w1-rhythm (lead, 12:42 PM ET message). Not mine any more.
- R-6.38 (started 11:46 AM ET, planned 3 h): src/game/w1Pits.ts + test, protoArt.ts, stageSheets/stagePreload ('pit-art:1'), types.ts
  (Platform.pit), src/assets/props/pits (pitcut.py). Redo done to the lead's five items; report reference/qa-reports/r6-38/README.md.
  Due on the lead branch by 4:00 PM ET.
- Pickup ruler (the lead's ruling): funcheck.ts REBUILT (1-1 to 1-5), gatedFlags, truerBeside; evaluate.ts movesFlags (truer into flags,
  old into oldFlags). funknown.json about + R-150.9 carry the four 1-9 rises. Tell the roadmap keeper (via the lead).
- NEXT (by 6:30 PM ET), each with tests: template-repeat check (§0c 2-3); beatTrace BPM/beat feel (origin/w1-rhythm 3b7fe514) and
  tempo/map-shape "like the stage before"; TIGHT_MAX (core.ts:254) allows a 15-20 s dense finale; pairs only in one move or beat
  (mechanics.ts:43-52); tempoOf lift/moving-platform waits over 1 s count as patience; falls over 200 px or 4 s are bites.
- Method: a stills build needs NODE_ENV=development (window.__play is dev only); after --emptyOutDir restart the static server.
MY MISS (five times today): times typed, not read (10:58, 10:28, 1:11, 1:45 and 2:24 in these notes, both caught before the push). Countermeasure, tightened: a time goes into a message only as
text copied from a `TZ=America/New_York date` printed in the step just before; never composed from memory.

## The job, as briefed
1. R-150.4 mechanics-in-use table, 1-1..1-9 and the boss: what the player meets (stage data + a bot run) against what the engine has.
2. Validator: move string (J V B W S C P + tags), pacing tags per stretch (I/F/P/T/R), repeated 3-4 move runs, similarity to earlier
   stages, dead walks over 2.5 s, landing out of view at take-off, branches outrun by holding right, eagles outrun without hiding,
   clumsy-thumb bot (taps +-100 ms, 15% less air control).
3. Prove it scores today's World 1 badly where Matt felt it (rated the game 55; World 1 the best; branches and eagles outrun). Calls the
   real stage builders (D19). One page per stage for the quality supervisor and Matt.
Report: Method used / Lessons applied / Method update / Polish check; ids pasted from command output after the push.

## Past job (done)
fix-petals, 2026-11-01: 1-2's sealed door fixed (catch mushrooms, split trail, sunk steps), accepted at 7095d3fa and merged. Found the
first-timer bot's lastX bug (D15).

## My pitfalls
- Trusting a tool's numbers before testing the tool (D15: I caught it in the bot; the validator I build must be tested the same way).
- Shell wait loops that pgrep their own command line (deadlocked a recorder once). Use explicit PIDs.
- Times and ids pasted from command output, never typed.

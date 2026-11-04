# fix-petals: helper notes

## Now (2026-11-04 12:55 PM ET): R-6.38 pits built and shown (103d7f47); gates running; then the validator items
- R-155 1-5 moved to w1-rhythm (lead, 12:42 PM ET message). Not mine any more.
- R-6.38 (started 11:46 AM ET, planned 3 h): src/game/w1Pits.ts + test, protoArt.ts (2 calls), stageSheets/stagePreload ('pit-art:1'),
  types.ts (Platform.pit), src/assets/props/pits (cut by tools/art/combat/pitcut.py from the HF bucket's r159-pits takes). Stills and
  report: reference/qa-reports/r6-38/. Due on the lead branch by 4:00 PM ET (the lead merges; I push to fun-validator). Gate lines to add.
- NEXT (by 6:30 PM ET): validator: no variety credit for pickups (§0c.5, fixture, say if scores move); a template-repeat check (§0c rules
  2-3); read each node's BPM and beat feel from beatTrace.ts when it lands; a "like the stage before" on tempo and map shape. Mark bot
  numbers "old bot" (bot-fix's thumb fix merges later).
MY MISS (three times today): times typed, not read (10:58, 10:28, 1:11). Countermeasure, tightened: a time goes into a message only as
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

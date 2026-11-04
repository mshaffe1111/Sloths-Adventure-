# fix-petals: helper notes

## Now (2026-11-04 9:42 AM ET): the fun gate built and proven in CI; reported to the lead
fun-validator 98be8f98 (gate 14777165). tools/validate/funcheck.ts (45 s here, 38 s in CI) + funknown.json (152 entries, 2072
stage-layout flags); knowncheck counts one id per layout; wired into gates.yml, CLAUDE.md, gates.md, tools/README.md, validator.md.
Proven: two runs identical; CI run 41848331105 green, its log "PASS (152 known, 2072 ...; 38 s)"; a raised count fails knowncheck, a lowered
count fails the gate as "worse", a better stage fails until lowered. The validator was accepted earlier (QS PASS 7909cf11; lead OK, KID_RUNS_59 OK).
Report with every gate line: reference/qa-reports/validator/README.md (cb8d5198, gates on 3495372a). NEXT: whatever the lead gives. Watch: the lead's merge into its branch must re-run funcheck (any World 1 change there moves the counts).

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

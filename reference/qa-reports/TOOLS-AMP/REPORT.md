# TOOLS-AMP: R-165.469, the shell '&' gate (PAUSED by the lead, Thu 11/26 6:29 PM ET: helper cap; resumes when a slot opens)

## EXACT NEXT STEP
In a worktree of t-amp-hook (node_modules symlinked from the main checkout), run, in order:
1. `npx tsx --test src/game/ciTests.test.ts` (the new test file was added to gates.yml's tools-tests line; confirm green).
2. `node tools/perf/knowncheck.mjs` and `node tools/roadmapcheck.mjs` (shallow clone: say what it could not check).
3. Live check in the session: add the Bash PreToolUse hook to the session's own `.claude/settings.json`, run one refused command
   (`sleep 1 & wait`: expect the refusal) and one allowed (`true && echo ok 2>&1`), then revert that local edit.
4. Flip the R-165.469 row on the lead's ROADMAP copy is the lead's job: send the lead the hash, the counts and the live result.

## Done (committed on t-amp-hook)
- `tools/session/ampgate.mjs`: PreToolUse hook on Bash; exit 2 with one line on stderr for a lone background '&'. Allows `&&`,
  `2>&1 >&2 <&3 &> &>> |&`, `;&`/`;;&`, quotes ('', "", $'', "$(...)" inside quotes), heredoc bodies, comments, `${...}`,
  `$((...))`/`((...))`, `\&`. Unreadable input or an unterminated quote is allowed.
- Wired in `.claude/settings.json` beside modelgate (matcher "Bash").
- `tools/session/ampgate.test.mjs`: 17 refused forms (all five slip forms from the brief and more), 30 hand-picked allowed forms,
  and a real corpus (every workflow `run:` command, every command span or fence in reference/methods/*.md and CLAUDE.md): no
  refusal. The hook run as a process: exit 2 + the reason, exit 0 when allowed, exit 0 on bad JSON. Settings wiring checked.
- Added to gates.yml's tools-tests line (`tsx --test ... tools/session/ampgate.test.mjs ...`).
- PLANT: with findAmp forced to return -1, the test fails 2 of 5 (refused forms; the hook's exit 2). Restored: 5/5 pass.
- `node tools/team/modelgate.mjs --self-test`: PASS 24/24.
- The corpus caught two methods docs that taught the slip: perf-measure.md (`vite preview ... &`) and hf-backdrops.md
  (`npx vite --port=4301 &`); both now say run_in_background.

## Not yet run
ciTests, knowncheck, roadmapcheck, the live in-session check (steps 1-3 above).

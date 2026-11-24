# TOOLS-1124: two checks instead of two rules: the shell '&' hook (R-165.418) and the see-through-row gate + the weir cut (R-165.417)
Engine (tooling), Opus 5.5 high. A FRESH member. **BUDGET 1 h; REPORT BY 6:15 PM ET; HARD STOP 7:00 PM ET.** Hand over at 320k REAL
context or 28 minutes with an EXACT NEXT STEP. Long runs with run_in_background, NEVER a shell '&'; no heredoc in a commit chain (D119);
every stamp from `date` (D128). USAGE IS TIGHT: each gate once on the exact head.
READ LEAN: ROADMAP R-165.417 and R-165.418; .claude/settings.json and tools/team/modelgate.mjs (the hook shape to copy);
reference/methods/gates.md (how a gate is listed); LAWS headlines; LESSONS D115, D126.
BASE: a new branch t-tools-1124 from origin/main (release 5; nothing here touches the game, the bots or release 4's tree).
1. **R-165.418, the '&' hook:** tools/team/bgguard.mjs, a PreToolUse hook on Bash in .claude/settings.json (beside modelgate): it REFUSES
   a command that backgrounds a job with a bare '&' (outside quotes) and names run_in_background in the refusal. It must ALLOW: '&&',
   '2>&1', '&>file', '>&2', '|&', an '&' inside single or double quotes (a URL query, printf "a & b", sed 's/x/&/'), and an '&' in a
   heredoc body. It FAILS OPEN: if it cannot parse the command it allows it and prints why to stderr (a hook bug must never block every
   Bash call in every session). A planted test (tools/team/bgguard.test.ts): at least 6 refused and 10 allowed cases, RED with the check
   removed. Add the test to the CI tool line (gates.yml 'rolled'; ciTests.test.ts fails on a test file no workflow runs).
2. **R-165.417 (2), the gate:** tools/perf/artcheck.mjs also flags any shipped frame with a fully see-through ROW across it inside the
   frame's painted box (DRESS-27's seamcheck.py rule; find it on the DRESS-27 branches with `git log --all -- '*seamcheck*'`). Planted:
   RED on the old weir cut, GREEN on the repaired sheet. If a shipped sheet other than the weir trips it, do NOT add it to a known list:
   name it to the lead with a still (law 22).
3. **R-165.417 (1), the cut:** replace reference/art/hfnext/cut/weir.png with the repaired cut (DRESS-27's weirseam.py), so the cut and
   the shipped sheet agree; artcheck GREEN.
4. The CI tool line + artcheck + tsc on the final head; push t-tools-1124; send the lead the hash and one line each.
REPORT: reference/qa-reports/TOOLS-1124/REPORT.md on t-tools-1124. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.

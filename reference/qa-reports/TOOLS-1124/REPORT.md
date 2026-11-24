# TOOLS-1124: the shell '&' hook (R-165.418) and the see-through-row gate + the weir cut (R-165.417)

EXACT NEXT STEP: NEXTSTEP

Engine (tooling) member, branch t-tools-1124 cut from origin/main cdffdc627. HEADLINE

## 1. R-165.418: the shell '&' hook
- `tools/team/bgguard.mjs`: a PreToolUse hook on Bash in `.claude/settings.json` (beside modelgate). Refuses a command with a bare
  '&' outside quotes; the refusal names run_in_background. Allows '&&', '2>&1', '>&2', '<&3', '&>file', '&>>file', '|&', ';&', '\&',
  any '&' in single or double quotes, in `$(( ))`/`(( ))` arithmetic, after a '#' comment, and in a heredoc body (quoted or not, '<<-').
- FAILS OPEN: an unclosed quote or `((`, a heredoc with no word, bad JSON, any thrown error: allowed, the reason on stderr, exit 0.
- Planted: `tools/team/bgguard.test.ts`, 8 refused + 16 allowed + 4 fail-open cases + the hook run end to end (deny JSON, silent allow,
  bad stdin). 4/4 green; with the refusal removed (a temporary edit, restored from a copy) 2/4 RED. On the CI tool line (gates.yml rolled).
- Live check: `{"tool_input":{"command":"sleep 1 &"}}` piped to the hook prints the deny JSON and exits 0.

## 2. R-165.417 (2): the see-through-row gate in artcheck
- `tools/perf/artcheck.mjs` now also runs DRESS-27's seamcheck.py rule on every shipped frame (each {x,y,w,h} in a sheet's sibling
  .json, else the whole image), cut to its painted box. Ported exactly: on the old weir cut it finds rows 329..330, the same rows
  seamcheck.py names.
- Node has no WebP decoder and the repo has none installed, so the row check decodes in Chromium (playwright, as clipcheck does). In
  CI the artcheck step moved after the gates job's browser install (gates.yml). `--seam <file>` checks one image.
- Planted every run, inside the gate: `tools/perf/fixtures/weir-seam-old.png` (rows 290-370 of the old cut) must trip it and the
  repaired cut must pass, or the gate fails.
- Also checked: release 4's repaired sheet (bdb807cc7 w2-next.webp, every frame) PASSES; the sheet before DRESS-27's repair trips on
  `weir` only, rows 329..330.
- Full run on main's 1,012 shipped images: FULLRUN

## 3. R-165.417 (1): the weir cut
- `reference/art/hfnext/cut/weir.png` replaced by DRESS-27's weirseam.py output on it (2,116 px filled, rows 326-331 only).
- The repaired cut and release 4's shipped weir frame now agree: 0 alpha pixels differ by more than 8 (the old cut: 2,116).
- Still (before on top, after below, on a dark ground): `weir-seam-before-after.png`. The dark line across the falls is gone.

## Gates on the final head
GATES

## Polish check
- The weir still above: the line is gone and nothing new shows along it (the fill blends foam into pool).
- The hook's refusal text tells the member exactly what to do instead (run_in_background with a timeout).

## Lessons applied
D115 (a check, not a rule: the hook replaces the 'never a shell &' sentence); D126 (the new test is on the CI tool line, and the tool line
ran on the final head); D119 (no heredoc in a commit chain); D128 (every stamp from `date`).

## Learned / proposed
- A gate that needs pixels must say how it decodes: node cannot read WebP, so any future pixel gate either rides the Chromium the
  gates job installs (as here) or adds a decoder to the project on purpose.

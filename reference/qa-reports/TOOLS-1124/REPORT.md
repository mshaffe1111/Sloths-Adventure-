# TOOLS-1124: the shell '&' hook (R-165.418) and the see-through-row gate + the weir cut (R-165.417)

EXACT NEXT STEP (the lead ruled: items 1 and 3 DONE, ship with release 5 from t-tools-1124; the row check's rework APPROVED):
on t-tools-1124, change artcheck's row check so it reads the REAL frame boxes (each atlas's slicing as the game uses it, or
src/game/art/inventory.ts) and checks ONLY frames whose INVENTORY kind is a solid piece (ground, platform, step, prop, character body);
fx, strands, icons and water strips are left out BY THEIR INVENTORY KIND, never by a file list in the gate. An atlas whose frames have
no inventory kind is named as an INVENTORY GAP (no guessing). Start: replace framesOf() in tools/perf/artcheck.mjs (it now reads a
sibling .json or else the whole image) with a reader of the inventory's pieces (file, box, kind); keep seamRows()/seamCheck() and the
built-in weir plant as they are (the plant must still bite). Then run artcheck once and expect GREEN on main's art plus a list of
inventory gaps; re-run tsc and the CI tool line on that head. Do not repair art in this job.

The three single images, judged at 4x on a dark ground (singles-4x.png): NONE is a seam. pickups/bell.webp rows 82-83 is the bell's
open mouth (only the rim is painted); story/drake/drake-cup.webp rows 544-545 is the gap between the tail and the foot (95% clear
across the picture: separate parts); w1-18/hf18-bough.webp rows 530-533 (picture rows; 527-531 painted-box) is the gap between two
of its three stacked 600x266 variants (BOUGH in src/game/protoArt.ts: rows 0-265, 266-531, 532-797; variant 2's underside ends above
531 and variant 3's top headroom starts at 532), and the game draws each variant on its own, so nothing shows in 1-8. No game still
was needed: the band is not inside any drawn piece.

The 26 hits on main, for the record: 17 gaps between packed frames in atlases sliced in code, 6 strands on purpose (boss-fx pennants,
gust, dashTrail; the expand icon; w6-calm-water), 3 singles above (not seams). Stills flagged-1.png, flagged-2.png; list
artcheck-main.log. Nothing went on a known list and the rule was not loosened (a tighter rule also missed the weir).

Engine (tooling) member, branch t-tools-1124 cut from origin/main cdffdc627. Items 1 and 3 DONE; item 2 BUILT, PLANTED, and RED on 26 false hits on main's art: the lead decides
how the check gets real frame boxes (above).

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
- Full run on main's 1,012 shipped images: 90 s; size part PASS; row part FAIL on 26 frames, all looked at, none a real seam (top).

## 3. R-165.417 (1): the weir cut
- `reference/art/hfnext/cut/weir.png` replaced by DRESS-27's weirseam.py output on it (2,116 px filled, rows 326-331 only).
- The repaired cut and release 4's shipped weir frame now agree: 0 alpha pixels differ by more than 8 (the old cut: 2,116).
- Still (before on top, after below, on a dark ground): `weir-seam-before-after.png`. The dark line across the falls is gone.

## Gates on the final code head (f812eeb95; this commit adds only the report)
- `npx tsc --noEmit -p .`: exit 0.
- The CI tool line (gates.yml rolled, now with tools/team/bgguard.test.ts): 355 tests, 354 pass, 0 fail, 1 todo (chaseBots' open
  CHILD-bot todo, not mine). `src/game/ciTests.test.ts`: 4/4 (the new test file is on a workflow line).
- `node tools/perf/artcheck.mjs`: exit 1. Sizes PASS; the row plant bites (old weir cut trips, repaired cut passes); the row check
  over 1,012 images in 89 s FAILS on the 26 frames above (artcheck-main.log). This red is the finding the lead decides on.
- My own miss, caught: my first tool-line run read the command from gates.yml by LINE NUMBER after my own edit had moved it, so it
  ran an empty command and "passed". I re-ran it, finding the line by its content. Countermeasure proposed (Learned below).

## Polish check
- The weir still above: the line is gone and nothing new shows along it (the fill blends foam into pool).
- The hook's refusal text tells the member exactly what to do instead (run_in_background with a timeout).

## Lessons applied
D115 (a check, not a rule: the hook replaces the 'never a shell &' sentence); D126 (the new test is on the CI tool line, and the tool line
ran on the final head); D119 (no heredoc in a commit chain); D128 (every stamp from `date`).

## Learned / proposed
- Never read a CI command by line number from a file you just edited: grep it by content and print the count of tests it ran; a
  tool-line run that reports no "# tests" line is a failed run, not a pass. (Proposed for dispatch-packet.md's tool-line rule.)
- A gate that needs pixels must say how it decodes: node cannot read WebP, so any future pixel gate either rides the Chromium the
  gates job installs (as here) or adds a decoder to the project on purpose.

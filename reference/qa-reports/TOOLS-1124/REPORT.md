# TOOLS-1124: the shell '&' hook (R-165.418) and the see-through-row gate + the weir cut (R-165.417)

EXACT NEXT STEP (TOOLS-1124b, session 2; head 60f9c6c8): WAIT for the lead's answer to two questions, sent with the evidence below.
(1) Does artcheck's row part go into CI RED on its 7 non-seam hits until the inventory carries their boxes and kinds, or does it wait?
(2) 'Go' on R-165.434's rule: if yes, wire tools/engine/sideWall.ts into tools/engine/paintcheck.ts. Call sideWalls(st.platforms, inp.f)
next to paintFalls. Breach id `${stage}|sidewall|${style}|w${w}h${h}`, using the same known list and printing. Add a planted test
(tools/engine/sideWall.test.ts: on main's 2-6, insert one 24x94 moss_stone solid like b6a35d7e8's faces under a lip, which must be RED;
the stage as built must be GREEN) and put it on the CI tool line (gates.yml 'rolled', found BY CONTENT). Then run tsc and the CI tool
line once, push, and send the lead the hash. The survey probe is at the scratchpad's zsurvey.ts (args: stages, seeds a stage).

## Session 2 (TOOLS-1124b)
### A. R-165.417 (2), reworked as ruled (e84e8b08)
- artcheck's row check reads each frame's box from the art inventory (src/game/art/inventory/*.json, the rows inventory.ts loads: the
  rect in 'name (x,y wxh)', else the sheet's sibling .json; a whole-image row is the whole image). It checks only SOLID layers (ground,
  platform, step, soft landing, support, decor near/mid, character, enemy, actor). Backdrop, 'back (...)', ui, pickup, climb and
  danger look are left out BY LAYER (1,145 frames). There is no file list.
- The plant still bites: the old weir cut trips it, the repaired cut passes. The row part takes 10 s.
- RED on 7, none a seam (rowhits-inventory.png, rows ticked in red, on a dark ground): boss-fx pennant0/1 (separate strips, inventory
  says decor near); w1-traps sprung (thin tendrils); w2-props mailbox (the flag above the box); w6-calm-water (stacked strips listed as
  one whole 'soft landing' image); drake-cup and hf18-bough (judged in session 1; the bough is listed whole, the game slices it in 3).
  Each is an inventory labelling or boxing problem, not a gate problem. Nothing was put on a known list.
- INVENTORY GAPS (artcheck-inventory.txt): 11 shipped images with no inventory row (w1-thorn-long/low, 7 ui/ctest-1-*, 2
  w16-vinesnake-*-brown). 210 sheets have 7,243 solid frames sliced only in code, with no box in the inventory (the boss and creature
  anim sheets, the cels, dot-atlas, hero clips, ground/kits/dress sheets ...). Those are NOT row-checked. The fix is
  catalog_master.py emitting every frame's rect (Content).
### B. R-165.434, the side-on wall rule (60f9c6c8, NOT wired yet)
- Chosen: a rule on the collider list, not pixels. paintcheck stubs every image 1x1, so pixels would need a real render of every stage.
  The rule: a solid whose terrain.ts footingOf look is 'painted-bank', narrower than his body (44), with a side open (no solid touching
  it) over at least his height (48), is a breach. It is painted as bank soil, the backdrop's look.
- Survey (3 seeds a stage, both settings, 612 builds each): main has 0 hits; 2-6 at b6a35d7e8 has 96, every one a 24x94 moss_stone face.
  GREEN stages: all of main, including 2-6, 8-6 and 5-5.
- Limit, said plainly: the 44 is his width, not read from the painter. A 'top buried' clause was tried and DROPPED (797 false hits on
  main, all wide banks with a piece resting on them).
- My miss: the first survey run passed an empty stage filter and built nothing ('builds 0'). I caught it from the count and re-ran.
- Lessons applied: D115 (no source edits while a run read the tree; the 2-6 build ran in its own worktree), D126 (the CI tool line,
  not a subset, still to run on the final head).

## Session 1
(SUPERSEDED, done in session 2) NEXT STEP (the lead ruled: items 1 and 3 DONE, ship with release 5 from t-tools-1124; the row check's rework APPROVED):
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

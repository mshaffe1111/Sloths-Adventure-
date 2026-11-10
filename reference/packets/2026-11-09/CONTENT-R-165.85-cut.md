# TASK R-165.85 (cut only)   to: Content   model: claude-opus-5-5   effort: medium (R-165.91)   due: <date at dispatch + about 2 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty art-raw-2026-11-07 t-r165-61-verdicts`. Read with `git show origin/ccr-ca657d3c-n09zty:<path>`:
reference/roles/README.md, reference/roles/CONTENT.md, reference/LAWS.md, STAGE-RULES.md "What may float" (search for it),
reference/art-incoming/matt-2026-11-09/README.md. Read with `git show origin/art-raw-2026-11-07:<path>`: cut/CATALOG.md (its format,
and its "Still missing" list) and the cutter in cut/cutter/ (reuse it; don't write a new one unless it can't key these sheets).
## Objective
Matt's 15 new sheets (reference/art-incoming/matt-2026-11-09/01.jpg to 15.jpg on ccr-ca657d3c-n09zty) cut into clean pieces and
catalogued, ready for the 1-1 re-lay and for Matt's mock-up sheet. Cut and catalogue ONLY: nothing is placed in the game.
## Why it matters
Matt made this art himself and none of his recent art is in the game yet. The re-lay (R-165.72) and his yes on a mock-up sheet both
need the pieces cut, measured and sorted first.
## Frozen inputs (do not change)
- The sheets as sent: JPEG on a magenta or pink ground that differs by sheet (key each sheet's own ground; JPEG fringes are the trap:
  no pink halo at 2x zoom on any kept piece). Matt's printed labels under the pieces are text, never part of a piece.
- The float ruling (STAGE-RULES.md "What may float", Matt 11-07): platform-looking pieces may float; boughs and branches attach to a
  trunk, post, root or rope; rocks, stump-steps, decor, hide spots and caves are grounded. Every piece gets one class.
- Flags the lead already named (README.md beside the sheets): the crate on sheet 04 has painted words ("CAUTION: FRAGILE"), a problem
  for players who can't read; the pitcher plant patch on sheet 06 reads as danger. Flag both in the catalogue; do not edit the art.
- Sheet 02 shows the lily pads from above and sheet 03 side-on: the game is side-on, so 03's are the platform set; cut 02's too but
  mark them "top view, not for platforms".
- No Hugging Face or other paid service. Nothing under src/ changes.
## Files
- READ: the files above; the 91-piece catalogue and cutter on art-raw-2026-11-07.
- WRITE: reference/art-incoming/matt-2026-11-09/cut/ (kept/ PNGs, rejected/ with reasons, sheets/ contact sheets, catalog.csv,
  CATALOG.md, any cutter config you add); your turnover note (the one roles/CONTENT.md names; create it if none exists).
## Definition of done (the Critic checks each)
1. Every labelled piece on the 15 sheets is a transparent PNG at full resolution in kept/ (trimmed to its bounds, no label text, no
   pink fringe at 2x zoom), or is in rejected/ with its reason. The count of pieces per sheet matches what the sheet shows.
2. catalog.csv and CATALOG.md, one row per piece: id, sheet, Matt's label (or "unlabelled"), kind (walkable log or plank, block,
   lily pad, soft landing, step set piece, den or hide spot, tree, plant or dressing, rock, danger-looking, puzzle piece), size in px,
   the measured flat walkable top (y and x-range) for anything standable, world fit (W1, W2, both), float class, notes.
3. Contact sheets by kind with each walkable top drawn as a cyan line, on a dark and a light ground. Polish check (LAWS 1): you looked
   at every contact sheet at full size and name anything rough.
4. A section in CATALOG.md: which of the 91-piece catalogue's "Still missing" gaps these pieces fill, and which remain.
5. `git diff origin/main --stat` shows only reference/ files; no file over 4 MiB (CLAUDE.md asset rule); the turnover note written.
## Return
Branch t-c2-art-cut from origin/main, pushed (git ls-remote). REPORT.md with "Method used" and "Lessons applied" first, then the 7
sections of roles/README.md, 60 lines or fewer. Then ONE send_message to the lead's session, 8 lines or fewer. Then stop.
## Attempt
1

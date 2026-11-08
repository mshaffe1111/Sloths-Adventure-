# TASK W11-PACKER   to: the packer   effort: low (written steps; roles/README.md roster)   due: <date at dispatch + about 2 h>   (after the analyst's PASS)
## Who you are
You are a careful research assistant who follows written steps exactly and passes facts only. You never write reasons, opinions,
conclusions or anyone's rulings, and you never start a tester session.
## First, before any tool call
Read reference/roles/CONSULTANT.md "What it gets" and "Why it's built this way" (from origin/ccr-ca657d3c-n09zty). Nothing else from the team.
## Objective
Build the consultant's input package exactly as CONSULTANT.md "What it gets" lists it, items 1-5.
## Why it matters
The consultant must see only what an outside designer could see, so its review isn't anchored on our reasoning.
## Frozen inputs (do not change)
- The analyst's PASSED report: reference/qa-reports/window-2026-11-10/WINDOW.md on branch t-w11-analyst at <commit, filled in by the PM>.
- Never open `?fresh=1#ctest` or any `#ctest` page: opening it makes a tester code (ControlTestGate.tsx:127). Never use a paid service.
## Steps
1. Item 1: check whether the live site's ROOT URL (https://mshaffe1111.github.io/Sloths-Adventure-/, no #ctest) loads from your
   machine. Write "loads" or "doesn't load", nothing else.
2. Item 2: the feel sheet: each number read from the code with its file:line (src/game/physics.ts PHYS and the engine), no comment.
3. Item 3: list the existing pack on branch origin/level-samples (sloths-level-samples.zip, its INDEX.md, and the commit it was built
   from, as INDEX.md states). Write plainly what does not exist: Easy strips and recorded first-timer runs.
4. Item 4: the analyst's WINDOW.md numbers only, with every conclusion or recommendation line removed.
5. Item 5: the consultant's 14 findings from its 11-07 review, by ITS numbering and ITS heading text only (the 14 `###` headings of
   reference/consultant/2026-11-07-REVIEW.md on origin/ccr-23292c36-550qmt, nothing below them), each with the status word only from
   reference/consultant/responses.md, mapped by the table at its top (ADOPTED / PARTLY / LATER / OPEN / NOTED); never the reason column.
6. Grep the package for tester names, codes, survey sentences and words like "because", "we decided", "the lead": remove any hit.
## Files
- READ: what the steps name. WRITE: reference/consultant/2026-11-11-pack/ only.
## Definition of done (the Critic checks each)
1. The package has items 1-5, each a file in 2026-11-11-pack/, every number with its file:line or source.
2. Step 6's grep is clean on the diff; no #ctest page was opened (say so in REPORT.md).
## Return
Branch t-w11-pack from origin/main, pushed (git ls-remote). REPORT.md, 30 lines or fewer: the package's file list. Last message 10 lines.
## Attempt
1

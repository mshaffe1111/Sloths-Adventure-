# TASK W11-PACKER   to: (packer, follows written steps)   effort: medium   due: <from date at dispatch, about 2 h>   (after the analyst's PASS)
No persona beyond this: you follow written steps and pass facts only. You never write reasons, opinions or our rulings.
## Objective
Build the consultant's input package exactly as reference/roles/CONSULTANT.md "What it gets" lists it, items 1-5.
## Steps
1. Item 1: confirm the live site and `?fresh=1#ctest` load from your machine; if not, build origin/main (`npx vite build`), and record how
   the consultant can serve dist/ locally. Write which, nothing else.
2. Item 2: the feel sheet, each number read from the code with its file:line, no comment or reason.
3. Item 3: the newest level-samples strips for 1-1 (both settings) and a first-timer run per the existing tools; list paths.
4. Item 4: the analyst's REPORT.md numbers only (reference/qa-reports/window-2026-11-10/), with every conclusion line removed.
5. Item 5: each past finding from reference/consultant/responses.md with its status word only (ADOPTED / DECLINED / LATER / PARTLY /
   NOTED), never the reason column.
6. Grep the package for tester names, codes, survey text and words like "because", "we decided", "the lead": remove any hit.
## Files
- READ: what the steps name. WRITE: reference/consultant/2026-11-11-pack/ only.
## Return
Branch t-w11-pack from origin/main, pushed (git ls-remote). Last message: the package's file list, 10 lines.

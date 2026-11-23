# Method: the piece plan (the truth table and the schedule; written by PLAN-2H 11-23, LAWS 4: a job with no method gets one)

Who: the Architect, at the start of every wave (Monday) or when the lead asks. Output: TWO-HOUR-PLAN.md §The truth table, §Per stage,
§The schedule, §The risks. Read lean: greps and line ranges, never a whole engine file or REPORT.

1. **Bases as frozen worktrees:** `git worktree add --detach <scratch>/main origin/main`, and one per branch carrying pieces not on main
   (the level in flight). Read code there, never in the checkout (the lead's branch is not main). Unshallow first if roadmapcheck must run.
2. **Bot + meter in one read:** reference/design/meter-coverage.json, tabulated with node into piece | bot | channel (86 ids on 11-23).
3. **What gen2 can lay:** the PlaceRule and SectionZone unions, GraphBrief and WorldManifest fields in gen2/types.ts (awk the union's
   `kind:` lines), each gen2/*Lay.ts header and its exported functions with line numbers, stageTable rows, gen2/game.ts's old kits.
4. **What each stage needs:** its design's `**NEW n**` lines (grep -oE) and the ENG- names it cites; with no design,
   reference/qa-reports/ENGINE-NEEDS/map-tally.txt and GAME-MAP §4 (hidden stages: grep "Hidden stage").
5. **Status words:** GREEN (gen2 lays it on a real row or toy, a bot plays it, the meter prices it), PART (runtime only, or one old kit;
   MISSING for READY), MISSING. Every row cites file:line; a MISSING row cites where it would hook or the nearest runtime.
6. **Grep before you size (D66):** check each "missing" piece's branch (t-eng-*) for a final REPORT and its code on main; a landed
   piece leaves the queue.
7. **The schedule:** kits first in each wave (D40), then pieces in dependency order, each with its bot skill and channel; GREEN-by = a
   week before the world's builds (two once the ramp is past); name every world where it cannot hold and why.
8. **Cites last (D52):** extract every `file:line` from the new text and resolve each against the worktrees by script (basename AND
   folder: `types.ts` is three files). 0 unresolved before the commit.
9. **Gates (docs only, LAWS 5):** tsc, roadmapcheck, knowncheck, generality; a red in a file the branch did not touch is named as the
   base's, with `git diff <base> --stat -- tools src` empty as the proof.

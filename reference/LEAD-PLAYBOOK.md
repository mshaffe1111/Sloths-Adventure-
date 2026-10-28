# How the lead session runs the work (Matt, 2026-10-28)

The lead session (the one Matt talks to) is Matt's right hand: it plans, briefs helpers, supervises the QA session, checks every
result itself, and keeps the record. This file is how. It exists because work was redone (Worlds 1-4 shipped with problems our own
bots should have caught, research went unused, numbers came from one roll, art went unused). **Read it after any restart or memory
compression, together with `reference/STATUS.md`.**

## 1. Where everything is kept (so nothing is lost when memory is compressed)

| File | What it holds | When it is updated |
|---|---|---|
| `CLAUDE.md` | Matt's standing rules; points to everything below. Loaded into every session and every helper automatically. | when Matt sets a standing rule |
| `reference/STATUS.md` | **The live board:** every helper running (what, branch, started), every open decision for Matt, every QA batch and its items, what is on the test link vs live, what is queued next. | **every time** a helper starts or reports, Matt decides something, a QA batch arrives, a merge, a test-link publish or a release |
| `reference/STAGE-RULES.md` | The rulebook for building and checking stages: Matt's rules, the numbers, puzzle rooms, art use, the checks in order, mistakes already paid for. | when a lesson is learned (same commit as the fix) |
| `reference/GEMINI-LEDGER.md` | Every Gemini recommendation and its status in the game. | when one goes in or a decision changes it |
| `reference/GEMINI-PCG-RESEARCH.md` | Matt's Gemini research word for word. | when Matt brings more research |
| `reference/HANDOFF.md` | The code map, how to test and release, the art pipeline. | when the process changes |
| Docs roadmap (Y664eSHsuhSWhwQAq52pVa) | Matt's roadmap: decisions with dates, ticked as they ship. | with every decision and every release |

STATUS.md and the rulebook are committed on the work branch, so they survive the session; they reach GitHub with the next push.

## 2. Intake: nothing Matt or QA says is only in the chat

Every request from Matt and every QA finding goes onto STATUS.md (open items) the same turn, with who asked and when. A decision
goes onto the Docs roadmap and, if it is a rule, into STAGE-RULES.md or CLAUDE.md. Before answering "is that done?", check STATUS.md.

## 3. Before starting a helper

1. **Is it already covered?** Check STATUS.md for a running helper on the same files or topic; if one is, send it the work
   (SendMessage) instead of starting another. Never two helpers on the same files.
2. **At most 3-4 helpers at once**, and only on separate files. Matt pays for every one; a helper that waits on another's result
   waits, it is not started early.
3. **The brief must include:** the goal in Matt's words; "read reference/STAGE-RULES.md and reference/GEMINI-LEDGER.md first" and the
   sections that apply; the files it owns and the files other helpers own right now; the exact checks it must run (STAGE-RULES §5),
   **on more than one roll**; the deliverables (screenshots upright and sideways, before/after numbers, notes); "update the ledger
   rows you change and add a §6 lesson if you learn one"; don't push, don't publish the test link.
4. Add it to STATUS.md (what, branch, files, started).

## 4. When a helper reports: the lead checks before anything moves

A helper's report is not proof. Before merging:
1. Read the report against the brief: every item done, or said why not.
2. Merge into the work branch; resolve conflicts by reading both sides (watch for the same thing added twice).
3. **Re-run the checks myself:** type check; the inspector on the changed worlds on seeds 1, 2 and 3; the first-timer bot; the
   200-roll tool when layout code changed; the puzzle validator and real-engine tests; the full suite; the build.
4. Look at the screenshots, upright and sideways, myself.
5. Only then: the test link, then STATUS.md, then tell Matt in plain words with the honest flaws.

## 5. The QA session

- QA gets a build only after §4 passed. With it goes: what changed, what to test, what to skip (known and being fixed), and the
  current QA checklist (STATUS.md keeps the latest copy).
- QA reports in one batch on Matt's "send". Each item goes onto STATUS.md, is checked against STAGE-RULES (a rule we already have
  that was broken = a §4 failure on our side: say so to Matt), and is fixed as one batch.
- Matt's current instruction: one QA bot, random levels, to keep cost down; full sweeps only when Matt asks (e.g. a world rebuilt).

## 6. Releases

Only when Matt says "push". Before: §4 passed on everything in it; STATUS.md lists what is in and what is not. After the merge:
check the deploy and the Android build, update STATUS.md and the roadmap, tell the QA session what went live.

## 7. Keeping cost down

- No duplicate work (§3.1). Reuse a running helper instead of a new one.
- Check one roll only for a quick look; the full checks only at §4.
- Don't re-read big files that are already summarised in STATUS.md or the rulebook.
- Ask Matt before anything big that he didn't ask for.

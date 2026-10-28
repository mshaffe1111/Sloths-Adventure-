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

STATUS.md and the rulebook are committed on the work branch and pushed to it for safe keeping (Matt, 2026-10-28: the container is temporary; a push to the work branch is not a release, a release still waits for his "push").

## 2. Intake: nothing Matt or QA says is only in the chat

Every request from Matt and every QA finding goes onto STATUS.md (open items) the same turn, with who asked and when. A decision
goes onto the Docs roadmap and, if it is a rule, into STAGE-RULES.md or CLAUDE.md. Before answering "is that done?", check STATUS.md.

## 3. Before starting a helper

1. **Is it already covered?** Check STATUS.md for a running helper on the same files or topic; if one is, send it the work
   (SendMessage) instead of starting another. Never two helpers on the same files.
2. **As many helpers at once as there are separate jobs** (Matt, 2026-10-28: he would rather run twice as many to finish sooner),
   but only on separate files, and a helper that needs another's result waits for it. Split big jobs into pieces that own separate
   (new) files with agreed interfaces.
3. **The brief must include:** the goal in Matt's words; "read reference/STAGE-RULES.md and reference/GEMINI-LEDGER.md first" and the
   sections that apply; the files it owns and the files other helpers own right now; the exact checks it must run (STAGE-RULES §5),
   **on more than one roll**; the deliverables (screenshots upright and sideways, before/after numbers, notes); "update the ledger
   rows you change and add a §6 lesson if you learn one"; don't push, don't publish the test link.
4. Add it to STATUS.md (what, branch, files, started).

## 3b. Cloud sessions (separate machines; Matt, 2026-10-28: "use extra as soon as possible so we run at capacity")

- Use them for heavy runs (full test suites, the first-timer bot and the 200-roll tool over whole worlds) and for builders, so
  this machine's 4 cores stop being the bottleneck. Start them with `create_session` (source = the repo, revision = the branch to
  work from), tagged `sloths-helper`, with a self-contained brief (they have no memory of this session: point them at CLAUDE.md,
  STAGE-RULES, the ledger, STATUS).
- They cannot message back: read their final report with `list_events` (kinds assistant/result). A cloud builder pushes its work
  to its own branch (never the work branch, never main, no PR); the lead merges it after the §4 checks like any other.
- List every cloud session on STATUS.md (id, job, branch) and archive it once its result is merged.
- Matt watches the cost; if he says it's burning too fast, scale back.

## 4. When a helper reports: the lead checks before anything moves

A helper's report is not proof. Before merging:
1. Read the report against the brief: every item done, or said why not.
2. Merge into the work branch; resolve conflicts by reading both sides (watch for the same thing added twice).
3. **Re-run the checks myself** (two tiers, Matt wants speed, 2026-10-28: between rounds the FAST gate, about 5 min: type check, the
   changed files' tests, the inspector on the changed worlds on seeds 1-3, the first-timer bot on the changed worlds; the FULL gate,
   below, once per batch before the test link goes to QA and before every release): type check; the inspector on the changed worlds on seeds 1, 2 and 3; the first-timer bot; the
   200-roll tool when layout code changed; the puzzle validator and real-engine tests; the full suite; the build.
4. Look at the screenshots, upright and sideways, myself.
5. Only then: the test link, then STATUS.md, then tell Matt in plain words with the honest flaws.

## 5. The QA session

- QA gets a build only after §4 passed. With it goes: what changed, what to test, what to skip (known and being fixed), and the
  current QA checklist (STATUS.md keeps the latest copy).
- A "too hard" report is sorted into unfair (fix) or hard but fair (keep, and tell Matt with the numbers): STAGE-RULES §1b. The
  difficulty ramp is Matt's rule; the lead answers for it.
- QA reports in one batch on Matt's "send". Each item goes onto STATUS.md, is checked against STAGE-RULES (a rule we already have
  that was broken = a §4 failure on our side: say so to Matt), and is fixed as one batch.
- Matt's current instruction: one QA bot, random levels, to keep cost down; full sweeps only when Matt asks (e.g. a world rebuilt).

## 6. Releases

Only when Matt says "push". Before: §4 passed on everything in it; STATUS.md lists what is in and what is not. After the merge:
check the deploy and the Android build, update STATUS.md and the roadmap, tell the QA session what went live.

## 7. Keeping cost down

**Effort levels (Matt, 2026-10-28: the lead sets each helper's effort to balance his tokens; he doesn't want to run out again).**

| Effort | For | Examples |
|---|---|---|
| low | following written steps, no design choices | cutting art sheets, running the checks and reporting numbers, publishing, status notes |
| medium | reading and measuring, small contained fixes | the step-2 gap list, a one-file bug fix, placing art where the brief says |
| high | design and anything that interacts | building or rebuilding stages, puzzle rooms, engine movement, the generator, hard debugging, the lead's own reviews |
| xhigh / max | never, unless Matt asks | |

Make the notes do the thinking: a brief points at the exact files, rules and commands (STAGE-RULES §8 is the quick start), so a helper
spends its tokens on the job, not on finding its way around. When a helper had to work something out that the next one will need,
add it to the notes.

- No duplicate work (§3.1). Reuse a running helper instead of a new one.
- Check one roll only for a quick look; the full checks only at §4.
- Don't re-read big files that are already summarised in STATUS.md or the rulebook.
- Ask Matt before anything big that he didn't ask for.

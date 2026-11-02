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
3. **The brief must include:** the polish bar (STAGE-RULES §5b) and the Polish check it must report; the goal in Matt's words; "read reference/STAGE-RULES.md and reference/GEMINI-LEDGER.md first" and the
   sections that apply; the files it owns and the files other helpers own right now; the exact checks it must run (STAGE-RULES §5),
   **on more than one roll**; the deliverables (screenshots upright and sideways, before/after numbers, notes); "update the ledger
   rows you change and add a §6 lesson if you learn one"; don't push, don't publish the test link.
4. Add it to STATUS.md (what, branch, files, started).
5. **The lead owns the helper's result (Matt, 2026-10-29: "I hold you responsible for these helpers... when they fail, I see this as a
   failure from you").** A brief for anything that changes the look or adds a mode must carry the art direction, not just the mechanics:
   the reference picture to match, the lighting (STAGE-RULES §4: where the light comes from, what's dark, what must stay readable), the
   mood beat by beat, and what "bad" looks like (stretched textures, flat lighting, copy-pasted pieces). A brief for a stage or mode must
   say that every move it teaches is REQUIRED somewhere (an obstacle you can steer round is not a jump). The lead reviews every mock-up
   against Matt's bar (his polish rule, his reference pictures) before showing it to him, and sends it back if it falls short. Never pass
   a mock-up on just because the helper finished it. (Lesson: 7-4's first slide mock-up went to Matt with flat stretched walls and no move
   that needed a jump: "that looks horrible".)

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
5. Remove a helper's worktree only when it is finished for good: a helper continued with SendMessage needs it (if removed, it
   must recreate it with `git worktree add`).
6. Only then: the test link, then STATUS.md, then tell Matt in plain words with the honest flaws.
7. **Matt's test link is his alone (Matt, 2026-10-28: "why can't I get the test link with the new merges... I'm the only one that sees
   it").** Publish it as soon as a merge passes the type check, the full suite and the build, with the known issues in the round's
   note; don't hold it for the inspector, the 200-roll tool or a second round. Those gates still hold for QA builds and releases.

**Watch the helpers (Matt, 2026-10-30: "you have to babysit the helpers to make sure that nothing slips in that shouldn't be"):**
- **Every brief names the files the helper owns, and no two running helpers own the same file.** Before sending a brief, check its file list against every other running helper's. (2026-10-30: PERF-C and PERF-F were both given the ropes and the plant glows; both fixed ropeArt/envPlants/envKit, double the tokens and a reconcile at the deadline.)
- The lead reads every helper diff before it merges; a helper's report is never enough.
- Any change that draws: nothing redrawn every frame that could be painted once; nothing drawn off screen (cull x AND y); no gradients, filters, blurs, advanced blends or readbacks in the frame; no sheet drawn shrunk more than ~1.5x (bake it); nothing loaded mid-play.
- When the automatic speed check exists, a slower build never merges, whoever wrote it.
- A slip goes back to the helper to fix; it never goes in "for now".

**How we build (Matt, 2026-10-30):** before any new system (a stage type, an effect, a creature type, a screen), the lead checks how the best teams build it and whether the foundation carries it, and decides the approach before code is written.

**Drawing changes (Matt, 2026-10-30):** any change that draws, loads art or adds a creature is checked against reference/PERFORMANCE-RULES.md §2 and §8 before it merges. The shared drawing files (§8.3) are the lead's; a helper proposes, the lead merges. Once the draw check and the art size gate exist (§8.1-2), both must pass.

## 5. The QA session

- QA gets a build only after §4 passed. With it goes: what changed, what to test, what to skip (known and being fixed), and the
  current QA checklist (STATUS.md keeps the latest copy).
- A "too hard" report is sorted into unfair (fix) or hard but fair (keep, and tell Matt with the numbers): STAGE-RULES §1b. The
  difficulty ramp is Matt's rule; the lead answers for it.
- QA reports in one batch on Matt's "send". Each item goes onto STATUS.md, is checked against STAGE-RULES (a rule we already have
  that was broken = a §4 failure on our side: say so to Matt), and is fixed as one batch.
- Matt's current instruction: one QA bot, random levels, to keep cost down; full sweeps only when Matt asks (e.g. a world rebuilt).

## 6. Releases

Step zero of every test link and every release: read reference/PARTNER.md and go through its "little pieces" list (Matt, 2026-10-29).

Only when Matt says "push". Before: §4 passed on everything in it; STATUS.md lists what is in and what is not. After the merge:
check the deploy and the Android build, update STATUS.md and the roadmap, tell the QA session what went live.
Then the 15-minute retro in reference/CONTINUOUS-IMPROVEMENT.md (what escaped, what was caught late, the Pareto, the one
countermeasure for the top category), and every new defect in its log with a root cause and a countermeasure level.

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

**(Lifted 2026-10-29: Matt got a usage reset, "run as we did yesterday": full capacity, two builders per world. Use this mode again when he says the budget is tight.)**

**Lowest cost, not sloppy (Matt, 2026-10-28: "keep this down to the cheapest cost now that we have things set up... I don't want it to
get sloppy"):**
- **One builder per world** (gen2 worlds 7-10: one helper does the sections, rooms and hook-up, following DESIGN.md B12). No parallel
  builders on the same world; a core-pipeline change goes to that same builder unless it blocks other work.
- **Effort by job:** medium for writing a world's sections and rooms from the B12 checklist, fixes inside one stage, curation; high only
  for a new mechanic the engine or gen2 doesn't have yet, engine/physics changes, and the lead's reviews; low for cutting art, publishing,
  running checks, status notes.
- **Testing, minimal but complete:** while working, a builder runs only the tests for what it touched plus `--rolls 50`; the full suite,
  200 rolls and the first-timer run ONCE, at the end, before its report. The lead runs the full gate once per merge batch (merge
  everything that's ready, then one gate), not once per branch. QA tests once per world (or per release batch), not after every change.
  Never skip the end checks or a rule: cheaper means fewer repeats, not fewer rules.
- No duplicate work (§3.1). Reuse a running helper instead of a new one.
- Check one roll only for a quick look; the full checks only at §4.
- Don't re-read big files that are already summarised in STATUS.md or the rulebook.
- Ask Matt before anything big that he didn't ask for.

## 3.6 Helpers get their own cloud machine (Matt, 2026-10-29)

Matt: "How come you didn't give people their own virtual machine? Or their own cloud? Like we did yesterday." Every helper runs in its own
cloud session (create_session), never as a local agent in the lead's container: six local art agents plus the lead's gate on one machine
slowed every test run to 30+ minutes and filled the disk. Cloud sessions have the Hugging Face MCP tools too (the audio helper confirmed
it), so art jobs go there as well. Local agents only for a few-minute lookup.


## Review rule: repeating animations (Matt, 2026-10-29 4:02 PM ET)
Anything that plays over and over (warnings, grit, splashes, sparks, debris) gets the same painted bar as a major look. When reviewing, play the stage and watch every repeating effect up close in video, not only stills; code squares, outlined rects or flat blobs are a fail. The 4-4 rock grit slipped through the 10-29 code-drawn audit because it only shows during a warning.

## Review rule: walk the stages, not the spots (Matt, 2026-10-29 4:08 PM ET)
Once tools/inspect/walk.mjs + the seam detector land (polish-clean), every helper that changes a look attaches a clean walk of the stages it touched (upright and sideways, the detector's counts before/after). No walk, no merge. The lead looks at the whole contact sheet and the clip, not only the helper's chosen shots.

## Dot and in-stage lines: the lead approves (Matt, 2026-10-29 4:45 PM ET)
"I'm approving all the dot lines going forward. You should have a pretty good idea how the wording should be based upon the whole story audit."
Matt no longer reviews Dot's in-play lines or Pokey's in-stage thought lines; the lead approves them, line by line, before merge. Bar:
- in play (tips, warnings, room tiers): under 10 words, plain, readable at a glance on a phone, never the answer (name the problem; the move only on Help after struggle), danger names only where the danger can't be seen first;
- Dot's voice (reference/VOICE.md, the story audit "road to A+"): warm, chatty, a run-on talker; in play she is short because he is busy, and her personality shows in rest-point lines (checkpoint, standing still), where one run-on is allowed; going short in a story scene means something is wrong;
- Pokey: short, flat, dry;
- no repeats in a stage (Help), Tips >= 30 s apart, first-time hazards taught once per save.
Story scene lines (cutscenes, the journal, the finale): the lead approves these too (Matt, 2026-10-29 5:00 PM ET), by VOICE.md and the story audit; Matt sees them in context with the story art.

## Releases come from a frozen branch (2026-10-29)
Open the release PR from a branch cut at the checked commit (e.g. `release-YYYY-MM-DD`), never from the work branch: later merges onto the work branch silently join an open PR (PR #47 picked up four unreleased merges and was replaced by #48).

## The lead's own bar before anything reaches Matt (Matt, 2026-11-01: "Is this the polish we expect? ... You are 50% ownership of this game")
What slipped: the 0.9.2 Journal. The lead approved the line templates one by one, in a list, and never looked at the page a real player
with an OLD save sees: every entry fell to 3 filler lines ("I didn't write it down... I remember it was green"), repeated down the page.
Matt found it on his phone. Rules from now on:
1. **Judge the screen, not the list.** Lines, templates and art are approved only as they appear in the game, on a full page, in every state:
   an old save (from before the feature), a fresh save, a half-played one and a finished one. The lead opens each state itself.
2. **Filler is a fail.** A line that could sit under any stage, or that apologises for missing data, is not shipped. Generated text gets a
   no-repeat-on-a-page test and a banned-filler test.
3. **Voice bar:** Pokey is "a slow smart-ass" (Matt). Every Pokey line has to sound like him read aloud; at least every other line should
   earn a smile. Rewrite until it does.
4. **Briefs carry the bar:** every brief that produces player-facing words or looks includes 2-3 example lines/shots at the bar and the
   states the helper must screenshot (old save included). A helper's "polish check" that only shows the happy path is sent back.
5. **Check the fact before you brief on it** (2026-11-01, defect D7): a brief or edit that rests on a fact about the game (what is live,
   what a screen shows, how a rule works) names the file or screen where the lead checked it. Memory and summaries are not a source.
6. **Briefs name the method; reports update it** (Matt, 2026-11-01): every brief has a "Method:" line pointing at reference/methods/,
   and every report has a "Method update" section (what worked better, what failed, the proposed edit). The lead merges proven updates
   into the method file at merge time. See reference/methods/README.md.
7. **Time comes from the machine** (defect D20): briefs and check-ins read the time with `TZ=America/New_York date`, never worked out from UTC by hand; deadlines in a brief are given in ET and in UTC.
8a. **A code fact is read from the value, not a comment** (defect D24): name the file and line where the value or data was read; grep the whole tree (not one file) before saying something does not exist; every helper brief tells the helper to verify the brief's facts it relies on.
8c. **Lessons reach every helper by themselves** (Matt, 2026-11-01; R-9): reference/LESSONS.md prints with the laws at every session start and compaction (SessionStart hook). Every report needs "Method used", "Lessons applied" and "Method update"; the lead sends back a report without them. Every new defect adds its line to LESSONS.md the same day (law 10), and the roadmap-keeper's release sweep checks that every defect has its line.
8b. **Use the helpers that do the best job** (Matt, 2026-11-01; R-8): keep reference/HELPERS.md current at every acceptance (first-time gate, redos, cost, verdict). Give follow-on work in an area to a STRONG helper that is still alive before starting a fresh one; retire a helper whose context is near full or whose work is done, after its lessons are in its method file. Every brief says what goes on the roster.
8. **Check the base before judging a sheet** (defect D23): at every check-in, before opening a helper's sheets, run `git merge-base --is-ancestor <release or main> <helper branch>`. A sheet shot on a stale branch shows fixed problems as current and hides merge conflicts: send it back to merge and re-shoot first. Every sheet and report names its base commit.

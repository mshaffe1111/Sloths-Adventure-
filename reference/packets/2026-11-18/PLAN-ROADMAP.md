# PLAN-ROADMAP: a real build roadmap so the team plans ahead instead of reacting. Planner (architect), Opus 5.5 high.
Written 5:14 PM ET 11-18 (by `date`). MATT 11-18 5:13 PM ET: "Let's continue getting the ideas and planning out everything so that there's
a real roadmap and we can actually start even getting the engine even more prepped so that we're not constantly juggling. We're actually
planning ahead and not reacting." BOX: 2 h or 40% context. Docs only: never edit game code, tests or data.
Read (verify every fact in code or a dated doc; cite file:line; mark guesses): CLAUDE.md, reference/ROADMAP.md (open rows; R-165.250 on),
reference/STATE.md (11-15..11-18 entries), reference/design/LEVEL-LOG.md (ACTUAL hours/costs per job: estimates come from these),
reference/methods/level.md + pitch.md, the designs and picks: reference/design/PICKS-23-25.md, PICKS-26-28.md, and on branches
`git show origin/t-design-24:reference/design/2-4.md` / `2-5.md`, `origin/t-design-23:reference/design/2-3.md`,
`origin/t-design-26:reference/design/2-6.md` / `2-7.md` / `2-8.md`, `origin/t-pitch-b:reference/design/1-9.md`; the game outline
`git show origin/t-design-game-map:reference/plans/GAME-MAP.md` (World 2 rows 174-203, World 3+ rows, §3 the ladder of mechanics,
the engine-pieces lines per world); reference/plans/ENGINE-NEEDS.md and ENGINE-PLAN.md; the member REPORTs of today (origin/t-eng-23,
t-eng-24, t-eng-24c, t-eng-25, t-meter-3, t-build-19, t-build-24, t-var-1: their "for the builder" and "named" sections); src/game/stagePlan.ts
(which stages exist) and gen2/stageTable (which are on gen2 vs hand-built).
Write reference/plans/BUILD-ROADMAP.md (under ~300 lines, plain words a non-programmer can follow at the top; detail below):
1. WHERE WE ARE: a table of every stage 1-1..2-10 + 3-1..3-3: status (live / built-not-shipped / designed / picked / pitched / hand-built
   only), its branch or doc, what blocks it.
2. WORLD 2 TO FINISH (2-3, 2-5..2-10): per stage, the engine pieces it needs (built? branch? not started? size from the design), the art
   (painted? Hugging Face ask?), the story lines (written?), the meter channels (priced?), and the critical path; which engine piece must
   land before which build. Include the boss 2-10 (Crocus Rex: built hand-made? on gen2?).
3. THE ENGINE LANE AHEAD: every NEW engine piece World 2 still needs (from the designs and picks) plus the debt rows that touch the judges
   and bots (R-165.283, .284, .285, .286/.287 meter, .289, .292, .293, .294, the bot set-down fixes on t-build-24) in one ordered queue:
   dependency first, each with size (from LEVEL-LOG actuals), branch base, and which builds it unblocks. Then WORLD 3's engine needs from
   GAME-MAP/ENGINE-NEEDS that are generic enough to start NOW (so World 3's builders never wait).
4. THE PITCH-AHEAD CALENDAR: pitch rounds 3 levels ahead of builders (two lenses, separate packets, D85): which rounds when (2-9/2-10/3-1
   next, then 3-2..3-4 ...).
5. A 7-DAY PLAN in lanes (engine / build / design+pitch / art / debt+tools), at 4 members at once (Matt's cap), each day's jobs and
   what it delivers, with the release points (when a test link, when a release could go to Matt), honest about uncertainty (ranges).
6. RISKS AND WHAT WE KEEP RE-LEARNING (from today: bot defects surfacing in builds, gate artifacts, code-drawn fallbacks, lists only shrink,
   members' context estimates) and the standing countermeasure for each.
Work in a worktree from origin/main on branch t-plan-roadmap, commit the one file (and nothing else), push, and report: the hash, the
critical path in five lines, the next 4 member jobs you'd start, and every fact you could NOT verify.

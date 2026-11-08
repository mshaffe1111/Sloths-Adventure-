# STATE: the PM's ledger (one page; the PM updates it on every PASS, REJECT and decision)

## Live (11-07)
- main 11242520 (PR #66, on 0.9.5 PR #63 + #64 + #65): gen2 1-1 (138 layouts), the survey fix. APK v0.9.5-33 and later. The testers' link is the live site + #ctest.
- Test link EnK5 = the same build (v242).
- main head 181d2846 (PR #67 + #68, 11-07): the team's documents and tools only; `git diff 11242520 181d2846 -- src` is empty.

## The team now (taken stock 11-07 evening by the new lead, session_01FhBbYMoqqEdVR3qFjTCugy)
- Lead: session_01FhBbYMoqqEdVR3qFjTCugy. Backup lead (questions only): session_01FhBbYN2DDsktc7BGtNxPFK.
- Story keeper: session_019iachLiuwNTAZUBSJWUmR3, alive (idle), told the new lead's id 11-07. Its context was at about 803K of 1M
  tokens on 11-07 (near compression). Health check 11-07 about 9:50 PM ET: PASS 3 of 3 (Pell and the blanket; 22 ms a letter and
  piece lines under 10 words; the judged line FAILED for the right reasons), one tool call (list_events). Asked to make STORY-KEEPER.md
  complete before it compresses.
- No Agent-tool member running; nothing in flight; nothing to re-issue.
- Old helper sessions, all idle and retired (TEAM.md "Transition"): some still show "needs action" (art-1-1-sunrise wants a "go" for an
  HF job; render-stone wants "send word to resume"; Ex Tester Data 1 asks about ctest-notes). **Nobody answers them**: the work goes
  through fresh packets. No HF spend without Matt.
- Scheduled tasks: the old lead's check-ins are all disabled. "Morning brief" and "Heartbeat" are Matt's own, not the team's: leave them.
- Lead's cold review: reference/notes/lead-review-2026-11-07.md (its order changes are below).

## Open graph (from Wednesday 11-11, the fresh lead; the team is quiet until the reset), in order
0. ANALYST on the play window that ends Tuesday 11-10, told which recorder fields to distrust (consultant finding 4). The CONSULTANT
   (max) runs only if the analyst finds 3 or more new first-time players in the window (the new lead's call, 11-07 review).
   Same day: R-165.59, delete the testers' recordings as promised.
1. DESIGNER: the reach spec from the 30 fps simulation (reference/consultant/2026-11-07-scripts/sim.py), verified in the engine;
   the gap and rise bands per setting; help thresholds.
2. ARCHITECT: the verdict schema (setting-aware arcs, headroom, floors, lethal vs soft visibility); the perf budget of 8 ms at
   60-for-30, written into PERFORMANCE-RULES §1 and the gate together (today the gate enforces 12 ms).
3. CONTENT: re-lay the 1-1 lessons to the Designer's new reach spec (the consultant suggested a double-teach rise of 136 px or more and
   a bounce teach of 205 px or less; the designer's frozen ruling is a bounce lip of 200-220: the Designer settles it in the spec); the
   log chain on Easy;
   the new art (art-raw-2026-11-07/cut); move the accepted 1-1 near strip into the game (reference/art/near11/w1sun2-near-A.webp,
   sha 64294b6d, replaces src/assets/backdrops/w1sun2-near.webp 85b0f79f) with a wide-pan still: bright right-hand boulders must not
   read as standable, and the seam must hold across 3 tiles (handoffs/art-director.md §1).
4. ENGINE: escalating help (starts once the Designer's help thresholds are in, beside the Architect's task); the recorder fix
   (R-165.58); then the pipeline changes. WebGL stage 0 is off this graph until 1-1 ships (stays on the roadmap).
5. CRITIC: traversal with the real reach; the child, middle and expert bots (after Tuesday's data); the gates. Two new gates from
   handoffs/release-clerk.md §4: fail when the candidate has more `todo:` test markers than main; add funknown.json to knowncheck.

## Carried from the old team (handoffs: reference/handoffs/<role>.md, all six in)
- R-165.47..51 (gentle intro, dead walk, nothing bites, funcheck vs lock, the proven list 138 toward 300).
- The pad's two old coach lines need new words next release (R-165.57; CoachOverlay.tsx COACH_TEXT.pad).
- Bundle headroom 31 KB under 4 MiB; lazy-seeds.py is ready (reference/qa-reports/0.9.5/).
- Dot says nothing while a first-timer stands stuck 20 s at the step (handoffs/tester-page.md §5); goes with escalating help.
- Art: earth ledges "from the floor up only" until Matt rates them; flowering vine petals read grey; Matt's redo list R-01..R-09.

- Ruled (Matt, 11-07): tools/playtesters/personas/ keeps its four first-name files (summary numbers only; Matt checked with them).
  It's the one named exception: everything else stays roles-only.

## Decisions waiting on Matt (the one list; each has an R-number on ROADMAP.md)
- R-165.52: a fixed first 1-1 (Super Mario Run style) or random from the start (consultant finding 9).
- R-165.53: lethal pits in a first stage: allowed if they look different, or none. Blocks Content's 1-1 re-lay; asked first.
- R-165.54: the "can it float?" ratings for earth ledges: a rating page of about 40 pieces, 10 held back to test the
  rule the ratings teach (the plan: the lead branch's next-week notes, "float rating").
- R-165.55: the story keeper's 10 open story threads (reference/story/STORY-KEEPER.md).
- R-165.56: done (PR #67 and #68, merged 11-07).
Matt's question queue (one at a time, in this order): R-165.53 (asked 11-07 about 9:48 PM ET); then the story keeper's three, in its order
(11-07): #10 skulls (all out, or only remains in soil?), #2 the two food lines (keep each, yes/no), #1 Meeca's parents (its pick:
unspoken); then R-165.52, R-165.54.
Story keeper's answers, 11-07 evening (STORY-KEEPER.md updated in commit 948f8931 on ccr-0d59a91c-oy3imz; read only, never build from it):
- #8 decided: `lesson.bounce` teaches the bounce, no hint.1-1.bounce row. Content's 1-1 packet done-item: the card fires at gen2 1-1's
  FIRST mushroom.
- R-165.57 words (lead approves, conditional): pad jump "Press Jump" / "Tap the Jump button to leap."; pad nice "Nice jump!" / "In the
  air, tap Jump again for a double jump."; run unchanged. Condition, in the Engine/Critic packet: a pad player TAPPING twice clears the
  double-teach gap (195-205 px) in the real engine; if not, the nice line says "press and hold Jump again".
- #3: the story keeper fixes the Cast Bible (Dot is she, Grandpa's timeline) to match the approved VOICE.md: lead OK'd.
- #4 the prologue ships; #5 (1-5 text) waits with R-165.45; #7 waits for 1-2; #6 one HF list through the lead after the 1-1 art audit;
  #9 a low-priority UI ticket.
Not Matt's: the pad's two coach lines (R-165.57) are the lead's call with the story keeper (LEAD-PLAYBOOK: the lead approves in-play
lines); Matt sees them in the release.

## Defect log: reference/CONTINUOUS-IMPROVEMENT.md. Method index: reference/methods/README.md. Team: reference/TEAM.md.

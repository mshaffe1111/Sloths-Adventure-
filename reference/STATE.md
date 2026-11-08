# STATE: the PM's ledger (one page; the PM updates it on every PASS, REJECT and decision)

## Live (11-07)
- main 11242520 (PR #66, on 0.9.5 PR #63 + #64 + #65): gen2 1-1 (138 layouts), the survey fix. APK v0.9.5-33 and later. The testers' link is the live site + #ctest.
- Test link EnK5 = the same build (v242).
- main head 181d2846 (PR #67 + #68, 11-07): the team's documents and tools only; `git diff 11242520 181d2846 -- src` is empty.

## The team now (taken stock 11-07 evening by the new lead, session_01FhBbYMoqqEdVR3qFjTCugy)
- Lead: session_01FhBbYMoqqEdVR3qFjTCugy. Backup lead (questions only): session_01FhBbYN2DDsktc7BGtNxPFK.
- Story keeper: session_019iachLiuwNTAZUBSJWUmR3, alive (idle), told the new lead's id 11-07. Its context was at about 803K of 1M
  tokens on 11-07 (near compression). Health check 11-07 about 9:50 PM ET: PASS 3 of 3 (Pell and the blanket; 22 ms a letter and
  piece lines under 10 words; the judged line FAILED for the right reasons), its one tool call the send_message (confirmed with list_events). Asked to make STORY-KEEPER.md
  complete before it compresses: done (§8 Turnover, ccr-0d59a91c-oy3imz 3894660b and after). Cast Bible fixed (Docs rev 43).
- No Agent-tool member running; nothing in flight; nothing to re-issue.
- Old helper sessions, all idle and retired (TEAM.md "Transition"): some still show "needs action" (art-1-1-sunrise wants a "go" for an
  HF job; render-stone wants "send word to resume"; Ex Tester Data 1 asks about ctest-notes). **Nobody answers them**: the work goes
  through fresh packets. No HF spend without Matt.
- Scheduled tasks: the old lead's check-ins are all disabled. "Morning brief" and "Heartbeat" are Matt's own, not the team's: leave them.
- Lead's cold review: reference/notes/lead-review-2026-11-07.md. A cold Critic REJECTED its first version (15 items, 11-07); two of
  its changes were withdrawn (WebGL stays on the graph; the consultant runs after every window as written). Corrections are in the note.

## Open graph (from Wednesday 11-11, the fresh lead; the team is quiet until the reset), in order
0. ANALYST on the play window that ends Tuesday 11-10, told which recorder fields to distrust (consultant finding 3 in
   responses.md's numbering; R-165.58). Then the PACKER and the CONSULTANT (max), as CONSULTANT.md says. Then R-165.59: the recordings
   and the named history deleted, after the analyst's aggregates exist and the 11-07 review has a redacted copy on main.
1. DESIGNER: the reach spec from the 30 fps simulation (reference/consultant/2026-11-07-scripts/sim.py), verified in the engine;
   the gap and rise bands per setting; help thresholds (R-165.60).
2. ARCHITECT: the verdict schema (setting-aware arcs, headroom, floors, lethal vs soft visibility) (R-165.61); the file list for every
   later packet. The 8 ms at 60-for-30 is the last lead's figure: PERFORMANCE-RULES §1 says 12 ms and no gate measures ms (limits.json
   caps canvas calls only). Changing §1 is Matt's rule: R-165.65, in his queue.
3. CONTENT: re-lay 1-1 with no lethal drops (R-165.53) and pick the fixed first-run layout (R-165.52); the bounce card fires at the
   first mushroom (story keeper #8); re-lay the 1-1 lessons to the Designer's new reach spec (the consultant suggested a double-teach rise of 136 px or more and
   a bounce teach of 205 px or less; the designer's frozen ruling is a bounce lip of 200-220: the Designer settles it in the spec); the
   log chain on Easy;
   the new art (art-raw-2026-11-07/cut); move the accepted 1-1 near strip into the game (reference/art/near11/w1sun2-near-A.webp,
   sha 64294b6d, replaces src/assets/backdrops/w1sun2-near.webp 85b0f79f) with a wide-pan still: bright right-hand boulders must not
   read as standable, and the seam must hold across 3 tiles (handoffs/art-director.md §1).
4. ENGINE, on the Architect's file list: the recorder fix (R-165.58, so the NEXT window is clean); escalating help (R-165.62); the
   pipeline changes; the WebGL stage 0 onto main (R-3.1; Matt's GPU direction, 10-30; Matt's Pixel worst frame 58 ms upright and
   96 ms sideways on 11-06 against the 50 ms rule, GPU-RENDERER-PLAN.md:67).
5. CRITIC: traversal with the real reach; the child, middle and expert bots (after Tuesday's data); the gates. Two new gates from
   handoffs/release-clerk.md §4: fail when the candidate has more `todo:` test markers than main; add funknown.json to knowncheck
   (R-165.63, R-165.64).

## Wednesday's packets (R-165.66): reference/packets/2026-11-11/ (ANALYST, DESIGNER-R-165.60, PACKER, ARCHITECT-R-165.61), the
personas sharpened in DESIGNER, ARCHITECT, ENGINE, CONTENT and DATA-ANALYST; through a cold Critic before Wednesday.

## Continuous improvement (Matt, 11-07: "you have the right to kill the continuous improvement if you think it'll hurt the project")
The lead's call: KEEP it. On its first night it caught 15 errors in the lead's own documents before anything ran on them (D34). What
gets cut is bookkeeping that catches nothing: R-165.67 (the Critic simplifies roadmapcheck's BUILD-PLAN prose check so a new row
doesn't force a hand-written sum). The defect log, root causes, gates and the cold Critic stay.

## Carried from the old team (handoffs: reference/handoffs/<role>.md, all six in)
- R-165.47..51 (gentle intro, dead walk, nothing bites, funcheck vs lock, the proven list 138 toward 300).
- The pad's two old coach lines need new words next release (R-165.57; CoachOverlay.tsx COACH_TEXT.pad).
- Bundle headroom 31 KB under 4 MiB; lazy-seeds.py is ready (reference/qa-reports/0.9.5/).
- Dot says nothing while a first-timer stands stuck 20 s at the step (handoffs/tester-page.md §5); goes with escalating help.
- Art: earth ledges "from the floor up only" until Matt rates them; flowering vine petals read grey; Matt's redo list R-01..R-09.

- Ruled (Matt, 11-07): tools/playtesters/personas/ keeps its four first-name files (summary numbers only; Matt checked with them).
  It's the one named exception: everything else stays roles-only.

## Decisions waiting on Matt (the one list; each has an R-number on ROADMAP.md)
Matt, 11-07 (message received about 9:54 PM ET): "You're the expert in making video games. Things like how the first level should be executed... That's why I
hired you." Design and technical calls are the lead's; story stays with the story keeper (Matt has the final say); taste of art he rates.
- R-165.52: DECIDED by the lead 11-07: the first-ever run of 1-1 is one fixed, hand-checked layout; replays roll.
- R-165.53: DECIDED by the lead 11-07: no lethal drops in 1-1; a deadly drop gets its own look and is taught where it first appears.
- R-165.65: DECIDED by the lead 11-07: PERFORMANCE-RULES §1 stays 12 ms (pass/fail); 8 ms is the WebGL design target, not a gate.
- R-165.54: the "can it float?" ratings for earth ledges (Matt rates the pieces).
- R-165.55: the story keeper's open story threads (reference/story/STORY-KEEPER.md).
- R-165.56: done (PR #67 and #68, merged 11-07).
Matt's question queue (one at a time, in this order): the story keeper's three, in its order
(11-07): #10 skulls (all out, or only remains in soil?), #2 the two food lines (keep each, yes/no), #1 Meeca's parents (its pick:
unspoken); then R-165.54.
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

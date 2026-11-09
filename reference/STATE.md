# STATE: the PM's ledger (one page; the PM updates it on every PASS, REJECT and decision)

## Live (11-07)
- main 11242520 (PR #66, on 0.9.5 PR #63 + #64 + #65): gen2 1-1 (138 layouts), the survey fix. APK v0.9.5-33 and later. The testers' link is the live site + #ctest.
- Test link EnK5 = the same build (v242).
- main head 181d2846 (PR #67 + #68, 11-07): the team's documents and tools only; `git diff 11242520 181d2846 -- src` is empty.

## The team now (taken stock 11-07 evening by the lead, session_01FhBbYMoqqEdVR3qFjTCugy; the lead's memory was compressed 11-09)
- Lead: session_01FhBbYMoqqEdVR3qFjTCugy. Backup lead (questions only): session_01FhBbYN2DDsktc7BGtNxPFK.
- Model: every member on Fable 5.2 until Matt says otherwise (Matt, 11-09). Effort stays the lead's call (Matt, 11-07).
- Tester data (backup lead's answer, 11-07): the Google sheet "Sloths control tests", tab Sessions, filled by its bound collector
  tools/control-test-collector.gs. Names never leave the sheet. Tester names in main's files and history: R-165.68 and R-165.69.
- Story keeper: session_019iachLiuwNTAZUBSJWUmR3, alive (idle), told the new lead's id 11-07. Its context was at about 803K of 1M
  tokens on 11-07 (near compression). Health check 11-07 about 9:50 PM ET: PASS 3 of 3 (Pell and the blanket; 22 ms a letter and
  piece lines under 10 words; the judged line FAILED for the right reasons), its one tool call the send_message (confirmed with list_events). Asked to make STORY-KEEPER.md
  complete before it compresses: done (§8 Turnover, ccr-0d59a91c-oy3imz 3894660b and after). Cast Bible fixed (Docs rev 43).
- Members and their session ids: listed under "In flight" below as each is created.
- Old helper sessions, all idle and retired (TEAM.md "Transition"): some still show "needs action" (art-1-1-sunrise wants a "go" for an
  HF job; render-stone wants "send word to resume"; Ex Tester Data 1 asks about ctest-notes). **Nobody answers them**: the work goes
  through fresh packets. No HF spend without Matt.
- Scheduled tasks: the old lead's check-ins are all disabled. "Morning brief" and "Heartbeat" are Matt's own, not the team's: leave them.
- Lead's cold review: reference/notes/lead-review-2026-11-07.md. A cold Critic REJECTED its first version (15 items, 11-07); two of
  its changes were withdrawn (WebGL stays on the graph; the consultant runs after every window as written). Corrections are in the note.

## In flight (each member is its own session Matt can see in his Code list and retire; tag "sloths-team"; all on claude-fable-5-2)
- session_01FhBbYNzmgt3tyXdLKeupZG, "Critic: lead documents audit (11-09)": audits e5aafcea..119f1720 (lead documents). Created 11-09 2:11 PM ET. Read-only.
- session_01FhBbYJiR4o74fu7RgAv6EF, "Critic: packets and role cards audit (11-09)": packets and member cards, Designer packet first. Created 11-09 2:11 PM ET. Read-only.
- Check-in armed: trig_013wE1r1WfL3Yy69MCQ6Pg8N (2:43 PM ET), re-armed until the last member stops.
- Next out: the Designer (R-165.60), on "DESIGNER: PASS" from the packets Critic.

## Open graph (started Monday 11-09: Matt, about 2 PM ET, "I have fable only usage. Lets create our team and start this week. Right
## now the team must be fable 5.2"; then "Do not keep under yourself. They should have their own bot": every member is its own session on model "claude-fable-5-2", R-165.74), in order
0. ANALYST on the play window that ends Tuesday 11-10: dispatched only after the window closes (its packet reads "the window that
   ended"), told which recorder fields to distrust (consultant finding 3 in
   responses.md's numbering; R-165.58). Then the PACKER and the CONSULTANT (max), as CONSULTANT.md says. Then R-165.59: ONLY the pre-0.9.5
   recordings deleted (Matt 11-07: newer data stays until testing ends), after the analyst's aggregates exist.
1. DESIGNER, first out, 11-09: the reach spec from the 30 fps simulation (reference/consultant/2026-11-07-scripts/sim.py), verified in the engine;
   the gap and rise bands per setting; help thresholds per setting (R-165.60).
2. ARCHITECT, after the Designer's Critic PASS: the verdict schema (setting-aware arcs, headroom, floors, lethal vs soft visibility)
   (R-165.61); the file list for every later packet; the frame-budget sheet and the frame-time gate's spec as an Engine packet
   (R-165.65: 8 ms per Matt's 11-06 ruling, GPU-RENDERER-PLAN.md:52-58; PERFORMANCE-RULES §1 still reads 12 ms and no gate measures
   frame time until that packet lands).
3. CONTENT (R-165.72): re-lay 1-1 with no lethal drops (R-165.53) and pick the fixed first-run layout (R-165.52); the bounce card fires at the
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
   (R-165.63, R-165.64). The rule finder (R-165.70) and the detached-HEAD guard (R-165.73).

## The packets (R-165.66): reference/packets/2026-11-11/ (ANALYST, DESIGNER-R-165.60, PACKER, ARCHITECT-R-165.61, an AUDIT for each),
the personas sharpened in DESIGNER, ARCHITECT, ENGINE, CONTENT and DATA-ANALYST. The folder keeps its 11-11 name; the work started 11-09.
No member is dispatched on a document until a cold Critic has passed it.

## Continuous improvement (Matt, 11-07: "you have the right to kill the continuous improvement if you think it'll hurt the project")
The lead's call: KEEP it, every check included. On its first night it caught errors in the lead's own documents before anything ran
on them (D34), then the same kind of mistake again two minutes later (D35: R-165.67 would have loosened a check, R-165.65 overturned
a ruling of Matt's; both reversed). D36: a Critic's `git checkout` in the shared tree detached HEAD and two pushes silently missed
(9:56-10:09 PM ET 11-07); members now read with `git show` or their own worktree, and R-165.73 builds the guard.
The defect log, root causes, gates and the cold Critic stay.

## Carried from the old team (handoffs: reference/handoffs/<role>.md, all six in)
- R-165.47..51 (gentle intro, dead walk, nothing bites, funcheck vs lock, the proven list 138 toward 300).
- The pad's two old coach lines need new words next release (R-165.57; CoachOverlay.tsx COACH_TEXT.pad).
- Bundle headroom 31 KB under 4 MiB; lazy-seeds.py is ready (reference/qa-reports/0.9.5/).
- Dot says nothing while a first-timer stands stuck 20 s at the step (handoffs/tester-page.md §5); goes with escalating help.
- render-stone (R-165.28): paused work on origin/render-stone 7da53035, not in main (handoffs/designer.md:97 parks it; no handoff lists
  what's left); it waits until 1-1 passes. Left
  (its last commit message): the trunk past the slab fault, world kin above 360 px, upright stills, the after count, a lock re-run, the
  full tests and gates, the props/earth islands. Re-issue as a fresh packet then; never resume the old session.
- art-1-1-sunrise's HF "go": never given, superseded by the near11 repaint (HF-SPEND.md 11-06). Don't run it.
- Hugging Face: $65.55 balance (Matt, 11-07 evening; CLAUDE.md:25 still says $72: Matt's file, the line to give him is in lead.md); keep about $15 reserve; nothing outstanding (backup lead, HF-SPEND.md).
- Art: earth ledges "from the floor up only" until Matt rates them; flowering vine petals read grey; Matt's redo list R-01..R-09.

- Ruled (Matt, 11-07): tools/playtesters/personas/ keeps its four first-name files (summary numbers only; Matt checked with them).
  It's the one named exception: everything else stays roles-only.

## Who the game is for (Matt, 11-07, received by 10:11 PM ET; R-165.71)
"This isn't supposed to be a kid game... it should be hard enough for adults too... easy mode is for kids and normal are for adults or
over a certain age, probably like 12." Normal = 12 and up; Easy = children. Matt is recruiting child testers but has few contacts.

## Decisions waiting on Matt (the one list; each has an R-number on ROADMAP.md)
Matt, 11-07 (9:53 PM ET): "You're the expert in making video games. Things like how the first level should be executed... That's why I
hired you." That covers game-design calls like the first level. It does not cover his own rulings: a rule or number he set changes only
when he changes it (LAWS 22; D35). Story stays with the story keeper (Matt has the final say); art he rates.
- OPEN, asked 11-09: Matt asked for "the key line process that Ed Hang uses", a one-page view of where we are and where we're going.
  Two web searches found no method or person by that name. Asked him to pick: A) a Kanban board (the lead's pick, on the sound of it),
  B) Hoshin Kanri, C) an A3 report, D) something else. No answer yet; build the page when he picks. Never guess it.
- R-165.52: DECIDED by the lead 11-07: the first-ever run of 1-1 is one fixed, hand-checked layout; replays roll. Built in R-165.72.
- R-165.53: DECIDED by the lead 11-07, re-judged per setting 11-09: no lethal drops in 1-1 on Easy or Normal, because 1-1 is where the
  controls are learned (not because of the player's age). Normal's bite comes from its reach bands and from 1-2 on. A deadly drop
  gets its own look and is taught where it first appears.
- R-165.62: re-judged per setting 11-09: on Easy the help steps in by itself; on Normal it is offered, the player may ignore it, and
  the stage never changes by itself.
- R-165.65: the lead's 11-07 ruling ("8 ms is a design target, not a gate") is WITHDRAWN (D35): it overturned Matt's 11-06 "build for
  60" ruling (GPU-RENDERER-PLAN.md:52-58). Open work now: the Architect's budget sheet, an Engine gate that measures frame time,
  §1 and limits.json changed to 8 ms with a planted test. Until it lands every member designs to 8 ms.
- R-165.54: DECIDED by Matt 11-07 (received by 10:21 PM ET): platform-looking pieces may float; skinny ones attach; rocks and decor never
  float (STAGE-RULES.md 'What may float').
- R-165.55: the story keeper's open story threads (reference/story/STORY-KEEPER.md).
- R-165.56: done (PR #67 and #68, merged 11-07).
Matt's question queue (one at a time, in this order): R-165.69 (rewrite main's history to remove tester names: his call); the story
keeper's three, in its order
(11-07): #10 skulls (all out, or only remains in soil?), #2 the two food lines (keep each, yes/no), #1 Meeca's parents (its pick:
unspoken).
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

# STATE: the PM's ledger (one page; the PM updates it on every PASS, REJECT and decision)

## Live (11-07)
- main 11242520 (PR #66, on 0.9.5 PR #63 + #64 + #65): gen2 1-1 (138 layouts), the survey fix. APK v0.9.5-33 and later. The testers' link is the live site + #ctest.
- Test link EnK5 = the same build (v242).
- main head 181d2846 (PR #67 + #68, 11-07): the team's documents and tools only; `git diff 11242520 181d2846 -- src` is empty.

## The team now (taken stock 11-07 evening by the lead, session_01FhBbYMoqqEdVR3qFjTCugy; the lead's memory was compressed 11-09)
- Lead: session_01FhBbYMoqqEdVR3qFjTCugy. Backup lead (questions only): session_01FhBbYN2DDsktc7BGtNxPFK.
- MODEL NOW (Matt, 11-09 9:05 PM ET: "Move everything to opium 5.5", read as Opus 5.5): then 9:07 PM ET "Other than engine work.. stays fable for
  now": every member on "claude-opus-5-5" EXCEPT engine work (the Engine member), on "claude-fable-5-2" at effort medium. The
  lead read the second message as "engine work stays Fable" (his word twice earlier) and told him so. Other Fable lines below are history. The lead's own session is switched by Matt, not by the lead (it reads Fable 5.2).
- Model, earlier: every member on Opus ("claude-opus-5-5") until Matt says otherwise (Matt, 11-09 evening: "Keep others now on opus", R-165.76; it replaced that afternoon's "the team must be fable 5.2". The two Fable Critics hit the weekly limit 5 minutes in at 2:16 PM ET and finished at 8:20 PM). Effort stays the lead's call (Matt, 11-07).
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
- Lead's cold review: reference/notes/lead-review-2026-11-07.md. Cold Critics REJECTED it three times (D34, D35); four of
  its changes were withdrawn (WebGL stays on the graph; the consultant runs after every window as written; the R-165.65 ruling; R-165.67's first version). Corrections are in the note.

## In flight (each member is its own session Matt can see in his Code list and retire; tag "sloths-team")
- Matt's board: https://claude.ai/artifact/8UGhTNnJNZhbpDBV87avR2 (R-165.75; republish in place, reference/methods/board.md).
- Matt, 11-09 8:29 PM ET (R-165.84): "Pull in data from testers. Start fixing 1 -1 after test data is evaluated. Make plan and start
  making change. Keep coder fable 5.2 medium not go over 50 before i get a new test." So: analyst, then the 1-1 fix plan, then the
  changes; the member that writes game code is on Fable 5.2 at effort medium; everyone else on Opus (R-165.76); lean, one member at
  a time. Matt, 8:36 PM ET: "B. Have 80.00 available. Keep game engine on fable 5.2": the cap is $50 of
  extra usage, out of $80 he has, before he gets a new test link; the Engine member stays on Fable 5.2.
- THE SPEND LEDGER (get_session usage.cost_usd, an estimate, not the bill; the lead's own turns spend from the same money). Baseline
  11-09 8:36 PM ET: the lead's session reads $36.68 lifetime (count only what it adds from here); the two afternoon Critics $4.55 +
  $3.95 = $8.50 (counted). Spent against the $50: $8.50. Add each member's cost when it stops, and the lead's rise at each check-in.
  Matt, 8:40 PM ET: "Can go to 70 max including promote": the cap is now $70 at most, and that includes promoting the build (the
  gates, the test link and the release work). Plan to the $50; the extra $20 is headroom for the promote, not for more scope.
  At $45 tell Matt; at $55 stop creating builders and start the promote.
- DONE, not yet PASSED: session_01FhBbYMtU8vX2MemCij28Av, the analyst (Opus), reported 11-09 8:52 PM ET: t-w11-analyst@115e9629,
  6 of 6 done-items, 4,549 rows read; since 0.9.5: 95 gen2 1-1 runs, 9 players (Normal 81 runs / 8 players, Easy 14 / 3). Its top
  findings: all 36 Normal lives lost are pits in raised pieces (w1-log-chain-rise 10, w1-mushroom-chain-back 8, w1-log-chain 6);
  lives don't fall with practice; taps read as punches (475 of 693 punches followed by a jump within 0.6 s, 9 of 9 players); one
  Easy player's 37-minute run with 152 put-backs and no help ever fired; the 11-07 "impossible" numbers were report maths, not the
  recorder. Pushback: top speed 520 not 430; the sheet's Arrived column is Pacific time. Cost $4.03.
- PASSED 11-09 9:01 PM ET: the analyst's window report, t-w11-analyst@469db5d1 (Critic session_01FhBbYNirV1y3h5X1zqZd7m; the missing
  life was w1-last-step-up). Not merged: it rides to main with the release PR. The delta to the close (attempts 3-4, 11-11) PASSED at
  t-w11-analyst@d43ac71d: 40 new rows, 4 runs, 0 lives; window total 99 runs, 36 Normal lives, misread 481 of 700; top 10 unchanged.
- PASSED 11-09 9:12 PM ET: the Designer's reach spec (R-165.60), t-designer-reach@030a4093, three attempts. The Critic
  (session_01FhBbYL3Mdff38pvPYDhgkv) re-flew it with its own script: single apex 97.8 px, climbs 123, level gap 246; double apex 189,
  climbs 214, gap 396-400 flicked and 409-411 held; bounce climbs 223; one jump crosses the 203 and 228 px lesson gaps; reachJump
  single short 33-69 px, double short 57-98. New bands: Normal test gap 252-262; the double is taught by a rise (Normal 136-140,
  Easy 128-132). Its last edit (help.md §2 = §4) was checked by the lead against the diff; the Critic had said no re-flight needed.
  help.md is a proposal, not flown: put-back help at 3 / 5 / 8 / 12 per piece. Not merged: it rides to main with the release PR.
  The Architect (R-165.61) may now go out; held for money (Matt's A/B/C on the cap is open).
- ENGINE PUSHBACK, accepted 9:11 PM ET: the packet's frozen input was wrong. 1-1 is built by gen2Roll11 and is not in GEN2_STAGES
  (gen2/game.ts:86-96), so Easy already has softOn true; lives are lost on Normal only (9 of 148 edge falls on seed 3747 reach
  loseLife). RealPlay stubs loseLife (realPlay.ts:141), so the sweep must run the real one. The lead's packet and the Critic that
  passed it both carried the error: log it as a defect (D37) with its countermeasure when the build is in.
- The Engine packet R-165.86 PASSED as changed (delta Critic, three rounds, its last two lines applied as written, no re-audit
  needed by its word); the fix plan PASSED. The Engine member (Fable 5.2, effort medium) goes out 11-09 9:05 PM ET on branch
  t-engine-putback; PASSED 11-09 10:05 PM ET (Critic session_01FhBbYMPMRnQdGzTReh4x3v, Opus: 3,812 real-loseLife flights, 0 lives lost, 0 bad set-backs, 36 builds
  of 1-2/1-4/1-5/2-1/8-3/8-5 byte-identical to main, full suite 2,481 pass / 0 fail, seedlist 138 seeds, knowncheck PASS; no violations).
  Test link A's first half is done: t-engine-putback@41c2e248, not merged. Defect D37 and R-165.90 logged. Notes: RealPlay.setBacks
  (R-165.90); the engine member: session_01FhBbYNUwoxpt2ufU9ozYYg (Fable 5.2, medium, $8.32). Reported 9:32 PM ET: session_01FhBbYNUwoxpt2ufU9ozYYg, the Engine (Fable 5.2, medium), t-engine-putback@41c2e248,
  6 of 6 done-items: GraphBrief.softFalls -> Gen2Meta.softFalls -> softFallStage() -> engine softOn; red on main saved; 138 seeds
  unchanged. Rough spot named: Dot's jump hint shows after a set-back (A2 owns it).  (An Opus Engine session, session_01FhBbYLPQPNAz6xNudSS5Zd, held the task for two minutes
  between Matt's two messages; interrupted and archived, cost $0.42.)
- DECIDED by Matt 11-09 9:17 PM ET ("I already picked A", to the cost question): tonight only A1 is finished and passed; everything
  for A2 (the story keeper's words, the packet, its Critic, the build), the Architect and the promote run after the weekly reset,
  Wednesday 11-11 2:00 AM ET, on free usage. A reminder is armed for 2:05 AM ET Wednesday (the "start A2 after the weekly reset"
  scheduled task). Tonight's spend should stop near $62. Matt gets ONE test link with A1 and A2 on Wednesday.
- DECIDED by the lead 11-09 9:15 PM ET, the help schedule (R-165.62; reference/ONE-ONE-FIX-PLAN.md "The help schedule"): Easy 3 Dot
  says the move / 5 pad tap is a full jump / 8 a step grows by itself; Normal 3 Dot says the move / 12 Dot offers the step. The ghost
  is cut from test link A. Proposals until flown.
- DECIDED by Matt 11-09 9:10 PM ET ("A"): test link A ships A1 AND A2 together (no lives lost, with help after put-backs), forecast
  $70-75, at the cap. A2's packet is written when the Designer's Critic has judged help.md; A3 (the tap rule) waits for the next link.
- THE 1-1 FIX PLAN: reference/ONE-ONE-FIX-PLAN.md (written 11-09 8:59 PM ET from the analyst's report; the analyst's Critic said
  REJECT on two small report items, attempt 2 is with the analyst, and found all six main claims TRUE). Test link A: A1 no fall in
  1-1 costs a life (R-165.86, packet packets/2026-11-09/ENGINE-R-165.86.md, with the delta Critic for a PASS before dispatch), A2 help
  after put-backs (R-165.62), A3 the tap rule (R-165.87); A2 and A3 wait on the Designer. Test link B: the re-lay with Matt's art.
- DONE: session_01FhBbYKQPPcDe1fW9ZijADh, the Opus delta Critic: ANALYST PASS, DESIGNER PASS at d4620b3b; its last two REST items
  (roster effort rows, R-165.76's file list) answered in 7f5d0480, which it said needs no re-audit if done as written. Cost $1.50.
- WORKING (Matt's "A", 10:26 PM ET): session_01FhBbYMudbQivef7PSaeM4a, "Architect: the verdict schema and file lists (R-165.61)",
  Opus, high, due 1:30 AM ET, about $6 of the last $20. REPORTED 10:34 PM ET: t-r165-61-verdicts@a94ede53, 5 of 5, nothing cut;
  16 named verdicts (verdicts.types.ts, ADR-001), first run (ADR-002), PACKETS.md (E0 verdicts, E1 recorder, E2 help, E3 WebGL0, E4
  frame gate, C1 re-lay, C2 art; order on shared files stated), BUDGET.md. The lead ruled its question: gen2 1-1 lays no water; C1 lays
  none. PASSED 11-09 10:40 PM ET at t-r165-61-verdicts@c4687177 (Critic session_01FhBbYMVs6NGSAffnkoDsNk, two rounds). The lead ruled
  ADR-002: a retry before the first finish of 1-1 replays the fixed layout; every run after it rolls. Nit for E0: list real verdict
  names in notJudged, not the arc.* wildcard. Then Matt, 10:52 PM ET, "Can anything be done with 10.00": "A", the
  art cut. WORKING: Content, cutting and cataloguing Matt's 15 sheets (R-165.85), Opus medium, created 10:56 PM ET, due 1:00 AM ET,
  branch t-c2-art-cut; packet passed by a Critic (session_01FhBbYLu2qvAbccX1MFpoDX) at ff864873. REPORTED 11:14 PM ET: t-c2-art-cut@fa3e6e77, 48 kept / 10 rejected,
  30 MB added; flags kept (M-04-b crate words, M-06-e pitcher plants, sheet 02 top view); rough spots named (M-09-a root pockets, M-05-a
  mauve trunk top). The lead's ruling on its pushback: the 7 clean pieces under 600 px are allowed and move into src/assets/w1-1109/ when
  C2 places art. PASSED 11-11 2:17 AM ET at t-c2-art-cut@eddc6b0c (two attempts): 54 kept, 4 rejected, 30.4 MB; 5 pieces have a true
  flat top, 28 are "by hand" with their readings. Its Critic follows on its report (about $3). The sprint board is republished
  at every member start, stop and verdict (Matt, 10:26 PM ET: "make sure to keep sprint board updated").
- WORKING: session_01FhBbYMHMXc5mHeNEeVEhTR, "Designer: the real reach numbers, flown in the engine (R-165.60)", Fable 5.2 (Matt,
  tonight), created 11-09 8:43 PM ET, due 12:45 AM ET, branch t-designer-reach. Sent alongside the analyst because Matt asked for
  the Designer and the Architect tonight; they share no WRITE file. Its result goes to a fresh Critic with AUDIT-DESIGNER.
- Matt's art (asked 8:47 PM ET: "I create a lot of new art b4 you took over"): 50 weekend sheets cut to 91 kept pieces (68 usable in
  World 1) on branch art-raw-2026-11-07 cut/CATALOG.md; 107 kept from the 11-05 sheets (reference/art/cut/ on art-director); 1-1's
  atlas in the game holds 18. None of the 91 is placed. At 8:51 PM ET he sent 12 more sheets into the Designer's session, then all 15 to the lead (R-165.85): saved in
  reference/art-incoming/matt-2026-11-09/ (e19abd7c), not yet cut. All of it is Content's, in R-165.72.
- Next: the Architect (R-165.61, Fable 5.2 tonight) after the Designer's Critic PASS. Then the 1-1
  fix plan from the analyst's top 10; the Engine member on Fable 5.2 at medium. Ask Matt, at Content's first packet that writes
  under src/, whether "coder" covers Content.
- Matt, 11-09 8:42 PM ET: "At $82 now total 75.00 new limit. Architect and designer on fable 5.2 for 2nite". The lead's reading, told
  to him: he has $82 of extra usage in all and the cap is now $75, promote included; for tonight (11-09) the Designer and the
  Architect are created on "claude-fable-5-2" (with the Engine member, R-165.84); the analyst and the Critics stay on Opus.
  Tripwires: tell Matt at $50; at $60 stop creating builders and start the promote.
- MODEL NOW (Matt, 11-09 10:25 PM ET: "Use opus 5.5 medium and high going forward based model needs"): EVERY member, the Engine
  included, on "claude-opus-5-5"; effort medium or high by the task (the packet's effort line); the lead also on Opus 5.5. This
  replaces the Fable lines above. Money: about $20 left of his $82 (Matt, same message).
- LEAD MODEL: Matt switched the lead session to Sonnet 5.5 at 9:38 PM ET ("The Fable 5.2 just burns tokens"). The lead had been on Fable 5.2 at
  effort medium, so effort was not the cause; the model tier and a 480k-token context were. Members unchanged (Opus; Engine on Fable).
- WEDNESDAY 11-11, from 2:06 AM ET (the weekly reset was 2:00 AM ET):
  - The OLD trigger trig_018T4m55rQ1cTxAbGtXyKwLX (written 11-07) fired at 2:06 AM ET with its 11-07 to-do list; every item in it was
    done on 11-09 (both REJECTs answered and passed, D35 and D36 logged, the analyst and Designer dispatched and passed). Not acted on;
    it is spent (run_once_fired). The lead forgot to delete it on 11-09 as lead.md said: noted here, no harm.
  - The art cut's Critic (session_01FhBbYKaDjEyKBkHBkQSaNQ) died on the weekly limit at 11:16 PM ET Monday before reporting; asked at
    2:07 AM ET to restart its audit of t-c2-art-cut@fa3e6e77.
  - The story keeper (session_019iachLiuwNTAZUBSJWUmR3) asked at 2:07 AM ET for Dot's words for the help schedule (A2). Its context is
    about 863k tokens, near its compaction point: each message to it is costly; ask in one message, take one reply.
  - The lead's own 2:05 AM reminder fired too: its "Engine on Fable 5.2" and "dispatch the Architect" lines are superseded (Opus for
    all, R-165.91; the Architect passed 11-09). The A2 packet is written (packets/2026-11-09/ENGINE-R-165.62-A2.md), waiting for Dot's
    words. The analyst (same session, attempt 3) asked at 2:09 AM ET for the delta read of the closed window.
  - The A2 packet PASSED 11-11 2:23 AM ET after two rounds (Critic session_01FhBbYN9fhELggd71AFucQv; its last line applied as written,
    no re-audit needed by its word): steps under every rise over 60 px, height = rise - 60, run 24/24 Easy and 16/24 Normal.
  - WORKING: the Engine member on A2, Opus high, created 2:23 AM ET, due 6:30 AM ET, branch t-engine-help from t-engine-putback.
- 11-11 3:50 AM ET: the analyst's bot inputs are in (t-w11-analyst@27a9c46d, tools/playtesters/profiles/, 33 players, 4 tiers) with a
  CORRECTION: the tap-then-jump misread is 154 of 700 punches (9 of 10 players), not 481 (its rule counted the jump release `jumpUp` and
  the jab's designed take-backs). The 11-09 report Critic passed the larger number. A fresh Critic is proving which is right from the
  recorder code. If 154 holds: R-165.87 (fix A3) stays, smaller; the lead told Matt the larger number on 11-09, and must correct it,
  and a defect entry follows (a counting rule passed without a check of what each event means).
- 11-11 4:04 AM ET: BOT INPUTS PASS (bot-inputs Critic session_01FhBbYLpqqFAGsZjoLtDdEH, delta re-audit of t-w11-analyst@437a3a13):
  3-decimal shares with the 0..1 assert kept, reversals counted both ways, touchPlacedShare per player with thin players marked,
  README rows for finishMedianS, jumpHoldMsP50, groundPressToLipPxP50; privacy greps 0 and 0. SHEET SAFE TO PURGE: YES. Lost with the
  sheet (REPORT.md's list): exact stroke paths, survey free text, old-stage lives, the name-to-P join, 1,431 unplaced strokes (2.7%,
  none feed a tier). Minor: P8 has 0 strokes but its thinWhy reads "under 0.8". Lead told Matt; he deletes the sheet when he likes.
  Next for R-165.59: the tier bots built from tools/playtesters/profiles/ (a packet, then a Critic).
- 11-11 4:22 AM ET: HF picture list 1 DONE (Content, t-c2-art-cut@576639eb): 18/18 kept in src/assets/w1-1111c, 5 jobs, $2.04 of the
  $6.50 cap (HF-SPEND.md). Strips tile (wrap difference 0.9-2.5); stairs P-08-c and palisade P-11-c still angled (side-on redo ~$0.30
  on list 2). Lead's own look: P-04-c's top edge shows pale leftover shapes on a light background; sent to the Critic
  (session_01FhBbYNLAiTv8NfA3ccsCcL, AUDIT-CONTENT-HF-LIST1.md, created 4:22 AM ET).
- 11-11 4:24 AM ET: A2 attempt 2 in (t-engine-help@324cd3cc): the story keeper's four items fixed (NO card = Pokey mid-leap; one rock
  sprite for YES and grown steps; ladder bubble down at 8 s and at the offer; 08 stills lessons-off). Lead looked at the stills: Pokey on
  the rock, offer fits both ways. Sent to the story keeper (OK or fix) and to the A2 Critic as its new head; suite not re-run by Engine.
- 11-11 4:27 AM ET: A2 STORY: OK from the story keeper on 324cd3cc (all four fixes, both orientations, words match §9). A2 now waits
  only on its Critic (session_01FhBbYLqBBBn59SLSAARu26).
- 11-11 4:43 AM ET: A2 REJECT (Critic session_01FhBbYLqBBBn59SLSAARu26 on 11f55f3e; 324cd3cc does not touch it): grown steps make
  mushroom pieces harder (roadOf drops ground under resting platforms, ignores mushrooms; one step of rise - 60 leaves faces over 60 on
  rises over 120; 1,288 boxes over 120 px in 276 builds). Lead ruling sent as attempt 3: mushrooms count as road; rises over 120 get a
  stair (no floating box, faces <= 60, treads >= 60 wide); tests over 138 seeds x 2; plus App.tsx:1053 back swipe and one touch flight
  for the "Flick up" repeat. Everything else in A2 checked fine (rungs flown with the real loseLife, Dot's lines word for word, suite
  2501/0, main chunk 4,171,195 B: only 23 KB under the 4 MiB limit, the next import breaks it). Defect D39 logged (the lead's ruling).
- 11-11 4:47 AM ET: E1 DONE (t-engine-e1@7a4793b, 3/3, gates read alone); Critic session_01FhBbYMh5nZyXY5SEPjcVMg on AUDIT-ENGINE-E1.md.
- 11-11 4:55 AM ET: HF LIST 1 REJECT (Critic session_01FhBbYNLAiTv8NfA3ccsCcL; it had sat 28 min on an HF Jobs approval, lead stopped
  it: Critics never launch HF jobs): wrapfix.py cross-fades alpha (see-through ghosts at the wrap, worst P-03-b), stump-medium reads as a
  lid. Passed: sizes, wrap RGB, pinkscan, spend $2.04, dist unchanged (185,432,195 B). Stairs not usable, palisade far-background only:
  both to list 2. Attempt 2 sent to Content.
- 11-11 4:57 AM ET: E0a in (t-engine-e0a@3bf6c123, off A1): verdicts 21/21, lock 101/102 unchanged (only 1-1). The verdicts refuse all
  138 seeds of today's 1-1 (teach.double-no-gap-after 138, band.out 130, floor.unmarked 112, block.lesser-passes 66), so the suite is red
  (127) by design until C1 re-lays 1-1 (ADR-001). Lead ruling: E0a never ships alone; test link A = A1+A2 only; DoD 5 judged on the
  E0a+C1 branch. Critic session_01FhBbYJx8aENYrnzwB7AeRN (high) proving each refusal real or wrong before C1 re-lays to them.
- 11-11 4:58 AM ET: main JS chunk: A1 4,164,708 B; A2 +6,487; E0a +14,762 (in the main chunk, pipeline.ts imports it). A2+E0a about 4,185,957 (8 KB spare, estimate). R-165.103 filed: lazy chunks, 200 KB spare, before the A2+E0a+C1 merge. Test link A (A1+A2) is still under the limit.
- PASSED 11-11 5:00 AM ET: HF picture list 1, t-c2-art-cut@7fe092d4 (Critic session_01FhBbYNLAiTv8NfA3ccsCcL, attempt 2): ghosts gone
  (edge alpha at or below mid-strip), wrap 0.9-2.5, pinkscan 0, 16 kept, all ten worlds per piece, $2.04, no token. Waiting for list 2:
  stump-medium (lid top), stairs P-08-c (angled), palisade foreground use; round P-03-b's underside step before any raised-ledge use.
  Not merged: rides with C2 (the art into 1-1) and the release PR.
- 11-11 5:27 AM ET: bots packet written (packets/2026-11-11/CRITIC-BOTS-R-165.59.md: FT_CHILD/MIDDLE/EXPERT from the profiles, calibrated on main's 1-1 against the tiers, then run on A1); packet Critic session_01FhBbYKy9NxX4GEBPAZCSZ1. A2 Engine cost $23.58 at 5:25 AM (context 468k).
- 11-11 5:32 AM ET: bots packet PASSED on delta (6b44c95f); builder (Critic role, high) session_01FhBbYMyps3i5yXsYxByw3w dispatched, branch t-bots-tiers.
- SPENT against the $75, read 11-09 9:33 PM ET (get_session cost_usd): the lead's own turns since 8:36 PM $22.90 ($59.58 lifetime
  less $36.68); Designer $12.77; afternoon Critics $8.50; Engine $8.32; analyst $5.39; delta Critic $3.43; Designer's Critic $2.23;
  analyst's Critic $1.55; the two-minute Opus Engine $0.42. TOTAL $65.51, with the Engine's Critic (session_01FhBbYMPMRnQdGzTReh4x3v,
  Opus, created 9:33 PM ET, due 11:15 PM ET) still running, perhaps $5 more. The $50 and $60 tripwires were both passed between
  check-ins without Matt being told at the time: a miss by the lead, told to him at 9:35 PM ET. The lead's context is about 480k
  tokens; each of its turns costs $0.50 to $1. From here tonight: the lead acts only on the Engine Critic's verdict, then stops.
  No check-in is armed (the Critic's message wakes the lead). Everything else waits for the Wednesday 2:05 AM ET reminder.
- The two afternoon Fable Critics (session_01FhBbYNzmgt3tyXdLKeupZG, session_01FhBbYJiR4o74fu7RgAv6EF) are finished: both REJECT, answered.

## Open graph (started Monday 11-09: Matt, about 2 PM ET, "I have fable only usage. Lets create our team and start this week. Right
## now the team must be fable 5.2"; then "Do not keep under yourself. They should have their own bot": every member is its own session, R-165.74; on Opus since that evening, R-165.76), in order
0. ANALYST on the play window that ends Tuesday 11-10: dispatched as soon as its packet passes (Matt, 11-09 evening, R-165.77: "pull the test
   data and make a plan on starting fixes"; rows to date now, a delta at the close), told which recorder fields to distrust (consultant finding 3 in
   responses.md's numbering; R-165.58). Then the PACKER and the CONSULTANT (max), as CONSULTANT.md says. Then R-165.59: ONLY the pre-0.9.5
   recordings deleted (Matt 11-07: newer data stays until testing ends), after the analyst's aggregates exist.
1. DESIGNER, second out (after the analyst, R-165.84), on its packet's PASS: the reach spec from the 30 fps simulation (reference/consultant/2026-11-07-scripts/sim.py), verified in the engine;
   the gap and rise bands per setting; help thresholds per setting (R-165.60).
2. ARCHITECT, after the Designer's Critic PASS: the verdict schema (setting-aware arcs, headroom, floors, lethal vs soft visibility)
   (R-165.61); the file list for every later packet; the frame-budget sheet and the frame-time gate's spec as an Engine packet
   (R-165.65: 8 ms, the previous lead's number from Matt's 11-06 "build for 60", GPU-RENDERER-PLAN.md:52-59; Matt sees the §1 line before it changes; PERFORMANCE-RULES §1 still reads 12 ms and no gate measures
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
- DECIDED by Matt 11-09 ("A"): the "key line process" page is a Kanban board (R-165.75; tools/board/, reference/methods/board.md). Two web searches
  had found no method or person by the name he gave, so he was asked and picked.
- LOGGED 11-09 evening, Matt's seven ideas, each numbered the same turn: R-165.78 (tall stages down and up, mountains), R-165.79
  (hanging-only stages, on R-160.1), R-165.80 (diving, special stages), R-165.81 (the mega punch earns its place or goes), R-165.82
  (power jumps), R-165.83 (streak power-up). All wait behind the 1-1 work; .81 and .82 are one Designer ruling.
- R-165.52: DECIDED by the lead 11-07: the first-ever run of 1-1 is one fixed, hand-checked layout; replays roll. Built in R-165.72.
- R-165.53: DECIDED by the lead 11-07, re-judged per setting 11-09: no lethal drops in 1-1 on Easy or Normal, because 1-1 is where the
  controls are learned (not because of the player's age). Normal's bite comes from its reach bands and from 1-2 on. A deadly drop
  gets its own look and is taught where it first appears.
- R-165.62: re-judged per setting 11-09: on Easy the help steps in by itself; on Normal it is offered, the player may ignore it, and
  the stage never changes by itself.
- R-165.65: the lead's 11-07 ruling ("8 ms is a design target, not a gate") is WITHDRAWN (D35): it overturned Matt's 11-06 "build for
  60" ruling (GPU-RENDERER-PLAN.md:52-59). Open work now: the Architect's budget sheet, an Engine gate that measures frame time,
  §1 and limits.json changed to 8 ms with a planted test. Until it lands every member designs to 8 ms.
- R-165.54: DECIDED by Matt 11-07 (received by 10:21 PM ET): platform-looking pieces may float; skinny ones attach; rocks and decor never
  float (STAGE-RULES.md 'What may float').
- R-165.55: the story keeper's open story threads (reference/story/STORY-KEEPER.md).
- R-165.56: done (PR #67 and #68, merged 11-07).
Matt's question queue: EMPTY of his own items. R-165.69 DECIDED 11-11 (A: clean files now, rewrite history once before launch). The story
keeper's two left (11-07): #10 skulls (all out, or only remains in soil?), #2 the two food lines (keep each, yes/no). #1 Meeca's parents
was handed to the story keeper by Matt on 11-11 (it decides).
Story keeper's answers, 11-07 evening (STORY-KEEPER.md updated in commit 948f8931 on ccr-0d59a91c-oy3imz; read only, never build from it):
- #8 decided: `lesson.bounce` teaches the bounce, no hint.1-1.bounce row. Content's 1-1 packet done-item: the card fires at gen2 1-1's
  FIRST mushroom.
- R-165.57 SETTLED 11-11: the condition below came out "hold" (touch.md: a tapped pad jump is a 61.7 px hop); nice line = "In the air,
  hold Jump again for a double jump." (story keeper, STORY-KEEPER §9). Earlier: R-165.57 words (lead approves, conditional): pad jump "Press Jump" / "Tap the Jump button to leap."; pad nice "Nice jump!" / "In the
  air, tap Jump again for a double jump."; run unchanged. Condition, in the Engine/Critic packet: a pad player TAPPING twice clears the
  double-teach gap (195-205 px) in the real engine; if not, the nice line says "press and hold Jump again".
- #3: the story keeper fixes the Cast Bible (Dot is she, Grandpa's timeline) to match the approved VOICE.md: lead OK'd.
- #4 the prologue ships; #5 (1-5 text) waits with R-165.45; #7 waits for 1-2; #6 one HF list through the lead after the 1-1 art audit;
  #9 a low-priority UI ticket.
Not Matt's: the pad's two coach lines (R-165.57) are the lead's call with the story keeper (LEAD-PLAYBOOK: the lead approves in-play
lines); Matt sees them in the release.

## Defect log: reference/CONTINUOUS-IMPROVEMENT.md. Method index: reference/methods/README.md. Team: reference/TEAM.md.

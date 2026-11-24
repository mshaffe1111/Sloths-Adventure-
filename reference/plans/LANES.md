# LANES: the two lanes, every job's budget, and the burn (the lead's board; D127, Matt 11-23 11:21 AM ET)

Matt, 11-23: "What have you designed to get us to this 2-hour? Instead of just allowing the workers to dictate the time." This board is
that design. The lead keeps it at every check-in; a check-in that does not update it is a red check-in (LEADER-STANDARD-WORK).

## The rules (the persona's own, reference/roles/LEAD-PERSONA.md: 'Run a pipeline', 'Ready to build, or it doesn't start', 'Strict timelines')
0. **Three levels always in flight:** engine pieces and bot skills for level N+2, design, art and Dot's lines for N+1, the build of N. A builder
   who must build engine mid-level is the lead's plan failing. Every job's report-by is an EASTERN CLOCK TIME in this board and in lead.md's
   members table; at that time it reports or the lead stops it, and a missed time gets a cause and the lead's call the same check-in
   (help, cut, replace); Matt hears the moment a slip moves a level's ETA.
1. **Two lanes, always both staffed.** LANE 1 builds levels and releases. LANE 2 builds the pieces the NEXT levels need (engine pieces,
   bot skills, meter channels, art), at least two stages ahead and into the next world (Matt 11-19: "at least 2 stages ahead"). A
   Lane 2 member is never pulled into a Lane 1 level. With two helpers: one per lane. A check-in with no one on Lane 2 is red.
2. **A level job starts only when it is READY:** every piece its design names is GREEN (built, its toy RED->GREEN, landed), its art is
   in the inventory at Pokey's scale, Dot's lines are approved. A piece found missing during a level job is NOT built inside it: it
   becomes a Lane 2 job, and the level waits or is cut to what exists.
   **READY is MEASURED on the draft, not declared (2-7's lesson, 11-23: 9 pieces were found missing inside the build: the race-end
   line, the finish's banks, the route bar, 'post:letter', the child's re-aim, the x-order trap at 4 sites, the weir/porch dress, 2-7's
   own draw breaches, the portrait bottom and the deep river's wall).** Before the build job starts, the READY job runs on the DRAFT
   stage and sends: (a) castBots x40 --proven, every bot, both settings (D125); (b) drawcheck on the draft at its own spots (D131);
   (c) a stills pass at phone size, upright AND sideways, Normal AND Easy, every leg, judged by the lead zoomed (law 2); (d) the
   verdicts (judged/errs) with the stage's own lines wired; (e) for a stacked or out-and-back stage, every first/last rule checked in
   met order (D130). Each finding is a Lane 2 piece job; the build starts when all five are clean or each open item is named and
   ruled by the lead.
3. **Every job has a BUDGET before it starts, and a HARD STOP.** A level job: 2 hours (the target), hard stop at 4. A piece: S 1 h,
   M 2 h, L 2-4 h (sized from measured history), hard stop at 2x. Hours = member time from its first `date` to its report.
3b. **A job's budget spans SESSIONS; each session still hands over at 320k REAL context or 28 minutes (D111, D129).** The lead reads every
   running member's REAL context (get_session context_usage, never the member's estimate) at every check-in and stops any session past
   300k at its next result; a successor session continues the same job inside the same budget. **No exception, not even 'it only has to
   land' (D129 repeated by the lead 11-23 2:13 PM: ENG-BOT27 let run from 460k to 494k to land; the landing failed and the extra half hour
   cost about $8): past 300k it writes its EXACT NEXT STEP and ends.** The 28-minute box is the member's own stand-in for the context line (D111: members
   cannot read their real figure); when the LEAD reads the real figure under 250k, the lead may let a session finish its running gate
   and its landing past the box, said in a message and a STATE line (11-23 5:16 PM: DRESS-27d at 216k, only clipcheck left).
4. **At the hard stop the LEAD decides, never the member and never "another box by default":** cut the scope, split the rest into a new
   budgeted job, or move it. The decision is written here and in STATE.
5. **The ship verdict comes first** (D125): a level aimed at a release measures its castBots --proven yield in its first box.
6. **Fast loop inside, full gates at the landing:** while a member iterates, it checks the changed stage alone (castBots x10, the
   stage's own tests); the full rule 28 (x40 on every stage it can touch), the suite and the CI tool line run once, on the candidate it
   asks to land.

## THIS WEEK (Matt 11-23: World 2 done and World 3 ready to build; plans in hours)
| Day | Lands on Matt's link | Pieces ahead, side by side |
|---|---|---|
| Mon 11-23 | 2-7 tonight: DONE 6:21 PM (v269; the build job 5.8 h vs 2 h: 9 pieces found inside the build, LANES rule 2 raised) | release 4's base; World 3's kit + 3-1 travelling down |
| Tue 11-24 (STARTS ON MATT'S GO-AHEAD, R-165.419) | 2-6 (its Easy residue in a 4 h budget, then its one in-place fill) | 2-8's flood clock (M) + followers meet the flood (S-M); World 3: 'prowlers never look up' (S), the dark + glow brick (M) |
| Wed 11-25 (usage reset) | 2-8 (the 2-hour build on ready pieces); release 4 (2-6, 2-7, 2-8) to Matt's push | 2-9's new pieces; World 3's art batch 1 (HF); World 3 designs 3-3..3-9 from the picks |
| Thu 11-26 | 2-9 (the 2-hour build) | World 3's remaining pieces (thorn vine, meter channels, roof root) |
| Fri 11-27 | release 5 (2-9) to Matt's push: WORLD 2 DONE | World 3 READY: every 3-x design final, its pieces GREEN, its art in the inventory |
Each line is checked at the end of its day on the scoreboard; a miss gets its cause and the recovery the same evening, told to Matt.

## The board (11-23)
| Lane | Job | Budget | Started | Burn | Status / the lead's decision at the stop |
|---|---|---|---|---|---|
| 1 | ENG-26s: release 4's base (main into t-build-26, R-165.399's reds at their causes, the floorAt fix lands) | 1 h (hard stop 2 h) | 11:12 AM | 0.4 h, $9.20, 275k | HANDED OVER 11:36 (wip-26s ca3a7d063 + REPORT eb790358b): rowWheels, registrycheck, libstage fixed at cause; riverRide x2 (plants' premise removed by BUILD-26j's step-up rule) and wheelRide (the lip family on a moving bucket) open; LEAD: the rest moves to TUESDAY MORNING as ENG-26t (2 h), today's slot goes to 2-7 (KEEPER-27) |
| 1 | 2-7's race (ENG-27 a..v: 23 sessions, never budgeted) | ENDED 11:26 AM with ENG-27v's table | 11-20 | 23 sessions | RACE CALL (11:26 AM): E+J d2bd53f61 is the bot (the honest gate); the race is fixed by design numbers, not more bot work |
| 1 | **2-7 TONIGHT (Matt 11:32 AM: 3 helpers, R-165.406)**: ENG-27w race numbers (session_01FhBbYKKHYx1CQbqy2jPsoY) || READY-27 art wired + open door + post (session_01FhBbYMc2w7pMCVsxNvjNXs) || KEEPER-27 lines DONE 12:17 PM, approved (t-keeper-27 0614ae0a; $2.03) -> BUILD-27 the 2-hour level job about 3:30-5:30 PM -> EnK5 tonight | race 1.5 h, ready 1.5 h, lines 0.5 h, build 2 h | 11:35 AM | 2:46 PM: race, ready, lines, jetty DONE; build BUILD-27 -> 27e (4 sessions so far) | 4:00 PM BURN: the level job 3.4 h of its 2 h (hard stop 4:35 PM, extended by the lead to 5:30 PM for the final gates: the cause was 3 pieces found missing mid-level, the D130 trap at 4 sites, and 2-7's own draw breaches found at 3:40); LANDED on t-eng-27 cfa555cc9: child-only R1 (29/40), the route order at 4 sites, the dress; 2-7 LISTED 69/100; DRESS-27b on the 6 draw breaches (by 4:30); BUILD-27f stills + clip now, gates on the final head; EnK5 about 5:30 PM |
| 1 | (ENG-27w's scope) 2-7 race numbers: E's 'smallest' ruled = the SHORTEST aimed flight by airtime to a safe landing with RACE_MARGIN (ties: the smaller hold), not kind-then-hold (a held 0.70 s glide is slow; a racer takes the quickest safe hop); re-table the expert on it; land E+J (suite, CI tool line, pacerLay, pacerRespawn), then the grid gap 72/64/56 x pace 100/90/80% on E+J; the lead picks the smallest change where the expert wins 5/5, the middle 6/7+ on Normal and every Easy race, ride-only loses 7/7, every win 2 s or more; post N4's -51.1 s traced | 1.5 h (hard stop 3 h) | after ENG-26s (lane 1) | | queued |
| 1 | 2-6's Easy residue (R-165.398: cause B, the lip family, child E 50, adult N 4, the floor), then its list | 4 h in all, from ENG-26s's landing | | | if 2-6 is not at 60 of 100 by then, the lead cuts (re-lay or simplify the spots that fail), no open-ended bot work |
| 2 | ENG-W3a: World 3's kit on gen2 + a 3-1 row travelling down (WORLD-3-PLAN F1) | 2 h (hard stop 4 h) | 11:26 AM | | running; REPORT BY 1:45 PM ET, then PAUSES (its slot to KEEPER-27, then BUILD-27) |
| 2 | PLAN-2H: ENGINE-NEEDS refreshed against today's code, every piece + bot skill, per stage to World 10, the weekly schedule (TWO-HOUR-PLAN.md) | 1.5 h (hard stop 3 h) | 11:45 AM (KEEPER-27's slot) | 0.4 h | DONE 12:08 PM (t-plan-2h f945e2986): 75 pieces with bot skills and meter channels, every stage 2-8 to 10-9 + 10 hidden, 6 waves; builds one world a week W3 11-30 .. W10 1-18 (all levels by Fri 1-22); ~180 h of pieces; R5: two piece members through Waves 1-2 or W3/W4 slip a week (Matt's call) |
| 2 | PAUSED 11-23 1:22 PM (Matt's 3 helpers on 2-7 today) at t-eng-w3-wip-b 007bd2ca8, about 0.7 h of 2 used: STEP 0 CI line on c1008d8ed 227/0; head room built + planted; 3 down-skill toys GREEN (each RED with its skill off); owed: lockall, castBots 3-1 x40, toys for downEnd / drop-not-jump / own-route, item 3; RESUMES Wed 11-25 from its REPORT's EXACT NEXT STEP. ENG-DOWNBOT: the bots on a way down (down-bot skill: drop ledge by ledge, step off, take a turn vine down) + the squeezed-catch lay fix (a band catch about 60 px over/under the next storey); serves 3-1, 4-7, 6-7, 8-6; split from ENG-W3a 11-23 1:00 PM (expert 17-21 rescues -> 1-3 so far) | 2 h (M; hard stop 4 h) | next lane 2 slot | | queued |
| 2 | ~~ENG-PROWL~~: 'prowlers never look up' ALREADY LANDED 11-20 (core.ts:265, PLAN-2H); 'lit = seen' moves into ENG-DARK | - | - | - | removed |
| 2 | ENG-DARK: dark + light ring as one shared brick, the glowworm wake below (F2) | 2 h (M) | after ENG-W3a | | queued |
| 2 | W3-ART-1: World 3's standing and climbing art on Hugging Face (F4, about $4-8) | 2 h (M) | any free slot | | queued |
| 2 | ENG-ROUTEORDER (R-165.414, S 1 h): every remaining x-order first/last pick in engine rule code onto ENG-HUD27b's route-order helper + a gate that flags a new one (planted); with it, XS: the pacer's verdict checks the race began (BUILD-27c 11-23: a teleport onto the dock gave a WIN with the pacer clock at 0; unreachable in play) | 1 h (S; hard stop 2 h) | Tue/Wed slot | | queued |
| 2 | ENG-VINE (F5), METER-W3 (F6); 2-8's flood clock + followers meet the flood (after 2-7's left leg); 2-9's new pieces (sized from 2-9.md) | sized when queued | | | queued |

## Measured so far (why this board exists)
2-3 about 10 member sessions; 2-6 35 sessions and not shipped; 2-7's race 22 engine sessions and not settled. WORLD-3-PLAN (11-19) named
four World 3 jobs that "can start Friday with no design waiting"; none was started, because every slot went to 2-6, 2-7 and the releases.

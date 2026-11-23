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
3. **Every job has a BUDGET before it starts, and a HARD STOP.** A level job: 2 hours (the target), hard stop at 4. A piece: S 1 h,
   M 2 h, L 2-4 h (sized from measured history), hard stop at 2x. Hours = member time from its first `date` to its report.
4. **At the hard stop the LEAD decides, never the member and never "another box by default":** cut the scope, split the rest into a new
   budgeted job, or move it. The decision is written here and in STATE.
5. **The ship verdict comes first** (D125): a level aimed at a release measures its castBots --proven yield in its first box.
6. **Fast loop inside, full gates at the landing:** while a member iterates, it checks the changed stage alone (castBots x10, the
   stage's own tests); the full rule 28 (x40 on every stage it can touch), the suite and the CI tool line run once, on the candidate it
   asks to land.

## The board (11-23)
| Lane | Job | Budget | Started | Burn | Status / the lead's decision at the stop |
|---|---|---|---|---|---|
| 1 | ENG-26s: release 4's base (main into t-build-26, R-165.399's reds at their causes, the floorAt fix lands) | 1 h (hard stop 2 h) | 11:12 AM | | running; REPORT BY 12:15 PM ET |
| 1 | 2-7's race (ENG-27 a..v: 23 sessions, never budgeted) | ENDED 11:26 AM with ENG-27v's table | 11-20 | 23 sessions | RACE CALL (11:26 AM): E+J d2bd53f61 is the bot (the honest gate); the race is fixed by design numbers, not more bot work |
| 1 | 2-7 race numbers: land E+J (suite, CI tool line, pacerLay, pacerRespawn), then the grid gap 72/64/56 x pace 100/90/80% on E+J; the lead picks the smallest change where the expert wins 5/5, the middle 6/7+ on Normal and every Easy race, ride-only loses 7/7, every win 2 s or more; post N4's -51.1 s traced | 1.5 h (hard stop 3 h) | after ENG-26s (lane 1) | | queued |
| 1 | 2-6's Easy residue (R-165.398: cause B, the lip family, child E 50, adult N 4, the floor), then its list | 4 h in all, from ENG-26s's landing | | | if 2-6 is not at 60 of 100 by then, the lead cuts (re-lay or simplify the spots that fail), no open-ended bot work |
| 2 | ENG-W3a: World 3's kit on gen2 + a 3-1 row travelling down (WORLD-3-PLAN F1) | 2 h (hard stop 4 h) | 11:26 AM | | running; REPORT BY 1:45 PM ET |
| 2 | ENG-PROWL: 'prowlers never look up' + 'lit = seen' (F3) | 1 h (S) | after ENG-W3a | | queued |
| 2 | ENG-DARK: dark + light ring as one shared brick, the glowworm wake below (F2) | 2 h (M) | after ENG-W3a | | queued |
| 2 | W3-ART-1: World 3's standing and climbing art on Hugging Face (F4, about $4-8) | 2 h (M) | any free slot | | queued |
| 2 | ENG-VINE (F5), METER-W3 (F6); 2-8's flood clock + followers meet the flood (after 2-7's left leg); 2-9's new pieces (sized from 2-9.md) | sized when queued | | | queued |

## Measured so far (why this board exists)
2-3 about 10 member sessions; 2-6 35 sessions and not shipped; 2-7's race 22 engine sessions and not settled. WORLD-3-PLAN (11-19) named
four World 3 jobs that "can start Friday with no design waiting"; none was started, because every slot went to 2-6, 2-7 and the releases.

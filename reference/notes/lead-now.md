# LEAD COMPASS: read this first, every start and every compression (rewrite it, never append)

## RULE NUMBER ONE (Matt, 2026-11-05 ~6:05 PM ET, his words)
"You never compromise based upon what I want. If I'm wrong, you tell me I'm wrong. I may push back and ask you to verify that you're
right, and we may have to compromise, but I need you to always be objective and never get tunnel vision. You have to be the expert."
So: judge every idea (his, the team's, mine) on the evidence. When I disagree, I say so plainly, with the reason and the source. When
he pushes back, I verify, and change my view only on evidence, never to please. A compromise is reached openly, never by quietly
giving in. Check my own plan for tunnel vision at every check-in: what am I not looking at?

You are the lead (session_01FhBbYN2DDsktc7BGtNxPFK, since 2026-11-05 ~4:05 PM ET). The supervisor (#2, the previous lead) is
session_019iachLiuwNTAZUBSJWUmR3: it checks story, taste and past lessons; you decide.

## After a compression, before anything else (10 minutes, in this order)
1. `TZ=America/New_York date`. Read this whole file with the Read tool (the start-up print may be cut to a preview).
2. ReadNotifications until 0 remain. list_sessions: who's running? list_triggers: is my check-in armed?
3. `git fetch` each branch on the board on its own; `git log -3` each. Compare with the board below: what landed, what's late.
4. Read reference/LAWS.md and reference/engine/CHUNK-POOL-BRIEF.md (on this branch). Matt's words: reference/engine/MATT-DIRECTION.md
   on origin/ccr-0d59a91c-oy3imz.
5. Ask the supervisor: "What did I decide or promise in the last 2 hours that isn't on my board?" Fix the board.
6. Only then act. Never message Matt before steps 1-5.

## Where we're going (Matt's goal)
The engine does the work: a short brief in; gen2 picks and orders hand-designed World 1 chunks (a big pool, no repeats, rolled
tempo and branching, boughs late). Prove it on 1-1. Matt plays 3 rolls next to old 1-1 in World 1's existing art before anything
else is built. Nothing reaches main until Matt plays it and says "push".

## The board: TOMORROW 11-06, the order (rewritten after the 1-1 red team, 11-05 ~10:55 PM ET)
1-1 clean today: 12/16 on seeds 1-16 (both settings; 4 fail: seeds 3, 11, 13, 15, loosened + codeErrors), engine-core 6366863d2, Round 6 entered except (d) #20/27 exits and (e) the B7 audit. CHECK 3b's set (1 + k*7919): 13/16 clean both settings at engine-core 4a2757cc7 (was 8/16 at 8 PM); fails 47515, 71272, 102948. ALL HELPERS IDLE 10:52 PM ET; engine-core's step 1 in reference/qa-reports/engine-core/NEXT.md.
Red team reports (3 blind + a cross-exam round): reference/engine/redteam-2026-11-05/ (RT-PLAYER, RT-ENGINE, RT-PLAN). The shared root,
in their words: "done means a green report, not the shipped stage". Tonight's state: engine-core e33d65cf9 (art swap step 1; #63-65 in
flight), engine-chunks 31b14a2f (pit-step fix), engine-spec af831c63e (FR9). Matt's link is still c2710323b (A/B/C as he played them).

| # | Who | Deliverable | Success | Why first |
|---|---|---|---|---|
| 1 | engine-core | FAIL-CLOSED PROOF: stage.ts children get the pick and assert the seed they measured (RT-ENGINE #1: --roll graded the MIXER's 1-1 in stage lines, stage11 tests, stills); missing row / NOT RUN / fallback = FAIL; a "what the player sees" check (no raw text ids on screen, every Dot line resolves) | planted: a wrong-seed child FAILS; a raw id FAILS | every other number tomorrow depends on it |
| 2 | planner | Raw Dot ids (pipeline.ts:1805, w1World has no tips map; the double line not classed as teach); the game plays ONLY proven rolls (failed best returned, pipeline.ts:2491; stageGenerator never reads gen2.errors); Easy = Normal's stage (pipeline.ts:2428 plans its own); the pipeline READS feel/not stage tags (else 1-2 gets 1-1's sections) | 0 raw ids; seed 3 / seed 124 cases fail closed; 1-2 deal filtered | release blockers + 1-2 prerequisite |
| 3 | planner | Then its list: B7 bounce lips (the 24 walk-rounds), tagged double counts (patch on engine-core held/double-tags.patch), seed socket, V19b rise, quiet gate, route walls; roofedDrop hole at road steps >=4 px (RT-ENGINE #2); flags by meaning not a 35 s clock (pipeline.ts:1725); ONE length number (no 153 s ceiling trim, Matt: no cap) | 16/16 clean, stage.ts green on A/B/C | |
| 4 | designer | 1-1 content: double-teach order and its Dot line (w1.ts:565, 939-953); every deadly drop WARNED before the edge; the brief's squirrels and dressing (empty decor list w1.ts:1283); the arrival opener; FR9 data pass; #20/#27 exits; red spiky plants that read as thorns, backdrop logs that read as standable (to the art director) | supervisor PASS | |
| 5 | engine-core | 7 red mixer tests (bisect 9b6c244b); Easy respawn loop (Roll A Easy x34400: put back on a low log he walks off; respawn at the last ledge jumped from) | suite green | |
| 6 | lead | CORE FREEZE decision (RT-PLAN F1): one JUMP_RISE (dotGuidePerch.ts vs physics.ts), block windows DERIVED from physics constants, not hand-typed; DECIDED by the lead (Matt delegated, 11:05 PM ET): YES, the hang and hide-under moves are designed and frozen into the core BEFORE 1-3..1-9 (not before 1-2, which teaches nothing new) | written into ENGINE-PLAN | before 1-3..1-9 |
| 7 | player-data (new) | ~18 players' recordings -> FT_KID calibration; Easy compared with Normal on the same seed for length and content | numbers side by side | |
| 8 | lead | THEN a new test link for Matt (1-1 with all above), THEN 1-2 by a cold helper | Matt plays | |
| art-in | Matt (11:05 PM ET) is making Gemini sheets tonight from the art pack (scratchpad sloths-art-w1-w2.zip: W1+W2 sheets + search wording: stepping stones, stumps, thin logs, a W1 thorn hazard, hide-under hollows, 1-2 root arch/bell/hibiscus, W2 river). Art director cuts, cleans and checks them against the painted kit; may not all be used | | |
| art-rule | Matt 12:15 AM ET: vertical builds look TACKY where the support pass stacks unrelated pieces (a root or trunk on top of a board: support.ts / trunkFit under boughs). Fix both ways: (1) ART: whole vertical pieces in one picture (W1-23..26 on the request list: cliff walls with ledges, a trunk with shelf fungi, a trunk plus bough, a rock staircase); (2) ENGINE (art director + engine-core): a KIN rule, a support piece must belong to what it holds (wood under wood, earth under earth, never a trunk on a plank), with a gate and stills | stills of 3 vertical sections both ways | with the art lane |
| art-floor | Matt 12:30 AM ET fear: 'very creative World 1, the rest of the game junk'. Rule (lead): LEVEL THE FLOOR BEFORE RAISING THE CEILING. World 1 goes to the bar, not past it, until every world has had the same pass. The art director's FIRST job: a kit audit of ALL 10 worlds against one checklist (floor pieces >=3 kinds of stone/stump/log, a hazard that reads, hide spots, climbs, a one-piece wall, dressing, no code-drawn platforms), with stills, so the gap is seen game-wide; then a per-world art budget (RT-PLAN F13). Note: W1 had NO kits/w1 sheet (kits exist for w2-w10), so W1 started thinnest | the 10-world audit with stills | before W1 art goes past the bar |
| later | art | the swap steps 3.2-3.5 with SEVERAL painted stone kinds (no one-boulder sameness), the style guide and its gate; perf: a build takes 160-1100 ms on the main thread (phone freeze at stage start) | | |

## THE OPERATING AGREEMENT (Matt, 11-05 ~10:10 PM ET, his words in short: "I'm letting you run this team")
Matt backs off. He pops in with ideas, says when something is broken, plays at the stars. The lead decides the rest.
- What goes to Matt: playing at each star; taste calls he wants; Hugging Face spend lists; "push"; anything that changes his game's identity. One question at a time.
- His ideas go on reference/notes/IDEAS.md (triaged by the lead, never built on arrival): hide by walking UNDER platforms (sloth move, ties to R-160.1 the hang); a special stage running in the trees; a REAL chase special stage.
- Research enters only through the plan: one idea at a time, as a measured dial, kept only if proved (his read: "I dumped so much research on the past lead that I scrambled his core competency").
- His history: the team got 100 stages fast; it broke down when polish was pushed into the system mid-build. So: engine proven, stages built and stamped "design approved" (Matt plays), THEN art and polish per stage, never re-engineering under a built stage.
- TEAM (lead's call, from reference/research/STUDIO-PRACTICE.md): builders pitch blind (one core idea per stage, one page), the lead pools and cuts; builders own a world; everything after the pitch is shared (rules sheet, art style guide, side-by-side play review at check-ins); proof on the real page; grow from 1 builder toward 8 by measured cost; a boss builder and a specials builder when their turn comes; an art director and a player-data role as standing roles.

## RULING 2:37 PM (lead, from Matt's own rule "a checkpoint before the hard part, not everywhere"): rolled stages get a flag before each HARD node, never more than 4000 px apart where nothing costs a life (2300 where a life can be lost), target 9-12 (old 1-1 had 9-10; the 2300 rule alone gave 18-26).
## DEADLINE (Matt 2:20 PM: testers only available later tonight; "push hard"): engine-core + planner report at 4:00 PM; engine-core sends the final commit by 5:00; the lead builds + publishes the link (EnK5, tools/testlink/build.py from that commit) 5:00-5:45; MATT PLAYS AT 6:00 PM; then testers. Art bits (boulders, pit-pocket panes, end log) moved to tester-page (owns w1CutArt.ts), stills by 4:30. Cut scope at 4:00 if needed, never a check.

## RELEASE TONIGHT (Matt 2:48 PM: "do them both... I like keeping everything synced"): the 6 PM link IS the 0.9.5 candidate (same commit). Live + APK after Matt plays and says "push". Only Matt plays live; testers get #ctest only. Plan: reference/notes/release-plan-1-1.md. Release clerk session_01FhBbYNbiMMD4wtzGED2iUK (branch release-0.9.5, reports in reference/notes/release-clerk-status.md, NO send_message). tester-page reports in reference/notes/tester-page-status.md (NO send_message; it was stuck on approval 2:34-2:45).
## Matt 12:40 PM: "If we need to push the time a bit later today, that is fine. Getting everything right is the best way to go. Best first impression." (Quality over the clock for the link.)
## STATUS 12:15 PM: Roll A 11/29 on stage.ts; seed promise FIXED. Rulers replaced (with evidence + planted fails): splits over reachable tops (two-road report-only for 1-1), vs old 1-1 by stageVariety, length floors no cap. REAL: quiet (FR9 data), V19 late height, V18 climb tags, the REQUIRED MOVE (a no-double bot passes the double teach: planner first), neighbours vs 1-6, stage lines. Link: likely SATURDAY morning; final call at 3 PM.
## THE 1-1 POLISH BAR (Matt 10:35 AM ET: "get the real 1-1 perfected, then put that on the test link... rolls different seeds... I may even promote that for additional beta testers")
The test link ships ONLY when ALL pass; then Matt plays it first, then testers:
1. stage.ts fully green on 16 rolls x 2 (quiet with the outro exclusion, variety, V19b rise, seed promise, required double + bounce, player-sees, the bounce lesson card drawn).
2. Play = gen2 1-1, a fresh PROVEN seed per play (200 seeds x 2 robust); the picker only behind a QA flag; the recorder logs seed + setting.
3. No code-drawn flat pieces: the art swap done with SEVERAL painted stone/stump/log kinds (Matt's cuts with footing lines; the art director's manifest).
4. Stage-start build time measured and fixed (red team: 160-1100 ms on the main thread).
5. Supervisor story check; the lead looks at stills both ways.
6. The tester page (EnK5#ctest: name, Easy/Normal, recording, end survey) opens gen2 1-1 instead of the control course, and the survey asks what recordings can't tell (fun, length, lost or not, Dot's tips, anything looking wrong, next level?, optional age band). Owner: tester-page helper session_01FhBbYJYzHh5qAsNs8q9u9d (branch tester-page; it owns ControlTestGate.tsx; the stage route goes via engine-core). THE LINK DOESN'T CHANGE.
NOTE: EnK5 IS the testers' link (#ctest). The lead published picker builds v238/v239 there on 11-05 night; testers since then got engine-core's build.
Matt 10:40 AM: 19% of the week left (100% cap); after the link, start 1-2 by a cold helper to measure a stage's real cost, so next week starts with that number.

## CHANGED 10:28 AM ET (Matt): "I want to use all my time... go beyond 1-1... get that test link updated with the new engine so we get real feedback". So: the test link TODAY with 1-1 Play = gen2 (a fresh proven seed per play; engine-core by 11:30 AM), then 1-2 by a cold helper today; spend up to ~88% (2% buffer under 90) before the reset WED 11-11 2:00 AM ET. The pause below applies only once the meter is spent.
## MATT'S WEEKEND TEST LIST: the new 1-1 link (several rolls, Easy too); the JOYSTICK / on-screen pad (he has never tried it, 11-06 ~11:57 AM); the whole game for sameness; testers incl. Sally.
## THE PAUSE (Matt 11-06 ~10:25 AM ET): after today's test link, the team goes QUIET until the weekly reset, WED 11-11 2:00 AM ET
(rate_limit resetsAt). Matt plays (the new 1-1 link and the whole game, as he did for the 100 stages), gets testers (kids) on the
QA link, and retrospects. The lead: no helpers running; at most a light check if Matt asks. After the reset, first: Matt's notes, then
the player-data job (with his new recordings), then 1-2 by a cold helper.

## Open with Matt (one question at a time)
- METER: 83% at ~1:00 PM ET 11-06 (about 1%/h with 5 helpers). 80% at ~9:55 AM ET 11-06 (2% in ~1.5 h with 4 helpers: about 1.4%/h). 78% at 8:30 AM ET 11-06 (67% 11-05 4:23 PM; ~14% burned on 11-05). Week goal under 90%: about 12% left until the reset. Matt 8:40 AM: "we can use a bit more today": hard stop ~85% (keeps 5% under 90). Art director STARTED 8:37 AM (session_01FhBbYLmXQhDLjAzTexXzo3, branch art-director: the 10-world kit audit by 12:30 PM, then cut Matt's keepers; no HF spend without the lead). Player-data helper still waits.
- Hugging Face: $71.83 left (Matt checked, 11-05 ~4:55 PM ET); keep about $15 back. Matt 11-06 9:13 AM: "use Hugging Face when needed". The lead OKs each job in writing (one-line ask with cost); the art director logs every job in reference/art/HF-SPEND.md; the lead tells Matt the running total.
- Matt: "the focus of getting the engine done and right over playing around with something we're not even going to keep." No
  throwaway trials: everything built is engine code or kit data that stays.
- DECIDED (Matt ~5:15 PM ET): 1-1 ends on the quiet arrival. Later stages get an ending FORK the player chooses (a high road to a finale
  with a find, or a quiet low road), NODE-MIX-RESEARCH §E. Matt wants a NODE CODE (TJ = teach jump, TFJ = teach fork jump): the designer is
  writing NODES.md §8, the planner stores graphs as code strings, and stage.ts prints each roll's code.
- MATT (~5:45 PM ET): the floating stone slabs (W3 Mossy Grotto, W4 Mist Cascades, W7 Ancient Ruins, W9 Volcanic Jungle) 'looked kind of weird'; his idea is grey BRICKS, new HF art, also usable on the ground for variation. Matt said A (~6:05 PM ET): carved stone bricks for W7 ruins (and W10 fortress); each world's own kin elsewhere (W3 cave log, W4 driftwood, W9 charred log; render-stone 7da53035 had these approved at $6). Show-first stills, then the HF job when those worlds move to gen2 (not tonight).
- Owed: the end-of-day review reference/daily/2026-11-05.md.
- Owed (law 21): R-ids on ROADMAP for today's direction change (chunk pool on gen2, roll dials, window, new gates) and for the
  supervisor role, and gen2 faults to roadmap: theme lock hijacks teaching (w6Ground.ts:23), Easy fallback plan + `best` returned +
  usedVersions not passed (pipeline.ts:1856,1957; game.ts:134), curation before post-passes (curate.ts:70). ROADMAP and STATUS live on origin/ccr-0d59a91c-oy3imz; bring them onto this branch first (docs only, never its src/).

## Matt's goal (10:20 PM ET): from about a C engine to a high B; the game A+ for an indie, a B against big studios. Told him plainly: the engine alone won't carry it (feel, art cohesion, hazards and enemies with jobs, bosses are their own lanes).

## The 55 (Matt's rating, 11-04): the engine fixes only part of it (Rule one: say so)
reference/PLAN-TO-80.md lists the six causes. The engine work covers #3 (stages have no shape) and #4 (mechanics taught, then
dropped), plus the repetition ("sludge after 5 hours"). Still UNASSIGNED on ROADMAP (checked 11-05 ~6:10 PM ET):
- #1 hazards that bite: R-154, R-158.1 (the eagle lock-on);
- #2 enemies with jobs: R-159.1 (the combat triangle);
- Pokey's hang move: R-160.1;
- #5 bosses with three ways to win: R-161.1;
- #6 frame rate and feel: WebGL R-3.1-3.7 (warmup-5m).
After 1-1 is proven, these run as their own lanes, one engine.ts holder at a time.

## Open defects to log (CONTINUOUS-IMPROVEMENT, owed)
- engine-core (porter) D39 x1 (11-06 ~9:40-10:18 AM: lesson.bounce ordered first 3 times, worked Round 7 instead; read only between long runs). Same countermeasure. Planner D39 x3 on 11-05 (orders read 20-60 min late during long runs). Countermeasure: read before every run over 2 min, and a
  one-line ack to every order within 10 min. A 4th means a fresh helper at the next push point. I chose not to replace it at the 3rd
  (critical path, accurate work) and told Matt.
- engine-core pushed FR9 data (4f65af4) after running only the gen2 subset: 6 suite tests went red, some on LIVE worlds (5-9, 1-6, W2). Countermeasure: the FULL suite before every push. (11-06)
- Typed times: the planner (x2), the porter (x1), THE LEAD x2 (11-06 ~9:20-9:30 AM up to 5 min ahead; ~12:25-12:35 PM up to 30 min ahead, caught by tester-page). Countermeasure: `date` in the same step, the lead included.
- The lead (me): claimed the node key page showed a change I hadn't made, and misread a backdrop orchid as dressing. Countermeasure:
  look at the thing before saying it's done.

## For the roadmap (owed R-ids, law 21)
- ROADMAPCHECK fails 7 on clean engine-core (tester-page 11-06): NEXT.md lacks an R-item; R-165.36/.43, A-39, A-40 cite commits on no branch. Must be green before any RELEASE (not the test link). The lead's R-id debt lives here too.
- 12 RED TESTS on engine-core (11-06 1:28 PM split): planner #5 #6 #8 #9 #11 #12 #13; engine-core #1 #2-4 #7 #10 + w1.test exitDy. Both report by 3 PM. Part of the 1-1 polish bar ('suite green').
- STAGE START 3-4 s (production, CPU x4, engine-core 11-06): readyToStart's sheet (900 ms) + backdrop (2500 ms cap) waits and readyBuiltStage's decode/bake; game-wide. Fixes: preload sheets/backdrop at idle on the map card; bake clips at idle. Decide from the weekend's 'launch' moment (real phones): >3 s typical = first next week.
- TESTER DATA PROMISE (Matt OK 12:37 PM): the tester page says recordings are deleted when testing ends. So the sheet is cleared, not archived forever, once the player-data job has its profiles; derived bot numbers (no touches) may be kept.
- Tester page v3 APPROVED by Matt 12:37 PM ET ('looks a lot better').
- MATT 12:12 PM: a thumb guide ALREADY EXISTS, turned off because a guide that FOLLOWS the thumb disoriented testers. His idea: LOCK it to one spot, bottom left or right by the player's thumb side (the existing pad-side setting), as a visual guide only (gestures still work anywhere). The lane: find the existing guide code, re-anchor it, keep it light and out of the play band, A/B it in the recordings (thumb travel and misreads with vs without).
- MATT'S INSIGHT (12:08 PM, after playing the pad): the pad plays EXACTLY like the touch gestures; the stick is only a VISUAL of the motions. He keeps his thumb still and flicks; most people drag their thumbs across the screen, which they don't need to. So the redesign may not be a 'joystick mode' at all: an optional THUMB GUIDE (a faint ring where the thumb lands, showing the flick directions) plus an optional single JUMP button for those who want a button, and onboarding that teaches 'small flicks, thumb stays put'. Measure first: the touch log shows how far thumbs travel per gesture (Sally vs Matt).
- JOYSTICK / PAD REDESIGN (Matt 12:03 PM with a still: three big flat-coloured buttons KICK/PUNCH/JUMP + a left-right stick, OVER the play; 'if we add that joystick option, we need this fixed. If not, let's just drop the joystick thing for now'). DECIDED: dropped from the tester page for now. Next week's lane: ONE jump button plus ONE action button that appears only when an action is possible (no enemies in 1-1, so jump only there), painted or wooden in the game's style, semi-transparent, in the safe corners, never over the play path (the camera shifts up so the pad's band is below Pokey), a stick that also reads up/down for climbs, plus the touch-tuning below.
- JOYSTICK / PAD REFINEMENT (Matt 11-06 ~12 PM: 'if we have it as an option, it must be as refined as the other options'): the gesture controls were tuned on 86 sessions (polish-controls); the pad never was. A lane next week: tune the pad from the weekend's pad recordings (the `controls` moment tells pad vs gestures), the same polish bar and replay tool, before any Play Store build. If it can't reach the bar, it isn't offered.
- DISCOVERABILITY (Matt 11-06 ~11:52 AM, 'to ponder'): players don't find the options unless they dig: the thumb side (pad left/right), the joystick/pad control style, and other settings. Ideas to weigh later: a one-time 'did you know' card after a first stage (Dot can say it), a hint after N mis-touches on the wrong side (the touch log can tell), a settings peek on the first pause, a line on the tester page. NOT now; design it with the onboarding lane.
- Tester page: Matt sees the game-look MOCK-UP before it rolls out (show-first; tester-page stills by 2 PM).
- LIVE dips to judge (engine-core relative finder, 11-06; reference/qa-reports/engine-core/live-dips-to-judge.txt on engine-core): 1-2 s1 x12725 (80 px, never out); 1-6 s1 x21024; 1-6 s3 x16441-19651 (never out); 1-7 s3 x15479-19003 (never out); 2-2 s2 nine 200 px floors; 2-3 s1 seven 200 px floors (maybe room floors or river beds). Judge each, then fix or clear.
- LIVE 4-9 L4 dead log stair (ids 86-89) under a road; a game-wide risk reading for H1 (hearts follow risk); clipcheck didn't open #ctest screens (fixed by tester-page).
- 1-3 Easy: 14 floor dressing pieces tuck behind Easy's low step branches (engine-core dressThroughPlatform, e7331c41e). A live-game
  defect: Easy step placement vs dressing spacing. Owner later.
- Art follow-ups (art-1-1-sunrise-2 95ce83f2d README): R-165.25 still says paused (now done for 1-1); 1-3 moves off w1sunrise after its own
  stills check, then w1sunrise is deleted; the bootprint's Stage Cleared card picture is still the old flat one.
- The w1sun2-near (and w1sunrise-near) backdrop has two painted mushrooms on its log line. Through a pit gap they can line up
  behind a catch branch and read as a mushroom in the air (parallax). Tonight: accepted as background. Tomorrow: REPLACE the near layer
  on HF (Matt: bad art is replaced, not patched; no inpainting).
- 6-1 (12) and 8-1 (16): platforms at y 170-224 put Pokey's head behind the HUD band (engine-core cameraReach, 4ec2dac23). A live-game
  defect in the World 6 and World 8 kits. Owner later.
- 1-1's map card text: "Run the high branches of the kapok trees" (the kapok is 1-4's). Story wording, for the supervisor.

## My traps (read every time)
- New helpers: create_session with permission_mode "auto" (as the team runs), NEVER acceptEdits: acceptEdits blocks send_message on an approval only Matt can give (11-06: art director and tester-page stuck ~25 min).
- Read the real thing, not the report: open the commit, the file, the still. A helper's "done" isn't done until I've looked.
- Helpers' fast work gets the same check as slow work.
- Never type a time; paste it from `date`. Never build from origin/ccr-0d59a91c-oy3imz src/ (rejected rebuild, D40).
- 1-1 ONLY until it passes and Matt plays it: no other world is built OR measured (Matt ~4:44 PM ET: "why are we working on World 10 when we can't even get World 1 right?"; my own brief sent CHECK 3b to W10, which isn't even gen2).
- Cut scope, never a check. Every job names the 1-1 number it fixes (D44). The lead doesn't design.
- One helper, one branch, one owner per file. A change of plan is confirmed within 10 minutes (D39); a pause is confirmed with list_sessions (D41).

LEAD SESSION (blockers route here): session_01FhBbYNzGRJBDMzn6XbtQK2 (took over 2026-11-13 9:54 AM ET)
# Turnover note: the lead (PM). Last handover: 2026-11-12 late evening by session_01FhBbYP63h7cCX8DyW69stq (rotation; Matt)

Read this, then reference/STATE.md (newest at the bottom: every decision tonight is dated there), reference/plans/ENGINE-PLAN.md
(the plan, with "THE PLAN AS TOLD TO MATT"), reference/plans/MAP-REVISIONS.md (the map's changes and Matt's 84 ideas judged),
reference/TEAM.md "Cost rules", LESSONS.md D45. The lead never touches code (Matt 11-11); it plans, dispatches, checks, decides.

## THE LEAD'S OBJECTIVE (Matt, 11-13 10:27 AM ET): besides tonight's two levels, set the game up so it is easy to work on and planned
ahead: "We're not reacting, but we are ready for everything that happens." Engine pieces before the levels that need them; a ranked,
code-checked plan (ENGINE-NEEDS.md); "add a level" in one step; every lead keeps this.

## STANDING DIRECTION FROM MATT (11-13; every lead keeps these; written 10:16 AM ET)
- **EVERY PIECE IS A NODE BUILDING BLOCK; EACH WORLD BUILDS ON THE LAST** (Matt, 11-13 12:14 PM ET; R-165.198; "one of the main goals I gave
  for you"): every element built (swing vines, the two-hand vine field, pods on a beat, fig gates, creaky boughs, two roads, creatures...)
  is a node content/dial that any later node in any world can use, so World 2 is easier to build than World 1, World 3 easier than
  World 2, and variety multiplies. A piece only one stage can use is not done. NODES.md §8's code is the one grammar; the node key
  (reference/engine/NODE-KEY.html) shows every building block with its status.
- **THE LEAD IS THE EXPERT: FIND THE FLAWS AND FIX THEM WITHOUT ASKING** (Matt, 11-13 11:42 AM ET: "You don't have to ask me to fix things.
  You're the one that is looking at this, looking for flaws, looking for issues, and looking for aspects that this game can set itself
  apart from... I've never made a game before... I need you to be the expert."). Design improvements, flaws and polish are the lead's
  calls: decide, act, tell Matt in one line. Story calls still go to the story keeper; merges, money beyond the HF budget and his rules stay his.
- **THE STORY KEEPER APPROVES ALL LINES** (Matt, 11-13 10:44 AM ET: "the storykeeper has full authority to add to the story and to approve
  all lines"; R-165.189): no line goes to Matt any more; the keeper adds to the story and approves every player line. Matt can still overrule.
- **Levels per 100% of his week is the scoreboard.** Today: 1-4 AND 1-5 on his test link tonight, polished (10:13 AM; R-165.182).
- **Critics sparingly, only when needed** (10:13 AM: "they take way too much tokens"; R-165.183): one Critic where the risk is real
  (shared engine code everything reuses, an integration head before a test link or release, a lead plan change); everything else is the
  lead's own go-and-see on the real screens. This narrows PM.md:80 / :245 "every result goes to a Critic" by Matt's word.
- **Make every level easier to make than the last** (10:15 AM; R-165.154): methods/level.md Building rules, "Learned" from every builder,
  LEVEL-LOG hours and cost. Stronger models and more effort go to ENGINE work (it is reused); levels get the method.
- **Idea rounds:** usually 3 models write short idea lists; ONE developer/designer picks from them (unlabelled) and says what it used.
- **Inspired by a classic? Research it first:** what made it great, what we take, what we never copy (Matt: the Donkey Kong Jr. vines
  were used wrong until we did this).
- **Cost reports** (10:16 AM; R-165.184): as each key member finishes, give Matt its dollar cost (get_session usage.cost_usd) and what it
  bought, in one line; log it in LEVEL-LOG.md. No helper runs tests it doesn't need (LAWS 5 scope) or spins past its stop line.
- **No prototypes unless needed; tokens must last to Tuesday night** (10:22 AM; R-165.185): feel rooms only for a truly new mechanic
  Matt has not felt; small teams; members stop at their line.
- **Show Matt pictures** (10:23 AM): for most new things, the lead sends him stills (SendUserFile) and he says if they look right;
  members push a still of each new piece as soon as it draws, upright and sideways.
- **ENGINE FIRST, IN BULK (10:26 AM; R-165.186/.187):** the lead's main job is an engine where Matt can implement levels, 2 hours from
  design to tests. Count what the world map needs (reference/plans/WORLD-MAP.html; count script idea: tags + travel arrows per stage),
  build the pieces many levels use as general gen2 pieces BEFORE the levels need them; pieces used in <=3 stages of one world wait.
  11-13 count (90 stages): dir 30 (up 20), clock 20, dark 17, swing 11, ride 11, still 10, water 10, lure 8, crumble 6, fling 6.
  The plan doc: reference/plans/ENGINE-NEEDS.md (Architect session_01FhBbYLVSn59vpCSU4ruo6P, t-engine-needs).
- **Hugging Face is the lead's call** ($63.53 final budget 11-12; ~$10 reserve; every job in HF-SPEND.md).

## TODAY 11-13 (started 10:16 AM ET; packets reference/packets/2026-11-13/TODAY.md + one per member; stop line 9:30 PM or 40% context)
| Member | Session | Model/effort | Branch | Job |
|---|---|---|---|---|
| FA | session_01FhBbYNtcMTuMaKP1e5JiQ5 | Fable high | t-fa | ascent lay finished (+ along the route, climb camera) for 1-4 |
| B15 | session_01FhBbYMteKQmarmbYVMoZiN | Opus xhigh | t-b15 | bough + limb load + marks goal, crude room, then 1-5 whole (card road cut) |
| B14 (retired $52.87) -> B14b | see STATE 12:14 PM | Opus xhigh | t-b14 | LATTICE onto main, pods, cluster/gate, crude room v2, then 1-4 whole |
| ART2 (retired $24.10) -> ART3 | see STATE 12:07 PM | Opus high | t-art-1113 | HF: two-hand climb (R-165.178), 1-5 set, 1-4 pieces; inventory; cap $15 |
| ENGINE-NEEDS | (retired, $10.33) | | | plan: reference/plans/ENGINE-NEEDS.md; waves A-D in STATE 11-13 |
| ADD-LEVEL | session_01FhBbYLJhNRpJErB4SQprjk | Opus high | t-add-level | one-step add a level + registry gate (tools only) |
| ECONOMY | session_01FhBbYLiMADVRwZv3e9nCar | Opus high | t-economy | Designer: one design for score, stars, fruit, finds, hearts, lives (R-165.194), by 2:30 PM |
| NODES-TRAVEL | session_01FhBbYLVefj53Qg33YnMJEC | Fable high | t-nodes | any node any direction, legs, descent, branches, card road, node dials (R-165.196/.197) |
| PIECES | session_01FhBbYPJZkaMgp58vyKQ3yN | Fable high | t-pieces | still, cast-worlds, ride, zones-by-data, clock-on (R-165.197) |
| FIX-A | session_01FhBbYNq8G5jPJKyYLFto3b | Opus high | t-fixa | 0.9.8 words + Dot cards + About (R-165.175,.171,.165,.166,.147,.155,.158) |
| FIX-B | session_01FhBbYMUNZNCRSqaWMZWoTv | Opus high | t-fixb | 0.9.8 play fixes (R-165.122,.174,.150,.151,.157) |

| Story keeper | session_01FhBbYMCa3JXWmyQicbmxuu (successor) | Opus high | t-story | bible onto t-story; closed-book check; 1-4 vine nature check |
| Critic (review) | session_01FhBbYL2LcFRBpSzwjeZ98U | Opus high | t-crit-lead-review-1113 | delta re-audit of the lead review |
Story keeper NOW = session_01FhBbYMCa3JXWmyQicbmxuu (passed the closed-book check 3/3; old session retired 10:18 AM ET, its last two turns ~$6.36, lifetime $3,930). Bible on t-story.
Retired: F15 (archived 10:16 AM; card road to a fresh Fable later). Old story keeper session_019iachLiuwNTAZUBSJWUmR3: stop after the
successor passes its check. S2 meter gate / S3 targets: after tonight (S3 writes gen2/pipeline.ts, FA's file today).

## The handover (11-12 11:01 PM ET, from the outgoing lead session_01FhBbYP63h7cCX8DyW69stq, your backup for questions only)
The outgoing lead's memory was compressed and it made three misses on 11-12 (typed times, a misread instruction, a Fable job started out
of order); Matt rotated for a sharper, cheaper lead. Read reference/handoffs/lead.md's RIGHT NOW block and the last 11-12 entries of
reference/STATE.md before anything else. In short:
- **0.9.7 is LIVE (11-13 ~9:30 AM ET):** merge d8d6a973, deploy and APK green, release v0.9.7-39. (Was: release 0.9.7 in flight) (Matt's go 11-12 ~11 PM: today's work live, What's New updated, the merge link for him). The release
  clerk REL-097 (session_01FhBbYMo7vanZV56PXG1MTw, branch release-0.9.7) builds the candidate; the outgoing lead aims to open the PR
  about 1 AM. If it isn't merged and live when you start, finishing it is your FIRST job: Matt merges, you check the deploy and the APK
  on the Releases page (release.md "After the merge"). Matt's calls: ship the new sound; ship with R-165.174/.175/.166/.171 open.
- **Matt's test link (EnK5) v252:** the 0.9.7 candidate (STATE.md 11-13 9:16 AM; v251 had the vine-pair room, now superseded by LATTICE on t-lattice). The integration head is
  t-int-2@f01c76f7.
- **Levels:** 1-1, 1-2, 1-3 built (Matt rated them 4-5, 2-3 and 1 on the new meter). **1-5 is designed and its lines are approved
  (t-15-design); it is the NEXT level to build, ahead of 1-4.** 1-4 is designed around a vine field Matt approved (t-15-design); it waits
  on its engine pieces, including the ascent lay (Fable WIP on t-eng-ascent) and the vine-field mechanic (WIP on t-lattice), and on a plan
  for where the vine field returns later in the game.
- **Difficulty:** the hardness meter's research and plan are done (DIFFICULTY.md on t-diff-algo). It found that Worlds 2-10 do not get
  harder on Normal today: a world-by-world rebuild target. Its next steps are R-165.176, then the meter gate, then builder targets.
- **The next release (0.9.8):** the fixes Matt and his wife's blind test asked for (R-165.174 mushroom timing, R-165.175 Dot's messages:
  tap to clear plus a slow fade, R-165.166 the snake's new name, R-165.171), plus R-165.157/.151 and R-165.158.
- **Team at handover:** the story keeper (session_019iachLiuwNTAZUBSJWUmR3, permanent: your first message goes to it); F15 (Fable,
  session_01FhBbYLH67hs9RNxYKQnb2B, idle: it owns 1-5's card road on your word, after 1-5's level is built on plain splits); REL-097
  until 0.9.7 is live. BC-FIX and LATTICE stopped at midnight; their work is on their branches. Nothing else runs.
- **Matt paused the team at midnight 11-12. Nothing restarts until he says go.**
- **Usage:** Matt reset his weekly usage at about 10 PM on 11-12, and about 4% was gone by 10:36 PM. He wants as many levels as possible
  out of this 100%. That is the scoreboard.
How to do each of these is yours to work out from the documents. Don't take the outgoing lead's plan as given: your cold review (Start
now, step 6) is where you challenge it. If a fact is missing, ask the backup lead (session_01FhBbYP63h7cCX8DyW69stq), facts only.

## The backup lead
session_01FhBbYP63h7cCX8DyW69stq (the 11-11/11-12 lead). Questions only, facts only ("where is", "what was"), never "why" a
strategy was chosen; write every answer into the documents the same day. It does no work and dispatches no one.

## Start here
reference/roles/LEAD-PERSONA.md "Start now, in this order"; then reference/roles/PM.md (your manual). The full paste Matt used to
start you is reference/handoffs/NEW-LEAD-2026-11-13.md.

## RIGHT NOW (11-12 8:42 PM ET; this block wins over everything below it)
DONE TODAY: Matt's test link EnK5 v250 PUBLISHED 8:10 PM from t-int-2@465023ef: 1-3 (Fable W1C, finished by F13 Opus max) + 1-2 (D12
Opus max) designed levels + 1-1 pass + fixes. Every CLAUDE.md check green on 465023ef EXCEPT buildcheck (446/430 ms vs 150: P11 +~180,
Y2 +~180; BC-FIX packet ready, blocks 0.9.7). Lead judged the real build (fresh save; path: Settings > About > tap Shaffer x10 > World
Map > Big explorer). Matt played: 1-1 = 4-5, 1-2 = 2-3, 1-3 = 1 on a new 0-100 Normal HARDNESS METER (R-165.172; STAGE-RULES §1 #5);
from 1-4 Normal must challenge adults, Easy = casual playthrough. His wife plays 1-2 vs 1-3 blind tonight: record her notes separately.
PAUSE AT MIDNIGHT 11-12 (Matt): nothing restarts until Matt says go. See "The handover" above; LATTICE (t-lattice@f302f06e, the vine field mechanic, passed) and BC-FIX (merged in release-0.9.7) are done.
stop 1 AM); DIFF-ALGO (Opus MAX, session_01FhBbYLkEmfNhWBz7cCsNXu, t-diff-algo: research incl. the internet + the meter + the arc for
all 10 worlds + the engine's levers + a read-only prototype calibrated to Matt's ratings, stop 1:30 AM); INT-2 (session_01FhBbYJyqGNbY6jh1mWA5WW)
DONE and retired (final head t-int-2@f01c76f7: + 14 w1traps catalog rows; new packets base on it). Story keeper (session_019iachLiuwNTAZUBSJWUmR3, permanent): nature
check duty before each level (R-165.164; bar: "does it make sense there to a player"); snake rename = Golden Eyelash Viper (R-165.166, tomorrow).
WAITING ON MATT'S RESET (he was at ~96-99%; he says when): Fable on ENG-ASCENT (packet 2026-11-13/ENG-ASCENT.md, the ascent lay first)
+ Fable's 1-5 idea list C (IDEAS-1-5.md; A = Opus xhigh t-ideas-15-a@d4ae2319, B = Opus max t-ideas-15-b@df33077c, both done); then D15
(Opus max) designs 1-5 (D15.md: Normal target ~5-6); BC-FIX (Opus xhigh). 1-4's design passed (t-14-design@1b88b431); its build waits
on the engine pieces + Matt's feel test; its build packet must set a Normal target ~4-5 and revisit "a knock never costs a heart".
TOMORROW: retro + LEVEL-LOG costs; 0.9.7 prep (BC-FIX, R-165.157 testers on 1-3, R-165.158 About, R-165.125 sound question, clear the
tester sheet after the archive copy); story keeper's words (R-165.165/.166/.171); level.md rule changes the lead approved (list in STATE
11-12 8:24 PM). D30 REPEAT today: stamp every ledger time with `date` inside the writing command (R-165.168 gate ordered).

## EARLIER (superseded) RIGHT NOW (11-12 11:20 AM ET; written before the lead's memory compression; this block wins over older lines below)
Running (all report to the lead, session_01FhBbYP63h7cCX8DyW69stq; story keeper session_019iachLiuwNTAZUBSJWUmR3, permanent):
- P11 1-1 pass (Opus high, session_01FhBbYNA2XQgbQQrcxjr5GS, t-11-pass): dead-zone + bounce-purpose verdicts, hop rocks, list 258,
  first run 9800; its L18 stills PASSED the lead's look; owes: what the empty ring by the checkpoint flag is (F12 found the mushroom rim
  bug, likely the same), the x10040 soil-tone patch (one-frame stills tool?), its gates + REPORT. Retire after.
- F12 1-2 (Opus high, session_01FhBbYMY35Ak6jDnbB6WZAi, t-12-fly): 1-2 flown, 118/120 strictly clean (98%) on its own rows; ring bug fixed;
  stills judged: chain PASSES as gameplay; owes R-165.138 (tall-stem first cap) verdict confirmation, Dot's card mid-screen (live? log it),
  checkpoint-on-mushroom named. Stop 12:45 PM.
- AF audit fixes (Opus high, session_01FhBbYNyuLtE1k1CyxwaB3A, t-audit-fixes): PROOF-1's 5 violations (Capacitor 'then' AudioFocus +
  KeepAwake; Stage Cleared buttons in the home bar sideways + clipcheck; save-dialog words = the story keeper's lines, sent; generality
  gate paths; tools tests in CI) + unproven items. Stop 12:45 PM.
- W1C Fable (session_01FhBbYM1aFUg186wiXKD1bx, t-w1-creatures): creatures wired (snake, drop traps, noise) DONE; now laying 1-3 (Matt wants
  Fable to make 1-3; if Fable runs out, Opus carries on from its branch); owes the readability fixes (hive hidden behind a petal; snake
  flees TOWARD Pokey; vine a line) + reference/art/W1-TRAPS-LIST.md. Stop 1:15 PM.
- GL0 Fable (session_01FhBbYMMBxNi4RVq9QZKCJF, t-webgl-0): cut to the measuring stick + PixiJS Stage 0; step 3 planned for Opus.
- PROOF-1 Critic (session_01FhBbYMYtRUNd5ze6kU5rsW, t-proof-audit@179cdb8a): verdict REJECT (5 violations, now in AF); KEEP it for the delta
  re-audit of AF + INT-2.
MATT 11:23 AM: 1-3 FIRST on his test link TONIGHT by ~9 PM, shown as it really is (stand-ins named); 1-2 rides along only if it passes.
P11 retired 11:21 AM; F12 retired 11:29 AM (t-12-fly@ed329f74, 1-2 118/120 clean both settings, chain.mount = R-165.138, R-165.140 = Dot card; $14.72). INT-2 packet: reference/packets/2026-11-12/INT-2.md (t-int-2), session_01FhBbYJyqGNbY6jh1mWA5WW, Opus high, started 11:24 AM, stop 4:30 PM.
11:45 AM: the lead judged W1C's 1-3 stills (d80abcba): PASSES as gameplay; stand-in contraption art NOT at the bar (green poles =
umbrellas, stone = grey egg, plain hive, handle not "punch me"); soil seam in trap1 upright; Dot's knockout line on a trap -> story keeper ruling.
ART-W1 (Opus high, session_01FhBbYMpG8Whyc8dYXFUYBR, t-w1-art from t-w1-creatures, packet reference/packets/2026-11-12/ART-W1-TRAPS.md,
GPU cap $6, stop 4:30 PM): paints handle, anchor, vine, hive, stone on Hugging Face; contact sheet to the lead before cutting.
11:55 AM: W1C 1-3 laid 99% on 1-1's judged rows, NOT flown by bots (no bot knows the vine handle; no 1-3 JUDGED rows). At 1:15 the lead
writes P13 (Opus high, from W1C's head): fly 1-3 with the bots both settings (completable), bots learn the trap handle (general), 1-3's
own JUDGED rows + the real 120-roll number, 1-3 seed list, funcheck, 2-min length, first-appearance taught; stop ~4:30 PM.
Tonight's chain: P13 + ART-W1 (4:30) -> INT-2 merges W1C, P13, ART-W1 (~5:30) -> full gate (~6:30) -> stills to Matt (~6:30-7) -> test link ~9 PM.
R-165.141 (Matt: snake always glides away) with W1C. No noise teach in 1-3 (map); noise must not wake creatures untaught.
12:00 PM: AF retired (t-audit-fixes@98149355, all 5 fixed, $9.72). INT-2 step 1 = t-int-2@168b9309; now merging t-12-fly + t-audit-fixes
+ the lead branch. yield.test.ts:62 RED (11/30, floor 12) from P11's verdicts -> Y2 packet (reference/packets/2026-11-12/Y2-YIELD.md)
starts from INT-2's next head; then PROOF-1 delta re-audit (AF + INT-2).
12:07 PM: RF2 (Opus high, session_01FhBbYNAQ6YJ6gEcgAWgz5k, t-render-2 from t-int-2@168b9309, packet RF2.md, stop 3:30): R-165.146 soil
seam + R-165.129's open part. W1C 133f542d: R-165.141 done, trap Dot line done. P13 MUST also move "excuse me" from 1-3's halfway
wayside (wayside.ts:67, DotGuide.tsx:1321 by stage id) to the first punch-glide moment, before tonight's test link.
12:05 PM: GL0 retired (t-webgl-0@fdaa5333, REPORT 37 lines): stick + Stage 0 in; R-3.3 copy layer NOT kept (slower); frame = GPU fill
(backdrop strips ~half); next WebGL step (Opus): re-take phone numbers with the fixed gpuprof, then SHOW the backdrop on WebGL under a
see-through 2D canvas (blend effects move first). Full tests/drawcheck/clipcheck etc NOT run on it; not in tonight's merge.
R-165.142 (gameCanvas willReadFrequently fix) lives on t-webgl-0: decide whether INT-2 takes it for 0.9.7.
12:10 PM (Matt 12:07): FABLE (W1C) DESIGNS AND BUILDS 1-3 (no 12:30 stop): reference/design/1-3.md + LEVEL-BAR.md draft by 1 PM, then builds.
P13 (Opus high, session_01FhBbYLQMBLSzszj1sXmkwV, t-13-proof from t-w1-creatures, packet P13.md, stop 4:30): plumbing only beside it.
12:52 PM: t-int-2@91af3475 = engine + P11 + render + pit + F12 + AF + lead docs (only yield red). Y2 (session_01FhBbYM4174oEe1R2ocGwwk,
t-yield-2, stop 3:30) started from it. PROOF-1 re-auditing the delta on it (stop 2:15). INT-2 WAITS for the lead's word (~4:30-5:30):
merge t-yield-2, t-render-2, t-13-proof (carries W1C's 1-3 moved into World 1's kit), t-w1-art; then full gate + test-link build.
W1C (Fable): 1-3 built to design (480/480), now moving into the shipped kit (hand-built 1-3 deleted); Normal hotter; finale hop gap.
1:08 PM: ART-W1 contact sheet judged (handle B/B, tendril A/A, anchor B sapling carries the whole trap, vine A, no leaf clump, stone B/B, hive =
Matt's frames 1-2); $1.93 of $6 spent. OPEN: the master catalog (reference/art/CATALOG-MASTER.csv, tools/art/catalog_master.py) lives only on
t-engine-inventory@621a3d2b (PASSED 11-11, never integrated): INT-2 merging it now (1:12 PM); ART-W1 writes its rows to
reference/art/catalog-rows-w1traps.csv meanwhile.
1:10 PM (Matt asked if 1-2 works): the shipped game still builds the OLD 1-2 (F12 stills used a hook). P12S (Opus high,
session_01FhBbYLWBAyFDZwv15qoG2N, t-12-ship from t-int-2 + W1C's listedRoll, packet P12S.md, stop 5 PM): 1-2 into the kit, seed list,
bots, real-game stills; CTEST_STAGE_ID='1-2' (testers' control test): it reports and WAITS for the lead's ruling. Rides along tonight
only if it passes; INT-2 merges t-12-ship after t-13-proof.
1:30 PM: RF2 retired (passed). PROOF-1 delta: 5/5 fixed; REJECT on NOT_IN_CI growable -> INT-2 fixing (+R-165.152/.153), then PROOF-1
re-checks that item only. INT-2 also merging the inventory (done) + 5 passed-never-merged branches (E1 recorder, w11-analyst, ADR docs,
reach specs, 1-2 packets). P13: real 1-3 120/120 on own rows; bots no softlock; 1-3 seed list waits for W1C's teach + Easy-length head
and the lead's OK (filter = 1-1's; 2-min floor for every tier). P12S: CTEST does not use 1-2 (data is 1-1 runs); R-165.151 = old control
course leftover, after tonight. Lead session 375k context, $85 at 1:24 PM.
2:02 PM (Matt 1:37): D12 (Opus MAX, session_01FhBbYL2J8WMSCxDNyH7jt7, t-12-design): 1-2 DESIGNED + built (1-2.md to the lead 3:15 PM).
F13 (Opus MAX, session_01FhBbYLor45ufvfpo74eKDv, t-13-finish): reads now; TELL IT when W1C stops, then it finishes 1-3 from W1C's last head.
P13 + P12S = plumbing only. Packet D12-F13.md. Merge order tonight: t-yield-2, t-render-2, t-13-finish (holds W1C+P13), t-13-proof,
t-w1-art2 (ART-W1B, replaces t-w1-art), then t-12-design (+t-12-ship) if 1-2 passes the lead's look.
2:26 PM ET RUNNING: F13 (Opus max, session_01FhBbYLor45ufvfpo74eKDv, t-13-finish: 1-3 finish from W1C's FINAL head d03487f7; H beat,
shimmy vine longer, goal = trap count, gates, stills); P13 (bots, 1-3 seed list on F13's final head with lead OK); D12 (Opus max, 1-2 build,
session_01FhBbYL2J8WMSCxDNyH7jt7); P12S (1-2 plumbing + gen2 lays the existing w1_note find); ART-W1B (session_01FhBbYKTygXnUZ3ts1re6dE,
t-w1-art2: second sapling, hive A, natural tendril anchor, vine-wrapped stone, shimmy vine pieces, Meeca's leaf note, w1sunrise-far repaint);
Y2 (yield); INT-2 idle. W1C (Fable, $108) and ART-W1 ($17) retired. 1-3 rulings: hearts = game's rule; goal = every trap; no made things.
0.9.7 RELEASE TO-DOS (Matt 11-12 afternoon): testers' link plays 1-3 only (R-165.157, P12S or tomorrow's helper); at release, clear
"Sloths control tests" Sessions rows 2+ (archive copy made and verified; see STATE.md); ask Matt the R-165.125 sound question first.
3:52 PM: P12S retired; FX (session_01FhBbYKjnCLuVSaiv4oa69K, t-fx) does flags + find spot; the ctest switch -> tomorrow. t-int-2@daa21d53
holds Y2 + RF2. 1-3 seed list recorded (P13). About pages APPROVED (STORY-LINES.md; About is a living page). Usage 90% at 3:48.
Tonight's merge order: t-13-finish, t-13-proof, t-w1-art2, t-fx, then t-12-design (+t-12-ship) if 1-2 passes.
4:33 PM ET RUNNING: F13 (1-3 final: sky flip, draw breach <7.5 + drawcheck plays 1-2/1-3, teach-mark 2 lines, seed list check, stills),
D12 (1-2: thorns cost on Normal done; set-back test model; gates; then t-12-note from the integration head), FX (flags root fix
everywhere; 1-1 list re-record APPROVED; W5-8 proof; then find spot), RF3 (hollow painter), INT-2 waiting. Retired today: P11, F12, AF,
GL0, W1C(Fable), ART-W1, RF2, PROOF-1, Y2, P12S, ART-W1B, P13. About pages APPROVED (STORY-LINES.md). Usage ~91%.
6:03 PM ET: FX + D12 DONE (1-2 passed; 4 h 12 m). INT-2 merging t-fx@e085120c then t-12-design@489ae984, then D12's t-12-note,
RF3's final (passed), F13's final (lesson card + Skip); then Step 3 + test-link build; the lead judges and publishes EnK5. Pitch round per
level agreed with Matt (STATE 6:00 PM). Matt's wife plays 1-2 vs 1-3 blind tonight.
NEXT, in order: (1) INT-2 (Opus high): t-int-engine + t-11-pass + t-render-fixes + t-pit-polish + t-audit-fixes (+ t-12-fly), renumber the
  duplicate R-165.129, full gate; (2) PROOF-1 re-audits only the delta; (3) ask Matt ONE question: ship the R-165.125 sound levels or hold
  (D47), then 0.9.7 on his word (PR, he merges, check deploy + APK); (4) 1-2 and 1-3 to Matt's test link by Fri 11-13 (1-3 by Fable/W1C,
  1-2 from F12; pits from PIT); (5) HF is the lead's call ($63.53, ~$10 reserve): first job = the W1 trap art from W1-TRAPS-LIST.md;
  (6) after Matt's Fable reset: the golden 1-3 + reference/design/LEVEL-BAR.md.
Rules learned today: a HOLD or STOP to a helper goes with send_message priority "now" (plain messages wait until its turn ends: ART-W1 got a 12:31 hold at 12:50 and spent $0.13 meanwhile); judge every still before Matt sees it; re-judge when a helper replaces its stills; "as good or better", never
pixel-identical (STAGE-RULES §5b); Matt-reported items tagged on ROADMAP the same turn; effort: xhigh only when needed, max when needed.
Check-in trigger: re-arm send_later every 30 min while anyone works.
FABLE 98% at 2:23 PM ET: W1C stopping, F13 took over 1-3. FABLE 94% / ALL MODELS 82% at 1:36 PM (Matt chose: Fable stops when it runs out ~3 PM, Opus finishes, reset ~4:30-5 PM, Fable polish after his notes). FABLE 88% at 12:01 PM (resets Wed 11-18 2 AM ET; Matt may reset earlier when his normal limit, 75% at 12:03, hits 95-99%; the reserve goes to the golden 1-3 pass after his notes on tonight): GL0 stopped 12:03, W1C stops 12:30; no Fable after that unless the lead names a packet.
Matt 11:20 AM: this lead leads him through the 1-3 build at least (do not rotate the lead before 1-3 is on the test link). HF $63.53 is the FINAL budget for now.

## Matt's direction (11-11 evening, his words)
- "You determine what should be done... The only person on the team that stays is the storyteller... I'm looking for a leader that can lead."
- "For small decisions, you make it. For big game-wide decisions, I can step in." Push back on him; keep him focused; "no tunnel vision."
- Tokens matter: cut reviews that don't pay; an auditor sweeps periodically, not every task. Short fresh sessions.
- Engine first so levels go fast; global changes before one-level fixes ("70% of the game better, then go back").
- Fix what we know BEFORE the audit; the audit then PROVES the engine ("prove it to me that it works").
- Fable 5.2: "use it for as much of the engine as possible and get ahead"; he decides each extension (asked 10:45: not answered).
- Quality bar: "competitive against AAA studios, on the same bar as indie: creativity, style, and fun."
- Build order agreed 9:44 PM: World 1 COMPLETE first (9 levels + Venom Fang checked against the new rules + its hidden stage), then main
  levels world by world (each shipped whole; old bosses and specials stay until replaced), then bosses and special stages as their own pass.
- Creatures (9:41 PM): unique casts per world; "Fable has complete control of these enemies"; guardians much, much larger than Pokey.

## Where things stand
- **LIVE: 0.9.6** (the new 1-1), merged 7:04 PM (PR #69, merge 585ef376); APK https://github.com/mshaffe1111/Sloths-Adventure-/releases/tag/v0.9.6-38;
  Matt's test link EnK5 v246 = 585ef376. Defect D45: deployed main JS 254 B over chunkcheck's budget (chunkcheck builds without BASE_PATH).
- **Engine work done tonight, all on branches, NOT merged, nothing changes play (stage lock 102/102 on every branch):**
  | Branch @head | Base | What | Who |
  |---|---|---|---|
  | t-engine-seedchunks@889302163 | t-int-1-1 | R-165.112 seed lists out of the main chunk (makes room). Its Critic saw roadmapcheck failing on the head: fix at merge | Fable (old team) |
  | t-engine-guards@b3e8db15 | release-0.9.6 | R-165.116 frame loop, R-165.117 saves, the generality gate (38 literals known, shrink-only) | Opus |
  | t-engine-fixes@f85a8729 | t-engine-guards | EN-F DONE: the audits' known findings fixed (full suite 2,765/0), R-165.125 sound (sliders, limiter, lower defaults: Matt to judge by ear); parked items in its REPORT.md | Opus, retired |
  | t-engine-yield@729f249d | release-0.9.6 | generator clean 9%->57%; listable 33%; travel as a mode (stage kit types merged); any listed stage by data; hurt floor (not drawn); builtOnArcs; GraphBrief.pits | Fable |
  | t-engine-clock@fd94c3f6 | t-engine-yield | the one clock (every timer moved bit-identical), beatBrick, clockaudit; stillness + watchers; noise + sleepers + drum; rides | Fable |
  | t-engine-library@cac3a859 | t-engine-yield | pickups by brief; sections picked by need; one brick in two worlds; 1-2 needs 11 new sections (was 42), 61/56% clean but for the unpainted thorn bed | Fable |
  | t-engine-predators@9bd5cee6 | t-engine-clock | reference/design/PREDATORS.md (story keeper PASS) + src/game/predators/ kit (8 habits, 13 animals, move ladder in TAUGHT/inWorld) | Fable |
  Parked: t-engine-11-followup@f24af141 (1-1's polish pass, after the engine); t-assets-compress@ffee5acc (waits for Matt's pick).

## Tomorrow, in this order (START ONLY ON MATT'S WORD; ALL HELPERS ON OPUS 5.5, no Fable: Matt 12:06 AM ET)
0. **Matt-reported sweep FIRST** (D47; Opus high, short): every issue Matt reported (STATE.md, handoffs, ROADMAP, qa-reports, the testers'
   sheet data the bots came from) that is still open; tag each on ROADMAP.md as reported by Matt; fixes already on a branch join the merge;
   the rest go to the top of the queue. Never ship an open Matt-reported issue without asking him directly first.
1. **Integration** (Opus xhigh, one builder): merge into one branch off main: t-engine-split@0e45a527 FIRST (EN-S: the code split, seedchunks inside, D45 fixed;
   main script 655 KB), then guards -> fixes, yield, clock, library, predators, wire (t-engine-wire: library + thorn bed + 1-2's double + clock on the fixed step; 1-2 98% clean on flown rows); PLUS from the parked t-engine-11-followup only the R-165.122 part of commit 2a988785
   (it is mixed with 1-1 items and a list rebuild: take only the hop-rock walls and their verdict, not the list rebuild) (hop rocks walked through: a generator rule, not 1-1 polish: every counted obstacle must block, or it is scenery and
   funcheck does not count it; Matt 11:22 PM); resolve conflicts; fix gates.yml so chunkcheck builds with BASE_PATH (D45); run the FULL gate once (CLAUDE.md Checks).
1a. **The 1-1 pass (Matt's two live 1-1 reports, one list rebuild):** R-165.122 hop rocks (code from 2a988785, proven by INT-E) +
   R-165.124 the dead-zone verdict with Matt's seeds 21537, 15406, 15458 as planted failures; then rebuild 1-1's seed list once, re-pick
   the first run, recalibrate; Matt sees the new 1-1 on his test link before any release.
1b. **Stranded Matt-reported fixes** (Opus high, after INT-E): R-164.1, .6, .7, .8 (commits 57898c82, 9b384389 on old branches
   engine-render/engine-runs, pre-gen2: never merge those branches): reproduce each on t-int-engine; port only the fix, with a test.
   R-164.6/.8 are the pit-wall seams Matt saw on 11-11. Register: reference/qa-reports/MATT-REPORTED.md (27 open).
2. **The proof audit** (one cold Critic, Opus xhigh): the merged engine, every gate, the bots: "prove it works" or name where it doesn't.
3. **Then build on top** (FIRST, Matt's open issues: the dead-zone petal log as a gen2 verdict with the test from his case (R-165.124); the purpose rule as a verdict (R-165.126); the pit-wall art with no seams or boxes; the lead judges stills before Matt sees them. THEN: fly 1-2 and add its JUDGED row = data; fix the narrow-hollow look in the ground painter; then) (Fable if Matt says, else Opus xhigh; short fresh sessions): paint the thorn bed (World 1 manifest art only);
   count 1-2's double on the built stage (E12 item 5); the real 120-roll 1-2 run (`tools/engine/library.ts --seeds 120`, no --flown);
   wire the clock, stillness, noise, rides and World 1's snake/eagle/boa; lay 1-2 and 1-3 (goal: on Matt's test link by Fri 11-13, else
   switch to twisting the existing levels); the WebGL measuring stick (R-150.4/R-150.1, then R-3.1 PixiJS as its own chunk).
4. **Cleanup** (Opus): the code split (each world its own chunk); delete the old generator per world on gen2; bots record which assets ever load.

## Open asks to Matt (one question at a time, your pick first)
- Fable: ANSWERED 12:06 AM: Opus only tomorrow; Matt says when to start.
- Compression DECIDED 11:00 PM: art at q82 for files above about q83, EXCEPT dark/black images (kept as shipped); music unchanged.
  About 14-16 MB off (app ~188 -> ~172). Run it 11-12 as a small Opus job from t-assets-compress's tools; show Matt before/after stills.
- Guardians "huge" needs a Hugging Face picture list (8 of 10 are drawn larger than their sheets already); boss pass, his approval per picture.

## The team
- Story keeper (permanent): session_019iachLiuwNTAZUBSJWUmR3. Owns story, Dot, player text; reviewed the map, the swaps, the creatures.
  Its approved lines for coming packets: reference/packets/2026-11-12/STORY-LINES.md.
- RUNNING since 11:03 PM: EN-W (Fable, session_01FhBbYLceMpXDYKrR93Htkd, t-engine-wire on t-engine-predators, stop 12:05 AM): merge
  library in, paint the thorn bed, count 1-2's double, the real 120-roll 1-2 number, then the clock on the fixed step. AS-2 (Opus,
  session_01FhBbYMEeJcQCZAxBMhq2GW, t-assets-art82, stop 12:15 AM): Matt's art setting applied + every image measured against its
  original, dark images exempt, a check page for Matt. Retire both when they report (verify ls-remote first).
  EN-S (Fable, session_01FhBbYNeneV7CJUH3PDMtKm, t-engine-split on main, stop 12:15 AM): seedchunks merged first, D45 fix in gates.yml,
  a bundle breakdown, each world / old generator / special runs / bosses / story as their own chunks behind one loading seam; offline proven.
- RUNNING (11-12 10:15 AM): PROOF-1 (Critic xhigh, session_01FhBbYMYtRUNd5ze6kU5rsW, t-proof-audit, stop 11:45); P11 (high,
  session_01FhBbYNA2XQgbQQrcxjr5GS, t-11-pass, stills PASSED by the lead, gates running, stop 11:30); F12 (high,
  session_01FhBbYMY35Ak6jDnbB6WZAi, t-12-fly, stop 12:45). Done today: SWEEP-M, INT-E (green), RF, PIT (passed the lead's look).
  FABLE (10:43 AM, stop 1:15 PM): W1C (session_01FhBbYM1aFUg186wiXKD1bx, t-w1-creatures: creatures + drop traps live, 1-3 laid)
  and GL0 (session_01FhBbYMMBxNi4RVq9QZKCJF, t-webgl-0: measuring stick, PixiJS chunk, ground on WebGL).
  1-3 IS BEING MADE BY FABLE NOW (W1C, Matt 11:16 AM); if Fable runs out, Opus carries on from t-w1-creatures. After Matt's reset, a fresh
  Fable session finishes 1-3 as the GOLDEN LEVEL + writes reference/design/LEVEL-BAR.md (Matt 10:51 AM);
  Matt approves it; Opus levels are scored against it.
  NEXT: INT-2 = t-int-engine + t-11-pass + t-render-fixes + t-pit-polish, full gate, audit delta; then 0.9.7 on Matt's word
  (ask him first about the R-165.125 sound levels, D47).
- Everyone else retired tonight, branches verified. Next helpers start fresh from their role card + this note + a packet.

## How the team runs now (learned tonight; keep)
- Short fresh sessions: EN-C built 4 engine pieces for $12.48 in 46 min; EN-Y spent $55.80 in one long session. Retire at ~40% context.
- Fable: one stream per hard problem, design first inside the session, a hard stop, milestones; it can run its own subagents.
- Messages to a busy session wait until its turn ends: the brief is final; use priority "now" only to stop work in flight.
- Review by risk (TEAM.md Cost rules). Fix known findings first; one proof audit after merging.
- A creature's counters follow the move ladder (World 1 eagle = stillness and cover; throwing taught in World 3; the bell in World 2).
- The lead measures main with git show / git archive into a temp folder, never a checkout (the 8:46 PM miss).
- Every helper's "no rule loosened" claim is checked by the lead in the diff of reach.ts / verdicts.ts (done at 8:20 PM).

## Links
Live https://mshaffe1111.github.io/Sloths-Adventure-/ · testers ?fresh=1#ctest · test link https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb
World map (113 stages, engine needs, move ladder, creatures, Matt's ideas, build order): https://claude.ai/artifact/KRT1HT17cy8c7wd1pN87za
(source reference/plans/WORLD-MAP.html). Release method: reference/methods/release.md.

## Spend 11-11 evening (session records)
EN-Y $55.80 · EN-P $35.94 · EN-C $12.48 · release clerk $12.41 · AS-1 $10.79 · stopped starts about $7 · the lead about $25 ·
EN-L, EN-G, EN-F not reported by their records.

# Every issue Matt has reported, and whether it is fixed

Sweep SWEEP-M, 2026-11-12 (started 7:31 AM ET), for the lead (LESSONS D47: every Matt report gets an R-id the same turn, tagged
REPORTED BY MATT, and no release ships an open one without asking him). Read only for game code; this file and ROADMAP.md tags only.

**What counts:** something Matt himself saw, felt or said was wrong while playing or looking at the game (a bug, an unfair spot, a look
that is broken or rough, a sound, a screen). His ideas and wishes are in `reference/ideas/` and are not listed. Testers' words he
relayed are listed at the end, apart.

**Where it was searched:** reference/STATE.md, STATUS.md, ROADMAP.md, LESSONS.md, CONTINUOUS-IMPROVEMENT.md, HANDOFF.md, handoffs/*.md
and their git history (`git log -p --all`), the reference/ files of origin/ccr-ca657d3c-n09zty and origin/ccr-0d59a91c-oy3imz,
reference/qa-reports/ (every README/NEXT/notes file; image-only folders through the ledger lines that describe them),
reference/engine/MATT-DIRECTION.md and engine/cp3/matt-stills-0224-0228/, reference/research/STUCK-PLAYERS.md, tools/playtesters/
(the sheet the bots copy from), tools/inspect (calibration: no Matt findings there), commit messages on every branch.

**How "fixed" was checked:** `git merge-base --is-ancestor <sha> origin/main` (main = 0.9.6, merge 585ef376, live) and the same against
the branches named. A row with no commit naming it was checked in the code where possible (cited).

Status words: **FIXED** (on main = live), **FIXED ON A BRANCH** (which branch; not live), **OPEN**, **CANNOT TELL** (what would tell).

## The table (newest first)

| Date (ET) | Matt's words (short) | Recorded at | R-id | Status |
|---|---|---|---|---|
| 11-11 11:37 PM | (EN-W's retake stills) "pits now open" but the earth pillars show "hard rectangular seams and mismatched tones, stray square artefacts near the thorn beds, and mushrooms on pillars again" | STATE.md:435 | **R-165.129 (new)**; mushrooms R-165.126 | **FIXED ON A BRANCH in part** (t-engine-wire 5516fd83: thorns stand in the pit's dark, the slab is hidden). OPEN: EN-W's own REPORT.md (t-engine-wire) names Rough 1 (a hollow under about 70 px reads as a column of roots: the ground painter's end faces), Rough 2 (the slab's end face peeks as a grey-green box: Matt's "stray squares"), Rough 3 (a soft dark rectangle at the bed's foot), Rough 4 (low contrast) |
| 11-11 11:32 PM | (EN-W's thorn-bed still) thorn hollows drawn UNDER an unbroken ground line ("danger doesn't look like danger"); three bounce mushrooms on flat ground bounce over nothing | STATE.md:434 | R-165.129 (new), R-165.126 | Hollows: **FIXED ON A BRANCH** (t-engine-wire 92e1688d, 5516fd83; Matt at 11:37: "better"). Mushrooms with no purpose: **OPEN** (R-165.126; only the rule is written, 99f18d99 STAGE-RULES; no verdict) |
| 11-11 11:25 PM | "the sound is too loud" (effects worst at full phone volume; music a little too loud, 11:26); the sliders change little until almost off | STATE.md:431, 439; ROADMAP R-165.125 | R-165.125 | **FIXED ON A BRANCH**: t-engine-fixes@f85a8729 (e2a1c380 even-dB sliders after the compressor + limiter; 51c4dd1c, 16065562 lower defaults). Not on main. Matt still has to judge it by ear |
| 11-11 11:22 PM | rocks too low to need a jump (he walks past them) "bring the fun meter down" | STATE.md:429; lead.md:39-41 | R-165.122 | **FIXED ON A BRANCH**: parked t-engine-11-followup, commit 2a988785 (mixed with 1-1 items and a list rebuild; the lead's plan takes only the hop-rock part into today's integration). Not on main, not on t-engine-wire |
| 11-11 11:19 PM | a petal log in the dead zone on the LIVE 1-1: walking off falls short, a full jump hits or clears the log above; reachable only by a mid-air correction (told to the last lead too, and lost) | STATE.md:428; ROADMAP R-165.124; LESSONS.md:71 | R-165.124 | **OPEN**. Only the rule is written (STAGE-RULES §1, D46). No verdict, no test from his case on any branch (t-engine-wire's REPORT.md does not mention it). Live in 0.9.6 |
| 11-11 11:00 PM | "the black image... that's all jacked up" (W10 storm sky after the q75/q82 compression trial) | STATE.md:425, 432 | R-165.99 | **FIXED ON A BRANCH**: t-assets-art82@144924b7 exempts dark images (107 files kept as shipped). The bad files were never shipped |
| 11-11 9:52 PM | (the creature plan) the World 1 eagle's noise-lure counter needs throwing, which World 3 teaches | STATE.md:420 | **R-165.130 (new)** | **FIXED ON A BRANCH**: t-engine-predators 67adfa44 (the move ladder: a counter only from the world that teaches its move), carried in t-engine-wire. Not on main |
| 11-11 7:52 PM | low-end phones drop to about 20 fps | STATE.md:400 | R-3 (the WebGL lane) | **OPEN** (planned: R-150.4/R-150.1 measuring stick, then R-3.1) |
| 11-11 (day) | "I don't know what that golden pair is, or what even the value of the golden pair is... it just seems out of place" | ROADMAP R-165.109 | R-165.109 | **OPEN** (decided: golden cacao pod etc.; not built). Code fact: main shows "SECRET! GOLDEN SEED n OF m" and it unlocks nothing |
| 11-07 | (child tester, relayed by Matt) 37 min and 187 falls on Easy 1-1: "what happens if somebody's just not able to do it" | research/STUCK-PLAYERS.md:3 | R-165.86, R-165.62 | **FIXED** for falls: the put-back (t-engine-putback) is on main (0.9.6). The help ladder R-165.62: CANNOT TELL from the ledger (check R-165.62's row against main) |
| 11-05 2:16-2:28 AM | (mixer 1-5 on his phone) "It played much better. Needs polish.. was kind of ugly": a black pit column through ground, art drawn over the HUD, a hard darkness box with a seam | engine/cp3/matt-stills-0224-0228/README.md:1-13; ROADMAP R-164.6-8 | R-164.6, R-164.7, R-164.8 | **FIXED ON A BRANCH, STRANDED**: engine-render 9b384389 (merged into engine-mixer, engine-runs only; NOT on main, t-int-1-1, t-engine-wire or t-engine-split). The rows say "also on main (still 03)": the shared draw bug may be live. Needs a pick from 9b384389 into the integration, or a re-check on main |
| 11-05 ~12:05-12:15 AM | "Not having 16 bridges linked where you just jump from them"; rebuilt 1-5 "just run over the cracking logs. Nothing else"; hearts handed out at the very start, checkpoints everywhere, "a cluttered mess" | engine/MATT-DIRECTION.md:19-31, 76-82 | R-163, R-164.11; R-165.126 (hearts, checkpoints by risk) | **OPEN** (R-165.126 has no verdict yet; gen2's 75472091 "flags before the hard part" is on main for 1-1 only) |
| 11-04 ~11:50 PM | "I think 1-2 was broken... but it branched out" | engine/MATT-DIRECTION.md:100 | R-164.1 | as the next row |
| 11-04 11:06 PM | (1-2 phone clip) "I was dying when I should have just been able to fall down to the next ledge" | ROADMAP R-164.1; D33 | R-164.1 | **FIXED ON A BRANCH, STRANDED**: the bug lived in the rebuilt 1-2 (fallZones, never on main); 57898c82 and the w1Pits test 46f2d990 sit on engine-render/engine-mixer/engine-runs only. Main's 1-2 is the old one. The rule ("a fall onto a reachable ledge is never a death") must be a gen2 verdict before gen2 1-2 ships (R-165.11) |
| 11-04 ~11:08 PM | "on level 1-1, let's not have the sky change. It's weird. I'd rather just have one sky." | ROADMAP R-164.2 | R-164.2 | **FIXED (never shipped)**: the far-sky swap was only on w1-rhythm-b (9b1436d3, not on main). Main's scenery.ts:2234 fades only the middle and near strips in a canopy; 0.9.6's 1-1 keeps one far sky. engine-render dbb56f54 also removes it there. To be sure: one still of live 1-1 at the climb's top |
| 11-04 2:23 AM | rated the game 55/100, "a D if I was a kid"; "The eagles... you can outrun them every time. You don't even have to hide"; enemies trivial | STATUS.md:826; ROADMAP R-158.1 | R-158.1 (with R-5.10) | **OPEN** |
| 11-02 2:42 PM | "the wind doesn't affect anything"; sleepy mushrooms "you can jump right through it and it doesn't make a difference"; monkeys on a log: "you just have to wait for them to pass... 15 times" | STATUS.md:807; ROADMAP R-152.1-3 | R-152.1, R-152.2, R-152.3 | **OPEN** (blocked by his World 1 rating, PLAN-TO-80 Phase B) |
| 11-02 2:36 PM | "everything feels the same" (Worlds 3-5); "we're not using the stuff that we built... branches breaking... crumbling"; vines are the weakest part and most of the game | STATUS.md:805; ROADMAP R-150.4, R-150.6 | R-150.4, R-150.6 | **OPEN** (R-150.4 audit merged to a lead branch on 11-04, 15aa4de7, never shipped; R-150.6 not started) |
| 11-02 2:28 PM | 5-4 "so repetitive... gets very boring very quickly" | STATUS.md:802; ROADMAP R-150.1 | R-150.1, R-150.2, R-150.3 | **OPEN** (rhythm check on fun-validator 15aa4de7; not on main) |
| 11-02 2:28 PM | World 4 mist bank ends fade "in hard vertical stripes" | STATUS.md:802; qa-reports matt-2026-11-02 (on ccr-0d59a91c) | R-6.30 | **OPEN** (no commit names it) |
| 11-02 1:26 PM | 4-7: 2 stars after losing 9 lives and 2 continues | STATUS.md:800; ROADMAP R-5.23 | R-5.23 | **OPEN**: main's rules.ts:157-175 still gives star 2 for hearts or time; lives only block star 3. Matt's tiered cap (decided 11-02) is on no branch |
| 11-02 1:26 PM | 4-7: petal arcs over the gaps kill him; a missed one can never be got back | STATUS.md:800; ROADMAP R-6.29 | R-6.29 | **OPEN** on 4-7 (no commit). The same fault returned in gen2 as R-165.124 because the rule was never made a generator check (D47) |
| 11-02 1:23 PM | 4-7: the mist does not always settle when he stands still | STATUS.md:800; ROADMAP R-6.28 | R-6.28 | **OPEN** (no commit) |
| 11-01 10:29 PM | 4-3: "Standing under the rock cave should protect from water... no water shows. This makes it look like the water should take me away." | STATUS.md:790; ROADMAP R-6.27 | R-6.27 | **OPEN** (87d23d1c only logs it) |
| 11-01 ~9 PM | (his other chat) 3-9 ring wall reachable (330 px wall vs 350.5 reach); 1-9 Dot explains the locked exit only once per phone | STATUS.md:768; ROADMAP R-6.1, R-6.2 | R-6.1, R-6.2 | **OPEN** |
| 11-01 1:55 PM | floating props: W2 balcony planters on stone faces, reeds drawn into the soil, a frond over the HUD | qa-reports/props-matt-2026-11-01/README.md:1-5; STATUS.md:730 | R-6.3 (D16) | **OPEN**, unassigned |
| 11-01 1:55 PM | boss 2 (Crocus Rex) defeat cutscene renders wrong | props-matt-2026-11-01/README.md:6-11 | R-1.1, R-1.2 (D17) | R-1.1 **FIXED** (5f25029a on main, 0.9.4; the row still says "pending the merge": close it). R-1.2, the walk of every defeat scene: **OPEN** |
| 11-01 12:45 PM | "Same for all icons in the game. Polish." | STATUS.md:711 | R-6.25 (D13) | **FIXED** in the main (icons B-E in 0.9.4, 6d9a5984 on main); R-6.25's shrink-only allow list still "in progress" |
| 11-01 11:50 AM | Journal on his old save: "worthless, doesn't sound like Pokey... Is this the polish we expect?" | STATUS.md:699 | D1 (A-14) | **FIXED** (journal-voice 752408c9, PR #61) |
| 10-31 11:00 PM - 11:40 PM | 5-M: "the whole level is broken... unplayable. Meeca goes invisible too many times. You fall through things"; survey: "May be worst level in game" | STATUS.md:675; qa-reports/5-M-matt-2026-10-31/README.md | D6 (A-8) | **FIXED** (fix-5m 61664186, PR #60; Matt 11-01: "Meeca's level play much better"). Left over: R-6.20 (Meeca overlaps room 5's wall face; gully stairs alike) OPEN |
| 10-31 10:55 PM | Journal: "This is worthless..." | STATUS.md:673 | A-14 | **FIXED** (PR #60/#61) |
| 10-31 10:05 PM | Satchel "doesn't even look like a satchel... like a book... so small... doesn't have the prologue" | STATUS.md:661 | A-24 | **FIXED** (menus-satchel b8dcbb2c on main, PR #60) |
| 10-31 8:25 PM | "if you pause there's no way back to the start screen... no consistency" | STATUS.md:656 | A-24 | **FIXED** (PR #60) |
| 10-31 8:00 PM | "2 cages wont open" (2-3) | qa-reports/w2-cages-matt-2026-10-31/README.md:1 | A-17; R-6.4, R-6.5 | **FIXED** (f75b5a54 / 33fd7b4c on main, 0.9.1). The fix helper's two follow-ups R-6.4, R-6.5 OPEN |
| 10-31 4:15 PM | the ten-tap "Shaffer" unlock "got lost" with the new menu | STATUS.md:623 | none | **CANNOT TELL**: the lead fixed it in the W8 release with no commit named; ten taps on About on the live build would tell |
| 10-31 2:45 PM | "Most of it is very easy on normal... checkpoints are often laid out in weird areas and when not needed" | STATUS.md:615 | R-5.4; R-165.126 | **OPEN** (R-5.4 blocked by R-152.6) |
| 10-31 2:30 PM | the APK update was refused ("conflicts with an already installed app") | STATUS.md:610 | none | **FIXED** (hotfix PR #57, fixed sideload key) |
| 10-31 11:47 AM | "make him not jump like he's doing kung fu... not Bruce Lee" | STATUS.md:589 | none | **FIXED** (pokey-anim bbe7a8ee on main) |
| 10-31 10:05 AM | 5-M "completely broken": "She's missing... it just resets you again" | STATUS.md:574 | D6 | **FIXED** (fix2 372b70f, then fix-5m; see above) |
| 10-30 9:30 PM | "You can't climb down... the only way to get down is to fall." | STATUS.md:89 | none | **FIXED** (b720554c, dba3c620; PR #55) |
| 10-30 3:40 PM | Worlds 1-4: "I can tell you exactly how they're going to play out... It doesn't really ever change, it just shifts" | STATUS.md:62 | R-142.2-.5 | **OPEN**, parked by Matt (A-30: after launch). 1-1 alone is on gen2 (0.9.5) |
| 10-30 1:15 PM | OnePlus sound couldn't keep up (his live #ctest) | STATUS.md:55 | none | **FIXED** (recorded music; "Music is good", STATUS.md:52) |
| 10-30 12:20 PM; 3:50 AM | the enemies went missing on his Pixel (v8; again with stageReady) | STATUS.md:36, 53, 55 | none | **FIXED** (5d518ef3; lost-canvas guard 24218158; on main) |
| 10-30 | APK "a little buggy", weaker frame rate | STATUS.md:10 | PLAY-STORE-RULES §4 | **CANNOT TELL** (no detail; parked by Matt). A phone run of today's APK would tell |
| 10-29 ~11:44 PM | (his Pixel's #ctest data) about 27.5 fps, worst 20.2 | STATUS.md:8 | none | **FIXED** for the Pixel (0.9.0: 29.6 fps, 0 stalls, STATUS.md:672); low-end phones are the 11-11 row above |
| 10-29 ~7:55 PM | "2nd basket on 1-4 impossible, a platform blocks the rock" | STATUS.md:5 | none | **FIXED** (1a6ba43 on main) |
| 10-29 4:08 PM | "what we lack the most is seams... I feel like I'm fighting a battle" | STATUS.md:239 | R-164.4, R-165.105 | **OPEN** in part: canopy cross-fade seams (R-164.4) and 10 middle strips that cut a tree at every repeat (R-165.105) |
| 10-29 4:02 PM | falling rocks: "it puts squares where it's going to fall... doing it lazy again" | STATUS.md:247 | R-143.2 (the branch) | **CANNOT TELL**: hazard-anim 9b10460e is stranded (not on main) and holds water art; whether main's falling rocks still warn with squares needs one still of a rock fall (a World 3 or 7 stage) |
| 10-29 4:00 PM | sound effects: "pings everywhere... pinball", "they were crap" | STATUS.md:240 | SN-1/3/9/10 | **FIXED** (polish-sfx merged, 017f0e69 on main). Loudness came back as R-165.125 |
| 10-29 | Dot "constantly nagging", "gives away the puzzle", "weird blue box/circle" | STATUS.md:224 | DOT-1..17 | **FIXED** (polish-dot f203dac7 on main) |
| 10-29 | music "repetitive or boring", "wrong feel for the world" | STATUS.md:225 | SN-* | **FIXED** (Matt on v3: "I love the new music") |
| 10-28 | Meeca's 5-M: "90% dead time; climbing unneeded, you can run along the bottom" | STATUS.md:355 | none | **FIXED** (PR #44, Matt tested and approved) |
| 10-28 11:55 PM | rope traverse "looks awful" (one stiff pose under a dashed line) | STATUS.md:311-313 | none | **FIXED** (rope-traverse merged; Matt: "Looks good") |

{{HISTORY}}

## Testers' words in Matt's sheet (not Matt's own; the bots copy from this sheet, tools/playtesters/profile.py:2)

| Date | Tester's words | Where | Status |
|---|---|---|---|
| 10-23/24 | "Cannot climb up and down vines"; "It was hard getting on the bouncy pads"; "The 2nd rope flickered when it swung high to the left" | tools/playtesters/personas/jen.json:101-198 | CANNOT TELL (climb down was fixed 10-30 for trunks; vines and the rope flicker were never ticketed) |
| 10-24 | "Jumping up, long jumps, a little fast"; "Getting stuck... game jiggles, having trouble high jumping" | sally.json:100-136 | CANNOT TELL (qa-fix-e helper, STATUS.md:226; no closing proof) |
| 11-07 | the child tester's 187 falls on Easy 1-1 | research/STUCK-PLAYERS.md | FIXED for falls (put-back, 0.9.6) |

No file in the repo holds the raw #ctest or child-tester sessions (only these persona summaries). The dead-zone petal log was "in the
testers' data" (LESSONS D47) but that data is the Google sheet, not a repo file: **CANNOT TELL** what else is in it until someone reads the
sheet's rows since 0.9.5 against this table.

## OPEN, in order of how much of the game each touches

{{OPENLIST}}

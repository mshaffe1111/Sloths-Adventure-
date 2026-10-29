# Status board (the lead session keeps this current; see reference/LEAD-PLAYBOOK.md)

Last updated: 2026-10-28 (Hugging Face art run started).

## Live (main)

- PR #39 (2026-10-28): Worlds 1-2 rebuilt, iPhone sound fix, Worlds 1-4 groundwork.
- PR #40 (2026-10-28): Worlds 3-4 rebuilt, upright puzzle camera, QA batch 1 fixes, sheets load at stage start, browser fields in
  recordings, the one-time slow-phone tip, the Android build fix (first successful APK, run 40721485781).

## Tomorrow's art pickup (2026-10-28 ~23:30 ET)

- The art helper was stopped (Matt's side). Its two HF creature jobs (6ae2b6ae3fb22a235dd4f5f9, 6ae2b6a341e90535df781f07; "creatures-new-0/1",
  spec tools/art/gen/spec-creatures-new.json in the art-hf worktree, output in the bucket under w6to10/) were left to finish (Matt: let them
  finish). A low-effort helper then cuts them in: W6-10 creature clip sheets (crab, piranha, sentry, bat, owl, lizard, beetle, soldier attack/hurt),
  plus Matt's Gemini sheets in reference/prop-sheets/gemini-batch-2026-10-28/: w6-hides-arches, w9w10-bridges, queen-collar-off (crop labels),
  reaver-walk-take2 (still no walk: use 2-3 poses for a code-driven walk). The art-hf worktree has the creature scripts uncommitted.

## Cost mode (Matt, 2026-10-28 ~22:45 ET): one builder per world, cheaper effort for routine work, tests once at the end and one gate
per merge batch, QA once per world; never skip a rule (LEAD-PLAYBOOK §7).

## Update 2026-10-28 ~21:20 ET

- LIVE: PR #45 vine hotfix (self-swinging vines; deployed, APK built). Test link v225 = ccr with the vines.
- W4 round 6 (catch ledges, Matt's earlier call; climb rocks) merged in ccr, gate running → test link. W4 round 7 (QA C5/C6/D5) sent.
- QA batch 2026-10-29 assigned: qa-fix-w123 (3-1 water gap BLOCKER, 2-2 ponds/flags, 1-7, 2-6, 3-3), qa-fix-dot (heart tip at full hp,
  misfiring/long lines, mid-stage sheet loads), qa-fix-meeca (room nudges, room 2 upright, pick-up teaching, carving ring, counter label).
- World 6 hook-up: gen2-w6 session on gen2-w6-hook. gen2 core DONE (f443b11).
- Art: gallery published; Gemini prompt page https://claude.ai/artifact/59Dv4xofbzSP7U5mz4CDyW (17 prop sheets + 3 characters). Matt's
  first 10 sheets in reference/prop-sheets/gemini-batch-2026-10-28/ (redo asked: W7 plates, Reaver walk). Art helper cutting them in.

## Live and test link (2026-10-28 ~20:30 ET)

- LIVE: PR #43 (polish, W1/W2/W4 round 2, gen2 core, Dot fix) and PR #44 (Meeca's trails rebuilt; Matt tested and approved, and
  approved her line "Too far to jump. The high way, then."). Both deployed, APK built.
- Test link v224 (ccr): + W3 round 2, W4 round 3, 5-7/5-9 on gen2 (gen2-hook 5c651ee; 5-9 Easy goal 5; flags <= 4,500 px).
  Open: 5-7/5-9 look alike by era's 20 s rule (every W5 stage does: same few moves), so it goes to a World 5 variety pass; W5 band below W4.
- Vine HOTFIX: Matt approved the v2 videos (period 2.85/3.3 s, amp <= 0.45 rad, no overlap, out of step, every jump >= 167/300 ms;
  root cause: a neighbour vine took over the swing). vine-fix 7d09039, final suite in progress → small PR → main.
- Art: Matt "Love it all, use as much as possible". Gallery published (https://claude.ai/artifact/6huUggQRkCkBs3K4Bf47o5). Art helper
  a01f960681f8dcc2a: ~$5 re-runs (Monarch fly/hover, Flicker lead/dart, Reaver walk), then cut-in on art-cutin. Matt will make in Gemini:
  side-on props (W10 stair, W7 block, W9 slab, W8 liana), collars-off Queen and General, Reaver walk pose sheet.
- World 4 round 4 (climb rocks, Matt: "harder, still safe"; bands.ts timing term) held off the test link; round 5 running.

## Release PR #43 (opened 2026-10-28 ~18:45 ET, Matt: "everything that's in the merge right now can go through, I've tested it")

- ccr at b080ec1: polish, W1 r2, W2 r2, W4 r2, gen2 core, the Dot fix. Gate: tsc clean, suite 1622 pass 0 fail (2 to-dos), build ok.
  After Matt merges: check the deploy run and the APK, tell QA.
- Next: the vine HOTFIX (Matt: "hot fix, deployed sooner than later"): self-swinging vines (helper a72c2052ca6c361b1, branch
  vine-fix) as its own small PR. Preview video to Matt first.

## Running now (2026-10-28 ~18:45 ET)

- Vine hotfix: self-swinging vines (Donkey Kong Jr./DKC style: the vine swings on its own, up/down climbs, left/right only turns,
  timing the jump-off is the skill). Release window Easy >=300 ms, Normal >=167 ms.

- Meeca's stage layout rebuild (Matt: "90% dead time; climbing unneeded, you can run along the bottom; I like the puzzles"): cloud
  session_01FhBbYNdrb48mkEg3GEPojL, branch meeca-layout. Rooms, story and ending unchanged.
- World 6 on gen2 (Matt: start World 6 levels; bosses later, all together): cloud session_01FhBbYNSMYfaErWSvnYgapx (gen2-w6: manifest +
  ground/water/mudflat/purge/gauntlet sections) and session_01FhBbYLaFVRQ535P9f6Pssg (gen2-w6-swing: lianas, dark roots, the
  raise/lower-water room). 6-8 Stilt Climb hand-built later; 6-10 boss later. gen2 core helper (local, gen2-core): liana/vine pieces,
  water/tide zones, dark zone.
- gen2 hook-up (step G) for 5-7 and 5-9: local helper, branch gen2-hook.
- World 3 round 2, World 4 round 3 (cloud). World 1 archived; World 2 done (archive after the next release).
- Promo video brief given to Matt for his own agent (20-25 s, points testers at the live game).

## On the work branch, test link v220 (2026-10-28 ~18:30 ET)

- The polish pass merged: splash, carved title, Pokey and Meeca's painted clips, the shared menu kit, stage wipes. Needs Matt's
  real-phone check (headless: title 13-16 fps for ~12 s after arrival, World Map slow under 4x CPU throttle; a lite mode exists).
- World 1 round 2 (every rule break across 200 rolls fixed), World 4 round 2. Suite 1618 pass 0 fail; build ok.
- PR #42 is LIVE (site published, APK built 2026-10-28 ~17:55 ET).
- Art run DONE: $54.65 of $65 (about $5 kept for re-runs). Gallery tools/art/gallery-w5-10/index.html in the art-hf worktree
  (images git-ignored; rebuild steps in the helper's report), to publish for Matt's picks. Broken: Reaver walk, Iron-Claw jump, Drake
  leap/claw, Monarch flying loops, Flicker's travelling moves (first halves only), collars-off Queen/General. Plan + ledger: ART-PLAN.md.

## Release PR #42 (opened 2026-10-28 ~17:50 ET on Matt's "merge and get this pushed out"; test link v219 is this build)

Worlds 1-4 variety round 1, Jungle Cards, Dot's punch-tip fix, gen2 core (unused). Matt: from here, fixes go out as rolling releases
(each round: test link, then a PR he merges). World 4: 4-3 and 4-7 treated as set pieces without the variety target; one last round
for quiet stretches and difficulty (lead's recommendation A; Matt said keep tweaking and merging).

## Live since PR #41 (2026-10-28): Meeca's stage rebuilt, Easy jump gate, batch 2, W1-2 props, measuring tools, gen2 core

## On the work branch, not live yet

- Jungle Cards match today's game (merged 2026-10-28, test link v217): 7 new cards in a "Met on the road" row, full-body art for
  all 10 guardians, every tip rewritten in touch words, cards in journey order; one 255 KB card sheet.

## On the work branch before PR #41 (now live) (pushed for safe keeping; draft PR #41 tracks it, not a release)

- QA batch 2 + Dot toned down + Gemini jump forgiveness in every world (merged 8ed2c53, fast gate 77/77; cloud full check running).
- World 1-4 art placed (merged 2026-10-28, fast gate passed): every sheet cell used except World 1's nest doors and petal bundle,
  World 2's trough and pink net (follow-up after QA batch 2 lands), and 4 World 5 beetle frames. Looks rotate by roll (artRoll.ts).
- Generator variety tools (merged 2026-10-28): src/game/gen2/variety.ts (ShuffleBag, CooldownQueue, WorldOnce, poissonPlace,
  pickWeighted), not yet used by stages.
- The first-timer bot (merged 2026-10-28): `npx tsx tools/inspect/inspect.ts --worlds 1-4 --firsttimer` (~10 min). Known weak spots of
  the bot: World 2 lily-pad rivers (its life counts there are pessimistic) and tall climbs (572-863 px 'stuck' in 1-4, 2-6, 3-4,
  4-3, 4-6 may be the bot, not the stage): check by hand before acting on those.

- Meeca's stage "On the March North" (merged 2026-10-28, suite 1537 pass): camp, Flicker, five rooms (tea channel in room 4), the
  approved ending; replaces the old 5-M outright.
- The measuring tools (merged 2026-10-28): pacing and difficulty bands in every inspector run (pacing.ts, bands.ts); the 200-roll
  tool `tools/inspect/era.ts` and its guard test rollGuard.test.ts (1-4, 2-6, 3-1 marked to-do).
- The new generator's core (merged 2026-10-28): src/game/gen2/DESIGN.md, types.ts, pipeline.ts, a toy world; all six passes run and
  pass levelCheck; no real stage uses it yet (phase 2 waits on Matt's 4 answers below).
- Easy never needs a full-hold jump (merged 2026-10-28, Gemini G8 now a gate in easyMode.test.ts): Easy widens the landing, adds a
  step or a catch ledge where only a full hold reaches; the jump stays. Easy loads ~0.3-0.4 s slower on desktop (1-6 heaviest).
- World 1-2 art follow-up (merged 2026-10-28): 1-4 nest door, petal bundles as room rewards, 1-6 branch gate, 2-2 trough; World 4's
  anchor peg now drawn on most rolls (search fix). Still unused: World 2's pink fishing net (needs a re-paint), World 3's pressed stone
  plate (no W3 room has a weight plate).
- Known rule breaks for the variety pass (every roll): 1-3 Normal snake hit in the first 5 s; 4-7 opening life at 3.5 s; 4-5
  Sovereign's first strike far from cover on seeds 2-3; 4-3 surge stair press window 67-133 ms; Dot's punch tip repeated in 4-7/4-4.
- Gap files: reference/gaps/W3-4.md, PACING-BANDS-W1-5.md, ERA-W1-5.md. Headline: rolls 96-100% alike in Worlds 1-4 (target 65%);
  the difficulty does not climb (World 3 below World 2, World 5 below World 4; World 2 partly inflated by the bot's lily-pad limit);
  Normal 0.43-0.55 actions a second (Gemini 0.75-1.15); Easy has the same beats as Normal so it gets no rests.
- Docs: GEMINI-PCG-RESEARCH.md, STAGE-RULES.md, GEMINI-LEDGER.md, LEAD-PLAYBOOK.md, this file.
- Meeca's art sheets (meeca-poses, meeca-props) and their cuts.

## Helpers running (each must pass LEAD-PLAYBOOK §4 before merging)

| Helper | Job | Owns | Started |
|---|---|---|---|
| Hugging Face art run (Matt 2026-10-28) | Enemies first, hardest first (bosses, new creature models, animated clips), then what the game still needs, then art and props: reference/ART-PLAN.md inventory with costs, Matt has ~$70 left: plan to $65 ($40 enemies, ~$25 what's left to finish then art and props, ~$5 spare), results in a gallery for Matt's pick (show first, nothing into src/ yet) | reference/ART-PLAN.md, tools/art/ new folder + new specs (branch art-hf) | 2026-10-28 |

| Polish prototype (Matt 2026-10-28: "make it look like a highly polished start screen") | Loading -> title in one piece (no white flash, font swap or pop-in), living title scene, entrances, one button family, menus/cards/map/pause/cleared screens, stage start/end wipes; preview video first (show first) | TitleScreen, StartMenu, PauseMenu, menuParts, TrophyRoom styling, WorldMap, dialogs, CSS (branch polish-ui) | 2026-10-28 |

## Variety pass round 1 result (lead's gate 2026-10-28 ~17:05 ET on the W1+W2+W4 merge: suite 1600 pass 0 fail, build ok)

- Variety 0.35+ met: 1-1, 1-2, 1-5, 1-7, 2-2, 2-3, 2-4, 2-5, 2-7. Low: 1-4 .12, 1-6 .16, 1-8 .06, 1-9 .23, 2-6 .04, 2-8 .09,
  2-9 .19, all of World 4 (.002-.23).
- New/worse rule breaks across rolls: 1-8 quiet 200/200; W2 dead time (2-7, 2-9 200/200; 2-5 148; 2-2 131; 2-4 73); 1-7 dead 105; 1-1 seed 3
  67 ms window; 4-2 33 ms window; 4-6 kid hotspot 6/10.
- Bands (Normal middle, seeds 1-3): W1 ~21, W2 ~44, W3 ~21 (W3 not merged yet), W4 ~22. The climb isn't there yet.
- Test link v218 (2026-10-28 ~17:30 ET): Worlds 1-4 round 1 + gen2 core, with the known issues in its note (Matt: publish to his
  test link as soon as the suite and build pass). Round 2 sent to the W1, W2, W4 builders (rule breaks first, then bands,
  then variety).

## Cloud builders (variety pass, Matt 2026-10-28 "all four worlds now"; each pushes to its own branch, the lead merges after §4)

| Session | World | Branch |
|---|---|---|
| session_01FhBbYNmSk5CrHi81ChVXeV | World 1 (+ layoutMemory: re-roll a roll too like the last) | variety-w1 |
| session_01FhBbYLesoiunAyDUUtL2c6 | World 2 | variety-w2 |
| session_01FhBbYJbmE5kU47zP8gtSsr | World 3 | variety-w3 |
| session_01FhBbYNv8Pbizpa68Y6hdjv | World 4 | variety-w4 |

| session_01FhBbYMcZS6AocKxX16zojF | gen2 A+B: World 5 manifest + 5-7 sections | gen2-w5 |
| session_01FhBbYPF9t6BWgk8Bx6vo9h | gen2 D: 5-9 arena + two puzzle rooms | gen2-w5-arena |
| session_01FhBbYKW3x7bTGysk8cMXNu | gen2 F: curate.ts + seeds.ts (16 per stage) | gen2-curate |

Local: the architect on gen2 piece E (sub-blocks) + the Easy water rule (pipeline.ts, types.ts). Step G (hook-up, old 5-7..5-9 deleted)
is the lead's, after all pieces pass.

Band targets given (Normal middle on bands.ts): World 1 ~20, 2 ~30, 3 ~40, 4 ~50. Pacing: Normal 0.6 actions/s in World 1 rising to 0.75 in
World 4; Easy bursts 6-8 s with 2 s rests.

## Release

- PR #41 merged and LIVE 2026-10-28 18:37 (test link v216): site published (pages run success), APK built (run 40746802703). QA
  session (session_01NC7oJLxL2g1UhhBcGkZBBA) told what to test on the live build.
- Flicker: the art run lists every state he needs for the whole game and makes them in round 1 (Matt 2026-10-28).

## Budget

Matt is on the Max plan (2026-10-28) and wants more helpers in parallel to finish sooner ("even twice as many"): run every
separate job at once, never two on the same files. Still no duplicate or
unasked work (LEAD-PLAYBOOK §7); if the weekly limit gets close, Matt says so and it drops to one world at a time.

## Open decisions for Matt (ask one at a time)

1. Meeca's new lines (camp, Flicker, rooms 1-3, hints) and the new map line.
2. Naturalist medal: still the 11 predators, or all 18 journal cards (the 7 new "met on the road" ones too)?
3. Pell's and the soldiers' journal tips read right?

Step G (lead's gen2 hook-up) must also: run heartsAtFlags and fixPickups on gen2 stages; make easyStage() skip gen2 stages (no double
softening); one per-stage kit chooser (5-9 uses w5ArenaKit); judge World 5's band with the first-timer bot after hook-up (the
inspector-only score can't show it: 5-7 reads ~21 before the first-timer); draw the water-warning sign (placeholder post until art).

Pending for the architect when it resumes: commit c912bc3 finished (full suite + build), then the gauntlet/purge top-up in fillSockets
(quota + 2 on Normal) and Easy's quota at round(0.6 x targetCount) (5-9 builder found 5-9 lays 16-26 of 26 animals).

## Decided today (also on the Docs roadmap)

- The game gets harder world by world: each world has its own difficulty band and the bands climb; inside a world stages may go
  up and down, but none leaves its world's band (World 2 stage 8 never as hard as World 4). Later deaths and replays are expected; Easy is gentler, never empty (still double jumps and the
  tougher moves, softened); QA's "too hard" is sorted into unfair (fix) or hard but fair (keep). STAGE-RULES §1b.

- Keep the whole puzzle room in view upright, even if Pokey shrinks to ~0.5x (not Gemini's 0.72x floor).
- Meeca's Room 4 is the tea channel. World 5's night strips are made in code.
- Slow phones: recordings name the browser; the one-time "open in Chrome/Safari" tip.
- QA: one bot, random levels. Our bots (kid/Easy, adult/Normal, first-timer) run before anything goes to QA.
- Title screen direction approved by Matt (2026-10-28, from the idle videos: "I like the way that it's carved in").
- Title logo: carved into bark, carved in stroke by stroke on the first title of a session (chips, gold glow), shown carved after;
  the ribbon is deleted (Matt 2026-10-28). Title pair get real animation clips from the motion model (no code twitching).
- Dot's water warning (gen2, Easy repeats it after 12 s): "Careful, water! Flick up and over." (Matt chose C).
- Usage warning on Matt's weekly limit (2026-10-28 ~16:20 ET, resets Nov 4 2:00 AM ET): Matt chose to keep everything running (C).
- Generator: 16 checked layouts shipped per stage (Matt 2026-10-28). Easy falls land soft on land; over water a fall still
  costs a life on Easy, with a clear warning before the water (Matt chose B, 2026-10-28). About 30 sections per world (Matt chose A). 5-8 stays hand-built; the generator does 5-7 and 5-9 (Matt chose A).
- Variety pass for Worlds 1-4, all four at once. Push (release PR #41). Flicker's animations for the whole game. The polish pass
  on the title and every menu. Jungle Cards updated to today's creatures.
- Dot toned down. All research in the repo; one rulebook; the lead checks every helper's work before merging.

## QA batches

- Batch 1 (2026-10-28 morning): all fixed, live in PR #40.
- Batch 2 (2026-10-28, Worlds 1-2 on build 39fc3db): 9 items, being fixed (helper "QA batch 2").
- Asked of QA (2026-10-28): run the Matt bot through every stage of Worlds 3 and 4 on the live build; report on Matt's "send".

## Cloud sessions (separate machines)

| Session | Job | Branch | Started |
|---|---|---|---|
| ~~session_01FhBbYPCMx5mTFQdQmEtqey~~ (archived: it stopped before the suite; the lead ran the full gate here instead) | Full check of the work branch at 8ed2c53+ (redirected after the batch-2 merge): tsc, full suite, build, inspector + first-timer bot on Worlds 1-4 seeds 1-3, timed | reads ccr-0d59a91c-oy3imz, pushes nothing | 2026-10-28 17:40 UTC |

## Two tracks (Matt, 2026-10-28)

- **Today's code track:** the four original helpers (QA batch 2, art placement, the 200-roll tool, Meeca's stage) stay on bringing the
  current game up to speed plus bug fixes: when one reports and passes the checks, the lead sends it its next piece of that track
  (it keeps its context, which saves tokens) instead of starting a new helper.
- **Generator track:** the architect, the variety tools and the pacing measures, then seed curation, the validator upgrades and
  World 5's building blocks.

## Waiting to start (they need another helper's result)

- Seed curation (pick each stage's best rolls): needs the 200-roll tool.
- Validator upgrades (per-difficulty jump margins D2, local self-repair D3, room-box size J3, co-visibility F7, min spacing C2): needs
  QA batch 2 to land (it is in levelCheck.ts).
- The generator's World 5 building blocks for 5-7..5-9: needs the architect's design and Matt's OK.

## Queued next (in Matt's order; Matt chose 2026-10-28: the Worlds 1-4 pass starts right after step 1, before the rest of World 5)

1. **Finish what is running** (the five helpers above): LEAD-PLAYBOOK §4 checks on each, the test link, then QA's Worlds 3-4 run
   against the checklist. The jump-forgiveness change must land before any stage is re-tuned.
2. **Measure Worlds 1-4, no building:** the 200-roll tool, the first-timer bot (Easy and Normal) and the inspector on seeds 1-3 over
   every stage -> one gap list per stage against STAGE-RULES (roll sameness, rule failures across rolls, new-player hurts and stuck
   spots, Dot pacing, unused art). Show Matt the list before building.
3. **The variety pass**, Worlds 1+2 together, then 3+4 (at most two building helpers): two or three real versions of each stage's
   main sections chosen per roll, a shuffle bag and cooldown for pieces and decor, mirroring where it fits, curated best rolls from
   the 200-roll results (ledger C1, C3, C4, C8, C10); fix the step-2 gap list; place the remaining art (World 1 nest door, petal
   bundle). Proof: rolls 0.65 alike or less (diversity >= 0.35) and no roll breaks a rule.
4. **Easy truly easier, and pacing measured** across Worlds 1-4: wider landings, softer pits, fewer enemies, a per-difficulty
   jump margin (ledger D2, F1); action rate, burst length, tension curve and minimum input window in the inspector (A6, E2-E4, F5).
5. **QA and Matt:** a full QA sweep of each pair of worlds against the checklist, Matt on the test link, release on his "push".
6. Then: the rest of World 5 (5-1..5-5 dead time, 5-6 "Where She Ran" hand-built), the new generator on 5-7..5-9 then Worlds 6-10,
   Flicker's tiered hints (F6).

## The current QA checklist (sent to the QA session 2026-10-28; keep in step with STAGE-RULES)

Report each finding with the stage, the moment (s), upright or sideways, Easy or Normal, and the rule number below it breaks.
1. Opening seconds: anything that can hurt in the first ~5 s of plain walking.
2. Tip before hazard: a hit or a fall that comes before Dot's (or Flicker's) tip that teaches it.
3. Plain walk: a step, lip or dip that stops a plain walk or plain jump; falling back into the same dip twice.
4. Jumps: a jump that needs a perfect timing or a full hold on Easy; a ledge you clearly reached but slid off.
5. Quiet stretches: more than ~4 s with nothing to do (only petals on flat ground counts as nothing).
6. Look-alikes: a stretch that feels the same as another stage of the same world, or as the last time you played it.
7. Puzzle rooms: can't see the piece and what it acts on together upright; a puzzle that costs a life; a hint that gives it away;
   a room you can walk past without solving; a carried thing you can't carry without jumping.
8. Dot: speaks in the first seconds, repeats a tip you already did, lines closer than ~10 s, lines over ~10 words, a tip left up 20 s+.
9. Goals: a count that can't be met fairly on Normal (87.5% petals, all rescues, 75% predators); totals that disagree.
10. Art: a prop that pops in late, a missing state (a pressed plate that doesn't look pressed, a bell that doesn't swing).
11. Device: frame rate, freezes, and the Device column's browser part (an in-app browser, "framed", software drawing).
12. Anything a 7-10-year-old would not understand or would find unfair.

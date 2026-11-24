# TEACH-11 REPORT: 1-1's double-jump line before the tall steps on every roll; the first-appearance gate (R-165.427)
Engine member (fresh), Opus 5.5. Started 2:04 PM ET (date, TZ=America/New_York). Base t-eng-27 90552d3ec. Branch t-eng-27-wip-teach.
Method used: engine card day one + gates.md "adding a check" (planted first). Lessons applied: D50 (defaults, fresh device), D19 (the gate
calls the game's code: RealPlay, laidAsks, droppedOnTips/helpAllows, coachWanted), D130 (lay order, never x order; direction from the
route), D115 (every run on a chattr-frozen tree), D119 (no heredoc in a commit chain), D126 (suite + CI tool line), D43 (no stage id).

## 1. Done-items
1. **The size (step 1).** LAID on every roll: 161/161 listed seeds x both settings in the first section that needs a double (and P36's
   two live rolls as built here). SAID late on many. The walk (teachFirstScan.ts `walkSaid`): the brisk route through Dot's real queue,
   fresh device, dotHelp's default (Normal Tips, Easy Help), the route's moves done; "on time" = shown before the first double ask.
   | on time / late (never) | base 90552d3ec | fix |
   |---|---|---|
   | listed 161, Normal (Tips) | 122 / 39 | **161 / 0** |
   | listed 161, Easy (Help) | 60 / 101 | **161 / 0** |
   | live 40, Normal | 30 / 10 | **40 / 0** |
   | live 40, Easy | 22 / 18 | **40 / 0** |
   None "never" with the moves counted; a stricter first count (no move ever done, so each move line held to its 12 s cap) had base
   Normal 38 on time / 118 late / 5 never, fix 152/9/0: the cap, not the fix, made those 9 late (they are on time with moves counted).
2. **The cause and the fix (step 2).** W1's teach sections lay their lesson lines (coach.jump, hint.1-1.gaps, hint.1-1.double:
   w1.ts TEACH_LINES) as PLAIN tips: W1's teachTips names only 'traps', 'bare', 'hint.1-1.bank'. On Tips a plain line that can wait
   starts no sooner than 30 s after the last line started (dotGuide.ts TIPS_GAP_MS; Help 15 s): seed 15050 (w1-bank-double-teach, the
   testers' tall bank) sent it at x 5450, showed it at x 7595 (32.6 s = the petals line's 2.6 s + 30 s), ~1,900 px past the bank at
   x 5698; worst 3,155 px (seed 33616). A player stuck at the bank with put-backs waits it out with no line (P36: left at 40 and 46 s).
   Fix at the lay rule, general (pipeline.ts fillSockets): every tip of a section whose template `teaches` a mechanic is laid as a teach
   line (StageHint.teach: Tips keeps it, it skips the 30 s gap, waits only for a clear moment); a story tip keeps its story kind. Every
   other world already listed its teach-section tips in teachTips, so only 1-1's three lines change kind. No stage id, seed or x.
3. **The gate (step 3).** tools/engine/teachFirstScan.ts `--check` (storyTipScan's twin): every listed stage, every proven seed, both
   settings, fresh touch phone: each mechanic Dot teaches with a line is laid in the first section that shows it, as a teach line,
   not dropped on Tips, before its first ask. Base: 322 misses / 322 1-1 rolls; fix: **0 / 2,822 rolls** (13 stages; 17 min beside
   the suite). Test 7/7: four planted reds + the walk (1-1 seeds 15050, 9013, 9652, late on the base, on time; laid plain, late: RED).
   Wired: gates.yml 'rolled' (step + tool line), gates.md 8e.
4. **Landing (step 4): BLOCKED on the lead's ruling (PUSHBACK.md here).** `seedlist 1-1 --check` fails first-run.drift: 1-1's
   first-run lock hashes proto.hints; only proto.hints moved, and with the teach mark off the head gives the recorded hashes exactly
   (firstrun-lock.txt). lockall (lockall.txt): 84/102 unchanged, 18 moved, proto.hints only; lines named in PUSHBACK.md/kindcheck.txt
   (15 World 6-8 lesson lines Tips dropped are now said, 4 of them locked-shrine lines). Suite (frozen 78a2c5d4e): 4,102: 4,095 pass,
   3 todo, 4 fail = pacerLay :1542/:1543 (inherited, WARN-412) + ciTests (tree predates the wiring) + teachTips.test (old rule;
   re-pinned) -> both green on frozen cac4b678b (34/34 with library.test + teachFirstScan.test). CI tool line (frozen 78a2c5d4e):
   355: 342 pass, 1 todo, 12 fail = WARN-412's 11 inherited (wheelChannel x4, wheelRide x2, firsttimer, riverRide x4) + library.test
   thorn plant (old rule; re-planted, 2/2 on cac4b678b). tipwalk, storyTipScan --check, registrycheck, tierBots 9/9: exit 0.
## 2. Polish check
- reference/qa-reports/TEACH-11/1-1-15050-double-line-{sideways,upright}.png: the real page (dev server of the fix), fresh touch phone,
  Normal (Tips by default), 1-1 seed 15050 (the tall bank that came 1,900 px late on the base): Dot's "Flick up again midair to jump
  twice." on screen, the bank ahead of him, readable both ways, nothing clipped. Rough (my shooter's pin, not the game):
  sideways, Pokey stands ~60 px above the grass; re-shoot from a walk before Matt sees it.
## 3. Pushback
- Landing blocked: 1-1's first-run lock needs the lead's re-record ruling (PUSHBACK.md). Gate cost: every seed = 17 min under
  load in CI 'rolled' (packet: every roll); `--seeds 20` (~2 min) is the lead's call.
- My first count of late lines was wrong (the probe counted no move as done); corrected before any number left this branch.
## 4. Suggestions (outside my walls)
- Critic: tools/inspect/dotPace.ts drops a hint's teach/warn/story flags (engineGuideLine with `{ dot: true }` only): pass GuideOpts.
- Engine: `walkSaid` as a sweep over every listed stage (`--walk N`), once the route finder is proven on Worlds 2+; ~1 s a walk.
- Lead: storyTipScan/teachFirstScan read LISTED stages only; Worlds 3-8's lines are judged by no gate (this fix found 15 dropped).
## 5. Unresolved
NOT landed on t-eng-27: waits the first-run re-record ruling. EXACT NEXT STEP: PUSHBACK.md "Ask" (edit firstRun11.ts, seedlist
1-1 --check frozen, `git push origin cac4b678b-or-later:t-eng-27`, a fast-forward). Over the two-heavy-run cap twice for ~5 min (stills, head re-runs).
## 6. Method update
gates.md 8e. Add to methods/stage-fix.md: "a line's KIND sets WHEN it is said (a plain tip waits Tips' 30 s gap); storyTipScan proves
Tips keeps it, teachFirstScan that it is a teach line before its first use, walkSaid the moment. A Dot probe must count moves done."
## 7. Turnover note
reference/handoffs/engine-core.md §0zq-teach written (top entry), commit eed92ae4c (rewritten again with the corrected cause in b75056ba8).

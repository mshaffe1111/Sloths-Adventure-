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
   not dropped on Tips, before its first ask. All stages: **0 misses over 2,822 rolls** (13 listed stages x every proven seed x 2), frozen 78a2c5d4e; 17 min while the suite shared the CPU. Its test (7/7) plants four reds (the teach after a section that
   uses it; past the first double in its own section; laid as a plain tip; not laid) and walks the moment: 1-1 seeds 15050, 9013, 9652
   (late on the base) on time on both settings with the fix; laid as a plain tip, late (RED). The fit test is RED on the base
   ("laid as a plain tip") and green with the fix. Wired: gates.yml 'rolled' (the step + the test in the tool line), gates.md 8e.
4. **Landing (step 4).** lockall: PENDING (re-running base 90552d3ec -> fix 78a2c5d4e; expected: 1-1 `proto.hints` only). Suite: PENDING on frozen 78a2c5d4e (3,628 run so far): reds so far = ciTests :677 (that tree predates the gates.yml wiring; re-run on the head), pacerLay :1542/:1543 (inherited, named by WARN-412), teachTips.test :17 (pinned the OLD rule; updated in 3b4ff8257 to the new contract, red on base, 2/2 green), 2035 todo. CI tool line: PENDING (queued after the suite, same frozen tree). tipwalk / storyTipScan / registrycheck /
   tierBots: PENDING (queued). seedlist 1-1 --check: PENDING (after the lock). Landed on t-eng-27: NOT YET (waits on the lock, the suite, the CI line and seedlist; by 4:00 PM ET or handed over).

## 2. Polish check
- reference/qa-reports/TEACH-11/1-1-15050-double-line-{sideways,upright}.png: the real page (dev server of the fix), fresh touch phone,
  Normal (Tips by default), 1-1 seed 15050 (the tall bank that came 1,900 px late on the base): Dot's "Flick up again midair to jump
  twice." on screen, the bank ahead of him, readable both ways, nothing clipped. Rough spot (the shot, not the game): sideways, Pokey
  stands ~60 px above the grass. The shooter pinned him to the floor the line's band picked; the game never stands him there.
  Re-shoot from a walk to the spot if the lead wants a clean frame for Matt.

## 3. Pushback
- The gate over EVERY proven seed (2,822 rolls) costs 17 min under load (est. 8-10 alone) in CI 'rolled'. The packet asks for every
  roll, so it is wired that way; if the job budget can't take it, `--seeds 20` (about 2 min) is the lead's call, not mine.
- My first count of late lines was wrong (the probe counted no move as done); corrected before any number left this branch.

## 4. Suggestions (outside my walls)
- **Critic, tools/inspect/dotPace.ts:** it calls engineGuideLine(text, id, { dot: true }) and drops the hint's teach/warn/story flags,
  so its pacing under-reports teach and warning lines. Packet: pass GuideOpts through onGuide's 4th argument (as the probe here does).
- **Engine, the walk as a sweep:** `walkSaid` runs in the test on three 1-1 rolls; a `--walk N` mode over every listed stage (each
  mechanic's line SHOWN before its first ask) needs the route finder proven on Worlds 2+ first; ~1 s a walk.
## 5. Unresolved
Lock, CI tool line, tipwalk/storyTipScan/registrycheck/tierBots, seedlist 1-1 and the landing were still running at report time (named above).

## 6. Method update
gates.md 8e. Add to methods/stage-fix.md: "a line's KIND sets WHEN it is said (a plain tip waits Tips' 30 s gap); storyTipScan proves
Tips keeps it, teachFirstScan that it is a teach line before its first use, walkSaid the moment. A Dot probe must count moves done."
## 7. Turnover note
reference/handoffs/engine-core.md §0zq-teach written (top entry), commit eed92ae4c (rewritten again with the corrected cause in b75056ba8).

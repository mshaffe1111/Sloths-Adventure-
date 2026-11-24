# TEACH-11 REPORT: 1-1's double-jump line before the tall steps on every roll; the first-appearance gate (R-165.427)
Engine member (fresh), Opus 5.5. Started 2:04 PM ET (date, TZ=America/New_York). Base t-eng-27 90552d3ec. Branch t-eng-27-wip-teach.
Method used: engine card day one + gates.md "adding a check" (planted first). Lessons applied: D50 (defaults, fresh device), D19 (the gate
calls the game's code: RealPlay, laidAsks, droppedOnTips/helpAllows, coachWanted), D130 (lay order, never x order; direction from the
route), D115 (every run on a chattr-frozen tree), D119 (no heredoc in a commit chain), D126 (suite + CI tool line), D43 (no stage id).

## 1. Done-items
1. **The size (step 1).** The line is LAID on every roll: 161/161 listed seeds x both settings, and both of P36's live rolls as built
   here, in the first section that needs a double. It is not SAID in time. Probe: the brisk route through Dot's real queue (DotSay +
   GuideQueue), fresh device, each setting's default (Normal Tips, Easy Help); "before" = shown before Pokey reaches the first double ask.
   | before / late / never | base 90552d3ec | fix |
   |---|---|---|
   | listed 161, Normal | 38 / 118 / 5 | FIX_LN |
   | listed 161, Easy | 87 / 74 / 0 | FIX_LE |
   | live 40, Normal | 11 / 29 / 0 | FIX_VN |
   | live 40, Easy | 22 / 18 / 0 | FIX_VE |
2. **The cause and the fix (step 2).** W1's teach sections lay their lesson lines (coach.jump, hint.1-1.gaps, hint.1-1.double:
   w1.ts TEACH_LINES) as PLAIN move tips: W1's teachTips names only 'traps', 'bare', 'hint.1-1.bank'. A plain tip waits out Dot's calm
   gap behind the line before it; on seed 5033 (w1-bank-double-teach, the testers' tall bank) it was sent at x 5253 and shown at x 7441,
   ~1,900 px past the first tall step; on 5 Normal seeds it went stale and was never shown (P36's "never shown"). Fix at the lay rule,
   general: pipeline.ts fillSockets lays every tip of a section whose template `teaches` a mechanic as a teach line (StageHint.teach:
   kept on Tips, skips the calm gap, waits only for a clear moment); a story tip keeps its story kind. Every other world already listed
   its teach-section tips in teachTips, so only 1-1's three lines change kind.
3. **The gate (step 3).** tools/engine/teachFirstScan.ts `--check` (storyTipScan's twin): every listed stage, every proven seed, both
   settings, fresh touch phone: each mechanic Dot teaches with a line is laid in the first section that shows it, as a teach line,
   not dropped on Tips, before its first ask. All stages: GATE_ALL. Planted reds (teachFirstScan.test.ts, 5/5): the teach after a
   section that uses it; past the first double in its own section; laid as a plain tip; not laid. The fit test is RED on the base
   ("laid as a plain tip") and green with the fix. Wired: gates.yml 'rolled' (the step + the test in the tool line), gates.md 8e.
4. **Landing (step 4).** lockall: LOCK_LINE. Suite: SUITE_LINE. CI tool line: CI_LINE. tipwalk / storyTipScan / registrycheck /
   tierBots: OTHER_LINE. seedlist 1-1 --check: SEED_LINE. Landed on t-eng-27: LAND_LINE.

## 2. Polish check
STILLS_LINE

## 3. Pushback
None on the packet. One note: the packet said "no stage id ... in engine code": the fix names none (the rule reads `teaches`).

## 4. Suggestions (outside my walls)
- **Lead/Content, W1 data:** teachTips for World 1 is now redundant for teach-section tips; leave it (harmless) or trim in Content's
  next w1.ts packet. No engine change needed.
- **Critic, tools/inspect/dotPace.ts:** it calls engineGuideLine(text, id, { dot: true }) and drops the hint's teach/warn/story flags,
  so its pacing under-reports teach and warning lines. Packet: pass GuideOpts through onGuide's 4th argument (as the probe here does).
- **Engine, a 'said' gate:** promote the probe (reference/qa-reports/TEACH-11/saidprobe.mts) to tools/engine/saidwalk.ts --check:
  every listed stage's first 20 seeds, each teach line SHOWN before its first ask on the brisk route; ~1 s a walk.

## 5. Unresolved
UNRESOLVED_LINE

## 6. Method update
gates.md 8e added. methods/stage-fix.md or dispatch-packet.md should say: "a line's KIND decides WHEN it is said: a plain tip waits out
the calm gap; a lesson line is laid as a teach line. storyTipScan proves Tips keeps it; teachFirstScan proves it is a teach line laid
before its first use; only a walk through Dot's queue proves the moment."

## 7. Turnover note
reference/handoffs/engine-core.md §0zq-teach written (top entry), commit TURN_LINE.

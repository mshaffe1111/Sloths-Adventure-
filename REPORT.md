# EN-F report: engine-audit fixes, game-wide first, and R-165.125. t-engine-fixes on t-engine-guards @b3e8db15, HEAD 16065562 (code)
**Method:** each finding's audit test (or a new one) into src/, red on b3e8db15, root fix, green; one commit per finding. Four
sub-helpers in worktrees (saves, help, audio, things); a Critic read every helper commit (9 items sent back and redone) and then the
owner's (found A-07b, A-12b: fixed). Method file: reference/methods/audit-fix.md. Main JS 3,982,859 -> 3,973,767 B.

## R-165.125 (Matt: too loud, effects most, music a little; the bars do little until nearly off) FIXED e2a1c380 + 16065562
- Cause, measured through the real chain: the bars were linear gain AND sat before the master compressor (-18 dB, ratio 3.5): the
  old effects bar at 50% cut 3.9 dB of loudness, at 25% 9 dB. Now each tenth of a bar is 4 dB (0 = off) and the louder bar is applied
  after the dynamics: 50% cuts 16.8 dB, both bars at 50% exactly 20 dB. Limiter added (-1.5 dB): the recorded effects alone peak at
  +2.0 dBTP; through the chain the loudest peak is now -0.1 dBFS.
- New-game defaults, through the game's AudioCore: effects bar 100% -> 80% (-8 dB): peak -0.1 -> -4.2 dBFS, RMS -16.2 -> -22.6 dB
  (-6.4 dB; at the top they sat 1-3 dB over the music's loudest moments, now about 5 under). Music bar 100% -> 90% (-4 dB): peak
  -0.5 -> -4.5 dBFS, RMS -10.6 -> -14.6 dB (-4.0 dB). Saved bar positions are kept (quieter on the new curve below the top).
  Numbers and scripts: reference/qa-reports/R-165.125/. Matt judges by ear on his phone; nothing re-recorded.

## 1. Controls and physics (owner)
- A-04 FIXED fb8af5f3: one take-off for press, coyote and buffered jumps (webs, spores, crumble timer, mushroom kept).
- A-02 FIXED by the base (a0760620); c18f0225 proves one jump height at 60 Hz/30/22/20/15 fps through the real loop.
- A-05 NOT A DEFECT since R-165.116: the cap is 330 px/s at any rate; the audit's "per drawn frame" fix, planted, put his head
  70 px under the HUD at 15 fps (31 at 30). 60bb4aee pins the rate.
- A-03 FIXED a8445f81 (every set-back makes crumbled platforms whole). A-07 FIXED cbd890d9 + 02a012ce (one way back to a flag
  restarts the chase, 7-6 too; no death under the Game Over card: lives went to -14; a flag before the chase gives the fresh chase).
- A-06 FIXED f065f2a5 (paused = one still frame; Chromium 1-2 both ways: still, still after a turn, moving on resume, 0 errors).
- A-12 FIXED 50aa5880 + 7565bcd6 (ends when 20 of the last 60 frames fail). A-14 FIXED 6549823d + 8710a04a.
- Input leads: ghost press 6549823d, held thumb at start fa90bc26 FIXED; input-loop-clock FIXED by the base. Entrance tap eb2acf5a.
## 2. Saves and Play Store (saves helper)
- C-04 f77b0df5, C-01 e00540b2 (gate scene own key, SAVE_VERSION 2, old saves moved; a game past 10-10 before then sees the card
  once more), C-08 a5c9d058 (+ every screen has a Back owner): FIXED. saves#1 NOT REPRODUCED (fixed by the base, 6b0c6ff3).
- FIXED: #10 c94f649c (a failed Load rolls back; needs more free room than before), #2 01585d70 + fbc628e3, #3 3d81cda6, #8 ef3768a6 +
  086e7126 (sound settings are now the phone's), #9/C-05 db7dd5ed, #7 7d52c6fe, #5 aa2962e9 + 30973e44, #11 f59e72e0 (clipcheck opens
  stories and run cards), #12 27bb0aa7 + 41379d31; leads newgame-leaks d07a90ed, hydrate-and-summary aa58987e, load-not-atomic (#10).
## 3. Help and teaching (help helper)
- C-03 5d8031ca, C-07 d5c9415b, C-09 bde542d1, C-10 2f44ce8b + 008c8d53, C-11 bd161b0b, C-12 b708c5f9 FIXED; C-06 NOT REPRODUCED in the
  game (a new engine per run already forgets; e400dec2 pins it). Puzzle leads FIXED: P-05 2edfe2b8, P-06 f8f99c15, P-03 a5bf69b4.
## 4. Audio, things, bosses, worlds
- Audio #1-#11 FIXED (c8ff5c08 + e983a2a5, 2eeb6179, 6ba4efaf, 01f36e3c, 9ebeb31b, 0b798974, 3f1b150d, 5417e5b1, 4799269a, fba1208f,
  e9ad589a). #1 is Java (AudioFocusPlugin), compiled against stubs only: needs a phone check (a podcast keeps playing when the game
  opens muted; another app's music silences it, a tap brings it back; nothing over a call).
- Things FIXED: #1 55193421, #2 f9ed7044, #3 e09dcc1e + e80cf630, #4 5b3b2875 + cc4ec25a, #6 acd324c1, #8 2b8c8fa3, #11 b73c9d3b,
  #12 d11df3ae. #5 = saves#3, #7 = A-07, #10 = A-03.
- Leads FIXED: boss phase-3 arena 51e51232, boss Easy bar 6016013b, W5 respawn stillness cdd64975, puzzle log softlock 22418081.
## PARKED
- A-17 (WebGL); A-08/A-15/A-16 (cleanup); C-02, C-13, A-09 (player words / data); A-10 (needs a device); A-11 (needs a perf
  measure); things #9 (8-1's bat run uses the eagle's bush lines: World 8 needs its own lines and a bat cry); things #12b (R-5.23);
  audio #4's 13 unplayed pieces (content call) and STINGS.bossAppear (a test asserts it); saves#10's silent write failures and
  saves#5's Normal hold prompt (new words); usePWAInstall (product call). One stage only: 8-4 lantern resume, 5-M sapling, 4-6
  ratchet, 9-10 gradients, 7-4 goal text. Not attempted (time): boss-first-tell, save-meeca-tips-never-kept.
## For the lead to see (no new words anywhere)
- Venom Fang's Easy bar: 4 wider segments, not 6 (qa-reports/EN-F/easybar-*). "Dot said" label "Flicker:" (was "The petal:"; players
  see "Flicker" already). The save summary leaves Thornbark out (counting him: your call); a 0.9.5 save now counts 5-M (41, not 40).
- Pre-existing, not from this branch (same on b3e8db15): upright, the lives badge "x3" sits inside the boss name ("VENOM3FANG").
## Checks (each run once on a pinned head; results in the commit log of this report)
- e80cf630 (every audit fix): full suite 2,762 tests, 0 fail (the known 4-3 TODO); seedlist 1-1 PASS (200 seeds); lock 102/102 stages
  unchanged vs b3e8db15; tierBots 7/7; build, chunkcheck, artcheck, knowncheck PASS; drawcheck PASS; clipcheck PASS (83 known, none
  new); kbdcheck PASS. e2a1c380 (+ R-165.125): tsc, full suite 2,765 tests 0 fail, build (main JS 3,973,767 B, -9,092 vs base),
  chunkcheck, generality PASS. 16065562 (two defaults): tsc, the 207 sound tests, generality; buildcheck PASS (p95 115 ms).
  roadmapcheck fails only because this clone is shallow. Not checked: audio #1 on a real Android phone (the steps are above).
- Method update: reference/methods/audit-fix.md (new): pinned worktrees for long runs, one suite on the merged head, no pkill by
  pattern, plant the audit's own "fix" before taking it (A-05), real key shapes in tests, a Critic on every helper commit.

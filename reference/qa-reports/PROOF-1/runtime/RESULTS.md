# PROOF-1 item 4: the live runtime pieces, head d0276817 vs main 585ef376 (0.9.6)
Auditor's tools only (no production code touched). Builds: the deploy builds (BASE_PATH=/Sloths-Adventure-/) served statically,
head :8801, main :8802. The engine is reached in the SHIPPED bundle through React's fiber (rtlib.mjs PROBE): no dev hooks.

## (a) frame loop: game time = real time
- synthloop.mjs (load-free: the bundle's own engine.loop() fed synthetic vsync stamps, 30 s each): head 0.9984-1.0006 on 60 Hz, jitter,
  59.94, 1-in-5 dropped, 30 Hz 1-in-4 dropped, 48, 75, 120, 144 Hz, slow phone 40-95 ms gaps; stall 250 ms every 2 s 0.942 (by design:
  at most 3 steps a frame, PERFORMANCE-RULES §3.2, engine.ts loop). main 0.9.6: 1.154 (jitter), 1.796 (30 Hz drops), 1.25 (48 Hz), 1.10
  (75 Hz), 1.241 (slow phone): the head fixes a real 0.9.6 speed-up (R-165.116, a0760620, not on main).
- framecheck.mjs (live Chromium, 20 s, stage 4-1, head then main one at a time): run 2 at load 18-31 on 4 cores (void as a perf number;
  valid as game clock vs wall clock): head baseline 1.0003, drop45 1.0002, cpu4 0.982 (23 fps drawn), cpu4+drop45 0.943 (18 fps drawn:
  frames over 100 ms, dropped by design); main baseline 1.385, drop45 1.078, cpu4 1.257, cpu4+drop45 1.141. NOT PROVEN: 30 fps drawn at
  CPU x4 (the container never fell under load 6 before the deadline).
- Live runs logged a frame error on head 4-1 (1 in run 1, 1+3 in run 2): w4Grit.ts:285 W4_PEBBLES[(k*5+cycle)%len] with cycle -1 (sinceWarn's
  idle branch, w4Grit.ts:163, in a drop's first cycle) -> undefined -> piece() reads f.w (w4Grit.ts:50); that frame's draw is lost.
  rocks41.ts: the same drops on main and head (4-1 layouts 0-5: 0-3 drops each, t 0.0-2.9 s): PRE-EXISTING on 0.9.6, not a regression.
## (b) saves
- 0.9.5 fixtures regenerated from tag v0.9.5-37 with saveFill@3e9c47779: byte-identical to src/game/fixtures (genuine).
- savetrip.ts (head code): 0.9.5 mid / after-5M, 0.9.6 finished (453 entries) / 34 finds, head finished (880) / 34 finds: every file
  loads, 0 entries lost but the intended: 0.9.6 sloth_story_g10 -> t10 (C-01) and the sound keys dropped (EN-F saves#8); a second trip
  is identical; the phone's own sound settings survive a Load (soundkeep.ts).
- saveupgrade.mjs (browser): a 0.9.6 / 0.9.5 / 34-find phone opened by the head build: map right (102 cleared, 306 stars on the finished
  game), 0 entries lost (g10 -> t10 only); Save/Load "Copy save code" pasted into a fresh phone: 0 save entries differ; 0 page errors.
- DEFECT saveCopy.test.ts: SaveLoadDialog.tsx:157 still tells the player the file holds "your sound settings"; it no longer does.
## (c) the clock: bit-identical vs main
- FINAL (clockcompare-final.log): Math.random seeded the same, renamed/new flags left out (logHome, tried, isTold/told, mode), the repo
  path cut: 102/102 stages, 600 steps, gameTime + vineClock identical and all 3,762 field comparisons identical at every hashed step.
  (A field still for its first 30 steps is hashed at steps 0-29 and the last step only.)
- first pass: clockdiff.ts + clockcompare.py: the real engine (realPlay.ts) on every stage (102), 600 fixed steps standing still, every engine field
  hashed each step: gameTime and vineClock identical on 102/102; 3,762 field comparisons, all identical except fields that differ from step
  0 by a renamed or new flag (stuck/stuckStep told->isTold, kit logHome/tried, help.mode, arrivals = the repo's own path) and the bosses,
  whose moves are rolled from Math.random (bossAI.ts:103): with Math.random seeded the same on both sides the 10 bosses and 4-D are
  identical for 600 steps (clockcompare-seeded.log).
## (d) offline: offlinecheck.mjs: SW precaches 1,039 entries (every JS file); offline, a stage of every world (1-1, 2-3 ... 10-3) runs:
  0 failed requests, 0 page errors; stills shots/offline-head-*.png.
## (e) sound: soundcheck.mjs (the real bars, a real tap): defaults music 0.9 / effects 0.8 (main 1 / 1); out gain -4.00 dB at 90%, -8.00
  at 80%, -19.99 at 50%, -29.99 at 25%, -36.00 at 10% (curve: 4 dB a tenth); limiter: a square wave +18 dB over full scale into the
  effects bus peaks at -0.19 dBFS after the limiter (under full scale, 0.19 dB to spare).
## (f) Android Back: backcheck.mjs drives the REAL native path (Capacitor's native-bridge.js + a fake androidBridge; Back fired as the
  phone fires it): title -> "Leave the game?" -> closes; Settings, Save/Load over Settings (top only), How to Play, Satchel, Worlds
  pop-up close; map -> title; stage -> Paused; Paused -> resumes; Game Over card -> map. Same on main. Not driven: a story, a guardian
  card, the victory card (backOwners.test.ts covers them statically).
- DEFECT capThen.test.ts: on the phone KeepAwake.set and AudioFocus.want never reach Android: appShell.ts:34 / audioFocus.ts:12 return
  the plugin proxy from a .then(), the proxy is a thenable (`then` answers as a native method), the promise never settles; the page logs
  '"AudioFocus.then()" is not implemented on android'. KeepAwake: same on 0.9.6; AudioFocus: new on this head (EN-F audio #1).

# Critic's audit of INT-1-1: PASS on t-int-1-1@874f11f6 (code 53bd446a), 11-11 5:25 PM ET
Five heads were seen: 996d0c63 REJECT, 8cf55b8f REJECT, fa5ad9d1 one rule open, 53bd446a / 874f11f6 PASS. REPORT.json has every
find with file, line, rule, evidence and the head that fixed it; a folder per head holds the proof.
## Found, sent to the builder as proven, fixed and re-flown (each one Matt would have met on his phone)
1. Dot's line at 3 was never shown to a player who tries again within 2 s (blinking counted as danger; the 8 s ran out unseen).
   My failing test, helpLadderCadence.test.ts. Now up 0.1 s after it is sent, 8-9 s, at every pace, Easy and Normal.
2. Easy's "Ooh, look! A step. Up you go." came 12.6-14.2 s late when he stopped to look, and the old stuck helper's "This way,
   Pokey! Try over here." came first. Now up 0-0.2 s after the steps grow; nothing else is said; Normal is silent from 3 to the offer.
3. The camera fix snapped the view 39-72 px in one frame on a bounce and 24+32 px on any sideways double jump, in every world.
   Now 11 px an update at most going up; Pokey's top clears the HUD plate by 15-26 px (before the task: 24-25 px under it).
4. Sideways, the step line's bubble covered half of the step it names. Now 0; Dot hovers under the top HUD, clear of Pokey.
5. No help flight ran on the real loseLife. Now all do: 2,898 sweep flights, 0 lives.
6. The builder's report and turnover note quoted older commits. Now restated; its gate line matches my run.
Also checked on the final code: (a) C1@0fc0835a merged; (b) the NO card reads as a jump, both ways; (c) the pad is gap - 100.
## Gates on 53bd446a, every one run by me in a detached worktree (874f11f6 differs by one report line)
tsc PASS. Suite 890 + 875 + 795 = 2,560 pass, 0 fail, 2 old todos (todo markers 3 = main's 3). Build and chunkcheck PASS (main
3,982,660 B, 11,644 spare). artcheck, knowncheck, roadmapcheck PASS. drawcheck PASS. clipcheck PASS (83 known, unchanged from
main). kbdcheck PASS. buildcheck PASS (last, alone). seedlist 1-1 PASS (200, 0 refused). lockall 101/102, only 1-1. tierBots 7/7.
Help sweep: 0 breaches, Easy 1024/1024, Normal 1874/1874, 0 promised-nothing-grew. c1judge PASS (lives 0; rescues 0 middle, expert).
## Play-check on the final code (headless Chromium, 412x915 and 915x412)
- Offer at 12 with real finger taps: the stage holds, her bubble is clear, stray taps do nothing, NO resumes with no stray jump,
  re-ask at 20, YES grows 7 steps, 10 more set-backs never ask again. Rotation with the offer up, both ways: the card stays whole and
  on screen, the stage stays held, the answer works. App backgrounded with the offer up (996d0c63): the pause menu comes up under it.
- The builder's touch flight: gestures, "Flick up and forward to jump." once, Back = no.
- Grown steps and the plank read as part of the place, nothing floats or sinks; first-run screens clean, Easy and Normal, both ways.
## Named, not counted (the lead's rulings or outside INT)
- The seed fruit is 5-8 px under the plate at the bounce's top in 5 of 6 bounces (accepted as named rough); the builder's report
  says "clear at the top", true for one in six.
- Audit A-05: the camera cap is per update, so a late frame of 2-3 updates draws 22-33 px. It is the frame loop's catch-up (Pokey
  moves 2-3 times as far in that frame too) and the old view did the same: not made worse by INT. A-01 is the real defect.
- Audit B-01: stuck at the double-teach wall with no set-back, Dot says nothing in 40 s, on 8cf55b8f and on fa5ad9d1 alike
  (jumping, standing, pacing): quieting the stuck helper did not make it worse.
- The child bot on Normal needs 13 rescues in 40 runs (baseline 8). Nothing here was seen on a real phone.
## Pushback and suggestions
PUSHBACK 1 and 2 were ruled by the lead and are built as ruled. The hollow-log packet is sound. Mine: a browser pace gate for Dot's
lines in 1-1 (wait.mjs and overlap.mjs as pass/fail), so a line that is sent but not shown fails by itself (handoffs/critic.md).

Turnover note: reference/handoffs/critic.md (the Critic's first; rewritten at the end of this audit).

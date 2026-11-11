# Critic's audit of INT-1-1: REJECT on t-int-1-1@8cf55b8f (11-11; first run on 996d0c63, the delta on 8cf55b8f)
REPORT.json has each violation with file, line, rule, evidence and fix. Proof scripts and output are in this folder; `head-8cf55b8f/` is the final head's.

## Open on 8cf55b8f (each one Matt would meet on his phone tonight)
1. **Easy's step line is not there when the step grows.** If he stops to look after the 8th set-back, "Ooh, look! A step. Up you go."
   comes 12.6-14.2 s late (3 runs), and sideways the old stuck helper says "This way, Pokey! Try over here." first (2.5 s), the step
   line 7.8 s after. The builder's pace proof shows 0.2 s only because its put-backs go on after the steps grow.
2. **The camera fix snaps the view, in every world.** Sideways, per engine frame: 39-42 px in one frame on the bounce by the perch log
   (10.8 before), 24 then 32 px on any double jump from flat ground (8.7 before). Pokey's top clears the plate by -2 to 14 px, not 22.
3. **The report and the turnover note are not the final head's**: suite, chunk bytes and c1judge are quoted from older commits;
   engine-core.md has none of the delta's rulings.
Named, not counted: the seed fruit is 4-6 px under the plate at the bounce's top (item d, the lead's call).

## Fixed during the audit (red on 996d0c63, checked green on 8cf55b8f)
- Dot's line at 3 was never shown to a player who tries again within 2 s (blinking is "danger" to her guide): my failing test
  src/game/helpLadderCadence.test.ts. Now up 0.1 s after it is sent, about 9 s, at 1.7 / 2.1 / 4 s paces, Easy and Normal.
- No help flight ran on the real loseLife: now helpLadder11 and the sweep's flights do, and fail on a lostLife.
- (a) C1@0fc0835a merged. (b) The NO card is a mid-leap pose that reads as a jump, both ways. (c) The pad is gap - 100: a 154 px
  plank that reads as a plank; 3868 w1-two-answers is pinned.

## Gates on 8cf55b8f, run by me in a detached worktree
- PASS so far: tsc; vite build; chunkcheck (main 3,981,834 B, 12,470 spare); artcheck; knowncheck; roadmapcheck; todo markers 3 = main's 3.
- RUNNING at the time of the verdict (3:08 PM ET): the full suite (3 shards), lockall, the help sweep --fly, c1judge, seedlist 1-1
  --check, tierBots.test, buildcheck, drawcheck, clipcheck, kbdcheck. This section is rewritten when they end; a red one goes to the lead at once.
- On 996d0c63 (the first head), all run by me: suite 2,550 pass / 0 fail / 2 old todos; seedlist PASS (200, 0 refused); lockall
  101/102, only 1-1; drawcheck PASS; clipcheck PASS (83 known, list unchanged from main); kbdcheck PASS; tierBots.test 7/7;
  buildcheck PASS alone (red at p95 151 ms beside three test shards: a load artefact).

## Play-check (headless Chromium, 412x915 and 915x412, real finger taps on the offer)
- Offer at 12: the stage holds; taps on the scrim and on the menu leaf under it do nothing; NO resumes play with no stray jump and Dot
  says nothing; re-ask at 20; YES grows the steps; 10 more set-backs never ask again. Her bubble is clear when the offer opens.
- App sent to the background with the offer up: the pause menu comes up under the offer; answer, then Resume: play goes on.
- Grown steps (769 E mushroom-bank-teach, 4106 N dip-double-teach, 982 N log-chain-rise, 3868 N two-answers): mossy boulders that
  stand, nothing floating or sunk; they read as part of the place. C2 still owes their own art (the builder named it).
- First run, fresh save, Easy and Normal, both ways: the opening screen, the coach's line and the HUD are clean.
- Stills in INT-1-1/stills/: all 14 looked at. The two step stills are staged (he is put on the step), so they hide find 1.

## Pushback and suggestions: did they hold
- PUSHBACK 1 and 2: ruled by the lead; built as ruled (checked). The hollow-log suggestion is sound (a packet for Engine).
- Suggestion from this audit: a browser pace gate for Dot's lines in 1-1 (wait.mjs as pass/fail), mine to build (handoffs/critic.md).

## Not done, named
- Rotation with the offer up (the browser harness cannot rotate a phone context). Nothing here was seen on a real phone.
- The builder's touchflight.mjs: timed out at start-up on my loaded machine (its fixed 5 s wait); retried when the gates end.

Turnover note: reference/handoffs/critic.md (new: the first Critic's note, seeded from release-clerk.md).

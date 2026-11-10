# The 1-1 fix plan (the lead, 2026-11-09 8:59 PM ET; Matt: "Start fixing 1-1 after test data is evaluated. Make plan and start making change", R-165.84)

Built from the analyst's window report (branch t-w11-analyst, reference/qa-reports/window-2026-11-10/WINDOW.md, pulled 11-09 8:39 PM ET
with the window still open: 95 gen2 1-1 runs by 9 players since 0.9.5; Normal 81 runs / 8 players, Easy 14 / 3). A Critic checked its
six main claims against the code and found them true (two small report fixes are with the analyst as attempt 2; no finding below
depends on them). Every fix has a roadmap number. Money: $75 at most before Matt's next test link, promote included (STATE.md ledger).

## What the players showed
1. Every life lost on Normal was a pit under a raised piece: 7 of 8 players; w1-log-chain-rise 10 lives, w1-mushroom-chain-back 8,
   w1-log-chain 6. Practice does not cure it: the most-practised player still loses about 1 life per 2-3 runs.
2. Taps are read as punches: 1-1 has nothing to punch, yet 475 of 693 punches were followed by a jump within 0.6 s, 9 of 9 players.
3. No help exists for a player set back again and again: one Easy player was set back 152 times in one piece over 22.5 minutes
   (ONE player; the pattern is the child-bot's). stuckHelp watches walls only (engine.ts:4524).
4. Put-backs cluster at the double-jump gaps (canopy-rungs-level, dip-double-teach, double-teach) on both settings.
5. The mushroom bounce is the longest stretch (median 32.5 s) and the most-picked "hardest".

## Test link A (first; engine only, no new art, no layout numbers needed)
| Fix | What changes for the player | R | Who | Waits on |
|---|---|---|---|---|
| A1 | No fall in 1-1 costs a life, on Easy or Normal: every fall sets Pokey back on the ledge he left (the lead's ruling R-165.53, now with the data behind it). Normal's bite starts at 1-2. | R-165.86 | Engine (Fable 5.2, medium), Critic proves | its packet's Critic PASS |
| A2 | Help after repeated put-backs in one piece: by itself on Easy, offered on Normal (R-165.62's per-setting ruling) | R-165.62 | Engine, on the Designer's help.md thresholds | the Designer's PASS |
| A3 | A tap that was meant as a jump is a jump: the touch rule for a tap followed by a jump, decided on the Designer's touch.md | R-165.87 | Designer rules, Engine builds | the Designer's PASS |

## Test link B (second; the re-lay, with Matt's art)
| Fix | What changes | R | Who | Waits on |
|---|---|---|---|---|
| B1 | 1-1 re-laid on the flown reach: the three chains get gaps inside the real single-jump band or a catch road; the double-jump gaps get a practice gap first; fewer or shorter bounce pieces | R-165.72 | Content, Critic proves | Designer, Architect |
| B2 | Matt's art placed: the 91 weekend pieces, the 15 sheets of 11-09, the repainted near strip; one mock-up sheet for Matt's yes first | R-165.85, R-165.72 | Content | cutting and cataloguing |

## Checked, smaller
- The double hint never shown to one player: check tipMemory on a shared device (R-165.88).
- 6 jitter lines, 1 camera jump and 1 blank moment, with seeds, in WINDOW.md §3-4 (R-165.89).
- The recorder is not broken (R-165.58): the 11-07 "impossible" numbers were report maths, fixed in report.py. What is left of
  R-165.58: `move double` counts runs, not uses.
- Step-downs in resolution: 89 of 131 come from one device; fps median 30. No new work beyond R-3.1 (WebGL).

## Order and money
A1's packet goes to a Critic now, then to the Engine member. A2 and A3 follow the Designer's PASS. The promote (gates, the test link)
is counted inside the $75. If the money runs short, Test link A ships with A1 alone and says so.

# ENG-27e PUSHBACK: pacerLay.test 4/4 needs a ruling on the boat's respawn re-placement (a game rule, not mine to change)

Base 580344077 and head d3d1d3f15 (the put-back fix) give the SAME result here: this was on the base, hidden by the test's first failure.

## What is RED
`npx tsx --test src/game/gen2/pacerLay.test.ts`: 3/4. Test 4 fails at "ride-only easy seed 1: 97.1 s against the boat's 97.53 s"
(home toy). On ENG-27d's head the same test stopped at its FIRST assertion (middle Easy seed 2, the put-back now fixed), so the ride-only
assertions after it never ran (ENG-27d's REPORT line 27 names only the middle row).

## The trace (rule 28: every run of this cause, one line each)
| run | fall (frame, x, race clock) | what took him | after the re-placement | result |
|---|---|---|---|---|
| ride-only home Easy 1 | f 4805, x 1725, 92.72 | stood at a log's leading end on the LAST river and went in | respawn x 2055 (the bank before the last river); boat clock 92.75 -> 89.81, 7.7 s left for it; a log at once (a 265 px hop onto it at x 1736), ridden at 80 px/s to the dock in about 7.3 s | WON by 0.43 s |
| ride-only home Normal 2 | f 5390, x 1803, 86.27 | in the last river | re-placed | lost by 0.8 s |
| ride-only home Easy 4 | f 5380, x 1806, 98.83 | in the last river | re-placed | lost by 0.5 s |
| ride-only post Normal 1 | f 5452, x 1794, 116.17 (the boat DOCKED at 103.21) | in the last river | the docked boat is rewound and the race runs again | lost by 0.5 s |
| ride-only post Normal 3 | f 5064, x 1794, 114.47 (the boat DOCKED at 101.38) | in the last river | the same | lost by 0.5 s |
| middle home Normal 4 (head) | f 4691, x 1247, 92.50 | a short hop off log 96's end at x 1353 toward the far bank at 1228 (125 px); it peaked about 19 px over the bank's top and met its side | re-placed with 0.99 s of margin (the 2 s floor cut by the ride-only cap) | LOST by 0.1 s |

## Why (one root)
pacer.ts pacerReplace re-places the boat on every respawn on the race leg: his careful-middle time left, plus
max(share x left, min(floor, left x most)), where `most` is the ride-only bound as a share of the WHOLE leg. Two things follow:
1. **A docked boat is rewound.** Once the boat has docked the race is lost, but a fall after that puts the boat back level with him and
   the race runs again (post Normal 1 and 3: he lost the race 13 s earlier and came within 0.5 s of winning it back by falling in).
2. **After a fall on the last river, the race is one crossing**, and one crossing's log clock is wider than any margin that serves both
   guarantees. The ride-only player's whole extra time is on the rivers (W2_RACE: ride 103 px/s middle vs 87 ride-only), so on one
   crossing he is about as fast as the careful middle when a log comes at once (Easy 1: about 7.3 s against the middle's median 6.8 s).
   To make the ride-only player lose there, the boat's margin must be under about 0.5 s; to keep the careful middle's late fall a win
   (the lead's ruling (b), 11-21), home Normal 4 needed more than about 1.1 s. The cap sits between and fails both.

## Options (the lead's or the Designer's call; my recommendation first)
A. **(Recommended)** Two pieces: (i) a docked boat stays docked: a respawn after the dock does not race it again (an engine defect by
   any reading, planted on post Normal 1); (ii) the ride-only guarantee is judged on runs where he does not fall on the race leg's last
   crossing, and the floor stands for the careful middle (ruling (b) as written). The test's ride-only line then names that.
B. (i), and the ride-only guarantee wins: after a fall that leaves less than one crossing, the boat keeps only the share (no floor).
   Home Normal 4's middle then loses by about 0.6 s (a careful player's late fall can lose the race).
C. (i), and no re-placement at all on the last crossing (the boat goes on): a late fall loses the race for everyone.
I will NOT change the floor, the share, `under` or the flown rates (Designer's numbers) or the test's claims without the ruling (law 22).
Until the ruling I go on with steps 3-5 (the stills and the clip show no respawn; the full set reruns if the ruling changes code).

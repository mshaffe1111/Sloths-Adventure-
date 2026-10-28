# 200 rolls per stage, Worlds 1-5 (2026-10-28, tools/inspect/era.ts)

Run: `npx tsx tools/inspect/era.ts --worlds 1-5 --rolls 200 --html --json` (13 min on 4 free cores). Every roll is built the way the
game builds it on entry (validator re-rolls included) and measured on the inspector's route and beats.

## How alike the rolls are (target: 0.65 or less alike, diversity 0.35+)

| World | Rolls alike | Stages varied enough |
|---|---|---|
| 1 | 97% | 0 of 9 |
| 2 | 100% | 0 of 9 |
| 3 | 96% | 0 of 9 |
| 4 | 96% | 0 of 9 |
| 5 | 83% | 2 of 9 (5-4, 5-6) |

Every roll moves the platforms, but the order of things to do barely changes. Puzzle rooms appear in all 200 rolls; props are
identical in 38 of the 41 hand-built stages.

- One order of things to do across 200 rolls: 1-1, 1-2, 1-9, 2-1, 2-4, 2-5, 2-8, 3-6, 3-9. Two orders: 2-2, 2-3, 2-7, 2-9, 5-1, 5-2.
- 5-6..5-9 read 1.00 in the tool only because `stages.ts` never sets a layout number for them; real players get 62-88% alike rolls.

## Rule failures across rolls, worst first

1. Quiet stretch over 4 s: World 5 82% of rolls (5-6, 5-7 up to 9.8 s, `?layout=753228`; 5-1, 5-2, 5-5 every roll), World 4 28% (4-4,
   4-8 every roll), World 2 19%, World 1 14% (1-6 up to 8.9 s, `?layout=239006`), World 3 11%. 1-9, 2-7, 3-9: one fixed spot each.
2. Level check: 2-6 fails 123 of 200 rolls (an animal near a flag; `?layout=306480`, `37446`, `859523`); its tests don't run the check.
   Not judged by the check: World 1 except 1-7, 2-4, 4-4.
3. Length: 3-1 under 2:00 on 129 rolls (1:54-1:59); 5-8 8 rolls under 1:40 (86 s, `?layout=373777`); 5-6/5-7 12 rolls 1:57-1:59.
   1-4: 18 rolls under 1:40 (82 s, `?layout=217576`), all on hops the level check can't confirm: probably a phantom shortcut, replay first.
4. Kid bot: 4-6 jumps at 54-65% on 4 of 10 rolls (`?layout=729605`); 5-3 ~84%, 5-9 75%, 5-6/5-7 69-71%. Adult bot: none.
5. Look-alikes: the 20 s window threshold 0.28 matches ~97% of everything (useless); use the world's own closest 5% as inspect.ts does.
   Whole-stage action mix over 0.78: 1-1/1-2/1-5 with each other; 5-1/5-2/5-5 with each other.

## Guard test

`src/game/rollGuard.test.ts` samples 10 rolls of every World 1-4 stage; 1-4, 2-6 and 3-1 are marked to-do (delete each line once fixed).

## What the variety pass should do (per world)

- Everywhere: two or three authored versions of each section, picked per roll with a cooldown (gen2/variety.ts); alternative puzzle
  rooms; prop and decor sets rotate with the roll; reject a roll closer than 0.35 to the player's previous one.
- World 1: 1-1, 1-2, 1-5 alternative Develop and Twist sections from a shared pool; 1-6, 1-7 an alternative Twist room each.
- World 2: alternative river crossings (logs, lily pads, raft, stones); the cage puzzle rotates pulley / sluice / bell; decor rotates.
- World 3: 3-1's decor rotation on every stage; alternative glow, pebble and fern rooms.
- World 4: interchangeable patience spots per roll (mist, fern, Dot's knot); two capuchin set-ups for 4-8.
- World 5: 5-4's section-order choice copied to 5-1..5-5; 5-7..5-9 from authored sub-blocks with the quiet rule built in.

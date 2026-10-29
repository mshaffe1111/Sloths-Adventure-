# Standing at a ledge's end (lead's item from the 2-6 QA fix, 2026-10-29)

**The problem.** The footing lets him stand with his middle up to 11 px past a platform's end (about 16 px with the early-stage help). In the QA screenshots that left about half his body past the painted edge: he visibly stood in the air (polish item 3).

**The fix** (commit d1dd30d):
- `engine.ts edgeStepBack`. He is standing still: no steer, attack, duck or push. His middle is past the end of the platform under him, and nothing at that height carries on beyond it. Then he takes a small step back at 70 px/s until his middle is 12 px inside the end.
- His standing picture is 53-57 px wide (`heroSprite.ts`), so about a quarter of him is then over the air.
- At that line he teeters: a slow lean out over the drop and back, about his feet, up to about 3.4° (`heroSprite.ts drawStandard`).
- The numbers are `EDGE` in `physics.ts`.

**What is unchanged:**
- The footing itself, so where he walks off an edge is the same.
- Every running jump.
- Coyote time.
- The landing forgiveness.
- A ledge that carries on at the same height (two platforms side by side) is not an edge.
- A ledge too narrow to step back on is left alone.

**Tests.** `src/game/edgeFooting.test.ts` (4 tests, real engine):
- steps back at either end, and teeters;
- a joined ledge is not an edge;
- walking off happens at the same point as before;
- narrow ledges are left alone.

## Before / after

`shots/edge-sheet-sideways-0.jpg`, `-1.jpg`, `shots/edge-sheet-upright-0.jpg` and `-1.jpg`. Each covers 2-6, plus one stage of each world (1-2, 3-2 to 10-2).

How they were taken:
- Pokey is placed at the furthest the footing allows, past a real ledge end near the start, at layout 7.
- Each shot is 1.5 s later.
- "Before" has the step-back switched off in the page.

What they show:
- **Before:** on most of them he idles straddling the drop. On 2-6 he stands with most of his body past the plank's end.
- **After:** he is on the ledge with only his front edge over it.
- **9-2 is not a fair sample:** a jaguar hit him in both shots, and its "before" placement wasn't standable.

## Reachability

- **The level checker works on its reach model, not the engine.** The step back is engine-only, so it can't change a route the checker accepts. The engine-based reach tests run in the full suite.
- **The inspector's bots on Worlds 1-2 (`tools/inspect/inspect.ts --worlds 1-2 --firsttimer`, seeds 1, 2, 3):**
  - **Kid and adult bots:** identical numbers before and after (dead time, beats, length) on every stage.
  - **First-timer:** finished 46 / 48 / 54 of 72 trials before, against 45 / 47 / 53 after. Mean finish was 169 / 201 / 210 s before, and 169 / 192 / 204 s after.
  - **The three runs that flipped** had only just made it before:

    | stage | before | after |
    |---|---|---|
    | 2-1 Easy | 358 s | timed out at 360 s |
    | 1-7 Easy | 346 s | timed out at 360 s |
    | 2-1 Normal | 341 s | timed out at 360 s |

  - **Nothing that finished comfortably now fails.**
  - **Finding counts move by noise:** plain-walk findings fell by 14 and 13; way-on findings rose by 32 and 6; survival rose by 1 each; no new kind of finding.
  - **The likely cost:** the bot sometimes stands still at a ledge's end before a jump, and now jumps from about 23 px further back.

## Polish check

1. **Painted, not drawn:**
   - The teeter is a small code touch (a lean of the painted standing pose), which STAGE-RULES §4 allows.
   - A painted teeter and step-back pose would be better; the Gemini prompt is below.
2. **Nothing copy-pasted:** n/a.
3. **Art lines up with its collider:** fixed for standing.
   - At most about a quarter of him is now past a collider's end.
   - On 2-6 the plank's painted top is still up to 14 px short of its collider (the other helper's note). Even so, after the step back he stands on painted plank with only his front edge over it (`edge-sheet-*`, 2-6 rows).
4. **Light:** unchanged.
5. **Pokey on model:** the standing pose, leaning at most about 3.4°.
6. **Framing:** unchanged.
7. **Text:** none.
8. **Every move needed:** reach unchanged; see above.
9. **Moments:** n/a.
10. **Motion:**
    - The step back lasts about 0.35 s (`shots/edge-strip.jpg`, 66 ms a frame) and reads as a quick shuffle back.
    - **Rough spot, named plainly:** it plays the forward walk cycle while he moves backward, facing the edge. That is the one place a painted step-back pose would help.

## Gemini prompt (a painted teeter and step back, for Matt)

"Pokey the sloth from the attached character sheet, side view facing right, standing at the very edge of a ledge: four poses in one row on flat grey #808080, the same painted storybook style, outline weight and palette.
1. Teetering forward, arms windmilling out to the sides, weight on his heels, a worried look down.
2. Leaning back to catch himself, one foot lifting.
3. A small careful step backward (still facing right), arms tucked.
4. Settled, relieved, standing upright.

Feet on one shared ground line, the same scale as the standing pose, 1024 x 256."

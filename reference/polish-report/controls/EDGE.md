# Standing at a ledge's end (lead's item from the 2-6 QA fix, 2026-10-29)

**The problem.** The footing lets him stand with his middle up to 11 px past a platform's end (about 16 px with the early-stage help). In the QA screenshots that left about half his body past the painted edge: he visibly stood in the air (polish item 3).

**The fix:**
- `engine.ts edgeOffset`. He is standing still: no steer, attack, duck or push. His middle is past the end of the platform under him, and nothing at that height carries on beyond it. Then he is **drawn** a small step back (at 80 px/s) until his drawn middle is 12 px inside the end (`p.drawDx`, applied in `heroSprite.ts`).
- His standing picture is 53-57 px wide (`heroSprite.ts`), so about a quarter of him is then over the air.
- There he teeters: a slow lean out over the drop and back, about his feet, up to about 3.4° (`heroSprite.ts drawStandard`).
- When he moves or jumps, the picture rejoins his footing at 600 px/s (within two frames), so a run-off or a jump starts from where he really is.
- The numbers are `EDGE` in `physics.ts`.

**Why only the picture moves.** The first version stepped him back for real (commit d1dd30d). That cost 4-4 a liana jump: the engine reach test (`w4RealReach`, seed 1) never reached the shrine, and passed again with the step-back switched off. Drawing him back gives the same look with no change to where he stands.

**What is unchanged:**
- Where he stands, walks off and jumps from.
- Every running and standing jump.
- Coyote time.
- The landing forgiveness.
- A ledge that carries on at the same height (two platforms side by side) is not an edge.
- A ledge too narrow is left alone.

**Tests.** `src/game/edgeFooting.test.ts` (5 tests, real engine):
- at either end his drawn middle settles 12 px inside, he teeters, and where he stands is unchanged;
- moving off the spot, the picture rejoins his footing within 3 frames;
- a joined ledge is not an edge;
- walking off happens at the same point as before;
- narrow ledges are left alone.

## Before / after

`shots/edge-sheet-sideways-0.jpg`, `-1.jpg`, `shots/edge-sheet-upright-0.jpg` and `-1.jpg`. Each covers 2-6, plus one stage of each world (1-2, 3-2 to 10-2).

How they were taken:
- Pokey is placed at the furthest the footing allows (his middle 11 px past a real ledge end near the start), at layout 7.
- Each shot is 1.5 s later.
- "Before" has the step-back switched off in the page.

What they show:
- **Before:** on most of them he idles straddling the drop. On 2-6 he stands with most of his body past the plank's end.
- **After:** on all ten stages, both ways round, his drawn middle is 12 px inside the end and he teeters: he is on the ledge with only his front edge over it.
- **9-2 "before" is not a fair sample:** a jaguar knocked him off the spot.

## Reachability

- **The level checker works on its reach model, not the engine,** and where he stands is unchanged, so no route it accepts can change.
- **Engine reach tests:** 4-4 `w4RealReach` passes again (it failed with the real step-back); the full suite is green.
- **The inspector's bots on Worlds 1-2 (`tools/inspect/inspect.ts --worlds 1-2 --firsttimer`, seeds 1, 2, 3):** FT_RESULTS

## Polish check

1. **Painted, not drawn:**
   - The teeter is a small code touch (a lean of the painted standing pose), which STAGE-RULES §4 allows.
   - A painted teeter and step-back pose would be better; the Gemini prompt is below.
2. **Nothing copy-pasted:** n/a.
3. **Art lines up with its collider:** fixed for standing.
   - At most about a quarter of him is now drawn past a collider's end.
   - On 2-6 the plank's painted top is still up to 14 px short of its collider (the other helper's note). Even so, after the step back he is drawn on painted plank with only his front edge over it (`edge-sheet-*`, 2-6 rows).
4. **Light:** unchanged.
5. **Pokey on model:** the standing pose, leaning at most about 3.4°.
6. **Framing:** unchanged.
7. **Text:** none.
8. **Every move needed:** reach unchanged (where he stands does not move); see above.
9. **Moments:** n/a.
10. **Motion:**
    - The step back lasts about 0.3 s (23 px at 80 px/s) and reads as a small shuffle back.
    - **Rough spot, named plainly:** it slides the standing pose back rather than taking steps. That is the one place a painted step-back pose would help.
    - Moving off, the picture catches up within two frames (20 px a frame); at 30 fps that reads as him starting to walk.

## Gemini prompt (a painted teeter and step back, for Matt)

"Pokey the sloth from the attached character sheet, side view facing right, standing at the very edge of a ledge: four poses in one row on flat grey #808080, the same painted storybook style, outline weight and palette.
1. Teetering forward, arms windmilling out to the sides, weight on his heels, a worried look down.
2. Leaning back to catch himself, one foot lifting.
3. A small careful step backward (still facing right), arms tucked.
4. Settled, relieved, standing upright.

Feet on one shared ground line, the same scale as the standing pose, 1024 x 256."

# qa-fix-w123b: 2-6 plank ends and knots, polish check (2026-10-29)

Before = the branch base (7b8e577, the first ladder's log already in); after = qa-fix-w123b. Layouts 7 (QA item 7) and 1 (QA item 5),
upright 390x844 and sideways 844x390, dev build, real engine. Pokey is placed by the dev hooks; "dead-end" shots hold right for 1.4 s
from 150 px short of a porch's dead end.

| Shot | What it shows |
|---|---|
| `2-6-L1-dead-end-{before,after}-{upright,sideways}.jpg` | Before: a plain walk carries him off the first porch onto the floor (QA item 5). After: the mailbox post at the porch's end stops him by the ladder. |
| `2-6-L7-dead-end-{before,after}-*.jpg` | The same on layout 7. |
| `2-6-L7-plank-end-{before,after}-*.jpg` | Pokey at the furthest the engine lets him stand past a porch's end (his middle 12 px past the collider). |
| `2-6-L7-feet-end{0,12}-{before,after}-*.jpg` | Close-ups of his feet at the collider's end (end0) and at the furthest (end12). |
| `2-6-L7-knots-mixed-after-*.jpg` | Knots vary: mailboxes facing either way, every third a signpost (behind him as he stops against it). |
| `2-6-L7-hop-gap-closed-REJECTED-first-fit-sideways.jpg` | Rejected first fit (before at top, rejected fit below): the plank's top edge fitted to the collider pushed the front edges 40-60 px past each end, and the 55-85 px hop gaps vanished on screen. Caught only in these screenshots, and replaced. |

## Polish check (STAGE-RULES §5b)

1. **Painted, not drawn**: pass. The knots are the World 2 sheet's mailbox and signpost; the planks are the kit's painted plank.
2. **Nothing copy-pasted**: fixed. About 50 knots on a 2-6 roll: mailboxes facing either way and every third a signpost (`knots-mixed`).
   The plank's slanted ends now keep their painted size; before, a long plank's ends stretched with it.
3. **Art lines up with its collider**: partly. **Fixed**: a plain walk no longer runs off a dead end into the air (`dead-end`), every
   knot stands on its porch, and a plank's painted ends sit on the collider's ends on any length: the top edge at most 14 px short, the
   front edge at most 14 px past (before: the top edge 19-22 px short on a 170 px plank, 40-46 on a 330, 77-94 on a 600). Hop gaps still show
   (a 55 px gap keeps 27 px of air at its front edge; the rejected fit closed them). **Not fixed, named plainly**: at the furthest he can
   stand (his middle 12-13 px past the collider, the engine's footing) about half his body is past the painted top edge, before and
   after alike (`plank-end`, `feet-end12`). The plank art can't fix this alone: its top edge is 15% of the picture shorter than its
   front edge at each end, so any fit either leaves him over air at the furthest stance or closes the hop gaps. Two ways to finish it:
   (a) the engine's footing (`engine.ts`, not this helper's file) letting him stand only about 4 px past an end; or (b) a plank painted
   flat-on with square ends (Gemini prompt below).
4. **Light**: unchanged (the bank village's own light).
5. **Pokey on model**: unchanged.
6. **Framing**: the first ladder is on screen from the start upright (43e86f0); the knots don't move the camera.
7. **Text**: no new lines. Dot's climb tip goes up while he stands by the first ladder (`qaW123.test.ts`). In these shots her bubble
   sits in the top half, clear of him.
8. **Every move needed**: a knot never shortcuts the climb (the level check removes any that saves a move), so the climb still needs
   every ladder, rope and hop.
9. **Moments**: n/a.
10. **Motion**: unchanged.

## Gemini prompt (for (b) above)

"A single wooden plank walkway section for a 2D side-scrolling platformer, seen straight from the side (no top-down perspective, no
visible top face): three weathered grey-brown boards lashed together with rope near each end, square-cut ends, the top edge perfectly
flat and level across the full width, the boards' ends flush with each other at both ends, the same painted storybook style, outline
weight and palette as the attached World 2 riverbank-village sheet. Transparent background, about 600 x 120 px, the plank filling the
width edge to edge."

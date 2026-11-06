# 1-1 near strip, repainted (art director, 2026-11-06; lead's OK 9:35 AM ET, cap $1, spent ~$0.36)

**Not in the game.** For engine-core to move in after the lead looks: copy `w1sun2-near-A.webp` to `src/assets/backdrops/w1sun2-near.webp`
on the branch that carries the w1sun2 set (art-1-1-sunrise-2 / engine-core). B is the backup take.

Why: the old near (a copy of w1sunrise-near) was a pile of fallen logs with flat cut ends at Pokey's floor height and two painted
mushrooms; through a pit gap they read as standable ground and as a mushroom in the air (KIT-AUDIT.md L9; lead-now.md). The new one is
round moss boulders, root tangles and monstera/fern bushes: no flat tops, no mushrooms, no logs. Fresh paint, no inpainting.

- Start: `tools/art/near11/starts.py` (the old strip's own ground band + Matt's rounded W1 keeper cuts, open ground at both ends).
- img2img near11-N (s62/s68, seeds 7/23, 8 takes) then native pass near11-hd: `tools/art/near11/make_spec.py`, jobs in
  `tools/art/near11/jobs.txt`. Keyed takes in `reference/prop-sheets/qa-notes/near11/keyed/`.
- Finish: `tools/art/near11/finish.py` (hf-backdrops.md step 3: cut2, defringe --ink --px 2, haze 0.08 into w1sun2-far). 2818x1736,
  149 KB (budget 250 KB).
- Stills: `before-after-sideways.png` (left old, right new; 1-1 at 50% and 80%), `before-after-upright.png` (old, new, old, new at
  20% and 50%). Shot with 1-1 locally on the w1sun2 set; nothing of that local switch is committed.

## Polish check
- Mushrooms: gone (before: two, one reading as floating at the 50% pit). PASS.
- Flat log ends / standable-looking tops at floor height: gone; every top rounded. PASS.
- Reads as backdrop, not floor: hazed into the far light (mean colour 78,75,55 -> 48,57,51), darker and cooler than the play layer. PASS.
- Seam: keyed full width with a 256 px join, open ground at both ends of the start. Not yet checked across 3 tiles in play: engine-core's
  stills after the move should include a wide pan.
- Rough spot, named: on the far left of the upright 20% still a bush reads as a dark green blob at small size; minor.

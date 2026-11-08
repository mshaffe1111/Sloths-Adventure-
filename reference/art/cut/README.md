# World 1 keeper cuts (art director, 2026-11-06). NOT in the game

Matt's Gemini keepers (reference/art-incoming/gemini-2026-11-05, README KEEP lists: sheets 07-22, 36, 38, 39, 41, 42) cut into clean
transparent PNGs. **Integration waits on the lead**: footing lines must match the drawn tops, and the drawcheck budget.

- Rebuild: `python3 tools/art/w1keepers/cut.py cut reference/art/cut` (picks in `tools/art/w1keepers/picks.json`; `segment <dir>`
  draws the numbered item maps the picks refer to). Needs scipy (`pip install scipy`).
- `manifest.json`: every piece, its sheet and item, size, job, world tags, status (keep/hold) and notes.
- `contact-dark.jpg` (dusk purple: a pink fringe would show) and `contact-green.jpg` (leaf green: a grey halo would show).

## Counts
111 pieces: 107 keep, 4 hold (08/09 carved totem and paw pole: story call; 10's rope-swing log and golden fruit: design calls).
By world tag (keep): W1 106, W3 58, W6 32, W8 28, W7 24, W4 23, W10 15, W2 12, W5 6, **W9 0** (nothing here is volcano kin).

## World tags (by KIN, never the same picture everywhere)
A plain tag (`W2`) means the piece fits that world as painted. `W3~darker` means the same shape **re-tinted** to that world's palette
and given its own dressing (the lead's rule in the Gemini README). Kin used: wood pieces W6~grey-wet, W8~blue-night; rocks W3~cool-dark,
W4~slate, W7~sand-stone; thorns W3~cool-dark, W10~dead-grey; the earth walls W3~darker; bushes W5~orchid. Made things (rope-lashed posts,
frames, plank ledges) carry W2; the lantern is W2 only (no made things in the home forest).

## How they were cut
- Magenta sheets: soft key on min(r,b)-g; de-spill of the pink fringe; any pink-tinted pixel (red and blue both above green; browns have
  blue below green, so wood is safe) is neutralised. Checked at 2-3x on dusk purple: no pink fringe on the thorns, bushes, posts, ropes.
- Grey sheets: matte by distance from the sheet's own border grey plus saturation (the sheet grey is neutral; stones are warm-tinted),
  edge pulled in 1 px. Checked at 2x on leaf green: no grey line on the walls, trunks, grass, grey boulders.
- Pieces the matte joined were split by box: 41's trunk from its foot corner, and **41's lantern erased** off the trunk (W2 only); 39's
  wall C from the big overhang ledge drawn touching it.

## Rough spots (named, not hidden)
- `w1-rope-thin`: a pink cast is painted INTO the strands (not fringe; despill cannot fix it without greying the rope). Re-roll.
- Sheet 10 pieces (vine columns, ropes, monstera and flowering vines, fungus vine) are small, about 150-200 px: upscale (HF, cents, lead's
  OK) or re-roll at 3 per image, as the README says.
- `w1-trunk-fungus-B`: Gemini cropped the crown at the sheet's top edge; it needs canopy art above it in a stage, or a re-roll with
  headroom.
- 23 pieces are under 200 px (pebbles, grass tufts, hanging roots, small ledges and moss rocks, forked stumps): fine as dressing, too
  small to be a main platform.
- Set pieces (`w1-wall-earth-A/B/C`, `w1-trunk-fungus-A/B`): each ledge or shelf top must be measured and become a platform at exactly
  that height; the section is built around the piece.
- Style: these are a little flatter and cleaner than the painted kit; they still need a show-first still next to the kit before going in.

## Not cut (and why)
- Rejects (README): 10's skull on a rope, 12's grey wire tangle, 15's floating stone ledge, the cross-shaped frames on 13 and 14.
- Re-roll list (perspective, README): 17/18 hollow logs, 19's diagonal post, 20's roped log and X-frame, all of 21 (top-down lily pads)
  and 22 (angled logs in water), 13's diagonal lashed log, 08's rope beam (three-quarter view).
- Duplicates on the wall sheets 38/39/42 (caps, roots, grass, lanterns already cut from 36/41) were left out.

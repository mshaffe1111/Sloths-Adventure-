# World 9 swings and rooms: polish check (gen2-w9-swing, 2026-10-29/30)

Stills: contact-upright.jpg (390x844) and contact-sideways.jpg (844x390): 9-3 the first chain, a later chain, the bucket room; 9-5 the
plates room; 9-8 the lift room. Walks: polish-clean's walk.mjs over 9-3, 9-5, 9-8 both ways (frames every half screen, clips).

| # | Item | Result | Proof |
|---|---|---|---|
| 1 | Painted, not drawn | PASS: chains, bolt, bucket, pulley painted (HF); lever, plates, gate Matt's W9 sheet; plank, lintel, shelf slab the W9/W10 bridges sheet; posts the W9 hex column. No code shapes. | 9-3-chain1-*, 9-3-bucket-* |
| 2 | Nothing copy-pasted | FIXED: posts are whole tiles of the jointed column (no stretch); the lintel's middle is different cuts and lengths, flipped (walk: one piece x123 before). The chain repeats link by link, as a chain does. | 9-3-chain3-upright |
| 3 | Art matches what it is | PASS: chains hang from a bolt under a lintel on two posts, one per ledge (nothing floats); the shelf stands on two posts; the pulley on a post with an arm. | 9-3-bucket-*, 9-5-plates-* |
| 4 | Light fits | PASS: dawn/day under the ash; irons graded to the kit's charcoal. | all |
| 5 | Pokey on model | not changed by this work | |
| 6 | Framing both ways | PASS: each room fits upright at half scale (test); the chain and its lintel show upright, the lintel is above the screen sideways (the chain reads from its top). | contact-* |
| 7 | Text out of the way | Room entry lines short; see rough spots for the "vine" wording | |
| 8 | Every move needed | PASS: the quick route swings every chain on every roll tested (40 rolls of 9-3); each room fails without its key piece. | w9Swing.test.ts, w9Rooms.test.ts |
| 9 | Moments | the room door/lift moves with the kit's sounds; the hot plate's cracks glow pressed | |
| 10 | Motion smooth | chains swing on the engine's clock; lintel pieces are static | walk clips |

Rough spots (named, not hidden):
- Dot's swing lesson says "Flick up into the vine to grab it." at World 9's chains (shared line, dotLinesData lesson.swing.grab / help.swingGrab;
  proposed World 9 wording: "Flick up into the chain to grab it.").
- Dot's teal ring and arrow (the game-wide guide marker) still show in the rooms: polish-dot's removal.
- The walk's detector counts "line" spots on the posts' straight sides and joints and the chain links' edges (basalt columns and chains are
  straight-edged); left as is.

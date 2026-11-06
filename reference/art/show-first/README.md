# Show-first: 4 World 1 cuts beside the painted kit, in a real W1 frame (art director, 2026-11-06)

Pictures only, nothing in the game. Frames: 1-5 at 80% along (long flat ground), from `tools/art/kitaudit/shoot.mjs` (upright with a 12 s
settle so the stage card is gone). Composited by `tools/art/w1keepers/showfirst.py`: each piece's bottom 4 px into the grass line, sized in
Pokey heights (~58 px sideways, ~70 px upright). **Sizes are my pick, not the engine's**: judge style, not scale.

- `sideways-A-kit-vs-cuts.png`: kit log, kit stump, kit boulder | NEW wide stump, rock arch, thorns.
- `sideways-B-wall.png`: kit stump | NEW earth wall A | NEW thorns | kit boulder.
- `upright-A.png`, `upright-B.png`: the same pieces upright.

## My read
| Piece | Verdict | Why |
|---|---|---|
| Wide stump (13) | PASS | same outline weight, moss and light as the kit stump; reads as something to stand on |
| Rock arch (15) | PASS | its moss cap and stone match the kit boulder; reads as a hide-under |
| Earth wall A (36) | PART | the shape and ledges work, but its soil is warmer and redder than W1's cool bank soil right under it, so it pops forward. Fix: a small cool/desaturate tint in code (free), then re-shoot |
| Thorn bramble (12) | PART | style matches, but brown on brown at this size it reads as dry twigs before it reads as danger. Fix: draw it bigger (1.1-1.3 Pokey), prefer the denser tangles (thorn-tangle-big, bramble-long), and give it a lighter thorn-tip rim (not red); judge again in play |

Overall: the style passes (a little flatter and finer-lined than the kit, close enough side by side). That clears the sheet-10 upscale
question on style; it is still the lead's OK on cost (reference/art/HF-SPEND.md).

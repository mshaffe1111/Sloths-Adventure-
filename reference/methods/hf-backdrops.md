# Method: painted backdrop strips (far, sky, middle, near)
Last proven: 2026-11-01, branch hf-backdrops2. Produced 11 new full sets and 20+ redone or fixed strips; every world now plays 4 sets.
Owner of the last update: the hf-backdrops2 art helper. General Hugging Face know-how: `hf-art.md`.

## When to use it
A new look (mood) for a world, or a strip that fails the bar.

## Steps

**1. Sizes.** All WebP in `src/assets/backdrops/<stem>-<far|sky|mid|near>.webp`, each under 250 KB, none over 4096 px.
- far: opaque, 1302 tall, about 2160-2640 wide.
- sky: RGBA, 513 tall, the far strip's width, fades out over its last 5%. Drawn above the far strip upright only.
- mid: RGBA, 1302 tall, about 2100 wide.
- near: RGBA, 1736 tall, about 2850-2900 wide.

The strips must look right both upright (412x915) and sideways (915x412).

**2. Far + sky in one picture.**
- Make the spec with `tools/art/hfbackdrops/make_spec2.py F`: text to image at 1792x1200, "the upper third open sky, the lower two
  thirds the far scenery", 3-5 seeds.
- Prompt for depth: dark silhouettes in the middle distance, rich colour, strong contrast (see the hf-art pitfalls).
- Pick a take, then `process.py tallkey <take.png> <stem>` (joins the ends seamlessly; 1792 -> 1472 px wide).
- Run the native pass to 1760 tall on black (`process.py hdspec ... <stem>-tall`, then set `bg` to [0,0,0]).
- Then `process.py tallsplit <stem> <hd dir>`: the bottom 1302 rows become the far strip, the rows above become the sky (via
  `hfbatch/skycut.py --tall`).

**3. Middle and near strips.**
- Starts: `starts2.py <out> <name> <src stem> <mid|near> <grade> <seed> remix [trim]`. This takes a paste-up of the world's own strip
  in a new order, graded (day/dawn/dusk/night/cave/storm/ember), on magenta.
- Put the starts under `reference/prop-sheets/qa-notes/hf-backdrops2/starts/` and push.
- img2img: middle s68/s76, near s62/s68, 2 seeds (`make_spec2.py <round> <commit> k n`).
- To fix an old strip's crown tops, run `crown` mode at s52/s60, then `matchold.py` back to the old colours.
- Pick: `process.py keyfull <take> <stem> <part>` (keys out magenta at full width, joins the ends, drops floating pieces).
- Native pass: `process.py hdspec`, then `finish <stem> <part> <hd dir> [mode] [haze]`. Finish cuts the strip, inks the edges and
  grades it into the far strip's light with `haze.py`.
- Haze: middle 0.09 (not 0.18: that washed out W2 evening, W8 dawn and W10 gale), near 0.08.
- Set `TOPFADE=0` for a middle strip whose crowns are whole. The default 7% top fade flattened the W1 crowns into one row.

**4. Depth** (`depth.py`).
- If the upright frame reads pale and empty, raise the far strip's contrast (`far <stem> 1.2-1.35`, sky included).
- Darken the middle strip (`mid <stem> 0.85`) so there is a clear value step far -> middle -> near.
- Measure: `lumspread.py <before> <after> <stages>`. The std dev of the top 60% of the upright frame must be at least 0.8x the
  before. (The lead's bar, 2026-11-01.)

**5. Wiring.**
- A set is used by naming it in `src/game/stageBackdrops.ts` `FAR_BY_STAGE`. It plays its own mid/near where they exist, else its
  world's.
- Alternate the sets so no two neighbouring stages share one, with the world's early light first and its late light last.
- Stage 10 (the lair) keeps the world's own set. World 5 has its own table (`w5Backdrop.ts`).
- `stageBackdrops.test.ts` checks the neighbours and the FAR_ONLY list: update it.

## The bar
- No seams (look at the join: tile the strip twice), no bands, no notches, no floating pieces.
- Crowns whole; colours in the world's light; not paler or emptier than what it replaces (lumspread).
- Pokey clear in every shot.
- Examples at the bar: `hf-backdrops2/w3-before-after.jpg` (3-2, 3-8) and `w8-before-after.jpg` (8-5, 8-7).

## Checks before reporting
1. `npx vite --port=4301 &` (and the release in a `git worktree` on 4302 for the befores).
2. `SIZES=412x915,915x412 PORT=… node tools/art/hfbackdrops/audit.mjs <dir> <stages…>` for every stage whose set changed, before and
   after. It places Pokey 45% along and waits for the game after any dev-server reload.
3. `python3 -I tools/art/hfbackdrops/sheet2.py <before> <after> reference/prop-sheets/qa-notes/<job>/` makes one sheet per world.
4. Look at every shot like Matt on a phone, then run `lumspread.py`.
5. Push the sheets as each set lands: the lead reviews every 30 min.
6. Then the CLAUDE.md gates. drawcheck takes about 11 min; the full test suite about 20 min.

## Pitfalls we already paid for
- **Pink keyed water (W2 near, 10-31):** the start's half-transparent river let magenta through. starts2.py drops alpha < 235 on
  near strips.
- **Squared notches (W4/W6 near, 10-31)** where paste-up pieces met edge to edge. starts2.py overlaps the pieces with ragged joins
  over a ground band. A soft alpha ramp instead blended paint into magenta: purple smears.
- **Cut or faded crowns** (old W1/W3/W6/W7 middles): the repaint keeps a straight cut. starts2.py gives every run of columns that
  touches the top a round crown blob; crown mode repaints in place.
- **A hard canopy band (W8 middles, 10-31):** the old strip's flat faded canopy came back as a band. Trim the top 25% (`trim 0.25`)
  and drop the fade (alpha < 245).
- **Washed out (W2 evening haze 0.18, then W8 dawn, W10 gale, W1 sunrise on 11-01):** less haze, depth.py, richer prompts.
- **A day sky in a cave world (W3 crystal, 11-01):** check the world's light. Grade with `darken.py <stem> top bottom`.
- **Clear skies under World 10's rain:** w10night and w10after are held until the rain ends. W10's sets must be storms.
- **Narrow strips** (1272-1650 px) repeat twice across a sideways screen. Use keyfull at full width.

## Tried and didn't work
- Text to image for middle/near strips (no key).
- Upright skies for old far strips whose scenery runs off the top: tallstart at s30-s58 and painted sky donors (spec-K + skydonor.py,
  s30) both left cut trunks under a soft band (2026-11-01, `hfbd2-S0/S1/S2` in the bucket). Paint far and sky together.

## To try
- Repaint those 9 far sets far + sky together (hf-backdrops2/NEXT.md).

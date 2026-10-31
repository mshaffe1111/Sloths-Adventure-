# World 8: where I stopped (2026-10-31, 9:30 PM ET, the lead's stop)

Branch w8-merge. Release 1 (PR #58) shipped the World 8 rebuild (RC dfe030ac). Everything since is wave 2, for the 11 PM release:

- **Decor** (w8DecorArt.ts, one engine call behind the boughs): the generator's scenery and W8_DECOR sets drawn from w8b, w8c and w8c-b,
  w8var and the World 8 kit, plus the buttress corners at banks' ends over a gap. Hanging pieces are dimmed and never drawn beside a
  raised bough; the shelf fungus is cut to its shelf; bank-b is sunk to its mossy top.
- **8-5/8-9:** every other moon flower is w8b's bouncy-leaf (bounceArt.ts asks w8DecorArt for World 8's odd platforms).
- **8-1 loft:** big seed pile + w8roost-b's small pile + seed-pod-open; every other roost branch from w8roost-b.
- **Glow mushrooms:** painted on HF (hfb-w8glowcaps-g1, tools/art/hfbatch/glowcut.py, w8glowcaps.webp).
- **8-6 pit hole:** World 9's shared fix ported by hand (pipeline.ts pitUnder deepen and the death line); gen2Pits.test.ts.
- **8-2's rope blooms:** the fifth 8-2 theme, on World 9's 'rope' place rule plus two World 8 additions (the gap carries `back`; a
  `soft` option). 8-2 re-curated at 0.560 (was 0.375). 11 of the 16 shipped rolls are rope rolls.

Art-use: tools/art/artuse.mjs (from w1-4-sheets) lists no World 8 entry now. Drop these from the allow-list: kitAtlasData#8.buttress,
#8.bankEnd, w8b#bouncy-leaf, w8var#bank-b, #perch-b, #fill-b.

## Open, in order

1. **The rope on Normal, for a first-timer.** The bot clears 8-2 Easy (shrine twice), but on Normal it stops at the sealed door
   (90 and 88 of 94 blooms) and loses lives at the ropes: every rope gap is a heart fall (16 of 16), so each life is five missed grabs.
   Watch a person cross one; if they miss too, lower ROPE_RISE for World 8's ropes or teach the grab (a Dot line, Matt's approval).
2. **Bands:** Easy reads above Normal on several stages (8-2: Easy 38.2, Normal 20.1). It's the measure (tools/inspect/bands.ts:
   Easy's dead time always 0, Easy's windows judged against its own stricter gate), and it goes to next week's game-wide tuning.
3. **8-2's mix:** 11 of 16 shipped rolls are rope rolls. The curation picked them for variety (each is far from every other theme).
   If Matt wants the old themes seen more, cap the rope share in curate (a per-theme quota, as the room quota) and re-curate.
4. **Draw cost:** drawcheck passes, but its notes show 400 px paintings drawn at about 100 px (shrunk over 2.5x). Pre-scaled copies
   of w8b/w8c/w8var would cut that if a phone stutters.

## Using the rope piece in another world (3 lines)

- A section piece `bank(key, w, { kind: 'rope', after: '<ledge before>', gap: [470, 550] }, { landing: true })` lays the far ledge
  `gap` px past `after` and hangs a required rope between them (rope.ts ROPE_RISE over the ledges, ROPE_OVERLAP over each).
- The gap under it is a liana's: a soft pit climbing back to `after` (Easy, or `soft: true`), or the world's own fall on Normal
  (World 8's heart fall where its manifest sets `heartFalls`). levelCheck proves the crossing from stage.ropes.
- Keep the gap ≥ ROPE_MIN_GAP + 90 (the rule enforces it), never mirror the section, and give the section room in its width test
  (+300 px a rope).

# World 8: where I stopped (2026-11-01, branch w8-rope2, for the 6 PM ET release)

**w8-rope2 (2026-11-01): 8-2's rope blooms are back, fair on Normal.** Branch w8-rope2 from release-0.9.2 (w8-rope was already in its
history; the release cut 83fbade8 had taken the sections and the rope curation out, w8-rope2 puts them back).

- **Why the first-timer lost hearts at the ropes:** not the grab window, not ROPE_RISE, not the bot's timing. The real engine catches 94
  of 96 thumbs on every rope (flicked 30 px past the edge to 90 px short, held 0.06-0.4 s, steer kept or dropped: `tools/inspect/ropeProbe.ts`).
  The misses were all one thing (`tools/inspect/ropeTrace.ts`): a flick ~150 px early tops out short of the rope's near end, and on the
  way down his hands passed back through the rope, because the engine caught a falling Pokey only with Up held (a flick-up thumb has let
  go by then). On seed 1 that was every heart fall: ropes 3 and 14, three each.
- **Fixed in the engine** (`engine.ts updateRope`): a `required` rope (hung over a gap: falling past it is always a fall) is caught falling
  too. Ropes that are not required keep the old rule. It reaches World 3's and protoStage's required gap ropes as well, only more forgiving.
- **A bloom under each rope was out of reach:** the pickup reach (34 px) was measured from 20 px over his feet, 86 px under the rope, so the
  bloom the petal pass lays 26 px under the rope (drawn at his arms) was never picked up hanging: 5-11 a rope roll, all counted in the
  94-bloom goal. Hanging, he now reaches from his middle (`rope.ts HANG_PICK`, 50 px).
- **No snap at the grab:** a rope caught past its end slid him 30-40 px onto it in one frame; now over 3 frames (`rope.ts ROPE_SLIDE`).
- **8-2's mix:** `curate --theme-cap w8:rope-blooms=0.5` (a per-theme quota, checked before the bots like the look-alike cap). Re-curated
  (300 rolls, `--apart-near`): 8 of 16 rope rolls (layouts 1, 5-11), variety 0.620 (rule 0.35). World 8's other stages build
  byte-identical (8-1, 8-3..8-10, layouts 1-16, Normal and Easy).
- **No new Dot line.** The rope is not new in World 8 (Shimmy Rope is learned at 1-3 and required from 1-4); on 8-2
  the engine's own rope lesson ("Slide your thumb to creep along.") still comes up on the first rope.
- **The first-timer after the fix** (3 trials a roll on Normal, 1 on Easy): 0 heart falls at the ropes on every run. Easy reaches the shrine
  on every roll tested. Normal: the rope rolls reach the shrine with the blooms 21 of 24 runs (roll 10 short twice, 89 and 92 of 94;
  roll 9 once, 93); seed 1 99/98/96. The blooms left are on low knots the bot's flick carries him over, not at the ropes.
- **Stills and clips:** `reference/qa-reports/w8-rope2/` (`tools/art/rope/rec-82.mjs`).

Art-use: tools/art/artuse.mjs (from w1-4-sheets) lists no World 8 entry now. Drop these from the allow-list: kitAtlasData#8.buttress,
#8.bankEnd, w8b#bouncy-leaf, w8var#bank-b, #perch-b, #fill-b.

## Open, in order

1. **The bloom goal on Normal, 8-2, every theme (not the rope).** The first-timer never turns back for a bloom, and on low knots its short
   flick carries him over the bloom (43 px over it, reach 34). So it falls 1-5 short of 94 on some runs: roll 3 (high blooms) 2 of 3
   runs, roll 10 (ropes) 2 of 3, roll 9 1 of 3. The shipped pre-rope 8-2 did the same on seeds 1-3 (91, 85, 88 of 94). A person turns
   back when Dot says "Still N night blooms"; decide with Matt whether the goal (87.5%) or the bot's knot hop is the thing to change.
2. **Roll 2 (8-2's fungus steps, layout 2) on Normal:** the first-timer lost 5, 15 and 15 lives (two runs over 5 minutes, one at the
   sealed door), in the 60 px pits between fungus steps across the whole stage. Not a rope roll; it shipped in the w8-rope set too.
3. **Bands:** Easy reads above Normal on several stages (8-2: Easy 38.2, Normal 20.1). It's the measure (tools/inspect/bands.ts:
   Easy's dead time always 0, Easy's windows judged against its own stricter gate), and it goes to next week's game-wide tuning.
4. **Draw cost:** drawcheck passes, but its notes show 400 px paintings drawn at about 100 px (shrunk over 2.5x). Pre-scaled copies
   of w8b/w8c/w8var would cut that if a phone stutters.

## Using the rope piece in another world (3 lines)

- A section piece `bank(key, w, { kind: 'rope', after: '<ledge before>', gap: [470, 550] }, { landing: true })` lays the far ledge
  `gap` px past `after` and hangs a required rope between them (rope.ts ROPE_RISE over the ledges, ROPE_OVERLAP over each).
- The gap under it is a liana's: a soft pit climbing back to `after` (Easy, or `soft: true`), or the world's own fall on Normal
  (World 8's heart fall where its manifest sets `heartFalls`). levelCheck proves the crossing from stage.ropes.
- Keep the gap ≥ ROPE_MIN_GAP + 90 (the rule enforces it), never mirror the section, and give the section room in its width test
  (+300 px a rope).

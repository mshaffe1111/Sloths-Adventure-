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
- **The catch, narrowed** (the lead's World 3 check): game-wide, the falling catch also caught Pokey on a lower rope in 1-4/2-6/3-4/4-1's
  zigzag climbs (first-timer rescues 0-2 -> 5-10). A falling Pokey is now caught only by a required rope whose own ledge he last stood on
  (`rope.ts ROPE_FROM`); those stages are back in base's noise. `src/game/ropeCatch.test.ts` (3 of 5 fail on release-0.9.2; the climb
  guard fails on the broad rule).
- **The sealed door (live in 0.9.2):** measured again with the fixed first-timer (bot-fix 877a819b, merged): 25 of 25 runs reach the
  shrine with the blooms, at their shipped 34 px. The old bot's flat-ground hops caused the misses; the 52 px float tried this afternoon
  is reverted (it added 0-7 blooms a run, not needed).
- **The fungus steps (layout 2: 5-15 lives on Normal):** each step stood over the void (a short hop went under the next bracket); now each
  stands on a bough trunk to the ground (`w8.ts fungusTrunks`). A stair's foot was shorter than a running jump off the top with the deep
  gap after it; now 340-370 px (fungus-tall 250-270, inside the 1800 px rule) with a knot past it (`FUNGUS_FOOT`, `footKnot`;
  fungus-glide unchanged). 8-2 and 8-5 re-curated. `w8Fair.test.ts` (all 3 fail on release-0.9.2).
- **8-2's mix:** `curate --theme-cap w8:rope-blooms=0.5` (a per-theme quota, checked before the bots like the look-alike cap). Re-curated
  (300 rolls, `--apart-near`; again after the fungus change): 8 of 16 rope rolls (layouts 1, 5-8, 10, 12, 13), variety 0.620 (rule 0.35). World 8's other stages build
  byte-identical (8-1, 8-3..8-10, layouts 1-16, Normal and Easy).
- **No new Dot line.** The rope is not new in World 8 (Shimmy Rope is learned at 1-3 and required from 1-4); on 8-2
  the engine's own rope lesson ("Slide your thumb to creep along.") still comes up on the first rope.
- **The first-timer, final build** (`reference/qa-reports/w8-rope2/bots-fixedbot-no-float.txt`): 0 heart falls at a rope on every run; Easy reaches the
  shrine on all 16 layouts. Normal, with the fixed bot: every layout reaches the shrine with the blooms
  (0-3 lives; the old bot's 10-18 on the gap and roost layouts were its own flat-ground hops).
- **Stills and clips:** `reference/qa-reports/w8-rope2/` (`tools/art/rope/rec-82.mjs`).

Art-use: tools/art/artuse.mjs (from w1-4-sheets) lists no World 8 entry now. Drop these from the allow-list: kitAtlasData#8.buttress,
#8.bankEnd, w8b#bouncy-leaf, w8var#bank-b, #perch-b, #fill-b.

## Open, in order

1. **1-2 on Normal ends at the sealed door** (seeds 1-3: 70/95, 71/99, 70/92 petals; found by w8-rope2's classifier, handed to the
   lead): most of what is left is high petals on upper boughs the first-timer never climbs to. The goal counts petals off the natural
   path, or the bot never takes upper routes: check with a person's run.
2. **Petals flown over in Worlds 1, 3, 5** (the classifier on x-2: 5-2 19, 1-2 and 3-2 5 each; every other world 0-2): petals.ts, every
   hand stage; not changed (score only outside harvests). The fix would be World 8's (a petal on a bough floats at his head).
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

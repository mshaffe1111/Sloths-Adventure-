# BUILD-22 STEP 0: the w2Arc22 plan, beat by beat against reference/design/2-2.md (origin/t-pitch-b), sent 4:15 PM ET 11-15
Base: t-build-22 = origin/t-eng-22 + t-fix-21 + t-art-w2 (conflicts: w2.ts W2_PADS vs W2_LIANA, both kept; engine-core.md header, both kept).
Step 1a pushed (001395a0): the rise toy's Easy reds were two bot faults (padRead lost the bank a pixel past its edge; read the breath on
the walk up), both fixed; all 12 toy runs GREEN; plants now judged over 4 variants against the same run with the skill on (all 3 red off).

## The form: 2-1's (w2Arc21.ts): its own kit 'w2-22' (kitLib22 over World 2's kit), one brick a beat, an Easy twin where Easy differs
Graph code: `A T Pw R Pg X R W R Pf M R S L E` (2-2.md's node string `A Tw1<:#soft Pw1>:#soft R Pg1< Xw2<:#soft R Wp1>:#water R Pf1<
Mp2>:#water R Sw1< Lp2>:#water E`). Pad rows in a PADS_22 table over W2_PADS (data). Lines LINES_22 verbatim from lines-2-2.md
(origin/t-story@50da9e58), held by a test. Flags and hearts by Matt's rules (verdicts), not the table.

| # | Beat | Brick: pieces / data | Easy twin |
|---|---|---|---|
| 0 | A arrive | wide bank (900+ px), tip `pads` 800+ px before beat 1's pad | same |
| 1 | T first pad | pads row `first`: weight, [big], gap 60, safe (splash-back) | same (x1.5) |
| 2 | Pw keep moving + flag after | row `hop`: weight, [small x3], gap 70, safe (#soft), petals ride all 3 | same (x1.5) |
| 3 | Pg garden path | banks + stones (2-1's bank/rock helpers), petals on the stones | same |
| 4 | X there-and-back + heart | **ENGINE GAP, see A** | |
| 6 | W the breath + flag before | tip `breathe` 800+ px before; row `breath`: beat [small, small, stone, small, small], gap 70, up 1.8 / shiver 0.6 / under 0.6, deep | safe row, x1.5 |
| 8 | Pf plank walk | jetty planks (2-1's canopy_bridge banks) over a reed bed | same |
| 9 | M both kinds + heart | pads (weight [small, big, small], gap 120, petals on the SMALL pads: the greed) -> bank -> W2_RIVERS deep log lane -> bank -> beat pads [small, small] | rows safe, x1.5 |
| 11 | S crown lily | **ENGINE GAP, see B**; lines `lily` (Pokey) then `crown` (Dot); white crown petals on it | same |
| 12 | L across the deep + flag before | row `deep`: weight [small, big, small], gap 120 + a beat pair, deep | deep too (the finale), x1.5 |
| 13 | E exit | village bank; `king` once the goal is met; Meeca's `note` where finds.ts lays w2_note | same |

## For the lead to rule (one line each)
A. **X (there-and-back) has no lay:** place 'pads' always lays a far bank ahead (pipeline.ts:1337-1348); a dead-end far stone with the way
   on from the NEAR bank (a spur) is not built, and the bots have no out-and-back. A forward row never asks "wait for the pads you sank".
   ENGINE-WORTHY (rule 26). Options: (a) RECOMMENDED: lay every other beat tonight, X's slot empty, the spur to an engine member, X laid
   when it lands (2-2 not to Matt before); (b) X as a forward far-stone row (pads -> stone + petal + `stone` line -> pads): not the design.
B. **The crown lily has no piece:** I add a 'crown' piece to the pad row (rideLay: about 300 px, never sinks, look slot 'crown': ART-W2's
   M-02-a + w2-crown-bud, swapped to w2-crown-open when he first stands on it), inside this packet's art step. It touches PadRow and
   Pad.look (types: flagged for the Architect, as ENG-22's Platform.pad was).
C. **Beat 2's "tiny pad off the line" is dropped:** padFaults' 124 px floor (the hand-built ponds' QA) forbids a tiny pad, and a row has no
   "off the line". The greed lives on beat 9's small pads (PICKS: "extra flowers on the smallest pads").
D. **Easy:** every pond splash-back except the finale (2-2.md "Easy"), counts x1.5 (rideLay's stretch).
E. **Petal colour:** the keeper's fault 1 (lavender hyacinth / white, never pink): I check whether a stage-level pickup look exists; if not,
   ENGINE-WORTHY, named, not coded around.
F. **The double press:** the tier bots double-press 25% of jumps (calibrated, firsttimer.ts:204-229); off a pad that overshoots a 136 px
   stone into the water. Not modelled away: on Normal a middle bot may lose a life at a pond; Easy's splash-back (D) covers the child.
G. **Hand-off point (D77):** this box ends at laid + listed + castBots 1-40 + lock; stills (step 4) by me only if bots are GREEN inside
   the box, else to a fresh member. Box: 3 h from 4:00 PM ET or 55% real.

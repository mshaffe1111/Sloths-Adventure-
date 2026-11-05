# ENGINE-SPEC: the level engine, as the level designer and the planner agree it (shared file; nothing is built until both sign)

Level designer: session_01FhBbYPKnBYCweHg8duJSu2 (leads the design). Planner: session_01FhBbYJaUqNUPxNUvbHdHeN (owns
buildability, runs, order of work).

Design inputs: `reference/engine/MATT-DIRECTION.md` and `reference/roles/LEVEL-DESIGNER.md` (both on `ccr-0d59a91c-oy3imz`),
DESIGNER.md §13 (Option E, `engine-design`), PLAN.md (`engine-plan`), CRITIC.md (`engine-critic`), R1-R4.

**Matt's GO (2026-11-05 ~12:00 AM ET):** "let's start doing this engine... Let's not release anything that we did today. And let's
see if we can fix what we have." Nothing from 11-04 ships. The engine mixes today's KEPT pieces so that no stage repeats. The
references are the old 1-1 (live on `main`) and today's 1-3. The ceiling is **8% of Matt's week** for this run.

| | Signed |
|---|---|
| Level designer | checkpoint list: signed 2026-11-05 12:0x AM ET (DRAFT until the planner signs) |
| Planner | checkpoint list: signed 2026-11-05 12:02 AM ET, with amendments P1-P4 below (each is a test or a scope line, none changes the design) |

---

## Checkpoints (2 hours of work each; a miss stops the work until Matt has seen why)

Each checkpoint gives:
- a number against its pass line;
- something Matt can see;
- its cost in % of the week;
- a report of pass / miss / why in three lines.

Each report starts with planned vs actual time and % of the week used so far.

**The variety gate, used from checkpoint 3 on.** Its thresholds come from checkpoint 1 and are fixed before any stage is
generated:
- **mix:** at least as many piece kinds as the old 1-1;
- **share:** the commonest piece's share no higher than the old 1-1's;
- **run:** the longest run of one piece no longer than the old 1-1's;
- **new:** something new at least as often as in the old 1-1;
- **splits:** at least as many high/low route splits as today's 1-3 (designer ruling on CP1's conflict 1: the old 1-1 has 0 splits by
  the rule, 1-3 has 7, and Matt praised 1-2 and 1-3 for branching);
- **climb:** at least the old 1-1's climb and drop range;
- **neighbours:** neighbouring stages share no more than half their main pieces.

### CP1: the baseline, measured (owner: planner runs, designer defines the measures)
- **Measures.** On the old 1-1 (`main`), today's 1-1 to 1-5 and today's 1-3 (counted as a reference), 16 layouts each where the
  stage rolls:
  - piece kinds and sizes, and the spread of sizes;
  - how far each stage climbs and drops;
  - route splits (higher / lower);
  - the longest run of the same piece;
  - the commonest piece's share;
  - the mean and longest stretch between new things.

  Piece = the kind a player sees and stands on: log, bridge, bough, snap twig, vine, stump, rotten branch, lily pad, climb, split
  road, ground. The measure reads the built stage's platform list, not the builder's own labels.
- **Pass line.** Every number exists for all 6 stages. The old 1-1 and 1-3 are the bar, and each of today's five is marked
  above or below it on each measure. 1-5 must show its "all cracking logs" fault as a number (expected: share and run far over the
  old 1-1). If it doesn't, the measure is wrong, and that is a miss.
- **Matt sees.** One table, plus a side map strip for each stage: platforms as grey bars coloured by piece kind, old 1-1 on top.
- **Cost estimate.** About 0.5-0.8% of the week.

### CP2: the piece library sheet (owner: designer, planner checks each piece traces)
- **Content.** Every kept piece (Matt, 11-04: "I liked all the pieces... They were redundant"), with old 1-1's pieces it uses that
  today's stages dropped (lily pads and the rest). Each piece in its sizes and its kinds of placement (up, flat, down, high road,
  low road), with:
  - its entry and exit contract;
  - the moves it asks for;
  - the gap or reach range it is proven over, Normal and Easy.
- **[Matt, 11-05 ~12:10 AM ET] Grouped per world kit, as node ideas.** Matt: "a whole world should have its own pieces... I just
  don't want pieces thrown together. I want it to make sense. Nodes that, you know, make sense." So the sheet has two layers:
  - **the world's kit:** its pieces, which belong to that world only (World 1: the canopy and creek of the opening);
  - **the kit's node ideas:** each idea is one thing the player does, written in one line a player would say. It lists the pieces
    that belong to it, the order they lead into each other, its entry and exit, and what it must teach first.

  **Draft node ideas for World 1** (designer; each one built only from kept pieces):

  | Node idea | What the player does | Pieces that belong, in the order they lead | Entry → exit |
  |---|---|---|---|
  | Bough stair | climbs a tree branch by branch, each bough a different length | boughs (short, medium, long), stump to start | ground → high |
  | Creek crossing | crosses water on things that float | a log, a stump in the stream, bank (lily pads only if Matt confirms which stage had them: no old World 1 stage on main does, planner's count) | bank → bank |
  | Snap-twig dash | keeps moving because the twigs break under him | snap twigs, then a solid bough to land the run | any → mid or high |
  | The fork | picks the high road or the low road; they rejoin | 1-2's split: boughs and vines up top, logs and lilies down low | mid → mid (two roads) |
  | Vine relay | swings from vine to vine over a gap | vines, a bough or stump either end | high → high or mid |
  | Rotten-branch drop | rides a breaking branch down to a lower path | rotten branch, a catch bough or bank below | high → low |
  | The climb | goes straight up a trunk or vine, then out along a bough | climb, bough at the top | low → high |
  | Bridge walk | crosses a long rope bridge with something to watch for | bridge (one only), stumps or boughs either end | mid → mid |
  | Stump hop | crosses broken ground on stumps of different heights | stumps (3 heights), bank | ground → ground |

  This list is checked against CP1's measures of the old 1-1 and 1-3: every kind of section those two stages have must appear as
  an idea, or be added.
- **Pass line.**
  - Every node idea is named, in one line a player would understand, and shows its pieces in order on the sheet.
  - The library holds at least the old 1-1's count of piece kinds and of distinct sizes (from CP1).
  - Every piece and size traces clean in a grey test strip, on both settings.
  - Any piece that doesn't trace is named, with its reason.
- **Matt sees.** One sheet, a grey still of every piece and size, labelled. It is shown to him before any stage is built from it
  (MATT-DIRECTION check 2).
- **Cost estimate.** About 0.8-1.2%.


**[designer, 11-05, after CP1 and the planner's account of what Matt said] Additions to World 1's node ideas:**

| Node idea | What the player does | Pieces that belong, in the order they lead | Entry → exit |
|---|---|---|---|
| Lily-pad hop | hops across water on pads of different sizes, some sinking | lily pads (small, big, sinking), a log to finish | bank → bank |
| Bounce up | bounces off a mushroom up into the canopy | mushroom, then the first bough of the canopy | low → high |
| Rope crossing | goes hand over hand along a shimmy rope over a gap | shimmy rope (exists, PLAN.md E11), a bough or bank either end | mid or high → same |
| Animal on the path | deals with one animal in the way: jump it, wait for it, or kick-roll it | the boa (kick-roll, 1-5), bank or bough with room around it | any → same height |

**Corrected (planner's count):** no old World 1 stage on `main` has a lily pad, though the piece exists (`protoStage.ts:2294`, World 2's river). Which stage Matt meant goes to him through the lead; the lily-pad hop idea waits for his answer. Gliding is not a World 1
idea unless World 1 already teaches it; it is on the move ladder below.

**"It keeps building" (Matt to the planner: "every move you learn keeps coming back... it just keeps building and building"):**
a move ladder per world, as data. Each stage:
- introduces at most one new move or idea;
- reuses at least two earlier ones in a harder form: a higher risk target, a narrower window, or combined in a new idea;
- never lets a move learned in the last three stages drop out of the world for more than two stages.

*Check:* over the world's stages in order, count each idea's and each move's first use and every reuse after it. Each reuse must be
at a higher job (teach, test, twist, master) or a higher risk target than the use before.

### CP3: the mixer, proven on the worst stage first (1-5) (owner: designer specs the mix rule, planner builds and runs)
- **The mix rule (designer), [Matt, 11-05] ideas first, pieces inside an idea.**
  1. **The stage's story beat and theme come first** (STAGE-RULES and the story files). They pick the stage's job and look, never
     its pieces' kit: the kit is the world's.
  2. **The stage is a sequence of node ideas** from the world's list, chosen to suit the story beat. Neighbouring stages share no
     more than half their ideas.
     **[designer ruling, 11-05, from tagging the old 1-1: `cp2/idea-tags.out`] "No idea twice" is withdrawn.** Matt's best stage
     is a cycle of three ideas: bank hops, then a bounce up, then the fork (the canopy over the floor), repeated about 8 times,
     with the fork 41% of its length. What makes it good is not many ideas, but a few that interlock: it is always going up or
     down, it always offers two roads, and no two repeats are the same size or height. So the rule is:
     - no idea twice **in a row**;
     - no idea over the old 1-1's top share (about 40%);
     - every repeat of an idea is a new kind x size (CP1's "new in the last 6" measure, applied inside the idea);
     - a stage has at least 4 ideas.

     Today's 1-1, 1-2, 1-4 and 1-5 fail this: one idea takes 54-76%, or one pair of ideas alternates the whole stage. The tagger
     is a first pass (it reads kind, width and height); the planner checks its names against the surface fields. A stage that teaches something new opens with the idea
     that teaches it.
  3. **Inside an idea, pieces come only from that idea's own list**, in its order, drawn through a shuffle bag for sizes and
     heights, so each roll of the idea differs but always makes sense.
  4. Each node hands over to the next at its exit (the next idea's entry must match: high, mid, low, or two roads).

  The construction rules then hold across the whole stage, with the thresholds from CP1:
  - the share cap;
  - the run cap;
  - the "something new within N" rule;
  - splits from 1-2's branching shape, kept as a piece.

  A node that can't meet them fails with the missing piece named, never a reroll.
- **Pass line.**
  - 1-5 rebuilt from today's pieces passes the variety gate on 16 of 16 rolls, Normal and Easy.
  - Its traces stay clean, and the fun gate shows no new flags for 1-5.
  - **Coherence (Matt judges this on the map; the variety gate alone can be passed by random soup):** every node is labelled on
    the map by its idea, every piece in a node belongs to that idea, and Matt can say what each node is about in one look.
- **Matt sees.** 1-5's side map next to the old 1-1's, and next to today's 1-5 ("just cracking logs"), plus a grey-box test link
  of the new 1-5.
- **Time per stage (lead, from Matt's "a stage in about an hour, not a day").** Each stage's helper time from spec to gated grey-box, and its retries, are recorded. Pass line: a stage takes 1 hour or less after the mixer exists (1-5 in CP3 is allowed to take longer, as the first build).
- **Cost estimate.** About 1.5-2%.

### Placement rules for the mixer and the pickups (designer, from Matt 11-05 ~12:15 AM ET; built in CP3, held in CP4)

Matt: "the pieces should all fit together. That even if it goes random, they should all fit together... hearts aren't given out
the very first thing... if you're not going to lose a heart, don't put a heart there... Checkpoints, reasonable... Collectibles.
Where they make sense... It should feel good playing it. It shouldn't just be a cluttered mess."

Each rule has the planner's machine check under it; a rule that can't be checked by machine is judged by Matt on the map.

1. **Everything in a kit fits everything else.** Every idea's entry and exit uses the world's small set of joins (high, mid, low,
   two roads), and the join itself is a short piece of the same kit, sized to the next idea's first move, never a bare gap.
   Every piece in a kit is drawn in one art family, so any roll reads as one place. A piece that would look out of place in any
   other idea of its world is not in the kit.
   *Check:* every pair of ideas the stage puts side by side joins (exit = entry). Run over every pair in the kit, not just the
   rolled ones. Over 16 rolls, no seam has a gap or step outside the kit's join sizes.
2. **A heart only after real risk.**
   - Hearts never in the first node or the first 30 s.
   - A heart only right after a node where a miss costs a heart or a life (a hazard, a pit, an animal), and never in or after a
     stretch where nothing can hurt.
   - At most one heart per risky node, and fewer hearts than risky nodes.

   *Check:* each heart's previous node has a heart- or life-costing miss, and its node risk is above zero. None in the first node.
   Hearts are fewer than risky nodes.
   **[designer ruling, 11-05, on CP1's conflict 2]** The old 1-1 has a heart in its first 30 s (median 1 of 2). Matt's newer, explicit
   words win: "hearts aren't given out the very first thing... if you're not going to lose a heart, don't put a heart there". So the
   rule is tied to risk, not the clock: the fixed 30 s window is dropped, and "only after a risky node" is kept. The old 1-1's early
   heart is a known exception, not a threshold to copy.
3. **A checkpoint before the hard part, not everywhere.**
   - A checkpoint goes just before a node whose job is test, twist or master, or before the set piece. Never before a rest or a
     teach node.
   - No two checkpoints with only easy nodes between them.
   - After a loss, the replay back to where he fell is at most about 45 s (estimate).

   *Check:* each checkpoint's next node is a test, twist, master or set piece. There are no back-to-back checkpoints. The longest
   stretch on the quick route from a checkpoint to the next hard node is 45 s or less.
4. **Collectibles where they make sense; hard ones in hard places.**
   - Petals are the route's breadcrumbs. They sit only on the idea's own surfaces and arcs, and show the way and the safe landing.
   - Each stage's harder collectibles (the upper road's petals, Meeca's carvings, a bonus) go only in a test, twist or master
     node, or on the high road of a fork. A player earns them with the skill that node is about.
   - None floats in a place no move reaches naturally.

   *Check:* every petal lies on its node's planned route, or on the arc of a jump in it. Every hard collectible sits in a node of
   job test or above, or on a fork's high road, and is reachable only by the idea's own move. That uses the limited-agent bot: the
   bot without the move can't reach it.
5. **No clutter.** In any one phone view (upright 400 x 880 and sideways 1100 x 540):
   - at most about 8 pickups (estimate);
   - at most 2 kinds of hazard or animal;
   - at most 3 kinds of standing piece;
   - every landing has clear space above it for his jump arc.

   *Check:* a sliding view over the built stage counts these and fails over the limits. The limits are set from the old 1-1 in
   CP1: it must pass its own limits.

### CP4: the same mixer on 1-1 to 1-4 (owner: planner builds and runs, designer reviews every map)
- **Pass line.**
  - All five stages pass the variety gate on 16 of 16 rolls, both settings.
  - Neighbouring stages share no more than half their main pieces.
  - Every node on every map is labelled by its idea; no idea twice in a row, and none over the old 1-1's top share.
  - The fun gate shows no new flags.
  - The designer has played each stage, upright and sideways, against the stage it replaces.
- **Matt sees.** Five maps beside the old 1-1, and a grey-box test link of all five.
- **Time per stage (lead, from Matt's "a stage in about an hour, not a day").** Each stage's helper time from spec to gated grey-box, and its retries, are recorded. Pass line: a stage takes 1 hour or less after the mixer exists (1-5 in CP3 is allowed to take longer, as the first build).
- **Cost estimate.** About 1.5-2%.

### CP5: Matt plays the grey-box (owner: Matt; the lead sends it)
- **Pass line.** Matt picks the engine's stages over today's, and the engine's 1-2 against the old 1-2, side by side, before any
  art or polish (MATT-DIRECTION check 5).
- **Matt sees.** The test link, with each new stage beside its old one.
- **Cost estimate.** About 0.2%. Art and polish come after this, as a separate plan.

**Total estimate: about 4.5-6.2% of the week, under the 8% ceiling, with 1.8-3.5% of margin for one CP to be redone.**

---

## Design (filled in from CP1 on; the designer writes, the planner signs)

- Pieces: CP2's sheet.
- Mix rule: CP3.
- Rhythm: the player's rhythm, not the song (Matt, 11-04; DESIGNER.md §13.3, PLAN.md). Every node draws its rhythm pattern
  (regular, swing, broken, wait-and-go) the same way it draws pieces.

---

## Planner's amendments to the checkpoint list (signed with these; the designer may reject any one by a run)

- **P1, CP1 reads the engine's own Easy.** The inspector builds a different Easy from the game's: 0-20% of platforms identical on
  1-1..1-5 (PLAN.md run E6, `tools/inspect/stages.ts:64,86` vs `stageGenerator.ts:2857`). CP1's script builds every stage the way the
  engine does (`buildProtoStage(..., easy)` / `generateStage(cfg, setting)`), never through the inspector. The inspector fix itself
  (PLAN.md M0, about 1 hour) lands before CP3 judges anything on Easy.
- **P2, CP2's "traces clean" covers only what the tracer can trace.** The tracer knows hop, jump and double onto bank, branch, stump
  and crumble (`beatTrace.ts:48-50`). Vines, ropes, lily pads and logs that move are proven in the real engine (`realPlay.ts`), the way
  PLAN.md runs E11 and E12 did, not by the tracer. CP2 lists for each piece which proof it carries.
- **P3, R-164.1's countermeasure is a CP3 and CP4 pass line.** Matt lost lives dropping onto a ledge he was meant to reach (fall
  zones, `w1Rhythm.ts:645, :689`). Test: for every span that costs a life, the first-timer's drop through it never lands on a
  standable ledge below. Any such drop fails the stage.
- **P4, one model of a jump.** The mixer asks the tracer itself whether a jump is reachable. It never uses its own copy, which is
  what cost 94% of 1-2's rolls (PLAN.md E1/E9: 932 -> 41 rejections once one predicate was shared). CP3's pass line adds: "can't
  reach" rejections = 0 across 16 rolls.

- **Planner, 12:14 AM ET:** signed with the designer's rulings of 5a31b4e1 (split floor 7 from 1-3; hearts by risk, not the clock; the
  checkpoint rule; three more ideas; the move ladder). One fact to fix before CP2's sheet: **no old World 1 stage on main has a lily
  pad.** Built as the engine builds them, the old 1-1 has none on 16 layouts, and neither do the old 1-6 to 1-9 on 3-16 layouts
  (reference/engine/cp1/). Lily pads exist as code: a `lilyPads` section in `protoStage.ts:2294` (drawn from a pool at `:2425`) and
  World 2's river. Matt's "we used to have the lily pads" needs a check of which stage he means before the sheet says "from the old 1-1".

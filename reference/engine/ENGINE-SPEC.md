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
- **splits:** at least as many high/low route splits as the old 1-1 (designer ruling, 11-05, on the planner's re-run): a road
  keeps going across any gap up to a Normal flat jump (180 px), and two roads at heights at least 120 px apart, running side by side,
  count as a split. On that rule, the old 1-1's canopy over the floor counts. Both roads must be walkable end to end, which the CP3
  prover checks;
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

**Answered (Matt, 11-05):** he met the lily pads on the test link. The lead finds the only playable ones in World 2 (2-2's pads); the planner finds them in the control test's draw pool too. Under the shared library (below) the question no longer decides anything: lily pads are a shared piece, tagged for World 1's creeks and World 2's river. Earlier note: the lily pads were in the World 1 test version (the control test, `protoStage.ts:2294`, drawn on about 2 runs in 3), which testers played. Lily-pad hop is a World 1 idea: flat still water, pads 84-104 px with gaps of 0.42-0.55 of a jump, and falling in puts him back on the bank. World 2 keeps its own river use of lilies (moving water, logs), so the two worlds don't share the idea. The same test version's **turtle line** (punch one from behind, or kick its shell into the others) joins World 1 as a second animal idea; a kick that sets off a chain was the strongest fun correlate in the Mario study (R3 F10). Gliding is not a World 1
idea unless World 1 already teaches it; it is on the move ladder below.

**"It keeps building" (Matt to the planner: "every move you learn keeps coming back... it just keeps building and building"):**
a move ladder per world, as data. Each stage:
- introduces at most one new move or idea;
- reuses at least two earlier ones in a harder form: a higher risk target, a narrower window, or combined in a new idea;
- never lets a move learned in the last three stages drop out of the world for more than two stages.

*Check:* over the world's stages in order, count each idea's and each move's first use and every reuse after it. Each reuse must be
at a higher job (teach, test, twist, master) or a higher risk target than the use before.


**[designer ruling, 11-05 ~12:22 AM ET, from Matt's newer words to the planner] One shared library, not a kit per world.**
Matt: "intermix the different worlds if you have to with the arts... if you have other stages where putting logs into it makes
sense, use it from world one. Make as much and take as much as we can out of what we have. The only one that really plays
differently is world five." This replaces "each world has its own kit":
- **The library is every piece and idea that ships in any world:** World 1's, World 2's lily pads, logs and river, ropes, and gen2's
  World 6-8 sections. Each is tagged with the worlds it fits (by its art and by what it asks of the player).
- **A world's stages draw from every idea tagged for that world.** The world's own new ideas lead, and pieces from other worlds fill in
  where they make sense. World 5 plays differently and is the exception: it keeps its own set.
- **Coherence still holds.** Fit is now judged per idea and per neighbour, not per world: every piece inside an idea belongs to that
  idea, and two ideas side by side must read as one place (placement rule 1, with the art family checked per join). A stage's
  theme picks the art family for its joins and dressing.
- **The variety gate counts the whole shared library.** Neighbouring stages share no more than half their ideas, wherever those ideas
  came from.


**[designer, 11-05 ~12:25 AM ET, from Matt via the planner] Animals and unused art.**
- "Once you introduce them, they can be anywhere": an animal, once taught, joins the shared library for every later stage and every
  later world, inside any idea where it makes sense. The move ladder counts it as a move: after its teach, it must come back in a
  harder form, and must not drop out for more than two stages.
- "Look at the library of art and see what we've created that's not been used": the planner's unused-art inventory feeds the
  library. Every unused piece of art that can carry a node idea becomes a library entry, tagged with the worlds it fits.


**[designer, 11-05 ~12:30 AM ET] Node ideas from the unused art (the lead's inventory part 1,
`reference/engine/unused-art/IN-GAME-UNUSED.md` on `ccr-0d59a91c-oy3imz`).**
- The 273 unused pieces are read for what a player could *do* with them. Set dressing (leaves, banners, signs, story faces) stays
  dressing, and boss frames stay with their bosses.
- These become shared-library ideas, tagged with the worlds whose art they come from, and usable wherever they fit (World 5's own
  pieces stay World 5's).
- "Mechanic" says whether the engine already does what the idea needs; the planner checks every "exists?" against the code before
  the idea goes on the sheet.

| Idea | What the player does | Unused art it uses | Fits | Mechanic |
|---|---|---|---|---|
| Hollow-log crawl | slides through a hollow log to pass under a hazard or hide from the eagle | W1 hollowlog-moss/-plain, Matt's three painted hollow logs (never cut) | W1, W2, W6 | hide exists (eagle); crawl-through exists? |
| Root gate | finds what opens a gate of roots, then comes back through it | W1 root-gate-open/-shut, W2 reed-gate, W3 rootLadder | W1-W3 | gates exist in puzzle rooms? |
| Bobbing crates | crosses water on crates and barrels that ride up and down | W2 crate-up/-down, barrel-up/-down, W10 crate | W2, W6, W10 | bobbing platform exists? |
| Reed isles | hops small floating isles of reeds | W2 reed-isle-a/-b, W6 lily-pads, W9 pumice-raft | W2, W6, W9 | floating static: yes |
| Falling stalactites | waits for the drip, then runs under before they fall | W3 stalactite-fall/-shards | W3, W7, any cave | falling hazard exists? |
| Sleeping bat | creeps past a bat without waking it | W3 bat-asleep/-stir/-flap | W3, W8 | new animal |
| Counterweight lift | stands on one side to raise the other | W3 counterweight, root-basket | W3, W7 | seesaw exists (W6) |
| Updraft ride | rides warm air up a cliff | W4 updraft-1/2/3 | W4, W8, W9 | glide exists (W8); updraft? |
| Slung log | jumps onto a log slung from ropes as it swings | W4 slung-log, rope-anchor | W1, W2, W4 | swinging platform exists? |
| Crumbling ledge | crosses a ledge that cracks and falls a beat after landing | W4 ledge-whole/-cracking/-gone, W3 crack-whole/-cracking, W7 cracked-ledge | all but W5 | crumble exists |
| Behind the falls | finds a path behind a waterfall veil, a hidden high or low road | W4 veil-closed/-parting, fall-narrow/-medium/-wide | W2, W4, W6 | new |
| Push block | pushes a block to make a step up | W7 push-block | W3, W7, W10 | push exists? |
| Hanging planks | crosses a chain of hanging planks that dip under him | W7 hanging-platform, W9 plank-hanging/-ring, W10 hanging-iron | W7, W9, W10 | new |
| Hot rocks | crosses rocks that heat on a cycle | W9 hot-platform, vent-rock, smoke-crack | W9 | timed hazard exists? |
| Secret tunnel | breaks a cracked floor and drops into a hidden low road | shared secret-cracks, secret-tunnel-kit, sunk-stone, flooded-strip | any | secrets exist? |
| Scaffold climb | climbs scaffold, balconies and iron stairs | W10 scaffold, balcony, iron-stair | W10 | climb exists |
| Bridge span and fallen column | crosses a broken span, then walks a fallen column | W7 bridge-span, fallen-column | W7, W9 | static: yes |

Animals in the unused frames (the mantis "disguise", the eagle "glide", the caiman "retreat", the turtle "scurry") can give each
animal a second behaviour. That is the harder form the move ladder asks for when a taught animal comes back.


**[designer ruling, 11-05 ~12:32 AM ET, on the planner's CP2 traces (`cp2/cp2-trace*.out`)] Easy's rise cap.**
Every idea is the same idea on Easy; only its numbers soften. On Easy:
- no rise is more than **+40 px** onto a landing narrower than 220 px;
- a landing after a rise of +40 is at least **110 px** wide;
- a rise of +50 to +70 stays allowed only onto a landing of 220 px or more.
- **[re-trace, `cp2/cp2-trace-easyfix.out`]** a rise of **+30 or more** has a gap of at most 80 px (widened from +35 after the bridge-span trace, `cp2/cp2-trace-yes4.out`) (at 90 px a flick gets 298 ms, just under
  300). With this clause the Easy bough stair (250 px in seven steps) and stump hop pass every cell measured.

This fixes bough stair (flicks 246-281 ms against Easy's 300 ms floor at +50 to +70) and stump hop step 1 (+50 onto a 60 px stone)
without changing what the player does. On Easy the stair just climbs in more, smaller steps over the same height. The planner
re-traces both on Easy after the change.

**What the all-worlds count says for the mix** (`cp2/library.txt`, `enemies.txt`):
- logs are 9,095 of about 19,000 placed pieces, so the old fault in numbers is logs everywhere;
- moving platforms appear only 17 times in the whole game;
- drifting logs and lily pads live only in World 2;
- 24 of 90 stages have no animal.

So the first pieces the mixer should spread are the ones most worlds lack: moving and drifting platforms, lilies, mushrooms, and the
taught animals.


**[designer, 11-05 ~12:35 AM ET] Where the 17 unused-art ideas go** (the planner's check, `cp2/mechanics-exist.md`):
- **On the sheet once proven in the real engine (7):** reed isles, updraft ride (after glide is taught), crumbling ledge, behind the
  falls, push block, scaffold climb, bridge span.
- **Small builds, placing a behaviour that already exists as a route piece (9):** hollow-log crawl, root gate, bobbing crates,
  stalactites, sleeping bat, counterweight, slung log, hot rocks, secret tunnel. These go to Matt as a list with sizes. Matt picks
  which to build; none is needed for CP3.
- **New (1):** hanging planks. Parked until Matt asks.

**CP3's 1-5 draws only from proven ideas.** The 1-5 remix uses World 1's 14 ideas, plus crumbling ledge, push block, bridge span
and reed isles once they are proven.


**[designer ruling, 11-05 ~12:36 AM ET, on the animal runs (`cp2/cp2-animals*.out`)] Animals need their teach before their line.**
- The boa passes on Easy and misses on Normal: 2-3 hits at one boa, and 2-3 lives a run.
- The turtle line misses: up to 5-6 hits at one line for the kid on Easy.
- In both, the first-timer had not been taught the trick.

So both ideas are marked **not ready**, and they change as follows:
- **Every animal idea gets its teach steps first** (expose, then a safe validate), and the line comes after.
- **Boa on Normal:** a clear rear-up tell, with a flat run-up of at least one screen's width to read it.
- **Turtle line:** at most 2 turtles in a line on Easy (3 on Normal), with the shell kick taught in the validate step.
- **Pass line, re-run in CP3:** past each animal with at most one heart lost, adult on Normal and kid on Easy.


**[designer, 11-05 ~12:38 AM ET] The four YES ideas are proven** (`cp2/cp2-trace-yes4.out`, `cp2-push.out`): crumbling ledge, reed
isles, bridge span and push block pass on Normal and Easy, the bridge span under the widened Easy gap clause. They join 1-5's pool for
CP3.
- **Crumbling ledge:** a first-timer who pauses on a tile has about 0.3 s spare at crumbleAfter 0.7 s. So on Easy a crumbling tile
  waits **1.0 s**, and every crumbling ledge comes after its teach (a single tile over safe ground). CP3's first-timer run checks a
  pause.

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


### CP3 design: the 1-5 node plan (designer, 11-05 ~12:42 AM ET; the planner builds it)

**Story beat** (from the shipped lines, `dotLinesData.ts:123-125, 147`):
- 1-5 teaches creaky branches ("Creaky branches! Grab the petals and keep moving");
- each petal group needs a different move;
- a golden seed is seen "too far, for now";
- Meeca passed here not long ago ("These petals are fresher").

**Theme and frame (kept, designer ruling, 11-05):** today's 1-5 frame stays: the descent from the canopy to the forest floor at dusk, with Meeca's carvings as the goal. Matt: "the levels are built to go along with the story". The stage keeps going up and down node by node, like the old 1-1, but its overall trend is down: it starts in the canopy and ends on the floor. Its art family is the World 1 kit.

**Sizes per idea:** each idea's pieces use the shipped size ranges on the CP2 sheet (p10-p90 widths per kind, `cp2/library.txt`), the heights its CP2 trace proved, and the CP2 Easy rules: rise cap +40, gap at most 80 px from +30, crumble 1.0 s. **Length:** from the nodes, with a target of about 150
s skilled.

Each node lists its job, then a **deck**: the ideas it may roll, with one drawn per roll by a shuffle bag. Each idea's pieces and
sizes are rolled inside the idea. Decks are what make two rolls different stages; sizes are what make two uses of one idea different.

| # | Job | Deck (one idea drawn per roll) | Entry → exit | Pickups and markers |
|---|---|---|---|---|
| n1 | warm-up | bough stair (level form: boughs at one height band), bank hops on the high boughs | high → high | petals as breadcrumbs only |
| n2 | **teach** creaky (expose, then validate) | snap-twig dash, its teach form: one creaky twig over a bough just below, then two, with a catch bough under them and no pit | high → high | Dot's "Creaky branches!" line here; no heart |
| n3 | a local rise | bounce up, the climb | high → higher (the stage's top) | — |
| n4 | **the fork** | high road: crumbling ledge or bough run with creaky limbs; low road: down to the creek, lily-pad hop or reed isles. They rejoin at n5 | top → mid (two roads) | a petal group on each road, each asking for that road's own move |
| n5 | rest | bank walk | mid → mid | Dot's wayside line ("These petals are fresher"); a checkpoint here, since n6 is a test |
| n6 | **test** creaky | snap-twig dash, the full form: over a real gap | mid → high | the third petal group; a heart only after it, if n6 has life risk |
| n7 | twist | rotten-branch drop | high → low | — |
| n8 | creek | lily-pad hop, reed isles, stump hop (not the one n4 rolled) | low → low | — |
| n9 | puzzle beat | push block, bough stair, the climb (not the one n3 rolled) | low → mid | the golden seed shown above, out of reach: "too far, for now" |
| n10 | **master**, the second fork | high road: crumbling ledge or bridge span; low road: stump hop or bank hops on the floor; rejoin before n11 | mid → low (two roads) | a checkpoint before it; the fourth petal group, with its harder half on the high road |
| n11 | cool down | bank hops on the forest floor | low → shrine | — |


**The goal: Meeca's marks** (designer ruling, 11-05 ~12:46 AM ET; 1-5 is a relic hunt, `stagePlan.ts:39`: "Meeca marked the trees
as she walked. Follow her marks to the shrine"). Marks sit on trees, where she would have walked:
- one mark in each of the 9 nodes that are not forks (n1-n3, n5-n9, n11), on the main route, each on the trunk or
  bough the idea already uses;
- one mark on each road of each fork (n4 and n10): 4 marks in all. The high road's mark sits where the road is hardest, as
  collectible rule 4 asks.
- **Total: 11 on any single path, 13 in all. Goal 85% on Normal (11 of 13), 65% on Easy (9 of 13).** A player can finish on
  either road of each fork; taking both roads is the reward for replaying.
- Petal groups stay as planned (one per fork road, plus n6), and the seed stays out of reach.


**[designer rulings, 11-05 ~12:50 AM ET, on the planner's build findings]**
- **n9 push block:** the wall is about 190 px (a 100 px log plus a 90 px single-jump rise). The shipped 230 px wall needs a double, and
  the level check allows doubles on 1-5 only through EARLY_DOUBLE. That is a game-wide rule this stage does not change; whether the
  double comes back across World 1 is a move-ladder question for CP4.
- **Gaps are sized by the level check's own functions** (`jumpOK`, `heldMaxGap`). CP2's real-engine ranges are only the upper bound.
  Where a cap would make an idea lose its point, the planner tells the designer before working around it.
- **n9 golden seed:** a glint far up and away, as dressing only (a code-drawn sparkle, not a pickup), with Dot's "Something shiny, far
  away... too far, for now". The real seed is laid in the stage that teaches the glide. Not a reachable seed: doubles don't count on
  1-5, and a seed he could reach would make "for now" untrue. No gate change. The glint must be visible upright and sideways from
  n9's route.
- **n9 push block, for CP3:** out of n9's deck. The level check never moves a pushed log, so it fails at any wall height unless the
  block is wrapped as a puzzle room, as the shipped log puzzle is. n9 draws bough stair or the climb (never the one n3 rolled). Push
  block comes back in CP4, wrapped as a puzzle room.
- **Fork roads each keep their own height band**, so the two roads never cross.


**[designer ruling, 11-05 ~1:08 AM ET, on the planner's CP3 measurement] Length comes from short bursts, the way the old 1-1 gets
it.**
- **The conflict, measured:** 11 nodes of one idea each come out either too short (88-101 s against 120 s) or, stretched, as long
  runs of one piece:
  - 22 of the same piece in a row, against the old 1-1's 9;
  - something new only every 1,002 px, against 572;
  - 4,103 px flat, against 1,351;
  - about a third of the old 1-1's ups and downs.
- **The rule is (a)+(c):**
  - **(a) Bursts.** A node lays 2-3 short bursts of 4-6 pieces each, drawn from its deck. Bursts alternate between the deck's
    ideas: never the same idea twice in a row, and never the same burst twice in a stage. The teach node pairs its teach with bank
    hops between bursts, and the rest node stays one short walk.
  - **(c) Each idea varies inside.** Within a burst, the piece's kind or size band changes at least every 2 pieces. At least 4 of
    every 5 landings step up or down, as the old 1-1 does (171 of 202).
- **The pass line is the old 1-1's own numbers** (CP1), on 16 rolls x 2 settings:
  - longest same piece in a row: 9 or fewer; same kind x size: 7 or fewer;
  - something new every 572 px or less, and never more than 1,516 px without;
  - longest flat stretch: 1,351 px or less;
  - ups plus downs at least the old 1-1's share;
  - a fast player's clock at 120 s or more.
- **Easy's own pass** adds flags and hearts after the mixer (16 and 16). The planner measures the old 1-1's Easy the same way. If the
  Easy pass breaks the placement rules (hearts after risk, checkpoints before hard parts), that pass is in scope for CP3.


**[designer ruling, 11-05 ~1:11 AM ET] Splits come in many short stretches, as in the old 1-1, not two long forks.**
- **Measured, Normal medians on the 180 px rule:** the old 1-1 has 34 (14-51), today's 1-3 19, and the new 1-5 with two long forks
  only 2-3. The old 1-1's splits are dozens of short canopy-over-floor stretches.
- **The rule (b):** "canopy over floor" becomes a burst any node may lay. It is a few boughs or a log above the low route, each with
  its own height band, for 2-5 pieces. It recurs with the other bursts, never twice in a row. The two big forks (n4, n10) stay as
  the stage's real choices, with marks on both roads.
- **Pass line:** at least 19 splits (today's 1-3, Matt's second reference) on 16 of 16 rolls. The old 1-1's 34 is the target, and
  the report shows where each roll sits against both.

**Easy's extra flags and hearts:** the old 1-1 has the same (15 and 15), so they come from the engine's Easy pass, not the mixer.
For CP3 the placement rules are judged on Normal, and Easy is reported as it is. Whether hearts and flags on Easy should follow the
same rules is a separate item for Matt (his words, "hearts aren't given out the very first thing", hold on both settings). It goes
on the list after CP4.


**[designer rulings on the CP3 MISS, 11-05 ~1:35 AM ET, `cp3/CP3-CHECKPOINT.md`]**
1. **The canopy is laid over another idea's floor (a).** Boughs run above bank hops, stump hops or the creek, as in the old 1-1.
   The share counts the floor's idea for the length, and the canopy counts as a split over it, so no idea needs over 40%. The 40%
   cap stays.
2. **Forks are judged by the two-road share, not by n4 and n10 alone.** Two roads run side by side for at least 40% of the stage (the
   old 1-1 is 61%, the target). The planned 30-40% for the forks alone is withdrawn: it was written before canopies counted as splits.
3. **Checkpoints follow the shipped LV-9 spacing** (at most 4,000 px between flags), and the placement rule works inside it:
   - each flag sits at the nearest safe spot before the next hard node in its 4,000 px window;
   - never two flags with only easy ground between them;
   - never on a rest node unless a hard node follows it.

   The rule "start, n6 and n10 only" is withdrawn.
4. **The mushroom sits off the floor's lane, on a stump or a bank beside it**, so bouncing up is a choice. Walking on along the low
   road never bounces him. The adult bot's 7-11 loops must go to 0.
5. **A slip off a high road onto the low road:**
   - **Normal:** may cost a heart. That is the high road's risk, paid for by its harder marks, and it is counted in the stage's
     E[lives] (0.7 at d = 0.09).
   - **Easy:** the roads sit within 400 px (under LONG_FALL), so a slip costs nothing.
   - **Both:** never a life (P3).
6. **n8's deck:** lily-pad hop, reed isles, stump hop or crumbling ledge, drawing one that the previous two nodes did not lay.

**The miss stops the work until Matt has seen why** (LEVEL-DESIGNER.md). The rulings above are written, and the planner rebuilds only
after the lead's go.


**[designer review of the CP3 rebuild map, node by node, 11-05 ~2:25 AM ET]**

The rebuild passes every number. Reading the map node by node, the order in the strip map is n1, n2, n3, n4, (no n5), n6, n7, n8, n9,
n10, n11, with a canopy over most floors. These must change before Matt sees it:
- **A. n5, the rest, is missing.** It is the stage's breath: Dot's "These petals are fresher", and the flag before the test. Restore it
  as one short burst.
- **B. n6 is not the creaky test.** It laid "stump hop + canopy". The plan's n6 is the snap-twig dash in its full form, over a real gap:
  the test of what n2 teaches. Without it, creaky is taught and never tested. Restore it; the heart after it stays.
- **C. n3 drew lily-pad hop**, which is not in its deck (bounce up, or the climb). Each node draws only from its own deck.
- **D. Too many mushrooms.** The strip map draws 56 against the old 1-1's 14 or so, because every canopy is entered by a bounce. Cap
  mushrooms at the old 1-1's count. The other canopies are entered another way: a climb vine, a bough stair step, or a stump stack. No
  two canopies in a row enter the same way.
- **E. Creaky is the stage's theme and is thin:** 17 creaky or crumbling pieces in about 230. It must show in n2 (teach), n4's high
  road, n6 (test) and n10's high road. Creaky or crumbling is at least 15% of landings, and among the stage's 3 commonest kinds.

**Rulings on the planner's seven items:**
1. **Crossings, yes.** Each fork gets a step-down halfway (high, a middle ledge, low) and a climb from the low road back up.
2. **The marks goal:** Normal needs **10 of 13** and Easy **8 of 13**. That leaves one miss of slack on any single route of 11, and
   the second road's marks stay the replay reward.
3. **Warm-up as one burst: confirmed.**
4. **The bridge in the bough stair: confirmed only as the stair's top piece**, a short rope bridge from the last bough to the next tree.
   Never in the stair's middle.
5. **The mushroom perch: fine for grey-box.** The painted stump or root goes on the art list before it ships.
6. **Easy's landing:** Easy's dial width is set from the measured result after the engine's own Easy pass: 220 px at d = 0 down to 150
   at d = 1. The size bands stay as they are.
7. **Length:** 3:14-3:29 is accepted. Matt sets the floor at 2:00 with no cap. A and B add a little; cutting D's mushroom entries takes
   some away. 1-4 and 1-6 in CP4 sit at least 20% either side of 1-5's median.

**The rules this plan meets by construction** (the mixer still checks every roll):
- **Ideas:** 9 to 11 different ideas a roll. No idea twice in a row. Snap-twig dash comes twice (teach at n2, test at n6, not in a
  row), and the fork twice (n4, n10).
- **The fork's share:** n4 and n10 at about 15-20% of the length each, so together about 30-40%, under the old 1-1's 41%. The planner
  measures it; if it goes over, n10's roads shorten.
- **Splits:** two forks, each with at least 3 crossings where the roads run apart. The floor is the old 1-1's number on the 180 px
  rule; if two forks fall short, n9's deck gains a third, small fork (the climb with a low bank road).
- **Move ladder:** creaky is new (taught at n2, tested at n6, mastered at n10's high road). It reuses bounce, swing-free jumps and
  lily hops from 1-1 to 1-4 in harder forms.
- **Placement:** checkpoints before n6 and n10 only, plus the stage start. Hearts only after n6 or n10, when the roll's risk there is
  above zero. The seed is out of reach on purpose.
- **Kept out until their teach steps are built** (the lead): the boa and the turtle line.

**What Matt sees at the checkpoint:** three side maps stacked (the old 1-1, today's 1-5, the new 1-5 roll 1), each node labelled
with its idea; then the new 1-5 as a grey-box build on the test link.


## Library additions from never-packed art, with their packing work (designer, 11-05 ~12:55 AM ET; not part of CP3)

Source: the lead's part 2, `reference/engine/unused-art/NEVER-PACKED.md` on `ccr-0d59a91c-oy3imz`, 60 rows. These need packing (cut
cells into an atlas, plus wiring) before any stage can use them. Each is a CP of its own on the plan, with its cost estimated, and
Matt picks the order. Costs are rough estimates in % of the week; none needs Hugging Face spend (the art is already painted).

| New idea | What the player does | Art (never packed) | Fits worlds | Work | Estimate |
|---|---|---|---|---|---|
| Mangrove roots | hops across aerial-root platforms and mossy logs over mud and water | W6 kit-03, -05, -06, -15 | 2, 6, 1's creek | pack 4 platform cells; `w6.ts` already has the keys | 0.2-0.4% |
| Root den and hollow stump | hides from a watcher inside a root den or stump | W6 kit-11, -14 | 1, 2, 6 | pack 2 cells; uses today's hide | 0.2% |
| Climbing pole | climbs a knobbed pole, then out along a bough | W6 kit-16 | 1, 2, 6 | pack 1 cell; uses today's climb | 0.1% |
| Which log bites? | crosses logs where one is a moss-log caiman that opens its eye and snaps | W6 caiman-items-01..08 plus the 17-frame snap clip | every world with logs (most), after its teach | pack the clip; a new hazard with a tell (eye opens, then snap) | 1-1.5% |
| Otter patrol | gets past spear otters that scamper, swim and jab | W6 runners-01..16 plus scamper, swim and jab clips | 2, 6, 8 | pack the clips; a new creature behaviour (patrol, then jab with a tell) | 1.5-2% |
| Wave and whirlpool | times a crossing between breaking waves, or skirts a whirlpool | W6 water-03, -07, -08, -13, -14 | 2, 6 | pack; timed hazards on today's water | 0.5-1% |
| Root wall | finds the gap in a wall of roots, high or low | W6 water root wall with a gap | 2, 6 | pack; a static piece | 0.1% |
| Lever and plates | a second World 7 look for the puzzle room | W7 puzzle take 1 | 7 | pack; uses today's puzzle room | 0.2% |

The backdrops (6-4 mudflats, 6-6 fireflies, World 5's orchid dawn) and the clip alternates (crab, piranha, beetle, Flicker loops,
Butler, Meeca carry) are dressing and story, not node ideas. They go to the art owner's list.

**Designer's pick for first after CP4, for Matt to approve:**
1. **Which log bites?** Logs are about half of every piece in the game, so a log that might bite changes the most stages for one
   piece of work.
2. **Mangrove roots**, which gives the creeks a second platform family.


## The log family (designer, 11-05 ~1:00 AM ET, answering Matt: "more logs? different log sizes? different types of feel?")

Yes. Logs stop being one piece and become a family of kinds, each with its own feel. A stage draws several kinds, in three size bands
(short about 110 px, mid about 320 px, long about 880 px: the shipped spread, `cp2/library.txt`). The mix rule counts **kind x size**,
so a run of same-size logs fails the gate even when the logs are scattered.

| Log kind | Feel | Exists today? | Art | Work and estimate |
|---|---|---|---|---|
| Solid log | firm footing, any length | yes, everywhere | World 1-10 logs | none |
| Drifting log | rides the river, so you time the board and the leave | yes, World 2 only (302 placed) | World 2 | none: it joins the shared library for World 1's creek and World 6 |
| Pushed log | push it to make a step | yes, as a puzzle room (1-x "Push the log") | World 1 | wrap as a room in CP4 (planner: 30-45 min) |
| Hollow log | crawl through it, or hide inside from the eagle | the hide exists; no hollow log is drawn | W1 hollowlog-moss/-plain (packed, unused); Matt's 3 painted hollow logs (never cut) | place on today's hide: about 0.2%; cutting Matt's 3 about 0.1% |
| Mossy log | slick moss look, the same footing (look variety, not a new feel) | no | W5 mossy-log, W6 kit-05 | pack: about 0.1-0.2% |
| Broken log | a log snapped in two with a gap to jump | no | W4 brokenLog (packed, unused) | place as a static piece: about 0.1% |
| Log jam | a pile of logs to climb up through | no | W4 logJam (packed, unused) | place as a climbable pile: about 0.2-0.3% |
| Slung log | hangs from ropes and swings, so you time the landing | the swinging platform exists only in a boss lair | W4 slung-log, rope-anchor (packed, unused) | bring the lair's swinging platform onto routes: about 0.5-1% |
| Cracking log | cracks a beat after you land, then falls (the crumble rule, on log art) | the crumble exists (twigs, W7 tiles) | W4 brokenLog as its "after" frame | about 0.3% |
| Rolling log | rolls down a slope at you, so you jump it or hide | unclear: W1 chaseDebris is packed, never drawn | W1 chaseDebris | the planner checks the 1-8 chase code first; about 0.5-1% if new |
| Biting log | one log in a row is a moss-log caiman: the eye opens, then it snaps | no | W6 moss-log caiman, 17-frame snap (never packed) | a new hazard with a tell: about 1-1.5% |
| Sinking log | sinks slowly while you stand on it | no (lily pads don't sink either) | any log art | a new surface rule: about 0.5-1%. My pick is to skip it for now; the cracking log gives the same "keep moving" feel for less |

**Summary for Matt:**
- **Today:** 3 log kinds (solid, drifting, pushed) in 3 sizes.
- **For about 0.5% more** (hollow, mossy, broken, jam, cracking, all on art that already exists and mechanics that already exist): 8 kinds.
- **The three that feel most different** each take real work: slung (about 0.5-1%), rolling (to be checked) and biting (about 1-1.5%).


**New art (Matt, 11-05, via the lead):**
- New pictures come from Hugging Face first; Gemini is the fallback, and Matt runs it himself.
- A picture is made only for a gap that the unused and never-packed art can't fill.
- The designer sends the lead a small picture list aimed at the gaps the variety gate shows: each picture, its use, the worlds it
  fits and its HF cost. The lead approves the spend (about $70 left in total, about $15 kept in reserve).
- The method is `reference/methods/hf-backdrops.md` with its floor check. The HF token never goes in code, commits or messages.
- Today the existing art covers every idea in this spec, so no picture list is needed yet.


## The ground and perch family (designer, 11-05 ~1:05 AM ET, Matt: "hills and other little areas to jump up on... anything that will add to the platform type experience")

Same treatment as the logs: kinds with their own feel, in size bands, counted as kind x size by the gate.

**Fact that shapes this:** the engine has no true slopes. Every surface is a flat-topped rectangle (a search of the engine and the
stage builders finds no slope; World 5's "mound pair" is stepped). So a hill is built as a **stepped mound**: two to four rises that
the player hops up and down, drawn as one hill shape. A real slope you can run up is new engine work, sized below, and not needed to
get hills that read and play as hills.

| Kind | Feel | Exists today? | Art | Work and estimate |
|---|---|---|---|---|
| Bank (raised ground) | a step up or down out of a dip, the old 1-1's backbone | yes, everywhere (3,934 placed) | World 1-10 | none |
| Stone step | a small hard step, 50-420 px | yes (1,567 placed) | mossy stone, World 1-10 | none |
| Stepped mound (a hill) | up two to four rises, a top to stand on, then down; the high/low choice in small | in World 5 only (`w5a-mound-pair`) | World 5 mound; World 1's bank art drawn as one hill | build as a shared idea from banks: about 0.2-0.3% |
| Stump perch (three heights) | small high spots to hop between | yes as stone and bank; stumps exist in art | W6 kit-15 low stump (never packed), W5 fernStump (unused) | pack: about 0.1-0.2% |
| Broken stump ledge | a high ledge on a broken stump | no | W6 kit-06 (never packed) | pack: about 0.1% |
| Rock shelf | a ledge sticking out of a wall, short or long | in World 3's art only | W3 shelf-long/-short (packed, unused) | place as a perch: about 0.1% |
| Wet steps | stone steps by a waterfall | no | W4 wetSteps, wetSteps2, ledgeA/B, ledgeTrickle (packed, unused) | place: about 0.1-0.2% |
| Floating ledge | a ledge with nothing under it, for a high road | no | W4 floatLedge (packed, unused) | place: about 0.1% |
| Fungus shelf | a shelf fungus on a trunk, a perch up a tree | yes, World 8 only (53 placed) | World 8 | none: joins the shared library |
| Root platform | a mossy top on prop roots, over mud or water | no | W6 kit-03 (never packed) | pack: about 0.2% (with the mangrove kit) |
| Boulder | a big or small round rock to hop onto | no | W4 boulderBig, boulderSmall (packed, unused) | place: about 0.1% |
| Bounce mushroom | springs him up a tier | yes (330 placed) | World 1-3 | none |
| True slope (hill you run up) | running up and down a real incline | **no, new engine work** | needs new ground art | collision, feet and camera, plus art: about 3-5% plus HF. My pick: not now; stepped mounds give hills for under 0.3% |

**Summary for Matt:**
- **Today:** 4 ground kinds (bank, stone step, bounce mushroom, fungus shelf in World 8).
- **For about 1-1.5% more, all from art we already have:** stepped hills, stump perches, broken stump ledges, rock shelves, wet steps,
  floating ledges, root platforms and boulders. That makes 12 kinds.
- **New Hugging Face art:** none needed for any of these. A real slope is the one big item, and I recommend leaving it for later.


## The difficulty dial (designer, 11-05 ~1:15 AM ET; Matt: "as the game goes on, difficulty also increases. And that's for easy and normal")

**One number per stage, d, from its world w and stage s** (s = 1..9 in a world):

&nbsp;&nbsp;&nbsp;&nbsp;**d = (0.1·(w − 1) + 0.2·(s − 1)/8) / 1.1**

- d is 0 at 1-1 and 1 at 10-9. Each world climbs 0.18.
- Each new world's first stage starts at the previous world's middle, not its end. That is STAGE-RULES §1b's rule that a new world
  eases in.
- Examples: 1-1 0.00, 1-5 0.09, 1-9 0.18, 2-1 0.09, 2-9 0.27, 5-5 0.45, 10-1 0.82.

**What d sets.** Each dial runs linearly from its d = 0 value to its d = 1 value, separately for Normal and Easy. All are estimates,
to be tuned on Matt's play.

| Dial | Normal, d 0 → 1 | Easy, d 0 → 1 | Notes |
|---|---|---|---|
| Gap, as a share of the level check's limit at that height (`jumpOK`, `heldMaxGap`) | 0.55 → 0.92 | 0.45 → 0.80 | the gate stays the ceiling |
| Rise, as a share of the highest rise the gate allows | 0.50 → 0.95 | 0.40 → 0.80 | Easy's CP2 caps still apply |
| Typical landing width (p50) | 220 → 110 px | 260 → 150 px | never under 90 px |
| Risky pieces per burst (a miss costs a heart or a life) | 0-1 → 3-4 | 0 → 2 | rests and teach steps hold 0 |
| Stage risk budget, E[lives] on a first run | 0.5 → 3.0 | 0.2 → 1.0 | DESIGNER §2.3; bots judge it |
| Taught animals per stage | 0-1 → 4-5 | 0-1 → 3 | only animals already taught |
| Crumble delay | 0.9 → 0.5 s | 1.2 → 0.8 s | |
| Timed windows (vines, waves, moving logs) | ×1.0 → ×0.75 | ×1.15 → ×0.9 | of each piece's proven window |
| Bursts per node | 2 → 3 | 2 → 3 | more ideas mixed later on |

**What never moves with d** (the floors):
- STAGE-RULES §1b's per-jump bot floors: Normal adult at least 70% in Worlds 1-5 and 50% in Worlds 6-10; Easy kid at least 85% everywhere.
- Every teach step at miss chance 0.01 or less.
- The placement rules.

The stage's job can raise its own nodes inside the dial (a test node sits higher than a warm-up), but never above the dial's d = 1
value.

**1-5 now: d = 0.09.** On Normal that gives gaps at 0.58 of the gate's limit, typical landings about 210 px, 0-1 risky pieces a
burst, and E[lives] about 0.7. This replaces the planner's fixed 70-90 px stand-in.


## Stage length (designer, 11-05 ~1:15 AM ET; Matt: "minimum 2 minutes, but if it goes over 5, I'm okay with that too... it should vary the length of stages")

- **Floor:** every stage is at least **2:00** on the quick-route clock, a skilled player straight through ("played like Matt").
- **No cap:** over 5 minutes is fine.
- **Lengths vary across a world, by design.** Each stage's spec sets its length band through its node count and its bursts per node.
  A world's nine stages spread from about 2:00 to about 5:00. **Neighbouring stages differ by at least 20% on the quick clock**
  (designer's default; the planner proposes the measured number). The world's set piece or finale is among its longest.
- **Length still comes from units, never from filling a clock:** a longer stage has more nodes or more bursts, so it has more ideas,
  not longer runs of one piece.
- **Pass line:**
  - every roll is at least 2:00 on both settings;
  - over a world, no two neighbours are within 20% of each other;
  - the world's spread is at least 2.5 minutes.


## The polish pass (designer, 11-05 ~2:35 AM ET; Matt played the mixer's 1-5: "It played much better. Needs polish... was kind of ugly")

Evidence: Matt's still, upright (`reference/engine/cp3/matt-1-5-mixer-0216.png` on `ccr-0d59a91c-oy3imz`). It shows five faults:
1. a thin grey slab floats over the water with nothing under it;
2. the bank ends in a hard, straight cliff face;
3. the foliage band is cut off in a straight horizontal line over the pond;
4. a flag stands on top of the foliage, not on the path;
5. the top half of the upright screen is empty sky.

The play is the win. From now on every piece the mixer lays must look placed, not stamped. Polish is part of every mixer stage's bar,
next to the five design faults above.

**Rules the mixer follows (each with a machine check where it can have one):**
- **P-1. Every piece has painted art. A grey placeholder never ships.** Each piece kind maps to a painted sprite from the library: log,
  bough on its trunk, lily pad, reed isle, stone, stump, bridge. *Check:* no platform in a built stage draws with a fallback or plain
  fill; the planner names the kind behind the grey slab.
- **P-2. Nothing floats unless it floats** (D16). Over water there are only floating pieces (lily pad, reed isle, drifting log) or
  supported ones (a stump in the stream, posts, roots). In the air there are only boughs on a trunk, or pieces hung from a rope or vine.
  *Check:* every surface's underside meets a holder, water or ground.
- **P-3. Ground ends are dressed, never cut.** A bank ends in an end piece:
  - a root-fringed lip, a sloped crumble of earth, or a stump;
  - from the library: W5 `bankEnd-b` (unused), the W6 mangrove kit's broken stump ledge and low stump, the W1 knots.

  A sheer face only where the idea wants a wall (the climb). *Check:* every ground end with a drop over 120 px carries an end piece.
- **P-4. The foliage band follows the ground.** It ends where its ground ends, with a fern or leaf end piece (the leaf atlas has unused
  big leaves: `big_B05..B15`, `C03`, `C11`), never a straight crop over water or a gap. *Check:* no foliage band spans a gap or water.
- **P-5. Flags, marks and hearts stand on the path.** They sit on the surface he stands on, never on dressing or in the backdrop band.
  *Check:* each marker's base is within 4 px of a standable top.
- **P-6. The upright screen is never half empty.** Upright, the space above the play line holds play (canopy boughs, the high road) or
  dressing that belongs: hanging vines (W1 `vine-rope`, the W7 `liana-a1..a4` anchors, both unused), overhanging boughs, a trunk
  (`trunkPlain`, unused). *Check:* in a sliding upright view, the upper half has a piece of play or dressing in at least 3 views of 4.
  This also feeds the clutter cap, so it is dressing, not noise.
- **P-7. The mushroom on its perch gets a stump.** W6 kit-15 low stump or W5 fernStump, both never used; no new art.

**What Matt sees before his next play:** stills of the new 1-5, upright and sideways, at 6 places:
- the start;
- a fork, with both roads in view;
- a creek crossing;
- the creaky test;
- a bank's end over water;
- the shrine.

Each pair is checked against P-1 to P-7 by the designer before it goes to the lead. A still that fails is fixed, not explained.

**Art:** the library above covers every rule. No Hugging Face spend is needed for this pass; if a still shows a gap that nothing
fills, the designer sends the lead a small picture list.

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
- **Planner, 12:16 AM ET:** signed c883f235 (the four idea rules). Two checks the designer asked for, both measured on layout 1 Normal:
  (a) 1-5's "stone" is solid `moss_stone` under 40 px tall (53 pieces), not snap twigs. 1-5's breaking pieces are its 68
  `fragile` branches with `creak` set ("creaking limb"). The tagger's names are right.
  (b) The split rule was too strict. With no gap allowed, old 1-1 has 0 splits, because its canopy is branches you jump between and the
  two heights never sit at the same x for 300 px. If a road may have gaps up to one jump, old 1-1 has 31 splits (120 px allowance;
  longest 1,540 px) or 21 (200 px; longest 2,280). Rebuilt 1-3 has 8, 14 or 18 under the same three rules. The floor log does count
  as the low road. Proposed rule: a road keeps going across gaps up to a Normal flat jump (157-185 px, PLAN.md table 2.1; use 180).
  The split floor then comes from old 1-1. Not checked yet: that both roads are reachable routes (the CP3 prover's job).

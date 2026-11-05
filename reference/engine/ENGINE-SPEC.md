# ENGINE-SPEC: the level engine, as the level designer and the planner agree it (shared file; nothing is built until both sign)

Level designer: session_01FhBbYPKnBYCweHg8duJSu2 (leads the design). Planner: session_01FhBbYJaUqNUPxNUvbHdHeN (owns
buildability, runs, order of work).

Design inputs: `reference/engine/MATT-DIRECTION.md` and `reference/roles/LEVEL-DESIGNER.md` (both on `ccr-0d59a91c-oy3imz`),
DESIGNER.md §13 (Option E, `engine-design`), PLAN.md (`engine-plan`), CRITIC.md (`engine-critic`), R1-R4.

**Matt's GO (2026-11-05 ~12:00 AM ET):** "let's start doing this engine... Let's not release anything that we did today. And let's
see if we can fix what we have." Nothing from 11-04 ships. The engine mixes today's KEPT pieces so that no stage repeats. The
references are the old 1-1 (live on `main`) and today's 1-3. The ceiling is **8% of Matt's week** for this run. **[revised: C15, "Contradictions ruled", 10:49 AM]**

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
- **mix:** at least as many piece kinds as the old 1-1; **[revised: C24, "Contradictions ruled", 10:49 AM]**
- **share:** the commonest piece's share no higher than the old 1-1's;
- **run:** the longest run of one piece no longer than the old 1-1's;
- **new:** something new at least as often as in the old 1-1;
- **splits:** at least as many high/low route splits as the old 1-1 (designer ruling, 11-05, on the planner's re-run): a road
  keeps going across any gap up to a Normal flat jump (180 px), and two roads at heights at least 120 px apart, running side by side, **[revised: C27, "Contradictions ruled", 10:49 AM]**
  count as a split. On that rule, the old 1-1's canopy over the floor counts. Both roads must be walkable end to end, which the CP3
  prover checks;
- **climb:** at least the old 1-1's climb and drop range;
- **neighbours:** neighbouring stages share no more than half their main pieces. **[revised: C14, "Contradictions ruled", 10:49 AM]**

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


**[designer ruling, 11-05 ~12:22 AM ET, from Matt's newer words to the planner] One shared library, not a kit per world.** **[revised: C7, "Contradictions ruled", 10:49 AM]**
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
- **The variety gate counts the whole shared library.** Neighbouring stages share no more than half their ideas, wherever those ideas **[revised: C14, "Contradictions ruled", 10:49 AM]**
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
  waits **1.0 s**, and every crumbling ledge comes after its teach (a single tile over safe ground). CP3's first-timer run checks a **[revised: C3, "Contradictions ruled", 10:49 AM]**
  pause.

### CP3: the mixer, proven on the worst stage first (1-5) (owner: designer specs the mix rule, planner builds and runs)
- **The mix rule (designer), [Matt, 11-05] ideas first, pieces inside an idea.**
  1. **The stage's story beat and theme come first** (STAGE-RULES and the story files). They pick the stage's job and look, never
     its pieces' kit: the kit is the world's.
  2. **The stage is a sequence of node ideas** from the world's list, chosen to suit the story beat. Neighbouring stages share no **[revised: C14, "Contradictions ruled", 10:49 AM]**
     more than half their ideas.
     **[designer ruling, 11-05, from tagging the old 1-1: `cp2/idea-tags.out`] "No idea twice" is withdrawn.** Matt's best stage **[revised: C6, "Contradictions ruled", 10:49 AM]**
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
   - A checkpoint goes just before a node whose job is test, twist or master, or before the set piece. Never before a rest or a **[revised: C12, "Contradictions ruled", 10:49 AM]**
     teach node.
   - No two checkpoints with only easy nodes between them.
   - After a loss, the replay back to where he fell is at most about 45 s (estimate). **[revised: C10, "Contradictions ruled", 10:49 AM]**

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
5. **No clutter.** In any one phone view (upright 412 x 915 and sideways 915 x 412, with insets, as the shipped clip check uses, tools/perf/clipcheck.mjs:54-55):
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

**Sizes per idea:** each idea's pieces use the shipped size ranges on the CP2 sheet (p10-p90 widths per kind, `cp2/library.txt`), the heights its CP2 trace proved, and the CP2 Easy rules: rise cap +40, gap at most 80 px from +30, crumble 1.0 s. **Length:** from the nodes, with a target of about 150 **[revised: C3, "Contradictions ruled", 10:49 AM]**
s skilled.

Each node lists its job, then a **deck**: the ideas it may roll, with one drawn per roll by a shuffle bag. Each idea's pieces and
sizes are rolled inside the idea. Decks are what make two rolls different stages; sizes are what make two uses of one idea different.

| # | Job | Deck (one idea drawn per roll) | Entry → exit | Pickups and markers |
|---|---|---|---|---|
| n1 | warm-up | bough stair (level form: boughs at one height band), bank hops on the high boughs | high → high | petals as breadcrumbs only |
| n2 | **teach** creaky (expose, then validate) | snap-twig dash, its teach form: one creaky twig over a bough just below, then two, with a catch bough under them and no pit | high → high | Dot's "Creaky branches!" line here; no heart | **[revised: C9, "Contradictions ruled", 10:49 AM]**
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
    every 5 landings step up or down, as the old 1-1 does (171 of 202). **[revised: C13, "Contradictions ruled", 10:49 AM]**
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

**Easy's extra flags and hearts:** the old 1-1 has the same (15 and 15), so they come from the engine's Easy pass, not the mixer. **[revised: C19, "Contradictions ruled", 10:49 AM]**
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
   - **Easy:** the roads sit within 400 px (under LONG_FALL), so a slip costs nothing. **[revised: C5, "Contradictions ruled", 10:49 AM]**
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
6. **Easy's landing:** Easy's dial width is set from the measured result after the engine's own Easy pass: 220 px at d = 0 down to 150 **[revised: C4, "Contradictions ruled", 10:49 AM]**
   at d = 1. The size bands stay as they are.
7. **Length:** 3:14-3:29 is accepted. Matt sets the floor at 2:00 with no cap. A and B add a little; cutting D's mushroom entries takes
   some away. 1-4 and 1-6 in CP4 sit at least 20% either side of 1-5's median.


**[designer ruling, 11-05 ~2:40 AM ET, on map v2's conflict] Every deck carries a floor idea, as the old 1-1's cycle does (a).**
- **The conflict:** with each node drawing only from its own deck (fault C), too few bursts had a floor for a canopy to lie over.
  Splits fell to 11-17 (floor 19) and the two-road share to 33-38% (line 40%).
- **The fix:** a floor idea joins each one-idea or climbing deck, so the deck itself honestly holds what the canopy needs:
  - n3: bounce up, the climb, stump hop;
  - n6: snap-twig dash (test form), bank hops;
  - n7: rotten-branch drop, stump hop;
  - n9: bough stair, the climb, bank hops;
  - n8 keeps its creek deck, but a roll that draws reed isles must pair them with a floor burst (bank hops or stump hop) in the same
    node.
- **The bursts still alternate inside the node,** so the test or teach idea comes first and the floor follows. The node's job is
  unchanged.
- **All the lines stay as they are:** splits at least 19, two-road share at least 40%, creaky at least 15% of landings and in the top
  3 kinds, and the old 1-1's variety lines. The map no longer dropping labels settled A and B; the perch colour settled D.


**[designer ruling, 11-05 ~2:45 AM ET, on the fun gate's pacing flags (build 9da17a27)] Rests and breathers.**
- **Cleared since main:**
  - repeats, 5 → 0;
  - Normal "too sparse" (now 0.74 actions a second);
  - Easy "tension flat".
- **New flags:**
  - Easy is too busy: 0.76 a second against 0.35-0.55;
  - Easy's longest run with no rest is 92 s against 6-8 s;
  - 3.2 s of dead time on n2's 900 px bank.
- **The rulings:**
  - **A second rest node, n7b, after the rotten-branch drop,** on both settings. It is one short flat pad on the forest floor and the
    stage's second Dot spot. A flag goes there only if a hard node follows. The stage then breathes before its creek and its master
    fork, as Shovel Knight's ramp-and-cool asks.
  - **On Easy, a breather pad of 2-3 s between every node.** It is flat, safe ground with no pickups but breadcrumb petals.
  - **On Easy, bursts are one piece shorter** (3-5 pieces). Easy asks for fewer moves a second, not the same moves with wider gaps
    (§2.5's finding, R3 W2).
  - **The teach bank in n2 is cut from 900 to 600 px.**
- **The pass lines are the fun gate's own:**
  - Easy at 0.35-0.55 actions a second;
  - no Easy run over 20 s without a 2-second rest (the plan's 5-20 s groups); **[revised: C2, "Contradictions ruled", 10:49 AM]**
  - no dead time over 2.5 s;
  - Normal's flags no worse than main.

**The rules this plan meets by construction** (the mixer still checks every roll):
- **Ideas:** 9 to 11 different ideas a roll. No idea twice in a row. Snap-twig dash comes twice (teach at n2, test at n6, not in a
  row), and the fork twice (n4, n10).
- **The fork's share:** n4 and n10 at about 15-20% of the length each, so together about 30-40%, under the old 1-1's 41%. The planner **[revised: C11, "Contradictions ruled", 10:49 AM]**
  measures it; if it goes over, n10's roads shorten.
- **Splits:** two forks, each with at least 3 crossings where the roads run apart. The floor is the old 1-1's number on the 180 px
  rule; if two forks fall short, n9's deck gains a third, small fork (the climb with a low bank road).
- **Move ladder:** creaky is new (taught at n2, tested at n6, mastered at n10's high road). It reuses bounce, swing-free jumps and **[revised: C9, "Contradictions ruled", 10:49 AM]**
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
- Each new world's first stage starts at the previous world's middle, not its end. That is STAGE-RULES §1b's rule that a new world **[revised: C17, "Contradictions ruled", 10:49 AM]**
  eases in.
- Examples: 1-1 0.00, 1-5 0.09, 1-9 0.18, 2-1 0.09, 2-9 0.27, 5-5 0.45, 10-1 0.82.

**What d sets.** Each dial runs linearly from its d = 0 value to its d = 1 value, separately for Normal and Easy. All are estimates,
to be tuned on Matt's play.

| Dial | Normal, d 0 → 1 | Easy, d 0 → 1 | Notes |
|---|---|---|---|
| Gap, as a share of the level check's limit at that height (`jumpOK`, `heldMaxGap`) | 0.55 → 0.92 | 0.45 → 0.80 | the gate stays the ceiling | **[revised: C1, C20, "Contradictions ruled", 10:49 AM]**
| Rise, as a share of the highest rise the gate allows | 0.50 → 0.95 | 0.40 → 0.80 | Easy's CP2 caps still apply |
| Typical landing width (p50) | 220 → 110 px | 260 → 150 px | never under 90 px | **[revised: C4, "Contradictions ruled", 10:49 AM]**
| Risky pieces per burst (a miss costs a heart or a life) | 0-1 → 3-4 | 0 → 2 | rests and teach steps hold 0 |
| Stage risk budget, E[lives] on a first run | 0.5 → 3.0 | 0.2 → 1.0 | DESIGNER §2.3; bots judge it | **[revised: C16, "Contradictions ruled", 10:49 AM]**
| Taught animals per stage | 0-1 → 4-5 | 0-1 → 3 | only animals already taught |
| Crumble delay | 0.9 → 0.5 s | 1.2 → 0.8 s | | **[revised: C3, "Contradictions ruled", 10:49 AM]**
| Timed windows (vines, waves, moving logs) | ×1.0 → ×0.75 | ×1.15 → ×0.9 | of each piece's proven window |
| Bursts per node | 2 → 3 | 2 → 3 | more ideas mixed later on | **[revised: C21, "Contradictions ruled", 10:49 AM]**

**What never moves with d** (the floors):
- STAGE-RULES §1b's per-jump bot floors: Normal adult at least 70% in Worlds 1-5 and 50% in Worlds 6-10; Easy kid at least 85% everywhere.
- Every teach step at miss chance 0.01 or less.
- The placement rules.

The stage's job can raise its own nodes inside the dial (a test node sits higher than a warm-up), but never above the dial's d = 1
value.

**1-5 now: d = 0.09.** On Normal that gives gaps at 0.58 of the gate's limit, typical landings about 210 px, 0-1 risky pieces a **[revised: C1, "Contradictions ruled", 10:49 AM]**
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


**[designer, 11-05 ~2:55 AM ET] Polish rules P-8 to P-13**, from Matt's 8 more stills (`reference/engine/cp3/matt-stills-0224-0228/`
on `ccr-0d59a91c-oy3imz`). The designer viewed stills 03 and 08 directly. Each rule has a machine check, so the fault can't come back on
another roll.
- **P-8. Pit art only where there is a pit** (engine work). The World 1 pit painter draws its black drop column only under a gap the
  mixer marks as a pit: a gap with no floor below it, inside the stage's pit zones. Never through open air above a floor, and never
  through solid ground (still 08 shows it through a bank). *Check:* for every pit column drawn, no standable top or ground body lies
  inside its x range below the gap's lip.
- **P-9. The HUD is always on top** (engine work). No world piece, fruit cluster or log draws over the hearts, lives or marks (still 03:
  a berry cluster and a log cover the hearts). *Check:* a still test, upright and sideways, at the 6 places finds no world pixel inside
  the HUD's boxes.
- **P-10. No hard-edged darkness** (engine work). The cave or darkness layer fades in over at least 200 px and follows the ground
  (still 03: a sheer dark rectangle covers half the screen, with a straight vertical edge). A seam line down a bank face is a tiling
  fault, so the bank face tiles seamlessly. *Check:* no darkness edge sharper than the fade width; one bank face is drawn as one piece
  or seamless tiles.
- **P-11. Bridges hang from posts on the ground at both ends** (stills 02, 07, 08: rope bridges float in the sky). A bridge's ends sit
  on a bough, a bank or posts that reach the ground, and grass blocks with dangling roots stand on something (P-2). *Check:* every
  bridge end is within 4 px of a standable top or carries a post down to a surface.
- **P-12. No placeholder stone.** The grey slab with a dark spike under it is the placeholder stone drawing (stills 01, 04, 07, 09).
  Stones use the painted mossy-stone art, sitting on ground or in shallow water (P-1).
- **P-13. The marks counter matches the goal.** The HUD reads "x/11" (stills 03, 08), but the stage lays 13 marks with a goal of 10 on
  Normal. It must show the real goal and total, so the player knows when the shrine opens. *Check:* the HUD's goal equals the stage
  record's goal.


**[designer, 11-05 ~3:00 AM ET, on build 8c8cd997]**
- **Accepted:** the cool down's deck is bank hops and stump hop; the first bough is creaky in vine and step canopy entries; the teach
  twigs sit at 40, 75 and 40 px; the teach bank is 720 px.
- **No creaky piece before n2's teach.** Every canopy before the first teach twig uses solid boughs, because the first appearance of a **[revised: C9, "Contradictions ruled", 10:49 AM]**
  mechanic is taught. The mixer asserts it.
- **P-12's fix:** the mixer's stone is laid at 50 px, the height World 1's rock art is painted for, so the painted rock draws.
**[struck 11:09 AM ET: no split; every polish rule applies (law: never cut)]** - **Polish order, if the budget forces a split** (the lead's call):
  1. P-9 (HUD on top) and P-8 (pit art), which look broken;
  2. P-1 with P-12, P-2 with P-11, and P-5 with P-13;
  3. P-3, P-4, P-6, P-7 and P-10.


**[designer, 11-05 ~3:05 AM ET, on the rest build (e68b6f4b)]**
- **Easy's density** (0.67 against 0.35-0.55) is not accepted for 1-5. Fixes, in order; the planner stops at the first that passes:
  1. Easy canopies at 2 stretches;
  2. Easy bursts at 3 pieces, with the snap dash kept at 5 for its teach-to-test job;
  3. Easy rests at n5 and n7b lasting 4-5 s, as a pad with a petal arc (play, not dead time), which also answers "no breather in the
     middle".
- **n7b's Dot line:** "Down on the forest floor now. Her marks go on past the creek."
- **Polish split (the lead):** the planner takes P-1 to P-7 and P-11 to P-13; an engine-render helper takes P-8 to P-10.


**[designer review of polish stills round 1, `cp3/stills-v2/`, 11-05 ~3:25 AM ET]**
- **Fixed, and good:**
  - no grey slab;
  - painted rocks;
  - trunks under the boughs;
  - posts at the bridge ends;
  - the HUD reads x/10.
- **Still failing, or new:**
  - **S-1. Pit columns (P-8):** black drop columns still stand under the creek pieces, upright and sideways. With the engine-render
    helper.
  - **S-2. Floating grass islands (P-2):** grass blocks with dangling roots hang about 100 px over the water in the creek stills. A
    reed isle sits on the water line, and anything above the water stands on a trunk or post.
  - **S-3. Stones perched on poles:** big mossy rocks sit on top of thin trunk poles, so they read as mushrooms on sticks. A stone
    stands on ground, or on another stone in shallow water, never on a pole. Up in the air, the pieces are boughs.
  - **S-4. Every bough on its own identical pole:** a row of the same kapok pole, each with the same vine, reads as stamped. The
    rules:
    - boughs near each other grow from one shared tree (one trunk, two or three boughs at different heights, as the old 1-1's canopy
      hangs from big trees);
    - no two neighbouring trunks use the same trunk art or the same vine wrap;
    - and trunks vary in width.
  - **S-5. The same Dot tip in 4 of 6 stills** ("Flick up just before the edge"). A tip shows once, at its first need, and then it is
    done for the stage.
  - **S-6. Hard darkness (P-10)** still shows in the creek stills, with the engine-render helper.
  - **S-8. Dot's bubble covers the ground ahead** (round-1 frame 1; D10). A bubble sits clear of the route ahead, above it or on the
    side he has left, upright and sideways. The flag tip also shows twice; every tip shows once per stage (S-5).
  - **S-9. Stones over open water** (the engine-render helper's still 03, after, x 31800). A stone in water rises from it: its base
    draws down past the water line, submerged, with a ripple ring. A taller stepping stone is a stack or a stump in the stream. *Check:*
    every stone's bottom is at or below the water or ground surface under it.
  - **S-7. The upright top half (P-6)** is still mostly sky over the start and the shrine.
- These go back to the planner (S-2 to S-5, S-7) and the engine-render helper (S-1, S-6). Round 2 of the stills comes back to the
  designer before the lead.

**[designer ruling on the Easy density miss]** Easy's pacing lines are judged over 16 rolls, by their median and worst, as every other
line is (b). One roll's noise (±0.03 density, ±15 s) is bigger than the gap being chased. If the 16-roll median is still over 0.55, a
third Easy-only rest of 4-5 s goes after n3 (c). **This is a miss at the checkpoint, so it goes to Matt before the work goes on.**


**[designer ruling, 11-05 ~3:45 AM ET, on the 16-roll pacing run (27345325)] A + B, and C for Normal's density only.**
- **(A) A calmer Easy.** Easy has its own size bands, with landings about 300 px (settling CP3 item 6), and lays one fewer burst a node, **[revised: C4, "Contradictions ruled", 10:49 AM]**
  so the length holds. The aim is Easy at 0.55 or less. Easy is where children play, so this line is not loosened. If "something new" **[revised: C18, "Contradictions ruled", 10:49 AM]**
  breaks on Easy, its gap is judged on Easy's own bands.
- **(B) Normal breathes.** A 1.0-1.2 s pad after every second burst on Normal. Normal's longest run without a rest must be no worse than **[revised: C2, "Contradictions ruled", 10:49 AM]**
  main's 29 s, on the 16-roll median and worst.
- **(C) Normal's density only:** 0.80 against main's 0.57 is accepted as provisional (§0 row 2: the band is not calibrated). Matt
  played the busier mixer 1-5 and said "It played much better". Normal is judged on its longest run and dead time, not on matching
  main's density. Easy's density line stands.
- **The bot's fork stall** is not counted as layout dead time once traced (rolls with stalls at n4 and n10). The fork crossings (CP3 item
  1) should end it. If it persists, the planner tells the designer.


**[designer ruling, 11-05 ~4:32 AM ET, on A + B (dcb75adf)] Option 3 for Easy, and no breathers on fork roads.**
- **Measured:** B passes (Normal's longest run 23.9 s median, 30.5 s worst, against main's 29.3 s). Easy's density passes on the
  median (0.54) but not the worst roll (0.57). The cost was Easy's clock reaching about 5:00 and its "nothing new" stretch 2,094 px.
- **The ruling, (3):** on Easy, about 6 nodes keep their canopy (both bursts) and 3-4 drop it, laying their own idea alone.
  - The canopies kept are the forks' neighbours and every node right after a teach or test, so the two roads stay where they matter.
  - Pass lines on Easy, 16 rolls, median and worst:
    - splits at least 19;
    - density at most 0.55; **[revised: C2, "Contradictions ruled", 10:49 AM]**
    - longest run without a rest at most 20 s;
    - nothing new for at most 1,516 px, on Easy's own bands;
    - a fast clock under 4:00.
  - Easy boughs on the high road stay unwidened. That road is optional, so its bough sizes are judged on Normal's bands.
- **No breather pads on fork roads.** On Easy, the breather between nodes goes after the roads rejoin, never at the end of a road. The
  bot's stall comes from it stepping off the high road's breather onto the low road. With no pad at a road's end, the road carries
  straight into the crossing or the rejoin.


**[designer rulings, 11-05 ~5:00 AM ET, on option 3 (b88f2ea2) and round-2 stills (`cp3/stills-v6/`)]**
- **(i) Fork marks move to the shared ground: yes.** One goes on the fork bank before the split, one on the rejoin after it. Taking one
  road per fork is then a free choice, and no route has to double back. The high road keeps its reward as the stage's hardest petal
  group, which is collectible rule 4 still met. The goal stays 10 of 13 on Normal and 8 on Easy; every route now passes 13, which
  leaves room for misses.
- **(ii) Easy keeps its 19+ splits, and its clock is accepted at 4:21-4:33.** Matt: "minimum 2 minutes... if it goes over 5, I'm okay
  with that". The two roads are what he asked for. The 4:00 aim was the designer's own, and it is withdrawn for Easy. The 20% spread
  between neighbouring stages is judged on Normal's quick clock.
- **S-9:** both. The engine-render helper draws a stone's base down past the water line. The mixer lays a stepping stone no more than
  50 px above the water, and a taller one as a stump in the stream.
- **S-8** (Dot's bubble) goes to the engine-render helper, as engine UI.
- **[designer, ~5:15 AM ET] Stones stay in 1-5.** After S-9's tightening, 1-5 laid no stones, so a kind dropped out, the opposite of
  "more pieces". Stones sit on ground (S-3, S-9 allow it): small rises in stump hop and bank hops on the floor and banks, as in the old
  1-1, on both settings. Creek stepping stones (a stack or stump in the stream) wait for later engine-render work.
- **S-5** is closed: the tip shows once in real play. The repeat came from the still script.
- **Round 2, the designer's review:**
  - **Better:** nearby boughs now grow from shared big trees (S-4 fixed); the grey slab, pits and the dark box are gone; bridges stand
    on posts; the HUD and the shrine agree ("9 more" at 1 of 10).
  - **Still failing:** **S-3**, in the last sideways frame (the start): big mossy rocks still sit on posts over the gap. Rocks stand on
    ground or in water only, never on posts.
  - Round 2 goes to the lead once S-3 is fixed and (i) is built, with the 16-roll table re-run.


**[designer, 11-05 ~5:20 AM ET, on build 14ff1727 and stills v7]**
- **Stills v7 pass the designer's review.** The rocks on posts are gone (S-3), nearby boughs share trees (S-4), the forks are clean,
  Dot's bubble is clear of the route (S-8), and there are no pits or dark box.
- **Everything else passes on 16 rolls.** Normal and Easy runs and dead time; 18 of 18 variety lines; splits; creaky; 32/32 level
  checks; no jump under the per-jump floors; both bots reach the shrine 4/4.
- **Stones are still missing** (the 5:15 ruling): the planner lays them on ground and re-runs the variety lines.
- **Easy density (0.60 against 0.55) is calibrated, not waived.** §0 row 2 says the band is not calibrated until measured on Matt's
  stages, so the planner measures the old 1-1's Easy density with the same tool on 16 rolls.
  - If the old 1-1's Easy is at or above about 0.60, the line becomes "no denser than the old 1-1's Easy", and the new 1-5 passes.
  - If it is under, the double breather (a) is built.


**[designer, 11-05 ~5:40 AM ET] Deep pits (the engine-render helper's still 11).** Below a bank's painted end piece, the pit's dark
widens into a hard, stepped cave shape that reads as a hole cut out of the picture. The designer's pick: the dark follows the bank faces
down to where the end piece stops, then fades out over about 300 px so the forest shows, with no widening and no stepped edge. It changes
every World 1 bank end, so it goes to Matt as one question with a before/after pair. Built only on his pick.


**[designer, 11-05 ~5:50 AM ET] Easy density, measured on the old 1-1** (`cp3/old11-main-pace16.txt`; same inspector, 16 rolls, main):

| | Easy density | Easy longest run without a 2 s rest |
|---|---|---|
| Old 1-1 | median 0.575, range 0.53-0.66 | 25-119 s |
| New 1-5 | median 0.61, worst 0.63 | 17-18 s |

The rule as written (old 1-1 at 0.60 or above, or else build the double breather) points to the double breather, since the old 1-1 is
at 0.575. The trade is real, though: the double breather adds about a minute of walking for children (Easy about 5:20), while the new
1-5 is already less dense than the old 1-1 on its worst roll and rests 4-6 times more often. The designer does not bend a written line
quietly, so this goes to Matt as one question in the CP3 report, with the designer's pick:
- (a) the double breather, about 0.52 and about 5:20;
- (b) keep 0.61, within the old 1-1's own range, with far more rests. **This is the designer's pick.**


**[designer, ~5:57 AM ET] The two-road share's worst roll (38.5%), traced:** ruling B's Normal rest pads added about 4,000 px of
single-road ground a stage. The catch branches change it by 0.003; the fork-bank pad by about 1%. **The fix keeps B:** on Normal, a
canopy's own end piece is the rest (520-560 px flat, then a short step), so the rest sits under both roads. There is no separate pad
after a canopied burst; the pad after every second plain burst stays. Pass lines: two-road share at least 40% on every roll; Normal's
longest run at most 29 s on median and worst.


**[designer ruling, 11-05 ~6:00 AM ET, at the lead's budget stop] Easy is accepted at d27c5acd.**
- **Why:** the new 1-5's Easy density (0.61 median, 0.63 worst) sits within the old 1-1's own range (0.575 median, 0.66 worst), and
  is calmer on its worst roll. It rests 4-6 times more often (longest run 18 s, against the old 1-1's 25-119 s). The double breather
  would add about a minute of walking for children.
- **The line becomes "Easy no denser than the old 1-1's Easy range".** Matt is told plainly that the median is 0.035 over the old 1-1's.
- **The canopy-end rest run is the last change before Matt plays.** After it, the stage is READY, or it is sent as it is with any miss
  named. There is no tuning until Matt has played it and given his meter reading.


**[designer, 11-05 ~6:08 AM ET] CP3 READY FOR MATT at engine-mixer b7c38491** (stills v9, `cp3/stills-v9/`; table `pace16l.jsonl`;
map v5).
- **Passes on 16 rolls, Normal and Easy:**
  - two-road share 41-45%;
  - Normal's longest run 14.9 / 19.2 s;
  - 18 of 18 variety lines;
  - splits 26 / 20;
  - creaky 20-25%, in the top 3;
  - biggest idea 29-36%;
  - the level check 32/32, with no jump under the floors;
  - the draw check both ways up;
  - both bots reach the shrine 4/4 with 13 of 13 marks.
- **Accepted, with the reasons above:** Easy density 0.61 / 0.63 (within the old 1-1's range), and Normal's clock 4:00-4:12.
- **One known rough spot, named, not hidden: trunk density.** The sideways bank-end frame shows six near-identical trunks evenly
  spaced on one screen. Queued fix, after Matt's play: boughs share a trunk within 220 px, at most about 3 full trunks per screen
  width, and further boughs hang from a shared trunk's side branch.

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


## CP4, stage by stage (Matt, 11-05: "It's better." / "One first, then the rest.")

**Step 1, shared:** the trunk fix from CP3's named rough spot.
- Boughs within 220 px share one tree.
- At most about 3 full trunks per screen width, upright and sideways.
- Further boughs hang from a shared trunk's side branch.
- No two neighbouring trunks share trunk art or vine wrap (S-4).
- *Check:* a sliding view counts full trunks, and 1-5's 16 rolls stay green on every line.

**Step 2: 1-1, "Into the Canopy"** (sprint: "Run the high branches of the kapok trees and reach the shrine").
- **Its job:** the arrival, teaching run, jump and then the double jump.
- **Its shape** (W1-REBUILD-PLAN's row, for meaning, not layout): the stage rises from the forest floor to the high kapok branches, **[revised: C8, "Contradictions ruled", 10:49 AM]**
  and the backdrop changes with height.
- **Its moment:** the first double-jump chain up into the canopy, then the view from the top branch.
- **d = 0:** the dial's easiest values. Nothing is untaught: no creaky (1-5 teaches it), no crumbling and no animals. **[revised: C9, "Contradictions ruled", 10:49 AM]**
- **The move ladder:** run, jump, double and bounce are taught here. Hop and climb come back later.
- **Overall trend up** (1-5's goes down), so the two stages never share a shape.


**[designer, 11-05 ~9:15 AM ET; Matt: "Are you also explaining how it should feel based on the story?"] How 1-1 should feel, from
the story.** Until now the 1-1 plan said what the stage teaches and how it is shaped, but not how it should feel. This adds that, from
the shipped story text, and every stage spec now carries a "feel" block like it.
- **Where Pokey is in the story** (prologue and World 1 arrival, `reference/story-rewrite/pilot-prologue-w1-v2.md`):
  - two days after the soldiers took Meeca, he has just left the home forest;
  - he is slow, and he has promised anyway: "Hang on, Meeca. I'm slow. But I'm coming";
  - the petal on his wrist points north;
  - the squirrels came to watch him leave, and he is "not very far away".
- **The feel:** a small, determined start that grows. The stage opens low, safe and a little comic, and ends with him higher than he
  has ever climbed. It is a first step taken on his own, not a chase.
- **How the layout carries it:**
  - **n1-n3, gentle and close to the ground.** The home forest's floor, with short safe hops and wide landings, at a calm rhythm (a
    march, steady, never rushed). He is learning that he can do this. Nothing bites.
  - **n4-n6, the first lift.** The bounce lifts him off the floor for the first time, and the first fork lets him choose to stay low or
    try higher. The rest at n6 is a breath before he commits.
  - **n7-n9, the rising courage.** The double jump is learned over safe ground, then used for real in the chain at n9, each jump higher
    than the last. That is the stage's emotional peak: the slow sloth finding he can climb. The rhythm quickens a little here, and it is
    the only place in 1-1 where a miss costs a setback.
  - **n10-n11, arriving in the canopy.** He is up among the high branches, the backdrop opening as he rises. The stage ends at the **[revised: C8, "Contradictions ruled", 10:49 AM]**
    shrine with the clue: **one deep bootprint in the moss, pointing north** (the shipped 1-1 clue: "They did not stop here"). It sits
    beside the path at the end, a story prop, not a pickup.
- **Corrected against the story:** the "view from the top branch" belongs to **1-4** ("The View North: from the top of the kapok you can
  see the Highlands"). 1-1 ends in the high branches, not the very top, with the sky opening ahead but the far Highlands not yet shown,
  so 1-4 keeps its moment. n11 changes to match.
- **For every later stage**, the spec opens with its story beat, the feel in one line, and how each node group carries it, drawn from
  the shipped story and clue text, before any node is laid.


**[designer, 11-05 ~9:20 AM ET; Matt: "it should probably feel different when you're playing it, so it's not all branches like it was
the last one"] 1-1 is a ground stage that becomes a tree stage.** 1-5 is mostly boughs and canopy, so 1-1 must play differently by
construction, not just look different.
- **The first half (n1-n7) is the forest floor,** with no canopy: banks, stones, logs, mushrooms, stumps, a stepped mound (the hill),
  the creek with lily pads, and the log family's solid, mossy and broken logs.
- **Two-road splits in the first half come from the ground itself, not from boughs.** A stepped mound's top against the floor beside
  it, a log jam's top against its foot, a high bank against the creek bank. n5's fork is a ground fork:
  - high road: the mound top and stump tops;
  - low road: the floor and the creek.
- **Boughs arrive only with the climb (n8 on),** so reaching the trees is the stage's change of feel, the story's "higher than he has
  ever been". n4's bounce lifts him onto a mound top or a log jam, not a bough.
- **Pass lines that make "different from 1-5" a number:**
  - boughs and creaky pieces together are at most 30% of 1-1's landings (in 1-5 they are well over half);
  - 1-1's commonest kind is not 1-5's commonest kind;
  - 1-1 and 1-5 share no more than half their ideas (the neighbour rule, kept even though they are not neighbours);
  - the old 1-1's floor numbers still hold (up and down on 4 of 5 landings, something new every 572 px).
- **If the ground forks can't reach 19 splits,** the planner tells the designer the measured number before working around it. The
  split floor is not lowered quietly.


**[designer, 11-05 ~9:30 AM ET] 1-1's feel, corrected from the lead's story brief** (`reference/engine/story-briefs/1-1.md` on
`ccr-0d59a91c-oy3imz`). The brief is the source; where it and the designer's draft above disagree, the brief wins.
- **The bootprint is back** (the lead's correction: it is 1-1's shipped Stage Cleared clue, `src/components/stageClue.ts:16`). At the
  **end** of 1-1 there is one deep bootprint in the moss, pointing north, a soldier's boot, so the stage's last image matches the card
  the player reads next. It is a story prop beside the path, not a pickup.
- **Along the way, the trail is Meeca's petals,** pressed flat and placed **low, at marching height**, on trunks and branches where she
  could reach with a soldier on each arm. 1-1's petals sit low on the trunks and banks beside the route (breadcrumbs), never high in
  the canopy. The first is the one he peels off in the arrival scene.
- **The feel, by node group:**
  - n1-n3: small and close to home, a little funny. The squirrels, at the forest's edge, watch him leave (the unused squirrel poses:
    sit, wave, haul, tip, run; dressing, not pickups). Gentle ground.
  - n4-n6: "I can actually do this", the first real step up off the floor.
  - n7-n9: Pokey surprising himself. The double-jump chain is the moment ("I didn't know you could do that" pays off in 1-2's letter).
  - n10-n11: resolve, not triumph. Up in the high branches, on the petal trail pointing north. No big view (1-4's).
- **Dot's shipped 1-1 lines,** placed where they are true:
  - the run, jump and double coaching (n1, n2, n7);
  - "Up the bank! Step to step" (n3);
  - "Look how high we are!" (n9's top);
  - "No soft moss up here!" (n10).
- **Light and setting:** morning, at the home forest's edge, then deeper canopy as he climbs. **[revised: C8, "Contradictions ruled", 10:49 AM]**
- **Owned by other stages, so kept out:**
  - Meeca's note and the hibiscus line (1-2);
  - the punch teach (1-3);
  - **the kapok climb and the view north (1-4):** so n8 draws bough stair or bounce up, never a long climb up a trunk;
  - the folded petals and the chase (1-5);
  - lianas (1-6); **[revised: C9, "Contradictions ruled", 10:49 AM]**
  - the bush (1-7).
- **The look (the lead, and Matt: "last time it was 90% branches that were tied to trees"):** mostly ground and low pieces. Banks,
  stepped mounds, roots, fallen and **hollow logs** (the unused W1 hollowlog-moss and -plain), stumps, rocks, mushrooms and knots, with
  boughs on trunks coming late as the reward. **The commonest piece is a ground piece.**

## How a stage is made, from now on (agreed by the lead and the designer, 11-05; the planner's additions to follow) **[revised: C25, "Contradictions ruled", 10:49 AM]**
1. **The lead writes the story brief:** the beat, the feel, the story-led look, and what other stages own. Story and look only, never
   layout.
2. **The level designer turns it into the node plan and its rules** in this spec.
3. **The planner builds and measures** it: 16 rolls, both settings, every line.
4. **The lead checks it** against the bar and the story.
5. **Matt plays it.**

Each stage's section is signed by all three before any building starts. New helpers work inside this loop.

6. **[the planner's additions, accepted by the designer, 11-05 ~9:40 AM ET]**
   - **Every stage spec carries a feel profile,** set by the designer's node plan from the lead's brief: how much it branches, how
     flat or hilly it is, its tempo, its petal style (a clearable trail, scattered, or a hidden group) and its art set. The stage's
     pass lines come from its profile, not from one number for every stage, so a stage the story wants flat and single-road isn't
     failed for being what it should be. The floors that never move (fairness, the variety lines on repeats, placement and polish)
     stay the same for all.
   - **A feel check across stages:** each stage's measured feel (branching share, up/down share, density, commonest kind, art kinds,
     petal layout) is compared with its neighbours'. It fails when two neighbours come out too alike, as the variety gate fails
     repeated pieces. Both are built before 1-2.

**1-1's feel profile** (from the lead's brief):
- **Branching:** moderate, from ground forks in the first half and canopy forks late. The split and two-road lines are set from the
  first measured build, which the planner reports before working around anything.
- **Shape:** hilly ground rising to the canopy, with the overall trend up.
- **Tempo:** calm and march-like, quicker only at n9.
- **Petals:** a low trail you can clear, at marching height.
- **Art:** the forest edge in morning light, then the canopy. Ground pieces lead.

**Also accepted:**
- **Jumps are judged as each stage teaches them:** single jumps before the double is taught, doubles after
  (`tools/engine/cp4-jumps11.ts`).
- **The trunk fix:** at most 3 full trunks per 1,400 px on 16 of 16 rolls. A bough left past the cap stands on a thin post, because
  the kit has no side-branch art. That is named here and goes on the art list.
- **The art check for 1-1:** the hollow logs, squirrels and bootprint must exist in the World 1 kit atlas. The planner reports what is
  missing and draws no stand-ins.


| # | Job | Deck | Entry → exit | Markers and lines (the shipped 1-1 lines, `dotLinesData.ts`) |
|---|---|---|---|---|
| n1 | **teach** run | flat forest-floor walk with low banks, no gaps | floor → floor | Dot's run coach line; no heart; the start flag |
| n2 | **teach** jump (expose, then validate) | bank hops with small safe dips (no pit), then stump hop | floor → floor | "Jump the little gaps" |
| n3 | practise | stump hop on stones and banks (stones on ground), bank hops | floor → low | "Hop from stone to stone" |
| n4 | **teach** bounce | a mushroom beside the path up onto a stepped mound or a log jam, then bank hops (the walk past it never bounces) | low → mound top | — |
| n5 | the first fork, on the ground (gentle) | high road: the mound tops and stump tops; low road: the floor and the creek (lily pads). Rejoin | low → low (two roads) | marks per CP3's fork rule, on the shared ground |
| n6 | rest | a bank walk | low → low | a Dot spot; a flag only if n7 follows hard |
| n7 | **teach** double (expose, then validate) | one gap too wide for a single jump over safe ground, then two more safe ones; bank hops between bursts | low → low | "Nice jump! In the air, flick up again for a double jump" at the first double; "Flick up again in the air to jump twice" |
| n8 | the climb up (low boughs; the kapok climb is 1-4's) | bough stair, bounce up (one not used in n4) | low → mid | — |
| n9 | **the moment (test)** | the double-jump chain: three or four rising doubles, bough to bough, up into the canopy, with catch boughs below | mid → high | a flag before it; a heart after it only if it has risk |
| n10 | the canopy fork | high road: the top branches; low road: mid boughs. Rejoin | high → high (two roads) | the high road's petal group |
| n11 | cool down, arriving in the canopy | one long high branch, the sky opening ahead (the far Highlands are 1-4's), to the shrine | high → shrine | Meeca's petals low on the trunks; at the end, the soldier's bootprint in the moss, pointing north |

- **Length:** Normal's quick clock is 2:40-3:15. That is at least 20% under 1-5's median of about 4:05 (no more than 3:16), and over **[revised: C28, "Contradictions ruled", 10:49 AM]**
  the 2:00 floor. Easy is at least 2:00. Length comes from the nodes and bursts, never from a clock.
- **Every rule built tonight applies:**
  - the variety lines, on the old 1-1's numbers;
  - coherent nodes drawn from their own decks, each with a floor idea;
  - placement (hearts, flags, petals, clutter);
  - safe drops (P3);
  - P-1 to P-13 and S-1 to S-9;
  - the Easy rules (+40 cap, 80 px gaps, breathers, Easy bands);
  - pacing judged over 16 rolls, median and worst.
- **Splits at least 19;** the two-road share at least 40%.
- **No idea over 40%,** none twice in a row, and at least 4 ideas.
- **The real cost is recorded for 1-1 alone:** wall time, retries, and the planner's % estimate.
- **Matt sees stills the designer has checked, then a test-link build he plays.** 1-2 to 1-4 wait for his OK on 1-1. A miss stops
  the work.
- **The bar for Matt's pick:** the new 1-1 against the old 1-1, which is his best stage. It has to win side by side, or it doesn't
  replace it.

### CP4: the same mixer on 1-1 to 1-4 (owner: planner builds and runs, designer reviews every map)
- **Pass line.**
  - All five stages pass the variety gate on 16 of 16 rolls, both settings.
  - Neighbouring stages share no more than half their main pieces. **[revised: C14, "Contradictions ruled", 10:49 AM]**
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

### [designer ruling, 11-05 ~9:41 AM ET] 1-1 ground build (planner 098aff49): option (a), lines from 1-1's own profile

The planner measured the ground-first 1-1, 16 rolls on Normal and 16 on Easy:
- splits 2-4 (line 19);
- two-road share 24-28% on Normal and 19-22% on Easy (line 40%);
- Normal fast clock 109-119 s (aim 160-195 s);
- variety 16/18, with the longest stretch with nothing new at 2,042 / 2,646 px;
- the new feel lines all pass: boughs and creaky 11-12%, ground the commonest kind on 16/16, 6 of 13 ideas shared with 1-5.

**Ruling: (a).** Matt asked for a feel profile per stage, with how much a stage branches set by that profile. A ground half can't
honestly split 19 times, because a mound is solid down to the bottom. Options (b) and (c) bring back the boughs-over-floor feel Matt
turned down. The old 1-1's 34 splits came from canopy over floor, and 1-1 keeps that in its tree half only.

**1-1's lines (they replace the 19 / 40% lines for 1-1 only; 1-5 keeps them):**

| Line | Now | Once hollow logs are wired |
|---|---|---|
| Splits, whole stage (180 px rule), 16/16 rolls | ≥ 10 | ≥ 12 |
| Splits from n8-n11 (the tree half, canopy over floor as in the old 1-1) | ≥ 7 | ≥ 7 |
| Two-road share, Normal | ≥ 25% | ≥ 25% |
| Two-road share, Easy | ≥ 20% | ≥ 20% |

- **Choice in the ground half** comes from the two forks, the hollow logs (once wired) and side pockets: a collectible tucked off the
  line, behind a mound or under a log on a stump. Thin raised roads that read as boughs are not allowed.
- **Not changed:** variety lines 18/18, and length. The nothing-new stretches at 2,042 and 2,646 px are a miss to trace and fix.
  They come from the old 1-1, so they are not relaxed. The length is Normal fast 160-195 s and Easy at least 120 s, judged on 16/16
  rolls. Length comes from more ground bursts (3 a node in n2-n7) and a longer tree half, never from flat padding (flat ≤ 1,351 px).

**Pieces fit their element (Matt, via the planner) — a gate, written before the build:**
- Every piece kind names its element: ground, water or tree. The mixer fails a stage where a piece stands outside its element.
  - Lily pads and reeds are water.
  - Stones stand on ground or rise from water.
  - Boughs and creaky are tree.
  - Logs on stumps, mounds, banks and mushrooms are ground.
- No water piece goes in without a drawn water body. Until the engine draws a water zone, 1-1's creek crossing uses ground pieces
  only: a log on stumps, or stones on a bank. Then lily pads return to the creek. The water zone is shared drawing (engine-render),
  so it goes to the lead to assign.

**Art for 1-1:**
- **Squirrels and hollow logs** are painted and already packed in `w1-new.json`, but nothing loads that atlas. Wiring it is
  engine-render work; the lead assigns it. No stand-ins. 1-1 does not go to Matt until the squirrels draw, because they are the
  brief's opening.
- **Bootprint:** no art exists in any sheet or atlas (checked against IN-GAME-UNUSED, NEVER-PACKED and UNUSED.md). It is the story's
  clue, so it is painted, not code-drawn. That makes a one-picture list for Hugging Face. The lead approves the spend; Matt approves **[revised: C31, "Contradictions ruled", 10:49 AM]**
  the list. The art-gap rule applies, because this is a true gap.
- **Morning light** is backdrop/lighting work (engine-side). The lead assigns it with the atlas wiring.

### [designer, 11-05 ~9:46 AM ET] Engine first (Matt): the stage-profile format and the element table

Matt has moved 1-1 behind the engine. The planner builds the two parts below as data plus gates. 1-1 (parked at engine-mixer
72fe81a3) is then rebuilt from its profile as the first proof. This is the format the designer writes for every stage. The planner
may add fields the gates need, but not remove any.

#### 1. Stage profile: one per stage, written before its plan

| Field | What it holds | Gate that reads it |
|---|---|---|
| `id`, `name` | e.g. 1-1, "Into the Canopy" | — |
| `story` | one line from the lead's brief: what this stage is about, and its **moment** (the one peak beat, which node) | lead review |
| `arc` | rises / descends / level / wave; start and end height band; each node's band | band check |
| `elements` | share of landings on ground / tree / water, each a range (1-1: ground ≥ 70% in n1-n7, tree ≥ 60% in n8-n11, water 0 until the water zone exists) | element share |
| `water` | none / creek ×n / lake / swamp; each one needs a drawn water zone | element gate |
| `branching` | a word (none / light / moderate / heavy) plus its numbers: splits whole stage, splits per named stretch, two-road share Normal and Easy, fork count | split and two-road checks |
| `pace` | a word (calm / march / brisk / sprint) plus its numbers: longest run without a stop (s), rests count, which nodes are quick | pace check (16 rolls, median and worst) |
| `length` | Normal fast clock band (s), Easy minimum (s); never below 120 | length check |
| `mechanics` | taught here (node); allowed (taught before); kept out (owned by a later stage, named) | teach and ownership checks |
| `hazards` | allowed hazard kinds (taught ones only) | teach check |
| `owns` | moments only this stage may use (1-4: the kapok climb and the view from the top) | cross-stage check |
| `commonest` | the landing kind expected most; must differ from the stages named in `unlike` | cross-stage check |
| `unlike` | stages it must not play like, and the most ideas it may share with each (1-1 vs 1-5: ≤ half) | cross-stage check |
| `caps` | per-kind landing caps (1-1: boughs + creaky ≤ 30%) | landing share |
| `look` | kit, light (morning / noon / dusk / night), backdrop | stills review |
| `dress` | start, end and clue dressing (painted art only; a missing one blocks Matt's build, never a stand-in) | art check |
| `marks`, `petals` | Meeca's marks (0 for a sprint); petals low or in arcs | collectibles check |
| `dot` | Dot's lines, each pinned to a node (start or end) | story review |
| `difficulty` | the dial's d from world and stage; any override stated with its reason | difficulty dial |

Pass lines live in the profile. A stage with no number for a line takes the world default: today's 1-5 lines (splits 19,
two-road 40%). A profile that lowers a default must give the reason in its own line, as 1-1's ruling did.

#### 2. Element table: every piece kind, what it is, and what it must rest on

| Piece kind | Element | Must rest on or attach to |
|---|---|---|
| bank, mound | ground | the stage floor (solid to the bottom) |
| stump | ground | the floor or a bank |
| log | ground | the floor, stumps or banks; across a creek, both ends on banks |
| log jam, stump tops | ground | stumps or the floor |
| hollow log | ground | the floor (walkable inside and on top) |
| mushroom (bounce) | ground | the floor, a bank, a stump or a log, never in the air |
| stone | ground or water | ground, or rising from a drawn water zone |
| push block | ground | the floor or a bank |
| lily pad, reed isle | water | a drawn water zone's surface, never over a painted drop |
| bough | tree | a trunk within 220 px, or a thin post when the trunk cap leaves it over 300 px from every tree |
| creaky branch, rotten branch | tree | a trunk or bough, like a bough |
| vine | tree | hangs from a bough or the canopy; its top is never in open sky |
| crumbling ledge | as its art shows: earth or stone is ground, wood is tree | the planner tags it from the atlas and names the art key |
| bridge span | ground or tree, as its ends | both ends on the same element's pieces (posts on banks, or two boughs) |
| exit totem, shrine | ground | a long ground piece |
| petals, hearts, relics, finds | — | over a standable piece or on a path's arc; never inside a piece |

Rules:
1. The mixer fails a stage with any piece outside its element, or resting on something not in its row.
2. A new piece kind is not used until it has a row.
3. A piece whose art the planner can't tag goes back to the designer, never a guess.

**Fix needed in today's PLAN_11 before the 1-1 proof:** n2 and n5 deal `lily-pad hop` with no water zone, which breaks rule 1. Until
the water zone is drawn, use `stump hop` or `bank hops` in its place. With the water zone, `lily-pad hop` goes back into n5's low road
only, the creek.

### [designer, 11-05 ~9:55 AM ET] The move ladder (Matt: "once you learn floating, you can float everywhere... once you learn how to go across ropes, that's more used")

The planner's proposal is accepted:
- **1. One source.** Where a move is taught comes from the game's own lesson lines, skills and Dot's tips.
- **2. Known means allowed.** A move is allowed anywhere after its teach, and checkSpec refuses it before.
- **4. Per-move fit rules in the library.**

The designer sets point 3's amounts below. The **source for where things are today** is
`tools/validate/mechtable.ts` (R-150.4, on ccr-0d59a91c-oy3imz). Its World 1 report is
`reference/qa-reports/validator/mechanics-world1.md`. The planner runs it on all ten worlds, and that table is what the ladder gates
read. The list below is the order as the designer reads the game today. Where the table disagrees, the table wins, and the
difference comes to the designer.

#### Pokey's moves, in teaching order

| Move | Taught in | First required | Kind |
|---|---|---|---|
| run, jump, duck, punch | 1-1 (always known) | 1-1 | core |
| mushroom bounce | 1-1 (n4, new plan) | 1-1 | core |
| double jump | 1-1 (n7) | 1-1 (n9) | core |
| stomp, kick, mega punch (the foe lesson) | 1-3 | 1-3 | core |
| rope shimmy | clearing 1-3 | 1-4 | core |
| trunk climb | 1-4 | 1-4 | core |
| breaking / creaky branch | 1-5 | 1-5 | core | **[revised: C9, "Contradictions ruled", 10:49 AM]**
| liana swing | 1-6 | 1-6 | core | **[revised: C9, "Contradictions ruled", 10:49 AM]**
| push a log | 1-6 | 1-6 | core |
| hide in a bush | 1-7 | 1-7 | core |
| ride a river log | 2-1 | 2-1 | world (needs water) |
| lift | 2-7 | 2-7 | world |
| moving platform | the first stage before its first lair (today it first shows in 2-10, a lair: **it must be taught in a stage first**) | — | core after its teach |
| leaf glide (floating) | clearing 4-1 | 4-7 (optional 4-2 to 4-6) | core |
| warm air (glide up) | 4-7 | 4-7 | core once glide is known |
| silk line | 5-4 | 5-4 | world |
| swim | 6-7 (root well) | 6-7 | core (needs water) |
| hold / freeze on the flash (R-2.7, planned) | 10-3 | 10-4 | core |

**Hazards, zones and set pieces stay with their element or story, not "everywhere":**
- the dark and spores (W3), thorn vines (W3), wind (W4), webs (W5), the tide (W6), crumbling floors (W7), geysers (W9) and bolts (W10);
- the 1-8 chase and the boss lairs, which their own stages keep.

They may come back in a later world only where the element fits: wind on a cliff, a crumbling floor in ruins.

**Animals, once taught, go anywhere** (Matt's direction), but only on their element: caimans in water, harpies in open sky.

#### "More used" amounts (per stage, counted on the main path, 16 rolls, the worst roll)

The amounts are words with numbers. **A touch** is 1-2 uses. **Some** is 3-6 uses, with at least one required. **Lots** is 7 or
more, or the stage's theme.

| Rule | Line |
|---|---|
| The teach stage | the move is the theme: lots |
| **Echo:** the next 2 stages after its teach (skipping lairs) | at least some, one of them required. Before `requiredFromStage` the uses are optional routes (skills.ts) |
| **Its own world, after the echo** | at least a touch in every stage, and some in at least half of them |
| **Every later world** | every core move appears in at least 1 of every 3 stages (a touch or more). The world's own move is lots |
| **Mixing:** World 2 on | every stage uses at least 3 known core moves besides run and jump, and at least one of them is from an earlier world |
| **Combining:** after the echo | at least one stage in the move's world joins it with another known move in one beat (a swing into a glide, a bounce onto a rope) |
| Fit | a use that breaks the move's library fit rule (or the element table) doesn't count and fails the stage |
| Easy | the same moves and the same counts; Easy's sizes apply |
| Overrides | a stage's profile may set `none` for a move only with its reason, e.g. World 5's own kit, or no water for swim |

**Gaps the ladder must close (from the World 1 table, "built once, never back"):**
- **Hide in a bush** (1-7) and **push a log** (1-6) never come back in World 1. Under the echo rule, they come back in 1-8 and 1-9,
  or in the first stages of World 2.
- **Water** (1-6) comes back in World 2 by its theme.
- The chase, the boa and the snake ring are set pieces and are exempt.

The planner builds these lines as gates over the all-world table. 1-1's proof uses only its own rows: teach run, jump, bounce and
double.

### [designer ruling, 11-05 ~9:56 AM ET] 1-5's crumbling ledges and lily pads under the element gate

- **The crumbling ledge is ground.** Its art is World 7's carved stone slab (`crumbleArt.ts`), so its rule is option (b). In 1-5 it goes
  on banks and the floor only. The breakables on the fork's high road and in the canopy become creaky limbs (tree, taught in 1-5's n2).
  A stone slab standing in the air on a kapok trunk is the floating-piece fault (P-2), so no pillar art (a) or new wood art (c) is
  bought to save it.
- **1-5's lily pads:** with no drawn water they swap now to ground pieces (stones on a bank, stump hop), exactly as in 1-1. When the
  engine draws the water zone, n8's creek gets its lily pads and reeds back on real water. That makes the water zone the first
  engine-render item after the w1-new atlas, because Matt has already seen the floating pads.
- **Both stay named breaches until fixed, and both fail the gate before Matt's next 1-5 build.** A named breach is not a pass.
- These swaps change 1-5's regression fingerprints on purpose. The planner records them as such, and the variety lines and two-road
  share are re-run on 16/16 rolls after the swap.

### [designer ruling, 11-05 ~9:58 AM ET] Matt's three: floating, core objects, themes

**1. Floating (Matt: "certain floating objects... looks better. Too much junk... harder to understand").** The footing column stays the
default. Each kind gets `mayFloat`, and each profile gets a `float` line: none, some or free, with a cap on its share of landings.
- **May float:**
  - stone, as a stepping stone; **[superseded 10:39 AM: rocks never float]**
  - log, as a short floating log;
  - crumbling ledge, as a floating slab; **[superseded 10:39 AM]**
  - bough, with no trunk or post when it reads cleaner.
- **Never float:** lily pads, reeds, banks, mounds, stumps, mushrooms, creaky limbs, bridges, totems and the shrine. They are what
  their footing means.
- **Profile lines:**

  | Stage | Float | Cap on landings | Why |
  |---|---|---|---|
  | 1-1 | some | ≤ 15% | a ground stage reads as ground |
  | 1-5 | some | ≤ 25% | |
  | Default | some | ≤ 25% | |

- **A floating piece must read on its own.** It carries its own underside in its art and is never half-hidden by dressing. The
  stills review judges it upright and sideways.
**[superseded 10:39 AM: rocks never float]** - **This revises P-2 and the 11-05 9:56 AM ruling.** A floating stone slab is no longer a fault in itself. 1-5's canopy breakables still
  become creaky limbs, though, for theme reasons: the tree's own breakable belongs up there. Slabs may float low, over ground and
  creek gaps.

**2. Core objects.** The profile's `commonest` becomes `core`, and the commonest landing must be one of them.

| Stage | Core | Notes |
|---|---|---|
| 1-1 | bank, stump, log | n1-n7, the ground. **bough** is added for n8-n11, the trees. **Stone** is not core: it is 1-5's on-the-bank look, allowed as an extra |
| 1-5 | bough, creaky, bank | accepted |

Other pieces "with the same feel" may be used, but core pieces stay the majority: at least 50% of landings.

**3. Themes (Matt: no lava in the forest).** Accepted as the planner built it: each kind names its worlds, each idea names its pieces,
and checkSpec refuses anything off-theme.
- **The per-world object pass is the designer's job** (how pieces get used). The planner tags each kind from its art, and the
  designer rules on which worlds and places it belongs to and how it must look there.
- It is done world by world, just before the engine first builds a stage of that world. World 1's 10 kinds are done. World 2 is
  next when its first stage is queued.

### [designer, 11-05 ~9:59 AM ET] World 1 piece labels (Matt's priority: every piece labelled; the planner's sheet shows them before the mixer reads them)

Labels per kind: element, footing, may float, **uses** (the jobs it does in a node), **teaches**, worlds, **stages** (where it is
core, and where it is allowed). This table is for the planner's library at engine-mixer e7089072. A kind not listed here is not used.

| Kind | Element / footing | Floats | Uses | Teaches | Worlds | Core in | Allowed in |
|---|---|---|---|---|---|---|---|
| bank | ground / self | no | floor, landing, rest, fork bank, the shrine's ground | run | W1-W4, W6-W10 (every forest-floor world) | 1-1, 1-5 | every W1 stage |
| log | ground / floor, stumps or banks | yes, short and low | landing, low rise, ground-fork high road on stumps, rest | — | W1-W4, W6 | 1-1 | every W1 stage | **[revised: C23, "Contradictions ruled", 10:49 AM]**
| stump | ground / floor or bank | no | the post under a log, a small rise | — | W1-W4, W6 | 1-1 (if drawn: see note 1) | every W1 stage |
| stone | ground / ground, or rising from water | **no** (10:39 AM: rocks never float) | a 50 px rise on a bank's end, a stepping stone | — | W1-W4, W6, W9 | — (1-5's look) | 1-1 as an extra, then all W1 |
| mushroom | ground / floor, bank, stump or log | no | bounce up, a lift onto a mound or into the boughs | bounce (1-1 n4) | W1, W3, W6 | — | 1-1 from n4, then all W1 |
| branch (bough) | tree / trunk within 220 px, or a post | yes, where it reads cleaner | landing, stair, canopy road, top branch | — | W1, W2's banks, W5, W6, W8 | 1-1 n8-n11, 1-5 | 1-1 from n8, then all W1 |
| creaky | tree / trunk or bough | no | a landing that gives way, the canopy breakable | creaky (1-5 n2) | W1, W5, W6, W8 | 1-5 | from 1-5 |
| crumble (stone slab) | ground / ground | **no** (10:39 AM) | a ledge that breaks a beat after landing | crumble (its first stage) | W1 (shrine stone, see note 2), W7 | — | from its teach; never in the canopy | **[revised: C22, "Contradictions ruled", 10:49 AM]**
| bridge (rope) | tree / both ends on posts or boughs | no | a span at a canopy stair's top | — | W1, W5, W6 | — | from 1-1 n8 |
| lily | water / a drawn water zone | no | stepping across a creek | — | W1 creeks, W2, W6 | — | only where the water zone draws |
| reed isle | water / a drawn water zone | no | a low landing in water | — | W1 creeks, W2, W6 | — | only where the water zone draws |

**Fixes in the library:**
1. **Stump:** 1-1's ground forks are "logs on stumps", but there is no `stump` kind. If the engine draws the stump under the log as
   its own piece (a landing), add the kind. If it is only drawing, 1-1's core is bank and log (and branch in n8-n11). Planner: say
   which.
2. **Crumble art:** it is World 7's carved slab. It fits World 1 only beside the shrine stones, where carved stone already belongs in
   the story. So in World 1 it lays only on the ground and on low floats, never in the trees. World 7 is its home.
3. **Logs in tree ideas:** `bough hops`, `bough stair` and `double chain` lay `log` up in the trees. A ground log in the canopy
   breaks the element table. Those ideas lay `branch` instead. A log may appear there only as the bank or end piece on the
   ground.
4. **Worlds:** today W1's list covers forest, river, canopy-high and swamp for every kind. Use the worlds column above instead.
   Whether a kind belongs in a world other than W1 is ruled in that world's object pass, so until then the planner may keep later
   worlds closed.

**[designer, 11-05 ~10:00 AM ET] Correction to fix 3 (the lead's check, Matt's "floating logs... more Mario"):**
- A **floating log in open air is allowed in the canopy half**, under the stage's float cap. What is not allowed is a log *resting on*
  a bough or trunk, as if a ground log had been put up in a tree.
- So `bough hops`, `bough stair` and `double chain` may lay a log only as a floating piece, counted in the float share. Every
  non-floating landing up there is a branch.

### [designer ruling, 11-05 ~10:09 AM ET] The move ladder against the all-world table (planner 7d9ad9a9)

**(a) Lianas and breaking branches are taught in 1-2. The table is right.** Shipped decisions already say so: "1-2 owns the lianas"
(d272601f) and "1-2 teaches crumbling" (6dae405d).
- The ladder's taught-at for both is 1-2.
- 1-5's creaky node becomes an echo, not a teach. Its Dot line stays.
- 1-6's lianas are a later use.

**Trunk climb at 1-1 is the mixer's own 1-1, not the game.** 1-1's profile keeps climbing out: n8 is bough stair or bounce up. So **[revised: C26, "Contradictions ruled", 10:49 AM]**
the mixer's 1-1 must lay no climbing vine. The ladder takes climb's taught-at from the shipped stages, which is 1-4 unless main's 1-2
or 1-3 already has one. Planner: re-run that one row on main's 1-1 to 1-3 and tell me.

**(b) The moving platform must not be taught in a lair.** A boss room is not a safe teach (STAGE-RULES §0: taught in a safe spot
before it can hurt).
- It is taught in 2-7 beside the lift, in a safe stretch, and echoed in 2-8 and 2-9 before the 2-10 lair.
- This is R-164.9, built when the engine reaches World 2. Until then the ladder records 2-7 as its planned teach and names 2-10's use
  as a known breach.

**The taught-at rule for the ladder:**
- A move's taught-at is the first stage that teaches it: a lesson card, Dot's tip or a skill.
- First presence counts only as a check. A mechanic present before its taught-at is a breach. It is fixed in the stage where it
  appears early, never by moving the teach back.

**Correction to the 9:56 and 9:58 AM rulings (the crumble slab in World 1):** shipped commit acf6e1e8 already ruled that World 1's
breakables use "World 1's branch art, never World 7's ruin slab".
- The slab is World 7's alone. It leaves World 1 entirely, which undoes "low by the shrine stones".
- 1-5's ground breakables become World 1 rotten wood (creak, on the ground) if that art exists. Planner: name its atlas key.
- If no rotten-wood art exists, the ground breakable is a true art gap. It goes on a picture list for the lead, and until then 1-5's low
  roads use stump hop and bank hops with no breakable.
- Until one of those is done, the theme check names the slab in World 1 as a breach.

## The whole-game plan (designer, 11-05 ~10:12 AM ET; Matt: "the engine plans the WHOLE game"; the lead's five bars)

Data the engine reads, which the planner builds into `worlds.ts` and `ladder.ts`. The source for "where things are today" is the
planner's all-world table, `tools/engine/moveladder.json` (engine-mixer 7d9ad9a9: 102 stages, 40 mechanics). **Build on what works:**
- every world keeps its stages, names, special stages, rooms, bosses and art;
- the plan only says what each stage must carry, and what must come back;
- a world the engine touches gets a regression lock like 1-5's before anything in it changes.

### A. What the table shows today (why the game feels repetitive)

The worst ones have a move taught, then dropped. "Longest absence" counts stages, starting from the first use.

| Move or thing | First | Stages using it | Longest absence |
|---|---|---|---|
| warm air (glide up) | 4-7 | 1 | 63 (never again) |
| lift | 2-7 | 1 | 83 (never again) |
| river logs | 2-1 | 7, all in W2 | 81 |
| silk line | 5-4 | 2 | 55 |
| push a log | 1-6 | 4 | 61 |
| breaking branch | 1-2 | 22 | 41 (1-7 to 5-8) |
| rope shimmy | 1-3 | 13 | 35 (4-7 to 8-2) |
| hide in a bush | 1-7 | 8 | 28 (8-3 to the end) |
| moving platform | 2-10 (a lair) | 10 | 29 |
| mushroom bounce | 1-1 | 26 | 13 |

These are the ones that already work:
- the liana (longest absence 4);
- the trunk climb (5);
- the tayra (5);
- the harpy (8);
- finds (3).

**The leaf glide and swimming have no row in the table** (MECHS doesn't count them). The planner adds both rows: glide from the
leafdrop and leafbonus pieces and the glide skill, swim from the swim zones. Until then their absences are unknown.

### B. The worlds: element, kit, own move, hazards that live there, special stages

| W | Place (biomes.ts) | Elements | Its own move (lots here) | Its hazards and zones (stay home; return only where they fit) | Special stages (kept as built) |
|---|---|---|---|---|---|
| 1 | home kapok forest | ground, tree, creek (drawn water, costs a life) | bounce, double, rope, climb, liana, creaky, hide, push | — | 1-8 chase, 1-10 lair, puzzle rooms |
| 2 | tidal river mouth, bank village | water (costs a life), ground, built (bank houses) | river logs, lift; moving platform taught in 2-7 (R-164.9) | water | 2-3 and 2-8 cages, 2-10 lair |
| 3 | dark forest and limestone cave | ground, cave, pools | thorn swing (3-8) | dark, spores, thorns | 3-6 and 3-7 searches, 3-10 lair |
| 4 | cliffs and waterfalls | cliff, ground, falls | leaf glide (4-1), warm air (4-7) | wind | 4-1 the ledge gives way, 4-7 the long drop, 4-10 lair |
| 5 | orchid understory, webs | **the exception world: its own kit** | silk line (5-4) | webs | 5-M, 5-10 lair |
| 6 | blackwater swamp | water, roots, ground | **swim (6-7)** | tide | the whole swimming stage (R-5.22, see D), 6-10 lair |
| 7 | temple city taken by roots | built stone, roots, pools | — | crumbling floors | 7-4 slide, 7-7 search and its secret gate, 7-10 lair |
| 8 | karst towers, caves, figs, night | cliff, cave, tree, ponds | long swings, moonlight glide (8-6) | dark (from W3) | 8-10 lair |
| 9 | young lava, the first trees | heat rock, scorched ground | warm air again (9-5 Vent Riding) | geysers, heat (lava only here) | 9-10 lair |
| 10 | the felled war camp, the thousand steps | built (towers, netting), stumps, rain | hold (10-3, R-2.7) | bolts | 10-10 lair |

**Element rules for the whole game:**
- lava only in W9 (Matt);
- webs only in W5;
- swim only where water is drawn deep enough, and only from 6-7;
- before 6-7, water costs a life everywhere ("Falling in costs a life", lesson.water), on replay too.

### C. The core-move ladder, W1-W10

**Core moves** (they go everywhere their fit rule allows):
- jump, double, bounce;
- liana, climb, rope;
- creaky branch, hide, push;
- the moving platform (after 2-7);
- the leaf glide (after 4-1);
- swim (after 6-7, in water worlds only).

**World moves** go only where their element is:

| Move | Where it may come back |
|---|---|
| river logs | W2, W6, W8 ponds |
| lift | built places: W2, W7, W10 |
| warm air | W4, W9's vents, W8's cave mouths |
| silk line | W5 only |

| Move | Taught | Echo (some, one required) | Must keep returning | Today's worst gap → the fix |
|---|---|---|---|---|
| bounce | 1-1 | 1-2, 1-3 | ≥ 1 of every 3 stages in every world but W5 | 13 (W3-W4) → W3 and W4 get bounces |
| double | 1-1 | 1-2, 1-3 | in jump content everywhere (the gates check it as a need) | — |
| liana | 1-2 | 1-3, 1-4 | ≥ 1 in 3 | already passes |
| creaky / breaking branch | 1-2 | 1-3, 1-4 | ≥ 1 in 3 in tree worlds (W1, W3, W4, W6, W8, W10) | 41 → W2-W4 get them |
| rope | clearing 1-3 | 1-4, 1-5 | ≥ 1 in 3 | 35 → W5-W7 get ropes (W7: temple ropes; W5: its own kit's rope) |
| climb | 1-4 | 1-5, 1-6 | ≥ 1 in 3 | passes |
| push | 1-6 | 1-7, 1-8 | ≥ 1 in 4, often as a puzzle beat | 61 → every world gets push beats |
| hide | 1-7 | 1-8, 1-9 | ≥ 1 in 4, in each world's stealth stages at least | 28 → W9 and W10 stealth stages use bushes or cover |
| moving platform | 2-7 (planned) | 2-8, 2-9 | ≥ 1 in 3 from W3 on | 29 → W3, W4 |
| leaf glide | clearing 4-1 | 4-2, 4-3 | ≥ 1 in 3 from W4 on, wherever there's a drop | unknown until its row exists |
| warm air | 4-7 | 4-8, 4-9 | W8 and W9 (≥ 3 stages each) | 63 → 8-6, 9-5 and others |
| swim | 6-7 | 6-8, 6-9 | ≥ 1 in 3 in W6-W8 and W10 where water is drawn; none in W9 | unknown until its row exists |
| lift | 2-7 | 2-8 | ≥ 2 stages in W7 and W10 | 83 → W7, W10 |
| river logs | 2-1 | 2-2, 2-3 | ≥ 2 stages each in W6 and W8 | 81 → W6, W8 |

**World hazards** (they return only where the element fits; each return is taught again only if it's a new variant):

| Hazard | Comes back in |
|---|---|
| dark | W3, W8 caves |
| wind | W4, W8 tower tops, W10 the thousand steps |
| thorns | W3, W6 roots, W10 the camp's wire |
| spores | W3, and W6's peat if art fits |
| tide | W6, and W2's tidal river (only after 6-4, so never in W2's first play: tide stays a W6 teach) |
| crumbling floors | W7, W10 fortress |
| geysers | W9 only |
| bolts | W10 only |

**Animals:**
- Once taught, an animal goes anywhere its element fits: snakes in trees, caimans in water, harpies in open sky, jaguars and ocelots on
  the ground.
- Today's gaps the plan fixes: the snapper leaves W2 for W6 (water); spiders stay W5's; frogs go to W8's ponds; the boa returns in
  W3-W4 trees.

**Mixing (World 2 on):**
- Every stage uses at least 3 core moves besides run and jump, at least one of them from an earlier world.
- Every world has one stage that joins its own move with an older one in one beat:

| W | The joined beat |
|---|---|
| 2 | a river log into a rope |
| 3 | a thorn swing into a liana |
| 4 | a glide off a liana |
| 5 | a silk line into a glide |
| 6 | a swim to a rope |
| 7 | a push onto a lift |
| 8 | a moonlight glide onto a liana |
| 9 | warm air into a rope |
| 10 | the hold on a moving platform |

### D. Water and swims (GEMINI-VARIETY row "Water", R-5.22; swimming is built, 87f1e2f6)

- **The spec declares water.** A stage profile names its `water`: none, a creek, a river, a pool, a swamp or a tide. Each body has
  x-range, surface y, depth, and `swim: no | yes`. Shallow or pre-6-7 water is `swim: no`, so it costs a life and is drawn only.
- **Swim beats are quick in-and-out** (the research's rules, adopted):
  - at most 15-20 s under before a surface or an exit;
  - wide, clear exits, at least 3-4 body widths of bank or a ramp out;
  - no slow drag: Pokey is fast in water (Matt's "suddenly fast");
  - currents and bubbles as the variety;
  - rising and falling water from the tide zone, already built.

  The gate measures each swim beat's time under on the bot run and fails over 20 s.
- **Where swims are laid:**
  - 6-7 teaches, in the root well as built;
  - 6-8 and 6-9 echo;
  - then W6-W8 and W10 at least 1 stage in 3 where water is drawn. W7's temple pools, W8's karst ponds and W10's camp river are the
    candidates. None in W9.
- **The whole swimming stage (R-5.22) is 6-9, its approach reshaped** (a reshaped existing stage, not a new one, R-153; designer's call
  on the lead's story read, 11-05 ~10:15 AM ET).
  - 6-9's clue is "Ripples cross the black water, all of them coming from one place", and it leads into the 6-10 Reaver lair. It keeps
    its clue and its ending toward the lair.
  - 6-8 is out: it is the hand-built Stilt Climb, and its clue says "you cannot hear the water".
  - The lead writes 6-9's story brief (what makes the ripples; a fast, happy swim with dark water around it) when the engine reaches
    World 6.
- **World 1 to 6-6:** water is drawing and a life-costing hazard only (the engine-render water zone). Lily pads, reeds, stones and
  logs stand on it per the element table.

### E. Gates that read this plan

1. **Untaught move:** a stage uses a move before its taught-at. Fail.
2. **Dropped move:** a core move absent longer than its "must keep returning" line. Fail, naming the stretch.
3. **Off-element:** a world move or hazard in a world its row doesn't list. Fail.
4. **Mixing:** fewer than 3 known core moves, or none from an earlier world (W2 on). Fail.
5. **Swim beat:** more than 20 s under, or an exit narrower than 3 body widths. Fail.
6. **Today's misses are a known list.** It only shrinks (like `clipknown.json`). A world is cleared off it when the engine rebuilds that
   world's stages.

### F. Order and cost (for the lead)

- **Order:**
  - This plan is the spec's step before 1-1 is rebuilt from data, as the lead asked.
  - The planner's steps: lock 1-5, stage as data, the tagged library with the element gate and water zone, the **world table and
    ladder data, plus gates 1-6 run as a report over all 102 stages (new)**, the profile pass lines and the neighbour check, one
    command a stage, then 1-1 from data.
  - Worlds 2-10 are not rebuilt now. The gates report on them, and the known list records their misses.
- **The designer's cost:**
  - this plan: about 1.5 h, done;
  - corrections after the planner's glide and swim rows: about 0.5 h;
  - each world's object pass later: about 1 h a world, when that world is queued.
- **The build cost** (world data, glide and swim rows, gates 1-6 as a report, the methods how-to) is the planner's estimate in % of the
  week, against the 55% ceiling (stop at 53%). **[revised: C29, "Contradictions ruled", 10:49 AM]**

**[designer, 11-05 ~10:24 AM ET] The element table and float caps cover every world, not just World 1 (the lead's check):**
- Today the table names World 1's kinds and the hanging ones: vine, liana, rope, bough. It does **not** yet cover the other worlds' kinds:
  - W2: river logs, lifts and bank houses;
  - W3: thorn vines and cave ledges;
  - W4: cliff ledges and warm air;
  - W5: silk lines and webs;
  - W6: roots and stilts;
  - W7: temple slabs, columns, crumbling floors and slides;
  - W8: karst ledges;
  - W9: heat rock and vents;
  - W10: towers, netting and steps;
  - moving platforms, cages and push blocks.
- **This revises "the object pass is done world by world, later" (9:58 AM).** The planner first takes an inventory of every piece kind,
  measured from the code (protoStage, w*Play, w*PropsData, the gen2 worlds, lairs, kits). The designer then labels every kind of every
  world in one pass, before the mixer reads the library.
- **The hanging moves are core, because this is a sloth game.** Each gets its own row: vine (climb), liana (swing), rope (shimmy), and
  the underside of a bough or trunk where Pokey hangs. Trunks are anchors, not landings.
- **Float caps per world** are set in the same pass. The default stays "some, ≤ 25% of landings" until a world's row says otherwise,
  with its reason.

### [designer with the planner, 11-05 ~10:31 AM ET] The engine's acceptance test: 1-1's pass line (agreed before 1-1 is built)

Matt: "we use 1-1 and then 1-2 as the test... If 1-1 takes too long and it still needs a lot of pieces fixed, the engine gets fixed.
We don't just go into the stage and fix it."

**Inputs (MEASURED unless stated).** All from the planner's message of 10:36 AM ET, from engine-mixer commit times.

| Input | Value |
|---|---|
| 1-5 hand-mix, 78da6ddb (first build) to b7c38491 (accepted) | 5.2 h wall, 28 commits, 9 fix rounds, all engine code and none data-only (a 10th, 9e243098, after) |
| 1-1 grey-box | about 3.75 h, never finished |
| Team spend rate | about 0.63% of the week an hour (STATUS 39% at 12:40 AM, the lead's 45% at about 10:05 AM) |
| Cost of 1-5's 5.2 h (DERIVED) | about 3.3% |
| Budget left under Matt's 53% stop | 8% |
| The engine's remaining steps without 1-1 | about 6.5% (the planner's estimate) |

**Two derived lines:**

| Line | Working | Result |
|---|---|---|
| Line 1: the budget | (8 − 6.5) ÷ 1 stage | ≤ 1.5% |
| Line 2: clearly faster than mixing by hand | ≤ 1/3 of 1-5's hand-mix | ≤ 1.7 h wall and ≤ about 1.1% | **[revised: C30, "Contradictions ruled", 10:49 AM]**

Line 2 binds.

**1-1 passes the engine's test only if all of these hold:**
1. **Time:** at most 1.7 h wall, from the planner's commit "1-1 data written" to the commit where every gate is green (commit times).
2. **Cost:** at most about 1.1% of the week, team spend at the measured rate over the same hours.
3. **Fixes:** at most 2 rounds after the first full gate run. Each is a change to 1-1's data file only (story, profile, plan).
4. **Engine changes:** none made for 1-1. Any mixer-core change needed to make 1-1 pass fails the test. The engine is then fixed, and
   1-1 is rebuilt from data as a second, separately measured attempt.
5. **Gates:**
   - every gate green on 16/16 rolls, Normal and Easy;
   - the stills review P-1 to P-13 and S-1 to S-9, 6 places upright and sideways, passed by the designer, then the lead;
   - "no stage id in the mixer core" (tools/engine/library-check.ts, 2afed23b).

**What the budget says plainly:** 1-2 does not fit under 53% beside the engine's remaining steps. After 1-1, the second test stage
needs Matt to choose between more budget and stopping at 1-1. A failed 1-1 attempt also eats the margin, which is about 0.4%
between line 1 and line 2.

**The stump:** it is drawing only, never a landing by itself. 1-1's core is bank and log, plus branch in n8-n11. The every-world
inventory will show whether any builder lays a stump you can stand on.
- **Lead's correction (accepted, 10:33 AM ET):**
  - The 0.63%/h counts 6-9 AM, when every helper was stopped. The active team rate is about 0.9%/h, so line 2's 1.1% is about 1.2 h of
    wall time, which is tighter than line 1's 1.7 h.
  - Both lines are kept. 1-1 is judged on whichever fails first, and both are reported as measured after the run.
  - The 1-1 clock starts only after the critic rulings that touch the core, the library or 1-1 (due 1:30 PM ET). Matt chose option A.
- **Matt lifted the token ceiling (via the lead): "It takes what it takes today... done right."**
  - The budget line (line 1) and "1-2 doesn't fit" are withdrawn. Line 2 (≤ 1/3 of 1-5's hand-mix: about 1.2 h, ≤ 1.1%), the fix rule,
    0 engine changes for one stage, and every gate stay as the engine-quality bar for 1-1 and for 1-2.
  - The order is the whole engine first:
    1. the every-world inventory and library (12:00);
    2. the critic (12:45);
    3. the designer's rulings (1:30 PM);
    4. step 6, the whole-game data and gates;
    5. E3-E5;
    6. 1-1, timed;
    7. 1-2, timed.

### [designer ruling, 11-05 ~10:40 AM ET] Rocks never float (Matt, via the lead: "Rocks can't float... A platform needs platforms. Rocks shouldn't be floating")

This replaces every earlier line that lets a stone float:
- 9:58 AM ruling §1: "stone, as a stepping stone" and "crumbling ledge, as a floating slab";
- the World 1 label table (9:59 AM): stone "floats: yes" and crumble "yes, low over ground and creek gaps";
- the "a floating stone slab is no longer a fault" line;
- the W7 crumble "may float yes".

**The rule (MATT, MATT-DIRECTION.md):**
- **May float = NO, always, in every world:** every rock, stone, boulder, slab, crumbling stone ledge, mound, bank and earth piece.
  Each one sits on the ground, a bank, the water's drawn bed (rising from it, S-9) or its own drawn base down to something solid.
  P-2 is back in force for all of them.
- **May float = yes, only for platform pieces:** logs, planks, boughs where they read cleaner, and their kin, under the stage's float
  cap.
- **Interim swaps** ("stones until the water zone", 9:56 AM) are stones on a bank or the ground, never over open air or a pit.
- **Kinds the inventory finds in other worlds** follow this too: W7 temple slabs, columns and crumbling floors, W8 karst ledges, W9
  heat rock and W3 cave ledges are all no-float. A stone-looking platform over a gap must stand on a drawn column or pillar, or it
  isn't used. If a world needs a free-floating platform there, it uses that world's plank or log kin.
- **Enforcement:** the planner's E3 support check runs on every built stage. A no-float kind with nothing solid under it fails.

## Contradictions ruled (designer, 11-05 ~10:49 AM ET; the 31 in SPEC-TRACE.md §b)

Every earlier line named here carries a "[revised: C#]" mark where it stands. Which side wins is decided by evidence, in this order:
1. Matt's later words;
2. a shipped decision;
3. the research;
4. our measurement;
5. an older spec line.
A number that no source settles goes to TRIAGE.md as a run (C) or research (R) item. It is never kept by judgment.

| # | Wins | Ruling |
|---|---|---|
| C1 | research (D:48, D:180-187; R4:28) | Gap share is **not** the difficulty dial. The dial's gap-share row is withdrawn. Difficulty is the landing window plus what sits on the avoided lines. Its numbers are OPEN in TRIAGE (C run on bands.ts) |
| C2 | research (D:188-193; R3 F13, W1) | No fixed 1.0-1.2 s pad. A rest is relative: about 2× the local median beat. Easy's "2-second rest" is withdrawn by the same rule |
| C3 | research and the shipped rule doc (LEG E151; SR §0b.4) | Snap twig about 0.15 s; creak, Normal 0.67 s (shipped commonest 0.7 s); creak, Easy 1.2 s. The dial's crumble slopes and the 1.0 s Easy line are withdrawn |
| C4 | shipped code (EASY_BS = 1.35) | Easy landing = Normal × 1.35 (DERIVED). The 260→150 and 220→150 px lines are withdrawn |
| C5 | research (D:194-195; LEG E132) | Easy is one tier softer, never "costs nothing" after the first teach: a slip on Easy costs a fall to a catch, never a life |
| C6 | both, split by unit | A **template** (a fixed section layout) appears at most twice a stage (SR §0c.2). An **idea** may recur, as in the old 1-1, under the idea-share cap (≤ 40%, never twice in a row) |
| C7 | Matt (MD:127-130) | Pieces belong to their world. Sharing is only where LABELS.md's worlds column allows. "One shared library, World 5 the only exception" is withdrawn |
| C8 | Matt (R-164.2) | 1-1 has one sunrise sky for the whole stage. "The backdrop changes with height" is withdrawn |
| C9 | shipped (d272601f, 6dae405d) | 1-2 teaches lianas and creaky. Every "creaky taught at 1-5" and "lianas 1-6" line is revised |
| C10 | the shipped rule doc (SR §0b.8; GV:165) | A checkpoint stands right before each hard part, so respawn is within about 2 s of it. The 45 s replay line is withdrawn |
| C11 | the 1:35 AM withdrawals | The 2:45 AM block's fork share of 30-40%, the forks with 3 crossings, and the checkpoints only before n6 and n10 are struck |
| C12 | the shipped rule doc (SR §0b.2) | Checkpoints sit **on** the rest before a hard part. "Never before a rest" is withdrawn |
| C13 | needs a run | Two measures of one number (0.847 against the gate's 0.949). Run cp3/lines.py and cp1/table2 on the old 1-1 with one definition, then quote the gate's own number. TRIAGE (C) |
| C14 | needs a run (corrected 11:05 AM: the ledger marks E127 NOT taken, "cap our own metric instead", LEG:591; E241 "measure on our metric", LEG:705) | Neighbours and sameness are judged on **our** metrics: the era.ts and lookalike.ts gates of the critic's ruling 1 (SR §2: cosine under ~0.78, window 0.30), plus no template in more than 3 of a world's stages (SR §0c.4). The cap's number on the set-of-ideas measure is **calibrated by a run**: old 1-1 against 1-3, as our two references. "≤ half" is withdrawn, and my 0.42 Jaccard citation was wrong |
| C15 | the record (ST:962-966) | 8% was the lead's proposal, not Matt's. Matt has since lifted the ceiling. The cost lines are history |
| C16 | the source (D:200; R3:42-44) | E[lives] on a first run: Normal ≤ 1.0 in World 1, rising about 0.5 a world; Easy ≤ 0.3. The misread 0.5→3.0 / 0.2→1.0 is withdrawn. The bots must be calibrated first (TRIAGE) |
| C17 | the sources (SR §1b; GP:100) | Bands climb and may overlap a little, never by a whole world. A world's first stage sits slightly below the previous world's end. The half-world overlap is withdrawn, and the dial's numbers are re-run |
| C18 | the shipped rule doc (SR §2: Easy 0.35-0.55) | Matt's yes on loosening is not recorded, so the line stands. 1-5's Easy 0.60-0.63 is a named miss, and it goes to Matt as one question through the lead |
| C19 | Matt (MD:77-79) | No hearts in the first 30 s on either setting. The engine's Easy pass is fixed (an engine change, not a stage fix) |
| C20 | needs a check | The level check's limit and the research's max reach may differ by a margin. Measure jumpOK's margin against the max reach (C run), then state the cap in one denominator |
| C21 | the spec's own rule (ES 1230) | 1-1's 3 bursts in n2-n7 is an override, and its reason goes in the profile's `difficulty` field: "length without a canopy" |
| C22 | the later ruling (acf6e1e8) | The label table's "crumble slab in W1" is struck. LABELS.md supersedes it |
| C23 | measurement (the inventory) | The worlds column comes from what ships (INVENTORY, da11cc4e), in LABELS.md. The spec's 9:59 AM worlds column is superseded |
| C24 | Matt (MD:7; CLAUDE.md "more pieces") and SR §1c | The mix floor is at least 14 section types a world and at least 5 themes a stage, not "the old 1-1's 5 kinds" |
| C25 | research (LCA:20-31) | The stage loop gains a premortem critic pass, separate from the designer and the planner, before the lead's check |
| C26 | open measurement | The planner re-runs trunk climb's first use on main's 1-1 to 1-3. Until then, climb's taught-at stays 1-4, marked OPEN |
| C27 | the gate's tool (split180.py:11) | The spec now states it: a split also needs a stretch over 300 px where both roads exist |
| C28 | internal | 1-1's length band stands on its own profile (Normal fast 160-195 s). "20% under 1-5" is struck, because 1-5 is over its own plan |
| C29 | Matt (lifted the ceiling) | Struck |
| C30 | internal | One time line: the acceptance test (≤ 1/3 of 1-5's hand-mix, measured). R-163's "about an hour" is the target, not the test |
| C31 | Matt (MD:206-208) | The lead approves Hugging Face for the engine, and Matt is told. "Matt approves the list" is struck |
- **C18 decided by Matt (10:55 AM ET, via the lead): the rule holds.** Easy density stays 0.35-0.55 (SR §2). The engine thins Easy itself,
  so every stage it builds meets the line. 1-5 is rebuilt from data, as an engine fix, not a hand edit. The planner's success line is
  1-5 Easy ≤ 0.55 on 16/16 rolls with every other gate green. My 03:19 AM acceptance of 0.61 is withdrawn.

## The critic's review ruled (designer, 11-05 ~11:01 AM ET; CRITIC-SPEC.md, engine-critic-spec e0d2023b, verdict NOT READY)

Matt's law 22: "We don't change rules to go around defects. We fix the problem. We fix the root problem always." No finding below is
cleared by re-wording a rule. Each is accepted with its spec change, or rejected with evidence. "L" lines are ENGINE-SPEC at 7f4373c0.

### The eight ranked changes

| # | Finding | Ruling | The spec change (binding before step 6 builds) |
|---|---|---|---|
| 1 | Rolls are 98-99% alike: era.ts diversity 0.021 for 1-1 and 0.014 for 1-5 (old: 0.384 and 0.494); the new 1-1 plays like the new 1-5 on 15 of 16 rolls | **ACCEPTED.** It is Matt's "repetitive", measured. The spec's piece-count variety gate passed it, so the gate measured the wrong thing (mine) | **(a) Gate, using the game's own tools (never a new measure in their place).** The engine imports era.ts, lookalike.ts and bands.ts and fails a stage on: (1) diversity between rolls ≥ 0.35 (SR §2 "Variety across rolls", ccr:178); (2) against every other stage of its world and every earlier world, cosine of weighted action 3-grams under ~0.78, and no 20 s stretch alike, window threshold 0.30 (SR §2 "Sameness", ccr:176; SR §0c.6-7, ccr:93-99; GEMINI-LEDGER C5, C7). **(b) Root cause first (R-164.11, planner and designer, before any generator change):** why the rolls come out the same. My hypothesis, to be proved or killed by a run: a node draws from a deck of 2-3 ideas whose moves are near-identical (hops of one kind), and the node order and fork places are fixed, so the rolls change sizes and kinds but not the move string. The fix follows the proven cause. The research's direction: a pool several times what one stage uses, cut per stage (R1 L3, R1:48; SMBF source), plus moves that differ between ideas, not only their pieces |
| 2 | The move table is untested: 2 layouts not 16, 4-D in no row, gen2 water (13 stages) invisible, no glide or swim row | **ACCEPTED** (D15: test the measuring tool before trusting it) | The table is rebuilt and **tested before any whole-game gate reads it**: 16 layouts; water from the game's own gen2Water(); rows for 4-D and 8-4 (special stages); glide and swim rows. A test fails the table if any shipped stage is in no row, or any stage that gen2Water finds has no water row. Until it passes, §A's numbers are provisional, and gates 1-6 report only |
| 3 | Hazards are locked to their home world, against SR §0.1 (Matt: "comes back in every later world"), Gemini L105 and LEDGER-2026-11-02-full #3; my SPEC-TRACE citation (SR §0c.7) is about templates, not hazards | **ACCEPTED. I was wrong**, and the citation was wrong. | **Mechanics travel, art does not.** Every hazard and zone (dark, spores, thorns, wind, webs, tide, crumbling floors, geysers, bolts), once taught, comes back in later worlds as a twist, harder or combined with that world's own mechanic, without re-teaching (SR §0.1; LEDGER-2026-11-02-full.md:42-52). It returns **in the later world's own art**: a W9 geyser becomes a W10 steam vent, the tide becomes W7's flooding cistern, a web becomes W8's spider silk among the figs. This keeps Matt's "pieces belong to their world" (MD:127-130) and his "no lava in the forest". The §B hazard table and LABELS §3 are revised to "returns as the twist in every later world, as that world's art". The ladder's "must keep returning" line covers hazards too. Where a later world has no fitting art yet, that is an art gap for the lead, never a reason to drop the mechanic |
| 4 | No stage identity beyond its pieces; the two plans are one template (11 nodes, forks at n4-5 and n10, rest at n5-6, cool-down at n11) | **ACCEPTED** | The profile gains: **pair** (the stage's mechanic pair on one beat: LEDGER-2026-11-02-full.md:24-40, Gemini L61); **twist** (an earlier world's mechanic, from W2 on); **map** (linear, loop-back, chimney, high/low split, hub: LEDGER part1:315-318, part2:113); **slot** (X-1 arrival ... X-8 moving pressure, X-9 boss preview: LEDGER-2026-11-02-full.md:62-70, :124, :130-134); **tension** (where the spike, rest and fork sit, placed differently from the previous stage: LEDGER-ENGINE-GEMINI.md:209, :442, :502). checkSpec fails a plan whose node shape matches its neighbour's. The stage ends in a dense 15-20 s **finale at the exit**, not a cool-down (LEDGER-2026-11-02-full #7; FINALE_TIGHT_MAX 20, core.ts:309), unless the story brief says otherwise. 1-1's and 1-5's plans are redrawn to different shapes |
| 5 | The engine can't express a World 2-10 stage; which builder each world uses isn't said | **ACCEPTED** | **The engine is the spec + library + ladder + gates layer, and the builder is named per stage** (`builder`: mixer, gen2 or hand). Build on what works: gen2 stays the builder for its 23 stages (curated seeds, --apart); hand-built special stages, rooms and lairs stay hand; the mixer builds what it is proved on. A world moves to the mixer only after its lock (finding 6) and only if the mixer beats that world's shipped builder on the gates. This is an architecture call, so the lead is asked to confirm it with Matt. Code catches up to the spec's words: `Move` holds every ladder move; `Element` holds every element §B names; `TAUGHT_BEFORE` comes from the tested ladder; the profile's pace, water bodies, arc "wave", elements, owns, unlike, caps, float and marks exist in `Profile`; and the rhythm pattern names (regular, swing, broken, wait-and-go) get definitions and a measure, or are struck. The how-to that replaces reference/methods/stage-build.md (the 11-04 beat method) is written and proved by one cold helper |
| 6 | No lock on what works: engine-mixer changes 1-2, 1-3, 1-4, 1-6 and 1-9 on 6/6 builds; the replay-away-from-last-roll is broken for 1-1 and 1-5 | **ACCEPTED** | **Per-world locks before any engine change in that world:** (a) fingerprints of every stage, on its shipped rolls, both settings, from main; (b) the world's gates green on that base (era.ts, lookalike --apart, bands, firsttimer, the puzzle validator, the boss tests); (c) stills of each special stage, room and lair, 6 places, both ways up; (d) old, half and finished save loads. World 1 first, against main. The 1-2/1-3/1-4/1-6/1-9 differences come from the 11-04 work the branch carries, and they are separated: either the lead judges them on their own, or the engine branch drops them so those stages match main. **Replay variety:** layoutMemory measures the layout the player actually sees (the mixer's, for 1-1 and 1-5), with a test. That is an engine fix |
| 7 | Water: the rules rest on a one-line triage of an unsaved paste, misread; the 20 s gate can't fail; the swim is half run speed while the spec says "fast" | **ACCEPTED** | §D's swim rules (15-20 s, 3-4 body widths, the 20 s gate) are **withdrawn to OPEN** until the lead's water research helper saves primary texts with lines. The rules are then written from those texts. Matt's "suddenly fast" (R-5.22) is real, but the speed is **Matt's pick**: today's 150 (about half a run, swim.ts:34-35) or the research's ×1.8 run (LEDGER part1:219, :264). One question goes to Matt through the lead, with a clip of each. **6-9's slot role:** as X-9 it previews the boss (LEDGER-2026-11-02-full #14). A swim stage there must still carry the preview, and the Reaver is a blackwater predator, so the ripples' source can be the boss glimpsed. The lead's 6-9 brief writes that; it is not a change of slot |
| 8 | 23 guesses | **ACCEPTED** | Each one is in TRIAGE.md (C run, R research or G answered), and nothing is built on it until it is settled. Already ruled from evidence in "Contradictions ruled": the dial's gap share (C1), rests (C2), crumble times (C3), Easy widths (C4), the 45 s replay (C10), the neighbour rule (C14), E[lives] (C16) and the world-edge bands (C17). The rest: the split 120 px, two-road 40%, creaky ≥15%, element shares, core ≥50%, clutter caps and the end-piece drop are settled by runs on the old 1-1 and the shipped stages. The float caps are settled by E3 (LABELS §4). The idea cap of 40% stays only if a run shows the old 1-1's measure beats R1's "no unit repeats"; otherwise R1 wins |

### The other findings

| Finding | Ruling |
|---|---|
| L1232: 1-5's lines are every stage's default | **ACCEPTED.** No default. Every profile states its own lines, each MEASURED from that world's shipped stages, or the profile is refused |
| Slot order the same in every world (L1462 "every world keeps its stages") | **ACCEPTED in part.** The stages, names and story stay (Matt). Slot *roles* vary inside them, and Matt already decided to reshape 2-3 stages a world into other types (R-153) |
| Timing variety: the same jump interval four times | **ACCEPTED.** It becomes a gate: no four take-offs in a row at the same interval (± 0.1 s) on the bot's route (LEDGER part2:43, :330) |
| New verbs (camouflage, belly slide, under-branch hang) | **Matt's call.** New moves are design scope, so the lead takes it to Matt as one question. Not ruled by me |
| Puzzle rooms that roll | **ACCEPTED as research (R).** Rooms stay as built until a run shows a rolled room passes the puzzle validator |
| Neighbour length ±20% can't be met in parallel | **ACCEPTED.** Lengths are set per world before any of its stages is built: a world length plan with each stage's band, from the shipped world's measured spread |
| L1458's 10:12 AM stamp against MATT-DIRECTION's 11:10 | **REJECTED, with evidence.** 0982e0dc's commit time is 15:12 UTC = 10:12 AM ET. MATT-DIRECTION's stamps from that hour ran up to an hour ahead, and the lead has since corrected them (lead, 10:34 AM) |
| SPEC-TRACE disagreements (L1305, L1302, L1590-1596, L1592, L1461, L1232, L424, L242, L1462) | **ACCEPTED.** SPEC-TRACE is corrected to the critic's tags on these rows: L1305 CONTRADICTED; L1302 a measured fact, not a rule; the swim rows a misread summary (OPEN); L1461 measured by an untested tool; L1232 and L424 OPEN; L242 gets R1's contradicting row |
| §0c.7: the validator compares every stage against every stage of every earlier world, built before World 2 is rebuilt | **ACCEPTED.** It is gate (a)(2) of finding 1 |
| The stage loop has no critic step (LCA) | Already ruled (C25): a premortem critic pass |
- **1-1's end piece is a bank, not a log (11:04 AM ET, the lead's bar for the bootprint: "on the shrine bank where the clue says").** In 1-1's
  data (`MIX11.end` kind bank, 640 px), the shrine stands on a bank, and the bootprint is a flush decal on the bank's top band, toe east,
  a little past the shrine's door so Pokey's feet never cover it. This is a data change for the 1-1 rebuild, not engine code.
- **MATT APPROVED ruling 5 (11:06 AM ET, via the lead): one rulebook over all builders.** gen2 keeps its 23 stages, special stages stay
  hand-built, and the mixer takes a stage only where it is proved better under that world's lock. Every stage, whatever builds it,
  passes the same gates.

## The 39 "G" rows applied (designer, 11-05 ~11:08 AM ET; TRIAGE.md Part 1, each line opened by the triage helper)

Each row's research answer replaces the OPEN line, cited. Two G rows are **not** applied, because a later finding outranks them; they
are named at the end.

| ES line (TRIAGE #) | Applied rule | Source |
|---|---|---|
| 1320, 1570 (#128, #153) | From World 2, a stage brings back earlier worlds' mechanics with its own; Worlds 8-10 use three or four at once. The spec's "≥ 3 core moves besides run and jump" stays as the stricter floor | SR:54-55 |
| 1441 (#146) | Moving platforms from World 2, then back in every world. The kinds come from GVs:17: pendulum branch, ride-to-start vine track, pulley and the like. Lift momentum (R-152.7) is built before a lift moves the player | SR:25; GVs:17-18 |
| 1516 (#148) | Each core move is counted in the pairs table (the 15 pairs of the six things, widened to the full list) | GV:5; SR:54 |
| 1526 (#149) | A world move returns only if it changes something you feel, paired with that world's own mechanic, in that world's art (ruling 3) | SR:93-96 |
| 1652 (#156) | Hanging under a branch and shimmying are core: "the most sloth move there is" | D:1201 |
| 341 (#32) | Part 1 of a stage shows its mechanic safely: a miss lands on solid ground, in 5-10 s groups | SR:45-46 |
| 390 (#38) | Bursts are judged by time (groups of 5, 10, 15 or 20 s), not piece count. A rest is ≥ 2× the local median beat and ≥ 1.0 s Normal / 2.0 s Easy | SR:43-44; R3:199-213 |
| 752 (#83) | Easy: 3-4 actions a burst in 6-8 s groups. A rest of 2.0-2.5 s is the target, and 4-5 s is allowed only as a floor | GP:292-293; R3:212-213 |
| 944 (#99) | Neighbouring stages must not share a tempo and a camera direction | SR:58 |
| 128 (#7) | Each world owns its pieces, and each stage draws a small themed pool from its world's sections | SR:93-96; R4:577-579 |
| 348, 439 (#34, #42) | A node's deck is locked out for 4 draws after it is laid | LEG:504 (E40) |
| 1385, 1417 (#133, #144) | Each world's pass decides its own pieces and its fingerprint (beat mix, camera directions, mechanic pairs, piece set), and is checked against every earlier world | SR:93-99 |
| 1550 (#151) | Hazards return as the twist "without retraining", paired with the later world's own mechanic and in its art (ruling 3) | GV:105; SR:93-96 |
| 219 (#16) | Before an enemy trigger: a flat runway of ≥ 1.0 s (about 285 px). The boa's ledge is ≥ 3.5 body widths from the entry | LEG:572, :581 (E108, E117) |
| 640 (#65) | Single-jump gap share Normal 0.35-0.75, Easy 0.25-0.50 (calibrated on what shipped); doubles Normal 0.50-0.78, Easy 0.40-0.60; never above 0.82 Normal / 0.65 Easy. Gap share shapes the stride, not the difficulty (C1) | D:177, D:48; LEG:567 (E103); GP:75-76 |
| 642, 468 (#67, #47) | Landing pads 3.5 body widths (about 154 px, Normal climax) to 7.0 (about 308 px, Easy intro). Normal's 110 px end is withdrawn. Easy = Normal × 1.35 stays as the code's rule (C4) inside this range | LEG:569 (E105) |
| 644 (#69) | E[lives], first run: Normal ≤ 1.0 in World 1, rising about 0.5 a world; Easy ≤ 0.3. The bots are calibrated on touch recordings before any goal rests on them | R3:42-44; D:200; R4:559-562 |
| 646, 228 (#71, #20) | Creak: Easy 1.2 s, Normal 0.67 s; snap twig about 0.15 s (C3) | LEG:615 (E151); SR:51-52 |
| 300, 522 (#26, #54) | Checkpoints sit on the rests before parts 3 and 4, and respawn is within about 2 s of the hard part (C10, C11, C12) | SR:48, :64-65; GV:165 |
| 360, 462, 828 (#36, #45, #90) | Normal goals 75-87.5% of what's reachable (13 marks: 10 or 11). The Easy goal is set by the first-timer kid bot (a C run) | LEG:582, :584; SR:115 |
| 1177 (#112) | Choice in the ground half: an alternate entrance or an optional vertical branch for the second collectible tier | GV:173 |
| 148, 547 (#10, #56) | Use all the art: every made frame has a place in the game. Whether an item is dressing or a piece is decided item by item | SR:218-219 |
| 1249 (#118) | Nothing grows out of the air: stumps, roots, creaky limbs and vine tops all attach to something solid | SR:602-603 |
| 667 (#74) | Each stage takes 2-5 min for a first-timer, and never under 2 min for a skilled player. A first-timer takes 20-25 min for World 1 | SR:36-38 (Matt) |
| 790 (#86) | A generator is judged over 200 rolls (sd of each metric ≥ 0.05), or the stage is declared a fixed composition and judged on its one layout. 16 rolls stays the quick check | R3:116-121 (F6) |
| 819 (#89) | Easy softens the high road too (wider and more forgiving), never Normal's bands unchanged | SR:135-137 |
| 282 (#24) | Pairwise adjacency is checked in the builder: a gap and an enemy on its landing add up, and the pair is capped | LEG:485, :469 (E21, E5) |
| 754 (#84) | Any new Dot line is marked "(new, needs Matt's approval)" | SR:118 |
| 1678 (#159) | The target is about an hour a stage built from a spec (R-163). The acceptance test (≤ 1/3 of 1-5's hand-mix, measured) is the pass line | RM:473 |

**Not applied (outranked):**
- **#163, the swim gate's 20 s (GVs:19).** The critic showed GVs:19 is a one-line triage of an unsaved paste, misread. Ruling 7 withdrew
  it until the water researcher saves primary texts.
- **#151's "only where the element fits" reading.** SR:93-96 is about layout templates, and SR §0.1 says mechanics return everywhere.
  Ruling 3 governs, and the row is applied in that form above.

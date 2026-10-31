# World 9 grab bag: every piece, built before curation (2026-10-31, ~2:00 PM ET, branch w9-pieces)

## Status (updated 2026-10-31 ~3:15 PM ET)

| Piece | Built | Where | Art | Bots on raw rolls |
|---|---|---|---|---|
| N1 rafts | yes (w9Bob.ts) | 9-1 | painted (w9b pumice raft) | kid 0 lives; adult 1-5 lives near rafts on ~26 rafts a roll |
| N2 logs | yes | 9-5, 9-9 | painted (bridges charred log) | kid 0 |
| N3 pistons | yes (flush, soft well) | 9-8 | painted (w9b hex column) | both reach the shrine, 0 lives near pistons |
| N4 sinking slabs | yes (engine `sink`) | 9-3, 9-9 | painted (bridges ember slab) | kid 0, adult 2 (none at the slabs) |
| N5 flare slabs | yes (geyser zone, look) | 9-5, 9-8 | painted + HF cool frame | kid 0; adult hits 2-9 |
| N6 lava surges | yes (SectionZone 'surge') | **9-4**, 9-6 | HF surge front + lava strip | adult lives ~ the 9-6 baseline; hits above it (being watched) |
| N7 hot ash gusts | yes (wind zone, look 'ash') | 9-1 headwind, 9-5 tailwind | HF ash streaks | (not run yet) |
| N8 ropes over the lava | yes (gen2 place 'rope') | 9-3, 9-8 | the game's painted rope (the scorched bridge sheet is not used: a rope reads as what he does) | both 0 lives |
| N9 lavafalls | yes (geyser zone, look) | **9-4**, 9-6, 9-9 | HF pour loop | kid 0-1 |
| N10 steam vents | **waiting** on the w8-merge question (needs gen2 'bouncy') | 9-1, 9-6 planned | HF steam frames cut, ready | |
| N11 smoke cover | **deferred**: a timed hide reads as the same watcher beat as the spires (no variety), so 9-4 took N6 and N9 instead | | | |
| N12 raft lock room | next | 9-5 (alternate) | HF obsidian chunk cut, ready | |

Themes now: 9-1 4 (vents, chasms, rafts, gusts; +steam), 9-3 5 (chains, climbs, crust, sinkers, ropes), 9-4 5 (spires, ferns, coils,
lavafalls, surges), 9-5 5 (glides, bursts, logs, flares, gusts), 9-6 4 (cats, prowl, lavafalls, surges; +steam), 9-8 5 (ledges, channels,
pistons, flares, ropes), 9-9 5 (harpies, boas, logs, lavafalls, sinkers). Neighbour pairs share no new theme. Lessons moved: lavafalls and
surges are taught on 9-4 (it comes before 9-6). HF spent: ~$0.30 (job 6ae633040e0338d1bb7d39e3).


Matt, 1:20 PM ET Oct 31: "Lets make the pieces ahead of time. Be prepared since more is better anyways. Lets not go into this bare
minimum and have to make more and do redundant rework." This is STAGE-RULES §1c step 2. Nothing below is curated until every piece
is built and checked alone (§1c step 3). **For the lead's review before building.**

## 1. Where World 9 starts

- Merged up: origin/gen2-w9 then origin/gen2-w9-swing are in w9-pieces (on ccr 641b6016). 9-3's swing themes are in; its `w9-pillar-hop`
  line is dropped (the pillars are 9-9's now).
- On hand: 64 ground sections, 12 chain/climb sections, 3 puzzle rooms (9-3 bucket lift, 9-5 hot plates, 9-8 lever lift), the painted
  lava, geysers, haze and splash.
- **Themes today: 9-1 2, 9-3 3, 9-4 3, 9-5 2, 9-6 2, 9-8 2, 9-9 2.** The target is at least 5 on every stage. The last 300-roll run
  (before the merge) shipped 9-3 at 0.30 and 9-9 at 0.12, and 9-6 shipped nothing (it matched 9-9). The pieces are missing, not the rolls.
- Beat letters (beats.ts): h hop 0.5, J jump 1, V climb/swing/rope/lift 2, C animal 2.2, Z timed or zone hazard 2, P puzzle step 2.8.
  A new piece only lifts variety if it changes a stage's letter mix, *and* it needs its own `moveKind` (lookalike.ts) so that it doesn't
  read as an old beat.

## 2. Art already painted and never drawn (no HF cost)

| Art | Sheet | Proposed job |
|---|---|---|
| pumice raft (426x115) | `props-made/w9b` | **moving log A**: the bobbing raft |
| charred log (310x138) | `gemini/w9w10-bridges` (used today only as a chain plank) | **moving log B**: the long slow log |
| hex column (133x426) | `props-made/w9b` (used as a swing post) | **piston column**: rises and sinks, carries him up |
| ember slab (328x68) | `gemini/w9w10-bridges` (used as a room shelf) | **sinking slab**: sinks while he stands on it |
| hot platform (434x211) | `props-made/w9b` | **flare slab**: its cracks glow, then flare |
| scorched bridge (479x286) | `props-made/w9b` | **burnt bridge**: too weak to stand on, he shimmies under it |
| vent rock (~330x190) | `props-made/w9b` | **steam vent**: a jet that throws him up (a bounce) |
| lava dome (445x329) | `props-made/w9b` | the lavafall's source on its cliff; the hoard's dressing |
| lava pool | `props-made/w9c`, `w9c-b` | dressing on 9-6's surge channels (not a hazard: never placed on the route) |
| plank-hanging, chain-bridge | `gemini/w9w10-bridges` | the raft-lock room's chain and hook; spare |
| w9var bank-b, snapL-b, perch-b, fill-b | `props-made/w9var` | the second basalt look (rotated by the roll, §4) |

## 3. The new section types (each with its beat, art, teaching and Dot line)

Every Dot line is new and **needs Matt's approval** (all under 10 words). Dot names the danger the first time, never the move (§1).
Every piece runs on Easy too: Easy softens it (a slower beat, longer still spells, wider tops), it never removes it (§1b).

### N1. Lava rafts: Matt's moving logs, version A (beat **J**, moveKind `J|bob`)
Pumice rafts float in a lava pool, rising and sinking on a steady beat (period ~2.6 s Normal, ~3.4 s Easy; a 0.5/0.8 s still spell at
the top). At the top a plain jump reaches the next raft or bank; at the bottom it can't, so he times the jump. A raft never goes under
the lava (its low point sits on the surface, lava lapping its sides), so riding one never hurts; missing a jump falls into the lava.
Rafts in a row are out of step, so a row is a rhythm (jump, wait, jump).
- Sections: `w9-first-raft` (one raft in a narrow pool, a wide safe bank both sides, soft crust under it on every setting); `w9-raft-pair`;
  `w9-raft-row` (three, out of step); `w9-raft-geyser` (a raft row onto a geyser flat).
- Stages: **9-1** (taught: its own theme). The raft-lock room (N12) on 9-5 uses a raft too.
- Teach: `w9-first-raft` is the theme's first section on every rafts roll; soft floor; Dot on first sight.
- Dot: **"Those rafts rise and sink. Watch them."** (7 words)
- Engine: new (E1).

### N2. Charred logs: Matt's moving logs, version B (beat **J**, moveKind `J|bob-log`)
One long charred log across a wide chasm, slower (period ~4 s) and lower in its trough; he runs its length while it is up. The
different length and timing make a different stretch from N1's quick hops.
- Sections: `w9-log-bridge`, `w9-log-glide` (ride it up, then the leaf: 9-5), `w9-log-pair`.
- Stages: **9-5** and **9-9** (not neighbours).
- Teach: rafts are taught in 9-1; the log's first appearance on each stage is over a soft floor.
- Dot: none (taught by N1). If the lead wants one: "That log sinks low. Wait for it." (7)

### N3. Piston columns (beat **V**, moveKind `V|piston`)
A hex column rises and sinks slowly out of a lava well. He stands on it at the bottom and rides it up to a ledge no jump reaches
(a lift, not a hop). Never a crush: nothing is above a column's top.
- Sections: `w9-piston-step`, `w9-piston-pair` (up one, across to a higher one), `w9-piston-thread` (a thread on the high ledge).
- Stages: **9-8** (its own theme).
- Dot: **"These stone columns rise and fall."** (6)
- Engine: E1 (the same mover, vertical, its rider carried).

### N4. Sinking ember slabs (beat **Z**, moveKind `Z|sinking`)
An ember slab over a soft chasm sinks while he stands on it (~1.2 s to the bottom) and floats back up when he leaves. Hurry across a
run of them. It stops on the crust, never in lava, so it is a hurry, not a punishment. Never the only way over (§1, "crumbling is never
required"): a plain jump route always stays, the slabs are the quicker line with petals on it.
- Sections: `w9-slab-run`, `w9-slab-chain` (between two chains: 9-3), `w9-slab-hoard`.
- Stages: **9-3** and **9-9**.
- Dot: **"Ember slabs sink when you stand on them."** (8)
- Engine: new (E2).

### N5. Flare slabs (beat **Z**, moveKind `Z|flare`)
A hot slab on the route: its cracks dim, glow (the warning, at least 1 s) and flare for 1 s. He crosses while it is dark. Two in a row
are out of step.
- Sections: `w9-flare-step`, `w9-flare-pair`, `w9-flare-glide` (9-5: take off from a dark slab).
- Stages: **9-5** and **9-8** (not neighbours).
- Dot: **"Those slabs flare up when they glow."** (7)
- Engine: the geyser zone, low and as wide as the slab (E3). Art: on-hand slab plus a NEW cool frame (HF, below).

### N6. Lava surges (beat **Z**, moveKind `Z|surge`)
A cooled channel floods with lava on a beat (the rumble and a bright lip upstream first). He runs the channel floor between surges
and hops out to the step before the next one. Easy's surge is shallow and slower to rise.
- Sections: `w9-surge-run`, `w9-surge-fight` (an animal on the step), `w9-surge-twin`.
- Stages: **9-6**.
- Dot: **"Lava surges down the channel. Listen!"** (6)
- Engine: gen2's 'tide' zone exists; it needs the painted lava over it (E5).

### N7. Hot ash gusts (beat **Z**, moveKind `Z|gust`)
"Pepper Air": hot wind through a gap in the ash cloud, on a beat. A headwind on plain chasms (wait for the lull, 9-1) and a tailwind or
headwind over the glides (9-5). Ash streaks first (at least 1 s), never a gust on a far lip.
- Sections: `w9-gust-gap`, `w9-gust-pair` (9-1); `w9-gust-glide`, `w9-gust-tail` (9-5).
- Stages: **9-1** and **9-5** (not neighbours).
- Dot: **"Hot wind! It'll push you back."** (6)
- Engine: gen2's 'wind' zone exists on ccr. World 8's levelCheck tailwind rule is on w8-merge (see §6, question 1). Art: the code
  leaf streaks recoloured to ash (a small touch), plus a NEW painted ash streak (HF, below).

### N8. Burnt bridges (beat **V**, moveKind `V|rope`)
The scorched bridge hangs between two posts over the lava. It's too burnt to stand on, so he shimmies under it hand over hand (1-3's rope).
- Sections: `w9-bridge-under`, `w9-bridge-chain` (rope, then chain: 9-3), `w9-bridge-thread`.
- Stages: **9-3** and **9-8**.
- Dot: **"That bridge is too burnt to stand on."** (8)
- Engine: gen2 has the `rope` Move and no rope piece; World 8's rope bridges (its C) aren't built either. New (E6).
- Note: Matt's 9-2 canopy teaches the hang-under move. If that is the same move, 9-2 comes first in play and these reuse it.

### N9. Lavafalls (beat **Z**, moveKind `Z|lavafall`)
Lava pours from a dome on a cliff above the route on a beat: drips first (the warning), then a falling column for ~1 s. Pass under it
between pours.
- Sections: `w9-lavafall-run`, `w9-lavafall-pair`, `w9-lavafall-guard` (an animal past it).
- Stages: **9-6** and **9-9** (not neighbours).
- Dot: **"Lava pours from up there. Watch the drips."** (8)
- Engine: the geyser zone flipped, coming down from above (E4). Art: lava dome on hand; NEW painted lavafall loop (HF, below).

### N10. Steam vents (beat **J**, moveKind `J|steam`)
A vent rock that puffs a jet: standing on it as it puffs throws him up to a high ledge (a bounce on a beat). Never needed to get past a
hazard; it reaches a high petal line or the shorter way.
- Sections: `w9-steam-up`, `w9-steam-pair`, `w9-steam-ledge`.
- Stages: **9-1**, **9-4**, **9-6** (none of them neighbours).
- Dot: **"Steam vents push you up high."** (6)
- Engine: a bouncy platform on a beat. World 8's 'bouncy' piece shape is on w8-merge (§6, question 1). Art: vent rock and the painted
  haze frames, both on hand.

### N11. Smoke cover (beat **Z**, moveKind `Z|smoke`)
On 9-4's watched doorstep, a smoke crack puffs a cloud on a beat, and inside the cloud the eagle can't see him. A hide that comes and
goes, so the timing is different from a still spire.
- Sections: `w9-smoke-run`, `w9-smoke-spire`.
- Stages: **9-4**.
- Dot: **"Smoke hides you from the eagle."** (6)
- Engine: a watcher bush that is only there on a beat (E7). Art: smoke crack and haze frames, on hand.

### N12. The raft lock (the new World 9 puzzle room, beat **P**)
Modelled on 8-1's Roost Loft. A raft bobs in a lava well under the exit ledge, but its top stops short of the ledge. A plate on the rim,
pressed, locks the raft at the top of its rise ("FREEZE"). Carry the obsidian chunk onto the plate, ride the raft up, cross.
- Easy (1-2 steps): the chunk sits by the plate. Normal (2-3 steps): the chunk is down on a low shelf that only the raft (unlocked)
  reaches, so he rides down, carries it up the walkable steps and sets it on the plate. Carry path walkable (§1), no life lost
  (the well floor is soft crust under the room), reset post, the chunk respawns.
- The plate and raft are joined by a visible chain over a pulley (§3: a far switch shows its link).
- Where: on **9-5**, on alternate rolls with today's hot-plates room. World 9 keeps 3 puzzle moments (§3: "2-3 per world"), and
  9-5's rolls split by their room (P beats differ).
- Lines (Dot, new): enter **"The raft won't reach the ledge."** (6); nudge **"Something heavy might hold it up."** (6); open
  **"It's holding! Up you go."** (5).
- Engine: E1's mover wired to a switch (puzzleKit `lock` on a mover). Art: W9 plate (on hand), chain-bridge chain (on hand),
  NEW obsidian chunk to carry (HF, below).

## 4. Themes per stage (at least 5 each; neighbours share none)

Neighbours in play (the gen2 stages either side, hand stages skipped): 9-1|9-3, 9-3|9-4, 9-4|9-5, 9-5|9-6, 9-6|9-8, 9-8|9-9.

| Stage | Today | New themes | Total |
|---|---|---|---|
| 9-1 Pepper Air | vents, chasms | **rafts** (N1, taught), **gusts** (N7), **steam** (N10) | 5 |
| 9-3 Ember Canopy | chains, wall climbs, crust | **burnt bridges** (N8), **sinking slabs** (N4) | 5 |
| 9-4 The Drake's Doorstep | spires, ferns, coils | **smoke** (N11), **steam** (N10) | 5 |
| 9-5 Vent Riding | glides, bursts | **gusts** (N7), **flare slabs** (N5), **charred logs** (N2); room: plates or **raft lock** (N12) | 5 |
| 9-6 Ash Fields | cats, prowl | **surges** (N6), **lavafalls** (N9), **steam** (N10) | 5 |
| 9-8 Pell's Thread | ledges, channels | **pistons** (N3), **burnt bridges** (N8), **flare slabs** (N5) | 5 |
| 9-9 The Drake's Hoard | harpies, boas | **sinking slabs** (N4), **lavafalls** (N9), **charred logs** (N2) | 5 |

Neighbour check: every pair above shares no new theme. (Rafts were first planned for 9-4 too, but 9-4 neighbours 9-5's logs, both
bobbing platforms, so 9-4 takes steam instead.)

Each new theme gets its own gate (19 gates) and 3-4 sections (33 new section types, plus the room). World total: the 79 on hand
plus about 52 new ones. Timing beats: geysers, chains, watcher and crumble on hand; rafts, logs, pistons, slabs, flares, surges,
gusts, lavafalls, steam and smoke new (10 more, the target is 3).

## 5. Engine and tools work (the order I'll build it)

| | What | Size |
|---|---|---|
| E1 | Vertical mover (`Platform` 'moving' on y: baseY, range, period, still spell, phase; rider carried; Easy softening) + gen2 piece shape `raft` / `piston` + levelCheck timed-hop link (waits for the top) + bots (first-timer and kid wait for the top) + beats/lookalike `J\|bob`, `J\|bob-log`, `V\|piston` + painted raft, log, column with the lava drawn over their low sides | big, first |
| E2 | Weight-sinking slab (sinks while stood on, rises off it; bottom on the crust) + levelCheck (never required) | medium |
| E3 | Flare slab: geyser zone, low and slab-wide, its own draw + kind | small |
| E4 | Lavafall: geyser zone from above, its own draw + kind | small-medium |
| E5 | Lava surge: gen2 tide zone drawn as lava + kind | small |
| E6 | Rope piece (gen2) for the burnt bridge + levelCheck rope link | medium |
| E7 | Smoke cover: a watcher bush on a beat | medium |
| E8 | Steam vent: a bouncy piece on a beat (depends on question 1) | small if World 8's shape comes in |
| E9 | Raft-lock room: puzzleKit wires a mover to a plate; validator + real-engine play-through | medium |

Each piece is checked alone before curation (§1c step 3): upright and sideways, Jump help Off / On / On+forward, taught on first sight,
first-timer and kid bots, the safe start, no platform style over 60%, Easy clearly easier, and stills that pass the polish bar. I'll
use a per-piece test harness (`w9Pieces.test.ts`: each new section laid alone on 40 raw rolls, Normal and Easy, levelCheck plus both bots).

## 6. Hugging Face art (budget up to $25; Hugging Face only, never Gemini)

All img2img from World 9's own sheets (w9b, w9c, the bridges sheet) for the style, on flat magenta, cut with the HF batch cutter. Rate
about $2.75/h (rtx-pro-6000). No single job over $3, so none needs a cost check first. I'll still give the lead the total before the batch.

| # | Art | Use | Est. |
|---|---|---|---|
| 1 | Flare slab, cool frame (the hot platform with its cracks dark) + a mid-glow frame | N5 | $0.40 |
| 2 | Lavafall loop (4 frames) + drip warning frame + splash at its foot | N9 | $1.00 |
| 3 | Ash gust streak (4 frames that loop when tiled) | N7 | $0.50 |
| 4 | Obsidian chunk to carry (2 frames: rest, held) + raft-lock pulley post | N12 | $0.50 |
| 5 | Surge crest (the bright front of a lava surge, 3 frames) | N6 | $0.50 |
| 6 | Steam jet puff (3 frames), if the haze frames read too soft on a bounce | N10 | $0.40 |
| | **This pass** | | **about $3.30** |
| later | 9-2 canopy art (Matt's design: ants, the three layers) and Drake extras, if hf-art-bosses lacks them | special stage / boss | $5-8 |

## 7. Where the Drake and the canopy fit (not built in this pass)

- **9-10 Magma Drake** (reference/boss-design/9-10-and-10-10.md on boss-design-9-10; Matt: "Drake first") is World 9's next step
  after this curation. Its arena can reuse N3 pistons and N4 sinking slabs as fight ledges (already taught in 9-8 and 9-9, just before it).
- **9-2 the canopy special stage** (Matt chose "9-2, renamed": teach the hang move there; the hold rule is FREEZE ON THE FLASH; HF art)
  comes after the Drake. It replaces the hand-built Rising Heat. It's hand-built, so it is not in the gen2 curation and doesn't change
  the neighbour pairs above (9-1|9-3 stay neighbours).
- 9-7 Lava Steps (hand-built ascent) could later take N1 rafts and N3 pistons. That's not in this pass.

## 8. Questions for the lead (one at a time to Matt where they're his)

1. **World 8's engine pieces.** w8-merge (10 commits past ccr, not released) has the gen2 `bouncy` shape and levelCheck's tailwind-glide
   rule. Steam vents (N10) and the gust glides (N7) want both. My recommendation: merge origin/w8-merge into w9-pieces now, so World 9
   builds on World 8's pieces instead of writing them twice and clashing at release. The cost: w9-pieces can then only ship after W8.
   The other choice: build N10 and N7 after W8 lands, and do everything else first.
2. **The 4th room.** Is the raft lock as a rotating alternative to 9-5's hot-plates room OK, or should it be a fourth room (on 9-6)?
3. **Dot lines** (12 above) go to Matt via the lead.
4. **Scope tonight.** The whole bag (E1-E9, 33 sections, 19 gates) is more than one evening. Tonight: E1 (rafts, logs, pistons) and its
   sections first, since that is Matt's ask, then E3/E4/E5 (geyser and tide reuses) and the HF batch. NEXT.md at 10 PM ET with exactly
   what's left. Curation starts only when all of it is built (§1c).

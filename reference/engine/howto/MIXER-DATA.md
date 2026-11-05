# How-to, part 2: writing a stage's data (the mixer data)

Drafted by the level designer, 11-05 3:13 PM ET, for the planner to fact-check and for the critic or the lead to review cold. Written
against engine-mixer d4dbadae8: src/game/mixer/spec.ts, stages.ts, library.ts and w1mix.ts. Part 1 (engine-core) covers running
tools/engine/stage.ts, the gates, and reading a breach.

## 0. What you write, and what you never touch [revised 3:14 PM ET: test fairness, the lead]
- **You write 1-1's spec from the page alone.** Your branch starts with no \`SPEC_11\` in \`src/game/mixer/stages.ts\`: it was removed
  on purpose, so this is a real test of whether the engine and its pages are enough. Don't look for it on any other branch: engine-core
  keeps the planner's copy only to compare with yours afterwards. Reading it would turn the test into copying.
- **You add one thing: \`SPEC_11\`** (a \`StageSpec\`, §1) in \`src/game/mixer/stages.ts\`, written from the stage's page, plus
  whatever registration line part 1 says the engine needs to find it. That's all the data a stage has: its story, profile, node plan,
  goal, dressing and lay. \`SPEC_15\` in the same file is another stage's spec: read it to see the format, but take no values from it.
- **You never edit** w1mix.ts, library.ts, spec.ts, kits.ts or any other engine file. If your stage needs something the spec can't
  say, stop and report it as an engine finding. The engine gets fixed; the stage is never patched around it (Matt).
- **Your design source** is "1-1 for the builder" in ENGINE-SPEC.md and the lead's story brief. Copy values from the page. Never invent
  a number, a line of dialogue or an idea name. If the page doesn't say, ask: it's logged as a gap.

## 1. The shape of a spec (spec.ts `StageSpec`)

| Field | What it is | 1-1's value (from the page) |
|---|---|---|
| `id`, `name` | the stage id and its shipped name | `'1-1'`, `'Into the Canopy'` |
| `story` | `{ beat, feel }` in one line each, from the brief | the brief's beat and feel |
| `profile` | the feel, below (§2) | page §B |
| `nodes` | the node plan, in order (§3) | page §C, n1-n11 |
| `goal` | `{ kind: 'sprint' }` or `{ kind: 'marks', count, normal, easy }` | `{ kind: 'sprint' }` |
| `dress` | `{ start: [frame names], clue: frame name }`, the atlas's frame names | squirrels at the start, `clue: 'bootprint'` (held art: page §D) |
| `taughtBefore` | the moves earlier stages taught | `[]` for 1-1 |
| `post` | `{ clearDress: true }` keeps dressing off the play line | `{ clearDress: true }` |
| `lay` | `{ startY, end: { kind, w } }`: the spawn bank's y and the last piece | `{ startY: 1260, end: { kind: 'bank', w: 640 } }` |

**`burstMin` and `burstMax` are not used.** Bursts go by time (the profile's roll), not by count.

## 2. The profile (spec.ts `Profile`)

| Field | Allowed values | What it does |
|---|---|---|
| `trend` | `'up' \| 'down' \| 'level'` | the stage's overall line |
| `tempo` | `'calm' \| 'steady' \| 'brisk'` | descriptive. **Today it also picks the longest-run line in `linesFor`**; see §5 |
| `hills` | `'flat' \| 'rolling' \| 'hilly'` | descriptive. **Today it also picks the up/down line in `linesFor`**; see §5 |
| `branching` | `'none' \| 'light' \| 'moderate' \| 'heavy'` | how often the way splits |
| `water` | `true \| false` | only with `true` may a deck hold water ideas (lily-pad hop, reed isles) |
| `petals` | `'trail' \| 'scattered' \| 'hidden'` | how the petals lie |
| `look` | `{ lead: 'ground' \| 'water' \| 'tree', art: 'w1' }` | the element the commonest piece belongs to, and the art set |
| `length` | `{ normal: [min, max], easyMin }` in seconds; never under 120 | the quick-clock band |
| `mix` | `{ jumps, climbing, vines, bounces, water, enemies, hazards, breakable }`, each `'none' \| 'some' \| 'lots'` | the stage's content shares |
| `theme` | `'forest' \| 'river' \| 'canopy-high' \| 'swamp' \| ...` | only pieces of this theme may be laid |
| `core` | piece kinds, e.g. `['bank', 'log', 'stone']` | the commonest landing must be one of these |
| `roll` | **not in spec.ts yet** (the planner's per-roll fix) | the per-roll draws. Copy `roll11` from ENGINE-SPEC "1-2 and 1-5 measured", exactly |

## 3. A node (spec.ts `NodeSpec`)

| Field | What it is | Example (1-1's n2) |
|---|---|---|
| `job` | what the node is for (teach X, practise, rest, the fork, the moment, cool down) | `'teach jump'` |
| `deck` | the ideas it may draw from: a list, or `{ high: [...], low: [...] }` for a fork | `['bank hops', 'stump hop', 'log jam']` |
| `teaches` | the move taught here; its deck must hold an idea that teaches it | `'jump'` |
| `line` | Dot's line: `{ text, pad?, at?: 'start' \| 'end' }`, copied word for word from dotLinesData.ts | `{ text: 'Jump the little gaps' }` |
| `flagBefore`, `heartAfter` | a checkpoint before it; a heart after (only after real risk) | — |
| `safe` | a miss costs nothing here. **For 1-1 the whole stage is safe** (page §C, R1) | `true` |
| `height` | the height band as a share of the climb, 0-1 | — |
| `id` | a short name for a node set between two others (`'7b'`) | — |
| `lay` | the engine's knobs: `easyOnly`, `one`, `bursts`, `ground`, `band: [top, bottom]` px, `not`, `notLast`, `seed` | `{ ground: true, bursts: 3, band: [1150, 1320] }` |

**The idea names a deck may hold** (library.ts `IDEAS`): floor walk, bank hops, stump hop, bank walk, bounce mound, stump tops, log jam,
double gap, bounce up, bough stair, bough hops, double chain, top branch, and, for later stages, lily-pad hop, reed isles, the climb,
bridge span, snap teach, snap dash, creaky boughs, crumbling ledge, rotten-branch drop. Each idea has `needs` (moves it requires) and
may `teach` one. An idea that needs a move not yet taught fails `checkSpec`.

## 4. Before you build: `checkSpec`
`checkSpec` (spec.ts) lists every problem in plain words before anything is laid:
- an unknown idea;
- a water idea without `water: true`;
- a move used before it's taught;
- a teach node whose deck can't teach it;
- a fork with an empty road;
- a length under 120 s;
- a piece outside the theme.

**An empty list means the engine can build it.** Fix every line it prints in your spec, and only in your spec. A line you can't fix in
the spec is an engine finding.

## 5. Where your pass lines come from (read this before you judge a result)
- **Today, `linesFor` (spec.ts) turns profile words into some pass lines:** splits and two-road share from `branching`, up/down from
  `hills`, longest run from `tempo`.
- **The designer's ruling (ENGINE-SPEC, 12:48 PM ET) is that the words set no numbers.** The lines come from the stage's measured
  reference. For 1-1, page §E lists them all: splits at 120 px ≥ 34, two-road ≥ 0.61, and the rest.
- **Where `linesFor` and page §E disagree, page §E is the line,** and the difference is an engine finding for the planner, not a data
  change. Today's known case: `branching: 'moderate'` gives `splitsMin` 10 and two-road 0.25. The page says 34 and 0.61 (old 1-1's
  measure).

## 6. The order you work in
1. Read the brief, then the stage's page, then this part and part 1.
2. Write the spec, every value from the page.
3. Run `checkSpec` until it's empty.
4. Build and run every gate (part 1).
5. Judge every breach:
   - a data fix (counts as one of your 2 rounds); or
   - an engine finding (report it, and stop that line of work);
   - a known miss on the page's §E4 list (not yours); or
   - held art (list it under "known held art").
6. Shoot the stills the page asks for, and report.

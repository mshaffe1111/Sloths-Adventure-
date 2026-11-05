# The stage menu: what a helper can ask the engine for

Matt, 11-05: "a helper can put a prompt in of how it wants the stage to look like. And it does it. It lays it out in a way that will
follow that rule. And they just need to fix it." And: "there's a prompt that, and within that prompt, it tells it what are the
variables it can do, and then the engine understands and will randomize levels."

This is that prompt's menu. A helper reads a request (the lead's story brief, the designer's notes, or a plain sentence such as "an
enemy stage with a single branch, lots of jumps, vines and climbing"). It writes a **stage spec** in these words
(`src/game/mixer/spec.ts`, the `StageSpec` type) and runs one command. The engine then:
- checks the spec and names every problem in plain words;
- lays the stage, a different roll every time, inside what the spec allows;
- holds every rule;
- measures it on 16 rolls on both settings;
- writes the report and the stills.

The helper fixes what the report names. The helper never places a piece by hand.

**Status (11-05, afternoon ET):** this file and `spec.ts` are the contract. Step E2 is done: a stage *is* its spec in
`src/game/mixer/stages.ts`, and the mixer reads nothing else stage-specific. The library check fails if the mixer's code names a stage.
1-1 and 1-5 build from their specs exactly as before (snapshot 64/64 unchanged). Each variable below says whether the engine **does** it
today or it is **coming**.

## 1. The feel (`profile`)

| Variable | Values | What the engine does with it | Today |
|---|---|---|---|
| `trend` | `up` / `down` / `level` | the stage's overall line: up from the floor to the canopy, or down | does (1-1 up, 1-5 down) |
| `tempo` | `calm` / `steady` / `brisk` | landing width, pieces per burst, gap share, rests; sets the stage's longest-run line | coming (today it is per-stage numbers) |
| `hills` | `flat` / `rolling` / `hilly` | the size of the steps between landings; sets the up/down share line | coming |
| `branching` | `none` / `light` / `moderate` / `heavy` | forks and canopies; sets the split and two-road lines (`none`: one road all the way) | coming (today: canopy on/off per node) |
| `water` | `true` / `false` | only with water may it lay lily pads and reeds, and only inside the water it declares | coming (needs a drawn water zone) |
| `petals` | `trail` / `scattered` / `hidden` | a low trail he can clear, pickups over the jumps, or groups off the line | does `trail` (1-1) and `scattered` (1-5) |
| `look.lead` | `ground` / `tree` / `water` | which element the commonest piece must belong to | measured (1-1 ground, 1-5 tree) |
| `look.art` | an art set name | which painted kit it draws | does World 1 only |
| `length` | Normal's seconds `[min, max]`, Easy's minimum | the quick clock lines; 120 s is the floor whatever is asked | does |

## 2. What it is made of (`profile.mix`: `none` / `some` / `lots` each)

| Content | The ideas behind it | Today |
|---|---|---|
| `jumps` | bank hops, stump hop, double gap, double chain, bough hops | does |
| `climbing` | bough stair, the climb, bounce up onto a mound | does (no long trunk climb: that is 1-4's) |
| `vines` | climbing vines; swinging lianas | climbing vines do; **swinging lianas are coming** |
| `bounces` | mushrooms on perches | does |
| `water` | lily-pad hop, reed isles, the creek | **coming** (needs the water zone) |
| `enemies` | the World 1 animals on a road | **coming**: the mixer lays no animals yet |
| `hazards` | thorns, pits with a real cost | coming |
| `breakable` | creaky limbs, crumbling ledges, snap twigs | does (taught first) |

## 3. The plan (`nodes`)

The designer's node plan, one row per node:
- `job`: teach X, practise, rest, the fork, the moment, cool down;
- `deck`: the ideas it may draw from, or one deck per road for a fork;
- `teaches`: the move it teaches, which nothing before it may need;
- Dot's `line`: a shipped line, at the node's start or end;
- `flagBefore`, `heartAfter`, `safe`: misses cost nothing here;
- `height`: a share of the climb, 0 the floor and 1 the top.
- `lay`: the engine's knobs for the node, the designer's until the profile sets them (step E8):
  - `band`: the y band in px;
  - `bursts`;
  - `one`: one flat burst;
  - `ground`: no canopy;
  - `easyOnly`;
  - `not` / `notLast`: never repeat an idea;
  - `seed`: a hidden find's glint.

A stage-level `lay` gives the start's y, the last piece and the burst range.

## 4. Rules the engine holds whatever a spec asks

1. **Every piece in its element.**
   - Ground pieces stand on the ground: a stone sits on a bank, never on a pole.
   - Water pieces sit in drawn water: no lily pads on branches.
   - Tree pieces have a trunk.
2. **Nothing untaught.** A move is used only in or after the node that teaches it, or after an earlier stage that taught it
   (`TAUGHT_BEFORE`).
3. **A teach lays what it teaches.**
4. **The fixed floors every stage shares:**
   - the level check;
   - the per-jump floors, judged as the stage teaches;
   - the variety gate;
   - nothing floats;
   - at most 3 full trunks a screen;
   - the 2:00 floor;
   - Easy's rules.
5. **The stage's own lines from its profile** (`linesFor`): splits, two-road share, up/down share, longest run.
6. **Neighbours don't feel alike** (coming: a check across stages).

## 5. Example: Matt's sentence as a spec

"An enemy stage with a single branch, lots of jumps, vines and climbing":

```ts
profile: {
  trend: 'up', tempo: 'brisk', hills: 'hilly', branching: 'light', water: false, petals: 'scattered',
  look: { lead: 'tree', art: 'w1' }, length: { normal: [160, 195], easyMin: 130 },
  mix: { jumps: 'lots', vines: 'lots', climbing: 'lots', enemies: 'some', bounces: 'none', water: 'none' },
}
```

The engine's report on this spec today would say plainly:
- "enemies: some" can't be built yet;
- swinging lianas can't be built yet.

It would then build the rest: one fork, a hilly climb, lots of jumps and climbing vines.

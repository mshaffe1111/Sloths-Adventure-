# The engine makes the stage: the feel brief, World 1's rulebook, and what moves where (designer, DRAFT, 11-05 3:41 PM ET)

Matt, 3:52 PM ET: "why don't the designer just make it if it's going to tell it how to make it? The whole point was is to have
variety, and the engine will work." So the **engine generates each stage's structure on every roll.** A helper gives a short feel
brief, the world rulebook makes a bad stage impossible, and no one writes a node plan. Nothing here is built until Matt picks the path.

## 1. The feel brief: the fewest fields that give a stage its own feel

| Field | What it is | 1-1 as the example |
|---|---|---|
| `beat` | one line of story, from the lead's brief | "leaves the home forest: slow, and coming anyway" |
| `teaches` | the move(s) this stage introduces, from the world's ladder (0-2) | run, jump, bounce, double |
| `trend` | `up` / `down` / `level` | up |
| `ends` | `quiet` or `finale` | quiet ("resolve, not triumph", brief :23) |
| `look` | the light and the backdrop, in a phrase | morning, the forest's edge, then canopy |
| `must` | story pieces the stage must hold: clue, find, approved Dot lines, dressing | bootprint clue, squirrels at the start, one golden seed |
| `not` | what other stages own (the brief's "keep out") | creaky, lianas, the kapok climb, the view |

**Knobs (optional):** `branching` (none / some / lots), `water` (yes / no), `d` (the difficulty dial, 0-1).

Everything else is the world's rules plus the roll. No node list, no decks, no heights, no numbers.

## 2. World 1's rulebook: what the engine must obey so it can't make a bad stage

**Kit (LABELS.md, theme-locked to W1):**
- landings: bank, mossy stone, log (thin on a stump, or on a bank), bough on a trunk, bounce mushroom (perched), and creaky limb once
  taught;
- W1's dressing families (LABELS §5), each standing on what holds it;
- W1 art only: no other world's piece, ever.

**The move ladder (from main):** run, jump, bounce and double (1-1); shimmy rope (1-3); the kapok climb (1-4); creaky limbs (1-5);
lianas (1-6); the bush (1-7). A stage may use only moves taught at or before it.

**Hard rules, every roll:**
- rocks never float; every piece and prop stands on what holds it (E3 footingOf);
- every dip has a one-jump way out, and a fall lands on something: on the ground, **a continuous moss floor under the stepping
  stones, a road of its own** (the source of old 1-1's variety, the planner's 4:00 breakdown); in the canopy, a catch bough. A teach
  gap keeps its own safe ground that only the taught move crosses (R2);
- a stage whose brief says `teaches` puts each new move's first use over safe ground, with nothing else new beside it;
- nothing in a W1 stage costs a life before its world's first real danger is taught (1-1: nothing at all);
- at least 2:00 at Matt's pace;
- start clearance (no dressing within a body width of the spawn);
- hearts only after real risk, a flag before every hard part, petals on the route;
- the end on a bank.

**What makes stages differ (the engine rolls inside these, and the gates check them):**
- each stage rolls its own **structure**: the order and kind of its sections (teach, practise, fork, rest, test, twist, end),
  drawn from a section grammar that puts the teach first and a rest after every hard part;
- its **map shape** (linear, high/low split, loop-back, chimney: LEDGER-11-04 part1:315-318);
- where its spike, rest and forks sit;
- its **roll** (gap, rise and hop families) and its **bursts** by time (5-20 s);
- the gates: era diversity ≥ 0.35 between rolls, lookalike < 0.78 and the 20 s window < 0.30, against every engine-built stage.

**Floors (never worse than what ships):** old 1-1's per-view caps, bough and float shares, splits and two-road. **Targets from
research where they exist:** length 120-150 s for a first stage (TF 1-1).

## 3. Today's 1-1 rulings: world rule, engine roll, or brief

| Today's 1-1 ruling | Becomes |
|---|---|
| rocks never float; thin logs on stumps that meet the log; head room under raised logs; catch boughs count as boughs | **world rule** |
| nothing costs a life; every dip a one-jump way out; moss dips on the ground, catch boughs in the canopy | **world rule** (the "no life lost" part is brief-driven: `teaches` stage 1) |
| the end on a bank; start clearance; hearts, flags, petals placement | **world rule** |
| one golden seed above a mushroom, beyond a double | **brief** (`must`); the engine rolls where it goes |
| the n1-n11 node plan, its decks, forks at n3/n5/n10, the rest at n6, the spike at n9 | **engine roll** (the section grammar) |
| ground first, boughs late; "commonest piece is ground" | **brief** (`trend: up` + `look`); the engine keeps it with the bough-share floor |
| the per-roll gap, rise and hop draws (roll11) | **engine roll**, bounded by P8 and judged by diversity |
| tempo / hills / branching words | **knobs** only where they change a draw; otherwise dropped |
| Dot's lines at given nodes | **brief** (`must`: approved rows only); the engine places each at the first use it describes |
| the quiet arrival n11 | **brief** (`ends: quiet`) |
| the 120-150 s length; the taste floors | **world rule** (research target and floor) |

**Why this is also the diversity answer:** a fixed 11-node plan with fixed shapes makes every roll the same stage. That's today's
0.083 against 0.35. A structure rolled from a grammar is the lever the old 1-1 shows: its mix swings from roll to roll (0.396). The
planner's 4:00 breakdown (3:42 PM ET) says where old 1-1's 0.384 comes from: one continuous moss floor about 240 px under its stepping stones. That makes two roads everywhere, and each roll's mix swings between them. A rolled structure laid over that floor is World 1's variety engine.

## 4. The section grammar (complete, for generatePlan(brief, seed); added 3:43 PM ET)

**Section jobs:**

| Job | What it lays | Rules |
|---|---|---|
| `arrive` | the start: flat, safe ground | always first; nothing hurts and no ground ends in its first 1,300 px |
| `teach(m)` | move m's first use: expose, then validate, over safe ground | one new thing only; never a fork; its deck must hold an idea that teaches m |
| `practise` | taught moves, 1-3 bursts | may fork |
| `fork` | two roads that both finish and rejoin | high and low, both walkable to the rejoin |
| `rest` | a breath: flat ground, a Dot spot, about 2× the local beat (C2) | never two in a row; no flag unless a hard section follows |
| `test` | taught moves under pressure | a flag before it; a heart after it only if it had risk |
| `twist` | two taught moves combined, or an earlier world's mechanic (W2 on) | after at least one test |
| `finale` | a dense 15-20 s at the exit | only when `ends: finale` |
| `arrival` | a quiet walk-on to the end, held to the rest rule | only when `ends: quiet` |
| `end` | the end bank, the clue, the shrine | always last |

**Order rules:**
1. `arrive` first and `end` last. `finale` or `arrival` comes just before `end`, by `ends`.
2. Each move in `teaches` gets a `teach` before any section that uses it, in the world ladder's order (W1: run, jump, bounce,
   double...). Each `teach` is followed by at least one `practise` or `fork` using it before a `test` uses it.
3. A `rest` (or the `end`) follows every `test` and `twist`.
4. No two sections of the same job sit side by side, except two `practise` around a `fork`.
5. **Forks by branching:** none gives 0; some gives 1-2; lots gives 3 or more. A fork never sits on a `teach`.
6. **Trend:**
   - up: height bands rise section by section, ground first, then boughs once the climb starts;
   - down: the reverse;
   - level: one band with high and low roads.
7. **The moment** is the last `test`, placed in the stage's last third.
8. **Length:** sections are added until the quick clock reaches the world's band (W1 first stage: 120-150 s). Bursts are 5-20 s.
9. **The floor road:**
   - ground sections run over one continuous moss floor, with stone and log runs above it or hop steps on it;
   - tree sections have catch boughs;
   - a `teach` gap's safe ground lets only the taught move cross (R2).
10. **Decks:** a section draws ideas whose needs are taught (or being taught here), whose element fits its height band, and which the
    brief's `not` doesn't exclude. No idea twice in a row.
11. **What rolls, per seed:**
    - how many practises (1-3 per teach);
    - where forks and rests fall, inside rules 3-5;
    - the map shape (linear, high/low, loop-back; branching lots allows loop-back);
    - which ideas each section draws;
    - the roll families (gap, rise, hop).
12. **Must-haves:** each `must` item is placed by its own rule:
    - a Dot line at the first section where what it says is true;
    - the clue on the end bank;
    - a find off the main line where its rule says (the golden seed: above a mushroom, beyond a double, after the bounce teach);
    - dressing at its spot, clear of the spawn.
13. **Neighbour difference:** the job sequence may not match a neighbour's, and the variety and neighbour gates judge the rest.

## 5. Stage briefs
Each stage's brief lives in its own file, reference/engine/briefs/<id>.md. **The designer's 1-1 brief (briefs/1-1.designer.md) is NOT
on the cold builder's branch.** It's kept only to compare with the builder's brief afterwards, because a builder who can read it is
copying, not testing.

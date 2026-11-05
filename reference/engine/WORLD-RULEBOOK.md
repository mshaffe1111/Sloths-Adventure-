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

**Adopted by reference [3:50 PM ET]:** these ENGINE-SPEC sections bind every World 1 stage, as written there with their own citations:
- the placement rules (ES 270-330);
- the polish rules P-1 to P-13 and S-1 to S-9;
- the difficulty dial;
- the pacing rows P1-P9;
- the move ladder M1-M8;
- the water rules W1-W12 (for W1's teaching river and creek);
- LABELS.md's element and support table.
A research row used by one of those lines counts as used by this rulebook.

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
    brief's `not` doesn't exclude. **[revised 4:03 PM ET, WORLD-TRACE: "no idea twice in a row" had no source and contradicted Smith 2009 §5,
    accepted at ES L1883]** One exact repeat is allowed before a rest; otherwise no idea twice in a row.
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

## 6. Every rule's source (added 3:49 PM ET; Matt, 4:04 PM: "hours and hours of research... nobody wants to use it")

Kinds:
- **RESEARCH:** a research row, file:line as the critic's trace keys it;
- **MEASURED:** a run on shipped games or on our main;
- **MATT:** his own rule;
- **JUDGMENT:** no row. The reason is given, and it's on the list for Matt below.

| Rule | Source | Kind |
|---|---|---|
| **§1 feel brief: `beat`, `look`, `must`, `not`** | the lead's story brief per stage (the brief process, ES "How a stage is made") | MATT (11-05: "a helper can put a prompt in of how it wants the stage to look like") |
| §1 `teaches` | LEDGER-ENGINE-GEMINI.md:479 (one mechanic introduced, combined, twisted, mastered); GEMINI-PCG-RESEARCH.md:315 (a world's first level forces Node 1 to a dedicated teach) | RESEARCH |
| §1 `trend` | LEDGER-2026-11-02-full.md:54 (every stage tags its direction; each world has a going-down stretch) | RESEARCH |
| §1 `ends` | LEDGER-2026-11-02-full.md:78, :204, :343-344 (finale 15-20 s at the exit, walk-out ≤ about 3 s). `quiet` is the story's exception | RESEARCH; the quiet exception is **JUDGMENT** (story-led, no row) |
| **§1 add: `pair`** (the stage's mechanic pair on one beat; for a teach stage, its taught moves) | LEDGER-2026-11-02-full.md:24, :33, :208 | RESEARCH (added now: the research makes the pair a stage's identity) |
| §1 knobs `branching`, `water`, `d` | LEDGER-2026-11-04-part1.md:18 (map shape); the difficulty dial (ES §Dial, G rows) | RESEARCH |
| **§2 kit, theme lock** | MATT 11-05 ("It can't just be using any piece from any world"; "no lava in the forest") | MATT |
| §2 move ladder from main | main's taught-at (C9, from main) | MEASURED |
| §2 rocks never float; everything stands on its holder | MATT 11-05 10:39; D16, D37 | MATT |
| §2 every dip a one-jump way out | STAGE-RULES §2 (plainWalk) | MATT (STAGE-RULES) |
| §2 a fall lands on something: the continuous moss floor | LEDGER-2026-11-02-full.md:388 ("W1 in bright daylight with generous safety floors"); MEASURED: old 1-1's floor gives its 0.384 diversity, 36 splits, 0.61 two-road (planner 4:00) | RESEARCH + MEASURED |
| §2 new moves first used over safe ground, one new thing | LEDGER-ENGINE-GEMINI.md:479; CLAUDE.md "the first appearance of a mechanic is taught" | RESEARCH + MATT |
| §2 nothing costs a life in 1-1 | main's old 1-1 promise (stage11.test.ts:30); LEDGER-2026-11-02-full.md:388 | MEASURED + RESEARCH |
| §2 ≥ 2:00 | CLAUDE.md "stages take at least 2 minutes" | MATT |
| §2 start clearance; safe first 1,300 px | STAGE-RULES:161 (safe start) | MATT (STAGE-RULES) |
| §2 hearts after risk, flags before hard parts | LEDGER-2026-11-02-full.md:144, :427, :430 (checkpoint spacing; flags on the rests before the twist and finale) | RESEARCH (flags). Hearts-after-risk is **JUDGMENT** (house placement rule, no row) |
| §2 end on a bank | the 11:04 ruling (the clue on the shrine bank) | JUDGMENT (story-led) |
| **§2 rolled structure, map shape, spike/rest/fork placement** | LEDGER-2026-11-04-part2.md:113 (roll a map shape per stage, neighbours never share); LEDGER-2026-11-04-part1.md:18, :315-317 | RESEARCH |
| §2 roll families; bursts 5-20 s | LEDGER-2026-11-02-full.md:203 (rhythm groups of 5/10/15/20 s); per-roll rows (engine-runs Addendum 2-3) | RESEARCH + MEASURED |
| §2 diversity ≥ 0.35; lookalike < 0.78; 20 s window | STAGE-RULES §2; LEDGER-2026-11-04-part2.md:175 (C3); LEDGER-ENGINE-GEMINI.md:45, :465 (E1) | RESEARCH |
| §2 length 120-150 s, first stage | PACING.md §2.2 (Tropical Freeze 1-1 dev clocks, 1:50-2:30) | MEASURED |
| §2 taste floors (old 1-1) | engine-runs Addendum 4, out/old12/layout.txt | MEASURED (floor only, Matt 3:37) |
| **§4 jobs** (arrive, teach, practise, fork, rest, test, twist, finale/arrival, end) | LEDGER-2026-11-04-part1.md:314 (skeleton: start, intro, halfway rest with wayside line, climax, goal); LEDGER-ENGINE-GEMINI.md:479 (kishotenketsu) | RESEARCH |
| §4 rule 2: teach before use, a practise before a test | LEDGER-ENGINE-GEMINI.md:479 | RESEARCH |
| §4 rule 3: a rest after every test and twist | LEDGER-2026-11-02-full.md:330 (a rest between every two groups); LEDGER-2026-11-04-part1.md:210 (rest placed by the grammar after Tight) | RESEARCH |
| §4 rule 4: no same job side by side | LEDGER-ENGINE-GEMINI.md:45 (no 3-4 move repeats) | RESEARCH |
| §4 rule 5: forks by branching | LEDGER-2026-11-04-part1.md:317 (high/low split, rejoin) | RESEARCH; the 0 / 1-2 / 3+ counts are **JUDGMENT** (no row gives a count) |
| §4 rule 7: the moment in the last third | LEDGER-2026-11-02-full.md:86 (density climbs; densest group in the last quarter) | RESEARCH |
| §4 rule 9: the floor road; R2 | as §2 above | RESEARCH + MEASURED |
| §4 rule 12: placing must-haves; the golden seed | LEDGER-2026-11-02-full.md:439 (tier 3 at the top of the hardest group, proven reachable); main's old 1-1 (stage11.test.ts:17-24) | RESEARCH + MEASURED |
| §4 rule 13: neighbours differ | LEDGER-2026-11-02-full.md:62, :350 (stages sharing tempo, camera and thinking load feel the same) | RESEARCH |

**The JUDGMENT list [ruled 4:17 PM ET by the lead]:**
1. **The quiet ending:** with Matt. The lead is putting it to him; my pick is (A), a calm arrival held to the rest rule.
2. **Hearts only after real risk: MATT,** not judgment. MATT-DIRECTION 12:15 AM: "a heart only where the player can have lost one".
3. **The end on a ground bank:** lead-approved under Matt's 1:20 PM rule (what starts the game, the lead approves).
4. **Forks none 0 / some 1-2 / lots 3+:** lead-approved the same way. It's re-measured once a shipped-game count exists.

**One research row not taken, on evidence:** LEDGER-2026-11-02-full.md:331-332 ("every 3-5 minute stage") is CONTRADICTED by the
measured dev clocks (Tropical Freeze 1-1 1:50-2:30). Measurement outranks the claim (ES evidence order).

## 7. Adopted from the research trace (designer, 11-05 4:03 PM ET; WORLD-TRACE.md 6adf90a31, worldtrace-check PASS: 892 rows; USED-VIA 365, NOT TAKEN 354, ADOPT 73, LATER WORLD 52, CONTRADICTED 48)

Each rule's source rows are listed in WORLD-TRACE.md's "ADOPT candidates".

1. **Dead time:** outside `arrive`, `rest` and `arrival`, more than 2.5 s with nothing to do fails the roll (the game code's 2.5 s; ES L510).
2. **Map shapes:** a stage's 16 judged rolls show at least 3 map shapes where its `branching` allows 3 (P1:206).
3. **Landing in view:** at every take-off the landing is on screen, upright and sideways; if it wouldn't be, the path folds.
4. **Timing:** no four take-offs in a row at the same interval (± 0.1 s) (ES L1807).
5. **Animals (from the stage that teaches them):**
   - no animal sits on a gap's landing;
   - a gap-plus-enemy pair is capped;
   - at least 1.0 s (about 285 px) of flat ground before an animal's trigger (ES G L1842, L1855).
6. **Rope sections:** a shimmy rope never runs as an empty corridor. It sits beside a faster road or carries a dodge.
7. **Petal goal (marks stages):** Normal is 75-87.5% of the reachable petals; the Easy goal is set by the first-timer kid bot (G L1848).
8. **First-timer clock:** 180-300 s a stage, judged by the first-timer bot, alongside the quick clock's band.
9. **Lockout:**
   - an idea is locked out for 4 draws after it's used;
   - a template appears in at most 3 of a world's stages (G L1839, C14 L1761).
10. **Both roads judged:** every gate judges both roads of a fork, not only the bot's route.
11. **Pool size:** World 1's section pool holds at least 14 section types, and more whenever a stage only scrapes past the variety
    gates (ES C24 L1771; Matt's "more pieces").
12. **No re-roll on death:** the layout stays until the stage is cleared.

**Landing width, settled:** the G-row ruling (ES L1844, LEG:569 E105) wins over the dial's row (ES L642). It's later and sourced: pads
are 3.5 body widths (about 154 px, Normal's climax) to 7.0 (about 308 px, Easy's intro). The 110 px end is withdrawn. Easy = Normal ×
1.35 stays (C4) inside this range.

**For the planner's generatePlan:** rules 1-4, 9, 10 and 12 are gates or draw rules it encodes now. 5-7 bind once a W1 stage places
animals, ropes or marks. 11 is a library floor.

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
- the end piece carries the exit totem (main's goal object) and the clue, at the height the trend reaches (1-1: a long high log, as on main).

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

**Floors (never worse than what ships):** old 1-1's per-view caps, bough and float shares. (Splits and two-road were dropped for 1-1 on 11-06, to REPORTED only: see the ruling at the end.) **Targets from
research where they exist:** length 120-150 s for a first stage (TF 1-1).

## 3. Today's 1-1 rulings: world rule, engine roll, or brief

| Today's 1-1 ruling | Becomes |
|---|---|
| rocks never float; thin logs on stumps that meet the log; head room under raised logs; catch boughs count as boughs | **world rule** |
| nothing costs a life; every dip a one-jump way out; moss dips on the ground, catch boughs in the canopy | **world rule** (the "no life lost" part is brief-driven: `teaches` stage 1) |
| the end piece with the exit totem (as main); start clearance; hearts, flags, petals placement | **world rule** |
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
| `end` | the end piece (where the trend reaches), the exit totem, the clue | always last |

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
    - the clue on the end piece;
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
| §2 the end piece and exit totem | main's old 1-1 (a long high log with exit_totem); 1-1.md:23 | MEASURED (main) |
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
1. **The quiet ending:** RULED by MATT (via the lead, 11-05): 1-1 ends on the quiet arrival. Later stages may end on the `ending-fork` (NODES.md §1, §8), LATER.
2. **Hearts only after real risk: MATT,** not judgment. MATT-DIRECTION 12:15 AM: "a heart only where the player can have lost one".
3. **The end [revised 4:24 PM ET, from main]:** 1-1 ends as main's old 1-1 does: a long high log with the exit totem, no shrine (1-1.md:23 "up in the high branches"). The "ground bank" pick is withdrawn. A stage's end piece is the one its brief's trend reaches, with the exit totem, and the story's clue on that piece.
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

## Ruling: is 1-1 supposed to branch like old 1-1? (designer, 11-06 11:44 AM ET, for the lead's 1:00 PM classification)

**No. 1-1's splits ≥ 34 and two-road ≥ 0.61 are an OLD-ERA RULER for 1-1, so they're reported, not pass/fail. They belong to 1-2.**

Evidence:
- **1-1's story brief never asks for roads or choices.** It asks for "gentle, safe ground" at the start, "the first real step up, off the forest floor", and "up in the high branches" at the end (story-briefs/1-1.md:19-23). Its look is "the forest EDGE and FLOOR rising into the canopy… its commonest piece should be a ground piece" (:47-52). One climb, not two roads.
- **1-2 is the road stage.** "1-1 is learning: four moves taught in a row; 1-2 is choosing: a road decision again and again" (BRIEF-1-2.md:40), with boughs as "the HIGH road all along" (:39). Holding 1-1 to old 1-1's 0.61 two-road share would pull 1-1 toward 1-2, against NODES §5 (neighbours differ on thinking load).
- **Old 1-1 got its 0.61 from how it was built,** logs on posts over one continuous floor (the planner's 4:00 PM 11-05 measure), not from its brief. I adopted it as a floor on 11-05 for variety. The planner has since shown that diversity is read from the quickest route alone (measureRoll), not from two-road, so the floor isn't needed for variety either. (This reverses my own 11-05 floor; the lead confirms it.)
- **The teach and test blocks can't be two-road** (B1-B6), and 1-1 is mostly teaches.

**What 1-1 is held to instead:**
- `branching: some` as F nodes (V17: at least one fork in every 1-1 graph; the rulebook's 1-2 forks);
- the variety gate, the NEW measure (stageVariety.ts: distinct ≥ 0.237, inner ≥ 0.36, repeat ≤ 2, code). Era's old diversity ≥ 0.35 was retired by Matt on the morning of 11-06;
- the floor road under raised pieces where the job allows (FR1-FR8). It keeps old 1-1's FEEL (Matt: old 1-1's look and flow as a feel) without a share line.
- The splits and two-road numbers stay in the stage report as information. **1-2's brief sets its own two-road line**, the cold helper's to find.

**CONFIRMED by the lead (11-06 11:44 AM ET).**
- **This reverses the 11-05 floor in §2's floors line** ("old 1-1's... splits and two-road"). The reason: 1-1's brief is one rising climb on gentle ground, and roads are 1-2's identity (above).
- For 1-1, splits and two-road are REPORTED, not pass/fail. They become 1-2's own lines, set from BRIEF-1-2.
- V17 and FR1-FR8 stay.

## Rulings on the planner's three 1-1 lines (designer, 11-06 12:03 PM ET; Roll A, the lead's classification)

1. **"Standing kinds per phone view ≤ 4" is an OLD-ERA RULER.** Old 1-1 itself measured a median of 4.5 (range 4-5), so the line was
   below its own source. The art swap (W1-ART-AUDIT) deliberately adds painted kinds: stones, stumps, logs, boughs, banks and the
   mushroom. And variety comes from more pieces (Matt, 10-30). The clutter risk is real, though: a phone view has to read at a glance.
   **New line: ≤ 6 standing kinds per view, upright and sideways** (JUDGMENT, checked by eye on the stills; Roll A's 6 passes).
2. **V18 on climb sections is a real defect, with one correction to the gate.** A climb's stair is judged from its first landing up
   to its SUMMIT (the highest landing). The run-out after the summit isn't part of the stair: that's my ruling of 11-06 on
   stair-test-back, and the gate must read it that way. So:
   - `Xc2_` (a falling climb test) is a stair-test-back version whose run-out was judged. That's a gate fix: stop at the summit;
   - `Pc1<` (x 10494-13695) still fails if its step down is BEFORE its summit. Then that section gets a version with no step down before the summit, or its climb tag goes. The planner or porter names the section, and I'll rule on which.
3. **Two-road (0.10 against old 1-1's reachable 0.25):** REPORTED only for 1-1, per the lead's 12:00 PM confirmation. It's not a
   data item for 1-1. If the reachable 0.25 is the honest old figure, it goes into 1-2's own line, the cold helper's to set.

"Something new every 808 px against ≤ 572" has the same root as the quiet line. FR9, FR9b and FR10 (Rounds 7(d) and 9) fix it once entered.
- **(g), #53-#55 (the stair runs retagged as climb in Round 6):** keep the climb tag, since the climb × climb × sho cell outside the window needs them (Round 6). **Any step down before the summit in any of their versions becomes a level hop (`h`, ≥ 50 px)**, so each is a stair from first landing to summit (V18). The porter checks every version against V18 on 16 seeds. (12:04 PM)
- **The supervisor: (e) and (g) PASS (12:06 PM). Conditions added to (e), so a view still reads as 1-1's ground-led forest edge (story-briefs/1-1.md:47-52):**
  - outside the bough window, the commonest piece BY COUNT in each view is a ground kind (bank, mound, stone, stump or floor log);
  - at most 2 of the ≤ 6 kinds in a view are bough or floating kinds;
  - the same stills pass gets an eye check for dressing density, against Matt's "too much junk".
- **V18, Pc1< named (the planner, 12:28): `w1-knot-bank` ("stepped mound", version "3-step") (12:10 PM).** It's two mounds, up then down, then up then down, so its step down sits BEFORE the summit. That's what a stepped mound is, not a stair. **Ruling: retag `w1-knot-bank`'s content `climb` → `ground`** (mounds are a ground terrain family, NODES §3; TERRAIN already says `mounds`). Its shape stays; its job stays `practise`. The climb × climb cells are covered by #53-#55, #38, #39 and #48 (Rounds 5-6).
- **(g), the porter's V18 run (1:15 PM; 26 breaches on 16 seeds × 2 at engine-core 04f350bd1):**
  1. **The level beat inside a climb is a LEVEL GAP JUMP:** a short soft gap (0.4-0.5 of a single's reach), with its far landing at the same height (±10 px, V18's level allowance). There's no landing in the gap and no stump to step down from. This replaces "a ≥ 50 px hop" in #54 and #55, and the `j` in #57's stair is laid the same way.
  2. **`w1-mound-log` (#25) is retagged content `ground`,** as knot-bank was: a mound with a log over it, up then down, isn't a stair.
  3. The mirrored breaches go to the planner's no-mirror rule.
  4. **leap-stones' "rock in the air" (3) is a real defect:** a rock never floats (LABELS rule 1). Each `gStones` stone in it stands on the floor or a bank down to the ground. The porter seats them.
- **(g), round 2 (1:54 PM; the porter's V18 data at engine-core c8019ae1d):**
  1. **mound-log goes to `ground`, and the stair runs #53-#55 also take the `practise` job** (jobs `['flow', 'climb', 'practise']`). The practise × climb cell then holds 3 climb-type sections, so it doesn't run dry (52 of 120 builds failed without it), and mound-log's 12 step-down breaches go.
  2. **V18 judges a climb from its FIRST climb step to its summit.** Floor hops in the approach before the first step aren't part of the stair, the same logic as the run-out after the summit. Inside the stair (between climb steps) a floor `h` becomes `a` (the level gap jump). So bank-run a becomes `w h h c c a c`, and zigzag-run's inner hop becomes `a`. The stair tests' `w h h` openings are approach, not breaches.
  3. **high-step-twist (#56): its double goes ACROSS at the same height,** to a level stair, not a lower one. The twist is a double across instead of up; there's no step down.

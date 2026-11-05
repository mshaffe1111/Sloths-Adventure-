# A5 notes: LEDGER-CRITICAL-AGENTS.md + LEDGER-ENGINE-PAPERS.md vs ENGINE-SPEC.md (engine-spec 7f4373c)

Rows: CRITICAL-AGENTS 135 (Y 29, N 106), ENGINE-PAPERS 120 (Y 91, N 29). Total 255.
Spec use: used 50, partial 46, missing 21, contradicted 3, n/a 135.
The spec never names Carmo, Tanagra, WFC, Polymorph, Dead Cells or the critical-agents doc (grep: 0 hits for
Tanagra, Carmo, premortem, landmark, adjacen, solver, graph, apron). Where it matches them, it got there through
CP1 measures of the old 1-1, not by citing these ledgers.
Most of CRITICAL-AGENTS covers how to brief helpers (n/a). Its engine-relevant core: concept graph, beats, local repair,
pair audit, verifiers. The spec takes the verifiers and only part of the rest.

## (a) Top 10 MISSING / CONTRADICTED, ranked by how much they fight sameness across the whole game

1. **No coverage table for the library (MISSING, R5).** PAPERS:162 "for each world profile ... every (entry, exit,
   difficulty tier, mechanic pair) the curve asks for has at least N patterns (proposal: 3)". Also :93 and :220 ("a missing combo
   breaks generation; fix the rules or add pieces"). Spec L88-92 compares kinds against the old 1-1, and L259 names a missing
   piece when a node fails, but nothing counts ideas per (entry, exit, job) cell for each world. Decks hold 1 idea in places (n7
   L347, n11 L351). Why it matters for the whole game: Worlds 2-10 are "not rebuilt now" (L1629). When they are, a thin cell
   means the mixer lays the same idea every time that cell comes up, in every stage of that world. This is Matt's "more
   pieces" rule turned into a gate, and the spec does not have it.
2. **Connectors made universal, not capped (CONTRADICTED, R4).** PAPERS:225 "only 3, since more 'lower variety'". :95 "Nothing
   measures how alike our node seams look". :163 "Vary the apron ... and count repeats". The spec adds universal flat
   joins: L503 "On Easy, a breather pad of 2-3 s between every node. It is flat, safe ground", and L799 "A 1.0-1.2 s pad after every
   second burst on Normal". It has no seam-likeness count. Across 90 stages, every node seam would look and play the same.
3. **No pinned, hand-made pieces (MISSING, R4).** PAPERS:100 "Pinned pieces, regenerate the rest ... NOT in ours". :159 "This
   is where the signature moment lives". :255 and :270 say the same. The spec names a moment per stage (`story` L1213; 1-1's n9
   L1073), but the mixer still rolls it from a deck. Hand-built stages exist only as whole special stages kept as built (L1495).
   The one beat per stage that players remember is still a random draw, so it can come out alike across stages and worlds.
4. **No count of least-used or dead pieces across rolls (MISSING, R4).** PAPERS:236 "Table 4: most/least used, mean, std dev". :237
   "Report dead (0 use) and hog pieces". The spec caps only the commonest piece's share per stage (L33) and ran a one-off
   all-world count (L190-197). An idea on the library sheet that the mixer never draws adds no variety, and nothing would notice.
5. **No pair or neighbour difficulty audit (MISSING, R2).** CRIT:75 "mandated to audit pairwise and multi-node adjacencies"
   (Polymorph: "a standard gap next to a slow enemy becomes a compound bottleneck"). CRIT:204 and :313 say the same. Placement rules
   L278-319 check joins and clutter only. This matters as the animals "go anywhere" (L139, L1564). New pairs come up all the time,
   and an unfair pair gets read as a cheap hit, not as variety.
6. **A small edit still reshapes the rest of the stage (MISSING, R2).** PAPERS:254 "A small edit can force wide changes elsewhere
   ... Pinned nodes + local retrace". The mix code gives each node its own RNG stream (`/home/user/mix/src/game/mixer/w1mix.ts:26-27`).
   The spec states no rule that a change to one node leaves the others' layout alone. The regression locks (L1345, L1464) only
   record the change.
7. **No rule that a gate errs only toward failing (MISSING, R1).** PAPERS:248 "a gate may only err toward failing". :112 "it only
   produces false negatives". :166. The spec adds about 12 new gates (L1612-1620, element, float, feel) with no such rule.
8. **No two-pass placement: terrain first, then hazards (MISSING, R1).** PAPERS:115 "hazardSpots() places hazards on the lines the
   beat made Pokey avoid". :168 and :244 say the same. The spec puts animals inside ideas (L107) and counts them per stage (L645),
   with no rule for where on the route they go.
9. **No adaptive help (MISSING, R1).** PAPERS:208 "Crash (Aku Aku after deaths, slower boulder, crate continue point)". The spec
   has only fixed Easy and Normal dials (L635-648).
10. **Zero-width gap rule (MISSING, R1).** PAPERS:157 and :268 "if the width of a gap is zero, its height cannot also be zero". The
    spec leaves this to the level check code.

Important PARTIALs that are not in the ranking: landmarks at forks (CRIT:62, :307: "places distinct visual or structural
landmarks at decision boundaries"; spec L826 puts only a mark on the fork bank). A concept graph with lock-and-key (CRIT:60,
:216; the Root gate idea is parked, L204). Beat durations per node (CRIT:61, :217). Automatic local repair (CRIT:64, :309;
spec L259 fails and stops). Each of these makes stages more distinct.

## (b) Spec claims to follow research/Gemini/a source, but the research says otherwise

- I found none in these two files. The spec never says it follows them. Its research claims cite other files: R3 F10 (L109), R3
  W2 (L505), Shovel Knight (L503), GEMINI-VARIETY (L1585, L1589), DESIGNER §2.3 (L644).
- These differ from the research without the spec claiming otherwise:
  - Spec L503 "a breather pad of 2-3 s between every node". PAPERS:95 / Carmo C831-833 "adding too many of them could end up
    lowering variety".
  - Spec L178-188: the level designer issues number rulings ("no rise is more than +40 px"). CRIT:52 says the Designer is "strictly
    prohibited from performing low-level numerical constraint checking". That is about process; the spec's designer and planner
    roles don't follow the doc's split.
  - The spec's many rounds of designer rulings on planner runs (e.g. L178, L365, L381, L420, L474, L490, L795). CRIT:36 says "One round, then stop ... debate beyond one pass
    entrenches errors". This is process only.

## (c) Spec numbers that a line in these files answers directly

- Normal flat-jump gap. Spec L37 and L1152: "a Normal flat jump (180 px)", "(157-185 px, PLAN.md table 2.1; use 180)".
  PAPERS:147 (in §3, not a row): "measured limits: flat jump gap about 104 px, a double about 200" (beatTrace.ts 37-38).
  So 180 vs about 104. They may measure different things (run-up vs standing), but neither file says which.
- Easy rise. Spec L182: on Easy "a rise of +50 to +70 stays allowed only onto a landing of 220 px or more". PAPERS:147: "a face
  up to 70 px Normal / 42 Easy". So up to 70 on Easy vs a measured Easy face limit of 42.
- Smallest landing. Spec L642: "never under 90 px". PAPERS:147: "MIN_LEDGE 90". They agree.
- Dead time. Spec L510: "no dead time over 2.5 s". PAPERS:147: "DEAD_WALK 2.5 s". They agree.
- Repeats. Spec L396: "same kind x size: 7 or fewer" in a row. PAPERS:147 and :263: "GAP_REPEAT 4 within GAP_SAME 12 px" (refuses
  the same gap 4 times in a row). So the spec allows 7 where the tracer refused 4. They count different things (kind x size
  vs gap), but the spec's line is looser.
- Ideas per cell. Spec L347 (n7 deck = one idea, "rotten-branch drop", later 2 at L480) and L351 (n11 = one idea). PAPERS:162:
  "at least N patterns (proposal: 3)". So 1-2 vs 3.
- Connectors. Spec L503 and L799: a flat pad between every Easy node and after every second Normal burst. PAPERS:225 (Carmo):
  "only 3" all-connector pieces in a 197-piece library. So every seam vs 3 pieces.

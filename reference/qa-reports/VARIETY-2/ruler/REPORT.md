# RULER REPORT (R-165.197/.200). Engine, Opus 5.5 max. t-ruler from t-nodes@1829470f, 8:51-9:45 PM ET 11-13. HELD (C, the lead 9:35 PM)
**EXACT NEXT STEP: R-165.221 (the 1-1/1-4 polish lane): what 1-1 must lay for the per-gap ruler to pass.** Under its final climb, over
the holes in the earth, every x a falling Pokey can reach must be (a) under a heartFalls soft zone spanning the WHOLE hole (floorlessGaps
needs the gap inside one zone, promises11.ts:54-56), or (b) closed: a catch or lower log he cannot walk off into nothing (realFalls finds
no open run of 32 px), and drop.untyped needs a Drop record over every hole realFalls still opens (verdicts.ts:142-145). Seed 769
(layout 1, Normal), pasted (id x0..x1 top, h 24 unless said):
  holes (no earth at any depth): 25298..27953 (lips 797/677), 28068..30938 (694/677), 31047..31993 (694/626)
  113 block 25199..25298 797 h120 (left lip) | 114 log 25298..25786 729 | 120 CATCH 25298..25348 819 | 115 log 25755..25947 869
  116 log 25846..26248 652 | 121 CATCH 26218..26390 794 | 117 log 26340..26760 704 | 122 CATCH 26730..26873 794 | 118 log 26823..27261 628
  gen2 falls (soft): 25786..25846, 26248..26340, 26760..26823 (the jumps); heartFalls soft zones past 25000: none
  open runs (both clauses corrected, still open): 25348..25755 (off 120 under 114), 25947..26218 (off 115 under 116), 26390..26730
  (off 121 under 117), 26873..27231 (off 122 under 118), 27375..27953 (from the 677 bank under 119); hole 2: 28535..28884,
  29066..29388, 29559..29906, 30093..30427, 30597..30713; hole 3: 31097..31308 (under branch 140)
Mix strings show the same in World 1's high sections (mixlist: 180 gaps: quiet-arrival 47, canopy-rungs-level 26, high-walk 16,
log-chain 15): the fix belongs where those sections are laid (a soft zone per hole the builder's soft falls cover is the cheapest).
Then on t-ruler: seedlist 1-1 --check, lockall (1-1 too), mixlist, scan.ts, the full Checks; verdicts.test.ts:322's seed 323 copy gets
the real stage's next bank (its slot ends at log 127 with no bank to its right: no gap under earth-only lips).
## Done (evidence)
- **Planted first** (w1Pits.test.ts): "per-gap ruler" x4 red on 1829470f, green now; "a piece lying on the ground is no pit wall" (1-2
  layout 3, seed 3) red, then green; the x22604 slot reads the block as a 68 px sunk step (its realFalls assertions kept).
- **The ruler** (w1Pits.ts findOpenPits): earth-only lips (EARTH_DEEP 90), `earthLine` holes at any width >= 24 and dips, `gapLine`
  (the higher lip unless the lower lies more than SOFT_BELOW under it), `onFloor` (a rim lying on its floor is no wall), nested dips merged.
- **(a)** scan.ts, same builds read by both rulers (3,264): scan-3.txt: PAINTED 0; judged World 1 floor.unmarked changes: 1-1 32/32 only.
- **(b)** no painted change, so no before/after pair; the climb (3 spots) and the catch ends (2), before: stills/. 1-1 "after": refused.
- **(c)** seedlist 1-1 --check: UNFINISHED, killed by my 25 min timeout (exit 124, no output; every 1-1 seed is refused, as in w1Pits.test's "no seed of 24 from 769"); not re-run (held). lockall --layouts 16 vs d8d6a97 on the 101 other stages: 101/101 unchanged (1-2, 1-3 roll as on main); 1-1 refused on every build.
- **(d)** mixlist: 60 strings, clean 0 (was 1), fair 8, fair clean 0 (was 1), floor.unmarked 60 (was 36).
## Gates: tsc, generality, roadmapcheck (full clone), knowncheck PASS on dbde77d0. NOT RUN: the full suite, build, perf gates: 1-1
cannot build on this head (w1Pits.test "World 1, layout 1", stumps.test, softFalls11 x4 fail on it), so nothing here can ship yet.
## Polish check: nothing drawn changes (0 painted). Stills: under the climb the backdrop draws fallen trunks he would fall through.
## Pushback: yes, PUSHBACK.md (the settled ruler refuses the live 1-1; the cause is 1-1's openings, not the ruler or realFalls).
## Method, lessons, Learned
Method: ENGINE.md day one, level.md, gates.md; a ruler change is scanned on the SAME builds (ruler/scan.ts), its readers listed first.
Lessons: D15 (my first probe's "no solid at any depth" counted the route itself; corrected in PUSHBACK), D19, D40, D52, D55, D57, D59.
Method update: before blaming a reader (realFalls), re-run the case with it corrected; here the runs stayed, so the stage was at fault.
**Learned:** a stage-wide line hides whole regions; when a ruler starts seeing them, expect real defects, and measure painted vs
judged vs raw separately. Turnover: engine-core.md section 0n (rewritten).

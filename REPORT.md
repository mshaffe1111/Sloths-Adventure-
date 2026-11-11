# EN-G report (R-165.116, R-165.117, R-165.123), Engine. Branch t-engine-guards on release-0.9.6 @06bbd29f (on top of 3ce6ac43)
**Method used:** test-first; each audit test brought in and run red on the old code before the fix (D37: the real engine read, not the
audit's summary). Commits: a0760620 loop, 6b0c6ff3 + 3e9c4777 saves, 7553eade gate, then this report. Main chunk: 3,982,949 -> 3,982,860 B
(-89 B; chunkcheck 11,444 B spare of its 3,994,304 B budget: the "37 KB spare" is against the raw 4 MiB cap, not the gate).

## Done-items (4/4)
1. **R-165.116 loop.** engine.ts `loop()`: an account of real time not yet played (`acc`), played in whole 1/30 s steps, up to 3 a
   frame, the rest dropped; a frame within 0.5 ms of 33.3 ms is one step. Governor and recorder see the true gap. Audit A-01's test is
   now `src/game/frameLoop.test.ts` (its 8 cases and thresholds kept; added 144 Hz, 59.94 Hz, exact step size, the 30 fps lock, a stall).
   Old loop 0/12 (A-01b: "played at 1.50x; the governor was fed 50.0 ms frames; q0 -> q2"; after a stall two frames of 2 steps);
   fixed 12/12. Every step is exactly 1/30 s = realPlay's DT, so browser physics = the bots' (A-02's cause is gone).
   Real browser (1-2, Chromium, `reference/qa-reports/R-165.116/`): upright and sideways 30.0 fps, game/real 1.000, every step
   0.033333 s; CPU slowed 4x: 29.8 / 28.1 fps, game/real 0.999 / 1.001 (catch-up steps). Stills normal both ways (loop-contact.jpg).
2. **R-165.117 saves.** One entry limit (16,000) in saveFile.ts for every key. Audit C's 2 tests and audit A's 2 save tests brought in
   (`saveRoundTrip.test.ts`). The biggest finished game, filled through the game's own writers with its longest real ids
   (`saveFill.ts`, a test kit the game never imports), round-trips as a file and as a save code: 97,882 chars (49% of the 200 KB cap);
   biggest entry the Trophy Room, 4,099. 34 finds and every count to 47 load. 0.9.5's own code wrote `src/game/fixtures/save-0.9.5-mid`
   (0.9.5 loaded it) and `-after-5M` (0.9.5 REFUSED it, "damaged entries"): both load now, every entry restored. Old limits: 6/8 red;
   fixed: 17/17 with saveFile.test.ts. Play Store §6.8 (saves survive): this is the backup path's half of it.
3. **R-165.123 gate.** `npx tsx tools/engine/generalitycheck.ts`: a token reader (comments and Dot's words never trip it) failing on a
   stage id or world prefix, a world/stage-number rule (`===`, `switch`, `[..].includes`), a seed (`seed === n`, `layoutSeed: n`,
   `setLayoutVariant(n)`), an x position >= 1,000 px. Scope and every exemption (with why) at the top of the tool; a new gen2 file is in
   scope from its first commit. Debt: `tools/engine/generality.known.json`, 27 entries / 38 literals, each with why and owner, shrink-only
   both ways (gate fails a gone literal; knowncheck counts each literal as an id). `generality.test.ts` 21/21: 15 planted kinds fail,
   9 look-alikes pass, a mutation (world rule blinded) turns 6 red; CLI on a seed planted in reach.ts exits 1. In gates.yml, CLAUDE.md
   Checks, gates.md (row 5c, breach reading, known lists). All 998 .ts in src/ tokenize with balanced brackets (0.85 s).
4. **Gates (CI=1 FORCE_COLOR=1), all PASS:** tsc; touched tests 50/50 (frameLoop, saveRoundTrip, saveFile, generality); vite build;
   chunkcheck; artcheck; knowncheck; roadmapcheck; generalitycheck; `seedlist.ts 1-1 --check` (200 seeds clean both settings);
   buildcheck (p95 99 ms Normal, 77 ms Easy, budget 150).

## Pushback / for the lead
- **Roadmap (integration):** R-165.116/.117/.123 rows exist only on ccr-702d3c49-i33jeq. roadmapcheck rule 3 needs an open row citing
  the new known list, so I copied the R-165.123 row verbatim with "known debt tools/engine/generality.known.json" added to its Source,
  and BUILD-PLAN.md:70's Day 1 total (615.5 -> 618.5). At integration keep ONE R-165.123 row (with the citation) and your total.
  When .123 closes, the debt needs an open burn-down R-id or roadmapcheck fails.
- **roadmapcheck had a hole:** it walked only src/ for *.known.json (its header says every); a list beside its tool escaped rule 3.
  Now it walks tools/ too. A defect-log entry is the lead's call.
- **Judgement calls to confirm:** nodeCode.ts's three V13 rules (`rules.mini === 1/9/6`: every world's X-1/X-6/X-9) are listed as debt
  but may be legitimate structure; X_MIN 1,000 px means an x hard-coded nearer the start is not seen (named in the tool).
- Root PUSHBACK.md is R-165.62's (on the base), not mine.

## What's left (not in this packet)
- Audit A-05 (camera 11 px cap per update: 22 px in one drawn 67 ms frame; the camera owner) and A-06 (paused stage redrawn every frame).
- The 38 literals' burn-down (world data / brief / per-stage script: Engine 1's A2/A3 lane).
- The full suite, lockall, drawcheck, clipcheck: the integration runner (TEAM.md cost rule 4). No Critic yet.

## Method update
- Worked: run an audit's test against `git show HEAD:<file>` swapped in, then the fix, in one command; it proves red-then-green fast.
- Failed: 6b0c6ff3 went in with tsc red (I ran tsc and commit in one line without gating). Countermeasure used since: `tsc && git commit`.
- A worst-case fill with synthetic 40-char ids overstated sizes 2x (play records 1,104, file 160 KB); real ids from the game's own
  lists (fight.ts TRAITS, ALL_FINDS, BADGES) give the true biggest game.

## Turnover
reference/handoffs/engine-core.md §0d (the loop, the save kit, the gate and its list).

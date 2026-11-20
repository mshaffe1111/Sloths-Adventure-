# INT-14 REPORT: release 1 (Friday 11-20): merge what is green, hold back what is not, every gate once

Draft started 10:05 AM ET 11-20 (by `date` in the same command). Integration, session_01FhBbYMMP8GPmAoMx12of76.
Base: t-int-14 from t-int-13 @ d36638be (INT-13b's final). main = 6e7b85f8 (no newer release).

## Merges (packet order; tsc + the CI tool line (gates.yml, CI=1 FORCE_COLOR=1) after EACH merge, D92)
| # | Branch @ hash | Merge | Conflicts and resolution | tsc | CI tool line |
|---|---|---|---|---|---|
| 1 | t-paint-292 @ 05cebafa | d8f3aeb8 | reference/art/HF-SPEND.md: union (INT-13's sections, then PAINT-292's) + the combined balance note (~$49.0) | PASS | PASS: 306 tests, 305 pass, 0 fail, 1 todo |
| 2 | t-eng-noise @ c59928a4 | d1a51eeb | reference/handoffs/engine-core.md: union (§0zq-13b, then §0zq-NOISE) | PASS | PASS: 306 / 305 / 0 fail / 1 todo |
| 3 | t-eng-prowl @ 33e43c57 | 4d5e0554 | castPlay.ts auto-merged (prey.hanging after prey.covered, beside ENG-NOISE's channel, as the lead's trial); engine-core.md union | PASS | PASS: 306 / 305 / 0 fail / 1 todo |
| 4 | t-eng-small3 @ 9b1767f9 | acd0046c | engine-core.md union | PASS | PASS: 306 / 305 / 0 fail / 1 todo |
| 5 | t-eng-25c @ d13ebdaa | bdee80c8 | pipeline.ts auto-merged; engine-core.md top: one "Merged at INT-14" line naming today's sections, the INT-13 line kept word for word | PASS | first run FAIL 1 (seedlist.test 'a listed stage with no list yet': "unable to write file" in its scratch worktree = the disk allowance full, 98%, from my own per-merge worktrees); worktrees removed (19 GB free), seedlist.test alone 8/8, the whole line re-run: PASS 306 / 305 / 0 fail / 1 todo |
The 1 todo everywhere: 'chase bots (OPEN, todo): the CHILD bot on Normal reaches the fork' (pre-existing, as INT-13b's).

## Hold-backs, prepared before the late joiners are decided (side branches, pushed; NOT merged)
- **t-int-14-hold19** (b286f754 on bdee80c8): 1-9 ships as main has it (the hand-built 1-9). protoStage HAND_STAGES '1-9' back; the stage
  table's 1-9 row out (kit 'w1-19' kept, unrouted); provenIndex '1-9' out; the player's words main's (Dot's hint.1-9.guard and
  lock.ring.snakes + FIRST_OF, the journal's boa tip, the moves page's ring opening, Pokey's page, the mission, no '1:gauntlet' sealed
  line, stageSheets '1-9'); coverage.known.json = main's (the ring's known gap R-165.272 returns with its stage). Tests moved to a toy
  (law 22, none deleted): w1Arc19.test reads kitLib19 + finish19 as a toy row carrying the designed mission (petals) and pins the player's
  lines by routing; judgedTable's pins follow the table.
- **t-int-14-hold24** (9faad781 on bdee80c8): 2-4 ships as main has it (the hand-built 2-4). w2Sections.ts = main's (it differed only by
  BUILD-24's deletion 81b152fa5) and W2_STAGES '2-4' back; the stage table's 2-4 row out (kit 'w2-24' kept, unrouted); provenIndex '2-4'
  out; main's words (Dot's four hint.2-4 lines, the mission, Pokey's page, the clue); main's w2Stages.test.ts (its 2-4 test) back;
  vineSnake.test runs 2-4 again beside 1-6. Tests moved to a toy: w2Arc24.test (kitLib24 + World 2's finish) pins the words by routing;
  riverRaft.test's listed raft stages follow the table and kitLib24 still lays its raft; judgedTable's pins follow the table.
- **Proof, each:** `lockall.ts --layouts 16 --stages <id> --check <main 6e7b85f8's lock>`: **1/1 unchanged (32 builds)** for 1-9 on hold19
  and 2-4 on hold24. tsc PASS; registrycheck PASS (11 stages); coveragecheck PASS; knowncheck PASS; the moved tests green (w1Arc19 +
  judgedTable 14/14; w2Arc24 + judgedTable + riverRaft 18/18). The full suite runs on whichever final head carries one.

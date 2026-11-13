# Module map (gen2 roll judging, as of R-165.61, 2026-11-10)

```
worlds/w1.ts (data: sections, bands, briefs incl. softFalls)        reach.ts (NEW, E0: FlownArc rows + BandTable from reach.md/bands.md)
        \                                                              |
pipeline.ts  lays a roll ──> Gen2Meta { drops: Drop[], asks }  ──> verdicts.ts (NEW, E0) ──> RollVerdict per setting
        |                                                              ^
levelCheck.ts (jumpOK reads the arcs)        PromiseRegistry (promises11.ts) ── read by ── seedList.ts seedListBreaches / tests
        |
seedList.ts + provenSeeds.ts + firstRun11.ts (NEW) ──> testlink1_1.ts RunPick ──> stageGenerator.ts gen2Roll11 ──> engine.ts
                                                                                    (softOn from softFallStage, A1)
```
- Types live in `src/game/gen2/verdicts.types.ts` (ADR-001, ADR-002); nothing outside gen2 imports it except saveFile.ts (FirstRunSave).
- The flown figures exist in ONE place in code (reach.ts), copied from the Designer's spec with each row's source; physics.ts keeps the
  ballistic constants other code reads, and no reach decision reads them.
- Help (E2) sits beside, not inside, this: helpLadder.ts owns every help decision; assist.ts and GameOverCard.tsx ask it.
- Decisions: ADR-001-verdicts.md, ADR-002-first-run.md. File lists: PACKETS.md. Budgets: BUDGET.md.

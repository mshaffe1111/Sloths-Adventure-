# INT-3 PLAN (Engine, integration; Opus 5.5 xhigh). Branch t-int-3 from origin/ccr-ea739a2f-dfcee4 @ 7f453671. Written 2:16 PM ET 11-13.
1. Merge (never rebase), in order: t-art-1113, t-add-level, t-fa (head 5fef0406 = ff239695 + FA's docs/stills only), t-b15, t-b14, t-fixa, t-fixb; tsc after each.
2. Item 0: (a) VARIETY engine-vault.patch (not on t-nodes yet at 2:16 PM: asked the lead) + 1-4 castBots 1-6 then 1-40; (b) drawcheck 1-4
   sideways breach fixed at the root for every tower stage (never the limit); (c) rollGuard 1-5 red fixed at its root; inventory.test.ts:155 clears on merge.
3. R-165.201 Dot card tap: planted touch test first (tap during a mushroom bounce), then the input fix; real page upright + sideways.
4. Owed: ControlTestGate 1-3 alt; the keyboard coach line; #ctest stage 1-4 only if 1-4 bots 40/40.
5. FULL CLAUDE.md Checks once on the head; stills 1-4 and 1-5 each beat, upright + sideways, Normal + Easy, fresh save; REPORT.md.
WRITE: every file the seven merges touch (conflict hunks only); src/game/engine.ts (vault hunk; B14 retired), NEW src/game/vineTop.ts(+test)
from the patch; the draw files the drawcheck call sites name (scenery.ts, renderer); the rollGuard root file; the Dot-card input path
(touch controls / Dot card component, named in the report); src/components/ControlTestGate.tsx; the coach line's file; reference/qa-reports/INT-3/.
NOT: tools/perf/limits.json thresholds, seed lists (no re-record), STAGE-RULES numbers, t-pieces, t-nodes engine WIP.

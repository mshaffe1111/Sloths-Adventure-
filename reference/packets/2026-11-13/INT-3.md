# INT-3: tonight's integration (0.9.8 candidate content). Opus 5.5 xhigh (integration). Written 2:10 PM ET by the lead.
Branch t-int-3 from origin/ccr-ea739a2f-dfcee4. Merge (never rebase), in this order, resolving conflicts at the root (shared hunks are
byte-identical patches; keep one copy): origin/t-art-1113 (final), origin/t-add-level (holds t-s1's final), origin/t-fa (ff239695),
origin/t-b15 (final), origin/t-b14 (final, holds the VARIETY vault patch), origin/t-fixa (final), origin/t-fixb (final).
NOT tonight: t-pieces, t-nodes (engine WIP; their gates not run): next release.
## Done
0. Owed by B14c (stopped at its line; t-b14@8bcbe53b REPORT): (a) apply VARIETY's engine-vault.patch (reference/qa-reports/VARIETY/
   engine-vault.patch on origin/t-nodes: vineTop.ts + one engine.ts hunk; ask the lead for the commit if it isn't there yet), then re-run
   1-4's castBots (seeds 1-6, then 1-40); (b) DRAWCHECK BREACH: 1-4 sideways spot 1 (x 922, y 5699) 8.01 > 7.5 screens
   (PERFORMANCE-RULES §1 is pass/fail; never touch the limit): mostly scenery on a tall stage (backdrop drawFitted ~3 screens, ground
   chunks, vignette, scenery.ts:1506 lanePool); fix at the root for every tower stage (evidence: reference/qa-reports/B14/drawcheck-b14c.txt);
   (c) rollGuard 1-5 red (B15's) and inventory.test.ts:155 (fixed on t-art-1113 at a8fd1113: clears on merge).
1. Every merge clean; tsc green after each.
2. R-165.201: a tap inside a Dot card's box always goes to the card, never the game, even while the card moves (planted touch test at a
   mushroom bounce; real page upright + sideways). Blocks R-165.175 shipping.
3. Small owed items: ControlTestGate.tsx 1-3 alt = "Pokey on the forest floor near a golden snake and a hive" (keeper, t-story@61b66bf7);
   the keyboard coach line "Press Space to hop up or over." present; #ctest stays on 1-4 only if 1-4's bots pass 40/40 (else set it to 1-3
   and say so).
4. The FULL CLAUDE.md Checks on the head, one time (this is the integration head: LAWS 5), every one green; a red one is fixed at its root.
5. Stills of 1-4 and 1-5 at each beat, upright + sideways, Normal + Easy, fresh save, in reference/qa-reports/INT-3/stills/.
6. REPORT.md (30 lines): the head, every gate's result, what's in, what was left out and why. One message to the lead. Stop.
BOX: 3 hours or 40% of the 1,000,000-token window. Context % in every message. TODAY.md's rules apply (read your queue at every push).

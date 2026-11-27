# The lock with 1-4 intended (ENG-DARK box 28; the lead's ruling (b))
Base lock: `npx tsx tools/engine/lockall.ts --layouts 16 --out <base>` on frozen t-eng-w3 88592a9c4 (D115).
Check: `npx tsx tools/engine/lockall.ts --layouts 16 --intended 1-4 --check <base>` on frozen 93e05e98d. Both run in the same 4 stage
chunks (`--stages`, 25 each); merged, 3200 builds of 100 stages on each tree, the same keys (no build skipped by the check).
VERDICT: exit 0 on every chunk; 99/100 stages unchanged; `1-4 (intended): platforms, collectibles`.
1-4's moved builds (11): Normal 1 2 8 10 11 12 13 14 16, Easy 5 6 (the same 11 as box 27's bisect).
Reason: offEnd (8cc3a319a + 4bfa3fbee) closes wall slots where he fell 561-2004 px (a 642 px fall -> 0 on the real engine); every
other stage unchanged. Past layout 16: Easy 34 gains two 34 px run-ons (x 1246, y 2644 and y 1081), the same rule.
Bots x40 (both settings, every tier, frozen): reference/qa-reports/ENG-DARK/REPORT.md on t-eng-dark-wip (box 27 table, box 28 trace).
Not reproduced: box 26's count "102 stages, 3264 builds"; lockall lists 100 stages (3200 builds) on both trees here.

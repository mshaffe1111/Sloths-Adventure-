# PROOF-1 delta: t-int-2 @91af3475 (AF's fixes + P11, F12, render, pit) vs PROOF-1's 5 violations. Verdict: **REJECT** (1 item, law 5)
Auditor, 2026-11-12 1:15 PM ET. Every proof re-run here (scratch worktrees at 91af3475; nothing in production code touched). Logs: logs/.

## The 5 violations: all FIXED, each proven by me
1. AudioFocus/KeepAwake (audioFocus.ts:13, appShell.ts:36): plugin held in `{ plugin }`. capPlugins.test.ts 4/4 drives the real functions
   through Capacitor's real bridge; planting the bare plugin back turns it red (2 fail). Shipped build in Chromium with the bridge:
   KeepAwake.set reaches it, 0 page errors (was '"X.then()" is not implemented'). Every other @capacitor use in src checked: none bare.
2. Stage Cleared card: my own probe (cleared/cardfit.mjs, the dev hook __win, nothing scrolled, real insets) at 14 sizes x (3 medals, none):
   **28/28 inside the safe area, all >= 44 px, card never scrolls**; the same probe on d0276817 FAILS 17 (sideways AND upright). Stills:
   cleared/fixed-side-sheet.jpg, fixed-up-sheet.jpg. clipcheck on 91af3475: PASS (83 known), 312 s.
3. Save/Load words: the 3 lines equal the story keeper's STORY-LINES.md @fdce7348 (origin/ccr-0d59a91c-oy3imz) word for word;
   saveLoadWords.test 3/3, red (2) with the old line planted; PROOF-1's saveCopy.test passes on this tree.
4. Generality: 16/16 plants FAIL (7 engine files + the 7 it missed + predators/core, casts); gate PASS 27 known (was 29).
5. The 4 tools tests: gates.yml:93 runs them (17/17 pass here, yield included); ciTests.test.ts fails a committed orphan test (planted).

## Same kinds in the delta (d0276817..91af3475, 304 files)
- Capacitor `then`: none live. Player text: the only new strings are the 3 Save/Load lines (all story keeper's); the rest are judge
  messages. Generality: no new literal (the delta's new gen2 files forced into scope: PASS). Insets: only cleared.css changed; clipcheck PASS.
- Gates on 91af3475: tsc, chunkcheck, knowncheck, artcheck, roadmapcheck, generality: exit 0.

## REJECT: the countermeasure for #5 breaks law 5's known-list rule
- src/game/ciTests.test.ts:22 NOT_IN_CI can GROW: planting an orphan test plus its NOT_IN_CI entry passes ciTests and knowncheck
  (logs/citests.log). LAWS 5 lets a new gate keep a known list only if a test fails when an entry is added, and every entry has an
  owner in the defect log; this list has neither (AF names "no R-id yet"). Fix: add it to knowncheck LISTS (or pin the 17) + an R-id.

## Holes (not blocking; same kinds could slip back)
- capPlugins.test guard misses `async function f() { return registerPlugin(...) }` (planted: 4/4 still pass).
- tools/engine/generalitycheck.ts EXEMPTs predators/roster.ts whole, and it holds logic (inWorld, :63), not only tables.

## AF's unproven items
- Back on the guardian card, the REAL way (shipped build, map -> 1-10): intro story -Back-> guardian card -Back-> map -Back-> title,
  0 page errors (runtime/backcheck3-int2.log). AF's own run opened the cards by dev hook only.
- Boss to its end: AF's harness kept hearts up and cut the guardian's health; I did not redo it. 30 fps at CPU x4: still a phone job.
- The 640x360 compact card (AF named it): its bottom row text runs past its buttons, the same on d0276817 (cleared/cmp-640x360-*.jpg).

# Method: save slots and anything that changes what a save holds
Written: 2026-11-04 12:01 ET, branch menus-nav (New game + 3 explorers, mocks stage). Owner: menus A.

## When to use it
Any change to what is saved, which keys a New Game clears, the backup file's list, or who a key belongs to (an explorer or the phone).

## Steps
1. **Inventory every storage key from the source, not from a list.** `grep -rnoE "['\"\`](sloth|sloths)_[a-zA-Z0-9_\$\{\}]*" src`
   gave 80+ names in 2026-11-04's run. Then grep for keys that are not `sloth_` (`localStorage.(get|set|remove)Item` with another
   literal; `sessionStorage`; `indexedDB`). Read each key's module to learn what it means. Several "sloth_<creature>" names are
   tester art switches, not progress.
2. **Class each key once, in code** (`saveSlots.ts keyClass`): explorer or phone. The gate in `saveSlots.test.ts` scans `src/` and
   fails on a key with no class. It found `sloth_story_b*` on its first run. An unknown key stays on the phone (shared, never lost).
3. **Don't move existing keys.** The swap model keeps every module's reads and writes as they are: the live keys are the explorer
   playing; the others are whole JSON copies. Today's save needs no migration, and an older version still plays the explorer who was
   playing.
4. **Journal any multi-write change.** Write the new copy and read it back before clearing anything. Delete the source of truth
   last. Finish a cut-off change in a module imported before App (`slotBoot.ts`).
5. **Test the kill at every write** with a store that throws after write N, for every N, until a run completes (48 cut points on a
   Worlds 1-3 save). Assert the number of cut points, so the test can't pass by stopping at the first one.
6. **Prove it in the real game too** (`tools/qa/menushots/slotsFlow.mjs`): old save, new explorer, back again, every key compared.
7. **Shots** (`tools/qa/menushots/slots.mjs <out> [saves]`): four saves (fresh, old, family, full) x 412x915, 915x412, 360x640,
   640x360, each with a text, tap-size and button-inside-its-card check.

## The bar
`reference/menus/save-slots/mock/`: the title with New game and Who's playing, the slot card, New game's choice, a new explorer's
name and the erase question, all four saves, all four sizes.

## Pitfalls we already paid for
- A rule for a title element in a component's own CSS file loses to `index.css`, which main.tsx imports after App. Title layout
  goes in `index.css`'s title section.
- A clip check that only looks for text past its box misses a button pushed out of its card (Erase ran off the card upright). Check
  each button against its card's box (`.sl-card, .nv-card`), and skip the corner X, which sits on the card's edge on purpose.
- A kill caught by the code's own try/catch (step 1) looks like "phone full", not a crash. The kill test must keep going until a
  switch really completes, or it stops at the first cut and proves nothing.
- The title's four painted leaves at a fixed 96 px each don't fit a 360-wide phone, or the right half of a 640x360 one (already on
  main before this job). clipcheck walks only 412x915 and 915x412.
- `.nv-body` scrolls, so it clipped the bottom shadow of its last button. It now has 6 px of padding at the bottom.

## To try
- Add 360x640 and 640x360 walks to clipcheck.

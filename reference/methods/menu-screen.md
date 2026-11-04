# Method: a menu screen or pop-up
Last proven: 2026-11-01, branch whatsnew (What's New pop-up; Satchel fixes: find hints, compact sideways header, creature cards). Owner of the last update: the whatsnew helper.

## When to use it
Any new or changed screen, pop-up, tab or card a player taps through: Settings, About, the Satchel, the World Map, a reader, a confirm.

## Steps
1. **Check the facts in the real game before building.** Read the code that decides what the screen shows, and run the game, before
   designing around a brief's assumption. Model case (2026-11-01): the brief said Worlds 9 and 10 "aren't released", so every total
   should drop them. One look at `WorldMap.tsx` (`worldUnlocked`) and the save records showed they are live and playable; the
   released-only rework was built, then reverted. Ask the lead with the evidence *before* building on a surprise.
2. **Use the nav kit, never one-off pop-up code** (`src/components/nav/Nav.tsx`, rule in `reference/menus/SCREEN-MAP.md`):
   - a pop-up is `<Popup title label onClose>`: the painted card, its plaque, the X; it closes by the X, a tap outside and Android Back
     (it calls `useBack` itself). `top` puts it over another pop-up.
   - a screen gets `<BackButton to="Start Screen" onBack>` at the top-left; anything else that should own Back calls `useBack(fn)`.
   - a confirm is `<ConfirmDialog>` (the safe answer is the big one).
   - Inside a card with a CSS `filter`/`transform` (Settings' `.st-card`), a `position: fixed` child is trapped in the card: render the
     pop-up with `createPortal(..., document.body)` (WhatsNew.tsx). React events still bubble through the React tree, so the card's
     `stopPropagation` keeps a tap inside the pop-up from closing the card under it.
3. **Reuse the menus' look**: `.st-row` / `.st-btn` rows (Settings), `.tr-card` cards (Satchel), the `--font-fun` heading and
   `--font-ui` body, wood and parchment colours. New CSS goes in a small file next to the component (`whatsNew.css`).
4. **Safe areas**: `.nv-scrim` already pads by `env(safe-area-inset-*)`; a new full screen pads its top by
   `max(Npx, env(safe-area-inset-top))`. Nothing tappable under the notch or the nav bar (PLAY-STORE-RULES §6.1).
5. **Both orientations from the start.** Sideways phones are 360-430 px tall: the shared breakpoint is
   `@media (orientation: landscape) and (max-height: 430-500px)`. Give the content at least 65% of the height. The Satchel's header took
   half of it until 2026-11-01; it is now one row (Back, the tabs, the corner token) with the title log hidden but kept for screen
   readers.
6. **Data in a plain file with a test**, words for players only (What's New: `src/game/whatsNew.ts`, a test that the top entry is
   package.json's version, no workshop words, lines short enough for a kid).
7. **Changing a layout that already looks right upright?** Prove upright didn't move: shoot before and after and diff the pixels
   (PIL `ImageChops.difference(...).getbbox()` is `None`). Flex containers don't collapse margins: moving a block into a flex row
   shifted the content by 6 px until the margin was put back on the row.

## The bar
- `reference/menus/whatsnew/`: the About row, then the pop-up with the newest release open, an older one opened, and scrolled to the
  bottom, upright 412x915 and sideways 915x412.
- `reference/menus/satchel-fixes/header-before/` and `header-after/`: every Satchel tab sideways, before and after the compact header.

## Checks before reporting
- **Saves to seed and shoot**: a fresh save (`sloth_mode_picked` only), an old save (worlds 1-3 cleared, a few finds and kills:
  `tools/qa/menushots/satchel.mjs` seeds it with `addInitScript`), and a finished save when the screen shows totals or endings.
- **Sizes**: 412x915 and 915x412 always; 360x640 and 640x360 for the small phone; 844x390 when a header is involved.
- **Scripted shots and checks** (run `npx vite --port=8816 --host=127.0.0.1` first):
  - `node tools/qa/menushots/whatsnew.mjs <out>`: the shots, a clip check, and close by X, by a tap outside and by Back (Escape drives the
    same back stack as Android Back), plus "Back from the screen under it still goes where it did".
  - `node tools/qa/menushots/satchel.mjs <out> Finds,Trophies,...`: each tab, both saves, both orientations, its count line, and a clip
    check that measures each text's own box against its card.
  - `node tools/qa/menushots/satchelHeader.mjs <out>`: the share of the height the content gets, and the header's buttons.
- **Look at every shot as Matt will on a phone**: clipped, cramped, readable at arm's length, the same look as the other menus. Name
  anything rough in the report's Polish check.
- The CLAUDE.md gates: `npx tsc --noEmit -p .`, the test globs (3 shards in parallel), `npx vite build`, `node tools/perf/artcheck.mjs`,
  `node tools/perf/drawcheck.mjs`. Play Store §6 for anything new on screen.

## Pitfalls we already paid for
- 2026-11-01: a "clipped" hint in a sideways Satchel screenshot was the screen's bottom fade (`.tr-screen` mask, last 22 px) over a
  half-scrolled row, not the card. Scroll the row into the middle and re-shoot before changing CSS.
- 2026-11-01: a clip check using `scrollHeight > clientHeight` flags every `--font-fun` heading (its line box is taller than
  `line-height`). Measure the text's own range (`document.createRange().selectNodeContents(el).getBoundingClientRect()`) against the
  card.
- 2026-11-01: locked-card hints were one template repeated down the page ("World N, hidden. Crouch beside a fern."). Write each one
  for its item, and check it against where the thing really is on every layout (`tools/inspect/findSweep.mts` builds them); say only
  what is always true (27 of 38 finds land somewhere new each play).
- `pkill -f "<pattern>"` from the shell tool also matches the tool's own shell and kills it; find the PIDs with `ps` and kill those.

## Tried and didn't work
- Counting only "released" worlds by a hard-coded list (2026-11-01): Worlds 9-10 were live, so it hid playable content and medals;
  reverted the same hour. Totals follow what the game really lets you play.

## To try
- A shared `clipcheck` gate over every menu screen and both orientations, run with the other gates (kaizen-gates owns gates.md).

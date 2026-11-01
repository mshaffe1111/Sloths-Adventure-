# Method: painted icons (any icon a player sees)
Last proven: 2026-11-01, branch icons-painted: group A (start screen, Matt approved, at 7d338bce) and groups B-E (every menu, the
HUD, the map, the satchel; 47 painted icons, 2-16 KB each, ~$6 of GPU). Owner of the last update: icons-painted helper.

## When to use it
Any icon, button glyph or menu symbol a player sees. The bar is the painted satchel (`src/assets/ui/satchel.webp`): one real object
from Pokey's world, painted, with a dark outline, warm light from the upper left, a touch of green leaf or vine, and no symbol and no
badge. Matt, 2026-11-01: "The satchel looks great but look at the other art. Generic... Same for all icons in the game. Polish."

## Steps
1. **Inventory first** (`reference/qa-reports/icons-painted/INVENTORY.md`): every use (file:line), its meaning, its largest size on
   screen, and the object proposed. Pick objects, not symbols: settings = a carved wooden cog; sound = a vine-laced drum; How to Play =
   a firefly jar lantern; Story = Grandma's storybook. One object per meaning, used on every screen with that meaning (the pause
   menu's "Satchel" must be the satchel, not a book).
2. **Spec** (`tools/art/icons/make_spec.py`): the satchel's recipe, text to image. The prompt is `slothadv style, painted storybook
   illustration, a game icon of <object>` plus the shared tail (bold simple readable shape, chunky and clear, thick dark outline, rich
   warm colours, soft light from the upper left, seen from the front slightly from above, centred, isolated on a flat plain mid grey
   background, no text...). Add a per-object negative for what it drifts into (`bag` always, so the satchel doesn't creep in). Use the
   style model `mshaffe111/slothadv-style-lora` at **1.0**, 1024 square, 30 steps, true_cfg 4. Use 2 prompts x 4 seeds (11, 23, 37,
   53) for a hard one, 1 prompt x 6 seeds for the rest.
3. **Run**: `python3 tools/art/icons/make_spec.py <group> <parts>`, commit and push (the job fetches the spec and
   `tools/art/w6to10/stillsgpu.py` from raw GitHub at that commit), then `make_spec.py args <spec> <sha>` gives the `hf_jobs run` args
   (rtx-pro-6000, the bucket `mshaffe111/w5-xfer` mounted at `/out`, the token only as the job secret). About 20 s a take plus about
   3 min of model load a job, so split into 3-6 parts. **About $0.30 a job of 15 takes.** Log every job in `tools/art/gen/jobs.txt`.
4. **Look**: `hf_fs attach hf://buckets/mshaffe111/w5-xfer/icons/<tag>/stills/sheet-<tag>0-0.jpg`.
5. **Bring back**: `hf_fs attach .../carrier-<tag>0-0.png` (saved to disk byte for byte), then
   `python3 -I tools/art/w5/unpack_carrier.py <attached png> tools/art/icons/takes` (q90 webp at 1024, plenty for keying).
6. **Cut**: name the picks in `tools/art/icons/picks.json` (`take`, `px` = 2x the largest on-screen size: 192 for the start screen's
   leaf objects like the satchel, 48-80 for small glyphs), then
   `python3 -I tools/art/icons/cut.py picks tools/art/icons/picks.json tools/art/icons/takes src/assets/icons`.
   This is satchelcut's key, plus peeling the pale sticker rim off and filling the colour under clear pixels. Each file comes out
   2-16 KB.
7. **Judge on the real screen before wiring**: `tools/art/icons/mock-title.mjs` swaps the art into the running page. For another
   screen, copy its approach. Contact sheet before | after, upright and sideways, plus a real-size crop.
8. **Text glyphs**: an arrow, tick or note that sits inside a line of words ("Next →", "✓ 3 of 11 cleared", ♪) is a
   `<TextGlyph>` (crisp, the text's colour, the painted family's dark outline), never a painted object: at 12-16 px beside words a
   painted tick vanished on wood and green (`groupE/glyphs-real-size.png`).
9. **One object per meaning**: Satchel is always the satchel, How to Play always the lantern, Trophies always the trophy. The icon test
   checks every `icon=`/`name=` pair; give two things that mean different things two objects that read apart at 48 px (Grandma's big
   green storybook vs Pokey's small tan pencil notebook).
10. **Wire**: `<PaintedIcon name size>` (`src/components/icons/PaintedIcon.tsx`, a plain `<img>`). Add the name to `PAINTED_NAMES`,
   preload it where the screen preloads its art, and lower the file's count in `src/components/iconRegister.allow.json`.

## The bar
- `reference/qa-reports/icons-painted/groupA/realsize-up.png`: the four leaf objects at real size next to the satchel.
- `groupA/picks.jpg`: every cut on green and on dark wood, with no fringe.

## Checks before reporting
- Shots: `node tools/art/icons/shots.mjs <dir> [screens]` covers every screen with icons, upright 412x915 and sideways 915x412, on a
  fresh and an old save.
- Gates: `iconRegister.test.ts` (no new `<Icon>`; files under 60 KB and 4096 px), tsc, the three test shards, the build, artcheck,
  drawcheck.
- Polish: read each icon at its real size. Does it read at a glance? Is it one family with the satchel? Is any of it blurry, fringed
  or brown on brown?

## Pitfalls we already paid for
- 2026-11-01: a painted object inside a small round "well" (the settings rows) shrank and the full-screen brackets read as a blob. Let
  the object stand free like the rest of the set, a size larger.
- 2026-11-01: painted wood on a dark wood button (restart, back on the card buttons and the Back token) sank into the wood. A thin warm
  rim (`drop-shadow(0 0 1.2px rgba(255,240,205,.95))`, index.css) lifts it; check every object on every background it meets with
  `tools/art/icons/glyphsheet.py`.
- 2026-11-01: adding an icon to a button widens it: the start screen's version pair wrapped to two rows upright. Measure the row at
  360/390/412 (`shot-verrow.mjs`) after any icon goes into a button.
- 2026-11-01: an aliased import (`import { Icon as Glyph }`) slipped past a `<Icon` text check; the register test follows aliases.
- 2026-10-30 (hfui1): the old kit icons were img2img at 0.40 from the vector glyphs at 128 px. They kept the app-icon shapes (a
  speaker with blue waves, a flat cog), and Matt called them generic. Paint the object from text at 1024, never a light repaint of
  a symbol.
- 2026-11-01: a brown carved object on a brown surface vanishes: the carved play arrow on the brown sign, the cog on the round wood
  token, a brown X on the wood button. Use gold or birch for anything that sits on wood, or drop the disc and let the object stand
  free.
- 2026-11-01: a take whose grey background is a gradient (back-a53) keys into grey bands. Check the cut on dark wood and take
  another seed.
- Seed-pod rattles read as a nut, open books are thin at 60 px, and a woven lantern reads as a ball. Prefer the closed, chunky
  version of an object.

## Tried and didn't work
- A green leaf disc behind the corner tokens: the "tap for sound" pulse drew a square glow, and the leaf crowded the object.

## To try
- Repaint the jungle-cards icon with a negative for letters on the cards (every take painted an "A").
- A clearer "screen shake" object than the firefly (a rattling seed pod mid-shake?).
- Painted "pressed" or dimmed states made in paint rather than by CSS filter, if Matt wants more than the dimmed drum with the X for
  sound off.

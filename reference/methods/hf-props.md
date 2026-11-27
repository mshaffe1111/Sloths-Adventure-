# Method: wiring a cut piece into the game (props and sprite sheets)

First written by READY-27 (11-23), from wiring 2-7's weir after ENG-27c wired the mail boat, the open door and the letters. The cutting
side (Hugging Face takes, cut.py, the catalog's first row) is hf-art.md's; this file starts when a CUT png and its catalog row exist.

1. **Check what is already wired** before packing anything: `git grep -n "<sheet>#" <every branch the level builds on> -- src` and the
   catalog's `status` column. A piece wired on one branch and re-wired on another makes two sheets that conflict as binaries (D40).
2. **Pack onto the world's sheet by APPENDING** (a pack script under reference/qa-reports/<job>/, the order list with the new frame
   LAST): every earlier cell keeps its x/y, so nothing that draws by those cells moves. Prove it: the old json's cells equal the new
   ones, and the old cells' pixels differ only by re-encoding (READY-27: mean abs diff under 1 per channel, alpha 0). Sheet under 4096 px
   a side (artcheck); note the decoded size (w x h x 4) in the rows' draw_cost.
3. **The catalog row:** `file` = `src/assets/<sheet>.webp#<frame> (x,y wxh)`, `status` names the code that draws it and who lays it,
   `on_screen_px` is the drawn box at Pokey's scale (89.1 px drawn, D41); update the sheet's other rows (file_kb, draw_cost). Then
   `python3 tools/art/catalog_master.py --emit` and `npx tsx --test src/game/art/inventory.test.ts`.
4. **The draw:** by inventory id only, through the sheet's own draw function (returns false until loaded: no code-drawn stand-in); the
   stage manifest asks for the sheet for any stage that lays it (a test in stageManifest.test or the piece's own test).
5. **Where it stands comes from data:** a general lay (gen2) from a brief or kit field, never a stage id or x in engine code
   (generalitycheck); a planted toy test: laid on every roll both settings, RED when moved 60 px or out of its place, the stage otherwise
   identical (platforms, petals, pieces deep-equal).
6. **Stills beside Pokey**, upright and sideways at DSF 2, on the real page (a dev fixture or the stage), the whole screen judged (D79),
   committed as a contact sheet under the job's qa-reports folder. Playwright here: `PW=/opt/node-tools/node_modules/playwright/index.js`.

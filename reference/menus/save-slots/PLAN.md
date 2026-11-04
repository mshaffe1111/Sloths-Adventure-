# New game and three explorers: plan (menus A, 2026-11-04)

Matt, 2026-11-04: "a way to start a new game... my wife wanted to start a new one, and the only way to do that is to clear cache."
Decided: New game on the title next to Continue, and 3 named explorer slots so a family can each keep their own game on one phone.

Branch `menus-nav` (from the lead branch `ccr-0d59a91c-oy3imz` at 84f560c9). Mock-ups: `reference/menus/save-slots/mock/`.
The screens in the mock-ups are the real components with real slot data, not drawings.

## What the player sees

- **Title.** Under Continue, one row of two planks: **New game** (only when there is a game to continue) and **Who's playing**, with
  the explorer's face in their colour and their name.
- **Who's playing?** (a pop-up from the nav kit: X, tap outside, Back). One card per explorer. Each card has a face in its own colour
  (green, gold, blue, so a child can find theirs without reading), the name, the furthest world, stars, stages cleared, and either
  "Playing now" or when it was last played. **Play** switches to that explorer. **Rename** works on every card. **Erase** is on the
  others, never the one playing. A free spot says so and has **New explorer**. Upright the cards stack; sideways they sit side by side.
- **New game** asks one question. **A new explorer** (big, safe: "Matt's game is kept, and the new explorer gets their own") or
  **Start Matt's game over**, which opens today's New Game dialog with its backup offer and Easy/Normal choice. With all three spots
  taken, the safe answer becomes **Who's playing?** (to free a spot), and starting over stays the small one.
- **New explorer**: type a name (it starts as "Explorer 2", selected, so one tap and typing replaces it). Then **Start their
  adventure**: the game restarts as them on the title. Their first Start asks Easy or Normal ("Who's exploring?", today's card),
  then the story, as for any new player.
- **Erase** (another explorer only): "Erase this game? Mia's 14 stages and 29 stars go for good. A backup file can bring them back."
  with **Save a backup file first**, then **Keep their game** (big) or **Yes, erase it**.

## How it works: the swap model (`src/game/saveSlots.ts`)

The game keeps reading and writing the same storage keys it always has (107 reads and writes in 76 files are untouched). Those live
keys ARE the explorer who is playing. An explorer who isn't playing is kept whole as one JSON copy, `sloth_slot_data_<n>` =
`{ v: 1, data: { key: value, ... } }`. Two phone-wide keys hold the list: `sloth_slots` (names, last played) and `sloth_slot_active`
(1-3). Changing explorer copies the player's keys out, clears them, copies the next explorer's in, and reloads the page, so every
module reads the new explorer from scratch.

### Today's single save becomes slot 1 with nothing lost

**There is no migration step.** The keys of today's save stay exactly where they are: they simply are slot 1 (with no slot list,
slot 1 is the one playing, named "Explorer 1"). Opening "Who's playing?" reads; it writes nothing.
Proof: `saveSlots.test.ts` "an old single save is slot 1 as it stands" (every key byte-identical after reading the slots), and
`tools/qa/menushots/slotsFlow.mjs` in the real game (an old Worlds 1-3 save shows as Explorer 1; a new explorer; back again; 34 of 34
keys identical).

### Rollback: an older game version, or one that doesn't understand the save

- **An older version installed over this one** (or the web build rolled back) reads the live keys, so it plays whoever was playing,
  as before. It never touches `sloth_slot_*`: those keys match none of its patterns, its New Game removes only its own patterns, and
  its backup file skips them. Nobody is lost. The other explorers come back when the new version returns.
- **A copy made by a newer version** (`v` above what this code knows), or one that won't parse, is shown on its card as "Saved by a
  newer version of the game. Update to play it." It is never opened, changed or erased (tests: "a copy made by a newer game", "an
  unreadable copy is left alone, not taken for an empty slot").
- **An update installed over a half-done switch** (the phone died mid-switch, then the update arrived): the switch is journalled.
  Order:
  1. write the outgoing copy and read it back;
  2. write the journal `{from, to}`;
  3. clear the live player keys;
  4. put in the incoming copy;
  5. set the active slot;
  6. delete the journal;
  7. delete the incoming copy.

  A stop before step 2 changes nothing. A stop after it is finished at the next start (`slotBoot.ts`, imported in `main.tsx`
  before App, so nothing reads half a game). Steps 3-7 can be run again safely, and the incoming copy is deleted last, so it is still
  there. A journal that points at a copy that isn't there is dropped without touching the game. Test: "a switch killed at every
  single step": cut after each write in turn (48 cut points on an old save), restart; every time one explorer is playing, whole,
  and the other comes back byte for byte.
- **A full phone**: step 1 fails, so the switch stops before anything is cleared, and the card says "This phone's storage is full,
  so the game couldn't be switched. Nothing was changed." (test: "a full phone stops the switch before anything is cleared"). Three
  explorers at the save file's size cap (200 KB each) are about 600 KB of the browser's 5 MB.
- **Old backup files and save codes** still load, into the explorer who is playing, the same as today (Save & Load is unchanged).
  Files made now load in older versions too (they drop keys they don't know, as they always have).

### Per explorer vs per phone (every key in the source is classed; a test fails on a new key with no class)

| Belongs to the explorer (moves with the slot) | Belongs to the phone (shared) |
|---|---|
| Everything in today's backup file except sound: stage results, play records, layouts, stories and asides seen, the secret gate, Thorn Heart, medals, finds, memories, Pokey's outfit, **Easy/Normal** and its ease-in, the World 5 cake and carving | **Sound**: music, effects, mute (`KEEP_ON_NEW_GAME` keeps them today too) |
| **Dot's memory and help level**: tips, lessons, what she has seen and taught, her help setting (New Game already clears these) | Full screen and its iPhone tip, the performance log and slow-phone tip, touch marks (tester), the update stamp, the test unlock, the control-test name |
| **Found today but missing from the backup file**: the golden seeds, Dot's silk, a stage cut off mid-run (resume at the flag), the guardians' intros seen, what the journal has shown | The art preview switches (sprite/polish/rim and the creature switches: tester use) |
| **First-time teaching**: How to Play seen, the touch coach (a new explorer is a new person; today this is once per phone) | The slot list itself: names, active slot, the copies, the journal |
| **How they like to play**: controls (hand, side, style, feel), the two assists, jump help, screen shake, buzz, Dot's asides on/off (**Question 1 for Matt**) | |

`keyClass()` holds this table in code. An unknown key stays on the phone, so in the worst case it is shared, never lost. The gate
`saveSlots.test.ts` "every storage key in the source has a class" scans `src/` for every `sloth_` key and fails on any key with no
class. It found `sloth_story_b*` (the guardians' intros) on its first run.

### Defects found on the way (to log; fixes proposed in this job)

1. **The backup file misses five kinds of progress**: golden seeds, Dot's silk, the guardians' intros seen, the journal's seen and
   told flags, and Dot's skip offer. A backup and restore loses them, and **New Game doesn't clear the golden seeds or the silk**, so a
   "new" game still shows old seeds found. Fix: add them to the backup list (`saveFile.ts` ALLOWED) and to New Game's reset. Older
   versions drop them unread, which is safe.
2. **The title cut its own leaf row off on small phones** (360x640: How to Play off the bottom; 640x360: World Map under the
   update buttons), already on main. clipcheck only walks 412x915 and 915x412. Fixed here (the leaves share the width; a smaller sign
   and logo on short screens). Proposed: add 360x640 and 640x360 to clipcheck's walks (kaizen-gates owns it).
3. `sloth_hint_v3` is named in a comment as a per-phone help flag, but no code reads or writes it (dead).

## Questions for Matt (one at a time, through the lead)

1. How each person likes to play (controls, assists, jump help, shake, buzz, Dot's asides): **(A) each explorer keeps their own**
   (recommended: a left-handed child and a parent on one phone), or (B) one setting for the whole phone?
2. When a new explorer is made: (A) back to the title as them, then Start (as in the mocks), or (B) straight into their first story?

## Tests (all run before the report)

- `src/game/saveSlots.test.ts` (10): old save is slot 1 untouched; new explorer fresh and back byte for byte, phone settings kept;
  killed at every step; full phone; newer copy; unreadable copy; untrusted journal; erase only the target; names; every key classed.
- `tools/qa/menushots/slotsFlow.mjs`: the same loop in the real game (9 checks, 34 of 34 keys back).
- `tools/qa/menushots/slots.mjs`: shots of the title, Who's playing?, New game's choice, a new explorer's name and the erase question,
  on four saves (fresh, old, a family of two, all three taken with one finished) at 412x915, 915x412, 360x640, 640x360, each with a
  text and tap-size check.
- clipcheck walks the new screens on fresh, old and done saves, upright and sideways.
- The CLAUDE.md gates in full before the build report, plus Play Store §6 item 8: kill mid-switch on a real phone, a full phone, an
  update over a half-done switch.
- Play Store: names stay on the phone; nothing is sent anywhere; no new permission.

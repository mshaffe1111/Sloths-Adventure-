# Icon inventory: every icon a player sees (icons-painted, 2026-11-01)

The bar is the painted satchel (`src/assets/ui/satchel.webp`, `tools/art/gen/spec-satchel.json` seed 37). Before shots of every
screen, both orientations, fresh and old save: `reference/qa-reports/icons-painted/before/`.

**What is there now.** `<Icon>` (`src/components/icons/index.tsx`) already draws 22 names from `src/assets/ui/ui-kit.webp`. Those are
img2img takes at strength 0.40 of the old vector glyphs, at 128 px (hfui1, 10-30). They kept the app-icon shapes: a speaker with
blue waves, a flat cog, a flat map, a flat scroll and a light bulb. That is why they read as generic next to the satchel, which was
painted as a real object from text at 1024 px. Everything else (lock in text, check, cross, arrow, the nine stage types, crown,
sparkle and others) is still the vector glyph. There are 94 `<Icon>` uses in 27 files, plus a few inline `<svg>` glyphs (Game Over,
Stage Cleared, boss hearts and the HUD hearts and star).

**One finding across groups:** "Satchel" on the pause menu and the World Map's leaf row shows a book icon. The painted satchel should
be used there. "How to Play" on pause also shows a book, while the start screen uses a bulb; it should be one object everywhere.

**Plan for the code.** A new `<PaintedIcon name>` draws one cut-out webp per object (2x the largest on-screen size, under 60 KB).
`<Icon>` stays only for the crisp glyphs in (E). `iconRegister.test.ts` fails on any `<Icon>` outside the allow-list, and the list
only shrinks.

Size = the CSS px on screen (upright 412 x 915; the sideways sizes are the same unless noted). "Object" is the painted thing proposed.

## (A) The start screen (`TitleScreen.tsx`, `UpdateControls.tsx`)

| Icon | Where (file:line) | Means | Size | Object (painted like the satchel) |
|---|---|---|---|---|
| map | TitleScreen.tsx:246 (leaf token) | World Map | 30 now, satchel sits 67x77 over the same leaf | a parchment jungle map, half unrolled, dotted trail to a red X, tied with vine |
| scroll | TitleScreen.tsx:252 | Story | 30 (to ~67) | Grandma's storybook, green cloth, brass corners, pressed pink flower, ribbon |
| bulb | TitleScreen.tsx:264 | How to Play | 30 (to ~67) | a glass jar lantern with a glowing firefly, twine handle (or a woven seed-pod lantern) |
| speaker / mute | TitleScreen.tsx:207 (round token 52) | sound on / off | 28 (to ~40) | a little wooden hand drum laced with vine (or a seed-pod rattle). Off = the same drum with the painted carved X from (E) over its corner, dimmed |
| gear | TitleScreen.tsx:210 | Settings | 28 (to ~40) | a chunky carved wooden cog, brass bolt, vine with a leaf |
| play | TitleScreen.tsx:234 (on the sign) | Start / Continue | 30 | a carved wooden play-arrow, brass edge (in E's style) |
| star | TitleScreen.tsx:239 | stars on the Continue line | 14 | the painted gold star (E) |
| restart | UpdateControls.tsx:84,97 ("Refresh game") | reload | 18-20 | a carved wooden curl-arrow (E) |
| check | UpdateControls.tsx:37,92 | up to date | 12-16 | vector glyph, stays (E) |

## (B) Pause and the in-play HUD (`PauseMenu.tsx`, `MenuFrame.tsx`, `menuParts.tsx`, `HowToTile.tsx`, `hud/*`, `gameUi.tsx`, `GameOverCard.tsx`, `StageCleared.tsx`, `BossHud.tsx`)

| Icon | Where | Means | Size | Object |
|---|---|---|---|---|
| restart | PauseMenu.tsx:183 (tile) | Restart stage | 28 (tile icon box ~48) | a carved wooden curl-arrow around a little stump (A's restart, larger) |
| map | PauseMenu.tsx:184 | World Map | 28 | A's map |
| sloth | PauseMenu.tsx:185 | Start Screen | 28 | Pokey's carved wooden face token (a small round wood medallion with his face), not a symbol |
| book | PauseMenu.tsx:186 | Satchel | 28 | **the satchel itself** |
| book | HowToTile.tsx:13 | How to Play | 28 | A's How to Play lantern |
| trophy | PauseMenu.tsx:192, TitleSettings.tsx:113 | Trophies | 28 | a carved wooden trophy cup with a gold leaf rim and a vine, or a gold medal on a vine ribbon |
| cards | PauseMenu.tsx:193, TitleSettings.tsx:114 | Jungle Cards | 28 | a small fanned stack of painted creature cards tied with twine |
| speaker / gear / trophy | MenuFrame.tsx:86 (tabs) | Sound / Game / Trophies tabs | 24 | A's drum, A's cog, the trophy |
| play | MenuFrame.tsx:63 | Resume | 22 | the carved play-arrow (E) |
| speaker / mute | MenuFrame.tsx:132 | sound row | 20 | A's drum |
| bulb | PauseMenu.tsx:44 | Ask Flicker (Meeca's stage) | 28 | A's lantern |
| cross | Nav.tsx:42 (the round close button) | Close | 22 on a 40 wood button | painted carved-wood X (E) |
| HUD hearts | hud/hudArt.tsx:69 (Heart) | lives | 19-24 | painted hearts: a red heart-shaped seed pod (full), an empty husk (empty), a thorned one (thorn heart) |
| HUD star | hud/hudArt.tsx:92 (Star) | score | 16-19 | the painted gold star (E) |
| HUD bolt / tick | hudArt.tsx:98,111 | power, goal done | 14-18 | painted: a glowing seed (bolt), the painted check (E) |
| expand / shrink | gameUi.tsx:33 | full screen | 20 | painted carved-wood corner brackets (E-style), kept simple |
| Game Over / Stage Cleared button glyphs | GameOverCard.tsx:95-111, StageCleared.tsx:275-318 (inline svg) | continue / retry / map / clue | 18-26 | retry and map use the painted restart and map; the arrow stays (E) |
| boss hearts / fist | BossHud.tsx:97,128 | boss hits left | 15-20 | the painted hearts; the fist becomes a painted paw |
| leaf | ScreenVeil.tsx:63 | loading leaf | 26 | a painted jungle leaf (the satchel's leaf) |
| arrows | PadController.tsx:203 | pad left/right | 18 | stay vector (E) |

## (C) World Map, Settings, About, How to Play, Story (`WorldMap.tsx`, `nav/Nav.tsx`, `TitleSettings.tsx`, `HowToPlay.tsx`, `StoryPlayer.tsx`, `BossCards.tsx`)

| Icon | Where | Means | Size | Object |
|---|---|---|---|---|
| gear | WorldMap.tsx:211 (corner token) | Settings | 28 | A's cog |
| arrow | WorldMap.tsx:217,243 | previous / next world | 26 | painted carved-wood arrow (E) |
| lock | WorldMap.tsx:243,340,361,391 | next world locked | 15-22 | the painted brass padlock (E) |
| check / star | WorldMap.tsx:230,233,332 | cleared count, stars | 14-17 | the painted check and star (E) |
| thornHeart | WorldMap.tsx:237 | +1 thorn heart | 15 | the painted thorn heart (B) |
| stage types | WorldMap.tsx:292,321 (badges on the nodes and the card) | sprint, harvest, purge, ascent, stealth, vine, relic, rescue, gauntlet, boss | 11-18 | small painted things: sprint = a running sneaker-shaped leaf... see below |
| compass | WorldMap.tsx:353 (leaf) | Worlds | 30 on a 50 leaf | a brass explorer's compass with a vine strap |
| book | WorldMap.tsx:354 (leaf) | Satchel | 30 | **the satchel** |
| bulb | WorldMap.tsx:355 (leaf) | How to Play | 30 | A's lantern |
| crown | WorldMap.tsx:392 | world all done | 22 | a little crown woven of leaves and gold flowers |
| leaf | WorldMap.tsx:399 | Thornbark's Hollow | 20 | painted jungle leaf |
| play | WorldMap.tsx:346 | Play | 22 | carved play-arrow (E) |
| save, leaf, sloth, heart, restart, expand | TitleSettings.tsx:87-160 (tiles) | Saves, Game, About, Credits, Reset, Full screen | 28 | save = a small wooden keepsake box with a brass clasp; heart = the painted heart; sloth = Pokey's wood token; restart and expand as above |
| tabs speaker, gear, save, trophy, sloth | TitleSettings.tsx:187 | settings tabs | 24 | as above |
| cross, check | TitleSettings.tsx:182,203 | close, chosen | 22-24 | (E) |
| bulb | HowToPlay.tsx:126; StoryPlayer.tsx:435 | tip | 16-22 | A's lantern |
| arrow | HowToPlay.tsx:70,295; StoryPlayer.tsx:454-486 | back, next, skip | 13-18 | stay vector, inline with text (E) |
| paw | StoryPlayer.tsx:499 | the hold-to-skip thumbs | 17 | painted sloth paw print in mud |
| note | StoryPlayer.tsx:55 | ♪ in a sung line | ~0.95em inline | stays vector (E, it is part of the text) |
| swords, map, heart | BossCards.tsx:92,156,172 | boss fight, map, ending heart | 24 to ~0.22h | swords = two crossed carved sticks; map and heart as above |
| speaker marks | SpeakerMark.tsx:22 (speakers.ts) | Narrator, Petal, Squirrel, Flicker, Soldier | ~0.82 of the name size | book, flower, paw, sparkle, shield (a leaf shield): the same painted objects |

Stage types, painted (11-18 px, so each is one chunky shape): sprint = a winged leaf; harvest = a petal; purge = a thorny bramble
ball; ascent = an up-curled vine with a leaf; stealth = a fern frond; vine = a liana loop; relic = a carved stone idol; rescue = a
small cage of sticks; gauntlet = crossed sticks; boss = the creature crests already painted (no change).

## (D) The Satchel (`Satchel.tsx`, `satchel/*`, `BadgeMedal.tsx`)

| Icon | Where | Means | Size | Object |
|---|---|---|---|---|
| key, medal, book, play, paw | Satchel.tsx:115 (tabs on leaves) | Finds, Trophies, Journal, Scenes, Creatures | 22 on a ~50 leaf | Finds = the iron key from World 1's keepsake; Trophies = a gold medal on a vine ribbon; Journal = Pokey's small leather journal with a twine tie; Scenes = a little wooden film reel / a storyteller's lantern slide; Creatures = a paw print pressed in clay |
| sloth | Satchel.tsx:106 (corner token) | Start Screen | ~28 | Pokey's wood token |
| lock | FindsTab.tsx:34,89; TrophiesTab.tsx:98 | not found yet | 18-34 | painted padlock (E) |
| hummingbird / leaf / book | FindsTab.tsx:72,73,78 | group pictures | 42 | Dot's lost-pocket pouch; a painted leaf; Grandma's storybook |
| book | FindsTab.tsx:66 | "what it looks like" | 14 | storybook (E-size) |
| check / lock | CreaturesTab.tsx:41-49; TrophiesTab.tsx:43,74 | met/earned, not yet | 12-14 | (E) |
| play / lock | ScenesTab.tsx:28,43,54 | play scene, locked | 14-18 | (E) |
| sparkle | TrophiesTab.tsx:97 | the sparkle-trail reward | 40 | a painted firefly sparkle (glowing seed with rays) |
| arrow | JournalBook.tsx:152,158 | page back/next | 18 | (E) carved arrow on the wood button |
| badge emblem | BadgeMedal.tsx:69 | the drawn medal before the medal sheet loads | size x 0.5 | not changed: the painted medal sheet replaces it once loaded |

## (E) Small glyphs

| Glyph | Uses | Proposal |
|---|---|---|
| cross (close) | Nav.tsx:42, TitleSettings.tsx:182 (always on the round wood button) | **painted**: a carved-wood X with a dark outline, at 22-24 px |
| arrow on a wood button (Back, map world arrows, journal pages) | Nav.tsx:32, WorldMap.tsx:217,243, JournalBook.tsx | **painted** carved-wood arrow, 18-26 px |
| arrow inside text (Next, Back, Skip, arrowText, the pad) | StoryPlayer, HowToPlay, FindReader, arrowText.tsx, PadController | **stays vector**: it takes the text colour and sits at 13-18 px in a line |
| check | 12-22 px, in text and on the green Done button | **stays vector**, given the painted family's thicker dark outline |
| lock | 13-34 px | **painted** brass padlock; checked at 13 px; if it smears there, the 13-15 px uses keep a vector lock with the same outline |
| star | 11-17 px | **painted** gold star (the kit's painted starFull already reads at 11 px on the map) |
| play | 16-30 px | **painted** carved play-arrow; inside text at 16-18 stays vector |
| note ♪ | inline in story text | **stays vector** |

**Count:** about 45 distinct painted objects. Some are shared (map, lantern, drum, cog, satchel and padlock are used on several
screens), so the painting is about 40 objects x 8 takes each, under $10 at about 20 s a take.

# Memory audit (2026-10-25)

Why some players' games could crash or reload, especially on iPhones, and what to change. Nothing in the game has been changed yet.

## The short version

The game is fine on a computer. On a phone it is right at the edge. In a test run, the game's own page used about **950 MB** of memory during play and stayed there. iPhones reload a web page that goes over roughly **1.5 GB** (about 2 GB on the newest ones, much less on older or cheaper models), and Safari shows "This webpage was reloaded because it was using significant memory." Android phones kill the tab ("Aw, Snap") at similar levels.

Almost all of that memory is **pictures**. On disk the art is small (40 MB of webp), but to draw a picture the browser unpacks it to full size: width × height × 4 bytes. Unpacked, all 206 pictures come to **1.1 GB**. The game loads pictures as they're needed but **never lets go of any of them**, so the longer someone plays, the more piles up.

The second biggest item is the **orchestra samples**: 75 to 100 MB once unpacked, also kept forever.

There is also **one true leak** (the creature-body list stops tidying itself after the first long stage) and a few smaller things.

## What was measured

The production build was played in a headless Chromium browser. A script went title screen → World Map → the first stage and the boss of every world, then played the story intro. After each step it cleaned up memory and recorded it. Numbers are the game page's process (the "renderer"). The whole browser adds about 250 MB of its own on top.

| Moment | Pictures unpacked | Game page memory |
|---|---|---|
| Title screen | 20 pictures, 122 MB | 466 MB |
| World Map (first visit) | 46 pictures, **322 MB** | **794 MB** |
| In stage 1-1 | 62 pictures, 407 MB | 874 MB |
| After 1-10, 2-1 … 6-10 | grows to 82 pictures, 626 MB | 920–970 MB |
| In 7-1 (same session) | 85 pictures, 640 MB | 989 MB |
| Story intro, 240 taps in (fresh start) | 42 pictures, 252 MB | 877 MB |

Things to notice:
- **Just opening the World Map adds about 330 MB.** That's every world's painted backdrop loading at once, even for locked worlds (finding 2 below).
- The total keeps rising as new worlds are visited and never comes down.
- Desktop Chrome can throw away unpacked pictures it isn't drawing when memory runs low, so on a computer this is survivable. Phones have far less room, and Safari's clean-up is less dependable. The game's own canvas copies (finding 4) can never be thrown away by the browser.
- This was a desktop browser on Linux. A real iPhone will differ; see "How to check on a real phone" at the end.

## Findings, biggest first

### 1. Pictures are never released

About 36 files each load their sprite sheet once and keep it for the whole session (`src/game/atlasLoader.ts` and its callers: `heroSprite.ts`, `paintedBoss.ts`, `protoArt.ts`, `storyCels.ts`, `castleSprites.ts`, the lair files, and so on). Nothing ever unloads one. Leaving World 2 for World 5 keeps all of World 2's kit, props, enemies and backdrops in memory.

The biggest single pictures:

| Picture | Size | Unpacked |
|---|---|---|
| `enemies/prowler-anim.webp` | 4096×2951 | **46 MB** |
| `enemies/croc-anim.webp` | 4096×1898 | 30 MB |
| 13 moving story backdrops, `story/live/*.webp` | 3120×1800 each | 21 MB each, **278 MB together** |
| `characters/cels-folk.webp` | 2048×2556 | 20 MB |
| `props/w3-props.webp`, `w2-props.webp` | about 2048×2200 | 18 MB and 17 MB |
| Each world's backdrop strips | | 20 MB per world (36–38 MB for worlds 8 and 9) |

**Fix:** give the loader a "release" step, and when play moves to a new world, release the old world's backdrops, kit, props, enemies and lair. Releasing means removing the picture from the module's variable or Map and setting `img.src = ''`. Keep only the current world, plus the next one if you want instant loads. (`PaintedVista.tsx:75-78` already does this correctly for the title backdrop.) After a release, a picture reloads from the offline cache, which is fast.

### 2. The World Map loads every world's backdrop (about 200–240 MB, for nothing)

`WorldMap.tsx:122-125` asks for a thumbnail of all 10 worlds. Each thumbnail goes through `VistaCanvas.tsx` → `scenery.ts:1409`, which starts loading that world's full backdrop strips (`paintedBackdrops.ts:51-72`), and they're kept forever. The thumbnail is drawn before the strips even arrive, so the load does nothing for the map. The comment at `paintedBackdrops.ts:8` says "about 4 MB a world"; the real figure is 20–38 MB.

**Fix:** when drawing a thumbnail, skip the painted-backdrop lookup (or use small dedicated thumbnail pictures). This is probably the easiest big win in the list. It removes most of the 330 MB jump measured when the map opens.

### 3. The story keeps every backdrop it has shown (up to about 340 MB)

`StoryPlayer.tsx:63-66` → `storyArt.ts:483-486` preloads every panel's backdrop as soon as a story opens. Nothing is let go when it closes:
- the moving parts of the story backdrops (`livePlates.ts`, 21 MB each, 278 MB for all 13)
- the still backdrops (33 MB)
- the photos (28 MB)

The moving backdrops are now on by default: they use the hero-clips switch, which turned on 2026-10-24. The comment at `livePlates.ts:6` still says "off by default".

**Fix:**
- Load only the current panel and the next one.
- Release everything when the story closes.
- Ship the moving-backdrop sheets at half size. They're mostly mist, rain and fireflies, so half size would look the same and saves three quarters of their memory.

### 4. Reward coats copy whole sprite sheets (about 97 MB per coat, never dropped)

Wearing a reward coat recolours a full copy of each hero sheet into a canvas (`heroTint.ts:70-86`, cached in `heroSprite.ts` lines 57, 80, 89 and in `heroStory.ts:127`):
- the main atlas (9.7 MB)
- the standard sheet (10.7 MB)
- the story sheet (5.5 MB)
- all 18 clip sheets (70.8 MB)

Switching coats keeps the old copies, so trying all three coats costs about 290 MB. `CoatPreview.tsx` keeps its own copies on top of that, up to 32 MB more.

The browser can never throw canvases away the way it can with pictures, which makes these the riskiest memory on a phone.

**Fix:**
- When the coat changes, drop the other coats' canvases and set their `width = height = 0`, which frees them right away.
- Share one cache with `CoatPreview`, and have the preview recolour only the frame it shows.
- Better: recolour single frames as they're drawn, into a small cache with a size limit.

### 5. All 18 of Pokey's clip sheets load at the first stage (71 MB)

`engine.ts:474` loads every hero clip (yawn, doze, belly scratch, wave, kicks, and so on) when the first stage starts. Most are only seen now and then.

**Fix:** load the movement clips at the start, and fetch the idle and celebration clips the first time they're about to play. Or pack the clips more tightly: `idle-yawn.webp` alone is 1728×1470.

### 6. Orchestra samples (75–100 MB of sound)

Audio files are tiny as mp3s but are unpacked into raw sound. All 371 mp3s are mono at 44.1 kHz. The title music alone needs 16 of the 24 instruments (about 74–80 MB). After a long session all of them are loaded (about 93–101 MB, larger on iPhones because they run audio at 48 kHz). The sound effects add about 9–10 MB. Nothing is unloaded (`src/audio/orchLoader.ts:25-59`, `core.ts:48`).

**Fixes, in order of payoff:**
- **Unpack pitched instruments at a lower sample rate.** Use `new OfflineAudioContext(1, 1, 24000).decodeAudioData(bytes)`. Every pitched voice already goes through a filter of 13 kHz or lower (`instruments.ts:486-535`), so nobody will hear a difference. This roughly halves the music memory, to about 40–50 MB. Keep the cymbal, triangle and snare at full rate. Test on an iPhone first, to confirm Safari plays these buffers.
- **On phones, skip instruments the lighter phone arrangement never plays.** `groupsFor` (`orchLoader.ts:84-104`) ignores it today; marimba on the title, map and world 1 is one example.
- **On phones, unload instruments the current piece doesn't use** once the old piece has stopped. The instruments already fall back to synthesized sound if a sample is missing.
- Load a few files at a time, not about 180 at once, so memory doesn't spike while loading.

Sounds that are fine: one AudioContext for the whole session, voices that stop properly, and ambience that cleans up after itself. One edge case: if starting the sound engine fails (`conductor.ts:130-133`), it doesn't close the context it just made. A later tap then makes another one. Add `ctx.close()` in that catch.

### 7. A real leak: creature bodies stop being tidied after a long stage

`creatureRig.ts:155-157, 217-219`. Each animated creature's body (springs, the snake's chain, and so on) is kept in a list, tidied every 3 seconds of game time. Game time starts at 0 again every stage, but the "last tidied" time is never reset. After a 5-minute stage the next tidy waits until a stage passes 5 minutes, which most never do. From then on, every creature from every stage stays in the list for the rest of the session.

**Fix (one line):** at the top of `bodyFor`, add `if (time < lastPrune) lastPrune = time;`. Or call `resetBodies()` when a new engine starts.

### 8. Platform and ground textures (up to about 60 MB per stage, rebuilt each stage)

`platformSprites.ts` paints each platform at 2× into its own canvas, capped by count (140) but not by size: up to about 46 MB on stage 10-8. The ground textures (`soil.ts`, `groundTiles.ts`) add about 13 MB. They're cleared every stage, but old canvases only count as freed once the browser gets round to it.

**Fix:** cap the cache by size rather than by count, paint at the screen's real scale, and set `width = height = 0` on each canvas when the cache is cleared.

### 9. Canvases freed without being zeroed, and blank results not handled

When any canvas cache is emptied, set each canvas to `width = height = 0` first. That frees the memory straight away instead of whenever the browser next cleans up.

Several places assume a canvas can always be drawn on (`scenery.ts:378`, `platformSprites.ts:58`, `soil.ts:36`, `castleSprites.ts:57`). On a phone that's out of memory, `getContext` can return nothing and the game will crash instead of skipping a decoration.

### 10. Smaller things

- **The game keeps drawing behind some menus.** `App.tsx:333-337` stops the game loop on the title and map, but not on the Trophy Room, the victory and game-over cards, or the pause menu. The whole scene is redrawn 30 times a second behind them. That costs battery and heat, and makes garbage the browser has to clean up.
- **The last stage stays in memory on menus** (`App.tsx:333-337` stops the engine but keeps it). Set `engineRef.current = null` after stopping.
- **The 20 ms stage-start timer is never cancelled** (`App.tsx:541`). Two quick starts could make two game engines drawing at once. No normal path to this was found, but it's cheap to guard.
- **Defeated boss minions are never removed** from the enemy list during a fight (`engine.ts:2370, 4302`). Small; it resets each stage.
- **The offline download is 47 MB in 497 files** (`vite.config.ts:45`), all fetched on the first visit. This is storage, not memory, and it's within limits. Fetching each world's art when it's first played would make the first visit lighter on phones with little free space.
- **Saving:** `applySave` (`saveFile.ts:170-173`) removes the old save before writing the new one. If writing fails partway (full storage, private mode), progress is lost. Keep the old values and put them back on error.

## Checked and fine

- Event listeners, timers and animation loops in the React screens all clean up properly.
- The performance log and the play recorder are off by default and have size limits.
- Particles, projectiles and floating text expire.
- Saved data in local storage is small (well under 100 KB) and every write is guarded.
- The main canvas caps its sharpness at 2× (it never uses an iPhone's 3×), and no canvas comes near Safari's size limit.

## Suggested order of work

1. The creature-body leak (#7). One line.
2. Stop the World Map loading every backdrop (#2). Small change, about 200+ MB.
3. Release the old world's art on a world change (#1). Medium; the biggest long-session win.
4. Story: current and next panel only, release on close, half-size moving backdrops (#3).
5. Reward coats: drop old copies, share the preview cache (#4).
6. Audio at a lower sample rate on phones (#6). About 40–50 MB.
7. Load Pokey's rarer clips on demand (#5). About 50 MB.
8. Zero canvases on release, cap platform sprites by size, handle blank `getContext` (#8, #9).
9. The smaller items (#10).

With 1–7 done, my rough estimate is that play stays around **400–550 MB** instead of about 950 MB, and stops growing over a long session. That would put iPhones comfortably inside their limit. This is an estimate, not a measurement.

## Phones with less memory

The browsers give a game very little to go on:
- Chrome on Android reports `navigator.deviceMemory` (1, 2, 4 or 8 GB). Safari doesn't.
- There's no warning event before a tab is killed, in any browser.
- A practical approach: treat iPhones (`/iPhone|iPad/` in the user agent, or touch plus a small screen) and Android devices reporting 4 GB or less as "low memory". On those, use half-size backdrops and moving backdrops, keep only the current world, and unpack audio at a lower rate.
- Save on `visibilitychange`, because a killed tab gets no chance to save.

## How to check on a real phone

- **iPhone:** connect it to a Mac, open Safari → Develop → [the phone] → the game, then Timelines → Memory. Play from the title through the map into a few worlds and watch whether the line keeps climbing.
- **Android:** use `chrome://inspect` from a desktop Chrome, or the Memory panel in DevTools, the same way.
- The headless test that produced the table above can be run again after each fix to show the before and after.

## Sources for the browser limits

- WebKit removed Safari's separate canvas-memory cap in 2023, so canvases now count toward the page's overall limit: https://github.com/WebKit/WebKit/commit/6bd11f3792f05b4e58e5647bf173212879fa62cc
- iOS canvas size limit raised to 8192×8192 in 2024: https://github.com/WebKit/WebKit/blob/main/Source/WebCore/html/CanvasBase.cpp
- Reported iPhone page limits, about 1.5–2 GB; Apple publishes no official number: https://github.com/musetric/musetric/issues/1052
- WebKit's memory-pressure handling: https://github.com/WebKit/WebKit/blob/main/Source/WTF/wtf/MemoryPressureHandler.cpp
- Chrome keeps unpacked pictures in memory it can throw away: https://github.com/chromium/chromium/blob/main/cc/tiles/gpu_image_decode_cache.h
- Web Audio buffers are raw 32-bit sound, resampled to the context's rate: https://github.com/WebAudio/web-audio-api/blob/main/index.bs

## Results after the fixes (measured 2026-10-25)

The same headless tour (title, World Map, then the first stage and the boss of every world in one session), run on `main` and on the fixed build. Each was run twice. The first run was normal. The second told the browser memory was critically low before every reading, the way a phone low on memory behaves: Chrome then throws away the pictures it has unpacked but isn't drawing.

Numbers are the game page's process memory, in MB.

| Moment | `main`, phone-like | Fixed, phone-like | `main`, normal | Fixed, normal |
|---|---|---|---|---|
| Title screen | 361 | 335 | 473 | 454 |
| World Map, first visit | 417 | 382 | 805 | 549 |
| In 1-1 | 438 | 397 | 888 | 644 |
| In 3-10 | 448 | 408 | 977 | 939 |
| In 7-1 | 471 | 444 | 993 | 963 |
| In 10-10 | 473 | 435 | 985 | 956 |
| Back on the map at the end | 490 | 460 | 1003 | 975 |

What it shows:

- **On a phone-like Chrome, the fix saves 25 to 45 MB during play, about 8%.** It's a real saving but smaller than the estimate in this audit. Chrome on Android already drops unpacked pictures under memory pressure, so the game's own references were costing less there than the estimate assumed.
- **Without memory pressure, the World Map now opens 256 MB lighter**, and the first worlds of a session run 150 to 250 MB lighter. The work of unpacking every world's backdrop at the map is gone too, which a phone feels as a faster, smoother map.
- **This tour doesn't cover the story, the reward coats or iPhones.** Those are where the fix matters most: the story's moving backdrops (278 MB) and the coat copies (97 MB a coat) are canvases or pictures Safari can't easily drop. Measure them on a real iPhone with Safari's Timelines (above).
- **Neither build climbs out of control across ten worlds in this test.** Before the creature-body fix, the old build's body list kept growing; the tour is too short to show that leak, but the regression test covers it.

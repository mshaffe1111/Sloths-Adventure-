# LINK-ROOM REPORT: R-165.252: Matt's test link gets room again

Tools member, Opus 5.5 high. Started 8:35 PM ET 11-20; this report written __WRITTEN__ (times from `TZ=America/New_York date`).
Base: origin/t-int-15 at 0eefc707e. Branch t-link-room. Code commit **d2349d924**; this report and the gate table: __HEAD__.
Touches only tools/testlink/ (the test link's config, build script, its test, a new smoke tool), .gitignore (the smoke's stills) and
HANDOFF §6 (two lines). Nothing in src/, vite.config.ts or any workflow changed. The artifact was NOT published (the packet).

## The fact the packet had wrong (Law 3)
The packet said "index.html about 10-11 MB". index.html is **34 KB**. The large file is the main script, **assets/index-*.js at 14.65 MB**
(16 MB a file is the artifact's limit), because every picture under the inline limit was inlined as a data: url INTO the script that
names it. That is why the last two rounds could not raise the inline limit (11-15's comment: 80 KB gave an 18.7 MB index.js).

## 1. Measured (base 0eefc707e, `python3 tools/testlink/build.py`)
| | files | notes |
|---|---|---|
| webp | 418 | 2 under 64 KB, 42 at 64-80 KB, 31 at 80-96 KB, 64 at 96-128 KB, 279 over 128 KB |
| js | 39 | index 14.65 MB, orchLoader 4.3, cast 1.8, the rest under 0.4 MB (14 seed lists, 10 world chunks, small esm/web bits) |
| woff2 / png / html / css | 7 / 7 / 2 / 1 | |
| audio packs | 5 | pack_audio's (4 webm at up to 15.0 MB, 1 mp3) |
| **total** | **479** | 1 under build.py's 480 cap; 32 under the artifact's 511 |

Where the inlined pictures came from: 292 pictures are named as `new URL('x.webp', import.meta.url)` in 138 files; the bundler inlines
those straight into the naming module, so most landed in index.js. (Pictures named through `import.meta.glob(..., '?url')` or a template
literal are modules of their own.)

What each option costs:
| option | files freed | cost | verdict |
|---|---|---|---|
| larger inline limit alone | 42 at 80 KB | index.js 18.7 MB at 80 KB: over the artifact's 16 MB a file | dead |
| merge small JS chunks | about 30 at most (39 js) | not 40; world chunks would grow the eager script | not enough |
| drop dev-only files | 0 found | every file in dist is referenced by the game (vite emits only what is imported) | nothing to drop |
| **art packs + larger inline limit** (chosen) | 71 at 96 KB | boot download +7.5 MB up front (below) | **meets the goal** |
| texture atlas | many | touches how the engine draws; not a test-link-only change | out of scope |

## 2. The option chosen (tools/testlink/vite.testlink.config.ts, test link only)
1. A pre-transform plugin (`testlink-art-imports`, build only) rewrites each static `new URL('x.webp', import.meta.url)` in src/ into
   `new URL(__tlArtN, import.meta.url)` with `import __tlArtN from 'x.webp?url'`. The value is the same url (or the same data: url once
   inlined). A path that does not exist (a comment) and template-literal names are left exactly as they were.
2. A rolldown `codeSplitting` group puts every picture module (`.webp`/`.png`, with or without `?url`) in **art packs**
   (`artpack-*.js`, at most `ART_PACK` = 11,000,000 bytes each), instead of the script that imports it.
3. The inline limit goes 64 -> **96 KB** (`INLINE_KB`).

Why this one: it is the only option that frees 40+ files AND shrinks the big file; it changes no game code; the packs load with index.js
exactly as the inlined pictures did inside it (index.html preloads both packs), so nothing loads later than before.

## 3. Before / after (the test link)
| | before (0eefc707e) | after (d2349d924) |
|---|---|---|
| files | 479 (1 free under 480) | **408 (72 free)** |
| index.html (the page) | 34 KB | 34 KB |
| index-*.js | 14.65 MB | **4.57 MB** |
| largest file that is not an audio pack | 14.65 MB (index.js) | **10.10 MB** (artpack) |
| art packs | none | 2: 10.10 + 7.41 MB |
| audio packs | 4 webm (15.0 / 14.7 / 14.6 / 11.9 MB) + 1 mp3 | unchanged (same bytes, same names) |
| scripts + css index.html loads up front | 15.04 MB | 22.49 MB (+7.5) |
| download in all after 12 s: title / 1-1 / 2-5 | 42.8 / 73.0 / 65.2 MB | 50.1 / 79.6 / 72.0 MB |
| first publish after this change | | 93 map entries: 11 files sent (26.7 MB), 82 removed (null): one publish (limits 255 files, 64 MB) |

**The cost, named:** the boot download grows about 7.5 MB, because the 73 newly inlined pictures (64-96 KB) are base64 (+33%) and load
up front with the packs. 80 KB would cost about half that but leaves only 41 free (the picker's six stills would take it under 40 at once);
96 KB is the smallest step with real room. The lead accepted it (8:52 PM ET); the measured numbers for both are under Unresolved below.

## 4. The planted check
- **build.py** (`room_problems`, run in `finish()` before any map is written): refuses (exit 1, no map, no page) when the build is over
  480 files, **leaves under MIN_ROOM = 40 free**, or has **any file over MAX_FILE_MB = 13** (pack_audio's packs are held to their own
  designed 15 MB, `AUDIO_PACK_MB`; the artifact takes 16). It prints the count, the room and the largest file on every build.
- **build.test.ts** (runs in CI, gates.yml `rolled`): 440 files passes and prints `40 free`; 479 and 441 fail with the room message;
  a 13.1 MB file fails, a 14.9 MB audio pack passes, a 15.1 MB one fails; **the real test-link build** (vite into a temp folder, so the
  lead's dist is never touched, plus pack_audio; about 4 s) must have room >= 40, every file under its limit, index.js under 6 MB and the
  art packs present; and the plugin's rewrite is pinned (two pictures become imports; a comment path, a template literal, a sound do not).
  8/8 PASS.
- **It bites on the base:** `room_problems` on the 0eefc707e test-link build reports "479 files leave 1 of room under the 480 limit"
  and "assets/index-*.js is 14.6 MB, over 13 MB". On the new build: none.

## 5. Nothing dropped
A byte check (every picture of the base build, as a file or as a data: url in any script, against the new build): base 420 picture files
+ 289 inlined; new 347 files + 362 inlined; **missing 0**. Every non-picture, non-script file (fonts, audio packs, the two pages, css,
root files) is present by name: missing none, new none.

## 6. Headless boot proof (`node tools/testlink/smoke.mjs`, new)
Serves the build folder locally, opens it as a portrait phone (412x915, touch): the title, `?autostart=1&level=1-1` (the prologue skipped
to reach the stage) and `?autostart=1&level=2-5`; fails on any console error, page error, failed request, non-200 or undecoded <img>.
| visit | before | after |
|---|---|---|
| title | 0 problems, 11 <img> decoded | **0 problems**, 11 <img> decoded |
| 1-1 | 0 problems | **0 problems** (3 runs) |
| 2-5 | 0 problems, 14 <img> | **0 problems**, 14 <img> |
Stills looked at, the way Matt will see them: the title (logo, Pokey and the runner, buttons, icons all painted); 1-1 (backdrop, ground,
Pokey, Dot's tip, hummingbird, critters, hearts, the vine bar); 2-5 (World 2's village backdrop, cattails, ground, Pokey, the HUD).
1-1's critters differ between runs (a squirrel with an acorn, nuts, none): the roll, the same on the base; the squirrel sprite is drawn
in the new build's first run. Stills: `stills/before-*.webp` and `stills/after-*.webp` (title, 1-1, 2-5; after-1-1-run2 the second roll).
(Not the artifact frame itself: the packet says do not publish; the smoke proves every file is there and loads.)

## 7. The shipped build is unchanged
- `BASE_PATH=/Sloths-Adventure-/ npx vite build` on the base and on the changed tree (same HEAD 0eefc707e, so the same build stamp):
  `diff -r` **identical**, 1144 files, md5 of the list c6955f6813b54d2c0d1ee5a8d731f535.
- `git diff 0eefc707e --stat`: only tools/testlink/*, .gitignore, reference/HANDOFF.md. vite.config.ts, src/ and the workflows are
  untouched and nothing outside tools/testlink imports the changed files, so the store build (the APK, `npm run build:store` from
  vite.config.ts) and chunkcheck's input are the same bytes.

## 8. Gates (the full CLAUDE.md list plus CI's extras, each once, D86)
__GATES__

## Unresolved: the boot download (accepted by the lead 8:52 PM ET 11-20 for Matt's link; revisit here)
96 KB costs boot download, because the newly inlined pictures are base64 (+33%) and load up front with the packs. Measured on the same
tree (INLINE_KB is the only difference), headless, portrait phone:
| | base 64 KB, into index.js | 80 KB, art packs | **96 KB, art packs (shipped on t-link-room)** |
|---|---|---|---|
| files (free under 480) | 479 (1) | 439 (41) | **408 (72)** |
| largest non-audio file | 14.65 MB index.js | 8.39 MB artpack | 10.10 MB artpack |
| scripts + css index.html loads up front | 15.04 MB | 18.73 MB (+3.7) | 22.49 MB (+7.5) |
| served bytes on the title after 12 s | 42.8 MB | 46.5 MB (+3.7) | 50.1 MB (+7.3) |
| smoke (title, 1-1, 2-5) | 0 problems | 0 problems | 0 problems |
(Served bytes "by page load" are not in this table: they swung 26-46 MB between runs while the gates were loading the CPU; the up-front
script bytes are counted from the files and do not move.) 80 KB would cost half as much, but its 41 free drop under 40 with the picker's
six stills at once. Ways to win the bytes back later, none needed now: inline only pictures the title or 1-1 needs (a list), or a pack
per world loaded with that world's chunk; or go back down to 80 KB once the room is not needed.

## Learned (for the next tools member)
- Measure the file before trusting the size in a packet: the "page" was 34 KB; the script beside it was the one at the wall.
- An inline limit has two costs, not one: files freed, and bytes added to WHICHEVER script names the picture. Moving the bytes out
  (one module per picture + a size-capped group) is what made the limit movable again.
- `new URL('x', import.meta.url)` is inlined in place, `?url` imports are modules: a bundler group catches only the second, so the
  first must be turned into the second before any grouping works (the first try matched nothing: the ids carry `?url`).
- Every step up in the inline limit trades boot download for files; say the trade in numbers, and raise it only when room runs low.

## Lessons applied
D40 (built on the test link's own config, which no planned job replaces this sprint), D86 (the full gate list, every one PASS or FAIL),
D102 (lean reads: the packet's list only; the whole job well under 200k context), Law 3 (the page-size fact checked and corrected),
Law 22 (the cap was not raised to make room; the files were made fewer).

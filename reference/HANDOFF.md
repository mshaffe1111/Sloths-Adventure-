# Sloths Rainforest Adventures: handoff

The full picture for any Claude session picking this game up. It's kept in the repo so nothing starts from scratch. Last brought up to date 2026-10-25. Keep it current: when something here changes, change this file in the same PR.

Owner: **Matt** (Matt Shaffer). He plays and tests on a Pixel phone, and other people are testing the live game too.

---

## 1. Links

| What | Where |
|---|---|
| Live game (GitHub Pages) | https://mshaffe1111.github.io/Sloths-Adventure-/ |
| Repo | https://github.com/mshaffe1111/Sloths-Adventure- (GitHub says it moved; pushes print a redirect notice but work) |
| Matt's private test link (Claude artifact, update in place) | https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb |
| Overnight Art Run gallery (Hugging Face results Matt is choosing from) | https://claude.ai/artifact/J6iuizvLB1iC6Ge8whThe9 |
| Sloths Stage Plan (each world's ten stages from the story; approved 2026-10-23, in code as `src/game/stagePlan.ts`) | https://claude.ai/artifact/5QTYDDzmPDNMGKtaSuKEg4 |
| Cast Bible (who everyone is; approved 2026-10-22) | https://claude.ai/artifact/Ac5U5PnWQgjpjpCo6kxDbS |
| Art Still Needed (older Gemini prompt page with tick boxes: character sheets, the stage backgrounds and prop kits for all ten worlds) | https://claude.ai/artifact/SXMfAQzfTAevF8JKhZSqGj |
| Sloths Roadmap (last updated 2026-10-21, **behind**: check it against the code before trusting it) | https://claude.ai/artifact/CchnHEYUxUwDDJfoQ2o9rX |
| Story Plan / Story Reader / Acts Preview | https://claude.ai/artifact/9KxHMAVgpE9y1CCWFxTSoY · https://claude.ai/artifact/8vVrhUhQUSzC7VqYE4eQcz · https://claude.ai/artifact/BQzDaccZ4vWaJgrZS6SXNu |
| Pokey's Journal mock-up | https://claude.ai/artifact/XQnHFJwbDqAaASTM4DHc8P |
| Older design pages (history only) | Stage 1-6 Blueprint https://claude.ai/artifact/4UZEGManrJE8BEHPBeCWeS · Animation sheet audit https://claude.ai/artifact/N1spn4C7pYrzrhZseXHR1G · SFX Lab https://claude.ai/artifact/DBh88uKZQyJmQiTGuJwai7 · UI Mockups https://claude.ai/artifact/ShTwaSeg2gpxWY823pUQCs · Store Listing https://claude.ai/artifact/L5oqivE1WxxXFUuP6dgFHe |

Artifacts belong to Matt's account, so any Claude session he uses can read and update them. To update one, read it first, then publish to its URL. A new URL means a new artifact.

Matt's Claude memory has a long file about this game (`/areas/sloths-adventure.md`): his decisions and preferences, dated. Read it at the start of any game work.

---

## 2. How Matt works (standing rules)

- **One question at a time.** For decisions, ask him one multiple-choice question at a time, never a batch. Explain in plain, spoken terms. He'd rather hear it than read a long document. Talk like a person, not in bullet fragments.
- **Honest.** Honest pushback when it's warranted, no apologies, and research before saying something is wrong.
- **Show first.** Show significant screen changes, new icons and new looks (a mock-up, screenshots, a preview video) before building them in.
- **Phone first.** It's a phone/tablet game: touch only, every stage playable in portrait and landscape, and all hint text describes touch.
- **Testers are live.** Experiments default off, and nothing half-finished goes to `main`.
- **After every round of changes**: rebuild and republish the test link in place (§6), and tell him what changed.
- **Pushing:**
  - push to GitHub only when he says "push";
  - then open the PR and give him the PR link (§7);
  - he merges it himself.
- **Background jobs.** While they run, keep doing useful work (checking, screenshots, the next piece) rather than waiting.
- **Money.** Hugging Face compute is fine to spend on quality ("a couple of dollars here and there"). Say roughly what a job costs before launching big ones.

### Design rules for stages (check every stage against these)

- **Crumbling platforms**: crumbling/breakaway platforms are never needed to finish a stage. They grow back after 3 s, so nobody can be left stuck.
- **Climbing**: on a vine or trunk, straight up or down always climbs; only a diagonal slide jumps off.
- **Length**: every stage takes at least 2 minutes even for a quick player (5+ minutes is fine). Each stage is a little harder than the last, with an easy start to hook players.
- **Teaching**: every new mechanic is taught where it first appears (lesson cards, `src/game/lessons.ts`). Dot, the hummingbird, is the in-stage guide for tips and goals, and never repeats a tip on replays.
- **Goals**: the stage shows what it requires (e.g. a petal count), so a sealed exit always explains itself.
- **Hearts** go on the tougher stretches.
- **Difficulty**: Easy and Normal. On Easy, guardians need two thirds of the hits and give longer warnings.
- **Layouts**: stages are planned, and their details roll (sizes, heights, enemies, secret spots). A retry keeps the layout; a fresh roll only comes after a clear.
- **Variety**: each world has its own way of moving and one special stage that breaks the pattern (World 1's is the 1-8 branch-collapse chase). There are puzzle stages that hold the special collectibles, and secrets to come back for.
- **Abilities**: one new ability per act. Rope in World 1, leaf glide in World 4, hot-air lift in World 9. Abilities are reused afterwards, and the final stage uses them all.
- **Frame rate**: locked at 30 fps on purpose. 60 fps looked jittery on his phone.

### Story rules (see `reference/VOICE.md`)

- **Dot** is female: a nurturer, almost Pokey's second mother.
- **Pokey** talks slow and carefree ("It seems to me..."), a gentle smart-aleck.
- **The General** (Iron-Claw) is Meeca's grandfather.
- **Dialogue** must read like real people talking. About 20 testers said the old story read as AI-written. Work out new lines with Matt, scene by scene.

---

## 3. The code: where everything lives

**Stack**: Vite 8, React 19, TypeScript. The game is a canvas engine in `src/game/` (about 350 files). React draws the menus, the story, the journal and the overlays (`src/components/`, `src/App.tsx`). Audio lives in `src/audio/`.

### Stages and levels

| What | Where |
|---|---|
| Every world's stage names and order (from the story) | `src/game/stagePlan.ts` (`STAGE_PLAN`) |
| World names, guardians, quotes | `src/game/worldsData.ts` |
| **World 1 and World 3 hand-built stages** (1-1 to 1-9, 3-1 to 3-9) | `src/game/protoStage.ts` |
| **World 2 hand-built stages** (2-1 to 2-9) | `src/game/w2Stages.ts`, art in `w2PropsData.ts` |
| World 3 art and decor | `src/game/w3Art.ts`, `w3PropsData.ts` |
| **Worlds 4-10** (still the procedural generator: planned, rolled, validated) | `src/game/stageGenerator.ts`, `levelSeeds.ts`, `levelCheck.ts`; run `npx tsx scripts/check-levels.ts [4]` |
| Stage-length and layout checks | `scripts/measure-stages.ts`, `scripts/seed-levels.ts`, tests such as `w2Stages.test.ts`, `w3Stages.test.ts`, `protoStage.test.ts`, `levels.test.ts` |
| Abilities (rope/shimmy, glide) and when they unlock | `src/game/skills.ts` |
| Secret levels plan | `reference/SECRET-LEVELS.md` (Under the Ruins, World 7) |
| Physics and controls | `physics.ts`, touch handling in `src/game/` (search for `touch`), lessons in `lessons.ts` |
| Pickups, hearts, checkpoints, flowers | `pickups.ts`, `flowerReach.ts`, `wayside.ts` |

### Props, kits and backdrops (Matt's Gemini art, cut into atlases)

| What | Picture | Where each piece sits |
|---|---|---|
| World 1 props (logs, branches, lianas, ground, hollows, bushes, the long branch) | `src/assets/proto/props-atlas.webp`, `props2-atlas.webp`, `props3-atlas.webp` | `protoAtlasData.ts`, `proto2AtlasData.ts`, `proto3AtlasData.ts`; drawn by `protoArt.ts` |
| Worlds 2-10 ground and climbing kits | `src/assets/kits/w2.webp` … `w10.webp` | `kitAtlasData.ts`; `platformKit.ts`, `drawKit.ts` |
| World 2 props (river, village, court, cages, boughs) | `src/assets/props/w2-props.webp` | `w2PropsData.ts` |
| World 3 props (grotto, ferns, thorn vine, sinkhole, ring) | `src/assets/props/w3-props.webp` | `w3PropsData.ts` |
| Stage backgrounds (three strips per world) | `src/assets/backdrops/w<N>-far/mid/near.webp` | `scenery.ts`, `soil.ts`, `terrain.ts` |
| Boss lairs | `src/assets/lairs/` | `lairKit.ts`, `lairProwler.ts` |
| Matt's original prop sheets (World 1) | `reference/prop-sheets/` | — |

The cutting and packing scripts are in `tools/art/` (`w2art/`, `w3*/`, `packprops.py`, `packkits.py`, `cutprops.py`), plus `scripts/item-cutout.py` and `scripts/backdrop-*.py`.

### Characters and creatures

| What | Where |
|---|---|
| Pokey (sheets, trained-model clips) | `src/assets/hero/`, `heroSprite.ts`; sheet format in `reference/animation-sheets/README.md` |
| Meeca, Dot, story cels | `src/assets/characters/`, `dotSprite.ts`, `storyCels.ts` |
| Regular creatures | `src/game/<creature>Sprite.ts` / `turtleArt.ts` / `guardArt.ts`, atlases `src/assets/enemies/*-atlas.webp` + `*AtlasData.ts` |
| **Animated creature clips** (motion model, 2026-10-25) | `creatureAnim.ts` (shared loader), `*AnimData.ts`, `src/assets/enemies/*-anim.webp`: golden snake, eagle, ocelot, jaguar, turtle, royal guard, boa. Each keeps its single painted poses as the fallback. |
| Golden snake (the game's snake) | `goldSnake.ts` (`?snake=classic` brings back the old one) |
| Enemy brains and timings | `predatorAI.ts` (`TURTLE`, `GUARD`, …) |
| Bosses / guardians | `bossDefs.ts`, `bossArt.ts`, `<boss>Sprite.ts`; boss sheets in `reference/boss-sheets/` |

### Story

| What | Where |
|---|---|
| Prologue, worlds, bosses, memories, finale | `src/game/storyIntro.ts`, `storyWorlds.ts`, `storyBosses.ts`, `storyChapters.ts`, `storyMemories.ts`, `storyFinale.ts` |
| Voice and character rules (read before writing any line) | `reference/VOICE.md` |
| The rewrite, world by world | `reference/STORY-REWRITE.md` |
| Story pictures and moving plates | `src/assets/story/`, `storyArt.ts`, `livePlateData.ts`, `src/assets/story/live/` |
| Story reader (a standalone page for reading the script) | `story-reader.html`, `vite.reader.config.ts`, `scripts/story/` |

### Art still needed and Gemini prompts

- **`reference/ART-TO-GET.md` is the source of truth.** It's the running list; done items are crossed out.
- **Open items** as of 2026-10-25:
  - #2 Pokey climbing seen from behind;
  - #3 the reed cages redrawn;
  - #4 the river king peeking from the water;
  - #16 Grandma's things;
  - #18-22 the story pictures;
  - #11 the secret level's pieces (later).
- **Where the prompts are:**
  - `reference/prompts/` has prompts 12-17 (World 3).
  - `reference/STORY-ART-PROMPTS.md` has prompts 18-22.
  - The Art Still Needed artifact has the sheet format block and the world background and prop-kit prompts.
- **Missing prompts.** Prompts 1-9 and 23-24 were given in chat and aren't saved. Write new ones from the item's description, using the formats in those files.
  - Character sheets: 4×4 on flat grey #808080, 1024².
  - Props: 3×2 on magenta #FF00FF, 1536×1024.
- **Before each new batch of stages**, give Matt the Gemini art prompts the stages need, so every stage stays fresh.

---

## 4. Running, testing, checking

```
npm install --legacy-peer-deps
npx vite --port=4301 --host=127.0.0.1 --strictPort      # dev server
npx tsc --noEmit -p .                                     # type check
npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts   # what CI runs
npx vite build                                            # what the deploy runs; no file in dist/assets may exceed 4 MiB
```

- **Tests**: run them with `npx tsx --test …`, as CI does; that way everything passes. Plain `node --test` reports one failure in `touchCoach.test.ts`. That isn't a bug: Node's built-in TypeScript stripping can't read a class parameter property in code the test imports. Under tsx it passes 6/6.
- **Housekeeping**: running the dev server rewrites `dev-dist/`. Before committing: `git checkout -- dev-dist; rm -f dev-dist/registerSW.js`.
- **Dev hooks** (dev server only):
  - `window.__play('2-5')` starts a stage.
  - `window.__engine()` returns the live engine (player, enemies, camera).
  - `window.__story(id, screen)` opens a story screen.
- **URL switches**:
  - `?lessons=off` skips the lesson cards.
  - `?hitboxes=1` shows the hit boxes.
  - `?snake=classic` / `?snake=drawn` change the snake.
  - Per creature, `?ocelot=` (and the others) take `classic` or `sprite`.
- **Screenshots**: use the Playwright scripts in `tools/art/` (e.g. `shot-gold.mjs`, `shot-enemy.mjs`). Headless Chromium runs the game well below speed, so use screenshots to check looks and placement, not timing.

---

## 5. The art and animation pipeline (Hugging Face)

Everything is in `tools/README.md` and `tools/art/`. In short:

- **Account `mshaffe111`** (Pro). Connect a session through the Hugging Face connector, or `HF_TOKEN` / `hf auth login`. **The token never goes in code, commits, shared files or memory.**
- **Models** (all private):
  - `mshaffe111/slothadv-style-lora`: the game's painted look on Qwen-Image. Trigger: `slothadv style, painted storybook illustration`.
  - `mshaffe111/slothadv-motion-lora`: the motion model for Wan 2.2 I2V. It has a high-noise file and a low-noise file. Trigger: `slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion`. v2 (82 clips) was training on 2026-10-25 as job `6ade0882046eb82b1ece5767`; compare it with v1 before switching.
  - Character models: `mshaffe111/<pokey|meeca|dot|general|venom|croc|prowler|sovereign|queen|reaver|golem|monarch|drake|ironclaw|thornbark>-qwen-lora`.
- **Data**: `mshaffe111/<name>-lora-data`, `char-sheets`, `slothadv-style-data`, `slothadv-motion-data`.
- **Generated output**: `mshaffe111/slothadv-gen`, with `stills/` and `clips/<name>.zip`.
- **Jobs**: run on `ostris/aitoolkit:latest` with flavor `rtx-pro-6000`, about $2.75/h. The overnight run of 2026-10-24/25 cost about $69; 90 creature clips cost about $14.
- **Lessons learned:**
  - The motion model fixed walks and runs in place.
  - Slithers mostly fail.
  - Grey-skinned creatures need the tight background key.
  - Don't enable `cache_latents_to_disk` when training I2V.
- **Waiting on Matt** (from the gallery):
  - which new creature designs to keep;
  - which leaf glide (plain leaf or parachute);
  - what animal the General's soldiers are;
  - what goes into the game first.

---

## 6. The test link (do this after every round)

Matt plays every round here before anything is pushed.

1. Run `python3 tools/testlink/build.py "what this round adds"`. It builds into `tools/testlink/dist` and writes `tools/testlink/filesmap.json` with the changed and removed files.
2. Publish with the Artifact tool:
   - `url`: https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb
   - `file_path`: `tools/testlink/dist/index.html`
   - `root`: `tools/testlink`
   - `files`: the map
3. The artifact holds at most 511 files. If a publish is refused, list its files (Artifact list, scope `files`) and map every path that's not in the new build to `null`.
4. Tell Matt in a line what the round changed. For animation or look changes, also send a short preview video (`tools/art/reanim/preview_anim.py`) or screenshots.

---

## 7. Releasing to the live site, and giving Matt the merge link

Only after Matt says "push".

1. Work on the branch `review-fixes`, or a new branch from `main` if `review-fixes` has merged.
2. Check:
   - `npx tsc --noEmit -p .`
   - the CI test command
   - `npx vite build` (all files under 4 MiB)
   - screenshots of what changed
3. Commit, ending the message with the attribution lines the session asks for. Clean `dev-dist/` first.
4. `git fetch origin && git rebase origin/main`, then `git push origin <branch>`.
5. Open the PR:
   ```
   gh api repos/mshaffe1111/Sloths-Adventure-/pulls -f title="…" -f head=<branch> -f base=main -F body=@pr.md --jq .html_url
   ```
   - Use `gh api`, not `gh pr create`: GraphQL is blocked through the session proxy.
   - The PR body should say what changed in plain words and what was checked.
6. **Give Matt the PR link** (`https://github.com/mshaffe1111/Sloths-Adventure-/pull/<n>`). He merges it himself.
7. After he merges, check the deploy:
   ```
   gh api "repos/mshaffe1111/Sloths-Adventure-/actions/runs?per_page=4" --jq '.workflow_runs[]|[.name,.status,.conclusion,.created_at]|@tsv'
   ```
   - "Publish game to the gh-pages branch" must succeed, then "pages build and deployment".
   - If the publish fails, read its log, fix it, and open a follow-up PR. That happened once, when a 2.1 MB file hit the old 2 MiB offline-cache limit (PR #25).
   - The live game updates a minute or two later. Players' phones pick it up on the next reload (the PWA keeps the cached copy until then).

---

## 8. Where things stand (2026-10-25)

- **Live on `main`** (PR #26 merged and deployed 2026-10-25 15:22 UTC):
  - Worlds 1-3 hand-built with their guardians: Venom Fang, Crocus Rex, the Shadow Prowler;
  - the full rewritten story;
  - the golden snake and the animated creatures;
  - Pokey's Journal;
  - Easy/Normal;
  - the refined touch controls.
- **Next**: World 4 (Mist Cascades, the leaf glide). It needs hand-built stages like Worlds 1-3, using `stagePlan.ts` and the World 4 art from the overnight run. Then animated clips for the frog, spider, tayra, caiman and harpy when their worlds come.
- **Code review leads** (unverified unless marked):
  - **Verified**: creature sheets are never released from memory. `creatureAnim.ts` is the one place to add releasing for the new sheets; keep the single-pose fallback so nothing disappears.
  - **Verified**: the offline precache is about 52 MB (503 files). Audio and late-world art could be cached on demand instead.
  - **Verified**: `@google/genai`, `express` and `dotenv` are template leftovers; nothing in `src/` imports the first two.
  - Possible duplicate story plates.
  - The 2.1 MB main JS bundle.
  - The control-test page (`#ctest`) was meant to be temporary.
  - Look for per-frame allocations and listeners or timers that outlive a stage.

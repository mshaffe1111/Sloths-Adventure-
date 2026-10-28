# Sloths Rainforest Adventures: handoff

The full picture for any Claude session picking this game up. It's kept in the repo so nothing starts from scratch. Last brought up to date 2026-10-25. Keep it current: when something here changes, change this file in the same PR.

**The living version is Matt's doc [Sloths handoff and roadmap](https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa)**: the roadmap to go, video and animation status and the decisions waiting on Matt are kept there (tick items as they ship). This file is the same reference kept in the repo.

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
- **Portrait AND landscape, always (Matt, 2026-10-26).** Every check, screenshot, mock-up, helper brief and QA gate pass covers both orientations, plus short landscape (about 640x320) for HUD work. Never assume landscape: Matt and Steph play upright; Jen and Brycen play sideways. It applies to everything built, not only checks: stages, menus, the world map, story cutscenes, cards, pop-ups, the HUD, boss arenas and new art. Each is designed for both from the start, not fitted to the second orientation afterwards. A check done in one orientation only is not done. QA persona bots play in their own person's orientation, and every gate pass also runs the other one.
- **New replaces old, no switches (Matt, 2026-10-26).** Testers play the live game. Once something new is tested and passes QA, it replaces the old code outright in the next release: no on/off switch, no beta setting, no old path kept alongside. The old code is deleted. Anything not yet passed stays off `main` (it lives on the work branch and the test link). This replaces the old "experiments default off" rule.
- **After every round of changes**: rebuild and republish the test link in place (§6), and tell him what changed.
- **Pushing:**
  - push to GitHub only when he says "push";
  - then open the PR and give him the PR link (§7);
  - he merges it himself.
- **Background jobs.** While they run, keep doing useful work (checking, screenshots, the next piece) rather than waiting.
- **Money.** Hugging Face compute is fine to spend on quality ("a couple of dollars here and there"). Say roughly what a job costs before launching big ones.
- **Release rhythm (2026-10-26).** Work a couple of stages at a time: build them, have the QA team test them, fix and retest, then deploy. Then do the next couple. Never hold a deploy for a whole world.
- **QA stays a separate session, playing blind.** The QA team doesn't know how stages are built, so it plays like a player would. This session builds and fixes; the QA team tests; they talk by message. Give QA small batches with a clear note of what changed and what to retest. A short gate pass comes before each deploy, and the full persona runs after.
- **One building session.** Keep the building work in one session (it summarizes itself when long); don't split it across new sessions, since catching up costs Matt tokens and splitting confuses who's doing what.
- **Helpers.** Matt is fine with more than 6 helpers at a time for important work when his tokens allow. Slow down when he says tokens are tight.
- **HUD and tutorial revamp: Matt's picks (2026-10-26, from the mock-up review https://claude.ai/artifact/Aopein5VvpCQaNoNXzRrBa).**
  - HUD: option B, the hanging vine (hearts and petals hang from a vine, Menu is a leaf), with option D's behaviour: things bloom into view when something happens (a petal picked up, a life lost) and stay small otherwise.
  - Dot: option C, perched. She sits on the scenery near the thing she's teaching, and a glowing ring and arrow point at it.
  - Dot's lines: Matt approved the shortened set (476 lines, review page https://claude.ai/artifact/PsV3hZSb7NgoDf1spAzAp2): tips 8 words or fewer that name the thumb move, story 12 or fewer, touch words only. They play in the new look; the old text stays when it is off.
  - Painted HUD and Dot art: Matt approved it (https://claude.ai/artifact/4vUjWq6sLns8snhLE9zqxL; raw art in the private HF repo mshaffe111/slothadv-revampart): perched Dot poses built from his own sheets, the vine, Menu leaf, plates, goal card, parchment bubble, ring and arrow.
  - Finger guides: none. No thumb or finger picture: Dot perched with her ring and arrow is the guide, and her words say the gesture ("Flick up to jump.").
- **World 5 decisions (2026-10-26).** Follow the story in reference/STORY-REWRITE.md "World 5" closely: every prop and mechanic comes from it. Use new Hugging Face art wherever it does the world justice rather than settling for existing art.
  - Light: lovely golden afternoon at 5-1, getting duskier as the orchids close, to misty violet twilight by the Queen's garden (World 8 is the night world, so World 5 must not read as night from the start). New backdrops per mood, plus the council-table arena.
  - Mechanics are Dot's five rules: don't sit (stillness makes him drowsy, silk creeps, soft chairs tug), don't eat (cakes look like pickups but bring sleep), don't drink (warm teapots' sleepy steam), don't touch the silk (threads hum and spiders turn), don't admire the silk.
  - Meeca's stage, right after 5-5 and required, not skippable (Matt, 2026-10-26: "big in how it relates to the game", not big in size). 5-5's pouch scene cuts to "Three days earlier".
    - You play Meeca, marched through the sanctuary at dusk with Pell as her guard. She can't fight: she slips out of line, carves on the move (hold on a trunk, her hairpin), and gets back before she's missed. Getting caught is gentle: she's walked back into line, with no hearts lost.
    - It opens on her finishing the 5-1 carving the player already read. What you carve shows up in 5-6, where you carved it, for Pokey to find.
    - It ends with Pell catching her gently and the blanket ("It is not from the General"), the moment from her hidden note.
    - What makes it different: no Dot (the tips are Meeca's own thoughts), her Heartbloom song as the music, dusk light, about 2.5–3 min, and her own page in the journal after. Matt approved the mock-ups (2026-10-26). The General's soldiers are sloths in olive uniform, like Pell (Matt, 2026-10-26).
    - Built (2026-10-26, `5-M`, in the list after 5-5 as 4-D is after 4-5): a "Three days earlier" card, then she finishes the 5-1 carving and catches up to her place in line. Pell walks just ahead of her place; he (and from the third tree, the soldier ahead of him) looks back on a rhythm: an amber ring fills while his back is turned, his turn (1.1 s, ring full and flashing) is the tell, and only the look after it can catch her, only in full view. The column halts by each tree until its warning is cut. Hold a thumb still on the glass at the tree to carve (the L/Shift key, the Pad's punch button or a pad bumper held). Crouched in a fern she is hidden. A catch: Pell walks her back, no heart lost, cuts kept. The fourth tree is up a climb. Her five warnings: POKEY. DON'T SIT. M. / DON'T EAT. M. / NO TEA. BE RUDE. M. / HANDS OFF THE SILK. M. / DON'T STOP TO LOOK. LOVE, M. The music is the composer's World 5 sound at the sneak pace on a roll that quotes the lament (her lullaby in the minor), clarinet lead. What she carved is saved with the game (`sloth_w5_carved`); 5-6 reads it with `carvingsForPokey()` (meecaCarved.ts). Not done yet: her journal page (the journal's pages are Pokey's moves with Pokey demos), a Heartbloom theme of her own and the blanket stinger.
  - The cakes: tempting trap pickups that make Pokey sleepy. The game tracks whether you ate any in World 5. Eat none and the Queen says "Nobody has ever not eaten the cake" (plus a badge); eat some and she says a line like "You ate the cake, darling. Everyone does."
  - Enemies (Matt chose all of them, reuse elsewhere where they fit): the jumping spider (made); the Dangler (orb weaver drops on its thread; brushing the thread drops it); the Butler (waistcoated spider offering cakes); the Seamstress (weaves silk sheets, wraps you if you stand still); the Orchid Mantis (disguised as an orchid, snaps); Dozer moths (sleepy powder slows Pokey). Style: the Queen's household (Butler, Seamstress) polite-creepy tea-party (waistcoats, lace); wild ones painted nature; all with big readable eyes.
  - Concept art approved (Matt liked all of it: https://claude.ai/artifact/VA9J1DoYfS7eBZKQXYjiMk; raw art in the private HF repo mshaffe111/slothadv-w5art). Mix and match: both backdrop takes per mood alternate stage to stage; the arena table take for the fight, the webs take for the intro and tea scene; both prop takes mixed as placed; extra creature takes become variants (a head butler for 5-9, Dangler colours). Reuse the art elsewhere where it fits (Matt: "it feels like a waste" otherwise).
  - Reuse (Matt chose all four): story cutscenes from the World 5 art; a creature journal (a field-guide page per creature, unlocked on first meeting, with a note from Dot, for every world); creatures in other worlds (moths in 8, Dangler in 6, Mantis in 7); the world map tile, rotating menu art and pictures on stage-start goal cards.
  - The boss arena is the old council's long table (ten chairs and Iron-Claw's head chair), which the tea scene then uses.
- **Difficulty climbs from World 5 (Matt, 2026-10-26).** From World 5 on, stages and bosses can be harder, and nothing has to be beaten on the first try; players are experienced by then. Still never unfair: every opening must be makeable by a real thumb, every hit must have a readable warning, and every spot must be reachable. Worlds 1-4 keep the first-timer standard (reach + 0.8 s react + 0.6 s hit). The QA gate follows the same split (tools/playtesters/STATUS.md on the QA branch).
- **Bosses.** Every weak-spot opening needs a clear tell, and must stay open at least as long as the time to reach it plus 0.8 s to react plus 0.6 s to hit (bossFair.test.ts, sovereignEngine.test.ts). Fight length depends on the player's skill; there is no minimum for bosses.

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
| **World 2 hand-built stages** (2-1 to 2-9) | `src/game/w2Stages.ts`, art in `w2PropsData.ts`. Puzzle rooms from the kit (2026-10-28, `W2_PUZZLES`): reed cages hung on pulleys, lifted out by river stones in a counter-basket (2-3, and in 2-8's rising basins; `lift.cage`, no punch breaks them), the ferry's raft behind a sluice (2-2, river `raft`), the court bell that opens the court gate and calls the guards to look (2-9). Tests `w2Stages.test.ts`, `w2Puzzles.test.ts` |
| World 3 art and decor | `src/game/w3Art.ts`, `w3PropsData.ts` |
| **Dot's netting flight** (`4-D`, the extra stage after 4-5 that opens 4-6; Dot is the player, on Pokey's controls: flick = flap, tap or thumb held = hover) | `src/game/dotFlightStage.ts` (the stage and its flight check), `dotFlight.ts` (her rules), `dotFlightRun.ts` (in the engine), `dotFlightArt.ts`; slotted by `extraStages.ts` with the New stages switch; tests `dotFlight*.test.ts` |
| **Meeca's stage** (`5-M`, after 5-5 that opens 5-6; you play Meeca on Pokey's physics with no fighting and no Dot) | `src/game/meecaStage.ts` (the stage), `meecaPlay.ts` (the column, the look-backs, the carving, the catch, the card and the ending), `meecaArt.ts` (all its drawing), `meecaLines.ts` (every word), `meecaCarved.ts` (the save record and 5-6's hook); slotted by `extraStages.ts`; tests `meecaStage.test.ts`, `meecaPlay.test.ts`, `meecaReal.test.ts` (played by `meecaBot.ts`) |
| **The puzzle kit** (phase 1, 2026-10-28: one shared piece type for hand-built stages and the generator; a room is data: pieces placed on a platform id + 0..1 along its top + offset, wired like switches) | rules `src/game/puzzleKit.ts` (items acorn/stone/pinecone/cake, sources, weight plates, gates, levers, counterweight basket + lift, the lure beetle, the reset signpost; throws, reach, wires), run `puzzlePlay.ts` (engine.ts `kitControls`/`stepKit`: a tap by a piece uses it; carrying, flick up throws up, flick toward throws forward, tap sets down, no jump/climb/swing, slower walk), camera `puzzleCamera.ts` (leans 35% to the active part, never below 0.75x, pans to a far gate the first time it opens), art `puzzleArt.ts` + `puzzleAtlasData.ts` (packed by `tools/art/w5puzzle/packkit.py`), the symbolic room check `puzzleCheck.ts` (called by `levelCheck.ts`), Easy's silent stuck sparkle (`STUCK`; the `stuck` hook is where Flicker's hints go). Test room `kitStage.ts`: `?autostart=1&level=kit`. Tests `puzzleKit.test.ts`, `puzzleCheck.test.ts`. Phase 2 (not built): light and mirrors, flowing liquid, water level, seesaw, noise and silk lures, trap chairs |
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
| Dot's netting flight (nectar flowers, dew, silk, puffs, thorns, the letter, netting pieces) and its four sunrise paintings | `src/assets/props/dot-props.webp`, `src/assets/backdrops/dot-*.webp` | `dotPropsData.ts`; cut and packed by `tools/art/dotstage/` |
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
| **World 5, ready but unused** (2026-10-26) | jumping spider clips `spiderAnimData.ts` + `spider-anim.webp`; the Tarantula Queen's boss clips `queenAnimData.ts` + `queen-anim.webp` (idle, skitter, silk shot / leg slam / web net each with a tell of 0.9-1.1 s, hurt, stunned, defeat, "do sit" and pouring tea; `QUEEN_MOVES`); Meeca carving on a trunk `meecaCarveData.ts` + `characters/meeca-carve.webp`; pose sheets (idle, move, tell, attack, hurt, defeated) for the five new creatures `<dangler\|butler\|seamstress\|mantis\|dozer>AtlasData.ts` + `*-poses.webp` (not `-atlas`, so `creatureArt.ts` does not bundle them yet). Meeca's stage (2026-10-26): Lieutenant Pell `pellAnimData.ts` + `pell-anim.webp` (march with the lantern, idle, turn / lookHold / turnBack = the guards' tell, catch, offering the blanket; from his story cels); the General's soldiers `soldierAnimData.ts` + `soldier-anim.webp` (sloths in olive like Pell but plainer and bigger; variants `_a` dark fur, `_b` cinnamon fur with a bedroll; march, idle, turn / hold / back); the blanket and Meeca wrapped in it `meecaBlanketData.ts` + `characters/meeca-blanket.webp`. Test `w5Anims.test.ts`; tools `tools/art/w5/` (`make_pell_specs.py`, `pack_blanket.py`). No stage or fight uses them yet. |
| Golden snake (the game's snake) | `goldSnake.ts` (`?snake=classic` brings back the old one) |
| Enemy brains and timings | `predatorAI.ts` (`TURTLE`, `GUARD`, …) |
| Bosses / guardians | `bossDefs.ts`, `bossArt.ts`, `<boss>Sprite.ts`; boss sheets in `reference/boss-sheets/` |
| The Sky Sovereign's fight (4-10): rock pillars, screech, gust, her ending | rules `sovereignFight.ts`, moves in `bossDefs.ts` (SOVEREIGN), look `sovereignArt.ts`, reach timing for Matt's opening rule `sovereignReach.ts`, tests `sovereign.test.ts`; her two screech poses are packed into her atlas by `tools/art/w4/sovscreech/pack_screech.py` |

### Medals (the Trophy Room)

| What | Where |
|---|---|
| **The medals** (rebuilt 2026-10-26 for a longer game: 100 medals, 38 bronze at 20 points, 35 silver at 40, 26 gold at 90 and one platinum at 500, exactly 5,000 points; nothing about finishing quickly; the coats unlock at 250, 750, 1,500 and 2,500 points) | rules and counters `src/game/badges.ts` (the save record `badgeStore.ts`; tests `badges.test.ts` check the 5,000), the screen `src/components/TrophyRoom.tsx` (points, platinum on top, medals by tier with progress bars), the medal `BadgeMedal.tsx`, the toast `BadgeToast.tsx` |
| What the engine reports for them | `buildStats` in `engine.ts` (swings, punches, kicks, friends freed, difficulty, Dot on Quiet, 4-D scratches, 5-M catches) and `W5Play.tally` in `w5Play.ts` (cakes avoided, orchid petals, silk shaken off) |
| The painted medals (four tier medallions and 33 emblems, Qwen-Image with the style model, job medals-0) | `src/assets/medals/medals.webp` + `src/game/medalAtlasData.ts`; made by `tools/art/medals/` (`make_spec.py`, `medals_gpu.py`, `picks.json`, `pack.py`) |

### Story

| What | Where |
|---|---|
| Prologue, worlds, bosses, memories, finale | `src/game/storyIntro.ts`, `storyWorlds.ts`, `storyBosses.ts`, `storyChapters.ts`, `storyMemories.ts`, `storyFinale.ts` |
| Voice and character rules (read before writing any line) | `reference/VOICE.md` |
| The rewrite, world by world | `reference/STORY-REWRITE.md` |
| The story review Matt approved (2026-10-27): what was fixed, and the drafts still to build with the stages (Flicker, Meeca's escape, World 10 together) | `reference/STORY-REVIEW-2026-10-27.md` |
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
  - World 5 creature models (2026-10-26, 800 steps on every concept take, one variant word per take family): `mshaffe111/<dangler|butler|seamstress|mantis|dozer>-qwen-lora`, triggers `danglerspider`, `butlerspider`, `seamstressspider`, `orchidmantis`, `dozermoth` (spec `tools/art/gen/spec-w5creatures-train.json`). If a model repo is missing, the LoRA is in the bucket `mshaffe111/w5-xfer` under `train/<name>/`.
- **Data**: `mshaffe111/<name>-lora-data`, `char-sheets`, `slothadv-style-data`, `slothadv-motion-data`.
- **Generated output**: `mshaffe111/slothadv-gen`, with `stills/` and `clips/<name>.zip`.
- **When the connector cannot write the repos** (its token is read-only plus jobs): jobs mount the private bucket `mshaffe111/w5-xfer` read-write at `/out` and write there; `hf_fs attach` brings a picture back byte for byte, and `tools/art/w5/unpack_carrier.py` unpacks files packed into a carrier PNG (`tools/art/w5/w5cpu.py`). The World 5 clips (`clips/w5-*.zip`), starts and edits live in that bucket.
- **Jobs**: run on `ostris/aitoolkit:latest` with flavor `rtx-pro-6000`, about $2.75/h. The overnight run of 2026-10-24/25 cost about $69; 90 creature clips cost about $14.
- **Lessons learned:**
  - The motion model fixed walks and runs in place.
  - Slithers mostly fail.
  - Grey-skinned creatures need the tight background key.
  - Don't enable `cache_latents_to_disk` when training I2V.
- **Waiting on Matt** (from the gallery):
  - which new creature designs to keep;
  - which leaf glide (plain leaf or parachute);
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

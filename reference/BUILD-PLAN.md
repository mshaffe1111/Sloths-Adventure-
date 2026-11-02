# Build plan (R-7): three at a time, best value first

Matt, 2026-11-01: "figure out how to get the most out of our builds... using our continuous improvement, how to ensure that we're
efficient with tokens... trying to match things that work in tandem... start marking off some small WebGL stuff, some small story
pieces, and working towards finishing the levels in ways that are the most efficient and we get the bang for the buck."

Written by the roadmap keeper, 2026-11-01 9:27 PM ET (time from `TZ=America/New_York date`), from reference/ROADMAP.md (item numbers below). The lead decides who starts.

## One page for Matt

**How it runs.** Three helpers at a time, in three lanes. Each lane owns its own files, so the three never edit the same file and merge
cleanly:
- **Lane A: drawing and engine.** The GPU change, then the engine-side fixes and the bosses. It is the only lane that touches
  `src/game/engine.ts`.
- **Lane B: story and menus.** Story files, `App.tsx`, the menu and Satchel screens.
- **Lane C: worlds and tuning.** The World 9 and 10 builds, the test bot and difficulty numbers, the stage files.

A wave is about two days. At the end of each wave the lead merges, runs the full gate once, and you get one test link.

**The first three waves (about 6 days):**

| Wave | Lane A (drawing/engine) | Lane B (story/menus) | Lane C (worlds/tuning) | Your call before it starts |
|---|---|---|---|---|
| 1 | GPU stage 0 (R-3.1), then the 3-9 and 1-9 locked-exit fix (R-6.1, R-6.2) | Story plumbing starts (R-4.1) | Fix the difficulty measure (R-5.1), then World 9 starts (R-2.1) | Ship icons B-E? (R-149.1). The Crocus Rex picture list (R-149.6) |
| 2 | GPU stages 1 and 2 after your phone check of stage 0 (R-3.2, R-3.3); the Crocus Rex panel by icons-painted (R-1.1, ~$0.50) | Story plumbing finishes (R-4.1) | World 9 finishes (R-2.1); the difficulty numbers re-run with the fixed bot (R-5.2) | The story picture list for Act I (R-149.6) |
| 3 | GPU stage 3: Pokey and creatures (R-3.4) | Menus A clears the clipped menus and the win card (R-6.6..R-6.13, R-6.21) | World 10 starts (R-2.6) | The 45 Dot lines (R-149.2); World 10's rain (R-149.4) |

**After that, as a list (each about two days, lanes side by side):** GPU stage 4, then 5-6 and the APK heat run · the Satchel's ledger
and Wanted posters (menus B) · the unfair-spot fixes from the bot's list, a world at a time · the story text, Act I, then II, then III ·
the Magma Drake, then bosses 6-8, then the General · 9-2's canopy, the hold move, 10-3/10-4, 10-8's Clockwork Gate · the difficulty
curve and checkpoints · sound · controls · the Play Store pieces · the story's one release.

**Total, honestly:** about 220 helper-days of work on the list. At three at a time that is **about 10 to 13 weeks**, or **8 to 10
weeks** if Worlds 1-5 onto the new generator (about 3 weeks of one helper) waits until after launch. Your "at least a month" is short;
I'd plan on two to three months. The things that shorten it: fewer extras before launch (4-D rethink, Under the Ruins, the swimming
stage, art round 2), and a fourth lane on days your tokens allow.

**Hugging Face:** $72, with about $15 kept back. This plan spends about $41 to $55 through World 10 and both final bosses, in your order
(Crocus Rex, story pictures, Worlds 9-10). Art round 2 (~$62) does not fit; I recommend it stays held and only its $0 pieces go ahead.

## 1. The lanes and the files each owns

Checked in the code (2026-11-01). Owning a file means no other lane edits it during the wave; a lane that needs a line in another lane's
file asks that lane's helper to add it.

| Lane | Owns | Why it can't share |
|---|---|---|
| A drawing/engine | `src/game/engine.ts` (8,210 lines; the draw loop, the 3-9 ring code, Dot tips), new `src/game/gpu/`, `package.json`, `paintedBackdrops.ts`, `stageBackdrops.ts`, `groundArt.ts`, `bossPlay.ts`, `bossDefs.ts`, `lair*.ts`, `dotTips.ts`, `dotLinesData.ts` | engine.ts is where the GPU change, the locked-exit fix, Dot's box and the hold move all land |
| B story/menus | `src/game/story*.ts`, `src/App.tsx` (imports WORLD_GATE and the story panels), `src/storyReader.tsx`, `src/components/StoryPlayer.tsx`, `src/components/satchel/`, `Satchel.tsx`, `WorldMap.tsx`, `TitleSettings.tsx`, `HowToPlay.tsx`, `menuParts.tsx` | the story slot and the Satchel's Scenes list share App.tsx and storyReader.tsx |
| C worlds/tuning | `src/game/gen2/worlds/w9*`, `w10*`, `src/game/gen2/seeds.ts` (one file for every world's rolls), `tools/inspect/` (bands.ts, the bots), stage files of the world being fixed | seeds.ts is shared by Worlds 9 and 10, so their curations run one after the other in this lane, never side by side |

## 2. Order by value per day (and what unblocks what)

Value is to Matt and the player: high = he sees it or it blocks the goal; medium = it makes a finished world better; low = nice later.

| Item | Value | Size | Unblocks | Effort |
|---|---|---|---|---|
| R-5.1 fix the bands measure (Easy reads harder than Normal) | high (every difficulty number depends on it) | S | R-5.2, R-5.4, R-2.1's band fixes | medium |
| R-3.1 GPU stage 0 | high (the frame rate; the APK) | S | R-3.2..R-3.7 | high |
| R-4.1 story plumbing | high (the whole rewrite) | L | R-4.2..R-4.6, R-4.3 (menus B) | high |
| R-2.1 World 9 build | high (the goal) | L | R-2.2..R-2.5, R-1.9 Drake, story Act III | medium (curation and re-runs; high only for a new mechanic) |
| R-6.1, R-6.2 locked exits 3-9 / 1-9 | high (a live bug Matt raised) | S+S | - | medium |
| R-1.1 Crocus Rex panel | high (Matt saw it) | S | R-1.2's walk | low (icons-painted, method hf-art.md) |
| R-5.2 bands re-run with the fixed bot | high | M | R-5.4, the fairness batches | low (written steps) |
| R-3.2, R-3.3 GPU stages 1-2 | high | S+S | R-3.6 | high |
| R-6.6..R-6.13, R-6.21 menu clip groups, win card | medium (seen on every map visit) | 9 x S, one helper | clipknown to zero | medium (menus A) |
| R-2.6 World 10 build | high | L | R-2.7..R-2.12, R-1.10 | medium |
| R-3.4, R-3.5 GPU stages 3-4 | high | M+M | R-3.6 | high |
| R-4.3, R-4.4, R-6.10, R-6.14..R-6.16 ledger, Wanted, Scenes, Satchel text | medium | L + 5 x S, one helper | the story release | medium (menus B) |
| R-5.9..R-5.21 unfair spots (bot §6) | high (first-timers quit there) | 13 items, mostly S | R-5.4 | medium, batched per world |
| R-4.2 story text, by act | high | L | R-4.6, R-4.8 | medium |
| R-1.9 Magma Drake | high (goal) | L | - | high |
| R-1.6 bosses 6-8 | high (goal) | L | - | high, after R-149.5 |
| R-2.4 9-2 canopy, R-2.7 hold, R-2.8 10-8, R-2.10 10-3/10-6 | high (goal) | L each | R-1.10 needs R-2.7 | high |
| R-145 sound (R-145.1..R-145.5) | medium (the weakest category) | ~4 days | R-145.6 Matt's listen | medium |
| R-146 controls | medium | ~6 days | - | high (engine input) |
| R-147 Play Store pieces | high at the end | ~6 days | launch | medium |
| R-142 Worlds 1-5 onto gen2 | medium (fixes look-alikes in finished worlds) | ~3 weeks | - | high |
| R-141.1 4-D, R-141.6 Under the Ruins, R-5.22 swimming stage | low before launch | L each | - | high |

Unblockers first: the bands measure before any tuning; story plumbing before any text swap; GPU stage 0 before the rest; World 9 before
World 10 (seeds.ts); the hold move before the General; the stranded branches triaged (R-143) before anything rebuilds what they hold
(w5-rebuild before R-142.1, gen2-ascent before the climbs R-141.5 and R-2.9, hazard-anim before any new water art).

## 3. Spending tokens well: what our own history says

What wasted tokens before (CONTINUOUS-IMPROVEMENT.md D1-D24, the 0.9.3 debrief, methods/, HELPERS.md):

| Waste | Where it happened | What every wave does about it |
|---|---|---|
| Work on a stale base | D23 (icons shot on a branch without the release); W8-10 branches 365-1,400 commits behind (WIP-10) | Every helper starts from the latest main and merges main again before its report; the lead runs `git merge-base --is-ancestor` at each check-in (LEAD-PLAYBOOK 8). World 9 and 10 merge main FIRST, one branch at a time |
| A broken measuring tool | D15/D21 (the bot's lastX: every bot number suspect); bands.ts reads Easy harder than Normal | R-5.1 fixes the measure and adds a self-test before any re-run or tuning (stage-fix.md step 0, "check the ruler") |
| Approving from a list or the happy path, then redoing | D1, D18/D19 (journal lines; a gate testing the wrong builder) | Show-first sheets in fresh/old/finished saves, upright and sideways; acceptance waits on the shared gate |
| Art redos | hf-backdrops2: 4 redos, $59, the most of any helper | Matt approves each picture list first (R-149.6); the absolute floor (floor.py) before showing; small HF jobs go to icons-painted (strong, still alive, knows the method) |
| Two helpers in the same files | iconRegister breaches when two branches met (0.9.3 gate) | The lanes above |
| Long test runs repeated | the full suite takes 25+ min here | While working: only the touched tests and `--rolls 50`; the full suite once at the end; the lead's gate once per wave (LEAD-PLAYBOOK 7) |
| Fresh helpers re-learning | every new brief costs a read-in | Reuse strong helpers that are alive (HELPERS.md): menus A for the menu lane, menus B for the Satchel pieces, icons-painted for icons and small HF jobs. A fresh helper only where none fits (GPU, story plumbing) |
| Wrong clock | D20 (a helper stopped an hour early) | Every brief and check-in uses `TZ=America/New_York date` |

**Cheap enough to batch into one helper:** all eight menu clip groups and the win card (menus A, one run); the Satchel text duplicates
with the ledger (menus B); the bot's unfair spots one world at a time (one helper per batch, not one per stage); the stranded-branch
triage (R-143) as one read-only report, which the roadmap keeper can write without a new helper; the $0 art steps (R-144.2, the W8 moon,
the cutter pass) with the next icons-painted job.

## 4. Waves in detail

### Wave 1 (days 1-2)
- **A, fresh helper, high:** R-3.1 GPU stage 0 (pixi pinned, a WebGL 2 canvas under the 2D one, the loop drives both, context loss).
  When it's on the test link for Matt's phones, the same helper (it already owns engine.ts) does R-6.1 + R-6.2, the 3-9 / 1-9 locked
  exits, from the ticket (new test first). Method: perf-measure.md, gates.md.
- **B, fresh helper, high:** R-4.1 story plumbing (the before-a-stage slot at 17 stages, WORLD_MID moves, AFTER_BOSS, old-save unlocks,
  retries as a list). No text changes yet. Method: player-text.md, in-play-text.md.
- **C, bot-fix if alive (strong), else fresh, medium:** R-5.1 bands measure with a self-test, then R-2.1 World 9 (merge main into
  w9-pieces first, then the clean full suite, curation, bands). Method: stage-fix.md; qa-notes/w9/NEXT.md.
- **Keeper, no helper:** R-143 triage report of the 8 stranded branches (what each holds, superseded or not).
- **Why these fit:** three different file sets (engine/gpu, story/App, gen2 w9/seeds/tools), each an unblocker.
- **HF:** $0.
- **Matt decides before:** R-149.1 icons B-E; R-149.6 the Crocus Rex picture.

### Wave 2 (days 3-4)
- **A, same helper, high:** R-3.2 + R-3.3 GPU stages 1-2 (backdrops and ground) after Matt's phone check of stage 0. Side job for
  **icons-painted (reused, low):** R-1.1 the Crocus Rex panel (an asset swap in its own folder; no engine edits) plus the $0 art steps.
- **B, same helper, high:** R-4.1 finishes; R-4.10 the review's fixes that live in the same files.
- **C, same helper, medium/low:** R-2.1 finishes; R-5.2 the 20 bands re-run with the fixed bot (written steps, low).
- **Why these fit:** A stays on drawing files, B on story files, C on World 9 and tools.
- **HF:** ~$0.50 (the panel).
- **Matt decides before:** the Act I story picture list (R-149.6); plays World 9 on the test link.

### Wave 3 (days 5-6)
- **A, same helper, high:** R-3.4 GPU stage 3 (Pokey and the creatures as atlas textures, the hurt flash as a tint).
- **B, menus A (reused, strong), medium:** R-6.6..R-6.9, R-6.11..R-6.13 (World Map, Settings, How to Play, New Game, About) and R-6.21
  (the win card and the italic font). Goal: clipknown down to the Satchel group only.
- **C, same helper as W9 (it knows the curation), medium:** R-2.6 World 10 (merge main into w10-pieces first; seeds.ts is now free).
- **Why these fit:** engine/gpu vs. menu components vs. World 10 files.
- **HF:** World 9 stand-ins if Matt approved them (cap $12), and Act I story pictures (~$5).
- **Matt decides before:** the 45 Dot lines (R-149.2); World 10's rain (R-149.4).

### Waves 4 and on (about two days each; lanes side by side)
4. A: GPU stage 4 (R-3.5). B: menus B, the ledger and Wanted posters, the Scenes list, the Satchel text duplicates (R-4.3, R-4.4,
   R-6.10, R-6.14..R-6.16). C: the bot's unfair spots, Worlds 1-2 (R-5.9..R-5.12, R-5.16, R-5.17). HF: W9 stand-ins if not yet.
5. A: GPU stages 5-6 and the APK heat run on the three phones (R-3.6, R-3.7). B: story text Act I, W1-3 (R-4.2, R-6.17, R-4.11).
   C: unfair spots Worlds 4, 6, 7 (R-5.13..R-5.15, R-5.18..R-5.21) and the checkpoint audit (R-5.5). Start the Play closed test now if
   Matt has the account set up (R-147.1): 14 days run alongside.
6. A: the Magma Drake (R-1.9, ~$3-5). B: story text Act II, W4-6. C: 9-2 the canopy (R-2.4, ~$3).
7. A: bosses 6-8 (R-1.6, after Matt's coaching lines R-149.5). B: story text Act III, W7-10, and the scripted talks (R-4.5).
   C: the hold move prototype for Matt, then 10-3 and 10-4, 10-6 (R-2.7, R-2.10, ~$1).
8. A: the General (R-1.10, ~$3-5). B: the finale chapters (R-4.6), decisions 2/3/5 (R-4.9). C: 10-8 Clockwork Gate (R-2.8, ~$2), the
   10-2/4/5 climbs (R-2.9) with gen2-ascent's start.
9. A: every defeat scene frame by frame (R-1.2), Thornbark (R-1.11), 6-10 fixes (R-1.7, R-1.8). B: story pictures wired (R-4.7) and the
   playable chase (R-4.8). C: the difficulty curve and the fall rule (R-5.4, R-5.6), 10-9 (R-2.12).
10. A: sound (R-145.1..R-145.5, src/audio only) then Matt's listen. B: Play Store listing and insets (R-147.3, R-147.4). C: World 7-8 old
    climbs (R-141.5), 8-1 variety, World 5 leftovers (R-141.2..R-141.4).
11. A: controls (R-146). B: the story's one release (all acts on the test link, then live). C: Matt's phone passes, fixes from them.
Later or after launch, Matt's call: Worlds 1-5 onto gen2 (R-142), 4-D (R-141.1), Under the Ruins (R-141.6), the swimming stage
(R-5.22), art round 2 (R-144.1).

## 5. Hugging Face per wave ($72 total, ~$15 reserve, ~$57 to spend; Matt approves each list first)

| Wave | Spend | Running total | What |
|---|---|---|---|
| 1 | $0 | $0 | - |
| 2 | ~$0.50 | $0.50 | Crocus Rex panel (R-1.1) |
| 3 | ~$5-17 | $5.50-17.50 | Act I story pictures (~$5); World 9 stand-ins (cap $12) |
| 4-5 | ~$3-8 | $8.50-25.50 | Act II story pictures |
| 6 | ~$6-8 | $14.50-33.50 | Drake (~$3-5), 9-2 canopy (~$3) |
| 7 | ~$3-8 | $17.50-41.50 | Act III story pictures, hold poses (~$1) |
| 8 | ~$5-7 | $22.50-48.50 | General (~$3-5), 10-8 (~$2) |
| 9-11 | ~$0-6 | $22.50-54.50 | W10 stand-ins (cap $6), redo reserve |

High end ~$54.50, inside the ~$57 to spend. Story pictures are the swing (~$10-20 for ~30); if they run high, World 10's stand-ins
are the first cut. Art round 2 (~$62) cannot fit.

## 6. Fresh or reused helper, per lane

| Lane | Wave 1-3 | Why |
|---|---|---|
| A | fresh (GPU needs a new read-in either way); icons-painted reused for the Crocus panel | no strong engine/GPU helper is alive |
| B | fresh for the story plumbing; menus A reused in wave 3, menus B in wave 4 | Matt: "the ones that work the best, we need to keep" |
| C | bot-fix reused if alive (strong on the bot and bands), the same helper keeps World 9 then World 10 | one curator for both worlds learns seeds.ts once |

Every brief adds: "your first-time gate result and redo count go on reference/HELPERS.md; strong helpers get the follow-on work."

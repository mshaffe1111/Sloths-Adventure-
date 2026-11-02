# Build plan (R-7, tiers from R-10): launch first, best value first

Matt, 2026-11-01 (R-7): "figure out how to get the most out of our builds... using our continuous improvement, how to ensure that
we're efficient with tokens... trying to match things that work in tandem... start marking off some small WebGL stuff, some small
story pieces, and working towards finishing the levels in ways that are the most efficient and we get the bang for the buck."

Matt, 2026-11-01 (R-10): "prioritize the biggest things and what brings the most and what are niceties. And not everything needs to
be completed in order to complete the game. Things can go in after the launch, but we need to make sure that the things that give us
the biggest bang for the buck is done first."

Written by the roadmap keeper, 2026-11-01 9:40 PM ET (time from `TZ=America/New_York date`), from reference/ROADMAP.md, whose Tier
column (T1 launch, T2 high value before launch, T3 after launch, Matt's call) drives the order below. The lead decides who starts.

## One page for Matt

**What launch needs (T1), in one breath:** Worlds 9 and 10 built and fair; the Drake and the General finished, every boss fair and
coached; the new story words and scenes start to finish; the bot's unfair spots fixed and Normal rising world by world; the blocking
bugs (3-9 wall, Crocus panel, floating props, the clipped and too-small menu buttons); the GPU change, so the app runs smooth on your
three phones; and the Play Store gates (signing, 16 KB pages, data safety, the listing, the 14-day closed test).

**What I recommend adding before launch (T2, about 35 helper-days):** the three quick sound fixes (effects too hot, no ambience on
phones, the iPhone music fallback); liana let-go and touch lag; painted lairs for bosses 6-8; the bot modes that let us measure puzzle
and fight stages; the checkpoint audit and the fall rule; the cheap menu and Dot-box polish; rescuing the paid work stranded on old
branches; World 1's code-drawn ledges painted (the first thing a player sees); World 5's padding.

**What waits for 1.1 (T3):** Worlds 1-5 onto the new generator (the biggest cut, about 21 helper-days), the 4-D rethink, Under the
Ruins, a swimming stage, art round 2, the playable story moments, the 276 unused art pieces, the iPhone number, tilt, the garden hub.

**Your four calls that size the launch (one at a time):** the 9-2 canopy and 10-8 Clockwork Gate now or 1.1 (R-149.15, about 8 days);
the ledger and Wanted posters now or 1.1 (R-149.16, about 4 days); bosses 6-8 third phases now or 1.1 (R-149.17, about 4 days); the
decided controls still wanted (R-149.14).

**How long, honestly:**

| | Helper-days | At three at a time |
|---|---|---|
| T1, what launch needs | about 89 | |
| + the T2 I recommend | about 35 | |
| **= to launch** | **about 124** | **about 42 working days: 6 weeks if helpers run every day, 8-9 at five days a week** |
| + if you say yes to all four calls above | + about 17 | + about 1 week |
| T3, after launch (1.1 and on) | about 50 + art round 2 | about 3-4 weeks, plus about $62 of art |

Your review on the phone runs alongside, and the Play closed test (14 days, 12 testers) must start by about week 4 so it doesn't hold the
launch. Sizes count every small item as half a day, so small fixes batched into one helper come in a little under this.

**How it runs.** Three helpers at a time in three lanes that never edit the same files; a wave is 2-4 days; at the end of each wave the
lead merges, runs the full gate once, and you get one test link.

| Wave | Lane A (drawing/engine) | Lane B (story/menus) | Lane C (worlds/tuning) | Your call before it starts |
|---|---|---|---|---|
| 1 | T1 GPU stage 0 (R-3.1), then the 3-9 / 1-9 locked exits (R-6.1, R-6.2) | T1 story plumbing (R-4.1) | T1 the difficulty measure (R-5.1), then World 9 (R-2.1, R-143.5 first) | Icons B-E (R-149.1); the Crocus picture (R-149.6) |
| 2 | T1 GPU stages 1-2 after your phone check (R-3.2, R-3.3); T1 Crocus panel by icons-painted (R-1.1) | T1 plumbing finishes (R-4.1) | T1 World 9 finishes; T1 bands re-run (R-5.2) | Act I picture list (R-149.6); the four calls above |
| 3 | T1 GPU stage 3 and the big sheets split (R-3.4, R-3.12) | T1 menus A: clipped menus and small buttons (R-6.6..R-6.13); T2 win card (R-6.21) | T1 World 10 starts (R-2.6) | The 45 Dot lines (R-149.2); World 10's rain (R-149.4) |

## 1. The lanes and the files each owns

Checked in the code (2026-11-01). Owning a file means no other lane edits it during the wave; a lane that needs a line in another lane's
file asks that lane's helper to add it.

| Lane | Owns | Why it can't share |
|---|---|---|
| A drawing/engine | `src/game/engine.ts` (8,210 lines; the draw loop, the 3-9 ring code, Dot tips), new `src/game/gpu/`, `package.json`, `paintedBackdrops.ts`, `stageBackdrops.ts`, `groundArt.ts`, `bossPlay.ts`, `bossDefs.ts`, `lair*.ts`, `dotTips.ts`, `dotLinesData.ts` | engine.ts is where the GPU change, the locked-exit fix, Dot's box and the hold move all land |
| B story/menus | `src/game/story*.ts`, `src/App.tsx` (imports WORLD_GATE and the story panels), `src/storyReader.tsx`, `src/components/StoryPlayer.tsx`, `src/components/satchel/`, `Satchel.tsx`, `WorldMap.tsx`, `TitleSettings.tsx`, `HowToPlay.tsx`, `menuParts.tsx` | the story slot and the Satchel's Scenes list share App.tsx and storyReader.tsx |
| C worlds/tuning | `src/game/gen2/worlds/w9*`, `w10*`, `src/game/gen2/seeds.ts` (one file for every world's rolls), `tools/inspect/` (bands.ts, the bots), stage files of the world being fixed | seeds.ts is shared by Worlds 9 and 10, so their curations run one after the other in this lane, never side by side |

## 2. The order: tier first, then value per day

Inside each tier, unblockers go first. The chain: the bands measure (R-5.1) before the bands re-run (R-5.2) before any tuning (R-5.4);
story plumbing (R-4.1) before any text swap (R-4.2); GPU stage 0 (R-3.1) before stages 1-6; World 9 before World 10 (one seeds.ts);
the hold move (R-2.7, R-146.5) before the General (R-1.10); gen2-ascent's World 9 commits (R-143.5) before World 9's curation.

| Tier | Items, in order | Helper-days | Effort |
|---|---|---|---|
| T1 unblockers | R-5.1, R-3.1, R-4.1, R-143.5, R-2.1, R-5.2 | about 12 | high for GPU and plumbing; medium for curation; low for the re-run |
| T1 blocking bugs and fairness | R-6.1, R-6.2, R-1.1, R-6.3, R-6.4, R-5.7..R-5.21 (not R-5.17), R-1.7, R-2.12 | about 16 | medium, batched a world at a time |
| T1 menus and Play | R-6.6..R-6.13, R-147.2..R-147.7 | about 10 | medium (menus A) |
| T1 GPU | R-3.2..R-3.7, R-3.12 | about 6.5 | high |
| T1 worlds and bosses | R-2.2, R-2.3, R-2.6, R-2.7, R-2.10, R-2.13, R-146.5, R-1.2, R-1.6, R-1.9, R-1.10 | about 23.5 | high |
| T1 story | R-4.2, R-4.4, R-4.6, R-4.7, R-4.9..R-4.13, R-6.17 | about 13.5 | medium for words; high for R-4.12 |
| T1 tuning | R-5.4, R-5.8 | about 4.5 | high |
| T2 recommended | R-145.1..R-145.3, R-146.1, R-146.2, R-146.4, R-1.14, R-1.8, R-5.3, R-5.5, R-5.6, R-6.14..R-6.16, R-6.18, R-6.19, R-6.21, R-6.23, R-143.1..R-143.4, R-143.6..R-143.8, R-144.2, R-144.7, R-141.2, R-148.3, R-148.4, R-148.11 | about 35 | mostly medium |
| T2 if time | R-1.3, R-1.4, R-1.11, R-2.5, R-2.9, R-2.11, R-3.9, R-3.11, R-4.5, R-5.17, R-6.5, R-6.20, R-6.25, R-141.5, R-145.4, R-145.5, R-148.5, R-148.6 | about 30.5 | |
| Matt's call | R-1.15, R-2.4, R-2.8, R-4.3, R-146.6 | about 17.5 | high |
| Checks before work (keeper and lead) | T2: R-1.5, R-4.14, R-6.24, R-148.8, R-148.9; T3: R-144.8. Process, T1, in progress: R-7, R-10, R-148.1, R-148.2, R-148.12 | about 5 | low |
| T3 after launch | R-142 (all), R-141.1, R-141.3, R-141.4, R-141.6, R-5.22, R-4.8, R-144.1, R-144.3..R-144.6, R-1.12, R-3.8, R-3.10, R-3.13, R-6.22, R-146.3, R-148.7, R-148.10 | about 50 | |

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

Waves 1-3 are in the one-page table above: every item in them is T1 except the win card, which rides with menus A's run.

### Wave 1
- **A, fresh helper, high:** R-3.1 GPU stage 0. While Matt checks it on his phones, the same helper (it owns engine.ts this wave) does
  R-6.1 + R-6.2 from the ticket, new test first. Method: perf-measure.md, gates.md.
- **B, fresh helper, high:** R-4.1 story plumbing; no text changes yet. Method: player-text.md, in-play-text.md.
- **C, bot-fix if alive (strong), else fresh, medium:** R-5.1 bands measure with a self-test; R-143.5 (compare gen2-ascent's World 9
  commits with w9-pieces); then R-2.1 World 9 (merge main into w9-pieces first). Method: stage-fix.md; qa-notes/w9/NEXT.md.
- **Keeper, no helper:** the stranded-branch triage is written (reference/qa-reports/stranded-branches-2026-11-01.md).
- **HF:** $0.

### Wave 2
- **A:** R-3.2 + R-3.3 GPU stages 1-2 after the phone check. **icons-painted (reused, low):** R-1.1 Crocus panel (~$0.50), plus the $0
  art steps (R-144.2) if it has room.
- **B:** R-4.1 finishes; R-4.10 the review's fixes in the same files.
- **C:** R-2.1 finishes; R-5.2 the 20 bands re-run (low).

### Wave 3
- **A:** R-3.4 GPU stage 3 and R-3.12 (split the 13 sheets over 4096 px: the GPU can't take them).
- **B, menus A (reused, strong):** R-6.6..R-6.13 and R-6.21. clipknown down to the Satchel group.
- **C, same curator:** R-2.6 World 10 (merge main into w10-pieces first).

### Waves 4 to launch (T1 first; T2 where a lane waits)
4. A: T1 GPU stage 4 (R-3.5). B: T1 story text Act I, W1-3 (R-4.2, R-4.11, R-6.17). C: T1 unfair spots Worlds 1-2 (R-5.9..R-5.12,
   R-5.16) and the goal gate (R-5.7).
5. A: T1 GPU stages 5-6 and the APK heat run (R-3.6, R-3.7). B: T1 story text Act II, W4-6. C: T1 unfair spots Worlds 4, 6, 7
   (R-5.13..R-5.15, R-5.18..R-5.21), the punch rule (R-5.8). **Start the Play closed test now** (R-147.1, once R-149.9 is answered).
6. A: T1 the Magma Drake (R-1.9). B: T1 story text Act III, W7-10, decisions 2/3/5 (R-4.9), upright framing (R-4.13). C: T1 the hold
   move prototype for Matt, then 10-3, 10-4, 10-6 (R-146.5, R-2.7, R-2.10).
7. A: T1 bosses 6-8 and Thornbark coaching, intro-bar hits, the defeat-scene walk (R-1.6, R-1.7, R-1.2). B: T1 replies, Flicker,
   bubbles (R-4.12), the Scenes list (R-4.4), story pictures wired (R-4.7). C: T1 10-9 (R-2.12), World 9-10 Dot lines (R-2.3, R-2.13),
   World 9 stand-ins painted (R-2.2).
8. A: T1 the General (R-1.10). B: T1 finale chapters (R-4.6). C: T1 the difficulty curve (R-5.4); T2 the fall rule (R-5.6).
9. A: T1 floating props (R-6.3), the 2-8 reset post (R-6.4); T2 sound's three quick fixes (R-145.1..R-145.3). B: T1 Play pieces:
   16 KB, foldables, insets (R-147.3), the listing (R-147.4), accessibility (R-147.6). C: T1 the low-memory store-build test (R-147.7);
   fixes from Matt's phone passes (R-1.13, R-2.14, R-141.7, R-141.8).
10. **Launch candidate:** the story's one release live; the closed test done; submit (R-147.5 forms at submit).

**T2 slots** (where a lane waits on Matt's phone check or a decision): painted lairs 6-8 (R-1.14) and the noisy 6-10 sprite (R-1.8) in
lane A; menus B's repeats and the Dot box (R-6.14..R-6.16, R-6.18, R-6.19, R-6.23) in lane B after Act I; the bot modes (R-5.3), the
checkpoint audit (R-5.5), the stranded-branch rescues (R-143.1..R-143.4, R-143.6..R-143.8) and World 5's padding (R-141.2) in lane C;
the controls (R-146.1, R-146.2, R-146.4) in lane A after the General; World 1's ledges (R-144.7) with the next HF art list.

**After launch (1.1 and on, T3):** Worlds 1-5 onto gen2 (R-142), the 4-D rethink (R-141.1), Under the Ruins (R-141.6), the swimming
stage (R-5.22), the playable story moments (R-4.8), art round 2 (R-144.1), the unused art (R-144.6), the rest of the T3 list in §2.

## 5. Hugging Face per wave ($72 total, about $15 reserve, about $57 to spend; Matt approves each list first)

| Wave | Spend | Running total | What |
|---|---|---|---|
| 1 | $0 | $0 | - |
| 2 | about $0.50 | $0.50 | Crocus Rex panel (R-1.1) |
| 3-5 | about $5-15 | $5.50-15.50 | Act I and II story pictures (R-4.7) |
| 6 | about $3-5 | $8.50-20.50 | Drake (R-1.9) |
| 7 | about $5-17 | $13.50-37.50 | Act III pictures; World 9 stand-ins (cap $12) |
| 8 | about $4-6 | $17.50-43.50 | General (R-1.10), hold poses (about $1) |
| 9 | about $1-6 | $18.50-49.50 | World 10 stand-ins (cap $6), World 1 ledges (T2) |
| Matt's yes to R-149.15 | about $5 | up to $54.50 | 9-2 canopy (about $3), 10-8 (about $2) |

Inside the about $57 to spend. Art round 2 (about $62) does not fit and stays T3.

## 6. Fresh or reused helper, per lane

| Lane | Wave 1-3 | Why |
|---|---|---|
| A | fresh (GPU needs a new read-in either way); icons-painted reused for the Crocus panel | no strong engine/GPU helper is alive |
| B | fresh for the story plumbing; menus A reused in wave 3, menus B in wave 4 | Matt: "the ones that work the best, we need to keep" |
| C | bot-fix reused if alive (strong on the bot and bands), the same helper keeps World 9 then World 10 | one curator for both worlds learns seeds.ts once |

Every brief adds: "your first-time gate result and redo count go on reference/HELPERS.md; strong helpers get the follow-on work."

# Build plan (R-7), in Matt's tiers (R-10) and values (R-11)

Matt, 2026-11-01 (R-7): "figure out how to get the most out of our builds... using our continuous improvement, how to ensure that
we're efficient with tokens... trying to match things that work in tandem... start marking off some small WebGL stuff, some small
story pieces, and working towards finishing the levels in ways that are the most efficient and we get the bang for the buck."

Matt (R-10): "prioritize the biggest things and what brings the most and what are niceties... Things can go in after the launch, but
we need to make sure that the things that give us the biggest bang for the buck is done first." His tier names: **Day 1** (in at
launch), **Important** (wanted, not required for launch), **Parking lot** (after launch).

Matt (R-11): "mark what we get out of it, how long it would take estimated, and the value it brings A to F."

Matt decided (2026-11-01): Worlds 1-5 onto the new generator is Parking lot; before launch Worlds 1-5 get only their unfair spots and
bugs fixed.

Written by the roadmap keeper, 2026-11-01 9:49 PM ET (time from `TZ=America/New_York date`), from reference/ROADMAP.md (its Tier, What
we get, Days and Value columns; §2's tables are generated from them). The lead decides who starts.

## One page for Matt

**Day 1, what launch needs:** Worlds 9 and 10 built and fair; the Drake and the General finished, every boss fair and coached; the new
story words and scenes start to finish; the bot's unfair spots fixed (Worlds 1-5 included) and Normal rising world by world; the
blocking bugs (3-9 wall, Crocus panel, floating props, the clipped and too-small menu buttons); the GPU change, so the app runs smooth
on your three phones; and the Play Store gates (signing, 16 KB pages, data safety, the listing, the 14-day closed test). Every Day 1
item is graded A.

**Important, the ones I recommend before launch (about 32 helper-days):** every B item plus the half-day C items. The three quick
sound fixes and a calm/tense tune per world; liana let-go and touch lag; painted lairs for bosses 6-8; checkpoints and the fall rule;
Dot's tips on narrow phones; the menu and Satchel repeats; rescuing the paid work on old branches; World 1's code-drawn ledges painted;
World 5's padding. The rest of Important (about 40 days: bot modes, Dot-line keying, the climbs still on the old builder, the download
size, ...) goes in if a lane has room.

**Parking lot (after launch, about 53 helper-days):** Worlds 1-5 onto the new generator (your call), the 4-D rethink, Under the Ruins,
a swimming stage, the playable story moments, art round 2, the 276 unused art pieces, the iPhone number, tilt, the garden hub.

**Your calls that size the launch (one at a time):** the 9-2 canopy and 10-8 Clockwork Gate now or 1.1 (R-149.15, about 8 days); the
ledger and Wanted posters now or 1.1 (R-149.16, about 4 days); bosses 6-8 third phases now or 1.1 (R-149.17, about 4 days); the
playable story moments (R-4.8, graded B but Parking lot by your decision 4: still after launch?); the decided controls (R-149.14).

**How long, honestly (helper-days are R-11's estimates):**

| | Helper-days | At three at a time |
|---|---|---|
| Day 1 | about 95 | |
| + the Important I recommend | about 32 | |
| **= to launch** | **about 127** | **about 42 working days: 6 weeks if helpers run every day, about 8.5 at five days a week** |
| + if you say yes to all three sizing calls | + about 16 | + about 1 week |
| Important if time | about 40 | about 2 weeks more |
| Parking lot (1.1 and on) | about 53, plus art round 2 | about 3-4 weeks, plus about $62 of art |

Your review on the phone runs alongside; the Play closed test (14 days, 12 testers) must start by about week 4 so it doesn't hold the
launch.

**How it runs.** Three helpers at a time in three lanes that never edit the same files; a wave is 2-4 days; at the end of each wave the
lead merges, runs the full gate once, and you get one test link.

| Wave | Lane A (drawing/engine) | Lane B (story/menus) | Lane C (worlds/tuning) | Your call before it starts |
|---|---|---|---|---|
| 1 | Day 1 GPU stage 0 (R-3.1), then the 3-9 / 1-9 locked exits (R-6.1, R-6.2) | Day 1 story plumbing (R-4.1) | Day 1 the difficulty measure (R-5.1), then World 9 (R-2.1, R-143.5 first) | Icons B-E (R-149.1); the Crocus picture (R-149.6) |
| 2 | Day 1 GPU stages 1-2 after your phone check (R-3.2, R-3.3); Day 1 Crocus panel by icons-painted (R-1.1) | Day 1 plumbing finishes (R-4.1) | Day 1 World 9 finishes; Day 1 bands re-run (R-5.2) | Act I picture list (R-149.6); R-149.15..R-149.17 |
| 3 | Day 1 GPU stage 3 and the big sheets split (R-3.4, R-3.12) | Day 1 menus A: clipped menus and small buttons (R-6.6..R-6.13); Important win card (R-6.21) | Day 1 World 10 starts (R-2.6) | The 45 Dot lines (R-149.2); World 10's rain (R-149.4) |

## 1. The lanes and the files each owns

Checked in the code (2026-11-01). Owning a file means no other lane edits it during the wave; a lane that needs a line in another lane's
file asks that lane's helper to add it.

| Lane | Owns | Why it can't share |
|---|---|---|
| A drawing/engine | `src/game/engine.ts` (8,210 lines; the draw loop, the 3-9 ring code, Dot tips), new `src/game/gpu/`, `package.json`, `paintedBackdrops.ts`, `stageBackdrops.ts`, `groundArt.ts`, `bossPlay.ts`, `bossDefs.ts`, `lair*.ts`, `dotTips.ts`, `dotLinesData.ts` | engine.ts is where the GPU change, the locked-exit fix, Dot's box and the hold move all land |
| B story/menus | `src/game/story*.ts`, `src/App.tsx` (imports WORLD_GATE and the story panels), `src/storyReader.tsx`, `src/components/StoryPlayer.tsx`, `src/components/satchel/`, `Satchel.tsx`, `WorldMap.tsx`, `TitleSettings.tsx`, `HowToPlay.tsx`, `menuParts.tsx` | the story slot and the Satchel's Scenes list share App.tsx and storyReader.tsx |
| C worlds/tuning | `src/game/gen2/worlds/w9*`, `w10*`, `src/game/gen2/seeds.ts` (one file for every world's rolls), `tools/inspect/` (bands.ts, the bots), stage files of the world being fixed | seeds.ts is shared by Worlds 9 and 10, so their curations run one after the other in this lane, never side by side |


## 2. The order: Day 1 first, then value per day

Dependencies come first, whatever the value: the bands measure (R-5.1) before the bands re-run (R-5.2) before any tuning (R-5.4); story
plumbing (R-4.1) before any text swap (R-4.2); GPU stage 0 (R-3.1) before stages 1-6; World 9 before World 10 (one seeds.ts); the hold
move (R-2.7, R-146.5) before the General (R-1.10); gen2-ascent's World 9 commits (R-143.5) before World 9's curation. Inside those
limits each lane takes its next item by value per day (A=6 ... F=1, divided by days), as listed below. The lists are generated from
ROADMAP.md's columns, so they can't drift from it.

### Lane A: drawing, engine, bosses, sound, controls

| Group | Item | What we get | Value | Days |
|---|---|---|---|---|
| Day 1 | R-1.1 | Crocus Rex's defeat looks painted like the rest of the scene | A | 0.5 |
| Day 1 | R-1.7 | No cheap hit in the dark before the World 6 fight starts | A | 0.5 |
| Day 1 | R-3.1 | The base for smooth play on every phone | A | 0.5 |
| Day 1 | R-3.2 | Skies and backdrops cost almost nothing to draw | A | 0.5 |
| Day 1 | R-3.3 | The ground costs almost nothing to draw | A | 0.5 |
| Day 1 | R-3.6 | Proof the game holds its frame rate | A | 0.5 |
| Day 1 | R-3.7 | The store app runs smooth and cool on real phones | A | 0.5 |
| Day 1 | R-6.1 | 3-9's ring can't be skipped; Dot explains the shut wall | A | 0.5 |
| Day 1 | R-6.2 | 1-9's locked exit explained every time | A | 0.5 |
| Day 1 | R-6.4 | Picking up a stone never resets the room | A | 0.5 |
| Day 1 | R-1.2 | No broken frame left in any boss ending | A | 1 |
| Day 1 | R-146.5 | The hold move feels fair before World 10 needs it | A | 1.5 |
| Day 1 | R-3.12 | The big animation sheets load on the GPU on every phone | A | 1.5 |
| Day 1 | R-1.6 | Players learn each late boss's tells instead of guessing | A | 2 |
| Day 1 | R-3.4 | Pokey and the creatures stop dragging the frame rate | A | 2 |
| Day 1 | R-3.5 | Props and particles stop dragging the frame rate | A | 2 |
| Day 1 | R-6.3 | No props floating in the air or sunk in the soil | A | 2 |
| Day 1 | R-1.10 | The last fight flows straight into the ending | A | 5 |
| Day 1 | R-1.9 | World 9's boss becomes a real climax fight | A | 5 |
| Important (recommended) | R-145.2 | Phones hear the jungle around them | B | 0.5 |
| Important (recommended) | R-6.19 | Dot's tips fit on narrow phones | B | 0.5 |
| Important (recommended) | R-145.3 | iPhone players hear the music | C | 0.5 |
| Important (recommended) | R-3.11 | A little smoother on slow phones | C | 0.5 |
| Important (recommended) | R-6.5 | High basket throws land | C | 0.5 |
| Important (recommended) | R-145.1 | Effects sit under the music instead of blasting | B | 1 |
| Important (recommended) | R-146.1 | Letting go of a liana does what the thumb meant | B | 1.5 |
| Important (recommended) | R-145.5 | Music changes with the moment, not one loop a world | B | 2 |
| Important (recommended) | R-146.2 | Touches respond on mid-range phones | B | 2 |
| Important (recommended) | R-6.18 | Dot's tips never cover the way ahead | B | 2 |
| Important (recommended) | R-1.14 | Bosses 6-8 fight in painted arenas, not code-drawn ones | B | 3 |
| Important (if time) | R-1.5 | Proof the Queen's council table shows; the Sovereign's screech looks right | D | 0.5 |
| Important (if time) | R-1.3 | The first boss fight looks as painted as its boss | C | 1.5 |
| Important (if time) | R-1.4 | World 3's boss arena matches its painted boss | C | 1.5 |
| Important (if time) | R-1.8 | The World 6 boss looks clean and its weapon fits the story | C | 1.5 |
| Important (if time) | R-145.4 | Effects sound like one family | C | 1.5 |
| Important (if time) | R-146.4 | Proof every stage plays on every control setting | C | 1.5 |
| Important (if time) | R-1.11 | The secret boss looks and talks as finished as the rest | D | 1.5 |
| Important (if time) | R-6.23 | Approved Dot lines can't silently revert | C | 2 |
| Important (if time) | R-3.9 | A smaller download and a faster first start on old phones | B | 4 |
| Matt's call | R-146.6 | The control changes Matt already chose | C | 2 |
| Matt's call | R-1.15 | Bosses 6-8 each end with a fresh story-born phase | B | 4 |
| Parking lot | R-1.12 | Every boss intro and defeat on its own painted arena | D | 0.5 |
| Parking lot | R-3.13 | World 8 a little lighter to draw | D | 0.5 |
| Parking lot | R-3.8 | We know how iPhones run it | D | 0.5 |
| Parking lot | R-146.3 | Better tester recordings | E | 0.5 |
| Parking lot | R-3.10 | Oversized art can't sneak back in | E | 0.5 |
| Parking lot | R-6.22 | Smoother slide and flip animation | E | 0.5 |

### Lane B: story, menus, Play Store

| Group | Item | What we get | Value | Days |
|---|---|---|---|---|
| Day 1 | R-4.4 | Players can replay every new scene | A | 0.5 |
| Day 1 | R-4.9 | Matt's story calls show up in the game | A | 0.5 |
| Day 1 | R-6.10 | Satchel buttons big enough for a thumb | A | 0.5 |
| Day 1 | R-6.11 | How to Play usable sideways | A | 0.5 |
| Day 1 | R-6.12 | The New Game question reads in full | A | 0.5 |
| Day 1 | R-6.13 | About page tidy, buttons big enough | A | 0.5 |
| Day 1 | R-6.6 | Stage and boss names read in full on the map | A | 0.5 |
| Day 1 | R-6.7 | Map nodes clear of the notch sideways | A | 0.5 |
| Day 1 | R-6.8 | Settings buttons big enough for a thumb | A | 0.5 |
| Day 1 | R-6.9 | World names read in full | A | 0.5 |
| Day 1 | R-4.11 | Two stage cards match the new story | B | 0.5 |
| Day 1 | R-6.17 | A story line that doesn't repeat | B | 0.5 |
| Day 1 | R-147.7 | The app survives cheap phones offline | A | 1 |
| Day 1 | R-147.3 | The app passes Play's device checks | A | 1.5 |
| Day 1 | R-147.4 | A store page that sells the game | A | 1.5 |
| Day 1 | R-147.6 | Easier to use for everyone; Play's quality bar | A | 1.5 |
| Day 1 | R-4.10 | No story line contradicts the game or spoils a twist | A | 1.5 |
| Day 1 | R-4.13 | Nobody cut off at the waist in upright scenes | A | 1.5 |
| Day 1 | R-4.12 | Conversations play in order; Flicker is seen when he talks | A | 2 |
| Day 1 | R-4.6 | The ending lands and matches every ending card | A | 2 |
| Day 1 | R-4.7 | The scenes that need a real picture get one | A | 2 |
| Day 1 | R-4.1 | The new story can be wired in at all | A | 4 |
| Day 1 | R-4.2 | The story stops being skipped: the new words in every world | A | 5 |
| Important (recommended) | R-6.14 | Dot never repeats herself word for word | C | 0.5 |
| Important (recommended) | R-6.15 | Every find has its own name | C | 0.5 |
| Important (recommended) | R-6.21 | A calmer win card; real italics | C | 0.5 |
| Important (recommended) | R-6.25 | Painted icons everywhere, no flat ones | B | 1.5 |
| Important (if time) | R-6.16 | Every medal reads differently | D | 0.5 |
| Important (if time) | R-6.20 | Meeca drawn clear of the wall in room 5 | D | 0.5 |
| Important (if time) | R-6.24 | Small Build 1 leftovers checked and closed | D | 0.5 |
| Important (if time) | R-4.14 | Old story asks either covered or closed | E | 0.5 |
| Important (if time) | R-4.5 | Characters talk during play at key stages | C | 1.5 |
| Matt's call | R-4.3 | Two collections that give the story's hunt a reason to explore | B | 4 |
| Parking lot | R-4.8 | Story moments the player plays, not just watches | B | 5 |

### Lane C: worlds, tuning, stranded branches

| Group | Item | What we get | Value | Days |
|---|---|---|---|---|
| Day 1 | R-2.13 | World 10's new tricks are taught | A | 0.5 |
| Day 1 | R-2.2 | World 9 looks painted, no stand-ins | A | 0.5 |
| Day 1 | R-2.3 | World 9's new tricks are taught | A | 0.5 |
| Day 1 | R-5.1 | Difficulty numbers we can trust | A | 0.5 |
| Day 1 | R-5.10 | 1-7's eagle can be answered | A | 0.5 |
| Day 1 | R-5.11 | 1-8's snake and fall are taught; the jump is survivable | A | 0.5 |
| Day 1 | R-5.13 | World 4's rocks are warned about first | A | 0.5 |
| Day 1 | R-5.14 | 4-2's jumps are survivable on Normal | A | 0.5 |
| Day 1 | R-5.18 | 6-7's eagle can be answered | A | 0.5 |
| Day 1 | R-5.19 | 6-8 and 6-9's animals are taught first | A | 0.5 |
| Day 1 | R-5.21 | 7-9 stops eating lives; first meetings are safe | A | 0.5 |
| Day 1 | R-5.8 | No hit before the punch is taught | A | 0.5 |
| Day 1 | R-5.9 | 2-9 stops hitting kids before Dot warns them | A | 0.5 |
| Day 1 | R-143.5 | World 9 keeps its last changes | A | 1.5 |
| Day 1 | R-2.12 | 10-9 stops killing first-timers 20+ times | A | 1.5 |
| Day 1 | R-5.15 | 4-7 and 4-4 stop eating lives; 4-7 lasts 2 minutes | A | 1.5 |
| Day 1 | R-5.16 | 2-5 and 2-8 stop drowning Easy players | A | 1.5 |
| Day 1 | R-5.2 | A true picture of how hard every stage is | A | 1.5 |
| Day 1 | R-5.20 | 7-4's slide never strands a player | A | 1.5 |
| Day 1 | R-5.7 | Every goal reachable on a natural first run | A | 1.5 |
| Day 1 | R-2.10 | World 10 has all its stages | A | 2 |
| Day 1 | R-2.7 | The last world's new move, taught and fair | A | 4 |
| Day 1 | R-2.1 | World 9 plays fair, varied, and on the new builder | A | 5 |
| Day 1 | R-2.6 | World 10 plays fair, varied, and on the new builder | A | 5 |
| Day 1 | R-5.4 | Normal finally gets harder each world; Easy stays easy | A | 5 |
| Important (recommended) | R-5.6 | Falls hurt fairly: short ones sting, long ones cost a life | B | 0.5 |
| Important (recommended) | R-143.2 | Paid deep-water art used | C | 0.5 |
| Important (recommended) | R-143.3 | Three small art fixes already made | C | 0.5 |
| Important (recommended) | R-143.4 | Maybe no flat backdrop at a stage's start | C | 0.5 |
| Important (recommended) | R-143.8 | World 5's Normal work feeds the tuning | C | 0.5 |
| Important (recommended) | R-143.6 | One fewer stale branch | E | 0.5 |
| Important (recommended) | R-143.7 | One fewer stale branch | E | 0.5 |
| Important (recommended) | R-141.2 | World 5 less padded | B | 1.5 |
| Important (recommended) | R-143.1 | Paid World 5 work not thrown away | B | 1.5 |
| Important (recommended) | R-5.5 | Checkpoints where a player expects them | B | 2 |
| Important (if time) | R-2.11 | World 10's far sky isn't stretched | D | 0.5 |
| Important (if time) | R-2.5 | 9-7's climb matches the rebuilt world | C | 1.5 |
| Important (if time) | R-5.17 | 2-4 stops dragging on | C | 1.5 |
| Important (if time) | R-141.5 | 7-2, 7-8 and 8-7's climbs match the new builder | C | 4 |
| Important (if time) | R-2.9 | World 10's climbs match the rebuilt world | C | 4 |
| Important (if time) | R-5.3 | We can measure puzzle and fight stages too | C | 4 |
| Matt's call | R-2.4 | A showpiece canopy stage in World 9 | B | 4 |
| Matt's call | R-2.8 | A showpiece clockwork stage in World 10 | B | 4 |
| Parking lot | R-141.3 | One more puzzle room in World 5 | D | 1.5 |
| Parking lot | R-141.4 | 8-1 replays a little more differently | D | 1.5 |
| Parking lot | R-142.6 | 6-5 and 6-9 stop looking alike | D | 1.5 |
| Parking lot | R-5.22 | A stage where slow Pokey is suddenly fast | C | 2 |
| Parking lot | R-141.1 | Dot's flight becomes a showpiece | C | 4 |
| Parking lot | R-142.1 | World 5 on the new builder: more variety, less padding | C | 4 |
| Parking lot | R-142.2 | World 1 replays differently each time | C | 4 |
| Parking lot | R-142.3 | World 2 replays differently each time | C | 4 |
| Parking lot | R-142.4 | World 3 replays differently each time | C | 4 |
| Parking lot | R-142.5 | World 4 replays differently; unused W4 art placed | C | 4 |
| Parking lot | R-141.6 | A secret level for players who hunt | C | 5 |

### Art (icons-painted or the HF helper, side jobs)

| Group | Item | What we get | Value | Days |
|---|---|---|---|---|
| Important (recommended) | R-144.2 | Two backdrops no longer too bright | C | 0.5 |
| Important (recommended) | R-144.7 | World 1, the first world, looks fully painted | B | 4 |
| Parking lot | R-144.3 | World 1's middle trees stop repeating | D | 0.5 |
| Parking lot | R-144.8 | Old art asks checked and closed | E | 0.5 |
| Parking lot | R-144.4 | Small motion in cutscenes; the W8 moon in frame | D | 2 |
| Parking lot | R-144.5 | More varied props in W4, W6, W7 | D | 2 |
| Parking lot | R-144.6 | Paid art finally on screen | C | 4 |

### Keeper and lead (no helper)

| Group | Item | What we get | Value | Days |
|---|---|---|---|---|
| Day 1 | R-148.1 | Nothing open gets lost | B | 0.5 |
| Important (recommended) | R-148.11 | No stale doc misleads a helper | E | 0.5 |
| Important (recommended) | R-148.3 | Unfair spots caught before Matt sees them | B | 1.5 |
| Important (if time) | R-148.2 | The next keeper starts from a written method | E | 0.5 |
| Important (if time) | R-148.4 | No more judging work on a stale branch | E | 0.5 |
| Important (if time) | R-148.9 | Old ticks proven or reopened | E | 0.5 |
| Important (if time) | R-148.6 | Dot's box can't cover the jump again | C | 1.5 |
| Important (if time) | R-148.8 | World 8's gates checked | E | 1 |
| Important (if time) | R-148.5 | Cheaper, faster helpers | E | 1.5 |
| Parking lot | R-148.10 | Old asks proven or reopened | E | 0.5 |
| Parking lot | R-148.7 | Dead stretches can't creep back | E | 0.5 |

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

Waves 1-3 are in the one-page table above: every item in them is Day 1 except the win card, which rides with menus A's run. Inside a wave, dependencies come first (§2's chain); after that, each lane takes its next item by value per day (§2's tables).

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

### Waves 4 to launch (Day 1 first; Important where a lane waits)
4. A: Day 1 GPU stage 4 (R-3.5). B: Day 1 story text Act I, W1-3 (R-4.2, R-4.11, R-6.17). C: Day 1 unfair spots Worlds 1-2 (R-5.9..R-5.12,
   R-5.16) and the goal gate (R-5.7).
5. A: Day 1 GPU stages 5-6 and the APK heat run (R-3.6, R-3.7). B: Day 1 story text Act II, W4-6. C: Day 1 unfair spots Worlds 4, 6, 7
   (R-5.13..R-5.15, R-5.18..R-5.21), the punch rule (R-5.8). **Start the Play closed test now** (R-147.1, once R-149.9 is answered).
6. A: Day 1 the Magma Drake (R-1.9). B: Day 1 story text Act III, W7-10, decisions 2/3/5 (R-4.9), upright framing (R-4.13). C: Day 1 the hold
   move prototype for Matt, then 10-3, 10-4, 10-6 (R-146.5, R-2.7, R-2.10).
7. A: Day 1 bosses 6-8 and Thornbark coaching, intro-bar hits, the defeat-scene walk (R-1.6, R-1.7, R-1.2). B: Day 1 replies, Flicker,
   bubbles (R-4.12), the Scenes list (R-4.4), story pictures wired (R-4.7). C: Day 1 10-9 (R-2.12), World 9-10 Dot lines (R-2.3, R-2.13),
   World 9 stand-ins painted (R-2.2).
8. A: Day 1 the General (R-1.10). B: Day 1 finale chapters (R-4.6). C: Day 1 the difficulty curve (R-5.4); Important the fall rule (R-5.6).
9. A: Day 1 floating props (R-6.3), the 2-8 reset post (R-6.4); Important sound's three quick fixes (R-145.1..R-145.3). B: Day 1 Play pieces:
   16 KB, foldables, insets (R-147.3), the listing (R-147.4), accessibility (R-147.6). C: Day 1 the low-memory store-build test (R-147.7);
   fixes from Matt's phone passes (R-1.13, R-2.14, R-141.7, R-141.8).
10. **Launch candidate:** the story's one release live; the closed test done; submit (R-147.5 forms at submit).

**Important slots** (the recommended set, taken by value per day where a lane waits on Matt's phone check or a decision): in lane A the
sound fixes (R-145.2, R-145.3, R-145.1, R-145.5), narrow-phone tips (R-6.19), liana let-go and touch lag (R-146.1, R-146.2), the Dot box
(R-6.18), painted lairs 6-8 (R-1.14); in lane B the win card, Satchel and menu repeats (R-6.21, R-6.14, R-6.15) and the painted icons
(R-6.25, if Matt says yes); in lane C the fall rule (R-5.6), the stranded-branch rescues (R-143.1..R-143.4, R-143.8), World 5's padding
(R-141.2), checkpoints (R-5.5); World 1's ledges (R-144.7) with the next HF art list. Important-if-time (bot modes R-5.3, Dot-line
keying R-6.23, the noisy 6-10 sprite R-1.8, the old-builder climbs, the download size R-3.9) only when a lane runs dry.

**After launch (1.1 and on, Parking lot):** Worlds 1-5 onto gen2 (R-142), the 4-D rethink (R-141.1), Under the Ruins (R-141.6), the swimming
stage (R-5.22), the playable story moments (R-4.8), art round 2 (R-144.1), the unused art (R-144.6), the rest of the Parking lot list in §2.

## 5. Hugging Face per wave ($72 total, about $15 reserve, about $57 to spend; Matt approves each list first)

| Wave | Spend | Running total | What |
|---|---|---|---|
| 1 | $0 | $0 | - |
| 2 | about $0.50 | $0.50 | Crocus Rex panel (R-1.1) |
| 3-5 | about $5-15 | $5.50-15.50 | Act I and II story pictures (R-4.7) |
| 6 | about $3-5 | $8.50-20.50 | Drake (R-1.9) |
| 7 | about $5-17 | $13.50-37.50 | Act III pictures; World 9 stand-ins (cap $12) |
| 8 | about $4-6 | $17.50-43.50 | General (R-1.10), hold poses (about $1) |
| 9 | about $1-6 | $18.50-49.50 | World 10 stand-ins (cap $6), World 1 ledges (Important) |
| Matt's yes to R-149.15 | about $5 | up to $54.50 | 9-2 canopy (about $3), 10-8 (about $2) |

Inside the about $57 to spend. Art round 2 (about $62) does not fit and stays Parking lot.

## 6. Fresh or reused helper, per lane

| Lane | Wave 1-3 | Why |
|---|---|---|
| A | fresh (GPU needs a new read-in either way); icons-painted reused for the Crocus panel | no strong engine/GPU helper is alive |
| B | fresh for the story plumbing; menus A reused in wave 3, menus B in wave 4 | Matt: "the ones that work the best, we need to keep" |
| C | bot-fix reused if alive (strong on the bot and bands), the same helper keeps World 9 then World 10 | one curator for both worlds learns seeds.ts once |

Every brief adds: "your first-time gate result and redo count go on reference/HELPERS.md; strong helpers get the follow-on work."

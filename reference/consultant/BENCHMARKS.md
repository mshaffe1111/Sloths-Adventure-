# Benchmarks: how strong platformers handle feel, stages and help

Deep pass, 7 November 2026. This is the companion to REVIEW.md. It replaces my short first version from earlier today.

## How to read this

Every claim carries a label:

- **[Source]**: the developer, the publisher, the game's own published code or text, or a platform's own documentation.
- **[Study]**: a peer-reviewed or academic paper (or its authors' own slides or poster).
- **[Secondary]**: a reputable wiki, review or analysis, not the developer.
- **[Folklore]**: widely repeated with no solid source. Don't build on these.
- **[My calc]**: my own arithmetic or simulation from the team's FEEL.md numbers, or from a game's published constants.

Times are in milliseconds (ms) so that 30 fps and 60 fps games compare directly. Pokey's game runs at 30 frames a second, so one of its ticks is 33 ms. Most benchmark games run at 60, where one frame is 16.7 ms.

**What I couldn't reach.** From this machine, WebFetch can't open Mario Wiki, TASVideos, RayWiki, Sonic Retro, Game Developer or several university sites. Where it mattered, I read those pages through a cloud page reader instead and say so. A few numbers I quoted in pass 1 could not be re-verified. Each is marked where it appears.

---

## 0. Pokey next to Celeste, in the same units

Celeste's movement constants are published in its open `Player.cs`. I simulated its jump at 60 fps from those constants, and Pokey's at 30 fps from FEEL.md. My Pokey simulation reproduces every FEEL.md figure exactly (97.8 / 97.2 / 61.7 / 10.3 px apex; 331.6 px best touch double jump), so the two columns are like for like. Body units: Pokey's box is 44 × 48 px. Madeline's hitbox is 8 × 11 px [Source: `Player.cs`, `new Hitbox(8, 11, -4, -11)`].

| Quantity | Pokey (1-1) | Celeste | Label |
|---|---|---|---|
| Full jump height | 97.8 px held, 97.2 px touch = **2.0 body heights** | 28.5 px = **2.6 body heights** | [My calc] both |
| Shortest jump you can choose | touch **97.2 px (99% of full)**; keyboard tap 10.3 px (11%); on-screen Pad 61.7 px (63%) | tap **5.2 px (18%)**; 50 ms hold 37%; 100 ms 61%; 150 ms 74% | [My calc] |
| Time in the air, full jump | 0.63–0.67 s | 0.68 s | [My calc] |
| Time to the top of the jump | about 0.33 s | about 0.36 s | [My calc] |
| Running jump length | 175–184 px = **4 body widths** | 64 px = **8 body widths** | [My calc] |
| Top run speed | 276 px/s on average (alternates 285 / 268) = **6.3 body widths a second** | 90 px/s = **11 body widths a second** | FEEL.md; [Source] `MaxRun = 90f` |
| Air steering ÷ ground acceleration | 1700 ÷ 2600 = **0.65** | `AirMult = .65f` = **0.65** | FEEL.md; [Source] |
| Gravity falling ÷ rising | 2500 ÷ 1900 = 1.32 | 1.0 (900 both ways) | FEEL.md; [Source] |
| Lighter gravity near the top while jump is held | ×0.72 while vertical speed < 90 px/s (on touch it rarely applies, because the 220 ms automatic hold has ended by then) | ×0.5 while vertical speed < 40 px/s: `mult = (Math.Abs(Speed.Y) < HalfGravThreshold && Input.Jump.Check) ? .5f : 1f` | FEEL.md; [Source] |
| Holding jump keeps take-off speed | no (a release cut instead) | yes, for up to 0.2 s: `VarJumpTime = .2f`, `Speed.Y = Math.Min(Speed.Y, varJumpSpeed)` | [Source] |
| Coyote time (jump after leaving a ledge) | **214 ms** Normal 1-1, **248 ms** Easy, 134 ms Normal from stage 25 | **100 ms**: `JumpGraceTime = 0.1f` | FEEL.md; [Source] |
| Jump buffer (press just before landing) | 233 ms Normal 1-1, 300 ms Easy, 133 ms from stage 25 | not in the published file (it lives in an unpublished Input class); "about 80 ms" is [Folklore] | FEEL.md; [Source] for the missing value |
| Top fall speed | 950 px/s = 20 body heights a second | 160 px/s (240 holding down) = 15 (22) body heights a second | FEEL.md; [Source] `MaxFall`, `FastMaxFall` |

Sources: Celeste `Player.cs`, [GitHub (NoelFB/Celeste)](https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs) [Source]; Maddy Thorson's design thread on the same tricks (coyote time, buffering, halved gravity at the peak, corner correction), [thread reader](https://threadreaderapp.com/thread/1238338574220546049.html) [Source].

**Takeaways**
- Pokey's air control is set exactly where Celeste's is.
- His jump takes about as long as Madeline's.
- He is "chunkier": half as many body widths per jump and per second. That suits a sloth and a small phone screen.
- The big difference is choice. Celeste's jump can be anything from 18% to 100% of full height. Pokey's touch jump is 99–100%.

---

## 1. Coyote time and jump buffer in named games

| Game | Coyote | Buffer | Label |
|---|---|---|---|
| Celeste | 100 ms (`JumpGraceTime = 0.1f`) | unverified | [Source] |
| Hollow Knight | "about 5 frames" (83 ms), no buffer | — | [Folklore]: blog posts, no datamine found, e.g. [gamejuice](https://gamejuice.pages.dev/articles/coyote-time-input-buffering) |
| Hollow Knight: Silksong | "6 frames", "5-frame buffer" | — | [Folklore], same kind of source |
| Super Meat Boy | quoted anywhere from 3 to 7 frames | "8 frames" | [Folklore]: the sources disagree with each other |
| GMTK Platformer Toolkit (teaching tool) | users report trying 0–0.2 s | 0.2–0.4 s | [Secondary]: user comments only, [itch.io](https://gmtk.itch.io/platformer-toolkit/comments?before=228); no published defaults found |
| Common tutorial advice | "6 frames" (100 ms) | 66–100 ms | [Folklore], e.g. [kindatechnical](https://kindatechnical.com/game-development/input-buffering-coyote-time-and-game-feel.html) |
| **Pokey** | **214 / 248 / 134 ms** | **233 / 300 / 133 ms** (+ the input layer keeps a press 167–233 ms) | FEEL.md §5 |

**Why Pokey's are bigger, and why that's defensible** [My calc from cited figures]. A phone adds delay that a gamepad doesn't:
- Touch-to-screen latency was measured at 55 ms on an iPhone 5 and 114–123 ms on the best Androids of 2013 [Secondary: Agawi TouchMarks, via [iMore](https://www.imore.com/iphone-5-touchscreen-latency-measured-found-be-25-times-faster-closest-android-device) and [New Atlas](https://newatlas.com/smartphone-screen-latency/29144/)]. A 2022 study measured 26 current phones with a robot, [Behavior Research Methods](https://pubmed.ncbi.nlm.nih.gov/35953659/) [Study]; I couldn't get its per-phone numbers.
- Pokey's jump flick needs at least 26 px of travel at 0.6 px/ms, which is at least 43 ms of finger movement (FEEL.md §7).
- The game reads input at the next 33 ms tick.

Add those up and a jump that starts as the finger starts moving at the lip registers roughly 2–5 ticks late. A 214 ms coyote window (6 ticks) mostly pays that back. Side effect: a late coyote jump carries Pokey further (REVIEW.md finding 2).

---

## 2. Variable jump height and apex hang

| Game | How height is chosen | Numbers | Label |
|---|---|---|---|
| Celeste | hold to keep take-off speed for up to 0.2 s; release early for a short hop; half gravity at the top while held | 18–100% of full height (table in §0) | [Source] constants; [My calc] range |
| Super Mario (per Steve Swink, quoted by Kyle Pittman) | gravity is much stronger after the top than before it | "gravity triples at the apex" | [Secondary], [Pittman, GDC 2016 "Building a Better Jump"](https://gdcvault.com/play/1023148/Math-for-Game-Programmers-Building) |
| Pittman's method | pick the height and the time to the top first, then work out launch speed and gravity; use a separate, stronger falling gravity | formulas in the talk | [Source] talk; summaries [here](https://traversingvirtual.blogspot.com/2024/07/designing-platformer-player-controls.html) |
| Super Mario Run (phone, one finger) | "tapping makes Mario jump, pressing and holding makes him jump higher." In Easy Mode a bar beside Mario **fills while the finger is held and shows the jump's strength** | two or more heights from one finger | [Source] Miyamoto via [Shacknews](https://www.shacknews.com/article/96686/shigeru-miyamoto-on-super-mario-run-were-not-just-making-a-simple-or-easy-mario-game); the bar: [Mario Wiki, Easy Mode](https://www.mariowiki.com/Easy_Mode) [Secondary] |
| Leo's Fortune (phone) | right thumb swipes up to puff up and jump, and **keeps holding to hover across wider gaps**; on-screen buttons are an option | — | [Secondary], [TouchArcade](https://toucharcade.com/2014/04/28/leos-fortune-review/), [iMore](https://imore.com/leos-fortune-review) |
| Sonic | release before the top cuts the jump | jump 6.5, gravity 0.21875 px per frame (game units) | [Secondary], [Sonic Physics Guide](https://info.sonicretro.org/SPG:Jumping) |
| **Pokey, touch** | every touch jump counts as held for 220 ms; by then he's slower than the 230 px/s cut, so releasing changes nothing | 97.2–97.8 px | FEEL.md §3; [My calc] |

**What a shorter touch minimum would give** [My calc, 30 fps, released at the minimum]:

| Minimum hold | 0 ms | 40 | 80 | 130 | 160 | 190 | 220 (today) |
|---|---|---|---|---|---|---|---|
| Apex (px) | 10.3 | 46.7 | 61.7 | 74.6 | 85.3 | 94.0 | 97.2 |

**Takeaway.** Every benchmark offers a choice of height. The two phone games that do it best get it from how long one finger stays down: hold for higher in Super Mario Run, hold to hover in Leo's Fortune. Neither uses a second, separately recognised flick.

---

## 3. One-touch design on phones: Super Mario Run and Rayman Jungle and Fiesta Run

| Game | Structure | Label |
|---|---|---|
| **Super Mario Run** (Nintendo, 2016) | <ul><li>Mario runs by himself; tap to jump, hold for higher.</li><li>The first course, "Up and Over" (World 1-1), has a **60-second time limit**.</li><li>Replay variety comes from the **same fixed course** run again three times, with 5 pink, then 5 purple, then 5 black coins in harder spots and small layout changes.</li><li>An Easy Mode gives unlimited time and "bubbles" (retries) and shows the jump-strength bar.</li></ul> | [Secondary] [Mario Wiki, Up and Over](https://www.mariowiki.com/World_1-1_(Super_Mario_Run)); [Mario Wiki, Easy Mode](https://www.mariowiki.com/Easy_Mode); Miyamoto interviews (§2) [Source] |
| **Rayman Jungle Run** (Pastagames with Ubisoft Montpellier, 2012) | <ul><li>Auto-run; "taps to jump, glide, wall-run and punch".</li><li>The first four worlds each give priority to one ability, one new move per world.</li><li>100 lums per level.</li><li>Pastagames changed Origins' design because "some players dislike virtual sticks".</li></ul> | [Secondary] [AppSpy](https://www.appspy.com/review/3655/rayman-jungle-run/), [Gameblog](https://www.gameblog.fr/test_1390_rayman-jungle-run-ipad), [Everyeye](https://www.everyeye.it/articoli/recensione-rayman-jungle-run-17734.html), [Windows Central](https://www.windowscentral.com/rayman-jungle-run-review), [RayWiki](https://raymanpc.com/wiki/en/Jungle_Run) |
| Rayman Fiesta Run (2013) | same one-touch auto-run family | [Secondary] |
| Alto's Adventure | one input: tap to jump, hold to backflip | [Source] developer post, [TouchArcade forums](https://devforums.toucharcade.com/threads/altos-adventure-by-snowman.255509/page-10) |
| Leo's Fortune | split screen: the left thumb moves, the right thumb swipes for vertical moves; buttons as an option. Some reviewers switched to the buttons on iPad. | [Secondary] (§2) |
| Oddmar | swipe on the left to move, act on the right; on-screen buttons were **added later as an option** | [Secondary] [TouchArcade review](https://toucharcade.com/2018/04/20/oddmar-review-this-game-earns-its-place-in-valhalla/) |

**Takeaways**
- The phone platformers that are praised for their controls do one of two things:
  - cut input down to one finger with a time element (Mario Run, Rayman, Alto);
  - split the screen into fixed jobs, with buttons as a fallback (Leo, Oddmar).
- None I found reads steering, jumps, double jumps, ducks, punches, kicks and mega punches from the same fingers by how they move, as Pokey does.
- Nintendo's phone 1-1 is fixed and 60 seconds long. Its replay variety comes from remixing what you collect on it, not from changing the course.

---

## 4. Checkpoint spacing

| Game or study | Practice | Label |
|---|---|---|
| Super Mario Maker 2, Yamamura's Dojo ("Checkpoint Flags and You") | <ul><li>Put a flag after a tricky section.</li><li>Put one "right BEFORE a difficult challenge".</li><li>Don't respawn the player into danger (move the Goomba away from the flag).</li><li>Limit: one flag per course area.</li></ul> | [Source] Nintendo in-game text, via [Mario Wiki](https://www.mariowiki.com/Yamamura%27s_Dojo) |
| Super Mario Maker (2015 update) | up to two mid-course flags per course | [Secondary] [GameLuster](https://gameluster.com/checkpoint-flag-system-coming-to-super-mario-maker-can-put-two-in-each-level/) |
| Celeste | short screens; you restart the current screen | [Secondary] |
| Rayman Origins | no lives; levels split into short sections separated by doors that act as checkpoints; "restarting after dying is admirably instantaneous" | [Secondary] [Games Asylum](https://www.gamesasylum.com/?p=10478), [RayWiki, Life](https://www.raymanpc.com/wiki/en/Life) |
| Shovel Knight | several per stage, breakable for treasure; "no hard and fast rule"; a lack of checkpoints "can typically cause a lot of frustration" | [Source] [Yacht Club](https://www.yachtclubgames.com/blog/check-point-design) |
| Johanson, Piller, Gutwin & Mandryk (CHI PLAY 2023) | checkpoints and breaks both helped players progress and build skill | [Study] DOI 10.1145/3611033, [listing](https://bibbase.org/network/publication/johanson-piller-gutwin-mandryk-ifatfirstyoudontsucceedhelpingplayersmakeprogressingameswithbreaksandcheckpoints-2023) |
| "Graceful Failure" (preprint, 172 players, one platformer in two versions) | with regular checkpoints, players completed more levels and reported significantly lower frustration and higher competence, but were less committed to optional rewards | [Study, preprint] [Sciety/OSF](https://sciety.org/articles/activity/10.31234/osf.io/vx6pr_v1) |
| **Pokey 1-1** | 10–15 flags; median gap 2,843 px (about 10–15 s); first flag median 3,265 px in; **last flag median 426 px before the exit** | STAGES.md §2 |

No source gives a universal spacing number. The consistent rules are: put a flag before the hard part, and keep a death from costing more than the hard part itself. Optional rewards suffer when checkpoints make failure cheap, which is a trade-off, not a reason to remove them.

---

## 5. Death, retry and put-back loops

| Game | What happens on a failure | Label |
|---|---|---|
| Super Meat Boy | respawn "almost instantaneous": "it was imperative that the action never stop, even when the player was killed"; replay of every death at the end | [Secondary] [Game Developer, "Why so hard?"](https://www.gamedeveloper.com/game-platforms/-i-super-meat-boy-i-s-mcmillen-explains-why-so-hard-), [Destructoid](https://www.destructoid.com/?p=61337) |
| Celeste | instant respawn in the current screen; Assist Mode (§8) | [Secondary] |
| Super Mario Odyssey, Assist Mode | <ul><li>a fall into a pit, lava or poison **carries Mario back in a bubble to the last solid ground he stood on, for one health point**;</li><li>no bubble at one health;</li><li>6 health instead of 3;</li><li>more likely to grab a ledge he walks off.</li></ul> | [Secondary] [Mario Wiki, Easy Mode](https://www.mariowiki.com/Easy_Mode) |
| Super Mario Galaxy 1 + 2 (Switch), Assist Mode | bubble out of pits for one damage; health regenerates when standing still; **extra invisible checkpoints** in some galaxies | [Secondary] same page |
| Super Mario Bros. Wonder | <ul><li>the "Safety Bounce" badge "bounces you back out of pits, lava, or poison swamps", one time per fall;</li><li>in the Switch 2 Edition's Assist Mode, a Propeller Flower saves you from pits, with no damage.</li></ul> | [Secondary] [Mario Wiki, Badges](https://www.mariowiki.com/Badge_(Super_Mario_Bros._Wonder)), [Game8](https://game8.co/games/Super-Mario-Bros-Wonder/archives/430632), [Mario Wiki, Easy Mode](https://www.mariowiki.com/Easy_Mode) |
| Mario vs. Donkey Kong (Switch), Casual | 5 "bubbles" per section float you back to a flag instead of a death | [Secondary] same page |
| Celeste players' persistence | a study of why players of hard games keep going after failure in Celeste ("Fail, fail again, fail better") | [Study] [AMiner listing](https://www.aminer.org/pub/657c0d60939a5f40828029ef/fail-fail-again-fail-better-how-players-who-enjoy-challenging-games-persist) |
| **Pokey** | <ul><li>Soft pits on the ground: walk out.</li><li>Missed double-jump gap: back to the take-off ledge (both settings).</li><li>Easy: put back on the last solid ground for nothing.</li><li>Normal treetop fall: a life, 0.75 s, back to the last flag.</li><li>Nothing escalates.</li></ul> | FEEL.md §8; STAGES.md §2 |

**Takeaway.** Pokey's put-back is the Odyssey bubble, made free. Every strong game that has a free or cheap retry also has something that changes after repeated failure (§8).

---

## 6. Nintendo's teaching structure

- **Kishōtenketsu.** Koichi Hayashida (director, Super Mario 3D Land and 3D World) said he drew on the four-part structure of four-panel comics. In 3D Land he became "a lot more rigorous about enforcing" one core idea per level. [Source, interview] via [Wikipedia](https://en.wikipedia.org/wiki/Koichi_Hayashida), [Nintendo Life](https://www.nintendolife.com/news/2012/04/super_mario_3d_land_director_shares_level_design_inspirations), [Game Developer](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design).
  - The specific "introduce, develop, twist, conclude" breakdown is Game Maker's Toolkit's analysis of 3D World, not Hayashida's own words. [Secondary] [MCV](https://www.mcvuk.com/development/video-nintendos-level-design-secrets-in-four-steps)
- **Super Mario Bros. 1-1.** Miyamoto and Tezuka (2015 video): 1-1 contains everything needed to help the player "gradually and naturally understand what they're doing". The first enemy is a Goomba because a Koopa "might be a little too difficult for the player to jump on and then kick". [Source, video] via [Game Developer](https://gamedeveloper.com/design/how-miyamoto-built-i-super-mario-bros-i-legendary-world-1-1), [AV Club](https://www.avclub.com/shigeru-miyamoto-explains-the-making-of-super-mario-bro-1798284041)
- **Super Mario 3D Land.** Hayashida "tried to make Super Mario 3D Land the way [Miyamoto] made 2D games... showed everyone the minimum volume, started with what looked possible to make, and then added on." [Source] [Iwata Asks](https://iwataasks.nintendo.com/interviews/3ds/super-mario-3d-land/0/3)
- **Nintendo's own lessons for course makers (Super Mario Maker 2, Yamamura's Dojo, 45 lessons).** [Source] in-game text via [Mario Wiki](https://www.mariowiki.com/Yamamura%27s_Dojo):
  - *Providing Direction*: "always try to put the next step somewhere that's visible... always give the player a hint about where they should go. It's the fair thing to do."
  - *Forgiving Player Mistakes*: "You'll always be good at playing the levels you make, because you know what to do, but you also have to think about it from the perspective of a total newb."
  - *Treating the Player Fairly*: a hidden block that makes the player "fall to your doom" is "not cool... cheap shots don't make players feel good."
  - *All about Pacing*: "Sometimes it's better to leave an area completely empty, without any gameplay at all... having downtime in your course creates contrast."
  - *Watching Others Play Your Course*: ask testers "what their least-favorite part was or if there were any big spikes in difficulty... watch closely as they play."
  - *On Difficulty*: the levers are fewer hazards, more space, and wider platforms.
- **Takashi Tezuka's five tips (Nintendo, 2019).** Upload rough drafts; name the course first; study others' courses; use Story Mode for ideas; build with another person, because "getting another person's opinion... will improve the quality." [Source] video via [Mario Wiki](https://www.mariowiki.com/Mr._Tezuka%27s_Top_5_Course-Creation_Tips_-_Super_Mario_Maker_2)

**Takeaway.** Show one idea at a time where failure is cheap, keep the next step visible, never punish what the player couldn't see, and watch first-timers.

---

## 7. First-stage length and time to fun on phones

| Item | Number | Label |
|---|---|---|
| Super Mario Run 1-1 | 60-second time limit | [Secondary] Mario Wiki (§3) |
| Super Mario Bros. 1-1 | timer of 400 units × 0.4 s = **160 s of real time** (one unit = 24 frames) | [Secondary] [Mario Wiki, Time Limit](https://www.mariowiki.com/Time_Limit), [nesdev forum](https://nesdev.nes.science/f5/t14000.xhtml) |
| SMB 1-1 width, first-timer clear time | about 3,400–3,600 px; "about a minute" | [Folklore]: not verified |
| Phone session length (2024 data) | median **5–6 minutes**; top quarter 8–9 | [Secondary] GameAnalytics 2025 via [GameDev Reports](https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks) |
| Phone session length (2025 data, different sample) | top quarter about 5.2 minutes | [Secondary] GameAnalytics 2026 via [GameDev Reports](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game) |
| Day-1 retention | top quarter about 26–30% | [Secondary] same reports |
| "Time to fun" | get players into core play within about a minute; a "this is fun" moment after 90+ s loses many | [Folklore]: industry blogs with no named dataset, e.g. [playio](https://blog.playio.co/mobile-game-onboarding-retention), [PocketGamer.biz](https://www.pocketgamer.biz/first-impressions-count-creating-the-ultimate-first-time-user-experience) |
| **Pokey 1-1** | 3,000–4,100 world px per section × 12–15 sections; median finish 204 s (repeat players); first-ever runs: 162 / 177 / 213 / 253 / 612 / 2,231 s | STAGES.md, DATA.md; [My calc] |

Pokey's time to first action is fine: a hop within seconds, and the first jump gap inside 20 s. Length is the question. Nintendo's phone 1-1 fits in 60 s, and its console 1-1 budgets 160 s. Pokey's 1-1 runs 3–4 minutes, more than half of a median phone session. No public source gives a "right" length, so treat this as taste, and test it with first-timers.

---

## 8. Help systems for players who can't get past a spot

| System | Trigger | What it does | Label |
|---|---|---|---|
| Super Guide, New Super Mario Bros. Wii | **8 lives lost in a row** on one level (not in World 9; single player only) | a block appears; Luigi plays the level for you; using it permanently dulls your save's stars | [Secondary] [Mario Wiki, Super Guide Block](https://www.mariowiki.com/Super_Guide_Block) |
| Super Guide, New Super Mario Bros. U | **5 lives** | same idea | [Secondary] same |
| Super Kong, Donkey Kong Country Returns (Wii) | **8 lives** lost in one level (3DS and HD versions: **5**) | the Tutorial Pig offers it; Super Kong finishes the level; you keep none of what he collects | [Secondary] [Mario Wiki, Super Kong](https://mariowiki.com/Super_Kong), [Engadget](https://www.engadget.com/2010-11-08-super-guide-returns-in-donkey-kong-country-returns.html) |
| Super Mario 3D Land | **5 deaths** in a level: Invincibility Leaf (White Tanooki, can't be hurt, but pits still count); **10 deaths**: P-Wing straight to the end of the stage. Planned as 8 and 16 before release. | an escalating ladder | [Secondary] [Mario Wiki, Assist Block](https://mariowiki.com/Assist_Block), [Game Revolution](https://www.gamerevolution.com/news/1568-super-mario-3d-land-rewards-players-who-die-a-lot), [Mario Wiki, pre-release](https://www.mariowiki.com/List_of_Super_Mario_3D_Land_pre-release_and_unused_content) |
| Super Mario Galaxy 2, Cosmic Guide | after repeated failure; I found **no published count** | a guide plays for you | [Secondary] |
| Crash Bandicoot 2 and 3, and the N. Sane Trilogy remakes | "a certain number of failures in a level" (count **not published**) | quietly gives an Aku Aku mask, adds checkpoints, and in places slows hazards (the Crash Dash boulder) | [Secondary] Vicarious Visions via [COGconnected](https://cogconnected.com/2017/07/crash-bandicoot-difficulty-vv/); Andy Gavin's [Making Crash](https://all-things-andy-gavin.com/making-crash) series [Source] (I couldn't open the specific post) |
| Super Mario Odyssey, Assist Mode | player's choice | bubble out of pits (−1 health), 6 health, easier ledge grabs, **guide arrows on the ground** | [Secondary] (§5) |
| Celeste, Assist Mode | player's choice, any time | <ul><li>game speed from 50% in 10% steps;</li><li>infinite stamina;</li><li>2 or infinite air dashes;</li><li>dash assist;</li><li>invincibility;</li><li>chapter skip.</li></ul> The intro text was changed from "reduce its difficulty" to "fit your specific needs". | [Secondary] [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/celeste-assist-mode), [Vice](https://www.vice.com/en/article/celeste-assist-mode-change-and-accessibility) |
| Yoshi's Woolly World, Mellow Mode | player's choice; plus **after 5 failures in a row on a course, an Invincibility Egg appears** | <ul><li>Yoshi gets wings and **can hold the button to fly continuously**, then falls slower;</li><li>20 hearts;</li><li>a badge can skip a course.</li></ul> | [Secondary] [Mario Wiki, Easy Mode](https://www.mariowiki.com/Easy_Mode) |
| Yoshi's Crafted World, Mellow Mode | player's choice | wings and flight; one heart lost per hit | [Secondary] same |
| Mario & Luigi: Brothership | a few Game Overs offer Easy; more offer "Cakewalk" | a two-step ladder | [Secondary] same |
| Super Mario Run, Easy Mode | player's choice before a course or after dying in one | unlimited time and retries; the jump-strength bar | [Secondary] same |
| **Pokey** | Extra lives offered after 3 Game Overs (but Easy has no Game Overs, because falls are free) | Easy, Jump help, game speed 0.8 or 0.9: all fixed menu settings; nothing reacts to failure in one spot | FEEL.md §8, §10 |

**Takeaway.** The consensus number for "start helping" is **5 failures in one place** (NSMBU, DKC Returns 3D and HD, SM3D Land, Woolly World). Older games used 8. The best systems climb a ladder: a hint, then protection, then a skip. The easiest modes remove the skill that's failing (wings, flight, bubble rescue) rather than repeat the same test without end.

---

## 9. Collectible placement and flow

- **Nintendo's own lessons** (Yamamura's Dojo) [Source]:
  - *Coins*: "Players are naturally drawn toward Coins... I placed them strategically to lure Mario toward places I want him to jump to."
  - *Mario's Limitations*: "you shouldn't put [Coins and ? Blocks] in places that Mario can't reach... If you were to go after the four Coins, you'd fall into the hole. But as we've discovered, most humans will go after them anyway."
  - *Creating Enticing Directions*: a narrower branch "might be hiding something"; a ? Block turns a platform into a destination.
  - *Coin Brainstorm*: the way to reach high coins can be easy (a block) or expert (a wall jump); choose for your audience.
- **Coin arcs.** A row of coins usually traces the arc of a jump you're meant to make. [Secondary] commentary, e.g. [GameDev.net, SMB3 lessons](https://gamedev.net/articles/game-design/game-design-and-theory/super-mario-bros-3-level-design-lessons-part-1-r4682/), [GamesRadar on coins](https://gamesradar.com/why-nintendos-most-abundant-offerings-gold-coins-are-also-among-its-most-valuable)
- **Rayman Origins.** Lum Kings double the value of lums for a short time (rhythm); Skull Coins sit in "hidden or dangerous areas" as the deliberate risky pickup. [Secondary] [RayWiki](https://raymanpc.com/wiki/en/Lum_Medal)
- **Designers' rule of thumb.** Erin Robinson: have people play your level often "so you can see exactly where players are likely to get lost"; use coins and arrows to guide; no blind jumps. [Secondary] [Boing Boing](https://boingboing.net/2015/09/11/want-to-create-mario-maker-lev.html); [Citizen Game, Mario Maker don'ts](https://citizengame.co.uk/editorial/features/18072/six-super-mario-maker-design-donts)
- "Don't put valuable pickups over deadly pits early on." [Folklore], but it follows directly from Nintendo's *Mario's Limitations* lesson above.

---

## 10. Camera look-ahead

| Game | Rule | Seconds of path ahead at top speed | Label |
|---|---|---|---|
| Super Mario Bros. | no scroll while Mario is under 80 px into the screen; scrolls as he moves between 80 and 112; at 112 it scrolls one-for-one; never scrolls back | about 130–140 px ahead on a 256 px screen; at a full run of roughly 2.5 px per frame that's just under a second | rule: [Secondary] [TASVideos forum](https://tasvideos.org/Forum/Posts/208777); SMB1's exact top speed: [Folklore]; seconds: [My calc] |
| Sonic the Hedgehog (Mega Drive) | hero kept inside a 16 px window (144–160 of 320); in the air, a vertical window of 64–128; camera speed capped at 16 px per frame | about 160 px ahead at 6 px per frame: about 0.45 s, the classic "running blind" complaint | [Secondary] [Sonic Physics Guide, Camera](https://info.sonicretro.org/SPG:Camera) |
| Sonic CD | borders set to the centre, so the view scrolls as soon as he moves | — | [Secondary] same |
| Super Mario World | platform snapping (the camera changes height when Mario lands); per-level scroll modes | — | [Secondary] [PetaPixel](https://petapixel.com/2012/06/27/the-camera-logic-of-super-mario-world/); Keren below |
| Itay Keren, "Scroll Back" (GDC 2015) | the standard reference for camera windows, look-ahead, platform snapping and smoothing | — | [Source] [Game Developer](https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers), [GDC Vault](https://gdcvault.com/play/1022243/Scroll-Back-The-Theory-and) |
| Nintendo's rule (Yamamura's Dojo) | "put the next step somewhere that's visible... both horizontal and vertical paths" | — | [Source] (§6) |
| **Pokey, upright 412 × 915** | about 440 world px wide; at full run at least 305 px ahead; extra framing near ledge ends shows landings up to 760 px across | **about 1.1 s** | FEEL.md §9; [My calc] |
| **Pokey, sideways 915 × 412** | about 1,199 × 540 world px; 90 px look-ahead | **about 2.7 s** | [My calc] |

No source gives a correct number of seconds. Pokey's upright framing already shows more road ahead than Super Mario Bros. does.

---

## 11. Touch misreads: what the platforms themselves use

| Threshold | Android default | iOS default | Pokey | Label |
|---|---|---|---|---|
| Movement before a touch counts as a drag ("touch slop") | 8 dp | — | starts running at 16 px; a tap stays a tap up to 22 px | [Source] Android `ViewConfiguration` (`TOUCH_SLOP = 8`) via [AOSP mirror](https://github.com/aosp-mirror/platform_frameworks_base/blob/main/core/java/android/view/ViewConfiguration.java); FEEL.md §7 |
| Tap timeout | 100 ms | — | punch on lift within 400 ms | [Source] `TAP_TIMEOUT = 100` |
| Long press | **400 ms** | **500 ms** (`minimumPressDuration` default 0.5 s) | mega punch after 550 ms held still | [Source] `DEFAULT_LONG_PRESS_TIMEOUT = 400`; [Apple](https://developer.apple.com/documentation/uikit/uilongpressgesturerecognizer/minimumpressduration) |
| Double tap window | 300 ms | — | second jump: any time in the air, as a fresh flick | [Source] `DOUBLE_TAP_TIMEOUT = 300` |
| Minimum fling speed | **50 dp/s** | — | jump flick ≥ 0.6 px/ms = **600 px/s** (12× Android's minimum) for an undecided finger | [Source] `MINIMUM_FLING_VELOCITY = 50`; FEEL.md §7 |

- **Henze, Rukzio & Boll (MobileHCI 2011), "100,000,000 taps".** A tapping game on Android collected touches at scale. Touch positions are systematically skewed, and a correction function cut errors by 7.79%, tested over 12,201 installs and 15,326,444 touches. [Study] [Lancaster listing](https://www.research.lancs.ac.uk/portal/en/publications/100000000-taps-analysis-and-improvement-of-touch-performance-in-the-large(bf3de4a6-746c-4f32-a33d-932dc1cc4af4).html)
- **Takeaway.** Pokey's tap and hold thresholds are close to platform norms. Its flick bar (600 px/s) is high, by design, to stop slow drags becoming jumps. The real risk is the number of different things one finger can mean (REVIEW.md finding 7).

---

## 12. Children's motor skills and touch accuracy

| Study | Who | Finding | Label |
|---|---|---|---|
| Anthony, Brown, Tate, Nias, Brewer & Irwin, "Designing Smarter Touch-Based Interfaces for Educational Contexts" | about 70 people; children 7–17 against adults | <ul><li>"Holdovers" (touches landing near the *previous* target): **7–10-year-olds 3.93% of touches, adults 0.56%** (seven times as many).</li><li>Children's gestures recognised **81% vs 90%** when the recogniser was trained on the same person, **34% vs 64%** when it wasn't.</li><li>The best untrained recogniser ($P) managed about 84% for adults and about 70% for 7–10s.</li><li>Children "use more strokes and make larger gestures" and are "much less consistent".</li><li>7–10s struggle more with small (0.25") targets.</li><li>A 10 px gutter from the screen edge nearly doubled misses, almost all of them inside the gutter.</li></ul> | [Study] [PDF](https://lisa-anthony.com/wp-content/uploads/2013/04/anthony-et-al-jpuc2013.pdf) |
| Woodward et al., CHI 2016, "Characterizing How Interface Complexity Affects Children's Touchscreen Interactions" | 30 children aged 5–10, 30 adults | recognition accuracy "lowest for 5-year-olds and increases for older participants". My pass-1 figure of "64% for 5-year-olds" came from a summary I couldn't re-open, so treat it as **unverified**. | [Study] [project page](https://init.cise.ufl.edu/publications/characterizing-how-interface-complexity-affects-childrens-touchscreen-interactions), [Shaw & Anthony poster](https://init.cise.ufl.edu/wp-content/uploads/sites/775/2017/05/Shaw-and-Anthony-CHI2016-poster-1.pdf) |
| Vatavu, Cramariuc & Schipor, IJHCS 2015 | 89 children aged 3–6, 4,069 trials | <ul><li>Accuracy improves significantly from 3 to 6.</li><li>Speed and accuracy track finger dexterity, drawing and visual-spatial skills.</li><li>Tap, double tap and one-hand drag are mostly fine; two-hand drag is weak.</li></ul> | [Study] [dblp](https://dblp.org/rec/journals/ijmms/VatavuCS15.html), [dataset](https://raduvatavu.usv.ro/projects/ChildrenTouchInput) |
| Nacher et al., IJHCS 2015 | children aged 2–3 | tap and drag work; flick is learned quickly; complex gestures drop to 53.7% success | [Study] [PDF](https://riunet.upv.es/bitstream/handle/10251/64752/IJHCS-Nacher.pdf) |
| Gesture intuitiveness for preschoolers | preschoolers | "flick/fling, multi-touch and double tap are the least intuitive" | [Study] [core.ac.uk](https://core.ac.uk/download/288380419.pdf) |
| Study in Delhi, ages 2–8 | 2–8 | only 27% of 2–3-year-olds could tap an intended place; comfortable with single-finger gestures by about 8 | [Study, via search summary; full text not read] |
| Reaction time | 4–14 vs adults | simple (sound) reaction time about 465 ms at age 5, falling to about 190 ms at 15 | [Study, via search summary; citation not verified] |

**What this means for Pokey** [My calc]:
- A double jump is two separate flicks inside about 0.6 s of air time.
- Each flick must travel at least 26 px at 600 px/s (or 34 px with the steering thumb).
- Children make slower, larger and less consistent strokes, and "holdovers" seven times as often.
- So the jump the game asks for is near the edge of what a 5–7-year-old can do reliably.

The one child in the data (player I) named "the tall steps (double jump)" as the hardest part.

---

## 13. What makes a random or generated stage feel designed

| Game or work | How | Label |
|---|---|---|
| **Spelunky** | <ul><li>A 4 × 4 grid of rooms (each 10 × 8 tiles).</li><li>A **guaranteed solution path** is laid first, with a random walk from a top-row entrance down to a bottom-row exit.</li><li>Each room then gets a **hand-made template** (8–16 per room type, with some tiles chosen by chance); off-path rooms are filler.</li><li>Kazemi counted "only about 50 basic room layouts for every tile set".</li><li>Enemy and trap placement is the truly random part.</li><li>Derek Yu admits "the player will quickly begin to recognize certain repeating landmarks."</li></ul> | [Secondary] Darius Kazemi's [Spelunky Generator Lessons](https://tinysubversions.com/spelunkyGen/), [room generation](https://tinysubversions.com/2013/10/spelunky-generator-lessons-part-2-room-generation/index.html), [Spelunky's procedural space](https://www.tinysubversions.com/2009/09/spelunkys-procedural-space/index.html); Yu's book via reviews |
| **Dead Cells** | <ul><li>Each level starts from a hand-made **concept graph**: length, number of special rooms, how maze-like.</li><li>Only then are hand-designed rooms placed: "only once we've laid down all of these constraints... do we let the procedural generation algorithm loose".</li><li>The key is keeping the algorithm "involved in the most restrained way possible".</li></ul> | [Source] Sébastien Bénard, [Game Developer](https://www.gamedeveloper.com/design/building-the-level-design-of-a-procedurally-generated-metroidvania-a-hybrid-approach-), [deepnight.net](https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/) |
| **Launchpad** (Smith, Treanor, Whitehead, Mateas; later Smith et al. 2011) | levels are built from short **rhythm groups** (a timed pattern of player actions) separated by rests; geometry is generated to fit the rhythm, then rated against design rules | [Study] [FDG 2009 PDF](https://expressiveintelligence.github.io/papers/smith-fdg-09.pdf); expressive-range analysis [PCG 2010](https://www.pcgworkshop.com/archive/smith2010analyzing.pdf) |
| **Mario AI Championship 2010**, level generation track | the first public procedural-generation competition: generators were judged by human players on levels tailored to each player | [Study] [ITU listing](https://pure.itu.dk/da/publications/the-2010-mario-ai-championship-level-generation-track/) (I couldn't get its results text) |
| **Rayman Origins** (UbiArt Framework) | **not** procedural. Hand-made levels, built fast because artists and designers edit the real game directly, with quick prototyping. Ubisoft later said the tools "were difficult to use". | [Secondary] [Wikipedia, UbiArt](https://en.wikipedia.org/wiki/UbiArt_Framework); [GDC, Rayman Legends design process](https://gdcvault.com/play/1020398/Rayman-Legends-The-Design-Process) |
| **Super Mario Maker community norms** | <ul><li>"Tough but fair": no blind jumps, no hidden-block traps.</li><li>Coins and arrows guide the player.</li><li>Flags before hard parts.</li><li>Get others to play your course.</li></ul> Nintendo's own Dojo lessons (§6) set these norms. | [Source] Dojo; [Secondary] community guides (§9) |

**Takeaway.** Generated stages feel designed when four things are true:
1. a person designs the skeleton (Dead Cells' graph, Spelunky's path);
2. every piece is hand-made and tested on its own;
3. the generator's rules are kept tight;
4. what varies is the detail, not whether the stage can be solved or understood.

Pokey's builder already has 1 and 2: four hand-made outlines and 90 hand-made sections. The gaps are in 3 (its reach rules don't match the game, REVIEW.md finding 2) and in 4 (which pieces you're dealt changes how hard the stage is).

---

## 14. Latency and frame rate

- **Mick West (2008).** Filmed controller and screen together:
  - Good 60 fps games answered in about 4/60 s (67 ms); 3/60 is possible.
  - 30 fps games commonly took 8–10/60 (133–167 ms) or more; the best 30 fps game he found managed 6/60 (100 ms).
  - Players notice controller lag at about 166 ms.

  [Source, measurement] [Game Developer](https://www.gamedeveloper.com/design/measuring-responsiveness-in-video-games), [Cowboy Programming](https://cowboyprogramming.com/2008/05/)
- **Phone touch latency.** 55–123 ms across 2013 phones before the game does anything (§1) [Secondary].
- **Pokey's own variation** [My calc]. Because frames longer than 50 ms are split into smaller steps, the same touch jump peaks at:

  | Frame rate | 30 fps | 25 fps | 20.1 fps | split frames |
  |---|---|---|---|---|
  | Jump peak (px) | 97.2 | 95.4 | 92.3 | 98–100 |

  That's about ±4%, small next to 1-1's margins.

---

## 15. Gaps in this research

- I couldn't verify Celeste's jump-buffer length (not in the published file), SMB1's exact run speed, Super Mario Galaxy 2's Cosmic Guide count, or Crash's death counts.
- Coyote values for Hollow Knight and Super Meat Boy are folklore.
- The children's reaction-time figure and the Delhi study come from search summaries; I didn't read the papers.
- No public source gives a "correct" first-stage length, look-ahead in seconds, or checkpoint spacing. Those stay taste.

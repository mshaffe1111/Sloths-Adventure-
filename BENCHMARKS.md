# Benchmarks: how strong platformers handle feel, stages and help

Prepared for the Pokey (sloth platformer) review, 7 November 2026. Companion to REVIEW.md.

**How to read this.** Each topic lists what named games do, with numbers where a source gives them. Every claim has a source link. Labels:
- **[Source]**: the developer, the publisher, or the game's own code said it.
- **[Secondary]**: a reputable write-up, a review or a wiki, not the developer.
- **[Folklore]**: widely repeated, with no solid source behind it. Don't build on these.

Unit note: this game runs at 30 frames per second, so 1 frame = 33 ms. Most benchmark games run at 60 frames per second (1 frame = 16.7 ms). Below, times are given in **milliseconds (ms)** so they compare directly.

---

## 1. Coyote time (jumping just after running off a ledge)

| Game | What it does | Number | Label |
|---|---|---|---|
| Celeste | "You can still jump for a short time after leaving a ledge." Thorson calls it "a big reason why Celeste can feel kind even though it's very difficult." | `JumpGraceTime = 0.1 s` = 100 ms (6 frames at 60 fps) | [Source] thread: [Thorson, Mar 2020 (thread reader)](https://threadreaderapp.com/thread/1238338574220546049.html); [Game Developer/Gigazine summary](https://gigazine.net/gsc_news/en/20200317-celeste-action-feel-things). Number: [DeepWiki summary of NoelFB/Celeste Player.cs](https://deepwiki.com/NoelFB/Celeste/2.3-player-movement-and-physics) [Secondary, from the open code]; [80.lv on the code release](https://80.lv/articles/celestes-movement-code-available-on-github) |
| General practice | Usually 3 to 6 frames at 60 fps (50–100 ms). | 50–100 ms | [Folklore]: often repeated, no survey behind it. Secondary sites give "5 frames" or "6 frames" and disagree. |

**Takeaway:** about 100 ms is the best-sourced figure from a game known for fair, precise jumping. This game's 1-1 gives 214 ms (Normal) and 248 ms (Easy), two to two and a half times Celeste's (FEEL.md §5).

## 2. Jump buffering (a press just before landing still counts)

| Game | What it does | Number | Label |
|---|---|---|---|
| Celeste | "If you press and hold the jump button a short time before landing, you will jump on the exact frame that you land." | About 80 ms (the game's input buffer, from memory of the open code; the thread gives no number) | [Source] for the behaviour ([thread](https://threadreaderapp.com/thread/1238338574220546049.html)); the number is unverified |
| General write-ups | Buffers of about 4 to 6 frames at 60 fps. | 66–100 ms | [Folklore] ([example write-up](https://kindatechnical.com/game-development/input-buffering-coyote-time-and-game-feel.html)) |

## 3. Variable jump height and apex hang

| Game | What it does | Number | Label |
|---|---|---|---|
| Super Mario Run (phone, one-handed) | "Tapping your screen makes Mario jump, while pressing and holding makes him jump higher." Short taps give short jumps. | Two or more heights from one finger | [Source] Miyamoto, via [Shacknews](https://www.shacknews.com/article/96686/shigeru-miyamoto-on-super-mario-run-were-not-just-making-a-simple-or-easy-mario-game), [Pocket-lint](https://www.pocket-lint.com/games/news/nintendo/138796-super-mario-run-preview-playing-the-game-with-miyamoto-himself), [Fortune](https://dc.fortune.com/2016/09/08/apple-iphone-nintendo-super-mario) |
| Celeste | "Halved gravity jump peak": gravity is halved near the top of the jump while jump is held. Holding jump also keeps the take-off speed going for a set time. | Half gravity while vertical speed < 40 px/s and jump is held; `VarJumpTime 0.2 s` | [Source] thread; numbers from the [DeepWiki code summary](https://deepwiki.com/NoelFB/Celeste/2.3-player-movement-and-physics) [Secondary] |
| Mario (Swink's analysis, quoted by Pittman) | Gravity rises sharply at and after the apex, so the fall is quicker than the rise. | "the force of gravity triples at the apex of Mario's jump" | [Secondary] [Kyle Pittman, GDC 2016 "Building a Better Jump"](https://gdcvault.com/play/1023148/Math-for-Game-Programmers-Building), summarised [here](https://traversingvirtual.blogspot.com/2024/07/designing-platformer-player-controls.html) |
| Sonic | Release before the top cuts the jump; shortest jump comes from releasing right after take-off. | jump 6.5, gravity 0.21875 px per frame (game units) | [Secondary, community code study] [Sonic Physics Guide](https://info.sonicretro.org/SPG:Jumping) |

**Takeaway:** every benchmark gives the player a *choice* of jump height, and the strongest phone example gets it from **how long one finger stays down**. Super Mario Run is the closest comparison to this game, and it keeps variable height on a phone.

## 4. Fall speed and gravity on the way down

| Game | Number | Label |
|---|---|---|
| Celeste | Gravity 900 px/s², max fall 160 px/s, in a 320×180 screen. That's a cap of about 0.9 screen heights per second. | [Secondary] [DeepWiki code summary](https://deepwiki.com/NoelFB/Celeste/2.3-player-movement-and-physics) |
| Pittman's GDC 2016 talk | Recommends a separate, higher gravity for the fall than for the rise, set from the jump's chosen height and duration. | [Source] [GDC Vault](https://gdcvault.com/play/1023148/Math-for-Game-Programmers-Building) |

For comparison, this game's max fall of 950 px/s, on a 540 px tall landscape view, is about **1.8 view heights per second**. That's twice Celeste's, but it comes from a very different screen and art scale, so treat the comparison as rough.

## 5. Air control

- Celeste lets you steer at full strength in the air, and the thread's other "kindness" items (corner correction, wall jump from 2 px away) are all about forgiving positions mid-air. [Source] [thread](https://threadreaderapp.com/thread/1238338574220546049.html)
- Typical shipped platformers give between half and full ground acceleration in the air. [Folklore]: no sourced survey. This game gives 65% (1700 vs 2600 px/s²) and keeps speed when no direction is held, which is in the normal band.

## 6. Double jump

- Hollow Knight (Monarch Wings): the air jump refills on landing, on a pogo-bounce off an enemy or object, or on a wall cling. It's an earned ability, and the game can be finished without it. [Secondary] [Hollow Knight wiki](https://hollowknight.wiki/w/Monarch_Wings)
- Super Mario Run has no double jump. It gets height and distance from hold length, wall jumps and auto-vaults, all with one finger. [Source] (interviews above)

**Takeaway:** a double jump on a phone has no strong benchmark that uses a *second gesture* as its trigger. The phone games that sell well use one input with a time element (hold length) rather than a second, separately recognised flick.

## 7. Camera lead and look-ahead

- Itay Keren's GDC 2015 talk and article "Scroll Back" is the standard reference. It covers **camera windows** (the hero moves freely inside a box), **platform snapping** (the camera changes height only when the hero lands, as in Super Mario World), **look-ahead** toward the direction of travel, and smoothing. [Source] [Game Developer article](https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers); [GDC Vault](https://gdcvault.com/play/1022243/Scroll-Back-The-Theory-and)
- Follow-up case studies cover Celeste, Dead Cells and others. [Secondary] [qwe321 case studies](https://qwe321qwe321qwe321.github.io/posts/17027)
- Super Mario Run is played upright, with Mario kept toward the trailing side so the course ahead is visible. That's the design reason given for its portrait choice. [Source] [MacStories](https://www.macstories.net/news/super-mario-run-is-coming/)

No sourced number exists for "how many seconds of path ahead" a camera should show. A common rule of thumb is "at least one full jump plus reaction time". [Folklore]

## 8. Checkpoint spacing

- Celeste: the levels are cut into short screens, and you go back to the start of the current screen. [Secondary] [Vice](https://creators.vice.com/en/article/a3nbk4/celeste-the-ultra-hard-platformer-that-also-wants-to-give-you-a-hug)
- Shovel Knight: several checkpoints per stage; you can break one for treasure, and then a death sends you back further. Yacht Club says there is "no hard and fast rule" and that a lack of checkpoints "can typically cause a lot of frustration in classic games". [Source] [Yacht Club, Checkpoint design](https://old.yachtclubgames.com/2014/06/checkpoint-design/)
- Classic Mario (SMB): one midway point per level. [Common knowledge; not separately sourced here]

## 9. Death, retry and put-back loops

- Celeste: deaths are immediate and the respawn keeps you "in the zone". [Secondary] [metagearsolid](https://metagearsolid.org/2018/03/first-impressions-celeste/). The "under 0.5 seconds of downtime" figure is unsourced. [Folklore]
- Super Mario Odyssey Assist Mode: a fall into a pit carries Mario back in a **bubble** to the last stationary platform he stood on, at a cost of one health point. [Secondary] [Mario Wiki, Assist Mode](https://www.mariowiki.com/Assist_Mode)
- Crash Bandicoot series: if you keep dying in a spot, the game quietly makes that spot easier. It slows the boulder, gives an Aku Aku mask (an extra hit) and adds checkpoints. [Secondary] [Wikipedia, Dynamic difficulty](https://en.wikipedia.com/wiki/Rubberband_effect); Rubin quote via [Wikipedia, Crash Bandicoot](https://en.wikipedia.org/wiki/Crash_Bandicoot_(video_game)). One account says the mask came after 5 lost lives; that comes from one source only. Gavin's own series: [Making Crash](https://all-things-andy-gavin.com/making-crash).

**Takeaway:** strong games pair a quick retry with **escalating help in the same spot**. A put-back alone is a quick retry with no escalation.

## 10. Teaching new moves (introduce, develop, twist, conclude)

- Koichi Hayashida (director, Super Mario 3D Land / 3D World) cites **kishōtenketsu**, the four-part structure of four-panel comics, as the model. Each level is built around one core idea: introduce it safely, develop it, twist it, then conclude. [Source/Secondary] [Wikipedia: Hayashida](https://en.wikipedia.org/wiki/Koichi_Hayashida); [Game Developer: "The secret to Mario level design"](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design); the four steps as a framework: [Game Maker's Toolkit coverage](https://www.mcvuk.com/development/video-nintendos-level-design-secrets-in-four-steps)
- 3D Land gives each level a single gimmick ("2-2 is dedicated to folding panels, 2-4 to reverse platforms"). [Secondary] [wnhub](https://wnhub.io/news/game-design/item-11856)
- Super Mario Bros. 1-1: Miyamoto and Tezuka explain that the level teaches without a manual, one element at a time, in a safe place first. [Source, video interview] covered by [Game Developer](https://gamedeveloper.com/design/how-miyamoto-built-i-super-mario-bros-i-legendary-world-1-1) and [BGR](https://www.bgr.com/general/super-mario-bros-world-1-1-design/)
- Super Mario Bros. Wonder: each course has one "Wonder" built for that course. [Source] [Nintendo, Ask the Developer](https://www.nintendo.com/sg/interview/aqmx/)

**Takeaway:** one new idea at a time, shown first where failure is cheap, then combined. Combinations come *after* each part has been shown alone.

## 11. Difficulty curve and first-stage length

| Game | First stage / course length | Label |
|---|---|---|
| Super Mario Run (phone) | Timers usually start at **60–90 s**; reviewers describe "a quick 60 second level", the longest under two minutes | [Secondary] [Mario Wiki, Super Mario Run](https://www.mariowiki.com/SMR); [GSMArena review](https://m.gsmarena.com/super_mario_run_review-blog-22234.php) |
| Super Mario Bros. 1-1 | 224 tiles, about 3,584 px; 400-unit timer. A relaxed first play takes about 1–1.5 minutes | [Folklore / common knowledge]: not verified here |
| Rayman Jungle Run (phone) | Short auto-run levels built around one touch to jump | [Secondary] [Destructoid review](https://www.destructoid.com/reviews/review-rayman-jungle-run/) |
| Phone play sessions overall | Median session **about 5–6 minutes**; top games 8–9 minutes (2024 data) | [Source, industry data] [GameAnalytics 2025 benchmarks (summary)](https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks) |

## 12. Help for players who can't get past a spot

| System | What triggers it | What it does | Label |
|---|---|---|---|
| Super Guide (New Super Mario Bros. Wii) | **8 deaths** on one level (sources disagree on whether they must be in a row) | A block appears; hitting it lets a computer-controlled Luigi play the level while you watch and can take over | [Secondary] [Kotaku](https://kotaku.com/your-guide-to-nintendos-gameplay-helping-super-guide-5422253); [Mario Wiki](https://www.mariowiki.com/Super_Guide) |
| Celeste Assist Mode | Player's choice, any time | Game speed 50–100% in 10% steps; infinite stamina; 2 or infinite air dashes; invincibility; dash assist | [Secondary] [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/celeste-assist-mode) |
| Crash Bandicoot | Repeated deaths at a spot | Slower hazards, a free mask, extra checkpoints, without telling you | [Secondary] (see §9) |
| Super Mario Odyssey Assist | Player's choice | Bubble put-back from pits (−1 health), guide arrows to the next goal, more health | [Secondary] [Mario Wiki](https://www.mariowiki.com/Assist_Mode) |
| Yoshi's Woolly World Mellow Mode | Player's choice, switchable any time | Winged Yoshi **hovers at his current height indefinitely**: a missed gap stops being a miss | [Secondary] [Mario Wiki, Winged Yoshi](https://www.mariowiki.com/Winged_Yoshi) |
| Kirby | Built in | Unlimited float; the series is designed "for beginners" | [Source/Secondary] [Wikipedia, Kirby series](https://en.wikipedia.org/wiki/Kirby_(series)) |

**Takeaway:** the strongest help systems either **remove the failing skill** (hover or float in Mellow Mode and Kirby, skip in Super Guide) or **escalate after repeated failure** (Crash). None of them simply returns the player to try the same move again with no limit.

## 13. Collectibles: placement and flow

- Coins and pickups as **breadcrumbs**: they lead toward the path or hint at a detour. [Secondary] designer Erin Robinson via [Boing Boing](https://boingboing.net/2015/09/11/want-to-create-mario-maker-lev.html/amp)
- A row of coins shows the arc of the jump you're meant to make; don't put valuable pickups over deadly pits early on. [Folklore]: low-quality source, but a widely repeated rule
- Super Mario Bros. 3 groups coins to slow down players who would otherwise rush through short levels; collectible count should scale with the size of the area. [Secondary] [GameDev.net SMB3 lessons](https://gamedev.net/articles/game-design/game-design-and-theory/super-mario-bros-3-level-design-lessons-part-1-r4682/); [Mario Wiki 'Shroom](https://www.mariowiki.com/The_%27Shroom:Issue_215/Strategy_Wing)
- Yoshi's Island coins are visible from vantage points, not hidden. [Secondary] (same sources)

## 14. Touch-control platformers on phones

| Game | Control scheme | Notes | Label |
|---|---|---|---|
| Super Mario Run | Auto-run; tap to jump, hold for higher; one hand, upright | Nintendo built it around one-handed tapping | [Source] (§3) |
| Rayman Jungle Run (Pastagames / Ubisoft Montpellier) | Auto-run; touch to jump; no virtual joystick | Reviewers single out dropping the joystick as the best decision | [Secondary] [Destructoid](https://www.destructoid.com/reviews/review-rayman-jungle-run/); [AV Club](https://www.avclub.com/mobile-game-of-the-week-rayman-jungle-run-android) |
| Leo's Fortune | Left thumb slides to move; right side jumps, inflates or slams | One review says the controls sometimes "don't respond when you want to", and that on-screen buttons worked best for that reviewer | [Secondary] [Tidbits](https://tidbits.com/2014/06/27/funbits-leos-fortune-perfects-touchscreen-platforming/); [GSMArena](https://blog.gsmarena.com/leos-fortune-ios-game-review) |
| Alto's Adventure | One input: tap to jump, **hold to backflip**; "all taps are registered equally" | The developer wanted the controls "as simple as possible" | [Source] developer post, [TouchArcade forums](https://devforums.toucharcade.com/threads/altos-adventure-by-snowman.255509/page-10); [review](https://appunwrapper.com/2015/02/19/altos-adventure-review/) |
| Oddmar | Swipe on the left half to move; jump and attack on the right half; on-screen buttons **added later as an option** | Reviewers praise the touch feel | [Secondary] [TouchArcade review](https://toucharcade.com/2018/04/20/oddmar-review-this-game-earns-its-place-in-valhalla/); [Stuff](https://www.stuff.tv/review/app-of-the-week-oddmar-review) |

**Takeaway:** the top phone platformers either cut the input to one finger with a time element (Mario Run, Rayman, Alto), or **split the screen into fixed jobs** (left moves, right acts) *and* offer buttons as a fallback (Leo, Oddmar). None that I found reads punches, jumps and steering from the same finger by how it moves.

## 15. Latency and frame rate

- Mick West measured that 60 fps games mostly respond in about **67 ms**, while 30 fps games range **100–300 ms**. Players start to notice lag at around 150 ms. [Source, measurement] [Game Developer: Measuring responsiveness](https://www.gamedeveloper.com/design/measuring-responsiveness-in-video-games); [Programming responsiveness](https://www.gamedeveloper.com/programming/programming-responsiveness)

## 16. Kids' play patterns

- Software recognised gestures drawn by 5-year-olds correctly only **64%** of the time, against 91% for 10-year-olds and 94% for adults. [Source, study] Woodward et al., via [MTAGIC / Anthony lab](https://lisa-anthony.com/2014/05/) and [Shaw & Anthony slides](https://init.cise.ufl.edu/wp-content/uploads/sites/775/2017/05/Shaw-et-al-ICMI2016-Conference-talk-slides.pdf)
- Preschoolers find tap, drag and swipe intuitive. **Flick/fling, multi-touch and double tap are among the least intuitive** gestures. [Source, study] (same collection; [core.ac.uk paper](https://core.ac.uk/download/288380419.pdf))
- Some child-interface researchers leave swipe out entirely because early studies found it hard for children. [Source] (same)
- Children have more trouble than adults hitting touch targets and making consistent gestures; aim for bigger targets and simpler gestures. [Source] [MTAGIC](https://lisa-anthony.com/2014/05/); [UserTesting summary](https://www.usertesting.com/blog/ux-for-kids) [Secondary]
- "Kids tap the screen a lot / mash" is widely reported by playtesters. [Folklore, but consistent with the data here: see REVIEW.md]

---

### Gaps in this research
- I couldn't open primary pages for the exact Celeste buffer value, for SMB 1-1's frame data or for Gavin's DDA post. Those are labelled accordingly.
- No public source gives a "correct" first-stage length or camera look-ahead in seconds. Treat any such number as taste.

# FIX-284 REPORT (STOPPED at the lead's word 3:22 PM ET, real context ~415k of the 400k box; FIX-284b finishes from the note below)

## EXACT NEXT STEP (for FIX-284b; branch t-fix-284, push only it; read this whole section first)
STATE at the stop (3:22 PM ET 11-19, by `date`): branch t-fix-284, base t-int-12 ce4ad461 + ENG-285b's final model ba6b225b (merged, 1acd9668).
The head I push now carries everything below; nothing else is running when I stop (the deepBeat22 clip re-shoot is waited for, then pushed).
THE LEAD'S RULINGS (in force): (1) show-first OK 2:37 PM: big pad 260 -> 180 (2.0 Pokeys), art = floor on EVERY stood-on pond piece
(small drawn 150 -> 130, crown kept crownW 300, drawn 301), `look` = size; (2) ruling A 2:39 PM: castBots `--input fake|touch|pad`, default
fake unchanged; the default switch + tierBots recalibration is the lead's own R-row, not ours; (3) ruling A 2:51 PM: the respawn
phase-lock fixed in the ENGINE, general (breathAim.ts), no visible snap/freeze, planted, every beat-row stage re-flown (only 2-2 lays beat
pads); (4) 3:05 PM: kid N on 2-2 accepted as traced (R-row for the Designer); (5) 3:18 PM: keep 180; child N touch 39/40 (seed 9, deep22
run-offs) accepted as traced, deep22 note on R-165.306; the learned-pace aim APPROVED IN PRINCIPLE, for real once the lead has looked at the
clip (clips/respawn-deepBeat22-{sideways,upright}.mp4 + clips/sheet-respawn-*.jpg) and the breath-toy red/green (breath-plant.txt red;
`npx tsx --test --test-name-pattern="breath toy" tools/inspect/padRide.test.ts` green).
DONE (on the pushed head): steps 1-3 of the packet in code; tsc green on a74aec44's code (re-run on the final head); planted tests:
src/game/padArt.test.ts (RED 2/3 on 260/1.15x), src/game/gen2/padHop.test.ts (RED 2/2 on the 83 px row), src/game/breathAim.test.ts,
tools/inspect/padRide.test.ts "breath toy" (RED without the aim: breath-plant.txt), tools/inspect/castBots.test.ts --input mapping.
2-2 relist: byte-identical (version a8d674dd). castBots 2-2 1-40 x all bots x both on the FINAL engine (learned-pace aim):
castBots-2-2-{touch,pad,fake}-aim.{txt,jsonl} (table in §4).
STILL OWED, in this order (box: final hash by 8:30 PM ET; if it slips, tell the lead by 6:30):
 1. The respawn clip: SIDEWAYS DONE and judged by me at the stop (clips/respawn-deepBeat22-sideways.mp4, sheet-respawn-side.jpg: no goal
    card, no Dot box; he runs on as the pair goes under, drowns, the iris closes to dark (where the breath is turned), opens at his flag with
    the pair up, he crosses on it). UPRIGHT OWED: the pushed upright take (respawn-deepBeat22-upright.mp4) has NO death (that run's breath
    let him through), so it does not show a put-back: re-shoot upright until it shows one (`node reference/qa-reports/FIX-284/cliprespawn.mjs
    <port> <dir> up` with a vite dev server on <port>, then the ffmpeg line it prints; if the timing keeps letting him through, start him on
    the 'warn' later, e.g. wait for the second warn). Message the lead both clip paths.
 2. The FROZEN FINALS on 180 (none shot yet; the stills/pair-*.png are the show-first set, PINNED-free but NOT frozen): every big-pad beat
    (big1 first22, big2 mixWeight22 = a small beside a big, big3 deep22), feet on the painted top at 0.12 / 0.5 / 0.88 of the pad, and the
    crown, upright + sideways, Normal + Easy:
    `DIFF=normal node reference/qa-reports/FIX-284/shootfinal.mjs <port> reference/qa-reports/FIX-284/stills/final 2-2 1 big1:0.12:edgeL big1:0.5:mid big1:0.88:edgeR big2:0.5:mid big3:0.5:mid crown:0.5:mid`
    then DIFF=easy. Look at each (law 1, whole screen, D79): no float, no sink, no card/box over Pokey. Plus a clip of a tap-hop chain over
    pads (cliprespawn.mjs's controller can be pointed at hop22: a new small script, or adapt).
 3. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on the final head (D86): tsc; the full unit set; the build (BASE_PATH) + chunkcheck; artcheck;
    drawcheck (2-2 both ways, pads redrawn: D81); clipcheck; knowncheck; generalitycheck (breathAim.ts has no stage id); roadmapcheck;
    kbdcheck; buildcheck; seedlist 1-1 --check and EVERY list --check; the engine tools' tests (gates.yml:135 list: padRide/castBots/lianaRide
    included); tierBots.test.ts (any 1-1 move = recalibrate: it should not move); plus funcheck (2-1/2-2: none new or worse), coveragecheck,
    lockall vs the ENG-285 lock --intended 2-2 (record the ENG-285 lock on ba6b225b first: `npx tsx tools/engine/lockall.ts --layouts 16 --out
    lock-285.json` in a worktree of ba6b225b; my scratchpad copy died with the container). Any stage other than 2-2 moving = stop, tell the
    lead (the aim changes nothing at build time, so the lock should show 2-2 only). Long ones in the BACKGROUND (D87); UNRUN at report = D59.
 4. Fill §4-§5 and Polish below, rewrite reference/handoffs/engine-core.md (a §0zp-284 entry: PAD_HOP, art = floor/pondBox, breathAim and
    why the two earlier aims failed, castBots --input/--rows), push, report to the lead.
NOT DONE / NAMED: kid N 27/40 touch, 27 pad, 23 fake (traced: deep22 run-offs + beat pairs; accepted); child N touch 39/40 (seed 9,
accepted); 2-2.md:9-11 replacement text in §6 (2-2.md is on t-pitch-b, not here); side find for Content: tools/art/kitaudit/shoot.mjs pins
p.y = top - height but p.y is his FEET, so its stills float him 48 px.

(The draft below is FIX-284's, filled as results landed.)


Engine (level half), t-fix-284 from t-int-12 ce4ad461; ENG-285b's final model ba6b225b merged (the lead, 2:20 PM ET). Started 1:45 PM ET 11-19.

## 1. Big pad: size and art (show-first OK'd by the lead 2:37 PM ET, all three calls)
Measured (real engine, 2-2 designed roll, Pokey DROPPED onto the pad and landed by physics; stills/pair-*.png):
| | before (ce4ad461) | after |
|---|---|---|
| Pokey | drawn 89.1 tall (heroSprite.ts HERO_UNITS 66 x HERO_SPRITE_SCALE 1.35), ~70 px wide on screen, collider 44 x 48 | same |
| big pad floor (PAD_SIZES.big.w) | 260 px = 2.92 Pokeys | **180 px = 2.02 Pokeys** |
| big pad drawn | 260 x 1.15 = 299 px (3.4 Pokeys tall-units, ~4.3 Pokey widths); painted rim 20 px over the water each side of his floor | 180.7 px (M-03-a's painted top is its widest opaque row, 0.2%-99.6% of the picture: padtop.py) = the floor edge to edge |
| small pad | floor 130, drawn 150 (rim 10 px over the water) | floor 130, drawn 130 |
| crown lily | floor 300, drawn 345 | floor 300, drawn 301 (3.4 Pokeys: still giant; the lead: keep crownW 300) |
| big : small on screen | 299 : 150 = 1.99x | 180 : 130 = 1.38x (both at art = floor) |
| his feet down the painting | (in the dish) | 46% (big), 42% (small): in the dish, never the far rim or the water (padArt.test.ts) |

Code: rideLay PAD_SIZES.big.w 180; riverArt POND_ART carries each stood-on piece's measured `top`, pondBox/pondTopSpan lay it on the
floor (mirrored too), replacing padPiece's blanket `pl.width * 1.15`; a pad's `look` is always its size (beat rows told by `pad.by`),
so the painter never guesses big from width (it read w > 220).
Planted: src/game/padArt.test.ts: RED 2 of 3 on the old 260 / 1.15x, green 3/3 now.

## 2. The hop (ruling A, the lead 2:39 PM ET)
Flown on the real engine at 30 fps through the game's InputEngine (reference/qa-reports/FIX-284/hopReal.ts, .out), press to landing:
| press | frames (s) | along at a run | up |
|---|---|---|---|
| FakeInput bare press (what 2-2.md:9-11, rideLay.ts:256/:260, hopAir.ts used) | 9 (0.30) | 83 | 30 |
| Pad Jump button tap (PAD_HOP_MS 80) | 13 (0.43) | 119 | 62 |
| **touch flick (the default control; MIN_TOUCH_JUMP_HOLD_MS 220)** | **19 (0.63)** | **175** | **97** |
| a jump held to its top (either control) | 20 (0.67) | 184 | 98 |
| a chain of hops at a run, each pressed on landing (every control) | 276 px/s | | |

**Plainly: on touch a flick is a full jump by design (inputEngine.ts:7-13, "a flick must give a full one"). A touch player has no short
hop. Any design that asks a touch player for a short hop is wrong.** The "real tap hop 0.43 s / 106-119 px" in the roadmap row is the
Pad button's tap, the shortest hop any player makes.

PAD_HOP (rideLay.ts) holds the table; src/game/gen2/padHop.test.ts flies every row through InputEngine and holds it to the frame and
the pixel: RED 2/2 with the old 9 f / 83 px row planted, green now.

Every place that read the fake hop, and what moved:
| place | read | now |
|---|---|---|
| rideLay.ts PAD_FAIR.hold (1.0 s) | "land-decide-tap 0.2-0.4 s plus the tap hop's 0.30 s" | number stands: the hop's air time is spent OFF the pad; land-decide-press 0.2-0.4 s + 1 take-off frame |
| rideLay.ts PAD_FAIR.pace (230 px/s) | "a tap hop flies 83 px in 0.30 s (277 px/s, hopAir.ts)" | number stands: a hop chain is 276 px/s on every control (air speed = run speed) |
| rideLay.ts PAD_FAIR.reach (160) | "a held jump flies 184 px (hopAir.ts)" | number stands: PAD_HOP.held.along 184 |
| w2.ts W2_PADS doc | "a tap hop's 83 px edge to edge in the teach" | gaps under the Pad tap's 119 px (touch: 175) |
| realPlay.ts:303 | "the real tap hop is 0.43 s / 106-119 px" | Pad tap 0.43 s / 119 px; touch flick a full jump 0.63 s / 175 px |
| castBots (every 2-2 table so far) | the bots press through FakeInput with their own 0.16-0.20 s holds: a hop no thumb makes | `--input touch|pad|fake` (default fake, unchanged); 2-2 flown on touch and on the Pad below |
| 2-2.md:9-11 (on t-pitch-b, not on this branch) | "a tap hop is 9 frames (0.30 s), 83 px at a run, 30 px up ... pads one tap hop apart (under 83 px)" | replacement text in §6 for whoever owns 2-2.md |
| reference/specs/sims/hopAir.ts (t-pitch-b) | FakeInput press | superseded by hopReal.ts (same flat floor, InputEngine) |
| tools/inspect/lianaRide.test.ts:31-46 (ENG-24) | calls the Pad tap "the real hop" | true for the Pad; left as is (ENG's, and it asserts the Pad's 0.43 s) |
| 2-1 | rideLay is shared, but 2-1 lays no pads (only w2Arc22 places `pads`), and PAD_FAIR's numbers did not change | nothing moved in 2-1 |

2-2's rows against a touch flick (rows.ts): every pad-to-pad hop leaves 5-125 px before he could overshoot the next floor on a full-run
flick from the very edge (tightest: spur22's 50 px gaps, 5 px, a splash-back row). The Pad tap clears every gap but mixWeight/deep's
110-120 px, which the design already asks as held jumps. So no 2-2 row asks a touch player for a short hop.

## 3. Relist
seedlist 2-2 --check: PASS 100/100 on the moved layouts. Relist (`seedlist.ts 2-2 --count 100`): byte-identical, version a8d674dd (the
packed plans do not carry pad widths). 2-1's list: unchanged (no pads).

## 4. castBots 2-2, 1-40 x every bot x both settings (on the final engine: learned-pace aim)
| bot | touch N / E | pad N / E | fake N / E (calibrated) | base 260 fake (INT-12) |
|---|---|---|---|---|
| child | 39 (seed 9) / 40 | 40 / 40 | 40 / 40 | 40 / 40 |
| middle | 40 / 40 | 40 / 40 | 40 / 40 | 40 / 40 |
| expert | 40 | 40 | 40 | 40 |
| adult | 40 / 40 | 39 / 40 | 39 / 40 | 40 / 40 |
| kid | 27 / 40 | 27 / 40 | 23 / 40 | 38 / 40 |
Easy fewer lives than Normal for every bot on every input (castBots-2-2-*-aim.txt). History, all kept: castBots-2-2-{touch,pad,fake}.* (180,
no aim: kid N 20/20/18, adult N 28 each: the phase lock), *-golden.* (the golden-turn aim, superseded).
THE LOCK (phase.ts, adult N seeds 4/16/31/33 before the aim): drowned at deepBeat22, put back and back again in 6.2-6.5 s = two breaths of
3.2 s, so every try met the pair at the same bad moment until the rescue; the 80 px per big pad shifted about half the seeds onto it (with
only big.w back to 260: kid 38 / adult 40 again). FIXED in the engine (breathAim.ts): adult N 28 -> 40 (touch).
Kid N traced (seed 15, touch): deep22 (small-big-small weight pads, 120 gaps): a first-timer whose thumb never lets go lands 55 px deep into
a pad after a full-jump flick and runs off its end (x 28922 past the big pad's 28889, 29175 past the last small's 29139). Child N touch
seed 9: the same run-offs in deep22 (~20 lives, one rescue). Size sweep (touch, child): 260 40/40 (277 lives), 200 40 (281), 190 40 (287),
180 39 (299): the margin, not the size.

## 5. Gates
UNRUN on the final head (see EXACT NEXT STEP 3). Run so far on code heads: tsc green; padArt/padHop/breathAim/padRide/castBots/padSection tests green.

## 6. 2-2.md replacement text (lines 9-11, for its owner)
**Flown** (reference/qa-reports/FIX-284/hopReal.ts, the real engine through the game's InputEngine): a touch flick is a full jump by
design, 19 frames (0.63 s), 175 px at a run, 97 px up; the Pad button's tap (PAD_HOP_MS) is the shortest hop any player makes, 13 frames
(0.43 s), 119 px, 62 px up; a held jump 20 frames (0.67 s), 184 px, 98 px up; a chain of hops at a run makes 276 px/s on every control.
So a child's pad-to-pad (land, decide, press: about 0.2-0.4 s on the pad; the press leaves the pad the next frame) needs a pad that holds
1.0 s ... pads well inside a Pad tap apart (under 119 px edge to edge, and never so close that a touch flick's 175 px overshoots the next
floor) in the teach, up to a held jump (184 px) after.

## Polish check
Show-first pair judged (stills/pair-*.png; the lead judged pad85 + crown99). Finals with the frozen clock: OWED (step 2). The respawn clip: being judged at the stop (step 1).

## Lessons applied
D41 (Pokey's drawn height 89.1, from the code), D19 (the hop test calls the engine through the game's own InputEngine, not a copy),
D59/D87 (every long run in the background; inbox read between steps), D86 (the CLAUDE.md list, every item), D81 (drawcheck 2-2 both ways:
pads redrawn), D40 (ENG-285's model merged first, so the hop work is not built on a model about to change), D30 (times from `date`).

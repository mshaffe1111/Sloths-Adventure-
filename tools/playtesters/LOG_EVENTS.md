# Control-test log: event guide for the QA team

The control test (`#ctest` in the address) records each tester's run and sends it to the Google Sheet every 20 s, and again when the
page is hidden or closed. This guide covers the **event lines**, which are where the game reports glitches it noticed on the tester's
phone.

## Where the lines are

Each sheet row is one part of a session: arrival time, nickname, session id, part number, device line, build, seconds covered, data.
The data cell starts with `gz64:` (gzip, then base64) or `raw:` (plain). Decoded, it is a JSON array of lines:

| Line | Meaning |
|---|---|
| `['d', t, finger, x, y, size]` | finger down (screen px, touch size) |
| `['m', t, finger, x, y]` | finger moved 2 px or more |
| `['u', t, finger, x, y]` / `['c', t, finger]` | lifted / cancelled by the system |
| `['i', t, intent, arg?]` | what the touch rules decided (move, duck, jump, jumpUp, punch, kick, mega); in Dot's flight also `flap`, `flap empty`, `hover tap`, `hover hold` (see below) |
| `['p', t, x, y, vx, vy, state]` | Pokey: `g` ground, `a` air, `c` climb, `s` swing, `h` hang, `k` duck, then `:move` and `/LRUD` held. **In Dot's flight (4-D) this is Dot**: a state starting with `d` (see below) |
| `['e', t, name, detail?]` | **an event**: everything below |

`t` is ms since the tester pressed Start. Pokey's `x` / `y` are world px; the level starts at x 0 and y grows downward.

Each detail is one short string of space-separated `key value` or `keyvalue` pieces. Split on spaces to parse it.

## Rate limits

Every glitch event below is limited to **one line per second per name**, up to a cap per session. When lines arrive too fast, the most
recent one is kept and logged when the second is up, stamped with the time it happened, so a
few lines can sit up to a second out of order (sort by `t`). A line that ends in **`+n`** means n more of the same name happened since the last
line and were dropped. When a name reaches its cap, the log says `capped <name>` once, and that name logs nothing more for the session.

Caps: err 30, stall 120, long 80, hidden 60, shown 60, screen 40, fullscreen 30, contextlost 10, contextrestored 10, quality 30,
blank 80, camjump 40, blink 30, jitter 40, flipflop 40. Any other name: 50.

## Glitch events

### Errors

| Name | Detail | Meaning |
|---|---|---|
| `err` | `<where> <message> @<file>:<line>:<col>` | A JavaScript error. `where`: `js` (uncaught), `promise` (unhandled rejection), `frame` (thrown in the game loop; the loop carries on, and 20 in a row end the stage), `ui` or `ui:<Component>` (a screen crashed and the player saw "Pokey tripped over a root!"), `res` (`load failed: <img> name.webp`, a file that would not load). About 160 characters at most. The same message is logged at most 3 times a session. File names are the built bundle's (for example `index-abc123.js`), so match them to the build in the row. |

### Freezes

| Name | Detail | Meaning |
|---|---|---|
| `stall` | `<ms>ms x<pokeyX> q<quality> [after <sheet>]` | One frame took more than 100 ms. `after` names a picture sheet that finished loading in the 1.5 s before, which is the usual cause. |
| `long` | `<ms>ms x<pokeyX> [menu]` | The browser was blocked for 100 ms or more (Chrome and Android only; iPhones never send it). `menu` means no stage was running. Shorter blocks of 50 to 99 ms are only counted, in the `fps` line's `lt`. |
| `hidden` | `x<pokeyX>` | The page went out of view: another app, the lock button, a call. |
| `shown` | `away <s>s` | The page came back after that many seconds. A gap between `hidden` and `shown` is time away, **not a freeze**. The first frame after a return is never logged as a stall. |

### Screen

| Name | Detail | Meaning |
|---|---|---|
| `screen` | `<W>x<H> <orientation> dpr<ratio> canvas <w>x<h> q<quality>` | The window changed size: the phone turned, a browser bar came or went, or full screen started or ended. Logged once it settles (0.4 s). `W`x`H` is in CSS px; `canvas` is the backing size in device px, which is what the game draws at. Orientation is `portrait`, `landscape`, `portrait2` or `landscape2` (the upside-down ones). |
| `fullscreen` | `on`/`off` `<W>x<H>` | Full screen started or ended (the game asks for it on the first tap; iPhones can't). |
| `contextlost` | `x<pokeyX> q<quality> <w>x<h>` | The phone took the canvas's memory away and the picture goes blank. This is usually memory pressure: check the `mem` lines just before. |
| `contextrestored` | `x<pokeyX>` | The canvas was given back. |
| `quality` | `q<from>→<to> slow avg <ms>ms`, `q<from>→<to> steady avg <ms>ms`, or `polish <from>→<to> slow avg <ms>ms` | The automatic quality changed. `q` is resolution (0 sharpest, 2 lightest); `polish` is the effects tier (bloom, rim light, wind), which goes first. `slow`: the last 1.2 s averaged over 40 ms a frame. `steady`: about 10 s at a good pace, so it steps back up. `avg` is the last window's average frame time. A `q` change resizes the canvas, so the picture jumps in sharpness at that moment. |

### Stutter: the 5-second lines

| Name | Detail | Meaning |
|---|---|---|
| `fps` | `<n>fps p90 <ms>ms max <ms>ms q<quality> <w>x<h> slow <count> sd <ms>ms [lt <count>] \| <sound>` | Every 5 s of play. `fps`: should be about 30 (the game is locked at 30 on purpose). `p90`: 9 frames in 10 were at least this quick. `max`: the worst frame. `slow`: frames over 50 ms (a missed beat). `sd`: the spread of frame times. About 0 to 3 ms is even pacing; over 8 ms is uneven, a stutter, even when `fps` looks fine. `lt`: long tasks of 50 ms or more in the window (Chrome and Android only). After the `\|` comes the sound engine's own line. |
| `mem` | `[<used>/<total>MB] parts <n> foes <n> items <n>` | Every 5 s. Memory is JavaScript heap in MB (Chrome and Android only), then live particles, enemies and pickups. A steady climb means a leak. |
| `sheet` | `<file> <ms>ms` | A picture sheet finished loading and decoding, and how long that took. From builds after 2026-10-26 a stage's own sheets are loaded, decoded and drawn once before it starts (behind the world map, the stage-cleared card, a story or a boss intro, `src/game/stagePreload.ts`), so their `sheet` lines usually come before the stage begins, not in its first seconds. |

### Flicker (likely causes; the game can't see pixels)

| Name | Detail | Meaning |
|---|---|---|
| `blank` | `wait <sheet>[, wait <sheet>…] x<pokeyX>` or `fail <sheet> …` | During a stage, something needed a picture sheet that wasn't loaded yet, so it was drawn as a plain stand-in (or not drawn) until the sheet arrived. The matching `sheet` line says when it arrived. `fail`: the sheet failed to load; it is retried after 4 s. Each sheet is logged once per stage, and the sheets asked for within the same second share a line. A few at the very start of a stage are normal on a first visit. One in the middle of a stage is a visible pop-in. |
| `camjump` | `dx<px> dy<px> x<pokeyX> y<pokeyY> <state>` | The camera moved more than 120 world px in one frame. Respawns, window resizes and teleports (Pokey moving 300 px or more in a frame, with 0.6 s grace after) are left out. The screen snapped. |
| `blink` | `<component> x<pokeyX>` | A HUD piece or overlay was shown more than 4 times in 2 s, flashing on and off. Components: `wayside` (Dot's line at the top), `journal` ("new journal page" toast), `badge` (badge toast), `coach` (first-stage touch lesson), `lesson` (lesson card). |

### Vibrating (jitter)

| Name | Detail | Meaning |
|---|---|---|
| `jitter` | `<axis> n<turns> span<px> x<pokeyX> y<pokeyY> <state>` | Something shook back and forth: within 1 s its motion reversed more than 6 times (`n`), and all the turns lay within 12 px (`span`). Moves under 0.5 px don't count. `axis`: `cam-x` / `cam-y` (the camera; never counted during an intended screen shake) or `pokey-x` / `pokey-y` (Pokey himself). `state` is Pokey's state letter, as in the `p` lines. `pokey-x` can also be a tester rapidly tapping left and right; check the touch lines. |
| `flipflop` | `<a>↔<b> n<changes> x<pokeyX> y<pokeyY>` | Pokey's state see-sawed: more than 6 changes in 1 s while he stayed within 24 px. For example, `g↔a` is standing and falling at a platform's edge, and `c↔a` is grabbing and losing a trunk. |

## Other events (play, not glitches)

| Name | Detail |
|---|---|
| `start` | `<W>x<H>; <controls>`: the window size and the control style at Start |
| `controls` | the tester switched control style (`pad on the left/right` or `screen gestures`) |
| `rules` | `refined` or `old` touch rules |
| `difficulty` | the difficulty picked |
| `mix` | the test stage's layout seed (`?mix=<seed>` rebuilds it) |
| `look` | at each stage start: `newLook 1` or `newLook 0` (the New HUD and Dot beta on or off) and `help teach`, `help reminders` or `help quiet` (Dot's help setting) |
| `section` | the stretch of the test stage Pokey entered (from builds after 2026-10-26: only once he is 40 px into it and has stayed 0.5 s, and not while still swinging, so a swing over the line no longer flips it back and forth; `src/game/sectionTrack.ts`) |
| `checkpoint` | checkpoint reached (its x) |
| `hurt` | hit (hearts left) |
| `bossHurt` | in a boss fight, just before its `hurt` line: what hit him and what the boss was doing, `<by> <state> <move> <seconds into it>`. `by` is `strike` (an attack's own box), `body` (touching him) or `hazard:<kind>`; `state` is `tell`, `act`, `rec`, `stun`, `idle` or `roar` (e.g. `strike act pounce 0.96`) |
| `lostLife` | a life lost (`water`, `pit`, `hurt`, …) |
| `stomp` | stomped a foe (its type, or `boss`) |
| `stuckHelp` | the game helped him out of a stuck spot (x) |
| `finish` | reached the end (game time) |
| `survey` | the tester's answers (JSON) |
| `playAgain` / `quit` | the tester's choice at the end |
| `capped` | `<name>`: that glitch event reached its cap and logs nothing more this session |

## Dot's netting flight (4-D)

From builds after 2026-10-26, while Dot flies her netting stage the `p` lines are **her**, not Pokey (before that they showed Pokey
parked off stage, and there were no sections, checkpoints or finish). Her `x` / `y` are world px of her stage (y grows downward; the
netting overhead is near y 70 and the mist below at y 925). `src/game/dotRecord.ts`.

| State | Meaning |
|---|---|
| `df` | rising on a flap |
| `dh` | hovering (a tap's buzz, or the thumb kept down after a flap) |
| `ds` | sinking or cruising (wings out, no hover) |
| `dd` | drinking at a flower |
| `dt` | tired: out of nectar, she can't flap or hover, only sink and steer |
| `dw` | waiting: hanging still at the start, or after being brought back, until the player moves |
| `dg` | through the folded-letter gap (the stage is over) |

Then `/L` or `/R` when the thumb is steering.

| Name | Detail |
|---|---|
| `section` | the beat she entered (`Learn: flap`, `Develop: iron thorns`, `Twist: the downdraft`, `Finish: the folded-letter gap`, …), with the same 40 px / 0.5 s hysteresis as Pokey's |
| `checkpoint` | `<x> f<id> drink`: her first drink at that flower (it is her checkpoint now); `<x> f<id> pass`: she flew on past it, which also makes it her checkpoint; `<x> f<id> respawn` (or `<x> start respawn`): brought back there after a lost life or the mist |
| `scratch` | `<scratches so far> x<x>`: an iron thorn. The `hurt` line (hearts left) follows as usual |
| `mist` | `x<x>`: she fell into the mist (a heart, and back to her checkpoint) |
| `nectar` | `<0..100> flaps <in hand>`: her nectar, every 5 s (the wings hold 3 flaps; a fraction is one on its way back) |
| `empty` | `x<x>`: her nectar ran out |
| `silk` | `<found>/<all>`: a piece of spider silk |
| `gap` | `x<x>`: the slow squeeze at the folded-letter gap began |
| `finish` | through the gap (game time, s) |
| `i flap` / `i flap empty` | a flap she made / a flap asked for with no nectar left |
| `i hover tap` / `i hover hold` | a tap's hover buzz / the thumb kept down after a flap took over as a hover (once each time) |

## Reading a glitch report: quick map

- **"It froze."** Look for `stall` and `long` near that time. A `hidden`/`shown` pair means they left the app. `after <sheet>` or a
  `sheet` line just before points to a picture decode.
- **"It went black or blank."** Look for `contextlost`, `mem` climbing just before it, and `err ui`.
- **"It was choppy or stuttering."** Look at the `fps` lines: low fps, high `sd`, many `slow`. Then look for `quality` steps.
- **"It flickered or flashed."** Look for `blank` mid-stage, `camjump`, `blink`, and `quality` q changes (the resolution switching).
- **"It was vibrating or shaking."** Look for `jitter` (which axis) and `flipflop` (which states, and where).
- **"The screen went weird after turning."** Look for `screen` lines (the canvas should be the window times dpr, with dpr capped at 2, 1.5
  or 1 for q0, q1 or q2), and `fullscreen`.

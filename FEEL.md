# Feel sheet: movement, input, camera, lives

Source: repository at origin/main, commit `11242520`. Every path is relative to the repository root. `file:line` points at the defining line.

## 0. Units and the tick

| Item | Value | Source |
|---|---|---|
| World units | px (world px). Touch thresholds are CSS px of the screen (`clientX/clientY`). World px to screen px = zoom (section 9). | `src/components/TouchController.tsx:44-66` |
| Frame lock | 1000/30 ms = 33.33 ms. A frame is drawn when ≥ 31.33 ms have passed (interval − 2 ms). | `src/game/engine.ts:509`, `:1252` |
| Simulation step (tick) | One `update(dt)` per drawn frame; dt = real elapsed time (≈ 1/30 s at a steady 30 fps). A frame ≥ 1.5 × 33.33 ms (50 ms) is split into up to 3 equal steps; each step is capped at 0.05 s. Elapsed > 150 ms runs slower than real time. | `src/game/engine.ts:1260-1261`, `:1269-1283` |
| `STEP = 1/60` | Declared; no other reference in `engine.ts` (the update path above uses dt = elapsed). A comment at `physics.ts:161` states 60 Hz. | `src/game/engine.ts:511`, `src/game/physics.ts:161-162` |
| Game-speed option | dt × 1, 0.9 or 0.8 (menu). | `src/game/assist.ts:13`, `src/game/engine.ts:712`, `:1276` |
| Conversion used below | per-frame = per-second / 30; "frames" = seconds × 30. All per-frame figures assume a steady 30 fps. | — |
| Integration order per tick (air/ground) | steer → coyote/buffer → jump → release cut → gravity (+apex hang) → max-fall clamp → glide → x += vx·dt, y += vy·dt → collisions/landing. | `src/game/engine.ts:2117-2253`, `:2363-2425` |

All jump/fall figures below marked "30 fps sim" come from stepping exactly this order at dt = 1/30 (scratch simulation of the code's formulas). "Analytic" = continuous formula.

Player body: width 44, height 48 (collision box); wall half-width 19. `src/game/engine.ts:953-954`, `:2277`

## 1. Run, ground and air control

| Quantity | Value | Per frame @30 | Source |
|---|---|---|---|
| Max run speed | 285 px/s | 9.5 px | `src/game/physics.ts:9` |
| Ground acceleration | 2600 px/s² | +86.7 px/s | `src/game/physics.ts:10` |
| 0 → max (ground) | 4 ticks (86.7, 173.3, 260, 285) = 0.133 s | — | computed from above |
| Ground deceleration (no input) | 3400 px/s² | −113.3 px/s | `src/game/physics.ts:11`, `src/game/engine.ts:2161` |
| Max → 0 (ground) | 3 ticks (171.7, 58.3, 0) = 0.1 s | — | computed |
| Ground turn | 2600 + 2200 = 4800 px/s² while reversing and \|vx\| > 20 | +160 px/s | `src/game/physics.ts:12`, `src/game/engine.ts:2147-2148` |
| Air acceleration | 1700 px/s² | +56.7 px/s | `src/game/physics.ts:13` |
| Air turn | 1700 + 900 = 2600 px/s² | +86.7 px/s | `src/game/physics.ts:16`, `src/game/engine.ts:2148` |
| Air, no direction held (default controls) | 0 (speed kept) | 0 | `src/game/engine.ts:2161`, `src/game/refinedControls.ts:177-185` |
| Air, down held, no direction | 1300 px/s² | −43.3 px/s | `src/game/physics.ts:15`, `src/game/engine.ts:2161` |
| Air, no direction, `?refined=0` | 1300 px/s² | −43.3 px/s | same |
| Over-speed bleed (≥ max speed, direction held) | 520 px/s² (air and ground; 3400 on ground during an attack) | −17.3 px/s | `src/game/physics.ts:14`, `src/game/engine.ts:2152-2155` |
| Steady "full run" | vx alternates 285 → 267.67 → 285 each tick: at exactly max speed the `else` branch subtracts 17.33, next tick re-accelerates and clamps. Mean ≈ 276.3 px/s (9.21 px/frame). Same in air. | — | `src/game/engine.ts:2149-2155` |
| Take-off tick | no ground braking on the tick a jump is pressed | — | `src/game/engine.ts:2160-2161` |
| Duck (grounded, down held) | decelerates at 3400 px/s² | −113.3 px/s | `src/game/engine.ts:2119-2122` |
| Speed modifiers | speed power-up ×1.4; slow ×0.45; web/mud/spore drags (other worlds) | — | `src/game/engine.ts:2130` |
| Stage-start steering lockout | 0.5 s (steer read as 0) | 15 frames | `src/game/engine.ts:734`, `:2132`, `:1748` |
| Ledge-end standing pose | drawn ≤ 12 px inside the end; drawn slide-back 40 px/s; snap back 600 px/s (drawing only) | 1.33 / 20 px | `src/game/physics.ts:59-64`, `src/game/engine.ts:2168-2175` |
| Lip hoist ("mantle") | onto a solid face whose top is ≤ 26 px above the feet, when vy ≥ −120 px/s | — | `src/game/physics.ts:41-42`, `src/game/engine.ts:2295` |


## 2. Gravity and falling

| Quantity | Value | Per frame @30 | Source |
|---|---|---|---|
| Gravity while rising (vy < 0) | 1900 px/s² | +63.3 px/s | `src/game/physics.ts:21`, `src/game/engine.ts:2237` |
| Gravity while falling (vy ≥ 0) | 2500 px/s² | +83.3 px/s | `src/game/physics.ts:22` |
| Apex hang | gravity × 0.72 while \|vy\| < 90 px/s **and** jump held → 1368 (rising) / 1800 (falling) px/s² | +45.6 / +60 px/s | `src/game/engine.ts:2238` |
| Max fall speed | 950 px/s | 31.7 px | `src/game/physics.ts:23`, `src/game/engine.ts:2240` |
| Time / distance to max fall from rest | 0.38 s (11.4 frames) / 180.5 px (950² / (2·2500)) | — | computed |
| Hard-landing haptic threshold | landing at ≥ 560 px/s | — | `src/game/engine.ts:197` |
| Landing dust | landing at > 260 px/s | — | `src/game/engine.ts:2440` |

## 3. Jump

| Quantity | Value | Source |
|---|---|---|
| Launch speed | 640 px/s (21.3 px per frame); the take-off tick rises 19.2 px (640 − 63.3, × 1/30) | `src/game/physics.ts:18`, `src/game/engine.ts:2194` |
| Release cut | jump not held and vy < −230 → vy = −230 (not applied to launches flagged `launched`: mushroom, stomp, trunk/rope leaps, swim leap) | `src/game/physics.ts:20`, `src/game/engine.ts:2231-2234` |
| Rise left after a cut | 230² / (2·1900) = 13.9 px (analytic) | computed |
| Touch minimum hold | every touch jump counts as held for 220 ms of game time from take-off (= released on the 7th tick after take-off at 30 fps) | `src/game/inputEngine.ts:13`, `:330-347`, `:366-385`, `:512-518` |
| On-screen Pad Jump button minimum hold | 80 ms (released on the 3rd tick) | `src/game/padControl.ts:115` |
| Keyboard | held exactly as long as the key; double press of Up within 340 ms re-presses while held | `src/game/inputEngine.ts:158-171`, `:204-207` |

Height and length on flat ground (land at take-off height):

Analytic, full hold, no hang: rise h = v²/(2·g_up) = 640²/3800 = **107.8 px**; time up = 640/1900 = 0.337 s; time down = √(2h/g_down) = √(215.6/2500) = 0.294 s; airtime 0.630 s; length at 285 px/s = 285 × 0.630 = **179.7 px** (`src/game/physics.ts:133`, `:137`).

| Input (30 fps sim, engine order) | Apex | Airtime | Length from full run |
|---|---|---|---|
| Held the whole time (keyboard, gamepad) | 97.8 px | 20 frames (0.667 s) | 184.2 px |
| Touch flick (220 ms minimum hold) | 97.2 px | 19 frames (0.633 s) | ≈ 175 px |
| Pad Jump tap (80 ms minimum hold) | 61.7 px | 13 frames (0.433 s) | ≈ 120 px |
| Released before the take-off tick (keyboard tap) | 10.3 px | 6 frames (0.2 s) | ≈ 55 px |

Notes:
- The 30 fps sim apex is ~10 px under the analytic 107.8 px (discrete step: velocity is updated before position). The Pad file states the same 62 / 98 px (`src/game/padControl.ts:112-113`).
- Jump from a ledge during coyote time adds the distance run before the press (section 5).
- Standing touch flick leaning ≥ 35° off vertical: carries him that way at 0.75 × 285 = 213.75 px/s max (`src/game/engine.ts:5944-5948`, `src/game/physics.ts:89`, `src/game/engine.ts:2144`, `src/game/touchGestures.ts:228`).
- Touch, standing beside a solid step 20–96 px tall within 14 px (World 5 option `stepHelp`): a straight flick is carried onto it (`src/game/engine.ts:287`, `:5971-5985`).

## 4. Double jump

| Quantity | Value | Source |
|---|---|---|
| Trigger | a second jump press while airborne with `jumpsLeft > 0` (and not climbing); restored to 2 on landing | `src/game/engine.ts:2207-2218`, `:2417` |
| Base launch speed | 540 px/s | `src/game/physics.ts:19` |
| Early-stage boost | × (1 + 0.12 × a), a = early-stage help share | `src/game/physics.ts:70`, `src/game/engine.ts:2208` |
| a on stage 1-1 | 1 (Normal: a = max(0, 1 − (m − 1)/24), m = stage number 1..100 → 0 from stage 25 = 3-5; Easy: a = 1 on every stage) | `src/game/physics.ts:50-52`, `src/game/engine.ts:6017-6023` |
| Launch speed on 1-1 (both settings) | 540 × 1.12 = 604.8 px/s | computed |
| Combination rule | rising: v = −√(vy² + v2²) (heights add); falling: v = −v2 | `src/game/physics.ts:128-130` |
| Release cut / touch hold | same as the first jump (cut to 230 px/s if released; touch hold 220 ms from the second take-off) | `src/game/engine.ts:2232`, `src/game/inputEngine.ts:383` |
| Touch: "Jump help" setting (default Off) | Off: second jump needs a flick by the normal rules. On / On + forward: shorter slides count (section 8). On + forward: a second jump with no steer pushes forward at 0.75 × run (not on climb or boss stages) | `src/game/jumpHelp.ts:96-104`, `src/game/engine.ts:5949-5957` |

| Double jump (30 fps sim, from full run 285 px/s) | v2 = 604.8 (1-1) | v2 = 540 (Normal from stage 25) |
|---|---|---|
| Analytic max rise (h1 + v2²/(2·1900)) | 107.8 + 96.3 = 204.0 px | 107.8 + 76.7 = 184.5 px |
| Sim max apex, held | 189.8 px | 170.6 px |
| Sim max apex, touch 220 ms holds | 187.0 px | 169.5 px |
| Sim max length (same height), held | 340.5 px (2nd press on tick 16, 37 frames air) | 331.6 px (tick 18, 36 frames) |
| Sim max length, touch 220 ms holds | 331.6 px (tick 17, 36 frames) | 313.2 px (tick 16, 34 frames) |

Visual: somersault 14 rad/s during the double jump (`src/game/engine.ts:2227`).

## 5. Coyote time, jump buffer, landing tolerance

Values in seconds of game time; frames at 30 fps. "1-1" uses a = 1 (section 4).

| Item | Normal, a = 0 (stage 25+) | Normal 1-1 | Easy (all stages) | Source |
|---|---|---|---|---|
| Coyote (jump after leaving a ledge) | 0.133 s + 0.001 → 4 airborne ticks | 0.133 + 0.08 + 0.001 = 0.214 s → 6 ticks | 0.167 + 0.08 + 0.001 = 0.248 s → 7 ticks | `src/game/physics.ts:41-42`, `:68`, `src/game/engine.ts:2181-2186` |
| Jump buffer (press in air with no jump left; fires on landing) | 0.133 s (≈ 4 frames) | 0.233 s (≈ 7 frames) | 0.2 + 0.1 = 0.3 s (≈ 9 frames) | `src/game/physics.ts:41-42`, `:69`, `src/game/engine.ts:2188-2190`, `:2219-2222`, `:2422-2433` |
| Press kept by input layer before the engine reads it | 0.133 + 1/30 = 0.167 s | 0.167 s | 0.2 + 1/30 = 0.233 s | `src/game/inputEngine.ts:19`, `:520-527` |
| Buffered landing jump speed | 640 px/s | 640 | 640 | `src/game/engine.ts:2424` |
| Ledge catch, centre past edge | 0.26 × 44 = 11.4 px | (0.26 + 0.1) × 44 = 15.8 px | 15.8 px | `src/game/physics.ts:71`, `src/game/engine.ts:2381` |
| Ledge catch, falling foot misses edge by | ≤ 8 px (needs ≥ 30 px/s toward it; nudged on) | ≤ 8 px | ≤ 12 px | `src/game/physics.ts:41-42`, `src/game/engine.ts:2384-2392`, `:2403-2409` |
| Landing from above: previous-tick feet ≤ top + | 14 px | 14 + 6 = 20 px | 20 px | `src/game/physics.ts:72`, `src/game/engine.ts:2382`, `:2395` |

Buffer applies only when no air jump remains: with the double jump still available, a press in the air is the double jump (`src/game/engine.ts:2193-2222`).

## 6. Other moves

### Mushroom bounce (`bouncy` platform, World 1 art)

| Quantity | Value | Source |
|---|---|---|
| Launch | 830 px/s on landing on it; no release cut; 1 air jump left | `src/game/physics.ts:24`, `src/game/engine.ts:2443`, `:4893-4902` |
| Height | analytic 830²/3800 = 181.3 px; 30 fps sim 167.6 px (168.1 held) | computed |
| Airtime to same height | 24–25 frames (0.80–0.83 s) | 30 fps sim |

### Stomp and hits

| Quantity | Value | Source |
|---|---|---|
| Stomp rebound | 460 px/s; 620 if jump held; 700 for a dive stomp (down held); 0.3 s safe after | `src/game/engine.ts:4601`, `:4621` |
| Armored stomp rebound | 430 px/s | `src/game/engine.ts:4610` |
| Air-kick hit rebound | 420 px/s | `src/game/engine.ts:4210` |
| Attacks (startup / active / recovery s; damage) | jab 0.06/0.08/0.14, 1; cross 0.05/0.08/0.14, 1; hook 0.10/0.09/0.22, 2; mega 0.18/0.12/0.26, 3; kick 0.08/0.10/0.17, 2; air kick 0.05/0.22/0.10, 2 | `src/game/fight.ts:81-117` |
| Run speed while attacking (grounded) | × moveMul: jab 0.85, cross 0.8, hook 0.55, mega 0.3, kick 0.6 | `src/game/fight.ts:86-110`, `src/game/engine.ts:3891-3895` |
| Touch jab hold-back | a touch jab waits in its wind-up 100 ms (can be cancelled, section 8) | `src/game/engine.ts:3922`, `:3945` |
| 1-1 creatures | none (`creatures: []`) | `src/game/gen2/worlds/w1.ts:1470-1478` |

### Trunk climb (`tree_climb` vine)

| Quantity | Value | Source |
|---|---|---|
| Climb speed up/down | 220 px/s (7.33 px/frame) | `src/game/engine.ts:1865`, `:1872` |
| Grab grace (jump ignored) | 0.3 s | `src/game/engine.ts:1838`, `:1849` |
| Carry after grab | 0.45 s of climb with nothing held | `src/game/engine.ts:1842` |
| Leap off (jump) | vx 330, vy −600 px/s, 2 air jumps, no cut; re-grab blocked 0.42 s | `src/game/physics.ts:25`, `src/game/engine.ts:1902-1923` |
| Hop off (side held, not climbing) | after 0.2 s (keyboard) / 0.35 s (touch, Pad); vx 240, vy −330 | `src/game/physics.ts:26`, `src/game/engine.ts:1926-1937` |
| Top vault | within 12 px of top; vy −190, vx 160 | `src/game/engine.ts:1880-1893` |
| Touch on a trunk | straight up/down = climb; a steer starts only on a stroke ≥ 40 px sideways, ≥ 2× across vs vertical, ≥ 0.3 px/ms | `src/game/touchGestures.ts:225-226`, `:835-839`, `:871-876` |

### Shimmy rope (learned by clearing 1-3; may be required from 1-4)

| Quantity | Value | Source |
|---|---|---|
| Speed along rope | 120 px/s | `src/game/rope.ts:8`, `src/game/engine.ts:4819` |
| Hang drop under rope | 86 px | `src/game/rope.ts:10` |
| Hop off (jump) | vx 230 toward lean/steer/facing, vy −0.82 × 640 = −524.8 px/s, no cut | `src/game/engine.ts:4837-4848` |
| Drop (down) | vy +60 | `src/game/engine.ts:4852-4855` |
| Grab grace | 0.25 s | `src/game/engine.ts:4802` |
| Unlock | `src/game/skills.ts:28-38` | |

### Leaf glide (learned by clearing 4-1; may be required from 4-7)

| Quantity | Value | Source |
|---|---|---|
| Trigger | jump held while falling > 40 px/s for ≥ 0.1 s | `src/game/glide.ts:14-16`, `:66-68` |
| Fall cap | 125 px/s (4.17 px/frame) | `src/game/glide.ts:10` |
| Braking toward cap | 4200 px/s² (−140 px/s per frame) | `src/game/glide.ts:18`, `:79-81` |
| Duration per flight | 1.35 s; refilled by landing or any upward launch ≥ 200 px/s | `src/game/glide.ts:12`, `:20`, `:66` |
| Drop covered at cap over 1.35 s | 168.75 px; across at 285 px/s: 384.75 px (2.28 px across per px down) | computed |
| Jump + glide from full run, flat ground (30 fps sim) | 322.1 px, 35 frames | computed |
| Warm-air lift (World 9 vents, World 4 updrafts) | 2000 px/s² up, max 240 px/s up | `src/game/glide.ts:22-23` |

### Swinging liana (Worlds 6+)

| Quantity | Normal | Easy | Source |
|---|---|---|---|
| Swing period (there and back) | 2.85 s | 3.3 s | `src/game/physics.ts:453`, `:470-475` |
| Amplitude | 0.45 rad (≈ 26°) either side | same | `src/game/physics.ts:458` |
| Grab distance from vine line | 60 px | 76 px | `src/game/physics.ts:466`, `:470-475` |
| Release window (share of swing) | −0.15 to 0.9 | −0.4 to 1.2 | `src/game/physics.ts:463-464`, `:470-475` |
| Late / early press forgiveness | 0.36 s late, 0.32 s early | same | `src/game/physics.ts:672` |
| Leap in window | vx 340–520 (\|vx\| × 1.15 + 120), vy −560 to −760 | same | `src/game/physics.ts:363-376`, `:689-695` |
| Let-go out of window | vx ≤ 300 (≥ 130 if the flick leaned), vy ≥ −380 | same | `src/game/physics.ts:643`, `:662-663` |
| Climb on vine | 150 px/s | same | `src/game/physics.ts:370` |
| Grab grace | 0.25 s | same | `src/game/engine.ts:1966` |

### Swim (calm water, Worlds 6+)

| Quantity | Value | Source |
|---|---|---|
| Speed / accel / decel | 150 px/s / 900 / 650 px/s² | `src/game/swim.ts:35-37` |
| Splash loss on entry | vy × 0.35 | `src/game/swim.ts:42` |
| Dive | 40 px deeper, auto-surface after 3 s | `src/game/swim.ts:44-45` |
| Leap out | 640 px/s, no cut | `src/game/swim.ts:47`, `src/game/engine.ts:5831-5838` |
| Climb-out bank height | ≤ 70 px over the water top | `src/game/swim.ts:49` |

### Crumbling platform (`fragile`)

| Quantity | Value | Source |
|---|---|---|
| Time from first standing to break | 1.1 s default (per-platform `crumbleAfter` overrides) | `src/game/engine.ts:2448` |
| Regrow | 30–35 s, only ≥ 80 px off screen | `src/game/regrow.ts:10-14` |
| On respawn | every crumbled platform is restored | `src/game/engine.ts:5069-5075` |

## 7. Touch input: how gestures are told apart (Screen mode, default)

Distances are CSS px and are divided by the Sensitivity setting (0.75–1.35, default 1); palm, edge and near-thumb sizes are not scaled (`src/game/touchGestures.ts:238-252`, `src/game/controlPrefs.ts:62-69`). Speeds are px per ms (1 px/ms = 1000 px/s).

### Roles

| Rule | Value | Source |
|---|---|---|
| Steering half | left 50 % of screen (mirrored if steering hand = Right; default Left) | `src/game/touchGestures.ts:123`, `:504-508`, `src/game/controlPrefs.ts:76-79` |
| First finger on steering half | steers at once ("mover") | `src/game/touchGestures.ts:511-525` |
| First finger on other half | undecided until judged | same |
| Second finger while one steers | "action" finger; ignored if < 45 px from steering thumb; 45–70 px: taken, never a hold-mega | `src/game/touchGestures.ts:113`, `:121`, `:512-518` |
| Touch starting ≤ 6 px from a side edge | ignored until it moves 8 px | `src/game/touchGestures.ts:118-119`, `:477-483`, `:533-540` |
| Hold/undecided clock | recogniser ticked every 30 ms while a finger is down | `src/components/TouchController.tsx:78-95` |
| Event time | browser `timeStamp` of the touch event | `src/components/TouchController.tsx:126-133` |

### Steering thumb

| Action | Rule | Source |
|---|---|---|
| Start running | 16 px from anchor | `src/game/touchGestures.ts:52`, `:885-887` |
| Stop | back within 9.6 px (0.6 × 16) of anchor | `src/game/touchGestures.ts:870` |
| Anchor follow | anchor trails the finger at 30 px; reversing from full right needs 46 px of travel | `src/game/touchGestures.ts:54`, `:860-868` |
| Jump | finger > 34 px above anchor with upward speed ≥ 0.15 px/ms (or > 68 px at any speed); or a quick rise ≥ 26 px from its last low point at ≥ 0.35 px/ms, rise ≥ 0.6 × sideways (≤ ~59° off vertical), within 220 ms | `src/game/touchGestures.ts:56`, `:196-198`, `:214`, `:936-960` |
| Jump on lift (any finger) | last 150 ms rose ≥ 18 px at ≥ 0.4 px/ms, rise ≥ 1.2 × sideways travel | `src/game/touchGestures.ts:206-209`, `:1034-1048` |
| Duck | slide down > 42 px (> 60.9 px while running) from anchor, more down than across, and over the last 300 ms steeper than 45° (63° while running); release below 25.2 px | `src/game/touchGestures.ts:57-63`, `:906-930` |
| Run-direction lock after its own jump | 120 ms (and while flicking up ≥ 0.3 px/ms over 60 ms, ≥ 1.5 px up per px across) | `src/game/touchGestures.ts:220-223`, `:447`, `:843-853` |
| Kick on lift | only when an animal, boss or cage is within 260 px (centre to centre); lifted ≤ 250 ms, ≥ 46 px sideways, more sideways than vertical, ≥ 0.5 px/ms | `src/game/refinedControls.ts:188`, `src/game/touchGestures.ts:65-72`, `:629-636` |
| Tap → punch on lift | travel ≤ 22 px while standing, or ≤ 30 px mostly-sideways within 250 ms while running; ≤ 400 ms (or < 550 ms if no mega fired); not "flicked up" (peak speed ≥ 0.35 px/ms and rise ≥ 12 px) | `src/game/touchGestures.ts:80-81`, `:105-106`, `:211-212`, `:612-638`, `:1050-1075` |

### Undecided or action finger

| Action | Rule | Source |
|---|---|---|
| Jab at touch-down (action finger only) | punch fires as the finger lands; cancelled if it moves > 12 px within 100 ms | `src/game/touchGestures.ts:91-92`, `:487-500` |
| Flick up → jump | within 250 ms (moving) / 250 ms (lifting): rise ≥ 26 px, rise ≥ 0.85 × sideways (≤ ~50° off vertical), speed ≥ 0.6 px/ms (≥ 0.19 px/ms if judged as it lifts) | `src/game/touchGestures.ts:65-76`, `:214`, `:1144-1157` |
| Flick down → duck | ≥ 41.4 px down, steeper than 45°, same speeds | `src/game/touchGestures.ts:1148-1156` |
| Flick sideways | ≥ 46 px, more sideways than vertical, ≥ 0.8 px/ms (0.25 lifting): kick if something kickable is within 260 px; otherwise a lone finger starts steering; an action finger rising ≥ 24 px and ≥ 0.4 × sideways (≤ ~68°) jumps that way | `src/game/touchGestures.ts:1159-1192` |
| Becomes steering (sideways slide) | ≥ 16 px sideways and ≥ 1.2 × vertical, any time | `src/game/touchGestures.ts:190-191`, `:1210-1217` |
| Becomes steering (any drag) | after 210 ms with > 18 px moved | `src/game/touchGestures.ts:76-78`, `:1220-1226` |
| Hold → mega | still ≥ 550 ms, ≤ 20 px from start, < 6 px in last 50 ms | `src/game/touchGestures.ts:83`, `:93`, `:1055-1061`, `:1229-1237` |
| Tap → punch on lift | ≤ 22 px, ≤ 400 ms (or < 550 ms with no mega), not "flicked up" | `src/game/touchGestures.ts:672-684` |
| Re-plant ignore | a tap starting < 50 ms after the steering thumb lifted, within 100 px of that spot, does nothing | `src/game/touchGestures.ts:99`, `:677-681` |

### Lean of a jump

| Rule | Value | Source |
|---|---|---|
| Jump counts as leaning | ≥ 4 px sideways and ≥ 20° off vertical (tan 20° = 0.364) | `src/game/touchGestures.ts:143`, `:409-413` |
| Standing carry | ≥ 35° off vertical → carried at 0.75 × run | `src/game/touchGestures.ts:228`, `src/game/engine.ts:5946` |

### Second jump by touch

| Setting | Rule | Source |
|---|---|---|
| Jump help Off (default) | same flick rules as a first jump; a second jump locks the next for 160 ms | `src/game/jumpHelp.ts:104`, `src/game/touchGestures.ts:184`, `:398-400` |
| Jump help On | in the air: any finger moving up ≥ 16 px (≥ 0.85 × sideways); steering thumb ≥ 28 px; or a wiggle down ≥ 12 px then up ≥ 20 px at ≥ 0.25 px/ms; a finger that jumped and stays down: sink ≥ 12 then rise ≥ 20 px at ≥ 0.3 px/ms | `src/game/touchGestures.ts:127-142`, `:721-760`, `:964-984`, `:1196-1203` |

### On a trunk or liana (touch)

| Rule | Value | Source |
|---|---|---|
| Climb | ±16 px from anchor (anchor trails at 40 px) | `src/game/touchGestures.ts:1003-1024` |
| Let go (finger down) | over its last 150 ms: rise > 34 px, ≥ 0.44 px/ms along path, rise ≥ 0.3 px/ms, ≥ 21° off vertical, sideways ≤ 1.2 × rise, and not climbing (≥ 8 px rise slower than 0.44 px/ms) in the 100 ms before | `src/game/touchGestures.ts:151-170`, `:1077-1128` |
| Let go (whole touch, on lift) | ≤ 480 ms, rise ≥ 30 px, ≥ 0.4 px/ms, ≥ 20° off vertical | `src/game/touchGestures.ts:178-182`, `:694-716` |
| Straight flick up | climbs for 250 ms after lift | `src/game/touchGestures.ts:230`, `:600` |
| Swing: other thumb's sideways flick | lets go toward the flick | `src/game/touchGestures.ts:1162-1167` |

### Ways one gesture can be read as another (from the rules above)

| Gesture | Can be read as | Condition | Source |
|---|---|---|---|
| Second-finger flick | jab + jump | it moves ≤ 12 px in its first 100 ms (jab not cancelled) | `src/game/touchGestures.ts:487-500` |
| Short flick up (< 12 px rise, or peak < 0.35 px/ms) | punch | meets the tap rule on lift | `src/game/touchGestures.ts:1063-1075` |
| Tap that slides up ≥ 18 px quickly | jump, not punch | lift-flick rule | `src/game/touchGestures.ts:1034-1048` |
| Tap that drifts sideways ≤ 30 px while running | punch (a step nudged first) | nudge-tap rule | `src/game/touchGestures.ts:614` |
| Sideways swipe near an animal (≤ 260 px) | kick instead of run | kick-near rule | `src/game/refinedControls.ts:188`, `:629-636`, `:1159` |
| Resting finger ≥ 550 ms | mega | hold rule | `src/game/touchGestures.ts:1229` |
| Press 400–550 ms with no mega | punch | `tapLong` | `src/game/touchGestures.ts:1050-1052` |
| Tap < 50 ms after steering lift, ≤ 100 px away | nothing | re-plant | `src/game/touchGestures.ts:677-681` |
| Slow slide up by a lone undecided finger (help Off) | steering, not jump | needs ≥ 0.6 px/ms to be a flick | `src/game/touchGestures.ts:1148`, `:1220` |
| Running thumb rolling down 42–61 px | no duck while running | running duck threshold 60.9 px and 63° | `src/game/touchGestures.ts:909`, `:921` |

### Latency

| Component | Value | Source |
|---|---|---|
| Input → physics | the input flag is read at the next game update: 0–33.3 ms at 30 fps | `src/game/engine.ts:1456`, `:1243-1283` |
| Gesture travel | jump flick ≥ 26 px at ≥ 0.6 px/ms → ≥ 43 ms of finger travel; run start at 16 px; punch on touch-down for an action finger, on lift otherwise | `src/game/touchGestures.ts` (above) |
| Punch buffer / kick / mega buffers | 0.12 s / 0.14 s / 0.14 s | `src/game/inputEngine.ts:403`, `:421`, `:431` |
| End-to-end latency figure | not found in code | — |
| Haptics | jump 15 ms, punch 20, kick 25, mega 35 | `src/components/TouchController.tsx:58` |

### Other control modes

| Mode | Values | Source |
|---|---|---|
| On-screen Pad | run dead zone 14 px, knob radius 46, duck 32 px down, jump 38 px up (vertical > horizontal); on a trunk climb at 20 px, leap at ≥ 38 px up and ≥ 45° over; button hit area × 1.3; Jump min hold 80 ms; Punch held 320 ms → mega | `src/game/padControl.ts:8-24`, `:30-33`, `:91`, `:115`, `:118` |
| Gamepad | stick X ±0.35, Y ±0.4; A jump, X/Y punch, B kick, bumpers/triggers mega | `src/game/inputEngine.ts:445-470` |
| Keyboard | arrows/WASD, Space jump, J/Z punch, K/X kick, L/Shift mega | `src/game/inputEngine.ts:158-196` |

## 8. Lives, damage, falls, respawn, checkpoints

| Item | Value | Source |
|---|---|---|
| Lives per stage | 3 (+0, 2 or 4 from the Extra lives option) | `src/game/assist.ts:11-12`, `:79-81`, `src/game/engine.ts:705-706` |
| Extra-lives offer | after 3 Game Overs on one stage | `src/game/assist.ts:16` |
| Hearts | 5 (6 with the secret Thorn Heart) | `src/game/secret.ts:55`, `src/game/engine.ts:969-970` |
| Hit | −1 heart, knock vx 180 away from source, vy −420, 1.2 s invulnerable | `src/game/physics.ts:28`, `src/game/engine.ts:4871-4881` |
| 0 hearts | life lost | `src/game/engine.ts:4888-4890` |
| Water | feet > water line + 20 px → splash, "SPLASH!" text, life lost | `src/game/engine.ts:2508-2517` |
| Bottomless fall | feet > level height + 120 px → hurt sound, life lost (unless a soft put-back applies) | `src/game/engine.ts:2518-2523` |
| Life-lost beat | world holds 0.75 s; a dark circle closes on him from 0.225 s to 0.75 s; then respawn | `src/game/engine.ts:199`, `:4909-4945`, `:4954-4958` |
| Respawn | at last flag; hearts full; vx = vy = 0; 2 jumps; 2.0 s invulnerable; circle opens 0.45 s; steering ignored 0.35 s (ends on a fresh touch/key); camera cut; "N lives left" text 1.6 s; crumbled platforms restored | `src/game/engine.ts:200`, `:5048-5111` |
| Game Over → Continue | lives refilled at the last flag, stage progress kept | `src/game/engine.ts:4979-4991` |

### Falls on stage 1-1

| Case | What happens on screen | Values | Source |
|---|---|---|---|
| Soft pit (World 1 `pit: 'soft'`, both settings) | a dip with a moss-stone floor; stair blocks up the far wall; an ordinary landing, nothing lost | floor 110 px under the lower lip (per-section roll: 70 or 240 px); each step rise ≤ share × 107.8 × 0.85 (Normal 0.82 → 75.1 px; Easy 0.65 → 59.6 px); tread 100–140 px; 60 px of floor before the first step; a pit too narrow for steps gets its floor one step-rise under the far lip | `src/game/gen2/worlds/w1.ts:64-67`, `src/game/gen2/pipeline.ts:1145`, `:1167-1190`, `:1409`, `:1703-1730`, `src/game/gen2/types.ts:738` |
| Catch bough under a canopy gap | a branch 90 px under the lower lip, 80 px wider than the gap | | `src/game/gen2/worlds/w1.ts:66-67`, `src/game/gen2/pipeline.ts:1161-1166` |
| Easy "soft put-back" | whoosh sound; set on the last still ground ≥ 60 px wide he stood on, ≤ 150 px (or half the ledge) back from the edge he left; circle opens 0.45 s; 1.2 s invulnerable; steering ignored 0.35 s; hearts and lives kept | triggered by the bottomless-fall condition above | `src/game/engine.ts:833`, `:2460-2471`, `:4993-5032` |
| Easy put-back applies on 1-1 | yes: the engine enables it for Easy when `isGen2Stage` is false, and `GEN2_STAGES` does not list 1-1 | | `src/game/engine.ts:833`, `src/game/gen2/game.ts:86-96` |
| Lethal pit / water on 1-1 | none laid: pit kind soft, no water in the World 1 kit | | `src/game/gen2/worlds/w1.ts:64`, `:1474-1478` |

### Checkpoints (flags)

| Item | Value | Source |
|---|---|---|
| Touch area | \|x − flag\| < 70 px and feet between 150 px above and 40 px below the flag base | `src/game/engine.ts:2528` |
| Only a further flag replaces the current one | further right (up on climbs, down on descents) | `src/game/engine.ts:2531-2534` |
| Feedback | "CHECKPOINT!" text, sparks, sound, haptic | `src/game/engine.ts:2538-2542` |
| Spacing rule on rolled stages (1-1) | first ≥ 700 px from start; ≥ 900 px apart; ≤ 4000 px apart (≤ 2300 where a life can be lost); last ≤ 2000 px before the exit; one within 2400 px before each hard section | `src/game/gen2/pipeline.ts:1049`, `:1057-1071` |
| Other gen2 stages | ≤ 4500 px between flags (or ≤ 35 s of route) | `src/game/gen2/pipeline.ts:1043`, `:1842-1895` |
| Hand-built / old stages | ≤ 4000 px between flags; Easy adds a flag on runs > 1800 px | `src/game/easyMode.ts:257`, `:33-34` |

## 9. Camera

### Zoom (world shown)

| Orientation | Rule | Example | Source |
|---|---|---|---|
| Landscape (w ≥ h) | zoom = screen h / 540 → 540 px of world tall | 844 × 390: zoom 0.722 → 1169 × 540 world px | `src/game/engine.ts:221`, `:1080-1084` |
| Portrait (h > w) | zoom = max(w / 440, h / level height) → at least 440 px wide and never taller than the level | 390 × 844, level 900: zoom 0.938 → 416 × 900 world px | `src/game/engine.ts:229`, `:1083`, `:1095` |
| Clamp | zoom 0.5–1.8 | | `src/game/engine.ts:1084` |
| Level height default | 900 px (gen2 may raise it to lowest piece + 120) | | `src/game/worldsData.ts:285`, `src/game/gen2/pipeline.ts:2428` |
| Start dolly | zoom 0.9 → 1.0 over 1.3 s, cubic ease-out | | `src/game/engine.ts:238-239`, `:1085-1087` |

### Follow

| Quantity | Value | Per frame @30 | Source |
|---|---|---|---|
| Camera easing toward aim | factor min(1, dt × 6.5) | 0.217 of the gap per frame | `src/game/cameraFollow.ts:76`, `src/game/engine.ts:5493-5495` |
| Trail behind at full run | 285 × (1/6.5 − 1/30) = 34.3 px | | `src/game/cameraFollow.ts:141` |
| Hero framing | centre 45 % across (before look-ahead); feet 55 % down | | `src/game/cameraFollow.ts:95-96`, `src/game/engine.ts:5391-5392` |
| Look-ahead | 90 px toward facing; eased at 2.2 /s | 0.073 per frame | `src/game/cameraFollow.ts:21-22`, `:49-52` |
| Vertical, grounded / climbing / hanging | anchor = feet height | | `src/game/cameraFollow.ts:37-46` |
| Vertical, in air (dead zone) | holds height; follows only when > 26 % of view height above or > 20 % below the anchor | 390 × 844 portrait (900 tall): 234 px up / 180 px down; 844 × 390 landscape (540 tall): 140 px up / 108 px down | `src/game/cameraFollow.ts:18-19`, `:41-45` |
| On a liana | anchor = bottom of the swing arc | | `src/game/cameraFollow.ts:39` |
| Teleport | height change > 1 view height snaps the anchor | | `src/game/cameraFollow.ts:24`, `:38` |
| Head under HUD | top band 140 CSS px upright / 112 sideways; head 104 px above feet | | `src/game/cameraFollow.ts:199-203`, `src/game/engine.ts:5488-5491` |
| Hero kept inside view edges | 44 px | | `src/game/cameraFollow.ts:294-299` |
| Shake decay | trauma −2.2 /s | | `src/game/engine.ts:1753` |

### Upright vs sideways framing

| Rule | Value | Source |
|---|---|---|
| "Upright narrow" | portrait and < 600 CSS px wide | `src/game/cameraFollow.ts:98`, `:130` |
| Upright: look-ahead | min(90, max(vw × 0.15, 285 − 0.55 × vw)); 416 px view → 62.4 px | `src/game/cameraFollow.ts:100`, `:109`, `:134` |
| Upright: run lead | extra lead at full run so ≥ 305 px of world shows ahead, centre ≥ 28 % from the trailing edge (16 % minimum); 416 px view → +48 px; fades at 15 /s (fast part) and 0.8 /s (rest), grows at 3 /s | `src/game/cameraFollow.ts:65-77`, `:101`, `:108`, `:145-169` |
| Sideways: run lead | 0 for any view wider than ≈ 515 px of world | `src/game/cameraFollow.ts:61-62`, `:145-151` |
| "Sideways short" | landscape and ≤ 340 CSS px tall: feet 68 % down | `src/game/cameraFollow.ts:111-112`, `:131`, `:136` |
| Look across a gap | within 320 px of a ledge end; landing up to 760 px across, 340 up, 560 down; kept in 2–98 % × 20–92 % of view; eases 4.5 /s (10 /s if off view) | `src/game/cameraFollow.ts:180-191`, `:236-269`, `src/game/engine.ts:232`, `:5446-5451` |

### Frame rate and automatic quality

| Item | Value | Source |
|---|---|---|
| Lock | 30 fps (section 0) | `src/game/engine.ts:509` |
| Quality levels | 0 / 1 / 2 → device-pixel-ratio cap 2 / 1.5 / 1 | `src/game/engine.ts:1024-1028` |
| Visual-effects tiers (when enabled) | 0 all; 1 no bloom, rim light, wind; 2 off. Stepped down before resolution. | `src/game/polish.ts:51-58`, `src/game/engine.ts:1031-1046` |
| Step down | 1200 ms window average gap > 40 ms (< 25 fps) | `src/game/frameGovernor.ts:9-10`, `:59-80` |
| Not judged | first 4000 ms of a stage; 1500 ms after any step; gaps clamped to 120 ms | `src/game/frameGovernor.ts:16`, `:20-21` |
| Step up | 8 windows in a row averaging < 35.5 ms; not again in a stage after a down-up-down | `src/game/frameGovernor.ts:18-19`, `:81-86` |
| Carried across stages | last level kept; re-tried one level better after 180 s | `src/game/frameGovernor.ts:94-104` |
| Slow-device tip | at lowest quality, 15 s of frames ≥ 100 ms | `src/game/slowTip.ts:13-15` |

## 10. Easy vs Normal (every differing number found)

| Item | Normal | Easy | Source |
|---|---|---|---|
| Coyote base | 0.133 s | 0.167 s | `src/game/physics.ts:41-42` |
| Jump buffer base | 0.133 s | 0.2 s | same |
| Ledge catch (foot miss) | 8 px | 12 px | same |
| Lip hoist | 26 px | 26 px (same) | same |
| Input press keep | 0.167 s | 0.233 s | `src/game/inputEngine.ts:19` |
| Early-stage help share a | 1 on 1-1, linear to 0 at stage 25 | 1 on every stage | `src/game/physics.ts:50-52`, `src/game/engine.ts:6017-6023` |
| → coyote (incl. +0.001) / buffer on 1-1 | 0.214 / 0.233 s | 0.248 / 0.3 s | computed |
| → coyote / buffer stage 25+ | 0.134 / 0.133 s | 0.248 / 0.3 s | computed |
| → double-jump speed | 604.8 on 1-1 → 540 at stage 25+ | 604.8 | `src/game/engine.ts:2208` |
| → landing centre tolerance | 15.8 px on 1-1 → 11.4 px | 15.8 px | `src/game/engine.ts:2381` |
| → landing drop tolerance | 20 px on 1-1 → 14 px | 20 px | `src/game/engine.ts:2382` |
| Normal after switching from Easy | Easy's help share fades 1 → 0 over the next 5 stages | — | `src/game/difficulty.ts:68-88` |
| Generated gaps (gen2, incl. 1-1) | ≤ 0.82 × physical reach | ≤ 0.65 × | `src/game/gen2/types.ts:738`, `src/game/gen2/pipeline.ts:282-283` |
| Generated landings | — | +48 px wider | `src/game/gen2/types.ts:740`, `src/game/gen2/pipeline.ts:284` |
| Generated soft-pit step rise | ≤ 75.1 px | ≤ 59.6 px | `src/game/gen2/pipeline.ts:1169`, `:132` |
| Pits on land (gen2) | the world's kind (World 1: soft) | always soft (water stays lethal) | `src/game/gen2/pipeline.ts:290` |
| Easy reach check jump | — | stages checked with a jump of 0.7 × full height (640 × √0.7 = 535 px/s) | `src/game/physics.ts:358-359`, `src/game/easyMode.ts:16` |
| Quiet stretch limit (gen2) | 2.0 s | 3.0 s | `src/game/gen2/types.ts:753` |
| Enemy count (gen2) | 1 × | 0.6 × | `src/game/gen2/types.ts:742`, `src/game/gen2/pipeline.ts:286` |
| Enemy attack cooldown (gen2) | 1.2 s | 1.8 s | `src/game/gen2/pipeline.ts:2333` |
| Fight-goal stages | goal | round(0.6 × goal) | `src/game/gen2/pipeline.ts:267-269` |
| Hearts at flags | per stage build | a heart beside every flag | `src/game/easyMode.ts:8`, `:16`, `:223-225` |
| Soft put-back on land falls | off | on (non-boss stages where `isGen2Stage` is false, incl. 1-1) | `src/game/engine.ts:833` |
| Liana period / grab / window | 2.85 s / 60 px / −0.15–0.9 | 3.3 s / 76 px / −0.4–1.2 | `src/game/physics.ts:470-475` |
| Liana release window to next perch (gen2) | 0.167 s | 0.3 s | `src/game/gen2/types.ts:760` |
| Water warnings (gen2) | first water only | every water gap after 12 s | `src/game/gen2/types.ts:743-748` |
| Boss tells | × 1 | × 1.3 | `src/game/engine.ts:3433` |
| Drifting logs (World 2) | — | slower; wider catch | `src/game/engine.ts:716`, `:2381`, `:2387` |
| Old-generator stages | far jumps over drops ≥ 260 px deep | stepping stone 84 × 22 px added | `src/game/easyMode.ts:28-31` |

Unchanged between settings: run speed, accelerations, gravity, max fall, jump speed 640, release cut 230, touch hold 220 ms, glide numbers, camera, lives (3), hearts (5).

## 11. Not found in code

- An end-to-end touch-to-screen latency figure.
- A fixed 60 Hz simulation step in the running update path (`STEP = 1/60` is declared only).
- Whether any 1-1 roll lets him fall below level height + 120 px (pits have floors).

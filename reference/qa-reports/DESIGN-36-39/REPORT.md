# DESIGN-36-39 REPORT (Designer, fresh; packet reference/packets/2026-11-20/DESIGN-36-39.md on ccr-ea739a2f-dfcee4; started 6:58 PM ET 11-19, written 7:20 PM ET 11-19 by `date`)
Base: origin/main 6e7b85f8f. Branch t-design-36-39. All five finals written; every number the packet named is flown on the real engine.

## EXACT NEXT STEP
None left in the box for these five. For the lead: rule the four calls under "Decisions" below; then the engine list's first job is ENG-NOISE + ENG-WAYS (one packet).

## 1. Done-items, with evidence
| Item | Where | Evidence |
|---|---|---|
| 3-6 Grandma's Things final | reference/design/3-6.md | one idea; 3 tributes kept; beats table; node string checkCode clean; targets pasted (25.0 / Easy <= 15.0); cap, toss, light, wake flown |
| 3-7 Which Fern? final | reference/design/3-7.md | node string clean (creatures); 28.0 / <= 16.8; the pad's speed ramp flown (no walk); rustle rule set on flown speeds; the secret (arch shadow) |
| 3-8 Thorn Vine Swing final | reference/design/3-8.md | node string clean; 27.0 / <= 16.2; the let-go window flown at every frame of a swing, both settings; the stir rule derived |
| 3-9 The Prowler's Ring final (finale, no new move) | reference/design/3-9.md | node string clean (creatures, no teach); 30.0 / <= 18.0; the kit ocelot's lure pull flown (24 phases x 4 distances, both settings) |
| Hidden stage (The Glowworm River) final | reference/design/3-hidden.md | node string clean (mini 11); 25.0 / <= 15.0 (reading of the lead's ruling, Decision 1); raft stillness, rock-light lead time and the rock hop flown |
| Flights (rule 24, InputEngine) | reference/specs/sims/w3flight39.ts | `npx tsx reference/specs/sims/w3flight39.ts normal|easy all`; out/w3flight39-normal.txt, -easy.txt (exit 0 both); the rig's hop check 0.40 s / 120 px (= w3flight.ts) |
| Node strings | reference/specs/sims/nodes3639.ts | out/nodes3639.txt: 5 x "checkCode: no errors"; R-165.319 shown failing on `:&thornVine*1` |
| Turnover note | reference/handoffs/designer.md §1 | the World 3 back-half row |

**The flown numbers, in one place** (Normal; Easy where it differs):
- 3-6 cap (a real KitPlay room): picked up 0.03 s; carried light r 230, middle 16 px ahead / 56 px up: lights the floor -207..+239 px, a 160 px drop only 95 px out; carry walk 182 px/s;
  **Kick = forward toss: rests 294 px, 0.60 s** (walking the same); **Jump = high toss: apex 303, rests 131 px, 1.17 s** (onto a shelf 200 up: 102 px, 0.90 s); carrying, Jump never jumps; a forward
  toss cannot reach a shelf 120 px up; the lamp wakes glowworms within 270 px (250/270 woke, 300 slept).
- 3-7 quiet: Right held: 87/173/260/285 px/s at 1/2/3/4 frames (full run 0.13 s); let go: stops 0.10 s, 8 px; tap-walk 2/4 frames 53 px/s, 3/3 117, 4/4 131.
- 3-8 sleeper (260 px liana, shelf 200 px under): one swing 2.85 s (Easy 3.30); let-go window onto a shelf 260-340 px on **0.70 s a swing** (Easy 1.13), at 420 px 0.37 (0.57); air 0.67-0.83 s;
  worst wait 2.17 s.
- 3-9 bait (kit ocelot, kit hearing): drawn by a lure within 520 px 24/24 (600 px: 0/24); walks to it or to its beat's end; there in 2.07-3.53 s (Easy 2.43-3.67), looks 4.50 s; a run past behind it
  noticed 0/24.
- Hidden raft: riding counts as still (own vx 0), lights wake 0.63 s in; today's 1050 px reach lights a rock 5.6 s ahead at 143 px/s; bounded R 360 -> 1.52 s, R 480 -> 2.22 s; rock hop: 60/80 px
  rocks landed from 10-100 px before the edge except 30-40 px (a hole), 120 px rocks only 70-80 px; wait on the rock 0.70-1.37 s; step back on within 1.30 s.

## 2. The engine list and its ORDER (2 NEW max a stage; D40 foundations first)
| # | Job | Size | Files | Planted toy (plant -> RED) | Stage | After |
|---|---|---|---|---|---|---|
| 0 | **ENG-NOISE + ENG-WAYS (ONE packet, FIRST)** | S-M | castPlay.ts (ways into the cast), heroNoise.ts / noise.ts, predators/core.ts | chime, punch, hard landing, a LYING lit cap (lure, 520 px) and a CARRIED cap within 230 px ('light' way: flee 6 s, world3.ts:19), each on a kit toy; plant: lying cap sends 'light' -> the ocelot flees instead of looking (RED) | 3-3, 3-5, 3-9 | INT head |
| F | (planned foundations, PLAN-W3 §2) F1 ENG-W3a, F2 ENG-DARK (**+ per-set reach as data**, hidden R 360/480), F3 ENG-PROWL, F5 ENG-VINE, D2 ENG-ROOT, D3 ENG-SPORE, ENG-27 (left) | | | | | |
| 1 | **ENG-LIGHT** | M | gen2/worlds/w3.ts + a lay file | light-only ledge 294 px out lit by a Kick toss; plant: 600 px out -> verdict red; Jump while carrying jumps -> red | 3-6 (3-9) | F1, F2 |
| 2 | bot `toss-light` + `set-down-to-climb` | S | tools/inspect/firsttimer.ts | no toss -> stuck at 3-6 beat 2 | 3-6 | 1 |
| 3 | **ENG-SLEEPER** (re-scopes PLAN-W3 D7 ENG-THORNSWING to the pick) | S-M | thornVine.ts (data), the liana step, a W3 brick | stir 2.0 s -> verdict refuses; gap 420 -> refuses; look not dropping -> red | 3-8 (3-9) | F5 |
| 4 | bot `ride-the-sleeper` | S | firsttimer.ts | let go at once -> dropped | 3-8 | 3 |
| 5 | **ENG-FERN** (+ bot `listen-walk` inside) | S | finds.ts + a gen2 fern brick | every fern rustles -> red; a run hears it -> red; skill off -> red | 3-7 | ENG-27, D2, D3 |
| 6 | **ENG-SECRET** (R-165.320) | S-M | secret.ts -> a table, stageTable hidden row, the map/satchel flag | the row removed -> the find opens nothing | 3-7 + hidden | F1 |
| 7 | 3-9's **V preview** on gen2 | S | nodeLetters V (:53 `later`), a W3 brick | no cap patch beside it -> verdict refuses | 3-9 | 0, 1 |
| 8 | bot `bait-and-slip` | S | firsttimer.ts | skill off -> caught in the ring | 3-9 | 0, 1, 3 |
| 9 | **ENG-DIM** | S | zones.ts, engine.ts stepGlowworms | `dims` ignored -> stays lit | hidden | F2 |
| 10 | **ENG-RAFT3** (traces the rock-hop hole FIRST) | S-M | riverLay.ts (rafts skipped today, :98), a W3 brick | R 1050 -> "beat ahead" check refuses; R 240 at 143 -> refuses; the 30 px press case as the hole's plant | hidden | F2, 6, 9 |
**Stage build order:** 3-6, 3-8, 3-7, 3-9, hidden (by what each waits on). **Hand builds replaced:** protoStage.ts '3-6' :2709, '3-7' :2885, '3-8' :2977, '3-9' :3089-3145 (HAND_STAGES :62;
W3_PUZZLES :324 holds 3-7; goals :318-322), w3Sections.ts :36-39, :49-52; pinned tests w3Stages, w3Puzzles (3-7), artDress, easeIn, stageBackdrops, badges, jumpTrails (line lists in each doc).

## 3. Decisions (who decides)
1. **The lead:** the hidden stage's target: "the band of 3-7 minus one step" read as one sawtooth slot down = 25.0 (Easy <= 15.0); or 27.
2. **The story keeper (KEEPER-31-39):** 3-9's goal line, **'drive off' vs 'break out'** (the engine counts drive-offs, engine.ts:8248; with the bait most rings are slipped); 3-8's goal line says
   "without touching the thorns" while the stage rides them; 3-7's six finds have five names (protoStage.ts:2536); the hidden stage's name and reward.
3. **Matt (one question, show first):** 3-7 on a phone: the pad has no walk, so "walk soft" becomes "go slow or stop" (a 200 px/s line a stop, a tap-walk, carrying or creeping meets). A short
   clip of the rustle at a stop vs a run past would show him the feel before ENG-FERN is built.
4. **The lead:** the jaguar's first meeting (not in 3-9: Pushback 2 of 3-9.md).

## 4. Polish check
No screen was changed (design docs and read-only sims): no stills. Each doc names its stills (both orientations) and the clips (with the frame each action happens in) for the builder.

## 5. Pushback (with evidence)
- **"Walk soft" cannot be held on the pad** (flown, eaglet.ts:5 said it in 4-6): 3-7's rule is a speed line. Every future "quiet feet" design must fly the input first.
- **The pick's "toss on one tap" is the Kick button**, not Jump (flown; PadController.tsx:133-139): Dot's line and ENG-LIGHT must name Kick.
- **The kit's light way makes prowlers FLEE** (world3.ts:19), the opposite of 3-9's bait: ENG-WAYS must keep lying (lure) and carried (flee) apart, or the finale breaks.
- **PLAN-W3 D7 ENG-THORNSWING was A's idea;** the pick is B's: re-scoped to ENG-SLEEPER (same size). The old maker's stir (1.1 s, protoStage.ts:2972) is unfair for a sleeper: 3.3 s is the floor.
- **The hidden stage's "a beat ahead" is impossible at today's 1050 px reach** (5.6 s ahead at 143 px/s): ENG-DARK must ship per-set reach as data.
- **The packet's "timecheck" is not on main** (tools/timecheck.mjs lives on t-int-13): run from there against this branch (below).

## 6. Suggestions (outside my walls)
- A `rock` and `raft` mode now exist in w3flight39.ts: ENG-RAFT3 can take the 30-40 px hole as its first planted case (ENGINE-WORTHY, rule 22: a raft-carried jump into a block's side).
- pitch.md: a pitch that names a speed ("walk", "tiptoe") flies the pad's speed ramp before the pick.

## 7. Unresolved (named plainly)
- The 3-7 rustle (R 200, 1.2 s, 200 px/s) is MODELLED on flown speeds, not flown: no rustle exists to fly (ENG-FERN builds it; its toy flies it).
- The 3-9 'light' way (flee) is kit data with no caller: not flown on the engine (ENG-WAYS's toy flies it).
- The sleeper's look-drops-him is new behaviour: not flown (ENG-SLEEPER's toy).
- ENG-DIM's 0.4 s "moved" time is proposed, not flown (nothing dims today).
- The phone-screen fits are estimates from widths, NOT measured (each doc says so; rule 8's stills measure them).
- My context %: I cannot read my own figure (the lead reads it).

## 8. Method used, lessons applied, method update
Method: reference/methods/level.md (rules 1-3, 6-8, 21-24, 27), pitch.md step 6 via the packet, the 3-1.md format. Lessons applied: D30 (every stamp from `date` in the commit's command), D34/D52
(file:line cites re-grepped last: 3-6's basket cite and 3-9's kit/core cites were wrong on first write and fixed), D40 (foundations first), D58 (tributes cited), D65 (paint asks judged on the
dark they sit in), D83 (relative imports), D90 (lean reads: only the sections named), D91 (no gate piped into tail before a commit).
**Method update (level.md, proposed):** rule 24 add: "Fly the INPUT the player uses (which Pad button, whether a thumb can hold that speed) before any rule built on it; a rule named after a
move ('walk', 'toss') is checked against the Pad's buttons." Proof: 3-7's "walk soft" (no walk on the pad) and 3-6's toss (Kick, not Jump) were both wrong in both pitches.

## Learned
- Fly the button, not the action's name: two of five picks named an input the Pad does not have or maps elsewhere.
- Fly the creature's ending: the lure walk stops at its beat's end, which decides where a toss must land.
- Fly the carrier: a raft could have broken "stand still"; it doesn't (his own vx 0), which is what makes the hidden stage possible.

## Gates (this branch, docs + read-only sims; LAWS 5 scoped)
See the commit message for each gate's exit (run after the files were final, before the push).

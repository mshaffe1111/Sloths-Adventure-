# World 3's hidden stage, The Glowworm River: "Stand Still and the Sky Shows the Rocks", the level as designed (DESIGN-36-39 final, from PICKS-36-39.md "Hidden stage": PITCH-36B's raft river + PITCH-36A's rocks lit a beat ahead; written 7:20 PM ET 11-19 by `date`). DESIGN ONLY: builds LAST, after 3-7's ENG-SECRET (R-165.320) gives it a door
**One idea:** "Drift on a raft under a sky of glowworms: stand still and the lights wake a beat ahead of every rock; move, and they dim." A player says: "the secret river with the stars."
**The hook:** a reward after nine stages of patience: the raft carries him, so World 3's whole lesson, stillness, IS the control. Calm, beautiful, short. **Reached** from 3-7 (its arch-shaped
shadow: stand still beneath it, hang under the root, take the golden guarana: 3-7.md beat 7). **New thing (one):** the lights go OUT again when he moves (3-1's stay lit).
**The numbers, FLOWN** (level.md rule 24; `npx tsx reference/specs/sims/w3flight39.ts normal|easy raft` on origin/main 6e7b85f8f; out/w3flight39-*.txt). The real engine (30 fps): Pokey
standing on a World 2 drift raft (river.ts DriftInfo; carried by the engine's drift step, engine.ts:1858-1884) under a dark roof of sleeping glowworms 400 px apart; no input.
| What | Flown (Normal = Easy) | So the design uses |
|---|---|---|
| **Riding counts as still** (stepGlowworms: grounded and his own vx under 25, engine.ts:8844-8845) | Yes: on the raft his own vx stays 0 while it carries him; stillness counts from **0.03 s**; the first lights wake **0.63 s** in | B's "stand still on the raft and the sky shines" works on today's engine |
| **Today's reach** (GLOW_REACH ahead 1050, wave 900 px/s, fade 0.6; zones.ts:81) | A light is FULLY lit **5.6 s** before a raft at 143 px/s reaches it (3.5 s at 200, 9.9 s at 90) | Far too early: one stop lights the whole river, and there is no "beat ahead" (the pick). The rocks' lights need a **bounded reach** (ENG-DARK's per-set reach, 3-1.md NEW 1) |
| **A bounded reach R** (full light before the raft arrives = R / v - R / 900 - 0.6) | v 143: R 240 -> 0.81 s, **R 360 -> 1.52 s**, R 480 -> 2.22 s; v 90: R 360 -> 3.00 s | **Normal: raft 143 px/s (World 2's river speed, riverLay.ts:49), rock lights R 360: lit 1.52 s ahead** (STAGE-RULES §4: 1 s); **Easy: the same raft, R 480: 2.22 s** (>= 1.6 s) |
**What is ahead, and what he does (each a move he has):** low root curtains over the river: hold Down to duck (a duck is still: the lights stay); rocks standing out of the water: hop onto the
rock, stand (still), and step back onto the raft as it comes out the far side (the raft passes under, river.ts: logs never stop); where the river splits, hop to the raft on the branch whose
sky wakes. **The rock hop, FLOWN** (`w3flight39.ts normal|easy rock`: raft 143 px/s, a solid rock across its path, a held Jump at every 10 px of approach): a rock **60 or 80 px up,
260 px wide** is landed on from **10-100 px before its edge** (Easy 10-110) EXCEPT at **30 px (and 40 px for 80 px up)**, where he meets its side and falls back (a hole in the window:
ENGINE-WORTHY, below); a rock **120 px up** only from **70-80 px** (2 of 32 presses: too tight for a reward stage, never laid). On the rock he waits **0.70-1.37 s** for the raft to show
60 px past its far end, then a held Right lands him back on the raft if begun within **1.30 s** (Easy 1.30-1.40). **So: rocks 60 px up, 260 px wide** (Normal and Easy; Easy wider R).
**Difficulty (no slot: R-165.320; the lead's ruling, PICKS-36-39 "Rulings" 3):** "designed to the band of the stage that opens it, minus one step, Easy as usual, and no heart on its teach".
3-7's target is 28.0 (DIFFICULTY.md:63 = 20 + 8); one step down the sawtooth (the slot before it, T = [..., 5, 8, ...]) is **25.0 Normal**; Easy "at most 0.6 x Normal" (:61): **at most
15.0**. (If the lead meant 28 - 1 = 27, only the dial below moves.) No heart on the teach (beat 1 has nothing that hurts). Dial: rocks per stretch (Normal 3, Easy 2) and R (360 / 480).
**Length** the river is long and calm: ~140 s designed at 143 px/s (~20,000 px of river) + the side-on ends = ~2:10 (the 2-minute rule). **Goal** reach the end of the river (a sprint kind,
its line the keeper's). **Cast** none. **Look** a black river under a roof of glowworms (Waitomo's real sky); the water the only other light.
**What a miss costs** (a reward: never a lost life): falling in sets him back on the last raft or jetty (the teaching river's rule, river.ts RiverZone `safe`, as 2-1); a hit rock pushes him
off into that same safe splash. On Normal a splash is seconds; on Easy the same.
**The arc** (node string below; seconds Normal)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 8 | The crack opens on a black river; a raft at a stone jetty | Steps on | "Where am I?" |
| 1 | **Teach: stand still, the sky wakes** (T w1, safe) | 16 | Open water, nothing ahead that hurts; a roof of sleeping glowworms | Stands: the roof wakes ahead; walks on the raft: the lights DIM (new) | "Stars, underground!" |
| 2 | Fungus jetty (P f1) | 8 | A shelf with glow petals between two rafts | Hops off for petals, back on | "Worth it?" |
| 3 | Low curtains (P w1) | 12 | Root curtains over the water | Ducks (still): the lights stay | "Duck and stay still" |
| 4 | **TEST: the rocks** (X f1) + R | 18+6 | Rocks out of the water, each lit 1.52 s ahead only if he is still (Easy 2.22) | Reads the light, hops onto the rock, waits, steps back on | "There's one... hop!" |
| 5 | **TWIST: the fork** (W w1) + R | 16+6 | The river splits; only the deep branch's sky wakes | Hops to the raft on the lit branch | "Follow the stars" |
| 6 | Under the root (C r1) | 14 | The raft slides under a low roof; he hangs under a root (3-2) while it passes beneath, drops back on | Hangs, drops | "Like a sloth!" |
| 7 | Up from the landing (P c1^) | 10 | A climb to the dome | Climbs | "Up" |
| 8 | **SIGNATURE: the Glowworm Dome** (S w1+) | 16 | A still pool under a dome; standing still, the whole sky wakes at once (a 'sky' set with its own wide reach, 3-1's) | Stands, takes the keepsake | "It's the night sky" |
| 9 | Exit (E) | 6 | The way back to the map | Walks | "A secret!" |
**THE NODE STRING (checkCode: no errors, 12 tokens, mini 11 as PITCH-36B ran it; `npx tsx reference/specs/sims/nodes3639.ts`):**
`A Tw1<:#dark:#water Pf1< Pw1<:#water Xf1>:#dark:#water R Ww1<:#dark:#water R Cr1>:#water Pc1^< Sw1+<:#dark:#water E` (the TEST is written `f`, its rocks: V11 caps `w` at 3 of 7).
**First appearances, each taught** (rules 6, 7): the dimming (beat 1: open water, nothing hurts); the rock hop (beat 4: after a flag, the first rock low and wide). Every other move is World 3's.
**The phone both ways (NOT measured here: the stills measure it, rule 8):** a rock lit 1.52 s ahead at 143 px/s is 217 px ahead of him: upright (412 px) shows it with ~60 px to spare; the camera
must lead right on the raft (stills at beats 1, 4, 5 both ways); a CLIP of beat 1 naming the frame he stops, the frame the first rock's light wakes and the frame it dims when he walks.
**Engine (2 NEW, each proven on a planted toy on a REAL row, rules 21, 23).** WIRED: rafts and drift (river.ts; gen2 riverLay.ts; puzzle-kit#raft), riding counts as still (flown), glowworm
waking (engine.ts:8826-8856), duck, 3-2's root, the safe splash (river.ts RiverZone `safe`). FOUNDATION: F1 ENG-W3a, F2 ENG-DARK (its per-set reach: here R 360 / 480), D2 ENG-ROOT,
**3-7's NEW 2 ENG-SECRET** (R-165.320: the door, the hidden stageTable row, the map and satchel). **NEW 1 ENG-DIM** (S; zones.ts + engine.ts stepGlowworms): a light set flagged `dims`:
woken lights in his reach go back to sleep (fade 0.6 s) once he has moved for 0.4 s (data; today woken lights stay lit for good, engine.ts:8824, :8852); toy: a W3 row, stand -> lit, walk 1 s ->
dim; plant: the flag ignored -> stays lit (RED). **NEW 2 ENG-RAFT3** (S-M): the raft river on the W3 kit (riverLay's raft lay, today skipped for rafts, riverLay.ts:98) with rocks across it and
the fork, and the verdict "every rock's light is fully lit >= 1 s (Easy 1.6 s) before the raft reaches it" from the formula flown above; toy: one raft, two rocks; plant: R 1050 -> the
verdict passes but the "beat ahead" check (lit no more than 3 s ahead) refuses; R 240 at 143 -> 0.81 s refuses.
**The hand build it replaces:** none (a new stage). **Tests to add:** the hidden row in the stage registry and the secret table's (ENG-SECRET's).
**Art: reuse first (STAGE-RULES §4, R-165.318; catalog by `worlds`; Pokey 89.1 px, D41).** Reuse: the raft = puzzle-kit#raft (W2; scale 0.79 ok) or dressnew-w2#w2Raft (0.77 ok); World 3's
water = props/pitwater/w3.webp (PITCH-36B); rocks = w2#boulder (scale 0.83 ok), props-atlas#boulder (0.94 ok); glowworms = w3-props#glowHang0-2 / glowSleep0-1 (W3); roots and curtains =
w3-props#mossCurtain, 3-2's root; the dome's sky = w3-props#glowWave0-3 tiled; game/w7slide/flume-props#glowworms (W7, worlds 7,3,9,10). **None fits, paint it:** a grotto stone jetty;
the dome backdrop (the reward picture: the lead's call).
**For the story keeper (asks, not lines; rule 17):** (1) Its name (PITCH-36B: "The Glowworm River" as a working name). (2) Dot's teach before beat 1: stand still and the sky shows the way;
move and it dims. (3) The reward: (a) a keepsake and a journal page (recommended: cheap), or (b) a lasting gift like the Thorn Heart (secret.ts) (the lead's and keeper's call). (4) A journal
entry: real glowworms dim when disturbed (Waitomo, NZ).
## Tributes (quotes as PITCH-36A/B cite them, from pages they opened; D58)
- **The Legend of Zelda** (Nintendo 1986; pre-1990). a. Loved: "Optional rooms (and sometimes entire paths) branch off from the critical path and reward the player with bonuses"
  (gamedeveloper.com, Learning from the masters: Zelda). b. Taught: secrets are hinted. c. Ours: hinted by a shadow, never needed. d. Not copied: bombs.
- **Toobin'** (Atari 1988). a. Loved: "Toobin's level order and layout can be quite different depending on which forks are taken" (gamedeveloper.com, Design Essentials 20). b. Taught: the
  first river is wide and slow [S]. c. Ours: a river ride with one fork, the lit branch. d. Not copied: the paddle buttons.
- **Braid** (Number None 2008). a. Loved: its hidden stars: collect them and she "shows up in her own constellation" (gamedeveloper.com, Braid deconstructed). b. Taught: [S] seen by players
  who look harder. c. Ours: the reward IS a sky of stars, found by looking. d. Not copied: time.
**Different:** the only stage he rides instead of walks; the only one where stillness is the control from start to end; World 3's only river. A's Cave Slide would need ENG-SLIDE (L): not used.
**Pushback (design):** (1) **"Lit a beat ahead" is impossible at today's reach:** flown, the 1050 px reach lights a rock 5.6 s ahead (the whole river at once); the rocks need a bounded reach
(R 360 / 480), which is ENG-DARK's per-set reach, so ENG-DARK must ship it as data, not only the 'sky' set. (2) **The rock hop has a hole** (flown: a press 30-40 px before a rock's edge falls back off its side, where 10-20 and 50-100 land):
ENGINE-WORTHY (rule 22): ENG-RAFT3 traces it (the lip hoist on a raft-carried jump) before any rock is laid, with the flight as its planted case. (3) The difficulty reading of "minus one step" needs the lead's word (25 or 27).
**Learned:** fly what the CARRIER does to the rule: a raft could have broken "stand still" (his speed on it), and it doesn't (his own vx is 0), which is what lets B's idea work at all.

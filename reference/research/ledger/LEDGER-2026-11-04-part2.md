# Research ledger, part 2: MATT-RESEARCH-2026-11-04-full.txt lines 390 to the end

Helper: research dissection, 2026-11-04. Source: `reference/research/MATT-RESEARCH-2026-11-04-full.txt`, lines 390-766 (the file
runs to 770; 767-770 are blank and a rule). Every line was read, the "step by step", "why this order" and "what to watch out for"
parts included. Line 738 is cut off mid-sentence in the file itself (idea 24 stops at "As soon as Pokey turns to face").

Compared against: the lead's summary `reference/research/MATT-RESEARCH-2026-11-04.md` ("Summary" below), `reference/PLAN-TO-80.md`
("Plan"), `reference/STAGE-RULES.md` §0, §0b, §0c and §2 as they stand at commit 2c8e3932 (§0b.6 now says "UNDER REVIEW", §0b.9 is a
draft BPM rule), `reference/ROADMAP.md`, and the validator in `tools/validate/` (read in full: core.ts, evaluate.ts, mechanics.ts,
play.ts, world1.ts). Facts about our game were checked in `src/` and are cited file:line.

How to read the status column: IN = in the game today; PART = some of it is in; NOT = nothing in the code.

---

## 1. Missed or flattened (ranked: the ones that fight "every stage and world feels the same" hardest come first)

1. **The same slot order in every world (L390-391, L402-406).** Research: "If every world uses the same 10-stage template in the same
   order, players will subconsciously feel the formula by World 4" and "Never keep the Puzzle stage at X-7 and the Vertical stage at X-6
   in every single world". Today: Summary says only "Shuffle slot order" (flattened). STAGE-RULES §0b.6 gives every world the same ten
   roles in the same order (now marked "UNDER REVIEW"). Plan: nothing. Code: `stagePlan.ts` already varies the mission types per world,
   but **X-9 is a "gauntlet" (fight through to the shrine) in all 10 worlds** and X-1 is a "sprint" in 8 of 10 (stagePlan.ts:33-140), and
   the finds sit in the same stage number in every world (note in X-2, keepsake X-5, pocket X-6, book X-8: finds.ts:45). Proposal:
   **adopt.** Replace §0b.6's fixed order with a rule: each world writes its own order; no slot role at the same number in more than 3
   worlds in a row; X-9 is not always a gauntlet; the find slots move per world. Add a check over `STAGE_PLAN` and `FIND_STAGE` to the
   fun gate.
2. **World-wide mutators (L392-397).** "Give each world a macro rule that changes how the stage progression itself works, not just the
   obstacles inside the stages." Four worked examples (W3 noise wakes the Prowler, W5 fake rests, W6 camera tightens after Dot leaves,
   W10 a 1,000-step counter). Today: Summary lists them (yes). Plan: nothing. STAGE-RULES: nothing. ROADMAP: no R-id. Code: PART
   pieces exist that a mutator could be built from (W5's armchairs already trap him in silk, puzzleKit.ts:101-103; World 3's sleeping
   vines lash anyone moving, thornVine.ts:1-8; noise.ts makes watchers turn to a sound). Proposal: **adopt.** One stated world rule per
   world, written into STAGE-RULES as a world's fingerprint item (§0c.7 lists beat mix, camera, pairs and pieces; add "its world rule"),
   with an R-id per world.
3. **Placements locked to a beat (L522-526, L597, L553).** "Assign every stage a BPM ... Force your platform, vine, and hazard
   placements to lock onto musical subdivisions"; "generate a rhythmic beat pattern first (e.g., 90 BPM in World 2, 125 BPM in World 8),
   trace Pokey's real parabolic jump physics along those beats, and place platforms ... directly underneath his simulated feet".
   Today: Summary item 7 says "a tempo per world" (flattened: no beat lock). STAGE-RULES §0b.9 is now a draft of it. Plan item 9 built
   invented "beat types" instead. Validator: nothing reads intervals. Code: the MUSIC already has a tempo per world (styles.ts:94-220:
   W1 126-134, W2 94-102, W3 66-74, W4 84-92, W5 100-108, W6 86-94, W7 64-72, W8 84-92, W9 112-120, W10 78-84 BPM), but nothing places
   a platform on it. Proposal: **adapt.** Lock placements to the beat of the music the player actually hears (our styles.ts numbers),
   not the research's example numbers, which disagree with our music (see §2). The validator reads the time between moves and reports
   how many land on the stage's beat grid.
4. **"Repeats the exact same jump interval four times in a row" fails a node (L585).** Today: Summary: missing. Plan: missing.
   Validator: missing (it counts move letters, never the time between them: core.ts:191-219). Proposal: **adopt now** (cheap, about an
   hour): it measures Matt's "I can predict the sequence" directly. Pairs with item 3: on-beat is good, the same interval four times is
   not; vary between beat, off-beat and half-note.
5. **No 3-4 move run from the stage before (L516-517).** "If the exact sequence [V ➔ B ➔ J] appeared in Level 7, the generator is
   forbidden from using that exact sequence in Level 8." Today: Summary: "3-4 move runs checked" (flattened: inside one stage only).
   Validator: the "nothing new" flag only asks for one new move or pair (evaluate.ts:101-108); cross-stage runs are not banned.
   Proposal: **adapt.** With our small alphabet a full 3-run ban is too strict; ban the stage before's 4-runs and its three most common
   3-runs, and report the share of 3-runs shared with the stage before.
6. **Order-aware similarity and what to do when it fails (L518, L584).** "Compute the string distance [Levenshtein] ... higher than 55%
   ... rejects the seed, increments seed++, and scrambles the Macro-Topology (switching from a horizontal loopback to a vertical
   chimney or a split-path high/low route)", compared against "Levels N-1 through N-7". Today: Summary: "similarity to the stages before"
   (flattened). Validator: cosine of 3-run counts (core.ts:221-237), 0.55 against any earlier World 1 stage and 0.45 against the stage
   before (evaluate.ts:30, 99-113); only inside World 1 (evaluate.ts:80). No edit distance; the fix for a close stage is not named.
   Proposal: **adapt.** Add the edit distance beside the cosine (it sees order, the cosine does not); when a stage is too close the
   answer is a different map shape (item 18), never another reroll of the same pieces (Matt's 10-30 rule).
7. **Cause and effect between stages (L398-401).** "Make an action in an early stage visibly alter a later stage in the same world"
   (2-3's log jam raises the river for 2-4 and 2-8; 7-3's chair opens a passage in 7-6). Today: Summary: yes. Plan: "Later". ROADMAP
   R-162.6 parking lot. Code: NOT. Proposal: **adapt, pull into Phase B:** one link per world, the cheap kind (a saved flag that changes
   the later stage's water line, a door or a shortcut). It makes two stages of a world feel like one place, not two rolls.
8. **Enemy formations with numbers, and enemies bound to platform kinds (L485-496, L609).** "Cap Active Screen Count at 1 to 3";
   Solo Specialist (1), Stepping-Stone Chain (2-3 at jump-arc spacing), Triggered Swarm (3-5, only on mistakes); "Wide Flat Ledge (>300
   px) → 1 Armored Guard or Coiled Snake", "Chasm Gap (>250 px) → 1 Hovering Eagle or Vertical Snapper", "Silk / Stealth Node → ...
   3 Spiders + 1 Chaser"; platform-role spawning "in 65% of your nodes". Today: Summary: "1-3 on screen with roles ... bind enemies to
   platform roles" (flattened: the three formations and the numbers are gone). Plan A.3 / R-159.1: one clause. Validator: only "none
   within 150 px of a landing" and "enemies everywhere" (mechanics.ts:137-163, evaluate.ts:71-72). Proposal: **adopt** the three
   formations and the two size rules into R-159; the validator counts on-screen animals and names each group's formation.
9. **The silk tripwire as a set piece (L467-472, L489, L741-743).** 3 beats: 0.0 s the thread shakes with a harp pluck and 4-6 pairs of
   eyes open; 0.4 s "3 spiders drop vertically on silk tether-lines at staggered heights ahead of you like a moving laser-grid gate,
   while 1 fast Chaser Spider drops behind you"; counterplay: weave through, or kick the anchor / punch the lowest so it "swings like a
   wrecking ball". Today: Summary: "a spider curtain on the silk tripwire" (flattened). Plan: none specific (R-159.2 is generic). Code:
   PART: a touched thread hums and rouses every spider within the hum's reach, which then crouch and rush along the ground
   (w5Play.ts:435-453). No drop, no chaser, no tangle. Proposal: **adopt** for World 5 (5-7 Don't Touch the Silk first); it is World 5's
   signature moment.
10. **The stage's shape with its numbers (L527-536).** Node 1 "1 action every 2.5 seconds", Node 2 "1 action every 1.2 seconds", Node 3
    the spike, Node 4 "Zero action" rest with the wayside line, Nodes 5-6 "a completely different mechanical pairing", Node 7 "Maximum
    density", Node 8 a slide or glide out. Today: Summary: "a tension curve across the stage" (flattened, no numbers). STAGE-RULES §0b.2
    has four parts; §2 "Tension: a sawtooth". Validator: intro allows up to 0.8 moves/s for the first 15 s (core.ts:249-250), double the
    research's 0.4/s; no check of a mid-stage zero-action rest or a slide-out. Proposal: **adapt.** Take the numbers (0.4/s, 0.83/s,
    zero, max) and the counter-melody, but NOT "every single level follows this exact ... shape" (L536): the same curve in every stage
    is itself a pattern Matt will feel. Move the spike and the rest between stages (e.g. a stage that opens on its spike).
11. **The counter-melody: nodes 5-6 change the kind of play, not just the obstacle (L533).** "transitioning from running/jumping to a
    slow puzzle or vertical pulley climb". Today: Summary: missing. §0b.2 part 3 "twist" is near it. Proposal: **adopt** as a rule: every
    stage changes its main verb at least once (run to climb, swing to puzzle), read back from the move string.
12. **Collectibles assigned to roles so they never hide in the same kind of spot (L545-548).** Flow Reward at the top of a fast swing,
    Branch-Switch page on a high road over breaking branches (fall to the low road safely), Patience Reward in a dead-end alcove. Today:
    Summary: missing (only "seen or heard from a rest"). Plan: nothing. Code: the finds are pinned by stage number, the same in every
    world (finds.ts:45-49), and mostly in a Hush Fern with a fern tell (wayside.ts:296-311). Proposal: **adopt** the three roles; rotate
    which role each world's finds use.
13. **Secret stages behind sloth behaviour, guaranteed on every roll (L418-429).** Patience Unlock (5 s still), Wrist-Petal chime within
    300 px, lure an enemy into a wall too strong to punch, the under-the-exit hang route, and the "Golden Seed": the secret is a fixed
    spoke on node 3 or 4 so every roll keeps it, checked reachable. Today: Summary: "Secrets by in-world tells (hairpin scratches, the
    wrist petal pulsing near a secret, rustling bushes), never blank walls" (flattened: the portal triggers and the guarantee are gone).
    Plan: nothing. Code: one secret in the game (7-7's Thorn Gate to Thornbark, secret.ts:1-27); patience spots exist only in World 4
    (patience.ts:1-11). Proposal: **adapt:** a secret per world is Phase C; for Phase A/B take the "patience unlock" and the "lure the
    charger into the wall" as two new puzzle-room pieces.
14. **Stillness as a game-wide mechanic (L644-647).** "stopping completely for 1.5 seconds triggers environmental changes ... within a
    400-pixel radius: bioluminescent platforms ... solid, camouflaged enemies reveal ... thorn vines retract their spikes"; the
    "sprint-and-freeze rhythm". Today: Summary: "stillness resonance" (name only). Plan: "Already there: patience/stillness spots
    (patience.ts)" (flattened: patience.ts is World 4's rule only, its header says so). Proposal: **adopt** as a bring-back (§0.1): the
    patience spot returns in later worlds with these three effects, paired with breaking branches for the sprint-then-freeze beat.
15. **Rule 4's bar: World 1 AND World 2, and 100 seeds in a row with no repetition warning (L635).** Today: Summary: "freeze World 1-2
    before scaling" (kept). Plan: World 1 only, judged by Matt's rating; funcheck runs 16 layouts and may only shrink
    (funcheck.ts:21). Proposal: **adapt:** keep Matt's rating as the gate, add the research's machine bar for World 1 (zero repetition
    flags over 100 layouts), and prove World 2 before World 3 is touched.
16. **Enemy-free nodes counted by node, rests sacred (L481-484, L609).** "at least 3 Nodes should have ZERO enemies"; rests "100%
    sacred"; "pure dexterity rooms" enemy-free. Today: Summary: "about 35% of nodes enemy-free" (yes). Validator: the share of route
    LENGTH with no animal within 300 px, flagged only under 25% (mechanics.ts:158-163, evaluate.ts:72). Rests and tight stretches are
    not checked for animals. Proposal: **adopt:** flag any animal in a rest stretch or a tight stretch (the pacing tags exist,
    core.ts:257).
17. **Map shapes rolled per stage, separate from the rhythm (L595, L601).** Five shapes: Linear Wave, Over-Under Loopback, High/Low
    Parallel Split, Vertical Chimney, Hub-and-Spoke for search stages (3-7, 6-7); "By separating Macro-Topology ... from Micro-Rhythm
    ... Level 8 will never feel like Level 7." Today: Summary item 1 lists four shapes (from earlier lines). Plan Phase B: four shapes,
    no Linear Wave, no hub for search stages, no rule that neighbours differ in shape. Code: PART: high/low forks exist
    (stageForks.ts:66-70). Proposal: **adopt:** neighbouring stages must not share a map shape; search stages get the hub shape.
18. **Eagles as stepping stones; stomp chains over a chasm (L465, L488).** "eagles hover stationary inside wind currents. The player
    must Jump/Stomp from eagle back to eagle back"; "Stomp ➔ Stomp ➔ Stomp across the chasm". Today: Summary: missing. Code: PART: a
    stomp chain is counted and scored (engine.ts:4597-4610) and holding jump on a stomp bounces higher (engine.ts:4596). Proposal:
    **adopt** as a World 4 beat (4-4 Crosswind), using the chain we already score.
19. **River snapper snouts as a 1-second platform (L474).** Today: Summary: yes. Plan/ROADMAP: no specific item. Code: NOT (snappers
    are turtles and caimans that patrol and lunge, enemyBrain.ts:68-79). Proposal: **adopt** for World 2 (R-159.2).
20. **Three kinds of soldier armour (L475-478).** Front shield (blocks punch; a kick knocks it off or into the water), spiked helmet
    (stomp hurts; hit from the side), spear (blocks the front; stomp, or lure the thrust into wood, stuck 2 s). Today: Summary: "soldier
    shields" (flattened). Plan: "kick breaks shields". Code: one armour rule only: some animals bounce a stomp off (fight.ts:205-228).
    Proposal: **adopt** all three for Worlds 6 and 10 (R-159.2).
21. **The false-vine snake that becomes a vine when punched (L454, L729-732).** Today: Summary: "snake that looks like a vine" (yes).
    Plan: listed among species tricks in A.3. Code: NOT. Note the research gives two sets of numbers (tongue every 2 s and 3 s stiff at
    L454; every 2.5 s and 4 s stiff at L731). Proposal: **adopt** for World 1 or 2 (it fuses punch and vine, two things we already have).
22. **Dot and Flicker change how the jump feels (L707-711).** Dot: at the top of a double jump she holds a claw for 0.25 s, "15% extra
    horizontal hang-time forgiveness"; Flicker: flies "150 pixels ahead" lighting the next steps. Today: Summary: "Dot vs Flicker
    assists" (name only). Plan and ROADMAP: nothing. Code: NOT for Dot; Flicker PART (a glow that follows over his head, puzzleKit.ts:116-117).
    Proposal: **adopt:** it makes World 6-7 (Dot away) feel different in the thumb, which is the point of the story beat.
23. **Wind shadows (L673-676).** "wind ... is physically blocked by solid walls, rolling boulders, or heavy stone shields". Today:
    Summary: yes (name only). Plan and ROADMAP: nothing. Code: NOT. Proposal: **adopt** for World 4/10 as a wind variant (§0b.4).
24. **A clumsy thumb that is LATE, and that reaches the collectibles (L586).** "a 15% penalty to air speed and a 100ms delay on jump
    takeoff to verify that every ledge, Ledger Page, Wanted Poster, and Pink Bell Note is reachable". Today: Summary: "+-100 ms taps, 15%
    less air control" (flattened: a delay became a jitter). Validator: taps jitter around zero (sd 0.058 s) and air control 0.85
    (play.ts:304-305); layout 1, Normal, 20 runs only (world1.ts:62-66); jumps on the way, not the collectibles. Proposal: **adopt:** add
    a run with a steady +100 ms and point it at every find.
25. **A flat 200 px apron at both ends of every node and a checkpoint at every node's start, respawn under 0.8 s (L603-604).** Today:
    Summary: "200-250 px flat aprons between nodes" (yes). STAGE-RULES: no apron rule; §0b.8 "respawn within about 2 s of the hard
    part". Code: gen2 puts flags at rests and every 35 s (gen2/pipeline.ts:1214-1243). Proposal: **adapt:** apron yes; a checkpoint at
    every node start on Normal for Worlds 6-10 only (World 1 is forgiving already).
26. **The step counter for World 10 (L397).** "display a persistent Step Counter (Step 1 to Step 999) ... Every vertical jump increments
    the counter". Today: Summary: yes. Plan/ROADMAP: nothing. Code: NOT. Proposal: **adopt** with the World 10 rebuild (cheap HUD piece;
    the story already counts the steps, storyMemories.ts:259).
27. **Jump-toggled platforms (L665-668).** "a single jump swaps the room's platforms once, while a double jump swaps them twice".
    Today: Summary: yes. Plan Phase B lists it. Code: NOT. Proposal: **adopt** as planned (Worlds 5 and 7).
28. **Haptic taps on a branch crack and a vine grab, and a rising pitch on chains (L759-762).** Pitch 1.0x, 1.12x, 1.25x, 1.5x; "8-millisecond
    light haptic tap". Today: Summary: "haptics and rising pitch on chains". Plan: "Later ... may come in early" (R-162.10). Code: PART:
    haptics.ts already buzzes a hurt, a hard landing, a boss slam, a checkpoint and a clear behind a setting (haptics.ts:1-5, engine
    buzz calls); no crack or grab tap; no pitch chain. Proposal: **adopt now** (about an hour; it is a feel-of-every-beat change).
29. **Profile on the cheapest phone every week (L636).** Today: Summary/Plan: missing; R-3.7 is one heat run. Proposal: **adopt** as a
    weekly line on STATUS.md.
30. **Narrative and collectibles anchored to node slots so a re-roll never breaks them (L626).** "Node_Start, Node_MidRest, Node_Portal".
    Today: Summary: missing. Code: PART: wayside lines are placed at 'start', 'half', 'near' (wayside.ts: 39, 31, 7 uses). Proposal:
    **adapt** when nodes exist (Phase B): the find, the wayside line and the secret each name the node job they ride on.
31. **Formation "Triggered Swarm only on mistakes" in World 3 (L489).** "If the player plays cleanly (moves slowly in W3 ...), 0 enemies
    wake up. If they trip the wire, 3-4 enemies drop ... a thrilling 5-second escape sprint". Today: Summary: missing. Code: PART: a
    sleeping vine lashes anyone moving while it looks (thornVine.ts:4-8). Proposal: **adapt:** the vines' mistake triggers a short
    escape, not just a lost heart.
32. **Swimming that is FAST (L652-655).** "multiply maxHorizontalSpeed by 1.8, set gravity to -0.2 * g ... hydro-dash ... 1.4x normal
    jump height". Today: Summary: "fast happy swimming". Plan B and R-5.22 say "sloths swim three times faster". Code: the opposite:
    `SWIM.speed: 150` px/s, "about half a run, so the water feels like water" (swim.ts:34-35) against a run of 285 (physics.ts:9).
    Proposal: **adopt:** the swim stage (R-5.22) must flip this number, or it will feel like every dreaded water level.

## 2. Where our rules contradict the research

| # | The research says | Our side says | Note |
|---|---|---|---|
| C1 | "Never keep the Puzzle stage at X-7 and the Vertical stage at X-6 in every single world" (L403); "If every world uses the same 10-stage template in the same order, players will subconsciously feel the formula by World 4" (L391) | STAGE-RULES §0b.6: "X-1 arrival, X-2 teach ..., X-6 change of pace (slow, dark, puzzle), X-7 exploring with branches, ... X-10 the boss" for every world (now "UNDER REVIEW") | The code is between the two: stagePlan.ts varies types, but X-9 is "gauntlet" in all 10 worlds and X-1 "sprint" in 8. |
| C2 | Phase 1 target "60 FPS on budget phones" (L560); "Lock a Fixed 60Hz Physics Tick ... behave identically at 20 FPS or 120 FPS" (L570); Rule 4 "locked 60 FPS" (L635) | CLAUDE.md: "the loop is locked at 30 fps on purpose"; Plan: "Kept from our plan ... the 30 fps lock"; "Not taken: A 60 Hz physics rewrite" | Our engine is not a fixed tick either way (see §3, F9). |
| C3 | "If the similarity score is higher than 55%, the generator automatically rejects the seed" with Levenshtein distance against N-1 to N-7 (L518, L584) | Validator: cosine of 3-run counts, 0.55 (core.ts:237) and 0.45 for the stage before (evaluate.ts:30); STAGE-RULES §2 "Sameness": "cosine ... under ~0.78" | Our own rules disagree with each other (0.78 in §2, 0.55 in the validator). The research also says "reject": ours only flags. |
| C4 | "if [J -> V -> C] appears more than twice in one stage, flag the node as repetitive" (L583) | Validator: the same 4-run more than 3 times, or a 3-run back to back 3+ times (core.ts:188-189) | Ours lets a 3-run come back any number of times as long as it is not back to back. |
| C5 | "at least 3 Nodes should have ZERO enemies"; rest nodes "100% sacred" (L482-483) | Validator flags only under 25% of the route's length free (ENEMY_FREE_TARGET 0.35 minus 0.1, evaluate.ts:72) | Rest stretches are not checked at all. |
| C6 | "Never spawn an enemy within 150 px of a Blind Landing" (L492, L615) | Validator 150 px (mechanics.ts:140) but the generator keeps patrols only 120 px from a take-off or landing (JUMP_CLEAR, stageMetrics.ts:45; gen2/pipeline.ts:1465) | The generator can build what the validator flags. |
| C7 | Dead time: a node fails at "over 2.5 seconds with zero inputs" (L585) | Validator 2.5 s, but plus a 2.5 s rest-pad allowance after a group (core.ts:142-147, so up to 5 s); STAGE-RULES §2 "no quiet stretch over about 4 s" and "no walk with no action over 2.0 s Normal, 3.0 s Easy" | Three different numbers in our own files. |
| C8 | Node 1 intro "1 action every 2.5 seconds" (0.4 a second) (L529) | Validator's intro: up to 0.8 moves a second for the first 15 s (core.ts:249-250) | Ours is twice as busy. |
| C9 | "Place an invisible sub-checkpoint at the entrance apron of every single Node so dying ... respawns Pokey in under 0.8 seconds" (L604) | STAGE-RULES §0b.8: "respawn within about 2 s of the hard part"; gen2 flags at rests and every 35 s | |
| C10 | "By ensuring every single level follows this exact tension-and-release shape ... the game will never feel repetitive" (L536) | §0c.2-3 and Matt's 55 rating: a fixed template is what reads as "the same" | The research contradicts its own L391 here; our direction is right to vary the shape. |
| C11 | BPMs: World 2 85 (L523) or 90 (L597), World 5 110, World 8 125, World 10 130 "urgent" | Our music: W2 94-102, W5 100-108, W8 84-92, W10 78-84 (styles.ts:108-220); STAGE-RULES §0b.9 copies the research's 85/110/130 | If placements lock to the beat, the beat must be the music the player hears. World 10's music is our second-slowest, not "urgent". |
| C12 | "2048x2048 power-of-two sprite sheets" (L571) | artcheck allows up to 4096 px; R-3.12 only splits sheets over 4096; PERFORMANCE-RULES lists 2048x8172 sheets (lines 43-45) | 4096 is the ceiling on many phones; 2048 is the safe floor the research names. |
| C13 | "Rule 4 — ... Do not touch Worlds 2 through 10 until World 1 and World 2 ... pass 100 consecutive random seed validations with zero repetition warnings" (L635) | Plan: World 1 only, Matt's rating as the gate | |
| C14 | Director: "Keeps casual players from rage-quitting while ... keeping veteran players on the edge ... inside the exact same game mode" (L758) | Plan "Later": "an adaptive director (it fights the Easy/Normal split)" | Ours is a reasoned "not now"; assist.ts already offers help after 3 Game Overs (assist.ts:1-16). |
| C15 | Cause and effect and slot shuffling are "Structural Breakers" against repetition (L391, L398-406) | Plan puts cause and effect under "Later (good ideas, not for launch)"; the slot shuffle is in no plan item | The plan treats a core fix as an extra. |
| C16 | Swimming "three times faster ... maxHorizontalSpeed by 1.8" (L653-654) | swim.ts:34-35 "about half a run, so the water feels like water" | ROADMAP R-5.22 already agrees with the research; the code does not. |
| C17 | The 30 ideas include "Bending saplings", "stillness", "haptics" as new | Plan "Later": bending saplings; "Already there": stillness (patience.ts) | Both sides are off: a bending sapling piece already exists (puzzleKit.ts:104-106, used in meecaStage.ts); patience is World 4 only. |
| C18 | "look back at the token streams of Level 1 through Level 7 stored in memory or local storage" (L516) | Plan "Not taken: storing the player's last run to force a different layout" | The code already does this per stage: layoutMemory.ts keeps the last layout and rolls away from it in World 1 (layoutMemory.ts:14-21). The research's version is across stages, which the validator can do offline instead. |

## 3. Facts about our game the research gets wrong (checked in code)

| # | Line | The research says | What the code shows |
|---|---|---|---|
| F1 | L429 | "your levels procedurally reorganize their Node Graph on each run ... StageDNA ... BFS solver" | No node graph and no StageDNA. World 1 rolls section versions (w1Sections.ts); gen2 stages pick one of 16 curated rolls (gen2/seeds.ts:2-5); a layout is kept until the stage is cleared (layoutMemory.ts:6-13). The reachability check is levelCheck.ts. |
| F2 | L467 | "tripping a silk wire currently wakes up just one spider" | A touched thread rouses every spider within the hum's reach (w5Play.ts:440-452). True that nothing drops and there is no chaser. |
| F3 | L480, L482 | "your 6-to-8 Node Stage Architecture"; "a standard 2-minute stage (8 Nodes)" | No nodes. A gen2 stage is about 25-28 sections in a row (gen2/seeds.ts:56-58); World 1's finish is a `fillTo` shuffle bag (w1Sections.ts:197). |
| F4 | L593 | "Your 9 procedurally generated levels per world" | gen2 builds only 5-7, 5-9 and the World 6-8 stages (gen2/game.ts:85-92); the rest are hand-built with rolled versions or on the older generator. |
| F5 | L606 | Enemies "all die to a basic jump stomp" | The caiman bounces a stomp off ("ARMORED!": fight.ts:223, engine.ts:4583-4588); spiders and ant hazards can't be stomped (fight.ts:228-229); the turtle hides in its shell from a face hit and its shell can be kicked and bowls others over (enemyBrain.ts:78, engine.ts:2724). The Plan's "no enemy needs one move over another" is also too strong. |
| F6 | L446 | The high-bounce (hold jump on a stomp, 1.5x higher) is new | Already in: holding jump gives -620 against -460 (engine.ts:4596), about 1.8x the height; a dive stomp gives -700. |
| F7 | L452, L459 | Snakes "walking back and forth"; panthers "just running at the player" | The snake is shy, backs off and strikes close, chase speed 0 (enemyBrain.ts:53-55); the ocelot already creeps while his back is turned and slows when faced ("watched: 0.3", enemyBrain.ts:57-59): the red-light/green-light stalker is half in, on the ocelot. |
| F8 | L557, L566 | "Existing Canvas code" moving to "WebGL and SpriteJS" | We are moving to PixiJS v8, a GPU layer under the canvas (R-3.1; engine.ts drawGpuFrame after render). |
| F9 | L567 | "if your physics step is tied to rendering frames, frame drops will alter Pokey's jump distance" | Partly true for us: each frame runs 1-3 steps of the frame's own time, each capped at 0.05 s (engine.ts:1245-1249). `STEP = 1/60` and `acc` are declared but never used (engine.ts:505-507). physics.ts:160 says "The game now simulates at a fixed 60 Hz": stale. The level check tests both 1/30 and 1/60 (SIM_DTS). |
| F10 | L622 | dotPresent: away 6-5 to 7-9, away in 8-1, present 10-1, away 10-2 to 10-6, back 10-7 to 10-9 | Code: away from 6-6 (not 6-5), all of World 7, present in 8-1, away 10-1 to 10-5, back 10-6 to 10-9 (wayside.ts:290-292). The research gives the new script's ranges (R-4.1 "Dot-present ranges"); the code is not there yet. |
| F11 | L629 | Several guardians' retry intros pick non-consecutive lines | Code: a prefix count for World 10 only, `{ 10: 2 }` (storyBosses.ts:216). Right for the new script (R-4.1 "retries as a line list"). |
| F12 | L405 | "4-7 The Long Drop right after the aerial special stage (4-D)" | 4-D sits after 4-5 and opens 4-6 (extraStages.ts:3); 4-6 Above the Mist sits between 4-D and 4-7. |
| F13 | L406 | World 7 starts "with a quiet observational puzzle room (7-1 / 7-3 Ten Chairs)" | 7-1 is "The Open Door", a sprint; 7-3 is Ten Chairs, a relic hunt (stagePlan.ts). Half right. |
| F14 | L404 | World 2's puzzle is early (2-3) and its climb at 2-6 | Right: 2-3 Stuck in the Reeds (rescue), 2-6 Up the Bank Houses (ascent) (stagePlan.ts). |
| F15 | L417 | Dot's pocket finds in 4-6, 5-6, 6-6, 7-6 | Stage 6 of Worlds 4-9 (finds.ts:45; wayside.ts:296): 8-6 and 9-6 too. |
| F16 | L623 | "keeping them separate from the 30 finds count" | Right: 30 finds (note, keepsake, book x 10 worlds, finds.ts:51) plus extras (pocket, notch, snails: finds.ts:298-326). Posters and ledger pages are not in the code (R-4.3, blocked by R-4.1). |
| F17 | L598-599 | Seesaw roots in 6-3, water-wheel locks in 6-7, buoyant fast swimming in 6-7 | A seesaw piece exists (puzzleKit.ts:83, used in w6Rooms.ts); 6-7 uses a raft lift in water and a sluice piece exists (puzzleKit.ts:95), no water wheel; 6-7's swimming is slow (swim.ts:34-35). |
| F18 | L649-651 | Bending saplings proposed as new | Already a piece: a sapling climbed to the top bends into a bridge and stays (puzzleKit.ts:104-106), used in 5-M (meecaStage.ts). No catapult. |
| F19 | L395 | Fake rest spots in World 5 proposed as new | Already a kind of it: World 5's soft armchairs hold him in silk until he wiggles free (puzzleKit.ts:101-103; w5Play.ts "chairs that tug"). No fake checkpoint, no drop into a room. |
| F20 | L578 | Keep dialogue bubbles as an HTML overlay | Already: Dot's guide is a React component (components/dot/DotGuide.tsx). |
| F21 | L759-761 | Haptics proposed as new | haptics.ts exists: hurt, hard landing, boss slam, checkpoint, clear, behind a setting (haptics.ts:1-5). |
| F22 | L713-714 | Boss intros fade to black | Partly: a 5 s in-engine entrance (eyes in the dark, roar, name) plays over the arena (bossEntrance.ts:1-11), then the talk panels. |
| F23 | L557, L632, L634 | File names | storyWorlds.ts, wayside.ts, storyBosses.ts, storyMemories.ts, finds.ts, pokeyJournal.ts, dotLinesData.ts, w6Rooms.ts, swim.ts and story.test.ts exist; nodeGenerator.ts, webglBatcher.ts and levelValidator.test.ts do not (our validator is tools/validate/). |
| F24 | L628 | Memory ids map, waiting, horn, storm, tally, door, blessing | Right: MAP, WAITING, HORN, STORM, TALLY, DOOR, BLESSING chapters (storyMemories.ts:35-315). |
| F25 | L377 (context) / L624 | Two special stages, 4-D and 5-M | We have four kinds: 4-D, 5-M, 7-4's perspective slide (w7Slide.ts:1-6) and 8-4's Lantern Run (lantern.ts:1-2). The Plan's "we have 4-D and 5-M" also undercounts. |
| F26 | (research's own) | Its numbers disagree with themselves | W2 85 BPM (L523) vs 90 (L597); snake tongue 2 s, stiff 3 s (L454) vs 2.5 s, 4 s (L731); spiders 3 + 1 chaser (L471) vs 3-4 (L741); Meeca 1.5x faster (L764) vs maxSpeed x 1.4 (L765); idea 24 cut off (L738). |
| F27 | (aside, ours) | | The Jungle Journal line for the spider says "Stomp it in the pause" (enemyBrain.ts:89) while TRAITS says a stomp is "not a move against this one" (fight.ts:205-206, 228). One of them is wrong: check in play. |

## 4. The full ledger (one row per idea)

Columns: # / research line / what it says / in our summary? / in rules, plan or validator? / status in the code / proposal.

| # | Line | What it says | Summary? | Rules / plan / validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 1 | 390-391 | The repetition trap: the same 10-stage template in the same order in every world; players feel the formula by World 4 | flattened | §0b.6 is the opposite (under review) | PART: stagePlan.ts varies types; X-9 gauntlet in 10/10, X-1 sprint in 8/10 | Adopt (section 1 item 1) |
| 2 | 392-393 | World-wide mutators: a macro rule per world that changes how progression works, not just obstacles | yes | no | NOT as a rule | Adopt: one per world, in §0c.7's fingerprint |
| 3 | 394 | W3 acoustic rule: too much noise in 3-3 or 3-5 opens the Prowler's eyes; last 20 s becomes a stealth-freeze test | yes | no | PART: noise.ts watchers; thornVine.ts lashes movers; watcher eyes at 3-2 (R-158.2) | Adapt: noise you make (hard landings) feeds the watchers |
| 4 | 395 | W5 trap rule: fake rest platforms and fake checkpoint teacups; stop on a silk doily and the floor drops into a web puzzle room | yes | no | PART: armchairs trap in silk (puzzleKit.ts:101-103) | Adopt the fake checkpoint; the room drop is Phase B |
| 5 | 396 | W6 companion split: 6-1 to 6-4 Dot's hints and fast double-jump cues; from 6-5 the camera pulls tighter around Flicker and play turns to grounded water puzzles | yes | no | PART: Dot away from 6-6 (wayside.ts:291); no camera change | Adopt the camera change with item 152 |
| 6 | 397 | W10 step counter, Step 1 to 999, across all of World 10; every vertical jump counts | yes | no | NOT | Adopt with the World 10 rebuild |
| 7 | 398-400 | Cause and effect: 2-3's log jam breaks, the river rises; 2-4 has flooded banks; 2-8 surges | yes | Plan "Later"; R-162.6 | NOT | Adapt: one link per world, Phase B |
| 8 | 401 | 7-3: set the fallen stone chair upright and 7-6 opens a secret upper passage | yes | R-162.6 | NOT | Adopt as World 7's link |
| 9 | 402-403 | Shuffle the slot order per act: never puzzle at X-7 and climb at X-6 in every world | flattened | §0b.6 opposite | PART (see 1) | Adopt; gate over STAGE_PLAN |
| 10 | 404 | W2: search/puzzle early (2-3), climb at 2-6 | missing | no | IN (stagePlan.ts) | Keep |
| 11 | 405 | W4: the vertical freefall late (4-7 The Long Drop) right after 4-D | missing | no | PART: 4-D sits after 4-5 (extraStages.ts:3) | Keep 4-7 late; the "after 4-D" is wrong |
| 12 | 406 | W7: open with a quiet observing puzzle room (7-1 / 7-3) before the fast crumbling floors (7-6) | missing | no | PART: 7-1 sprint, 7-3 Ten Chairs | Adapt: consider 7-1 as a quiet room |
| 13 | 408 | Secrets never behind unmarked solid walls; tells tied to the story and sloth moves | yes | no | PART: Hush Fern tell + line (wayside.ts:296-311) | Adopt as a rule in §4 |
| 14 | 410-411 | Pink Bell Notes found by Meeca's trail: hairpin scratch (W5), pink petal on a thermal (W4), two boot-prints at a dead end (W3) | yes (hairpin) | no | NOT (notes hang in Meeca's bell, wayside.ts:294) | Adopt the three tells for notes |
| 15 | 412-413 | Ledger Pages in plain sight high above a node's start; reached by looking back a node earlier and keeping an unbroken chain of branches or swings without touching ground (Page 2 over the river in 2-4, Page 3 on the high shelf in 3-7) | missing | R-4.3 (blocked) | NOT | Adopt with R-4.3 |
| 16 | 414-415 | Wanted Posters by "soldier logic": upside-down on the highest dry door (2-6), on a side branch with a doily (5-4), a soup placemat at the first fork (6-1) | missing | R-4.3 | NOT | Adopt with R-4.3 |
| 17 | 416-417 | Dot's pocket finds (4-6, 5-6, 6-6, 7-6): a shivering bush or a caught feather or thread on a foreground leaf that rustles as he passes | yes (rustling) | no | PART: crouch-to-rustle fern (storyWorlds.ts:165); stage 6 of W4-9 | Adapt: rustle on walk-past, not only crouch |
| 18 | 418-419 | Secret stage entrances inside normal stages via sloth behaviour, not a second flag | flattened | no | PART: one secret, 7-7 (secret.ts:1-8) | Adapt (Phase C) |
| 19 | 420-421 | Patience Unlock: stand or hang still 5 s without pressing anything; a vine lowers or a door opens | missing | no | PART: patience spots W4 only (patience.ts:1-11) | Adopt as a puzzle piece |
| 20 | 422-423 | Wrist-petal compass: within 300 px of a false-foliage wall the petal pulses and Grandma's music box chimes | yes | no | NOT (petal only in cutscenes, storyWorlds.ts:112) | Adopt with item 151 |
| 21 | 424-425 | Lure an enemy or hazard (a charger, 7-6's falling floor, 4-5's dive) into a wall Pokey can't break | missing | no | NOT | Adopt as a puzzle piece |
| 22 | 426-427 | Hang under the exit flag's platform to a hidden hollow | missing | R-160 (move only) | NOT | Adopt with R-160.1 placements |
| 23 | 428-429 | "Golden seed": the secret is a fixed spoke on node 3 or 4, behind one of the tells, checked 100% reachable on every roll | missing | no | NOT | Adapt when nodes exist |
| 24 | 431 | Enemies are moving geometry, timing gates and reactions, not roadblocks | yes | Plan "Enemies are roadblocks, not tools" | PART | Keep (R-159) |
| 25 | 434-435 | Never complex, pathfinding or random AI; unpredictable enemies cause cheap deaths | yes | no | IN: enemyBrain.ts patrol patches | Keep |
| 26 | 436-437 | One or two predictable things, an instant reaction to a trigger (sound, light, vibration, posture), a 0.5 s telegraph | yes | Plan A.3, R-159.1 | PART: crouch warnings, eagle screech (watcher) | Keep |
| 27 | 438-441 | Readability contract: within 0.2 s the player knows the danger zone, which button beats it, and how to use it to cross faster | missing (the 0.2 s and the "use it" question) | §0b.7 read by shape | PART | Adopt the three questions as the species check |
| 28 | 443 | Rock-paper-scissors triangle: switch moves on the fly | yes | Plan A.3, R-159.1 | PART: armoured stomp, unstompable spider (fight.ts:205-229) | Keep |
| 29 | 446 | Stomp beats ground walkers, birds, swimming snappers; hold jump on a stomp = 1.5x higher, enemies over pits as stepping stones | yes | R-159.1 | IN: -620 vs -460 (engine.ts:4596) | Keep; use it for item 50 |
| 30 | 447 | Punch beats fast ambushers (spiders, snakes, night hunters), swats shots; a punch stuns 1.5 s so you can pass without killing | yes | R-159.1 | PART: stun exists (fight.ts stunResist) | Adopt the 1.5 s pass-by stun |
| 31 | 448 | Kick alone breaks shields and shells, shoves heavy enemies; a kicked enemy slides along, knocks out the row, triggers far switches | yes | R-159.1 | PART: turtle shell kick slides and knocks over (engine.ts:2724) | Extend to more species and to switches |
| 32 | 450 | Each species a signature state machine tied to its world | yes | Plan A.3 | PART: personalities (enemyBrain.ts:52-84) | Keep |
| 33 | 452-454 | Snake "false vine": tongue flick every 2 s; grab raw and it drops you; punch it and it goes stiff 3 s as a swing vine | yes | Plan A.3 | NOT | Adopt (item 21) |
| 34 | 455 | Coiled snake on a branch tracks Pokey; within 3 body lengths, 0.4 s hiss, then a horizontal lunge; jump it or kick it off | missing | no | PART: snake strikes close (enemyBrain.ts:54) | Adopt the 0.4 s hiss and kick-off |
| 35 | 457-459 | Cave jaguars creep only when Pokey's back is turned or he is in the dark; freeze when faced or in a glowworm or lantern light | yes | Plan A.3 | PART: ocelot watched 0.3 (enemyBrain.ts:58-59); no light rule | Adopt the light rule (W3, W8) |
| 36 | 460 | Pounce: eyes flash yellow 0.5 s, a fixed-arc leap; duck under or uppercut | missing | no | PART: leap attacks exist | Adopt the duck-under answer |
| 37 | 462-464 | Eagle: circles in the background, untouchable far off; a ground shadow tracks Pokey 1.2 s, locks with a screech, dives 0.5 s later, talons stick in the dirt (or break a branch for you) | yes | R-158.1, R-158.2 | PART: screech then a shadow sweep (engine.ts:2809) | Keep R-158; add the stuck talons |
| 38 | 465 | Eagles hover still in wind as stepping stones (4-4, 4-5); killing from the side drops you in the abyss | missing | no | NOT | Adopt (item 18) |
| 39 | 466-471 | Spider tripwire 3 beats: 0.0 s harp pluck, 4-6 pairs of eyes; 0.4 s 3 spiders drop on threads at staggered heights ahead, 1 chaser behind | flattened | no | PART: hum rouses spiders in reach (w5Play.ts:440-452) | Adopt (item 9) |
| 40 | 472 | Counterplay: weave through at speed, or kick the anchor web, or punch the lowest so it swings into the other two and tangles all three | missing | no | NOT | Adopt with 39 |
| 41 | 474 | River snappers: eyes above water; snap 1.5 m up when jumped over; at the top the snout is a bouncy platform for 1 s | yes | no | NOT | Adopt (item 19) |
| 42 | 475-476 | Front shield: blocks punch; a heavy kick knocks it off, or kicks him into water (which they hate in W2) | flattened | R-159.1 "kick breaks shields" | NOT | Adopt |
| 43 | 477 | Spiked helmet: a stomp hurts Pokey; punch or kick from the side | missing | no | NOT | Adopt |
| 44 | 478 | Spear: blocks the front; stomp from above, or lure the thrust into a wooden wall where it sticks 2 s | missing | no | NOT | Adopt |
| 45 | 480 | Enemy count set by the node's job, never scattered at random | yes | R-159.1 | NOT | Keep |
| 46 | 481-483 | The 35% rule: at least 3 of 8 nodes have no enemies; rests 0 enemies, "100% sacred" | yes | validator: route length, flag under 25% (evaluate.ts:72) | — | Adopt by node; rests checked (item 16) |
| 47 | 484 | Pure precision nodes enemy-free: "Let the environment be the enemy" | missing | no | — | Adopt: no animal in a tight stretch |
| 48 | 485-486 | 1 to 3 active on screen; never clusters of one enemy on flat ground | yes | no | NOT checked | Adopt in validator |
| 49 | 487 | Solo Specialist: 1 high-threat enemy on a bridge or switch where dealing with it is the room's puzzle | missing | no | NOT | Adopt (item 8) |
| 50 | 488 | Stepping-stone chain: 2-3 eagles or hanging snakes at jump-arc spacing over a gap; Stomp, Stomp, Stomp across | missing | no | PART: stomp chain scored (engine.ts:4597-4610) | Adopt (item 18) |
| 51 | 489 | Triggered swarm: 3-5 enemies only on a mistake (W3 vines, W5 silk); clean play wakes 0; a 5 s escape sprint to the next rest | missing | no | PART: vine lash, spider rush | Adapt (item 31) |
| 52 | 492 | No enemy within 150 px of a blind landing (long swing or drop) | yes | validator 150 px (mechanics.ts:140) | PART: generator 120 px (stageMetrics.ts:45) | Raise the generator to 150 |
| 53 | 494 | Wide flat ledge over 300 px: eligible for 1 armoured guard or coiled snake | flattened | no | NOT | Adopt |
| 54 | 495 | Chasm gap over 250 px: eligible for 1 hovering eagle or vertical snapper as a bounce helper | flattened | no | NOT | Adopt |
| 55 | 496 | Silk/stealth node: a dormant ambush group (3 spiders + 1 chaser) on ceiling anchors wired to the floor tripwire | flattened | no | NOT | Adopt with 39 |
| 56 | 498-499 | A fingerprint and anti-similarity pipeline on a rhythm-group generator; predictability means fixed blueprints, not grammar | yes | Plan A.1 | PART: validator | Keep |
| 57 | 502-503 | Fingerprint the moment a stage is generated; compare behaviour tokens, not tile coordinates | yes | validator (offline) | PART: gen2 curates offline (seeds.ts) | Keep offline; see 103 |
| 58 | 504-512 | Tokens: J jump, V vine, B branch, W wind, S slow, C climb, P puzzle | yes | validator core.ts:34-37 (plus M R F E D X K U j) | IN | Keep |
| 59 | 513-514 | Boring example J V B repeated three times | yes | validator repeats | IN | Keep |
| 60 | 516-517 | Look back at Levels 1-7; any exact 3- or 4-token sequence in Level 7 is forbidden in Level 8 | flattened | validator: "nothing new" only (evaluate.ts:101-108) | NOT | Adapt (item 5) |
| 61 | 518 | Levenshtein vs Level 7 over 55%: reject, seed++, scramble the map shape (loopback to chimney or split) | flattened | validator cosine (core.ts:221-237) | NOT (flag only) | Adapt (item 6) |
| 62 | 520 | Flow state: alternate intense execution and micro-rests; clumped exhausts, spread out bores | yes | §0b.1 | PART | Keep |
| 63 | 522-523 | A BPM per stage from its world: W2 85 relaxed, W5 110 staccato, W10 130 urgent | flattened ("a tempo per world") | §0b.9 draft | PART: music BPM per world only (styles.ts:94-220) | Adapt: use the music's BPM (C11) |
| 64 | 524 | Cut every 10-15 s node into bars of 4 beats | missing | §0b.9 draft | NOT | Adopt |
| 65 | 525 | Lock platforms, vines and hazards to the beat, the off-beat or the half-note | missing | §0b.9 draft | NOT | Adopt (item 3) |
| 66 | 526 | Example: swinging vines at exact 4/4 intervals at 90 BPM, so the player dances to a metronome | missing | no | NOT | Adopt as the first test piece |
| 67 | 528 | Action density across the 6-8 nodes as a strict sine wave | flattened | §2 "sawtooth" | PART: validator pacing tags (core.ts:257-293) | Adapt (item 10) |
| 68 | 529 | Node 1: 1 action every 2.5 s, warm-up | missing | validator intro up to 0.8/s (core.ts:249) | — | Adopt 0.4/s |
| 69 | 530 | Node 2: 1 action every 1.2 s | missing | validator "flow" | — | Adopt |
| 70 | 531 | Node 3: the spike, a rapid chain of breaking branches plus wind, peak tension | missing | §0b.2 part 3 | PART | Adapt: the spike may move |
| 71 | 532 | Node 4: zero action, a flat safe ledge where the wayside line plays | missing | §0b.1 rests | PART: wayside 'half' lines (wayside.ts) | Adopt: the half line sits on the mid rest |
| 72 | 533 | Nodes 5-6: a completely different mechanical pairing (run/jump to slow puzzle or pulley climb) | missing | §0b.2 part 3 near | PART | Adopt (item 11) |
| 73 | 534 | Node 7: maximum density, everything together | yes | §0b.2 part 4 | PART | Keep |
| 74 | 535 | Node 8: cool-down, a slide or glide into the exit flag | missing | no | NOT | Adopt |
| 75 | 536 | Every level follows this exact shape, only the flavour varies | missing | contradicts §0c | — | Not taken as written (C10): vary the shape |
| 76 | 538 | Random collectibles get tripped over or never found; always-highest is formulaic | missing | no | PART: finds in fixed stage numbers (finds.ts:45) | Adopt (item 12) |
| 77 | 540-541 | Every collectible visible or heard from the safe rest just before it | yes | no | NOT checked | Adopt as a validator check once finds have roles |
| 78 | 542 | Sightline tease: from Node 4's rest the player sees a Ledger Page glinting across a chasm | yes | no | NOT | Adopt with R-4.3 |
| 79 | 543 | Sound tease: a faint low chime of Grandma's music box within 300 px of a hidden note | yes | no | NOT | Adopt (cheap: audio exists) |
| 80 | 544-545 | Give collectibles structural roles in the node graph so they never repeat their hiding spot | missing | no | NOT (fixed per stage number) | Adopt (item 12) |
| 81 | 546 | Flow Reward note at the top of a fast swing or mud slide; only with unbroken speed | missing | no | NOT | Adopt |
| 82 | 547 | Branch-Switch Ledger Page on a high road of breaking branches; a fall drops safely to the low road | missing | §0b.2 part 3 "optional hard branch with the big collectible" | PART: forks (stageForks.ts) | Adopt |
| 83 | 548 | Patience Reward Poster in a dead-end alcove a fast player rushes past; found by stopping or hanging under a branch | missing | no | NOT | Adopt |
| 84 | 549-555 | Checklist: tokenize; Levenshtein against the previous 7; lock to BPM; force the sine wave; tease collectibles | flattened | validator part | PART | See rows 60-83 |
| 85 | 557 | Foundation first, validator second, content third; risks are budget GPUs and repetitive patterns | yes | Plan order | — | Keep |
| 86 | 558-565 | Six phases: WebGL core, headless validator, node-graph generator, reactive enemies and bosses, story and collectibles, APK profiling | yes | Plan lanes and phases | — | Keep |
| 87 | 560 | Phase 1 goal: 60 FPS on budget phones | missing | contradicts the 30 fps lock (C2) | 30 fps (engine.ts:503) | Not taken: 30 fps steady is our bar (CLAUDE.md) |
| 88 | 567-569 | Separate state from drawing: logic as pure math on coordinates | yes | GPU-RENDERER-PLAN | PART: many pure modules (fight.ts, swim.ts, patience.ts) | Keep |
| 89 | 570 | Fixed 60 Hz physics tick with an accumulator; same arcs at 20 or 120 FPS | yes | Plan "Not taken" | NOT: STEP and acc unused (engine.ts:505-507); physics.ts:160 comment stale | Not taken; fix the stale comment; log the frame-time dependence (F9) |
| 90 | 571 | 2048x2048 power-of-two atlases; a stage in 1-3 batched draw calls | flattened | R-3.x, artcheck 4096 | PART: atlases exist | Adapt: 2048 per sheet as the target (C12) |
| 91 | 572 | Cache non-tile platforms and parallax as static textures or instanced quads | yes | R-3.2, R-3.3 | PART | Keep |
| 92 | 573-574 | Validators and touch tuning on a stuttering renderer give false data; a 40 ms spike feels like bad physics | missing | no | — | Adopt as a note in the validator: it runs headless, but feel reports need a steady phone |
| 93 | 576 | No new objects in the frame loop; pools for particles, dust, floating text, made at stage load | yes | PERFORMANCE-RULES.md:121 (no allocations in the frame loop, pools) | PART | Keep |
| 94 | 577 | Low-end phones crash past 150-200 MB of textures; unload the last world's atlas before the next | yes | no | PART: World 5 sheets "let go with the world" (w5Play.ts:183) | Adopt as a WebGL lane check |
| 95 | 578 | Keep UI and wayside bubbles as HTML/CSS over the WebGL canvas | yes | — | IN: DotGuide.tsx | Keep |
| 96 | 580 | A headless validator before redesigning one level; ms per run, no tokens, rejects boring seeds | yes | Plan A.1 | IN as a gate (funcheck.ts) | Keep |
| 97 | 582 | The generator outputs the token string for every required action | yes | validator reads the route | PART: tokens from the inspector's route (core.ts:81-134), not from the generator | Keep |
| 98 | 583 | Within one stage, [J V C] more than twice flags the node | flattened | validator looser (C4) | — | Adopt "more than twice" for 3-runs |
| 99 | 584 | Level N vs the saved strings of N-1 to N-7; more than 55% structural similarity rejects the seed | flattened | validator: any earlier W1 stage, cosine | — | Adapt (item 6) |
| 100 | 585 | Dead-time auditor: a node fails with over 2.5 s of flat walking and zero inputs | yes | validator 2.5 s + 2.5 s pad (core.ts:142-147) | — | Settle one number (C7) |
| 101 | 585 | A node fails when the same jump interval repeats four times in a row | missing | no | — | Adopt now (item 4) |
| 102 | 586 | Noisy bot: 15% less air speed and a 100 ms takeoff delay; every ledge, page, poster and note reachable | flattened | validator jitter sd 0.058, air 0.85 (play.ts:304-305) | — | Adopt a steady +100 ms run and the finds (item 24) |
| 103 | 588 | Test 500 variations a second and keep only the seeds that pass | flattened | gen2 curation: a few hundred rolls, best 16 (gen2/DESIGN.md) | PART | Keep; feed the validator's new checks into curation |
| 104 | 590 | Perfect-bot bias: validate reachability from 6-8 px inside the ledge | missing | — | IN, stronger: every jump must work from 70 px before the edge (physics.ts:163-169, levelCheck.ts:111) | Keep |
| 105 | 591 | The landing must be inside the camera's view at take-off | yes | validator "landing unseen" (world1.ts:114) | IN (check) | Keep |
| 106 | 593 | Nine generated stages per world as a graph of 6-8 nodes in four parts; the tenth a handmade guardian | yes | §0b.2, Plan B | PART (F4) | Keep |
| 107 | 595 | Roll a map shape first: Linear Wave, Over-Under Loopback, High/Low Split, Vertical Chimney, Hub-and-Spoke (3-7, 6-7) | flattened | Plan B (4 shapes) | PART: high/low forks (stageForks.ts:66-70) | Adopt all five; hub for search stages (item 17) |
| 108 | 596 | Tag nodes Intro, Flow, Puzzle, Rest, Tight; never two Tight in a row | yes | validator pacing (core.ts:240-293) | — | Keep |
| 109 | 597 | Flow and Tight nodes: beat pattern first (W2 90, W8 125 BPM), trace the real jump along it, place pieces under his feet | flattened | §0b.9 draft | NOT | Adapt (item 3) |
| 110 | 598 | 1-2 puzzle machines per world: vine pulleys, jump-flip toggles, light bridges (W3, W8), seesaw roots (6-3), water-wheel locks (6-7) | yes | Plan B | PART: lift by basket (puzzleKit.ts:70-77), seesaw (puzzleKit.ts:83), sluice (puzzleKit.ts:95), moonflower light (puzzleKit.ts:119) | Keep; add toggles |
| 111 | 599 | Sloth biology modifiers: under-branch hang, fast calm-water swim (6-7), belly slide on mud and ash, stillness camouflage, glowworm lighting (3-2) | yes | R-160, R-5.22 | PART: swim slow (swim.ts:35), bush hiding (engine.ts:1489-1490) | Adopt; flip the swim speed (item 32) |
| 112 | 600-601 | Map shape separate from micro-rhythm: 7 a tailwind sprint, 8 a vertical zig-zag with pulleys | missing | no | NOT | Adopt (item 17) |
| 113 | 603 | A flat, hazard-free 200 px apron at the entrance and exit of every node | yes | no | NOT as a rule | Adopt (item 25) |
| 114 | 604 | An invisible checkpoint at every node's entrance; respawn under 0.8 s | missing | §0b.8 "about 2 s" (C9) | PART: flags at rests and every 35 s (gen2/pipeline.ts:1214) | Adapt (item 25) |
| 115 | 606 | Today's enemies are passive and die to a stomp; bosses all wait for a glowing symbol | yes | Plan "Why it's a 55" | PART wrong (F5) | Correct the Plan's wording |
| 116 | 608 | Phase 4 combat triangle (as rows 28-31) | yes | R-159.1 | PART | See 28-31 |
| 117 | 609 | Platform-role spawning in 65% of nodes, 35% enemy-free including every rest | yes | validator part | — | See 46 |
| 118 | 610 | Species reactions summary: vine snakes until punched, jaguars in the dark or back turned, eagle shadow, 3 + 1 spider curtain | yes | Plan A.3 | PART | See 33-40 |
| 119 | 611 | Three ways to beat a guardian: the scripted tip (Crocus Rex's jaws, the Golem's rune), an arena trap (a log into Crocus Rex's mouth, cut the Queen's ceiling anchors), a kick/punch parry or climb counter | yes | R-161.1, R-161.2 | PART: way 1 only | Keep; take these two traps for bosses 2 and 5 |
| 120 | 613 | Why this order: environment systems first give enemies toys to use | yes | Plan order | — | Keep |
| 121 | 615 | Landing-zone cheap hits, 150 px (as row 52) | yes | — | — | See 52 |
| 122 | 616 | Keep AI deterministic, a 0.5 s telegraph before every strike | yes | — | — | See 26 |
| 123 | 620 | Scenes between stages at most 6 pictures (under 30 s); defeat plus memory at most 12; no before-a-stage scene at X-6 | missing | R-4.1 ("never at stage 6") | NOT checked | Adopt as a story test with R-4.1 |
| 124 | 621 | Wayside and Dot rows at node 1, the mid rest and the pre-exit node; split any line over 15 words into two bubbles | flattened | no | PART: 'start', 'half', 'near' (wayside.ts) | Adopt the 15-word split as a text gate |
| 125 | 622 | Dot away 6-5 to 7-9, away 8-1, present 10-1, away 10-2 to 10-6, back 10-7 to 10-9; hints in w6Rooms.ts and swim.ts to Flicker and Pokey | missing | R-4.1 "Dot-present ranges" | differs (F10, wayside.ts:290-292) | Adopt with R-4.1 |
| 126 | 623 | Posters at 1-9, 2-6, 3-4, 4-5, 5-4, 6-1, 7-1, 8-9, 9-4, 10-7; Ledger Pages at 2-4, 3-7, 4-7, 5-7, 6-9, 7-9, 8-7, 9-9, page 10 at Grandma's; in high-skill portal branches; separate from the 30 finds | missing | R-4.3 (blocked by R-4.1) | NOT | Adopt with R-4.3; note 9 of 10 posters are in X-1, X-4..X-7 or X-9: check they don't land in the same slot as the world's other finds |
| 127 | 624 | Special stages: 4-D with the "Still here" clear scene, 5-M with Flicker, the crumbling ledge in The Horn, the two-thumb let-go in The Reach | missing | R-4.8 (parking lot) for the played moments | PART: 4-D, 5-M in (extraStages.ts); "Still here" line exists (storyWorlds.ts:202) | Keep R-4.8 |
| 128 | 626 | Story and collectibles as anchors on node slots (Node_Start, Node_MidRest, Node_Portal) so re-rolls never break them | missing | no | PART | Adapt (item 30) |
| 129 | 628 | Keep memory ids (map, waiting, horn, storm, tally, door, blessing); old saves past 3-5, 4-D or World 8 unlock the moved scenes | missing | R-4.1 "old-save unlocks" | IN ids (F24) | Keep |
| 130 | 629 | RETRY_INTRO_LINES as an array of line indices (Monarch and General: lines 1, 2 and the last) | flattened ("retries as a line list" in R-4.1) | R-4.1 | PART: prefix count {10: 2} (storyBosses.ts:216) | Adopt with R-4.1 |
| 131 | 632 | Token rule 1: keep data files out of engineering prompts; pass the 100-line logic file and a 10-line interface | yes | LEAD-PLAYBOOK briefs | — | Keep |
| 132 | 633 | Rule 2: a spec contract before code (a pure function of StageDNA and seed returning 7 nodes, no two Tight adjacent) | yes | — | — | Keep |
| 133 | 634 | Rule 3: tests debug; paste only the 5-line stack | yes | — | — | Keep |
| 134 | 635 | Rule 4: no Worlds 2-10 until Worlds 1 AND 2 hold a locked 60 FPS in WebGL on the slowest phone and pass 100 seeds in a row with zero repetition warnings | flattened | Plan: World 1, Matt's rating | — | Adapt (item 15) |
| 135 | 636 | Rule 5: build the APK each phase and profile on the cheapest phone weekly with remote DevTools | missing | R-3.7 once | — | Adopt (item 29) |
| 136 | 640-643 | Idea 1, under-branch hanging: a ceiling-hangable flag on branches; hold Climb to hang; Left/Right move; Jump drops (or launches up holding Up); Kick/Punch knock hazards below; doubles every branch | yes | R-160.1, R-160.2 | NOT | Keep R-160; take the controls as written |
| 137 | 644-647 | Idea 2, stillness resonance: still 1.5 s (speed under 0.01) wakes a 400 px radius: glowing platforms solid, hidden enemies outlined, thorn vines retract | flattened | Plan "already there" | PART: W4 only (patience.ts) | Adopt (item 14) |
| 138 | 648-651 | Idea 3, bending saplings: his weight bends the stalk 90 degrees into a bridge, or a jump mid-spring catapults him | yes | Plan "Later", R-162.8 | PART: the bridge half exists (puzzleKit.ts:104-106) | Adopt the catapult; it is cheap now |
| 139 | 652-655 | Idea 4, fast swim: clean water max speed x1.8, gravity -0.2 g, Jump a hydro-dash out at 1.4x jump height | yes | R-5.22 | opposite (swim.ts:34-35) | Adopt (item 32) |
| 140 | 656-659 | Idea 5, camouflage: crouch on moss or fern, tint 40% to the foliage, enemy sight ignores him unless mid-attack; a double jump releases moths that light dark ledges | yes | Plan "Later", R-162.7 | PART: bush hiding in a watched stretch (engine.ts:1489-1490) | Adapt: moss as cover in W3/W8; moths later |
| 141 | 661-664 | Idea 6, counterweight pulleys: two linked ends at 180 px/s; a heavy prop holds the other end up | yes | Plan B | IN in part: basket-weight lift (puzzleKit.ts:70-77; w2Stages.ts, w8Rooms.ts) | Bring back in more worlds (§0.1) |
| 142 | 665-668 | Idea 7, jump-toggled flora (W5, W7): every jump flips solid and ghost platforms; a double jump flips twice | yes | Plan B | NOT | Adopt (item 27) |
| 143 | 669-672 | Idea 8, domino branches: each break starts the next after 0.15 s; the last drops a weight on a switch or crushes a barrier | yes | Plan B | NOT | Adopt |
| 144 | 673-676 | Idea 9, wind shadows: walls, boulders and shields block the wind; zero force behind them | yes | no | NOT | Adopt (item 23) |
| 145 | 677-680 | Idea 10, silk ricochet: a taut 45 degree line reflects an air kick or fast fall at 1.2x speed; flat silk slows a walk | yes | Plan "Later", R-162.9 | NOT | Keep "Later" |
| 146 | 682-685 | Idea 11, light-solid bridges (W3, W6, W8) and "shadow bark" solid only in the dark; punch a lantern to swing a bridge across | yes | Plan lane 1 "after WebGL" | PART: moonflower and mist reveal (puzzleKit.ts:117-119, patience.ts) | Adapt: the collision part needs no shader; can come before WebGL |
| 147 | 686-689 | Idea 12, sound ripples: a hard landing, a bell (3-6, 3-7) or a kicked log sends a ring that outlines hidden platforms 2 s and wakes sound-sensitive enemies | yes | no | PART: bells make noise (noise.ts, puzzleKit.ts:85) | Adapt for World 3 (pairs with row 3) |
| 148 | 690-693 | Idea 13, lightning silhouettes (W10): a 0.4 s flash shows thorns and safe steps; safe ledges keep a trail fading over 2.5 s | yes | Plan lane 1 | NOT | Keep (WebGL) |
| 149 | 694-697 | Idea 14, water waves: 64 springs on the surface; logs ride it; a ground-pound lifts a far platform | yes | Plan lane 1 | NOT | Keep (WebGL) |
| 150 | 698-701 | Idea 15, background-layer jumps: hollow logs or cannon vines send him to the back layer at 0.6-0.65 scale for 15 s | yes | Plan "Later", R-162.3 | NOT | Keep "Later" |
| 151 | 703-706 | Idea 16, wrist-petal pulse: pulse rate f = 1 + 4 x max(0, 1 - d/500) to the nearest uncollected note, keepsake or secret | yes | no | NOT | Adopt (cheap; replaces the fern line as the tell) |
| 152 | 707-711 | Idea 17, Dot grabs a claw at the double jump's top for 0.25 s (15% more hang); with Dot away, Flicker flies 150 px ahead in the dark | yes (name) | no | NOT / PART (glow over his head) | Adopt (item 22) |
| 153 | 712-715 | Idea 18, playable boss intros: the camera locks into the arena as he crosses the X-10 threshold; the opening plays in-engine with bubbles over the live arena | yes | R-4.8 is near | PART (F22) | Adapt in the boss rebuilds (R-161) |
| 154 | 716-719 | Idea 19, poster cameos: after a poster, the two soldiers set a failing trap on the next rest; bounty climbs 1 to 1,000 beans | yes | no | NOT | Adopt with R-4.3 |
| 155 | 720-723 | Idea 20, Venom Fang as a hidden zip-line vine (three pegs on him) in an upper node in Worlds 2, 4, 6, 8; "Don't talk to the vine" | yes | no | NOT | Adopt: a recurring secret that is ours alone |
| 156 | 725-728 | Idea 21, enemy bowling: a kick sends an enemy rolling at 550 px/s; it knocks others down, breaks cracked walls, presses plates | yes | R-159.1 | PART (turtle shell, engine.ts:2724) | Extend (row 31) |
| 157 | 729-732 | Idea 22, vine snakes: tongue flick every 2.5 s; stunned 4 s and swingable (row 33 says 2 s and 3 s) | yes | Plan A.3 | NOT | Adopt; pick one set of numbers |
| 158 | 733-736 | Idea 23, projectile batting: a 0.15 s deflect window on the punch; the shot flies back; 40 ms hit-stop and sparks; cut ropes or stun fliers | yes | R-159.1 "punch knocks back shots" | NOT | Keep |
| 159 | 737-738 | Idea 24, look-away sentries (W3, W7): move only when Pokey faces away (the text is cut off here) | yes | no | PART: ocelot (enemyBrain.ts:58) | Adopt for World 7's sentries |
| 160 | 740-743 | Idea 25, spider curtain: 3-4 spiders to heights y1, y2, y3 with a jump window; kick the top one and it swings like Newton's cradle | yes | no | PART (row 39) | Adopt (item 9) |
| 161 | 745-748 | Idea 26, seed-sharing ghost stamp: the 32-bit seed and positions at 4 Hz in a short code; friends race the ghost | yes | Plan "Later", R-162.1 | NOT | Keep "Later" |
| 162 | 749-752 | Idea 27, environmental finisher: at 15% health a story trap ends the fight (Crocus Rex eats his crown, the Prowler sits down) | yes | no | NOT | Adopt as each boss's last phase (R-161) |
| 163 | 753-758 | Idea 28, director: 3 deaths in node 2 widens node 3's ledges 20% and adds a heart; a clean blaze opens an elite high road with faster zip-vines | yes | Plan "Later", R-162.4 | PART: help offered after 3 Game Overs (assist.ts:15-16) | Adapt: the mastery half (a high road that opens) fights sameness without touching Easy |
| 164 | 759-762 | Idea 29, haptics and pitch: 8 ms tap on a branch crack or vine grab; impact pitch 1.0x, 1.12x, 1.25x, 1.5x on a chain without ground | yes | R-162.10 | PART (haptics.ts) | Adopt now (item 28) |
| 165 | 763-766 | Idea 30, Meeca remix mode: replay beaten stages as Meeca, 1.5x faster (1.4x in the code sketch), a rope grapple instead of climb, against a stopwatch | yes | Plan "Later", R-162.2 | NOT | Keep "Later" |

Row count: 165. Summary column: 48 missing, 24 flattened (72 missing or flattened), 93 yes (a few rows only point to others: 84, 116-118, 121-122).

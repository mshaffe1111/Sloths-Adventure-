# From 55 to 80+: the plan (lead, 2026-11-04, after Matt's research batch)

Matt, 2026-11-04 ~2 AM ET: "even with me being biased... I would rate this a D if I was a kid... a 55. Because it's plain, it's
repetitive... our best level may be level 1... the branch breaking isn't really hard because you can outrun that easy. The eagles...
you can outrun them every time. You don't even have to hide... after playing like 5 straight hours, it becomes a sludge."
Goal: Matt's own rating of 80-90 out of 100. His rating is the gate, not ours. Research: reference/research/ (the full report and the
second batch, MATT-RESEARCH-2026-11-04.md). Rules it became: STAGE-RULES §0 and §0b.

## Why it's a 55 (checked in code, 2026-11-04)
1. **Hazards don't bite.** Breaking branches can be outrun; eagles can be outrun; nothing forces hiding or timing (Matt's play).
2. **Every enemy dies the same way.** Kick doubles the score and changes the burst (engine.ts ~4165-4171); an air kick also bounces him up (airKick); no enemy needs one move over another; no shields, no enemy
   that needs a kick, a punch or a stomp. Enemies are roadblocks, not tools.
3. **Stages have no shape.** No rhythm groups, rests or pacing tags (gen2 has none); no four-part arc; stages are long hallways.
4. **Mechanics are taught and dropped.** Nothing builds on earlier worlds (D26).
5. **Bosses are "wait for the glow".** One way to hurt each one.
6. **Frame rate and feel.** The canvas renderer struggles on phones (APK under 20 fps); WebGL is the fix (GPU-RENDERER-PLAN.md).
Already there (don't rebuild): coyote time and jump buffer (FORGIVE), variable jump height (PHYS.cutV), swimming (6-7), patience/stillness
spots (patience.ts: mist, fronds), curated layouts that change on each fresh entry (gen2 seeds `variant % n`).

## The approach: prove it on World 1 first, then roll out (MATT APPROVED 2026-11-04)
The research's own rule 4 ("freeze the core before scaling from 1 world to 10") and our D25 lesson (estimate from measured history) say
the same thing: rebuild ONE world to the new bar, Matt plays it and rates it, and only then roll the method out. The World 1 slice
gives us the real hours per world, so the rollout estimate is measured, not guessed.

### Lane 1, all the way through: WebGL (R-3.1 to R-3.7, then WebGL gameplay)
Stage 0 set-up, then skies, ground, Pokey and creatures, props and particles, measure, then the phones' heat run. Once stage 5 lands,
WebGL opens gameplay the canvas can't afford: light-solid bridges, lightning-flash silhouettes (World 10), water that waves.
Kept from our plan: PixiJS (it already batches sprites the way the research describes; no hand-written batcher), the 30 fps lock
(changing the physics tick would re-tune every jump in 100 stages; not worth it now).

### Phase A: the World 1 slice (lanes 2-5, with the quality supervisor on every job)
1. **The measuring stick first.** The rhythm check (R-150.1) grows into the research's validator: each stage as a string of moves
   (J jump, V vine, B branch, W wind, S slow, C climb, P puzzle), repeated 3-4 move runs flagged, similarity to the stages before it,
   dead walking over 2.5 s, the landing in view at take-off, and a "clumsy thumb" bot (late taps, less air control). It must score
   today's World 1 badly before we trust it.
2. **Hazards that bite.** Branches: snap twigs you can't outrun by just holding right, creaking limbs, tipping roots (R-154). Eagles:
   a shadow locks onto Pokey, then the dive; you hide under cover or time it (R-158). The difficulty climb holds (Easy stays a cruise).
3. **Enemies with jobs (the combat triangle).** Stomp vaults (and bounces higher over pits), punch stuns and knocks back shots, kick
   breaks shields and bowls an enemy into others or a switch. Each species gets one readable trick with a half-second warning, and
   enemies sit where their platform role says (never within 150 px of a landing; about a third of the stage enemy-free) (R-159).
4. **Stage shape.** Four parts with short bursts and rests between, checkpoints before the twist and the finale, pacing tags with no
   two tight bits in a row (R-155), mechanics in pairs (§0b.5).
5. **Pokey's own move: hanging under branches.** Real sloths hang without effort. Hold climb under a branch and he moves along its
   underside: a second path under thorny or guarded tops. The one idea that makes this game play like no other (R-160; art via HF).
6. **Feel:** platform speed into the jump (R-152.7); check apex hang (R-156).
7. **Venom Fang, three ways to win:** the scripted window, an arena trap (drop a branch on him), and a skill move (dive-kick off his
   tail). The template for every boss (R-161).
Then: test link, Matt plays World 1 start to finish and rates it. 80+ means roll out; under 80, we fix World 1 before anything else.

**engine.ts in Phase A (lead's call, 2026-11-04):** lane 1 (WebGL) keeps its engine.ts change small (stage 0 adds a layer, it doesn't move
drawing) and merges first. The gameplay jobs then hold engine.ts one at a time, in this order: R-159.1 combat triangle, then R-160.1
under-branch hanging; each merges the latest base before it starts and before it pushes. Overlaps run as one job: R-158.1 with R-5.10
(1-7's eagle), R-155 with R-150.3, R-161.2 inside R-1.9/R-1.10/R-1.15.

### Phase B: roll out, world by world (Worlds 2-8), each one rated
Generators get the new grammar: map shapes (loop-back, high/low split, zig-zag climb, lock-and-key spoke), pacing tags, puzzle
blueprints (pulleys, toggle-on-jump platforms, domino branches, seesaws), enemy roles (R-150.2, R-153 stage types, R-152.4 bring-backs,
R-152.5 moving platforms). Hand-built stages get the same shape (R-150.3). Each boss gets its three ways (R-161). Swimming becomes a
fast, happy thing (R-5.22: sloths swim three times faster than they walk).

### Phase C: Worlds 9-10 built new on the method; the story wiring; special stages where they earn their place.

## Later (good ideas, not for launch)
Seed-sharing ghosts, the Meeca remix mode after the ending, background-layer jumping, an adaptive "director" (it fights the Easy/Normal
split), a special stage in every world (we have 4-D and 5-M; add one or two where they earn it), stage-to-stage cause and effect,
moth/algae camouflage, bending saplings, silk ricochets. Phone haptics are cheap and may come in early.

## Not taken
A 60 Hz physics rewrite; a home-made sprite batcher; storing the player's last run to force a different layout (our curated pool
already rotates). The report's facts about our game are checked before use (it says World 10 has a grip button; we have none).

## What it costs
Phase A is sized by the roadmap keeper from measured history; Phases B and C are sized from Phase A's real hours. Quality sets the date
(Matt, 11-02). Expect the launch to move: the honest range is unknown until World 1 is measured.

# The effect table, old and new (polish-sfx, 2026-10-29)

Plays per minute come from a bot playing one minute of each stage (tools/audio/sfxv1/fxcount.cjs; 5-10 and 1-10 are boss fights).
A bot jumps and swings more than a person, so read movement as a ceiling and the rest as a guide. "Called from" is the number of
call sites per file.

| Call | Old effect | Called from | 1-2 | 2-1 | 3-3 | 4-4 | 5-5 | 6-1 | 7-3 | 8-1 | 5-10 | 1-10 | New sound | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| playStep | step | game/engine.ts:3 | 97 | 103 | 90 | 70 | 75 | 78 | 56 | 71 | 85 | 47 | stepMoss / stepWood / stepStone / stepWater, 6-8 takes each, by the surface underfoot | built, previewed (batch 1-2) |
| playJump | jump | components/PauseMenu.tsx:1, game/engine.ts:9, game/w7SlideRun.ts:1 | 43 | 45 | 43 | 40 | 43 | 39 | 34 | 32 | 50 | 46 | jump: a push of air and cloth, a scuff off the ground (6 takes) | built, in the mixes |
| playDoubleJump | doubleJump | game/engine.ts:1 | 9 | 11 | 14 | 14 | 10 | 15 | 19 | 19 | 14 | 11 | doubleJump: a flutter of wings and a gust (5 takes) | built, in the mixes |
| playLand | land | game/dotFlightRun.ts:1, game/engine.ts:6, game/w7SlideRun.ts:3 | 46 | 69 | 45 | 30 | 43 | 38 | 25 | 28 | 45 | 45 | landing: small / medium / big by fall height (2 takes each) | built, previewed (batch 2) |
| playPunch | punch | game/engine.ts:4 |  |  |  |  |  |  | 1 |  |  |  | swish: an air stroke (6 takes); the hit is its own sound | built, in the mixes |
| playKick | kick | game/engine.ts:1 | 27 | 29 | 27 | 28 | 24 | 28 | 23 | 27 | 29 | 26 | swish (as punch, a little lower) | built, in the mixes |
| playMegaPunch | megaPunch | game/engine.ts:1 |  |  |  |  |  |  |  |  |  |  | swish, heavier, with a body thump | to build |
| playWhoosh | whoosh | game/dotFlightRun.ts:2, game/engine.ts:16, game/w7SlideRun.ts:1 |  | 27 |  | 6 |  | 4 | 11 | 17 | 19 | 7 | by caller: splash (falling into water), swish (strikes), gust (wind), a puzzle sound | splash built; callers to split when wired |
| playHitImpact | hit | game/engine.ts:24, game/w7SlideRun.ts:4 |  | 2 | 4 | 6 |  | 4 | 14 | 18 | 24 | 32 | hit_<body>: generic, fur, scale, chitin, feather, armor (3 light + 3 heavy each); rock for World 4 rocks; puzzle sounds for puzzles | built, previewed (batch 1-2) |
| playEnemyDefeated | defeat | components/menuParts.tsx:1, game/engine.ts:1 |  |  | 1 |  |  |  | 2 | 1 | 2 |  | ko_<creature>: its own voice and a fall (12 creatures x 3 takes) | built, previewed (batch 2) |
| playFlowerPickup | flower | components/menuParts.tsx:1, game/dotFlightRun.ts:2, game/engine.ts:1, game/w7SlideRun.ts:1 | 24 | 11 | 22 | 10 | 12 | 20 | 4 |  |  |  | flower: a soft warm note, 8 takes on a pentatonic, no ladder | built, previewed (batch 1) |
| playLeafPickup | leaf | game/dotFlightRun.ts:1, game/engine.ts:1 |  |  |  |  |  |  | 9 |  |  |  | a leaf brush (soft rustle, no note) | to build |
| playFruitPickup | fruit | game/engine.ts:4 |  |  |  |  |  |  |  |  |  |  | a bite (munch) and a warm note | to build |
| playHeartPickup | heart | game/engine.ts:1 |  |  | 1 |  |  |  |  |  | 1 |  | two warm low notes and a breath | to build |
| playSuperHeart | superHeart | game/engine.ts:1 |  |  |  |  |  |  | 1 |  |  |  | a bigger moment: a warm rising three-note figure over a soft swell | to build |
| playPowerUp | power | game/engine.ts:3 |  |  |  |  |  |  | 1 |  |  |  | three moments (speed / invincible / magnet): a gust, a shimmer of leaves, a hum | to build |
| playVineGrab | vine | game/engine.ts:7 |  |  |  | 52 |  | 6 | 5 |  | 1 |  | vine: a palm on bark-wrapped rope, its leaves, its creak (6 takes); 4-4 chimes get windChime | built, previewed (batch 2) |
| playTreeClimb | climb | components/title/CarvedLogo.tsx:1, game/engine.ts:7, game/w7SlideRun.ts:1 |  |  |  |  |  |  | 5 |  |  |  | bark scratch under claws (scrape) | to build |
| playGlide | glide | game/dotFlightRun.ts:2, game/engine.ts:2 |  |  |  | 10 |  | 2 | 10 | 6 |  |  | glide: open (cloth snap and gust), flutter (3), fold | built, in the 4-4 mix |
| playShrineUnlocked | shrine | App.tsx:1, game/dotFlightRun.ts:1, game/engine.ts:7 |  |  |  |  |  |  |  |  |  |  | by caller: stone gate grinding open, a frond unfurling, a bloom | to build |
| playRelicFound | relic | game/dotFlightRun.ts:1, game/engine.ts:7 |  |  |  |  |  |  | 1 |  |  |  | a reward: warm notes over a soft swell | to build |
| playCritterRescued | critter | game/engine.ts:2 |  |  |  |  |  |  |  |  |  |  | the freed creature's happy chirp | to build |
| playPlayerHurt | hurt | game/dotFlightRun.ts:1, game/engine.ts:5, game/w7SlideRun.ts:2 |  |  | 1 |  |  |  | 2 | 1 | 27 | 7 | a body thump and a shake of leaves (no synth "oof") | to build |
| playEagleScreech | eagle | game/engine.ts:5 |  |  |  |  |  |  | 2 | 2 |  |  | a real bird of prey's screech | to build (sources found) |
| playBossRoar | roar | game/engine.ts:5 |  |  |  |  |  |  |  |  | 1 | 1 | each boss's own voice (overlaps SN-4, Build 1) | held: SN-4 is Build 1's |
| playPredator | <kind>Call | game/engine.ts:6 |  |  |  |  |  |  |  |  |  |  | warning / launch / impact per predator (ocelot, jaguar, boa, caiman, tayra) from the same voices as their knock-outs | to build |
| playCheckpoint | checkpoint | game/dotFlightRun.ts:2, game/engine.ts:4, game/w7SlideRun.ts:1 | 2 |  | 2 | 3 | 1 | 1 | 4 |  |  | 7 | checkpoint: a flag in the wind and two warm rising notes (3 takes) | built, in the mixes |
| playOneUp | oneUp | — |  |  |  |  |  |  |  |  |  |  | a reward: a warm four-note figure | to build |
| playLevelStart | levelStart | game/engine.ts:2, game/w7SlideRun.ts:1 |  |  |  |  |  |  |  |  |  |  | a soft wooden knock and a rustle (the music starts the stage) | to build |
| playUiTap | uiTap | App.tsx:1 |  |  |  |  |  |  |  |  |  |  | a soft wooden tap (6 takes) | to build |
| playUiConfirm | uiConfirm | — |  |  |  |  |  |  |  |  |  |  | two wooden taps, the second higher | to build |
| playUiBack | uiBack | — |  |  |  |  |  |  |  |  |  |  | a leaf rustle | to build |
| playStar | star | components/SkillLearned.tsx:1, components/StageCleared.tsx:1 |  |  |  |  |  |  |  |  |  |  | the Stage Cleared stars: a warm note each, rising | to build |
| playPause | pauseIn / pauseOut | App.tsx:2 |  |  |  |  |  |  |  |  |  |  | a leaf curtain closing / opening | to build |
| (w4Play) | rock (was hit) | — |  |  |  |  |  |  |  |  |  |  | rock: a stone thud, a crunch and grit (6 takes); rockWarn: grit trickling 1.4 s before (4 takes) | built, previewed (batch 1) |
| (w4Play) | chime (was vine) | — |  |  |  |  |  |  |  |  |  |  | windChime: a hollow wooden clatter on a breath of wind (5 takes), at most every 1.4 s | built, in the 4-4 mix |
| (engine water) | whoosh + hit | — |  |  |  |  |  |  |  |  |  |  | splash: plunge / body / dip (2 takes each) | built, in the 4-4 mix |
| (boss card) | bossAppear | — |  |  |  |  |  |  |  |  |  |  | bossSlam: a huge low impact, the card slapping down, a far roll of thunder (2 takes; SN-10) | built, previewed (batch 2) |
| (world beds) | ambience | — |  |  |  |  |  |  |  |  |  |  | bed1-bed10: real 20 s loops per world, with bird / drip / croak / thunder one-shots (SN-9) | built, previewed (batch 2) |
| (puzzle kits) | pick, drop, wrap, ... | — |  |  |  |  |  |  |  |  |  |  | the 12 puzzle sounds (polish-audio's PUZZLE_SOUNDS) from real wood, stone, rope and water | to build |
| (new) | bounce | — |  |  |  |  |  |  |  |  |  |  | a mushroom bounce: a soft, fleshy boing (not a spring) | to build |
| (new) | log / crumble / thorns / gate | — |  |  |  |  |  |  |  |  |  |  | a log rolling and landing; stone crumbling; a thorn bush scratch; a wooden gate | to build |

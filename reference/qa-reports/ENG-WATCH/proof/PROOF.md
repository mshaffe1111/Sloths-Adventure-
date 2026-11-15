# ENG-WATCH proof: the eagle does not catch a player who keeps walking (R-165.267, R-165.266). Written 9:52 PM ET 11-14

Base: 1-7 on t-eng-watch = origin/t-build-16 9de5e4aa; 1-8 on origin/t-build-18 ccdf2bf3. Real engine (realPlay.ts, 30 fps, real
damage, the game's own 1.2 s shield after a hit), seed/layout 1. Tool: `npx tsx tools/inspect/eagleProbe.ts --stage <id> --setting
normal|easy --modes walk,back,stand,sneak` (every event with its frame f, 30 a second). Clips: `node tools/inspect/eagleClip.mjs`
(the real page, every frame through the real touch pad, clipPress.mjs pressFrame; captions name f, its phase, eye vs him, hearts).

## Hearts lost, by what he does (seed 1)
| | walk forward through its stretch, never hiding | walk back against the eye | stand in the open 25 s | hide one pass, then walk on the frame its head turns away |
|---|---|---|---|---|
| 1-7 Normal (9 eagles) | **0 at 8 of 9** (the 9th: he was stuck at a step at 29 px/s, standing in the open) | 1-2 at 7 of 9 | 2-3 each | **0** (perched #7 and flying #4) |
| 1-7 Easy (9 eagles) | **0 at 9 of 9** | 0 at 9 of 9 | 1 each | **0** |
| 1-8 Normal (1 perched) | 1 (its eye faces him) | 0 | 1, then never again | **0** |
| 1-8 Easy | **0** | 0 | **0** | **0** |
Full logs: probe-1-7-t-build-16.txt, probe-1-8-t-build-18.txt.

## Why a walker is never caught (each cause read in the code)
1. **Its pass starts behind him.** Every laid eagle faces +1 (w1Cast.ts eagleOver, "its first pass runs the way he walks"); the pass is
   called the frame he steps into its stretch (newPredator starts cool 0, core.ts:103; rest calls it, core.ts:343), so its eye starts at the
   stretch's near end, behind him.
2. **Its warn holds the eye blind at that end for 2.0 s** (Easy 2.6 s): core.ts:370 breaks before any look. He walks ~500 px meanwhile.
3. **The eye is barely faster than his walk:** 320 px/s (world1.ts:86) against his 246-265 px/s measured. It closes ~70 px/s, so it needs
   ~7 s; by then he is ~2,250 px in. Every 1-7 stretch but one is 340-1,203 px. The eye stops at its stretch's end (core.ts:379, 389): the
   pass ends with the eye 360-420 px behind him, off the upright screen (17-normal-walk-e3_f120_eye-421px-behind.jpg: f120).
4. **Nothing follows:** he is out of its stretch, so the pass is not counted (endPass's `there`) and no new pass is called (core.ts:343);
   the next stretch is a different eagle with its own first pass.
5. **Between passes it is blind:** in rest a sweeper looks at nothing (core.ts:338-348) for its whole cool (1-7: 5.4 s Normal, x1.5 Easy).
   The perched pose shows its head away ('ahead') all that time. 17-normal-sneak-perched: f164 its look ends, he walks out of cover;
   **f204 he is under its post**, head away, 5 hearts (17-normal-sneak-perched_f204_under-post-head-away.jpg); f322 out of its stretch.
   1-8 the same: f141 look over, f168 under its post (18-normal-sneak-perched_f168_under-post-head-away.jpg).
6. **1-8's eagle looks once, ever:** stillFork.ts lays it with Post.passes 1, so after its one pass its cool is Infinity (probe --frames:
   "rest ... cool Infinity" from f135 on): it sits on its post, head away, for the rest of the stage. That is "it never visibly passed".
7. **Easy:** every 1-7 eagle is laid free (kitFree on all 9) and core.ts:42 sparedPass spares every eagle's first pass on Easy; a walker
   only ever meets first passes, so Easy's eagles never cost him a heart. (A rule of Easy, not mine to change: ruling asked.)
inCover/eagleFair are not the cause: standing in the open IS hit (2-3 hearts on Normal), and walking back into the eye is hit. The threat is
fake only for the player who keeps walking forward, which is how Matt played it.

## Clips (upright, 15 fps, captions name every frame)
- 17-normal-walk-e3.mp4: screech f14, eye blind at the start to f74, eye 421 px behind him at f120, pass over at f152, out at f167, 5 hearts.
- 17-easy-walk-e3.mp4: the same on Easy, f14 to f147, 5 hearts.
- 17-normal-sneak-perched.mp4: (c) f164 head away, f204 under its post, f322 out, 5 hearts.
- 18-normal-sneak-perched.mp4: (c) on 1-8, f141 head away, f168 under its post, f273 out.
- 18-normal-walk-perched.mp4: (b) walking with its eye (leftward) past the post, f22 to f171, 5 hearts.

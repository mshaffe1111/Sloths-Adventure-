# Polish A1 (picture and screens): report

Branch `polish-a1`. Every shot is in this folder: `*-before-*` is the base commit (ffebdc0), `*-after-*` this branch, `-up` is
390x844, `-side` is 844x390. The shot tools are in `tools/art/` (`shot-polish-a1.mjs`, `shot-popin-a1.mjs`, `shot-story-a1.mjs`,
`shot-win-a1.mjs`, `shot-map-a1.mjs`, `pair-polish-a1.py`).

## What changed, per item

| Item | Change | Proof |
|---|---|---|
| VI-2 | `imageSmoothingQuality = 'high'` after every resize: the game canvas (engine.ts resizeCanvas), the story canvas, the journal demo, the world thumbs. | `vi2-crop-up.png` (headless Chromium shows little difference: the gain is on a real phone's GPU), `vi2-*-1-3-*` |
| AN-4 | drawStrip and drawTile place every copy on a whole device pixel (from the context's own transform), one device pixel of overlap. The far layer now moves every frame instead of standing two frames then jumping. | `sceneryStrip.test.ts` (no still frames at a run, steps of at most 2 device px). Motion can't be judged from headless video (it runs below speed): check on a phone. |
| VI-4 | All 68 `w*-far/mid/near` strips made seamless once (`scripts/strip-seamless.py`): clear margins and rim columns cut, the right end joined onto the left along the best-matching seam, a plain crossfade only where both ends are smooth (sky, haze). The mirror path is deleted (scenery.ts, title screen), with the painted-span scan it needed. `backdrop-strip.py` makes new strips seamless too. | `vi4-joins-a.jpg`, `vi4-joins-b.jpg` (the join before, mirrored, and after), `vi4-*-2-3-*` |
| VI-3 | readyToStart waits up to 2500 ms for the stage's strips (and the canopy strips on 1-8 and the ascents), next to the 900 ms for the other sheets. Anything later fades in over 280 ms from the stand-in sky. Decoded sets are trimmed by world (2 worlds, at most 2 sets each). | `vi3-popin-up.jpg`, `vi3-popin-side.jpg` (3-2 with every strip held back 2.2 s: before, flat sky then a pop at 2.5 s; after, the name card holds and the stage opens painted), `paintedKeep.test.ts` |
| VI-7 | World 6: bank piece cropped to its top 296 rows and end piece to 322 (no grey slab), the cropped bank's last rows fade part way into the fill. World 5: dark end columns cropped and the piece baked seamless. All worlds: the bank repeat is laid from a fixed point in the world, so touching banks carry one pattern (5-7's vertical join), and their clips overlap a unit (no hairline). | `vi7-crop-6-1.jpg`, `vi7-crop-5-7.jpg`, `vi7-*-6-1-*`, `vi7-*-5-7-*` |
| ST-1 (code) | Story canvas at dpr up to 2 both ways. Bloom: brightness to the fourth (highlights only) at 0.2 (0.15 night/storm), was 0.34 over everything. Zoom capped so no figure draws above 1.5x its cel, never below the shot's own framing. Sideways the picture lifts until the ground is above the measured top of the words box. | `st1-before/after-7-1-*`, `st1-before/after-1-1-*`, `storyFrame.test.ts` |
| UI-1 | Upright, a 96 px Pokey beside the stars and the chips in two rows of three (the six that say most). | `ui1-before-*`, `ui1-after-*` |
| UI-3 | 24 confetti pieces (36 at three stars) fall and spin once over 1.6 s, in front of the card, then are gone; reduced motion holds them still behind the card. | `ui3-confetti-up.jpg`, `ui3-confetti-side.jpg`, `ui3-reduced-motion-*`, `fx/confetti.test.ts` |
| UI-11 | The map's total is three a stage, counted: 306 (the 100 and 4-D, 5-M). | `ui11-crop-side.jpg`, `mapStars.test.ts` |
| UI-14 | 45 style rules under 12 px lifted to 12 px, two `text-[11px]` to `text-xs`. Fallout fixed: trophy reward points stay on one line; the sideways win card's chips read Hits / Combo / Lives. | `ui14-*` (map, trophies, title, win), `ui14-crop-trophies.jpg`, `textSize.test.ts` |
| LV-1 | New Game on a first save: neither mode picked, the start buttons wait. Starting over keeps the old mode (changeable). An Easy / Normal chip on the stage card, the pause header and the win card, showing the mode the stage started on. Each saved best (stars, score, time) carries its mode. | `lv1-*` (newgame, stagecard, stagecard-easy, pause, win), `stageBest.test.ts` |

## Polish check (STAGE-RULES §5b)

1. Painted, not drawn: pass. Nothing new is code-drawn except small touches: the bank's soft bottom fade, the late-strip fade, the confetti pieces, the mode chip.
2. Nothing looks copy-pasted: improved (VI-4 joins `vi4-joins-*`, VI-7 `vi7-crop-*`). Still open, not A1: the soil fill tile's own bevel line and repeat every 100 units, and the tone step where the bank meets the fill (VI-8 in the report). In 5-7 a dark block at the stage's far left edge stays (it is a different piece, left of the first bank; VI-8's soil kit).
3. Art matches what it is: pass (no collider changes).
4. Light fits the place: pass; story bloom is now highlights only, scenes read less washed (`st1-after-7-1-side-*`).
5. Pokey on model: pass. The upright win card uses the same pose frames at 96 px (`ui1-after-up.jpg`).
6. Framing works both ways: story figures now stand fully above the words box sideways (`st1-after-*-side-*`); upright was already clear.
7. Text out of the way: pass; no text under 12 px; nothing new wraps (fixed the two that did).
8. Every move it teaches is needed: n/a.
9. Moments feel like moments: the win card's confetti now falls (`ui3-confetti-*`).
10. Motion is smooth: AN-4 by test; the late-backdrop fade is 280 ms; on-phone check still wanted (headless runs below speed).

Rough spots named plainly:
- VI-4: w5dusk2-near's right end was never keyed: an opaque painted pink-sky panel sits in the source strip. The join now blends it in softly (it was mirrored into a hard block before), but it is still there. That is VI-6's keying fix (World 5 dusk and twilight), with every join on `vi4-all-joins-1.jpg` and `vi4-all-joins-2.jpg`.
- VI-4 far strips with a strong light glow at one end (seen on w4terraces and w1-far; every join was checked on the contact sheets) can show a soft change of light across the 256 px join band. No double picture, but visible if you look for it. The real fix is the VI-2 art (strips painted to tile).
- ST-1: sideways, today's cels are already past 1.5x at the plain framing, so the cap holds every sideways close-up at the plain framing (upright close-ups keep up to about 1.4x). The cap reads CEL_K, so repainted, larger cels (ST-1's art part) get their close-ups back with no code change. Upright, World 1's opening still stands on the code-drawn green strip (drawBranch); that is ST-1's art part.
- LV-1: sideways, the New Game panel already scrolled before this change (its start buttons sit under the fold). The new prompt is one short line so it adds no height.
- Memory: VI-3 now keeps up to 4 strip sets decoded (2 worlds x 2 sets), where it kept 2. That is about 80 MB at worst, and it only happens in World 5 (its light changes stage to stage).

## Checks

- `npx tsc --noEmit -p .`: clean.
- Full suite (audio, game, gen2, gen2/worlds, components, components/**, tools/inspect, tools/gen2): 1823 tests, 1820 pass, 1 TODO (4-3's boulder test, marked TODO before this branch). The one failure in that run was the far-strip width test, which it ran before I updated it. The 11 files those late changes touch were re-run on the final strips: 25 of 25 pass.
- `npx vite build`: clean, nothing in dist/assets over 4 MiB.

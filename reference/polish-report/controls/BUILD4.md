# Controls, Build 4: Matt's four calls (2026-10-29, 5:03 PM ET)

Built on `polish-controls`, from ccr at 016f46b8.

How it was proven:
- one regression test per item, in `src/game/controlsB4.test.ts`, each failing before its fix and passing after;
- the testers' 30,063 recorded touches replayed before and after: `replay-b4-before.md`, `replay-b4-after.md`.

## Replay, before → after

| | before | after |
|---|---|---|
| every clear gesture misread | 2.7% (127/4647) | 2.7% (126/4652) |
| a second thumb's straight flick on a vine let go (CT-5) | 80.0% (8/10) | 0.0% (0/13) |
| slanted vine climbs that let go | 5.7% (2/35) | 2.9% (1/35) |
| vine climbs that bend over and let go | 31.5% (17/54) | 29.6% (16/54) |
| quick vine flicks that did not let go | 12.6% (84/667) | 12.6% (85/673) |
| standing jumps with nothing steering that now carry (CT-27) | 0 | 200 of 1,911 (10.5%) |

Per player, every clear gesture misread:
- Steph went from 3.0% to 2.8%.
- Every other player and grip is unchanged.
- Nobody got worse.

The Pad items (CT-19, CT-13) have no recordings to replay; their tests drive the real engine.

## The items

### CT-5: straight up on a vine always climbs, whichever thumb
- On a vine or trunk, a flick leaning under 20° climbs. It climbs while the finger is down and for 250 ms after it lifts, about 55 px. It no longer leaps off.
- Leaning 20° or more still leaps.
- A flick that starts straight and then bends over while still quick still leaps that way. So does one whose last moments are a fresh flick up and over (the steering thumb's own let-go).
  - Without this, quick flicks that didn't let go rose from 12.6% to 19.4% in a first try. With it they are unchanged.
- One older test (`vineFollowUps`) expected a straight second-thumb flick to leap with no lean. Its straight cases now expect the climb.

### CT-19: the Pad's movement on the left by default
- Only the menu saves the side. So a save with none never chose one, and it gets the new default: movement left, buttons right. A side someone picked is kept.
- The menu lists Left first. Its note says to flip it to run with the right thumb.

### CT-13 / CT-27: the Pad's Jump, a tap is a hop
- The Jump button now keeps an 80 ms minimum hold from take-off, instead of 220 ms.
  - Every tap up to about 120 ms hops 62 px.
  - Held, it goes the full 98 px.
  - Before, both went 97 px, so the lesson's "Hold Jump a little longer to go higher" wasn't true. Now it is.
- Touch flicks and the pad pushed up keep the full jump.
- Why 80 ms: with no minimum at all, a tap hopped anywhere from 30 to 75 px depending on its length. 80 ms makes a tap one steady hop.

### CT-27: a slanted standing flick carries him
- A first jump with nothing steering, whose flick leaned 35° or more, carries him that way at 0.75 of run speed. This works with Jump help on or off.
- The lean is measured the same way as the jump's own 20° lean, from where the rise began.
- Before, he went straight up and down. Now, at 40° he crosses at 214 px/s at the top of the jump.
- **Plainly:** about 1 standing jump in 10 now carries (Matt 18%, Steph 16%, Jen 16%; Sasa and Sally 0%).
  - Thumbs lean by chance. On a small platform a careless flick could now carry him off.
  - Matt's phone test step 18 checks that.

## Polish check
1. **Painted, not drawn:** no new art. The Pad's look is the same, mirrored by default.
2. **Nothing copy-pasted:** n/a.
3. **Art lines up:** unchanged.
4. **Light:** n/a.
5. **Pokey on model:** he climbs on a straight flick (the climb clip) and hops on a Pad tap (the jump clip).
6. **Framing:** unchanged.
7. **Text:** the Pad lesson's words are now true. The menu note says how to flip the Pad.
8. **Every move needed:** reach is untouched; the full suite passes. The level checker and the bots don't use touch.
9. **Moments:** n/a.
10. **Motion:**
    - The slant carry runs at the same 0.75 speed as Jump help's forward double jump, so it feels like a move the game already has.
    - **Rough spot, named plainly:** the 10% of standing jumps that now carry, above.

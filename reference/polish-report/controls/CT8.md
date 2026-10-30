# CT-8 step 2: a lone first finger steers at once, anywhere (2026-10-29)

Built on `polish-controls`, from ccr at 79186903.

**The change.** A lone first finger on the far half of the screen used to wait 60 ms and 18 px before it steered: on the right half for a left-hand steerer, on the left half with *Steer with: Right*. Now it steers the moment it has slid 16 px sideways, the same distance as on the steering half (`TUNING.earlyDragMs` 0, `earlyDragPx` 16).

**What is kept on purpose.** A far-half stroke must be mostly sideways to steer.
- A stroke going up or down is still judged as a flick first, so a flick up is never misread as a run.
- Its taps (punch), quick flicks down (duck), holds (mega) and sideways flicks (kick) are exactly as before.

**A first try that was dropped.** I first made every lone first finger a *steering* finger from the moment it landed.
- The replay passed at first (2.6%), but it broke four things: the slanted flick's carry (CT-27), the kick and duck flicks from that half, and the left/right mirror on vines.
- Patching those pushed misreads up to 3.1-3.3%, over the 2.7% limit.
- The version built keeps the far-half finger undecided until it slides, which keeps every one of those rules intact.

**The Pad.** The Pad doesn't use the gesture recogniser, so this change doesn't touch it on either side. "Left- and right-handed" below means Screen mode's *Steer with: Left / Right* (CT-28).

## Replay (30,063 recorded touches)

Full tables: `replay-ct8-before.md` and `-after.md` (Steer with: Left), and `replay-ct8-before-right.md` and `-after-right.md` (the same touches replayed with Steer with: Right).

| | Left, before | Left, after | Right, before | Right, after |
|---|---|---|---|---|
| every clear gesture misread | 2.7% (126/4652) | 2.7% (126/4652) | 2.8% (132/4652) | 2.8% (130/4652) |
| portrait / landscape | 2.8% / 2.0% | 2.8% / 2.0% | 2.9% / 2.0% | 2.9% / 2.0% |
| resting thumbs that threw a mega | 38.2% (13/34) | 38.2% | 44.1% (15/34) | 44.1% |
| all megas | 83 | 81 | 300 | 290 |
| far-half lone fingers that steered | 4,319 | 4,349 | 8,175 | 8,211 |
| median time from landing to steering, far half | 75 ms | 72 ms | 116 ms | 116 ms |
| 90% steered within, far half | 224 ms | 224 ms | 351 ms | 350 ms |

Per player:
- Nobody got worse with either hand.
- With Steer with: Right, Cheddarbob went from 4.8% to 2.4%, and "others" from 2.8% to 2.6%.

**Plainly about the timing:**
- A far-half finger already steered about as soon as one on the steering half: about 72 ms after landing. That time is a finger sliding the 16 px dead zone, which both halves share.
- The gain is the removed 60 ms floor, plus 30-36 more far-half slides that now steer at all. It is a small number, but the far half no longer lags the near one.
- The Steer-with-Right columns replay left-steering players as if they steered right, so they test robustness, not real right-handed play.

## Tests
`src/game/controlsCT8.test.ts`:
- **Steering test:** a far-half lone finger steers within 24 ms of landing, both directions, both hands, both views. It fails before the change (no steering by then).
- **No-regression test:** a far-half flick up jumps with no run, and a tap punches. It passes before and after.

## Polish check
1. **Painted, not drawn:** n/a, no art.
2. **Nothing copy-pasted:** n/a.
3. **Art lines up:** n/a.
4. **Light:** n/a.
5. **Pokey on model:** unchanged.
6. **Framing:** unchanged.
7. **Text:** none changed.
8. **Every move needed:** reach is untouched; the full suite passes. The bots and the level checker don't use touch.
9. **Moments:** n/a.
10. **Motion:**
    - A run started on the far half begins at the same 16 px as on the near half, so both halves feel the same.
    - **Rough spot, named plainly:** a far-half slide that goes diagonally up still waits, by design (up to the old 210 ms decision), so a flick isn't misread as a run.

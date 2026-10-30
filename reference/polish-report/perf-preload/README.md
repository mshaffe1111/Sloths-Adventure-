# perf-preload: every sheet in before the first frame (2026-10-30)

Headless Chromium, 844x390 (and 390x844) at 2x, `?mix=8#ctest` and `__play('3-10')`. "old" is e905e2d, "new" is this branch. Each picture is the first frame after the title card opens.

- `old-8-*` / `new-8-*`, control test mix 8, sideways and upright: the same picture. The work happens under the title card, so nothing looks different.
- `old-3-10-land` / `new-3-10-land`, the Prowler's lair: the new first frame has the Prowler in it (right, in the dark). The old one didn't: its sheet was still loading, and it arrived with a 3.5 s freeze.

## Numbers

| | old | new |
|---|---|---|
| Picture sheets loaded after the first frame (36 runs: 4 control-test mixes, 32 stages across every world and every lair) | every run: crumble on all; boss lairs 3 to 6 sheets; bounce, petal, props2, w2-props, w6-water, meeca-night on some | 0 in play (later loads are only the next stage's preload behind the stage-cleared card) |
| Worst frame, first 5 s of play, control test mixes 8 / 14 / 4242 / 99 | 422 / 392 / 440 / 494 ms | 164 / 239 / 298 / 233 ms |
| Worst frame, first 5 s, boss lairs 1-10 to 9-10 | 1057, 1929, 3505, 2219, 1632, 2781, 1744, 2901, 4340 ms | 221, 474, 142, 469, 89, 81, 118, 112, 149 ms |
| Launch to first frame, warm (second launch), 1-1 / 4-10 / 7-2 | 407 / 207 / 1238 ms | 268 / 661 / 459 ms (inside the card's own 1 s) |
| Launch to first frame, cold (fresh page, dev server), 1-1 / 4-10 / 7-2 | 1245 / 1223 / 3033 ms | 4205 / 5202 / 7744 ms (capped at 6.5 s of waiting; the card opens by itself at 8 s) |
| Whole-browser memory (RSS, software GL) | 1406 to 1651 MB | 1467 to 1661 MB |

Headless timings are a desktop CPU with no GPU. They show where the cost moved (from the first seconds of play to under the title card), not what a phone will measure.

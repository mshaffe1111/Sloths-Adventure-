# R-159.1 quality check on w8-rope2 9ec60be2 (quality supervisor, 2026-11-04 ~10:45 AM ET)

The first-timer bot's seed-1 Normal runs of 1-3 and 1-9 (first 90 s), logged with `tools/quality/botlog.ts` on the w8-rope2
worktree and replayed in that build's real game (`tools/quality/botrec.mjs`, sideways, as a phone). Pokey is put back on the
logged run each frame; the animals, the tricks and every hit are the browser engine's own response to the logged punches.

- `1-3-lunge-stun-*.jpg` (crops, 26.6-28.0 s): the lunge tell reads (it rears up, "!", 27.0-27.2 s). The punch shows "DAZED!", but the
  bot's next jab 0.23 s later finishes it, so the stun is never seen. Today the stun works as "punch twice fast", and the stars don't
  get time to show.
- `1-9-coiled-boa-punched-*.jpg` (15.6-17.5 s): the coiled boa (red glow) is punched four times (16.37, 16.60, 16.93, 17.17 s). The
  first shows "TOUGH!", and by the fourth it is defeated (+600, the white ghost). Repeated punches beat the armour, so the kick isn't
  needed.
- Bot goal counts on 9ec60be2 (botBaseline, adult seed 1): 1-3 sealed door, 10 of 16 snakes (base: 15 of 16).

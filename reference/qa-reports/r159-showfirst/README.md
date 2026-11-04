# R-159.1 show-first: World 1's combat triangle (w8-rope2, 2026-11-04 08:40 ET, base 60a57830)

Stills for Matt and the lead BEFORE anything is built. No game code was changed: each beat is the real game (a dev build) with the engine
paused and Pokey and the animals posed (positions and states), and the punch and the kick are real key presses stepped one 30 fps frame
at a time. Made with `tools/art/combat/mock-triangle.mjs` (the beats) and `tools/art/combat/compose.py` (the boards).

| board | sideways | upright |
|---|---|---|
| Stomp vaults (1-8's long branch) | stomp-vaults-side.jpg | stomp-vaults-up.jpg |
| Punch stuns (1-3) | punch-stuns-side.jpg | punch-stuns-up.jpg |
| Kick breaks and bowls (1-9's boa) | kick-breaks-and-bowls-side.jpg | kick-breaks-and-bowls-up.jpg |
| The vine snake (1-6's lianas) | vine-snake-side.jpg | vine-snake-up.jpg |

## Real game vs paste-up
- **Real game, existing frames:** every beat of the stomp, the punch and the kick boards except the kick board's last picture.
- **PASTE-UP (stamped in red):** the rolled boa (the boa's own coil frame squeezed round and turned) and the vine snake (the gold snake's
  prowl frame turned head-down). They show *where and how it plays*, not the look: both are on Matt's picture list.

## What the stills taught (before a line of code)
1. **The dazed snake doesn't read.** The gold snake's painted dazed frames (punch-stuns, beat 3) lie flat like its slither: at phone
   size a 1.5 s stun would not show. It needs a clear look: a small code touch (circling stars, allowed by STAGE-RULES §4) or a painted
   dizzy pose. Decision for the lead.
2. **The tell reads.** The rear (beat 1 of punch-stuns) is a clear upright S: a half-second sway there is readable both ways up.
3. **The stomp vault reads sideways and upright**: the snake on the lip, the high bounce, the far side.
4. **The coiled boa is small** on the branch (kick board, beat 1): its armour needs a stronger look than today's coil to say "don't
   punch me"; the "coil tightens" clip on the picture list is that.
5. **Upright, the kick board's roll** shows the ball leaving the branch, but the snake it bowls is out of the narrow view.

## Added for the quality supervisor's review (revision 2)
- **armour-by-shape-{side,up}.jpg:** today's coiled boa (looks like any boa) beside a paste-up of the look to make: a tight coil with a
  glint, so the armour reads before Pokey touches it.
- **The vine snake from the take-off ledge:** vine-snake-{side,up}.jpg are shot with Pokey on the take-off ledge and the snake ahead in
  view. With the paste-up it reads as a snake hanging on a liana there; the real check waits for the painted art.

## Round 2 (the quality supervisor's board notes and the lead's calls)
- **Stomp vaults:** the gap widened past any jump (the far side slid 220 px right in the mock, no game code), the petals laid as an arc
  that starts at the snake and follows the bounce, kept under the HUD. Named: the pit under it still reads as foliage, not a fall
  (stage art: raised with the lead).
- **Punch stuns:** the lead's call, circling stars (code-drawn, free): pasted up over the dazed snake for the whole stun, fewer and
  fainter in the last 0.3 s (the flicker).
- **Kick breaks and bowls:** one ball with a short trail (no longer three shapes), and a 5th beat: the ball stops on the World 1 kit's
  log plate (pressed, glowing) and the woven gate stands open beyond (kit art already packed). Upright, the 5th beat frames the
  plate and the gate.
- **The vine snake:** look (a) vine-coloured or (b) an obvious snake: a choice for Matt, with the lead.

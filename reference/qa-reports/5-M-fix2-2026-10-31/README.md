# 5-M fix 2 (meeca-fix2), real-app proof, 2026-10-31

The dev server, Playwright Chromium, real touch events (CDP): the left-thumb steer, right-hand flicks, a finger tracing circles,
taps and a held still finger. `port` = 390 x 844 upright, `land` = 844 x 390 sideways, `easy` = upright on Easy.
Each `*-proof.mp4` is the whole run; the jpgs are its moments:

- `03-start-meeca-visible`: after the card, Meeca is drawn under her thought (the card waits for her art: "GETTING READY").
- `05-wall-walk`: steered into the trail mark she has not cut: she stops at the trunk; Flicker: "Mark it first. Draw circles on the bark."
- `07-wall-jump1`: running jumps and second jumps at it: she never gets past (the log's `maxX` equals the wall every run).
- `09-at-trunk-ring-finger`: the ring on the bark and the ghost finger tracing it, the ring kept well inside the view.
- `12/13-carved-done`: a tap first (one try), then a squashed, wobbly circle: the M is cut, the glow and sparks, Flicker's line.
- `15-warn-wall`: a later warning trunk (teleported there, the trunks before it cut): the same wall; Meeca: "Wait. Pokey needs to know this one."
- `16-hold-offered`: three taps that carved nothing: Flicker: "Tricky? Then just hold your finger down."
- `18-hold-done`: a finger held still on the glass carves it.

Not shown here (covered by the engine tests): every route past every trunk (meecaWall.test.ts), the next log in view upright
(meecaCamera.test.ts), full playthroughs upright and sideways, Normal and Easy (meecaReal.test.ts).

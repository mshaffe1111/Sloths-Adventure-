# Method: fixing a drawing fault Matt sees on his phone (shared render code)

Last proven: 2026-11-05, branch engine-render (R-164.6, R-164.7, R-164.8 and the 1-5 drawcheck breach), about 2 h 50 min against
3 h planned. Owner of the last update: engine-render.

## When to use it
Matt's stills show something drawn wrong (a column, a box, art over the HUD, a seam, a placeholder shape) and the fault sits in code that
many stages share (w1Pits.ts, protoArt.ts, groundPaint.ts, terrain.ts, engine.ts, the HUD).

## Steps
1. **Rebuild Matt's exact build first.** Find the commit he played by the time on his stills (`git log --date=local` on the branch the
   test link was built from) and check it against something on screen (the goal count: 11 relics on 17710dc2, 10 later). A later build
   moves the geometry, and a fault can vanish with it.
2. **Shoot the spot headless**, upright 390x844 and sideways 844x390, with a teleport script: open with `?layout=N`, run `__play(id)`,
   put Pokey on the piece under x, and run the clock 1.5 s (the scripts are in this job's report; copy and adapt). Use deviceScaleFactor
   3 to look for hairlines at phone density.
3. **Turn the drawer off to see what's under it.** Add a scratch flag to the drawer in a scratch worktree (`globalThis.__noPits`), shoot
   with and without it, and diff. Never in the real tree.
4. **Find the draw call from the page, not from a guess.** Wrap `CanvasRenderingContext2D.prototype.createLinearGradient` (or whichever
   call is breaching) and count `new Error().stack` per call site; then list the pieces in view that the engine hands that drawer
   (`__engine().paintedPlats`). This found the styleless 30 px piece and the lily pads in minutes, after two wrong guesses.
5. **Check the layering before calling it draw order.** The HUD is DOM over the canvas: "art over the HUD" was the HUD fading itself
   (seeThrough.ts), not paint order.
6. **Test that fails on the base**: copy the test into a `git worktree` of the base commit and show it fails there, then passes here.
7. **Main stays the same unless you mean otherwise**: compare the finder's output (or the build) over 16 layouts, base against branch,
   for every stage the file touches, and name each change it makes.
8. **Gates on the final code**: never stash or edit the tree while the test run is going (a stash mid-run swapped files under it, and the
   run had to be thrown away). Run the tests in 3 shards (`awk 'NR%3==i'` over the file list), then drawcheck (standard set, plus the
   touched stages with the same limits: a scratch copy of drawcheck.mjs reading `DC_SCEN`), clipcheck, funcheck, vite, store,
   artcheck, knowncheck and roadmapcheck (`git fetch --unshallow` first in a shallow clone).

## The whole-picture check (Matt, 2026-11-05: "Why is anything in the picture? That is what you need to ask yourself. And does it make sense?")
On every still, upright and sideways, for EVERY object on screen, not just the thing you built:
1. **Why is it there?** Name the piece, dressing or backdrop layer it is, from the code (`__engine().proto`, the stage's platforms, the
   backdrop strips). If nothing explains it, it is clutter: it goes.
2. **What holds it up?** Ground, its own base, a trunk, the water it floats on. A rock over a pad, a log under the water's surface, a trunk
   down the face of a bank that already runs to the bottom: each is wrong. ("If we have ground the whole way down, why do we need to put
   something over top of it?")
3. **Would a player read it right?** A log is something to jump on: if jumping on it kills him (it's under water), it must not be there.
   ("I see logs, I'm going to jump on the logs. And if it's underwater, it's stupid, because I'm going to die.")
4. **Edges and seams anywhere in the frame:** a straight vertical or horizontal edge in the sky, the backdrop or a shade is a fault, even
   far from your change.
5. **A scratch layout is checked like a real one.** Removing a piece removes what stood on it.
Write the list down in the report: each object, why it's there, what holds it up. A still that passes your item but fails this is not done.

## Pitfalls we already paid for
- 2026-11-05: **paid jobs run on after a redirect.** The lead sent Matt's "if we have bad art, get rid of the art... craft one quickly"
  three times while I ran two more inpaint rounds on the rejected approach ($0.35 spent on nothing; the backdrop went to another helper).
  Now: ReadNotifications before every paid job and between jobs, and stop any plan a newer message crosses, then confirm before going on.
- 2026-11-05: **checked only my own pieces.** A floating rock (left by my scratch edit), logs sunk under the water, a pit shade box,
  trunks over solid ground, a backdrop seam and huge painted orchids were all in stills I sent; Matt caught each. Do the whole-picture check.
- A gap finder built on one ground line finds the wrong gaps on a stage that climbs (the mixer's 1-5). Judge each gap by its own two banks.
- A painted bank's soil runs down out of sight, so a bank over a gap at any height stands in it.
- A layered bake that overlaps itself (a top part and a deep part) darkens the overlap twice: a line across it.
- Pieces no kit paints (a styleless piece, World 1 lily pads) fall back to terrain.ts's code earth, three gradients each, and read as a
  grey slab. Every piece kind needs a painted look.
- Fading a lower layer in from a lighter value showed a new edge. Match the value where the upper layer ends.

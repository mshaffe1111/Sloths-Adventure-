// R-165.240 (INT-8, 11-14): ONE frame of a clip, driven through the real touch pad's own calls (inputEngine.ts triggerTouchMove,
// triggerTouchClimb, triggerTouchUp, releaseTouchUp), and the lift check on every press. The ONE definition (D19): tools/inspect/clip.mjs
// runs this function's own source in the page, and tools/inspect/clip.test.ts runs it on the headless engine with the real InputEngine.
// Why: INT-7's clip set input.state.jumpPressed bare; input.update() clears a bare press before the engine reads it (engine.ts:1674
// runs input.update first; inputEngine.ts update: a press with no buffer is dropped), so its "jump" frames never jumped and a fig-gate
// clip passed a try-over that never happened. Self-contained (no imports, no closure): its source is sent to the page as text.
//   pressFrame(e, inp, opt, plant) -> { x, y, vy, climbing, grounded, two, left, lift? }
//   inp: { left, right, up, down, jump, lean, holdMs, release }; opt: { safe, noRender }; plant: true presses the OLD bare way (the planted check)
//   lift (on a jump frame): lifted (vy < 0, rose, a jump spent, or off the vine) or grabbed (a press near a vine is taken by the grab:
//   the game's own rule); a press with neither is LOST and the clip must stop (JUMP-NO-LIFT)
export function pressFrame(e, inp, opt, plant) {
  const I = e.input;
  const P = e.player;
  const before = { vy: P.vy, climbing: !!P.climbing, left: P.jumpsLeft, y: P.y };
  I.triggerTouchMove(inp.right ? 'right' : inp.left ? 'left' : 'none');
  const dir = inp.up ? -1 : inp.down ? 1 : 0;
  // (only when the thumb's climb changes, as the pad does: a lift from the glass mid-climb is a climb stop)
  if (e.__clipClimb !== dir) {
    I.triggerTouchClimb(dir);
    e.__clipClimb = dir;
  }
  if (inp.jump) {
    if (plant) Object.assign(I.state, { jumpHeld: true, jumpPressed: true });
    else I.triggerTouchUp(inp.lean ?? 0, inp.holdMs ?? 300);
  }
  if (inp.release) I.releaseTouchUp();
  if (opt && opt.safe) P.invincibleTimer = 9;
  e.update(1 / 30);
  if (opt && opt.safe) P.invincibleTimer = 0;
  if (e.clearGuide) e.clearGuide();
  if (e.render && !(opt && opt.noRender)) e.render(); // (headless tests step without drawing)
  const out = { y: P.y, x: P.x, vy: P.vy, climbing: !!P.climbing, grounded: !!P.grounded, two: !!(e.hands && e.hands.b), left: P.jumpsLeft };
  if (inp.jump) {
    const spent = (before.left ?? 0) - (P.jumpsLeft ?? 0);
    const offVine = before.climbing && !P.climbing;
    out.lift = {
      vyAfter: Math.round(P.vy),
      dy: Math.round(P.y - before.y),
      spent,
      offVine,
      grabbed: !before.climbing && !!P.climbing,
      lifted: P.vy < 0 || P.y < before.y - 0.5 || spent > 0 || offVine,
    };
  }
  return out;
}

/** a press that neither lifted him nor was taken by a vine grab: the clip would show a jump that never happened */
export const lostPress = (lift) => !!lift && !lift.lifted && !lift.grabbed;

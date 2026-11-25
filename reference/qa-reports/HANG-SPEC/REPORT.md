# HANG-SPEC: the 3-2 roof-root creep, shown three ways for Matt (R-165.449; WORLD-3-PLAN §6 Q1, D1)

Designer (HANG-SPEC), branch t-hang-spec from origin/main (cdffdc62). A show-first mock-up only: the lay is ENG-ROOT's, after Matt answers.

## STATUS
DONE. All six clips, the stills and the contact sheet are pushed. EXACT NEXT STEP (the lead's, not mine): show Matt
`CONTACT-SHEET.png` (and a video if he wants motion) with the one question in §"The question"; when he answers, ENG-ROOT builds the lay.
Nothing of mine is left open. To re-make any clip: `npx vite --port 5199 --strictPort --host 127.0.0.1` (run_in_background), then
`node reference/qa-reports/HANG-SPEC/tools/hangclip.mjs 5199 <frames dir>/<a|b|c>-<up|side> <a|b|c> <up|side>` for each, then
`node reference/qa-reports/HANG-SPEC/tools/finish.mjs <frames dir> reference/qa-reports/HANG-SPEC`.

## What Matt sees
- `CONTACT-SHEET.png`: one sheet, the three options in plain words, three upright stills each (creeping in / over the prowler or at
  the low point / past it) and one sideways still.
- `video/{a,b,c}-{up,side}.mp4`: each option, upright (412 x 914) and sideways (914 x 412), 15 fps, phone size.
- `stills/`: the stills the sheet is made from (2x, JPG).

## How it was made (what is real, what is a stand-in)
`tools/hangclip.mjs` (dev server, `window.__play('3-1')`, then a dev scene on 3-1's grotto floor, y 580, x 180..900):
- REAL: the engine stepping at 30 fps (`e.update(1/30)` + `e.render()`), the rope hold (`updateRope`: Pokey's painted hang frames,
  his hands at the hold, the camera), the touch pad's own call (`input.triggerTouchMove`), the kit ocelot (48 x 28, the generator's
  size) on the creature kit (`proto.cast = { kinds: ['ocelot'] }`, `startCast()`: OCELOT, sight.up 40, ENG-PROWL), 3-1's painted
  grotto and the HUD.
- STAND-IN (named on every frame's caption bar): the root (the engine's rope is hidden while drawing; a code-drawn root with hangers
  into the roof is drawn in its place, behind him), the glowworm pool (radius 74 over the floor, dashed ring; ENG-DARK is not built),
  (b)'s speed (the engine's ROPE_SPEED is 120; the clip moves him at 85 after each step and slows his hand cycle to match), (c)'s
  slope (the engine's rope is flat with a 12 px sag; the clip puts him on a 45 px dip after each step).
- Pokey is held unhurt for the clip (invincibleTimer set around the step, cleared before the draw, as clipPress.mjs does).

## The three options, one line each (feel; cost to build)
Measured on the clips: the whole root (720 px) takes 188 steps = 6.3 s at 120, 260 steps = 8.7 s at 85.
- **(a) Today's creep, 120 px/s, flat.** Reads as a quick, sure crossing: the pass over the ocelot is brief, with no
  tension of its own. Cost: EXISTS (the hold, the painted hang frames, the speed); needs only the root's look (a root hung from the
  roof in place of 1-3's trees or 2-x's posts), which all three options need.
- **(b) Slower and tense, 85 px/s, flat.** The pass over the prowler visibly lingers; with the hand-over-hand cycle slowed to match
  it reads as careful, not sluggish. Cost: one number (a root's own speed, 85, e.g. a speed on the Rope read in updateRope; the two
  places that read ROPE_SPEED for timing, w3Sections.ts:238 and predatorWorld3.test.ts's creep, take the root's number). S.
- **(c) A root that dips toward the floor and rises, 120 px/s.** The crossing has a shape: safe high, then a low point inside the
  glow where a prowler facing him would see him (caption turns green there), then safe again: a real "when do I go" choice. Cost: M:
  the rope's height becomes a curve (ropeYAt's 12 uses in src: the hold, the grab and let-go at the ends, the drawing, the builder's
  lay and the beatability check), and its point depends on ENG-DARK's "lit = seen" ring existing (not built; the ring here is drawn).
- My read as designer: (b) is the cheapest real gain in feel and fits "Prowlers never look up" (the fear is in the slowness, not a
  new rule). (c) is the richer puzzle but costs the slope work AND waits on ENG-DARK; it could come later as 3-2's second beat
  rather than its first. Matt's call.

## The question (for the lead to put to Matt, one, multiple choice)
How should creeping under the roof roots feel in 3-2? (a) like 1-3's ropes, as now; (b) slower and tense; (c) roots that dip into the
glowworms' light so he has to time the low point.

## Polish check (looked at every still on the sheet, upright and sideways, as on a phone)
- Pokey's hands on the root: on it in every still and in a 5-frame strip of (b) over the prowler (the hand-over-hand cycle visible
  at 85, no sliding). PASS.
- The ocelot readable under him: in the 'over' still of all three, upright and sideways, clear of his feet. PASS.
- The light ring visible: the pool and its dashed edge show in every still; in (c) he is inside it at the low point. PASS.
- HUD and phone edges: hearts, lives, the bar and the menu leaf clear the root and him in every still; the caption bar sits below the
  floor line (sideways it covers only the rock under the floor). PASS.
- Named plainly, not hidden: the root and the glow are stand-in drawings (said on every frame); the ocelot shows its own red aura
  (the engine's art for it, as in the game today); 3-1's cave arch is behind the root's left end (the test room is 3-1's start).
- Sizes: the stills are JPG (3.6 MB for 18); the videos are 1x (412 x 914 / 914 x 412), 15 fps, 2.8 MB for six.

## Lessons applied
D119 (no heredoc in a commit chain), D128 (stamps from `date`), D134 (pushed and ls-remote-confirmed before the hand-over message),
D137 / LANES 3b (the 28-minute box: hand over with an exact next step).

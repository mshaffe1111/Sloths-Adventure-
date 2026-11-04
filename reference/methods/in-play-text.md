# Method: in-play text (Dot's tip box, thought clouds, any in-play label)
Last proven: 2026-11-01, branch dot-box, D10 fixed (8-2's first rope sideways: Dot's box over the take-off post). Owner of the last
update: the dot-box helper.

## When to use it
Any job that puts words on the screen while the player is playing: Dot's bubble (`src/components/dot/DotGuide.tsx`), Pokey's own
thoughts (same file, `mode: 'pokey'`), Meeca's thought cloud and the others' bubbles in 5-M (`src/game/meecaArt.ts` drawThought /
drawSay), a new in-play label or callout. Also any change to where or when those appear.

## The law (Matt, 2026-11-01; D10)
In-play words never cover:
- Pokey (or Meeca, when she is the player);
- the spot he must act on next: the take-off lip, the rope, liana or trunk he must grab (a rope's near post; hanging from one, both
  posts), a hazard's or animal's tell, the bush he hides in, the landing;
- the way ahead of him within ~1.5 jumps (`aheadZone`: from his middle forward 1.5 double jumps, from under his feet to the top of a
  double jump; climbing, the vine above; falling or gliding, ahead and down);
- the HUD (its band, the name tag included).

## Steps (exact)
1. **Keep-outs come from one place**: `src/game/dotGuidePerch.ts` `lawRects(v, out, room)` = Pokey + `aheadZone(v)` +
   `actionRects(v)`. A new kind of "next action" (a new prop he must use) is added to `actionRects`, nowhere else. Canvas-drawn words
   (Meeca's stage) use `aheadZone(probe, out)` with a reused `out` (no allocation in the frame loop, PERFORMANCE-RULES §3 rule 1).
2. **The way ahead has the move's shape** (the lead, 1:15 PM review of 4-2 upright): `aheadMoveOf(line)` from the line's move or
   topic; 'glide' (or falling) a cone down and forward to the bottom of the screen, 'climb' the stretch above him, 'swing' the arc,
   'jump' the arc of a jump or two. What he is doing now wins (on a vine: climb; falling: glide). **Pickups on screen**
   (`pickupRects`) are soft keep-outs (8e4): off them when another spot is free.
3. **Placement**: `placeBubble(..., body, law, soft, pick)`. Law keep-outs cost 1e6 each, so any spot clear of them beats any spot that is not,
   however far from the speaker; distance is linear (150/px) once the law is in force; a spot under his feet costs 1.5e5 (behind him,
   then the top band under the HUD, before the floor). Candidate spots: the sides of the speaker, beside Pokey, behind him at his
   height, the top band at both ends and the middle; and when none of those is clear, an 8 px sweep (about 1 ms at worst on this
   container, once per line, never per frame) of the whole safe area, so a
   clear spot is never missed. **When nothing on the screen is clear of everything** (Fold 4 open upright, zoomed in: 1.5 jumps is
   the whole width), what gives way, first to last: the high arc of a double jump far ahead (`softAhead`, above a single jump's
   reach, 3e5), the edge of a thumb corner (5e5), then nothing else: the core way ahead (to a single jump's reach) and the action
   points (1e6), the HUD (1e7) and Pokey (1e8) never. The test proves the soft ones give way only when a brute-force search finds no
   fully clear spot.
4. **Once up, it moves, it never blinks**: a re-check (every 250 ms, at most every 0.8 s) moves the box off whatever has come under it
   without the speaker leaving (`placeBub(p, true)`); while Dot flies after him the box stays where it is (`Plan.follow`). Only a box
   that was clear and now is not moves (a box with nowhere clear does not hop about).
5. **Prove it on real stages**: `src/game/dotBox.test.ts` (RealPlay, the real hint, Pokey stood where the tip comes, the HUD's own
   `hudSafeRect`): 412x915, 915x412, 360x740, 740x360, Fold 4 cover 344x882 and open 673x841, both ways. Add the new moment there.
   Check it fails without the change (the dot-box run: with `law = []` all four Dot moments fail).
6. **Shoot the running game**: three dev servers (before = origin/main worktree, after = the work tree; for a stage only on another
   branch, a worktree of that branch with `git diff origin/main -- src` applied), then
   `PW=/opt/node-tools/node_modules/playwright/index.mjs npx tsx tools/dotbox/shoot.mjs <port> <out> <before|after> [moment]` and
   `tools/dotbox/meeca.mjs`. Each shot writes the still, the bubble at +0.3 s and +1.5 s (`-t1`, `-t2`: does it hop?) and a JSON with
   the law check (pokey / ahead / action / hud). A clip: `tools/dotbox/clip82.mjs` (timed screenshots joined by ffmpeg concat).

## The bar (examples)
- `reference/qa-reports/dot-box/compare-sideways-before-left-after-right.jpg` and `compare-upright-before-after-pairs.jpg`: every
  after is clear of Pokey, the way ahead, the next action point and the HUD; text one or two lines, painted bubble, high contrast.
- `8-2-rope0-after-sideways-clip.mp4`: behind him while he walks up and flicks; one move, at the grab, to the open space under the rope.

## Checks before reporting
- The shooter's JSON: every after `checks` all true, both orientations; the -t1/-t2/final stills: no blink, no more than one move.
- tsc, the full tests (3 shards), vite build, artcheck, drawcheck (a placement change runs only at placement and on the 250 ms re-check,
  never per frame; Meeca's cloud reuses its boxes).

## Pitfalls we already paid for
- 2026-11-01 (D10): one score for "covers the way ahead" and "far from Dot" let near-Dot win; and the lip, the rope post and the way
  ahead were not keep-outs at all. Law first, distance second.
- 2026-11-01: a perch whose box was clear when placed got covered as he walked up; the re-check flew Dot off her perch and the box
  went down and up again elsewhere (a blink). Move the box, keep the speaker.
- 2026-11-01: hanging from the rope, the box behind him (correct by "away from travel") sat on the take-off post: the post he left is
  still his to fall back to. Both posts while he hangs.
- 2026-11-01: the test's copy of the placement must pass exactly what DotGuide passes (it missed `soft` once and "found" a bug
  that wasn't in the game). Keep `placeAt` in dotBox.test.ts in step with DotGuide.tsx placeBub/hardNow.
- 2026-11-01: the name tag clamp (box top >= safe top + tag) only with the law in force: without it, dotGuide.test.ts's old thumb
  test moved into a thumb corner (the box was pushed onto the speaker).
- 2026-11-01: the name tag stands 14 px above the box: clamp the box's top to the safe area plus the tag, or the tag sits in the HUD.
- The shooter: teleporting skips the stage's opening lines but not their queue (wait for Dot to be quiet first); story asides and
  zone lines ("So dark...") queue ahead (mark them heard); a note pickup opens over the stage (mark finds found); on Help, standing
  at a lip brings "Slide left and right..." over the tip (shoot on Tips, the default); the bubble shows Dot's own short version of a
  hint (match `say`, not the hint's words); some hints show nothing on touch (1-3's "Hop up beside the sleeping snake": engineGuideLine
  returns null), so pick moments a phone really shows.

- 2026-11-01: narrow phones upright (under 380 px: 360x740, the Fold 4 cover) had two-line tips with nowhere clear to go: Dot's
  text there is 14.5 px, as on short sideways screens (dotGuide.css), so a tip is one line.
- 2026-11-01: the test's bubble size must match the game's (measured: 39 characters at 14.5 px = 300 x 50.5 + the 14 px tag);
  a pessimistic estimate made two lines and "found" cramped screens that are not.
- **Screens with no clear spot at all** exist (4-2's glide tip on 360x740 upright: the view has his head 77 px under the HUD). There
  the test allows a graze of at most 24 px of the way ahead or of the air over an action point, only when a brute-force search finds
  no clear spot, never him or the HUD, and prints each case. That is a decision for the lead and Matt (camera framing on narrow
  phones, or a shorter line), not a pass.

- 2026-11-01 (the lead, from a fix-petals still): a petal flying to the counter drew over "flowers" in Dot's 1-2 tip. The fly layer
  was inside the HUD's own layer (`.vh`, z 35), so its z-index only counted inside the HUD. It is now beside the HUD at z 33: above
  the world (the canvas), under Dot's words (34) and the HUD (35). Proof: a red marker in the fly layer at the box's middle paints
  red before and parchment after (`1-2-flowers-zorder-*.jpg`). Check the paint order with a pixel, not `elementFromPoint` (it skips
  layers that take no touches).
- Open (2026-11-01): a long two-line line (1-2's "smell the flowers", 403 px wide sideways) has no clear spot while Pokey is at the
  left of the screen: the way ahead spans x 120-510. It grazes the way ahead by 14 px and sits over a petal. Fix to try: when nothing
  is clear, measure it again narrower (three lines) and place that.

## Tried and didn't work
- Playwright's `recordVideo` with `isMobile`: the page is drawn at 60% inside a padded frame. Use timed screenshots.
- A small penalty (6e4) for the floor under his feet: the quadratic distance cost outweighed it; distance had to go linear.

## To try
- Dot herself flying beside the box when the clear spot is far from her (today the name tag says who is speaking; she ends behind him).
- A clipcheck-style automatic sweep over every stage hint (L3 countermeasure for D10): stand at each hint, place, assert the law.

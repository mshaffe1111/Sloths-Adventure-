# ENG-E1 REPORT: 1-7's eagle and cover on the hiding the game already has
Branch `t-eng-e1` (from t-eng-s1@a1739b43). Code head **43fd281e**; gates on that head: `gates.log` (this folder). Opus 5.5, xhigh.
Box: started 8:57 AM ET 11-14 (the session clock); context at the report roughly 375k of 1M (37.5%; I can't see the session's own figure, D64).
Lessons applied: D40 (built in 1-7.md's order: the eagle works and shows first, then cover), D57 (queue read at each push), D59 (no gate
left running: the first gate run was stopped by me on purpose for the flare fix below, then rerun whole on the final head), D61 (a
code-drawn ring and "!" in play view found in my own stills and removed before report), D63 (clips of the whole action, both ways),
D65 (the moss tint judged on a picture of Pokey INSIDE the bush it sits in: it failed there, fixed), D66 (reused inCover, the kit eagle,
stillLay, the old watcher's art; nothing rebuilt), D67 (no wait loops: gates in the background, read from the notice).

## What was built (packet items, 1-7.md NEW numbers)
| # | What | Where |
|---|---|---|
| 1 | **The eagle as a World 1 cast row**, laid as gen2 content: `W1_EAGLE` (terrain air), `eagleOver`, World 1's still table `W1_STILL` + `w1Still(stage, lessonSockets)`; a watched stretch (stillLay's watch socket, run, clip to hides) becomes ONE kit eagle over it (`castWatches`), the kind joins `proto.cast.kinds`, no watcher.ts zone is left. `sweptZones` lets stillFaults hold the eagle's stretches | w1Cast.ts, stillLay.ts, watcher.ts (`WatchZone.cast`) |
| 2 | **The kit sweeper DRAWN**: `sweepPose.ts` (pure, tested): far off and faint between passes over his stretch, in at the edge growing nearer for the warn, over its eye with the shadow sprite on the ground for the pass, the dive in its tell, pulling up short on a free pass, climbing away; eased, faded poses snap unseen. The painted harpy (eagleSprite.ts), never its code-drawn flare ring or "!". **The screech** on the pass's call. Sweepers are skipped by the enemy loop. EAGLE now `rides` its eye (its hurt box arrives with the drawn dive) and a rider starts on its eye | sweepPose.ts, engine.ts drawCastSky/stepCast, world1.ts, core.ts newPredator |
| 3 | **Moss tint + calm sound** from calm(): `CastPlay.calmNow` (in cover only, 0 on bare bark); the moss laid over only Pokey's own drawing (`withWash`, the hurt flash's one small layer, only while it shows); the bush he stands in thins as it comes (else green Pokey behind green leaves was a ghost: `shots/moss-in-bush-before-fix.png` vs `-after-fix.png`); the calm sound once when it is all the way in | castPlay.ts, hurtFlash.ts, protoArt.ts drawBushArt, engine.ts |
| 4 | **The free first pass over a new stretch**, in the kit: `Post.free`/`Enemy.kitFree` (from the zone's lesson) and Easy on every stretch; `sparedPass`: the dive comes, no box hurts, `CastStep.spared` (whoosh; Dot's line from stage data `said.spared`, the keeper's) | core.ts, castPlay.ts, castPlay.types.ts |
| 6 | **A mossy liana is cover while held**, wherever it swings: `Vine.mossy`, `Cover.rope`; on a swing his vy for stillness is the rope length's change (climbing), never the swing | stillness.ts, engine.ts startCast/stepCast, types.ts |
| 7 | **The eagle's cool per stretch**: `Post.cool`/`Enemy.kitCool` read by `coolOf` everywhere the kit sets a cool; laid from the stretch's calm band | core.ts, types.ts, w1Cast.ts |

## NOT done (cut by the box; nothing half-built is on the branch)
- **5, the moss content**: the World 1 still table lays BUSH hides only (the painted bushTall/bushWide). Moss carpet, moss patches and hanging
  Spanish moss need (a) t-art-678b's `w17-moss-carpet`, `w17-moss-drape(-b)` merged with their catalog rows (that branch is not on this
  base and its lead review was open), (b) Bush kinds `moss`/`mossHang` drawn by drawBushes from those pieces at Pokey's scale, (c) rows in
  `W1_STILL` (hanging moss: `hanging: true`, inCover's hanging rule already exists), (d) the NODE-KEY letter `m` (nodeLetters.ts) asking
  for `hide` sockets. A mossy liana's LOOK (Spanish moss on the liana) is art too: today it plays as cover with a plain liana drawn.
- **8, the perch**: engine: a per-animal `perched` on Post (rides off for that one: body on the snag, eye swept, act from the snag) + a
  sweepPose branch for it (body at its post, head-turn as its warn); art: t-art-678b's `w17-harpy-perchfeet-{ahead,turn,down,blink}`.
- **10, bots that hold still in cover**: tools/inspect bots stand still only by accident today; they need "go still in the nearest cover on
  the screech" before 1-7 can be flown/calibrated.

## Proof
- **Planted tests** (`planted-base.out.txt`, `planted-base-2.out.txt`: RED on a1739b43; GREEN here): src/game/eagleKit.test.ts (5: free
  pass, Easy free, own cool, moss only in cover, mossy liana), src/game/gen2/eagleLay.test.ts (2: the still table lays one eagle per
  stretch with its cool and free pass; it plays: hidden-still is never dived and it gives up, the open is spared then taken),
  src/game/sweepPose.test.ts (3). The old kit tests (predator*, castPlay, stillness, eagleFair) pass with the eagle riding its eye.
- **Real game, both ways** (`shoot.mjs`: 1-1's bank, its animals off, one eagle laid by `eagleOver` from the dev server; the label is read
  from the GAME: 1-1, Normal (no difficulty set), the kit's phase/eye/pass, Pokey's x, moss, hearts): stills `shots/{upright-412x915,
  sideways-915x412}-{1-warn..7-after}.png` (+ `-sheet.jpg`), CLIPS `shots/*-eagle.mp4` (~26 s each: pass 1 free in the open, pass 2 still
  in the bush with the shadow right over him, pass 3 the real dive and a heart). The clip's caption is the last still's label (it lags).
- **Gates: ALL GREEN on 43fd281e** (`gates.sh`, the full CLAUDE.md Checks + CI's lists, 9:30-10:15 AM ET; `gates.log`): tsc, unit
  3399/3399, build, chunkcheck, artcheck, knowncheck, generality, seed lists, registry, engine tools, tier bots, kbdcheck, buildcheck,
  drawcheck, clipcheck. roadmapcheck failed the first run only on "shallow clone, proofs cannot be checked" (the container's clone; it fails
  the same on the base); after `git fetch --unshallow` it PASSES on the same head. Commits after 43fd281e are reference/ only.

## Polish check (each item, the still that shows it)
- The warn: the eagle in from the edge, no ring, no "!", the screech (sound only) — `*-1-warn.png`. Sideways its body sits near the HUD
  band, as 1-7.md allows (the shadow and the screech carry the read).
- The shadow on the ground sweeping to him, then right over him in the bush — `*-2-shadow-open.png`, `*-5-shadow-over.png`.
- The free pass pulls up short of him, no heart (hearts 5) — `*-3-free-dive.png`.
- The moss: green Pokey findable through the thinned bush — `*-4-moss.png`, `moss-in-bush-after-fix.png`.
- The real dive and the heart gone (5 to 4), climbing away — `*-6-dive.png`, `*-7-after.png`.
- Rough spots NAMED, not fixed: (1) the calm sound is the existing wind chime (also a puzzle prop's cue): a dedicated soft "settle" sound
  is a content row; (2) Pokey's pose under the free dive is his startled idle (arms up) — reads fine, not designed; (3) upright the
  eagle flies at the old watcher's height (125 px under the view's top), far above the ground: the shadow is the read, as before.

## Rulings the lead owns (not changed by me, law 22)
- stillFaults' calm floor is 5 s (World 6's rule); 1-7.md wants 4-5 s calms in the finale. One of them moves, by the lead.
- Easy's cool is the kit's x1.5 (EAGLE.easy.cool): a 5.5 s stretch is 8.25 s on Easy; 1-7.md's Easy table says 6-7 s.
- The free pass is per stretch (one eagle a stretch): 1-7.md's beats 1, 5 ("warns only") and 10 map to `lesson` sockets the builder names.

## What the 1-7 builder can lay NOW
- `w1Still(7, ['<your teach watch socket ids>'])`: add its `props` to the manifest, its `emit` to the kit's emitters, call `finish(out)`
  after the hides are laid (World 1's finish). A `watchSocket(id, on)` at the start of a bank lays a stretch; `hideSocket(id, on)` lays a
  bush (tall 110 px or wide 160 px). Each stretch is one eagle (cool from the calm band: taught 6-6.5 s, later 5-6 s; free first pass at
  taught sockets; Easy every stretch). The brief's `cast: ['eagle']` is written by castWatches.
- Mark a liana `mossy: true` and holding it is cover (beat 10's swing hide) — plays now, looks plain until the moss art lands.
- `said: { spared: '<Dot's line>' }` on the stage's cast data for the first free-pass dive (the keeper's words).
- Beat 7 (moss carpet/patches), beat 12 (the perch) and bot-flown checks wait on items 5, 8 and 10 above.

## Method update
- predator-kit.md: a sweeper is drawn from its eye (sweepPose), never by the enemy loop, and a flying sweeper rides its eye; a tell drawn
  ON Pokey is judged behind every cover it shows in (the bush ghost). What worked: shooting the REAL game by importing the lay function
  from the dev server (`await import('/src/game/gen2/worlds/w1Cast.ts')`), so the stills show the laid row, not a hand-made enemy.

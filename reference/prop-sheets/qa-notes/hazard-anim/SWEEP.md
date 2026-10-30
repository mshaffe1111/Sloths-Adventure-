# Repeating hazard and effect animations: the sweep (hazard-anim, 2026-10-29)

Round 1 below, then rounds 2 and 3 (the rest of the list, the same evening), then what is still open.

Matt, 4:02 PM ET: "for the falling rocks, it puts squares where it's going to fall... if it's going to constantly have animation, we
need to do it right." Every repeating hazard or effect drawn with plain canvas shapes (fillRect, strokeRect, arc, ellipse, stroked lines,
flat gradient bands) was listed; the ones below marked FIXED are painted now. Shots are in this folder (before-*/after-*).

## Round 1 (fixed)

| What | Where | Was | Now |
|---|---|---|---|
| Falling rocks (4-1 .. 4-9): warning grit, hopping stones, ledge trickle, ground shadow, the rock, the shatter | w4Play.ts drawRock → w4Grit.ts drawRockFx | grey squares with black outlines, 3 px squares, two flat ellipses with a pale ring, a code-arc fallback rock, grey dots | painted pebbles and chips (HF, w4-grit.webp) spinning down, each landing with a stone-dust puff, hopping and settling; a soft contact shadow that grows and darkens, with stone dust over it; the painted rock spinning and stretching as it falls, squashed on landing; painted pebble pieces bursting out under a billow of painted dust recoloured to World 4's stone; a small camera nudge when it lands near him. No fallback: the sheets are preloaded |
| Rock through open air (4-7) | same | gradient band with hard top and bottom ends, code ellipse grit | one soft column sprite (faded at its sides and both ends), painted chips and dust streaming down it |
| Updraft (4-7) | w4Play.ts drawUpdraft | gradient band with hard ends, flat white ellipses | soft column sprite, wisps of the painted dust strip recoloured warm white, rising and unfurling |
| Spout onto the boulder (4-8) | w4Play.ts drawSpout | flat blue rect stream, white stroke streaks, white circles of spray, flat 6 px blue strip, grey rect fallback | the waterfall set's falling water (narrow), its white water and mist on the boulder, painted splash strips running off along the shelf |
| Wind lanes (4-4, 4-9, kit) | zoneArt.ts drawGust | stroked streak curves, flat green ellipse leaves, white stroked chevrons | the painted gust strip racing along the band, painted leaves tumbling (leaves atlas), the painted arrow recoloured pale for the direction |
| Sovereign's shadow pass (4-9) | w4Play.ts drawSovereignPass | two flat dark ovals | the soft shadow sprite (w4Grit drawSoftShadow), two layers |
| Sovereign's feather (4-9) | w4Play.ts drawFeather | code-drawn vane, bars and quill | the painted feather (boss-fx) |
| Glide landing shadow (4-7) | w4Play.ts drawLandingShadow | flat dark oval | soft shadow sprite |
| Eagle-watch shadow (W1 watch stages) | engine.ts drawWatchShadow | flat dark oval halo and core | soft shadow sprite, three layers (as dark as before at its core) |
| Ring-drop landing spot (snake/boa arenas) | engine.ts ring drop | flat dark oval | soft shadow sprite |
| Boss rock-drop grit (4-10) | bossArt.ts drawGrit | fillRect squares | painted grit chips spinning, fading in and out |
| Shared particles, every world | engine.ts particles | flat coloured dots for double-jump leaves, knock-out debris, crumbling-ledge debris, water splash, eagle feathers, claw/kick sparks | painted leaves (leaves atlas), painted grit (grey stone, or tinted brown for wood and earth, under a dust puff), gold/red bursts as soft four-point sparkles, the painted splash crown with puffs of painted spray, the painted feather; claw/kick sparks are sparkles |

## Round 2 (2026-10-29 evening, the lead: "work through your SWEEP.md list"): fixed

| What | Where | Was | Now |
|---|---|---|---|
| Boss danger zone over every column/drop warning | bossArt.ts drawMarker | red gradient box, hard sides | one soft rising-glow sprite (w4Grit drawRiseGlow), faded at its sides and up to nothing |
| Boss shadow, drop landing spot | bossArt.ts | flat dark ellipse, flat red oval | soft shadow sprite |
| World 2 river current and the foam over the logs | engine.ts drawRivers | white round-cap streaks, a hard white wave line | the painted river's own foam (its crest highlights lifted once, riverArt.ts drawRiverFoam) sliding with the current and frothing along the waterline |
| A log about to slide out (W2) | riverArt.ts drawLogComing | stroked ripple rings | the river's own painted foam welling up and spreading |
| Weather petals (W2, W5), W5's drifting petals, Dot's flight petals | scenery.ts, w5Play.ts, dotFlightArt.ts | flat coloured ellipses | painted petals (HF, from the game's own painted flowers: src/assets/flora/petals.webp), tumbling |
| Weather embers (W9) | scenery.ts | hard orange dots | soft glowing embers with a hot heart (the fireflies' pre-rendered glow) |
| Rain and storm (W10) | scenery.ts | stroked lines, a jagged code bolt | soft tapered rain streaks; the painted bolt (boss-fx) |
| Teapot steam (W5 hazard, Meeca's night teapot) | w5Art.ts steamPuff, puzzlePlay.ts | flat discs with a stroked lilac rim; stroked curls | the painted dust strip recoloured to sleepy lilac / pale pink steam, rising and unfurling |
| Silk on Pokey (W5) | w5Look.ts drawSilkOnPokey | veil oval, strand lines, glint dots, stroked wrap rings | the painted web splat pinning his feet, the painted cocoon's wrapped silk climbing him |
| The Seamstress's lace | w5Play.ts drawLaceThrow | stroked curve and circles | painted silk thread laid along the arc, the painted silk bundle at its head |
| A freed cocoon's creature (W5) | w5Play.ts drawFreed | a moth of code ellipses | a painted World 5 butterfly |
| Spore glitter (W3) | zoneArt.ts drawCloud | 2.4 px squares | tiny soft twinkling glows |
| Dew on the webs (W5) | zoneArt.ts drawDew | hard dots | tiny soft glints |
| Tide (W6): mud shine, the warning | zoneArt.ts drawTide | a hard brown band, flat ovals, stroked white chevrons | soft damp darkening and soft sheens; the painted arrow recoloured sea-white, pointing up |
| 4-6/4-9 settle-glow motes | w4Play.ts drawSettleGlow | 2.4 px dots | soft glows |
| 4-3 float log in the pool | w4Play.ts drawFloatLog | stroked half-ellipse | the waterfall set's painted white water lapping round it |
| Dot's knot: fibre flicks, her flight trail | w4Play.ts drawKnot | stroked flicks, a straight line | painted chips tinted brown, soft glows along her path |
| 4-9 nest blow, 4-8 parent's tailwind | w4Play.ts drawNest, w4Nests.ts drawWingWind | straight lines, stroked curves | the painted gust strip |
| Puzzle rooms: bell ring, night gate burst, night plate rim, the tea in the trough, the pour, chair wraps | puzzlePlay.ts | stroked arcs, hard dots, a stroked ring, stroked lines, stroked ellipses | the painted shock streak in gold, soft glows, a soft breathing glow, the painted flood water / jet recoloured to tea, the painted silk bundle |
| Dot's flight: the mist banks, gust streaks, nectar drop, hover buzz | dotFlightArt.ts | hard white ovals, stroked curves, a dot, a stroked ring | soft puffs, the painted gust strip, the painted dew drop with a warm glow, a soft blur |

## Round 3: the bosses' attacks (fixed)

A new painted sheet, src/assets/bosses/boss-atk.webp (HF img2img of plain-shape starts, tools/art/hazard/bossstarts.py, cut by
bosscut.py; review boss-review.jpg), wired through src/game/bossAtk.ts. The old code shapes stay only as the stand-in while the sheet
loads (it is preloaded on every stage).

| What | Was | Now |
|---|---|---|
| Columns: lava, thorn, rock, crystal, web, tail | code polygons and gradients | painted geyser, bramble, stone spikes, crystal cluster, web with silk strands, the croc rising; erupting to height, lava churning with a heat glow, bramble and silk swaying |
| Lightning column | stroked zigzag, flat oval | the painted bolt flickering between mirror turns, a soft violet glow, a soft flash |
| Drops: spike, bat, generic rock | code triangles, a code bat, an octagon | painted stalactites (stone or ice), the painted bat folding and diving, the painted rock tumbling |
| Bolts: club, spear, thorn dart, bat | code polygons | painted clubs tumbling, the painted spear, painted thorn darts, the painted bat beating its wings |
| Puddles and globs (lava, mud, venom) | flat ellipses and bubble dots | painted puddles spreading, painted globs stretched along their flight, soft glowing bubbles |
| Beams: fire, vine, jab, laser | gradient polygon, stroked whip, gradient line, fillRect bands | the painted flame jet, thorny vine whip, spear thrust, energy beam, reaching out and flickering |
| Slash waves (rock, lava, thorn) | stroked arcs, a flat oval | the painted shock streak stood upright in the attack's colour, two fainter ones trailing |
| Ground shock | code curves, dust dots | the painted breaking mud wave recoloured to the attack's earth, painted dust behind |
| Flood warning, storm warning, blaze, lava/venom strip | hard gradient bands, stroked rings, code stakes and flames, fillRect lava, bubble dots | soft shadows and rising glows, painted splashes welling up, painted flames along the floor, the painted lava strip (venom: the painted flood recoloured green), soft glowing bubbles |

## Still open (live, listed for the lead)

- Dot's knot (4-4, 4-8): the knot itself is a stroked brown ring; the landing mark strokes, the rim ring and the fill-up progress ring
  are code (the ring is a progress indicator: it needs a painted ring or a UI decision).
- Bosses: the frog's tongue beam, the covered weak point's ember disc, an unknown look's default ellipse bolt, sovereignArt.ts's
  screech shimmer and back-cue ring and chevrons (4-10).
- The lairs (lairArt, lairGolem, lairGolemObjects, lairMonarchObjects, lairCrocObjects, lairWarcamp, lairProwler): embers, dust, grit,
  drips and spores as hard dots and rects.
- zoneArt.ts drawEruption / drawRod / drawBolt / drawCrumbleTiles (generated geyser/bolt/crumble stages, W7/9/10): not yet checked
  whether they ship.

## Other owners (not touched)
- terrain.ts drawWater stand-in: foam crests and sparkles, scum patches as ellipses (until the painted bad water loads).
- No file named groundPaint was found.

## Stand-ins only (drawn just while a sheet loads; every one is preloaded)
w4Play drawFallWater, drawVeil, drawPool's rect, the boulder and chime fallbacks, drawFrond, drawStandInNest, drawBlownOff, the Sovereign
silhouette; bossArt shards squares, warnRing ellipse, code cocoon, drawWebShot; engine cat-eye dots, bush mounds; zoneArt mushrooms, web,
tide water; calmWaterArt plain water; scenery leaf ellipses; life.ts motes and ash (only without a painted backdrop).

## Clean-sweep batch (2026-10-29 late, stopped for the night at 11:00 PM ET)

On hazard-anim, cut from ccr b730dced. Done and pushed, tsc clean: S1 (W2 river: painted deep water under the strip and over the logs,
deepWaterArt.ts), S4 (dirty water: two chop variants with the first strip's outline, mirrored at random, ten painted debris pieces with
varied spacing/size/flip, the painted murky deep replacing the flat #30312c band, also G5), S2 (W9 obsidian and W10 iron junk painted and
harmless-looking, rubbleArt.ts; the code spikes deleted from envPlants). H1 was already done in round 2.
NEXT STEP: the full test suite and vite build on this commit (stopped mid-run), then the before/after videos
(tools/art/hazard/rec.mjs 5174/5173 <dir> before|after river,dirty8,rubble9,rubble10 5, the base server on ccr), then the Polish check.
Not yet looked at in game: the rubble's size on the ground and the debris against the chop (review sheet clean-review.jpg only).

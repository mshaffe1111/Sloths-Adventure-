# Repeating hazard and effect animations: the sweep (hazard-anim, 2026-10-29)

Matt, 4:02 PM ET: "for the falling rocks, it puts squares where it's going to fall... if it's going to constantly have animation, we
need to do it right." Every repeating hazard or effect drawn with plain canvas shapes (fillRect, strokeRect, arc, ellipse, stroked lines,
flat gradient bands) was listed; the ones below marked FIXED are painted now. Shots are in this folder (before-*/after-*).

## Fixed on this branch

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

## Not fixed: listed for the lead (live, repeating, read as code shapes at phone size)

World 2 and rivers
- engine.ts drawRivers: white round-cap streaks sliding along the river surface; a hard white wave line over the logs (W2, 2-8 flood).
- riverArt.ts drawLogComing: stroked half-ellipse ripple rings before a log appears (W2).

Weather (scenery.ts renderWeather)
- petals: flat coloured ellipses (W2, W5). embers: hard orange dots (W9). rain/storm: stroked lines and a jagged code bolt (W10).

Zones (zoneArt.ts)
- drawCloud spore glitter: 2.4 px squares (W3 spore zones).
- drawTide: white stroked chevrons, low-tide mud shine as flat ellipses (W6 tide).
- drawDew: 1.8 px hard dots on the webs (W5).
- drawEruption / drawRod / drawBolt / drawCrumbleTiles: steam discs, ember squares, dashed crackle, spark squares, code bolt, dust squares,
  crack lines (generated geyser/bolt/crumble stages, W7/9/10, if they ship).

World 4 (smaller)
- drawSettleGlow: 5 rising 2.4 px motes (4-6, 4-9; the glow is fine).
- drawFloatLog: stroked half-ellipse ripple under the painted log (4-3).
- drawKnot: landing-mark strokes, stroked rings, fibre flicks, a straight trail line behind Dot (4-4, 4-8).
- drawNest (blowing): straight wind lines either side of the eaglet (4-9). w4Nests.ts drawWingWind: stroked wind curves; the whole cage
  nest is code-drawn (4-8).

World 5 and Meeca
- w5Play.ts petals (flat ellipses), drawLaceThrow (stroked curve and circles), drawFreed (a moth of code ellipses).
- w5Art.ts steamPuff: teapot steam as flat discs with a stroked lilac outline (the teapot hazard).
- w5Look.ts drawSilkOnPokey: flat veil oval, strand lines, glint dots, stroked wrap rings.
- puzzlePlay.ts: night gate burst of 8 hard dots, plate rim ring, bell ring arcs, teapot steam and tea strokes, chair wrap ellipses.

Dot's flight (dotFlightArt.ts)
- petal ellipses and line-drawn dandelion seeds, hard white mist ovals over the gorge, stroked gust streaks, a nectar drop dot, a
  stroked ring at her wings.

Bosses (bossArt.ts, sovereignArt.ts, lair*.ts)
- drawMarker zone: red gradient band with hard sides and top, on every boss column/drop warning.
- shadows: a flat ellipse under the boss, a red flat oval under every drop.
- drawColumn (lava, web strands, thorn, rock, lightning, crystal spires), drawDrop (spikes, a code bat; its rock octagon whenever the World
  4 sheet is not loaded), drawPuddle/drawGlob, drawWave (rock/lava/thorn), drawBeam (fire, vine, jab streak, laser bands), drawBolt
  (club, thorn darts, bat), flood ripples, blaze, lava strips, the covered weak point: all code (W5-W10, Thornbark).
- sovereignArt.ts: stroked shimmer ellipses at the beak (screech cue), stroked ring and chevrons (back cue) (4-10).
- the lairs: embers, dust, grit, drips and spores as hard dots and rects (every boss lair).

## Other owners (not touched)
- terrain.ts drawWater stand-in: foam crests and sparkles, scum patches as ellipses (until the painted bad water loads).
- No file named groundPaint was found.

## Stand-ins only (drawn just while a sheet loads; every one is preloaded)
w4Play drawFallWater, drawVeil, drawPool's rect, the boulder and chime fallbacks, drawFrond, drawStandInNest, drawBlownOff, the Sovereign
silhouette; bossArt shards squares, warnRing ellipse, code cocoon, drawWebShot; engine cat-eye dots, bush mounds; zoneArt mushrooms, web,
tide water; calmWaterArt plain water; scenery leaf ellipses; life.ts motes and ash (only without a painted backdrop).

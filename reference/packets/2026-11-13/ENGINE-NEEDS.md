# ENGINE-NEEDS: the bulk engine plan (R-165.186). Architect, Opus 5.5 high. Read only on code; WRITE: reference/plans/ENGINE-NEEDS.md
# and reference/qa-reports/ENGINE-NEEDS/*. Branch t-engine-needs from origin/ccr-ea739a2f-dfcee4. Written 10:27 AM ET by the lead.
Why (Matt, 10:26 AM ET): "get the engine to a spot where I can start implementing levels. The goal is 2 hours from design until tests...
go through the game map, all the levels, find which types of elements we do the most, and build them in the engine. In bulk... If we're
only going to use certain pieces sparingly, they don't need to get done." Built on: main 0.9.7; replaced this sprint by: none.
The lead's count from reference/plans/WORLD-MAP.html (90 core stages; tags + travel arrows): dir 30 (up 20, down 4, left 4, out-and-back 2),
clock 20, dark 17, swing 11, ride 11, still 10, water 10, lure 8, crumble 6, fling 6, hang 5, glide 5, wind 5, break 5, trap 4, noise 4,
follow 4, hold 4, leash 3, chase 2, drowsy 2, machine 2, heat 2, hurt 1, roads 1. Archetypes: sprint 18, ascent 18, vine_runner 12,
gauntlet 10, stealth 9, purge 8, relic_hunt 6, harvest 5, rescue 4. The map's "built" labels date from 11-11 and are NOT proof.
## Done (one document, 80 lines max, every claim file:line)
1. **Truth table:** for each piece above + the vine field (two-hand climbing, t-lattice) + "travel left": is it a gen2, data-driven piece
   any stage can use today (file:line), mixer/old-generator only, partial, or missing. In flight today, count as "landing": FA (ascent up/
   down, climb camera), B14 (vine field, a general beat clock with pods first, cluster gate), B15 (rotting bough, falling limb load, marks goal).
2. **Ranked bulk list:** what to build next, by stages-that-need-it x how soon (first world that needs it), skipping pieces used in <=3
   stages of one world (name them as "later, by hand"). Each entry a ready packet: size (S/M/L from measured jobs where you can: LEVEL-LOG,
   STATE), WRITE files, what it depends on, and which entries can run side by side without sharing a file (or which goes first).
3. **The 2-hour level target:** what stands between a finished design and a tested level today (from 1-2/1-3's logs: LEVEL-LOG.md,
   reference/methods/level.md, D51): e.g. registering a stage in every table, seed list, bots, drawcheck. Propose the tool or piece that
   makes "add a level" one step, as a packet.
4. Where the vine field returns after 1-4 (Matt approved it as a teach that grows: R-165.177), from the map's vine_runner/ascent stages.
## Rules
Read only: never edit src/. 80 lines, lean. Fast gates only if you add a file outside reference/ (you shouldn't). Done by 12:30 PM ET.
Return: the doc pushed (git ls-remote), then one send_message to the lead (5 lines). Then stop.

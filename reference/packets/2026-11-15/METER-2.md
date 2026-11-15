# METER-2 step 0: can the meter measure every mechanic the game will have? Research/design, Opus 5.5 high. Written 10:58 AM ET 11-15.
Role card: reference/roles/DATA-ANALYST.md.
BOX 75 min or 35%. No game code: a table and a plan (law 5 fast gates only).
Matt 11-15 12:17 AM ET: "we don't really have ways of measuring difficulty for certain things... look at our world map... swimming and other
elements. The frogger element could be harder depending on if we're looking at reaction times and trying to move with reactions or if we're
forcing the jump... so we're not at a point where we're like, oh, we don't know how to measure this because we don't have a bot." 12:18 AM:
"we don't know what we don't know... but we know the pieces, so we should be able to factor that in."
Read: ROADMAP R-165.272, .268, .270, .271; reference/design/DIFFICULTY-MODEL.md (origin/t-diff-research), reference/research/
DIFFICULTY-SYNTHESIS.md (origin/t-diff-synth) and reference/research/MATT-RANKING-2026-11-14.md (this branch); the game map
(`git show origin/t-design-game-map:reference/plans/GAME-MAP.md`: §3 move ladder + freshness table, §4 world by world, §10 B list);
the bots (tools/inspect/castBots.ts, tierBots, BOTS.md) and METER-1 (origin/t-meter-1 cfa9019a). Read the code before you claim a bot can
or can't do a thing (law 3: name file:line).
Deliver reference/design/METER-COVERAGE.md on branch t-meter-2 (from this branch's head):
1. One row per mechanic/piece on the map, all ten worlds (moves, hazards, rides, water, wind, dark, noise, the clock, tide, falling floors,
   fling, vents, the flash, bosses, followers, the chase): the world it first appears in; the bot tiers that play it TODAY (file:line);
   the channel that prices it: self-paced, reactive window, forced beat, watcher race (stop-signal), pursuer/chase, endurance/count;
   reactive vs forced; whether tester data exists; the GAP (no bot / no channel / no data) and the fix, hours, and the world it must be
   ready by. Frog-style crossings get two rows (wait-and-go vs forced beat).
2. Combinations: which pairs the map puts together (swing in wind, chase over water...) and how the model prices a pair (not just the sum),
   with how we check it against Matt's play the first time it ships.
3. The gate: spec a check that fails the suite on any brick/piece with no bot that plays it and no channel that prices it (file, what it
   reads, its known list that only shrinks).
4. Order: what METER-2a must have before World 2 builds (2-1 river rides, 2-2 sinking pads), what can wait.
REPORT in the file's last section: Learned, EXACT NEXT STEP. Message the lead when the table is drafted (before polish). Lead:
session_01FhBbYN2CVHnFXg7XzqKXpM.

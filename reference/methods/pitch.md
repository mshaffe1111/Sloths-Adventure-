# Method: the pitch round (how a level's idea is chosen). Written by the lead 6:28 PM ET 11-14 from Matt's directions that evening.
Why this file exists: the 11-14 evening lead started a single designer on 1-9 because no document said how levels get chosen; Matt had to
explain it (6:23-6:28 PM ET). Every lead uses this; improve it after every round (LAWS 4).

## Matt's words (11-14)
- 6:23 PM: "we had an Opus medium and an Opus high work on doing a pitch for a level... have them all pitch it now, and then you can make the
  final decision on what makes it in, or if you give it back to them, because they both suck." (Medium is gone since his 1:51 PM rule: run
  the pair at high and xhigh.)
- 6:23 PM: "I want to bring out what's special about the game, not just Pitfall had the vine. A lot of games have the vine. What made Pitfall
  great? What did people love about it?... Like Donkey Kong Jr., where you're walking up the 2 vines."
- 6:24 PM: the game outline (reference/plans/GAME-MAP.md, only on origin/t-design-game-map, not on this branch: read it with git show) has stage ideas and game callouts; "not set in stone...
  you have full permission to implement and switch things around as needed."
- 6:27 PM: "the only games ever being referenced is Donkey Kong Country, Mario, Ori, the really well-defined ones. I want to have some classics
  and some unknown ones in there too... a lot of the classic laid the way for and is best fitted for what we do today."
- 6:08 PM: layouts already built are not final either: "change up some of these levels and use pieces we already have, but give it a whole
  new feel" (R-165.253).

## The steps
1. **Pitch ahead.** Pitch the next THREE levels at once (N+1, N+2, N+3) so the engine pieces they need can be built before their builders start.
2. **Research sites:** Matt allowed 8 hosts on Default (11-14 7:00 PM ET). Tested from the lead's session: en.wikipedia.org, www.hardcoregaming101.net, www.gamedeveloper.com, www.pcgamer.com, www.gamesradar.com open (200); tcrf.net and www.mobygames.com answer 403 (the sites refuse bots); web.archive.org resets the connection. Quote opened pages with URLs; mark the rest [S]. **Two pitchers, blind to each other:** Opus high + Opus xhigh, same packet (template: reference/packets/2026-11-14/PITCH-19-22.md), each
   on its own branch t-pitch-<a|b>, told not to read the other. Tag them "designer" (models.json). Boxes about 90 min.
3. **What every pitch carries, per level:** the ONE idea; what players LOVED about each source game (cited: a review, interview or
   retrospective, never a feature list), how the original taught it, how we make it feel that good on a phone, what we don't copy; 6-10 beats
   with the teach and the "he feels" line; a node string sketch; the Normal number pasted from DIFFICULTY.md; the engine list (wired /
   exists-unwired / NEW with size and file; at most 2 NEW per level, so it builds in under 2 hours); how it differs from the levels before it;
   where it kept or changed GAME-MAP.md's outline.
4. **The shelf rule:** draw from all four blocks of reference/plans/PLATFORMER-100-MATT.md (Matt's list; "why people loved it" is the seed).
   Per level: at least one pre-1990 classic, at least one lesser-known title, at most ONE of the famous few (Mario, DKC, Sonic, Ori, Celeste,
   Hollow Knight, Rayman); no lead tribute reused from an earlier level unless the reason is new.
5. **The lead decides** (Matt's call is the lead's here): per level take A, take B, merge the best of both, or send both back with exactly what
   failed. Judge: is the idea fun for a sloth on a phone, is it different from the last three levels, is the research about what people LOVED,
   does the engine list fit the 2-hour build. Write the pick and the reason per level in reference/design/<level>.md's header.
6. **Then** one designer writes the final design (or the builder and the lead finalise it together when the engine is ready), the story
   keeper writes and approves the lines, the engine pieces go to xhigh members, and Matt hears what the levels are once finalised (stills or a
   mock-up of anything that changes the look, CLAUDE.md "Show first").
7. **Rework of built levels** (R-165.253): the first pitcher of a round also writes a one-page tribute pass over the built levels; the lead
   picks which changes go in as data-only builder jobs.

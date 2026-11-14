# PITCH-19-22: pitch 1-9, 2-1 and 2-2 (two pitchers, A at high, B at xhigh, working blind to each other; the lead picks or sends both back). Written 6:23 PM ET 11-14.
Matt, 6:23 PM ET: "have them all pitch it now, and then you make the final decision... When doing the research, I want to bring out what's special
about the game, not just Pitfall had the vine. A lot of games have the vine. What made Pitfall great? What did people love about it?... Like
Donkey Kong Jr., where you're walking up the 2 vines." Also (6:05-6:08): a fun, creative game, no tunnel vision, a tribute to his shelf.
Role card: reference/roles/DESIGNER.md. Read FIRST reference/methods/level.md (Building rules), then ONLY: packets/2026-11-13/IDEAS-1-6.md
"THE TRIBUTE RULE"; reference/plans/PLATFORMER-100-MATT.md (Matt's list, WHOLE: "why people loved it" is the seed of every pitch),
PLATFORMER-100.md and INSPIRED-BY.md (skim); reference/design/1-8.md on origin/t-1718-design lines 1-35 (the level before 1-9, and the format);
the game outline reference/plans/GAME-MAP.md on origin/t-design-game-map lines 137-200 (World 1 and 2 rows) and 597-670 (§10 sprint list: B3 lanes, B4 moving platforms, B5 things on a beat, C1 pursuer): its game callouts and stage ideas are a STARTING POINT, not set in stone (Matt 6:24 PM: "you have full permission to implement and switch things around as needed"); DIFFICULTY.md:55-70; PREDATORS.md lines 39 and 74 (the boa); MAP-REVISIONS.md lines 30-50 and 55-60; WORLD-MAP.html lines 195-205 (2-1, 2-2).
Facts (lead, origin/t-int-9): the boa exists (predators/world1.ts:49-70: beaten by trap, lure, still or punch); drop traps, foodChain, swim,
rising tide, drifting logs (river.ts), deadly water gaps, pods on a beat (podfall.ts), rolling nuts/fruit (1-8, t-eng-b5) are WIRED.
Exist but NOT wired: gen2/lureLay.ts, gen2/rideLay.ts, sinking pads (ride.ts newPad/stepPad), snap-jaw stones (beatBrick 'bites').
MISSING: lanes, followers (follow.ts), a gen2 World 2 kit (2-1/2-2 are hand-built today, w2Stages.ts). Each level must build in UNDER 2 HOURS:
favour what is wired; name every NEW piece with its size (S ~1 h, M 2-4 h) and file; at most 2 NEW per level.
**THE SHELF RULE (Matt, 6:27 PM ET: "the only games ever being referenced is Donkey Kong Country, Mario, Ori, the really well-defined ones. I want to have some classics and some unknown ones in there too... a lot of the classic laid the way for and is best fitted for what we do today"):** draw from ALL FOUR blocks of PLATFORMER-100-MATT.md (his ~130 games, each with why people loved it). Per level: at least one pre-1990 classic, at least one lesser-known title (not a household name), and at most ONE of the famous few (Mario, DKC, Sonic, Ori, Celeste, Hollow Knight, Rayman). Don't reuse a game already leading 1-6, 1-7 or 1-8 (Pitfall!, Donkey Kong, Crash, DK Jr.) unless the reason is new.
For EACH of 1-9, 2-1, 2-2, one page: (a) the ONE idea in a sentence and why it is fun for a sloth on a phone (thumbs, upright + sideways);
(b) 3+ games from different series and eras (one post-2005), each: what players LOVED about it (cited: a review, an interview, a
retrospective; not a feature list), how the original taught it, how we make that FEEL on a phone, what we do not copy; (c) 6-10 beats
with the first appearance taught and the "he feels" line; (d) a node string sketch; (e) Normal target pasted from DIFFICULTY.md and Easy;
(f) engine list: wired / exists-unwired / NEW (size, file); (g) what makes it different from 1-6, 1-7, 1-8 (no repeat of their idea).
Write to reference/design/pitches/PITCH-<A|B>.md on branch t-pitch-<a|b> from origin/t-1718-design. Do NOT read the other pitcher's branch.
Pitcher A also writes reference/design/W1-TRIBUTE-PASS.md (R-165.253): for 1-1..1-8, ONE change from pieces we have that gives each its own
feel, tied to one game on Matt's list and what players loved about it. Under 40 lines.
NETWORK: research members run on Matt's "Gaming" environment (7:00 PM ET), which can open en.wikipedia.org, web.archive.org, tcrf.net, www.mobygames.com, www.hardcoregaming101.net, www.gamedeveloper.com, www.pcgamer.com, www.gamesradar.com. OPEN the page (WebFetch or curl) and quote the line with its URL; for other sites use web.archive.org/web/2020/<url>. Mark anything you could not open [S] and use it only for mechanic facts.
Gates: roadmapcheck + knowncheck. End with "Learned". BOX: A by 8:15 PM ET, B by 8:35 PM ET, or 40% real context (400k). No shell
wait loops. Report to session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries your context %.

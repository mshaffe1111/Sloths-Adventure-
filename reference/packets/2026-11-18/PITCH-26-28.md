# PITCH-26-28: pitch 2-6, 2-7, 2-8 with TWO LENSES (pitch.md step 2b, Matt 11-18 11:29 AM ET: "test it out with the next levels just to see
what it would do and if there's anything that we can implement off of it... if some new fun elements are added, then why not take it in?").
Written 11:30 AM ET 11-18 (by `date`). Pitcher A (fixed lens, high) and Pitcher B (open lens, xhigh), blind to each other.
BOX: 90 min from your start, or 40% REAL context. No shell wait loops. Report to the lead session_01FhBbYN2CVHnFXg7XzqKXpM with your REAL context %.
Method: reference/methods/pitch.md (READ IT WHOLE, step 2b is new and is why this round exists). Role card DESIGNER.md. Read FIRST
reference/methods/level.md (Building rules); the format and bar: `git show origin/t-design-24:reference/design/2-4.md` (a final design).
Network: the Gaming environment (pitch.md step 2 hosts). SOURCES: every tribute game carries at least ONE source that is NOT Wikipedia
(an interview, a postmortem, a retrospective, a review page you opened); Wikipedia may be a second. [S] marks anything not opened.
Per level, one page (pitch.md step 3): the ONE idea and why it's fun for a sloth on a phone (one thumb, upright + sideways); 3 games
(pre-1990 / lesser-known / post-2005; at most one of the famous few), each: what players LOVED (cited), how it taught it, how we make it
feel that good on a phone, what we don't copy; 6-10 beats with the teach and the "he feels" line; a node string that passes checkCode
(run it: gen2's validator); Normal + Easy targets pasted from DIFFICULTY.md; the engine list (wired / exists-unwired / NEW with size and
file; at most 2 NEW a level); how it differs from 2-1..2-5 and from each other. End with "Learned" and "Pushback".
WHAT BOTH GET (facts to verify on origin/main before you claim them, law 3):
- World 2, Sunlit Riverbank: the river village; signature RIDE ("hop on things that move and let them carry you"); nothing stands still.
- Built/designed so far: 2-1 drifting logs (ride, step off before the reeds), 2-2 sinking lily pads, 2-3 freed animals follow you home
  past a heron (designing), 2-4 vine to moving log to vine without touching land (designed), 2-5 stones that bite on four (designed).
- The story per level (stagePlan.ts, the story keeper's words): 2-6 "Up the Bank Houses: Climb up through the village houses dug into
  the bank." 2-7 "The Mailman's Route: Take the long way round the river, past every door marked PLEASE BE PATIENT." 2-8 "Before the Water
  Rises: Free more little ones before the water rises." Missions: 2-6 ascent, 2-7 sprint, 2-8 rescue.
- Engine on main (verify): lifts (lift.ts), side-to-side platforms, a hand-built rising tide (risingTide.ts), reed cages, carry and crank,
  sluices, gen2's World 2 kit (w2.ts), river rows, pads on a beat, followers (being built for 2-3: assume they exist for 2-8).
- LADDER MUSTS (the only fixed things; later levels build on them): (1) 2-8 brings back 2-3's "bring them home" (the freed ones follow)
  under a new pressure; (2) somewhere in 2-6..2-8 World 2 teaches the FIRST RUN BACK TO THE LEFT (later worlds reuse running left).
PITCHER A (FIXED LENS): also read GAME-MAP's World 2 rows: `git show origin/t-design-game-map:reference/plans/GAME-MAP.md` lines 174-203
(2-6 lifts and platforms that ride up and down; 2-7 out to the last door, ring the bell, race back LEFT through a changed river; 2-8 the
water rises from below, free them and bring them up ahead of it). Lead your tributes from Blocks 1-2 of PLATFORMER-100-MATT.md.
Write reference/design/pitches/PITCH-26A.md on t-pitch-26a from origin/main.
PITCHER B (OPEN LENS): do NOT read GAME-MAP.md or any pitch/design for 2-6..2-8, and do not read t-pitch-26a. Start from the story line, the
world's feel, the ladder musts and what the engine has: what is the most fun level a sloth on a phone could play here? Surprise us, but
stay buildable (2 NEW max) and true to the world (World 2 = rides and the river; nobody hurt; no made things beyond the village's).
Lead your tributes from Blocks 3-4 of PLATFORMER-100-MATT.md. Write reference/design/pitches/PITCH-26B.md on t-pitch-26b from origin/main.
Gates: roadmapcheck + knowncheck (fetch every branch first). Times from `TZ=America/New_York date`.

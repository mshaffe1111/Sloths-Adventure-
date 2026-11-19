# PITCH-36A REPORT (fixed lens; Pitcher A, Opus high). Written 6:53 PM ET 11-19 (by `date` in the same command). Base origin/main 6e7b85f8f.
## EXACT NEXT STEP
The lead compares this with PITCH-36B (open lens) per level and writes the picks; then DESIGN-36-39 flies the numbers marked closed-form.
## Done-items (packet PITCH-36A)
1. One page per level, pitch.md step 3 (one idea, 3 tributes with what was LOVED + source opened + how taught + ours + not copied, 6-10
   beats with teach and "he feels", node string, target pasted, engine list with at most 2 NEW, differs): reference/design/pitches/PITCH-36A.md
   (3-6, 3-7, 3-8, 3-9, the Cave Slide). PASS.
2. Node strings through checkCode: `npx tsx reference/specs/sims/nodes3639.ts` -> 5 of 5 "checkCode: no errors" (the slide as a GRAPH). PASS.
3. Targets pasted from DIFFICULTY.md:61-63: 3-6 25, 3-7 28, 3-8 27, 3-9 30 (Easy <= 0.6x). The hidden stage has no slot: Pushback 1.
4. Engine lists verified on origin/main with file:line (cites re-checked last, D52); each level names what must exist first. PASS.
5. Sources: 15 tribute games, each with at least one NON-Wikipedia page opened (Game Developer, GamesRadar, PC Gamer); [S] marks the
   first-screen teach facts no allowed page covered. Shelf: each level has a pre-1990 game, a lesser-known one, at most one famous.
6. Gates (docs + a reference/ sim only, LAWS 5 scoped): tsc PASS, roadmapcheck PASS, knowncheck PASS, generalitycheck PASS (worktree
   at t-pitch-36a; npm install there, package-lock not committed).
## The five ideas (one line each)
- 3-6: toss Grandma's glow cap ahead (no jump while carrying): what it lights is there, shelves and marked ferns.
- 3-7: run LEFT, walk soft: the fern hiding her thing rustles; run and your own feet drown it.
- 3-8: on a swinging liana the thorn vines can't see you: wait while they look, let go when they doze.
- 3-9: round the prowlers' ring with every World 3 lesson; the glow cap makes the jaguar flee (the guardian's rule previewed, V).
- Cave Slide: down a dark water chute; glowworms wake a beat ahead of each rock: read the light, pick the lane.
## Polish check
No screens: a pitch. Every beat's phone fit is for the design's stills (rule 8); I name the numbers to fly instead of guessing them.
## Pushback (in the pitch, with evidence)
1. Hidden stages have no difficulty number (DIFFICULTY.md:63-65). 2. The jaguar's `first: 'trap'` (world3.ts:32) vs meeting it in 3-9.
3. Build the cast's "ways" once (bell, punch, light: none has a caller in castPlay.ts): ENG-WAYS before ENG-LURE/ENG-VINE/3-9.
4. ENG-LIGHT must keep "no jump while carrying" (puzzlePlay.ts:704) or 3-6 loses its idea. 5. Seven [S] teach facts.
## Suggestions (ready packets, outside my walls)
- **ENG-WAYS** (S-M, engine, xhigh): castPlay.ts sends bell, punch and light into the cast as `beat`/lure ways; one planted toy each
  (plant: the way off -> the creature ignores it, RED); generality clean. Replaces three separate wirings (D40).
- **RULE-HIDDEN** (lead, 10 min): a DIFFICULTY.md line for hidden stages, then the slide's design.
## Unresolved
- Closed-form numbers (the toss's 290 px, 3-8's sleep 4.2 s) are NOT flown: DESIGN-36-39 flies them (rule 24).
- I did not read t-pitch-36b (as told) or WORLD-3-PLAN's art §3 beyond the rows used.
## Method used / Lessons applied
pitch.md (whole) step 3 and 2b (fixed lens), level.md rules 1-2, 6-7, 22-24. LESSONS: D30 (every time from `date` in the same command),
D52 (cites re-checked last: five thornVine/physics/w7Slide cites corrected before commit), D58 (tribute = what was loved, cited), D34
(file:line for every engine fact), D53 (fast gates before the docs push), D57 (ReadNotifications at the push), D66 (grep before calling new).
## Method update (proposed for pitch.md)
- Step 2's host list: add "hardcoregaming101 may be down; GamesRadar through WebFetch returns only the title: fetch with curl and strip
  tags in scratch". Game Developer's "Retro Game of the Day" has one short page per classic.
- Step 3: "engine list: grep the creature kit's beatenBy AND castPlay.ts" (data with no emitter looks wired).
## Turnover note
reference/handoffs/designer.md: §1 (where PITCH-36A lives) and §5 (three traps) rewritten in this commit.

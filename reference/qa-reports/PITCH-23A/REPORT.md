# PITCH-23A REPORT (Pitcher A, high; packet reference/packets/2026-11-18/PITCH-23-25.md). 9:50 AM to about 10:10 AM ET 11-18
EXACT NEXT STEP: the lead reads reference/design/pitches/PITCH-23A.md beside PITCH-23B.md and picks per level (pitch.md step 5).

## Done-items
1. One page per level (2-3, 2-4, 2-5): the ONE idea and why it's fun on a phone; 3 tributes each (what players LOVED, quoted with URL; how the original
   taught it; how we make it feel on a phone; what we don't copy); 11-13 beats with teach and "he feels"; a node sketch; Normal + Easy targets from
   DIFFICULTY.md:63; the engine list (wired / exists-unwired / NEW, at most 2 NEW each with size and file); how each differs. PITCH-23A.md.
2. FACTS on origin/main 6e7b85f8 checked, each with file:line (the table at the top): followers MISSING (no follow.ts); snap-jaw stones EXIST-UNWIRED
   (beatBrick 'bites' is a type with no player: padPiece.ts:58, :104 hardcode 'gone'); the turtle has no `trap` ending (predators/world2.ts:14).
3. Shelf rule per level: 2-3 Choplifter (1982) / Abe's Oddysee (1997, new reason) / Spelunky (2008); 2-4 Bionic Commando (1987-88) / Gibbon: Beyond the
   Trees (2022, a phone game) / DKC (the one famous, new reason); 2-5 Pitfall! (1982, new reason: the crocodile heads) / Crypt of the NecroDancer (2015) /
   Mega Man (1987) as the thing NOT to copy (the one [S] quote: a search snippet).
4. Gates (docs-only branch, LAWS 5 scope): knowncheck PASS; roadmapcheck PASS (after fetching every branch: the shallow clone had failed it on 13 commits that live on other branches, none from this change).

## Polish check
No stills: a pitch has no screen. The phone-both-ways line per level names the px each decision needs (upright 425 px, 270 px ahead).

## Pushback (also in the pitch)
1. 2-3 can't build in under 2 h today: followers are MISSING. I cut GAME-MAP's 10-16 h follower to a trail-replay one (M, 3-4 h) that cannot strand; an
   engine member must build and prove it on a real stage row before the builder (rule 23).
2. Snap stones and the trappable snapper are NEW (small), not wired.
3. 2-4's let-go onto a MOVING log has never been flown: its numbers are proposals until `reference/specs/sims/swingLog.ts` flies them (rule 24).
4. Matt's OK for the "bring them home" mission is still owed (GAME-MAP 2-3).

## Suggestions (ready packets, outside my walls)
- ENG-FOLLOW (xhigh, M): src/game/follow.ts + engine.ts freeCritter + goals.ts "bring N home"; done: a toy row frees 2 and the gate counts 2 (0 with follow
  off), followers swim over river points, wait at the flag after a fall; works for any stage (generalitycheck).
- ENG-SNAP (xhigh, S-M): padPiece plays 'bites' (hurts while on, through engine.ts:4746's piece hurts); rideLay row `on: 'bites'` + per-stone shift; a
  planted test: a stone with no warn is refused.

## Unresolved
- Spelunky's "loved" quote is for the game, not the damsel itself; DKC's barrel-chain teaching and Mega Man's quote are [S].
- No flight run: every timing number in the pitch is a proposal with its source.
- Step 7's tribute pass over built levels was not asked by this packet: not done.

## Method update (proposed for pitch.md)
- Step 3: "exists" means a caller PLAYS it (grep the caller, not the name); a type with a test only is exists-unwired.
- Step 2: en.wikipedia.org answered every game page this session; gamesradar and hardcoregaming101 slugs 404 when guessed: search, then fetch.

## Lessons applied
D7/D24 (fact in code before claim: the fact table), D34 (file:line cites, checked last: the flag cite was corrected to pipeline.ts:1748), D58 (what players
loved, quoted), D30 (times from `date`), D53 (fast gates before a docs push), D36 (own worktree, branch named before commit).

## Turnover note
reference/handoffs/designer.md: header, a pitch row in §1, two traps in §5 (same commit as this report).

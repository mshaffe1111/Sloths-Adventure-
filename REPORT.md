# REPORT: PITCH-33A (fixed lens, 3-3 / 3-4 / 3-5). Written 6:34 PM ET 11-19 by `date`. Branch t-pitch-33a from origin/main 6e7b85f8f.
**EXACT NEXT STEP (lead):** compare with PITCH-33B per level (pitch.md step 5); rule Pushback 2 (one ENG-NOISE foundation) before
ENG-LURE / ENG-VINE packets go out.
## Done-items
1. One page per level in reference/design/pitches/PITCH-33A.md: one idea, 3 tributes each (loved / taught / ours / not copied), 10 beats
   with "he feels", node string, Normal target pasted from DIFFICULTY.md:61-63, engine list (wired / not wired / 2 NEW with size + file),
   build-in-2-h prerequisites, how it differs: 3/3.
2. Node strings run through checkCode: `C33=... C34=... C35=... npx tsx reference/specs/sims/nodes3335.ts` -> all three "no errors", 14 tokens.
3. Engine claims checked on origin/main by git grep/git show (file:line in the pitch): dropTrap.ts, world3.ts, core.ts:320-336,
   castPlay.ts:159, heroNoise.ts, noise.ts:18-24, zones.ts:266, engine.ts:2234-2236/:2548, thornVine.ts. 3/3.
4. Sources: every tribute has a non-Wikipedia page opened (Game Developer, GamesRadar); [S] marked where the exact mechanic had none
   (Pitfall!'s crocodiles, DKC2 Toxic Tower, SMW Rip Van Fish, two "how it taught" lines). Shelf: each level 1 pre-1990, 1 lesser-known,
   at most 1 famous; A's Blocks 1-2 + one from anywhere per level.
5. Gates on this head: tsc 0, roadmapcheck PASS (after unshallow + fetching all branches), knowncheck PASS, generality PASS.
## The three ideas
- 3-3: ring a chime stone, the prowler comes to look, knock the loose stalactite down: noise CALLS a hunter (twist: be the bait).
- 3-4: the sleepy clouds RISE up the sinkhole: tuck into a nook and let each pass, or outclimb it (the breather; signature: the moon climb).
- 3-5: loud landings and punches wake the thorn vines: drop short, hang quiet, freeze if one wakes (twist: wake one yourself from afar).
## Polish check
No stills: a pitch is words; the designs that follow shoot beats 1/4/6/8/9 both ways (named per level in the pitch).
## Pushback
1. 3-4 carries no heart risk by design (the breather slot T[3] 3.5); its dial is the race margin, never thorns.
2. bell, punch and thrown noise have NO emitter in src/ (only heroNoise.ts defines them); ENG-LURE (3-3), ENG-VINE (3-5) and 3-9 all need
   them: build one ENG-NOISE foundation (S) first (D40), not twice.
3. Three tributes carry [S] on the mechanic itself: no allowed host had a page (hardcoregaming101 is in maintenance tonight).
## Suggestions (ready packets)
- **ENG-NOISE** (S, xhigh engine): bellNoise from a struck fixed thing and punchNoise from every punch into castPlay's hear loop
  (castPlay.ts:155-162). Toy: a W1 row with a sleeping kit animal: punch in reach wakes it, a bell draws a hearer; plant: emitter off -> RED.
  Files: castPlay.ts, castPlay.types.ts, a test. Done: generality clean; 1-x locks unchanged.
## Unresolved
- Nothing flown: every number in the beats is from code or 3-1/3-2's flights; DESIGN-33-35 flies the lure window (4.5 s look vs walk-in),
  the rise speed / nook spacing, and the vines' wake radius vs reach (level.md rule 24).
## Method update (pitch.md step 2)
- Add: "Research hosts tonight: hardcoregaming101.net answers a maintenance page; GamesRadar via WebFetch returns only the title, so curl
  the page and strip tags in your scratchpad. Search the 4 hosts first (WebSearch allowed_domains)." Saves the next pitcher the ~20 min it cost me.
- Add to the fast gates line: roadmapcheck needs an unshallowed clone with all branches fetched (`git fetch --unshallow`, then
  `git fetch origin '+refs/heads/*:refs/remotes/origin/*'`), or it FAILs on proofs that live on other branches.
## Lessons applied
D30 (times from date), D34 (file:line cites checked), D40 (foundation before packets: Pushback 2), D53 (fast gates before the push),
D58 (tribute research about what was loved), D85 (did not read t-pitch-33b), D66 (grepped what exists before sizing NEW).
## Turnover note
reference/handoffs/designer.md not touched by this task (a pitch writes only its pitch page); not rewritten.

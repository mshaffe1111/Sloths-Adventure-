# ENG-ROOT: gen2's roof-root lay (a root over walkable floor, Matt's B: a root's own creep speed 85 px/s), its glowworm patches, and the bot's 'creep under a watcher' (3-2 NEW 2, WORLD-3-PLAN D2; World 3 chain C; R-165.449, R-165.452)
CHECKED AGAINST MAIN (cdffdc627, the lead's audit 11-25, CI #84): item 1 MISSING: ROPE_SPEED is a constant (rope.ts:8), Rope has no speed (types.ts:497-511); the paws are paced by distance already (heroRope.ts:8, :44), so the cycle follows for free; READERS to switch: engine.ts:5674, predators/core.ts:90 (the leap-escape check), w3Sections.ts:238, protoStage.ts:4753, tests heroRope.test.ts, predatorWorld3.test.ts:26/176/219. Item 2 MISSING: the gen2 rope place needs `after` + `gap` (gen2/types.ts:313-318), laid between ledges (pipeline.ts:2811); glowworm lights exist only hand-built (protoStage.ts:1846-1897, engine.ts:9216-9229). Item 3 PARTIAL: no bot skill (firsttimer.ts:726); creeping unseen over an ocelot is proven at kit level (predatorWorld3.test.ts:46/145/195, sight.up 40 world3.ts:18). Size M.
Engine, Opus 5.5 xhigh. A FRESH member. **BUDGET 2.5 h across sessions; REPORT BY the time the lead names; HARD STOP start + 4 h.** Hand
over on the 28-minute clock with an EXACT NEXT STEP, pushed and ls-remote-confirmed first (D134). run_in_background for long runs (castBots
--json in lanes), NEVER a shell '&'; chattr-frozen worktrees (D115); no heredoc in a commit chain (D119); stamps from `date` (D128); no stage
id, seed or x in engine code; a landing runs the suite AND the CI tool line (D126).
MATT'S ANSWER (R-165.452, 11-25): 3-2's creep is B, 'slower and tense': 85 px/s on a flat root (today's rope creep is 120: ROPE_SPEED). Not the dip.
READ LEAN: `git show origin/t-design-31-32:reference/design/3-2.md` (the numbers table, NEW 2 ENG-ROOT at :56-58, the hand build it replaces :59-60, the
art reuse :61); the mock-up `git show origin/t-hang-spec:reference/qa-reports/HANG-SPEC/REPORT.md` (how (b) was put on him: the hand cycle slowed
to match; ROPE_SPEED's two timing readers w3Sections.ts:238 and predatorWorld3.test.ts's creep); rope.ts (:8 speed, :10 the hang 86 px under),
types.ts:485-499 (Rope; look 'vine' or unset), w1.ts:326 (ropes only over a gap today); ENG-DARK's REPORT (the light ring a patch is); ENG-PROWL
in main (sight.up, 'lit = seen'); level.md rules 21, 23, 24; LESSONS D125-D137.
BASE: t-eng-w3 at ENG-DARK's landing (the patches are lights in the dark brick; the ocelot's 'lit = seen' reads them).
1. A rope's OWN creep speed as data (Rope.speed; 120 when unset, so every shipped rope is unchanged: lockall proves it), the hand-over-hand cycle
   paced to it; the root's speed 85 (Normal and Easy alike unless the design's table says otherwise). ROPE_SPEED's timing readers take the rope's
   number.
2. gen2's roof-root lay: a rope over WALKABLE floor, no posts, ends in the rock, look 'root', height 190 Normal / 170 Easy (data), fixed glowworm
   patches on it (lights in the dark brick).
3. The bot skill 'creep under a watcher' (wait in the dark until the patch is clean, then creep at the root's speed).
4. Toys on a REAL World 3 row (a root over an ocelot's stretch): the bot creeps it unseen; plants: the skill removed -> leapt at (RED); the root
   laid over a gap only -> RED; the root's speed back to 120 -> the creep-timing verdict reads the change (RED).
5. Stills both ways of Pokey on the root over a prowler with a patch lit, each looked at as Matt would on a phone (the root reads as a root,
   his hands on it, the ocelot readable, the patch's ring visible); the art is World 1's painted vine rope re-looked per the design (:61) until
   ART-W3 batch 2's root lands: say so on the stills. lockall (no listed stage moves: every shipped rope still 120), tierBots 9/9, the suite +
   the CI tool line; land on t-eng-w3 (merge, no force); hash to the lead and what READY-32 can measure.
REPORT: reference/qa-reports/ENG-ROOT/REPORT.md on t-eng-root-wip. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.

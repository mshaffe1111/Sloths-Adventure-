# ENG-SPORE: spore puffs as a gen2 zone brick with their own light on a clock (3-1 NEW 2; World 3 chain B, after ENG-DARK; 3-1, 3-3; R-165.449)
Engine, Opus 5.5 xhigh. A FRESH member. **BUDGET 1.5 h across sessions; REPORT BY the time the lead names; HARD STOP start + 3 h.** Hand
over on the 28-minute clock with an EXACT NEXT STEP, pushed and ls-remote-confirmed first (D134). run_in_background for long runs (castBots
--json in lanes), NEVER a shell '&'; chattr-frozen worktrees (D115); no heredoc in a commit chain (D119); stamps from `date` (D128); no stage
id, seed or x in engine code; a landing runs the suite AND the CI tool line (D126).
READ LEAN: `git show origin/t-design-31-32:reference/design/3-1.md` (the numbers table row 'A drop on a puff's light' line 12; the Engine
section lines 43-51); zones.ts:265 spore() and :281 sporeRecipes; ENG-DARK's report (the light ring this lights); level.md rules 21, 23, 24;
LESSONS D125-D136.
BASE: t-eng-w3 at ENG-DARK's landing (the puff's glow is a light in the dark brick).
1. Spore puffs as a gen2 zone brick (zones.ts's recipe as data, not copied): cycle 6.4 s, warn 1.0, active 2.2 on 3-1 (the design's numbers).
2. The puff's light with a clock: it glows over warn + active (3.2 s) through the dark brick's light ring, using the ONE optional clock field
   on Zone.lights decided in reference/architecture/ADR-004-timed-lights.md (unset = today's light; darkGaps counts a clocked light only when its
   window covers DARK_AHEAD plus the drop's air time).
3. Toy on a REAL World 3 row (3-1's draft): a puff shelf 240 px down, the bot drops in the lit window (38-42% of the cycle, flown); plants:
   no warn -> the fairness verdict RED; the light off -> the bot waits forever (RED).
4. Stills both ways of a puff lighting a shelf below (the lead judges). lockall (any move traced), tierBots 9/9, the suite + the CI tool
   line; land on t-eng-w3 (merge, no force); hash to the lead and what READY-31 can now measure.
REPORT: reference/qa-reports/ENG-SPORE/REPORT.md on t-eng-spore-wip. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.

# ENG-VINE: the thorn vine as a kit sleeper, plus 3-5's deep sleep and its two verdicts (WORLD-3-PLAN F5 + 3-5 NEW 1; World 3 chain A, second; R-165.449)
CHECKED AGAINST MAIN (cdffdc627, the lead's audit 11-25, CI #84; the World 3 gen2 kit and ENG-DARK live on t-eng-w3, not main): item 1 PARTIAL: roster.ts:12 thornVine habit 'ambush' (cast :31); any cast noise wakes a kit sleeper (heroNoise.ts:97, core.ts:371-376); DROWSY tell core.ts:24; 'moving or off the ground = seen' stillness.ts:14; Easy tell x1.3 world3.ts:9; the HAND vine is thornVine.ts:15-78 (vinePhase :53 on clock.ts cycle3; engine.ts:9247; laid protoStage.ts:2499, w3Sections.ts:282) and hears only the puzzle kit's noises (engine.ts:9268). MISSING: a thornVine PredatorDef (WORLD3 = [OCELOT, JAGUAR], world3.ts:41), a `dozes` clock + re-sleep in core.ts (only the 'dozes' outcome, core.ts:353). Item 2 deep sleep MISSING. Item 3 both verdicts MISSING (inputs exist: Platform.quiet types.ts:323, landingNoise heroNoise.ts:44). Item 4 PARTIAL: noiseRow.test.ts:207/217 (toy row, kit ocelot). Art EXISTS: drawThornVine w3Art.ts:281 (sleep, stir, look, lash; engine.ts:7688). The job: the vine as a kit PredatorDef with dozes + re-sleep, deep, the two verdicts, the toys on a real row; the hand vine REPLACED (D40). Size M.
Engine, Opus 5.5 xhigh. A FRESH member. **BUDGET 2.5 h across sessions; REPORT BY the time the lead names; HARD STOP start + 4 h.** Hand
over on the 28-minute clock with an EXACT NEXT STEP, pushed and ls-remote-confirmed first (D134). run_in_background for long runs (castBots
--json in lanes), NEVER a shell '&'; chattr-frozen worktrees (D115); no heredoc in a commit chain (D119); stamps from `date` (D128); no stage
id, seed or x in engine code; a landing runs the suite AND the CI tool line (D126).
READ LEAN: `git show origin/t-design-33-35:reference/design/3-5.md` (the numbers table lines 10-20, 'The engine order' items 2-3, the
Pushback at line ~109); `git show origin/t-plan-w3:reference/plans/WORLD-3-PLAN.md` F5; thornVine.ts (vinePhase, inReach, vineSees),
world3.ts (the kit roster), roster.ts:12, engine.ts stepThornVines; level.md rules 21, 23, 24; LESSONS D125-D136.
BASE: t-eng-w3 at ENG-NOISE's landing (the noise seam this hears).
1. The thorn vine in the kit: `thornVine`, habit 'ambush', asleep until a heard noise; then stir 1.1 s (Easy x1.3), look 1.7 s with
   today's lash (reach 105, below 140, moving = seen, off the ground = seen), then asleep again; a light sleeper
   (`dozes: { sleep, stir, look }`) keeps today's clock between noises. thornVine.ts's rhythm becomes DATA, not a second engine.
2. 3-5's deep sleep: a light sleeper woken by a noise sleeps `deep` s after its look (Normal 2.5, Easy 4.0, flown), then its clock again.
3. The verdicts, named and planted: 'no root over a vine under 230 px' and 'no drop over 200 px onto stone within a sleeper's radius on a
   beat that teaches quiet' (Easy and Normal).
4. Toys on a REAL World 3 row: a hard landing in reach wakes it, a soft landing or a creep on a root does not (noise off -> RED); the
   twist's pair: woken, the walk passes (deep 0 -> the 0.5 s-late walk is LASHED: RED).
5. Stills both ways of a sleeping, stirring and lashing vine beside Pokey (the lead judges them; the art is the kit's). lockall (any move
   traced), tierBots 9/9, the suite + the CI tool line; land on t-eng-w3 (merge, no force); hash to the lead. ENG-LURE and 3-8's
   ENG-SLEEPER start on it.
REPORT: reference/qa-reports/ENG-VINE/REPORT.md on t-eng-vine-wip. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.

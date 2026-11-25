# METER-W3: the meter's bots and channels for World 3's pieces (dark, spore, ocelot, jaguar, shimmy, thorn vine, moon, lure) (WORLD-3-PLAN F6; R-165.449)
CHECKED AGAINST MAIN (cdffdc627, the lead's audit 11-25, CI #84): item 1 PARTIAL: meter-coverage.json has the six entries ALL NULL (zone:dark, zone:spore, creature:ocelot, creature:jaguar, beat:thorn vines, skill:shimmy); move:rope priced as a climb; moon, lure, chime ids appear only when those pieces land (coveragecheck.ts:8-10 reads the piece list from code). Price forms EXIST: windowBits score.ts:75, creatureBits :114, deadlineBits :624. Item 2 the gate EXISTS (coveragecheck.ts, the null-on-used fault + coveragecheck.test.ts:44) but sees only STAGE_TABLE + shippedWorlds (:107): give it World 3's DRAFT rows (t-eng-w3's DRAFT_TABLE). Item 3 EXISTS (shippedWorlds = [1]; nothing until 3-1 ships). Size M.
Engine, Opus 5.5 xhigh. A FRESH member. **BUDGET 2 h across sessions; REPORT BY the time the lead names; HARD STOP start + 3.5 h.** Hand
over on the 28-minute clock with an EXACT NEXT STEP, pushed and ls-remote-confirmed first (D134). run_in_background for long runs (castBots
--json in lanes), NEVER a shell '&'; chattr-frozen worktrees (D115); no heredoc in a commit chain (D119); stamps from `date` (D128); no stage
id, seed or x in engine code; a landing runs the suite AND the CI tool line (D126).
READ LEAN: `git show origin/t-plan-w3:reference/plans/WORLD-3-PLAN.md` (§1 'World facts': the meter covers none of World 3's pieces; F6);
reference/design/meter-coverage.json (bot null + channel null for zone:dark, zone:spore, creature:ocelot, creature:jaguar, beat:thorn vines,
skill:shimmy; shippedWorlds [1]); the METER-3 job's REPORT (how World 2's channels were added, about 70 min); each piece's REPORT on t-eng-w3 (its
flown numbers); the designs' meter asks (3-1 :14 'METER-W3 prices a blind rim', 3-3 :19 'a call as a timed window, log2(1 + period / the window)');
level.md rules 21, 23; LESSONS D125-D137.
BASE: t-eng-w3 at the latest landing that holds ENG-DARK, ENG-SPORE and ENG-PROWL (main); ENG-VINE, ENG-MOON and ENG-LURE as they land (add
each one's channel in the same job if it has landed; name the ones that have not).
1. For each World 3 piece in use: its meter-coverage.json entry (bot + channel), priced from the piece's FLOWN numbers (no guesses): the dark
   (a blind rim), the spore (a timed window), the ocelot/jaguar (seen/unseen windows), the shimmy (the creep), the thorn vine (stir/look), the
   moon (the open window), the lure (a call as a timed window).
2. The coverage gate GREEN on World 3's rows; planted: a null channel on a used piece -> RED.
3. shippedWorlds gains World 3 ONLY when its first stage ships; until then the gate checks the draft rows.
4. tierBots 9/9, the suite + the CI tool line; land on t-eng-w3 (merge, no force); hash to the lead and each piece's price in one table.
REPORT: reference/qa-reports/METER-W3/REPORT.md on t-meter-w3-wip. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.

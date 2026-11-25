# ENG-LURE: the chime stone, the spore patch as a lure post, the 'every call reaches its round' verdict, and 3-3's bot skills (3-3 NEW 1 + NEW 2; World 3 chain A, after ENG-VINE; R-165.449)
CHECKED AGAINST MAIN (cdffdc627, the lead's audit 11-25, CI #84): item 1 the chime stone EXISTS (gen2/soundLay.ts from a prop socket; SoundPost castPlay.types.ts:35; ring() castPlay.ts:279; a blow rings it once a swing engine.ts:4615-4621; blowNoise engine.ts:4497 sends no punchNoise when the stone rang; bell reach 680 noise.ts:24; proven noiseRow.test.ts:144/153): only a World 3 sound row + the 'chime' look are left. Item 2 PARTIAL: LurePost/stepLures lure.ts:16/38 ('after him' :31), lureLay.ts + lureFaults :75, DROWSY_MIN zones.ts:171, zoneEffect zones.ts:112; MISSING: the clock gate (castPlay never reads zones), OCELOT's `fears` + `beatenBy.lure` (world3.ts:17-28), and ways.ts:15 drops 'lure' unless the fear is in CASTS[3] or ALLIES[3] ('spore' is in neither, roster.ts:31/:55). Item 3 the 680 verdict MISSING (constant only). Item 4 both bot skills MISSING (SKILLS firsttimer.ts:726). The job: the clock gate, OCELOT data + the ways fix, the verdict, the two skills, the toys on a real row. Size M.
Engine, Opus 5.5 xhigh. A FRESH member. **BUDGET 2 h across sessions; REPORT BY the time the lead names; HARD STOP start + 3.5 h.** Hand
over on the 28-minute clock with an EXACT NEXT STEP, pushed and ls-remote-confirmed first (D134). run_in_background for long runs (castBots
--json in lanes), NEVER a shell '&'; chattr-frozen worktrees (D115); no heredoc in a commit chain (D119); stamps from `date` (D128); no stage
id, seed or x in engine code; a landing runs the suite AND the CI tool line (D126).
READ LEAN: `git show origin/t-design-33-35:reference/design/3-3.md` (the numbers, 'One ring per call' :45, the Engine section :51-62: this job
is NEW 1 and NEW 2 exactly); ENG-NOISE's REPORT (the seam: castPlay takes { way, x, y, r }); lure.ts (LurePost, the 'after him' rule),
core.ts:320-347 (hear, the lure rule; :344-346 a bell heard again resets the look), world3.ts (OCELOT); level.md rules 21, 23, 24; LESSONS D125-D137.
BASE: t-eng-w3 at ENG-VINE's landing (ENG-NOISE in; ENG-SPORE in for the patch's cloud).
1. The chime stone: a fixed struck thing (gen2 piece, look 'chime'); a punch on it sends ONLY its bellNoise (never his own punchNoise, which would
   call the prowler to HIM); one ring per call.
2. The patch as a LurePost with `fear: 'spore'` that works only while its zone's cloud is out over DROWSY_MIN for 0.3 s (lure.ts gains a clock
   gate; the 'after him' rule stays); OCELOT gets `fears: ['spore']`, `beatenBy.lure: { ends: 'chasedOff' }` (data: the yawn home).
3. The verdict 'every call beat's stone reaches its round (680) and its patch sits on the round', named, planted.
4. Bot skills (firsttimer.ts SKILLS): `ring-to-call` (ring when the round is in hearing; on a slow patch, by distance and glow) and
   `bait-and-climb` (drop loud past the patch on the glow, climb out, hold).
5. Toys on a REAL World 3 row: one stone, one 6.4/2.6 patch, one ocelot: rung, cleared; plants: the clock gate off -> taken with no cloud (RED);
   the stone silent -> never comes (RED); the skill removed -> the bot rings blind and the clear count misses (RED).
6. Stills both ways of the stone, the patch glowing and the ocelot yawning home beside Pokey (the lead judges). lockall (any move traced),
   tierBots 9/9, the suite + the CI tool line; land on t-eng-w3 (merge, no force); hash to the lead and what READY-33 can measure.
REPORT: reference/qa-reports/ENG-LURE/REPORT.md on t-eng-lure-wip. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.

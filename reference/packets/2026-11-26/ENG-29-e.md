# ENG-29-e: 2-9's three engine gaps found by BUILD-29 (rule 26): the twist's doubled drum (G1), the posted royal guard (G2), the barge's look (G3)
Engine, Opus 5.5 high (xhigh only if G2's goal-count change touches more than goals.ts + the HUD + the sealed exit). A FRESH member. **BUDGET
about 3 h across boxes; landed on t-eng-29 by about 10:30 PM ET or handed over cleanly at 11:30 PM ET.** Hand over on the 28-minute clock or at
300k with the EXACT NEXT STEP pushed and ls-remote-confirmed first (D134); a hand-over ends new work (D138); only the gates of the SAME frozen
candidate may finish past the box. NEVER a shell '&'; long runs with run_in_background AND timeout 7200000 (CI #85); no heredoc in a commit
chain (D119); stamps from `date` (D128); NEVER a force-push; no stage id, seed or x in engine code (generalitycheck); a wait for a ruling
times out at 20 minutes on your own reversible recommendation (CI #89).
WHY: BUILD-29 (session_01FhBbYJfBMkxGySiVVxdxoU) found that 2-9 cannot be laid as designed on t-eng-29 (098047713): its beat 6 twist, its
posted royal guard and its barge each need an engine piece; a level never builds its own pieces.
READ LEAN: BUILD-29's message (in its REPORT on t-build-29); `git show origin/t-design-29:reference/design/2-9.md` (the twist, beat 6; the
barge 384-390 px deck; the guard); reference/design/PICKS-29-32.md :50-62 (the lead's rulings on the posted guard); ENG-29's REPORT on t-eng-29
(the tempo and the drum: drumStep, conductor.drumTick, drum.ts drumHits(doubled)); the ART-W3 REPORT on t-art-w3 (the barge: w2-next#barge
cut, deck 386, whole 507; the lead's ruling: upright, the camera follows).
BASE: t-eng-29 = 098047713; work on t-eng-29-wip.
G1 THE TWIST: TempoSpec has no doubling span; engine.ts drumStep calls sound.drumTick(b, gameTime) with no 'doubled'; drum.ts drumHits(doubled)
   exists but nothing reaches it. Add ONE data field naming where the drum doubles (a section mark or x-span on the brief), the engine
   passing it on BOTH settings (the design: Easy's drum doubles too, its logs keep one a bar); a toy: every hit within a frame of the
   half-beat inside the span; RED with the field ignored.
G2 THE POSTED ROYAL GUARD: w2Cast lays only the plain turtle body (no 'royal'); the only royal spawn is the hand build's guard(), which
   BUILD-29 deletes; goals.ts goalCounts counts EVERY enemy, so a posted guard would break 'Chase off 5 snappers'. Add a cast row for a posted
   royal (patrol 0, facing the water, on a rest beat) and an enemy field that keeps it OUT of the goal count, read by goalCounts, the sealed
   exit and the HUD; journalMet's royal_guard met where it now stands; toys each way (the count with and without the field).
G3 THE BARGE'S LOOK: RiverRow.look is only 'raft'; add look 'barge' and its draw path (the art is taller than its collider: deck 386 of 507),
   the barge frame packed WITH its first draw site (the art-use gate), a still at 2x beside Pokey upright and sideways (the lead judges).
GATES once on the final candidate: tsc; the CI tool line; the suite in shards (KID_RUNS_59 is the release line's inherited red, R-165.473:
name it); lockall --check (no listed stage moves); tierBots 9/9; generalitycheck; drawcheck (the barge draws). Land on t-eng-29 (no
force); the hash and what BUILD-29 can now lay to the lead AND to BUILD-29.
REPORT reference/qa-reports/ENG-29/REPORT.md (a new section for ENG-29-e). Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock
times. Never a model name in a commit.

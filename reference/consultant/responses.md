# Responses to the consultant (OURS ONLY: the consultant never reads this file)

| Date | Finding | Adopted / declined / later | Reason (one line) |
|---|---|---|---|
| 11-07 | 1. Escalating help after about 5 failures, and an Easy that handles rises | ADOPTED | Matches the child tester's run; reference/research/STUCK-PLAYERS.md layers 2-3; first in the 1-1 fixes |
| 11-07 | 2. The builder's reach model doesn't match the 30 fps game (jump +10 px, bounce +14 px, distance 20-50 px short); re-lay the lessons | ADOPTED, verify first | engine-core re-measures reach in the real engine against the consultant's sim.py; if confirmed, it's the root cause of the double-teach and bounce troubles |
| 11-07 | 3. Fix the telemetry first ("2 double jumps per run" etc.) | PARTLY | The `move` moment logs only the FIRST use of a move per stage by design (playRecorder movesSeen), so that count isn't broken. The section-time oddities (leap-stones 5 s over 4,000 px, End 0 s) are real and get checked. |
| 11-07 | 4. Treetop deaths: make lethal drops look different, and the builder must count them | ADOPTED | Matches the lead's data (21 lives, all treetops) |
| 11-07 | 5. A clean double-jump lesson and a "second jump ready" cue | ADOPTED | |
| 11-07 | 6. Petal rules and safe bough rests | ADOPTED | Matt found the same (petals per setting on each arc) |
| 11-07 | 7. No punch with nothing to hit | ADOPTED, measure first | Find out whether those taps were misread jumps |
| 11-07 | 8. A proper first-timer test (10+ players, 3+ children) | ADOPTED | Matt is recruiting |
| 11-07 | 9. A curated first 1-1 (Super Mario Run's fixed first course) | LATER, Matt's call | Conflicts with "every run is different"; taste and direction |
| 11-07 | 10. Measure finger hold times before changing touch jump height | ADOPTED | |
| 11-07 | Process: the consultant used a paid cloud browser (TinyFish, under 1 cent) and a page reader that made a tester code (one tester's code) | NOTED | Next brief: no paid services without asking; reading the live page is fine, starting a session isn't |

# TRIAGE-MATT: are the 43 open Matt-reported rows still true? (R-165.219, R-165.220). Opus 5.5 medium (docs). Written 9:27 PM ET by the lead.
Matt 9:18 PM: "Those are roadmap items that were probably even before we started rebuilding this... see if they're even relevant anymore."
Matt 9:26 PM: a polish lane works on 1-1 and 1-4 while 1-6..1-8's engine is built, using "the list... what's applicable".
Branch t-triage from origin/ccr-ea739a2f-dfcee4. Read only (no game code). For every ROADMAP row whose text says REPORTED BY MATT (or reported
by Matt) and whose status is not done (43 today): check it against today's code and stages (origin/t-int-6 = what 0.9.8 ships; World 1
is now gen2: 1-1..1-5; old builders still lay 1-6..1-9 and Worlds 2-10). Sort each into:
- STILL TRUE (cite today's file:line or a pasted run), and tag the stage(s) it touches;
- FIXED (name the commit/PR that fixed it, verified in code);
- MOOT (the thing it was about was replaced: name what replaced it).
Output reference/qa-reports/TRIAGE-MATT/TRIAGE.md: one table row each (R-id, verdict, evidence, stages), then a short ranked list of the
STILL TRUE rows that touch 1-1 or 1-4 (the polish lane's input), most player-visible first. Do NOT edit ROADMAP.md (the lead applies the
verdicts). BOX: 60 minutes or 40% context. Message the lead (session_01FhBbYNzGRJBDMzn6XbtQK2) the counts and the 1-1/1-4 list, context %, stop.

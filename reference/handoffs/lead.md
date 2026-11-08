# Turnover note: the lead (PM). Rewritten, never appended. Last rewrite: 2026-11-07 8:44 PM ET, lead session_01FhBbYN2DDsktc7BGtNxPFK

Matt, 11-07: "Also make sure you keep updated turnover notes. We all need this." This note is for a replacement lead, or for me after
a memory compression. If it's older than the last decision in STATE.md, rewrite it before anything else.

## The handover (Matt, 11-07: "we start rolling everything over tonight... come Wednesday morning, it's a startup from fresh")
- **When:** tonight, Saturday 11-07 (ET), as soon as Matt merges the studio PR (R-165.56). Branch to start on: main once it has merged;
  if it hasn't, `studio`.
- **Tonight is preparation only.** Do the incoming lead's steps (roles/PM.md §8), in this order: your session id on this note's top
  line; read (with STATE.md); **your first message to the story keeper**; the five questions; take stock of the team (PM.md §9);
  your cold review; only then factual questions to the backup lead; a one-off scheduled task, and a note to Matt.
- **The team:** quiet until the weekly reset, Wednesday 11-11, 2:00 AM ET (Matt's 11-06 pause). No member is running now; no Agent
  task is in flight; nothing is half done (the old helpers all stopped and wrote handoffs, reference/handoffs/).
- **Wednesday 11-11, in order:** the data analyst's report on the play window (testers play until Tuesday 11-10), the consultant
  (Agent, max), then STATE.md's open graph. Arm your own scheduled task for it.

## The backup lead
session_01FhBbYN2DDsktc7BGtNxPFK (lead num 1), the backup until the next rotation (roles/PM.md §8 "The backup lead"). Ask it only
what the documents don't answer, by send_message, and only after your cold review is saved: facts ("where is", "what was"), never
"why" a strategy was chosen. Write every answer into the documents the same day. When you hand over, put
your own session id here and say that lead num 1 has retired.

## Start here (10 minutes, in order)
1. `TZ=America/New_York date`. Read this note, then reference/roles/PM.md (the lead's manual: Matt do/don't, running the team, the
   release, the tools, rotation), PARTNER.md, LEADER-STANDARD-WORK.md, LAWS.md, LESSONS.md, TEAM.md, STATE.md.
2. ReadNotifications until 0 remain; list_sessions (who's running); list_triggers (is my check-in armed while anyone works?).
3. `git fetch` each branch named in STATE.md; compare with the ledger.
4. The newest outside review: reference/consultant/ (the full 11-07 review is on the lead branch ccr-23292c36-550qmt only, because it
   quotes tester data). The data: tools/playtesters/report.py on the testers' sheet.
5. Matt, 11-07, to the story keeper (relayed by it the same evening): "I'm creating a new lead and will be continually replacing as
   memory fills up. The only written role is you are always on the team and can't be replaced, in charge of story direction." It leads story direction; you never overrule it on story.
   **The story keeper is permanent and integrated every time** (Matt, 11-07; roles/PM.md §4 item 0): your first message goes to it
   (session_019iachLiuwNTAZUBSJWUmR3), and every story, dialogue, player-text or taste call goes through it before you decide.
6. Only then act. Don't message Matt before steps 1-5 (one exception: asking him which branch holds the team's documents, if this note
   wasn't in your checkout).

## Who Matt is to the lead
- Creative Director and the only person who merges. He talks only to the lead. Standing permission (11-07): "This is now your team
  fully and have my permission to run it as needed." What still needs him: TEAM.md rule 10.
- Rule one (11-05): never compromise to please him. Be the expert, push back with evidence, change view only on evidence.
- He wants the lead firm and in control (11-06): "when it's off the table, just say it's off the table."
- One multiple-choice question at a time, plain words, ET times, no apologies. Ask only what is truly his to decide.

## Where things stand (11-07 evening)
- Live: main 11242520 = 0.9.5 (gen2 1-1, 138 proven layouts, the survey fix). APK v0.9.5-33 and later on Releases. Test link EnK5
  = the same build (v242). Testers play the live site + `?fresh=1#ctest` until Tuesday 11-10.
- The team: the 6-role model (TEAM.md). Onboarding (Matt, 11-07: "define them well... the knowledge out of the gate"): a card per role
  in reference/roles/ with its knowledge pack, the shared rules and the shared-files table in roles/README.md, and every role's
  turnover note in reference/handoffs/. The pack went through the Critic: REJECT twice (25 items, then 5), fixed each time. All old
  helpers are stopped; only the story keeper stays.
- Matt talks only to the lead; members push back (PUSHBACK.md, answered before more work) and suggest beyond their files as packets.
- Branch `studio` holds the clean documents (cut from main; no src changes). Matt chose 11-07: studio goes to main by a PR before the
  handover (R-165.56).
- Quiet until the reset (Matt's 11-06 pause; Monday's kickoff was moved to the new lead). Wednesday 11-11, in order: the data
  analyst's report on the play window (it ends Tuesday 11-10), then a consultant run (Agent, effort max), then the open graph in
  STATE.md: Designer (reach from the 30 fps sim, proven in the engine), Architect (verdict
  schema, 8 ms budget), Content (re-lay 1-1 lessons, Easy log chain, new art, the near strip), Engine (pipeline, escalating help,
  WebGL stage 0), Critic (traversal, bots, two new gates).

## Promises and asks still open
- Privacy: Matt ruled 11-07 the four persona files keep their first names (he checked with them); everything else is roles only.
  Studio's history was squashed so a tester code is gone from it (an old SHA may stay
  reachable on GitHub until it's cleaned up).
- Matt to delete branches consultant-pack-2026-11-07 and consultant-review-2026-11-07 on GitHub (my machine can't delete).
- When testing ends: delete the recordings (the testers' page promises it) and the lead branch history that holds tester names.
- Matt's decisions waiting: a fixed first 1-1 or random; lethal pits in a first stage; the "can it float?" ratings; 10 open story
  threads from the story keeper.
- Player bots: an expert, a middle player and a child, built from the profiles after several plays each, to measure the learning curve.

## The links
- Live: https://mshaffe1111.github.io/Sloths-Adventure-/ . Testers: https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest
- Matt's test link: https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb (does NOT record to the sheet).
- APKs: https://github.com/mshaffe1111/Sloths-Adventure-/releases . Matt's handoff doc: https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa
- How to ship: reference/methods/release.md (two test links, no PR before every gate is green, the after-merge checks).

## Traps that bit this lead (CONTINUOUS-IMPROVEMENT.md D28-D32; the full list: roles/PM.md)
- The testers' link is the live site + #ctest, not EnK5. No PR until every gate is green. Run a new gate the way CI does
  (`CI=1 FORCE_COLOR=1`). create_session has no effort setting: use the Agent tool's effort. Times from `date`, never typed.
- Tester names, codes and survey text never go into the repo. No hook enforces it: grep your diff before every commit.
- Commands in a document are proven against the tool before anyone uses them (D32).

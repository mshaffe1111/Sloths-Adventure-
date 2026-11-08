# Turnover note: the lead (PM). Rewritten, never appended. CURRENT LEAD: session_01FhBbYMoqqEdVR3qFjTCugy (route blockers here). Last rewrite: 2026-11-07 9:56 PM ET

Matt, 11-07: "Also make sure you keep updated turnover notes. We all need this." This note is for a replacement lead, or for me after
a memory compression. If it's older than the last decision in STATE.md, rewrite it before anything else.

## The handover (done 11-07 evening)
- The last lead's team documents merged (PR #67, #68). Start on main. I took over at 9:43 PM ET Saturday 11-07; steps 1-7 of
  roles/PM.md §8 are done (the story keeper first, its health check PASS, the cold review and its Critic REJECT answered).
- **Matt, 11-07, about 9:54 PM ET (three things):**
  1. Design calls are the lead's: "You're the expert in making video games. Things like how the first level should be executed... That's
     why I hired you." I decided R-165.52 (first-ever 1-1 run fixed, replays roll), R-165.53 (no lethal drops in 1-1) and R-165.65
     (PERFORMANCE-RULES §1 stays 12 ms; 8 ms is the WebGL target). Story stays with the story keeper; art taste he rates (R-165.54).
  2. Tester data: delete only the data from before 0.9.5; the newer data stays for fixes and QA bots until testing is done; then he
     deletes everything (R-165.59).
  3. "Start building your team... bring in experts... so that on Wednesday, when we start and my tokens reset, we don't walk out of the
     starting gate. We sprint." (R-165.66: expert personas sharpened and Wednesday's packets written and Critic-checked before Wednesday.)
- **Quiet until the weekly reset, Wednesday 11-11, 2:00 AM ET** for building work. My scheduled task fires at 2:05 AM ET Wednesday
  (trig_018T4m55rQ1cTxAbGtXyKwLX) with the order in STATE.md "Open graph".

## The backup lead
session_01FhBbYN2DDsktc7BGtNxPFK (the previous lead), questions only, until the next rotation. Asked 3 facts on 11-07 (where the tester
recordings live; the HF balance and anything outstanding; whether three old sessions' "needs action" asks were answered). Write every
answer into the documents the same day.

## Start here (10 minutes, in order)
1. `TZ=America/New_York date`. Read this note, then reference/roles/PM.md, PARTNER.md, LEADER-STANDARD-WORK.md, LAWS.md, LESSONS.md,
   TEAM.md, STATE.md, and the newest consultant review (the 11-07 one is on ccr-23292c36-550qmt only until its redacted copy reaches
   main, R-165.59).
2. ReadNotifications until 0 remain; list_sessions; list_triggers (is a check-in armed while anyone works?).
3. `git fetch` each branch STATE.md names; compare with the ledger.
4. The story keeper (session_019iachLiuwNTAZUBSJWUmR3) is permanent and in charge of story direction: every story, dialogue, Dot,
   player-text or taste call goes to it first. Its bible: reference/story/STORY-KEEPER.md (current copy on ccr-0d59a91c-oy3imz, §8
   "Turnover"; read only, never build from that branch).
5. Only then act.

## Who Matt is to the lead
- Creative Director and the only person who merges. He talks only to the lead. Standing permission (11-07) to run the team, and (11-07
  evening) design and technical calls are the lead's. What still needs him: merges and releases, HF spending and picture lists, art he
  rates, story calls (through the story keeper), changes to his rules and laws.
- Rule one (11-05): never compromise to please him. Be the expert, push back with evidence, change view only on evidence.
- Firm (11-06): when a call is yours, decide it in one line; "off the table" holds unless he brings new evidence.
- One multiple-choice question at a time, your pick first; plain words, ET times from `date`, no apologies.

## Where things stand
- Live: 0.9.5 (game code 11242520; main head 181d2846 is docs and tools only). APK v0.9.5-33+ on Releases. EnK5 = the same build.
  Testers play the live site + `?fresh=1#ctest` until Tuesday 11-10.
- The open graph, in order (details and R-ids: STATE.md): analyst, packer and consultant on the window; the Designer's reach spec
  (R-165.60); the Architect's verdict schema and file lists (R-165.61); Content re-lays 1-1 (no lethal drops; the fixed first run; the
  bounce card at the first mushroom); Engine: the recorder fix (R-165.58), escalating help (R-165.62), the pipeline, WebGL stage 0 (R-3.1);
  the Critic: traversal with the real reach, the bots, two new gates (R-165.63, R-165.64).
- My first cold review was REJECTED by a Critic (15 items, D34): two of my plan changes were withdrawn (the consultant stays after
  every window; WebGL stays). The corrected review: reference/notes/lead-review-2026-11-07.md.

## Promises and asks still open
- R-165.59 (Matt, 11-07): pre-0.9.5 tester data deleted after the analyst's aggregates; newer data kept until testing ends, then Matt
  deletes everything; the named branch history goes after the 11-07 review's redacted copy reaches main.
- Matt to delete branches consultant-pack-2026-11-07 and consultant-review-2026-11-07 on GitHub (still there 11-07; my machine can't).
- Matt's queue (one at a time): the story keeper's #10 skulls, #2 the two food lines, #1 Meeca's parents; then R-165.54 the float ratings.
- R-165.57 pad coach lines: the story keeper's words approved on a condition (a tapped double clears the 195-205 px teach gap in the
  real engine), carried in the Engine/Critic packet.
- Old helper sessions still showing "needs action" (art-1-1-sunrise's HF "go", render-stone, Ex Tester Data 1): nobody answers them.

## The links
- Live: https://mshaffe1111.github.io/Sloths-Adventure-/ . Testers: https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest
- Matt's test link: https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb (his alone; doesn't record).
- APKs: https://github.com/mshaffe1111/Sloths-Adventure-/releases . Matt's handoff doc: https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa
- How to ship: reference/methods/release.md.

## Traps (CONTINUOUS-IMPROVEMENT.md D28-D34; the full list: roles/PM.md)
- Every fact in a lead document cites file:line, checked when written; before changing the plan, grep the rules that govern it (D34).
- The testers' link is the live site + #ctest, not EnK5. No PR until every gate is green. New gates run as CI does (`CI=1 FORCE_COLOR=1`).
  create_session has no effort setting: use the Agent tool. Times from `date`, never typed.
- Consultant finding numbers: use responses.md's (Top-10) numbering; the review's headings number differently.
- Tester names, codes and survey text never go into the repo or a packet. Grep your diff before every commit.
- "Morning brief" and "Heartbeat" in list_triggers are Matt's own, not the team's: leave them.

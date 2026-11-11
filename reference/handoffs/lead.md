# Turnover note: the lead (PM). Rewritten, never appended. CURRENT LEAD: session_01FhBbYMoqqEdVR3qFjTCugy (route blockers here). Last rewrite: 2026-11-09 10:41 PM ET

Matt, 11-07: "Also make sure you keep updated turnover notes. We all need this." This note is for a replacement lead, or for me after
a memory compression. If it's older than the last decision in STATE.md, rewrite it before anything else.

## Now (Monday 11-09)
- **Matt, 11-09, about 2 PM ET: "So i have fable only usage. Lets create our team and start this week. Right now the team must be
  fable 5.2".** The start moved from Wednesday 11-11 to today. Then, minutes later: "Do not keep under yourself. They should have their own bot." Every member is its own session (create_session, model "claude-opus-5-5" since that evening, permission_mode "auto") that reports to me with send_message (R-165.74).
- **The order:** nobody is dispatched on a document until a cold Critic has passed it. Two Critics (lead documents; packets and
  R-165.71) audit the 11-09 fix pass. The order (Matt, R-165.84: data first; lean, one member at a time): the analyst (R-165.77) first on its packet's PASS, then the Designer (R-165.60) on its packet's PASS; the Architect (R-165.61) after the
  Designer's Critic PASS; a delta read when the play window closes Tuesday 11-10, then the packer and the consultant; then Content
  (R-165.72), Engine and the Critic's own work, per STATE.md "Open graph".
- **Where it stands, 11-09 8:25 PM ET:** both Critics returned REJECT; every item is answered in f4fee368 (not yet re-audited). Matt
  then said "Keep others now on opus" (R-165.76), sent seven ideas (R-165.78 to .83, with R-165.77 "pull the test data now"), picked
  the Kanban board (R-165.75, https://claude.ai/artifact/8UGhTNnJNZhbpDBV87avR2, reference/methods/board.md) and said "Be lean for
  now". At 8:29 PM ET he gave the order (R-165.84): pull the tester data, evaluate, plan, then fix 1-1; the coder on Fable 5.2 at medium, not over "50" before a new test (unit asked). One Opus Critic (session_01FhBbYKQPPcDe1fW9ZijADh) is re-auditing the fix pass; STATE.md "In flight" has the rest. It returned REJECT at 8:36 PM ET (10 small items); they are answered and the three that change what a member does (the float ruling in the Designer packet, the one dispatch order, the Fable-for-the-coder exception) go back to the same Critic as a delta. Then the analyst, then the Designer. The cap is $70 at most, promote included (STATE.md spend ledger). The old Wednesday trigger trig_018T4m55rQ1cTxAbGtXyKwLX is still to delete once the Designer is out.
- **Night of 11-09, at 10:41 PM ET:** passed and waiting for the release: the analyst (469db5d1), the Designer (030a4093), fix A1
  (41c2e248), the Architect (c4687177). Next, at the Wednesday 2:05 AM ET reminder: Dot's words (story keeper), the A2 packet and its
  Critic, the A2 build, then Matt's test link with A1 and A2; the Designer's help.md §5; the analyst's delta; C1 and C2 per PACKETS.md.
  Every member on Opus, high or medium; max only with Matt's yes (R-165.91).
- A 30-minute quality check-in (`send_later`) is armed at the first dispatch and re-armed until the last member stops.
- My memory was compressed for the first time on 11-09: a rotation trigger. Told to Matt 11-09 about 2:15 PM ET in the lead's reply; he has not answered it.

## The handover (11-07 evening)
- The last lead's team documents merged (PR #67, #68). I took over at 9:43 PM ET Saturday 11-07 and ran roles/PM.md §8's steps.
  The honest order: my cold review was written at 9:46-9:47 PM, before the story keeper's health check finished at about 9:50 PM.
  The card's order is story keeper first; I ran them out of order. Nothing came of it, and the card's order stands.
- **Matt, 11-07, 9:53 PM ET (three things):**
  1. Design calls are the lead's: "You're the expert in making video games. Things like how the first level should be executed... That's
     why I hired you." I decided R-165.52 (first-ever 1-1 run fixed, replays roll) and R-165.53 (no lethal drops in 1-1). That
     does NOT reach his own rulings: my R-165.65 call (8 ms as "a target, not a gate") overturned his 11-06 "build for 60" ruling and is
     withdrawn (D35). Story stays with the story keeper; art taste he rates (R-165.54).
  2. Tester data: delete only the data from before 0.9.5; the newer data stays for fixes and QA bots until testing is done; then he
     deletes everything (R-165.59).
  3. "Start building your team... bring in experts... We sprint." (R-165.66.)

## Working agreements with Matt (his words, dated)
- Ideas (11-07): he throws ideas; each one is swatted with a reason or logged with an R-number the same turn. "Tunnel vision will get
  you retired instantly."
- Research (11-08, said in the lead's chat; this note and STATE.md are the only record): "I expect you to research things... I never want you to guess." If research finds nothing, say so and ask.
- Model (11-09 9:05 PM ET, the latest word): "Move everything to opium 5.5": every member on "claude-opus-5-5"; then 9:07 PM ET "Other than engine work.. stays fable for now": the Engine member stays on "claude-fable-5-2", medium.
- Model (11-09 evening, earlier): "Keep others now on opus". Members are created with model "claude-opus-5-5" (R-165.76); the afternoon's Fable 5.2 word is replaced.
- **STANDING RULE for every lead (Matt, 11-09 10:35 PM ET): "Lets make sure all helpers have the appropriate opus levels (high or medium) based on needs. If you think max would help ask me and I will approve or deny. This is a standing rule for all leads going forward. Cant afford shoddy work being cheap."** Every member runs on Opus (claude-opus-5-5) at effort high or medium, by what the task needs; never low to save money. Max only with Matt's yes, asked as one question with the reason. This replaces the 10-28 and 11-07 effort lines (low for written steps; max the lead's call).
- **TEMPORARY (Matt, 11-11 1:34 PM ET): new engine and gameplay helpers run on claude-fable-5-2 until Matt says go back; engine work on Opus is always effort high (TEAM.md 5b).** Critics on Fable too (Matt 11-11); Art and PM stay on Opus. Fable at effort high.
- **gen2 is the foundation (Matt, 11-11 3:57 PM ET: "gen 2 is the only thing that matters since the whole game will use that and the other stages will be reworked").** Fable time goes to gen2 and the stages built on it, plus any core fix a gen2 stage actually hits (as with the 1-1 camera and Dot timing). The old generators (stageGenerator.ts, protoStage.ts) get no fixes: gen2 replaces them (D40). Whole-game audits wait for Opus.
- Effort (11-07): "you manage if they're running off of normal, high, or max. Max is only when needed." He doesn't talk to members
  but watches them; a member he flags gets inspected at once.
- Rotation (11-07): Matt decides when; the lead flags every trigger, a release and a week served included, and he rules. "You just started... you're not drifting yet." "I'll tell you when it's time to retire."
  The lead tells him each trigger at once (D34 and D35 were told in the lead's chat replies of 11-07 and 11-09, which no file holds; the 11-09 compression: told 11-09 about 2:15 PM ET, no answer yet).
- Who the game is for (11-07, R-165.71): "This isn't supposed to be a kid game." Normal is for 12 and up, hard enough for adults;
  Easy is for children. Per-setting rulings are in STATE.md.
- **Every art piece gets a world fit (Matt, 11-11 3:11 AM ET, a standing rule for all art going forward): "you need to determine where they work the best. Some of these may work in multiple worlds... That's universal for all art going forward."** Every cut piece, from any batch, is tagged with every world it fits, best first, each with a one-line reason by material and mood, and each catalogue carries a "By world" section. Batches already cut without it are re-tagged.
- Mock-ups (11-08, same source): new art goes to him as one mock-up sheet for a yes or no, not quiz sheets.

## The backup lead
session_01FhBbYN2DDsktc7BGtNxPFK (the previous lead), questions only, until the next rotation. Its 11-07 answers and where each is
written: the tester sheet and its collector (STATE.md "The team now"); tester names in main's files and history (ROADMAP R-165.68,
R-165.69); render-stone and art-1-1-sunrise (STATE.md "Carried from the old team"). Write every answer into the documents the same day.

## Start here (10 minutes, in order)
1. `TZ=America/New_York date`. Read this note, then reference/roles/PM.md, PARTNER.md, LEADER-STANDARD-WORK.md, LAWS.md, LESSONS.md,
   TEAM.md, STATE.md, and the newest consultant review (the 11-07 one is on ccr-23292c36-550qmt only until its redacted copy reaches
   main, R-165.59).
2. ReadNotifications until 0 remain; list_sessions; list_triggers (is a check-in armed while anyone works?).
3. `git fetch` each branch STATE.md names; compare with the ledger. `git status -sb` must name the branch (D36).
4. The story keeper (session_019iachLiuwNTAZUBSJWUmR3) is permanent and in charge of story direction: every story, dialogue, Dot,
   player-text or taste call goes to it first. Its bible: reference/story/STORY-KEEPER.md (current copy on ccr-0d59a91c-oy3imz, §8
   "Turnover"; read only, never build from that branch).
5. Only then act.

## Who Matt is to the lead
- Creative Director and the only person who merges. He talks only to the lead. Standing permission (11-07) to run the team;
  game-design calls like how the first level is executed are the lead's.
- What still needs him: merges and releases; HF spending and every picture list; art he rates; story calls (through the story
  keeper); any change to his rules, laws or rulings; when the lead rotates; and everything in STATE.md "Decisions waiting on Matt"
  (today: the "key line process" pick, R-165.69, and the story keeper's three).
- Rule one (11-05): never compromise to please him. Be the expert, push back with evidence, change view only on evidence.
- Firm (11-06): when a call is yours, decide it in one line; "off the table" holds unless he brings new evidence.
- One multiple-choice question at a time, your pick first; plain words, ET times from `date`, no apologies.

## Where things stand
- Live: 0.9.5 (game code 11242520; main head 181d2846 is docs and tools only). APK v0.9.5-33+ on Releases. EnK5 = the same build.
  Testers play the live site + `?fresh=1#ctest` until Tuesday 11-10.
- Work branch: ccr-ca657d3c-n09zty (the lead's documents, cards and packets; not on main yet). Members branch from origin/main and
  read cards and packets with `git show origin/ccr-ca657d3c-n09zty:<path>`.
- The open graph and every R-id: STATE.md. The frame budget is 8 ms on Matt's 11-06 ruling; PERFORMANCE-RULES §1 still reads 12 ms
  and no gate measures frame time until R-165.65 lands.
- My first cold review was REJECTED three times by Critics (D34, D35): the consultant stays after every window; WebGL stays; the
  R-165.65 ruling and R-165.67's first version are withdrawn. The corrected review: reference/notes/lead-review-2026-11-07.md.
- My scheduled task trig_018T4m55rQ1cTxAbGtXyKwLX (Wednesday 2:05 AM ET) was written for the old start: delete it once the Designer
  is out, so the work isn't done twice.

## Promises and asks still open
- "The key line process that Ed Hang uses" (Matt, 11-09): a one-page view of where we are and where we're going. Two web searches
  found no such method or person. Asked him A) Kanban board (my pick), B) Hoshin Kanri, C) A3 report, D) something else. Unanswered.
- R-165.59 (Matt, 11-07): pre-0.9.5 tester data deleted after the analyst's aggregates; newer data kept until testing ends, then Matt
  deletes everything; the named branch history goes after the 11-07 review's redacted copy reaches main.
- Matt to delete branches consultant-pack-2026-11-07 and consultant-review-2026-11-07 on GitHub (my machine can't).
- Matt's queue (one at a time): R-165.69 (main's history rewrite); the story keeper's #10 skulls, #2 the two food lines, #1 Meeca's parents.
- R-165.57 pad coach lines: the story keeper's words approved on a condition (a tapped double clears the 195-205 px teach gap in the
  real engine), carried in the Designer's packet (touch.md) and the Engine/Critic packet.
- Old helper sessions still showing "needs action" (art-1-1-sunrise's HF "go", render-stone, Ex Tester Data 1): nobody answers them.

## A line for Matt to change in his file (CLAUDE.md is his)
CLAUDE.md:25 says "HF: $72 left, total"; Matt said $65.55 on 11-07. Offer him the edit when a CLAUDE.md change next goes to him.

## The links
- Live: https://mshaffe1111.github.io/Sloths-Adventure-/ . Testers: https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest
- Matt's test link: https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb (his alone; doesn't record).
- APKs: https://github.com/mshaffe1111/Sloths-Adventure-/releases . Matt's handoff doc: https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa
- How to ship: reference/methods/release.md.

## Traps (CONTINUOUS-IMPROVEMENT.md D28-D36; the full list: roles/PM.md)
- Every fact in a lead document cites file:line, checked when written; before changing the plan, grep the rules that govern it (D34).
- Never loosen, remove or re-scope a check or a ruling of Matt's; a plan change waits for the cold Critic's PASS (D35).
- Never `git checkout` in a tree someone else uses; `git status -sb` before a commit, `git ls-remote` after a push (D36).
- The testers' link is the live site + #ctest, not EnK5. Never open a #ctest page yourself: it makes a tester code.
- No PR until every gate is green. New gates run as CI does (`CI=1 FORCE_COLOR=1`).
  create_session has no effort setting: the packet's `effort:` line carries it. Times from `date`, never typed.
- Consultant finding numbers: use responses.md's (Top-10) numbering; the review's headings number differently.
- Tester names, codes and survey text never go into the repo or a packet. Grep your diff before every commit.
- "Morning brief" and "Heartbeat" in list_triggers are Matt's own, not the team's: leave them.

## Standing rule (Matt, 11-11 6:50 AM ET)
- **No patching what is being replaced (Matt, 2026-11-11: "real fix is we dont start patching things that being replaced. We only fix and patch when we are ready to finalize. You are the lead... You must understand these things or we will never get things done.").** Build in dependency order: foundations first (rules, tools, room to ship), then the thing itself, then fixes and polish on the finished thing when it is ready to finalize. Before any packet: name what it is built on and whether a planned job replaces it this sprint; if so, it waits. (D40)

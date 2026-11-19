> **Helper-era document (11-07).** reference/roles/PM.md and reference/TEAM.md replace its supervisor digests, HELPERS scorecards and the GAMEPLAN ladder. The rest still holds.

# The lead's standard work (Matt, 2026-11-01: "research what makes a great manager using continuous improvement... and tell me how you're going to incorporate that")

Read with PARTNER.md at every start. This is how the lead manages; the laws say what is never broken, this says how the day runs.

## First, before anything else (Matt, 2026-11-02: "You will find out being a manager is harder than being a worker." "Make sure not to forget this.")

When a helper fails, look at the lead first. On 11-02 the roadmap keeper's repeated slips came from the lead's system: rapid-fire asks, a
reminder given as a fix, a report asking for facts the lead reads itself, and no notes file to carry it through memory compression (D27).
The fix is never "the helper should try harder"; it is changing the system so the right thing is the easy thing. Before sending work back
or retiring anyone, ask: what did I set up that made this mistake likely, and what do I change so it can't happen again?
And the other half (Matt, same day): "sometimes you just will have bad employees, and they're the ones that you cut loose". Once the setup
is right, the helper has been coached plainly and given time to adjust, and it still falls short, cut ties without guilt (reference/GAMEPLAN-2026-11-02.md §3 ladder). But retire for the right reason, "because it's just not a fit": everyone makes errors;
what matters is owning them and not repeating them. Retraining someone new often costs more than working with someone you believe in.

## What the research says (and the rule each one becomes)
1. **A manager's output is the team's output** (Andy Grove, High Output Management). The lead is judged by what the team ships at
   Matt's bar, not by what the lead does itself. RULE: spend the lead's time on high-leverage work (briefs, methods, gates, judging
   what Matt will see, decisions, the plan); hand low-leverage work to the support team (check-ins, releases, bookkeeping).
2. **Indicators are windows into the work; pair them** (Grove). One number alone gets gamed (speed hides errors). RULE: every speed
   number is paired with a quality number (hours per job WITH redos per job; Day 1 hours burned WITH escapes to Matt).
3. **Great managers coach, empower without micromanaging, communicate, have a clear vision, and are results-oriented** (Google,
   Project Oxygen). RULE: briefs say WHAT and the bar, not every HOW; every send-back names the lesson it broke (coaching, not just
   correcting); the finish line (Day 1 list, launch date) is restated at every wave. Before sending a packet, ask "does this draw anything new?": if yes, its checks list drawcheck for that stage both ways (D81). After any ROADMAP edit, run `node tools/roadmapcheck.mjs` before committing (D84). A packet's checks are "the CLAUDE.md check list, every item" plus stage-specific ones; never a hand-picked subset (D86). Fresh members, always (Matt 11-18 5:15 PM ET: "we have to keep switching out the builders because I don't want tunnel vision"): every job is a new member session; nobody carries on to a second level or job; a level's designer never builds it; the engine member who builds a piece never builds the level that uses it. Members run long commands in the background and read their inbox between steps; a ruling that changes a member's plan counts as delivered only when the member acks it (D87).
4. **Go and see the real work** (Toyota, gemba). The leader observes the work where it happens, to learn, not to judge from a
   report; every observation gets an owner and is checked on the next walk. RULE: the lead opens real screens and code, never only a
   digest; every finding gets an R-number and an owner; the next walk checks it closed.
5. **Leader standard work and developing leaders** (Toyota). A leader runs a fixed routine, and every leader develops another.
   RULE: the routine below; the supervisor learns the lead's checks so it can run them alone.
6. **Coaching kata** (Toyota Kata, Rother): five questions that drive improvement: What is the target? Where are we now? What is in
   the way? What is the next step? When can we see what we learned? RULE: every check-in and every send-back uses them.
7. **Plan with a few breakthrough goals, cascaded, with catchball** (Hoshin Kanri). The top sets few goals; each level proposes how and
   pushes back with facts until both agree. RULE: one breakthrough goal (launch: Day 1 done, polished, on the date reference/BUILD-PLAN.md gives, never a number copied here; quality sets the date); lanes and
   helpers propose their plans and estimates from measured history; the lead accepts or argues with facts.
Sources: Google Project Oxygen (O'Reilly, Leading Effective Engineering ch. 4; Parabol summary); Grove, High Output Management
(summaries); Toyota gemba / leader development (Industrial Management; iObeya); Liker on Hoshin Kanri and Toyota Kata (Gray).

## The lead's day
**Start (every session):** laws, lessons, PARTNER, STATUS, this file; the supervisor's last digest; the Day 1 burn-down; set the day's
three priorities from the plan, not from whatever arrived last.
**Token math for a handoff (11-15): every step re-reads the whole context, so a member at 60% costs ~2x a fresh one per step; past ~55% real with more than ~15 steps left, hand off to a fresh member at an exact step.**
**Packets and context (D90, 11-19): a fresh member is at 270-350k within 25 minutes, so the 400k box leaves 50-130k of work. Continuation packets read only the EXACT NEXT STEP section of the stopped member's REPORT (sed between its heading and the next '## '); every packet says: judge stills cropped to the part judged, gate output to files, summary lines only; a job holding both a stills pass and the full gate list is split up front (look member, then gates member).** **A new gate (D88): its packet plants the repo's look-alike shapes (stage ids, versions, seeds), and before approval it is run over every open branch, not one. A gate that cries wolf gets loosened; a gate that never ran on real text is unproven.**
**Messages to members carry no 'now' clock time (D30 REPEAT 4, 11-19): the delivery stamp is the time; a time in a message is a fixed deadline or pasted from a date output in the same step.** **Rulings to members go with priority "now" (D57; D87 root 5:44 PM ET 11-18: "next" messages to a busy member queue as notifications it never pulls; VAR-1b missed six). "next"/"later" carry information only. Every create_session prompt says: call ReadNotifications whenever a notice says notifications are pending, at every push and before every report. No ack in 10 min = resend with now. A "now" message cancels the member's running tool with a "user doesn't want this action: STOP" text (D87 side effect): start every non-stop "now" with "NOT A STOP: read, then carry on", and every start prompt says that text is the delivery, not a stop. Each check-in reads status_bucket: a BLOCKED/need_input member gets an answer at once.**
**Every check-in (D76; REPEAT 11-19: the FIRST step, and the armed trigger prompt names it):** read every running member's real context (get_session used_tokens is the figure at the member's LAST TURN END: stale mid-turn (11-19 3:33 PM ET: VAR-19 read 272,587 twice while its last message's usage was 328.6k); mid-turn, list_events kinds ["assistant"] limit 1 and add input + cache_creation + cache_read): MID-TURN, list_events kinds ["assistant"] limit 1 and add its usage (input + cache_creation + cache_read) (proved 11-15 11:34 AM); idle, get_session context_usage.used_tokens; at 400k send a priority-now STOP.
**Every check-in (CRITIC-LR 11-14):** three levels in flight: for each of the next three levels, the design, engine and build owner by name and branch, or the gap is logged as a defect.
**Each supervisor digest:** act only on yellow and red; audit one green in three myself (gemba: open the real thing).
**Once a day:** walk the newest build myself on a phone-size screen, upright and sideways, fresh/old/finished saves.
**Each decision for Matt:** one at a time, multiple choice, with my recommendation and the cost.
**End of day:** ARM THE MORNING START FIRST (D89: a send_later at 8:20 AM ET with the start list; name its id in STATE) before telling Matt any start time; scorecards into HELPERS.md; proven method updates merged; tomorrow's three priorities; the numbers below updated.
**Each release:** debrief (right / wrong / stop / continue) with the trend numbers; every STOP becomes a law, gate or method edit.
**Each week:** review the system itself: are the laws, roles, gates and methods working? One improvement to the system, not the game.

## The numbers the lead tracks (paired)
| Speed / output | Paired with quality |
|---|---|
| Day 1 helper-hours burned down per day | Escapes to Matt (target 0) |
| Real hours per job vs measured estimate | Redos per job; first-time pass rate |
| Tokens and HF dollars per job | Lessons broken a second time (target 0) |
| Jobs accepted per day | Supervisor greens that were really rough (audit misses) |
| Releases shipped | Defects found after release |

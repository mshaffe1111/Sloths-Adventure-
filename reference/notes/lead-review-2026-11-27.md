# The new lead's cold review of the plan (session_01FhBbYMA2VnzJXGxeHFhKxi, 11-27; PM.md §8 step 6)

Written before talking to the backup lead. Every fact cites file:line or a command run today. No change here is acted on until a cold
Critic passes it (PM.md:241-246, D35). Changes to a rule or number Matt set are NOT made here; they go to Matt as one question.

## What the numbers say (read today, not from the hand-over)
- 3-1 has had about 56 engine and kit sessions and no build (STATE.md lane names: ENG-DARK a..aa, ENG-DOWNBOT a..k, ENG-CATCH a..f,
  ENG-SPORE a..c, KIT-W3a a..f, ENG-DEAL; lead-exam-2026-11-27.md Q2). 2-8 has 13 build boxes and about 19 engine-lane names; 2-9 has 12
  and 16. LEVEL-LOG.md's last row is 11-22 (LEVEL-LOG.md:181).
- A fresh member is at 270-350k real context within 25 minutes, so a 400k box leaves 50-130k of work (LEADER-STANDARD-WORK.md:51, D90).
  If that holds, most of every box is start-up reading, and each hand-over pays it again. Nobody has measured what fills it.
- The start reads every member is told to make are large: LESSONS.md 85 KB ("read in full once at the start of every task",
  LESSONS.md:1), CONTINUOUS-IMPROVEMENT.md 90 KB, STAGE-RULES.md 78 KB, dispatch-packet.md 22 KB, level.md 17 KB (wc -c today).
  roles/README.md:66-67 already says "read only what the task needs ... never read a file over 300 lines whole", which conflicts with
  LESSONS.md:1's "in full".

## What I would change (each is mine to decide unless marked MATT)
1. **Measure before anything else, including what fills a box.** The first member job (support, high, about 1 hour, no src/ change):
   LEVEL-LOG rows for 2-6, 2-7, 2-8, 2-9 and 3-1 so far (boxes, hours, cost from get_session usage.cost_usd), each level's hours split
   into building the level / pieces found mid-build / merging and re-gating / tracing reds / waiting on the lead / start-up reading; and
   for three recent boxes, what their first 25 minutes read (list_events) and how many tokens it cost. The retro asked for the first part
   (lead-retro:133-139); the start-up part is new and tests D90's number.
2. **Pieces before levels, enforced, and one World 3 chain at a time.** KIT-W3a-f and KIT-W3b-c both write w3.ts; the knowledge pack says
   parallel lanes only where they share no files (lead-knowledge.md:17, :61). So World 3's kit work runs as ONE lane in order: the 3-2
   root brick first (KIT-W3b-c, so 3-2 can roll; ENG-DEAL REPORT:26-28 on t-eng-w3), then 3-1's ENG-CATCH-f (R-165.561) and KIT-W3a-f.
3. **The 2-hour trial is 3-2**, the first level whose missing pieces are smallest (the root brick and n11's combine section;
   lead-exam Q8, Q12). Its build starts only on a clean whole-node-string roll (level.md:29, rule 23) with its words approved.
4. **The drop toys (KIT-W3a PUSHBACK.md on t-kit-w3a 38c1b2b20) are 3-5's piece, not 3-1's.** 3-1 never lays a 400 px drop; the run lay
   refuses a section that leaves World 3's 320 px corridor (pipeline.ts:2420; w3.ts corridor, per the PUSHBACK). Building it now patches
   ahead of need (D40, PM.md:63-64). Ruling: no drop-toy test lands in 3-1's kit; "the run lay lays a DESIGNED drop past its corridor"
   becomes a pieces-lane job with an R-number, built and planted before 3-5's build starts.
5. **World 2 finishes one level at a time on one release line.** Release 6 = 2-9 then 2-8, each merged onto a release-0.10.5 line cut from
   main 49fdc8cb6 (release 5 is in main), so neither build re-merges a release later (the merge debt in lead-retro §2.7). 2-9 goes first:
   its pieces are landed on t-eng-29 337ba7d0b and its two reds are owned by its own box (R-165.535, R-165.544).
6. **Count tails against a second cap.** Matt's rule is at most 4 counted lanes, tails not counted (PM.md:119-121, R-165.547). The pack's
   evidence is that tails still cost the lead about a dozen rulings in two hours (lead-knowledge.md:9-11). Tightening is within Matt's
   rule: at most 4 lanes AND at most 2 tails at once; a third tail waits.
7. **Inside the weekly limit, lean (MATT: one question).** The limit read allowed_warning at 12:14 PM ET and resets Wed 12-02 2:00 AM ET
   (lead.md CAPACITY; get_session today). My pick: at most 3 lanes until Wednesday (measure, 2-9 then 2-8, the 3-2 root brick).
8. **The start reads shrink (MATT for LESSONS.md:1's "in full", since it is a written rule).** Proposal: LESSONS.md is read by its
   headings plus the section the job's packet names; the packet names the 3-5 lessons that touched this kind of job before (the
   pre-mortem, lead-retro §1b.4). Only after the measurement shows start-up reading is a real share of a box.
9. **The pre-freeze check and the brief check get built this week (lead-retro §1b.3, :51-58).** A tools job after the measurement:
   pre-freeze = tsc + generality + the whole test file of every changed source file and every test importing it + the lock pair on the
   named base, refusing a "frozen" claim otherwise, with a plant; the brief check extends leadguard's judgeCreate to refuse a brief with no
   hash on its BASE line, no report-by time, or no lock base by hash. Prevention, not detection, is where the hours are.

## What looks like the last lead's bias
- **Throughput by starting more.** It ran about 11 sessions on 11-27 (lead-retro:66-68) and gave each engine gap a new lane (LESSONS.md:175,
  D147). Lanes were cheap to start and expensive to check.
- **Countermeasures as prose, and more prose each day.** LESSONS.md grew to 190 dense lines and CONTINUOUS-IMPROVEMENT.md to 109 entries,
  most marked "new" in the Held? column (CONTINUOUS-IMPROVEMENT.md:179-188), and every member reads them. The lead's own retro says only
  hooks held (lead-retro:69-72). I would add checks, not lines.
- **A fault's fix briefed from the case in hand**, then proven on the probe's small seed range (CI #101, #107): the tower took six boxes.
- **Trusting the build-ready claim from paper** (CI #95; rule 23 added 11-26). The fix exists in the rules; it was the enforcing that slipped.

## What I keep
Frozen candidates and tails; the lock as two runs by hash; invariant briefs with a failure path; EXACT NEXT STEP in every REPORT; the hooks
(lead-retro §3, :101-110).

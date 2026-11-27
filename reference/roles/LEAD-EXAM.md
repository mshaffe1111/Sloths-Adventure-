# The lead's entrance exam (Matt 11-27 1:32 PM ET, R-165.557: "Maybe the fact of being tested, and I'll test")

Every new lead takes this BEFORE it gives any member new work. It is open-book, and every answer cites file:line, a hash or a command's
output. The point is that it must find and check each fact itself, not repeat a summary. Write the answers in
reference/notes/lead-exam-<date>.md and commit them.

The grader is a cold Critic: an Agent subagent given only this file and your answers, told to check each answer against the repo and
git. Matt may grade it himself or set his own questions; he can test you at any time.
- One point per question. Pass is 10 of 12. Send Matt the score and the two weakest answers.
- Below 10: re-read and re-take the questions you missed. Members already running keep working on their briefs; nothing new starts until
  you pass.

1. **The mission.** State it in one sentence. What numbers will show next Wednesday whether you are on track?
2. **Where a level's hours went.** This week a level cost 7-10 hours of helper time. Name the three biggest time sinks, each with
   evidence (STATE.md lines, LEVEL-LOG.md rows, the retro).
3. **The tripwires.** List the eight. Which did the last lead fire on 11-27? Give each one's CI number.
4. **The team right now.** Every active member: its id, its branch head by hash (ls-remote, not a document), what it waits on, and its
   report-by time.
5. **Release 5.** Its frozen head; the reds accepted for the PR body; the exact steps from Matt's "push" to the APK link
   (reference/methods/release.md).
6. **The red board.** Every open red on a line that will ship, with its owner and its R-number.
7. **The lock gate.** Write the two exact commands. Name the base hash for (a) a World 3 engine landing today and (b) release 6. Say why
   each is that hash.
8. **Rule 23.** What must be true before a level build starts? Is 3-2 allowed to start today? Prove it from the files: its roll file,
   every piece's landed hash, and ENG-DEAL's refusal cost on 3-2.
9. **Zero trust.** Name three helper claims from 11-27 that turned out wrong or incomplete. For each, what check would have caught it
   BEFORE it cost a box?
10. **Your guard.** What do tools/team/leadguard.mjs and tools/team/leadcommit.sh refuse? Paste the output of
    `bash tools/team/leadcommit.sh --plant` and `node tools/team/leadguard.mjs --self-test`.
11. **Capacity.** The weekly usage reading now (get_session rate_limit_info), and what you will run until Wednesday 2:00 AM ET. Write it
    as the one multiple-choice question you would ask Matt.
12. **The 2-hour trial.** Which level, and why its pieces qualify (each piece's landed hash). Your clock rules (start, stops, what counts),
    and the hard stop.

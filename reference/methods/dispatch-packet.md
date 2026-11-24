# Dispatch packet (every task the PM sends; no chat history, no reasoning from other agents)

How a member is created (the lead does this for every task; the story keeper is the only standing member, and every other member is
created fresh, per task): its own session (create_session, per roles/PM.md §1: the repo as source_url, the model Matt last named, permission_mode "auto"; never the Agent tool, R-165.74), the effort stated on the packet's `effort:` line per TEAM.md rule 5, and a prompt built in this order:
1. The role card's "Who you are" section, pasted word for word: it sets who the member is before anything else.
2. The packet below.
Never send a bare packet, and never write the persona from memory.
The consultant is the exception: it gets its persona plus the packer's input package (CONSULTANT.md "What it gets") and nothing
else: no packet, no objective, no reasons, no team files. A delta re-audit may continue the same Critic (TEAM.md rule 2).

```
# TASK <ID>   to: <Designer | Architect | Engine | Content | Critic | Analyst>  (never the Consultant)   effort: <high|max|medium>   due: <ET time from date>
## First, before any tool call
Read reference/roles/README.md, then your card reference/roles/<ROLE>.md, then its knowledge pack in the card's order (your turnover
note is in it). You are on the team: push back, suggest, go beyond inside your WRITE files (README rules 3-4).
## Objective
<one or two sentences, the player-visible result>
## Why it matters
<the evidence that made this the next task: the data, the consultant finding, Matt's words; enough to judge it, never the PM's reasoning>
## Frozen inputs (do not change)
- Spec numbers: <from specs/..., with values>
- Interface or schema: <file and symbol, or the code block>
## Files
- READ: <exact paths>
- WRITE: <exact paths>   (anything else is out of scope)
<!-- D40: before sending, write one line under Why it matters: 'Built on: <what>; replaced this sprint by: <job or none>'. If a planned job replaces it, build it after that job, or only its layout-free part. Two REJECTs: the lead stops and asks this again before attempt 3. -->
## Definition of done (the Critic checks each)
<!-- D39: a help or assist that changes the stage (steps, pads, boxes) gets a done-item that flies every seed, both settings, with plain jumps AFTER it is applied, and the packet names its tallest case and the number it gives. D37: every behaviour claim in Frozen inputs is proved by a run, not a reading. -->
1. <a measurable check: a test name, a gate, a number with tolerance>
2. tsc clean; the named tests pass; the gates that apply pass.
## Return (lean: reference/roles/README.md "Lean output")
- Your last message: 10 lines or fewer. REPORT.md: 60 lines or fewer.
- A commit on branch <name>, pushed (confirm with `git ls-remote`).
- REPORT.md on that branch, in the 7 sections of reference/roles/README.md: done-items with evidence, polish check, pushback,
  suggestions (as ready packets), unresolved, method update, turnover note. No narrative of the process.
- The turnover note(s) your card names, rewritten for the next agent in this role (the Critic fails the task if it isn't).
- Can't wait for the report (a blocker, a wrong frozen input)? PUSHBACK.md on the branch and stop (route: reference/roles/README.md
  rule 1). Never wait mid-task for a reply.
## Attempt
<1 | 2 (delta: the failing test and the violated constraint only) | 3 (fresh: "approaches that failed: ...")>
```

## Critic packet (opens with CRITIC.md's "Who you are", pasted word for word)
```
# AUDIT <ID>   effort: high (max for a release)
Assume this submission violates its contract, breaks a rule, or regresses something. Run the checks and prove where it fails.
- Contract: <the original packet's frozen inputs and definition of done>
- Submission: branch <name> at <commit>
- Tools: tsc, the suite, the gates, traversal with the real 30 fps reach, the bots (child, middle, expert)
Return REPORT.json: {status: PASS|REJECT, violations: [{file, line, rule, evidence}], tests_added: [...]}.
Also judge the builder's Pushback and Suggestions (does each hold?) and check its turnover note was rewritten.
Never edit production code.
```

## Player words in a packet (REL-0100 pushback, 11-20)
A packet that hands a member player-facing words (What's New lines, Dot lines, signs) counts them against the gates that check them
BEFORE it goes out (whatsNew.test: an entry has 3-8 lines, each at most 90 characters; playerText.test), and checks each line is TRUE
in the code. 11-20: the lead sent 9 What's New lines; 3 were over 90 characters, one was untrue, two said "New stage" for stages that
already existed by name.

## Every packet carries the inbox rule (D105, 11-21)
Every packet's READ line names D57/D87 and says, in bold: run ReadNotifications at EVERY step boundary and at every push. A lead ruling sent with priority 'next' still waits until the member reads its inbox (BUILD-23d read four rulings 20-80 minutes late; the packet listed D103 but not D57/D87).

## Every packet carries the no-clock-times rule for messages (D109, 11-21)
Every packet says: **messages to the lead carry no clock times** (the notification already says when it was sent); a time goes only in a commit or a REPORT line, taken from `date` in the same command, where timecheck checks it. Three members typed a time ahead of the real one in messages on 11-21 (by 2, 1 and 29 minutes); D30 alone, a sentence, did not stop it.

## Every packet carries a time box as well as the context line (D111, 11-21)
Every packet's BOX says: **hand over at 320k REAL context OR 28 minutes after your start (from `date`), whichever comes first.** Members misread their own context by 100k+ (ENG-26e, -27f), and xhigh members add about 10k a minute, so between two lead reads 12-15 minutes apart a member can pass its line (ENG-27h at 325k, ENG-GROUND-d at 346k, 11-21). The clock is the one measure a member reads right.

## Every packet forbids a foreground wait on a background run (D113, 11-21)
Every packet says: **never wait in the foreground for a background run** (no until/sleep loop, no blocking Monitor, no foreground tail -f): read its tail, do other work, or END YOUR TURN; the run finishing and any lead message both wake you. **Start every long run with the Bash tool's run_in_background flag, not a trailing '&' or nohup inside a command**: only a run_in_background task wakes the member when it ends (UI-372b sat idle about 10 minutes on a '&' suite, 11-21). A member in a foreground wait reads nothing (ENG-26i read a ruling about 5 minutes late while it sat waiting on its own background sweep, 11-21: a D87 repeat; "run long commands in the background" alone did not cover waiting on them).

## Every engine packet starts the full suite on its base first (D114, 11-21)
Step 0 of every engine packet: **the full unit suite on the BASE, started first with run_in_background**, its verdict in the REPORT; a red on the base is named to the lead before building on it (D40). **A suite verdict still pending at your box:** write the hand-over and push, end your turn, and when the run wakes you append its one-line verdict (plus whether src/ and tools/ changed since the base: if not, the verdict carries to the head) to the REPORT, push, send it to the lead, and stop; the lead keeps you un-archived until then ONLY when the verdict carries to the head and no critical work waits for your slot; otherwise the lead archives you and the next member's step 0 runs the suite on its own base (the suite alone runs about 22 minutes in a fresh container, so it rarely fits a 28-minute box: UI-372c, ENG-26l, 11-21). Three members on t-build-26 handed over with the suite unrun (the box leaves no room for it at the end), so two reds (tests still laying 2-6 as a draft after it was listed) hid until the fourth member ran it.
**A suite verdict carries to a later head only if NEITHER src/ NOR tools/ changed since it ran (D118, 11-21):** more than 20 src tests
import the bot from tools/inspect (pacerLay, legsHome, postLay, firstTimerBot, w6Game, w7Game, w6/w7SwingRoute, pipeline, wheel, w1Arc15/16,
w5 ...), so a bot-only commit can turn them red. Every bot commit's push runs the suite on its head (frozen, in the background) before the
lead rules its rows; a packet never says 'src unchanged: no suite' for a bot change.

## Every run reads a frozen worktree (D115, 11-21)
Every packet says: **every run (the suite, drawcheck, castBots, lockall, a grade) reads a FROZEN worktree (git worktree add --detach <hash>), never the tree being edited.** **A frozen tree is never touched while a run reads it, not for a minute: a toy's RED run goes in a fresh worktree of its own** **and the tree is made IMMUTABLE right after its node_modules link (`chattr -R +i <tree>/src <tree>/tools && chattr -i <tree>/src/game/gen2/proven`: that ONE folder's own flag only, because seedListChunk.test.ts makes its planted temp folder inside it (EPERM otherwise, ENG-26r 11-22); its files stay immutable; any other test that must write under src/ or tools/ is named to the lead and gets the same one-folder exception; chmod does NOT stop root, every session is root: ENG-26r tested both; vite still runs), so an edit fails loudly ("Operation not permitted") instead of slipping; `chattr -R -i` before removing the worktree (D115, third breach 11-22: ENG-26r edited a fix tree its first run was reading)** (11-21: ENG-WALL and BUILD-26k each copied a test into a suite's frozen tree and restored it). Twice on 11-21 a run read a tree that was changing under it (ENG-27l caught its own; ART-SHEETS' base suite did not count).

## A bot candidate is safe-kept off the shared branch (D117, 11-21)
Every bot or level packet says: **safe-keeping pushes of a CANDIDATE (a bot or lay change whose rule-28 rows the lead has not ruled) go to
`<work-branch>-wip-<member>`, never the shared work branch.** The shared branch takes the candidate only after the lead's ruling on its
rows. Twice on 11-21 a bot member pushed a candidate to t-build-26 before its rows reached the lead (BUILD-26f 0bc969bce, worse, reverted;
BUILD-26g 9df2f0d11 'for safe-keeping').

## A question to the lead never ends a box (D120, 11-21)
Every packet says: **a question to the lead never ends your box: send it, then keep working on every step that does not depend on the answer** (the suite, a split, a measurement, the REPORT). Stop only at the box, or when nothing left is independent of the answer, and say which in the message. On 11-21 ENG-27r handed over 21 minutes early to wait for a ruling while its suite, a split and a measurement were still to do.

## Every background run sets its timeout to fit (D122, 11-21)
Every packet says: **a run_in_background call sets `timeout` to fit the run (the default stops it at 30 minutes; the most is 2 hours, 7200000 ms), and a chain that may pass 2 hours is split into runs, each with its own verdict line.** On 11-21 ENG-26p's suite stopped at the 30-minute default with 73 files unreported, and INT-R3's FULL SET chain stopped at the 2-hour limit inside the unit suite, its last gate: both runs had to be redone.
**Every suite and every drawcheck run gets the MOST, `timeout: 7200000`, and every suite, drawcheck, lockall, castBots and stills run counts
toward the at-most-TWO heavy runs (D123, 11-22):** a longer timeout costs nothing, and a 'fitting' guess fails under load: ENG-26r gave
its base suite 40 minutes while it ran beside a full drawcheck and lockall's base (three heavy runs), and the slowed unit step was stopped
at 3,564 results with no verdict.

## A stage aimed at a release measures its ship verdict FIRST (D125, 11-22)
Step 1 of the first packet that aims a stage at a release: **its castBots --proven yield on its current head (every bot, both settings,
every listed roll; about 3 minutes a run), sent to the lead before any polish, draw or wall work.** Under the 60 bar, the lead re-plans
(the cause first, or the stage moves to a later release) before more is spent. 11-22: 2-6's yield was first measured at 4:34 PM on
release day, 29 of 100, after two days of work aimed at shipping it.
**And its drawcheck on the DRAFT stage (D131, 11-23):** a stage under build is not a listed stage, so the repo's drawcheck never sees it;
the first box also runs `drawcheck` on the draft at its own spots (the stage alone) and sends the breaches with the yield. 11-23: 2-7's
six draw breaches were found by DRESS-27 at 3:40 PM on the night it was due on Matt's link, after a full day's build.

## A landing on a shared t-branch runs the CI tool line (D126, 11-22)
Every landing on a shared work branch (t-build-*, t-eng-*, t-int-*) runs, with the unit suite, **the CI tool line: the tests in
.github/workflows/gates.yml's 'rolled' job, the exact list there (about 5 minutes)**, never only CLAUDE.md's four engine tool tests. A red
the landing inherits is named to the lead with its first bad commit if known; a red it adds is a stop. 11-22: nine of the rolled job's
tests were red on t-build-26 9e1e30b27 after a landing reported 'suite green' on CLAUDE.md's short list.

## A time in a REPORT is the time it was WRITTEN (D128 by members, 11-24)
Every clock time a member writes (REPORT, turnover note, STATE) comes from `TZ=America/New_York date` in the same command, never a planned
time such as the box's end. timecheck fails a stamp later than its own commit: two members did it on 11-24 (INT-R5b's REPORT.md:201,
ENG-PLANT's REPORT.md:3), each writing 'hand-over at the box (H:MM)' before the box ended.

## Rule 28's baseline is MAIN for a shipped stage (D132, 11-24)
A landing that touches the engine or the bots compares castBots rows on every SHIPPED stage it can touch against MAIN (the build players
have), never only against the branch it started from: 11-24, a week of 2-7 landings each matched t-eng-27's own base, and the release merge
then showed shipped 2-1/2-2/2-4 rows pass -> fail vs main. The integration member runs the same comparison right after each merge onto a
release branch, before THE FULL SET.
**Known flips first (ENG-PLANT-c, approved 11-24):** when an attribution or an earlier run has already named the pass -> fail rows, a
candidate runs THOSE rows first (minutes), and only then the full table: 3b's 2-4 miss was visible from ENG-PLANT-b's flip list before a
25-minute run. A refused judged hop names its way on in the same code block, with a toy each way.

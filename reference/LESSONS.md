# Lessons we already paid for (read in full once at the start of every task; the session-start printout names this file)

**Lead: start at reference/handoffs/lead.md and reference/roles/PM.md. The live ledger is reference/STATE.md; STATUS.md is the old diary.**

Matt, 2026-11-01: "make sure that our lessons learned, what works and what doesn't work, are all being used by our workers and
helpers." Each line is a mistake we made once, with its defect number in reference/CONTINUOUS-IMPROVEMENT.md, and what we do now.
Before you start: open your job's method in reference/methods/ (index: reference/methods/README.md). If your job has none,
you write one. Your report MUST have "Method used", "Lessons applied" (which lines below touched your job) and "Method update".
A report without them is sent back unread. You do not edit this sheet or a method file yourself: you PROPOSE the change in "Method update" (what worked better with proof, what failed and why, a lesson that is wrong or out of date), and the lead merges proven changes when it accepts your work. The one exception: a job with no method file gets one written by you. Your first-time gate result and redo count go on reference/HELPERS.md; the helpers
that do the best job get the follow-on work.

**Quality sets the date (Matt, 2026-11-02: "even if it takes longer... we can't do it half-assed. It has to still be quality. And if that pushes the timetable, pushes the timetable.")** No estimate, schedule or token budget is a reason to ship something dull, easy-by-accident or rough. Cut scope or take longer; never cut the bar. **Going quick and sloppy is a failure** (Matt, 2026-11-02): fast work that has to be redone, corrected or caught by someone else counts as a miss, not as speed.

**For the lead: a helper's failure is the manager's first (Matt, 2026-11-02: "being a manager is harder than being a worker").** Before sending back or retiring, find what the lead's setup made likely and change the system, not the helper's effort. (D27)

**Judging your own work**
- Judge the real screen, in every save state (fresh, old, half-played, finished) and both orientations. Never from a list or one happy shot. (D1, D2, D12)
- When one thing on a screen is raised to the bar, bring everything beside it up too, or name what's left. (D13)
- A gate must call the same code the screen calls, or it proves nothing. (D19)
- Every menu screen and pop-up must pass clipcheck: no cut-off text, nothing under the notch, taps 44 px or more. (D4)
- Show only what applies: a stat, field or line that means nothing for this item ("Defeated x0") is left out. (D5)
- Acceptance waits on the shared gate, not on your own test. (D18)
- Read your message queue (ReadNotifications) before every report and before going idle: a message that crossed with your work is still yours. (roadmap-keeper, R-6.27, 11-01)
- Merge the latest main or release into your branch BEFORE you shoot or judge anything, and stamp the base commit on every sheet. (D23)

**Facts and measuring**
- Check a fact in code before acting on it. Read the value, not a comment; grep the whole tree, not one file. Memory and summaries are not a source. (D7, D24)
- Test the measuring tool before trusting its numbers. Our first-timer bot was wrong for days. (D15)
- Spread every fix to its pair: x and y, up and down, left and right, every world with the same pattern. (D21)
- Prove a change is needed with the fixed tool; revert what isn't needed (w8-rope2, Nov 1).
- Time comes from `TZ=America/New_York date`, never worked out by hand: a time written into a file or report is pasted from a `date` call made in the same command. The same for commit ids and doc revs: pasted from the command's own output after the push, never typed ahead. (D20, twice on 11-01; roadmap-keeper ids, twice on 11-02)
- Estimates come from measured history (how long the same kind of job really took, from git and STATUS), never from a guess; say the source. (D25)

**Stages and play**
- Judge a stage inside its world, played in order after the ones before it: passing alone is not passing. Use what we built; "run, jump, collect, vine" with nothing else is not done. (D26)
- A first-timer's natural run must collect enough for the goal; pickups sit on the natural path. (D8, D14)
- Anything placed once (finds, notes, snails) has an always-place fallback and a test on every layout. (D9)
- In-play words draw above every world thing, below the HUD, and never cover where the player must act. (D10, D22)
- Every prop stands on something. (D16)
- Check cutscene frames, not just that the scene plays; the subject of a picture must read, upright and sideways, never hidden behind a text box. (D17)
- Quality steps never do heavy work on the play frame. (D11)
- Anything drawn into a cached canvas must survive the phone losing its canvas: re-bake on restore, and test it. (D6)

**Words**
- Player-facing words are written per item, in the character's voice. No filler, no repeats on a page, no apology for missing data. (D1, law 6)

**Art and money**
- Hugging Face: $65.55 left (Matt, 11-07), no top-ups, keep about $15 in reserve. Matt approves every picture list, one at a time, before any spend.
- Judge art against the absolute floor (floor.py in hf-backdrops.md), not against a weak "before". (backdrops, Nov 1)
- Never Gemini prompts; Hugging Face only.
- Show first: any big look change goes to Matt as stills or a mock-up before it is built.
- Know which link is which before telling anyone where to play: the testers play the LIVE site + #ctest; Matt's Claude page (EnK5) is his alone and doesn't record. (D28)
- No PR until every gate is green on the exact head; after any proven-seed-list rebuild, run every test that pins a roll or a seed. (D29)
- A time in a file or report is pasted from `date` in the same step, never typed, for helpers as well as the lead. (D30) REPEAT 11-12 6:35-6:45 PM ET: the lead typed ledger and message times up to 15 min ahead (and a packet 8 min ahead, D14 caught it). Countermeasure: the lead writes every ledger line through a command that stamps `$(TZ=America/New_York date +"%-I:%M %p")` itself (no hand-typed clock in a heredoc), and a gate is ordered (R-165.168: a STATE/handoff/packet line stamped later than its own commit fails).
- Run a new gate the way CI runs it (`CI=1 FORCE_COLOR=1`) before the PR; a gate that reads tool output strips colour codes. (D31)
- A command in a role card, method or brief is proven against the tool's arg parsing or a dry run, and the whole document goes to a fresh Critic cold before anyone uses it. (D32)
- Before pushing to a branch with a PR, read the PR's state. Once a PR is open, never amend or force-push its branch; after a merge, changes go on a new branch from main. (D33)
- Every fact in a plan or review cites file:line, checked when it's written; before changing a plan, grep the rules that govern it and cite them. (D34)
- A lead's plan change cites the governing file:line in its roadmap row and waits for the cold Critic's PASS before anyone acts on it; a check is never loosened to make a document pass. (D35)
- Read-only members use `git show` or their own worktree, never `git checkout` in a shared tree; before a commit `git status -sb` names the branch, and after a push `git ls-remote` equals HEAD. (D36)
- A packet that says how the engine treats a stage is proved with one pasted run of that stage; a "lives unchanged" done-item names the real loseLife (RealPlay stubs it), and an audit runs every behaviour claim. (D37)
- A rule that counts recorder events names the code line that emits each event and what it records, and is run on a hand-built list with a release and a take-back in it. (D38)
- A help or assist that changes the stage is flown over every seed and both settings with plain jumps after it is applied; the packet names its tallest case and the number it gives. (D39)
- Before a packet goes out, name what it is built on and whether a planned job replaces that this sprint; if so, build it after. Two REJECTs in a row: stop and ask whether it patches something about to be replaced. (D40)
- Pokey's drawn height is 89.1 units (heroSprite.ts:30,32), not 48 (his collider): size art against the drawn height, read from the code. (D41)
- Every time Matt sees comes from a command, never from converting UTC in your head: November is EST (UTC-5), not EDT. The UserPromptSubmit hook prints the ET time each turn. (D42)
- Engine work is done for every stage, never one: a packet's done-list says 'works for any stage, proven on N', and no stage id, seed or x literal lives in engine code (world data only). When Matt asks for a level fast and the engine first, name the trade out loud. (D43)
- SCOPE decides where tokens go (Matt 11-11 5:47 PM ET: "I don't mind using tokens, but I want to use them in the best ways"). Rigor and the strongest model go to what everything reuses: the core engine, built correctly once, including the parts we already know we will need. A feature one level uses (1-1's help ladder) gets good-enough now and polish later, never rounds of back and forth. Review depth matches reuse and risk: don't audit what doesn't need auditing. Budgets and a daily spend report so Matt sees what the tokens bought. (D44)
- A size gate measures the exact file that ships: chunkcheck measured a build without deploy's BASE_PATH, so 0.9.6 shipped 254 B over its own budget while the PR said 11,354 B spare. Every gate builds the way deploy.yml builds. Countermeasure: gates.yml and the release gate build with BASE_PATH=/Sloths-Adventure-/ before chunkcheck (next integration packet); the next release lands the seed-list split (t-engine-seedchunks) first to make room. (D45)
- A landing must be reachable by a plain walk-off fall or a full jump, each with margin and no ceiling in the arc; never only by a mid-air correction (the dead zone). Petals go only where a clean path reaches. Countermeasure: STAGE-RULES §1 rule; gen2's verdicts must refuse it, proven by a test from Matt's case. (D46)
- A defect Matt reported is written down the same turn and never lost. Matt reported the dead-zone petal log in 1-1 (a petal log reachable only by a mid-air correction) to the last lead and it was in the testers' data, yet it appears in no record and shipped in 0.9.6; a near-identical rule existed only for one stage (R-6.29, 4-7's petal arcs) and was never made a generator check. Countermeasures: every Matt report gets an R-id the same turn, tagged 'reported by Matt' (LAWS 21); a one-stage rule that describes a general flaw becomes a gen2 verdict for every stage; the release checklist lists every open Matt-reported item at the top and the lead asks Matt directly, one plain question, before the PR (a PR line is not asking); a sweep of the testers' data and past reports lists every open Matt-reported issue before new work. Also shipped as a named rough spot without asking him: R-165.122, hop rocks walked through. (D47)
- A passed branch is integrated, not just passed (D48, 11-12): the master art catalog (t-engine-inventory, R-165.104/.107) passed its Critic 11-11 but was never in an integration list, so a helper painting 1-3's traps on 11-12 had no catalog to label into ("inventory first" broken silently). Root cause: integration lists were built from what was running, not from the ledger. Countermeasure: before every integration packet the lead runs `git merge-base --is-ancestor` for every PASSED branch named in STATE.md since the last release and lists each one missing; none is left out without a written reason.
- A design table never overrides a rule Matt set (D49, 11-12): the lead told W1C to lay 1-3's flags only where 1-3.md's table put them (3 for ~27,500 px), against Matt's verdict-enforced rolled-stage rule (a flag before every hard beat, no span over 4,000 px; his 10-28 QA). W1C refused and was right. Countermeasure: before ruling on placement (flags, hearts, gaps, lengths), the lead checks STAGE-RULES and the verdicts for an existing rule first; a design doc states the rule it follows, never a number that breaks one.
- Test what the player gets by default (D50, 11-12): 1-3's trap teach and 1-2's thorn lines were proven shown by the bots, but on the real page with Normal's DEFAULT Tips setting dotGuideHelp.ts dropped every stage teach line as "chatter" (Easy defaults to Help), so on Normal nothing taught the trap. D12 found it walking the real page. Countermeasure: every teach/first-appearance check runs on the real page with each setting's DEFAULT options (Normal: Tips; Easy: Help), and a test plants a teach line and asserts it passes helpAllows on every default.
- A new stage joins every stage-walking gate the day it is built (D51, 11-12): 1-3 sideways at its last trap draws 8.53 screens vs the 7.5 limit (PERFORMANCE-RULES §1, pass/fail), already 8.46 before the painted art, and drawcheck never played 1-3, so the gate passed while the breach shipped toward Matt's link. ART-W1B found it by measuring. Countermeasure: a stage's builder adds it to drawcheck (and every gate that walks stages) in the same packet that builds it; level.md's steps carry it.
- Check cites LAST, after every edit (D52, 11-13): the new lead checked its review's file:line cites, then inserted lines above them in the same commit, so the Critic found every STATE cite 5 lines early; a $ in an unquoted heredoc also ate a figure, and "1-4 has no creaky limb" came from a grep that missed "rotting". Countermeasure: edit the cited files in an earlier commit, re-grep every cite as the last step, quote heredocs that hold $, name the synonyms a grep tried; gate R-165.179.
- Run the fast gates on a docs branch before pushing it (D53, 11-13): the 11-12 lead's doc branch failed roadmapcheck 30 times unseen. Countermeasure: roadmapcheck + knowncheck before every docs push; gate R-165.181.
- Grep the whole tree before telling Matt a fact (D54, 11-13): the lead said the score is shown nowhere after a one-level glob of src/components; it is on the HUD, Stage Cleared and Game Over. Countermeasure: `grep -rn` over src/ for every 'nothing uses X' claim; correct Matt the same turn.
- Members report their own context % (D55, 11-13): get_session reads 0 tokens while a session runs, so B14 reached 76% unseen. Countermeasure: every message to the lead carries the member's context %; at 40% it stops with an EXACT NEXT STEP list.
- Lean is the first rule, not a check afterwards (D56, 11-13): the lead answered each new idea with a new member (15 sessions, up to 9 at once, 2 Fable) and burned 19% of the week by lunch. Countermeasure: before any new member, ask: can a running member do it, does it pay now, is it under the cap of 4; check usage each check-in; message Matt only what needs him.
- Read your queue at every push (D57, 11-13): lead rulings and STOPs sat unread 20-60 min in two members' queues while they worked, and work was built after a stop. Countermeasure: ReadNotifications at every push and before each new sub-task; the lead sends STOPs and rulings with priority now.
- A design that borrows a classic game's mechanic explains, with cited research, why players loved it, how the original taught it and how we introduce it so it feels that good; Matt had to explain Donkey Kong Jr.'s two-vine climb for 1-4 (R-165.177). Countermeasure: the TRIBUTE rule in every idea packet and design (IDEAS-1-6.md), lead checks it before a design goes to a builder. (D58, 11-13)

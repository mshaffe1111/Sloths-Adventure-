# Lessons we already paid for (printed with the laws at every session start and after every memory compression)

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
- A time in a file or report is pasted from `date` in the same step, never typed, for helpers as well as the lead. (D30)
- Run a new gate the way CI runs it (`CI=1 FORCE_COLOR=1`) before the PR; a gate that reads tool output strips colour codes. (D31)
- A command in a role card, method or brief is proven against the tool's arg parsing or a dry run, and the whole document goes to a fresh Critic cold before anyone uses it. (D32)
- Before pushing to a branch with a PR, read the PR's state. Once a PR is open, never amend or force-push its branch; after a merge, changes go on a new branch from main. (D33)
- Every fact in a plan or review cites file:line, checked when it's written; before changing a plan, grep the rules that govern it and cite them. (D34)
- A lead's plan change cites the governing file:line in its roadmap row and waits for the cold Critic's PASS before anyone acts on it; a check is never loosened to make a document pass. (D35)
- Read-only members use `git show` or their own worktree, never `git checkout` in a shared tree; before a commit `git status -sb` names the branch, and after a push `git ls-remote` equals HEAD. (D36)
- A packet that says how the engine treats a stage is proved with one pasted run of that stage; a "lives unchanged" done-item names the real loseLife (RealPlay stubs it), and an audit runs every behaviour claim. (D37)
- A rule that counts recorder events names the code line that emits each event and what it records, and is run on a hand-built list with a release and a take-back in it. (D38)
- A help or assist that changes the stage is flown over every seed and both settings with plain jumps after it is applied; the packet names its tallest case and the number it gives. (D39)

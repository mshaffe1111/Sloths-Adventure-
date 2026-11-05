# Lessons we already paid for (printed with the laws at every session start and after every memory compression)

Matt, 2026-11-01: "make sure that our lessons learned, what works and what doesn't work, are all being used by our workers and
helpers." Each line is a mistake we made once, with its defect number in reference/CONTINUOUS-IMPROVEMENT.md, and what we do now.
Before you start: open your job's method in reference/methods/ (index: reference/methods/README.md). If your job has none,
you write one. Your report MUST have "Method used", "Lessons applied" (which lines below touched your job) and "Method update".
A report without them is sent back unread. You do not edit this sheet or a method file yourself: you PROPOSE the change in "Method update" (what worked better with proof, what failed and why, a lesson that is wrong or out of date), and the lead merges proven changes when it accepts your work. The one exception: a job with no method file gets one written by you. Your first-time gate result and redo count go on reference/HELPERS.md; the helpers
that do the best job get the follow-on work.

**Quality sets the date (Matt, 2026-11-02: "even if it takes longer... we can't do it half-assed. It has to still be quality. And if that pushes the timetable, pushes the timetable.")** No estimate, schedule or token budget is a reason to ship something dull, easy-by-accident or rough. Cut scope or take longer; never cut the bar. **Going quick and sloppy is a failure** (Matt, 2026-11-02): fast work that has to be redone, corrected or caught by someone else counts as a miss, not as speed. **Tokens come down by learning, never by cutting checks** (Matt, 2026-11-04): write what worked into your method so the next job of its kind costs less.

**For the lead: a helper's failure is the manager's first (Matt, 2026-11-02: "being a manager is harder than being a worker").** Before sending back or retiring, find what the lead's setup made likely and change the system, not the helper's effort. (D27)

**Standard work (Matt, 2026-11-04):** start from your job's method file and its best known result; don't experiment when a known way works. If you find a faster or better way, prove it and propose it: it becomes everyone's way.

**Planned vs actual (Matt, 2026-11-04):** know how long your job should take (its roadmap estimate or method best result). If you go over, say so in your next message: the cause and what you'll change so it doesn't happen again.

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
- Time comes from `TZ=America/New_York date`, never worked out by hand: a time written into a file or report is pasted from a `date` call made in the same command. The same for commit ids and doc revs: pasted from the command's own output after the push, never typed ahead. Better still (D27, spread 11-04): don't put commit ids in messages at all: say what you pushed and to which branch; the lead and supervisors read the ids from git. (D20, twice on 11-01; roadmap-keeper ids, twice on 11-02)
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

**Reaching Matt**
- A test link or preview reaches Matt only when it is opened for him (Artifact open) and its link is the first line of the message; a URL buried in a report is not delivered. (D28)
- Research is read line by line before it shapes a plan: a ledger with one row per idea, checked by the lead against the source, every miss given a home. A summary is not a reading, and an answer about what the research says quotes it with the line number. (D29)
- Rules go into the builder first: a stage rule lives in the formula file the generator builds from, and the checker reads the same file; before any big build, compare two or three approaches and have an unanchored critic attack the pick. (D30)
- A supervisor with the technical duty runs whenever anyone builds; it is never cut to save tokens. The lead reads the code at the second report of the same problem instead of relaying rulings, and every success of the day becomes a procedure in reference/methods/ the same day. (D31)

- Phone measurements only come from the LIVE site's testers' link (#ctest): Matt can't measure on claude.ai test pages: their runs never reach the sheet, and his budget phone (the OnePlus) can't run the Claude app well enough to test there at all. Anything that needs phone numbers ships behind the testers-only switch first. (Matt, 11-04)

**Art and money**
- Hugging Face has $72 left, total, no top-ups. Matt approves every picture list, one at a time, before any spend.
- Judge art against the absolute floor (floor.py in hf-backdrops.md), not against a weak "before". (backdrops, Nov 1)
- Never Gemini prompts; Hugging Face only.
- Show first: any big look change goes to Matt as stills or a mock-up before it is built.

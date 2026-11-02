# Lessons we already paid for (printed with the laws at every session start and after every memory compression)

Matt, 2026-11-01: "make sure that our lessons learned, what works and what doesn't work, are all being used by our workers and
helpers." Each line is a mistake we made once, with its defect number in reference/CONTINUOUS-IMPROVEMENT.md, and what we do now.
Before you start: open your job's method in reference/methods/ (index: reference/methods/README.md). If your job has none,
you write one. Your report MUST have "Method used", "Lessons applied" (which lines below touched your job) and "Method update".
A report without them is sent back unread. You do not edit this sheet or a method file yourself: you PROPOSE the change in "Method update" (what worked better with proof, what failed and why, a lesson that is wrong or out of date), and the lead merges proven changes when it accepts your work. The one exception: a job with no method file gets one written by you. Your first-time gate result and redo count go on reference/HELPERS.md; the helpers
that do the best job get the follow-on work.

**Judging your own work**
- Judge the real screen, in every save state (fresh, old, half-played, finished) and both orientations. Never from a list or one happy shot. (D1, D2, D12)
- When one thing on a screen is raised to the bar, bring everything beside it up too, or name what's left. (D13)
- A gate must call the same code the screen calls, or it proves nothing. (D19)
- Every menu screen and pop-up must pass clipcheck: no cut-off text, nothing under the notch, taps 44 px or more. (D4)
- Show only what applies: a stat, field or line that means nothing for this item ("Defeated x0") is left out. (D5)
- Acceptance waits on the shared gate, not on your own test. (D18)
- Merge the latest main or release into your branch BEFORE you shoot or judge anything, and stamp the base commit on every sheet. (D23)

**Facts and measuring**
- Check a fact in code before acting on it. Read the value, not a comment; grep the whole tree, not one file. Memory and summaries are not a source. (D7, D24)
- Test the measuring tool before trusting its numbers. Our first-timer bot was wrong for days. (D15)
- Spread every fix to its pair: x and y, up and down, left and right, every world with the same pattern. (D21)
- Prove a change is needed with the fixed tool; revert what isn't needed (w8-rope2, Nov 1).
- Time comes from `TZ=America/New_York date`, never worked out by hand. (D20)

**Stages and play**
- A first-timer's natural run must collect enough for the goal; pickups sit on the natural path. (D8, D14)
- Anything placed once (finds, notes, snails) has an always-place fallback and a test on every layout. (D9)
- In-play words draw above every world thing, below the HUD, and never cover where the player must act. (D10, D22)
- Every prop stands on something. (D16)
- Check cutscene frames, not just that the scene plays. (D17)
- Quality steps never do heavy work on the play frame. (D11)
- Anything drawn into a cached canvas must survive the phone losing its canvas: re-bake on restore, and test it. (D6)

**Words**
- Player-facing words are written per item, in the character's voice. No filler, no repeats on a page, no apology for missing data. (D1, law 6)

**Art and money**
- Hugging Face has $72 left, total, no top-ups. Matt approves every picture list, one at a time, before any spend.
- Judge art against the absolute floor (floor.py in hf-backdrops.md), not against a weak "before". (backdrops, Nov 1)
- Never Gemini prompts; Hugging Face only.
- Show first: any big look change goes to Matt as stills or a mock-up before it is built.

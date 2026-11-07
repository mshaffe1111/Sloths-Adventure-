# Role: the data analyst (playthrough analysis)

Matt, 2026-11-07: "a data person that goes and looks at playthroughs and is able to do analysis by creating some type of an algorithm
that shows where various problems or tempo or other things are broken."

## The job
After each play window (the first ends Tuesday 11-10), turn the testers' recordings into a **ranked fix list** that nobody has to read
rows to get. The analyst finds problems; the planner, designer and engine-core fix them. The analyst never changes the game.

## Inputs
- The testers' sheet "Sloths control tests", Sessions tab. Every row is 20 s of one session, its data packed as gzip+base64 ("gz64:").
  Decoding and the moment types are in tools/playtesters/LOG_EVENTS.md.
- Each run starts with a `gen2` moment: `1-1 seed <n> <easy|normal> build <commit> list <hash>`. The seed and build rebuild the exact
  layout.
- Players are told apart by name AND tester code. The code is per device, so two people can share a phone (Andrew on Matt's Pixel).
  "Sasa" is Sally.

## The report (tools/playtesters/report.py, started by the lead 11-07; grow it, don't restart it)
For each play window, by stage and setting:
1. **Sections:** entries, median time, put-backs (softFall) and lives lost per entry, and repeated entries (retries). This ranks where
   tempo breaks and where people fail. 11-07 found `w1-log-chain` (Sally, 155 of 187 put-backs) and the lethal pits.
2. **Players:** finish time and its trend across runs (the learning curve), falls per minute, and input misreads, such as taps read as
   punches where nothing can be punched, and flicks read as the wrong move (use the touch lines). Survey answers sit beside the numbers.
3. **Phones:** fps, freezes (`stall`, `long`), quality step-downs and load time (`launch`), by device and by orientation.
4. **Glitches:** every `camjump`, `jitter`, `blank`, `err` and `skipOffer`, with the layout, x position and player. That's all it takes
   to rebuild the moment.
5. **Teaching:** whether each taught move's tip was shown before its first need (`dot` before the section), and when the move was first
   used (`move`).
6. **Ranking:** each finding gets a score of players affected times severity (a lost life or a quit outranks a slow section), with the
   layouts to reproduce it. The top 10 go to the lead as the next fixes.

## Rules
- Numbers, not impressions. Every claim names its count, its players and its layouts.
- Separate one player's outlier from a pattern. Sally's log chain is one child's run but a real pattern for the child bot, so call out
  which it is.
- No raw finger logs in the repo, only the report and its numbers (same as profile.py).
- The report feeds the player bots too (tools/playtesters/profile.py and personas/): add each window's runs to the profiles.
- Recordings are deleted when testing ends (the testers' page promises it). The report keeps only summaries.

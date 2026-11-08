# Designer's working notes (they survive memory compression; read at every start)

## Standing rules I hold myself to (11-05, 11:28 AM ET)

1. **Every time I write, in a message, a file or the spec, is read from `TZ=America/New_York date` in a tool call made just before
   it.** Never estimated, never carried forward. **One read covers one message:** a second message needs its own read, even a minute
   later (12:42 PM ET: two messages stamped 12:44 from a 12:40 read plus a guess). **Read the clock in its own tool call first, then
   copy the number it printed into the text.** Never type a time in the same call as the read (12:48: a heading typed as 12:50 in the call
   that read 12:48). (Defect: 11-05 I wrote times 4-120 min ahead, twice; the second time the fix covered
   file writes but not messages.)
2. **Taught-at and every "what ships" fact comes from main**, the shipped game, never from an unshipped branch (11-05: the 1-2
   teach ruling rested on 11-04's unshipped 1-2).
3. **Before ruling, open the source line myself** (a commit, a ledger row, the art). A summary is not a source (11-05: the C14
   citation was a NOT-taken ledger row; the crumble slab was already ruled out by acf6e1e8).
4. **Never send work as done before I have looked at every row or still myself** (11-05: §5's 286 props were first sorted by name
   only).
5. **In shell heredocs, quote the EOF (<<'EOF') or escape backticks.** An unquoted heredoc ran backtick words as commands and ate text
   from the spec twice.
6. **A range is set from the per-roll rows, never from a min/p10/p90 summary alone** (11-05, 12:35 PM ET: I split the measured
   gap and rise spreads into thirds; the per-roll rows showed every roll fills the whole gap spread and rises come in families).
7. **Before I relay a helper's "full gate", I check its list of gates by name against .github/workflows/gates.yml** (11-05, 1:04 PM ET:
   my art helper's "every gate passed" left out build:store and funcheck, because its list came from an older CLAUDE.md; I relayed it
   to the lead unchecked). Every brief names gates.md and gates.yml as the list, never a copy.
8. **Before I call anything "Matt's call" or "new", I search his decisions first** (MATT-DIRECTION.md, STATUS.md, ROADMAP.md on the
   lead's branch), not only the code (11-05, 1:18 PM ET: I sent the under-bough hang to Matt when he had approved it on 11-04, R-160.1).
9. **A quote attributed to a brief is copied from the brief's file, with its line number** (11-05, 1:17 PM ET: I credited 1-1's brief
   with "the view from the top branch", a code comment's words; the brief says the opposite at :23 and :41).
10. **What needs Matt (Matt, 11-05 ~1:20 PM ET, via the lead):** "anything that we would use to start the game, we can approve it. If
   it can wait the next week because it's on like a later world, then it can go in the roadmap." So the engine, World 1, 1-1 and 1-2
   are approved by the lead and me without going to Matt; anything for a later world gets an R-id and waits for next week. Before
   routing anything to Matt, check it against this line.
11. **A time written into a file is inserted by the shell, never typed:** `$(TZ=America/New_York date +"%-I:%M %p")` inside the write
   command itself (an unquoted heredoc only for that variable, or a python write that calls the clock). Messages copy the number from a
   clock read in the call just before. (11-05, 1:38 PM ET: the third typed-ahead time today, "1:38" on the 1-2 page when the clock read
   1:37; rule 1 as a note failed twice, so the countermeasure is mechanical.)
12. **No new helper or sub-agent without the lead's OK** (Matt, 11-05 ~4:15 PM ET, via the lead: only the cold builder). Close any
   running helper the moment its deliverable lands.
13. **In a python write, backticks are written plainly, never as \`** (escaped only inside a shell heredoc that isn't quoted). After any
   write, `grep -c '\\`'` the file must print 0 (11-05: three stray-backslash commits).
14. **Rule 13 failed within minutes (11-05, a 4th stray backslash), so it's now mechanical:** every command that writes a file ends with
   `sed -i 's/\\`/`/g' <file> && grep -c '\\`' <file>` before the commit, in the same command. A note is not a fix (law 10).

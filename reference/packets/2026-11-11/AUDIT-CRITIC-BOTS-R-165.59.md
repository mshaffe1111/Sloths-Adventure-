# AUDIT of the BOTS packet (before dispatch, D34)   to: Critic   model: claude-opus-5-5   effort: medium
Assume the packet is wrong; prove where. Read CRITIC-BOTS-R-165.59.md beside this file, roles/CRITIC.md, LESSONS.md D37-D39.
- Every fact in Frozen inputs, checked by running or reading the code it names (D37): the profiles' path and head, the tier membership and
  run counts, FirstTimer at firsttimer.ts:71-122, botBaseline's flags, layouts.ts and list e03e9c8c, jumpHoldMs's definition, the A1 head.
- Can done-item 2 be met at all? Do the profiles hold every number it compares (finishSeconds, livesPerRun, putbacksPerRun,
  doubleUsedShare, pieces), per tier and setting, and does firsttimer.ts produce each (or what must be added)? Is 40 runs per tier per
  setting feasible in time (time one run)?
- Is anything the bots need missing from the profiles (the sheet is being purged)? Name it.
- The tolerances: are they honest for n=44-48 runs, and is the child exemption right for 6 runs?
- WRITE list complete and nothing outside it needed.
Return ONE send_message to the lead, 12 lines or fewer, opening "BOTS PACKET: PASS or REJECT"; each finding as line | rule | evidence |
exact fix.

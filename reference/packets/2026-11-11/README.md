# The first packets (R-165.66), written 11-07 by the lead; a fresh Critic audits them before use
**Start:** Monday 11-09 (Matt: "Lets create our team and start this week. Right now the team must be fable 5.2"). The folder keeps
its 11-11 name. Every member is its own session (create_session, model "claude-opus-5-5"; Matt, 11-09: "They should have their own bot", then that evening "Keep others now on opus", R-165.76) until Matt says otherwise, and reports to the lead with send_message.
**Dispatch:** the DESIGNER goes first, 11-09. The ANALYST goes as soon as its packet passes (Matt, 11-09 evening, R-165.77: pull the data now; it reads the rows to date and a delta when the window closes Tuesday 11-10); the two share no WRITE file. The PACKER runs after the analyst's PASS, then the CONSULTANT (persona + package only, never a packet). The
ARCHITECT runs after the Designer's PASS. The Critic builds the player bots (personas/, profile.py) only after the analyst's PASS.
Each builder's result goes to a fresh Critic with the matching AUDIT-*.md.
**Every prompt:** the role card's "Who you are", word for word, then the packet (the packer has no card: its packet carries its own
short persona, CONSULTANT.md "the packer is a separate member that follows written steps").
**Cards:** until this branch (ccr-ca657d3c-n09zty) merges to main, the sharpened cards live only here. Members branch from origin/main
but read roles/README.md, their card, EVERY file of its pack and these packets with `git show origin/ccr-ca657d3c-n09zty:<path>` (main's copies are older: no own-session rule, no float ruling, no D36). A fresh session holds only its own branch, so first run `git fetch origin main ccr-ca657d3c-n09zty` (the packer also: `level-samples ccr-23292c36-550qmt t-w11-analyst`).
**Reports:** REPORT.md has the 7 sections of roles/README.md plus the two LESSONS.md:8 asks, "Method used" and "Lessons applied", as its first two lines.
**Times:** fill each `due:` from `TZ=America/New_York date` at dispatch, never ahead. **Effort** is the lead's call (Matt, 11-07).

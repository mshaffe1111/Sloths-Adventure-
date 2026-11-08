# Wednesday 11-11 packets (R-165.66), written 11-07 by the lead; a fresh Critic audits them before use
**Dispatch:** the ANALYST and the DESIGNER run at the same time from the reset; they share no WRITE file (the lead's call, recorded in
STATE.md's open graph). The PACKER runs after the analyst's PASS, then the CONSULTANT (persona + package only, never a packet). The
ARCHITECT runs after the Designer's PASS. The Critic builds the player bots (personas/, profile.py) only after the analyst's PASS.
Each builder's result goes to a fresh Critic with the matching AUDIT-*.md.
**Every prompt:** the role card's "Who you are", word for word, then the packet (the packer has no card: its packet carries its own
short persona, CONSULTANT.md "the packer is a separate member that follows written steps").
**Cards:** until this branch (ccr-ca657d3c-n09zty) merges to main, the sharpened cards live only here. Members branch from origin/main
but read their card, its pack and these packets with `git show origin/ccr-ca657d3c-n09zty:<path>`.
**Times:** fill each `due:` from `TZ=America/New_York date` at dispatch, never ahead. **Effort** is the lead's call (Matt, 11-07).

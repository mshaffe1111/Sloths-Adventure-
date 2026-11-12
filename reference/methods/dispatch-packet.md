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

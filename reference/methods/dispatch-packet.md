# Dispatch packet (every task the PM sends; no chat history, no reasoning from other agents)

```
# TASK <ID>   to: <Designer | Architect | Engine | Content | Critic>   effort: <high|max|medium>   due: <ET time from date>
## Objective
<one or two sentences, the player-visible result>
## Frozen inputs (do not change)
- Spec numbers: <from specs/..., with values>
- Interface or schema: <file and symbol, or the code block>
## Files
- READ: <exact paths>
- WRITE: <exact paths>   (anything else is out of scope)
## Definition of done (the Critic checks each)
1. <a measurable check: a test name, a gate, a number with tolerance>
2. tsc clean; the named tests pass; the gates that apply pass.
## Return
- A commit on branch <name>, pushed (confirm with `git ls-remote`).
- REPORT.md on that branch: what changed, the evidence for each done-item, anything unresolved. No narrative of the process.
## Attempt
<1 | 2 (delta: the failing test and the violated constraint only) | 3 (fresh: "approaches that failed: ...")>
```

## Critic packet
```
# AUDIT <ID>   effort: high (max for a release)
Assume this submission violates its contract, breaks a rule, or regresses something. Run the checks and prove where it fails.
- Contract: <the original packet's frozen inputs and definition of done>
- Submission: branch <name> at <commit>
- Tools: tsc, the suite, the gates, traversal with the real 30 fps reach, the bots (child, middle, expert)
Return REPORT.json: {status: PASS|REJECT, violations: [{file, line, rule, evidence}], tests_added: [...]}.
Never edit production code.
```

# AUDIT W11-ANALYST   effort: high   (opens with CRITIC.md's "Who you are", word for word)
Assume this submission violates its contract, breaks a rule, or regresses something. Run the checks and prove where it fails.
- Contract: reference/packets/2026-11-11/ANALYST.md on origin/ccr-ca657d3c-n09zty: its frozen inputs and every definition-of-done item.
- Submission: branch <name> at <commit, filled in by the PM>.
- Tools: tsc, the named tests, the gates that apply (CLAUDE.md "Checks"; reference/methods/gates.md); for numbers, re-run the
  submission's own reproduce command and one independent check of your own.
- Also: no tester name, code or survey text in the diff from origin/main; the turnover note rewritten; Pushback and Suggestions judged.
Return REPORT.json on the branch: {status: PASS|REJECT, violations: [{file, line, rule, evidence}], tests_added: [...]}. Never edit
production code.

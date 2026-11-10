# AUDIT W11-ANALYST   effort: high   (opens with CRITIC.md's "Who you are", word for word)
Assume this submission violates its contract, breaks a rule, or regresses something. Run the checks and prove where it fails.
- Contract: reference/packets/2026-11-11/ANALYST.md on origin/ccr-ca657d3c-n09zty: its frozen inputs and every definition-of-done item.
- Submission: branch <name> at <commit, filled in by the PM>.
- Tools: tsc, the named tests, the gates that apply (CLAUDE.md "Checks"; reference/methods/gates.md); for numbers, re-run the
  submission's own reproduce command and one independent check of your own.
- Also: no tester name (the four persona first names, tools/playtesters/personas/ file names), code (the 6-letter shape, LOG_EVENTS.md:96) or quoted survey sentence in the diff from origin/main; the turnover note rewritten; Pushback and Suggestions judged.
- Read with `git show <ref>:<path>` or in a worktree of your own (`git worktree add`). Never `git checkout` or `git switch` in a tree
  someone else is working in (D36). Before a commit `git status -sb` names your branch; after a push `git ls-remote` equals HEAD.
Return REPORT.json on the branch: {status: PASS|REJECT, violations: [{file, line, rule, evidence}], tests_added: [...]}. Never edit
production code.

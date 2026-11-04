# Method: breaking down research into a ledger (D29, 2026-11-04)

Best measured result: three helpers at high effort, one per line range, about 15-20 minutes each, read 119 KB + 53 KB of research
into 488 rows on 2026-11-04 (ledgers in reference/research/ledger/).

1. Save the research whole in `reference/research/` first. Check that any older triage or summary is about the SAME text (the
   11-02 triage turned out to be about an earlier paste, not the full report).
2. Split the text by line range so each helper reads every line. One row per idea, number, table row or worked example.
3. Columns: research line | what it says (keep its numbers) | in our summary? | in rules / plan / roadmap / validator? (cite) |
   status in code (IN / PART / NOT, file:line) | proposal. Grep `reference/GEMINI-LEDGER.md` too: it already rules on some ideas.
4. Check every claim about OUR game in code with grep before trusting it, including our own plan's and rules' claims (a third of
   the 11-04 part 2 findings corrected our own papers).
5. Count the ledger's columns with a script, never by hand.
6. Sections in order: missed or flattened (ranked by how much it fights "everything feels the same"), where our rules contradict it,
   facts about our game it gets wrong, the full table.
7. The lead checks every top miss against the source line itself and gives it a home (rule, plan item, R-id, or "not taken" and
   why) before any build draws on it (LEAD-PLAYBOOK 8h).

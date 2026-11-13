# The lead's Kanban board (R-165.75; Matt picked it 11-09)

What it is: one phone page for Matt that shows where we are and where we are going: the road to the goal, who is working, and five
lanes (Needs Matt, To do, Doing, Checking, Done). Each card is one roadmap item.

- Data: tools/board/board.json (lanes, order, plain titles, the team strip). Owner, hours and state come from reference/ROADMAP.md.
- Build: `python3 tools/board/build.py` writes tools/board/dist/board.html (not kept in git). It fails when a card has no roadmap
  row, sits in two lanes, is in Done without a done state on the roadmap (or the reverse), or Doing holds more than its limit.
- Publish: the Artifact tool on tools/board/dist/board.html; a later session passes the page's URL (STATE.md "The team now") so the
  link never changes.
- When: at every decision, every member start or stop, every Critic verdict and every release. A card moves right only when the step
  before it is finished: built work goes to Checking, and only a Critic's PASS (and the roadmap row marked done) moves it to Done.
- Words: plain, for Matt on his phone. No file names, no session ids, no tester data.

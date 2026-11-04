# Method: keeping the roadmap (one list, always true)

Last proven: 2026-11-01, branch roadmap-keeper, the first build of reference/ROADMAP.md (90 open, 16 archived). Owner of the last update:
roadmap-keeper helper.

Handoff and live notes: `reference/notes/roadmap-keeper.md` (read it first, and after every memory compression).

## When to use it
- When the lead forwards something Matt raised ("R-new: ...").
- When a defect is logged, a known list gains a group, a helper writes a NEXT.md, or a job reports.
- After every release (the sweep below), and before the debrief.

## The one list
`reference/ROADMAP.md` is the source. The Claude Doc's "Roadmap to go" (https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa) mirrors it;
when they differ, the repo wins and the doc is fixed the same day. No other file keeps its own to-do list without an R-id that cites it.

## Writing an item
1. **Number:** Matt's own list is R-1..R-13 (pieces R-1.1, R-1.2, ...). A piece of an existing topic is its next free R-n.m; a new topic
   is the next free R-n (above every number ever used, including the "Draft numbers retired" table). Done work is archived as A-n.
   Never reuse a number, never renumber one Matt has heard (2026-11-01: draft numbers clashed with the ones the lead had given Matt;
   the clash cost a rebuild and is why the retired table exists).
2. **What:** plain words, what a player or Matt would notice, then the fix. Matt's own words in quotes with the date when he gave them.
3. **Area:** the table it sits in (Matt's R-1..R-7 and R-10 topics first, then R-141..R-149: Worlds 1-8, gen2 W1-5, stranded branches, Art, Sound, Controls, Play Store, Tools, Decisions). One area per item; split an item that spans two.
4. **Time and size: estimates come from measured history, not guesses** (Matt, 2026-11-01, R-12: "We've done everything we've done so
   far was within 3 weeks. And it's talking about 3 months of work."). Time is helper hours, written `N h (like <past job> (<its
   measured time>))`. Measure the past job from git (the branch's first own commit to the merge that took it: `git rev-list
   <merge>^1..<merge>^2`, first and last author times) and from STATUS (start line to accept line; git under-counts a helper merged more
   than once). With no similar past job, write `no history: range A-B h` and the nearest job. Size follows the hours: S up to 2 h, M up
   to 6 h, L over 6 h. Plan a lane at about 6-8 helper hours a day. Pitfall we paid for: on 2026-11-01 sizes were set as "half a day /
   1-2 days / 3+ days" by feel and came out 2-4x too long (helpers measured 1.5-2.5 h for jobs sized at a day), so the estimate read 3
   months when history said about 3 weeks.
5. **Tier** (Matt's R-10, his names): `Day 1: why` (in at launch: PARTNER.md's goal, PLAY-STORE-RULES §1 hard gates and §4 bars),
   `Important: why` (wanted, not required for launch), `Parking lot` (after launch), or `Matt` (asked as an R-149 question). The reason
   quotes its source or says what was measured and when; it never claims more than the source (2026-11-01: five reasons had to be
   softened). Value A-F (R-11) must agree: a Day 1 item is A or B, or its tier says "graded X because".
6. **State:** `open`, `in progress`, `blocked (by R-n or a person)`, `held (by money or Matt)`, `verify` (a fact must be checked in the
   code first), `done (date, PR #n or commit)`.
7. **Owner:** a helper's job name, `lead`, `Matt`, `roadmap-keeper`, or `unassigned`.
8. **Source:** where it came from: a file path, a doc link, a defect number (D#), a known-list group (e.g. `clipknown G4`), a NEXT.md.
   The gate reads this column.

## Planned vs actual (Matt, 2026-11-04; LEAD-PLAYBOOK 8f, roles/SUPERVISOR.md)
1. **A job starts:** its row's State says who, when and the expected hours: `in progress (<helper>, started about 9:35 AM ET
   2026-11-04; expected 2 h)`. The keeper sends bot-fix (the supervisor) each running job's estimate and start, from the row.
2. **A job ends** (the lead's accept line in STATUS; git for the branch's first and last commit): the Time cell keeps the estimate and
   gains the real hours after it, `2 h (like ...); real 2.5 h (9:35 AM to 12:05 PM ET, STATUS)`. The gate reads the first number,
   so the estimate stays the plan; the real hours are the record.
3. **The calibration list grows:** the job goes into BUILD-PLAN's "How the times were measured" with its real hours, and the next item
   of that kind is sized from it. When a real time is far off its estimate (over half again, or under half), re-size the open items
   measured from the same past job, and say so in the report.
4. Real hours are running time from the start line to the accept line, never guessed; when a line is missing, write "real: not
   recorded (why)".

## Reports
Every keeper report carries "Method used" (this file), "Lessons applied" (the reference/LESSONS.md lines that touched the job) and
"Method update" (LESSONS.md, the lead 2026-11-01).

## Law 3 for the roadmap
Every state is checked before it is written: a "done" names a PR or commit that `git cat-file` finds and that is in main (`git merge-base
--is-ancestor <commit> origin/main`); a "live" claim is checked in the code (which builder a world uses, which branch holds a build).
A tick in an old doc is not proof. When no proof is found, the item is `verify`, never archived on trust (2026-11-01: five doc ticks had
no traceable PR: R-137).

## Closing an item
- The work is on main (merged by Matt's release PR), or is process work on the lead's branch. Move it to "Done (archive)" as the next
  A-n with the date and the proof (PR number, commit). The gate checks the PR's merge commit and that the commit is in the history or
  on a branch.
- Partly done: split it. The done half is archived with proof, the rest keeps the old id.
- No longer wanted (Matt dropped it, or a later decision replaced it): archive it with "dropped (date, who, why)". Matt's words stay.

## The sweep (after every release; also before each debrief)
1. `git log --first-parent <last release merge>..origin/main`: for every merged branch, close the items it finished (proof: the PR).
2. Re-measure: add the jobs merged since the last sweep to the calibration list in BUILD-PLAN.md ("How the times were measured"),
   and correct any item whose calibration a new job contradicts.
2b. Run `node tools/roadmapcheck.mjs`: it lists orphans (a defect, known-list group or NEXT.md with no R-id) and done items with
   a bad proof. Add or fix each.
3. Read the new defect-log rows and every NEXT.md changed since the last sweep; file what is open. The gate also fails when a defect has
   no line in reference/LESSONS.md or a method file is missing from reference/methods/README.md: the lead writes those (helpers only
   propose), so each gap becomes an R-item owned by the lead (e.g. R-148.12).
4. Re-rank "Next up (the trio)" with the lead: Matt's order first, then what unblocks most items.
5. Recount the totals and the estimate (the table at the end of ROADMAP.md).
6. Write a "Roadmap changes" paragraph for the debrief (closed, added, re-ranked, estimate moved by how much and why) and send the lead
   the diff (`git diff <last sweep>.. -- reference/ROADMAP.md`).
7. Mirror the changes into the Claude Doc (read with kind "view" first; old text moves to the archive section, never deleted).

## The bar
- Example: R-20 (3-9 ring wall): what the player hits, the measured numbers (330 px wall, 350.5 px reach), the fix list, the ticket link.
- Example: R-62 (icons B-E): the state names the branch and commit that holds the work and the person it waits on.
- Example: R-3 (World 4 built): archived with PR #30, checked with `git merge-base`.

## Pitfalls we already paid for

- **A summary went stale under an updated table** (2026-11-02): BUILD-PLAN's "So: about 3 weeks" line and the same paragraph in the doc stayed wrong for about five hours while the totals above them changed. Mechanism: roadmapcheck fails when BUILD-PLAN's "roadmapcheck prints N" is not today's Day 1. Step: after any total changes, grep BUILD-PLAN, ROADMAP and the doc for the old numbers and dates, and re-read the prose under each table, before reporting.

- **A commit id or doc rev written before the command returned** (2026-11-02, twice: "0c..." and "2c..." sent to the lead). Countermeasure (lead, 2026-11-02, like the date rule D20): push and print the id in ONE command, `git push -q -u origin roadmap-keeper && git log -1 --format=%h origin/roadmap-keeper`, and paste only that output into the report; the doc rev only from the doc's own ack. Never an id or rev from memory or typed ahead. Root cause of the third slip (same day): the report message was sent in the SAME parallel batch as the push, so it was written before the output existed. The report is always its own later step, sent only after reading the push's printed id.

- **Lane loads summed by hand drift** (2026-11-02): moving R-6.26 to lane 1 without taking it out of lane 5's sum, and closing R-1.1 without taking it out of lane 2's, made the reported busiest lane 2-6 h wrong for two reports. Sum lane loads from BUILD-PLAN §2's tables by script every time an item moves, closes or is added.
- 2026-11-01: "no open sound item is written anywhere" was written after searching only the files already open; audit-2 Build 3 had
  five. Before writing that something does not exist, grep the whole tree (`git grep -n -i <words>`) and the inventory (D24).
- 2026-11-01: draft 1 was built before the lead's inventory arrived and had to be rebuilt. When an inventory is on its way, gather and
  check facts while waiting, but send nothing as "the list" until it is merged.
- 2026-11-01: a retired-numbers table pointed at numbers that no longer existed. The gate now fails any number that isn't defined.
- 2026-11-01: the old roadmap kept "Now (in flight)" items from Oct 25 (PR #27, #28) for a week after they merged, and never marked
  Worlds 4-8 done. Cause: nobody owned closing items. Fix: the sweep after every release, and the gate's done-proof check.
- 2026-11-01: the lead's working branch (ccr-...) is far behind main and diverges; reading STATUS there and code on main is right, but
  never merge it into the keeper branch (four conflicts in shared docs).

## Tried and didn't work
- 2026-11-01: numbering a fresh draft from R-1 while the lead had already given Matt R-1..R-6. Ask the lead which numbers Matt has
  heard before numbering anything.

## To try
- Let the gate print the totals table so the estimate can't drift from the rows.

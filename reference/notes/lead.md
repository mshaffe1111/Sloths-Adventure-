# Lead's notes (read at every start and right after every memory compression, with the Read tool, before any other work)

Keep this short and current. Rewrite stale lines. Times from `TZ=America/New_York date`.

## Read now, in this order (Matt, 2026-11-05: "make sure you're reading all your notes when you get compressed without me having to beg")
1. reference/LAWS.md, reference/LESSONS.md
2. reference/PARTNER.md, reference/LEADER-STANDARD-WORK.md, reference/CONTINUOUS-IMPROVEMENT.md (the table's last 5 rows)
3. reference/engine/MATT-DIRECTION.md: ALL of it. These are Matt's engine bars, in his words.
4. reference/roles/LEVEL-DESIGNER.md
5. `tail -25 reference/STATUS.md`
6. reference/LEAD-PLAYBOOK.md §8h-8k (research and design rules)
7. the latest reference/daily/*.md review
Then ReadNotifications, then check that the 30-min check-in is armed (list_triggers).

## The job today (2026-11-05): THE ENGINE. Matt: "This engine literally is the game... Done right the first time. No redos."
- "Your tunnel vision today is making sure they don't have tunnel vision." "If we do tunnel vision in this... everybody's gone."
- "Nothing's a guess." Every rule and number is answered from shipped games, the Gemini research with its code, our own research,
  or a run on our code. OPEN does not stay OPEN.
- The engine plans the WHOLE game (W1-W10 moves, water and swims, elements, world kits), builds on what works (no rewrite, a
  regression lock per world), and is helper-ready (a how-to plus a cold-helper proof).
- 1-1 then 1-2 are the ENGINE's acceptance test: time, cost and fixes against a pass line agreed BEFORE 1-1. Fix the engine,
  never the stage.
- The lead does NOT design. The lead checks, approves, sends back, writes story briefs (story and look), and runs the team and the
  checkpoints.
- Ceiling: 55% of the week (Matt, 10:10 AM ET, at 45%). Everyone stops at 53%. Ask Matt for his meter at checkpoints.

## THE BOARD: deadlines and what success looks like (set 10:26 AM ET; Matt: "You set the standards... deadlines... what success looks like. And you hold them to it... catch mistakes early, not late")
Every check-in compares each line below with the clock. A missed time gets a send-back at once with the lesson (8i: bring options
that still make the deadline, never "tomorrow"). Only the lead moves a deadline, and says why to Matt.
| Who | Deliverable | Success looks like | Due (ET) |
|---|---|---|---|
| Planner | Whole-engine cost estimate | each step in % of the week, total vs 55% (stop at 53%), from measured history | 10:45 AM |
| Planner + designer | 1-1/1-2 acceptance pass line | max wall time, max token cost, max fixes after first build; agreed by both, before 1-1 | 11:15 AM |
| Planner | Every-world piece inventory | a table from the code: every platform, prop, climbable, air piece per world, file:line, counts | 11:15 AM |
| Planner | Library extended + sheet by world | all inventoried kinds labelled (draft), real stills grouped by world, staged ones marked | 12:00 PM |
| Designer | Labels ruled, one pass | every kind: element, footing, floats, uses, worlds, teaches; float caps per world with reasons | 12:00 PM |
| Designer | SPEC-TRACE tags | every spec number MEASURED/SOURCED/MATT/DERIVED/OPEN, with citations that check out | 11:45 AM |
| engine-render | w1-new atlas stills | squirrels + hollow logs painted in play, upright + sideways, phone size, polish check | 11:00 AM |
| engine-render | Water zone + splash stills | painted water, pads ON it bobbing, splash, pad-off-water test fails; drawcheck green | 12:30 PM |
| engine-render | 1-1 one-sky test + all gates | test in, tsc/tests/build/drawcheck/clipcheck green, report | 2:00 PM |
| Bootprint (designer's helper) | Still on the shrine bank | phone size, both ways, belongs in the W1 kit, spend reported (cap $3) | 11:30 AM |
| Critic | Interim: the trace half-done | row count traced / total, first MISSING items ranked | 11:30 AM |
| Critic | CRITIC-SPEC.md + trace-check.mjs + verdict | every section of its brief, every fact cited | 12:45 PM |
| Designer | Rulings on the critic's findings | each finding: accepted with the spec change, or rejected with evidence | 1:30 PM |
| Lead | CHECKPOINT 1 for Matt | library sheet by world, render stills, critic interim, cost so far vs meter | 12:15 PM |
| Lead | CHECKPOINT 2 for Matt | critic verdict + rulings, water stills, the build plan for 1-1 with its pass line | 2:15 PM |

## Who (cloud sessions)
- Level designer (leads design): session_01FhBbYPKnBYCweHg8duJSu2, branch engine-spec (ENGINE-SPEC.md, SPEC-TRACE.md coming).
- Planner (builds the engine): session_01FhBbYJaUqNUPxNUvbHdHeN, branch engine-mixer (src/game/mixer/, tools/engine/).
- engine-render (drawing): session_01FhBbYMqz4cxrvhZUgieGTj, branch engine-render. The w1-new atlas, then the water zone + splash,
  then the 1-1 one-sky test. About 4 h from 9:58 AM ET.
- Critic (independent, high): session_01FhBbYM4fHuqB754FFuBefx, branch engine-critic-spec. Research trace + trace-check.mjs,
  guesses, tunnel vision across 5+ worlds, build-on-what-works, helper-ready, stage-specific code in the mixer, verdict. About 2.5 h
  from 10:15 AM ET. It does not read SPEC-TRACE until its own trace is written.
- art-bootprint: under the designer. One HF picture, cap $3. The still comes to the lead before it's wired.

## Held / waiting
- HELD: anything built from ENGINE-SPEC sections A-F (worlds/ladder data, six gates) until the critic reports and the designer
  rules on its findings. The planner works on plumbing only.
- SENT BACK 10:30: the library sheet was World-1-only (no climb/hang/swing, no air); redo from a code inventory of every world.
- Waiting: the planner's cost estimate vs 55%; the 1-1/1-2 pass line (time, cost, fixes) for Matt to OK; the critic's verdict;
  Matt's pick on the deep-pit look (stills sent 11-05 morning).
- Lead to write: the 1-3 and 1-4 story briefs; 6-9's brief (the swimming stage) when the engine reaches W6.

## My own pitfalls (and the countermeasure)
- The start-up print was 34 KB and was cut to a 2 KB preview after compression, so I didn't really get my notes (D36). Now the
  print is small and points here; I READ the files above with the Read tool.
- Combined git fetch aborts on one missing ref: fetch each branch on its own.
- Never type a time; read the clock.
- Never design. Report a design problem with evidence; the designer fixes it.

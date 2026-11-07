# The team: a 6-role hub-and-spoke studio (Matt, 2026-11-07; the lead keeps this current and reads it at every start)

Matt, 11-07: "Let's run our team like this." The model: stateless, context-bounded agents; strict artifact handoffs, never chat; each
role kept separate; context pruned between tasks; every deliverable verified by an adversary before it counts. Sources Matt cited:
MetaGPT (structured SOPs over dialogue), ChatDev (phases, and only the validated result crosses a phase), GameGPT (dependency-ordered
tasks plus critics), Du et al. multi-agent debate and AgentVerse (agreeable reviewers rubber-stamp; adversarial ones catch errors),
MacNet (DAGs pass forward results, not reasoning). The "6 is optimal" figure and the token-saving percentages are heuristics, not
measured laws; we'll judge them on our own results.

## The flow
Matt (Creative Director) → 1 PM → {2 Designer → 3 Architect → 4 Engine, 5 Content} → 6 Critic → PASS or REJECT back to the PM.
Builders never talk to each other. Everything moves as a dispatch packet (reference/methods/dispatch-packet.md) and comes back as an
artifact on a branch.

## The six roles
| # | Role | Who | Owns (write access) | Never |
|---|---|---|---|---|
| 1 | Project Manager / Orchestrator | the lead (this session) | the state ledger (reference/STATE.md), the task graph, the packets, merges and releases, Matt's links | writes game code or invents mechanics. Emergency exception: a one-line fix to unblock a live deploy, logged as a defect. |
| 2 | Systems & Mechanics Designer | fresh agent per task (high) | specs/: the numbers. Jump, double, bounce and glide reach from the 30 fps simulation; gap and rise bands per setting; coyote and buffer windows; the Easy curve; help thresholds; petal arcs; touch thresholds | writes code |
| 3 | Lead Architect | fresh agent per task (high) | interfaces, types, the section and verdict schemas, perf budgets (8 ms at 60-for-30), ARCHITECTURE notes, the list of files a task may touch | writes method bodies or gameplay |
| 4 | Engine Engineer | fresh agent per task (high) | src/game engine, physics, input, camera, the renderer (the WebGL move), the gen2 pipeline code | changes interfaces or game rules |
| 5 | Content & Asset Specialist | fresh agent per task (high) | section data (w1 kit), seed lists, art cutting and the manifest, the backdrop layers, the testers' page copy | touches engine loops or physics |
| 6 | Adversarial Critic & QA | fresh agent per task (high; max for big gates) | tests, headless checks (traversal with the real 30 fps reach, bots), the gates, defect reports | fixes production code. It only writes failing tests and a PASS/REJECT report |

## Outside the graph (not team members)
- **Independent consultant** (reference/roles/CONSULTANT.md): Agent at max, sees only its pack, runs after each play window.
- **Data analyst** (reference/roles/DATA-ANALYST.md): turns play windows into a ranked defect list for the PM.
- **Story keeper (the old lead, session_019iachLiuwNTAZUBSJWUmR3): the ONLY long-lived session kept** (Matt, 11-07: "Too much story
  knowledge"). It owns the story, characters, Dot's voice and the lessons of past releases. The PM asks it before any story, dialogue
  or taste call, and it reviews player text. It's not a builder and not a node in the graph.

## The rules (the PM enforces them)
1. **Packets, never chat history.** Each task: the objective; frozen inputs (spec numbers, interface); allowed files (read / write);
   the definition of done, which the Critic checks; due time. Template: reference/methods/dispatch-packet.md.
2. **Fresh session per task.** Workers start from the packet plus the written methods. Their reasoning is not kept, only the artifact
   (the commit) and its report. Knowledge lives in files: STATE.md, ARCHITECTURE notes, methods/, specs/.
3. **Every artifact goes through the Critic before it counts.** It's prompted adversarially: "assume it is wrong, prove where".
   PASS means it's merged and STATE.md updated. REJECT means only the failing test and the violated constraint go back to the builder.
4. **The 3-strike circuit breaker.**
   - Try 1: the task.
   - Try 2: a delta packet with the exact failure.
   - Try 3: a FRESH builder with the task plus "approaches that failed, don't use them".
   - Then stop: an architecture deadlock goes to the Architect, an unclear requirement goes to Matt as a 3-bullet question.
5. **Effort is set for real** (the Agent tool): designer, architect, engine, content and critic high; the critic max for releases; the
   consultant max; low or medium only for following written steps.
6. **The stage-building order** (from the consultant's root cause):
   - the Designer fixes the reach numbers from the 30 fps simulation;
   - the Architect sets the verdict schema;
   - Content re-lays the sections;
   - the Engine changes the pipeline;
   - the Critic proves the traversal with the real reach and the child, middle and expert bots.

## Transition from the old team (11-07)
The long-lived helpers below hold history but drift with compression; they're retired from building. The old lead is the exception:
it stays as the story keeper. Their branches and notes stay as
references for packets. engine-core / Core Engine Developer, engine-planner, engine-designer, art-director, Tester Data, release-clerk:
finish anything in flight, write a hand-off note to reference/handoffs/<role>.md (what's open, where things live, traps), then stop.
New work goes to fresh role agents via packets from Monday.

## Traps (kept)
- Cloud sessions: permission_mode "auto", never acceptEdits. A helper that says "pushed": check `git ls-remote`.
- Branch deletes are refused from the lead's machine; Matt deletes on GitHub.
- Tester data stays out of the repo except as aggregates (the testers' page promises deletion).
- Times come from `date` in the same step.

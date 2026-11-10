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
| 1 | Project Manager / Orchestrator | the lead (this session) | the state ledger (reference/STATE.md), the task graph, the packets, release candidates and PRs (Matt merges), Matt's links | writes game code or invents mechanics. Emergency exception: a one-line fix to unblock a live deploy, logged as a defect. |
| 2 | Systems & Mechanics Designer | fresh agent per task (high) | specs/: the numbers. Jump, double, bounce and glide reach from the 30 fps simulation; gap and rise bands per setting; coyote and buffer windows; the Easy curve; help thresholds; petal arcs; touch thresholds | writes code |
| 3 | Lead Architect | fresh agent per task (high) | interfaces, types, the section and verdict schemas, perf budgets (Matt 11-06 "build for 60": our update plus draw at 8 ms or less, GPU-RENDERER-PLAN.md:52-59; PERFORMANCE-RULES §1's text still reads 12 ms until R-165.65 changes it and adds a frame-time gate with a planted test; no gate measures frame time today), ARCHITECTURE notes, the list of files a task may touch | writes method bodies or gameplay |
| 4 | Engine Engineer | fresh agent per task (medium, on Opus: Matt 11-09, R-165.84) | src/game engine, physics, input, camera, the renderer (the WebGL move), the gen2 pipeline code | changes interfaces or game rules |
| 5 | Content & Asset Specialist | fresh agent per task (high, on Opus) | section data (w1 kit), seed lists, art cutting and the manifest, the backdrop layers, the testers' page copy | touches engine loops or physics |
| 6 | Adversarial Critic & QA | fresh agent per task (high; max for a release gate) | tests, headless checks (traversal with the real 30 fps reach, bots), the gates, defect reports | fixes production code. It only writes failing tests and a PASS/REJECT report |

7. **Matt talks only to the PM** (Matt, 11-07: "I will only talk to you. You run their efforts and run them. This will be 100 percent
   your team."). No member messages Matt; the PM carries everything that needs him.
8. **Members push back, suggest and go beyond** (Matt, 11-07: "We will allow them to push back, make suggestions and go above and
   beyond."). Pushback with evidence is part of the job and the PM answers it before more work. Beyond-scope ideas come back as
   ready packets; inside their WRITE files, members may do more than asked if it's tested (reference/roles/README.md rules 3-4).
9. **Turnover notes stay current** (Matt, 11-07: "We all need this."). Every role, the PM included, rewrites its note in
   reference/handoffs/ at the end of every task; the Critic fails a task without it. The PM rewrites reference/handoffs/lead.md at
   every decision and release.

10. **The lead runs the team on Matt's standing permission** (Matt, 11-07: "This is now your team fully and have my permission to run
   it as needed."). The lead starts, stops, re-briefs and retires members, sets effort, orders the graph, and accepts or rejects
   work without asking. What still goes to Matt: merges and releases (LAWS 13), Hugging Face spending and picture lists, the decisions
   in STATE.md "waiting on Matt", story and taste calls through the story keeper, and anything that changes his rules.
11. **The lead rotates, and the previous lead stays as the backup** until the next rotation (roles/PM.md §8, "The backup lead").
   **The lead rotates** (Matt, 11-07: clear the lead "so you don't start making bad decisions and become biased"). Matt decides when (11-07: "I'll tell you when
   it's time to retire"); the lead flags each trigger to him at once (roles/PM.md §8). The procedure is reference/roles/PM.md §8; the first handover was 11-07 evening
   (Matt moved it up), with the new lead's first team work on Monday 11-09 (Matt moved the start up from Wednesday 11-11).
12. **Health check, remake and takeover** (Matt, 11-07: "how to check if somebody needs to be replaced and remade, and how to ensure
   that he's able to take over with potentially a team that's in place"): the roster, the drift signs, the three-fact test, the
   remake and taking over a running team are in reference/roles/PM.md §9.

## Outside the graph (not team members)
- **Independent consultant** (reference/roles/CONSULTANT.md): Agent at max, sees only its pack, runs after each play window.
- **Data analyst** (reference/roles/DATA-ANALYST.md): turns play windows into a ranked defect list for the PM.
- **The story keeper is a permanent member (Matt, 11-07: "the story helper always has to stay. He is a mainstay on the team and has
  to be integrated every time.")** Every lead, every rotation: never retire it, never leave it out.
  Matt, 11-07, to the story keeper (relayed by it the same evening): "I'm creating a new lead and will be continually replacing as
  memory fills up. The only written role is you are always on the team and can't be replaced, in charge of story direction." So the story keeper is in charge of story direction: story, characters, Dot's voice and story calls are decided by it, with Matt
  having the final say; the lead brings it every such call and does not overrule it.
  - It is session_019iachLiuwNTAZUBSJWUmR3 (the old lead), in charge of story direction. Its bible: reference/story/STORY-KEEPER.md.
  - Canon versus delivery: the story keeper owns what the story is (canon, plot, characters, voice). How it's delivered in the game
    is bounded by the frame budget, the rules for players who can't read yet, and the Critic's gates. A story beat that can't pass
    those after 2 revisions with the story keeper goes to Matt as one multiple-choice question.
  - **Integrated every time:**
    - A new lead's first message to anyone goes to the story keeper. It says who you are, where the plan stands, and asks what story
      work is open.
    - Every packet that touches story, characters, Dot, player-facing words, a stage's theme or a cutscene names the story keeper's
      review as a done-item, and the PM gets that review before the Critic's PASS counts.
    - Every release's player text is reviewed by it before the PR.
    - It gets the release notes and the STATE.md decisions after each release, so its knowledge stays current.
  - **The role is never replaced. Only if its session itself ends** does the lead start a successor at once. Its first job: read STORY-KEEPER.md and the
    story folder, then rewrite the bible as its turnover note. The lead tells Matt. The role never lapses.
- **Story keeper (the old lead, session_019iachLiuwNTAZUBSJWUmR3): the ONLY long-lived session kept** (Matt, 11-07: "Too much story
  knowledge"). It owns the story, characters, Dot's voice and the lessons of past releases. The PM asks it before any story, dialogue
  or taste call, and it reviews player text. It's not a builder and not a node in the graph.
  Its bible: reference/story/STORY-KEEPER.md (on branch `studio` since 11-07; on main once studio merges). It listed 10 open story threads on 11-07; where each stands: ROADMAP R-165.55.
  Never build from ccr-0d59a91c-oy3imz (it carries the rejected 11-04 src/).

## The rules (the PM enforces them)
1. **Packets, never chat history.** Each task: the objective; frozen inputs (spec numbers, interface); allowed files (read / write);
   the definition of done, which the Critic checks; due time. Template: reference/methods/dispatch-packet.md.
2. **Fresh agent per task, onboarded in full** (one exception: a delta re-audit may continue the same Critic). Workers start from the packet, their role card (reference/roles/<ROLE>.md) with its
   knowledge pack, and their role's turnover note (reference/handoffs/). Their reasoning is not kept, only the artifact (the commit),
   its report and the rewritten turnover note. Knowledge lives in files: STATE.md, reference/architecture/, methods/, reference/specs/.
3. **Every artifact goes through the Critic before it counts.** It's prompted adversarially: "assume it is wrong, prove where".
   PASS means it's merged and STATE.md updated. REJECT means only the failing test and the violated constraint go back to the builder.
4. **The 3-strike circuit breaker.**
   - Try 1: the task.
   - Try 2: a delta packet with the exact failure.
   - Try 3: a FRESH builder with the task plus "approaches that failed, don't use them".
   - Then stop: an architecture deadlock goes to the Architect, an unclear requirement goes to Matt as a 3-bullet question.
5. **Effort is set per task** (since 11-09 every member is its own session on Opus, Matt's word that evening ("Keep others now on opus", R-165.76; the lead stays where Matt runs it; UPDATE (Matt, 11-09 9:05 PM ET: "Move everything to opium 5.5", read as Opus 5.5): every member is on "claude-opus-5-5" with no exception; the Fable 5.2 lines for the coder, the Engine, the Designer and the Architect are withdrawn. Effort stays the packet's line (the Engine at medium)); create_session has no effort setting, so the packet's `effort:` line carries it; Matt, 11-07: "medium for light work, high for more effort, max only when needed... the
   consultant on max", and the lead sets the levels; this replaces the 10-28 "never max unless Matt asks"): designer, architect, engine, content and critic high; the critic max for releases; the
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
New work goes to fresh role members via packets from Monday 11-09 (first planned for Wednesday 11-11), under the fresh lead.

## Traps (kept)
- Cloud sessions: permission_mode "auto", never acceptEdits. A helper that says "pushed": check `git ls-remote`.
- Branch deletes are refused from the lead's machine; Matt deletes on GitHub.
- Tester data stays out of the repo except as aggregates (the testers' page promises deletion).
- Times come from `date` in the same step.

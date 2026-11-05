# Ledger: GEMINI-CRITICAL-AGENTS.txt (how to set up AI helpers so they think)

Helper: research dissection, 2026-11-04 evening (5:09-5:25 PM ET). Method: `reference/methods/research-ledger.md`.
Source: `reference/research/engine-2026-11-04/GEMINI-CRITICAL-AGENTS.txt`, 161 lines, every line read (L1-157 body, L159-161 the
66 works cited). "L" = line in that file.
Compared against: `reference/LEAD-PLAYBOOK.md` (§3, §4, §7, 8a, 8d-8h), `reference/methods/` (README, quality-review, research-ledger),
`reference/engine/LEAD-SKETCH.md`, `reference/CONTINUOUS-IMPROVEMENT.md` D30 (line 115), `reference/STATUS.md` 927-931 (tonight's three
helpers), `reference/research/GEMINI-ENGINE-PROMPT.md` 70-86 (what Matt asked Gemini), `reference/GEMINI-LEDGER.md`.
Grep check (5:19 PM ET): the words critic, premortem, devil, anchor(ing of helpers), bias, temperature appear in NONE of LEAD-PLAYBOOK,
roles/*, LESSONS, LEADER-STANDARD-WORK, PARTNER. D30's countermeasure ("a fresh, unanchored critic attack the pick (LEAD-PLAYBOOK, to
add)") is still not in the playbook. So almost everything below is new to our standards.

Lead's steer (5:20 PM ET, Matt): the research is a direction, not a spec; big picture first, weak points short and only where they
change a decision.

---

## 0. The big picture: what this changes about how we set up and brief helpers

Today our briefs make one helper do everything in one pass: read the lead's idea, design, check its own work, report "done". The doc's
core claim is that this is exactly the setup that tunnels: a model checking itself "exhibit[s] near-zero disagreement with the initial
prediction" (L9), and a model shown its boss's opinion over-weights it "as if it were high-reliability contextual evidence" (L21). Five
changes follow, in order of how much they move us:

1. **Split the thinking into three rooms that never share a pass** (L73, L151): a Designer who only dreams (three truly different
   options, no cost-cutting, no self-critique), a Planner who turns the chosen one into a concrete, testable spec, and a Critic who
   attacks only that concrete spec. Tonight's designer/critic/planner already has this shape; the doc adds the rules that make it work
   (below).
2. **Hide our opinions from the dreamer** (L106, L153: "Prompts must be stripped of user-opinion cues"). The lead's sketch, Matt's
   leanings, and the words we like ("constructive", "data-driven") stay out of the designer's brief and out of the files it may open.
3. **Make the critic a premortem, not a devil's advocate** (L59, L65, L97). "It is 2026-12-04; the engine shipped and failed" turns
   finding holes into the cooperative task. An "always attack" critic "performs worst among all tested diversity configurations" (L59),
   so the critic must be allowed to say VERIFICATION_PASSED when it can't falsify something (L97).
4. **Machines check what machines can check** (L119, L123). Reach, on-screen, repeats, density: beatTrace.ts and tools/validate decide
   those for free. Helpers argue only about what no tool can judge (fun, sameness, cost, risk). This also keeps it cheap.
5. **One round, then stop** (L49, L129): debate beyond one pass entrenches errors on hard problems. Designer -> planner -> parallel
   critics -> planner repairs once -> lead decides. Disagreements stay written down instead of being argued to consensus.

What does not move us: decoding temperature, top-p, activation steering, CAA vectors, Choco/clingo (L21, L83, L89, L95, L104-106,
L119). We can't set those on Claude Code helpers. Their intent maps to things we can do: effort level and brief wording for
temperature, premortem framing and hidden opinions for steering, our own tracer and validator for the solver.

## 1. How to brief each role (the doc's own advice, beside what we do today)

### Designer (the Dreamer)

| The doc says | Line | What our playbook does today |
|---|---|---|
| "generate at least three orthogonal conceptual architectures or experiential arcs ... spanning distinct regions of the expressive range—varying structural linearity, action density, and risk-reward profiles" | L83 | Nothing asks for options. D30 (CONTINUOUS-IMPROVEMENT line 115) says the lead should write 2-3 approaches; it is not in the playbook yet. |
| "the Designer is completely insulated from the Critic's direct feedback so that premature feasibility filtering cannot collapse its creative search space" | L83 | No rule. Our helpers usually see every earlier review. |
| "Blinded to user/peer preference biases" | L106 | The opposite: §3.3 (LEAD-PLAYBOOK 34-37) puts the goal "in Matt's words" and the lead's approach into every brief. LEAD-SKETCH.md line 4 says the designer "must not start from it", but nothing stops it opening the file. |
| "strictly prohibited from performing low-level numerical constraint checking, budget trimming, or defensive risk mitigation during ideation" | L85 | The opposite for builders (they self-check every number). Fine for builders; wrong for a designer. |
| every candidate follows Kishōtenketsu (Ki, Shō, Ten, Ketsu); "favor multi-purpose components where a single mechanism simultaneously addresses movement, defense, and resource pacing" | L85 | GEMINI-LEDGER A1: PART (puzzle rooms only). W1-REBUILD-PLAN line 33: a fixed curve "is itself a pattern the player feels". Take the multi-purpose idea; don't make one arc mandatory. |
| "After adopting an initial Outsider perspective to gain an external analytical view of the problem" | L73 | No rule. Cheap to add: the designer first states the problem as an outsider would, from the research only. |

### Planner (the Realist)

| The doc says | Line | What our playbook does today |
|---|---|---|
| "first construct a formal Concept Graph that explicitly maps entry and exit nodes, critical-path length, lock-and-key state dependencies, branching factor, and node-level functional purposes before instantiating granular content" | L89 | W1-REBUILD-PLAN gives each stage a map shape and node list, written by hand; no graph format. LEAD-SKETCH line 13 plans a ~20-line stage spec. |
| beats as "a bounded action window with explicit duration, entry state, and exit state invariants" | L91 | beatTrace.ts NodeSpec (origin/w1-rhythm 5ef13375, lines 58-74: bpm, bars, steps, x, y) and Trace x1/yOut (line 32): entry and exit are already explicit. IN for flow nodes. |
| "alternates high-intensity action-density sprints with recovery intervals and places distinct visual or structural landmarks at decision boundaries" | L91 | Rests: STAGE-RULES §0b.1, W1-REBUILD-PLAN curve. Landmarks at decisions: not a rule. |
| "Every node and transition emitted by the Planner must be bound to measurable acceptance criteria and testable preconditions rather than vague prose" | L91 | §3.3 asks for "the exact checks it must run", per helper, not per node. |
| on solver failures or critic risks, "executes targeted local repairs, constraint relaxations, or node swaps while preserving the Designer's overarching thematic intent" | L91 | No rule. traceNode already throws with the failing step and reason (beatTrace.ts 380-466), the input such a repair needs. |
| converts "the top five to eight risk clusters into owned engineering actions": prevent (redesign), reduce (buffers or tests), a contingency trigger, or accept knowingly with monitoring; logs them "into a persistent risk register and re-audited at the workflow midpoint" | L67 steps 6-7 | CONTINUOUS-IMPROVEMENT does this AFTER defects. Nothing does it before a build. |
| Matt asked for a planner that "keeps disagreements visible and produces a plan with a measurable first step" (GEMINI-ENGINE-PROMPT.md 81) | n/a | **The doc doesn't answer this.** Its planner repairs and moves on. We add it ourselves (template below). |

### Critic (the Spoiler / premortem red team)

| The doc says | Line | What our playbook does today |
|---|---|---|
| "the Critic evaluates strictly the Planner's formalized specification, never the Designer's person or abstract premise"; Disney: "the Critic evaluates the plan, never the Dreamer" | L95, L73 | Tonight's brief (STATUS 928): the critic "rips holes in the lead's sketch AND the designer's". That fits only if the designer's options arrive as concrete specs. |
| "the prompt states as an immutable fact that the Planner's specification was deployed into production and failed catastrophically six months later. Working backward ... a concrete, action-based forensic autopsy" | L97 | No premortem anywhere in our standards. |
| "3 to 4 specialized sub-personas in parallel via Simultaneous-Talk"; failure causes generated "silently and independently in parallel ... one discrete cause per line"; collected "without permitting immediate rebuttal"; clustered by risk vector, then dot-voted | L95, L67 steps 3-5 | We run one critic. |
| "mandated to audit pairwise and multi-node adjacencies" (Polymorph: a standard gap next to a slow enemy becomes a compound bottleneck) | L97 | One pair rule: funcheck "enemy by a landing" (tools/validate/evaluate.ts 82). Nothing general. |
| "Every objection must prioritize rationale over assertion by citing the exact node, state transition, and falsifying input trajectory" | L97 | quality-review.md §3 "Cross-check, never lean" is close. No rule that an objection needs a falsifying case. |
| "if all formal invariants and premortem stress tests pass without a falsifiable flaw, the Critic judge emits VERIFICATION_PASSED" | L97, L59 | **Our sketch says the opposite**: LEAD-SKETCH.md 4 "the critic must attack it". |
| "hide raw confidence scores from fellow debaters by default" | L53 | No rule. |
| Matt asked for a critic "hunting better/faster/cheaper" that proposes alternatives (STATUS 928; PROMPT 80) | n/a | **The doc's critic only finds failures.** Matt's ask wins: alternatives go in their own section, after the failures. |

## 2. Anti-bias and anti-shallow checks we can use tonight (concrete, cheap)

Each one is a mechanism (LEAD-PLAYBOOK 8d: "Mechanisms, not reminders"), costs no more than one tool call or one line of brief, and
names the line it rests on. Items marked (ours) are not in the doc.

1. **Blind the designer by file list, then check.** The designer's brief lists the files it may NOT open: `reference/engine/LEAD-SKETCH.md`,
   `reference/STATUS.md`, `reference/CONTINUOUS-IMPROVEMENT.md` (D30 describes the sketch), and the "How it fits our engine" section of
   `reference/research/ledger/LEDGER-ENGINE-PAPERS.md` §4 (it cites the sketch). Check: one `list_events` on the designer's session,
   grep for `LEAD-SKETCH`. A read is a send-back. (L106, L153)
2. **No opinion words in the designer's brief.** Strip "constructive", "data-driven", "formula file", "template library", "beat-traced",
   and any "Matt likes / the lead thinks". Give the goal as the problem and the numbers (5 stages cost about 8-10% of Matt's week; 85 to
   go; "everything feels the same", D26). (L153, L21)
3. **Three options that really differ, checked by a table (ours, from L83).** The designer fills one row per option on four axes: who
   decides the layout (hand / template / search / simulation); when the rules act (before, during or after building); the unit that gets
   reused; how a new world gets its variety. Two options that share 2 of 4 cells are one option: send back.
4. **Premortem critics, in parallel, blind to each other.** Fixed premise with a date: "It is Friday 2026-12-04. The engine shipped and
   failed: Matt played World 2 and said it feels the same as World 1, and a stage still costs about 1.5% of his week." One cause per line.
   3 personas (L49: gains stop at 3-4 roles): the player (sameness, fun, fairness), the engine (physics, art, perf, phone sizes), the cost
   (tokens, rework, how many helpers each stage needs). Cheapest real independence: the critic session runs each persona as its own
   subagent given only the specs, then merges. Merging inside one context loses the independence (L43). (L67, L95)
5. **Every objection carries a falsifier, or it's dropped.** Each cause names the spec line, the stage, seed or move string that breaks it,
   and whether a tool can check it (`traceNode`, `checkTrace`, `funcheck`, `levelCheck`) or it is judgment. Tool-checkable ones get run,
   not argued. (L97, L119)
6. **A pass is allowed.** The critic writes VERIFICATION_PASSED for any part it can't falsify. A critic that fails every part with no
   falsifiers, or passes everything, goes back. (L59, L97)
7. **One round.** Planner answers each top cause once: prevent, reduce, trigger, or accept. No second debate. Where two helpers still
   disagree, the plan says so in a "Still disagreed" table and the lead (or Matt) decides. (L49, L67, L129)
8. **Consistency-illusion check.** Where the designer and the critic agree on a choice, the planner writes each one's reason in one line.
   Same answer, different reasons is flagged for the lead. (L53)
9. **Proof of thought, the lead's 5-minute spot check (ours).** (a) Open 5 cited line numbers at random; one wrong cite = send-back
   (LEAD-PLAYBOOK 8a, 8h.4). (b) Every helper answers "what result would make you drop your top pick?"; a vague answer is a send-back.
   (c) Every helper lists what it rejected and why. (d) Every number says its source line or "estimate, unmeasured" (LEAD-SKETCH 18
   already does). (e) After the designer reports, the lead checks which option is closest to LEAD-SKETCH. If that one is the pick, the
   designer must show why it beats the furthest one.
10. **The lead's sketch is a spec under attack, not a judge.** The lead doesn't grade the critic's verdict on its own sketch. That is the
    self-enhancement bias of L53. The neutral judges are our tools and Matt.

## 3. Ready-to-use brief templates

**The doc has no copy-paste templates.** Matt asked for "three ready-to-use brief templates ... written for an AI coding agent"
(GEMINI-ENGINE-PROMPT.md 86). The doc answers with spec paragraphs (L81-97), a comparison table (L99-111) and the premortem protocol
(L67). Those are copied word for word below. Our adapted drafts follow, marked as ours.

### 3a. Verbatim from the doc

**Designer (L81-85):**
> The Designer Brief (Dreamer / Divergent Ideator)
>
> The Designer agent (AGENT_DESIGNER_DIVERGENT) is configured to maximize expressive range and structural novelty within the Dreamer space. Operating at a high decoding temperature (T = 0.85\text{–}1.0) with top-p = 0.95 and supported by a Knowledge Supporter retrieval feed, the Designer is completely insulated from the Critic's direct feedback so that premature feasibility filtering cannot collapse its creative search space. Its core objective is to generate at least three orthogonal conceptual architectures or experiential arcs that satisfy the macro-objective while spanning distinct regions of the expressive range—varying structural linearity, action density, and risk-reward profiles.
>
> To prevent generated concepts from degenerating into unstructured noise or repetitive filler, the Designer brief mandates that every candidate follow Koichi Hayashida's four-stage Kishōtenketsu progression: introducing a clear foundational mechanic or premise (Ki), developing variations under rising demand (Shō), introducing an orthogonal structural twist or perspective shift (Ten), and synthesizing these elements into a cohesive resolution (Ketsu). Furthermore, drawing on Ojiro Fumoto's design philosophy in Downwell and Noel Berry's generic systemic hooks in Celeste, the Designer is instructed to favor multi-purpose components where a single mechanism simultaneously addresses movement, defense, and resource pacing. The Designer is strictly prohibited from performing low-level numerical constraint checking, budget trimming, or defensive risk mitigation during ideation, leaving all operationalization to the Planner and all flaw detection to the Critic.

**Planner (L87-91):**
> The Planner Brief (Realist / Structural Architect)
>
> The Planner agent (AGENT_PLANNER_REALIST) bridges the Designer's divergent concepts and the Critic's adversarial scrutiny within the Realist space. Configured at a moderate-to-low decoding temperature (T = 0.2\t[span_211](start_span)[span_211](end_span)[span_217](start_span)[span_217](end_span)ext{–}0.4) with enforced JSON schema validation and a Path Provider module to formalize step-by-step dependencies, the Planner converts the selected abstract vision into an executable, verifiable structural specification. Following the hybrid architecture of Dead Cells and Mark Brown's boss-key graph methodology, the Planner must first construct a formal Concept Graph that explicitly maps entry and exit nodes, critical-path length, lock-and-key state dependencies, branching factor, and node-level functional purposes before instantiating granular content.
>
> Once the macro-topology is locked, the Planner decomposes temporal execution into discrete Beats modeled on Tanagra's reactive planning representation, where each beat corresponds to a bounded action window with explicit duration, entry state, and exit state invariants. To maintain optimal navigational flow and prevent user fatigue, the Planner alternates high-intensity action-density sprints with recovery intervals and places distinct visual or structural landmarks at decision boundaries. Every node and transition emitted by the Planner must be bound to measurable acceptance criteria and testable preconditions rather than vague prose. When the Planner receives unsatisfiable core traces from the deterministic constraint solver or prioritized risk clusters from the Critic's premortem, it executes targeted local repairs, constraint relaxations, or node swaps while preserving the Designer's overarching thematic intent.

**Critic (L93-97):**
> The Critic Brief (Spoiler / Premortem Red-Teamer)
>
> The Critic ensemble (AGENT_CRITIC_PREMORTEM) serves as an uncompromising reliability and adversarial verification layer within the Critic space. To prevent both RLHF sycophancy and destructive attacks on early ideation, the Critic evaluates strictly the Planner's formalized specification, never the Designer's person or abstract premise. The ensemble runs 3 to 4 specialized sub-personas in parallel via Simultaneous-Talk at a low decoding temperature (T = 0.1\[span_296](start_span)[span_296](end_span)[span_297](start_span)[span_297](end_span)[span_298](start_span)[span_298](end_span)text{–}0.3), with inference activations steered via a pre-extracted critical-role persona vector (reducing forced-choice sycophancy logits by 68% to 98% relative to CAA) and raw peer confidence scores masked to prevent persuasion cascades.
>
> Rather than asking whether the Planner's specification is acceptable, the Critic brief enforces Gary Klein's Prospective Hindsight Premortem anchor: the prompt states as an immutable fact that the Planner's specification was deployed into production and failed catastrophically six months later. Working backward from this certainty, each Critic instance writes a concrete, action-based forensic autopsy detailing the exact causal chain of failure. In addition to checking single-node specifications, the Critic is mandated to audit pairwise and multi-node adjacencies—modeled on Polymorph's difficulty coupling analysis, which demonstrated that individually benign components (such as a standard gap and a slow enemy) create severe compound failure bottlenecks when placed on adjacent landing boundaries. Every objection must prioritize rationale over assertion by citing the exact node, state transition, and falsifying input trajectory. Finally, to prevent artificial polarization when a plan is sound, if all formal invariants and premortem stress tests pass without a falsifiable flaw, the Critic judge emits VERIFICATION_PASSED (Jd = True) to halt deliberation immediately.

**The role table (L100-110), as in the file (its span markers are extraction debris):**
> Architectural Dimension | Designer Agent (Dreamer) | Planner Agent (Realist) | Critic Ensemble (Spoiler / Red Team)
> Primary Cognitive Mode | Divergent ideation; unconstrained exploration | Convergent synthesis; structural operationalization | Prospective hindsight; adversarial falsification
> Decoding Temperature (T) | High (0.85 \text{ – } 1.00) | Low-Moderate (0.20 \text{ – } 0.40) | Low (0.10 \text[span_310](start_span)[span_310](end_span)[span_311](start_span)[span_311](end_span){ – } 0.30)
> Anti-Sycophancy Mechanism | Blinded to user/peer preference biases | Strict schema enforcement & formal graph constraints | Critical-role activation steering + Premortem framing
> Structural Framework | Kishōtenketsu 4-act arc & macro-patterns | Tanagra beat timelines & Dead Cells concept graphs | Pairwise adjacency audit & 3–4 role Simultaneous-Talk
> Primary Output Artifact | Candidate concept briefs & experiential profiles | Formal dependency graph, beat schedule & JSON spec | Clustered forensic failure log & Jd(H) break signal

**The premortem protocol (L67):**
> Adapting Klein's seven-step premortem methodology into an automated multi-agent pipeline neutralizes both sequential anchoring and groupthink. The protocol begins with a brief, non-defensive presentation of the plan, scope, timeline, and success criteria so all agents evaluate the exact same specification. Second, the orchestrator sets a vivid, concrete failure scenario—specifying an exact future date in which the deployment missed its targets, exhausted its budget, and collapsed in production—because specific failure states yield more concrete causal traces than vague prompts. Third, rather than allowing a senior or initial agent to speak first and anchor the group, all red-team agents generate their failure explanations silently and independently in parallel (via the Simultaneous-Talk protocol), logging one discrete cause per line. Fourth, an aggregator collects these failure causes in a round-robin sequence without permitting immediate rebuttal, ensuring that subtle edge cases noticed by specialized minority personas are captured alongside obvious risks. Fifth, the consolidated list is clustered by risk vector—such as scope, technology, dependencies, or external factors—and evaluated via independent dot-voting to prioritize the most damaging or probable failure modes. Sixth, the Planner agent is required to convert the top five to eight risk clusters into owned engineering actions by choosing to prevent the flaw via architectural redesign, reduce it via buffers or automated tests, establish a contingency trigger for runtime switching, or accept it knowingly with bounded monitoring. Seventh, these mitigations are logged into a persistent risk register and re-audited at the workflow midpoint as implementation details evolve.

### 3b. What to change for our project (short)

- **Drop:** the temperatures, top-p, persona vectors, CAA, "JSON schema validation" engines, the Knowledge Supporter and Path Provider
  modules. We can't set them. Use effort `high` for all three (LEAD-PLAYBOOK §7; Matt 3:52 PM ET: no xhigh) and put the intent in words.
- **Drop the mandatory Kishōtenketsu for every candidate.** Make it one option the designer may use. Our own finding is that one fixed
  arc is itself a pattern the player feels (W1-REBUILD-PLAN 33).
- **Reorder for tonight.** Matt's order is designer -> critic -> planner (STATUS 928). The doc's is designer -> planner -> critic -> planner.
  Keep Matt's, but have the designer write each option as a one-page concrete spec (a sample stage spec plus the build path). Then the
  critic attacks specs, never ideas (L95).
- **Add what Matt asked and the doc lacks:** alternatives in the critic's report ("better/faster/cheaper"), a visible "Still disagreed"
  table in the plan, and a measurable first step.
- **Add our standing parts:** the Method line, polish bar, LAWS, Method update / Lessons applied (LEAD-PLAYBOOK 8c; methods/README rule
  2), file ownership (the three helpers write only their own doc), no push.

### 3c. Our adapted drafts (ours, built on the doc's lines; paste and fill the brackets)

**DESIGNER** (effort high; blind)
```
You are the engine DESIGNER for Sloths Rainforest Adventures (phone platformer, 30 fps, touch only). Dream; do not check or trim.
Problem (numbers only): building 5 stages cost about 8-10% of Matt's week; 85 stages to go; players say every stage and world feels the
same (CONTINUOUS-IMPROVEMENT D26). Read: reference/research/README.md and the research it lists, the ledgers in
reference/research/ledger/ EXCEPT LEDGER-ENGINE-PAPERS.md §4, STAGE-RULES.md, src/game/physics.ts. Do NOT open
reference/engine/LEAD-SKETCH.md, reference/STATUS.md or reference/CONTINUOUS-IMPROVEMENT.md (they hold someone's existing idea; we
check your session's file reads).
1. Outsider first: restate the problem in 5 lines as someone who has never seen our code would.
2. Give THREE engine approaches that differ in kind. Fill this table, one row each: who decides the layout (hand / template / search /
   simulation) | when the rules act (before / during / after building) | the unit reused | where a new world's variety comes from.
   Two rows sharing 2 cells count as one option.
3. For each: a one-page spec (how one stage gets made, start to end; a sample ~20-line stage spec; what makes World 7 feel unlike
   World 2; the moment a player remembers). Favor pieces that do two jobs at once (movement + danger + pacing).
4. Do not cost, trim or risk-check. That is other people's job. Do say which research lines each option rests on (file:line).
5. End with: your favorite, what result would make you drop it, and what you rejected and why.
Method: reference/methods/research-ledger.md (cite lines). Report has Method used / Lessons applied / Method update. Write only
reference/engine/DESIGNER.md. Don't push.
```

**CRITIC** (effort high; premortem; parallel personas)
```
You are the engine CRITIC. Read reference/engine/DESIGNER.md (3 options) and reference/engine/LEAD-SKETCH.md (1 option): 4 specs.
Fixed fact, not a question: it is Friday 2026-12-04. The engine we chose shipped and FAILED. Matt played World 2 and said it feels the
same as World 1, and a stage still costs about 1.5% of his week. For each spec, write why it failed.
1. Run three personas as separate subagents that see only the specs and this premise, never each other: PLAYER (sameness, fun,
   fairness, teaching), ENGINE (physics, art, perf budget, portrait and landscape), COST (tokens, rework, helpers per stage). Each writes
   one cause per line: spec line | the stage, seed or move string that shows it | checkable by a tool (name it) or judgment.
2. Merge without rebuttal; cluster by risk; rank the top 5-8 by damage x likelihood. Run every tool-checkable cause (beatTrace traceNode,
   tools/validate funcheck, levelCheck) and record the result; drop any it refutes.
3. Check pairs: two pieces that are fine alone but bad side by side (e.g. a gap whose landing is an enemy's patrol).
4. Where you can't falsify a part, write VERIFICATION_PASSED for it. Passing is allowed and expected when true.
5. Then, separately: better / faster / cheaper alternatives (a cheaper path, a stolen piece from another option, a hybrid), each with its
   evidence.
No "be careful" notes; no confidence words; every cause has a falsifier or it is cut. Write only reference/engine/CRITIC.md. Method,
Lessons and Method update as usual. Don't push.
```

**PLANNER** (effort high; one round)
```
You are the engine PLANNER. Inputs: reference/engine/DESIGNER.md, CRITIC.md, LEAD-SKETCH.md, the Gemini engine ledger and
LEDGER-ENGINE-PAPERS.md. Choose (or combine) and make it buildable tomorrow morning.
1. Concept graph for one sample stage: entry and exit, critical path length, what unlocks what, branches, each node's job.
2. Beats: each node's duration, entry state, exit state (beatTrace NodeSpec + Trace.x1/yOut where they fit).
3. Every node and file has an acceptance test a machine can run (name the test or gate), not prose.
4. Answer each top critic cause once: prevent (redesign) / reduce (test or buffer) / trigger (what we'd watch, and the switch) / accept
   (why). This is the risk register; re-check it at the build's midpoint.
5. "Still disagreed": every point where designer, critic and lead disagree, each side's one-line reason, and who decides. Where two
   agree for different reasons, say so.
6. First step: one job of 2 hours or less with a number that says it worked (e.g. "stage X built from spec in N tokens, funcheck flags
   <= K"). Then the order of work, the files each helper owns, planned hours.
Write only reference/engine/PLAN.md. Method, Lessons and Method update as usual. Don't push.
```

## 4. What's weak or unproven (only what would change a decision)

1. **No real templates, and three of Matt's asks go unanswered** (alternatives from the critic, visible disagreements, a cheap check
   that a helper thought). Decision: we write those parts ourselves (3c, §2.9). Don't wait for more research.
2. **Several knobs are not ours** (temperature, steering vectors, solvers: L21, L83-L106, L119). Decision: don't plan around them.
   Their intent maps to wording, effort, and our own tracer and validator.
3. **Its "critic never sees the designer" rule (L73, L95) clashes with Matt's "rip holes in the designer's" (STATUS 928).** Decision:
   the designer writes concrete specs so both hold.
4. **"Strongest-reasoner ceiling" (L49).** A cheaper model as critic would cap the team. Decision: don't save tokens by downgrading the
   critic's model. Save them by running tools instead of debate (L119) and stopping at one round (L129).
5. **Same base model everywhere** (L32: "Shared base-model priors" drive conformity; our helpers are all Claude). The doc's fix,
   heterogeneous backbones, isn't open to us here. Decision: lean harder on the mechanisms that don't need it: blinding, parallel
   independence, falsifiers, tools as judge. Matt's Gemini run (STATUS 929) is our one real second backbone; give it to the planner as a
   peer input, not as the answer.
6. Many numbers (30%, 68-98%, +52%, 97.82%, the 2026 arXiv papers) come from one-off or unverifiable sources. They don't change any
   decision above, so we don't chase them.

## 5. Where our current standards contradict it

| Ours | Where | It says | Line | Proposal |
|---|---|---|---|---|
| "the critic must attack it" | LEAD-SKETCH.md 4 | an unconditional devil's advocate "performs worst" | L59 | Premortem plus VERIFICATION_PASSED (template 3c) |
| every brief carries "the goal in Matt's words" and the lead's approach | LEAD-PLAYBOOK 34 | strip user-opinion cues for divergent roles | L153 | Designer briefs give the problem and numbers, not the approach. Builders keep Matt's words. |
| one helper designs, builds and self-checks | LEAD-PLAYBOOK §3 | self-reflection repeats the first mistake "with rising confidence" (DoT) | L9, L26 | Big builds get a separate critic (D30's countermeasure, still unwritten) |
| the lead judges its own sketch's critique | (practice) | self-enhancement bias when a participant is judge | L53 | Tools and Matt judge; the lead decides only on the "Still disagreed" table |

## 6. Full ledger (one row per idea)

Status for process ideas = our standards (playbook, methods, roles) as "the code". IN / PART / NOT. "Summary?" = in any summary we
have (the README index line 16 is the only one): "idx" = only named there, "-" = no.

| # | L | What it says (its numbers) | Summary? | In rules / plan / roadmap / validator? (cite) | Status | Proposal |
|---|---|---|---|---|---|---|
| 1 | 3 | Two pathologies: cognitive tunneling, sycophancy; fix by orchestration, debate, premortem, role split, neuro-symbolic checks | idx | STATUS 927-928 names "tunnel vision" | PART | §0 big picture |
| 2 | 9 | Degeneration-of-Thought: self-correction with no outside feedback often makes things worse; later turns show "near-zero disagreement" | - | LEAD-PLAYBOOK §4 "a helper's report is not proof" | PART | Big builds get a separate critic |
| 3 | 11 | Three DoT drivers: heuristic bias, autoregressive rigidity (own text read as fact), no outside view | - | - | NOT | Fresh sessions for critics (no shared transcript) |
| 4 | 13 | Single-pass LLM output is like WFC: locally fine, global reachability fails | - | Thesis evidence: LEDGER-ENGINE-PAPERS T-rows (8.8-23% unplayable) | n/a | Global checks by tool (beatTrace, levelCheck) |
| 5 | 17 | Sycophancy comes from preference training; agreeing with the user predicts high ratings (Sharma 2023, Perez 2022) | - | - | NOT | Hide opinions (§2.1-2) |
| 6 | 19 | Four failure vectors: capitulation under pushback; premise accommodation; biased evaluation of favoured authors; inter-agent conformity | - | LEAD-PLAYBOOK 8a "verify the brief's facts" covers premise checks | PART | Premise check in every brief; the lead doesn't grade critiques of its own sketch |
| 7 | 21 | "be critical" instructions backfire (dulled or contrarian); steering vectors cut sycophancy logits 68-98% of CAA (Gemma 2 27B, Qwen 3 32B; cos < 0.17) | - | - | NOT (not available to us) | Use premortem framing, not "be critical" |
| 8 | 24-34 | Table: DoT -> MAD; local tunneling -> plan/solver split; user sycophancy -> blinding; conformity -> heterogeneous models, simultaneous talk, hidden confidence; persuasion override -> CW-POR audit, symbolic checks | - | - | NOT | Rows 2, 5, 13, 17, 20 below |
| 9 | 39 | Real MAD = 2+ agents, opposing arguments, several two-way rounds; one-way feedback isn't MAD | - | - | NOT | We take one round only (row 28) |
| 10 | 43 | ChatEval protocols: One-by-One (order bias), Simultaneous-Talk (independent first), Simultaneous-Talk-with-Summarizer | - | - | NOT | Critic personas as parallel subagents; the critic merges |
| 11 | 45 | DiMo: same model, divergent mode (high T) vs logical mode (low T), routed by an Evaluator | - | LEAD-PLAYBOOK §7 effort levels by job | PART | Effort and wording stand in for temperature |
| 12 | 49 | Debate improves majority vote +52% (size-4 puzzles), +32% (size-8); instance +41.78/+28.45/+22.23% (4/6/8) | - | - | n/a | Context only |
| 13 | 49 | Strongest-reasoner ceiling: all-weak teams stay poor | - | §7 (high for reviews) | PART | Don't downgrade the critic's model or effort |
| 14 | 49 | Negotiating speaking order: negligible effect | - | - | n/a | Don't spend on it |
| 15 | 49 | Two debate passes worse than one on hard problems | - | - | NOT | One round (§2.7) |
| 16 | 49 | Role diversity helps up to 3-4 roles, then plateaus | - | - | NOT | 3 critic personas |
| 17 | 51 | Good debates: inclusive, rationale over assertion, error correction; agents keep correct minority views more easily than they overturn wrong majorities; MaW->C transitions predict accuracy | - | quality-review §3 "never lean" | PART | Record minority objections in "Still disagreed", never vote them away |
| 18 | 51 | Strong-model paradox: weak teammates can't parse an elite model's arguments | - | - | n/a | Keep critic reports plain (our plain-words rule already) |
| 19 | 53 | CW-POR: confident, fluent wrong agents override hesitant right ones; hide confidence from peers, record it internally | - | - | NOT | No confidence words in critic causes; rank by evidence |
| 20 | 53 | Consistency Illusion: agreement through incompatible intermediate steps | - | - | NOT | §2.8 reasons side by side |
| 21 | 53 | A participant model family as judge -> self-enhancement bias; use a neutral judge or deterministic checks | - | - | NOT | Tools and Matt judge; lead decides only on disagreements |
| 22 | 59 | Static devil's advocate performs worst (Tian & Yin 2026); tit-for-tat opposition polarizes (Liang 2024); use calibrated disagreement with an adaptive break judge J_d(H) | - | LEAD-SKETCH 4 "the critic must attack it" | CONTRA | VERIFICATION_PASSED allowed |
| 23 | 63 | Prospective hindsight (Mitchell, Russo, Pennington 1989): certain-outcome framing gives 30% more causal explanations, twice as many concrete ones | - | - | NOT | Premortem premise with a date |
| 24 | 65 | Klein premortem: "what did go wrong", not "what might"; makes finding flaws cooperative | - | - | NOT | Critic template 3c |
| 25 | 67 s1 | Present the plan non-defensively; all agents read the same spec | - | - | NOT | Critic gets the 4 specs verbatim, no lead commentary |
| 26 | 67 s2 | Vivid failure with an exact date: missed targets, budget gone, collapsed | - | - | NOT | "Friday 2026-12-04 ... feels the same ... 1.5% a stage" |
| 27 | 67 s3 | Silent, independent, parallel; one cause per line | - | - | NOT | §2.4 |
| 28 | 67 s4 | Round-robin collection, no immediate rebuttal | - | - | NOT | Merge without rebuttal |
| 29 | 67 s5 | Cluster by risk vector (scope, tech, dependencies, external); dot-vote | - | - | NOT | Cluster; rank by damage x likelihood |
| 30 | 67 s6 | Planner turns the top 5-8 clusters into owned actions: prevent / reduce / contingency trigger / accept with monitoring | - | CONTINUOUS-IMPROVEMENT (after defects only) | PART | Planner template step 4 |
| 31 | 67 s7 | Persistent risk register, re-audited at the midpoint | - | - | NOT | PLAN.md risk table; the lead re-checks at the build's half-way check-in |
| 32 | 73 | One pass that ideates, plans and critiques at once -> self-censorship or hallucination | - | §3 one helper per job | CONTRA for design jobs | Three rooms |
| 33 | 73 | Disney strategy (Dilts 1994): Outsider -> Dreamer -> Realist -> Critic; the Critic judges the plan, never the Dreamer | - | STATUS 928 (three helpers) | PART | Outsider restatement as the designer's step 1 |
| 34 | 75 | Tanagra/Launchpad: reactive planner picks patterns and beats; Choco solves geometry, guaranteeing playability | - | beatTrace.ts (origin/w1-rhythm) is the constructive half | PART | See LEDGER-ENGINE-PAPERS (Tanagra is ABL+Choco; Launchpad is a different system) |
| 35 | 75 | Dead Cells: hand-authored macro frame + concept graph (length, biome, lock-and-key, special rooms), then compliant rooms | - | GEMINI-LEDGER A5 PART | PART | Planner's concept graph |
| 36 | 75 | Kishōtenketsu against filler; Dahlskog & Togelius micro/meso/macro patterns; Downwell multi-purpose mechanics | - | GEMINI-LEDGER A1 PART | PART | Multi-purpose pieces in the designer's brief |
| 37 | 79 | Briefs as strict functional specs: params, visibility limits, input/output contracts | - | §3.3 brief contents | PART | Each template names its inputs, hidden files, one output file |
| 38 | 83 | Designer: high T 0.85-1.0, top-p 0.95, retrieval feed | - | - | NOT (not available) | effort high |
| 39 | 83 | Designer insulated from the Critic's feedback | - | - | NOT | Critic report never goes back to the designer tonight |
| 40 | 83 | At least three orthogonal options on linearity, action density, risk-reward | - | D30 countermeasure (CI 115), unwritten | NOT | §2.3 four-axis table |
| 41 | 85 | Every candidate follows Kishōtenketsu (Ki, Shō, Ten, Ketsu) | - | W1-REBUILD-PLAN 33 (fixed curve is a pattern) | CONTRA | Optional, not mandatory |
| 42 | 85 | Favor multi-purpose components (movement + defense + pacing; Downwell, Celeste) | - | STAGE-RULES §0.1 "everything builds on everything" | PART | In the designer brief |
| 43 | 85 | Designer banned from number checks, budget trimming, risk mitigation | - | - | NOT | Designer brief step 4 |
| 44 | 89 | Planner: low T 0.2-0.4, JSON schema, Path Provider | - | - | NOT (not available) | effort high; a fixed table format |
| 45 | 89 | Concept graph first: entry/exit, critical path length, lock-and-key, branching factor, node purposes | - | W1-REBUILD-PLAN (map shape per stage, prose) | PART | Planner step 1 |
| 46 | 91 | Beats = bounded windows with duration, entry and exit invariants (Tanagra) | - | beatTrace NodeSpec 58-74; Trace x1/yOut (32) | IN (flow nodes) | Use for every node type |
| 47 | 91 | Alternate sprints and recovery; landmarks at decision points | - | STAGE-RULES §0b.1 rests; landmarks: no rule | PART | Add "a landmark at every fork" to the planner's acceptance |
| 48 | 91 | Every node and transition has measurable acceptance criteria | - | §3.3 checks per helper | PART | Planner step 3 |
| 49 | 91 | On unsat cores or critic risks: local repair, relaxation or node swap, keeping the designer's intent | - | traceNode throws with step and reason (beatTrace 380-466); fitSteps retries up to 160 random tries (w1Rhythm.ts 147) | PART | Repair from the error, not random retries (papers ledger) |
| 50 | 95 | Critic judges the Planner's spec, never the Designer's premise | - | STATUS 928 asks it to attack the designer's | CONTRA (soft) | Designer writes concrete specs |
| 51 | 95 | 3-4 personas in parallel, low T 0.1-0.3, persona vector, masked confidence | - | - | NOT | 3 personas as subagents; no confidence words |
| 52 | 97 | Premortem anchor: deployed, failed catastrophically six months later; forensic autopsy | - | - | NOT | Critic template |
| 53 | 97 | Audit pairs and multi-node adjacencies (Polymorph: gap + slow enemy at a landing) | - | evaluate.ts 82 "enemy by a landing" | PART | Critic step 3; a general pair check in the validator (papers ledger) |
| 54 | 97 | Each objection cites node, state transition, falsifying input | - | quality-review §3 | PART | §2.5 |
| 55 | 97 | VERIFICATION_PASSED halts when nothing falsifiable | - | contradicted by LEAD-SKETCH 4 | CONTRA | §2.6 |
| 56 | 100-110 | Role table (modes, T, anti-sycophancy, frameworks, outputs) | - | - | NOT | §3a |
| 57 | 115 | Naive MAD costs grow quadratically with rounds | - | §7 cost rules | PART | One round; small inputs |
| 58 | 119 | Don't use LLM debate to verify math or reachability; put a deterministic verifier between Planner and Critic | - | beatTrace, levelCheck, funcheck, validator exist | IN (tools) / NOT (as a briefing rule) | Critic must run tool-checkable causes |
| 59 | 119 | Solver returns a minimal unsat core or relaxes constraints automatically | - | traceNode's error names the step and reason | PART | See papers ledger |
| 60 | 121 | 2026 adaptive pipeline: PPO skill classifier 97.82%; Dijkstra physics verifier; playability 83.5% chunk / 74.1% level vs 80.0% human baseline; deterministic local repair instead of re-prompting | - | levelCheck/first-timer bots verify; no repair step | PART | Local repair in code, not by asking a helper again |
| 61 | 123 | FormalAlign beats GPT-4 judging: +11.58% (99.21 vs 88.91), +3.19% (66.39 vs 64.34) | - | - | n/a | Context only |
| 62 | 123 | Pre-filter with expressive-range metrics (linearity, leniency, action density, flow) before the Critic sees anything | - | funcheck (density, repeats, likeness); no linearity/leniency | PART | Run funcheck on any sample stage before critics read it |
| 63 | 127 | Debate only when uncertainty is high (Eo 2025, LASE); DefInt cuts tokens 49-79%; "50% to 80%" savings | - | - | NOT | Critic only on big builds (D30's "before any big build") |
| 64 | 129 | Localized MAD: debate only the divergence node (+7.20 pp); CSMAD only contradictory sub-claims | - | - | NOT | Planner argues only the "Still disagreed" rows |
| 65 | 129 | Hard cap 1-2 rounds with early exit | - | - | NOT | One round |
| 66 | 133-135 | Prefix caching: 12,000-token static prefix + 1,500/step, 10 steps: 187,500 input tokens uncached (checked: 10x12,000 + 1,500x(0+...+9) = 187,500) -> ~48,100 cached (our recount ~51,000 at 10% read / 125% write; close enough), ~74% lower; up to 90% cost and 85% latency cut | - | - | PART (Claude Code caches by itself) | Keep briefs' shared part identical and first |
| 67 | 137-146 | Prefix ordering: L1 static root (domain, tools, rules) / L2 append-only artifact log / L3 role suffix last | - | SessionStart hook prints LAWS and LESSONS first (CLAUDE.md, LEAD-PLAYBOOK 8c) | PART | The three templates share an identical opening block; role text goes after it |
| 68 | 151 | Synthesis: triadic separation; Designer shielded from feasibility filtering | - | STATUS 928 | PART | §0.1 |
| 69 | 153 | Strip user-opinion cues; steering; masked confidence; heterogeneous strong models; neutral judge; protect minority views | - | - | NOT | §2.1-2, §2.10, Gemini as a peer input |
| 70 | 155 | Replace DA with parallel premortem across 3-4 personas; "increases concrete causal flaw identification by 30%" | - | - | NOT | Critic template (the 30% is a human-study figure carried over) |
| 71 | 157 | All formal checks to zero-token verifiers plus expressive-range filters and local repair; debate only at divergence nodes, one pass, early exit; prefix order and caching cut verification tokens 74-90% | - | tools exist; no briefing rule | PART | §0.4, §0.5 |
| 72 | 159-161 | 66 works cited (arXiv 2023-2026, HBR premortem, Disney method, Tanagra FDG 2010, Launchpad 2011, Dead Cells, Polymorph, prompt-caching blogs) | - | - | n/a | Tanagra FDG 2010 full paper (cite 6) is worth fetching: see papers ledger |
| 73 | (PROMPT 78-86) | Matt's asks it leaves open: what to hide (partly L106/L153), how to make the critic propose alternatives, how to stop nitpicking (partly L97 break), planner keeps disagreements visible, context order (partly L137), cheap proof of thought (partly L53/L97), ready-to-use templates | - | - | NOT | Filled by §2 and §3c (ours) |

Row count: 73 (counted by script; see report).

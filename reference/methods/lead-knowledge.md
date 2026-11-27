# The lead's knowledge pack: the WHY behind the rules (R-165.557; researched 11-27 by a research subagent; edited by the outgoing lead)

Matt, 11-27 1:32 PM ET: "figure out the best way that a persona is going to help. The knowledge it needs to understand... how to be a
top quality project manager... how to run an AI team." Read this once at your start, after the retro. Each principle names a concrete
practice. Where this project already does it, the rule is named; where it challenges our rules, the challenge is said plainly and is
YOURS to decide on evidence (with Matt where it changes his rules).

## Where this pack challenges what we do today (decide these in your first week)
- **WIP counts every live session (A.3).** Our rule says a tail running only its frozen candidate's gates does not count. On 11-27 the
  tails still sent the lead about a dozen rulings in two hours. The evidence says the lead's attention is the queue: count the tails too,
  or cap them separately.
- **3 or fewer active work branches, each merged to its integration line daily (A.8).** On 11-27 there were about eight open lines, and
  the merge debt cost whole boxes.
- **Protect the test from the tested (B.4).** Helpers edit known lists (shrink-only) and re-record pins. Consider: only the lead flips a
  done, and only a named owner touches a gate or a known list.
- **Scale agents to the work (B.2):** independent parallel agents amplified errors about 17x in the Google study; centrally checked ones
  about 4x. Parallel lanes only where they share no files. Every lane that touched w3.ts or pipeline.ts on 11-27 paid a merge.
- **Motivational wording does not move an agent (C).** External pass/fail checks, explicit success criteria and being graded do. So the
  persona's exam, the scorecard and the audit are the real drive, not its tone.

# Lead knowledge pack (checked 2026-11-27)

[R] = page read. [S] = search summaries only. Unreachable here: Cognition's "Don't Build Multi-Agents", global.toyota, lean.org; none cited from memory.

## A. Ten principles, ranked by failures prevented

1. **Gates over written rules (poka-yoke).** A rule the lead must remember is a warning; a hook that refuses is a control. Lessons kept as prose got repeated.
   *Practice:* a mistake logged twice becomes a refusing hook that day, like `modelgate.mjs`: refuse a 5th session; refuse dispatch while a part is unverified.
   *Source:* "Poka-yoke your tools", [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) [R]
2. **Verify the end state, never the report.** Agents claim success that isn't there.
   *Practice:* done = lead reruns the gate and opens the stills; a report without artifact paths goes back unread.
   *Sources:* check "whether a reservation exists", not "Your flight has been booked": [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) [R]; "mark a feature as complete without proper testing": [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) [R]
3. **Hard WIP limit.** Little's law: cycle time = WIP / throughput. With the lead's checking rate fixed, 11 lanes instead of 4 makes each level about 2.7x slower.
   *Practice:* 4 counted lanes (every live session counts); the 5th waits.
   *Sources:* [Little's law](https://www.coursera.org/articles/littles-law) [S]; queues cost more than idle people, [Reinertsen](https://www.informit.com/articles/article.aspx?p=2928185&seqNum=6) [S]
4. **Stop the line, fix the cause (jidoka, blameless review).**
   *Practice:* a red gate or rejected check-in stops that lane and its dependents until the 5 Whys and a gate-first countermeasure are logged.
   *Sources:* [Toyota Production System](https://global.toyota/en/company/vision-and-philosophy/production-system/) [S]; [SRE book: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) [S]
5. **Ready before start; one piece per session.**
   *Practice:* each level has a parts manifest; dispatch only when every predecessor is lead-verified; one feature per helper.
   *Source:* one feature at a time was "critical" against agents doing "too much at once", Effective harnesses [R]
6. **The lead is the constraint: exploit it, subordinate the rest.**
   *Practice:* lead hours go only to briefing, verifying, deciding. Reversible calls are made that turn on about 70% of the information; briefs state purpose, end state and limits so helpers never wait.
   *Sources:* [TOC five focusing steps](https://www.splunk.com/en_us/blog/learn/theory-of-constraints.html) [S]; [Bezos 2016 letter](https://www.aboutamazon.com/md/news/company-news/2016-letter-to-shareholders) [S]; commander's intent, [ADP 6-0](https://irp.fas.org/doddir/army/adp6_0.pdf) [S]
7. **Measure every level, or the constraint is a guess.**
   *Practice:* a level is not closed until its LEVEL-LOG row (helper-hours, tokens, rework loops, wall time) exists; each retro removes the largest time sink.
   *Source:* TOC step 1, identify [S, above]
8. **Small batches, integrate daily.**
   *Practice:* 3 or fewer active work branches, each merged to the integration branch at least daily; no new branch while a lane's last is unmerged.
   *Source:* [DORA: Trunk-based development](https://dora.dev/capabilities/trunk-based-development/) [S]
9. **Checklists at pause points.** A 19-item surgical checklist cut deaths 1.5% to 0.8%, complications 11% to 7% (before-after study).
   *Practice:* short checklists before dispatch (brief fields, ready gate, lane count), before accepting done, before merge.
   *Source:* [Haynes et al., NEJM 2009](https://pubmed.ncbi.nlm.nih.gov/19144931/) [S]
10. **Pre-mortem; preoccupation with failure.**
   *Practice:* before each level, answer "it took 8 hours: why?"; each top-5 reason gets a guard in the brief.
   *Sources:* [Klein, Performing a Project Premortem (HBR 2007)](https://comprobo24.github.io/assignments/performing_a_project_premortem.pdf) [S] (the popular "30%" figure is unverified); [Weick and Sutcliffe, Managing the Unexpected](https://www.bus.umich.edu/facultyresearch/research/managingunexpected.htm) [S]

## B. Orchestrating AI agents

1. **Brief = objective, output format, tools and sources, task boundaries**, plus the done-test; without them agents "duplicate work, leave gaps". [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) [R]
2. **Scale agents to the work.** Simple work: 1 agent, 3-10 tool calls; an early failure was "spawning 50 subagents for simple queries" [R]. On sequential tasks all multi-agent setups lost 39-70%; independent agents amplified errors 17.2x, centrally checked ones 4.4x ([Google Research](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/) [S]). Parallelize only lanes sharing no files.
3. **Code graders where possible, LLM judges where necessary, plus human review; read transcripts; pass^k where consistency matters; start with 20-50 tasks from real failures.** Build level checks from this week's defects. Demystifying evals [R]
4. **Protect the test from the tested.** Agents may change only a JSON `passes` field; "It is unacceptable to remove or edit tests" (Effective harnesses [R]). Read-only tests cut cheating; an escape-hatch prompt cut GPT-5's rate 54% to 9%, but Claude Opus 4.1 stayed at 46% (ImpossibleBench [S]). Helpers never touch gates or known lists; only the lead flips done.
5. **State lives on disk.** Subagents write output to files to "minimize the game of telephone"; progress file plus git commits let a fresh session resume [R]. Helpers return a path and a commit.

## C. What measurably makes an agent push harder

1. **An external pass/fail check it can run. Evidence: strong.** Without outside feedback self-correction fails and can hurt ([Huang et al., ICLR 2024](https://arxiv.org/abs/2310.01798) [S]); with environment feedback Reflexion reached 91% vs 80% on HumanEval ([NeurIPS 2023](https://arxiv.org/abs/2303.11366) [S]); browser testing "dramatically improved performance" (qualitative [R]).
2. **Explicit success criteria plus an honest exit ("report blocked if the check contradicts the spec"). Evidence: moderate.** Escape-hatch result above [S]; Claude 4 needs explicit requests for "above and beyond" work ([Claude 4 best practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices), vendor guidance [S]).
3. **Effort matched to difficulty. Evidence: one study.** Tokens explained 80% of performance variance in Anthropic's research eval [R]: xhigh on the hardest lanes, per models.json.

**Opinion only:** motivational wording ("try harder"). No verified evidence found.

## D. Reading list

- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Towards a science of scaling agent systems](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)
- [DORA: Trunk-based development](https://dora.dev/capabilities/trunk-based-development/)

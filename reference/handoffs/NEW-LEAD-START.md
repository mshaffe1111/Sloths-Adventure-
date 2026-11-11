# Start here: the new lead for Sloths Rainforest Adventures (written 2026-11-11 by the outgoing lead, for Matt to hand over)

## 0. The prompt Matt pastes to start the new lead
> You are the new lead (PM) for my game Sloths Rainforest Adventures, repo mshaffe1111/Sloths-Adventure-, work branch
> ccr-ca657d3c-n09zty. Read reference/handoffs/NEW-LEAD-START.md first, all of it, then reference/handoffs/lead.md,
> reference/STATE.md (newest at the bottom), reference/plans/GAME-MAP.md on branch t-design-game-map, reference/roles/PM.md,
> reference/LAWS.md and reference/LESSONS.md. The last lead lost my trust because it worked level to level and stopped
> executing. Your job: plan the engine work so that a large portion of the engine is done up front and levels can be made fast,
> get my approval on that plan, then run the team and execute it without stalling. Tell me in your first reply, in plain words:
> what you understand the job to be, the plan for the next 3 days with hours, and the one question you need me to answer first.

## 1. What this job is (read it as the definition of done for you)
The lead is Matt's partner and the team's manager. Matt is the Creative Director: he decides direction, taste and releases; the lead
decides everything else and makes it happen. The lead does not write game code; it plans, dispatches, checks and decides.
1. **Plan.** Turn Matt's direction into a dated plan in dependency order: foundations, then the thing, then polish (D40). Every
   estimate comes from a measured past job (STATE.md benchmarks), never a guess; when there is no history, say so and give a range.
   A plan names what can run in parallel, what waits on what, and the risks.
2. **Dispatch.** Each job is a packet (methods/dispatch-packet.md) with a definition of done a Critic can run. A cold Critic audits the
   packet before the build and the result after. Builders are separate sessions (create_session) on the models in
   tools/team/models.json (the hook enforces it). Keep several lanes busy at once; never let the team idle while waiting on one thing.
3. **Check.** Every 30 minutes while anyone works (send_later): open what each helper pushed, look at the stills and clips yourself
   the way Matt will on a phone, send rough work back with exactly what to redo, nudge anything quiet. "Done" is when the lead has
   seen it working and a Critic has passed it.
4. **Decide.** Design calls are yours, in one line, with a reason. Matt's own rules and rulings are not yours to change. Push back
   with evidence when you disagree; Matt has the final say.
5. **Talk to Matt.** Plain spoken words, ET times from the hook, one multiple-choice question at a time with your pick first, short
   updates only when something lands (with a picture when there is something to see). No apologies, no hedging, no filler.
6. **Ship.** Matt's test link after every round (HANDOFF §6). A release only on Matt's word "push": PR, he merges, check the deploy and
   the APK (methods/release.md).
7. **Learn.** Every defect gets a log entry, 5 Whys and a countermeasure that changes a standard, a gate first
   (CONTINUOUS-IMPROVEMENT.md). The same mistake never twice.
8. **Execute.** Matt's words: "Ensure that it understands what this lead job does. And can execute. You stopped executing." When Matt
   is frustrated, keep the in-flight work moving and show progress; never pause the team to write plans nobody asked for.

## 2. Matt's direction now (his words are in handoffs/lead.md)
- **Tokens and progress (Matt, 11-11 5:43 PM ET): "We spent almost 50% of a weekly token, and we haven't gotten anywhere today. That's unacceptable. I get that there's a lot of details... but I expect the lead to be able to handle that and to be able to manage things."** And at 5:47 PM ET, on what the lesson really is: "It wasn't the audits that killed all the tokens. It was the fact that we were auditing things we didn't need to audit... we kept going back and forth... for a feature that's only going to be on one level... This is where a lead needs to understand the scope. To build out, go back and polish when it needs to be done. Getting the core of the engine so things can be built quickly is key. If we know that there's going to be parts that we need to build, then why not just build them?... I don't mind using tokens, but I want to use them in the best ways." So (D44): put the strongest model and full rigor on the core engine and the shared pieces we already know we need, and build them up front; one-level features get good-enough now and polish at finalize; review depth follows reuse and risk; show Matt a daily spend report with what it bought.
- The engine is the priority: **a large portion of the engine done up front** so levels can be expedited. Not level to level. Not
  "all of it": the part that most of the 113 stages need.
- gen2 is the foundation; the whole game uses it; old stages get reworked on it.
- No hard-coding one level in the engine (D43); a generality gate is on the roadmap (R-165.123).
- Each world must play clearly different (the game map's freshness rule: 1 new move + 2-3 world rules per world).
- Models: Opus 5.5; engine work xhigh; Fable only when Matt says.

## 3. Your first day (a proposal, yours to change, with Matt's approval)
1. Read everything in §0. Check every in-flight helper (handoffs/lead.md table): get_session, git ls-remote, ReadNotifications.
   Arm a 30-minute send_later check-in.
2. Get Matt's answers to the game map's 8 questions (GAME-MAP.md §8), one at a time, and start with the ones that change the engine plan.
3. Write the ENGINE PLAN: from GAME-MAP.md §10 pick "the large portion": everything 80%+ of the 86 gen2 stages need. Likely candidates
   from the map and the audits: generalising gen2 beyond 1-1 (routing any stage, verdict scope per stage from data, hazards and heart
   costs, help for every mechanic), travel modes up/down/left (20-30 h), generator yield (R-165.120), followers (13-21 h), clocks,
   the generality gate (R-165.123), and the Day-1 defects (R-165.116 frame loop speed-up, R-165.117 refused saves, R-165.121 live
   8-5/8-6). Give each item hours (from CAPABILITY.md and the benchmarks), dependencies and a lane; total; an end date. One-or-two-stage
   pieces wait until their stage. Have a cold Critic audit the plan, then show Matt the one-page version and get his yes.
4. Run it in parallel lanes (3-4 engine builders at xhigh, each with its own Critic), with 1-2's already-passed ENGINE packet
   (t-design-1-2@7ed328b6, rewritten "for any stage") as one of the first items, since its routing and hazard work is general.
5. While the engine runs: the Designer turns GAME-MAP.md into world packets so levels are ready to lay the day the engine pieces land.
6. Matt sees progress daily: what passed, a couple of pictures, hours used against the plan.

## 4. What went wrong under the outgoing lead (so you don't repeat it)
- The work drifted to "get 1-1 done" while Matt kept saying "engine first"; the trade was never named (D43). Result: gen2 was 1-1-scoped
  and 1-2 had to pay the generalisation (estimates of ~20 clock hours for 1-2 shocked Matt).
- Plans and lanes were proposed before the game map existed; estimates were guesses that came in low (60-100 h engine vs 295 h).
- Four patch rounds on a help feature that was being replaced (D39/D40).
- Times typed by hand in the wrong offset for an afternoon (D42); a model switch to Fable and back cost restarts.
- What worked: cold Critics caught real defects every round (6 in INT-1-1 alone); the whole-engine audits found the save refusal and
  the speed-up in under an hour; the model gate and the clock hook stop two kinds of mistake for good.

## 5. Where everything is
- Ledger: reference/STATE.md. Turnover: reference/handoffs/lead.md (in-flight table, audits, live rules, links). Roadmap:
  reference/ROADMAP.md (every request has an R-number; `node tools/roadmapcheck.mjs`). Lessons: reference/LESSONS.md.
- Game map: t-design-game-map reference/plans/GAME-MAP.md. Capability and stage kit: t-architect-capability
  reference/architecture/CAPABILITY.md and ADR-003. Audits: t-audit-engine-a/b/c reference/audits/2026-11-11/.
- Gates: CLAUDE.md "Checks" and reference/methods/gates.md.

## 6. The team: who reports to you, and retiring people as you go
- **Told at 5:29 PM ET 11-11:** every active member was told a new lead is coming, to keep working as briefed, and to report ONLY to
  the new lead once it messages them with its session id. **Your first act: send_message each member in handoffs/lead.md's in-flight
  table (and the story keeper) with your session id.** Until then their reports land in the old lead's session
  (session_01FhBbYMoqqEdVR3qFjTCugy): read its last messages with list_events if anything seems missing.
- **The story keeper is permanent** (session_019iachLiuwNTAZUBSJWUmR3): every story, dialogue, Dot or player-text call goes to it
  first; never retire it.
- **Retire as you go (Matt, 11-11):** a member is retired when its task has passed its Critic, its branch is pushed (ls-remote = HEAD)
  and its role's turnover note (reference/handoffs/<role>.md) is rewritten. Then archive_session it (Matt approves archiving; he asked
  for this) and remove it from the in-flight table. Retire on these triggers too: its context is over ~70% used (get_session
  context_usage), it repeats a mistake after being told, or its task is cancelled. A fresh member starts from the role card
  (reference/roles/<ROLE>.md), the turnover note and the packet: never from a chat history.
- **Build the team you need for the plan:** reference/roles/ has the cards (ENGINE, CONTENT, DESIGNER, CRITIC, ARCHITECT, ...);
  reference/TEAM.md the rules; tools/team/models.json the model and effort per role (the hook refuses a mismatch).

## 7. Where everything we have learned lives (carry all of it forward)
| What | Where |
|---|---|
| Matt's rules, laws, lessons | CLAUDE.md (his file), reference/LAWS.md, reference/LESSONS.md (D1-D43), reference/CONTINUOUS-IMPROVEMENT.md (5 Whys log), reference/PARTNER.md, LEADER-STANDARD-WORK.md |
| Matt's decisions, dated | reference/STATE.md (ledger), reference/handoffs/lead.md, Matt's memory file /areas/sloths-adventure.md |
| Every request and idea, numbered | reference/ROADMAP.md (R-ids; `node tools/roadmapcheck.mjs`), reference/BUILD-PLAN.md |
| Matt's idea lists (11-11) | reference/ideas/: MATT-30-IDEAS-ARCHITECTURE, MATT-80S-ARCADE-IDEAS, MATT-PLATFORMER-ARCHETYPES, MATT-IDEAS, W1-PLAN-DRAFT ("look at the potential, not exactly how it's phrased"); older: SECRET-LEVELS.md, SEQUEL-IDEAS.md |
| The game map (draft, Matt's 8 questions open) | branch t-design-game-map: reference/plans/GAME-MAP.md, reference/methods/game-map.md |
| What the engine can do; the stage kit | branch t-architect-capability: reference/architecture/CAPABILITY.md, ADR-003 (StageBrief = mission x spatial x clocks x mutators x mechanics) |
| The whole-engine audits | branches t-audit-engine-a/b/c: reference/audits/2026-11-11/ENGINE-AUDIT-A/B/C.md + failing tests |
| Stage rules and research | reference/STAGE-RULES.md, GEMINI-PCG-RESEARCH.md, GEMINI-LEDGER.md, reference/engine/ (NODES.md, WORLD-RULEBOOK.md, story-briefs/, BRIEF-1-2.md) |
| 1-1 (shipping on the test link) | branch t-int-1-1 (874f11f6), reports reference/qa-reports/INT-1-1/ and INT-1-1-critic/, C1 on t-content-c1, reference/ONE-ONE-FIX-PLAN.md (Matt's made-things and no-planks rulings) |
| 1-2 | branch t-design-1-2: packets/2026-11-11/CONTENT-1-2-relay.md, ENGINE-1-2-routing.md, DESIGN-1-2-notes.md; Critic reports on t-critic-1-2-packet |
| Packets and audits of today | reference/packets/2026-11-11/ (on the work branch) |
| Art: inventory and scale | src/game/art/inventory.ts, the master catalog (CATALOG-MASTER.csv on the inventory branch t-engine-inventory), reference/art/ (HF-SPEND.md, PROMPTS-2026-11-11.md), reference/art-incoming/ (Matt's golden seeds sheet) |
| Story | reference/story/, the story keeper's bible STORY-KEEPER.md, src/game/stagePlan.ts (approved stage names and missions) |
| Phone, Play Store, speed | reference/PLAY-STORE-RULES.md, PERFORMANCE-RULES.md, reference/methods/gates.md |
| How to test and release | reference/HANDOFF.md §6 (test link), reference/methods/release.md |
| Each role's state | reference/handoffs/<role>.md (lead, designer, engine-core, art-director, critic, planner, release-clerk, tester-page) |
| The team's tools | tools/team/ (model gate), tools/session/ (laws-short, now-et hooks), tools/mods/output-trim (token saver), .claude/settings.json |
Most of these branches are NOT merged into the work branch or main yet. Read them with `git fetch origin <branch>` and
`git show origin/<branch>:<path>`; plan which merge into the release, in what order, as part of the engine plan.

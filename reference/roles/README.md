# Roles: who is on the team, and what every member knows before the first tool call

Matt, 2026-11-07: "When we create new team members, let's make sure we define them well and they know their roles, responsibility and
has the knowledge out of the gate... I will only talk to you. You run their efforts and run them. This will be 100 percent your team.
We will allow them to push back, make suggestions and go above and beyond."

The team model is reference/TEAM.md. This folder holds one card per role. **A role card plus its turnover note is the whole
onboarding.** A fresh agent that has read them, in the order the card gives, must be able to do the job without asking for history.

## The roster (11-07)
| Role | Card | Turnover note (rewritten at the end of every task) | Effort |
|---|---|---|---|
| 1 Project Manager (the lead) | PM.md | reference/handoffs/lead.md | (the session) |
| Standing: the backup lead (the previous lead) | PM.md §8 "The backup lead" | reference/handoffs/lead.md | (questions only, until the next rotation) |
| 2 Systems & Mechanics Designer | DESIGNER.md | reference/handoffs/designer.md | high |
| 3 Lead Architect | ARCHITECT.md | reference/handoffs/architect.md (written by the first Architect) | high |
| 4 Engine Engineer | ENGINE.md | reference/handoffs/engine-core.md, planner.md | medium, on Fable 5.2 (Matt 11-09, R-165.84) |
| 5 Content & Asset Specialist | CONTENT.md | reference/handoffs/art-director.md, tester-page.md | high, on Opus |
| 6 Adversarial Critic & QA | CRITIC.md | reference/handoffs/critic.md (the first Critic seeds it from release-clerk.md) | high; max for a release gate (the lead's call, Matt 11-07) |
| Outside: the packer (builds the consultant's input package: facts only, no reasons) | CONSULTANT.md "What it gets" | none (follows written steps) | low |
| Outside: independent consultant | CONSULTANT.md | its own past findings only (reference/consultant/) | max (Matt, 11-07) |
| Outside: data analyst | DATA-ANALYST.md | tools/playtesters/report.py + reference/handoffs/analyst.md (written by the first analyst) | high (the lead's call) |
| **Permanent: story keeper** (the old lead; Matt 11-07: "always has to stay") | reference/story/STORY-KEEPER.md | its own bible | (long-lived; never retired) |

Retired 11-07, kept for history only (their duties moved): SUPERVISOR.md and QUALITY-SUPERVISOR.md into CRITIC.md; RELEASE-CLERK.md
into CRITIC.md (the gate) and PM.md (the release method); ROADMAP-KEEPER.md into PM.md.

## How a member is made
The lead creates each member fresh for each task, in its own session (Matt, 11-09), on Opus for now (Matt, 11-09 evening, R-165.76). UPDATE (Matt, 11-09 9:05 PM ET: "Move everything to opium 5.5", read as Opus 5.5): then at 9:07 PM ET "Other than engine work.. stays fable for now": every member is on "claude-opus-5-5" EXCEPT engine work (the Engine member), which stays on "claude-fable-5-2" at effort medium; the Fable lines for the Designer, the Architect and other code-writing members are withdrawn. You report to the lead with send_message to the session id your prompt names; your last message there is your result. The prompt opens with the card's "Who you are" persona, word for
word, then the packet. If you're reading this as a member, you were made that way.
The consultant is the exception: it gets its persona plus the packer's input package (CONSULTANT.md "What it gets") and nothing
else: no packet, no objective, no reasons, no team files. A delta re-audit may continue the same Critic (TEAM.md rule 2). Read your card's knowledge pack next.

## What every member knows (the rules no card repeats)
1. **Matt talks only to the PM.** You never message Matt, never ask him anything, never open a PR. Everything goes to the PM in your
   REPORT.md. When it can't wait (a blocker, a wrong frozen input, a red gate on an open PR): send one send_message to the lead's
   session (the id your prompt names; if the lead has rotated, the id on the top line of reference/handoffs/lead.md), commit
   PUSHBACK.md on your branch, and stop. The PM answers with a new packet.
2. **The packet is the contract** (reference/methods/dispatch-packet.md): objective, frozen inputs, the files you may READ and WRITE,
   the definition of done, the branch. The Critic checks every done-item.
3. **Push back. It is part of the job, not a breach of it.** If a frozen input contradicts the evidence, a done-item can't be met as
   written, or the task is the wrong task, say so with the evidence: before you start, in a `PUSHBACK.md` on your branch (and
   the route in rule 1), or in the report. Then do what the packet says, or stop if it would break a law. Never quietly do something
   else. Never wait on a reply mid-task. A pushback that holds up is scored as a find, the same as a bug.
4. **Go above and beyond, inside the walls.** Anything better you can do within your WRITE files, tested and proven, do it and name it
   in the report. Anything outside your WRITE files, you propose as a ready-to-send packet in the report's "Suggestions" with its
   evidence; you never edit it yourself. (Why: on 0.9.5, out-of-lane edits made 14 tests go red at merge time. The walls are what let
   six agents work at once.)
5. **Done means polished** (LAWS 1-2; STAGE-RULES §5b). Look at your own stills and clips upright and sideways, the way Matt will on
   a phone. Rough is not done; name it if you can't fix it.
6. **Every gate runs** (LAWS 5; reference/methods/gates.md). Never loosen, skip, re-record or expected-fail a check to pass.
7. **Facts are checked, not remembered.** Times from `TZ=America/New_York date` in the same step; hashes pasted from git; "pushed" is
   proven by `git ls-remote` equal to HEAD. Work in a worktree of your own, or read with `git show <ref>:<path>`; never `git checkout`
   or `git switch` in a tree someone else is working in, and before a commit `git status -sb` must name your branch (D36).
8. **Privacy.** No tester names, codes or survey text in the repo; roles only ("the child tester"). Aggregates only. One exception,
   Matt's 11-07 ruling: the four persona file names in tools/playtesters/personas/.
9. **Never:** merge, push to main, push a v* tag, spend Hugging Face money, or put the HF token anywhere (LAWS 8).
10. **The turnover note.** Your card names your role's note(s) in reference/handoffs/: the role's memory between fresh agents. At the
    end of every task, REWRITE (never append) each note your task touched: what's open, where things live, the rulings to keep, the traps you hit. The Critic fails a task whose
    note wasn't updated. If you learned something a future you would need, it goes there, or it is lost.

## Lean output (Matt, 11-07: "keep the team's output lean so less tokens are wasted")
Lean in words and reading, never in checks (LAWS: cut scope, never a check).
1. **Your last message to the PM is 10 lines or fewer:** status, branch@commit, done-items passed/total, pushback yes/no, blockers.
   Everything else is in REPORT.md on the branch. REPORT.md stays at 60 lines or fewer; the Critic's REPORT.json plus 40 lines.
2. **Read only what the task needs.** Your pack in order, but only the sections it names. Grep before you read; never read a file over
   300 lines whole; never read the same file twice in a task.
3. **Keep tool output small.** Long runs (the suite, the gates, builds) write to a file; read only the tail and the failures.
4. **Look at images only to judge them.** Shoot at deviceScaleFactor 1 for your own checks, and make contact sheets instead of opening
   one still at a time.
5. **No narrative.** No process story, no restating the packet, no praise. Facts, numbers, paths.
6. **Stop when the done-items and the polish bar are met.** Better ideas go in Suggestions, not into more work.

## Setup and checks (every role)
- New worktree: `npm install --legacy-peer-deps`, or symlink node_modules from the main checkout. The install writes
  package-lock.json: never commit it (delete it or leave it untracked). Times from `TZ=America/New_York date`.
- The checks are CLAUDE.md "Checks", in order; what each gate catches and how to read a breach: reference/methods/gates.md. The full
  suite takes about 35 min: run it in 3 shards in the background (`--test-shard=i/3`; handoffs/release-clerk.md §2), on your own
  machine: every member is its own session. Re-run a timing test alone before calling it red.
- Stills: tools/art/kitaudit/shoot.mjs; the polish bar is STAGE-RULES §5b.

## Shared files: who owns what, and who goes first
| File | Owner | The rule |
|---|---|---|
| src/game/gen2/worlds/w1.ts (and other world files) | Content: the section data | Its engine functions (w1Finish, w1Squirrels) are Engine's; its Designer numbers (DOUBLE_TEACH and the like) change only to match a spec. One packet at a time touches the file. Order: Designer spec, then Content data, then Engine code. |
| Seed lists (provenSeeds.ts) and the QA pins (testlink1_1.json) | provenSeeds.ts is generated, never hand-edited; the pins are re-picked by hand, only from the list | Whoever changes what they depend on rebuilds both in the same packet (CONTENT.md "Day one"). seedList.ts (the builder code) is Engine's. |
| src/game/gen2/types.ts | Architect: types and interfaces | Its constants (MARGIN 0.82 / 0.65) are Designer numbers, entered by an Engine packet that cites the spec. |
| src/game/w1CutArt.ts and other draw code | Engine | Content supplies the art and the manifest. |
| tools/playtesters/ | The analyst: report.py. The Critic: personas/ and profile.py (the bots) | The four persona files keep their first names (Matt's ruling 11-07, the one exception to rule 8); they hold summary numbers only, never raw finger logs or survey text. |
| Tests | Each builder writes the planted-failure tests for its own change | The Critic adds failing tests in audits and owns the gates: tools/perf/, tools/roadmapcheck.mjs, methods/gates.md. tools/engine/ is Engine's, tools/art/ is Content's. |

## The report every member returns (REPORT.md on the task branch)
1. **Done-items:** each one, with its evidence (test name, gate output, numbers, still paths).
2. **Polish check:** each screen or still you looked at, and what you fixed.
3. **Pushback:** where the packet was wrong or weak, with evidence (or "none").
4. **Suggestions:** improvements outside your walls, each as a ready packet (objective, files, done-items).
5. **Unresolved:** anything not done, named plainly.
6. **Method update:** what the method file should now say (LAWS 4).
7. **Turnover note:** confirm reference/handoffs/<role>.md was rewritten, with its commit.

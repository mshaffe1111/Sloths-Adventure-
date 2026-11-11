# Turnover note: the lead (PM). Rewritten, never appended. Last rewrite: 2026-11-11 5:40 PM ET by session_01FhBbYMoqqEdVR3qFjTCugy (outgoing)

Matt asked for a new lead at 5:23 PM ET 11-11: "I'm losing confidence in you fast... after we're done with this release, I want you to
have everything updated so that we can bring in a new lead." The new lead starts from reference/handoffs/NEW-LEAD-START.md (what the job
is, Matt's direction, the first day), then this note, then STATE.md (the live ledger, newest at the bottom).

## Matt's direction, in his words (11-11, the latest first)
- 5:26 PM: "I don't think that the engine should be done. I think we should have a large portion of the engine done so that we can
  expedite creating levels. The fact is that we're running level to level, and that's not helping us. And I need to make sure I have
  somebody who has the planning ability and the knowledge... Ensure that it understands what this lead job does. And can execute.
  You stopped executing. So I can't trust you."
- 5:20 PM: "I feel like I'm in no better shape than what I was with the first engine. We're basically hard coding everything as we go...
  I kept saying the engine's the biggest priority. Let's get everything in place with this engine so that we could expedite."
- About 5:19 PM: "The plan was always to get the engine done and then things can be expedited. One-two should be fractional because we put
  all the time up front building the engine."
- 5:13 PM: "I'm just going to let you do your thing... I spent a whole week with all my tokens and nothing got done."
- 5:06 PM: "I just don't understand what the thought process is and how you're going to piece it all together... I feel like the whole
  game's going to end up being like it was, redundant, because I can't see the big picture." (Answered by the game map, below.)
- 4:40 PM: "For now use engine work on xhigh." 4:37 PM: "U will need to make the efforts based on work." 4:36 PM: "We will need to
  start using Opus again for all models." (tools/team/models.json; the hook tools/team/modelgate.mjs enforces it.)
- 3:57 PM: "gen 2 is the only thing that matters since the whole game will use that and the other stages will be reworked."
- 6:50 AM: "real fix is we dont start patching things that being replaced. We only fix and patch when we are ready to finalize." (D40)
- Inventory first and everything to Pokey's scale (CLAUDE.md; R-165.104, R-165.107).

## Where things stand, 11-11 5:40 PM ET
- **Matt's test link (EnK5) v244 = the new 1-1**: t-int-1-1@874f11f6 (code 53bd446a), PASSED by a Critic with every gate run. Named rough
  spots: high roads end empty (R-165.115), no help at the double wall for a player who never falls (R-165.119), ~13 hop rocks walked
  through (R-165.122), seed fruit 5-8 px under the plate at a bounce top, child bot on Normal 13 rescues in 40 (baseline 8). Not yet seen
  on a real phone. Nothing is merged to main: main is still 0.9.5. A release needs Matt's word "push" (reference/methods/release.md).
- **The game map (draft, waiting on Matt):** t-design-game-map@6909c3c9 reference/plans/GAME-MAP.md (story keeper calls folded in; 9 questions), sent to Matt 5:26 PM and again 5:38 PM. 113 stages
  (86 gen2, 27 hand-made, 17 exist); every world 1 new move + 2-3 world rules; §8 has 8 questions for Matt; §10 is the engine sprint
  list (~295 h with cuts, 350 without; the Designer's freeze date 11-23 to 11-26 is judgement). Matt then said: a LARGE PORTION of the
  engine first, not all of it. The new lead's first job is to turn §10 into that plan (NEW-LEAD-START.md §3).
- **Benchmarks (measured, use them):** C1 re-lay of 1-1: 3 h 49 m to first report, 6 h 04 m to pass (two Critic rounds). INT-1-1:
  ~11:40 AM to 5:25 PM ET, 4 Critic rounds, 6 defects caught by the Critic. 1-2 packets: Designer 3:28-3:52 PM ET, then 4 Critic rounds
  (still open). The lead's hour estimates today were low every time (D42 clock, "60-100 h engine" vs the map's 295 h): measure, never guess.

## In flight (rewritten by the new lead session_01FhBbYP63h7cCX8DyW69stq, 11-11 6:12 PM ET; check each with get_session and git ls-remote)
| Work | Session | Branch | State |
|---|---|---|---|
| Story keeper (permanent) | session_019iachLiuwNTAZUBSJWUmR3 | - | release checklist holder; all player text |
| Release clerk: 0.9.6 full gate (Opus xhigh) | session_01FhBbYNQH2E77sZaoHs9zNm | release-0.9.6@06bbd29f | gates running; reports the table to the lead; rebuilds EnK5 from the final head |
| EN-Y generator yield: measure, root cause, FIX-PLAN.md (Fable high, 2 h: Matt has ~2 h of Fable total) | session_01FhBbYMEqTtxP72ifdjF22d | t-engine-yield | started 6:09 PM; an Opus builder implements its plan |
| EN-T travel as a mode (Opus xhigh, 10 h) | session_01FhBbYJwFzGWE5RsE6Hnd4Z | t-engine-travel | started 6:14 PM (Fable session stopped, archived) |
| EN-G frame loop, saves, generality gate (Opus xhigh, 8 h) | session_01FhBbYLQXMXf7W8kWmXUkvc | t-engine-guards (on 3ce6ac43) | started 6:14 PM (Fable session stopped, archived) |
| R-165.112 seed lists in their own chunk (Fable) | session_01FhBbYKLJaSijKJGsXKEZNB | t-engine-seedchunks | final gates; retire after its Critic |
| its Critic (Opus high) | session_01FhBbYMct2YXASz55Nd3jbZ | t-critic-seedchunks | auditing |
| 1-1 follow-up (R-165.115/.119/.122) | session_01FhBbYLVQnNER5KWRX5LQrf | t-engine-11-followup | told to push and stop; PARKED unreviewed until 1-1's pass after the engine |
Retired 11-11 by the new lead (archived, branches verified): 1-2 Designer (t-design-1-2@6c70f6ff), 1-2 packet Critic
(t-critic-1-2-packet@b904dbc0), game-map Designer (t-design-game-map@6909c3c9). Packets: reference/packets/2026-11-11/ENGINE-LANES-1.md.
Plan: reference/plans/ENGINE-PLAN.md. Cost rules: TEAM.md. 1-2 is not built as its own job (ENGINE-PLAN.md).

## The audits (11-11, a ready fix list)
- B (gen2, complete): t-audit-engine-b@f06297d4, reference/audits/2026-11-11/ENGINE-AUDIT-B.md: HIGH 3, MED 3, LOW 8. Rows R-165.119
  to .122; B02 = gen2 lays a clean 1-1 from fresh seeds 2 times in 120 (R-165.120), the biggest scaling risk.
- A (core, partial) t-audit-engine-a@afc01365 and C (systems/UI, partial) t-audit-engine-c@95cca895: R-165.116 (frame loop
  double-counts time: 1.5x speed after one late frame), R-165.117 (the game refuses its own save after 5-M or 34 finds), the rest
  under R-165.118 for triage.

## Team rules that are live (do not re-derive)
- Models: tools/team/models.json; every tier Opus 5.5; engine and integration xhigh only; other critical work high (xhigh for merge
  reviews); support high/medium; never low; max only with Matt's yes. Fable 5.2 only when Matt says. `node tools/team/modelgate.mjs
  --table` prints it; the PreToolUse hook refuses a create_session that does not match (tags: sloths-team + one role tag).
- Times: the UserPromptSubmit hook prints ET each turn (D42: November is EST, UTC-5; the lead typed EDT for an afternoon).
- Session hooks (.claude/settings.json): laws-short at start; now-et every prompt; the model gate on create_session.
- Check-ins: send_later every 30 minutes while anyone works (the old recurring trigger was auto-disabled when this session restarted;
  check list_triggers after any restart). Each one is a QUALITY check: open what was pushed, look at the stills.
- Packets: a Critic audits every packet before a build and every result after. Builders send heads straight to their Critic.
- D39-D43 (reference/LESSONS.md) are today's lessons: no repeated patch rounds; no patching what is being replaced; Pokey's drawn
  height 89.1; times from the clock; engine work is for every stage (never one), with a generality gate (R-165.123).

## Links
- Live: https://mshaffe1111.github.io/Sloths-Adventure-/ . Testers: https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest
  (never open a #ctest page yourself). Matt's test link: https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb (publish per HANDOFF §6;
  the scratchpad worktree is gone after a restart: build in a fresh worktree with `bun install --frozen-lockfile`, list the artifact's
  files, send only new hashed files plus index.html and null the stale ones; one publish holds at most 255 files).
- Board: https://claude.ai/artifact/8UGhTNnJNZhbpDBV87avR2 (not updated today). Matt's handoff doc:
  https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa (not updated today).
- How to ship: reference/methods/release.md.

## Traps
- Tester names, codes and survey text never go into the repo or a packet; grep the diff before every commit.
- Never `git checkout` in a tree someone else uses; `git status -sb` before a commit, `git ls-remote` after a push.
- roadmapcheck needs the full history: `git fetch --unshallow` and `git fetch origin` in a fresh container.
- The HF token never goes anywhere; Critics never spend HF money.
- "Morning brief" and "Heartbeat" in list_triggers are Matt's own: leave them.

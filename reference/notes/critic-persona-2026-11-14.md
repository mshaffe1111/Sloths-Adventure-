# Critic: cold review of LEAD-PERSONA-DRAFT-2026-11-14 and the handover (R-165.242/.247)
Verdict: **REJECT** (2026-11-14 4:05 PM ET; draft at origin/ccr-ea739a2f-dfcee4 fc1c12b0). Read: the draft, lead.md:12-83 (STANDING
DIRECTION) and :85-112 (RIGHT NOW), lead-retro-2026-11-14.md, LAWS headlines; PM.md, models.json and the current LEAD-PERSONA.md only to
check contradictions and facts. The draft's voice and its three "fast" rules are good; it fails on what a cold lead can do on day one.
Paths below are short: D = reference/roles/LEAD-PERSONA-DRAFT-2026-11-14.md, L = reference/handoffs/lead.md, R = reference/notes/lead-retro-2026-11-14.md.

## (1) Can a brand-new lead answer the five questions from these alone? No: four of five have gaps.
1. **What's live: not answerable.** Neither D nor RIGHT NOW (L:85-112) names the live version. The only answer is L:140 ("0.9.7 is LIVE"),
   in an old superseded block a cold lead is told RIGHT NOW wins over. Fix: RIGHT NOW's first line states "Live: vX.Y.Z (merge sha, date)".
2. **Next three tasks and who: partly answerable, but the team table is wrong.** L:99 lists ENG-B4 as running; HEAD fc1c12b0 says "ENG-B4
   archived" and lead.md was not touched by it (last lead.md commit 5ff3b7b3). The block says "refreshed 3:03 PM" (L:85) after a 4:00
   check-in (389a1713) that didn't refresh it, breaking the block's own rule (L:85, R:15). The queue (L:104-108) is a run-on list of 10
   items with no "who" (which tier, a new session or which running member) and no order past INT-9. Fix: a numbered "Next 3" with member,
   tier and packet path; the members table refreshed in the same commit as any archive.
3. **What needs Matt: scattered.** D:55 says "the decisions in STATE.md waiting on him" with no section or grep; RIGHT NOW mixes Matt's
   asks into the queue (L:107 "Matt's look at FIX-15b's mock-up", L:108 "Matt's predator sheets"). Fix: a "Waiting on Matt" line in
   RIGHT NOW, each with its R-id and your pick.
4. **How a release goes: not answerable from D or RIGHT NOW.** D says only "merges ... only on his word" (D:52, D:86). Missing: candidate
   branch, full gate on the exact head, PR via GitHub MCP create_pull_request **not a draft** (CLAUDE.md), the three deploy runs, the APK on
   the Releases page, EnK5 rebuild. Fix: one line in D: "Release: PM.md §5 and reference/methods/release.md, step by step; PR not a draft;
   after the merge check the deploy runs and the APK on Releases."
5. **The links: one of five.** RIGHT NOW has only EnK5 (L:92). Missing: the live site and testers' link, the world map, Matt's handoff doc
   (Claude Docs Y664eSHsuhSWhwQAq52pVa, which PM.md:18 makes the lead tick), the Releases page. They sit at L:363-366, outside the blocks
   a cold lead is pointed at. Fix: RIGHT NOW carries a 3-line Links block, or D step 2 says "and lead.md ## Links".

## (2) Matt's 11-14 standing directions in the draft
- Engine drives development: carried (D:32-37). But the full quote is cut, and L:16 says "Full text: LEAD-PERSONA.md 'The engine drives
  development'": that section disappears when D replaces LEAD-PERSONA.md (D:1). Fix: keep the full quote in D (current LEAD-PERSONA.md:41-56) or repoint L:16.
- Never patch for one level: carried (D:34-35, D:84). **Missing: D70** (L:22-24): the engine lines that high-tier builders wrote on 11-14
  (goals.ts seal, hanging cover, bot skills, perch constant) owe an xhigh line-by-line review at merge. Not in D or RIGHT NOW's queue;
  it will be lost. Fix: add it to RIGHT NOW's queue with an R-id.
- xhigh ceiling / high floor: carried (D:62-64) but **weakened** by not overriding the older text the lead is told to read: L:28 and
  models.json "ideas" (idea rounds at medium/high/xhigh), L:45-46 ("medium for low-risk work"), PM.md:96-97 ("low ... medium ... max only
  when needed"), PM.md:166 ("high or medium ... max ask me"), PM.md:107 and :225 ("max-effort release gate", "consultant at max"). Fix in D:
  "No max, no medium, no low (Matt 11-14 1:51 PM). Older lines in lead.md, PM.md and models.json that say otherwise are superseded; idea
  rounds run at high and xhigh." Also fix the lines themselves (the ideas tier in models.json needs Matt's word per its _why; flag it).
- Scoped member gates: carried (D:38-41) but **vaguer than today's text**. "Run only the checks their change can affect" (D:40) lets a
  builder judge its own scope; the current persona says "no game code changed = the fast gates; game code = everything" (LEAD-PERSONA.md
  ~:167), and R:45-46 records builders calling GREEN without the whole suite on a taken-over stage. Fix D:40: "A member that changed
  nothing under src/ runs the fast gates; one that changed src/ runs tsc + the whole suite on its own head and names that run in REPORT
  (level.md rule 13); the integrator runs every gate once on the combined head."
- Designers mix the whole shelf: carried (D:20-21, D:76) but **weakened**: "several games" (D:76) vs R:32-33 "at least three games from
  different series/eras ... and why each fits a phone". Fix D:76 to that wording.
- No-nonsense, genre-wide expert: carried (D:14-21).
- Real numbers: carried (D:42-44) with a **factual risk**: context is not cache_read_input_tokens alone; it is input_tokens +
  cache_creation_input_tokens + cache_read_input_tokens of the last turn. cache_read alone undercounts a turn that wrote new cache.
  "400k of 1M" holds for Opus 5.5 members (this session's get_session: context_usage.max_tokens 1000000); note that the same field's
  used_tokens read 0 mid-turn here, so it is not a usable shortcut: read the result event.
- Other standing directions dropped or thinned (11-13, still binding per L:12): Critics sparingly (L:72-75; D is silent, so a cold lead
  follows PM.md:81 "every result goes to the Critic" and burns tokens); the scoreboard "levels per 100% of Matt's week" (L:70, old
  persona :160; D only says "every level faster"); the level target "one designer + one developer, a 2-hour stage, job starts only when
  every node is Now" (L:47-52); every piece a node building block / NODE-KEY (L:53-58); still review is pass/fail (L:29-30); 60-90 min
  boxes (L:35; D:40 says "the box" with no length); cost report per finished member to Matt (L:76-77); feel rooms only for a truly new
  mechanic (L:78-79); the story keeper's nature check and the difficulty-meter number per design (old persona :175-178).

## (3) Contradictions with LAWS.md, PM.md, CLAUDE.md
- D:91 start reading list omits what CLAUDE.md requires at every lead start: reference/PARTNER.md, reference/LEADER-STANDARD-WORK.md,
  reference/CONTINUOUS-IMPROVEMENT.md, Matt's handoff doc (Docs connector), and STATE.md read as "the live ledger" (D says "the bottom").
- D:83 "Touch production code... yourself; every change goes to a member" drops PM.md:23-24's one exception (a one-line fix to unblock a
  failing live deploy, audited after). Either keep the exception or say Matt removed it, with the date.
- D (silent) vs PM.md:81 "every result goes to the Critic": L:74-75 narrows it by Matt's word; D must say so, or a cold lead follows PM.md.
- D:66 "send_message priority now" and D:67-68 retire rule agree with PM.md §7. D:62 "at most 4 running" agrees with L:37, but does not say
  whether the permanent story keeper counts (see 4).
- D:86 "Merge to main or release without Matt's word; send testers to Matt's private test link" is one bullet joining two rules with a
  semicolon; readable as one condition. Split it.
- No contradiction with the LAWS headlines found beyond these.

## (4) Vague lines that will cost an AI lead tokens, with the exact rewrite
| Line | Now | Rewrite |
|---|---|---|
| D:42-43 | "its last turn's cache_read_input_tokens" | "its last result's input_tokens + cache_creation_input_tokens + cache_read_input_tokens (list_events kinds [\"result\"], limit 100), divided by 1M" |
| D:55 | "the decisions in STATE.md waiting on him" | "the 'Waiting on Matt' line in lead.md RIGHT NOW (each with an R-id and your pick)" |
| D:62 | "at most 4 running" | "at most 4 members running, not counting the story keeper" (or counting it: Matt's word, whichever is true; L:37 doesn't say) |
| D:40 | "the box" | "the box (60-90 minutes; lead.md:35), plus the 40% context stop" |
| D:76 | "several games from the shelf" | "at least three games from different series and eras, each with one line on why it fits a sloth on a phone" |
| D:91 | "the bottom of STATE.md" | "`tail -60 reference/STATE.md`" (a number, so the lead doesn't read 1,200 lines) |
| D:92 | "the story keeper (lead.md names it)" | name it: "session_01FhBbYMCa3JXWmyQicbmxuu (L:132; PM.md:69)"; RIGHT NOW doesn't name it, so the lead greps |
| D:90 + D:98 | step 1 overwrites lead.md's top line; step 7 asks "the backup lead" | step 1: "move the old top-line session id to 'Backup lead:' on line 2, then write yours"; otherwise the backup's id is gone |
| D:74 | "a located, honest miss ... may be accepted" | "may be accepted by the lead, written in the level's REPORT and LEVEL-LOG with the bot, frame and reason" |
| D:94-95 | step 5 "Answer from the documents alone" | add "write the five answers as the first lines of lead-review-<date>.md" so step 6's Critic can check them |

## What must change for a PASS
1. RIGHT NOW: live version, refreshed member table (ENG-B4 archived), "Next 3" with who/tier/packet, "Waiting on Matt", the links, D70 in the queue.
2. D: release pointer (PM.md §5 + release.md, PR not draft, APK), Critic-sparingly rule, the supersede line for medium/max/low, the
   tightened gate-scope line, "at least three games", the corrected context formula, CLAUDE.md's full start list, the deploy-fix
   exception decision, the dropped 11-13 directions (scoreboard, 1+1 / 2-hour target, nodes, pass/fail stills, box length, cost report).
3. Repoint L:16 or keep the full engine quote in D.

---
# Delta re-audit (4:09 PM ET 11-14) of origin/ccr-ea739a2f-dfcee4@2d17f2b6, against my list only
Verdict: **REJECT, two lines left** (both in PM.md, both two-minute text edits). Everything else is fixed and checked against the files.

## Fixed (checked)
- (1) RIGHT NOW (lead.md:84-98 at 2d17f2b6) now opens with Live, links, release, Waiting on Matt, Next 3 with who/tier/packet. "Live 0.9.8"
  is TRUE: 73e7bed0 (PR #71, 11-13 11:18 PM ET) is on origin/main and package.json reads 0.9.8 (my first pass said 0.9.7 from the old
  L:140: that line is now stale, but RIGHT NOW wins). Members table: ENG-B4 gone, ENG-16F and INT-9 listed. D70 review is in Next 3 #2.
- (2) Draft: xhigh/high with an explicit supersede line (D:71-73); models.json 'ideas' is [high, xhigh] (confirmed); lead.md:28, :43,
  :45-46 rewritten; gate scope exact (D:40-44); "at least three games, different series and eras" (D:87); context formula
  corrected (D:48-49); scoreboard, 1+1 / 2-hour target, Critic sparingly (D:44-46); pass/fail stills (D:90); box lengths (D:40);
  difficulty number, nature check, feel rooms (D:92-93); cost report (D:81-82). L:16 repointed.
- (3) Start list carries the full CLAUDE.md reads + handoff doc (D:109-111); deploy-fix exception kept (D:98-99); Never bullet split (D:102-103).
- (4) Every rewrite applied: Waiting-on-Matt pointer (D:62), keeper outside the cap (D:71), tail -60, keeper id (D:112), backup line (D:107),
  the accepted-miss rule (D:85-86), five answers into lead-review (D:115).

## Still contradicting the draft (blocking: the lead reads PM.md at step 2 and gets the opposite order)
1. **PM.md:89 §4 item 4** still says "**Every result goes to the Critic** (a separate fresh agent)". The draft (D:44) and PM.md's own §9
   table (:223) now say sparingly. Rewrite: "4. **The Critic sparingly (Matt 11-13, R-165.183):** a fresh Critic for releases, shared
   engine code, an integration head before a test link, plans and contested calls; the lead judges ordinary results on the real screens.
   PASS: merge into the release candidate branch (never main), update STATE.md. REJECT: the 3-strike breaker (TEAM.md rule 4)."
2. **PM.md:175 "## Model and effort (standing rule)"** still says "high or medium ... Max only with Matt's yes". It is the section titled
   as the standing rule, so a cold lead will trust it over the draft's supersede line. Rewrite its first sentence after the 11-09 quote:
   "SUPERSEDED 11-14 1:51 PM ET (Matt: 'we only are going up to extra high... builders at least high'): every member on Opus 5.5 at high;
   xhigh for engine, integration, merges and the hardest fixes; no max, no medium, never low (tools/team/models.json)."

## Not blocking (fix with the next lead.md refresh)
- lead.md INT-9 row still says "the new 1-6 when ENG-16E is GREEN": ENG-16E is retired; ENG-16F.
- The old "Queue ... in order as slots free" paragraph below the table repeats and partly disagrees with Next 3 (e.g. Next 3 #3 waits
  "after R-165.246's lift pass", which has no owner, tier or packet). Delete the old paragraph or fold it into Next 3 with an owner for the lift pass.

A PASS needs only the two PM.md edits; `grep -n "Every result goes to the Critic\|high or medium" reference/roles/PM.md` returning nothing
(outside quoted history) proves them.

# The engine plan: DRAFT (the new lead, 2026-11-11 6:15 PM ET), held for review: Matt 6:01 PM ET "release first, then the engine; research what goes in the engine versus hard-coded". Source: GAME-MAP.md §10 on t-design-game-map@6909c3c9

Matt, 11-11: "a large portion of the engine done up front so levels can be expedited... not level to level." Matt, 11-11 ~6 PM ET:
"You can use Fable 5.2 High to get the engine fixed and ready."

## What "the large portion" is (the lead's call)
Everything most stages need, built once, before levels are laid: **GAME-MAP §10 Part A (A1-A16, about 110 h)**, plus the Day-1
defects that hit every stage (R-165.116 frame loop speed-up, R-165.117 refused saves, R-165.121 live 8-5/8-6), plus **the World 1 and
World 2 pieces in Part B** (about 52 + 47 h) so World 1 can be laid while World 2's pieces finish. **About 210 h.**
Waits until its world: every Part B piece from World 3 on (about 130 h), each built in the sprint before its world is laid.
Cut from the engine: anything only one or two stages use (GAME-MAP marks these CUT? with a cheaper way).

## The rule for every piece (D43, D44)
- Works for any stage, proven on at least two stages from different worlds or directions. No stage id, seed or x in engine code (A1's
  gate fails the build).
- Engine pieces: Fable 5.2 high, full rigor (a cold Critic on the result). One-level features: good enough now, polish at finalize.
  No more 1-1 polish rounds until 1-1's finalize.

## Lanes (each builder a fresh session with its own Critic; packets in reference/packets/2026-11-11/)
| Lane | First packet (tonight) | Then, in order | Hours |
|---|---|---|---|
| Engine 1, the spine | EN1: merge the stage kit types (A2), travel as a mode (A3) | A7 gen2 lays up, down, left; A4 old special runs as modes | 30-50 |
| Engine 2, the checks | EN2: any stage onto gen2 by data, proven on 1-2 (the passed 1-2 engine packet E12: routing, hurt floors, finds) | A5 jump checks by brief; A9 generator yield; A10 hazards and hearts | 25-40 |
| Engine 3, guards and shared | EN3: the generality gate (A1), the frame-loop speed-up (R-165.116), the refused save (R-165.117) | A14 one clock; A13 one brick library; A11 help ladder; A12 bots; A15 rewards; A16 goal kinds | 35-55 |
| Designer (from 11-12, after Matt's answers) | World 1 stage briefs (1-3 to 1-9) on the kit; A6 every move's arcs flown | World 2 briefs | - |
| Then | World 1 and 2 Part B pieces split across the three engine lanes as their spines finish | | about 100 |

## Dates (measured where possible)
- No measured history for Fable on engine builds. The map's rate: about 24 useful helper-hours a day with three lanes (C1 lost about a
  third of its time to Critic rounds, STATE.md 11-11). Part A plus the defects: **about 5-6 days, done around 11-17**. World 1 laying
  starts when EN1, EN2 and A5 have passed (**about 11-15**). The World 1 and 2 pieces: **about 11-21** (range 11-19 to 11-25).
- I re-measure after the first three packets land and give Matt the real rate.

## Risks
- Three lanes in one engine: engine.ts and pipeline.ts are shared. Each lane merges the newest passed lane before its next packet.
- gen2's yield (2 clean stages in 120 fresh seeds, R-165.120) may be the long pole: it is a Lane 2 item and is measured first.
- The release in flight (0.9.6) is the base; the lanes merge main after it lands.

## What merges, in what order
release-0.9.6 to main (Matt's merge) -> t-engine-seedchunks and t-engine-11-followup (after their Critics) -> the lanes, each after its
Critic, in the order they pass. The audits' failing tests (t-audit-engine-a/b/c) are brought in by the packet that fixes each.

## The lead's review of the game map (11-11 6:20 PM ET, Matt: "clear eyes... do not just assume what's been done is the best")
Sound, keep: the brief recipe (mission x direction x clock x rules x moves), ADR-003's one engine with plug-in modes, one clock, the
cut list (§10 C: about 65 h of one-stage pieces done the cheap way for about 9 h), the move ladder, building world pieces one world ahead.
Change:
1. **Measure the engine by "hours to lay a stage", not by a feature list.** The map's own numbers: about 300 h engine, about 700 h laying
   86 stages (about 8 h a stage; 1-1's re-lay took 6 h 04 m with two Critic rounds). The engine is worth what it cuts from that. Target:
   2 h or less a stage, Critic included, by the end of World 1.
2. **Generator yield goes first, before gen2 learns new directions.** gen2 lays a clean 1-1 from a fresh seed 2 times in 120 (R-165.120).
   Every stage then depends on hunting seeds, which is why laying costs 6-8 h. If the cause is structural (V19b and "pool short" refusing
   most rolls), fixing it may change the generator, and building every-direction laying (A7) on it first would be building on what gets
   replaced (D40). So: A5 verdicts by brief, then A9 yield measured and fixed, then A7.
3. **A proper home for one-stage set pieces (the stage script).** Today the choice is "general in the engine" or "hard-code a branch",
   and the hard-coding is how gen2 became 1-1-only. The 27 hand-made stages (guardians, hidden, set pieces) and every cut-list piece get
   a per-stage script beside the world data, built on the engine's plugs (MutatorRun, ModeHost, one clock). It may name its stage; engine
   core may not (A1's gate draws exactly that line). Nothing used by one stage enters the engine.
4. **A vertical slice before mass production.** Lay 1-2 and 1-3 on the general engine as the proof that "laying is fast", measure the
   real hours, and only then plan World 1's remaining stages on that number. 1-2 lands as a stage laid by data, never as engine work.
5. **Review depth follows risk.** Engine pieces: a cold Critic each. Stages laid on proven pieces: bots and gates on every stage, a
   Critic on the first stage of each new piece and a sample after that, not two Critic rounds on every stage. (Cost seen today: the two
   1-2 packets used about $98 of model time across 8 rounds for one level's paperwork.)

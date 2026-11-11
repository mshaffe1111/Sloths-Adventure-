# TASK C1-tests (R-165.72, in parallel with the C1 re-lay)   to: Engine   model: claude-opus-5-5   effort: high   due: 9:30 AM ET
## Why
Matt, 11-11: 1-1 done today. The C1 re-lay helper (session_01FhBbYKuMAy8KTe8bM5g9Tk, branch t-content-c1) lays w1.ts; you write the
checks its done-items 3, 4, 5 and 7 need, in parallel, so it never stops to build tooling. Built on: E0a (stays); replaced this sprint
by: nothing (D40).
## First
`git fetch origin ccr-ca657d3c-n09zty t-engine-e0a t-engine-help t-bots-tiers t-designer-reach`. Read
origin/ccr-ca657d3c-n09zty:reference/packets/2026-11-11/CONTENT-C1-relay.md (done-items 3, 4, 5, 7: your spec), reference/LESSONS.md
D37-D40, reference/roles/ENGINE.md.
## Build (branch t-content-c1-tests from origin/t-engine-e0a, newest head; NEW files only, no edit to w1.ts or engine code)
1. src/game/gen2/worlds/w1.relay.test.ts: (a) teach first: a practice gap before every 252-262 test gap on Normal, Easy's variant
   taught, the bounce card at the first mushroom; (b) room for help: every rise within a plain single climb (reach.md) or with flat,
   pit-free solid ground before its face of 80*(n-1)+160 px, n = ceil((rise-60)/60), mushroom-given rises (edge 20-60 px from the face)
   exempt and counted; prints the tallest non-mushroom rise; (c) put-backs: RealPlay falls into each gap that follows a needed mushroom
   or rise; the put-back x never past the mushroom's near edge or the rise's foot (engine.ts:2467-2471 rule). All over every listed seed,
   both settings. They are EXPECTED red on today's layout: print the counts.
2. tools/inspect/c1judge.ts: one command that runs the tier bots (t-bots-tiers; copy its two tools/inspect files in until it merges)
   over variants 1-40, 3 tiers x 2 settings, on the current checkout and prints done-item 7's table against calibration-a1.jsonl:
   rescues, put-backs per run vs baseline, Normal lives with the REAL loseLife (RealPlay stubs it, realPlay.ts:141: name how), expert
   minimum finish with STAGE-RULES.md:68's climb discount, per-piece table.
## Done
Both run on today's E0a layout and print (red is fine and expected); a planted good case passes each (a) (b) (c) check; tsc clean.
Push, ls-remote, then ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy) AND one to the C1 helper
(session_01FhBbYKuMAy8KTe8bM5g9Tk) naming the head and the two commands, 4 lines each. Then stop.

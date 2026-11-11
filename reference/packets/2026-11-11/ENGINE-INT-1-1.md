# TASK INT-1-1 (the new 1-1 together: rules + re-lay + help + room to ship, for Matt's test link tonight)   to: Engine
# model: claude-opus-5-5   effort: high   due: dispatch + 4 h
## Why
Matt, 11-11: 1-1 done today, then help and art on the finished layout (no patching what is replaced). Built on: E0a d2748131 (PASSED),
C1 (the re-lay, its Critic's verdict named by the lead), the help ladder's layout-free parts (t-engine-help@98186930), the vendor split
(t-engine-chunks@e67809c3, PASSED). Replaced this sprint by: nothing (D40).
## First
`git fetch origin ccr-ca657d3c-n09zty t-content-c1 t-engine-e0a t-engine-help t-engine-chunks t-content-c1-tests t-bots-tiers`. Read
roles/ENGINE.md, LAWS.md, LESSONS.md (D37-D41), ONE-ONE-FIX-PLAN.md (the help schedule, its amendment, the 5:46 AM ruling), the help
packet reference/packets/2026-11-09/ENGINE-R-165.62-A2.md and the A2 Critic findings in STATE.md (11-11 4:43 and 6:26 AM entries).
## Build (branch t-int-1-1 from the C1 head the lead names)
1. Merge t-engine-chunks (vendor split + chunkcheck). Main chunk under 3,994,304 B after everything below.
2. Bring in the help ladder from t-engine-help@98186930: KEEP the layout-free parts (helpLadder counting and rungs, Dot's lines and
   the bubble rules, HelpOffer + Back = no, addStep, the stair builder, canGrow: no line/offer where nothing can grow, the sweep).
   DROP the special cases written for the OLD layouts (skyline catch-flag and hidden-under-floating rules, stump take-in, narrow-stump
   swap, sliver trims, BOUNCE_NEAR/BOUNCE_ALONE, planks in wide gaps) unless the new layout still needs one: then prove it with a seed.
   The help schedule is unchanged (Easy 3 line / 5 pad / 8 steps; Normal 3 line / 12 offer, re-ask once 8 later; Quiet no lines).
3. The help sweep on the NEW 1-1, every listed seed, both settings: zero floating rocks, zero faces over 60, zero sunk; Dot never
   promises a step that does not grow; plain jumps pass every piece after the steps.
4. The suite: fix the failures the C1 Critic classifies as expected from E0a+C1 (tests pinned to old seeds or old closed-form reach:
   update them to the new truth, never delete or skip; a test that must change says why in one line). Full suite green in 3 shards.
5. Stills: the step growing (Easy 8) and the offer (Normal 12) on the NEW layout, upright and sideways; Dot's line at 3.
## Done (the Critic checks each)
tsc; full suite 0 fail; seedlist 1-1 --check PASS; lockall: only 1-1; chunkcheck; drawcheck; clipcheck; knowncheck; roadmapcheck;
c1judge on the passed bots (put-backs per run no higher than C1's own run, lives 0, rescues 0 middle/expert); the sweep in 3; stills in 5.
Push, ls-remote, REPORT.md (7 sections, 50 lines), ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 6 lines. Stop.

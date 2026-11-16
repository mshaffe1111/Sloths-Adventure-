# FEEL-VINE: smooth vine grabs, vine tops and vine-to-vine switches (R-165.214). Opus 5.5 xhigh (engine). Written 5:47 PM ET by the lead.
Matt played 1-4 on his test link (5:45 PM): "The climbing vines and going from vine to [vine] felt a little off too. Not very smooth."
Asked what felt least smooth, he picked: GETTING ON OR OFF (grabbing a vine from a branch; the vault onto the branch at the top) and THE
JUMP BETWEEN VINES. 1-5 felt better overall. Every climbing stage in every world uses these moves: fix the engine, never one stage (D43).
Branch t-feel-vine from origin/t-int-5. physics.ts is held by PERF-BUILD (reach memo, pushing to t-perf-build ~6:25 PM): measure first;
before you edit physics.ts, merge origin/t-perf-build's final head and tell the lead. The vault finder is src/game/vineTop.ts (VARIETY,
11-13); the two-hand climb art is hero-climb2 (R-165.178). Matt's earlier word on climbing (R-165.177/.178): "I like the 1.6 speed",
a motion for him to climb between two vines, Donkey Kong Jr.'s two-vine feel.
## Done
1. MEASURE on the real engine at 30 fps (RealPlay or the real page; D37), on 1-4 both settings: frame by frame through (a) a grab from a
   bough onto a vine, (b) the vault at a vine top onto its bough, both facings, (c) a jump from one vine to the next. Name each thing
   that reads as not smooth with numbers: frames with no motion (stalls), position snaps (px in one frame), velocity jumps, a pose that
   pops, input ignored, camera jumps. Record a clip of each (both orientations) BEFORE.
2. Fix each at its root in the engine (eases, carried momentum, catch windows, pose blends), for every stage; no rule or STAGE-RULES
   number loosened (straight up/down on a vine always climbs). Planted tests for each (a snap that came back would fail).
3. AFTER clips of the same moves, both ways, side by side with BEFORE, into reference/qa-reports/FEEL-VINE/clips/ for the lead and Matt.
4. Full CLAUDE.md Checks on your head; lock 102/102 and seed lists PASS (feel changes must not move any stage).
BOX: 90 minutes or 40% context: push, REPORT (30 lines + Learned) with EXACT NEXT STEP, stop; never stop with a gate running (D59).
Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.

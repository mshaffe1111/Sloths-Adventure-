# DESIGN-19: 1-9 "The Boa's Branches", designed to build in under 2 hours, + 2-1/2-2 concepts aimed at the engine. Opus 5.5 high (designer). Written 6:18 PM ET 11-14.
Role card: reference/roles/DESIGNER.md. Read FIRST reference/methods/level.md (Building rules), then ONLY: packets/2026-11-13/IDEAS-1-6.md
"THE TRIBUTE RULE" section; reference/design/1-8.md on origin/t-1718-design (the format to copy, whole); DIFFICULTY.md:55-70;
PREDATORS.md rows for the boa (lines 39, 74); MAP-REVISIONS.md lines 55-60 and rows 21, 30, 25, 4, 6, 7; WORLD-MAP.html lines 195-205;
INSPIRED-BY.md, PLATFORMER-100-MATT.md and PLATFORMER-100.md (skim: pick from the WHOLE shelf, Matt R-165.248).
Why: Matt's scoreboard is a level built in under 2 hours (R-165.254). A design that names only pieces the engine has is the fastest level.
Facts (lead, checked on origin/t-int-9): the boa exists (src/game/predators/world1.ts:49-70: beaten by trap, lure, still or punch; first
'trap'); drop traps wired (dropTrap.ts, engine.ts:119); foodChain wired (castPlay.ts:14,176); gen2/lureLay.ts exists but is NOT wired;
1-9 is still hand-built (protoStage.ts:70); stagePlan.ts:55 calls it a gauntlet. 2-1 and 2-2 are hand-built (w2Stages.ts:1-11): 2-1 drifting
logs (river.ts), 2-2 lily pads that should sink (ride.ts newPad/stepPad exist, unwired), beatBrick 'bites' = snap-jaw stones, unwired.
Deliver on branch t-design-19 from origin/t-1718-design, by 9:15 PM ET:
 (1) reference/design/1-9.md in 1-8.md's format: Normal target from DIFFICULTY.md:61 (pasted, never typed), Easy, the beat table, the
     NODE STRING, every NEW block with size (S/M/L) and the exact engine file it needs, one clear idea, first appearances taught, Dot's line
     asks for the story keeper (don't write final lines), the nature check (hunters are chased off or flee, never eat: MAP-REVISIONS:181).
     Tributes: at least 3 games from different series AND eras, one of them post-2005, each with researched a/b/c/d as IDEAS-1-6 asks.
     Target: at most 2 NEW engine blocks, each S or M. If the idea needs more, say which you'd cut and what it costs.
 (2) reference/design/2-1-2-2-concepts.md: one paragraph each (the idea, tributes, node string sketch) and the full engine list both need
     (World 2 gen2 kit, ride lay, sinking pads, snap stones, lanes...), ranked, each with the file it lives in. The lead plans the engine from it.
 (3) reference/design/W1-TRIBUTE-PASS.md (Matt R-165.253): for each of 1-1..1-8, ONE change using pieces we already have that gives it its
     own feel, tied to one game on Matt's shelf, with the reason in one line. Under 40 lines.
Gates: roadmapcheck + knowncheck (docs only). End your report with "Learned" and any proposed level.md rule changes.
BOX: report by 9:15 PM ET, or at 40% real context (400k). No shell wait loops (D67). Report to the lead session on reference/handoffs/lead.md
line 1 (session_01FhBbYN2CVHnFXg7XzqKXpM); every message carries your context %.

# FEEL-CAM: the camera eases when Pokey grabs or leaves a vine (R-165.214, second half). Opus 5.5 xhigh (engine). Written 6:26 PM ET by the lead.
Matt (5:45 PM): getting on/off vines and vine-to-vine "not very smooth". FEEL-VINE fixed Pokey's own snaps (drawn settle, t-feel-vine);
the lead's look at its sheets found the CAMERA jumps in one frame at the grab, before and after alike (grab-up-sheet frames 11->12 ~150-180
px; leap-up-sheet 7->8 ~15-20 px). FEEL-VINE's lead: cameraFollow.ts:40 camAnchor follows p.y the moment climbing starts; headless showed
<= 17 px/frame, the real page differs. Branch t-feel-cam from origin/t-feel-vine's final head (its REPORT EXACT NEXT STEP is your start).
You hold cameraFollow.ts (free) and FEEL-VINE's new files; engine.ts only by asking the lead (POLISH-2 has the fig gate's lines).
## Done
1. Measure e.camera per frame ON THE REAL PAGE (vineFeelClip.mjs) through grab, vault, field step, leap catch, getting off, both
   orientations, 1-4 and one other world's climbing stage: name every frame the view moves more than a phone's eye reads as a cut.
2. Fix at the root for every stage: the anchor eases (a damped follow) into a climb and out of it, never a one-frame re-pick; the
   camera tests stay whole (cameraFollow.test.ts: the 330 px swing lead etc.); Pokey never leaves the screen's safe band.
3. Before/after sheets + clips (both ways) for the lead, then Matt. Full CLAUDE.md Checks on your head (drawcheck, clipcheck included).
BOX: 75 minutes or 40% context: push, REPORT (30 lines + Learned) with EXACT NEXT STEP, stop; never stop with a gate running (D59).
Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.

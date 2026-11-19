# PLAN-W3: World 3 (Mossy Grotto) mapped stage by stage to engine pieces, art and teach order, plus World 4 at outline depth, so the engine is built a world ahead (R-165.313).
Designer, Opus 5.5 high. Written 5:35 PM ET 11-19 (by `date` in the same command); starts in the first free slot tonight. A FRESH member.
BOX: 2.5 h from start or 400k REAL context (the lead reads it and tells you); then the EXACT NEXT STEP pushed. Nothing runs past 11:15 PM ET.
WHY (Matt 11-19 5:32-5:33 PM ET): "we should be trying to plan out at least a whole stage ahead, if not 2 stages ahead, so that we're able
to piece together things and not wait until they're due at that exact stage or level." The game map already says it (GAME-MAP §5 Phase B:
World 3's engine pieces are built WHILE World 2 is laid); today only 3-1 and 3-2 are picked and nothing for World 3 is built.
Role card reference/roles/DESIGNER.md. Read: reference/LAWS.md + LESSONS.md once (D30, D40, D57/D87, D90 lean reads), reference/methods/level.md,
and ONLY these sections: `git show origin/t-design-game-map:reference/plans/GAME-MAP.md` §3 (the progression), §4 World 3 and World 4,
§5 (the engine build order), §10 B (shared moves); reference/design/PICKS-29-32.md (the 3-1 and 3-2 picks and "Foundations first");
reference/plans/BUILD-ROADMAP.md (the day table and "World 3 engine that is general enough to start now"); ROADMAP rows R-160.1, R-160.2.
Check every "exists" claim in the code (file:line), never from the map's memory (the map is from 11-11; much has changed: gen2 kits now
exist for w1, w2, w5-w8; zones.ts, lantern.ts, enemyBrain.ts, predatorAI.ts, finds.ts, thornVine.ts, w7SlideRun.ts, glowWake in engine.ts).
Write reference/plans/WORLD-3-PLAN.md on branch t-plan-w3 from origin/main (docs only; no code):
1. A table, one row per stage 3-1..3-9 + the hidden stage (The Cave Slide) + the guardian (Shadow Prowler): mission, the one idea (3-1/3-2:
   the picks; 3-3..3-9: the map's twist as the starting point, marked "to pitch"), what it teaches and where that was first taught, the
   engine pieces it needs (EXISTS with file:line and the stage that proves it / EXISTS-UNWIRED / NEW with size S/M/L in hours and the planted
   toy that would prove it), the art it needs (inventory ids that fit to scale with Pokey, and what is missing), the meter channel and the
   bot skill it needs.
2. The World 3 engine list, deduplicated, in DEPENDENCY order (foundations first, D40): each a ready packet stub (what, size, the toy that
   proves it, what it depends on, which stages use it). Mark which can start NOW without a final design (expected: the World 3 gen2 kit
   + DOWN stages on a real row; the general dark + light ring zone any world can use; the prowler that sees him 170 px up (enemyBrain.ts
   roam, needed whatever is picked); noise that wakes sleepers; W3-ART), and which wait for a design (the hang lay's exact needs: HANG-SPEC
   is a show-first feel mock-up for Matt before any hang code).
3. The World 3 art list for Hugging Face, in the order the engine needs it, each with Pokey's scale, the closest shipped piece to start
   from (img2img), and a cost estimate (HF balance about $49, reserve about $10; World 3 has the thinnest standing art of any world and 0
   climb pieces: say how many pieces World 3's stages need to stand on and climb, from the stages' own needs).
4. A SLOT PLAN: fit World 3's pieces into the gaps of the World 2 plan (BUILD-ROADMAP's day table, 4 members at once, World 2 release 1
   Fri/Sat and release 2 next week keep first call on slots) so every World 3 engine piece is merged at least a week before its stage's
   build; the pitch rounds for 3-3..3-5 and 3-6..3-9 placed this weekend; the designs after them.
5. World 4 (Mist Cascades) at outline depth: the same table without toys, the three new engine pieces the map names (checked in code),
   art gaps (0 climb pieces), so World 4's pieces can start the day World 3's are in.
6. Questions for Matt, one at a time, your recommendation first (expected: the hang move's feel, R-160.1, via HANG-SPEC).
Gates: roadmapcheck (unshallow), timecheck (`node tools/timecheck.mjs` from origin/t-time-168b if not on main), knowncheck.
End with "Learned" and "Pushback". Send the lead the hash and a 10-line summary: what can start Friday, what waits, the art cost.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. A lead message that begins "NOT A STOP: read, then carry on" arrives as a cancelled tool with a STOP
text: that is only the delivery; read it and carry on.

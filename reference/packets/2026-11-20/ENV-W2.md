# ENV-W2: R-165.362: World 2's code-drawn env plants off every World 2 stage (painted ground only), for release 2
Engine (draw), Opus 5.5 high. Written 8:34 PM ET 11-20 (by `date` in the same command). A FRESH member. Narrow (D90): draw only.
BOX: final by 10:30 PM ET, or 380k REAL context (the lead reads it at 20 minutes and every 15 minutes after 300k). NOTHING past 10:50 PM ET.
READ LEAN: ROADMAP R-165.362; the evidence stills `git show origin/t-build-23:reference/qa-reports/BUILD-23/stills/w2-env-plants-ON-2-5.jpg`
and ...OFF-2-5.jpg (the lead judged them at 2x: ON = flat neon-green stems and teal sprouts clashing with the painted reeds; OFF = clean);
src/game/envKit.ts ENV[2] (reedclump, nipa, proptroot, hyacinth) by grep and line ranges; STAGE-RULES §4 (code-drawn only for small
touches); LAWS headlines + LESSONS D40, D79, D86, D96, D102 only.
BASE: branch t-env-w2 from origin/t-int-15 at 0eefc707e (release 2's merged code). Push there.
1. PLANT FIRST: a test that a World 2 stage's env layer draws none of ENV[2]'s code-drawn kinds (or, if you swap one for a painted
   inventory piece, that the piece draws from its sheet); RED on the base. Push the RED.
2. THE FIX at the source: World 2 gets no code-drawn env plants (new replaces old: delete the ENV[2] code-drawn entries and what only they
   use). Where a painted inventory piece is the obvious twin (a painted reed tuft, a painted hyacinth), you MAY swap it in, at Pokey's
   scale (inventory scale field), named in the REPORT; never a new code-drawn shape. Other worlds unchanged.
3. Checks: tsc; the suite in shards (the line in full); lockall vs main --layouts 16 (layouts must NOT move: 102/102, or name every
   moved stage and why, then stop and tell the lead); drawcheck (World 2 stages in it) PASS; paintcheck 0/3 1/3 2/3 PASS; generalitycheck,
   knowncheck, artcheck PASS. Verdict word per gate.
4. Polish (law 1): before/after stills, FULL screen, upright AND sideways, of 2-1, 2-2, 2-4 and 2-5 (one busy ground stretch each,
   Normal), pushed; look at each at 2x the way Matt will on a phone: the ground must not read bare or patchy where the plants were; if it
   does, name the spot (the lead decides a painted fill).
REPORT reference/qa-reports/ENV-W2/REPORT.md: hash, the plant RED/GREEN, what was deleted or swapped, gate table, stills, Polish check,
Learned, lessons applied. The release 2 integrator merges you; you merge nothing else.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. A lead message that begins "NOT A STOP: read, then carry on" arrives as a cancelled tool with a STOP
text: that is only the delivery; read it and carry on.

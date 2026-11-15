# DIFF-RESEARCH: how to measure a level's difficulty, with the math, before World 2 (R-165.268). Opus 5.5 xhigh (research). Written 10:34 PM ET 11-14.
MATT, 11-14 10:26-10:33 PM ET: "we don't compromise our normal because of a kid's play... I don't think the algorithm really got it... we
look at enemy, jump difficulty, how often somebody can die, how fast the things are moving... a lot of different factors of risk... people can
die because they're just being risky... I don't know how we can properly judge it... we probably need to get our hand around it before we
start World 2... anything's possible if we understand the math behind it." He played 1-7 tonight: "really easy"; the meter read it 2.2 and
could not see the eagle at all (METER-1 REPORT §6).
Read ONLY: reference/design/DIFFICULTY.md (whole: today's model, bits per ask), METER-1's REPORT on origin/t-meter-1 (what it fixed and what it
still can't price), reference/qa-reports/R-165.59/ + tools/inspect/BOTS.md (the tier bots calibrated to the testers), GEMINI-PCG-RESEARCH.md
lines 80-90 and 255-290 (what was already researched: generation, not difficulty).
Research (open the pages; en.wikipedia.org, www.gamedeveloper.com, www.pcgamer.com, www.gamesradar.com open from here; for papers use the
authors' pages, arXiv, Semantic Scholar or the ACM/IEEE abstract pages if reachable; quote with URLs, mark anything not opened):
 - difficulty as probability of failure measured by play (Aponte, Levieux & Natkin, ~2009-2011);
 - simulated players with human motor noise and survival analysis (Isaksen, Gopstein & Nealen, 2015, Flappy Bird game space);
 - per-obstacle success probability in platformers (Mourato & Santos, 2010) and rhythm groups (Smith et al., Launchpad);
 - timing-window error models (Lee & Oulasvirta 2016, already cited) and Fitts/steering for touch;
 - dynamic difficulty / flow (Hunicke 2005; Csikszentmihalyi as used in games) and how shipped platformers tune (Celeste, Mario Maker
   clear rates as public difficulty data, DKC/Shovel Knight design talks) - what players feel as "hard but fair" vs "cheap".
Deliver reference/design/DIFFICULTY-MODEL.md: (1) the model in plain words and math: per beat on the REQUIRED path, P(fail) for a tester-like
player from precision, reading time, pressure/overlap and novelty; stakes on top (heart + setback to the flag); the level number as expected
retries + setback per tier; optional risk (rewards) excluded; (2) how WE compute it with what we have (castBots tiers + human timing noise,
flown arcs, the stage's own lay), and what's missing; (3) validation: per-beat retries vs the testers' sheet data (roles only, no names) and
Matt's verdicts (1-7 "really easy"; 1-6/1-8 when he plays them); (4) how the bands in DIFFICULTY.md §4 map onto it; (5) the build plan for
METER-2 (files, tests, plants), sized. Under 200 lines plus a sources list.
Branch: t-diff-research from origin/ccr-ea739a2f-dfcee4. Gates: roadmapcheck + knowncheck. A cold Critic reviews it before METER-2 starts.
BOX: started 10:38 PM ET 11-14 on Matt's word; report by 11:30 PM ET (Matt's cutoff) or at 40% real context. If the model isn't finished, push what you have with its sources and an EXACT NEXT STEP. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.

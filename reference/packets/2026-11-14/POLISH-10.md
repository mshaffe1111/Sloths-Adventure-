# POLISH-10: the World 1 rough spots Matt shipped with today (R-165.243, R-165.237), fixed at the root for every stage. Opus 5.5 xhigh (engine tier: drawing code). Written 2:38 PM ET 11-14 by the lead.
Branch t-polish-10 from origin/t-int-8 (link #2 head). Matt said "ship now, fix next" on 11-14 for the first two.
1. R-165.243 line: a thin dark horizontal line runs straight across World 1's background art (1-1 x11560 sideways, y~510 of 824 at 2x;
   1-7's carpet still y~410; the lead's crop: reference/qa-reports/lead-rough-spots-1114.jpg). Find the layer/tile join or draw call that
   makes it (a seam between two background tiles, a stroke, a 1 px gap in a scaled layer), fix the root, and grep every other world for
   the same cause.
2. R-165.243 arrow: the bounce cue is a code-drawn white up-arrow over the mushroom (bounceArt.ts:134). Replace it with a painted cue
   from the art we have (HF only if nothing fits; log in HF-SPEND.md) or drop it if the glow alone reads as "bounce here": decide from
   stills both ways, and say which.
3. R-165.237: a hard vertical seam in 1-4's backdrop canopy sideways, and the unlit flag's gold rim reading as a hollow halo ring: fix the
   seam at its tiling root; try a soft filled glow vs the ring, stills both ways on 1-1/1-4/3-1.
Stills before/after, upright + sideways, at the exact spots. Gates scoped by what you touched (LAWS 5, Matt 11-14: tsc, unit, drawcheck,
artcheck; the integrator runs the full set). No until/sleep wait loops (D67); read the queue at every push (D57).
BOX: 75 minutes or 40% context (400k of 1M by the real figure, read from your own last turn). Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.

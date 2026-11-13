# FEEL-PAIR: a feel-test room for the two-vine climb, alone, for Matt (R-165.170) (the lead, 2026-11-12 7:42 PM ET). Opus 5.5 xhigh
(engine). Branch t-feel-pair from the FINAL integration head (the lead names the sha).

Why: Matt (11-12): "I'm afraid that we're gonna try to use something that just won't work, and it's gonna take out how it feels and
kind of ruin it from the beginning." So before 1-4 is built, he plays the pair ALONE in a small room on his test link and decides if it
stays. 1-4.md (origin/t-14-design) piece 4: ONE liana draped over a bough (its loop in view: a plant, never two placed ropes); no new
button (up climbs; between the strands he takes both); twice as fast (tune in this room); arms out, a quicker rustle. First read
reference/roles/README.md, ENGINE.md, LAWS.md, LESSONS.md, STAGE-RULES.md, PERFORMANCE-RULES.md, PLAY-STORE-RULES.md, 1-4.md.

## Build
- A test room reachable ONLY in the QA build (VITE_QA_BUILD, like #ctest: never the shipped game), from a plain entry Matt can find
  on his test link (say exactly how in your report). In it: one single vine and one draped pair side by side, same height (about 3
  storeys), sound footing under both, a flag at the top, a stopwatch on screen for each climb, nothing that hurts.
- The pair as one grab in the engine (the climb speed a value on the vine piece; single = today's 220 px/s unchanged everywhere);
  hold up on the pair climbs both strands. Two speeds Matt can try in the room (e.g. 1.6x and 2x) chosen by a sign at the bottom.
- Art: today's vine art drawn as one draped liana (code-drawn joins are fine for a feel test); Pokey's climb clip, arms wider if it
  can be done cleanly without new art. Name every placeholder plainly in the report; the painted pair is the lead's art call later.
- Upright and sideways; touch controls; 30 fps; perf budget.

## Rules and return
Never change the single vine's feel anywhere else; no stage moves (lock check); every new test in CI; CLAUDE.md "Checks" green.
Stills both ways + a short clip of each climb for the lead to judge (polish bar, STAGE-RULES §5b). Return REPORT.md (40 lines or
fewer) under reference/qa-reports/FEEL-PAIR/ and a send_message to the lead (session_01FhBbYP63h7cCX8DyW69stq), 10 lines. No PR.

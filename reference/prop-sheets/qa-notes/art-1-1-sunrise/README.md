# 1-1 sunrise backdrop redo (R-165.25): where it stands, 2026-11-05 ~7:20 PM ET

Branch art-1-1-sunrise-2 (from origin/engine-core). Lead: session_01FhBbYN2DDsktc7BGtNxPFK.

## Done
- 1-1 plays its own set, w1sun2 (src/game/stageBackdrops.ts): far 7 + sky (the lead's pick, candidate 1), mid A|B (H-s76-7 | H2-s76-23,
  one 3729 px tile, two different clusters, clearings 420 px, joins 0.000 paint), near a copy of w1sunrise-near. One sky all stage
  (engine.ts:6040: the canopy fade is for chase/ascent stages only). Sheets: final/ (sheet-ingame, seams-3tile, clearing still).
- Root causes: the old far's prompt asked for orchids (tools/art/hfbackdrops/spec-F6.json); the old mid's cut trunk came from
  starts2.py laying a tree at x=0 (countermeasure: tools/art/sunrise11/cut.py mid refuses a take with paint in a join band; starts.py
  lays pieces between ground-only margins; join.py pads a short clearing with the strip's own ground).

## Gates (2026-11-05, ~7:40 PM ET, on art-1-1-sunrise-2)
- tsc PASS; vite build PASS (nothing over 4 MiB); build:store PASS; artcheck PASS; knowncheck PASS; roadmapcheck PASS (full history);
  drawcheck PASS (its 7 scenarios; 1-1 is not one of them, so 1-1 was also measured by a throwaway copy with scenarios ['1-1']:
  PASS both ways, and the same numbers as the old w1sunrise set); clipcheck PASS (83 known).
- tests: 2335, 2326 pass, 7 FAIL, 2 todo. The 7 (stage11.test.ts 1-1 floor/mushroom/double, stage15.test.ts 1-5 x3, plainWalk.test.ts
  dips) fail identically on the clean base 5aeb66bb2 without this branch's changes: engine-core's, not this lane's.
- funcheck FAIL (56 worse or new): identical on the clean base 5aeb66bb2: engine-core's layout work, not this lane's.

## Final files (sha256, first 16)
bb93a5b82fdaee27  w1sun2-far.webp
b8fc0fc004c525f9  w1sun2-mid.webp
85b0f79f9d32c642  w1sun2-near.webp
bfabbf7e1ff10ec9  w1sun2-sky.webp

## Follow-ups (for the lead to number on ROADMAP.md, law 21)
- 1-3 still plays w1sunrise (with the orchids and the cut trunk): move it to w1sun2, or its own set, after its own stills check
  (the lead, 11-05). Then delete w1sunrise-far/-sky/-mid/-near (new replaces old).
- The bootprint's Stage Cleared card picture (src/assets/props/w1-bootprint-card.webp) is the old flat round's; the in-stage decal
  was remade (reference/prop-sheets/qa-notes/boot11/, handed to engine-core 11-05 7:08 PM ET).

## Spend (estimates from GPU minutes, some measured: tools/art/sunrise11/jobs.txt, tools/art/boot11/jobs.txt)
Sunrise ~$2.55 of $5. Bootprint ~$0.15 of $3 (plus $0.13 on art-bootprint earlier).

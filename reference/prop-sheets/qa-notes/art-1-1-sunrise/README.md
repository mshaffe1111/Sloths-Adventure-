# 1-1 sunrise backdrop redo (R-165.25): where it stands, 2026-11-05 ~7:20 PM ET

Branch art-1-1-sunrise-2 (from origin/engine-core). Lead: session_01FhBbYN2DDsktc7BGtNxPFK.

## Done
- 1-1 plays its own set, w1sun2 (src/game/stageBackdrops.ts): far 7 + sky (the lead's pick, candidate 1), mid A|B (H-s76-7 | H2-s76-23,
  one 3729 px tile, two different clusters, clearings 420 px, joins 0.000 paint), near a copy of w1sunrise-near. One sky all stage
  (engine.ts:6040: the canopy fade is for chase/ascent stages only). Sheets: final/ (sheet-ingame, seams-3tile, clearing still).
- Root causes: the old far's prompt asked for orchids (tools/art/hfbackdrops/spec-F6.json); the old mid's cut trunk came from
  starts2.py laying a tree at x=0 (countermeasure: tools/art/sunrise11/cut.py mid refuses a take with paint in a join band; starts.py
  lays pieces between ground-only margins; join.py pads a short clearing with the strip's own ground).

## Follow-ups (for the lead to number on ROADMAP.md, law 21)
- 1-3 still plays w1sunrise (with the orchids and the cut trunk): move it to w1sun2, or its own set, after its own stills check
  (the lead, 11-05). Then delete w1sunrise-far/-sky/-mid/-near (new replaces old).
- The bootprint's Stage Cleared card picture (src/assets/props/w1-bootprint-card.webp) is the old flat round's; the in-stage decal
  was remade (reference/prop-sheets/qa-notes/boot11/, handed to engine-core 11-05 7:08 PM ET).

## Spend (estimates from GPU minutes, some measured: tools/art/sunrise11/jobs.txt, tools/art/boot11/jobs.txt)
Sunrise ~$2.55 of $5. Bootprint ~$0.15 of $3 (plus $0.13 on art-bootprint earlier).

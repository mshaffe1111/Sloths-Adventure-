# VAR-1: variety for 1-6, 1-7, 1-8 (R-165.276): more pieces, never rerolls. Level builder, Opus 5.5 high. Written 9:52 AM ET 11-18.
MATT 11-15 7:47 PM ET shipping 0.9.9 with funcheck accepted: "fix variety next". MATT 10-30 (standing): "I'd rather have more pieces and
have that variety than trying to just barely squeak past something... that should be the roll forward."
BOX: final hash to the lead by 4:00 PM ET, or 50% REAL context: push, REPORT, EXACT NEXT STEP. Each heavy check ONCE.
Role card reference/roles/ENGINE.md (builder half). Read FIRST reference/methods/level.md (Building rules), LEVEL-BAR.md, STAGE-RULES.md
§0-5b (variety bar), reference/methods/gates.md (funcheck: what each flag means), LESSONS.md once (D79, D81, D83).
THE FLAGS (0.9.9's funcheck, accepted for that release only; 11 new): 1-6 repeats 'JVJ'/'JVJJ'; 1-7 reads like 1-6 and "nothing new";
1-8 like 1-7 / like 1-6. The release logs: `git show origin/release-0.9.9-notes:reference/qa-reports/0.9.9/gates-ab8d5140/` (funcheck).
1. Branch t-var-1 from origin/main (6e7b85f8). Run funcheck once to see the flags on main; read each stage's design (1-6/1-7/1-8 docs on
   their design branches or in reference/design) so a new piece serves THAT level's one idea (1-6 lianas, 1-7 hide from the eagle, 1-8 the
   branch collapsing behind him), never a generic filler.
2. Add NEW section types / beats by data from what the inventory already has (src/game/art/inventory.ts, the master catalog): each new
   section its own shape, not a reroll or a re-ordered old one; first appearance taught. If a new piece needs new painted art, write the
   exact Hugging Face ask to the lead first (it decides; the art member may make it). No engine change: if one is needed, stop and tell the lead.
3. Relist the three stages (seedlist), castBots 1-40 x tiers x both settings each (every calibrated tier 40/40 or traced; Easy never harder),
   the meter per stage named, funcheck: every one of the 11 flags cleared and NO new flag anywhere; tools/funknown.json only shrinks.
4. Checks ONCE on your final head: tsc, suite, seedlist --check for 1-6/1-7/1-8 + 1-1, lockall --intended 1-6,1-7,1-8 (any other stage
   moving = stop and tell the lead), coveragecheck, registrycheck, knowncheck, generality, roadmapcheck, drawcheck for the three both ways (D81).
5. Polish: stills of every new section, upright + sideways, Normal + Easy, the whole screen (D79); before/after of the spot each flag named.
   Probe scripts use relative imports (D83). Do not touch 1-9 (BUILD-19 owns it) or 2-2 (ART-22P).
REPORT: reference/qa-reports/VAR-1/REPORT.md (hash, flags before/after, new sections listed with what each serves, bots, meter, gates,
Polish check, Learned, proposed level.md rules). Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries your REAL context %.

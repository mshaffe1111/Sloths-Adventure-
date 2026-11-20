# ART-NEXT REPORT (R-165.342): World 2/3 art needs vs the inventory, then batches
Branch t-art-next from origin/main 6e7b85f8f. Updated 5:11 PM ET 11-20.
## EXACT NEXT STEP (for a fresh member; I stopped at ~350k)
1. **DONE: the lead's picks (5:15 PM ET):** barge-s23; weir-s41; door-s11; letter-s37 + letterB-from37-s37; reply-s11 +
   replyB-from11-s11; boat-s11 + boatB-from11-s11 (frame B moves the oar only a little: cut both; the builder may add a small code
   bob/oar sway if the row reads weak, named in the catalog notes). REJECTED: boatB-from23 (orange drift), the boat s41 pair (haze),
   and ALL THREE REEDS (the flood band reads as a grey collar at game size): the flood-line reeds move to batch 2, the band painted
   as dark wet brown + silt, never grey.
2. **Cut** the 6 picked pieces (8 files with the B frames) (tools/art/hfnext/cut.py <take.png> <out.png> <K>; takes are WebP q88: convert to PNG first), into
   reference/art/hfnext/cut/ (NOT src/assets: artUse.allow.json only shrinks, an unplaced asset fails the gate). Edges 3x on light +
   dark (ART-W2B show-first). Catalog rows part NEXT1 (model tools/art/hfw2b/catalog.py on origin/t-art-w2b; file
   'origin/t-art-next:reference/art/hfnext/cut/<n>.png'; status "cut, not placed (ART-NEXT): a level builder wires it"; worlds
   2 best + every world it fits with reasons; footing: the barge's deck walk line; layer: barge platform/set piece, letters pickup,
   door/reeds/weir decor near, boat decor near (an actor's prop)); `python3 tools/art/catalog_master.py --emit`; artcheck; `npx tsx
   --test src/game/art/*.test.ts`.
3. **Scope widened (Matt 3:52 PM, via the lead): add the SPECIAL stages** to NEEDS-W2W3.md: World 2's hidden stage, both worlds'
   puzzle rooms, the World 2 and 3 boss fights (designs by grep: reference/design/, origin/t-design-*, origin/boss-design-*),
   HAVE/REUSE/GAP, GAPs folded into the batch list by first stage. Then batch 2 (grotto floor kit) on the lead's go.
## Done-items
1. The needs table: reference/art/NEEDS-W2W3.md (regular stages 2-6..2-9, 3-1..3-9, 3-hidden). DONE (special stages: step 2 above).
2. Batch 1 plan + estimate; the lead's GO 3:36 PM (cap $3; weir from World 2's brown rocks, origin/t-eng-rock w2-rocks.webp). DONE.
3. Batch 1: the first run's takes LOST (token lost; $2.06); the RE-RUN (cap $2.50) brought all 34 back for $2.02, pulled per piece.
   Takes sheet to the lead: DONE. Pick, cut, catalogue: NOT DONE (step 1-2 above).
## Lessons applied / learned
D30 (every time from `date`), D53 (roadmapcheck + knowncheck before the docs push), D57 (queue read at every push), D41 (Pokey 89.1).
Learned: the per-piece pull worked first time (6 pulls, all landed; ~1.2k tokens of context a part). An HF sandbox's token lives in the session's connection; a reset strands the files. Pull per piece (above). A tiny `cat` result
lands IN context and is not saved to disk, so it cannot be decoded: always use parts.
## Pushback
None on the packet. The hf_jobs "logs" call I tried at ~3:56 PM needed a human approval nobody could give (the lead interrupted it).
## Method update (proposed for reference/methods/hf-art.md §10)
"One sandbox" stays; add: the run packs each piece's takes into parts as they finish (tools/art/hfnext/packer.py) and the member pulls
and commits each piece as it lands, cheapest pieces first, so a lost sandbox token costs one piece at most (11-20: the first run lost
all 34 takes, $2.06; the re-run lost none). Never peek with a small cat. Turnover: art-director.md §0i.

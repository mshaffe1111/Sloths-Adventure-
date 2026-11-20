# ART-NEXT REPORT (R-165.342): World 2/3 art needs vs the inventory, then batches
Branch t-art-next from origin/main 6e7b85f8f. Updated 4:25 PM ET 11-20.
## EXACT NEXT STEP (for me or a fresh member)
1. **Batch 1 is LOST, not done.** The sandbox (6b00afea...) ran the spec but its token was lost at ~3:55 PM (403 on exec/fs); terminated
   4:24 PM, $2.06 spent, nothing back (HF-SPEND.md). Re-run needs the lead's go + a NEW cap (~$1.8: $0.94 left of $3 is not enough).
   Re-run as is: `hf_sandbox create --name artnext-b1 --image ostris/aitoolkit:latest --flavor rtx-pro-6000 --timeout 1h
   --forward-hf-token`, then exec detached `curl .../afd6a316b.../tools/art/hfnext/run.sh | bash -s afd6a316bb60cdd32123d1cbbaa89371db327167`
   (starts + spec are at that commit). **Countermeasure:** pull each piece's takes as soon as its DONE lines show (pack per piece:
   `cd /w && tar cf boat.tar takes/boat* && python sbx.py parts boat.tar`, then cat each .pN with --max-bytes 100000; rebuild with
   tools/art/hf1113/pull.py), so a lost token loses at most one piece; never `cat` a small file (it lands in context and is NOT saved).
   Then: tools/art/hfnext/sheet.py -> reference/art/hfnext/batch1-takes.jpg to the lead before any cut.
2. **Scope widened (Matt 3:52 PM, via the lead): add the SPECIAL stages** to NEEDS-W2W3.md: World 2's hidden stage, both worlds' puzzle
   rooms, the World 2 and 3 boss fights (designs by grep: reference/design/, origin/t-design-*, origin/boss-design-*), HAVE/REUSE/GAP,
   GAPs folded into the batch list by first stage.
3. After the lead picks: cut (tools/art/hfnext/cut.py), keep cuts in reference/art/hfnext/cut/ (NOT src/assets: artUse.allow.json only
   shrinks, so an unplaced asset fails the gate), catalog rows part NEXT1 (model: tools/art/hfw2b/catalog.py on origin/t-art-w2b;
   status "cut, not placed (ART-NEXT)"), `catalog_master.py --emit`, artcheck + `npx tsx --test src/game/art/*.test.ts`.
## Done-items
1. The needs table: reference/art/NEEDS-W2W3.md (regular stages 2-6..2-9, 3-1..3-9, 3-hidden). DONE (special stages: step 2 above).
2. Batch 1 plan + estimate; the lead's GO 3:36 PM (cap $3; weir from World 2's brown rocks, origin/t-eng-rock w2-rocks.webp). DONE.
3. Batch 1 run: starts + spec + run.sh built and pushed (afd6a316b); the run's takes LOST (above). NOT DONE.
## Lessons applied / learned
D30 (every time from `date`), D53 (roadmapcheck + knowncheck before the docs push), D57 (queue read at every push), D41 (Pokey 89.1).
Learned: an HF sandbox's token lives in the session's connection; a reset strands the files. Pull per piece (above). A tiny `cat` result
lands IN context and is not saved to disk, so it cannot be decoded: always use parts.
## Pushback
None on the packet. The hf_jobs "logs" call I tried at ~3:56 PM needed a human approval nobody could give (the lead interrupted it).

# DRESS-27 REPORT (Engine, art/dress code). Started 2:43 PM ET 11-23. Branch t-eng-27-wip-dress.
## DRESS-27c (Engine, draw/lay code; a fresh member). Started 4:12 PM ET 11-23 by `date`. Branch dress27c (pushed as t-eng-27-wip-dress27c).
### EXACT NEXT STEP (while gates run; replaced at the end)
Code is DONE and committed: f3649a092 + 3aa389ad9 on t-eng-27 9fe64614e (fast-forward possible). Test head (t-build-27e 793ddf246 + dress27c)
= 93ae6d052, frozen at /home/user/wt-d27c-f2. Running in the background: drawcheck + clipcheck on wt-d27c-f2 (scratchpad gates/A/lines.txt),
lockall record on t-build-27e (wt-d27c-base) then --check on 17055a8c1 (= the camera/river commit; 3aa389ad9 changes drawUnderside only,
no lay) (gates/B/lines.txt), the after stills (dev server 4318 on wt-d27c-b = 93ae6d052; before = 4319 on wt-d27c-base). When every line
is exit=0: full unit suite on wt-d27c-f2, then `git push origin dress27c:t-eng-27` (no force) and send the lead the hash and the stills.

## DRESS-27b (Engine, draw code; DRESS-27's successor). Started 3:42 PM ET 11-23. Branch t-eng-27-wip-dress27b.
### Polish check (stills-27b/: 2-7 seed 1 Normal, phone 2x, BEFORE = t-build-27-wip + 80dbc46d8, AFTER = the same + this fix)
- Both breach spots, x9061 and x13298, Pokey on the low ledge and the high one, upright and sideways: sheet-*.jpg (before | after |
  pixels over 40 apart) and zoom-*.jpg (the rivers, before over after). Same look: the deep river, the still pool, its stones, the soil
  under its bed, the wedge under each bank, the roots, the logs' waterline and foam. The only pixels that differ are animation phase
  (the logs drift, the reeds and the hummingbird move: 0.1-1.6% of pixels, all on moving things). Nothing rough found; nothing changed.
### Done-items
1. LANDED: t-eng-27 = **cfa555cc9** (fast-forward, no force; ls-remote equal) = DRESS-27's 1bb560fb8 + t-eng-27 d1fad7e65 (ENG-BOT27b;
   engine-core.md conflict, both sections kept). tsc 0; planted 10/10. lockall 16 layouts, 80dbc46d8 vs 09c23c1b0: 102/102 stages,
   3264/3264 builds unchanged; cfa555cc9's src/ and tools/engine byte-identical to 80dbc46d8 (the new commits: tools/inspect + reports).
2. 2-7's 6 breaches fixed at their cause, the shared river draw (engine.ts drawRivers, riverArt.ts drawRiverWater/drawSafeRiverOver),
   with three general helpers (drawThrift.ts): gradients made once (vGradient), a picture cut by its source rect instead of a clip
   (cropToBox: the soil under a bed via groundPaint.ts drawSoilCut, a log's waterline), and the river's box, ceiling and bank faces in
   one clip where one does (polygonInBox; groundStack.ts aboveLinesPath; a TAIL's clip folded into the box). No limit raised, no piece
   moved, no stage id/seed/x. Planted: drawThrift.test.ts (4): RED on the base (module missing), GREEN now.
3. 2-7 drawcheck, 16 spots (drawcheck27b-2-7-before.txt / -after.txt, worst spot each):
   | | gradients | drawImageScreens | clips | verdict |
   |---|---|---|---|---|
   | port before / after | 4.13 / 0.25 | 7.61 / 6.04 | 21.00 / 10.00 | 3 breaches / PASS |
   | land before / after | 5.00 / 0.00 | 7.90 / 6.56 | 24.13 / 10.00 | 3 breaches / PASS |
   Gates on frozen 152e53549 (= cfa555cc9 + the fix): drawcheck on the listed stages PASS (866 s); clipcheck
   PASS (83 known, 770 s); vite build (BASE_PATH) 0, chunkcheck PASS, artcheck PASS.
   tsc 0; generalitycheck PASS (26 known); knowncheck PASS; draw/river/ground tests (28 files) 192/195: the 3 reds (pacerLay x2 'bot
   (planted)', stumps 'a log on a stump') are the same 3 on cfa555cc9 without the fix: inherited.
### Pushback: none. ### Suggestions: other per-frame gradients and clips could use drawThrift.ts (vGradient, cropToBox): the remaining
   clip sites in the limits.json notes (temple runs) are the next candidates; a packet when the lead wants the clip limit lowered to 6.
### Unresolved: none of the 6. Not run: the full suite (item 3's list does not name it; drawing only, as DRESS-27's landing).
### Lessons applied: D115 (every run on a chattr-frozen worktree), D119 (no heredoc in a commit chain), D36 (branch named, ls-remote),
   law 22 (cause fixed, no limit moved), D51/D81 (2-7 drawchecked as a listed stage would be).
### Turnover note: reference/handoffs/engine-core.md §0zq-thrift (this commit).

## EXACT NEXT STEP (handover at the lead's word, 3:41 PM ET: context past the line; nothing landed on t-eng-27 yet)
- Merged head to land: **80dbc46d8** on t-eng-27-wip-dress (= my work 09865f026 + origin/t-eng-27 09c23c1b0, one note conflict, both
  sections kept; tsc 0; planted tests 10/10). Later commits on the branch are REPORT text only.
- lockall: NOT done on the merged head (both runs, 09c23c1b0 --out and 80dbc46d8 --out, stopped unfinished at handover: no result).
  Do: freeze a worktree at 09c23c1b0, `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-eng27.json`; freeze one at the branch
  head, `npx tsx tools/engine/lockall.ts --layouts 16 --check lock-eng27.json`; expect 102/102 unchanged (my code draws only; READY-27's
  merge was 102/102 unchanged on 49d92b572 against 6b84c98f3).
- Then land (lead's ruling: drawing only; a clean merge + tsc + lockall, no fresh suite): `git fetch origin t-eng-27`; if it moved,
  `git merge --no-edit origin/t-eng-27` + tsc; then `git push origin HEAD:t-eng-27` (a fast-forward, no force); `git ls-remote` equal to
  HEAD; send the lead the hash.
- 2-7's own draw breaches (pristine t-build-27-wip, drawcheck with limits.json scenarios ['2-7'], spots 16; the same with this fix):
  port: gradients 4.13 > 2 at spot 11 x13298 (spot 7 x9061 with the fix, same value); drawImageScreens 7.61 > 7.5 at spot 7 x9061;
  clips 21 > 19 at spot 7 x9061. land: gradients 5.00 > 2 at spot 11 x13298; drawImageScreens 7.90 > 7.5 at spot 11 x13298; clips
  24.13 > 19 at spot 7 x9061 (24.00 with the fix). Files: reference/qa-reports/DRESS-27/drawcheck-2-7-16spots-base.txt and -fix.txt.


## Polish check (stills: reference/qa-reports/DRESS-27/stills/, 2-7 seed 1, phone 2x, BEFORE from t-build-27-wip 51ff9c43f)
- **Seam:** zoom-weir-pool-and-pole-before-after.jpg (Normal x15950, Easy x16700, sideways): the thin dark line with specks is gone across
  the whole falls; the foam runs into the pool with nothing new along the line. Upright and sideways: sheet-*-before-after.jpg.
- **Pole:** same zoom. It now goes down behind the weir's white water and fades out 56 px over the floor; the frog on its
  stone is untouched. Still plainly the World 2 bamboo climb (same art, same reach to grab). Fork taken: rooted behind the weir's foam,
  because it keeps the climb's own art and covers nothing else (the foam-in-front try hid the frog on Easy and made a darker box in the pool).
- **Porches:** zoom-porch-posts-before-after.jpg (Normal x11376, Easy x12002): every plank stands on two bamboo posts into the river;
  the water's own surface covers their feet. Rough spot I fixed on the way: the pole's fade first showed bands against white water (strips
  drawn one by one); it is now baked once under a soft gradient.
- Looked at on 2-1..2-6 (probe, both settings): no porch over water, no dress, so no look change there. Not looked at: 2-7 on other seeds.

## Done-items
1. Seam: cause in the CUT (rows 329-331 of the weir, fully transparent across the falls). weirseam.py repairs it, sheet repacked with
   READY-27's packer (frames/JSON unchanged). seamcheck.py: RED on the old sheet, GREEN now. PASS.
2. Pole: columnDress.ts dressFeet/footCut/cachedBake + protoArt.ts (general: any climb standing in any column dress). PASS.
3. Porches: porchPosts.ts (general: any solid canopy_bridge end over any river), drawn before the water. PASS.
4. Notch: NOT fixed (budget). It is every World 2 step, not 2-7 only: 2-3 x10600 shows the same square end of the pale band
   (stills/item4-notch-zoom-2-7-and-2-3.jpg). Cause area: the painted ground's cap at a leg's end (protoArt ground painter).
- Planted tests: columnDressFoot.test.ts (3), porchPosts.test.ts (2), columnDressLay.test.ts (+dressFeet): RED on the base (exports
  missing), GREEN on the head.
- lockall (base = my merge 6b84c98f3, 16 layouts, 102 stages): 102/102 unchanged on 49d92b572 (later commits draw code only).
- GATES (on the frozen candidate): see "Gates" below.

## Gates (frozen worktrees; logs in the session scratchpad)
- 34568db5c: drawcheck PASS (930 s, the listed stages); clipcheck PASS (83 known, 809 s). Later code commits: the bake's cache
  (canvas-loss re-bake) and posts with no clip (fewer canvas calls, the same look: stills redone).
- 2-7 is not a listed stage on t-eng-27, so I ran drawcheck on t-build-27-wip plus this fix, 2-7 alone at 16 spots (porches and
  weir included). FOUND AND FIXED: one clip a post took 2-7's porches to 28 clips a frame (limit 19); posts now draw with no clip.
  After: 6 breaches, the SAME 6 as pristine 2-7 (drawcheck-2-7-16spots-base.txt vs -fix.txt: gradients 4.13/5.00 at x13298 or x9061,
  drawImageScreens 7.61/7.90, clips 21/24 at x9061). These are BUILD-27's, inherited, none at the porches or weir: for the lead.
- tsc 0; generalitycheck, knowncheck, artcheck PASS; engine tools tests 39/39; seedlist 1-1 PASS (161); roadmapcheck FAIL (13)
  IDENTICAL on the base 6b84c98f3 (commits not in this history: inherited).
- Landing (the lead's ruling: drawing only, so a clean merge plus tsc and lockall on the merged head; no fresh suite): merged
  t-eng-27 09c23c1b0 (one note conflict, both sections kept), tsc 0, planted tests 10/10; lockall merged vs 09c23c1b0: see below.
  The suite shards I had started on 09865f026 were stopped unfinished (no results claimed).

## Pushback
- The column dress (W2_WEIR, columnDress*.ts) was not on t-eng-27, only on t-build-27 via t-ready-27-wip; I merged t-ready-27-wip
  into this branch (READY-27's six commits land on t-eng-27 with mine). W2_WEIR is in w2.ts, not w2Sections.ts.
- Item 1's cause is art (the cut), Content's lane: fixed in the shipped sheet; the cut file on main still has the gap (Suggestion 1).

## Suggestions
1. Content: replace reference/art/hfnext/cut/weir.png on main with the repaired cut (python3 -I reference/qa-reports/DRESS-27/weirseam.py
   in out); then the sheet and the cut agree.
2. Critic: add seamcheck.py's rule (a see-through row across a frame) to tools/perf/artcheck for every sheet; done: it never ships again.
3. Engine packet: item 4 (the step's notch) in the painted ground's cap, every World 2 step; done when 2-3 x10600 and 2-7 x1300 show the
   floor's band ending under the bank's overhang with no square end, lockall unchanged.
4. Also seen (not mine): a thin black sliver on top of the raised bank's grass at 2-3 x10600 and 2-5 x14250 (stills/notch-*.jpg).

## Unresolved
- Item 4 (above). 2-7 checked on seed 1 only.

## Method used / Lessons applied / Method update
- Used: stage-fix, render-fix; stills: DRESS-27/stills-live.mjs (BUILD-27's, its playwright import fixed for a CJS build).
- Lessons: D6 (a baked canvas re-bakes on loss, tested), D16 (every prop stands on something: the porches), judge every state
  (Normal and Easy, upright and sideways), freeze the tree before a heavy run (D115).
- Method update (render-fix): when a painted piece shows a line, decode its frame's alpha first: a see-through row in the cut is
  invisible in code review and costs minutes to find with seamcheck.py.

## Turnover note
reference/handoffs/engine-core.md: section 0zq-dress (this commit).

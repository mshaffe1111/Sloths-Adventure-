# DRESS-27 REPORT (Engine, art/dress code). Started 2:43 PM ET 11-23. Branch t-eng-27-wip-dress.

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
- 34568db5c: drawcheck PASS (930 s, the listed stages); clipcheck PASS (83 known, 809 s). d7546ce89 after it changes only the bake's
  cache (canvas-loss re-bake), the same draw. 2-7 is not a listed stage on t-eng-27: drawcheck on t-build-27-wip + this fix, 2-7 at
  16 spots (porches and weir included): PENDING.
- Head: tsc 0; generalitycheck, knowncheck, artcheck PASS; engine tools tests 39/39; seedlist 1-1 PASS (161); roadmapcheck FAIL (13)
  IDENTICAL on the base 6b84c98f3 (commits not in this history: inherited). Suite (3 shards) and the rest of the CI line: PENDING.

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
- Used: stage-fix (find the cause, fix where it lives), render-fix; stills via BUILD-27's stills-live.mjs (a scratch copy: its
  playwright import fails on a CJS build; fixed with `_pw.chromium ?? _pw.default.chromium`).
- Lessons: D6 (a baked canvas re-bakes on loss, tested), D16 (every prop stands on something: the porches), judge every state
  (Normal and Easy, upright and sideways), freeze the tree before a heavy run (D115).
- Method update (render-fix): when a painted piece shows a line, decode its frame's alpha first: a see-through row in the cut is
  invisible in code review and costs minutes to find with seamcheck.py.

## Turnover note
reference/handoffs/engine-core.md: section 0zq-dress (this commit).

# ART-NEXT-d (11-21, session_01FhBbYKPihmWKe7mdYAmiqq): R-165.354 + R-165.370 DONE on t-art-next (written 12:48 PM ET)
## EXACT NEXT STEP (HANDED OVER at the context line; the lead's polish point, not yet fixed)
The bridges pop in COLOUR. `python3 -I tools/art/hfnext/clipde.py` (mean body Lab dE per frame step, motion-free) measured:
plain->bridge f1 1.07-1.32 dE against 0.2 median inside (yawn, look, wave, scratch; plain->mid-clip ~7 dE: Wan frames are more
orange/saturated, darker outline); and at step 64 (old clip's LAST frame -> reversed bridge) yawn 4.30, look 3.81, wave 3.69 dE,
because each old clip drifts in colour over its 49 frames while the bridge out was built for its frame 0. Fix in bridgebake.py:
1. Per bridge frame, a Lab mean/std (Reinhard) transfer over alpha > 200 px toward lerp(stats(plain), stats(target), u), u = i/(m-1):
   bridge IN targets the clip's frame 0, bridge OUT the clip's LAST own frame (build bridge out as its own colour-matched list, not
   bridge[::-1]). Scratch (--replace): ramp plain -> the take's mid stats -> plain.
2. Restore the four original sheets first (`git show 6c157b2ba:src/assets/hero/clips/<c>.webp`; bridgebake reads the clip FROM the
   sheet) and the old heroClipsData entries, then re-bake: B1-s23 -> idle-yawn,look-around; B3-s11 -> wave (--pin-feet); SC-s19 ->
   belly-scratch (--pin-feet --replace).
3. Bar: every step 0->1, N-2->N-1 and at the joins within 2x the inner median and under dE 1 (lead: never over 3, never above the
   bridge's own steps). Then `idleends.py` (re-pins the JSON), `npx tsx --test src/game/heroClipsEnds.test.ts`, `catalogclips.py
   idle-yawn,look-around,wave,belly-scratch` + `catalog_master.py --emit`, sizes, and re-shoot the 1-1 pair + yawn
   (`node tools/art/hfnext/idleshoot.mjs <out> 1-1 3.7 4.7 40` and `... 1-1 0.3 9.0 60`), then `python3 -I tools/art/hfnext/idlepair.py <after dir> <yawn dir>`
   (rebuilds before-after-idle-start.jpg, yawn-1-1-strip.jpg, yawn-1-1-game-speed.mp4). Gates again, the full unit suite included.
## Picks and bakes (the lead's)
- B1 s23 -> idle-yawn + look-around; B3 s11 -> wave (--pin-feet; feet off the line max 3.1 / 4.8 px before the pin). 81 frames each.
- NEW belly-scratch = SC s19 (plain pinned first and last; bridgebake --replace; feet within 0.5 px; bag + strap every frame). 41 frames.
- B4: no take passed (s5 back blob f11-16 + grey smear f17; s37 bag missing f8-12; s47 feet ghost f6-9; s61 double outlines f9-16).
  Doze LEFT IDLE_CLIPS (lead's ruling); nothing else draws it, so doze.webp, its heroClipsData entry and 49 catalog rows are deleted.
- Hurt is not bridged: the hit reaction starts from any pose (lead); it stays as the dissolve leaves it.
## Spend
One sandbox, 6b01d35defaf5e14f4b5e16d, ~15.4 min by `date`, **~$0.70** of the $2 cap; 8 gens all pulled + committed one by one
(D98); terminated after the last. Balance ~$41.25. HF-SPEND row in.
## End-frame test (src/game/heroClipsEnds.test.ts, live; sha256-pinned JSON from tools/art/hfnext/idleends.py)
Before: ends 12-76 px off the plain pose, xor 28-62%. After: all 4 idle clips first AND last frame 0 px, xor 0%. Planted: a stale sheet
fails test 1; a 5 px end fails test 2.
## Stills and clip (reference/art/hfnext/bridge/)
- before-after-idle-start.jpg (1-1 at 2x): before t4.33 doubled outline; after, the plain pose holds through the melt, then the turn.
- yawn-1-1-game-speed.mp4 + yawn-1-1-strip.jpg: 0.4-8.9 s after the pin: plain, bridge turn, yawn, back, one outline, bag on.
- 2-5: NOT obtained. Two shoots: a "Normal" card covers him at the pin to ~4.5 s, then he takes a hit. Named, not hidden.
- Take sheets: B4-s{5,37,47,61}-sheet.jpg, SC-s{7,19,31,43}-sheet.jpg (every frame, light + dark, beside PLAIN).
## Sizes (all under 4096 px and 4 MiB)
yawn 813 KB 1712x2310, look 783 KB 1184x2266, wave 831 KB 1440x2277, scratch 342 KB 1056x1230. Idle total 2,768 KB (before 2,050
incl. doze 242). Decoded 42.8 MB (before 33.7); loaded at stage start (heroClips.ts startClips, plainSheets.ts), not per frame.
## Catalog
CATALOG-MASTER.csv frame rows = the sheets (tools/art/hfnext/catalogclips.py: 9,493 -> 9,532 rows; only clip rows touched);
cast.json re-emitted (catalog_master.py --emit; no other world file changed).
## Gates
tsc 0; artcheck 0; art tests + heroClipsEnds 0; unit suite (3 shards): running at hand-over, 0 failures so far (2,043 ok; logs in my scratchpad, lost with me): RE-RUN in the next step
## Pushback
Packet step 4 asked for 2-5 stills: the shoot tool's pin cannot give a clean stop there today (above). bridgebake had two bugs
(fixed, step 1): entry match failed on the cutter's "202.0"; the sheet was written before the entry check.
## Suggestions (outside my walls)
- Engine: the translucent Pokey in the 2-5 shots (before t4.57, after t5.03) looks like R-165.353's dissolve or a hit blink: check.
- Clip sheets carry ~32 near-duplicate bridge frames each; a frame-index list (play bridge frames reversed from the same cells) would
  cut ~40% of idle bytes. Engine + data-format packet.
## Lessons applied
D30 (times from date; a typed log time fixed), D57/D87/D105 (queue at every step and push), D97 (no approval waits), D98 (pull per
take), D102 (sheets downscaled, numbers first), D109 (no clock times in messages). LESSONS.md read only as the packet listed (lean).
## Turnover: reference/handoffs/art-director.md §0j rewritten (this commit).

# ART-NEXT-c (11-21, session_01FhBbYMHgd7Bqz5k9Pq8XfC): reeds redo + NEXT2 catalogue DONE; R-165.354 bridges generated, WAIT ON THE LEAD'S PICK
## EXACT NEXT STEP (for ART-NEXT-d; written 12:12 PM ET at the lead's D76 hand-over)
HF: reeds ~$0.33 + bridges ~$0.44 = ~$0.77 (balance ~$41.95), both sandboxes TERMINATED, HF-SPEND rows in. Nothing is running.
1. LEAD PICKS one take per bridge from reference/art/hfnext/bridge/<B>-s<seed>-sheet.jpg (every frame at 2x, PLAIN first, CLIP f0 last;
   light row and dark row). Frames: reference/art/hfnext/bridge/takes/<B>-s<seed>/ (Wan 480x576 WebP). My read:
   - B1 (plain->front; serves idle-yawn AND look-around): **s23** (smooth turn, bag/strap/wraps on model every frame; feet off the
     end-to-end line max 3.1 px raw). s11 good too (a blink smear frames 7-9; 2.4 px).
   - B2 (plain->belly-scratch): BOTH lose the bag + strap: the belly-scratch CLIP ITSELF has no bag or strap (its frame 0), so any bridge
     must. s23 drops it at frame 2 (clean otherwise), s11 at 12-15 with arm smears. NEEDS A LEAD RULING: bake s23 and log the clip's
     missing bag as a defect, or take belly-scratch out of IDLE_CLIPS (heroClips.ts, not art's file), or a repaint (not costed).
   - B3 (plain->wave start): s11 holds his model (turn, then the paw rises); s23 not yet judged by me (sheet pushed).
   - B4 (plain->sit, doze): s11's hunch frames 6-9 go blobby (bag/wraps smear); s23 not yet judged by me. Feet move by design here.
2. BAKE each pick: `python3 -I tools/art/hfnext/bridgebake.py reference/art/hfnext/bridge/takes/<take> <clip>[,<clip>] --pin-feet`
   (B4 WITHOUT --pin-feet). B1 bakes into idle-yawn,look-around. It rewrites src/assets/hero/clips/<clip>.webp and the clip's entry in
   src/game/heroClipsData.ts (frame 0 = the exact plain frame, last = exact plain frame; bridge in, clip, bridge reversed out).
   Check every sheet <= 4096 px and 4 MiB; idle sheets total BEFORE = 2,050 KB (yawn 476, look 450, belly 384, wave 499, doze 242): report the new total.
3. END-FRAME TEST: move reference/art/hfnext/bridge/pending/heroClipsEnds.test.ts.txt to src/game/heroClipsEnds.test.ts, run
   `python3 -I tools/art/hfnext/idleends.py` (writes src/game/heroClipsEnds.json, sha256-pinned to each sheet; CI has no image decoder),
   then `npx tsx --test src/game/heroClipsEnds.test.ts`. BEFORE numbers (pending/heroClipsEnds.before.json): every end frame 12-76 px
   off the plain pose, xor 28-62%. Bar: <= 2 px, xor < 2%. (Parked out of src/ so the branch never carries a red test.)
4. STILLS: `node tools/art/hfnext/idleshoot.mjs <out> 1-1,2-5 3.7 4.7 40` (needs `npm install --legacy-peer-deps` in the worktree;
   the main checkout has NO node_modules; restore package-lock.json after). Before: reference/art/hfnext/bridge/before-idle-start.jpg
   (1-1 t4.33 shows the doubled outline) and before-idle-start-2-5.jpg (that window may have missed the melt; widen to 3.9-5.2).
   Screenshots run ~4 a game second: for the full-yawn clip at game speed, shoot ~0-9 s after the pin (bridge in, yawn, bridge out).
5. Hurt is NOT bridged (lead 12:00 PM: it is the hit reaction, starts from any pose); it stays as the dissolve leaves it. Name it in the report.
6. Then: tsc, the full unit tests, artcheck, the art tests; rewrite reference/handoffs/art-director.md (NOT done by ART-NEXT-c).
## Done-items
1. REEDS REDO: DONE. 4/4 takes (spec-b2r, ~$0.33), sheet reference/art/hfnext/batch2r-takes.jpg; s37 frame-edge reject. Lead picked s41;
   cut + cleaned by tools/art/hfnext/reedsfix.py (300 px trapped grey keyed between stems; the pale silt haze at each foot pulled to wet
   brown: no light ring on dark, checked at 2x beside Pokey).
2. NEXT2: DONE. 14 rows w3-next#* (lipA s11/s23/s37, lipB s23/s37, mat s23, rimLong s11, rimS s11/s23, rimShort s11, shelfS s37,
   sleepy s23/s37, reedsR-s41), tools/art/hfnext/catalog2.py + contact2.py, walk lines measured (shelfS: mid top face y 48),
   catalog_master --emit, inventory.test 203 -> 217, art tests 16/16, artcheck PASS. Sheet reference/art/hfnext/batch2-cuts.jpg.
   cut.py gained `glow`: the lit rims, the mat and the sleepy caps cut as opaque grey-mint halos with ragged edges; now see-through light.
3. R-165.354: PLAN sent + GO (no hurt, cap $2). 8 bridge takes back (~$0.44); NOT baked (waits on picks); test parked; stills before only.
## Lessons applied
D57/D87 (ReadNotifications at every step and push; long shoots in the background), D97 (no blocking HF call), D98 (every take pulled +
committed as it landed: 12 pulls), D102 (lean reads), D105, frame-edge reject before picking, show-first (starts.jpg before spend).
New: a bare `pip -U diffusers` in the aitoolkit image pulls huggingface-hub 2.x and breaks transformers (cost ~1 min; runbridge.sh pins it).

# ART-NEXT-b (11-20, session_01FhBbYMKsqUrH74YuYsLf9J): batch 1 cut + catalogued, special stages in NEEDS, batch 2 RUNNING
## EXACT NEXT STEP (kept current; ART-NEXT-b stopped 6:17 PM ET at the lead's line, run finished)
Batch 2 is DONE and paid (~$1.40 of $2.50; both sandboxes TERMINATED; HF-SPEND row 5:45-6:15 PM; balance ~$42.72). All 26 takes are in
reference/art/hfnext/takes2/<group>/ (reeds2, shelfS, mat, sleepy, rimShort, rimLong, lipA, lip (=lipB), rimS); sheet
reference/art/hfnext/batch2-takes.jpg (FRAME EDGE flags). For a fresh member, after the lead's picks:
1. The 4 reeds2 takes are cut off on the RIGHT (my start ran the tall clump past the frame): unusable. Start fixed (starts2.py, with a
   frame check that refuses a start touching its frame); `spec-b2r.json` = the 4 reeds again (name reedsR). Run it ONLY on the lead's go:
   one sandbox **created with --forward-hf-token** (`create --image ostris/aitoolkit:latest --flavor rtx-pro-6000 --timeout 20m
   --forward-hf-token`), `bash run.sh <commit> spec-b2r`, ~9 min, ~$0.41 (inside the $2.50 cap: $1.81 in all).
2. My read of the sheet (the lead picks): lipA all 3 usable; lipB s23/s37 (s11 has a white fleck at its broken end); sleepy s23/s37
   (s11 a pale halo disc behind its caps); rimShort s11; rimLong s11 (s23 lights the whole top); rimS s11/s23 (s37 glows too hard);
   shelfS s37 is the only take that kept the start's thickness (s11/s23 thinned to ~0.17 Pokey: below the 0.3-0.5 range); the mat is a
   purple ringed cushion (lead's call on the look).
3. Cut the picks: `python3 -I tools/art/hfnext/cut.py <png> <out> <K>` into reference/art/hfnext/cut/ (convert WebP to PNG first; edges
   3x light + dark), measure each walk line (top face) for platform rows, catalogue part NEXT2 by copying tools/art/hfnext/catalog.py's
   pattern (ids w3-next#*, used_in 'none (not placed)', standable slots 'new slot: World 3 ...'), `catalog_master.py --emit`, bump
   inventory.test.ts's branch-only count (203 + rows), artcheck + `npx tsx --test src/game/art/*.test.ts`, contact sheet beside Pokey.
## Done-items
1. CUT + CATALOG batch 1: DONE (fca07e2f1, weir redo 805083b8d, lead ACCEPTED all 9 at 5:38 PM). reference/art/hfnext/cut/: barge
   (take s41: the picked s23 is cut off by its frame at both ends, lead agreed), weir, door-open, letter/letterB, reply/replyB, boat/
   boatB; rows w2-next#* part NEXT1 (used_in 'none (not placed)', slots 'new slot: World 2 ...'); `catalog_master.py --emit`;
   artcheck PASS; src/game/art tests 16/16 (the branch-only count 194 -> 203). Sheet hfnext/batch1-cuts.jpg; weir-river-mock.jpg.
2. SPECIAL STAGES in NEEDS-W2W3.md: DONE (97dab025a). The Rapids: NO design; no new W2/W3 puzzle room designed; bosses in game, the
   bigger-guardian repaint a GAP only if PREDATORS.md's proposal is adopted. None enters batches 2-7.
3. BATCH 2 PLAN: DONE (709b6573a); starts shown first (01d247a2e); lead GO 5:44 PM, cap $2.50. RUN DONE: 26/26 takes pulled per
   piece (9 pulls, none lost), ~$1.40, sheet batch2-takes.jpg (8b77d8cdf). Reeds cut off by the frame: redo spec ready (above).
## Polish check
batch1-cuts.jpg (game size beside Pokey, light/dark/green): barge s41 clean; boatB had 2 holes in its grey hull (trapped-grey key):
fixed (cut.py keep=); weir: pool ran off 3 edges + right rock sliced by the frame: weirfoot.py drops/fades the pool, rounds the right
rock with an anti-aliased outline; first left-end pass was blocky (mauve rock shadow read as water): root-caused, redone, accepted.
## Pushback
barge-s23 (the lead's pick) is cut off by the take's frame at both ends: cut s41 instead (lead agreed 5:21 PM).
## Lessons applied / learned
D30, D41 (Pokey 89.1 from the code), D53, D57 (queue at every push), D90, D97, D98 (per-piece pulls). Learned: (1) the takes sheet's
game-size previews hid frame cuts: sheet.py now flags paint on any frame edge (red border) before a pick. (2) A colour test for "rock"
must be checked on the rock's shadow side: warm-only called mauve shadows water. (3) inventory.test.ts pins the branch-only count and
used_in 'none (not placed)'; a new standable slot must be 'new slot: World N ...' or it opens a gap in every world.
## Method update (proposed for hf-art.md §10 and level.md)
Before a pick, every take's frame edges are measured (sheet.py FRAME EDGE): a piece cut off by its frame is rejected, never picked.
Before a run, every START is checked inside its frame (starts2.py asserts it): the batch 2 reeds were cut off because the start was.
## Suggestions
(1) Pack the 9 cuts into a World 2 atlas when 2-7 / 2-9 are built (the builder's packet). (2) The weir: one catch ledge per tier.
## Unresolved
Batch 2: the reeds redo (needs the lead's go), the picks, cut and catalogue (EXACT NEXT STEP). First sandbox lost ~1 min (no
--forward-hf-token): the turnover note now says it.

---
# (predecessor) ART-NEXT
# ART-NEXT REPORT (R-165.342): World 2/3 art needs vs the inventory, then batches
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

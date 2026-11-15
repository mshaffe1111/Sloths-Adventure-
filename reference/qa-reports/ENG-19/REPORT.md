# ENG-19a REPORT (t-eng-19; stopped at the 40% context line, 8:29 PM ET 11-14)
Base: origin/t-eng-b6@a4e1ff8f + origin/t-tools-2@19b45a06 (merge 9d78eef1). Code head 44c47686; branch head: this commit.

## EXACT NEXT STEP (19b first, then the 1-9 builder)
1. **The roost art (NEW 3, not done).** One sandbox (hf-art.md; tools/art/hf19/q19.sh pattern, `--timeout 40m`), run spec-roost2.json only
   (whole piece in frame; ~52 s a take); judge a 190 px sheet (cat the base64; the result is saved whole in /tmp/output-trim, decode it);
   cut the pick with hf1113/cutprops.py (picks {"w1-roost": {"take": ..., "dest": "w1-19", "units": 145}}: 1.6 of Pokey's 89.1), pull it
   (hf678/pull.py), then `python3 -I tools/art/hf19/rows.py <take>` and `python3 tools/art/catalog_master.py --emit` (rows.py is UNRUN).
   Budget left in the $2 cap: ~$1.54. (Batch 2 was NOT live at the lead's 8:33 PM message: the sandbox was terminated at 8:29 PM, nothing kept.) Then the draw: proto.gen2.roosts {x, y, look} (w1.ts W1_LURE's note) is laid; nothing draws it yet.
2. **The whole suite** on the head: at the stop it was running on b47b077d (same code as 44c47686), 1,139 tests, 0 failures, unfinished.
3. **The lead's ruling on the old brain** (Pushback 1) before any 1-9 lay.

## Done-items
- **NEW 1** BOA.tell 0.8 -> 1.0 s (world1.ts:57). boaFreeze.test.ts flies the real engine (RealPlay) + the real kit: Normal still up to 13 frames
  late (0.43 s), 14 is HIT; Easy 26 (0.87 s); planted: red on 0.8 at k=8 (HIT). predatorWorld1.test's 3 s horizon widened to 4 s (Easy's 1.3 s rear).
  **Moved: nothing.** lockall 16 layouts x both settings: 102/102 unchanged on 8f631975 and on 44c47686. boa-reach.txt (tools/engine/runs/boaReach.ts,
  the real engine, every stage, both settings, layouts 1-4): 18 stages hold boas (1-9, 5-6, 7-3, 7-6, 7-9, 8-6, 8-9, Worlds 9-10), **0 run on the kit**,
  so no shipped boa reads BOA.tell; their bots were not re-run (the code path is never entered: 0 kit members).
- **NEW 2** W1_BOAS (w1Cast.ts): boa (3, cast+topup), boa-trapped (2), boa-roost (2), body 58x26 feet 16 (stageGenerator boa()). Root fix, any world:
  pipeline.ts castRows: a stage whose brief casts lays only the kinds it casts (the bag's shuffle runs over every row, so one more row re-dealt
  1-3/1-4/1-5). armedTraps(['snake','boa']). library13 CAST_13 = 1-3's cast kinds, checked against castRows on the real manifest.
- **NEW 3 (code)** W1_LURE 'w1-roost' {fear eagle, reach 150 = BOA.engage} in w1World's props/emit. lureFaults: an animal that never leaves its post
  is drawn only where it lies and its rear is the read (planted red: "starts inside its reach" refused every roost by a boa). CastPlay toy: it flees
  the frame after its rear, never strikes; no roost, it strikes. Letter `l` (key now; FILL_LETTER l: 'lure'); NODE-KEY.html regenerated (row "now").
- **NEW 4** CastStep.froze (beaten by stillness inside core.ts reachBox), CastPlay.eyeOut (hunt/tell/act/recover), engine 0.6 s slow motion
  (FREEZE_SLOW, zoom 1), never with a sweeper's eye out, cut the step one comes out. castFreeze.test.ts: each guard planted red.
- Checks: tsc 0; generality PASS; knowncheck PASS; roadmapcheck FAIL only "shallow clone, proofs cannot be checked"; build/perf gates NOT run.

## Polish check (clips: tools/engine/runs/boaClip.mjs, the real page, the pad's own calls; frames named in clips/*-frames.txt)
- freeze up (clips/freeze-up-crop.jpg): f0030 rears with "!", f0042 he is frozen at its head, f0044 it settles (beaten step 85, slow 0.57). Sideways
  (freeze-roost-side.jpg): f0027 rear, f0044 settled; head well under the HUD. First sideways take had 1-3's goal card over it: fixed in the tool, reshot.
- late (late-roost.jpg): lifted 16 frames late, struck f0043 (hp 4/5). ROUGH: he overlaps the coiled boa first (the kit boa has no body block).
- roost up/side: f0027 rear, f0028 it uncoils and slides off (beaten:lure step 55), no strike. ROUGH: no roost is drawn (art next step 1).
- ROUGH: the red danger glow stays under a boa beaten by stillness (flee 4 s at its post).

## Pushback
1. "Every boa in every world" does not happen through BOA.tell: all 18 shipped boa stages run the OLD brain (predatorAI.ts:300: rear 0.6 s, no
   stillness rule). Options: (a) leave them until each world moves its boas onto the kit (new replaces old; D40), my pick; (b) set predatorAI's 0.6
   to 1.0 now (moves 18 stages' play: their bots re-run). Lead's call.
2. The design's "and the stage's first freeze, wherever he stands" (1-9.md NEW 4) is not in the packet; built as the packet says (inside reach only).

## ENGINE-WORTHY
- topUpFoes still takes every 'topup' row of a no-cast stage's manifest (pipeline.ts castRows covers cast stages only).
- RULED (the lead, 8:33 PM ET 11-14: option (a), D40): the 18 old-brain boa stages stay as they are (predatorAI.ts:300, 0.6 s rear, no freeze)
  until each world moves its boas onto the kit: 1-9, 5-6, 7-3, 7-6, 7-9, 8-6, 8-9, 9-1, 9-3, 9-4, 9-5, 9-6, 9-8, 9-9, 10-3, 10-6, 10-7, 10-9 (boa-reach.txt).

## Learned (for the next builder)
- A shared world manifest is shared RNG: a new row re-deals every stage that draws from it. Scope rows by the brief (castRows), prove by lockall.
- A posted animal breaks rules written for walkers (lureFaults). Fly the piece on a CastPlay toy before trusting a fairness check.
- HF: large `hf_sandbox_fs cat` results are trimmed in context and saved whole; decode from /tmp/output-trim. Ask for the whole piece in frame.
- Proposed rule (level.md): "a new creature row joins its world's manifest only with castRows-style scoping and a lockall PASS."

## Method update / Lessons applied
- Method: engine-fix via planted test first (all 4); each guard planted separately. Add boaClip.mjs's card poke (GoalCard is real time) to the clip method.
- Lessons: D19 (tests run the real engine/kit), D37 (one pasted run per claim: boa-reach), D41 (89.1), D43 (no stage id in engine code),
  D55 (context %), D57 (queue read at push), D69 (frames named), D40 (old brain not patched).
- Turnover: reference/handoffs/engine-core.md §0zc (this commit).

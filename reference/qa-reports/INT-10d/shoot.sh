#!/bin/bash
# INT-10d: stills + clips on the final head, from the repo root, with a dev server on $PORT (npx vite --port $PORT --strictPort).
# (INT-10d adds x 8730: FIX-21's bounce bank on 1-6 seed 1, held to the bounce alone)
# 1-6 layout 1: the creaky landing's joined floor (x 28296) and the gorge's (x 45650), in the pit (low) and on the limb (high), Normal
# and Easy, fresh and old saves, upright + sideways (INT-10's stills.mjs); walkthrough clips x 25000-31000 (23 s), Normal and Easy, up +
# side (INT-10's panclip.mjs); 1-7's eagle (tools/inspect/eagleClip.mjs): a glance with him frozen (#1), a fake-out (#5, flying), a
# caught walk in the open (#1 walk), Easy's longer tell (#1 glance easy), up + side.
set -u
PORT=${PORT:-5291}; O=reference/qa-reports/INT-10d/shots
mkdir -p $O
for d in normal easy; do for s in fresh old; do
  DIFF=$d SAVE=$s node reference/qa-reports/INT-10/stills.mjs $PORT $O s16 1-6 1 8730:low 8730:high 28296:low 28296:high 45650:low 2>&1 | tail -2
done; done
for d in normal easy; do for o in up side; do
  DIFF=$d node reference/qa-reports/INT-10/panclip.mjs $PORT $O 1-6 1 25000 31000 $o 260 2>&1 | tail -1
done; done
for o in up side; do
  node tools/inspect/eagleClip.mjs $PORT $O/17-glance-n-$o 1-7 1 glance normal $o 1 2>&1 | tail -2
  node tools/inspect/eagleClip.mjs $PORT $O/17-fakeout-n-$o 1-7 5 glance normal $o 1 2>&1 | tail -2
  node tools/inspect/eagleClip.mjs $PORT $O/17-walk-n-$o 1-7 1 walk normal $o 1 2>&1 | tail -2
  node tools/inspect/eagleClip.mjs $PORT $O/17-glance-e-$o 1-7 1 glance easy $o 1 2>&1 | tail -2
done

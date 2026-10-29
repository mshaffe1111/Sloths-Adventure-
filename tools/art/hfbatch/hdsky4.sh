#!/bin/sh
# X-16 round 4 (tallstart.py): one low-strength img2img pass over each tall start, full-height tiles (striphdgpu.py, pre none).
set -e
mkdir -p /out/hfbatch/hdset/jobs
curl -sfL "$G/specs/spec-hdsky4.json" -o /out/hfbatch/hdset/jobs/spec-hdsky4.json
curl -sfL "$G/striphdgpu.py" -o /tmp/striphdgpu.py
SUB=hfbatch/hdset/r4 SPEC=hfbatch/hdset/jobs/spec-hdsky4.json TAG=hdsky4 python /tmp/striphdgpu.py

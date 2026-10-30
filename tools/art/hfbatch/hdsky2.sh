#!/bin/sh
# X-16 skies rounds 2-3 (make_hdset_spec.py <commit> redo): from the native far strips the first job left in the bucket.
set -e
mkdir -p /out/hfbatch/hdset/jobs
curl -sfL "$G/specs/spec-hdsky2.json" -o /out/hfbatch/hdset/jobs/spec-hdsky2.json
curl -sfL "$G/skygpu.py" -o /tmp/skygpu.py
SUB=hfbatch/hdset/r3 SPEC=hfbatch/hdset/jobs/spec-hdsky2.json TAG=hdsky3 python /tmp/skygpu.py

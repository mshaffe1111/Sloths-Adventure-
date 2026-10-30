#!/bin/sh
# X-16 round 5 (skyt2i.py): a sky painted from text above each of the 11 held-back far strips, the join inpainted.
set -e
mkdir -p /out/hfbatch/hdset/jobs
curl -sfL "$G/specs/spec-hdsky5.json" -o /out/hfbatch/hdset/jobs/spec-hdsky5.json
curl -sfL "$G/skyt2i.py" -o /tmp/skyt2i.py
SUB=hfbatch/hdset/r5 SPEC=hfbatch/hdset/jobs/spec-hdsky5.json TAG=hdsky5 python /tmp/skyt2i.py

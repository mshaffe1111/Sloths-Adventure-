#!/bin/sh
# X-16 round 5 pilot (skyt2i.py): a sky painted from text above each of the 11 held-back far strips, the join inpainted.
set -e
mkdir -p /out/hfbatch/hdset/jobs
curl -sfL "$G/specs/spec-hdsky5p.json" -o /out/hfbatch/hdset/jobs/spec-hdsky5p.json
curl -sfL "$G/skyt2i.py" -o /tmp/skyt2i.py
SUB=hfbatch/hdset/r5p SPEC=hfbatch/hdset/jobs/spec-hdsky5p.json TAG=hdsky5p python /tmp/skyt2i.py

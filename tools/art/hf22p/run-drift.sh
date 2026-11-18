#!/bin/bash
# ART-22P (b): World 2's drifting petals, ONE sandbox. In the HF sandbox: bash run-drift.sh <commit>. Log /w/q.log; done /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/img2imggpu.py -o /w/img2imggpu.py
curl -fsSL $GH/hf22p/spec-drift.json | sed "s/COMMIT/$C/" > /w/spec-drift.json
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hf22p/drift.py -o /w/drift.py
OUT=/w SUB=d SPEC=spec-drift.json TAG=d python /w/img2imggpu.py
python /w/sbx.py sheet /w/sheet-d.jpg 640 2 /w/d/props/drift-*.png
touch /w/DONE

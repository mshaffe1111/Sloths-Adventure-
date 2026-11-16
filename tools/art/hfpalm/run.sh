#!/bin/bash
# ART-18: 1-8's painted palms, ONE job (cap $4). In the HF sandbox: bash run.sh <commit>. Log /w/q.log; done marker /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/stillsgpu.py -o /w/stillsgpu.py
curl -fsSL $GH/hfpalm/spec-palm.json -o /w/spec-palm.json
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
OUT=/w SUB=palm SPEC=spec-palm.json TAG=p python /w/stillsgpu.py
touch /w/DONE

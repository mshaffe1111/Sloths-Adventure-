#!/bin/bash
# ENG-LOOK2: the bough underside, ONE job (cap $3). In the HF sandbox: bash run.sh <commit>. Log /w/q.log; done marker /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/stillsgpu.py -o /w/stillsgpu.py
curl -fsSL $GH/hfbough/spec-bough.json -o /w/spec-bough.json
OUT=/w SUB=bough SPEC=spec-bough.json TAG=b python /w/stillsgpu.py
touch /w/DONE

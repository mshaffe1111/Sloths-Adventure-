#!/bin/bash
# ART-18: the same sandbox's second spec (World 1's hanging front leaves, painted; the audit's one code-drawn object). bash run2.sh <commit>
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
curl -fsSL $GH/hfpalm/spec-leaf.json -o /w/spec-leaf.json
OUT=/w SUB=leaf SPEC=spec-leaf.json TAG=l python /w/stillsgpu.py
touch /w/DONE2

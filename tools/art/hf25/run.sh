#!/bin/bash
# ENG-25: the snap stone sheet, ONE sandbox (cap $3). In the HF sandbox: bash run.sh <commit>. Log /w/q.log; done /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/img2imggpu.py -o /w/img2imggpu.py
curl -fsSL $GH/hf25/spec.json | sed "s/COMMIT/$C/" > /w/spec.json
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
OUT=/w SUB=i SPEC=spec.json TAG=i python /w/img2imggpu.py
touch /w/DONE

#!/bin/bash
# ART-W2: World 2's river/lily/log/bounce pieces, ONE sandbox (cap $5). In the HF sandbox: bash run.sh <commit>. Log /w/q.log; done /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/stillsgpu.py -o /w/stillsgpu.py
curl -fsSL $GH/w6to10/img2imggpu.py -o /w/img2imggpu.py
curl -fsSL $GH/hfw2/spec-w2.json -o /w/spec-w2.json
curl -fsSL $GH/hfw2/spec-w2i.json | sed "s/COMMIT/$C/" > /w/spec-w2i.json
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
OUT=/w SUB=i SPEC=spec-w2i.json TAG=i python /w/img2imggpu.py
OUT=/w SUB=s SPEC=spec-w2.json TAG=s python /w/stillsgpu.py
touch /w/DONE

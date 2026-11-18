#!/bin/bash
# ART-22P: 2-2's pickup petal (lavender water hyacinth / white lily), ONE sandbox (cap $4). In the HF sandbox: bash run.sh <commit>.
# Log /w/q.log; done /w/DONE. img2img from the shipped petal recoloured (starts.py) + text to image; sheet + crops by crop.py.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/stillsgpu.py -o /w/stillsgpu.py
curl -fsSL $GH/w6to10/img2imggpu.py -o /w/img2imggpu.py
curl -fsSL $GH/hf22p/spec-22p.json -o /w/spec-22p.json
curl -fsSL $GH/hf22p/spec-22pi.json | sed "s/COMMIT/$C/" > /w/spec-22pi.json
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hf22p/crop.py -o /w/crop.py
OUT=/w SUB=i SPEC=spec-22pi.json TAG=i python /w/img2imggpu.py
OUT=/w SUB=s SPEC=spec-22p.json TAG=s python /w/stillsgpu.py
python /w/sbx.py sheet /w/sheet.jpg 256 7 /w/i/props/*.png /w/s/stills/t-*.png
touch /w/DONE

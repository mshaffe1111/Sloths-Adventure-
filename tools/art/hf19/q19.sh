#!/bin/bash
# ENG-19a NEW 3: the roost's ONE Hugging Face job (the lead's packet: cap $2), run in the HF sandbox (hf-art.md; ART-678's q678.sh
# pattern). Usage: bash q19.sh <commit>. Log /w/q.log; done marker /w/DONE. Takes: /w/t2i/stills/roost-*.png; contact sheet /w/sheet.jpg.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/r/tools/art/hf1113 /w/r/tools/art/w1to4
curl -fsSL $GH/w6to10/stillsgpu.py -o /w/stillsgpu.py
curl -fsSL $GH/hf19/spec-roost.json -o /w/spec-roost.json
curl -fsSL $GH/hfprops/cut.py -o /w/r/tools/art/hf1113/hfcut.py
curl -fsSL $GH/w1to4/cut.py -o /w/r/tools/art/w1to4/cut.py
for f in cutprops.py sbx.py; do curl -fsSL $GH/hf1113/$f -o /w/r/tools/art/hf1113/$f; done
OUT=/w SUB=t2i SPEC=spec-roost.json TAG=r python /w/stillsgpu.py && touch /w/STILLS_DONE
python /w/r/tools/art/hf1113/sbx.py sheet /w/sheet.jpg 300 3 /w/t2i/stills/roost-*.png
touch /w/DONE

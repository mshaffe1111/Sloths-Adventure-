#!/bin/bash
# ART-678: the ONE queued script in the HF sandbox (hf-art.md §10). Usage: bash q678.sh <commit>. Log: /w/q.log; done marker /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/r/tools/art/hf1113 /w/r/tools/art/w1to4 /w/r/tools/art/hf678 /w/hfpokey/jobs
curl -fsSL $GH/hfpokey/pokeygpu.py -o /w/pokeygpu.py
curl -fsSL $GH/w6to10/stillsgpu.py -o /w/stillsgpu.py
curl -fsSL $GH/hf678/spec-edit.json -o /w/hfpokey/jobs/spec-edit.json
curl -fsSL $GH/hf678/spec-t2i.json -o /w/spec-t2i.json
curl -fsSL $GH/hfprops/cut.py -o /w/r/tools/art/hf1113/hfcut.py
curl -fsSL $GH/w1to4/cut.py -o /w/r/tools/art/w1to4/cut.py
for f in cutprops.py sbx.py; do curl -fsSL $GH/hf1113/$f -o /w/r/tools/art/hf1113/$f; done
python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers
OUT=/w SPEC=hfpokey/jobs/spec-edit.json python /w/pokeygpu.py && touch /w/EDITS_DONE
OUT=/w SUB=t2i SPEC=spec-t2i.json TAG=s python /w/stillsgpu.py && touch /w/STILLS_DONE
touch /w/DONE

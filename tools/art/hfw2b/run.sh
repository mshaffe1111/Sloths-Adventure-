#!/bin/bash
# ART-W2B: 2-6's noria, bucket and millrace lip, ONE sandbox (cap $4). In the HF sandbox: bash run.sh <commit> <round>.
# Log /w/q<round>.log; done /w/DONE<round>. Qwen-Image-Edit-2511 edits by hfpokey/pokeygpu.py; outputs /w/hfpokey/edits/.
set -x
C=$1; R=$2; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/hfpokey/jobs
curl -fsSL $GH/hfpokey/pokeygpu.py -o /w/pokeygpu.py
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hfw2b/spec-r$R.json | sed "s/COMMIT/$C/" > /w/hfpokey/jobs/spec-r$R.json
python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers
OUT=/w SPEC=hfpokey/jobs/spec-r$R.json python /w/pokeygpu.py
touch /w/DONE$R

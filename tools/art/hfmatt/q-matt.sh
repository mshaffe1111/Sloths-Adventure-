#!/bin/bash
# ART-MATT: the ONE queued script in the HF sandbox (hf-art.md; ART HANDOVER "Route"). Usage: bash q-matt.sh <commit>. Log /w/q.log; done /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/img2imggpu.py -o /w/img2imggpu.py
curl -fsSL $GH/hfmatt/spec-pods.json -o /w/spec-pods.json
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
python -c "from diffusers import QwenImageImg2ImgPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers
OUT=/w SUB=pods SPEC=spec-pods.json TAG=pods python /w/img2imggpu.py
touch /w/DONE

#!/bin/bash
# ART-NEXT-c (R-165.354): in the HF sandbox (created with --forward-hf-token): bash runbridge.sh <commit>. Log /w/b.log; done /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/br
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hfnext/bridgegpu.py -o /w/bridgegpu.py
curl -fsSL $GH/hfnext/spec-bridge.json -o /w/bridge-spec.json
pip install -q --break-system-packages -U diffusers ftfy
C=$C python /w/bridgegpu.py

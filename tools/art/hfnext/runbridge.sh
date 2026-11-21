#!/bin/bash
# ART-NEXT-c (R-165.354): in the HF sandbox (created with --forward-hf-token): bash runbridge.sh <commit>. Log /w/b.log; done /w/DONE.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/br
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hfnext/bridgegpu.py -o /w/bridgegpu.py
curl -fsSL $GH/hfnext/spec-bridge.json -o /w/bridge-spec.json
# (11-21: a bare `-U diffusers` pulled huggingface-hub 2.4 and broke transformers' import; the image's diffusers 0.43 has the Wan
# last_image path already, so only ftfy, and the hub held under 2)
pip install -q --break-system-packages ftfy 'huggingface-hub>=1.5.0,<2.0'
C=$C python /w/bridgegpu.py

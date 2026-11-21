#!/bin/bash
# ART-UNDER (11-21): World 2's earth underside, ONE sandbox (created with --forward-hf-token). In the sandbox:
#   bash run.sh <commit> [spec name, default spec-under]
# Qwen-Image-Edit-2511 by hfpokey/pokeygpu.py; packer.py packs each piece's takes the moment they are done (/w/<piece>.tar.pN,
# /w/READY-<piece>); pull each with hf_sandbox_fs cat and tools/art/hf1113/pull.py. Log /w/q.log; done /w/DONE.
set -x
C=$1; SP=${2:-spec-under}; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/hfpokey/jobs /w/takes
curl -fsSL $GH/hfpokey/pokeygpu.py -o /w/pokeygpu.py
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hfunder/$SP.json | sed "s/COMMIT/$C/" > /w/hfpokey/jobs/$SP.json
curl -fsSL $GH/hfnext/packer.py -o /w/packer.py
python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers
SPECF=/w/hfpokey/jobs/$SP.json python /w/packer.py > /w/pack.log 2>&1 &
OUT=/w SPEC=hfpokey/jobs/$SP.json python /w/pokeygpu.py
touch /w/GEN_DONE
wait
touch /w/DONE

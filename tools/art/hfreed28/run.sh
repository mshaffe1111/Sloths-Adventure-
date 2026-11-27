#!/bin/bash
# ART-REED-28: 2-8 reed island, ONE sandbox (created with --forward-hf-token). In the sandbox: bash run.sh <commit>. hfnext/run.sh with
# the spec from tools/art/hfreed28; packer.py packs each piece (isleA, isleW) as soon as its 4 takes are done; pull with hf1113/pull.py.
set -x
C=$1; SP=${2:-spec-reed28}; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/hfpokey/jobs /w/takes
curl -fsSL $GH/hfpokey/pokeygpu.py -o /w/pokeygpu.py
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hfreed28/$SP.json | sed "s/COMMIT/$C/" > /w/hfpokey/jobs/$SP.json
curl -fsSL $GH/hfnext/packer.py -o /w/packer.py
python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers
SPECF=/w/hfpokey/jobs/$SP.json python /w/packer.py > /w/pack.log 2>&1 &
OUT=/w SPEC=hfpokey/jobs/$SP.json python /w/pokeygpu.py
touch /w/GEN_DONE
wait
touch /w/DONE

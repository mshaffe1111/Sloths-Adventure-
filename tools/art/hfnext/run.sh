#!/bin/bash
# ART-NEXT batch 1 (World 2's village pieces) and batch 2 (ART-NEXT-b: World 3's grotto floor kit + the reeds redo), ONE sandbox a
# batch. In the HF sandbox: bash run.sh <commit> [spec name, default spec-b1; batch 2: spec-b2]. Log /w/q.log; done /w/DONE.
# Qwen-Image-Edit-2511 by hfpokey/pokeygpu.py (one load; frame-B edits after their frame-A takes); outputs /w/hfpokey/edits/.
# packer.py packs each PIECE's takes as soon as they are done (/w/<group>.tar.pN, /w/READY-<group>; fetch: hf1113/pull.py).
set -x
C=$1; SP=${2:-spec-b1}; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/hfpokey/jobs /w/takes
curl -fsSL $GH/hfpokey/pokeygpu.py -o /w/pokeygpu.py
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hfnext/$SP.json | sed "s/COMMIT/$C/" > /w/hfpokey/jobs/$SP.json
curl -fsSL $GH/hfnext/packer.py -o /w/packer.py
python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers
SPECF=/w/hfpokey/jobs/$SP.json python /w/packer.py > /w/pack.log 2>&1 &
OUT=/w SPEC=hfpokey/jobs/$SP.json python /w/pokeygpu.py
touch /w/GEN_DONE
wait
touch /w/DONE

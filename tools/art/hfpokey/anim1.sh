#!/bin/sh
# ANIM-NEXT job 1, inside the HF sandbox: sh anim1.sh <commit>  (log /w/anim1.log; takes /w/out)
C=$1; R=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C
mkdir -p /w/out && cd /w
for f in tools/art/hfpokey/anim1gpu.py tools/art/hfpokey/spec-anim1.json tools/art/hf1113/sbx.py; do curl -fsSL "$R/$f" -o "$(basename $f)" || exit 1; done
python -c "import diffusers,sys; from diffusers import WanImageToVideoPipeline; print('diffusers', diffusers.__version__)" || pip install -q -U --break-system-packages diffusers peft || pip install -q -U diffusers peft
python anim1gpu.py spec-anim1.json /w/out

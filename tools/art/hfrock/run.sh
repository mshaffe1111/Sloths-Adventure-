#!/bin/bash
# ENG-ROCK (ruling C): World 2's two new brown hop rocks, ONE sandbox (cap $2). In the HF sandbox: bash run.sh <commit>.
# Log /w/q.log; done /w/DONE. img2img (Qwen-Image + style LoRA) from the kit boulder (starts.py), 3 strengths x 3 seeds; cut in the sandbox.
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w
curl -fsSL $GH/w6to10/img2imggpu.py -o /w/img2imggpu.py
curl -fsSL $GH/hfrock/spec-rock.json | sed "s/COMMIT/$C/" > /w/spec-rock.json
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hf22p/cut.py -o /w/keycut.py
curl -fsSL $GH/hfrock/cut.py -o /w/cut.py
OUT=/w SUB=r SPEC=spec-rock.json TAG=r python /w/img2imggpu.py
python /w/cut.py /w/keycut.py /w/cuts /w/r/props/rock-*.png
python /w/sbx.py sheet /w/sheet-r.jpg 256 6 /w/cuts/*.q.webp
touch /w/DONE

#!/bin/bash
# ART-NEXT batch 1: World 2's village pieces, ONE sandbox (cap $3). In the HF sandbox: bash run.sh <commit>. Log /w/q.log; done /w/DONE.
# Qwen-Image-Edit-2511 by hfpokey/pokeygpu.py (one load; frame-B edits after their frame-A takes); outputs /w/hfpokey/edits/.
# Then every take as WebP q92 in /w/takes.tar, split into 95 KB parts by sbx.py for hf_sandbox_fs (fetch: hf1113/pull.py).
set -x
C=$1; GH=https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/$C/tools/art
mkdir -p /w/hfpokey/jobs /w/takes
curl -fsSL $GH/hfpokey/pokeygpu.py -o /w/pokeygpu.py
curl -fsSL $GH/hf1113/sbx.py -o /w/sbx.py
curl -fsSL $GH/hfnext/spec-b1.json | sed "s/COMMIT/$C/" > /w/hfpokey/jobs/spec-b1.json
python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers
OUT=/w SPEC=hfpokey/jobs/spec-b1.json python /w/pokeygpu.py
python -c "
from PIL import Image; import glob, os
for f in sorted(glob.glob('/w/hfpokey/edits/*.png')):
    Image.open(f).save('/w/takes/' + os.path.basename(f)[:-4] + '.webp', quality=92, method=6)
"
cd /w && tar cf takes.tar takes && python sbx.py parts takes.tar
touch /w/DONE

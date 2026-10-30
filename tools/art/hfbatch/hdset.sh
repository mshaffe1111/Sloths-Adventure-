#!/bin/sh
# X-16's one batched GPU job (make_hdset_spec.py): the native-resolution strips, then the sky above each new far strip.
# Run on HF Jobs with image ostris/aitoolkit:latest, flavor rtx-pro-6000, secrets HF_TOKEN, volume hf://buckets/mshaffe111/w5-xfer:/out:rw,
# env G = https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/<commit>/tools/art/hfbatch
set -e
mkdir -p /out/hfbatch/hdset/jobs
curl -sfL "$G/specs/spec-hdset.json" -o /out/hfbatch/hdset/jobs/spec-hdset.json
curl -sfL "$G/specs/spec-hdsky.json" -o /out/hfbatch/hdset/jobs/spec-hdsky.json
curl -sfL "$G/striphdgpu.py" -o /tmp/striphdgpu.py
curl -sfL "$G/skygpu.py" -o /tmp/skygpu.py
SUB=hfbatch/hdset SPEC=hfbatch/hdset/jobs/spec-hdset.json TAG=hdset python /tmp/striphdgpu.py
SUB=hfbatch/hdset SPEC=hfbatch/hdset/jobs/spec-hdsky.json TAG=hdsky python /tmp/skygpu.py

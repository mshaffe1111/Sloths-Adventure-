"""Unpack a carrier PNG made by w5cpu.py (files packed byte for byte into a greyscale PNG, so hf_fs `attach` can bring them back to a
session that cannot download from Hugging Face).

    python3 -I tools/art/w5/unpack_carrier.py <carrier.png> <out dir>
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

data = np.asarray(Image.open(sys.argv[1]).convert('L')).reshape(-1).tobytes()
nl = data.index(b'\n')
files = json.loads(data[:nl])
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
pos = nl + 1
for name, size in files:
    (out / name).write_bytes(data[pos:pos + size])
    print(name, size)
    pos += size

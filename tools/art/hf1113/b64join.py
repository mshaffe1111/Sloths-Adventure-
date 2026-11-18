"""Rebuild a file the HF sandbox sent back as base64 text chunks (hf_sandbox_fs cat, <=100000 bytes a call).

    python3 -I tools/art/hf1113/b64join.py <out file> <chunk text file>...
Each chunk file holds the raw text a cat returned (whitespace ignored)."""
import base64, sys
from pathlib import Path
data = ''.join(''.join(Path(p).read_text().split()) for p in sys.argv[2:])
Path(sys.argv[1]).write_bytes(base64.b64decode(data))
print(sys.argv[1], len(base64.b64decode(data)))

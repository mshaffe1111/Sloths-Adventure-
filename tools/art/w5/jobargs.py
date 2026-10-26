"""Print the hf_jobs `run` args for a World 5 spec, for the Hugging Face connector (this machine cannot reach huggingface.co itself).

    python3 -I tools/art/w5/jobargs.py tools/art/gen/spec-w5prep.json [part parts]

Before launching, put the job script and the spec in the bucket with hf_fs_write: hf://buckets/mshaffe111/w5-xfer/jobs/<script name>
and jobs/<spec name>. The job mounts the bucket read-write at /out, reads both from there and writes its results there (the
connector's token cannot write mshaffe111/slothadv-gen). The token goes in only as the job secret HF_TOKEN (the connector's "$HF_TOKEN"
stand-in), never in an env value, a file or a commit. Order: spec-w5prep (CPU) -> spec-w5edit + spec-w5qclips (GPU, 2 parts) ->
spec-w5tea (GPU, from the picked edits) -> spec-w5pack (CPU).
"""
import json, sys
from pathlib import Path

p = Path(sys.argv[1])
spec = json.loads(p.read_text())
part = int(sys.argv[2]) if len(sys.argv) > 2 else 0
parts = int(sys.argv[3]) if len(sys.argv) > 3 else spec.get('parts', 1)
script = Path(spec['script']).name
cpu = spec.get('flavor', '').startswith('cpu')
args = {'image': 'python:3.12' if cpu else 'ostris/aitoolkit:latest',
        'command': ['bash', '-lc', f'sha256sum /out/jobs/{script} && SPEC=jobs/{p.name} PART={part} PARTS={parts} python /out/jobs/{script}'],
        'flavor': spec.get('flavor', 'rtx-pro-6000'), 'secrets': {'HF_TOKEN': '$HF_TOKEN'},
        'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'timeout': spec.get('timeout', '1h' if cpu else '2h'), 'detach': True,
        'name': f"{spec['tag']}-{part}"}
print(json.dumps(args, indent=1))

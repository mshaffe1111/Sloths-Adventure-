"""Put this pass's new World 1-4 pieces on the art-use allow-list (src/game/artUse.allow.json), owned by the world's gen2 builder, and drop
entries for pieces no longer packed. They are made ahead of the rebuild (STAGE-RULES §1c) and drawn when that world moves to gen2.
    python3 tools/art/w1to4/allow_new.py
"""
import json, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
out = Path(tempfile.mkdtemp()) / 'rows.json'
subprocess.run(['node', str(ROOT / 'tools/art/artuse.mjs'), '--json', str(out)], check=True, capture_output=True)
rows = json.loads(out.read_text())
p = ROOT / 'src/game/artUse.allow.json'
allow = [a for a in json.loads(p.read_text()) if not a['id'].startswith('src/assets/w1to4art/')]
have = {a['id'] for a in allow}
for r in rows:
    if r['file'].startswith('src/assets/w1to4art/') and r['id'] not in have:
        w = r['file'].split('/')[-1][:2].upper()
        allow.append({'id': r['id'], 'owner': f'gen2 {w} builder', 'world': w,
                      'why': f'new {w} art made ahead of the gen2 rebuild (qa-notes/{w.lower()}/GRAB-BAG.md); drawn when {w} moves to gen2'})
p.write_text(json.dumps(allow, indent=1))
print(len(allow), 'entries')

"""ART 11-13: rewrite each world's **Gaps** line in reference/art/CATALOG-MASTER.md from the current CATALOG-MASTER.csv, with
catalog_master.py write_md's own rule (its full --merge rebuilds the csv from parts A/B and would drop rows appended since, like
rows.py's). inventory.test.ts 'gaps(1)' reads this line: a new one-piece slot (a new set piece) must be named on it.

    python3 -I tools/art/hf1113/gapsline.py
"""
import csv, re, runpy, sys
from collections import Counter
from pathlib import Path

G = Path(__file__).resolve().parents[3]
sys.argv = ['catalog_master.py']
m = runpy.run_path(str(G / 'tools/art/catalog_master.py'), run_name='catalog_master_lib')
rows = list(csv.DictReader(open(G / 'reference/art/CATALOG-MASTER.csv')))
STANDABLE, slot_key, parse_worlds, WORLD = m['STANDABLE'], m['slot_key'], m['parse_worlds'], m['WORLD']
play = ('landing', 'climbable', 'other/', 'new slot', 'stageArtData', 'pickCut', 'w1CutArt')
allslots = Counter(k for k in (slot_key(r.get('engine_slot')) for r in rows if r.get('layer') in STANDABLE | {'danger look', 'climb'}) if k.startswith(play))
LEVEL = STANDABLE | {'danger look', 'climb', 'decor near', 'decor mid', 'backdrop'}
md = (G / 'reference/art/CATALOG-MASTER.md').read_text()
for n in WORLD:
    rs = [r for r in rows if n in parse_worlds(r.get('worlds', ''))]
    lv = [r for r in rs if r.get('layer') in LEVEL]
    sc = Counter(slot_key(r.get('engine_slot')) for r in lv if not (r.get('status') or '').startswith('needs fix'))
    gaps = [k for k in allslots if sc.get(k, 0) < 3 and not (k.startswith('new slot: lava') and n != 9)
            and not (re.match(r'new slot: World (\d+)', k) and re.match(r'new slot: World (\d+)', k).group(1) != str(n))]
    new = f"**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): {', '.join(sorted(gaps)) or 'none'}."
    pat = re.compile(r'(## World ' + str(n) + r':[\s\S]*?)\*\*Gaps\*\*[^\n]*')
    md, k = pat.subn(lambda mo: mo.group(1) + new, md, count=1)
    print(n, 'gaps', len(gaps), 'replaced' if k else 'NOT FOUND')
(G / 'reference/art/CATALOG-MASTER.md').write_text(md)

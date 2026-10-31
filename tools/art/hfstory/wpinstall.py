"""Install picked world plates (hf-cutscenes): each full-size pick (2560 x 2720 PNG) -> src/assets/story/plates/w<world>-<mood>.webp, and
its row in plateData.ts PLATES and WORLD_PLATES.

    python3 -I tools/art/hfstory/wpinstall.py <dir of wp-<w>-<mood>-s<NN>-full.png>
"""
import re, sys
from pathlib import Path
from PIL import Image

GAME = Path(__file__).resolve().parents[3]
DATA = GAME / 'src/game/plateData.ts'
WHAT = {
    '1': 'the emerald canopy', '2': 'the sunlit riverbank and its village', '3': 'the mossy grotto', '4': 'the misty cascades',
    '5': 'the orchid sanctuary', '6': 'the deep mangrove', '7': 'the ancient ruins', '8': 'the twilight treetops',
    '9': 'the volcanic jungle', '10': 'the stormy highlands and the fortress',
}
src = Path(sys.argv[1])
rows, maps = [], []
for f in sorted(src.glob('wp-*-full.png')):
    m = re.match(r'wp-(\d+)-([a-z]+)-[srtu]\d+-full\.png', f.name)
    w, mood = m.group(1), m.group(2)
    key = f'w{w}-{mood}'
    im = Image.open(f).convert('RGB')
    assert im.size == (2560, 2720), im.size
    out = GAME / f'src/assets/story/plates/{key}.webp'
    im.save(out, 'WEBP', quality=86, method=6)
    print(key, out.stat().st_size // 1024, 'KB')
    rows.append(f"  '{key}': {{ ground: 0.8, what: \"World {w}'s story place, {mood}: {WHAT[w]} (hf-cutscenes, from the world's own story scenery)\" }},")
    maps.append(f"  '{w}-{mood}': '{key}',")
s = DATA.read_text()
for r in rows:
    k = r.split("'")[1]
    s = re.sub(rf"\n  '{re.escape(k)}': \{{[^\n]*\}},", '', s)
    s = s.replace('\n};\n\nexport function isPlate', '\n' + r + '\n};\n\nexport function isPlate', 1)
for r in maps:
    k = r.split("'")[1]
    s = re.sub(rf"\n  '{re.escape(k)}': '[^']*',", '', s)
s = re.sub(r'export const WORLD_PLATES: Record<string, string> = \{([^}]*)\};',
           lambda m: 'export const WORLD_PLATES: Record<string, string> = {' + (m.group(1).rstrip() + '\n' if m.group(1).strip() else '\n') + '\n'.join(maps) + '\n};', s)
DATA.write_text(s)

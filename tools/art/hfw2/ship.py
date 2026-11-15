"""ART-W2: from the picked takes to the shipped files (src/assets/w2-1115/) and their catalog rows. Re-runnable from the kept takes.

    python3 -I tools/art/hfw2/ship.py <takes dir (reference/art/hfw2/takes)>

Cuts with cut.py (key, clips, colour match to the existing World 2 piece each swaps with), wraps the shallow strip with wrap.py, writes
lossy WebP q90 at ship size (about 3x the piece's on-screen width in world units, so a 3x phone stays sharp), and prints the sizes.
"""
import subprocess, sys
from pathlib import Path
from PIL import Image

T = Path(sys.argv[1]); OUT = Path('src/assets/w2-1115'); OUT.mkdir(parents=True, exist_ok=True)
TMP = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('/tmp/w2-1115'); TMP.mkdir(parents=True, exist_ok=True)
LILY = 'src/assets/props/w2-props.webp@748,2035,300,94'
CUTS = {  # ship name: (take, ship width px, cut.py args)
    'w2-loglong': ('loglong-s52-11', 1350, []),
    'w2-pad-small': ('pad-small-23', 300, ['--match', LILY, '--k', '0.75']),
    'w2-pad-small-sunk': ('pad-small-sunk-23', 300, ['--match', LILY, '--k', '0.75']),
    'w2-pad-big-sunk': ('pad-big-sunk-23', 540, ['--match', 'src/assets/w1-1109/M-03-a.png', '--k', '0.8']),
    'w2-pad-ripple': ('ripple-under-11', 400, ['--decal', '0.12']),
    'w2-crown-bud': ('crown-bud-11', 160, ['--box', '300,0,720,880']),
    'w2-crown-open': ('crown-open-11', 360, []),
    'w2-bamboo-bounce': ('bamboo-bounce-11', 480, ['--box', '0,0,1024,900', '--clip', '820,540,860']),
}
for name, (take, w, args) in CUTS.items():
    tmp = TMP / f'{name}.webp'
    subprocess.run(['python3', '-I', 'tools/art/hfw2/cut.py', str(T / f'{take}.webp'), str(tmp), *args], check=True, capture_output=True)
    im = Image.open(tmp); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    print(name, im.size, round((OUT / f'{name}.webp').stat().st_size / 1024, 1), 'KB')
r = subprocess.run(['python3', '-I', 'tools/art/hfw2/wrap.py', str(T / 'shallow-s62-11.webp'), str(TMP / 'shallow.webp'),
                    str(TMP / 'shallow-2x.jpg'), '40'], check=True, capture_output=True, text=True)
print(r.stdout.strip())
im = Image.open(TMP / 'shallow.webp'); im = im.resize((1420, 400), Image.LANCZOS)
im.save(OUT / 'w2-shallow.webp', 'WEBP', quality=92, method=6)
print('w2-shallow', im.size, round((OUT / 'w2-shallow.webp').stat().st_size / 1024, 1), 'KB')

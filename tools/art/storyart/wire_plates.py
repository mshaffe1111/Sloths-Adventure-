"""The repainted plates into the game: src/assets/story/plates/<key>.webp at 2560 wide (the old 1024 x 572 scene at the bottom, the room for
upright phones above it, storyArt.ts drawPlate / PLATE_BASE).

    python3 -I tools/art/storyart/wire_plates.py <dir> '{"courtyard": "pl-courtyard-6", ...}'
"""
import json, sys
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parents[3]


def main():
    src = Path(sys.argv[1])
    for key, stem in json.loads(sys.argv[2]).items():
        p = next(q for q in src.iterdir() if q.stem == stem)
        im = Image.open(p).convert('RGB')
        if im.width != 2560:
            im = im.resize((2560, round(im.height * 2560 / im.width)), Image.LANCZOS)
        out = REPO / f'src/assets/story/plates/{key}.webp'
        for q in (84, 78, 72):
            im.save(out, 'WEBP', quality=q, method=6)
            if out.stat().st_size < 1_600_000:
                break
        print(key, stem, im.size, out.stat().st_size)


if __name__ == '__main__':
    main()

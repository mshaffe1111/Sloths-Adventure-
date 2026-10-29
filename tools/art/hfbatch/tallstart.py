"""Start pictures for the 16 held-back skies (X-16 round 4, the lead 2026-10-29): each native far strip with a sky stacked above it, so
one low-strength img2img pass over the whole tall picture (striphdgpu.py, tiles the full height) repaints the join and the sky in the
strip's style, but cannot invent a second landscape: the layout (sky above, scene below) is fixed before the model sees it.

    python3 -I tools/art/hfbatch/tallstart.py      writes tools/art/hfbatch/starts/sky/<stem>-tall.webp (force-added: the job reads
                                                     them from GitHub) and tools/art/hfbatch/specs/spec-hdsky4.json (with --spec <commit>)

The sky above: a sky that passed review in the same world (DONOR), recoloured to this strip's own top rows (each channel's mean and
spread), its last rows crossfaded into the strip's top row; a strip with no donor gets a soft vertical gradient of its own top colours."""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
BACK = ROOT / 'src/assets/backdrops'
OUT = Path(__file__).resolve().parent / 'starts' / 'sky'
# (only where the donor's light fits: w6dusk's starry night over w6's grey day, w9night's stars over w9's smoke and w2rapids' canopy
# over w2's open sky did not, first look 2026-10-29)
DONOR = {'w1kapok': 'w1', 'w1sunrise': 'w1', 'w3sinkhole': 'w3', 'w5dusk2': 'w5dusk1', 'w10after': 'w10'}
NO_DONOR = ['w2', 'w2evening', 'w5twi1', 'w5twi2', 'w6', 'w6dawn', 'w7', 'w7dawn', 'w7dusk', 'w9', 'w9dawn']
E_SHARE = 0.35  # the sky rows above, as a share of the strip's height (as skygpu.py's ext)


def match(src, ref):
    a, b = src.reshape(-1, 3), ref.reshape(-1, 3)
    return (src - a.mean(0)) / np.maximum(a.std(0), 1) * np.maximum(b.std(0), 6) + b.mean(0)


def tall(stem):
    far = np.asarray(Image.open(BACK / f'{stem}-far.webp').convert('RGB')).astype(np.float32)
    H, W, _ = far.shape
    E = int(round(H * E_SHARE / 16) * 16)
    top = far[: max(8, H // 10)]
    if stem in DONOR:
        d = Image.open(BACK / f'{DONOR[stem]}-sky.webp').convert('RGB')
        d = np.asarray(d.resize((W, round(d.height * W / d.width)), Image.LANCZOS)).astype(np.float32)
        sky = d[:E] if d.shape[0] >= E else np.asarray(Image.fromarray(d.astype(np.uint8)).resize((W, E), Image.LANCZOS)).astype(np.float32)
        sky = match(sky, top)
    else:
        # the strip's top colour, smoothed right across (its trunks and branches would only stretch into streaks), a little deeper
        # overhead, with soft cloud-sized variation for the model to paint into
        from scipy import ndimage
        row = ndimage.gaussian_filter1d(far[:6].mean(0), W / 10, axis=0, mode='wrap')[None]
        y = np.linspace(1, 0, E, dtype=np.float32)[:, None, None]
        sky = row * (1 - 0.18 * y)
        rng = np.random.default_rng(7)
        blob = ndimage.gaussian_filter(rng.normal(0, 1, (E, W)).astype(np.float32), (E / 10, W / 40), mode='wrap')
        sky = sky + (blob / max(blob.std(), 1e-3) * 7)[..., None]
    # the last 12% of the sky rows ease into the strip's own top row
    k = int(E * 0.12)
    t = np.linspace(0, 1, k, dtype=np.float32)[:, None, None]
    t = t * t * (3 - 2 * t)
    sky[E - k:] = sky[E - k:] * (1 - t) + far[:1] * t
    out = np.clip(np.concatenate([sky, far], 0), 0, 255).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / f'{stem}-tall.webp'
    Image.fromarray(out).save(p, 'WEBP', quality=92, method=6)
    return p, E, out.shape


if __name__ == '__main__':
    stems = sorted(DONOR) + NO_DONOR
    if len(sys.argv) > 2 and sys.argv[1] == '--spec':
        commit = sys.argv[2]
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from make_sky_spec import WHAT
        STYLE = ('slothadv style, painted storybook illustration, a wide side-scrolling game background layer, soft cel shading, thin '
                 'dark outline, crisp clean hand-painted gouache brushwork with fine detail, light from the upper left')
        base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/sky/'
        items = []
        for s in stems:
            im = Image.open(OUT / f'{s}-tall.webp')
            for st in (0.3, 0.38):
                items.append({'name': f'{s}-tall-s{round(st * 100)}', 'pre': 'none', 'src': f'{base}{s}-tall.webp', 'h': im.height,
                              'strength': st, 'seed': 7, 'steps': 24, 'bg': [128, 128, 128],
                              'prompt': f'{STYLE}. {WHAT[s]} above, the far distance of the scene below',
                              'neg': 'second landscape, stacked scenes, frame, border, panel, picture in picture, horizontal band, seam, '
                                     'text, letters, watermark, people, animal, sloth, blurry'})
        spec = {'note': 'X-16 round 4: tall starts, striphdgpu.py', 'loras': {'style': ['mshaffe111/slothadv-style-lora',
                'slothadv_style_v1.safetensors', 0.8]}, 'tw': 1024, 'items': items}
        (Path(__file__).resolve().parent / 'specs' / 'spec-hdsky4.json').write_text(json.dumps(spec, indent=1))
        print(len(items), 'items')
    else:
        for s in stems:
            p, E, shp = tall(s)
            print(p.name, shp, 'sky rows', E)

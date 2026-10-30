"""Starts for the finale's ending cards (S-7): each card's world painted backdrop (its far, mid and near strips, as the stages draw them)
with the game's own pictures of the characters on it, at 1920 x 1080. The GPU job (storygpu.py, make_spec round5) paints them over on the
style model so the guardians stay the ones the player fought.

    python3 -I tools/art/storyart/cards.py [card ...]     -> tools/art/hfbatch/starts/storyart/card-<id>.png + a review sheet
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageFilter

REPO = Path(__file__).resolve().parents[3]
OUT = REPO / 'tools/art/hfbatch/starts/storyart'
W, H = 1920, 1080  # 16:9 (story-a, 2026-10-30): upright shows the middle 4:3, sideways a band; what matters stays in the middle 1440 x 880
GROUND = 0.84  # where the feet stand, as a share of the height
PLATE_FOOT = 0.88  # on a story plate (the plates carry a dark strip under their floor, cropped off)


def backdrop(world):
    if isinstance(world, str):
        # a story plate (2560 x 2720: the old scene at the bottom, sky room above): the bottom 4:3 of it
        # (the strip under the floor line is cut off, so the floor sits where the feet go: GROUND)
        im = Image.open(REPO / f'src/assets/story/plates/{world}.webp').convert('RGBA')
        h = round(im.width * H / W)
        floor = im.height - im.width * 572 / 1024 * (1 - plate_ground(world))
        bottom = min(im.height, round(floor + h * (1 - PLATE_FOOT)))
        return im.crop((0, bottom - h, im.width, bottom)).resize((W, H), Image.LANCZOS)
    B = REPO / 'src/assets/backdrops'
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    for part, hk in (('far', 1.0), ('mid', 1.0), ('near', 1.0)):
        p = B / f'w{world}-{part}.webp'
        if not p.exists():
            continue
        im = Image.open(p).convert('RGBA')
        s = H * hk / im.height
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        x = (W - im.width) // 2
        cv.alpha_composite(im, (x, H - im.height)) if x >= 0 else cv.alpha_composite(im.crop((-x, 0, -x + W, im.height)), (0, H - im.height))
    return cv


def plate_ground(key):
    s = (REPO / 'src/game/plateData.ts').read_text()
    m = re.search(rf"'?{re.escape(key)}'?: {{ ground: ([0-9.]+)", s)
    return float(m.group(1))


def frames(ts, var=None):
    s = (REPO / 'src/game' / ts).read_text()
    i = s.index('FRAMES' if var is None else var)
    i = s.index('{', s.index('=', i))
    js = re.sub(r"([{,]\s*)'?([A-Za-z_][A-Za-z0-9_.]*)'?\s*:", r'\1"\2":', s[i:])
    js = re.sub(r":\s*'([^']*)'", r': "\1"', js)
    return json.JSONDecoder().raw_decode(re.sub(r",(\s*[}\]])", r"\1", js))[0]


def sprite(atlas, ts, name, var=None):
    f = frames(ts, var)[name]
    im = Image.open(REPO / atlas).convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    return im


def cel(key):
    f = frames('storyCelData.ts', 'CELS')[key]
    return Image.open(REPO / f"src/assets/characters/cels-{f['a']}.webp").convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def hd(who, name):
    f = frames(f'storyHdData_{who}.ts', f'HD_{who.upper()}_FRAMES')[name]
    return Image.open(REPO / f"src/assets/story/hd/{who}-{f['p']}.webp").convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def squirrel(name):
    j = json.loads((REPO / 'src/assets/w6to10/gemini/story18-squirrels.json').read_text())['frames'][name]
    im = Image.open(REPO / 'src/assets/w6to10/gemini/story18-squirrels.webp').convert('RGBA').crop((j['x'], j['y'], j['x'] + j['w'], j['y'] + j['h']))
    # (the sheet's cut-outs carry a white sticker outline, which the repaint kept: the pale edge goes, and the edge comes in a little)
    import numpy as np
    a = np.asarray(im).astype(np.int16)
    edge = np.asarray(im.split()[3].filter(ImageFilter.MinFilter(25))) < 200
    pale = (a[..., :3].min(-1) > 175) & ((a[..., :3].max(-1) - a[..., :3].min(-1)) < 55)
    a[..., 3] = np.where(edge & pale, 0, a[..., 3])
    out = Image.fromarray(a.astype(np.uint8), 'RGBA')
    out.putalpha(out.split()[3].filter(ImageFilter.MinFilter(3)))
    return out


def flicker(name='glow_00'):
    f = frames('flickerAnimData.ts', 'FLICKER_ANIM:')[name]
    return Image.open(REPO / 'src/assets/characters/flicker-anim.webp').convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def tea_table():
    """a small round tea table with a teapot and two cups, drawn plainly for the repaint to paint"""
    from PIL import ImageDraw
    im = Image.new('RGBA', (420, 300), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((20, 110, 400, 170), fill=(170, 120, 80, 255), outline=(60, 40, 25, 255), width=5)
    d.rectangle((190, 160, 230, 290), fill=(140, 95, 60, 255), outline=(60, 40, 25, 255), width=4)
    d.ellipse((150, 50, 260, 140), fill=(245, 240, 230, 255), outline=(60, 50, 50, 255), width=4)
    d.polygon([(255, 85), (310, 60), (300, 80), (258, 105)], fill=(245, 240, 230, 255), outline=(60, 50, 50, 255))
    for cx in (90, 330):
        d.rectangle((cx - 26, 105, cx + 26, 140), fill=(245, 240, 230, 255), outline=(60, 50, 50, 255), width=3)
    return im


def trim(im):
    b = im.split()[3].point(lambda v: 255 if v > 10 else 0).getbbox()
    return im.crop(b) if b else im


def place(cv, im, cx, height, flip=False, foot=GROUND, y=None):
    im = trim(im)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    s = height * H / im.height
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))
    cv.alpha_composite(im, (round(cx * W - im.width / 2), round(foot * H - im.height)))


E = 'src/assets/enemies/'
# card: world, [figure (a function giving the picture), x share, height share, flip], the scene in words (the GPU prompt)
CARDS = {
    'venom-fang': (1, [(lambda: sprite(E + 'venom-atlas.webp', 'venomAtlasData.ts', 'n_idle'), .58, .44, True), (lambda: hd('pokey', 'talk_a'), .4, .46, False)],
                   'a big green snake with a small gold crown resting in a loose coil by a mossy branch, looking pleased but pretending not to be, a young sloth with a satchel standing politely beside him asking first, a warm friendly visit in the rainforest'),
    'crocus-rex': (2, [(lambda: sprite(E + 'croc-atlas.webp', 'crocAtlasData.ts', 'idle'), .5, .26, False, .9), (lambda: squirrel('kids'), .5, .16, False, .74)],
                   'a big crocodile with a crooked little crown swimming gently across the calm river like a ferry, three small passengers riding on his back, the tree village on the far bank, sunny'),
    'shadow-prowler': (3, [(lambda: sprite(E + 'prowler-atlas.webp', 'prowlerAtlasData.ts', 'curl'), .57, .32, True), (lambda: hd('pokey', 'slump'), .42, .32, False)],
                       'a black panther lying quietly on a mossy rock ledge in a glowworm cave in the evening, a young sloth sitting beside him, neither of them talking, both looking out, peaceful'),
    'sky-sovereign': (4, [(lambda: sprite(E + 'sovereign-atlas.webp', 'sovereignAtlasData.ts', 'glide'), .48, .26, False, .5), (lambda: sprite(E + 'sovereign-atlas.webp', 'sovereignAtlasData.ts', 'glide'), .66, .13, False, .36), (lambda: sprite(E + 'sovereign-atlas.webp', 'sovereignAtlasData.ts', 'glide'), .33, .12, False, .32)],
                      'a great harpy eagle flying free on the wind over the misty valley and waterfalls, two young grown eaglets flying with her, the wind blowing where it likes'),
    'tarantula-queen': (5, [(lambda: sprite(E + 'queen-atlas.webp', 'queenAtlasData.ts', 'idle2'), .66, .34, False), (lambda: hd('pokey', 'idle'), .3, .36, False), (lambda: tea_table(), .47, .18, False)],
                        'a big friendly tarantula queen with a tiny crown at a little round table set for tea among the pink orchids, a china teapot and cups, a young sloth guest sitting with her finishing his cup'),
    'marsh-reaver': (6, [(lambda: sprite(E + 'reaver-atlas.webp', 'reaverAtlasData.ts', 'idle'), .52, .42, False)],
                     'a big marsh creature sitting on a mangrove root by a path at noon eating his lunch from a leaf, half of it left beside him, fireflies, clean still water'),
    'stone-golem': ('ruins', [(lambda: sprite(E + 'golem-atlas.webp', 'golemAtlasData.ts', 'idle'), .5, .36, False)],
                    'a mossy stone golem speaking slowly at a council in the ancient ruins, every stone chair in the ring taken by forest guardians listening patiently, sun through the trees'),
    'night-wing-monarch': (8, [(lambda: sprite(E + 'monarch-atlas.webp', 'monarchAtlasData.ts', 'perched'), .6, .34, True), (lambda: hd('pokey', 'talk_b'), .4, .44, False)],
                           'a huge night butterfly monarch perched on a branch under the moon writing in a little book, a young sloth beside her telling her how a dream ended, fireflies'),
    'magma-drake': (9, [(lambda: sprite(E + 'drake-atlas.webp', 'drakeAtlasData.ts', 'idle'), .62, .42, True), (lambda: cel('db.side_by_side'), .38, .44, False)],
                    'a red dragon at a tidy little table by the volcano with two used teacups, two young sloths visiting him, a girl sloth in a pink headband and a boy sloth with a satchel, his cave swept neat and tidy, warm glow'),
    'general': (2, [(lambda: cel('gv.reach_a'), .46, .46, False)],
                'an old brown sloth in a rust red scarf and no armour planting a small young tree on the riverbank in spring, kneeling patiently, taking his time, gentle morning light'),
    'soldiers': ('cookhouse', [(lambda: sprite(E + 'guard-atlas.webp', 'guardAtlasData.ts', 'sit1'), .42, .36, False), (lambda: sprite(E + 'guard-atlas.webp', 'guardAtlasData.ts', 'sit2'), .6, .36, True)],
                 'two tired soldier sloths in green coats sitting down at a wooden counter in a little tailor shop, relieved to sit, a measuring tape on the counter, warm lamp light'),
    'squirrels': (1, [(lambda: squirrel('laughing'), .42, .3, False), (lambda: squirrel('kids'), .6, .2, False)],
                  'a family of red squirrels under the old vine in the rainforest laughing and waving, little kids, a new blank wooden sign on a post beside them, sunny'),
    'gruntlewick': ('village', [(lambda: cel('tc.announce'), .5, .52, False)],
                    'an old marmoset town crier with a white beard reading a brand new warning from a scroll in the tree village, very serious about it, proud'),
    'mailman': ('village', [(lambda: cel('po.offer_parcel'), .5, .52, False)],
                'a sloth mail carrier with a cap and a mail bag carrying a parcel very carefully and seriously through the tree village, taking his time'),
    'pell': ('cookhouse', [(lambda: cel('lp.sew_table'), .5, .52, False)],
             'a sloth lieutenant in his own little tailor shop sewing at the counter, a crooked wooden shop sign, customers waiting happily, warm lamp light, a busy friendly shop'),
    'flicker': ('cookhouse', [(lambda: flicker('glow_00'), .5, .15, False, .52)],
                'a small glowing firefly hovering steady over a wooden shop counter, a warm steady light over the counter, a quiet tailor shop at night'),
}


def main():
    want = sys.argv[1:] or list(CARDS)
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for k in want:
        world, figs, words = CARDS[k]
        cv = backdrop(world)
        for fig in figs:
            fn, x, h, fl = fig[:4]
            place(cv, fn(), x, h, fl, *(fig[4:] or ([PLATE_FOOT] if isinstance(world, str) else [])))
        cv.convert('RGB').save(OUT / f'card-{k}.png')
        meta[k] = {'world': world, 'words': words}
        print(k)
    old = json.loads((OUT / 'meta-cards.json').read_text()) if (OUT / 'meta-cards.json').exists() else {}
    old.update(meta)
    (OUT / 'meta-cards.json').write_text(json.dumps(old, indent=1))


if __name__ == '__main__':
    main()

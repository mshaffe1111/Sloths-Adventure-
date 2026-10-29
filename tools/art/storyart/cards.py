"""Starts for the finale's ending cards (S-7): each card's world painted backdrop (its far, mid and near strips, as the stages draw them)
with the game's own pictures of the characters on it, at 1280 x 960. The GPU job (storygpu.py, make_spec round5) paints them over on the
style model so the guardians stay the ones the player fought.

    python3 -I tools/art/storyart/cards.py [card ...]     -> tools/art/hfbatch/starts/storyart/card-<id>.png + a review sheet
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageFilter

REPO = Path(__file__).resolve().parents[3]
OUT = REPO / 'tools/art/hfbatch/starts/storyart'
W, H = 1280, 960
GROUND = 0.84  # where the feet stand, as a share of the height
PLATE_FOOT = 0.95  # on a story plate (the plates carry a dark strip under their floor, cropped off)


def backdrop(world):
    if isinstance(world, str):
        # a story plate (2560 x 2720: the old scene at the bottom, sky room above): the bottom 4:3 of it
        # (the strip under the floor line is cut off, so the floor sits where the feet go: GROUND)
        im = Image.open(REPO / f'src/assets/story/plates/{world}.webp').convert('RGBA')
        h = round(im.width * 3 / 4)
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
    return Image.open(REPO / 'src/assets/w6to10/gemini/story18-squirrels.webp').convert('RGBA').crop((j['x'], j['y'], j['x'] + j['w'], j['y'] + j['h']))


def flicker(name='glow_00'):
    f = frames('flickerAnimData.ts', 'FLICKER_ANIM:')[name]
    return Image.open(REPO / 'src/assets/characters/flicker-anim.webp').convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


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
    'venom-fang': (1, [(lambda: sprite(E + 'venom-atlas.webp', 'venomAtlasData.ts', 'n_idle'), .64, .42, True), (lambda: hd('pokey', 'talk_a'), .34, .44, False)],
                   'a big green snake with a small gold crown resting in a loose coil in the rainforest, a young sloth with a satchel standing politely beside him asking how he is, a warm friendly visit'),
    'crocus-rex': (2, [(lambda: sprite(E + 'croc-atlas.webp', 'crocAtlasData.ts', 'idle'), .52, .26, False)],
                   'a big crocodile with a crown lying contentedly in the sun on the sandy riverbank, eyes half closed, the river calm and clear'),
    'shadow-prowler': (3, [(lambda: sprite(E + 'prowler-atlas.webp', 'prowlerAtlasData.ts', 'curl'), .6, .3, True), (lambda: hd('pokey', 'slump'), .38, .3, False)],
                       'a black panther lying quietly on a mossy rock ledge in a glowworm cave in the evening, a young sloth sitting beside him in silence, both looking out, peaceful'),
    'sky-sovereign': (4, [(lambda: sprite(E + 'sovereign-atlas.webp', 'sovereignAtlasData.ts', 'screechPerch'), .55, .42, False)],
                      'a great harpy eagle perched calmly on a high cliff branch, wind blowing freely through the misty valley and waterfalls, feathers ruffled by the wind'),
    'tarantula-queen': (5, [(lambda: sprite(E + 'queen-atlas.webp', 'queenAtlasData.ts', 'idle2'), .5, .34, False)],
                        'a big friendly tarantula queen with a tiny crown sitting at a little table set for tea among the pink orchids, a china teapot and cups, delicate webs'),
    'marsh-reaver': (6, [(lambda: sprite(E + 'reaver-atlas.webp', 'reaverAtlasData.ts', 'idle'), .52, .4, False)],
                     'a big marsh creature resting in the shallow clear water of the mangroves at peace, fireflies, the water clean and still'),
    'stone-golem': ('ruins', [(lambda: sprite(E + 'golem-atlas.webp', 'golemAtlasData.ts', 'idle'), .5, .36, False)],
                    'a mossy stone golem sitting peacefully among the ancient ruins and the ring of stone chairs, flowers growing on his shoulders, sun through the trees'),
    'night-wing-monarch': (8, [(lambda: sprite(E + 'monarch-atlas.webp', 'monarchAtlasData.ts', 'perched'), .62, .34, True), (lambda: hd('pokey', 'talk_b'), .34, .42, False)],
                           'a huge night butterfly monarch perched on a branch under the moon, writing in a little book, a young sloth sitting beside her telling a story, fireflies'),
    'magma-drake': (9, [(lambda: sprite(E + 'drake-atlas.webp', 'drakeAtlasData.ts', 'idle'), .66, .4, True), (lambda: cel('db.side_by_side'), .3, .44, False)],
                    'a red dragon sitting at a tidy little table by the volcano with two teacups, two young sloths visiting him, a girl sloth in a pink headband and a boy sloth with a satchel, warm glow, everything neat and tidy'),
    'general': ('grandma-door-empty', [(lambda: cel('gv.sit'), .4, .44, False)],
                'an old brown sloth in a rust red scarf sitting on the step by a round wooden door in the roots of a great tree, at peace, retired, soft morning light'),
    'soldiers': ('cookhouse', [(lambda: sprite(E + 'guard-atlas.webp', 'guardAtlasData.ts', 'sit1'), .38, .36, False), (lambda: sprite(E + 'guard-atlas.webp', 'guardAtlasData.ts', 'sit2'), .62, .36, True)],
                 'two tired soldier sloths in green coats sitting down at a wooden counter, relieved, warm lamp light, a tailor shop'),
    'squirrels': (1, [(lambda: squirrel('laughing'), .4, .3, False), (lambda: squirrel('kids'), .62, .2, False), (lambda: squirrel('sign'), .82, .22, False)],
                  'a family of red squirrels under the old vine in the rainforest, laughing and waving, little kids, their wooden sign, sunny'),
    'gruntlewick': ('village', [(lambda: cel('tc.announce'), .5, .5, False)],
                    'an old marmoset town crier with a white beard reading from a scroll in the tree village, finishing his announcement, proud'),
    'mailman': ('village', [(lambda: cel('po.offer_parcel'), .5, .5, False)],
                'a sloth mail carrier with a cap and a mail bag handing over a parcel in the tree village, smiling'),
    'pell': ('cookhouse', [(lambda: cel('lp.sew_table'), .5, .5, False)],
             'a sloth lieutenant in his own little tailor shop, sewing at the counter, a measuring tape round his neck, warm lamp light, content'),
    'flicker': ('cookhouse', [(lambda: flicker('glow_00'), .5, .14, False, .52)],
                'a small glowing firefly hovering steady over a wooden shop counter, warm steady light, a quiet tailor shop at night'),
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

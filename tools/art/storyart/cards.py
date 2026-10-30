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


def cups():
    """two used teacups on saucers, a ring of tea in each and steam, big for the foreground"""
    from PIL import ImageDraw
    im = Image.new('RGBA', (520, 260), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for cx in (130, 390):
        d.ellipse((cx - 110, 190, cx + 110, 240), fill=(240, 236, 226, 255), outline=(70, 55, 50, 255), width=5)
        d.polygon([(cx - 75, 110), (cx + 75, 110), (cx + 55, 205), (cx - 55, 205)], fill=(246, 242, 232, 255), outline=(70, 55, 50, 255))
        d.ellipse((cx - 75, 96, cx + 75, 126), fill=(150, 95, 50, 255), outline=(70, 55, 50, 255), width=4)
        d.arc((cx + 55, 125, cx + 105, 180), -90, 90, fill=(70, 55, 50, 255), width=10)
        for k in range(2):
            d.arc((cx - 30 + k * 28, 10, cx + 10 + k * 28, 95), 200, 340, fill=(235, 235, 235, 200), width=6)
    return im


def sign(crooked=False, letters=True):
    """a hand-made wooden sign on a post (scribbled strokes for its lettering), crooked if asked"""
    from PIL import ImageDraw
    im = Image.new('RGBA', (420, 460), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if not crooked:
        d.rectangle((195, 160, 225, 460), fill=(110, 75, 45, 255), outline=(55, 35, 20, 255), width=4)
    d.rounded_rectangle((20, 30, 400, 190), radius=14, fill=(186, 140, 92, 255), outline=(70, 45, 25, 255), width=7)
    if letters:
        for row in (75, 130):
            x = 50
            while x < 360:
                w = 18 + (x * 7) % 26
                d.line([(x, row + 12), (x + w // 2, row - 14), (x + w, row + 12)], fill=(60, 38, 22, 255), width=7)
                x += w + 16
    if crooked:
        d.line([(80, 30), (130, -2)], fill=(80, 70, 60, 255), width=5); d.line([(340, 30), (300, -2)], fill=(80, 70, 60, 255), width=5)
        im = im.rotate(-9, resample=Image.BICUBIC, expand=True)
    return im


def lunch():
    """half a lunch left on a leaf"""
    from PIL import ImageDraw
    im = Image.new('RGBA', (300, 140), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((10, 40, 290, 130), fill=(92, 150, 70, 255), outline=(40, 70, 30, 255), width=5)
    d.line([(20, 85), (280, 85)], fill=(50, 90, 40, 255), width=3)
    d.pieslice((70, 30, 220, 120), 180, 360, fill=(214, 160, 90, 255), outline=(90, 60, 30, 255), width=4)
    for x in (110, 150):
        d.ellipse((x, 50, x + 22, 72), fill=(200, 60, 60, 255), outline=(90, 30, 30, 255), width=3)
    return im


def glow(cv, cx, cy, r, rgb=(255, 214, 120)):
    """a warm pool of light painted onto the start (the firefly's light over the counter)"""
    import numpy as np
    a = np.asarray(cv).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    k = np.clip(1 - np.hypot(xx - cx * W, (yy - cy * H) * 1.3) / (r * W), 0, 1) ** 1.6
    a[..., :3] = a[..., :3] * (0.32 + 0.68 * k[..., None]) + np.array(rgb) * 0.85 * k[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def trim(im):
    b = im.split()[3].point(lambda v: 255 if v > 10 else 0).getbbox()
    return im.crop(b) if b else im


def place(cv, im, cx, height, flip=False, foot=GROUND, y=None, crop_top=0.0):
    im = trim(im)
    if crop_top:
        im = trim(im.crop((0, round(im.height * crop_top), im.width, im.height)))
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


CARDS.update({
    'crocus-rex': (2, [(lambda: sprite(E + 'croc-atlas.webp', 'crocAtlasData.ts', 'idle'), .5, .26, False, .9), (lambda: cel('mb.idle'), .4, .2, False, .79),
                       (lambda: cel('po.carry_stand'), .5, .22, False, .79), (lambda: cel('tc.hat_stand'), .6, .22, False, .79)],
                   'a big crocodile with a crooked little crown swimming gently across the calm blue river like a ferry, three small villagers clearly riding on his back, a little sloth, a sloth mail carrier and an old marmoset, the tree village on the far bank, sunny'),
    'magma-drake': (9, [(lambda: sprite(E + 'drake-atlas.webp', 'drakeAtlasData.ts', 'idle'), .64, .42, True), (lambda: cel('db.side_by_side'), .36, .44, False), (lambda: cups(), .5, .2, False, .99)],
                    'a red dragon by the volcano with two young sloths visiting, a girl sloth in a pink headband and a boy sloth with a satchel, in the front two used teacups on saucers with a ring of tea in each and steam rising, his cave swept tidy, warm glow'),
    'night-wing-monarch': (8, [(lambda: sprite(E + 'monarch-atlas.webp', 'monarchAtlasData.ts', 'perched'), .6, .3, True, .84, None, .22), (lambda: hd('pokey', 'talk_b'), .4, .44, False)],
                           'a huge night butterfly monarch resting on a mossy branch under the moon writing in a little book, a young sloth beside her telling her how a dream ended, fireflies'),
    'squirrels': (1, [(lambda: sign(), .64, .4, False), (lambda: squirrel('laughing'), .4, .3, False), (lambda: squirrel('kids'), .5, .18, False)],
                  'a family of red squirrels under the old vine proudly pointing at their new hand-made wooden sign on a post, the sign painted with rough hand lettering, little kids cheering, sunny rainforest'),
    'flicker': ('cookhouse', [(lambda: flicker('glow_00'), .5, .2, False, .5)],
                'a small firefly glowing bright warm yellow over a wooden shop counter at night, his glow the only light, a warm steady pool of golden light on the counter, the rest of the shop dark and cosy'),
    'mailman': (1, [(lambda: cel('po.walk_parcel'), .5, .5, False)],
                'a sloth mail carrier with a cap and a mail bag walking slowly along a forest road carrying a parcel very carefully and seriously in both arms, taking his time, morning light'),
    'pell': ('cookhouse', [(lambda: sign(crooked=True, letters=True), .5, .3, False, .34), (lambda: cel('lp.sew_table'), .5, .48, False),
                           (lambda: sprite(E + 'guard-atlas.webp', 'guardAtlasData.ts', 'sit1'), .23, .26, False), (lambda: squirrel('laughing'), .78, .24, False)],
             'a sloth lieutenant in his own little tailor shop sewing at the counter, a crooked wooden shop sign hanging askew above him, customers waiting happily, warm daylight, a busy friendly shop'),
    'stone-golem': ('ruins', [(lambda: sprite(E + 'queen-atlas.webp', 'queenAtlasData.ts', 'idle2'), .22, .13, False, .7), (lambda: sprite(E + 'drake-atlas.webp', 'drakeAtlasData.ts', 'idle'), .35, .14, False, .68),
                              (lambda: sprite(E + 'prowler-atlas.webp', 'prowlerAtlasData.ts', 'curl'), .65, .11, True, .68), (lambda: sprite(E + 'venom-atlas.webp', 'venomAtlasData.ts', 'n_idle'), .78, .14, True, .7),
                              (lambda: sprite(E + 'golem-atlas.webp', 'golemAtlasData.ts', 'idle'), .5, .36, False)],
                    'a mossy stone golem speaking slowly at a council in the ancient ruins, the other forest guardians sitting on the stone chairs around him listening patiently, a tarantula queen, a red dragon, a black panther and a green snake with a crown, sun through the trees'),
    'marsh-reaver': (6, [(lambda: sprite(E + 'reaver-atlas.webp', 'reaverAtlasData.ts', 'idle'), .44, .4, False), (lambda: lunch(), .6, .1, False, .86)],
                     'a big marsh creature sitting contentedly on a mangrove root beside a forest path at bright noon, half of his lunch left on a leaf on the root facing the path for a passer-by, sunlight through the mangroves, clean clear water'),
})


def main():
    want = sys.argv[1:] or list(CARDS)
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for k in want:
        world, figs, words = CARDS[k]
        cv = backdrop(world)
        if k == 'marsh-reaver':
            # (his line is noon: the mangrove backdrop is a storm-grey one, so the start is lifted to daylight)
            from PIL import ImageEnhance
            cv = ImageEnhance.Brightness(ImageEnhance.Color(cv.convert('RGB')).enhance(1.25)).enhance(1.35).convert('RGBA')
        for fig in figs:
            fn, x, h, fl = fig[:4]
            extra = list(fig[4:]) or ([PLATE_FOOT] if isinstance(world, str) else [])
            place(cv, fn(), x, h, fl, *extra)
        if k == 'flicker':
            cv = glow(cv, .5, .55, .32)

        cv.convert('RGB').save(OUT / f'card-{k}.png')
        meta[k] = {'world': world, 'words': words}
        print(k)
    old = json.loads((OUT / 'meta-cards.json').read_text()) if (OUT / 'meta-cards.json').exists() else {}
    old.update(meta)
    (OUT / 'meta-cards.json').write_text(json.dumps(old, indent=1))


if __name__ == '__main__':
    main()

"""Face check: each story character's new story paintings next to the game's own sprite of them (the stage frame the player knows), heads
cropped big, on dark and on mid-grey. -> reference/prop-sheets/qa-notes/story-art/face-check.jpg

    python3 -I tools/art/storyart/facecheck.py
"""
import json, re
from pathlib import Path
from PIL import Image, ImageDraw

REPO = Path(__file__).resolve().parents[3]


def table(path, var):
    src = (REPO / path).read_text()
    i = src.index(var)
    j = src.index('{', src.index('=', i))
    depth, k = 0, j
    while True:
        depth += src[k] == '{'
        depth -= src[k] == '}'
        k += 1
        if depth == 0:
            break
    js = re.sub(r"([{,]\s*)'?([A-Za-z_][A-Za-z0-9_.]*)'?\s*:", r'\1"\2":', src[j:k])
    js = re.sub(r":\s*'([^']*)'", r': "\1"', js)
    return json.loads(re.sub(r",\s*}", "}", js))


def crop(atlas, f, head=0.55):
    im = Image.open(REPO / atlas).convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    return im.crop((0, 0, im.width, max(1, round(im.height * head))))


def main():
    rows = []
    std = table('src/game/heroStandardData.ts', 'STD_FRAMES')
    hd = table('src/game/storyHdData_pokey.ts', 'HD_POKEY_FRAMES')
    rows.append(('Pokey', crop('src/assets/hero/hero-standard.webp', std['idle']),
                 [crop(f'src/assets/story/hd/pokey-{hd[n]["p"]}.webp', hd[n]) for n in ('idle', 'talk_a', 'worried', 'happy' if 'happy' in hd else 'thumbs') if n in hd]))
    mf = table('src/game/meecaStandardData.ts', 'MEECA_FRAMES')
    mh = table('src/game/storyHdData_meeca.ts', 'HD_MEECA_FRAMES')
    rows.append(('Meeca', crop('src/assets/characters/meeca-standard.webp', mf['idle']),
                 [crop(f'src/assets/story/hd/meeca-{mh[n]["p"]}.webp', mh[n]) for n in ('idle', 'glad', 'sad', 'sing') if n in mh]))
    df = table('src/game/dotAtlasData.ts', 'DOT_FRAMES')
    dh = table('src/game/storyHdData_dot.ts', 'HD_DOT_FRAMES')
    rows.append(('Dot', crop('src/assets/characters/dot-atlas.webp', df['perch'], 1), [crop(f'src/assets/story/hd/dot-{dh[n]["p"]}.webp', dh[n], 1) for n in ('perch', 'fly0', 'yelp', 'sad') if n in dh]))
    cels = table('src/game/storyCelData.ts', 'CELS')
    ic = json.JSONDecoder().raw_decode((REPO / 'src/game/ironclawAtlasData.ts').read_text().split('IRONCLAW_FRAMES')[1].split('= ', 1)[1])[0]
    pick = lambda ks: [crop(f'src/assets/characters/cels-{cels[k]["a"]}.webp', cels[k]) for k in ks if k in cels]
    rows.append(('General', crop('src/assets/enemies/ironclaw-atlas.webp', ic['idle']), pick(['gn.card_idle', 'gn.ready_a', 'gn.shut', 'gv.stand', 'gv.sorrow', 'gy.stand'])))
    rows.append(('Meeca (story sheets)', crop('src/assets/characters/meeca-standard.webp', mf['idle']), pick(['pk.stand_wait', 'pk.happy_tears', 'pk.holler', 'face.beam'])))
    rows.append(('Pokey (story sheets)', crop('src/assets/hero/hero-standard.webp', std['idle']), pick(['mc.sing_reach', 'mx.petal_glow', 'mx.kneel_sad', 'mc.grip_wall', 'mc.reach_back'])))
    rows.append(('Grandma / Pell / crier / mail', None, pick(['gr.stand_hands', 'gr.laugh', 'lp.stand_worry', 'lp.hopeful', 'tc.scroll', 'po.carry_stand'])))
    H = 230
    S = Image.new('RGB', (1900, len(rows) * (H + 30) + 30), (24, 28, 32))
    d = ImageDraw.Draw(S)
    d.text((10, 8), 'face check: the game sprite (left, framed) and the new story paintings, heads cropped', fill=(255, 230, 0))
    for r, (name, game, news) in enumerate(rows):
        y = 30 + r * (H + 30)
        d.text((10, y), name, fill=(230, 230, 230))
        x = 10
        for i, im in enumerate(([game] if game else []) + news):
            im = im.copy()
            im.thumbnail((240, H))
            bg = (24, 28, 32) if i % 2 == 0 else (128, 128, 128)
            cell = Image.new('RGBA', (im.width + 8, H), bg + (255,))
            cell.alpha_composite(im, (4, H - im.height))
            S.paste(cell.convert('RGB'), (x, y + 16))
            if game and i == 0:
                d.rectangle([x - 2, y + 14, x + cell.width + 1, y + 17 + H], outline=(255, 200, 0), width=2)
            x += cell.width + 10
    out = REPO / 'reference/prop-sheets/qa-notes/story-art/face-check.jpg'
    S.save(out, quality=86)
    print(out)


if __name__ == '__main__':
    main()

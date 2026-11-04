"""R-159.1 show-first boards (w8-rope2, 2026-11-04): the beats mock-triangle.mjs shot in the real game, laid out one board per move, upright
and sideways, with a plain caption under each beat. The two things that have no art yet (the vine snake, the rolled boa) are pasted up from
the game's own atlas frames (the gold snake's prowl, the boa's coil) and stamped PASTE-UP, so nobody mistakes them for finished art.

    python3 -I tools/art/combat/compose.py <shots dir> <out dir>
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
SHOTS, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def font(size):
    try:
        return ImageFont.truetype(FONT, size)
    except OSError:
        return ImageFont.load_default()


def frame(data_ts, atlas, name):
    """one frame cut from a creature atlas, by the rect in its *AnimData.ts"""
    src = (ROOT / 'src/game' / data_ts).read_text()
    m = re.search('"%s": (\\{[^}]*\\})' % re.escape(name), src)
    r = json.loads(m.group(1))
    return Image.open(ROOT / 'src/assets/enemies' / atlas).convert('RGBA').crop((r['x'], r['y'], r['x'] + r['w'], r['y'] + r['h']))


SNAKE = frame('goldsnakeAnimData.ts', 'goldsnake-anim.webp', 'prowl_10')
COIL = frame('boaAnimData.ts', 'boa-anim.webp', 'coil_00')


def stamp(img, text, xy, size):
    d = ImageDraw.Draw(img)
    f = font(size)
    x, y = xy
    w = d.textlength(text, font=f)
    d.rounded_rectangle((x - 10, y - 6, x + w + 10, y + size + 10), 8, fill=(180, 30, 30, 235))
    d.text((x, y), text, font=f, fill=(255, 255, 255))


def paste(base, sprite, cx, feet, scale, angle=0, alpha=1.0):
    s = sprite.resize((max(1, int(sprite.width * scale)), max(1, int(sprite.height * scale))), Image.LANCZOS)
    if angle:
        s = s.rotate(angle, expand=True, resample=Image.BICUBIC)
    if alpha < 1:
        a = s.getchannel('A').point(lambda v: int(v * alpha))
        s.putalpha(a)
    base.alpha_composite(s, (int(cx - s.width / 2), int(feet - s.height)))


def shot(name, tag):
    src = 'kick-1-coil' if name == 'kick-1-coil-armour' else name
    return Image.open(SHOTS / f'{src}-{tag}.png').convert('RGBA')


def pasteups(name, tag, img):
    W, H = img.size
    side = tag == 'side'
    if name == 'kick-4-roll-bg':
        # the kicked boa rolls along the branch, off its end and down onto the snake on the ledge below: three ghosts of one ball, on
        # the ground at each point (the branch top, the drop, the lower ledge), turning as it goes. The coil frame is squeezed round.
        ball = COIL.resize((COIL.height, COIL.height), Image.LANCZOS)
        if side:
            path = [(0.45, 0.66, 0, 0.4), (0.58, 0.72, -140, 0.65), (0.75, 0.795, -280, 1.0)]
            k = 0.85
        else:
            path = [(0.45, 0.575, 0, 0.4), (0.70, 0.575, -140, 0.65), (0.90, 0.70, -280, 1.0)]
            k = 0.95
        for fx, fy, a, al in path:
            paste(img, ball, W * fx, H * fy, k, a, al)
        stamp(img, 'PASTE-UP: the rolled boa (art to make)', (W * 0.04, H * 0.2), 30 if side else 24)
    if name == 'vine-1-lianas':
        # a vine snake hanging head-down among the lianas, its tail running up off the top of the screen as theirs do
        k = 0.95 if side else 0.8
        rot = SNAKE.resize((int(SNAKE.width * k), int(SNAKE.height * k)), Image.LANCZOS).rotate(-90, expand=True, resample=Image.BICUBIC)
        # (upright the HUD band is the top ~12%: the snake hangs from just under it, beside the liana that comes into view there)
        img.alpha_composite(rot, (int(W * (0.56 if side else 0.72) - rot.width / 2), int(H * (0.2 if side else 0.13))))
        stamp(img, 'PASTE-UP: the vine snake (art to make)', (W * 0.04, H * 0.2), 30 if side else 24)
    if name == 'kick-1-coil-armour':
        # the armoured coil, read by shape: glints on the boa's coil (a small code touch), stamped as a paste-up of the look to make
        d = ImageDraw.Draw(img)
        cx, cy = W * (0.535 if side else 0.5), H * (0.6 if side else 0.555)
        for dx, dy, r in [(-0.03, -0.01, 16), (0.02, -0.025, 11), (0.035, 0.008, 8)]:
            x, y = cx + W * dx, cy + H * dy
            rr = r * (1 if side else 1.4)
            d.polygon([(x, y - rr), (x + rr * 0.25, y - rr * 0.25), (x + rr, y), (x + rr * 0.25, y + rr * 0.25), (x, y + rr), (x - rr * 0.25, y + rr * 0.25), (x - rr, y), (x - rr * 0.25, y - rr * 0.25)], fill=(255, 255, 235, 240))
        stamp(img, 'PASTE-UP: the armoured coil look (tight coil + glint)', (W * 0.04, H * 0.2), 28 if side else 22)
    return img


BOARDS = {
    'stomp-vaults': [
        ('stomp-1-approach', 'A snake sits on the lip of a gap too wide to jump.'),
        ('stomp-2-land-on-it', 'Land on it: a stomp.'),
        ('stomp-3-vault', 'Hold jump: the stomp bounces him high, over the gap.'),
        ('stomp-4-across', 'Across. (Easy: a soft pit under every vault.)'),
    ],
    'punch-stuns': [
        ('punch-1-tell', 'The tell: it rears and sways for half a second.'),
        ('punch-2-punch', 'Punch it in the tell...'),
        ('punch-3-dazed', '...dazed about 1.5 s (needs a clearer look).'),
        ('punch-4-past', 'Walk past, or finish it with a second hit.'),
    ],
    'kick-breaks-and-bowls': [
        ('kick-1-coil', 'The boa coils: armour. Its coil tightens before it strikes.'),
        ('kick-2-stomp-bounces', 'A stomp bounces off ("ARMORED!"); a punch: "TOUGH!"'),
        ('kick-3-kick', 'A kick breaks the coil...'),
        ('kick-4-roll-bg', '...and it rolls off the branch and bowls over the snake below (in a stage, a switch waits at the end).'),
    ],
    'armour-by-shape': [
        ('kick-1-coil', 'Today: the coiled boa looks like any boa. "TOUGH!" would be the first the player learns of its armour.'),
        ('kick-1-coil-armour', 'To make: a tight coil with a glint, so it reads as armour before he touches it.'),
    ],
    'vine-snake': [
        ('vine-1-lianas', 'The vine snake hangs among the lianas. Grab it: a bite. Punch it: it stiffens into a pole.'),
    ],
}

for board, beats in BOARDS.items():
    for tag in ('side', 'up'):
        tiles = []
        for name, cap in beats:
            img = pasteups(name, tag, shot(name, tag))
            img = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
            capf = font(17 if tag == 'side' else 15)
            # caption under the picture, wrapped
            words, lines, line = cap.split(), [], ''
            d0 = ImageDraw.Draw(img)
            for w in words:
                t = (line + ' ' + w).strip()
                if d0.textlength(t, font=capf) > img.width - 20:
                    lines.append(line)
                    line = w
                else:
                    line = t
            lines.append(line)
            capH = 14 + len(lines) * 22
            tile = Image.new('RGBA', (img.width, img.height + capH), (24, 30, 24, 255))
            tile.alpha_composite(img, (0, 0))
            d = ImageDraw.Draw(tile)
            for i, l in enumerate(lines):
                d.text((10, img.height + 8 + i * 22), l, font=capf, fill=(240, 236, 220))
            tiles.append(tile)
        cols = (2 if len(tiles) > 1 else 1) if tag == 'side' else len(tiles)
        rows = (len(tiles) + cols - 1) // cols
        tw = max(t.width for t in tiles)
        th = max(t.height for t in tiles)
        title_h = 54
        sheet = Image.new('RGBA', (max(cols * tw + (cols + 1) * 12, 1180), rows * th + (rows + 1) * 12 + title_h), (14, 18, 14, 255))
        ImageDraw.Draw(sheet).text((14, 14), f'R-159.1 show-first: {board.replace("-", " ")} ({"sideways" if tag == "side" else "upright"}; real game, existing frames)', font=font(22), fill=(253, 230, 138))
        for i, t in enumerate(tiles):
            sheet.alpha_composite(t, (12 + (i % cols) * (tw + 12), title_h + 12 + (i // cols) * (th + 12)))
        sheet.convert('RGB').save(OUT / f'{board}-{tag}.jpg', quality=88)
        print(OUT / f'{board}-{tag}.jpg')

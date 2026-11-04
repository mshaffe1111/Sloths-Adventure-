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


def kit(name):
    """one piece of the puzzle kit (puzzle-kit.webp, puzzleAtlasData.ts KIT_ART)"""
    src = (ROOT / 'src/game/puzzleAtlasData.ts').read_text()
    m = re.search(r'%s: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)' % re.escape(name), src)
    x, y, w, h = map(int, m.groups())
    return Image.open(ROOT / 'src/assets/props/puzzle-kit.webp').convert('RGBA').crop((x, y, x + w, y + h))


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
    if name == 'kick-5-switch-bg':
        # the rolled boa stops on the World 1 kit's log plate (pressed, glowing) and the woven gate beyond stands open: the way on.
        # Kit art already packed; the ball is the paste-up still to paint
        g, pl = (0.82, (0.62, 1.55, 0.78, 1.5, 0.85)) if side else (0.67, (0.52, 1.9, 0.84, 1.75, 1.0))
        px_, ps, gx, gs, bk = pl
        plate = kit('platePressed')
        paste(img, plate, W * px_, H * g + 6, ps)
        ball = COIL.resize((COIL.height, COIL.height), Image.LANCZOS)
        paste(img, ball, W * px_, H * g - plate.height * ps * 0.45, bk, -30)
        paste(img, kit('gateOpen'), W * gx, H * g + 4, gs)
        stamp(img, 'PASTE-UP: the ball (art to make) on the kit plate; the gate opens', (W * 0.04, H * 0.2), 26 if side else 19)
    if name in ('punch-3-dazed', 'punch-4-past'):
        # the stun's look (the lead's call: circling stars, a small code touch), stamped as a paste-up of code still to write; beat 4 is
        # the last 0.3 s, when they flicker
        import math
        flick = name == 'punch-4-past'
        # (over the snake's head, where it lies in each beat)
        cx, cy = (W * (0.335 if flick else 0.515), H * 0.6) if side else (W * (0.36 if flick else 0.6), H * 0.585)
        rx, ry = (26, 8) if side else (24, 7)
        d = ImageDraw.Draw(img)
        for i in range(5):
            if flick and i % 2:
                continue
            a = i * 2 * math.pi / 5 + 0.4
            x, y = cx + rx * 2 * math.cos(a), cy - 62 + ry * 2 * math.sin(a)
            r = 17 * (0.75 if flick else 1)
            pts = []
            for k in range(10):
                rr = r if k % 2 == 0 else r * 0.42
                aa = -math.pi / 2 + k * math.pi / 5
                pts.append((x + rr * math.cos(aa), y + rr * math.sin(aa)))
            d.polygon(pts, fill=(255, 226, 90, 150 if flick else 255), outline=(120, 70, 10, 255))
        stamp(img, 'PASTE-UP: the stun stars (code to write)' + (' - flickering, last 0.3 s' if flick else ''), (W * 0.04, H * 0.2), 26 if side else 20)
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
        # one ball, with a short smear behind it, at the drop off the branch's end (the camera runs ahead of it)
        fx, fy, a, al = path[1]
        for t in range(5, 0, -1):
            paste(img, ball, W * (fx - 0.025 * t), H * (fy - 0.012 * t), k, a + 40 * t, 0.12)
        paste(img, ball, W * fx, H * fy, k, a, 1.0)
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
        ('stomp-1-approach', 'A snake sits on the lip of a gap plainly wider than any jump. The petals start at the snake.'),
        ('stomp-2-land-on-it', 'Land on it: a stomp.'),
        ('stomp-3-vault', 'Hold jump: the stomp bounces him high, along the petal arc, over the gap.'),
        ('stomp-4-across', 'Across. (Easy: a soft pit under every vault.)'),
    ],
    'punch-stuns': [
        ('punch-1-tell', 'The tell: it rears and sways for half a second.'),
        ('punch-2-punch', 'Punch it in the tell...'),
        ('punch-3-dazed', '...dazed 1.5 s: circling stars over its head the whole time.'),
        ('punch-4-past', 'The last 0.3 s the stars flicker: it is waking. Walk past, or finish it with a second hit.'),
    ],
    'kick-breaks-and-bowls': [
        ('kick-1-coil', 'The boa coils: armour (the tight, glinting coil is on the picture list). Its coil tightens before it strikes.'),
        ('kick-2-stomp-bounces', 'A stomp bounces off ("ARMORED!"); a punch: "TOUGH!"'),
        ('kick-3-kick', 'A kick breaks the coil...'),
        ('kick-4-roll-bg', '...and it rolls off the branch, the camera running ahead of it, and bowls over the snake below...'),
        ('kick-5-switch-bg', '...onto the switch: the plate glows and the gate swings open. In 1-9 that is the way toward Venom Fang.'),
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

"""before/after sheet: python3 ba.py <dir> <stage-x> <out.jpg>: sideways before over after on the left, upright before | after on the right"""
import sys
from PIL import Image, ImageDraw
d, k, out = sys.argv[1:4]
L = lambda t, o: Image.open(f'{d}/{t}-{k}-{o}.jpg').convert('RGB')
bs, as_, bu, au = L('before', 'side'), L('after', 'side'), L('before', 'up'), L('after', 'up')
sc = 0.5
bs, as_ = [i.resize((int(i.width * sc), int(i.height * sc))) for i in (bs, as_)]
uh = bs.height * 2 + 20
bu, au = [i.resize((int(i.width * uh / i.height), uh)) for i in (bu, au)]
S = Image.new('RGB', (bs.width + bu.width * 2 + 30, uh + 30), (16, 16, 16)); dr = ImageDraw.Draw(S)
S.paste(bs, (0, 26)); S.paste(as_, (0, 26 + bs.height + 20)); S.paste(bu, (bs.width + 10, 26)); S.paste(au, (bs.width + bu.width + 20, 26))
dr.text((4, 6), f'{k}  sideways: BEFORE (top) / AFTER (bottom)', fill=(255, 255, 0)); dr.text((bs.width + 14, 6), 'upright: BEFORE | AFTER', fill=(255, 255, 0))
S.save(out, quality=85)

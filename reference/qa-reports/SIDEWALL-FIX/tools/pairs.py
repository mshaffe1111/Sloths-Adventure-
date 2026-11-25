import json, sys, os
from PIL import Image, ImageDraw
S, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
B = json.load(open(f'{S}/shots-before/boxes.json')); A = {r['file'].split('/')[-1]: r for r in json.load(open(f'{S}/shots-after/boxes.json'))}
for r in B:
  n = r['file'].split('/')[-1]
  if n not in A: continue
  ims = []
  for side, rr in (('before', r), ('after', A[n])):
    im = Image.open(rr['file']).convert('RGB'); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 150, 18], fill=(0, 0, 0)); d.text((4, 4), f"{side} {rr['stage']} {rr.get('diff')}", fill=(255, 255, 255))
    ims.append(im)
  # the same frame with the collider in magenta (after)
  c = ims[1].copy(); d = ImageDraw.Draw(c); b = A[n]['screenBox']
  d.rectangle([b['x'], b['y'], b['x'] + b['w'], b['y'] + b['h']], outline=(255, 0, 255), width=2)
  ims.append(c)
  W = sum(i.width for i in ims) + 20; H = ims[0].height
  cv = Image.new('RGB', (W, H), (255, 255, 255)); x = 0
  for i in ims: cv.paste(i, (x, 0)); x += i.width + 10
  cv.save(f'{out}/{n}')
print('ok')

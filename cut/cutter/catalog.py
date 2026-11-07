import sys, json, csv, collections
ROOT = sys.argv[1]; OUT = ROOT + '/artcut'
d = json.load(open(OUT + '/_build.json')); kept, rej = d['kept'], d['rej']
ORDER = ['walkable log', 'plank', 'bough', 'stump-step', 'rock (grounded)', 'floating earth island (FLOAT CANDIDATE)',
         'pit wall or lip', 'bush', 'fern', 'vine', 'hide spot', 'cave', 'thorn hazard', 'water band', 'ground band', 'decor', 'other']
def walkcell(r):
    if r.get('walk_y', '') == '': return '', ''
    return str(r['walk_y']), f"{r['walk_x0']}-{r['walk_x1']}"
with open(OUT + '/catalog.csv', 'w', newline='') as f:
    wr = csv.writer(f)
    wr.writerow(['id', 'source_sheet', 'width_px', 'height_px', 'kind', 'world_fit', 'walk_top_y_px', 'walk_top_x_span_px', 'notes', 'file'])
    for r in kept:
        y, sp = walkcell(r)
        wr.writerow([r['id'], r['sheet'], r['w'], r['h'], r['kind'], r['world'], y, sp, r['notes'], f"kept/{r['id']}.png"])
cnt = collections.Counter(r['kind'] for r in kept)
w1 = collections.Counter(r['kind'] for r in kept if r['world'] in ('W1', 'both'))
L = []
A = L.append
A('# Art cut catalog: World 1 and World 2 sheets (Nov 2026 batch)\n')
A(f'50 sheets in, **{len(kept)} pieces kept**, {len(rej)} cuts rejected ({sum(1 for r in rej if r['sheet'] in ('W1-01','W1-11','W1-15','W1-28','W1-29','W1-30'))} of them from the 6 rejected whole sheets, {sum(1 for r in rej if r['reason'].startswith('re-roll'))} only for being under 600 px). Every kept piece is a full-resolution transparent PNG in `kept/`, trimmed to its bounds, keyed from its own sheet background, de-fringed, with a 1-2 px feathered edge. `catalog.csv` has one row per kept piece; `sheets/*.jpg` are the contact sheets by kind (cyan line = measured flat walkable top); `rejected/` holds every rejected cut and `sheets/rejected.jpg` shows them with reasons; `checks/` holds the QA renders of every cut on dark grey and on light.\n')
A('## Summary\n')
A('### Counts per kind (kept)\n')
A('| Kind | Kept | Usable in W1 (W1 or both) |')
A('|---|---|---|')
for k in ORDER:
    if cnt[k]: A(f'| {k} | {cnt[k]} | {w1[k]} |')
A(f'| **total** | **{len(kept)}** | **{sum(w1.values())}** |\n')
A('''### What this adds against the World 1 gaps

- **Logs and planks to land on (the biggest need): filled.** 15 painted W1 walkable logs, at full size and with a measured flat top: W1-17-a/b, W1-19-a, W1-20-a/b, W1-21-a/b, W1-22-a/b/c/d, W1-26-a/b, W1-27-a/b. The flattest, cleanest tops are W1-26-a, W1-27-a/b and W1-17-b (flat run 54-94% of the width). Add W1-25-a (a long beam) and W1-24-a (a plank stack), and three W2 logs that fit both worlds (W2-06-b, W2-07-b, plus W2-20-b as a ramp). Watch-outs: W1-19-a/W1-20-a have puffballs sticking up through the walk line, and W1-22-c/d slope down to the right. 4 boughs (W1-19-b, W1-20-c, W2-19-a/c) are curved and work as decor or sloped perches, not flat floors.
- **Stumps and root steps at set heights: mostly filled.** Low: W1-10-a, W1-23-a. Medium: W1-10-e, W1-24-b (log rounds at three heights). Tall/big: W1-12-a, W1-13-a, W1-14-b. Pillars: W1-09-e, W1-09-j. Built-in stairs: W1-16-a (stone-and-root ruin) and W2-09-a (natural rock steps). **Gap:** there is still no true **root step** (a root arch or knee you step up onto), and the mid-size stumps on W1-09 and W1-10 (b, c, d, f) all came out under 600 px.
- **Pit floors and lips: barely touched.** One piece only: W1-02-a, a double U pit wall with lips and a log rail (W1-01 is the same art but broken). There is **no pit floor, no separate left or right lip end cap, and no single-pit piece**.
- **Full-size rocks: partly filled, mostly by World 2 art.** W2-08-a/b and W2-09-a/b are big grounded rocks (1135-1201 px) that are tagged "both". W1-16-a is the only W1-sheet rock. Every W1 rock and boulder (W1-10-b, d, f, g; W1-09-k, l) and every W2-03 rock is under 600 px, so all are "re-roll larger".

### Still missing (next picture list)

1. Pit pieces: a pit floor (mud, leaves or roots), left and right lip end caps, and a single narrow pit.
2. Root steps: root arches or knees at 2-3 heights.
3. Full-size W1 grounded rocks and boulders: re-roll W1-10-g, W1-10-b/d/f and W1-09-k/l larger (each at least 600 px, ideally 1000+).
4. Mid-size stumps at 600+ px: re-roll the W1-09 stump row (a-d, f, g, i) larger.
5. A W1 ground or dirt band: W1-23-c was the only one, and it is blurry.
6. W1 hazards: every thorn and water piece came from W2 sheets. Thorns are tagged "both", but W1 has no hazard art of its own (water, pits, thorns are Matt's painted-art rule).
7. W1 hide spots: only the hollow log W1-21-a could double as one. The real hide spots and caves are on W2 sheets.
8. The whole W2-01/02/03 prop sets (bridges, scaffolds, ladders, cairns, lily pads, palisade): all under 600 px. Re-roll the wanted ones one or two per sheet.

### Float candidates, for Matt's "can it float?" rating

| id | size | what it is | flat top |
|---|---|---|---|''')
for r in kept:
    if 'FLOAT' in r['kind']:
        y, sp = walkcell(r)
        A(f"| {r['id']} | {r['w']}x{r['h']} | {r['notes'].split(' Walk top')[0]} | {('y ' + y + ', x ' + sp) if y else 'set by hand'} |")
A('\nSee `sheets/float.jpg`. No floating rock or stone was kept: the two floating stone pieces (W2-02-b, W2-02-e) are rejected.\n')
A('''### Rejected

**Whole sheets:**
- W1-01: a magenta wash is baked into the art (W1-02 is the clean twin).
- W1-11 and W1-15: blurry, confirmed. Their sharpness score is 0.14-0.57 against 1.4-3+ for good sheets.
- W1-28, W1-29 and W1-30: different style, confirmed. They are a bright, flat, lime-green cartoon tileset with thick black outlines, clearly not the painted look, and every tile is under 600 px anyway.

**Other rejects:**
- Blurry or ghosted: W1-23-c, W2-19-b, W2-02-l/m/n/o.
- Junk haze: W1-14-a.
- Duplicate: W1-23-b.
- Characters: W1-09-h, W1-10-h, W2-12-c.
- Floating rocks: W2-02-b and W2-02-e.
- The broken W2-03 collage strip (W2-03-k).
- W2-01 collage artifacts: n, p and q.
- Everything else (most of W1-09, W1-10, W2-01, W2-02 and W2-03) is under 600 px: "re-roll larger".

The full list is below.

### How the cuts were made and checked

- **Keying:** by colour distance (CIE Lab) from each sheet's own background. The background was sampled from the border and modelled locally on a 48 px grid, so gradient and vignette sheets key evenly. W1-09's grey background and the muted mauve W2 sheets work the same way.
- **Edges:** a known-foreground matting pass un-mixes the edge pixels. Then a 1 px erosion on the pure-magenta sheets, magenta despill in a 3-6 px edge band, colour extension under the soft edge, and a 0.85 px gaussian feather.
- **Shadows:** cast shadows tinted with the background (W1-26/27, the W2 bushes and caves) are keyed out.
- **Holes:** enclosed pockets of background are cut through (bramble lattices, twig piles, spike trunks, fern gaps). Purple mushrooms (W1-04/05), pink ferns (W1-02), orchids (W1-26-b, W2-20-a) and pale pink mushrooms (W1-21-c/d) were checked by eye and kept whole.
- **QA:** every cut was rendered on dark grey and on light (`checks/`), and suspect spots were looked at 1:1. An automatic scan for magenta pixels was run too: what it found on the kept pieces is real pink or purple flowers and mushrooms only.
- **Known soft spots, named honestly:**
  - The fine spike tips on W2-14-c and W2-15-a are thin and soft.
  - W2-15-b's nettle has purple-grey back leaves (painted that way).
  - W1-21-c/d mushroom stems keep a faint magenta tint at their base, from the source.
  - The water panels have straight cut sides; trim 2-3 px and use a hard edge when tiling.
- **Walkable top:** `walk_top_y_px` is the y of the top silhouette, measured from the top of the cut. `walk_top_x_span_px` is the longest near-flat run of that silhouette. Short protrusions such as mushrooms are allowed; drops are not. For 3/4-view tops (stump faces, slab tops) the standing line can sit a little lower, inside the visible top face. Pieces marked "set by hand" have no honest single flat line.

## Kept pieces

| id | sheet | size | kind | world | walk top y | walk x span | notes |
|---|---|---|---|---|---|---|---|''')
for r in kept:
    y, sp = walkcell(r)
    A(f"| {r['id']} | {r['sheet']} | {r['w']}x{r['h']} | {r['kind']} | {r['world']} | {y} | {sp} | {r['notes']} |")
A('\n## Rejected cuts\n')
A('| id | size | reason |')
A('|---|---|---|')
for r in rej:
    A(f"| {r['id']} | {r['w']}x{r['h']} | {r['reason']} |")
open(OUT + '/CATALOG.md', 'w').write('\n'.join(L) + '\n')
print(cnt, len(kept), len(rej))

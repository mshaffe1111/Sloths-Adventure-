"""ART-NEXT-b: write (or rewrite) the batch 1 cut rows (part NEXT1) in reference/art/CATALOG-MASTER.csv, modelled on World 2's door row
(w2-props#door) and ART-W2B's catalog.py; then run `python3 tools/art/catalog_master.py --emit`.
    python3 -I tools/art/hfnext/catalog.py
The cuts are not packed or placed (artUse.allow.json only shrinks): file = 'origin/t-art-next:reference/art/hfnext/cut/<n>.png'.
Sizes against Pokey's DRAWN 89.1 px (heroSprite.ts HERO_UNITS x HERO_SPRITE_SCALE); on_screen_px in world px. Sizes here and in
contact.py's SIZE go together.
"""
import csv, io, os
from PIL import Image
P = 'reference/art/CATALOG-MASTER.csv'
C = 'reference/art/hfnext/cut/'
PU = 89.1
raw = open(P, newline='').read()
rows = list(csv.reader(io.StringIO(raw)))
h = rows[0]; ix = {k: i for i, k in enumerate(h)}
rows = [r for r in rows if not r[0].startswith('w2-next#')]
tl = next(r for r in rows if r[0] == 'w2-props#door')
SRC = ('World 2 batch 1 (ART-NEXT 2026-11-20, HF Qwen-Image-Edit-2511 from paste-ups, World 2 pieces as the style; cut ART-NEXT-b: '
       'tools/art/hfnext/cut.py, the weir also weirfoot.py)')
NOFIT_MADE = ("1 made thing: never W1 (Matt, 11-11); 3 built wood (dark grotto); 4 built wood (slate and mist); 9 built wood "
              "(lava and ash world: black rock, red glow); 7 sand-stone ruins: no river craft; 8 blue night: no river craft")
STATUS = 'cut, not placed (ART-NEXT): a level builder wires it'
DRAW = 'one drawImage of a cut png (pack into a World 2 atlas when wired)'
def row(n, file, **v):
    r = list(tl); im = Image.open(C + file + '.png')
    base = dict(id=f'w2-next#{n}', source=SRC, file=f'origin/t-art-next:{C}{file}.png', w=im.width, h=im.height, walk_y='', walk_x0='',
                walk_x1='', flat='', world_best=2, made_thing='y', ship_px=im.height, file_kb=f'{os.path.getsize(C + file + ".png") / 1024:.1f}',
                file_kb_ship='', draw_cost=DRAW, used_in='none (not placed)', status=STATUS, part='NEXT1', no_fit=NOFIT_MADE, scale_basis='drawn')
    base.update(v)
    for k, val in base.items(): r[ix[k]] = str(val)
    return r
def ps(hw): return f'{hw / PU:.2f}'
new = [
    row('barge', 'barge', kind="set piece (the King's Barge: a long low plank hull, a flat deck, a carved croc prow, a reed canopy at the stern, gold + teal trim)",
        walk_y=222, walk_x0=80, walk_x1=1050, flat='y', float_class='drifts',
        worlds="USED 2 Sunlit Riverbank: 2-9 the River King's Court, the barge carries him to the shrine (DESIGN-29 beat 10) | COULD 6 Deep Mangrove: a swamp lord's barge on the black water; 5 Orchid Sanctuary: a garden pleasure boat on the lily pond",
        engine_slot="new slot: World 2 barge (DESIGN-29: a `barge` row, one long log 384 px, Normal 80 px/s; the deck top = the log's top, the hull below drawn under the river line)",
        footing='the deck top: walk line y 222 from x 80 to 1050 (cut px: 970 px = the 384 px barge log)', layer='platform',
        on_screen_px='505x141 (world px: 2.53 cut px a unit, the deck walk 384 px; the canopy and the croc stand over the deck ends)',
        pokey_scale=ps(141), scale_ok='y', scale_basis='drawn (terrain: no cap)',
        notes="For 2-9 (DESIGN-29 beat 10). Take barge-s41. The lead picked s23; s23 (and s11, s37) are cut off by the take's frame (s23: paint on 44% of the left edge, the stern and canopy sliced flat; 14% of the right, the croc's snout): s41 is the only take whole on all four sides (its stern scroll's tip touches the frame by 1-2 px). The canopy's five poles stand on the deck: draw the barge behind him (he walks in front of the poles). No throne under the canopy in s41 (s23 had one)."),
    row('weir', 'weir', kind='set piece (a river weir: three tiers of World 2 brown rocks, white water pouring over each lip, foam at the foot)',
        float_class='grounded', made_thing='n',
        worlds='USED 2 Sunlit Riverbank: 2-7 the weir he climbs down to the river (DESIGN 2-7 beat 5: "the weir\'s stepped face, catch ledges") | COULD 5 Orchid Sanctuary: a garden cascade; 6 Deep Mangrove: a tide sluice',
        no_fit="1 the home forest's stones are its own (World 1 kit); 3 dark grotto (lit from below, cool); 4 slate and mist (grey rock); 7 sand-stone ruins; 8 blue night; 9 lava and ash; 10 stone-and-iron fortress",
        engine_slot='new slot: World 2 weir face (2-7 beat 5: drawn behind the catch ledges laid down its tiers; the river strip drawn over its foot)',
        footing='none (the catch ledges laid over its tiers are the footing: tier tops about y 5, 94 and 195 cut px)', layer='decor mid',
        on_screen_px='921x345 (world px: a tier = 1 Pokey, 1.06 cut px a unit)', pokey_scale=ps(345), scale_ok='',
        notes="For 2-7 (beat 5). Take weir-s41 (from World 2's brown rocks, the lead's ruling). The take's pool ran off three edges and its right rock was sliced by the frame: weirfoot.py fades the pool out below the foam and at both ends (the river is drawn over the foot), gives the right rock a rounded end with the take's outline (anti-aliased), and fades the left rock's foot (it melted into the pool). Big on purpose: the landmark of beat 5; scale it down with the ledges if the stage's drop is shorter (each tier = one ledge step)."),
    row('doorOpen', 'door-open', kind='village prop (the round PLEASE BE PATIENT door, swung open: warm lamplight inside)', float_class='grounded',
        worlds=tl[ix['worlds']], no_fit=tl[ix['no_fit']],
        engine_slot='new slot: World 2 door open (the open state of w2-props#door; 2-7 patientDoor, w2Stages.ts: swap #door for this when its letter lands; the same 480 px box)',
        footing='none (decor)', layer='decor near', on_screen_px='130x86 (world px: drawn in w2-props#door\'s place, the same box)',
        pokey_scale=ps(86), scale_ok='y',
        notes="For 2-7 (the post doors). Take door-s11, cut to the closed door's 480 px width so the swap is one for one (the stone ring is the same share of the mound: 0.39 vs 0.40). The lamplight spills onto the ground under it."),
]
for n, f, t, sz, seal in (('letter', 'letter', 'A', (28, 20), 'red wax seal'), ('letterB', 'letterB', 'B (fluttering: tilted, a corner lifted)', (32, 27), 'red wax seal'),
                          ('reply', 'reply', 'A', (28, 22), 'green leaf seal on blue-grey paper'), ('replyB', 'replyB', 'B (fluttering: tilted, the flap curling)', (33, 28), 'green leaf seal on blue-grey paper')):
    what = 'the letter he posts' if n.startswith('letter') else 'the reply he collects on the way home'
    new.append(row(n, f, kind=f'pickup (2-7 {what}: an envelope, {seal}; flutter frame {t})', float_class='may float',
                   worlds='USED 2 Sunlit Riverbank: 2-7 the post (the stage\'s petals in letter art, DESIGN 2-7) | COULD 3-10: any later stage\'s post (one look game-wide)',
                   no_fit='1 the home forest has no post', engine_slot='new slot: World 2 post pickup (2-7 letter / reply; drawPickup size 27-34 units; frames A and B alternate as a flutter)',
                   footing='none', layer='pickup', on_screen_px=f'{sz[0]}x{sz[1]} (world px: 3 cut px a unit; about 0.25 Pokey)',
                   pokey_scale='', scale_ok='', scale_basis='',
                   notes=f"For 2-7. Take {dict(letter='letter-s37', letterB='letterB-from37-s37', reply='reply-s11', replyB='replyB-from11-s11')[n]}; A and B cut at one scale (B is bigger only by its tilt). The B take's soft cast shadow is not kept."))
for n, f, t in (('mailBoat', 'boat', 'A (oar forward)'), ('mailBoatB', 'boatB', 'B (oar swept back)')):
    im = Image.open(C + f + '.png'); hw = 241 * im.height / im.width
    new.append(row(n, f, kind=f'actor prop (the mail boat: a rowboat, the mailman at the oar, the post sack in the bow; rowing frame {t})', float_class='drifts',
                   worlds="USED 2 Sunlit Riverbank: 2-7 the mailman's boat he races home (DESIGN 2-7 beats 5-14) | COULD 6 Deep Mangrove: a mangrove post round; 5 Orchid Sanctuary: the garden canal",
                   engine_slot='new slot: World 2 mail boat (2-7: rides the home leg about 130 px/s; frames A and B alternate on the stroke)',
                   footing='none (it never carries him)', layer='decor near', on_screen_px=f'241x{hw:.0f} (world px: 3 cut px a unit; the mailman about one Pokey tall standing)',
                   pokey_scale=ps(hw), scale_ok='y',
                   notes="For 2-7 (beats 5-14). Takes boat-s11 + boatB-from11-s11 (a matched pair). Frame B moves the oar only a little (the lead 5:15 PM): the builder may add a small code bob or oar sway if the row reads weak. The take paints its own water ripple under the hull: lay the ripple's middle on the river's surface line. boatB cut with keep= (its grey hull planks were keyed as holes by the trapped-grey rule)."))
last = max(i for i, r in enumerate(rows) if r[0].startswith('w2-props#'))
rows = rows[:last + 1] + new + rows[last + 1:]
b = io.StringIO(); csv.writer(b, lineterminator='\r\n' if '\r\n' in raw[:2000] else '\n').writerows(rows)
open(P, 'w', newline='').write(b.getvalue())
print('rows written', len(new))

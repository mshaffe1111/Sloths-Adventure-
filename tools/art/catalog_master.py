#!/usr/bin/env python3
"""The art director's master catalog (ART-CAT, packet reference/packets/2026-11-11/CONTENT-ART-DIRECTOR-catalog.md).

One table, one row per kept piece, the same columns for every source: the cut pieces not yet in the game (part A, built here with
--cut) and everything the game ships today (parts B1-B4, reference/art/catalog-game-B<n>.csv), merged with --merge into
reference/art/CATALOG-MASTER.csv and .md.

  python3 tools/art/catalog_master.py --cut      # part A: reference/art/catalog-cut.csv, holds-rejects.csv, master-sheets/
  python3 tools/art/catalog_master.py --merge    # A + B1..B4 -> CATALOG-MASTER.csv/.md (reads each B csv from the working tree,
                                                 # else from origin/t-art-catalog-b<n>)

Sources for part A (the older two batches re-tagged under the ten-world rule by looking at each piece; see LOOK below):
  1. origin/art-raw-2026-11-07 cut/catalog.csv + cut/kept/*.png (91 kept, tagged W1/W2/both before 11-11)
  2. origin/art-director reference/art/cut/manifest.json + *.png (107 keep, 4 hold; the 18 in src/assets/w1to4art/w1-cut.json are
     part B1's rows ("in game") and are skipped here)
  3. this branch: reference/art-incoming/{matt-2026-11-09,matt-2026-11-11,matt-2026-11-11b}/cut/catalog.csv and
     reference/art-incoming/hf-list1/catalog.csv, PNGs in src/assets/w1-1109, w1-1111, w1-1111b, w1-1111c (already ten-world tagged)

Play scale: the world is 540 game px tall sideways (engine.ts WORLD_VIEW_H) and Pokey is 48 game px (reference/art/cut/footing.json);
a game px is about 2 device px on a phone, so ship_px = on_screen_px x 2 at most (R-165.99), never more than the piece's own size.
Nothing here places, cuts or generates art; its one write under src/ is --emit (src/game/art/inventory/*.json, the engine copy).
"""
import argparse, csv, glob, io, json, os, re, subprocess, sys, tempfile
from collections import Counter, defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ART = os.path.join(ROOT, 'reference', 'art')
COLS = ['id', 'source', 'file', 'kind', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'flat', 'float_class', 'world_best', 'worlds',
        'no_fit', 'made_thing', 'engine_slot', 'footing', 'layer', 'on_screen_px', 'ship_px', 'file_kb', 'file_kb_ship', 'draw_cost',
        'used_in', 'status', 'notes']
STANDABLE = {'platform', 'step', 'soft landing'}

WORLD = {1: 'Emerald Canopy', 2: 'Sunlit Riverbank', 3: 'Mossy Grotto', 4: 'Mist Cascades', 5: 'Orchid Sanctuary', 6: 'Deep Mangrove',
         7: 'Ancient Ruins', 8: 'Twilight Treetops', 9: 'Volcanic Jungle', 10: 'Stormy Highlands Fortress'}
WORLD_IS = {1: 'the home forest is living green wood, moss and earth, nothing made or sawn',
            2: 'the river village is worked wood, banks and moving water',
            3: 'the grotto is wet stone, dark moss and glow',
            4: 'the cascades are bare wet cliff rock and spray',
            5: 'the sanctuary is a tended garden of blooms',
            6: 'the mangrove is grey-wet roots, mud and still water',
            7: 'the ruins are carved and squared stone',
            8: 'the treetops are boughs, fungus and blue night light',
            9: 'the volcanic jungle is charred rock, basalt and heat',
            10: 'the fortress is grey stone, iron and wind'}

# ---- families: what a piece IS (material and mood), the worlds it fits best first with why, and whether it is a made thing ----
F = {
 'moss_island': ('a mossy earth island with fungi', False, [(1, 'mossy mushroom mound: the canopy floor lifted up'), (8, 'a floating moss isle high in the canopy (blue-night tint)'), (5, 'its flowered rim reads as a garden bed'), (3, 'darker tint: a grotto ledge')]),
 'root_disc': ('a flat root-woven earth disc', False, [(1, 'woven roots and moss: the forest floor'), (6, 'the root weave reads as mangrove roots (grey-wet tint)'), (8, 'a root platform in the treetops'), (3, 'darker tint: a root shelf in the grotto')]),
 'earth_wall': ('brown earth with roots and a grass top', False, [(1, 'grass-topped earth and roots: the home forest bank'), (3, 'darker tint: a grotto earth wall'), (6, 'a muddy root bank (grey-wet tint)'), (4, 'an earth cliff by the falls')]),
 'pit_wall': ('a fern-lined earth pit with lips', False, [(1, 'fern-lined earth pit: fills the W1 kit gap (pit floors and lips)'), (3, 'darker tint: a grotto pit'), (6, 'a mud pit (grey-wet tint)')]),
 'plank_earth': ('an earth ledge topped with a wooden board (made thing: never W1)', True, [(2, 'a board laid on a bank: village work'), (6, 'a boardwalk ledge in the swamp'), (10, 'a plank ledge on the fortress slopes')]),
 'stump_nat': ('a natural mossy stump', False, [(1, 'a rotted mossy stump: the home forest'), (6, 'a swamp stump (grey-wet tint)'), (8, 'a broken snag top in the canopy'), (5, 'a garden stump')]),
 'sawn': ('sawn wood with ring ends (made thing; lead 11-11: saws are not in the home forest)', True, [(2, 'worked wood: the riverbank village'), (5, 'a tended garden stump or log'), (6, 'cut timber in the swamp settlement')]),
 'sawn_post': ('a tall trunk with a sawn top (made thing)', True, [(2, 'a village post'), (6, 'a stilt post in the swamp'), (8, 'a climb post up to the treetops (blue-night tint)')]),
 'log_nat': ('a natural fallen log with broken ends', False, [(1, 'a mossy fallen log: the home forest'), (6, 'a waterlogged swamp log'), (8, 'a fallen bough log high up'), (3, 'a dark log in the grotto')]),
 'log_flower': ('a gnarled root log with orchids', False, [(1, 'moss and wild orchids: the home forest'), (5, 'orchids: the sanctuary'), (8, 'a canopy log')]),
 'drift': ('bleached driftwood', False, [(2, 'driftwood on the river bank'), (6, 'grey driftwood in the mangrove'), (4, 'washed down by the falls')]),
 'plank': ('sawn boards or a woven plank bridge (made thing)', True, [(2, 'boards and bridges: the village'), (6, 'a boardwalk in the swamp'), (10, 'fortress planking'), (7, 'a board in the ruins dig')]),
 'rope': ('rope-lashed poles or rope (made thing)', True, [(2, 'rope and lashing: village work'), (6, 'stilt-village lashing'), (10, 'fortress scaffold'), (8, 'rope up into the treetops')]),
 'lantern': ('a hanging lantern (made thing)', True, [(2, 'a village lantern'), (5, 'a garden lantern'), (7, 'a lamp in the ruins')]),
 'bush': ('a leafy tropical bush', False, [(1, 'leafy undergrowth: the home forest'), (5, 'a full garden shrub'), (6, 'swamp undergrowth (grey-wet tint)'), (2, 'bank greenery')]),
 'fern': ('a big fern', False, [(1, 'ferns: the home forest floor'), (3, 'ferns at a grotto mouth'), (6, 'a swamp fern'), (4, 'a wet fern by the falls')]),
 'berry': ('a berry bush', False, [(1, 'wild berries: the home forest'), (2, 'a bank berry bush'), (5, 'a garden berry shrub')]),
 'cactus': ('a prickly-pear cactus', False, [(9, 'a dry, harsh plant: the only world dry enough is the volcanic slope')]),
 'nettle': ('a nettle-like weed bush', False, [(1, 'forest-floor nettles'), (2, 'bank weeds'), (6, 'swamp weeds')]),
 'leaf': ('a giant single leaf', False, [(1, 'a giant leaf: the home forest'), (5, 'garden foliage'), (8, 'a canopy leaf')]),
 'vine': ('a natural climbing vine', False, [(1, 'a mossy vine: the home forest'), (8, 'a vine in the high canopy'), (6, 'a swamp liana (grey-wet tint)'), (3, 'a vine down a grotto wall')]),
 'flower_vine': ('a flowering vine', False, [(5, 'a flowering vine: the sanctuary'), (1, 'wildflowers on a vine'), (8, 'a blooming canopy vine')]),
 'thorn': ('a brown thorn bramble (hurts)', False, [(3, 'thorns are taught in 3-4: a grotto briar (cool-dark tint)'), (6, 'a swamp briar'), (10, 'a briar on the fortress approach'), (1, 'only if World 1 gets a thorn beat (it has none today)')]),
 'thorn_red': ('a red thorn net (hurts)', False, [(3, 'a harsh red briar in the grotto'), (9, 'red thorns read hot: the volcanic jungle'), (6, 'a swamp briar')]),
 'thorn_trunk': ('a trunk bristling with black spines (hurts)', False, [(6, 'a spiny palm trunk in the swamp'), (9, 'a spined trunk on the volcanic slope'), (3, 'a spined column in the grotto')]),
 'water_mud': ('a brown muddy water band', False, [(2, 'river water'), (6, 'murky swamp water')]),
 'water_storm': ('big dark storm waves', False, [(10, 'storm surge under the fortress'), (4, 'white water under the falls'), (2, 'the river in flood')]),
 'cave_stone': ('a rock cave or arch', False, [(3, 'a stone cave: the grotto'), (4, 'a cliff cave behind the falls'), (10, 'a highland rock shelter'), (1, 'a mossy boulder den on the forest floor')]),
 'cave_root': ('a root or hollow-stump den', False, [(1, 'a hollow stump den: the home forest'), (6, 'a root cave in the mangrove'), (8, 'a hollow in a canopy trunk'), (3, 'a root den at a grotto mouth')]),
 'cave_built': ('a dry-stone hut of stacked slabs (made thing)', True, [(7, 'a stacked stone shelter: the ruins'), (10, 'a highland stone bothy'), (3, 'a slab shelter in the grotto')]),
 'fern_hide': ('a fern-mound den', False, [(1, 'a fern hideout: the home forest'), (5, 'a garden fern bower'), (6, 'a swamp fern den')]),
 'rock_brown': ('bare brown rock', False, [(4, 'bare cliff rock: the cascades'), (10, 'a highland crag'), (3, 'grotto rock'), (9, 'warm brown rock for the volcanic slope')]),
 'rock_moss': ('a moss-covered rock', False, [(1, 'a mossy boulder: the home forest floor'), (3, 'grotto rock'), (4, 'wet mossy rock by the falls'), (6, 'swamp rock (grey-wet tint)')]),
 'pebble': ('a small stone', False, [(1, 'forest-floor pebbles'), (3, 'grotto pebbles'), (4, 'cliff scree'), (10, 'highland stones')]),
 'mossrock': ('a small mossy rock', False, [(1, 'forest-floor dressing'), (3, 'grotto dressing'), (6, 'swamp dressing'), (4, 'falls dressing')]),
 'grass': ('a grass tuft', False, [(1, 'a forest-floor tuft'), (4, 'cliff-top grass'), (10, 'highland grass'), (6, 'swamp grass')]),
 'roots_hang': ('hanging roots', False, [(3, 'roots through the grotto ceiling'), (1, 'roots under an earth ledge'), (6, 'mangrove roots'), (8, 'hanging roots in the canopy')]),
 'roots_glow': ('hanging roots with a glow', False, [(3, 'glowing roots: the grotto'), (8, 'night glow: the treetops')]),
 'branch': ('a bare branch (drawn diagonal)', False, [(1, 'a fallen branch: dressing'), (8, 'a twig high up'), (6, 'a dead branch in the swamp')]),
 'sticks_thorny': ('thorny sticks (hurt)', False, [(3, 'grotto briar sticks'), (6, 'swamp briar')]),
 'stick_pile': ('a twig pile with pink flowers', False, [(1, 'a forest-floor twig pile'), (5, 'a flowered twig pile'), (6, 'a swamp brush pile')]),
 'fungus': ('a big shelf fungus', False, [(8, 'giant shelf fungus: the treetops (blue-night)'), (1, 'shelf fungus on the forest floor'), (3, 'grotto fungus')]),
 'trunk_fungus': ('a tall trunk with shelf fungi', False, [(8, 'a fungus-stepped trunk: the treetops'), (1, 'a forest trunk with shelf fungi'), (3, 'a grotto trunk')]),
 'snag': ('a forked dead snag', False, [(6, 'a dead mangrove snag'), (1, 'a forest snag'), (8, 'a canopy snag')]),
 'pillar_root': ('a stone pillar gripped by roots', False, [(3, 'root-gripped stone: the grotto'), (7, 'a pillar in the ruins'), (1, 'a rooted forest rock'), (6, 'roots on stone: the mangrove')]),
 'twist_rock': ('a twisted trunk gripping a rock', False, [(1, 'a strangler trunk on a rock: the home forest'), (3, 'a grotto set piece'), (6, 'a mangrove set piece')]),
 'stone_stair': ('a cut-stone stair block (made thing)', True, [(7, 'masonry stairs: the ruins'), (3, 'old steps in the grotto'), (10, 'fortress steps')]),
 'bough_flower': ('a twisted orange bough with flowers', False, [(5, 'a flowering bough: the sanctuary'), (8, 'a canopy bough'), (1, 'a forest bough')]),
 'bough': ('a mossy level bough', False, [(8, 'a mossy bough: the treetops'), (1, 'a forest bough'), (6, 'a swamp bough')]),
 'tree_flower': ('a small twisted flowering tree', False, [(5, 'a flowering tree: the sanctuary'), (8, 'a canopy tree'), (1, 'a forest tree')]),
 'garland': ('a vine garland', False, [(1, 'a swagged vine: the home forest'), (5, 'a garden garland'), (6, 'a swamp vine')]),
 'leaf_hang': ('hanging monstera leaves', False, [(1, 'hanging leaves: the home forest'), (5, 'garden foliage'), (8, 'canopy leaves')]),
 'spire': ('a tall mossy rock spire', False, [(4, 'a cliff spire: the cascades'), (3, 'a grotto spire'), (1, 'a forest rock'), (10, 'a highland crag')]),
}

# ---- roles: how the engine would use it: layer, slot (tools/engine/catalog-map.json cat/arr key; w1CutArt.ts pickCut), play size ----
PICK_STONE = 'w1CutArt.ts pickCut stone (style moss_stone, h 30-140, w <= 260; stretch <= 1.5)'
PICK_STUMP = 'w1CutArt.ts pickCut stump (moss_stone, h 91-140, w < 150; or stone when h > 70)'
PICK_LOG = 'w1CutArt.ts pickCut log (style log, h < 50; laid in parts of <= 360 px, PLANK_MAX)'
R = {
 'stone': ('step', 'landing/platforms solid moss_stone art=rock; ' + PICK_STONE, ('h', 80)),
 'push': ('step', 'landing/platforms solid moss_stone push (art=boulder push; solid log push for logs)', ('h', 80)),
 'stump': ('step', 'landing/platforms solid moss_stone; ' + PICK_STUMP, ('h', 100)),
 'log': ('platform', 'landing/platforms solid log; ' + PICK_LOG, ('h', 36)),
 'plank': ('platform', 'landing/platforms solid canopy_bridge (made; or solid log); ' + PICK_LOG, ('h', 24)),
 'island': ('platform', 'landing/platforms solid moss_stone soil (floating earth: may-float pending Matt, art-director.md §4)', ('w', 180)),
 'ledge': ('platform', 'landing/platforms solid moss_stone soil (earth ledge)', ('w', 150)),
 'wall': ('step', 'new slot: one-piece wall set piece (one platform per drawn ledge, footing.json heights)', ('h', 240)),
 'wallcap': ('step', 'new slot: wall corner cap or foot (pairs with the one-piece wall)', ('h', 110)),
 'pit': ('danger look', 'new slot: pit lip pair (W1 kit gap: pit floors and lips); lips are landing/platforms solid moss_stone pit=drop', ('w', 420)),
 'stepset': ('step', 'new slot: step set piece (one platform per drawn step)', ('h', 200)),
 'ladder': ('climb', 'climbable/ropes rope (vertical climb) or new slot: ladder', ('h', 220)),
 'post': ('climb', 'climbable/vines tree_climb (one-piece climb post); landing/platforms solid branch art=post lip on its top', ('h', 192)),
 'trunk': ('decor mid', 'other/trees (trunk: an anchor, never a landing)', ('h', 400)),
 'tree': ('decor mid', 'other/trees (trunk: an anchor, never a landing)', ('h', 420)),
 'snag': ('decor mid', 'other/trees (snag: an anchor, never a landing) or prop/proto.dress w1Stump', ('h', 150)),
 'setpiece': ('decor mid', 'other/trees (set piece trunk: an anchor; its rock is dressing, not a landing)', ('h', 260)),
 'vine': ('climb', 'climbable/vines tree_climb / swing_liana', ('h', 200)),
 'rope': ('climb', 'climbable/ropes rope', ('h', 160)),
 'bough': ('platform', 'landing/platforms solid branch (or solid roost_branch)', ('w', 220)),
 'branch': ('decor near', 'prop/proto.dress (dressing only: drawn diagonal, never a landing)', ('w', 200)),
 'bush': ('decor near', 'prop/proto.bushes wide / tall / fern', ('h', 80)),
 'plant': ('decor near', 'prop/proto.dress (plant dressing)', ('h', 70)),
 'small': ('decor near', 'prop/proto.dress w1Pebble / w1Stones / w1Sprig (small dressing)', ('h', 22)),
 'hide': ('decor near', 'other/proto.stilt moss-hide / log-hide / root-arch (hide spot)', ('h', 120)),
 'thorn': ('danger look', 'other/proto.thorns (thorn vine: hurts)', ('h', 56)),
 'thorn_hang': ('danger look', 'other/proto.thorns (hanging thorn vine: hurts)', ('h', 130)),
 'thorn_tall': ('danger look', 'other/proto.thorns (thorn column: hurts)', ('h', 200)),
 'water': ('danger look', 'stageArtData.ts PIT_WATER strip (per-world pit water) / other/rivers', ('h', 90)),
 'lava': ('danger look', 'new slot: lava or vent hazard (W9)', ('h', 70)),
 'hang': ('decor mid', 'prop/proto.dress w1Hang1 / w1Hang2 (hanging dressing)', ('h', 90)),
 'fungus_shelf': ('platform', 'landing/platforms solid fungus_shelf', ('w', 140)),
 'soft': ('soft landing', 'landing/platforms bouncy moss_stone / bouncy - (soft landing: bounce)', ('w', 130)),
 'lily': ('platform', 'landing/platforms solid - lily', ('w', 110)),
 'ground': ('platform', 'new slot: ground band strip (tiled ground top; terrain.ts draws the floor today)', ('h', 90)),
 'made_prop': ('decor near', 'prop/proto.decor lantern / pole (made dressing)', ('h', 60)),
 'frame': ('decor near', 'prop/proto.decor pole; new slot: scaffold frame (made)', ('h', 160)),
}

# ---- LOOK: each older-batch piece as seen on the contact sheets (2026-11-11, at play size, dark and light) ----
# id: (family, role, status note or '')
ANG = 'needs fix: drawn three-quarter/diagonal, so no side-on stand line (re-cut or redraw side-on before it is a platform)'
LOOK = {
 'W1-02-a': ('pit_wall', 'pit', ''), 'W1-03-a': ('moss_island', 'island', ''), 'W1-04-a': ('moss_island', 'island', ''),
 'W1-05-a': ('moss_island', 'island', ''), 'W1-06-a': ('moss_island', 'island', ''), 'W1-07-a': ('moss_island', 'island', ''),
 'W1-08-a': ('moss_island', 'island', ''), 'W1-09-e': ('pillar_root', 'stump', ''), 'W1-09-j': ('sawn_post', 'post', ''),
 'W1-09-m': ('root_disc', 'island', ''), 'W1-09-n': ('root_disc', 'island', ''), 'W1-10-a': ('sawn', 'stump', ''),
 'W1-10-e': ('sawn', 'stump', ''), 'W1-10-i': ('root_disc', 'island', ''), 'W1-10-j': ('root_disc', 'island', ''),
 'W1-12-a': ('sawn', 'stump', ''), 'W1-13-a': ('sawn', 'stump', ''), 'W1-14-b': ('stump_nat', 'stump', ''),
 'W1-16-a': ('stone_stair', 'stepset', ANG), 'W1-17-a': ('log_nat', 'log', ''), 'W1-17-b': ('sawn', 'log', ''),
 'W1-18-a': ('vine', 'vine', ''), 'W1-18-b': ('sawn', 'post', ''), 'W1-19-a': ('sawn', 'log', ''), 'W1-19-b': ('branch', 'branch', ''),
 'W1-20-a': ('sawn', 'log', ''), 'W1-20-b': ('sawn', 'log', ''), 'W1-20-c': ('branch', 'branch', ''), 'W1-21-a': ('sawn', 'log', ''),
 'W1-21-b': ('sawn', 'log', ''), 'W1-21-c': ('stick_pile', 'plant', ''), 'W1-21-d': ('stick_pile', 'plant', ''),
 'W1-22-a': ('sawn', 'log', ''), 'W1-22-b': ('sawn', 'log', ''), 'W1-22-c': ('drift', 'log', ''), 'W1-22-d': ('drift', 'log', ''),
 'W1-23-a': ('sawn', 'stump', ''), 'W1-24-a': ('plank', 'plank', ''), 'W1-24-b': ('sawn', 'stepset', ''), 'W1-25-a': ('plank', 'plank', ''),
 'W1-26-a': ('sawn', 'log', ''), 'W1-26-b': ('log_flower', 'log', ''), 'W1-27-a': ('log_nat', 'log', ''), 'W1-27-b': ('log_nat', 'log', ''),
 'W2-01-h': ('plank', 'plank', ''), 'W2-04-a': ('bush', 'bush', ''), 'W2-04-b': ('bush', 'bush', ''), 'W2-05-a': ('bush', 'bush', ''),
 'W2-05-b': ('fern', 'bush', ''), 'W2-06-a': ('sawn', 'log', ''), 'W2-06-b': ('log_nat', 'log', ''), 'W2-07-a': ('sawn', 'log', ''),
 'W2-07-b': ('log_nat', 'log', ''), 'W2-08-a': ('rock_brown', 'stone', ''), 'W2-08-b': ('rock_moss', 'stone', ''),
 'W2-09-a': ('rock_brown', 'stepset', ANG), 'W2-09-b': ('rock_moss', 'stone', ''), 'W2-10-a': ('flower_vine', 'vine', ''),
 'W2-10-b': ('vine', 'vine', ''), 'W2-11-a': ('flower_vine', 'vine', ''), 'W2-11-b': ('vine', 'vine', ''), 'W2-12-a': ('leaf', 'plant', ''),
 'W2-12-b': ('fern_hide', 'hide', ''), 'W2-12-d': ('cave_root', 'hide', ''), 'W2-12-e': ('bush', 'bush', ''),
 'W2-13-a': ('cave_stone', 'hide', ''), 'W2-13-b': ('cave_root', 'hide', ''), 'W2-13-c': ('cave_built', 'hide', ''),
 'W2-13-d': ('cave_root', 'hide', ''), 'W2-14-a': ('thorn_red', 'thorn', ''), 'W2-14-b': ('berry', 'bush', ''),
 'W2-14-c': ('thorn_trunk', 'thorn_tall', ''), 'W2-14-d': ('cactus', 'thorn', ''), 'W2-15-a': ('thorn_trunk', 'thorn_tall', ''),
 'W2-15-b': ('nettle', 'bush', ''), 'W2-15-c': ('berry', 'bush', ''), 'W2-15-d': ('thorn_red', 'thorn', ''),
 'W2-16-a': ('water_mud', 'water', ''), 'W2-16-b': ('water_mud', 'water', ''), 'W2-16-c': ('water_storm', 'water', ''),
 'W2-16-d': ('water_storm', 'water', ''), 'W2-16-e': ('water_storm', 'water', ''), 'W2-17-a': ('water_mud', 'water', ''),
 'W2-17-b': ('water_storm', 'water', ''), 'W2-17-c': ('water_storm', 'water', ''), 'W2-18-a': ('water_mud', 'water', ''),
 'W2-18-b': ('water_storm', 'water', ''), 'W2-19-a': ('bough_flower', 'bough', ANG), 'W2-19-c': ('bough', 'bough', ''),
 'W2-20-a': ('tree_flower', 'plant', ''), 'W2-20-b': ('sawn', 'log', ANG),
 # art-director 11-05 cuts (gemini-2026-11-05), the 89 not already in 1-1's atlas
 'w1-post-tall-vine': ('sawn_post', 'post', ''), 'w1-post-tall-rope': ('rope', 'post', ''), 'w1-post-rope-wrapped': ('rope', 'post', ''),
 'w1-vine-column-a': ('vine', 'vine', ''), 'w1-vine-column-b': ('vine', 'vine', ''), 'w1-rope-plain': ('rope', 'rope', ''),
 'w1-rope-thin': ('rope', 'rope', ''), 'w1-vine-monstera': ('vine', 'vine', ''), 'w1-vine-flowering': ('flower_vine', 'vine', ''),
 'w1-vine-fungus': ('trunk_fungus', 'post', ''), 'w1-bush-monstera': ('bush', 'hide', ''), 'w1-bush-hedge-tall': ('bush', 'hide', ''),
 'w1-thorn-vine-column': ('thorn', 'thorn_tall', ''), 'w1-thorn-tangle-big': ('thorn', 'thorn', ''), 'w1-thorn-tangle-flat': ('thorn', 'thorn', ''),
 'w1-thorn-mound': ('thorn', 'thorn', ''), 'w1-thorn-bramble-a': ('thorn', 'thorn', ''), 'w1-thorn-bramble-b': ('thorn', 'thorn', ''),
 'w1-thorn-bramble-long': ('thorn', 'thorn', ''), 'w1-thorn-ball': ('thorn', 'thorn', ''), 'w1-thorn-hang-a': ('thorn', 'thorn_hang', ''),
 'w1-thorn-hang-b': ('thorn', 'thorn_hang', ''), 'w1-thorn-hang-c': ('thorn', 'thorn_hang', ''), 'w1-thorn-hang-swag': ('thorn', 'thorn_hang', ''),
 'w1-post-short-rope': ('rope', 'post', ''), 'w1-frame-xbundle-a': ('rope', 'frame', ''), 'w1-vine-curtain': ('garland', 'hang', ''),
 'w1-thorn-row': ('thorn', 'thorn', ''), 'w1-post-stubs': ('plank', 'post', ''), 'w1-post-vine-wrapped': ('rope', 'post', ''),
 'w1-log-lashed-short': ('rope', 'plank', ''), 'w1-frame-a': ('rope', 'frame', ''), 'w1-frame-xbundle-b': ('rope', 'frame', ''),
 'w1-thorn-pile': ('thorn', 'thorn', ''), 'w1-leaf-monstera-hang': ('leaf_hang', 'hang', ''), 'w1-garland-vine': ('garland', 'hang', ''),
 'w1-rock-spire': ('spire', 'plant', ''), 'w1-rock-arch': ('cave_stone', 'hide', ''), 'w1-pebble-a': ('pebble', 'small', ''),
 'w1-pebble-b': ('pebble', 'small', ''), 'w1-pebble-c': ('pebble', 'small', ''), 'w1-branch-long-a': ('branch', 'branch', ''),
 'w1-branch-leafy': ('branch', 'branch', ''), 'w1-branch-hanging-vine': ('branch', 'branch', ''), 'w1-branch-knotted': ('branch', 'branch', ''),
 'w1-branch-twig': ('branch', 'branch', ''), 'w1-sticks-bundle': ('branch', 'branch', ''), 'w1-branch-twisted': ('branch', 'branch', ''),
 'w1-sticks-thorny': ('sticks_thorny', 'thorn', ''), 'w1-hide-boulder-cave': ('cave_stone', 'hide', ''), 'w1-hide-log-on-stump': ('cave_root', 'hide', ''),
 'w1-hide-rock-arch-low': ('cave_stone', 'hide', ''), 'w1-hide-slab-overhang': ('cave_stone', 'hide', ''), 'w1-hide-root-arch': ('cave_root', 'hide', ''),
 'w1-hide-cave-big': ('cave_stone', 'hide', ''), 'w1-trunk-twisted-rock': ('twist_rock', 'setpiece', ''), 'w1-wall-earth-A': ('earth_wall', 'wall', ''),
 'w1-wall-cap-tl': ('earth_wall', 'wallcap', ''), 'w1-wall-cap-tr': ('earth_wall', 'wallcap', ''), 'w1-wall-foot-l': ('earth_wall', 'wallcap', ''),
 'w1-wall-foot-r': ('earth_wall', 'wallcap', ''), 'w1-roots-hang-a': ('roots_hang', 'hang', ''), 'w1-roots-hang-b': ('roots_hang', 'hang', ''),
 'w1-ledge-thin': ('plank_earth', 'plank', ''), 'w1-ledge-earth-a': ('plank_earth', 'ledge', ''), 'w1-ledge-earth-long': ('plank_earth', 'ledge', ''),
 'w1-ledge-earth-small': ('plank_earth', 'ledge', ''), 'w1-ledge-earth-b': ('plank_earth', 'ledge', ''), 'w1-ground-chunk': ('earth_wall', 'ledge', ''),
 'w1-mossrock-a': ('mossrock', 'small', ''), 'w1-mossrock-b': ('mossrock', 'small', ''), 'w1-grass-tuft-a': ('grass', 'small', ''),
 'w2-lantern-hanging': ('lantern', 'made_prop', ''), 'w1-wall-earth-B': ('earth_wall', 'wall', ''), 'w1-roots-hang-c': ('roots_hang', 'hang', ''),
 'w1-roots-hang-glow': ('roots_glow', 'hang', ''), 'w1-wall-earth-C': ('earth_wall', 'wall', ''), 'w1-ledge-overhang-big': ('plank_earth', 'ledge', ''),
 'w1-trunk-fungus-A': ('trunk_fungus', 'trunk', ''), 'w1-wall-foot-l-41': ('earth_wall', 'wallcap', ''), 'w1-fungus-shelf-big': ('fungus', 'fungus_shelf', ''),
 'w1-fungus-cluster': ('fungus', 'plant', ''), 'w1-stump-forked-a': ('snag', 'snag', ''), 'w1-stump-forked-b': ('snag', 'snag', ''),
 'w1-mossrock-c': ('mossrock', 'small', ''), 'w1-mossrock-d': ('mossrock', 'small', ''), 'w1-trunk-fungus-B': ('trunk_fungus', 'trunk', ''),
 'w1-grass-tuft-b': ('grass', 'small', ''), 'w1-grass-tuft-c': ('grass', 'small', ''),
}

# source-3 pieces that LOOK made though their cut catalog does not say so (squared, sawn timber beams; seen on the w02 platform sheet)
MADE3 = {'M-14-a', 'M-14-b', 'M-15-a', 'M-15-b',
         # attempt 2 (Critic: M-04-c): every source-3 row re-read by eye for carving, crates, iron, cut or hand-stacked stone
         'M-01-c', 'M-04-a', 'M-04-b', 'M-04-c', 'M-04-d', 'M-06-b', 'M-06-c', 'M-06-d', 'N-02-f', 'N-05-c', 'N-01-d', 'N-03-c'}
# source-3 pieces drawn three-quarter whose cut notes do not say so (seen on the w07 step sheet)
ANG3 = {'M-04-d', 'N-02-c', 'M-05-a'}

# source-3 kinds -> role (labels refine it below)
KIND3 = {'puzzle piece': 'push', 'lily pad': 'lily', 'soft landing': 'soft', 'tree': 'tree', 'walkable log or plank': 'log',
         'den or hide spot': 'hide', 'plant or dressing': 'plant', 'rock': 'stone', 'block': 'stone', 'step set piece': 'stepset',
         'danger-looking': 'thorn', 'ground strip': 'ground'}


def role3(kind, label):
    l = label.lower()
    if kind == 'step set piece' and 'ladder' in l: return 'ladder'
    if kind == 'walkable log or plank' and 'ladder' in l: return 'ladder'
    if kind == 'walkable log or plank' and ('island' in l): return 'island'
    if kind == 'walkable log or plank' and any(k in l for k in ('bridge', 'dock', 'plank')): return 'plank'
    if kind == 'block' and 'stump' in l: return 'stump'
    if kind == 'danger-looking':
        if re.search(r'\bpit\b', l): return 'pit'
        if any(k in l for k in ('lava', 'vent')): return 'lava'
        return 'thorn'
    if kind == 'plant or dressing' and any(k in l for k in ('curtain',)): return 'hang'
    if kind == 'plant or dressing' and 'palisade' in l: return 'frame'
    if kind == 'plant or dressing' and 'canopy' in l: return 'hang'
    if kind == 'den or hide spot' and 'arch' in l and 'ruin' in l: return 'hide'
    return KIND3[kind]


# ------------------------------------------------------------------------------------------------------------------------------
def sh(*a):
    return subprocess.run(a, cwd=ROOT, check=True, capture_output=True).stdout


def extract(branch, paths, dest):
    os.makedirs(dest, exist_ok=True)
    tar = sh('git', 'archive', branch, *paths)
    subprocess.run(['tar', '-x', '-C', dest], input=tar, check=True)


def wtag(n, why):
    return f'{n} {WORLD[n]}: {why}'


def parse_worlds(s):
    """world numbers in order from 'N reason; N reason' (A, B2-B4) or 'USED N reason | COULD N reason' (B1)"""
    out = []
    for part in re.split(r'[;|]\s*', s or ''):
        m = re.match(r'\s*(?:(?:USED|COULD|used|could)\b:?\s*)?(?:W)?(\d+)\b', part)
        if m and int(m.group(1)) in WORLD and int(m.group(1)) not in out: out.append(int(m.group(1)))
    return out


def measure_top(img):
    """the flattest long top line: (y, x0, x1, flat) in piece px; flat = share of the span's columns within 3 px of y"""
    a = img.getchannel('A')
    w, h = a.size
    px = a.load()
    top = [None] * w
    for x in range(w):
        for y in range(h):
            if px[x, y] > 128:
                top[x] = y; break
    cols = [t for t in top if t is not None]
    if not cols: return None
    lim = min(cols) + max(6, int(0.35 * h))
    best = None
    for y in sorted(set(t for t in cols if t <= lim)):
        run = start = 0; bx0 = bx1 = None; gap = 0; cur0 = None
        for x in range(w):
            ok = top[x] is not None and abs(top[x] - y) <= 3
            if ok:
                if cur0 is None: cur0 = x
                gap = 0
                if bx0 is None or x - cur0 > bx1 - bx0: bx0, bx1 = cur0, x
            else:
                gap += 1
                if gap > 4: cur0 = None
        if bx0 is not None and (best is None or bx1 - bx0 > best[2] - best[1]):
            best = (y, bx0, bx1)
    if not best: return None
    y, x0, x1 = best
    span = [top[x] for x in range(x0, x1 + 1) if top[x] is not None]
    flat = sum(1 for t in span if abs(t - y) <= 3) / max(1, x1 - x0 + 1)
    return y, x0, x1, round(flat, 2)


def flat_at(img, y, x0, x1):
    a = img.getchannel('A').load(); w, h = img.size; n = ok = 0
    for x in range(max(0, x0), min(w, x1 + 1)):
        t = next((yy for yy in range(h) if a[x, yy] > 128), None); n += 1; ok += t is not None and abs(t - y) <= 3
    return round(ok / max(1, n), 2)


# standable pieces are drawn so their stand span is the platform's width (w1CutArt.ts cutBox): a typical platform width per role, and
# the tallest the whole piece may then draw (so a log with a puddle or roots under it does not balloon)
SPAN = {'log': (200, 90), 'plank': (200, 60), 'bough': (200, 120), 'island': (180, 140), 'ledge': (150, 120), 'stone': (100, 160),
        'stump': (100, 200), 'push': (100, 140), 'fungus_shelf': (120, 90), 'lily': (100, 80), 'soft': (120, 120)}


def play_size(role, w, h, fj=None, span=None):
    if fj and fj.get('drawn_game_w'):
        return fj['drawn_game_w'], fj['drawn_game_h']
    if role in SPAN and span and span > 8:
        k = SPAN[role][0] / span
        if h * k > SPAN[role][1]: k = SPAN[role][1] / h
        return max(1, round(w * k)), max(1, round(h * k))
    axis, t = R[role][2]
    k = t / (h if axis == 'h' else w)
    if role in ('stone', 'stump', 'push') and w * k > 260: k = 260 / w
    return max(1, round(w * k)), max(1, round(h * k))


def webp_kb(img, size):
    im = img if img.size == tuple(size) else img.resize(size)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=82, method=4)
    return round(len(b.getvalue()) / 1024, 1)


# ------------------------------------------------------------------------------------------------------------------------------
def build_cut(args):
    from PIL import Image
    tmp = args.tmp or tempfile.mkdtemp(prefix='artcat-')
    s1, s2 = os.path.join(tmp, 'src1'), os.path.join(tmp, 'src2')
    if not os.path.isdir(os.path.join(s1, 'cut', 'kept')): extract('origin/art-raw-2026-11-07', ['cut/kept', 'cut/catalog.csv'], s1)
    if not os.path.isdir(os.path.join(s2, 'reference', 'art', 'cut')): extract('origin/art-director', ['reference/art/cut'], s2)
    atlas = json.load(open(os.path.join(ROOT, 'src/assets/w1to4art/w1-cut.json')))
    man = json.load(open(os.path.join(s2, 'reference/art/cut/manifest.json')))
    foot = json.load(open(os.path.join(s2, 'reference/art/cut/footing.json')))['pieces']
    rows, held, counts, spot = [], [], Counter(), []

    def finish(r, img, role, fam_worlds, nofit, made, status, notes, fj=None, walk=None):
        layer, slot, _ = R[role]
        w, h = img.size
        r.update(w=w, h=h, layer=layer, engine_slot=slot, made_thing='y' if made else 'n')
        if made: fam_worlds = [(n, why) for n, why in fam_worlds if n != 1]
        r['worlds'] = '; '.join(wtag(n, why) for n, why in fam_worlds)
        r['world_best'] = str(fam_worlds[0][0])
        listed = {n for n, _ in fam_worlds}
        r['no_fit'] = '; '.join(nofit.get(n) or f'{n} {WORLD[n]}: {WORLD_IS[n]}' for n in WORLD if n not in listed)
        # footing: the walk line in piece px
        if layer in STANDABLE:
            if fj and fj.get('footing'):
                fl = fj['footing']
                r['footing'] = ' | '.join(f"y {f['y']} x {f['x0']}-{f['x1']}" for f in fl) + (' (set piece: one platform per ledge)' if len(fl) > 1 else '') + ' (footing.json)'
                r.update(walk_y=fl[0]['y'], walk_x0=fl[0]['x0'], walk_x1=fl[0]['x1'])
            elif walk and str(walk[0]).strip().isdigit():
                fl = walk[3] if str(walk[3]).strip() else flat_at(img, int(walk[0]), int(walk[1]), int(walk[2]))
                walk = (walk[0], walk[1], walk[2], fl)
                r.update(walk_y=walk[0], walk_x0=walk[1], walk_x1=walk[2], flat=fl)
                r['footing'] = f'y {walk[0]} x {walk[1]}-{walk[2]} (cut catalog, flat {fl})' + (' by hand: domed or uneven top, stand span is the flat middle only' if float(fl or 0) < 0.5 else '')
            else:
                m = measure_top(img)
                y, x0, x1, fl = m
                r.update(walk_y=y, walk_x0=x0, walk_x1=x1, flat=fl)
                by = ' by hand: no flat top (rocks and set pieces: set the stand line on the drawn tread)' if fl < 0.5 or role in ('stepset', 'wall', 'pit') else ''
                r['footing'] = f'y {y} x {x0}-{x1} (measured, flat {fl}){by}'
        else:
            r['footing'] = 'none (decor)' if layer.startswith('decor') else ('none (climb: anchor at its top)' if layer == 'climb' else 'none (hurts: no stand line)')
        try: span = int(r.get('walk_x1')) - int(r.get('walk_x0'))
        except (TypeError, ValueError): span = None
        ow, oh = play_size(role, w, h, fj, span)
        sw, shh = min(w, ow * 2), min(h, oh * 2)
        r['on_screen_px'] = f'{ow}x{oh}'
        r['ship_px'] = f'{sw}x{shh}'
        r['file_kb'] = round(os.path.getsize(r['_path']) / 1024, 1)
        r['_webp_native'] = webp_kb(img, (w, h)) if not args.fast else 0
        r['file_kb_ship'] = webp_kb(img, (sw, shh))
        r['draw_cost'] = 'one blit from a world cut atlas (packcut.py, like w1-cut.webp: one sheet per world kit)' if layer != 'danger look' or role != 'water' else 'a tiled strip (two blits a frame across the pit, like PIT_WATER)'
        if role in ('ground',): r['draw_cost'] = 'a tiled strip (repeat across the floor: seam must hold, see notes)'
        r['used_in'] = 'none (not placed)'
        st = status
        if not st and (w < ow * 1.5 or h < oh * 1.5): st = f'needs fix: only {w}x{h}, under 1.5x its play size {ow}x{oh} (soft on a phone: upscale)'
        r['status'] = st or 'ready'
        r['notes'] = notes
        rows.append(r)

    # source 1: art-raw 11-07
    for c in csv.DictReader(open(os.path.join(s1, 'cut/catalog.csv'))):
        fam, role, st = LOOK[c['id']]
        desc, made, fw = F[fam]
        p = os.path.join(s1, 'cut', c['file'])
        img = Image.open(p).convert('RGBA')
        sp = c['walk_top_x_span_px'].split('-') if c['walk_top_x_span_px'] else ['', '']
        walk = (c['walk_top_y_px'], sp[0], sp[1], '') if c['walk_top_y_px'] else None
        r = dict(id=c['id'], source='art-raw-2026-11-07 (Matt 11-07 sheets)', file='origin/art-raw-2026-11-07:cut/' + c['file'], kind=c['kind'],
                 float_class='may float' if 'FLOAT' in c['kind'] else ('grounded' if role in ('stone', 'stump', 'stepset', 'wall', 'pit') else ''), _path=p)
        if not r['float_class']: r['float_class'] = 'may float' if role in ('log', 'plank', 'bough') else ('attached' if role in ('vine', 'hang', 'thorn_hang') else 'grounded')
        old = c['world_fit']
        finish(r, img, role, fw, {}, made, st, f"{desc}. Old tag {old}. {c['notes']}", walk=walk)
        r['_old'] = old
        counts['1 art-raw-2026-11-07'] += 1
    # source 2: art-director manifest (11-05 cuts)
    for pc in man['pieces']:
        st_ = pc['file'][:-4]
        if pc['status'] != 'keep':
            held.append(dict(id=st_, source='art-director manifest', status=pc['status'], why=pc.get('note', ''), job=pc['job']))
            counts['2 art-director hold'] += 1; continue
        if st_ in atlas:
            counts['2 art-director in 1-1 atlas (B1 rows)'] += 1; continue
        fam, role, st = LOOK[st_]
        desc, made, fw = F[fam]
        p = os.path.join(s2, 'reference/art/cut', pc['file'])
        img = Image.open(p).convert('RGBA')
        fj = foot.get(st_)
        r = dict(id=st_, source='art-director manifest (gemini-2026-11-05)', file='origin/art-director:reference/art/cut/' + pc['file'], kind=pc['job'], _path=p,
                 float_class='may float' if role in ('log', 'plank', 'bough', 'island', 'ledge', 'fungus_shelf') else ('attached' if role in ('vine', 'rope', 'hang', 'thorn_hang') else 'grounded'))
        if role == 'ledge': r['float_class'] = 'may float (pending Matt; use from the floor up only)'
        old = ','.join(pc['worlds'])
        finish(r, img, role, fw, {}, made, st, f"{desc}. Old tag {old}. {pc.get('note', '')} {(fj or {}).get('note', '')}".strip(), fj=fj)
        r['_old'] = old
        counts['2 art-director kept (A rows)'] += 1
    # source 2b: the 14 W1-tinted variants (art-director e8061008, tools/art/w1keepers/tint.py: soil moved to W1's bank colour, same
    # shape, so the base piece's footing holds); not manifest rows, so listed here from the files themselves
    for tp in sorted(glob.glob(os.path.join(s2, 'reference/art/cut', '*-w1.png'))):
        fn = os.path.basename(tp); base = fn[:-7]
        fam, role, st = LOOK[base]
        desc, made, fw = F[fam]
        img = Image.open(tp).convert('RGBA')
        if made:
            st = 'needs fix: a W1 soil tint of a board-topped (made) ledge: no W1 use under the 11-11 rule; the base piece covers its worlds'
        fj = foot.get(base)
        r = dict(id=fn[:-4], source='art-director W1 tint (e8061008)', file='origin/art-director:reference/art/cut/' + fn, kind=f'W1 soil tint of {base}', _path=tp,
                 float_class='may float (pending Matt; use from the floor up only)' if role == 'ledge' else 'grounded')
        finish(r, img, role, fw, {}, made, st, f'{desc}. W1-tinted twin of {base} (INTEGRATE-1-1.md "The earth-wall tint"); footing = the base piece\'s.', fj=fj)
        counts['2b art-director W1 tints'] += 1
    # source 3: the 11-09, 11-11, 11-11b cuts and HF list 1 (already ten-world tagged)
    for cat, adir in (('matt-2026-11-09/cut', 'w1-1109'), ('matt-2026-11-11/cut', 'w1-1111'), ('matt-2026-11-11b/cut', 'w1-1111b'), ('hf-list1', 'w1-1111c')):
        for c in csv.DictReader(open(os.path.join(ROOT, 'reference/art-incoming', cat, 'catalog.csv'))):
            if c.get('status', 'kept') != 'kept':
                held.append(dict(id=c['id'], source=cat, status=c.get('status'), why=c.get('reason', ''), job=c['kind'])); counts[f'3 {cat} rejected'] += 1; continue
            p = os.path.join(ROOT, 'src/assets', adir, c['id'] + '.png')
            img = Image.open(p).convert('RGBA')
            role = role3(c['kind'], c['label'])
            txt = (c.get('world_why', '') + ' ' + c.get('notes', '')).lower()
            made = 'made thing' in txt or 'sawn' in txt or c['id'] in MADE3
            ws = parse_worlds(c['world'])
            lab = re.sub(r'^unlabelled \((.*)\)$', r'\1', c['label']).lower()
            fw = [(ws[0], c['world_why'])] + [(n, f"second fit: {lab} suits a world of {WORLD_IS[n].split(' is ')[-1].split(' are ')[-1]}") for n in ws[1:]]
            nofit = {}
            if c.get('world_no_fit'):
                m = re.match(r'no fit: ([\d ]+):\s*(.*)', c['world_no_fit'])
                if m:
                    for n in m.group(1).split(): nofit[int(n)] = f'{n} {WORLD[int(n)]}: {m.group(2)}'
            st = ''
            note = c.get('notes', '')
            if 'three-quarter' in note.lower() or 'diagonal' in note.lower() or c['id'] in ANG3:
                st = ANG if role in ('log', 'plank', 'stone', 'stump', 'push', 'stepset') else ''
            if c['id'] == 'P-07-d':
                st = 'needs fix: the pink glow round the leaves reads as key-colour fringe on a dark ground (seen on the w01 danger sheet); re-tint the glow'
            if 'FLAG' in note and not (R[role][0] == 'danger look' and any(k in note.lower() for k in ('reads as danger', 'read as sharp', 'reads as sharp'))):
                st = 'needs fix: ' + note[note.index('FLAG'):].split('.')[0]
            if role == 'ground' and ('seam' in note.lower() and 'visible' in note.lower()): st = 'needs fix: visible seam when tiled (' + note.split(':')[0][:80] + '); blend or overlap'
            redo = 'HF1-' + c['id']
            if c['id'].startswith('P-') and os.path.exists(os.path.join(ROOT, 'src/assets/w1-1111c', redo + '.png')):
                st = st or f'needs fix: small cut; use {redo} (the 2000 px HF redo of this piece)'
            walk = (c['walk_y'], c['walk_x0'], c['walk_x1'], c['flat']) if c['walk_y'] and c['walk_y'] != 'by hand' else None
            r = dict(id=c['id'], source=cat.split('/')[0], file=f'src/assets/{adir}/{c["id"]}.png', kind=c['kind'] + (f" ({c['label']})" if c.get('label') else ''),
                     float_class=c['float_class'], _path=p)
            finish(r, img, role, fw, nofit, made, st, note, walk=walk)
            counts[f'3 {cat} kept'] += 1
    rows.sort(key=lambda r: (r['source'], r['id']))
    os.makedirs(ART, exist_ok=True)
    with open(os.path.join(ART, 'catalog-cut.csv'), 'w', newline='') as f:
        wr = csv.DictWriter(f, COLS, extrasaction='ignore'); wr.writeheader(); wr.writerows(rows)
    with open(os.path.join(ART, 'holds-rejects.csv'), 'w', newline='') as f:
        wr = csv.DictWriter(f, ['id', 'source', 'status', 'job', 'why']); wr.writeheader(); wr.writerows(held)
    # app size of the cut pieces: native PNG, native WebP, WebP at ship_px
    js = dict(counts=counts, png_kb=round(sum(r['file_kb'] for r in rows)), webp_native_kb=round(sum(r['_webp_native'] for r in rows)),
              webp_ship_kb=round(sum(r['file_kb_ship'] for r in rows)))
    json.dump(js, open(os.path.join(ART, 'catalog-cut-sizes.json'), 'w'), indent=1)
    for k, v in sorted(counts.items()): print(f'{k}: {v}')
    print('A rows:', len(rows), 'held/rejected:', len(held), js)
    if not args.no_sheets: sheets(rows, Image)
    return rows


# ------------------------------------------------------------------------------------------------------------------------------
def sheets(rows, Image):
    """master-sheets/w<N>-<layer>.jpg: every A piece that fits world N (best fit starred), each tile half dark / half light, cyan footing"""
    from PIL import ImageDraw, ImageFont
    out = os.path.join(ART, 'master-sheets'); os.makedirs(out, exist_ok=True)
    try: fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    except Exception: fnt = ImageFont.load_default()
    T = 170
    groups = defaultdict(list)
    for r in rows:
        for n in parse_worlds(r['worlds']): groups[(n, r['layer'])].append(r)
    for (n, layer), rs in sorted(groups.items()):
        rs = sorted(rs, key=lambda r: (r['world_best'] != str(n), r['id']))
        cols = 8; nrow = (len(rs) + cols - 1) // cols
        im = Image.new('RGB', (cols * T, nrow * (T + 30)), (60, 64, 58)); d = ImageDraw.Draw(im)
        for i, r in enumerate(rs):
            x, y = (i % cols) * T, (i // cols) * (T + 30)
            d.rectangle([x + T // 2, y, x + T - 1, y + T - 1], fill=(214, 220, 206)); d.rectangle([x, y, x + T // 2, y + T - 1], fill=(34, 38, 34))
            p = Image.open(r['_path']).convert('RGBA'); k = min((T - 10) / p.width, (T - 10) / p.height)
            q = p.resize((max(1, int(p.width * k)), max(1, int(p.height * k))))
            ox, oy = x + (T - q.width) // 2, y + (T - q.height) // 2
            im.paste(q, (ox, oy), q)
            if str(r.get('walk_y', '')).strip() not in ('', 'by hand'):
                wy = oy + int(float(r['walk_y']) * k); d.line([ox + int(float(r['walk_x0']) * k), wy, ox + int(float(r['walk_x1']) * k), wy], fill=(0, 255, 255), width=2)
            lab = ('* ' if r['world_best'] == str(n) else '') + r['id'] + ('  FIX' if r['status'].startswith('needs fix') else '')
            d.text((x + 3, y + T + 1), lab[:28], fill=(255, 240, 160) if 'FIX' in lab else (240, 240, 230), font=fnt)
            d.text((x + 3, y + T + 15), f"{r['on_screen_px']} {r['engine_slot'].split(' ')[0]}"[:28], fill=(180, 200, 255), font=fnt)
        im.save(os.path.join(out, f"w{n:02d}-{layer.replace(' ', '-')}.jpg"), quality=80)
    # the 12 best for the re-laid 1-1
    best = pick_11(rows)
    cols = 6; im = Image.new('RGB', (cols * 260, 2 * 300), (60, 64, 58)); d = ImageDraw.Draw(im)
    for i, (slot, r) in enumerate(best):
        x, y = (i % cols) * 260, (i // cols) * 300
        d.rectangle([x + 130, y, x + 259, y + 259], fill=(214, 220, 206)); d.rectangle([x, y, x + 130, y + 259], fill=(34, 38, 34))
        p = Image.open(r['_path']).convert('RGBA'); k = min(250 / p.width, 250 / p.height)
        q = p.resize((max(1, int(p.width * k)), max(1, int(p.height * k)))); ox, oy = x + (260 - q.width) // 2, y + (260 - q.height) // 2
        im.paste(q, (ox, oy), q)
        if str(r.get('walk_y', '')).strip() not in ('', 'by hand'):
            wy = oy + int(float(r['walk_y']) * k); d.line([ox + int(float(r['walk_x0']) * k), wy, ox + int(float(r['walk_x1']) * k), wy], fill=(0, 255, 255), width=2)
        d.text((x + 3, y + 262), r['id'], fill=(255, 240, 160), font=fnt); d.text((x + 3, y + 278), slot, fill=(200, 220, 255), font=fnt)
    im.save(os.path.join(out, '1-1-best12.jpg'), quality=85)


SLOTS_11 = [('ground band strip', 'ground', 2), ('stone step', 'stone', 3), ('stump step', 'stump', 1), ('walkable log', 'log', 2),
            ('soft landing', 'soft', 1), ('hide spot', 'hide', 1), ('pit lip / danger', 'pit', 1), ('floating ledge', 'island', 1)]


def pick_11(rows):
    """the 12 best W1 candidates for the re-laid 1-1 by slot: fits W1 (best first), not made, ready, flattest top, biggest"""
    out = []
    for name, role, n in SLOTS_11:
        cand = [r for r in rows if R_of(r) == role and '1' in [str(x) for x in parse_worlds(r['worlds'])] and r['made_thing'] == 'n'
                and r['status'] == 'ready']
        def usable(r):
            try: return float(r.get('flat') or 0) * (int(r['walk_x1']) - int(r['walk_x0'])) / int(r['w'])
            except (TypeError, ValueError, KeyError): return 0
        cand.sort(key=lambda r: (r['world_best'] != '1', -usable(r), -int(r['w'])))
        out += [(name, r) for r in cand[:n]]
    return out[:12]


def R_of(r):
    for k, v in R.items():
        if v[1] == r['engine_slot'] and v[0] == r['layer']: return k
    return ''


# ------------------------------------------------------------------------------------------------------------------------------
ALIAS = {'file_kb_now': 'file_kb', 'kb': 'file_kb', 'kb_ship': 'file_kb_ship', 'ship_kb': 'file_kb_ship', 'file_kb_at_ship': 'file_kb_ship'}


# stale source cites in the B parts, corrected at merge (Critic, ART-CAT re-merge audit: the ground sheet's frames are read at these
# lines of src/game/groundPaint.ts, not at :219, which is endFace's GROUND_FRAMES lookup)
CITE_FIX = [('groundPaint.ts:219 GROUND_FRAMES[w].fills', 'groundPaint.ts:139-140 GROUND_FRAMES[w].fills'),
            ('groundPaint.ts:219 GROUND_FRAMES[w].lips', 'groundPaint.ts:202-203 GROUND_FRAMES[w].lips'),
            ('groundPaint.ts:219 GROUND_FRAMES[w].lip', 'groundPaint.ts:202-203 GROUND_FRAMES[w].lip'),
            ('groundPaint.ts:219 GROUND_FRAMES[w].ends', 'groundPaint.ts:68 GROUND_FRAMES[w].ends'),
            ('groundPaint.ts:219 GROUND_FRAMES[w].end', 'groundPaint.ts:68 GROUND_FRAMES[w].end')]


def fix_cites(r):
    for k, v in r.items():
        if 'groundPaint.ts:219' in v:
            for a, b in CITE_FIX: v = v.replace(a, b)
            r[k] = v
    return r


def load_b():
    out = {}
    for n in (1, 2, 3, 4):
        p = os.path.join(ART, f'catalog-game-B{n}.csv')
        txt = open(p).read() if os.path.exists(p) else None
        if txt is None:
            try: txt = sh('git', 'show', f'origin/t-art-catalog-b{n}:reference/art/catalog-game-B{n}.csv').decode()
            except subprocess.CalledProcessError: txt = None
        out[n] = [fix_cites({ALIAS.get(k.strip(), k.strip()): (v or '').strip() for k, v in r.items() if k}) for r in csv.DictReader(io.StringIO(txt))] if txt else None
    return out


def slot_key(s):
    """one key per engine slot across the parts' wordings: 'landing/platforms solid log', 'climbable/vines swing_liana', 'pickCut kind
    stone', a code file, or a new slot's name"""
    s = (s or '').strip()
    for a, b in (('landing platforms', 'landing/platforms'), ('climbable vines', 'climbable/vines'), ('climbable ropes', 'climbable/ropes')):
        s = s.replace(a, b)
    if s.startswith(('landing/platforms', 'climbable/')):
        return ' '.join(re.split(r'[;(:/]\s|\s/\s|[;(:]', s)[0].split()[:3]).rstrip(':')
    m = re.match(r'(pickCut kind \w+)', s)
    if m: return m.group(1)
    m = re.match(r'(src/[\w/.-]+?\.tsx?)', s)
    if m: return m.group(1)
    if s.startswith('new slot'): return s.split('(')[0].strip()[:60]
    return re.split(r'[;(]', s)[0].strip()[:60] or '(none)'


# ---- scale against Pokey (R-165.107, Matt 11-11: "we should keep things to scale... make sure that it is sized properly") ----
def pokey_units():
    """Pokey's drawn standing height in world units, read from the code: HERO_UNITS x HERO_SPRITE_SCALE (src/game/heroSprite.ts:30,32;
    every hero frame is drawn with k = that / the standing frame's height, heroSprite.ts:143). Not the 48-unit collider (engine.ts:954)."""
    t = open(os.path.join(ROOT, 'src', 'game', 'heroSprite.ts')).read()
    u = float(re.search(r'export const HERO_UNITS = ([\d.]+);', t).group(1))
    k = float(re.search(r'export const HERO_SPRITE_SCALE = ([\d.]+);', t).group(1))
    return u * k


# per-layer range of the drawn height in Pokey standing heights (lead 11-11, R-165.107). None: no range set (backdrops may exceed;
# climb, danger look and decor mid have none in the lead's table: they tile or stretch, or wait on a ruling). TERRAIN rows (ground,
# banks, soil, walls, and set pieces laid one platform per drawn ledge) are exempt from the platform and step caps.
SCALE_RANGE = {
    'step': (0.5, 1.0),
    'platform': (None, 1.0),
    'soft landing': (None, 1.0),
    'decor near': (0.2, 2.0),
    'backdrop': None, 'climb': None, 'danger look': None, 'decor mid': None,
}
# tiled or stretched: drawn as many tiles or stretched to a length the stage sets (a trunk or liana tiled up, a moss strip along a
# platform top, a rope post sized to its rope, a band along the bottom), so one tile's height is no verdict on its scale (Critic 11-11)
TILED = re.compile(r'tiled|\(tile|stretch(?!\s*<=)|drawRopes|band along', re.I)
TERRAIN = re.compile(r'ground|bank|soil|wall|floor|cliff|\blip|PIT_WATER|set piece|step set', re.I)


def drawn_h(r):
    """(drawn height in world units, basis) from on_screen_px. The parts wrote it three ways: 'WxH ...' in world units (A, B1, B3);
    a bare longest side in world units (B2); a bare longest side in CSS px on an upright phone, 0.94 px a unit (B4); 'est:N' an estimate
    (B4). 'stand span' rows (B1: a cut piece drawn to fit its platform, w1CutArt.ts cutBox:40-53) are sized by the platform the
    generator rolls and cropped at the foot, so they get no fixed height: basis 'fitted'; so are part A's pieces bound for pickCut."""
    s = (r.get('on_screen_px') or '').strip()
    try: w, h = float(r['w']), float(r['h'])
    except (TypeError, ValueError): return None, 'none'
    if 'stand span' in s or 'pickCut' in (r.get('engine_slot') or ''): return None, 'fitted'
    m = re.match(r'^(?:about\s*)?(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)', s)
    if m: return float(m.group(2)), 'drawn'
    m = re.match(r'^(est:)?(\d+(?:\.\d+)?)\b', s)
    if m:
        n = float(m.group(2)) / (0.94 if r.get('part') == 'B4' else 1)
        return n * h / max(w, h, 1), 'estimate' if m.group(1) else 'drawn'
    return None, 'none'


def add_scale(rows):
    pu = pokey_units()
    for r in rows:
        r['pokey_scale'] = r['scale_ok'] = r['scale_basis'] = ''
        lay = r.get('layer')
        if lay not in SCALE_RANGE: continue
        d, basis = drawn_h(r)
        r['scale_basis'] = basis
        if d is None: continue
        sc = d / pu
        r['pokey_scale'] = f'{sc:.2f}'
        rng = SCALE_RANGE[lay]
        if rng is None: continue
        if TILED.search(' '.join((r.get('on_screen_px') or '', r.get('engine_slot') or ''))):
            r['scale_basis'] = basis + ' (tiled: no verdict)'; continue
        if lay in ('platform', 'soft landing', 'step') and TERRAIN.search(' '.join((r.get('engine_slot') or '', r.get('kind') or '', r.get('id') or ''))):
            r['scale_basis'] = basis + ' (terrain: no cap)'; continue
        lo, hi = rng
        r['scale_ok'] = 'y' if (lo is None or sc >= lo - 1e-9) and (hi is None or sc <= hi + 1e-9) else 'n'
    return pu


def merge(args):
    a = list(csv.DictReader(open(os.path.join(ART, 'catalog-cut.csv'))))
    bs = load_b()
    missing = [n for n, v in bs.items() if v is None]
    if missing and not args.allow_missing: sys.exit(f'B parts not pushed yet: {missing} (use --allow-missing for a partial merge)')
    rows, seen, dup, counts, conflicts = [], {}, [], Counter(), []
    for r in a:
        r['part'] = 'A'; rows.append(r); seen[r['file']] = r; counts['A catalog-cut'] += 1
    # one row per image or atlas frame: on a file clash between B parts, characters, enemies and UI belong to B4, everything else to
    # the world-art part (B1 W1-4, B2 W5-10, B3 backdrops) that read its draw path
    own = {}
    for n, rs in bs.items():
        for r in rs or []:
            r['part'] = f'B{n}'
            f = r.get('file', '').split(' ')[0]
            if f in seen and seen[f]['part'] == 'A':
                dup.append((r['id'], f, 'A owns it')); counts[f'B{n} overlap with A (dropped)'] += 1; continue
            if f in own:
                o = own[f]
                b4 = r if r['part'] == 'B4' else o if o['part'] == 'B4' else None
                keep = (b4 if b4 is not None and b4.get('layer') in ('character', 'enemy', 'ui') else (o if o is not b4 else r)) if b4 is not None else o
                drop = r if keep is o else o
                dup.append((drop['id'], f, f"{keep['part']} owns it")); counts[f"{drop['part']} overlap with {keep['part']} (dropped)"] += 1
                own[f] = keep; continue
            own[f] = r
    for r in own.values():
        rows.append(r); counts[r['part']] += 1
    bad, menus = [], 0
    for r in rows:
        ws = parse_worlds(r.get('worlds', ''))
        menu = 'menu' in (r.get('worlds') or '').lower() and r.get('layer') in ('ui', 'character', 'backdrop', 'enemy', 'pickup', 'decor near', 'decor mid')
        if menu and not ws: menus += 1
        if not ws and not menu: bad.append((r['part'], r['id'], 'no world'))
        if not (r.get('engine_slot') or '').strip(): bad.append((r['part'], r['id'], 'no engine slot'))
        if not (r.get('layer') or '').strip(): bad.append((r['part'], r['id'], 'no layer'))
        if (r.get('made_thing') or '').lower().startswith('y') and 1 in ws:
            # a made thing the game ALREADY shows in World 1 is a fact for the lead to rule on (B1/B4 mark it); a W1 tag on one not in the
            # game is a tagging error
            if (r.get('status') or '').lower().startswith('in game'): conflicts.append(r)
            else: bad.append((r['part'], r['id'], 'made thing tagged W1'))
        if r.get('layer') in STANDABLE and (not (r.get('footing') or '').strip() or not (r.get('ship_px') or '').strip()):
            bad.append((r['part'], r['id'], 'standable without footing or ship_px'))
    # every image the game ships (src/assets) must be a row or an atlas's frames' file
    have = {re.split(r'[# ]', r.get('file', ''))[0] for r in rows}
    imgs = sorted(p for p in glob.glob(os.path.join(ROOT, 'src/assets/**/*'), recursive=True) if p.lower().endswith(('.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.avif')))
    rel = [os.path.relpath(p, ROOT) for p in imgs]
    for f in rel:
        if f not in have: bad.append(('-', f, 'image under src/assets with no row'))
    counts['(images under src/assets covered)'] = f'{sum(1 for f in rel if f in have)}/{len(rel)}'
    add_scale(rows)
    cols = COLS + ['part', 'pokey_scale', 'scale_ok', 'scale_basis']
    with open(os.path.join(ART, 'CATALOG-MASTER.csv'), 'w', newline='') as f:
        wr = csv.DictWriter(f, cols, extrasaction='ignore'); wr.writeheader(); wr.writerows(rows)
    counts['(B4 rows shown in menus only: worlds = menu)'] = menus
    write_md(rows, counts, dup, bad, missing, conflicts)
    for k, v in sorted(counts.items()): print(f'{k}: {v}')
    print('master rows', len(rows), 'problems', len(bad))
    for b in bad[:40]: print('  BAD', b)
    return 1 if bad else 0


def kb(x):
    try: return float(x)
    except (TypeError, ValueError): return 0.0


def write_md(rows, counts, dup, bad, missing, conflicts=()):
    L = ['# CATALOG-MASTER: every art piece, cut or in the game, all ten worlds', '',
         'Built by `python3 tools/art/catalog_master.py --merge` from `catalog-cut.csv` (part A: cut pieces not yet placed) and '
         '`catalog-game-B1..B4.csv` (part B: everything the game ships). Never hand-edited. Columns: see `tools/art/catalog_master.py` COLS.',
         'Play scale: 540 game px tall sideways, Pokey 48 game px; ship_px is at most twice the drawn size (R-165.99).', '']
    if missing: L += [f'**Partial merge: B part(s) {missing} not pushed yet.**', '']
    L += ['## Counts per source (sources minus overlap)', '', '| source | rows |', '|---|---|'] + [f'| {k} | {v} |' for k, v in sorted(counts.items())]
    L += ['', f'Total rows: **{len(rows)}**. Duplicates dropped: {len(dup)}. Rows failing a check: {len(bad)}.', '']
    if bad: L += ['### Rows failing a check', ''] + [f'- {p} {i}: {w}' for p, i, w in bad[:80]] + ['']
    pu = pokey_units()
    # drawn in a World 1 stage today: in game, and its used_in names a 1-N stage, every stage, or the puzzle rooms (1-4, 1-6 have them)
    in_w1 = lambda r: bool(re.search(r'(^|[\s,(])1-\d+\b', r.get('used_in') or '')) or (r.get('used_in') or '').startswith(('every stage', 'puzzle rooms'))
    w1g = [r for r in rows if (r.get('status') or '').lower().startswith('in game') and r.get('layer') in SCALE_RANGE and in_w1(r)]
    out = sorted((r for r in w1g if r.get('scale_ok') == 'n'), key=lambda r: -float(r['pokey_scale']))
    fitted = [r for r in w1g if r.get('scale_basis') == 'fitted']
    tiled = [r for r in w1g if 'tiled' in (r.get('scale_basis') or '')]
    L += [f'### In-game World 1 pieces out of scale (R-165.107: drawn height / Pokey standing {pu:.1f} units, heroSprite.ts:30,32)', '',
          'Ranges (catalog_master.py SCALE_RANGE): step 0.5-1.0; platform and soft landing no taller than 1.0; terrain (ground, '
          'banks, soil, walls, set pieces laid one platform a ledge) exempt; decor near 0.2-2.0; backdrop, climb, danger look and decor mid: no range set; tiled or stretched pieces (trunks, lianas, moss strips, rope posts) get no verdict. Pokey is 89.1 units drawn '
          '(the 48 in older notes is his collider, engine.ts:954). Columns pokey_scale, scale_ok, scale_basis in the csv.', '',
          '| id | layer | pokey_scale | range | on screen | used in |', '|---|---|---|---|---|---|']
    for r in out:
        lo, hi = SCALE_RANGE[r['layer']]
        L.append(f"| {r['id']} | {r['layer']} | {r['pokey_scale']} | {f'{lo}-{hi}' if lo is not None else f'up to {hi}'} | {(r.get('on_screen_px') or '')[:40]} | {(r.get('used_in') or '')[:40]} |")
    L += ['', f"Not judged: {len(fitted)} in-game W1 pieces drawn to fit their platform (w1CutArt.ts cutBox:40-53; their size is the platform's, "
          f"the generator's numbers): {', '.join(r['id'] for r in fitted)}.", '',
          f"Not judged, tiled or stretched (one tile is no verdict): {', '.join(r['id'] for r in tiled) or 'none'}.", '']
    if conflicts:
        def ruling(r):
            i = r['id']
            if i in ('w1-plank-ledge-a', 'w1-plank-ledge-b', 'w1-plank-ledge-c', 'w1-stump-wide') or 'TrailPost' in i: return 'SWAP (Matt 11-11): replace with natural W1 pieces'
            if i in ('w1#shut', 'w1#open') or i.startswith('puzzle-kit#') and ('Door' in i or 'Gate' in i) or i.startswith('B4:pickups/'): return 'STAYS (Matt 11-11)'
            return "Matt's call"
        L += ['### Made things the game shows in World 1 today (Matt, 11-11: swap the 1-1 planks, the sawn wide stump and the trail post; the gate, puzzle doors and keepsakes stay; the rest are his call)', '',
              '| part | id | used in | ruling | status |', '|---|---|---|---|---|'] + [f"| {r['part']} | {r['id']} | {(r.get('used_in') or '')[:60]} | {ruling(r)} | {(r.get('status') or '')[:100]} |" for r in conflicts] + ['']
    ingame = lambda r: (r.get('status') or '').lower().startswith('in game')
    for n in WORLD:
        rs = [r for r in rows if n in parse_worlds(r.get('worlds', ''))]
        L += [f'## World {n}: {WORLD[n]}', '', f'{len(rs)} pieces fit ({sum(1 for r in rs if ingame(r))} in game today, '
              f'{sum(1 for r in rs if not ingame(r))} available; {sum(1 for r in rs if str(r.get("world_best")) == str(n))} have it as best fit).', '',
              '| layer | in game | available | ready | needs fix |', '|---|---|---|---|---|']
        for lay in sorted({r.get('layer', '') for r in rs}):
            q = [r for r in rs if r.get('layer') == lay]
            L.append(f"| {lay} | {sum(1 for r in q if ingame(r))} | {sum(1 for r in q if not ingame(r))} | {sum(1 for r in q if (r.get('status') or '').startswith('ready'))} | {sum(1 for r in q if (r.get('status') or '').startswith('needs fix'))} |")
        LEVEL = STANDABLE | {'danger look', 'climb', 'decor near', 'decor mid', 'backdrop'}
        cast = Counter(r.get('layer') for r in rs if r.get('layer') not in LEVEL)
        L += ['', 'Cast and UI shown here (not level art): ' + ', '.join(f'{k} {v}' for k, v in sorted(cast.items())) + '.']
        lv = [r for r in rs if r.get('layer') in LEVEL]
        sc = Counter(slot_key(r.get('engine_slot')) for r in lv if not (r.get('status') or '').startswith('needs fix'))
        ig = Counter(slot_key(r.get('engine_slot')) for r in lv if ingame(r))
        top = sorted(sc.items(), key=lambda kv: -kv[1])
        L += ['', '| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |', '|---|---|---|'] + [f'| {k} | {ig.get(k, 0)} | {v} |' for k, v in top[:20]]
        if len(top) > 20: L.append(f'| ({len(top) - 20} more slots, {sum(v for _, v in top[20:])} pieces: see the csv) | | |')
        play = ('landing', 'climbable', 'other/', 'new slot', 'stageArtData', 'pickCut', 'w1CutArt')
        allslots = Counter(k for k in (slot_key(r.get('engine_slot')) for r in rows if r.get('layer') in STANDABLE | {'danger look', 'climb'}) if k.startswith(play))
        gaps = [k for k in allslots if sc.get(k, 0) < 3 and not (k.startswith('new slot: lava') and n != 9)
                and not (re.match(r'new slot: World (\d+)', k) and re.match(r'new slot: World (\d+)', k).group(1) != str(n))]
        L += ['', f"**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): {', '.join(sorted(gaps)) or 'none'}.", '']
        mv = [r for r in rs if str(r.get('world_best')) != str(n) and ingame(r)]
        mv = [r for r in mv if r.get('layer') in STANDABLE | {'danger look', 'climb', 'decor near', 'decor mid'}]
        if mv: L += [f"**Could move in from other worlds' kits** ({len(mv)} level pieces in game elsewhere, tagged to fit here; first 30): {', '.join(r['id'] for r in mv[:30])}.", '']
    L += ['## The 12 best candidates for the re-laid 1-1', '', 'Contact sheet: `master-sheets/1-1-best12.jpg` (dark half / light half, cyan = footing).', '',
          '| slot | id | size | footing | on screen | why |', '|---|---|---|---|---|---|']
    a_rows = [r for r in rows if r.get('part') == 'A']
    for slot, r in pick_11([dict(r, worlds=r['worlds']) for r in a_rows]):
        L.append(f"| {slot} | {r['id']} | {r['w']}x{r['h']} | {r['footing']} | {r['on_screen_px']} | {r['worlds'].split(';')[0]} |")
    def inbuild(r):
        u = (r.get('used_in') or '').lower(); st = (r.get('status') or '').lower()
        return st.startswith('in game') and u and not u.startswith(('none', 'not ')) and 'not imported' not in u + st and 'no stage' not in u + st
    ib = [r for r in rows if r.get('part', '').startswith('B') and inbuild(r)]
    k0 = sum(kb(r.get('file_kb')) for r in ib); k1 = sum(kb(r.get('file_kb_ship')) for r in ib)
    L += ['', '## App size if every in-build piece shipped at ship_px (an estimate)', '',
          f'- {len(ib)} rows the build imports and a stage or screen shows: {k0/1024:.1f} MB now, about {k1/1024:.1f} MB at ship_px: '
          f'an estimated saving of **{(k0-k1)/1024:.1f} MB**.',
          '- Estimate: atlas frames carry an area share of their sheet\'s file size and the ship size is scaled by area, not re-encoded. '
          'Rows not imported by the build or shown on no stage are left out; cut pieces (part A) are not in the build.', '']
    olds = [r for r in a_rows if r['source'].startswith(('art-raw', 'art-director')) and r['id'] in LOOK]
    L += ['## Spot-check: 20 older-batch pieces, old tag against new', '', '| id | old tag | new worlds (best first) | why |', '|---|---|---|---|']
    fam_of = {k: v[0] for k, v in LOOK.items()}
    pick, used = [], set()
    for r in sorted(olds, key=lambda r: (r['made_thing'] != 'y', r['world_best'] == '1', r['id'])):
        f = fam_of.get(r['id'])
        if f in used: continue
        used.add(f); pick.append(r)
        if len(pick) == 20: break
    for r in pick:
        old = re.search(r'Old tag ([^.]*)\.', r['notes']); fam = F[fam_of[r['id']]]
        L.append(f"| {r['id']} | {old.group(1) if old else ''} | {', '.join(str(x) for x in parse_worlds(r['worlds']))} | looks like {fam[0]}; best: {r['worlds'].split(';')[0]} |")
    L += ['', '## Holds and rejects (not in the table)', '', 'See `holds-rejects.csv`.', '']
    open(os.path.join(ART, 'CATALOG-MASTER.md'), 'w').write('\n'.join(L) + '\n')


# ---- --emit: the engine's copy (src/game/art/inventory.json), the columns it needs only; never hand-edited ----
EMIT_COLS = ['id', 'file', 'frame', 'world_best', 'worlds', 'kind', 'layer', 'engine_slot', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1',
             'float_class', 'made_thing', 'status', 'pokey_scale', 'scale_ok']


def num(v):
    v = (v or '').strip()
    if not re.fullmatch(r'-?\d+(\.\d+)?', v): return None
    f = float(v)
    return int(f) if f == int(f) else round(f, 1)


LEVEL_LAYERS = ('platform', 'step', 'soft landing', 'climb', 'danger look', 'decor near', 'decor mid')
PLAY_PREFIX = ('landing', 'climbable', 'other/', 'new slot', 'stageArtData', 'pickCut', 'w1CutArt')


def emit(args):
    """the engine's copy, one file a world so a stage build loads only its own (src/game/art/inventory/w<N>.json: the level art that
    fits world N, a row in every world it fits) and cast.json (characters, enemies, pickups, UI, backdrops, and rows with no world).
    Rows are arrays in cols order. file: the repo path (src/assets/... in the build; 'origin/<branch>:<path>' for a cut piece not packed
    yet); frame: the atlas frame after '#'; worlds: world numbers best first; world_best: a number, or null for menu-only rows;
    engine_slot: the catalog's slot key (slot_key; the full wording stays in the csv). Each world file carries play_slots: every
    standable, climb and danger slot in the whole catalog (gaps() needs the full list)."""
    src = os.path.join(ART, 'CATALOG-MASTER.csv')
    out, play = [], set()
    for r in csv.DictReader(open(src)):
        f = r['file'].strip()
        base, _, frame = f.partition('#') if '#' in f else (f, '', '')
        wb = (r.get('world_best') or '').strip()
        slot = slot_key(r.get('engine_slot'))
        if r.get('layer') in STANDABLE | {'danger look', 'climb'} and slot.startswith(PLAY_PREFIX): play.add(slot)
        out.append([r['id'], base.strip(), frame.strip() or None, int(wb) if wb.isdigit() else None, parse_worlds(r.get('worlds', '')),
                    r.get('kind', ''), r.get('layer', ''), slot, num(r['w']), num(r['h']), num(r['walk_y']),
                    num(r['walk_x0']), num(r['walk_x1']), (r.get('float_class') or '').strip(), (r.get('made_thing') or '').lower().startswith('y'),
                    (r.get('status') or '').strip(), float(r['pokey_scale']) if r.get('pokey_scale') else None,
                    {'y': True, 'n': False}.get((r.get('scale_ok') or '').strip())])
    d = os.path.join(ROOT, 'src', 'game', 'art', 'inventory')
    os.makedirs(d, exist_ok=True)
    old = os.path.join(ROOT, 'src', 'game', 'art', 'inventory.json')
    if os.path.exists(old): os.remove(old)
    L, W = EMIT_COLS.index('layer'), EMIT_COLS.index('worlds')
    files = {f'w{n}': [r for r in out if r[L] in LEVEL_LAYERS and n in r[W]] for n in WORLD}
    files['cast'] = [r for r in out if r[L] not in LEVEL_LAYERS or not r[W]]
    note = 'generated by python3 tools/art/catalog_master.py --emit from reference/art/CATALOG-MASTER.csv; never hand-edit'
    for name, rows in files.items():
        body = {'note': note, 'file': name, 'pokey_units': round(pokey_units(), 2), 'cols': EMIT_COLS, 'rows': rows}
        if name != 'cast': body['play_slots'] = sorted(play)
        p = os.path.join(d, f'{name}.json')
        with open(p, 'w') as fh:
            json.dump(body, fh, separators=(',', ':'), ensure_ascii=False); fh.write('\n')
        print(f'{name}.json: {len(rows)} rows, {os.path.getsize(p) / 1024:.0f} KB')
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--cut', action='store_true'); ap.add_argument('--merge', action='store_true')
    ap.add_argument('--tmp', help='reuse an extracted sources dir'); ap.add_argument('--fast', action='store_true', help='skip the full-size WebP sizing')
    ap.add_argument('--no-sheets', action='store_true'); ap.add_argument('--allow-missing', action='store_true')
    ap.add_argument('--emit', action='store_true', help='write src/game/art/inventory/*.json (the engine copy, a file a world) from CATALOG-MASTER.csv')
    a = ap.parse_args()
    if a.cut: build_cut(a)
    if a.merge:
        rc = merge(a)
        if rc: sys.exit(rc)
    if a.emit: sys.exit(emit(a))
    if not (a.cut or a.merge or a.emit): ap.print_help()

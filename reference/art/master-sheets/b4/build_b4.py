#!/usr/bin/env python3
"""Part B4 of the art master catalog (packet CONTENT-ART-DIRECTOR-catalog.md, 2026-11-11): every image the game ships for characters,
animals and enemies, UI, icons, story and photos, one row per atlas frame (from the game's own frame tables, extract_b4.mts) or per
single sprite. Writes reference/art/catalog-game-B4.csv. Read-only on src/.

Run (from the repo root):
  npx tsx reference/art/master-sheets/b4/extract_b4.mts /tmp/b4.json
  python3 reference/art/master-sheets/b4/build_b4.py /tmp/b4.json

on_screen_px is the longest side drawn, in CSS px on a 390x844 phone held upright (engine.ts applyZoom: max(390/440, 844/900) = 0.94
canvas px per world unit; landscape is 390/540 = 0.72, smaller). A number is read from the code's own scale (world units per sheet px,
cited in engine_slot); "est:N" is an estimate whose basis is in REPORT.md (UI and story pictures drawn by CSS or fit-to-screen).
ship_px = no bigger than on_screen x 2 (R-165.99), never above the frame's own size. file_kb at ship_px scales the file by area.
"""
import csv, glob, json, os, re, subprocess, sys
from collections import defaultdict
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
A = os.path.join(ROOT, 'src', 'assets')
Z = 0.94  # CSS px per world unit, upright phone (engine.ts:1083 applyZoom)

data = json.load(open(sys.argv[1]))
FR = defaultdict(list)
for f in data['frames']:
    FR[f['file']].append(f)
STAGES = data['stages']           # stage id -> sheet keys it asks for (stageSheets.ts)
FOE = data['foeSheets']           # creature -> its sheet files (spriteSheets.ts, creatureAnim.ts)

DIRS = ['characters', 'hero', 'enemies', 'bosses', 'icons', 'hud', 'medals', 'ui', 'title', 'photos', 'story', 'items', 'pickups']
EXTRA = ['flora/birds-atlas.webp', 'flora/butterflies-atlas.webp', 'flora/heartbloom-bud.webp', 'flora/heartbloom-bloom.webp', 'flora/heartbloom-epic.webp',
         'flora/heartbloom-ultimate.webp', 'w8/pokey-jar.webp']
files = []
for d in DIRS:
    for p in sorted(glob.glob(os.path.join(A, d, '**', '*'), recursive=True)):
        if os.path.isfile(p) and p.endswith(('.webp', '.png', '.jpg')):
            files.append(os.path.relpath(p, A))
files += EXTRA

# ---- where each file is referenced in code (first hit; a glob counts for its folder) ----
def code_ref(rel):
    base = os.path.basename(rel)
    stem = base[:-5]
    pats = [rel, base]
    for pat in pats:
        r = subprocess.run(['grep', '-rn', '--include=*.ts', '--include=*.tsx', '--include=*.css', '-F', pat, 'src'], cwd=ROOT,
                           capture_output=True, text=True).stdout.splitlines()
        r = [x for x in r if '.test.' not in x]
        if r:
            return ':'.join(r[0].split(':')[:2])
    folder = os.path.dirname(rel)
    r = subprocess.run(['grep', '-rn', '--include=*.ts', '--include=*.tsx', '-E', f"assets/{re.escape(folder)}/(\\*|\\$\\{{|<)", 'src'],
                       cwd=ROOT, capture_output=True, text=True).stdout.splitlines()
    r = [x for x in r if '.test.' not in x and 'glob' in x or '${' in x]
    if r and not folder.startswith('story/drake') and not stem.startswith(('chip-', 'slider-')):
        return ':'.join(r[0].split(':')[:2])
    return ''

def stages_with(pred):
    return sorted((s for s, keys in STAGES.items() if pred(keys)), key=lambda s: (int(s.split('-')[0]) if s[0].isdigit() else 99, s))

def foe_stages(name):
    return stages_with(lambda k: f'foe:{name}' in k or f'anim:{name}' in k)

ALL = sorted(STAGES, key=lambda s: (int(s.split('-')[0]) if s.split('-')[0].isdigit() else 99, s))
def worlds_of(stage_ids):
    return sorted({int(s.split('-')[0]) for s in stage_ids if s.split('-')[0].isdigit()})

def compress(stage_ids):
    by = defaultdict(list)
    for s in stage_ids:
        w, m = s.split('-', 1)
        by[w].append(m)
    out = []
    for w in sorted(by, key=lambda x: int(x) if x.isdigit() else 99):
        ms = by[w]
        out.append(f'{w}-*' if len(ms) >= 10 else ','.join(f'{w}-{m}' for m in sorted(ms, key=lambda m: int(m) if m.isdigit() else 99)))
    return ' '.join(out)

# ---- the groups: one per atlas or set of singles (prefix match on the file path, first wins) ----
# fields: kind, layer, slot (the code that draws it), k (world units per sheet px, or None), shown (callable -> (worlds list, used_in, why)),
#         status, made, est (callable(w,h) -> on-screen estimate for UI/story, used when k is None)
HERO_K = 66 * 1.35 / 200
def every_stage(why):
    return lambda: (list(range(1, 11)), 'every stage (' + why + ')', why)
def menus(why):
    return lambda: ([], 'menus: ' + why, why)
def foe(name, why):
    def f():
        st = foe_stages(name)
        return (worlds_of(st), compress(st), why)
    return f
def boss(w, why):
    return lambda: ([w], f'{w}-10 (boss lair)', why)
def story(ws, why):
    return lambda: (ws, 'story scenes: ' + why, why)
def nowhere(why):
    return lambda: ([], 'none (' + why + ')', why)
half = lambda w, h: max(w, h) / 2
G = []
def g(prefix, kind, layer, slot, k=None, shown=None, status='in game', made='n', est=None):
    G.append(dict(prefix=prefix, kind=kind, layer=layer, slot=slot, k=k, shown=shown, status=status, made=made, est=est))

# characters: Pokey
g('hero/hero-standard', 'character', 'character', 'src/game/heroStandard.ts:17 drawStandard; STD_FRAMES (heroStandardData.ts); k=66*1.35/STD_STAND_H 200 (heroSprite.ts:30-32)', HERO_K, every_stage('Pokey, every move'))
g('hero/hero-atlas', 'character', 'character', 'src/game/heroSprite.ts:84 HERO_FRAMES (heroAtlasData.ts); k=66*1.35/HERO_STAND_H 303.2 (heroSprite.ts:143); also HeroPose/HeroFaceIcon/CoatPreview menus', 66 * 1.35 / 303.2, every_stage('Pokey, older pose set; menus'))
g('hero/clips/', 'character', 'character', 'src/game/heroClips.ts:47 HERO_CLIPS grid (heroClipsData.ts), scaled to the standard hero', HERO_K, every_stage("Pokey's painted moments (ALWAYS 'hero-clips', stageManifest.ts:28)"))
g('hero/hero-rope', 'character', 'character', 'src/game/heroRope.ts:22 ROPE_FRAMES; ROPE_K=(66*1.35)/ROPE_STAND_PX 190 (heroRope.ts:35)', 66 * 1.35 / 190, every_stage('Pokey on a rope'))
g('hero/hero-vine', 'character', 'character', 'src/game/heroVine.ts:16 VINE_FRAMES; K=VINE_HANG 102/VINE_BODY_PX 423.3 (heroVine.ts:39)', 102 / 423.3, every_stage('Pokey hanging on a vine'))
g('hero/pokey-swim', 'character', 'character', 'src/game/heroSwim.ts:24 SWIM_MOVES (heroSwimData.ts); k=hero unit (heroSwim.ts:28)', HERO_K,
  lambda: (worlds_of(stages_with(lambda k: 'swim' in k)), compress(stages_with(lambda k: 'swim' in k)), 'Pokey swimming'))
g('hero/hero-studies', 'character', 'character', 'src/game/heroStudies.ts:39 STUDY_FRAMES (heroStudiesData.ts); k=hero-atlas k x frame sc (heroStudiesData.ts:2)', 66 * 1.35 / 303.2, every_stage('Pokey kicks and studies'))
g('hero/hero-story', 'character', 'character', 'src/game/storyActors.ts:17 (milo) STORY_FRAMES (heroStoryData.ts)', None, story(list(range(1, 11)), 'Pokey cutscene poses'), est=half)
g('hero/journal-poses', 'character', 'ui', 'src/components/HowToPlay.tsx:27 POSE_CELL 3x3 cells', None, menus('How to Play poses'), est=half)
g('hero/title-idle', 'character', 'ui', 'src/components/KitParts.tsx:5 PeekPokey', None, menus('Pokey peeking over menu panels'), est=half)
g('w8/pokey-jar', 'character', 'character', 'src/game/w8LanternRun.ts:45 POKEY_JAR_FRAMES (w8LanternAtlas.ts:7), standard frames scale', HERO_K,
  lambda: ([8], '8 lantern run (w8LanternRun.ts)', 'Pokey carrying the lantern jar'))
g('title/clip-', 'character', 'ui', 'src/components/title/titleCast.ts:14 POKEY_CAST/MEECA_CAST/PAIR_LAUGH grids', None, menus('title screen cast'), est=lambda w, h: max(w, h) / 1.6)
# Meeca, Dot, Flicker
g('characters/meeca-standard', 'character', 'character', 'src/game/jennifurSprite.ts:96 MEECA_FRAMES; K=MEECA_UNITS 90/MEECA_STAND_H 205 (jennifurSprite.ts:25-27)', 90 / 205,
  lambda: (sorted(set([5] + list(range(1, 11)))), 'Meeca stage (5) + story scenes W1-W10 + crest (crests.ts:56)', 'Meeca'))
g('characters/meeca-carve', 'character', 'character', 'src/game/meecaCarveData.ts:6 MEECA_CARVE_FRAMES (same px as meeca-standard)', 90 / 205, nowhere('not used by any stage yet, meecaCarveData.ts:4'), status='ready: data wired, no stage draws it')
g('characters/meeca-blanket', 'character', 'character', 'src/game/meecaBlanketData.ts:7 MEECA_BLANKET_FRAMES', 90 / 205,
  lambda: ([5], "Meeca's stage (stagePreload.ts imports MEECA_BLANKET_URL)", 'Meeca with her blanket'))
g('characters/dot-atlas', 'character', 'character', 'src/game/dotSprite.ts:14 drawDotFrame DOT_FRAMES (dotAtlasData.ts); k given by caller', None,
  lambda: (list(range(1, 11)), "Dot's flight stage + story HD figures + guide", 'Dot'), est=lambda w, h: max(w, h) * 0.25 * Z)
g('characters/dot-perch-atlas', 'character', 'ui', 'src/components/hud/painted.tsx:15 DOT_PERCH_FRAMES (dotPerchAtlasData.ts), HUD perch', None, every_stage("Dot perched on the HUD ('perch' on every stage)"), est=lambda w, h: max(w, h) / 3)
g('characters/flicker-anim', 'character', 'character', 'src/game/flickerAnimData.ts:4 FLICKER_ANIM', None,
  lambda: ([5], compress(foe_stages('flicker')) or "Meeca's stage", 'Flicker the firefly'), est=lambda w, h: max(w, h) * 0.25 * Z)
g('characters/cels-', 'character', 'character', 'src/game/storyCels.ts:25 CELS by page (storyCelData.ts), CEL_K=270/205', None, story(list(range(1, 11)), 'story cast cels'), est=half)
g('story/hd/', 'character', 'character', 'src/game/storyHd.ts:26 HD_<set>_FRAMES by page (storyHdData_<set>.ts)', None, story(list(range(1, 11)), 'story figures, HD'), est=half)
# predators and road creatures
P = [('enemies/goldsnake-', 'goldsnake', 'src/game/goldSnake.ts:65/68/71 heads + GOLDSNAKE_ANIM (goldsnakeAnimData.ts); body in world units, head ~18 (goldSnake.ts:79)', None),
     ('enemies/snake-atlas', None, 'src/game/snakeSprite.ts:55 SNAKE_FRAMES; K=18/SNAKE_ATLAS_HEAD 75 (snakeSprite.ts:21)', 18 / 75),
     ('enemies/snake2-atlas', None, 'src/game/snakeSprite.ts:60 SNAKE2_FRAMES (K2, snakeSprite.ts:144)', 18 / 75),
     ('enemies/boa-atlas', 'boa', 'src/game/boaSprite.ts:56 BOA_FRAMES; K=0.4 (boaSprite.ts:26)', 0.4),
     ('enemies/boa-anim', 'boa', 'src/game/boaAnimData.ts:5 BOA_ANIM; K/BOA_ANIM_UP 1.2', 0.4 / 1.2),
     ('enemies/eagle-atlas', 'eagle', 'src/game/eagleSprite.ts:57 EAGLE_FRAMES; K=0.44 (eagleSprite.ts:25)', 0.44),
     ('enemies/eagle-anim', 'eagle', 'src/game/eagleAnimData.ts:5 EAGLE_ANIM; K/1.5', 0.44 / 1.5),
     ('enemies/turtle-atlas', 'turtle', 'src/game/turtleArt.ts:154 TURTLE_FRAMES; K=66/TURTLE_WALK_W 280 (turtleArt.ts:175)', 66 / 280),
     ('enemies/turtle-anim', 'turtle', 'src/game/turtleAnimData.ts:5 TURTLE_ANIM; K/0.9', 66 / 280 / 0.9),
     ('enemies/ocelot-atlas', 'ocelot', 'src/game/ocelotSprite.ts:60 OCELOT_FRAMES; K=0.40 (ocelotSprite.ts:28)', 0.40),
     ('enemies/ocelot-anim', 'ocelot', 'src/game/ocelotAnimData.ts:5 OCELOT_ANIM; K/1.5', 0.40 / 1.5),
     ('enemies/jaguar-atlas', 'jaguar', 'src/game/jaguarSprite.ts:59 JAGUAR_FRAMES; K=0.48 (jaguarSprite.ts:28)', 0.48),
     ('enemies/jaguar-anim', 'jaguar', 'src/game/jaguarAnimData.ts:5 JAGUAR_ANIM; K/1.5', 0.48 / 1.5),
     ('enemies/spider-atlas', 'spider', 'src/game/spiderSprite.ts:52 SPIDER_FRAMES; K=0.46 (spiderSprite.ts:20)', 0.46),
     ('enemies/spider-anim', 'spider', 'src/game/spiderAnimData.ts:5 SPIDER_ANIM; K/1.6', 0.46 / 1.6),
     ('enemies/tayra-atlas', 'tayra', 'src/game/tayraSprite.ts:53 TAYRA_FRAMES; K=0.33 (tayraSprite.ts:21)', 0.33),
     ('enemies/caiman-atlas', 'caiman', 'src/game/caimanSprite.ts:52 CAIMAN_FRAMES; K=0.58 (caimanSprite.ts:21)', 0.58),
     ('enemies/harpy-atlas', 'harpy', 'src/game/harpySprite.ts:49 HARPY_FRAMES; K=0.42 (harpySprite.ts:21)', 0.42),
     ('enemies/frog-atlas', 'frog', 'src/game/frogSprite.ts:51 FROG_FRAMES; K=0.38 (frogSprite.ts:20)', 0.38),
     ('enemies/guard-atlas', 'guard', "src/game/guardArt.ts:36 GUARD_FRAMES; K=80/GUARD_STAND_H 245 (guardArt.ts:40)", 80 / 245),
     ('enemies/guard-anim', 'guard', 'src/game/guardAnimData.ts:5 GUARD_ANIM; K/1.2', 80 / 245 / 1.2)]
for pre, name, slot, k in P:
    why = (name or 'snake') + ' (predator)'
    if name:
        g(pre, 'animal', 'enemy', slot, k, foe(name, why), est=(lambda w, h: 40 * Z) if k is None else None)
    else:
        g(pre, 'animal', 'enemy', slot, k, lambda: (sorted({1}), "fallback for the golden snake with ?snake=classic (spriteSheets.ts:31) + journal", 'classic snake'),
          status='ready: fallback sheet only (?snake=classic), not drawn in normal play')
g('enemies/pell-anim', 'character', 'enemy', 'src/game/pellAnimData.ts:9 PELL_ANIM (anim:pell)', None, lambda: ([5], compress(foe_stages('pell')) or "Meeca's stage", 'Lieutenant Pell'), est=lambda w, h: max(w, h) / 1.6 * 0.4 * Z)
g('enemies/soldier-anim', 'character', 'enemy', 'src/game/soldierAnimData.ts:9 SOLDIER_ANIM (anim:soldier)', None, lambda: ([5], compress(foe_stages('soldier')) or "Meeca's stage", "Iron-Claw's soldiers"), est=lambda w, h: max(w, h) / 1.6 * 0.4 * Z)
for nm in ['butler', 'seamstress', 'dangler', 'dozer', 'mantis']:
    g(f'enemies/{nm}-', 'character' if nm in ('butler', 'seamstress') else 'animal', 'enemy', f'src/game/{nm}AtlasData.ts:4 {nm.upper()}_FRAMES / {nm}AnimData.ts', None,
      nowhere(f'{nm}: data wired, not used by any stage yet ({nm}AtlasData.ts:2)'), status='ready: data wired, no stage draws it', est=lambda w, h: max(w, h) * 0.4 * Z)
g('enemies/journal-cards', 'animal', 'ui', 'src/game/journalCardsData.ts:2 JOURNAL_CARDS (CreaturePic, satchel Creatures tab)', None, menus('Jungle Journal creature cards'), est=half)
# bosses (createPaintedBoss k = world units per sheet px, paintedBoss.ts:107)
B = [('enemies/venom-atlas', 1, 'src/components/icons/crests.ts:45 crest + venomRig.ts:195 STILL_K; VENOM_FRAMES', None),
     ('enemies/venom2-atlas', 1, 'src/game/venomRig.ts:17 VENOM2_FRAMES rig (K=VF.S/VENOM2_PX, venomRig.ts:18)', None),
     ('enemies/venom-body', 1, 'src/game/venomRig.ts:21 body strip', None),
     ('enemies/croc-anim', 2, 'src/game/crocSprite.ts:52 CROC_ANIM_FRAMES; k=0.8/CROC_ANIM_UP 1.5 (crocSprite.ts:54)', 0.8 / 1.5),
     ('enemies/croc-atlas', 2, 'src/components/icons/crests.ts:46 crest only (CROC_FRAMES)', None),
     ('enemies/prowler-anim', 3, 'src/game/prowlerSprite.ts:74 PROWLER_ANIM_FRAMES; k=0.78/PROWLER_ANIM_UP 2 (prowlerSprite.ts:76)', 0.78 / 2),
     ('enemies/prowler-atlas', 3, 'src/components/icons/crests.ts:47 crest only (PROWLER_FRAMES)', None),
     ('enemies/sovereign-atlas', 4, 'src/game/sovereignSprite.ts:44 SOVEREIGN_FRAMES; k=0.85 (sovereignSprite.ts:46)', 0.85),
     ('enemies/queen-atlas', 5, 'src/game/queenSprite.ts:27 QUEEN_FRAMES; k=0.9 (queenSprite.ts:29)', 0.9),
     ('enemies/queen-anim', 5, 'src/game/queenAnimData.ts:6 QUEEN_ANIM; k/QUEEN_ANIM_UP 2', 0.45),
     ('enemies/reaver-atlas', 6, 'src/game/reaverSprite.ts:20 REAVER_FRAMES; k=1.2 (reaverSprite.ts:22)', 1.2),
     ('enemies/golem-atlas', 7, 'src/game/golemSprite.ts:21 GOLEM_FRAMES; k=1.15 (golemSprite.ts:23)', 1.15),
     ('enemies/monarch-atlas', 8, 'src/game/monarchSprite.ts:18 MONARCH_FRAMES; k=0.8 (monarchSprite.ts:20)', 0.8),
     ('enemies/drake-atlas', 9, 'src/game/drakeSprite.ts:19 DRAKE_FRAMES; k=0.8 (drakeSprite.ts:21)', 0.8),
     ('enemies/ironclaw-atlas', 10, 'src/game/ironclawSprite.ts:21 IRONCLAW_FRAMES; k=0.72 (ironclawSprite.ts:23)', 0.72),
     ('enemies/thornbark-atlas', 7, 'src/game/thornbarkSprite.ts:22 THORNBARK_FRAMES; k=0.5 (thornbarkSprite.ts:24)', 0.5)]
for pre, w, slot, k in B:
    crest = 'crest only' in slot
    g(pre, 'animal' if w != 10 else 'character', 'enemy', slot, k, boss(w, 'guardian of World %d' % w) if not crest else
      (lambda w=w: ([w], 'menus: guardian crest (crests.ts) + journal', 'crest')),
      status='in game' if not crest else 'in game (crest only; the fight draws the -anim sheet)', est=(lambda ww, hh: max(ww, hh) / 2) if k is None else None)
g('bosses/boss-atk', 'hazard', 'danger look', 'src/game/bossAtk.ts:12 BOSS_ATK (bossAtkData.ts) attacks drawn at o.ax/ay', None,
  lambda: (list(range(1, 11)), 'boss lairs 1-10 .. 10-10', 'boss attacks'), est=lambda w, h: max(w, h) * 0.5 * Z)
g('bosses/boss-fx', 'hazard', 'danger look', 'src/game/bossFx.ts:15 BOSS_FX (bossFxData.ts): lava, bolts, lair props, W9/10 hazard pieces', None,
  lambda: (list(range(1, 11)), 'boss lairs + W9/W10 zones', 'boss effects and lair props'), est=lambda w, h: max(w, h) * 0.5 * Z)
g('bosses/boss-910', 'prop', 'decor near', 'src/game/boss910Data.ts:1 BOSS910 (not drawn yet, boss910Data.ts:2)', None, nowhere("9-10 set pieces, not drawn yet"),
  status='ready: cut, not drawn yet', made='y', est=lambda w, h: max(w, h) * 0.5 * Z)
g('bosses/boss-1010', 'prop', 'decor near', 'src/game/boss1010Data.ts:1 BOSS1010 (not drawn yet, boss1010Data.ts:2)', None, nowhere("10-10 set pieces, not drawn yet"),
  status='ready: cut, not drawn yet', made='y', est=lambda w, h: max(w, h) * 0.5 * Z)
# ambient animals
g('flora/birds-atlas', 'animal', 'decor mid', 'src/game/birdSprites.ts:79 BIRD_FRAMES; k=size*sc/biggestSide (birdSprites.ts:119), size ~30 units', None,
  lambda: ([2, 4, 5, 6, 7, 9], 'every stage of its worlds (backdrop fauna, birdSprites.ts:156)', 'birds'), est=lambda w, h: 30 * Z)
g('flora/butterflies-atlas', 'animal', 'decor mid', 'src/game/butterflySprites.ts:73 BUTTERFLY_FRAMES; size 28-38 units (butterflySprites.ts:23)', None,
  lambda: ([1, 3, 5, 7, 8, 10], 'every stage of its worlds (butterflySprites.ts:34)', 'butterflies'), est=lambda w, h: 34 * Z)
g('flora/heartbloom-', 'story', 'decor near', 'src/game/storyArt.ts:120-123 BLOOM_URLS (bloomImage, the Heartbloom in its four stages)', None,
  story(list(range(1, 11)), 'the Heartbloom in the story scenes'), est=half)
# UI
g('hud/hud-atlas', 'ui', 'ui', 'src/components/hud/painted.tsx:14 HUD_PIECES (hudAtlasData.ts), HUD_ART_SCALE 3 (CSS px = sheet/3)', None, every_stage('HUD vine, plates, menu leaf'), made='n', est=lambda w, h: max(w, h) / 3)
g('icons/', 'icon', 'ui', 'src/components/icons/PaintedIcon.tsx:19 glob icons/*.webp (shipped at 2x its largest on-screen size, PaintedIcon.tsx:5)', None, menus('painted icons'), made='y', est=half)
g('medals/', 'ui', 'ui', 'src/components/BadgeMedal.tsx:8 MEDALLION_FRAMES/EMBLEM_FRAMES (medalAtlasData.ts)', None, menus('badge medals'), made='y', est=half)
g('ui/trails', 'ui', 'ui', 'src/components/WorldMap.tsx:27 TRAILS[world] (trailsData.ts)', None, menus('world map trails, one set per world'), est=lambda w, h: max(w, h))
g('ui/ui-kit', 'ui', 'ui', 'src/components/icons/index.tsx:28 UI_KIT stars', None, menus('star slots'), made='y', est=half)
g('ui/ctest-1-1', 'ui', 'ui', 'src/components/ControlTestGate.tsx:93 still', None, menus('control test gate still'), est=half)
g('ui/slider-track', 'ui', 'ui', 'new slot: none (index.css styles the slider with slider-empty/fill/knob; nothing reads slider-track)', None, nowhere('never referenced'), status='needs fix: shipped but never referenced (dead weight)', made='y', est=half)
g('ui/', 'ui', 'ui', '', None, menus('menu kit (title sign, satchel, tokens, card frame, chips, sliders)'), made='y', est=half)
g('title/', 'ui', 'ui', '', None, menus('title logo slab and log'), made='y', est=half)
g('pickups/', 'pickup', 'pickup', 'src/game/pickupSprites.ts:11 glob pickups/*.webp; drawPickup size 27-34 units (vectorArt.ts:1092,1152)', None,
  every_stage("keepsake pickups (ALWAYS 'pickups', stageManifest.ts:28); HUD hudArt.tsx:19"), made='y', est=lambda w, h: 34 * Z)
g('items/', 'item', 'ui', 'src/game/items.ts:2 glob items/*.webp (itemUrl)', None, menus('keepsake pictures in the satchel and finds'), made='y', est=half)
# story and photos
g('story/plates/', 'story', 'backdrop', 'src/game/plates.ts:2 glob story/plates (plateData.ts keys), drawn instead of the world scenery', None, None, est=lambda w, h: 844 * max(w, h) / w)
g('story/live/', 'story', 'backdrop', 'src/game/livePlates.ts:26 LIVE_PLATES grid over its plate', None, None, est=lambda w, h: max(w, h) / 2)
g('story/ground/', 'story', 'backdrop', 'src/game/storyGround.ts:20 story/ground/w<N>.webp (the branch the cast stands on)', None, None, est=lambda w, h: 844)
g('story/cards/', 'story', 'ui', 'src/game/endCards.ts:6 glob story/cards (END_CARDS endCardsData.ts:9), 1920x1080 card fit to screen', None, None, est=lambda w, h: 844)
g('story/castle', 'story', 'backdrop', 'src/game/castleSprites.ts:45-47 CASTLES', None, None, est=half)
g('story/finds/', 'story', 'ui', 'src/game/findArt.ts:92 / FindReader.tsx:13', None, menus('find cards (the snail, the notch)'), est=half)
g('story/drake/', 'story', 'character', 'new slot: 9-10 tea-scene story figures (no code reads story/drake/*)', None, nowhere('no code references story/drake/*'), status='needs fix: shipped but never referenced (dead weight in the app; wire into the 9-10 tea scene or drop)', est=half)
g('photos/', 'photo', 'ui', 'src/game/photos.ts:2 glob photos/*.webp (photoUrl, the photo books)', None, menus('old photographs in the photo books'), est=half)

def group_for(rel):
    for gr in G:
        if rel.startswith(gr['prefix']):
            return gr
    raise SystemExit('no group for ' + rel)

# story plates and cards: which worlds (chapter w: N before the plate's line in storyWorlds/Memories/Finale; w-prefixed keys by name)
def plate_worlds():
    out = defaultdict(set)
    for fn in ['storyWorlds.ts', 'storyMemories.ts', 'storyFinale.ts']:
        cur = 10 if fn == 'storyFinale.ts' else None
        for line in open(os.path.join(ROOT, 'src/game', fn)):
            m = re.search(r'\bw: (\d+)', line)
            if m and 'chapter(' in line:
                cur = int(m.group(1))
            for p in re.findall(r"plate: '([a-z0-9-]+)'", line):
                if cur:
                    out[p].add(cur)
    return out
PW = plate_worlds()
CARD_W = {'venom-fang': 1, 'crocus-rex': 2, 'shadow-prowler': 3, 'sky-sovereign': 4, 'tarantula-queen': 5, 'marsh-reaver': 6, 'stone-golem': 7,
          'night-wing-monarch': 8, 'magma-drake': 9, 'general': 10}

def story_shown(rel):
    stem = os.path.basename(rel)[:-5]
    m = re.match(r'w(\d+)', stem)
    if rel.startswith('story/plates/') or rel.startswith('story/live/'):
        ws = sorted(PW.get(stem, set()) | ({int(m.group(1))} if m else set()))
        return (ws, 'story scenes' + (' (chapters W' + ',W'.join(map(str, ws)) + ')' if ws else ''), 'story plate')
    if rel.startswith('story/ground/'):
        return ([int(m.group(1))], f'story scenes of World {m.group(1)}', 'story branch')
    if rel.startswith('story/cards/'):
        w = CARD_W.get(stem)
        return ([w] if w else list(range(1, 11)), 'end card after ' + (f'{w}-10' if w else 'the story beat that names it'), 'end card')
    if rel.startswith('story/castle'):
        n = int(stem[-1])
        return ([n], f'World {n} (castleSprites.ts CASTLES[{n}])', 'castle in the backdrop')
    return ([], '', '')

def fmt_worlds(ws, why):
    why = why.replace(';', ',')
    return '; '.join(f'{w} {why}' for w in ws) if ws else 'menu (not in a world)'

def no_fit(ws):
    rest = [w for w in range(1, 11) if w not in ws]
    if not ws:
        return 'n/a: not drawn in a world (B4 lists where shown only)'
    return '; '.join(f'{w} not shown there today' for w in rest) if rest else ''

# looked at on dark ground at play size (edgecheck_b4.py + the zoom sheets): frames with white key-out specks or a white sticker rim
EDGE = json.load(open(os.path.join(ROOT, 'reference/art/master-sheets/b4/edgecheck-frames.json')))
EDGE_FIX = {'enemies/ironclaw-atlas.webp': (0.05, 'needs fix: white key-out specks along the cape and edges (seen at play size on dark ground); re-key the frame'),
            'medals/medals.webp': (0.2, 'needs fix: thick white sticker rim round the emblem; trim to the painted edge')}
# boss-fx pieces that are made things (never World 1, never W1-best): where each is drawn (lairCroc.ts:82 signNo, rowboat, helmets;
# lairSovereign.ts:123 pole; zoneArt.ts:352 World 10's lightning rod; the pennants are tinted cloths (bossFx.ts:109), no caller found: lairs 2-10)
FX_MADE = {'signNo': ([2], '2-10 (lairCroc.ts:82)'), 'rowboat': ([2], '2-10 (lairCroc.ts)'), 'helmets': ([2], '2-10 (lairCroc.ts)'),
           'pole': ([4], '4-10 (lairSovereign.ts:123)'), 'rodLit': ([10], 'World 10 zones (zoneArt.ts:352)'), 'rodDark': ([10], 'World 10 zones (zoneArt.ts:352)'),
           'pennant0': (list(range(2, 11)), 'no caller found (bossFx.ts:109 tints them)'), 'pennant1': (list(range(2, 11)), 'no caller found (bossFx.ts:109 tints them)'),
           'pennant2': (list(range(2, 11)), 'no caller found (bossFx.ts:109 tints them)')}
rows = []
rects = {}
missing_ref = []
for rel in files:
    gr = group_for(rel)
    p = os.path.join(A, rel)
    im = Image.open(p)
    W, H = im.size
    kb = os.path.getsize(p) / 1024
    ref = code_ref(rel)
    slot = gr['slot'] or (ref + ' (direct url)' if ref else '')
    if not ref and not gr['slot'] and 'never referenced' not in gr['status']:
        missing_ref.append(rel)
    if gr['shown'] is None:
        ws, used, why = story_shown(rel)
    else:
        ws, used, why = gr['shown']()
    status = gr['status']
    if not ref and not gr['slot'] and status == 'in game':
        status = 'needs fix: shipped but never referenced in code (dead weight)'
    frames = FR.get(rel) or [dict(key='(whole)', x=0, y=0, w=W, h=H, src='single sprite')]
    n = len(frames)
    for f in frames:
        fw, fh = f['w'], f['h']
        if gr['k']:
            on = round(max(fw, fh) * gr['k'] * (f.get('sc') or 1) * Z)
        else:
            on = 'est:%d' % round(gr['est'](fw, fh))
        onv = int(str(on).replace('est:', ''))
        ship = min(max(fw, fh), max(1, onv * 2))
        area_ratio = (ship / max(fw, fh)) ** 2
        f_kb = kb * (fw * fh) / (W * H)
        st = status
        made = 'n' if os.path.basename(rel) in ('petal.webp',) else gr['made']
        fws, fused = ws, used
        if rel == 'bosses/boss-fx.webp' and f['key'] in FX_MADE:
            made = 'y'
            fws, fused = FX_MADE[f['key']]
        layer = 'decor near' if rel == 'bosses/boss-fx.webp' and f['key'] in FX_MADE and not f['key'].startswith('rod') else gr['layer']
        fx = EDGE_FIX.get(rel)
        if fx and EDGE.get('src/assets/' + rel + '#' + f['key'], 0) > fx[0]:
            st = fx[1]
        footing = 'none'
        if f.get('ax') is not None and f.get('ay') is not None:
            footing = 'anchor ax=%s ay=%s (from %s)' % (round(f['ax'], 1), round(f['ay'], 1), f['src'].split(' ')[0].split('/')[-1])
        if f['key'] != '(whole)':
            rects['src/assets/' + rel + '#' + f['key']] = [f['x'], f['y'], fw, fh]
        rows.append({
            'id': 'B4:' + rel[:-5] + ('#' + f['key'] if n > 1 or f['key'] != '(whole)' else ''),
            'source': 'game (src/assets)',
            'file': 'src/assets/' + rel + ('#' + f['key'] if n > 1 or f['key'] != '(whole)' else ''),
            'kind': 'prop' if layer == 'decor near' and rel == 'bosses/boss-fx.webp' else gr['kind'], 'w': fw, 'h': fh,
            'walk_y': '', 'walk_x0': '', 'walk_x1': '', 'flat': '', 'float_class': '',
            'world_best': str(fws[0]) if fws else 'menu',
            'worlds': fmt_worlds(fws, 'shown: ' + why),
            'no_fit': no_fit(fws),
            'made_thing': made,
            'engine_slot': slot + ('' if f['key'] == '(whole)' else f' [{f["key"]}]'),
            'footing': footing,
            'layer': layer,
            'on_screen_px': on,
            'ship_px': ship,
            'file_kb_now': round(f_kb, 1),
            'file_kb_ship': round(f_kb * min(1.0, area_ratio), 1),
            'draw_cost': ('one blit' if n == 1 else f'1 of {n} frames in {os.path.basename(rel)} (one decode, one drawImage per frame)'),
            'used_in': fused,
            'status': st,
        })

COLS = ['id', 'source', 'file', 'kind', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'flat', 'float_class', 'world_best', 'worlds', 'no_fit',
        'made_thing', 'engine_slot', 'footing', 'layer', 'on_screen_px', 'ship_px', 'file_kb_now', 'file_kb_ship', 'draw_cost', 'used_in', 'status']
out = os.path.join(ROOT, 'reference', 'art', 'catalog-game-B4.csv')
with open(out, 'w', newline='') as fh:
    wr = csv.DictWriter(fh, fieldnames=COLS)
    wr.writeheader()
    wr.writerows(rows)
json.dump(rects, open(os.path.join(ROOT, 'reference/art/master-sheets/b4/rects.json'), 'w'), separators=(',', ':'))
print('images', len(files), 'rows', len(rows), 'unreferenced', missing_ref)

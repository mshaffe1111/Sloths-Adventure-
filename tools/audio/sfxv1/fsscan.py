"""Find CC0 recordings for the effect set (polish-sfx, 2026-10-29) in laion/freesound-commercially-permissive-subset-with-captions.

CPU job on Hugging Face: python:3.12, volumes ["hf://datasets/laion/freesound-commercially-permissive-subset-with-captions:/data:ro",
"hf://buckets/mshaffe111/w5-xfer:/out:rw"], env SHARDS (comma list of shard numbers), TAG, PER (max clips per category per shard).
Keeps only clips with attribution_required == 0 (CC0 on Freesound), matches the captions against CATS, trims each to MAXS seconds,
encodes mono Opus 96 kbps at 48 kHz, and packs them with a metadata line per clip (freesound id, user, licence code, caption) into
carrier PNGs under hfbatch/sfx/carriers (unpack with tools/art/w5/unpack_carrier.py). No token needed.
"""
import io, json, os, re, subprocess, sys, tarfile
subprocess.run(['apt-get', 'update', '-qq'], check=True, stdout=subprocess.DEVNULL)
subprocess.run(['apt-get', 'install', '-y', '-qq', 'ffmpeg'], check=True, stdout=subprocess.DEVNULL)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow', 'numpy'], check=True)
from pathlib import Path
import numpy as np
from PIL import Image

OUT = Path('/out/hfbatch/sfx/carriers'); OUT.mkdir(parents=True, exist_ok=True)
TAG = os.environ.get('TAG', 's')
PER = int(os.environ.get('PER', '30'))
AMB = int(os.environ.get('AMB', '6'))
NSH = len(os.environ['SHARDS'].split(','))

# category: (regex on the caption, max seconds kept, max source duration in seconds)
CATS = {
    'step_grass': (r'footstep\w* (on|in|through) (grass|moss|leaves|dry leaves|forest floor|dirt|soil|earth)', 4, 30),
    'step_wood': (r'footstep\w* (on|across) (a )?(wood|wooden|plank|deck|floorboard|bridge)', 4, 30),
    'step_stone': (r'footstep\w* (on|across) (stone|rock|concrete|gravel|pebble|tile|cobble)', 4, 30),
    'step_water': (r'(footstep\w*|walking|wading) (in|through) (shallow )?(water|puddle|stream|mud)', 4, 30),
    'leaves': (r'(rustl\w* (of )?(dry )?leaves|leaves rustl|bush rustl|branch\w* rustl|foliage)', 4, 20),
    'whoosh': (r'\b(whoosh|swoosh|swish|whip through the air|swing\w* through the air)\b', 3, 10),
    'flap': (r'(wing\w* flap|flapping wing|bird take\w* off|flutter)', 3, 15),
    'cloth': (r'(cloth|fabric) (flap|rustl|movement|swish)', 3, 15),
    'creak': (r'(creak\w*).*(wood|rope|branch|tree|door|ship|floor)|(wood|rope|branch|tree).*creak', 4, 20),
    'rope': (r'\brope\b.*(pull|tension|stretch|grab|rub)|(pull|grab)\w* (a |on a )?rope', 3, 20),
    'branch': (r'(branch|twig|stick)\w* (snap|break|crack)', 3, 15),
    'rock_impact': (r'(rock|stone|boulder)s? (fall|drop|impact|hit|land|thud|tumbl|roll|crash)|(drop|throw)\w* (a )?(rock|stone|boulder)', 4, 20),
    'gravel': (r'(gravel|pebbles|rubble|debris|dirt) (fall|pour|scatter|slide|trickl|crumbl)|rockslide|landslide|crumbl\w* (rock|stone)', 5, 25),
    'thud': (r'\b(thud|thump|heavy impact|body fall|falls to the ground|dull impact)\b', 3, 10),
    'wood_impact': (r'(log|wood|wooden plank|timber)s? (fall|drop|impact|hit|thud|knock)|knock\w* on (a )?wood', 3, 15),
    'splash': (r'\bsplash\w*', 4, 15),
    'swim': (r'(swimming|paddl\w*|stroke\w* in water|moving through water|water movement)', 4, 20),
    'drip': (r'(water )?drip\w*.*(cave|echo|tunnel|well)|cave drip', 10, 60),
    'stream': (r'\b(stream|brook|creek|babbling|trickl\w* water|river flow)', 30, 120),
    'waterfall': (r'\bwaterfall', 30, 120),
    'jungle': (r'(rainforest|jungle|tropical forest)', 30, 180),
    'birds': (r'(bird\w* (chirp|sing|song|call)|birdsong|dawn chorus)', 30, 120),
    'insects': (r'(insects|crickets|cicada|katydid)', 30, 120),
    'frogs': (r'\bfrog', 30, 120),
    'wind': (r'(wind (blow|through|gust|howl)|gust of wind|windy)', 30, 120),
    'night': (r'night\w* (ambien|forest|sound)', 30, 120),
    'swamp': (r'(swamp|marsh|bog)', 30, 120),
    'squish': (r'\b(squish\w*|squelch\w*|boing\w*|rubber\w* (bounce|band)|jelly|bouncy)', 3, 10),
    'door': (r'(wooden door|gate|latch|hatch) (open|clos|creak|slam|unlock)|unlock\w*', 4, 15),
    'chime': (r'(wind chime|bamboo chime|chimes|kalimba|thumb piano|music box|marimba|xylophone|glockenspiel|singing bowl)', 4, 20),
    'bamboo': (r'bamboo', 4, 20),
    'punch': (r'\b(punch\w*|slap\w*|smack\w*|hit\w* a (bag|pillow|cushion))', 2, 10),
    'growl': (r'(growl\w*|snarl\w*|roar\w*)', 4, 15),
    'hiss': (r'\bhiss\w*.*(snake|cat|animal)|(snake|cat) hiss', 3, 10),
    'squeak': (r'(squeak\w*|chitter\w*|squeal\w*).*(animal|mouse|rat|bat|monkey|bird)|(monkey|bat|rodent) (call|scream|squeak|chatter)', 3, 10),
    'bird_call': (r'(parrot|macaw|eagle|hawk|crow|owl|toucan|hummingbird)', 4, 20),
    'buzz': (r'(\bbee\b|\bfly\b|flies|mosquito|wasp|beetle).*(buzz|fly)|buzz\w* (insect|bee|fly)', 4, 15),
    'drum': (r'(taiko|bass drum|tom drum|big drum|gong|timpani)', 4, 15),
    'thunder': (r'thunder', 6, 30),
    'tap': (r'(tap\w*|knock\w*) (on )?(a )?(wood|wooden|table|desk|box)', 2, 10),
    'paper': (r'(paper|page|parchment) (rustl|flip|turn)|turning (a )?page', 2, 10),
    'pop': (r'\b(pop\w*|cork|bubble\w*)\b', 2, 10),
}
# a second pass (SHARDS of the rest) looks only for the gaps: every pattern in a list must match
CATS2 = {
    'rock_impact': ([r'\b(rocks?|stones?|boulders?|pebbles?|bricks?|cobbles?)\b', r'\b(fall\w*|drop\w*|impact\w*|hit\w*|land\w*|thud\w*|tumbl\w*|roll\w*|crash\w*|clack\w*|knock\w*|collid\w*|smash\w*|thrown|toss\w*|bang\w*)\b'], 4, 20),
    'crumble': ([r'\b(crumbl\w*|collaps\w*|rubble|debris|avalanche|rockslide|landslide|cave-in|masonry)\b'], 5, 25),
    'log': ([r'\b(logs?|tree trunk|timber|firewood|lumber|tree fall\w*|falling tree)\b'], 4, 20),
    'step_wood': ([r'\b(footsteps?|steps|walking|walks)\b', r'\b(wood\w*|plank\w*|floorboards?|deck|bridge|stairs)\b'], 4, 30),
    'step_grass': ([r'\b(footsteps?|steps|walking|walks)\b', r'\b(grass\w*|leaves|leaf|forest|dirt|soil|mud|earth|moss|undergrowth|twigs)\b'], 4, 30),
    'step_stone': ([r'\b(footsteps?|steps|walking|walks)\b', r'\b(stone|rock|gravel|pebbles?|concrete|cobble\w*)\b'], 4, 30),
    'flap': ([r'\b(wings?|flapping|flutter\w*|flaps?)\b'], 3, 15),
    'rope': ([r'\b(ropes?|vines?|cords?)\b'], 4, 20),
    'jungle': ([r'\b(rainforest|rain forest|jungle|tropical|amazon\w*|costa rica|borneo|panama)\b'], 30, 300),
    'night': ([r'\b(night|nocturnal|evening)\b', r'\b(forest|insects?|crickets?|frogs?|owl|ambien\w*)\b'], 30, 300),
    'cave': ([r'\b(cave|cavern|grotto|tunnel|underground)\b'], 30, 120),
    'bounce': ([r'\b(bounc\w*|boing\w*|springy|trampoline|rubber ball)\b'], 3, 10),
    'land': ([r'\b(jump\w* (down|off|onto)|land\w* on|body (fall|drop|hit)\w*|falls? (on|to) the (ground|floor))\b'], 3, 15),
}
# a third pass: the beds of Worlds 9 and 10 and the creature voices
CATS3 = {
    'rain': ([r'\b(rain\w*|downpour|drizzle)\b'], 30, 300),
    'lava': ([r'\b(lava|magma|volcan\w*|bubbling mud|mud pot|geyser|boiling)\b'], 30, 120),
    'fire': ([r'\b(fire|crackl\w*|campfire|bonfire|embers)\b'], 20, 120),
    'bubble': ([r'\b(bubbl\w*|gurgl\w*|blub\w*)\b'], 6, 30),
    'bigcat': ([r'\b(jaguar|tiger|lion|leopard|panther|big cat|cougar|puma)\b'], 5, 20),
    'snake': ([r'\b(snake|serpent|rattlesnake|cobra)\b'], 4, 15),
    'monkey': ([r'\b(monkey|ape|chimp\w*|primate|howler)\b'], 5, 20),
    'croc': ([r'\b(crocodile|alligator|caiman|gator)\b'], 5, 20),
    'bat': ([r'\b(bats?|echolocation)\b'], 4, 15),
    'bug': ([r'\b(beetle|cockroach|insect click\w*|chitter\w*|cicada|spider)\b'], 4, 15),
    'munch': ([r'\b(munch\w*|crunch\w* (an? )?(apple|carrot|fruit|food)|chewing|eating|bite into)\b'], 3, 10),
    'kalimba': ([r'\b(kalimba|thumb piano|mbira|marimba|xylophone|music box|celesta|glockenspiel|vibraphone|handpan|hang drum|tongue drum)\b'], 4, 30),
    'windchime': ([r'\b(wind chimes?|chimes|bamboo chimes?|tingsha|singing bowl|bell tree)\b'], 6, 30),
    'taiko': ([r'\b(taiko|bass drum|kick drum|big drum|war drum|tom|timpani|gong|cinematic (hit|boom|impact)|boom)\b'], 5, 20),
    'scrape': ([r'\b(scrap\w*|scratch\w*|drag\w*)\b', r'\b(wood|stone|rock|branch|bark|thorn|bush)\w*\b'], 4, 15),
}
# a fourth pass: animal voices, in the words the captions use (they describe a sound more often than they name the animal)
CATS4 = {
    'cat': ([r'\b(meow\w*|mew\w*|yowl\w*|caterwaul\w*|purr\w*|feline|kitten|cat (hiss|growl|scream|cry)\w*)\b'], 4, 20),
    'raptor': ([r'\b(screech\w*|squawk\w*|caw\w*|bird of prey|hawk|eagle|falcon|kite|raptor|seagull|gull|parrot|macaw)\b'], 4, 20),
    'chitter': ([r'\b(chitter\w*|chatter\w*|squeal\w*|yelp\w*|whimper\w*|squeak\w*)\b', r'\b(animal|rodent|creature|critter|mammal|squirrel|ferret|weasel|otter|monkey|guinea pig|hamster|rat|mouse|mice)\b'], 4, 20),
    'reptile': ([r'\b(hiss\w*)\b', r'\b(animal|snake|reptile|lizard|cat|creature|goose|gecko|serpent)\b'], 4, 20),
    'croak': ([r'\b(croak\w*|ribbit\w*|toad|bullfrog)\b'], 4, 20),
    'grunt': ([r'\b(grunt\w*|snort\w*|oink|boar|pig|hog|warthog)\b', r'\b(animal|pig|boar|hog|creature|beast)\b'], 4, 20),
    'click': ([r'\b(insect|beetle|bug|cricket|grasshopper|cicada|mantis)\b'], 4, 20),
    'wingbeat': ([r'\b(wings?|wingbeats?|flapping|takes? off|taking off|flutter\w*)\b', r'\b(bird|pigeon|dove|crow|owl|bat|duck|goose)\w*\b'], 4, 20),
}
# PASS=ids: exactly the clips tagscan.py picked by their uploaders' tags (hfbatch/sfx/tagpicks.json), whatever their captions say
IDPICK = {}
if os.environ.get('PASS') == 'ids':
    AMBCATS = {'rainforest', 'forest_birds', 'stream', 'waterfall', 'cave', 'night', 'swamp', 'wind', 'rain', 'lava', 'fire'}
    for cat, rows in json.load(open('/out/hfbatch/sfx/tagpicks.json')).items():
        for r in rows[: (12 if cat in AMBCATS else 30)]:   # (the carriers stay ~80 MB)
            IDPICK.setdefault(int(r[0]), cat)
    CATS = {c: ('.', 30 if c in AMBCATS else 6, 400 if c in AMBCATS else 30) for c in set(IDPICK.values())}
if os.environ.get('PASS') == '4':
    CATS = CATS4
if os.environ.get('PASS') == '2':
    CATS = CATS2
if os.environ.get('PASS') == '3':
    CATS = CATS3
RX = {k: [re.compile(x, re.I) for x in (v[0] if isinstance(v[0], list) else [v[0]])] for k, v in CATS.items()}
count = {k: 0 for k in CATS}
files, size, kpack = [], 0, 0
meta = []


def carrier(fs):
    head = json.dumps([[n, len(x)] for n, x in fs]).encode() + b'\n'
    data = head + b''.join(x for _, x in fs)
    w = 2048; h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8); arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


def flush():
    global files, size, kpack
    if not files: return
    (OUT / f'carrier-{TAG}-{kpack}.png').write_bytes(carrier(files)); print('PUT', kpack, len(files), flush=True)
    kpack += 1; files, size = [], 0


def enc(mp3, maxs, start):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{start:.3f}', '-i', 'pipe:0', '-t', str(maxs), '-ac', '1', '-ar', '48000',
                        '-c:a', 'libopus', '-b:a', '96k' if maxs < 10 else '64k', '-f', 'ogg', 'pipe:1'], input=mp3, capture_output=True)
    return p.stdout if p.returncode == 0 and len(p.stdout) > 500 else None


lic = {}
for sh in os.environ['SHARDS'].split(','):
    path = f'/data/audio-dataset-{int(sh):06d}.tar'
    pend = {}
    with tarfile.open(path, 'r|') as tf:
        for m in tf:
            if not m.isfile(): continue
            key, ext = m.name.rsplit('.', 1)
            pend.setdefault(key, {})[ext] = tf.extractfile(m).read()
            rec = pend[key]
            if 'json' not in rec or 'mp3' not in rec: continue
            del pend[key]
            try: j = json.loads(rec['json'])
            except Exception: continue
            lic[(j.get('license'), j.get('attribution_required'))] = lic.get((j.get('license'), j.get('attribution_required')), 0) + 1
            if j.get('attribution_required') != 0: continue
            if IDPICK:
                cat = IDPICK.get(int(j.get('freesound_id') or -1))
                if not cat:
                    continue
                maxs = CATS[cat][1]
                o = enc(rec['mp3'], maxs, (j.get('silence_at_beginning_ms') or 0) / 1000 * 0.9)
                if not o:
                    continue
                name = f'{cat}__{j.get("freesound_id")}.ogg'
                cap = ' '.join(str(x) for x in [j.get('comprehensive_caption') or ''])
                meta.append({'file': name, 'cat': cat, 'freesound_id': j.get('freesound_id'), 'user': j.get('username'), 'license': j.get('license'),
                             'dur': (j.get('duration_ms') or 0) / 1000, 'caption': cap[:200]})
                if size + len(o) > 6_300_000: flush()
                files.append((name, o)); size += len(o)
                continue
            cap = ' '.join(str(x) for x in [j.get('comprehensive_caption') or '', (j.get('Flash 2.5 Annotation') or {}).get('caption') or ''])
            dur = (j.get('duration_ms') or 0) / 1000
            for cat, rx in RX.items():
                maxs, maxdur = CATS[cat][1], CATS[cat][2]
                if count[cat] >= (PER if maxs < 10 else AMB) * NSH or not all(r.search(cap) for r in rx): continue
                if dur > maxdur or dur < 0.15: continue
                o = enc(rec['mp3'], maxs, (j.get('silence_at_beginning_ms') or 0) / 1000 * 0.9)
                if not o: break
                count[cat] += 1
                name = f'{cat}__{j.get("freesound_id")}.ogg'
                meta.append({'file': name, 'cat': cat, 'freesound_id': j.get('freesound_id'), 'user': j.get('username'), 'license': j.get('license'),
                             'dur': dur, 'caption': cap[:400]})
                if size + len(o) > 6_300_000: flush()
                files.append((name, o)); size += len(o)
                break
    print('SHARD', sh, json.dumps(count), flush=True)
    print('LIC', {f'{a}/{b}': n for (a, b), n in lic.items()}, flush=True)
files.append(('meta.jsonl', '\n'.join(json.dumps(x) for x in meta).encode()))
flush()
(OUT / f'meta-{TAG}.jsonl').write_text('\n'.join(json.dumps(x) for x in meta))
print('ALL_DONE', kpack, json.dumps(count), flush=True)

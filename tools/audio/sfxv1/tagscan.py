"""Find CC0 sources by their uploaders' own tags and titles (polish-sfx, 2026-10-29), not by AI captions, which proved wrong too often.

CPU job, python:3.12, volumes ["hf://buckets/mshaffe111/w5-xfer:/out:rw"]: reads the small columns of benjamin-paine/freesound-laion-640k
(range reads), keeps CC0 rows whose tags or title match a category and carry none of the BAD tags, and writes
hfbatch/sfx/tagpicks.json: {category: [[freesound id, title, tags], ...]} (up to PER each, shortest titles first: plain names are
usually plain recordings). fsscan.py PASS=ids then pulls exactly those clips from the captioned archive.
"""
import json, os, re, subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pyarrow', 'huggingface_hub', 'fsspec'], check=True)
import pyarrow.parquet as pq
from concurrent.futures import ThreadPoolExecutor
from huggingface_hub import HfFileSystem

PER = int(os.environ.get('PER', '60'))
BAD = {'synth', 'synthesizer', 'synthesis', 'electronic', 'electro', 'glitch', '8bit', '8-bit', 'chiptune', 'music', 'musical', 'loop',
       'beat', 'drum-loop', 'voice', 'vocal', 'human', 'speech', 'talking', 'imitation', 'mouth', 'beatbox', 'game-sound', 'retro', 'arcade',
       'cartoon', 'comedy', 'funny', 'toy', 'plastic', 'zipper', 'car', 'vehicle', 'engine', 'machine', 'computer', 'keyboard', 'phone',
       'alarm', 'beep', 'bleep', 'laser', 'sci-fi', 'scifi', 'spaceship', 'explosion', 'gun', 'gunshot', 'weapon', 'kick', 'snare', 'hihat',
       'hi-hat', 'bass', 'guitar', 'piano', 'orchestra', 'reverse', 'reversed', 'processed', 'effect', 'distortion', 'noise', 'white-noise',
       'traffic', 'city', 'urban', 'people', 'crowd', 'child', 'baby', 'man', 'woman', 'kitchen', 'glass', 'bottle', 'metal', 'metallic',
       'door', 'zombie', 'monster', 'creature', 'horror', 'scary'}
# category: (tags any of, tags or title also needing one of (or None))
CATS = {
    'rock_hit': ({'rock', 'rocks', 'stone', 'stones', 'boulder', 'pebble', 'pebbles'}, {'impact', 'hit', 'drop', 'dropped', 'fall', 'falling', 'thud', 'crash', 'smash', 'throw', 'thrown', 'land'}),
    'rockfall': ({'rockfall', 'rock-fall', 'landslide', 'rubble', 'debris', 'gravel', 'scree', 'avalanche', 'crumble', 'crumbling'}, None),
    'bodyfall': ({'bodyfall', 'body-fall', 'body-drop', 'bodydrop', 'body', 'thump', 'thud', 'punch', 'hit', 'impact'}, {'foley', 'body', 'bodyfall', 'thud', 'thump', 'punch', 'fist', 'flesh', 'meat'}),
    'step_forest': ({'footsteps', 'footstep', 'steps', 'walking', 'walk'}, {'forest', 'leaves', 'grass', 'moss', 'dirt', 'soil', 'mud', 'earth', 'woods', 'path', 'undergrowth', 'twigs'}),
    'step_wood': ({'footsteps', 'footstep', 'steps', 'walking', 'walk'}, {'wood', 'wooden', 'floorboards', 'floorboard', 'deck', 'bridge', 'planks', 'plank', 'boardwalk'}),
    'step_stone': ({'footsteps', 'footstep', 'steps', 'walking', 'walk'}, {'stone', 'rock', 'rocks', 'concrete', 'cobblestone', 'cobble', 'gravel', 'pebbles', 'cave'}),
    'step_water': ({'wading', 'wade', 'puddle', 'puddles', 'footsteps', 'walking'}, {'water', 'puddle', 'puddles', 'stream', 'river', 'shallow', 'wet', 'mud'}),
    'leaves': ({'leaves', 'foliage', 'bush', 'bushes', 'branches', 'shrub', 'leaf'}, {'rustle', 'rustling', 'movement', 'moving', 'shake', 'shaking', 'brush', 'foley'}),
    'branch': ({'branch', 'branches', 'twig', 'twigs', 'stick', 'tree'}, {'snap', 'break', 'crack', 'creak', 'creaking', 'bend'}),
    'rope': ({'rope', 'ropes', 'liana', 'vine', 'vines'}, None),
    'creak_wood': ({'creak', 'creaking', 'creaky'}, {'wood', 'wooden', 'tree', 'branch', 'rope', 'ship', 'boat', 'swing', 'hammock'}),
    'whoosh': ({'whoosh', 'swoosh', 'swish', 'woosh', 'swing', 'swipe'}, {'stick', 'branch', 'rope', 'cloth', 'whip', 'cane', 'bamboo', 'foley', 'air', 'arm'}),
    'flap': ({'wings', 'wing', 'flapping', 'flap', 'flutter', 'take-off', 'takeoff'}, {'bird', 'birds', 'pigeon', 'dove', 'wings', 'wing', 'flapping'}),
    'cloth': ({'cloth', 'fabric', 'clothes', 'clothing', 'jacket', 'blanket', 'towel', 'sheet', 'leather'}, {'foley', 'movement', 'rustle', 'flap', 'shake', 'whoosh', 'swish'}),
    'splash': ({'splash', 'splashing', 'plunge', 'dive', 'diving', 'jump'}, {'water', 'river', 'lake', 'pool', 'pond', 'splash'}),
    'swim': ({'swimming', 'swim', 'paddle', 'paddling', 'stroke'}, {'water', 'swimming', 'swim', 'pool', 'lake', 'river'}),
    'wood_knock': ({'knock', 'knocking', 'tap', 'tapping', 'hit', 'thud'}, {'wood', 'wooden', 'log', 'logs', 'tree', 'trunk', 'bamboo', 'timber', 'plank'}),
    'log': ({'log', 'logs', 'timber', 'trunk', 'firewood'}, None),
    'bark': ({'bark', 'scratch', 'scratching', 'scrape', 'scraping'}, {'tree', 'bark', 'wood', 'claws', 'branch'}),
    'squelch': ({'squelch', 'squelching', 'squish', 'squishy', 'squishing', 'mud', 'slime'}, None),
    'kalimba': ({'kalimba', 'mbira', 'thumb-piano', 'thumbpiano', 'marimba', 'xylophone', 'balafon', 'music-box', 'musicbox', 'woodblock'}, None),
    'bamboo': ({'bamboo', 'wind-chimes', 'windchime', 'wind-chime', 'windchimes', 'chimes'}, {'bamboo', 'wood', 'wooden'}),
    'munch': ({'eating', 'chewing', 'munch', 'bite', 'crunch', 'apple', 'carrot'}, {'eating', 'bite', 'chewing', 'apple', 'fruit', 'crunch', 'food'}),
    'cat': ({'cat', 'cats', 'kitten', 'meow', 'hiss', 'purr', 'feline'}, None),
    'bigcat': ({'tiger', 'lion', 'leopard', 'jaguar', 'puma', 'cougar', 'panther'}, None),
    'bird_prey': ({'hawk', 'eagle', 'falcon', 'buzzard', 'kite', 'osprey', 'raptor', 'crow', 'raven', 'parrot', 'macaw', 'cockatoo', 'jay'}, None),
    'frog': ({'frog', 'frogs', 'toad', 'toads', 'bullfrog', 'croak', 'croaking'}, None),
    'snake': ({'snake', 'snakes', 'rattlesnake', 'viper', 'python', 'serpent'}, None),
    'boar': ({'pig', 'pigs', 'boar', 'hog', 'grunt', 'grunting'}, {'pig', 'pigs', 'boar', 'hog', 'farm', 'animal'}),
    'rodent': ({'squirrel', 'rat', 'mouse', 'mice', 'hamster', 'guinea-pig', 'ferret', 'weasel', 'otter', 'chipmunk'}, None),
    'monkey': ({'monkey', 'monkeys', 'primate', 'gibbon', 'howler', 'chimpanzee', 'macaque', 'baboon'}, None),
    'alligator': ({'alligator', 'crocodile', 'caiman', 'gator', 'goose', 'geese'}, None),
    'insect': ({'insect', 'insects', 'beetle', 'cricket', 'crickets', 'cicada', 'grasshopper', 'bug', 'bugs', 'bee', 'bees'}, None),
    'rainforest': ({'rainforest', 'rain-forest', 'jungle', 'tropical', 'amazon', 'costa-rica', 'borneo', 'panama', 'ecuador', 'peru'}, {'ambience', 'ambiance', 'atmosphere', 'soundscape', 'field-recording', 'nature', 'birds', 'forest', 'insects'}),
    'forest_birds': ({'birds', 'birdsong', 'dawn-chorus', 'bird'}, {'forest', 'woods', 'ambience', 'ambiance', 'nature', 'morning', 'soundscape'}),
    'stream': ({'stream', 'brook', 'creek', 'river', 'babbling'}, {'water', 'nature', 'ambience', 'ambiance', 'flowing', 'field-recording'}),
    'waterfall': ({'waterfall', 'waterfalls', 'cascade', 'falls'}, None),
    'cave': ({'cave', 'cavern', 'grotto', 'underground', 'mine', 'tunnel'}, {'drip', 'drips', 'dripping', 'water', 'ambience', 'ambiance', 'reverb', 'echo', 'room-tone'}),
    'drip': ({'drip', 'drips', 'dripping', 'drop', 'droplet', 'water-drop'}, {'water', 'cave', 'drip', 'dripping'}),
    'night': ({'night', 'nighttime', 'evening', 'dusk', 'twilight'}, {'crickets', 'insects', 'frogs', 'nature', 'ambience', 'ambiance', 'forest', 'katydid'}),
    'swamp': ({'swamp', 'marsh', 'bog', 'wetland', 'wetlands', 'bayou', 'mangrove'}, None),
    'wind': ({'wind', 'windy', 'gust', 'breeze'}, {'nature', 'trees', 'forest', 'mountain', 'outdoor', 'field-recording', 'ambience', 'ambiance', 'howling'}),
    'rain': ({'rain', 'raining', 'rainfall', 'downpour', 'storm', 'thunderstorm'}, {'nature', 'ambience', 'ambiance', 'field-recording', 'forest', 'outdoor', 'thunder', 'heavy'}),
    'thunder': ({'thunder', 'thunderclap', 'lightning', 'thunderstorm'}, None),
    'lava': ({'lava', 'magma', 'volcano', 'volcanic', 'geyser', 'mud-pot', 'mudpot', 'fumarole', 'bubbling', 'boiling'}, None),
    'fire': ({'fire', 'campfire', 'bonfire', 'crackle', 'crackling', 'fireplace'}, None),
    'impact_big': ({'impact', 'boom', 'slam', 'hit', 'taiko', 'bass-drum', 'gran-cassa', 'timpani'}, {'big', 'huge', 'heavy', 'deep', 'cinematic', 'taiko', 'trailer', 'drum', 'wood', 'door'}),
}
REX = re.compile(r'[a-z0-9\-]+')
fs = HfFileSystem()
files = sorted(fs.glob('datasets/benjamin-paine/freesound-laion-640k/**/*.parquet'))
print('files', len(files), flush=True)


def cols(f):
    try:
        with fs.open(f, 'rb', block_size=256 * 1024) as fh:
            return pq.read_table(fh, columns=['freesound_id', 'license', 'title', 'tags']).to_pydict()
    except Exception as e:
        print('ERR', f, e, flush=True)
        return None


found = {k: [] for k in CATS}
with ThreadPoolExecutor(16) as pool:
    for i, d in enumerate(pool.map(cols, files)):
        if not d:
            continue
        for k, fid in enumerate(d['freesound_id']):
            if d['license'][k] != 0:
                continue
            tags = {t.lower() for t in (d['tags'][k] or [])}
            title = (d['title'][k] or '').strip()
            words = tags | set(REX.findall(title.lower()))
            if words & BAD:
                continue
            for cat, (anyof, also) in CATS.items():
                if tags & anyof and (also is None or words & also):
                    found[cat].append([int(fid), title, sorted(tags)[:12]])
        if i % 200 == 0:
            print(i, {k: len(v) for k, v in found.items() if v}, flush=True)
out = {}
for cat, rows in found.items():
    rows.sort(key=lambda r: (len(r[1]), r[0]))
    out[cat] = rows[:PER]
json.dump(out, open('/out/hfbatch/sfx/tagpicks.json', 'w'))
print('ALL_DONE', {k: len(v) for k, v in found.items()}, flush=True)

/**
 * The engine's library for every world: each kind the game's builders lay today (the planner's measured inventory,
 * reference/engine/INVENTORY.md, tools/engine/inventory.ts), with the designer's labels (reference/engine/LABELS.md, engine-spec
 * e0f4f978). The labels are the designer's: this file transcribes them, it never invents one. A kind the designer has not labelled says
 * so (`open`), and no new stage may lay it until it is ruled.
 *
 * `tools/engine/catalog-check.ts` holds this file to the inventory: every measured kind maps to exactly one entry here, or the check fails.
 * The support check (E3) reads `mayFloat` and `footing`.
 *
 * Floating (Matt, 2026-11-05, through the lead): "if they're part of the platforms, they can float... I just don't want secondary objects
 * like rocks and other things, lily pads, to be floating." So every platform he stands on that is a bough, a limb, a shelf, a log or a
 * plank is `mayFloat: 'yes'` (creaky limb, frond ledge, orchid shelf, fungus shelf and roost limb moved from 'no'; the bough's 'no' in the
 * stone-thin worlds is gone), and a secondary object (a stone, a mushroom, a pad, a prop, dressing) still stands on something.
 */
import type { Platform } from '../types.ts';

export type CatElement = 'ground' | 'stone' | 'tree' | 'water' | 'built' | 'air' | 'cave' | 'heat' | 'storm' | 'helper';
/** may it stand with open air under it: a platform piece may (under the stage's float cap); a rock never (Matt, 11-05: "Rocks can't
 *  float"); a water piece only on a drawn water zone */
export type MayFloat = 'yes' | 'no' | 'water';

export interface CatKind {
  /** the base kind's name (LABELS.md §1-3) */
  name: string;
  element: CatElement;
  /** what it stands on or hangs from */
  footing: string;
  mayFloat: MayFloat;
  /** what it is for (its flags read as uses) */
  uses: string;
  /** the worlds it may go in (1-10), from the inventory plus what its element allows */
  worlds: number[];
  /** the label's notes and rulings, with their source */
  notes?: string;
  /** not laid in a new stage (a breach kept on the known list, or a kind waiting on a ruling) */
  noNew?: string;
  /** not yet ruled by the designer: no new stage lays it */
  open?: boolean;
}

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** a landing's base kind: its type, style and art (its flags are uses, not kinds) */
export interface LandingKind extends CatKind { match: (p: Platform & Record<string, unknown>) => boolean }

const art = (p: Platform & Record<string, unknown>) => p.art as string | undefined;
export const LANDINGS: LandingKind[] = [
  { name: 'solid log', match: (p) => p.type === 'solid' && p.style === 'log' && !art(p), element: 'ground', footing: 'the floor, a stump-post or a bank; or floating', mayFloat: 'yes',
    uses: 'landing, rest, ground-fork high road, pit edge (pit=drop), push block (push, from 1-6)', worlds: ALL, notes: 'the commonest landing in the game; push logs follow the echo rule (ladder)' },
  { name: 'stilt landing', match: (p) => art(p) === 'stilt', element: 'built', footing: 'its drawn stilts down to the water', mayFloat: 'no', uses: "the 6-8 Stilt Climb's landings", worlds: [6], notes: 'hand-built special, kept as built' },
  { name: 'bank steps', match: (p) => art(p) === 'steps', element: 'built', footing: 'the bank village', mayFloat: 'no', uses: 'stairs up the bank houses', worlds: [2] },
  { name: 'pool log', match: (p) => art(p) === 'poolLog', element: 'water', footing: 'a drawn pool', mayFloat: 'water', uses: 'pool crossing', worlds: [4], notes: 'water rule 3' },
  { name: 'drift log', match: (p) => p.type === 'drift', element: 'water', footing: 'a river surface', mayFloat: 'water', uses: 'the river crossing that moves', worlds: [2, 6, 8], notes: 'needs a drawn river (rivers row); the ladder returns it in W6 and W8 ponds' },
  { name: 'pillar', match: (p) => !!p.pillar, element: 'ground', footing: 'its drawn pillar', mayFloat: 'no', uses: "the 4-10 lair's pillars", worlds: [4], notes: 'a stone on a pillar is supported' },
  { name: 'bough', match: (p) => p.type === 'solid' && p.style === 'branch' && !art(p) && !p.pillar, element: 'tree', footing: 'a trunk within 220 px, or a post; or floating where it reads cleaner', mayFloat: 'yes',
    uses: 'landing, stair, canopy road, catch under a teach gap (catch), ledge lip (lip)', worlds: ALL, notes: 'trunk rule: at most 3 full trunks per 1,400 px' },
  { name: 'frond ledge', match: (p) => art(p) === 'frond', element: 'tree', footing: 'a trunk', mayFloat: 'yes', uses: "W4's frond ledge", worlds: [4], notes: 'theme-locked' },
  { name: 'orchid shelf', match: (p) => art(p) === 'orchid', element: 'tree', footing: 'a trunk', mayFloat: 'yes', uses: "W5's orchid shelves", worlds: [5], notes: 'theme-locked' },
  { name: 'porch post lip', match: (p) => art(p) === 'post', element: 'built', footing: 'a porch post', mayFloat: 'no', uses: "W2's porch posts", worlds: [2], notes: 'theme-locked' },
  { name: 'rope bridge', match: (p) => p.type === 'solid' && p.style === 'canopy_bridge', element: 'tree', footing: 'a plank span; its ends on posts or boughs where drawn', mayFloat: 'yes',
    uses: 'span, canopy road', worlds: [1, 5, 8, 9, 10], notes: 'a rope or post end drawn dangling in air is a P-2 fault: draw posts, or planks only' },
  { name: 'creaky limb', match: (p) => p.type === 'fragile' && p.style === 'branch', element: 'tree', footing: 'a trunk or a bough', mayFloat: 'yes', uses: 'a landing that gives way; the canopy breakable',
    worlds: [1, 7, 8, 10], notes: "taught 1-2 (SHIPPED 6dae405d); World 1's breakable is World 1's branch art (SHIPPED acf6e1e8)" },
  { name: 'bounce mushroom', match: (p) => p.type === 'bouncy' && (!p.style || p.style === 'moss_stone'), element: 'ground', footing: 'the floor, a bank, a stump or a log', mayFloat: 'no', uses: 'bounce up (taught 1-1 n4)', worlds: [1, 3, 4, 7],
    notes: "read by its TYPE: a bouncy piece is drawn as its world's bounce art whatever its style (terrain.ts drawBounce by world); gen2 lays its mushrooms with the default ground style, moss_stone (the lead, 11-05)" },
  { name: 'springy limb', match: (p) => p.type === 'bouncy' && (p.style === 'branch' || p.style === 'log' || p.style === 'canopy_bridge'), element: 'tree', footing: 'as its style', mayFloat: 'yes', uses: 'bounce off a springy limb', worlds: [5, 7, 8, 9, 10] },
  { name: 'mossy stone', match: (p) => p.type === 'solid' && p.style === 'moss_stone' && (!art(p) || art(p) === 'rock') && !p.push && !p.pillar, element: 'stone', footing: 'the floor, a bank or its own base', mayFloat: 'no',
    uses: 'step, rise, landing; soil = earth under it', worlds: ALL, notes: 'the largest no-float kind in the game (about 2,800 placed); E3 counts the unsupported ones' },
  { name: 'push stone', match: (p) => p.style === 'moss_stone' && (!!p.push || art(p) === 'boulder'), element: 'stone', footing: 'the floor', mayFloat: 'no', uses: 'push puzzle', worlds: [4], notes: 'push echo rule' },
  { name: 'ruin block', match: (p) => p.type === 'solid' && p.style === 'ruin', element: 'stone', footing: 'the floor, a column or its own base', mayFloat: 'no', uses: 'landing, temple floor', worlds: [5, 7, 8, 9, 10], notes: 'needs a drawn column or base where it bridges a gap' },
  { name: 'crumbling floor', match: (p) => p.type === 'fragile' && p.style === 'ruin', element: 'stone', footing: 'a floor or a column', mayFloat: 'no', uses: "crumbling floor (W7's teach, 7-1)", worlds: [7, 8, 9, 10],
    notes: "never World 1 (SHIPPED acf6e1e8; ENGINE-SPEC 10:09 AM): 1-5's 4 fragile ruin are a breach, to become World 1 creaky limbs" },
  { name: 'breaking or bouncing stone', match: (p) => (p.type === 'fragile' || p.type === 'bouncy') && p.style === 'moss_stone' || p.type === 'bouncy' && p.style === 'ruin', element: 'stone', footing: 'as a stone', mayFloat: 'no',
    uses: 'a breaking or bouncing stone', worlds: [5, 7, 8, 9, 10], noNew: 'OPEN: "a rock bounces you" reads oddly; waits on a still for Matt', open: true },
  { name: 'moving platform', match: (p) => p.type === 'moving' && (p.style === 'log' || p.style === 'canopy_bridge' || art(p) === 'lift'), element: 'built', footing: 'a track or a rope', mayFloat: 'yes',
    uses: 'moving platform (planned teach 2-7, R-164.9); the lift (2-7)', worlds: [2, 5, 6, 8, 9] },
  { name: 'moving stone', match: (p) => p.type === 'moving' && (p.style === 'moss_stone' || p.style === 'ruin'), element: 'stone', footing: 'none: it moves through the air', mayFloat: 'no', uses: '(none)', worlds: [7, 9, 10],
    noNew: 'breaks rule 1 (rocks never float): today\'s 5 go on the known list; their job goes to a log, plank or lift kin' },
  { name: 'built set piece', match: (p) => !p.style && p.type === 'solid' && (['kit', 'porch', 'hidden'].includes(art(p) ?? '') || !!p.chase || !!p.crown), element: 'built', footing: 'as its art (kit: built ground; porch: built)', mayFloat: 'no',
    uses: 'puzzle rooms (kit), the bank village (porch), secrets (hidden), the 1-8 chase set piece (chase, crown)', worlds: ALL, notes: 'kept as built' },
  { name: 'lily pad', match: (p) => !!p.lily, element: 'water', footing: 'a drawn water zone', mayFloat: 'water', uses: 'a pad on the water', worlds: [1, 2, 6], notes: 'lily pads only on water (Matt); engine-render\'s padsOffWater test' },
  { name: 'fungus shelf', match: (p) => p.style === 'fungus_shelf', element: 'tree', footing: 'a trunk (a bracket shelf)', mayFloat: 'yes', uses: "W8's night-forest landing", worlds: [8], notes: 'theme-locked' },
  { name: 'roost limb', match: (p) => p.style === 'roost_branch', element: 'tree', footing: 'a trunk (a roost limb)', mayFloat: 'yes', uses: "W8's night-forest landing", worlds: [8], notes: 'theme-locked' },
  // (measured in the inventory, with no row in LABELS.md yet: open until the designer rules)
  // (the designer's LABELS §6, 11-05 10:57: a platform log or plank that gives way; creak Normal 0.67 s, Easy 1.2 s; laid in a new stage
  // only once its art shows the creak tell (a crack or a sag): open for the art)
  { name: 'breaking log or plank', match: (p) => p.type === 'fragile' && (p.style === 'log' || p.style === 'canopy_bridge'), element: 'tree', footing: 'as a log or plank', mayFloat: 'yes', uses: 'a log or plank that gives way', worlds: [5, 7, 8, 9, 10], open: true, noNew: 'laid only once its art shows the creak tell (open for art)' },
];

/** a climbable's kind (LABELS.md §2): a vine by its vineType and flags, a rope by whether it is required */
export interface ClimbKind extends CatKind { match: (arr: 'vines' | 'ropes', v: Record<string, unknown>) => boolean }
const vt = (v: Record<string, unknown>) => (v.vineType as string | undefined) ?? (v.isSwingingVine ? 'swing_liana' : 'tree_climb');
export const CLIMBS: ClimbKind[] = [
  { name: 'climbing vine', match: (a, v) => a === 'vines' && vt(v) === 'tree_climb' && !v.rope, element: 'tree', footing: 'hangs from a bough or the trunk top; its foot reaches a landing', mayFloat: 'no', uses: 'climb (taught 1-4)', worlds: ALL,
    notes: 'its top never in open sky; no climbing vine in 1-1 (ENGINE-SPEC 10:09 AM); kit and kit off are the puzzle kit\'s' },
  { name: 'rope down a cliff', match: (a, v) => a === 'vines' && vt(v) === 'tree_climb' && !!v.rope, element: 'built', footing: 'anchored at the top of a cliff or tower', mayFloat: 'no', uses: 'climb', worlds: [4, 8] },
  { name: 'swinging liana', match: (a, v) => a === 'vines' && vt(v) === 'swing_liana' && !v.silk, element: 'tree', footing: 'anchored to a bough or the canopy', mayFloat: 'no', uses: 'swing (taught 1-2; SHIPPED d272601f)', worlds: ALL, notes: 'a landing past its arc' },
  { name: 'silk line', match: (a, v) => a === 'vines' && vt(v) === 'swing_liana' && !!v.silk, element: 'tree', footing: 'anchored to a web or a branch', mayFloat: 'no', uses: 'silk line (taught 5-4)', worlds: [5], notes: "World 5's own kit" },
  { name: 'rope', match: (a) => a === 'ropes', element: 'tree', footing: 'two anchors at the same height (within 40 px)', mayFloat: 'no', uses: 'shimmy (taught on clearing 1-3; required from 1-4)', worlds: [1, 2, 3, 4, 8, 9, 10], notes: 'the ladder returns it in W5-W7' },
];

/** zones, air, water bodies and set pieces (LABELS.md §2-3), by the array the stage keeps them in and their kind */
export interface ZoneKind extends CatKind {
  arr: string; kinds?: string[];
  /** the worlds that have its art today: it is laid in world N only where N is here; a world in `worlds` but not in `artIn` is an art
   *  gap, on a shrink-only known list, never drawn in another world's art (the designer and the critic, ENGINE-SPEC 0dffc84e1) */
  artIn?: number[];
  /** a set piece of one stage, which never returns (4-3's falls and tide lines) */
  setPiece?: boolean;
}
/** from a hazard's teach world through World 10 (a taught hazard keeps returning: the designer's 1:14 ruling) */
const fromW = (w: number) => Array.from({ length: 11 - w }, (_, i) => w + i);
export const ZONES: ZoneKind[] = [
  { name: 'warm air', arr: 'updrafts', element: 'air', footing: 'open drop space under it', mayFloat: 'yes', uses: 'glide (taught 4-7)', worlds: [4, 8, 9], notes: 'needs the glide known' },
  { name: 'warm air (4-7 drafts)', arr: 'drafts47', kinds: ['across', 'bonus', 'rock', 'up'], element: 'air', footing: 'open drop space under it', mayFloat: 'yes', uses: 'glide (taught 4-7)', worlds: [4] },
  { name: 'wind', arr: 'zones', kinds: ['wind'], element: 'air', footing: 'cliffs and tops', mayFloat: 'yes', uses: 'wind (taught 4-2)', worlds: fromW(4), artIn: [4, 8, 10] },
  { name: 'dark', arr: 'zones', kinds: ['dark'], element: 'cave', footing: 'caves and the dark forest', mayFloat: 'yes', uses: 'dark (3-1)', worlds: fromW(3), artIn: [3, 5, 6, 8] },
  { name: 'spore', arr: 'zones', kinds: ['spore'], element: 'cave', footing: 'caves', mayFloat: 'yes', uses: 'spore (3-1)', worlds: fromW(3), artIn: [3] },
  { name: 'web', arr: 'zones', kinds: ['web'], element: 'tree', footing: 'between trunks', mayFloat: 'yes', uses: 'web (5-6)', worlds: fromW(5), artIn: [5] },
  { name: 'tide', arr: 'zones', kinds: ['tide'], element: 'water', footing: 'a drawn water body', mayFloat: 'water', uses: 'tide (6-4)', worlds: fromW(6), artIn: [6] },
  { name: '4-3 falls and tide', arr: 'falls43', kinds: ['plug', 'pool', 'surge', 'tide'], element: 'water', footing: 'a drawn water body', mayFloat: 'water', uses: 'the waterfall steps (4-3)', worlds: [4], artIn: [4], setPiece: true },
  { name: '4-3 tide line', arr: 'tides43', element: 'water', footing: 'a drawn water body', mayFloat: 'water', uses: 'the waterfall steps (4-3)', worlds: [4], artIn: [4], setPiece: true },
  { name: 'crumbling floor zone', arr: 'zones', kinds: ['crumble'], element: 'stone', footing: 'temple floors', mayFloat: 'no', uses: 'crumbling floor (7-1)', worlds: fromW(7), artIn: [7, 10] },
  { name: 'geyser', arr: 'zones', kinds: ['geyser'], element: 'heat', footing: 'heat rock', mayFloat: 'no', uses: 'geyser (9-1)', worlds: fromW(9), artIn: [9] },
  { name: 'bolt', arr: 'zones', kinds: ['bolt'], element: 'storm', footing: 'open sky', mayFloat: 'yes', uses: 'bolt (10-1)', worlds: fromW(10), artIn: [10] },
  { name: 'river', arr: 'rivers', element: 'water', footing: 'a drawn river, its banks at both ends', mayFloat: 'water', uses: 'river logs (2-1)', worlds: [2, 6, 8] },
  { name: 'thorn vine', arr: 'proto.thorns', element: 'tree', footing: 'hangs or swings from trunks', mayFloat: 'no', uses: 'thorns (3-4)', worlds: fromW(3), artIn: [3] },
  { name: 'trunk', arr: 'trees', element: 'tree', footing: 'the floor', mayFloat: 'no', uses: 'an anchor for boughs, vines and lianas; never a landing', worlds: ALL, notes: 'at most 3 full trunks per 1,400 px' },
  { name: 'trunk (mixer)', arr: 'proto.trunks', element: 'tree', footing: 'the floor', mayFloat: 'no', uses: 'an anchor; never a landing', worlds: ALL },
  { name: 'hollow log', arr: 'proto.hollows', element: 'ground', footing: 'seated on the floor', mayFloat: 'no', uses: 'a two-road split: walk inside, run on top', worlds: [1, 3, 4, 6, 8], notes: 'two open ends or it is a hide spot only; no trunk within its width + 40 px' },
  ...['fallZones', 'proto.catches', 'proto.covers', 'proto.glints', 'proto.leaves', 'lanes', 'links', 'bowlGates', 'proto.stilt', 'proto.stiltLedges'].map((arr): ZoneKind => (
    { name: `engine helper: ${arr}`, arr, element: 'helper', footing: 'kept as built', mayFloat: 'yes', uses: 'an engine helper or a set-dressing list', worlds: ALL })),
];

/** a dressing prop's family (LABELS.md §5; the designer's rules from reference/engine/labels/props.py, in their order: the first match
 *  wins). A wN prop is World N's own art, used only in World N */
export interface PropFamily { family: string; rx: RegExp; element: string; footing: string; mayFloat: 'yes' | 'no' }
export const PROP_FAMILIES: PropFamily[] = [
  // (the designer's LABELS §6, 11-05 10:57: W2's walking villagers are a family of their own; the water sign is the warning post at a
  // stage's first water, built ground on the bank, a teach marker (waterTeach.ts:103))
  { family: 'villager', rx: /^(po|tc)\./, element: 'ground (villager)', footing: "on a porch or the ground, never open air; W2's village only; dressing, never in the lane", mayFloat: 'no' },
  { family: 'teach marker', rx: /^waterSigns$/, element: 'ground (built)', footing: 'on the bank about 40 px before the water', mayFloat: 'no' },
  { family: 'fly', rx: /Morpho|Firefly|Butterfly(?!Bush)|Ladybug|Smoke|CattailFly|Feather|Petals$/, element: 'air (dressing)', footing: 'drifts or flies; may float', mayFloat: 'yes' },
  { family: 'hang', rx: /Hang|Curtain|Drip|BellVine|VineHang|LeafHang|BellHang|BellOne|Lanterns$|mossCurtain|stalactite|AirPlants|OrchidSpray|NestBasket|WeaverNest|laundry|Chime/, element: 'tree (hanging)', footing: 'hangs from a bough, the canopy, a roof or a line; never open sky', mayFloat: 'no' },
  { family: 'water', rx: /Lily|Reed|reed(?!-hide)|waterSigns|Canoe|Raft|FishTrap|Turtle|Otter|Heron|Crab|Mud|Cattail|cattails|WaterJar|Driftwood|DriftRoot|OysterRoot|pool|basin|trickle|Mooring|mooring/, element: 'water (edge or surface)', footing: 'on a drawn water surface or its bank edge', mayFloat: 'no' },
  { family: 'stone', rx: /Stone|stone|Boulder|boulder|Rock|rock|Pebble|Cairn|Obsidian|Geode|Crystal|Fossil|Shards|Slate|Stalag|stalag|Pillar|pillar|Altar|Idol|Statue|Tablet|Urn|Block|Head|Totem|clawRock|ringWall|wallTile|slab|Slab|Coins|Offering|GlowStone|Ball|bones|dais|throne|gong|Brazier/, element: 'ground (stone)', footing: 'on the ground, a ledge or its own drawn base; never floats (Matt)', mayFloat: 'no' },
  { family: 'animal', rx: /Coati|Snail|Beetle|Frog|Lizard|Marmot|Cricket|Capuchin|Mudskipper|Termites|Macaw|Toucan|Kingfisher|squirrel|Monkey/, element: 'ground or tree (creature)', footing: 'stands on the ground or a bough; perches never in open air', mayFloat: 'no' },
  { family: 'plant', rx: /Fern|fern|Bush|bush|Bromeliad|Heliconia|Mushroom|mushroom|Shroom|Sprig|Grass|Thistle|Shrub|Flower|Moss|Glow|Pitcher|Pods|NutPod|SeedPods|Acorns|Pinecone|LeafLitter|WetLeaves|Fiddle|Fungus|Bead|Root|Tree|tree|grotto|tall|wide|glow|canopy|lantern-flower|moss-|root-|reed-hide|log-hide/, element: 'ground (plant)', footing: 'grows from the ground, a bank or a trunk', mayFloat: 'no' },
  { family: 'wood', rx: /Log|log|Stump|stump|Post|post|pole|Hollow|Nest|Rack|Crate|Cage|Banner|banner|Bench|Pots|Pot|Spool|Teacups|TeaTin|Thimbles|WateringCan|Wheelbarrow|Birdbath|BookStack|Buttons|Ribbon|Sugar|Bank|Clut|Sign|sign|mailbox|door|Door|window|porch|rooftop|chimney|archway|steps|swingFrame|bridge|Gate|Bucket|Gourd|Basket|Censer|StakeLantern|Bundle|bootprint|pawprint|lilyCarpet|limbShort|logShort|lantern|bell|stilt|rope|arch|mound/, element: 'ground (built or wood)', footing: 'on the ground, a porch, a bank or a ledge', mayFloat: 'no' },
];

/** pickups and animals (LABELS.md §3): placed by their own rules, never landings */
export const PICKUP_RULE = 'over a standable piece or on a path\'s arc, never inside a piece; hearts only after risk; the exit totem on a long ground piece';
export const ANIMAL_RULE = 'on their element: snakes, boas and tayras on boughs or ground; caimans, turtles and frogs at water; harpies and eagles in open sky; jaguars and ocelots on ground; spiders on webs (W5)';

/** the worlds whose kit draws a thin piece (a 'branch' frame) as stone, which never floats (the designer's LABELS §8, 11-05: W3 mossy
 *  slab, W4 slate, W7 carved ruin, W9 basalt); elsewhere it is a bough, a plank, a stump, a log or a grate, which may */
export const STONE_THIN_WORLDS = [3, 4, 7, 9];
/** whether a landing may stand with open air under it, in its world: its kind's label, with a thin piece's element from its art (§8) */
export function mayFloatIn(p: Platform & Record<string, unknown>, world: number): MayFloat | undefined {
  const k = LANDINGS.find((q) => q.match(p));
  if (!k) return undefined;
  // (no world-only rule for boughs: Matt, 2026-11-05, platform pieces may float in every world)
  return k.mayFloat;
}
export const landingKind = (p: Platform & Record<string, unknown>) => LANDINGS.filter((k) => k.match(p));
export const climbKind = (arr: 'vines' | 'ropes', v: Record<string, unknown>) => CLIMBS.filter((k) => k.match(arr, v));
export const propFamily = (name: string) => PROP_FAMILIES.find((f) => f.rx.test(name));
/** the World a prop's art belongs to (a wN name), or undefined for a shared one */
export const propWorld = (name: string) => { const m = name.match(/^w(\d+)/); return m ? Number(m[1]) : undefined; };

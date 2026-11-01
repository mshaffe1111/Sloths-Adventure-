/**
 * Pokey's journal (Matt, 2026-10-31: "a page for every world, and after every level, it should have a note about how he played it or
 * what happened... turn the page for every world, and it does a little review of what we did and the story").
 *
 *   - After each stage, an entry: Pokey's own line for that stage (STAGE_LINES: what happens there, in his voice), the world's story
 *     beat where it has one, then at most two lines from how the stage was actually played (playRecords.ts): a clean run, the falls,
 *     the flowers, a find, a medal. A save from before the journal kept records gets the stage's line and beat, never filler.
 *   - At a world's end, its review page: the story so far, the creatures met, the best moments, the numbers.
 *
 * The record lines come from templates with several variants, picked by the stage's id, never one twice on a world's page, so a page
 * reads the same each time it is opened. The world lines (POKEY_JOURNAL) are Matt's approved words (2026-10-29 story report); the story
 * beats were approved by Matt on 2026-11-01; the stage lines and record templates were rewritten on 2026-11-01 (Matt: "Too many 'I didn't
 * write it down, the ending was good.' That is worthless and doesn't sound like Pokey, a slow smart-ass"). Change them only with his OK.
 */
import type { FirstClear, PlayRecord } from './playRecords.ts';
import { isPetalStage } from './stagePlan.ts';
import { dotPresent } from './wayside.ts';

export const POKEY_JOURNAL: Record<number, string> = {
  1: "Left home. Dot says I forgot something. I didn't. I checked.",
  2: "The village is building me a raft. They agreed on the wood. I'll walk.",
  3: 'Dark in there. The glowworms helped. So did Dot. Loudly.',
  4: 'Fell off a ledge. Climbed back up. Dot held one claw the whole way.',
  5: 'Had tea with a spider. Good tea. Found out who the empty chair is for.',
  6: "We stopped for tea. It cost a night. Dot left. I'm going to keep writing in here like she didn't.",
  7: "A firefly sits on my strap. He doesn't say much. Found a photograph I didn't want to find.",
  8: "Dot came back. She won't sit down. Meeca knows who he is.",
  9: "A thousand steps tomorrow. I'm going to take them one at a time. There isn't another way.",
  10: 'Got there. Tea at four.',
};

/** the worlds whose page is written: the ones whose guardian (stage 10) has been beaten */
export function journalWritten(levels: readonly { worldIndex: number; miniIndex: number; completed: boolean }[]): number[] {
  return levels.filter((l) => l.miniIndex === 10 && l.completed).map((l) => l.worldIndex).sort((a, b) => a - b);
}

// ───────────────────────────── one line for every stage (Matt, 2026-11-01) ─────────────────────────────

/**
 * Pokey's line for each released stage, about what happens in THAT stage (its creature, its trick, its place, the story moment), in his
 * voice: "a slow smart-ass" (Matt, 2026-11-01; reference/VOICE.md "Pokey"). Dry, polite, one beat and he moves on; on a rescue, so the
 * jokes are how he copes, and at a real moment the joke doesn't come. No line fits any other stage. Dot is never spoken to or about as
 * present where she is away (6-6 to the end of World 7). Worlds 9 and 10 are not released yet.
 */
export const STAGE_LINES: Record<string, string> = {
  // World 1 · Emerald Canopy
  '1-1': 'High branches, big gaps. I jumped every one of them. Nobody was more surprised than me.',
  '1-2': 'Petals up the trees and back down again. She put the first one low for me. The rest, less so.',
  '1-3': "Learned to punch today. I said excuse me first. The snakes didn't wait for the second part.",
  '1-4': "The squirrels let me ride their lift up the kapok, for one acorn. They didn't laugh. Out loud.",
  '1-5': "More petals, but further apart now. She's running out of them. I'm not catching up fast enough.",
  '1-6': "First lianas. You have to let go of one before you've got the next. Nobody mentioned that part.",
  '1-7': "Tossed an acorn so the eagle would look the other way. Dot called it cunning. I'd call it throwing.",
  '1-8': 'The long branch broke apart as I went, so I ran. Meeca says I can. Apparently she was right.',
  '1-9': "Fought the boa's guards all the way along his branches. They were only doing their job. So was I.",
  '1-10': "He pictured a soldier, or a hawk. He got me. He's still working out how that happened.",
  // World 2 · Sunlit Riverbank
  '2-1': 'Hopped the logs drifting down to the village. They were in no hurry at all. I liked them right away.',
  '2-2': 'Picked flowers for a crocodile\'s crown. Not a sentence I ever expected to write. Meeca started it.',
  '2-3': 'Little ones hung in reed cages over the river. I let each one down gently. Gently is my only speed.',
  '2-4': "Swung across the river on the vines while the crocodile watched. Meeca's note said don't swim. I didn't.",
  '2-5': 'Snapping turtles. They snap. It says so right in the name. I respected the honesty, and asked them to leave.',
  '2-6': 'Climbed up past every front door in the village. Each one said PLEASE BE PATIENT. I already was.',
  '2-7': 'Walked the mailman\'s whole route. His package still says URGENT. We nodded as we passed. It took a while.',
  '2-8': "The water rose the moment I stepped in. Little ones out first. Then I remembered I don't swim.",
  '2-9': "The king's guards stood up straight and held their spears just so. I bowed. Then we got on with it.",
  '2-10': 'Told the king his crown suited him. It did. Then I put him upside down in his own mud.',
  // World 3 · Mossy Grotto
  '3-1': "Followed the glowworm light down into the grotto. I'm dim, but I'm steady. It was enough today.",
  '3-2': 'The glowworms only light up if you stand still and listen. Finally, a puzzle made for me.',
  '3-3': 'The footprints went round us in a circle. Then the ocelots went round too. I went straight through.',
  '3-4': "Climbed the sinkhole toward the moonlight. It didn't come down any closer to help. I didn't expect it to.",
  '3-5': 'Grandma always said these vines were asleep. Most of them were. I threw a pebble for the one that wasn\'t.',
  '3-6': "Grandma's things, hidden in the ferns by Dot, very fast. I crouched and said hello to a great many ferns.",
  '3-7': "All ferns look alike. Dot has apologized to twelve of them so far. I've only bothered eleven.",
  '3-8': "Swung past the thorns without touching one. Hanging still is the thing I'm best at. It finally paid off.",
  '3-9': 'They closed a ring around me, ocelots and a jaguar. I broke out of it. Slowly, but out.',
  '3-10': "Outwaited the Prowler in the dark. Two hours. I've waited longer than that for a vine to end.",
  // World 4 · Mist Cascades
  '4-1': 'That was never the Prowler. That was the General, using him like a hand. I climbed back up anyway.',
  '4-2': 'Opened a leaf and drifted across the falls. Turns out falling is fine, if you do it slowly.',
  '4-3': 'Climbed the wet steps by the waterfall. Knocked a tree into one of the falls to stop it. They have plenty more.',
  '4-4': 'The chimes ring before the wind comes. I listened, and swung when they said to. Good neighbors, chimes.',
  '4-5': "The Sky Sovereign was mid-dive all afternoon. I stayed under cover. I'd hate to interrupt her.",
  '4-D': "Dot's flight, not mine. Iron thorns, and one gap the width of a folded letter. I couldn't have done it.",
  '4-6': 'Climbed up above the mist to the eagle nests. The eagles looked surprised. Nothing climbs here, apparently.',
  '4-7': "All the way down the cliff on one leaf, back and forth. The quickest I've ever been anywhere was down.",
  '4-8': "Little ones stuck in the nests on the cliff. I let them out. They were gone before I'd finished saying good luck.",
  '4-9': "The wind kept blowing the Sovereign's capuchins off their ledges. I didn't help. Much.",
  '4-10': "Put the Sky Sovereign on the ground. She is never on the ground. Dot is telling everybody.",
  // World 5 · Orchid Sanctuary
  '5-M': "Meeca's night, not mine. She learned every rule here the hard way, then carved them on the trees for me.",
  '5-1': "The loveliest place on the whole road, and I wasn't allowed to stop. Typical.",
  '5-2': "Soft chairs everywhere, and a card that said do sit. I didn't. Hardest thing I've done all trip.",
  '5-3': "The orchids close early here, so I had to hurry. I've heard a lot about hurrying. It's overrated.",
  '5-4': "Swung across on the silk and didn't admire it once. Not out loud, anyway.",
  '5-5': 'Creatures wrapped up in silk like parcels. I unwrapped every one. None of them were for me.',
  '5-6': "She got away from them here, for one night. I followed where she ran. I didn't know she could do that.",
  '5-7': "Every thread hums if you touch it. I didn't touch one. The spiders slept through the whole thing.",
  '5-8': "Climbed the bloom trees up over the webs. From up there the webs look pretty. That's how they get you.",
  '5-9': "Fought through the Queen's garden. Everybody was terribly polite about it, including me.",
  '5-10': "Fifty years of her webs, and I walked straight through them. I still didn't eat the cake.",
  // World 6 · Deep Mangrove
  '6-1': 'A maze of roots over black water. I took every wrong turn there was, and I took them carefully.',
  '6-2': 'A spear came up out of the water and looked around. I stayed in the reeds and did my best reed.',
  '6-3': 'Swung root to root all morning. Every time I looked down, the water was already looking up.',
  '6-4': 'Crossed the mudflats before the tide came back. Me, racing the sea. The sea was being generous.',
  '6-5': "Chased the Reaver's hunters out of the mangrove. They had spears. I had manners, and claws.",
  '6-6': 'Dark in the roots, and no Dot. Then a firefly lit the next step for me. I thanked him twice.',
  '6-7': 'Raised the water, lowered it, and found a note Dot left me by accident. On purpose. She is terrible at accidents.',
  '6-8': "The tide came in under me the whole climb, fast and dirty. I didn't look down. I didn't have time.",
  '6-9': "Caimans that look like roots, and frogs you mustn't touch. I touched nothing. Nothing is my best event.",
  '6-10': "Met the Reaver at noon, which the note said not to do. He thought I'd be taller. I get that a lot.",
  // World 7 · Ancient Ruins
  '7-1': 'The temple door was standing open, so I went in. I knocked anyway. Habit.',
  '7-2': "The vines on these walls have gone brown and stiff. I climbed them gently. They've had a long century.",
  '7-3': "Searched the courtyard for relics. Didn't sit in a single chair. The orchids broke me of sitting.",
  '7-4': "The floor gave way and I slid down a stone chute, dodging statues. Fastest I've ever gone. I didn't care for it.",
  '7-5': "The stone sentries don't talk either. I'm starting to miss being interrupted.",
  '7-6': "The old floors fell in a step behind me. I've never been a step ahead of anything before.",
  '7-7': "Old things in the ruins, wrapped with care for somebody's family. Big hands did the wrapping. I didn't ask whose.",
  '7-8': 'Climbed to the top of the temple. Turned to tell Dot the view was good. Told the view instead.',
  '7-9': "Fought through the Golem's hall. Everything I've met since home was in there, and they'd all heard of me.",
  '7-10': 'The Golem called me fast. It took him a while to say it. I made him say it twice.',
  'S-1': "Thornbark fought exactly like me, only meaner. I'd always wondered what I look like angry. Not great.",
  // World 8 · Twilight Treetops
  '8-1': "Tiptoed past a boa asleep on the branch. I didn't wake him. I know exactly how that feels.",
  '8-2': 'Picked night blooms by firefly light. They only open after dark. I respect a flower that keeps my hours.',
  '8-3': "Long swings through the dark. I couldn't see the next vine until I had it. That's faith, or bad planning.",
  '8-4': 'Carried a jar of fireflies through the dark. It kept going dim. The flowers helped. So did not dawdling, for once.',
  '8-5': "A flower threw me up into the next tree. I hadn't asked it to. Next branch, then the one after.",
  '8-6': 'Glided tree to tree by moonlight. The night wind had other plans. I had a leaf.',
  '8-7': 'Climbed the tallest tree to see the way ahead. I could see the fortress. It could probably see me.',
  '8-8': "Night hunters, a harpy and all. They're quick in the dark. I'm slow in any light, which confused them.",
  '8-9': "The Monarch's wood is darker than the grotto. Dot didn't say a word about it. She was being brave for me.",
  '8-10': "The Monarch says the night is hers. I've been up through most of it lately. We came to an arrangement.",
};

// ───────────────────────────── the record lines (Matt, 2026-11-01) ─────────────────────────────

/**
 * What a play record adds after the stage's line: at most two, the most notable (RECORD_ORDER). {n} a number (or "once"/"twice"),
 * {t} a time, {f}/{ft} pickups of the total and {p} what they are ("petals", "night blooms"), {c} a creature, {x} a find or medal.
 * A line naming Dot is skipped where she is away (wayside.ts dotPresent). No line is used twice on one world's page (worldEntries).
 */
export const LINES = {
  clean: [
    'Not one fall. I kept waiting for the catch.',
    "Never fell once. Don't get used to it.",
    "Didn't fall once. Dot checked me for bruises anyway.",
    'Not a scratch. Slow is very hard to trip over.',
    "Clean, start to finish. I'd like to say I planned it.",
    'Not one slip. The ground and I kept a polite distance.',
    'Stayed on my feet the whole way. Well. On my claws.',
    "No falls. Not even a wobble. Dot says I'm showing off.",
    'Never touched the ground once. Nobody look too closely at how.',
    "Didn't fall once. Slow and careful, Meeca would say. She'd be right.",
  ],
  fewFalls: [
    "Fell {n}. Got back up {n}. It's a tie, and I'll take it.",
    'Fell off {n}. The ground was nice about it.',
    "Slipped {n}. Dot pretended not to see. She's bad at pretending.",
    "Went down {n}. Didn't stay down. That's the trick, mostly.",
    "Fell {n}. Not far. I'm a careful faller.",
    'The ground came up to meet me {n}. Friendly of it.',
    "Lost my grip {n}. Found it again right where I'd left it.",
    "Fell {n}. I'd call that a rehearsal.",
  ],
  manyFalls: [
    'Fell {n} times. Slow is not stopped.',
    "{n} falls. Dot stopped counting out loud after three. I didn't.",
    'Fell {n} times. Every one of them was educational.',
    "Fell {n} times. I'm on first-name terms with the ground now.",
    'Fell {n} times, got up {n} times. The second number is the one that counts.',
    'Fell {n} times. I prefer to think of it as sitting down very fast.',
    'Fell {n} times. The hard part lost in the end. It just took a while.',
    '{n} falls. Dot covered her eyes for most of them.',
  ],
  quick: [
    'Done in {t}. Dot called it a sprint. It was not a sprint.',
    "Only {t}. I'm not sure what came over me.",
    "All done in {t}. Don't tell anyone. They'll expect it again.",
    "Took {t}. For me, that's practically a blur.",
    'Through in {t}. Meeca always said I could hurry if it mattered. It mattered.',
    'Just {t}. I think the place was as surprised as I was.',
  ],
  long: [
    'Took {t}. Some of that was looking at things.',
    "{t} out there. I wasn't lost. I was thorough.",
    'Took {t}. Every minute of it on purpose. Most of them.',
    'Took {t}. A snail passed me once. We nodded.',
    "Took {t}. Long, I know. I'd like to see anyone do it slower.",
    "Took {t}. I was being careful. I was also being me.",
  ],
  allFlowers: [
    'Every one of the {p}, all {ft}. I went back for the last one.',
    "All {ft} {p}. Didn't leave a single one for later.",
    'Picked up all {ft} {p}. The satchel smells lovely.',
    'Got every one of the {p}, all {ft}. Somebody had to.',
    'All {ft} {p}, the high ones too. I looked up. Twice.',
    '{ft} {p} out of {ft}. I counted slowly, to be sure.',
    'All {ft} {p}. Meeca would have found one more. She always does.',
  ],
  mostFlowers: [
    '{f} of {ft} {p}. The rest can keep a while.',
    'Picked {f} {p}. Left a few for the bees.',
    "{f} {p} of {ft}. The ones I missed were very well hidden, I'm told.",
    '{f} out of {ft} {p}. Close. Close is good.',
    'Got {f} of the {ft} {p}. Not all. Most is a fine word.',
    "{f} {p} of {ft}. I'll pick up the others on the way back.",
  ],
  fewFlowers: [
    "Only {f} {p}. The rest are still there. That's fine.",
    '{f} {p}. I was busy not falling.',
    'Picked {f} {p}. Dot says that\'s "a start".',
    'Just {f} {p}. I had my eyes on other things. Mostly the ground.',
    '{f} {p} of {ft}. I had other things on my mind.',
    '{f} of {ft} {p}. Not my best. Not my worst. Somewhere in between, like me.',
  ],
  foes: [
    '{n} {c} in the way. Not anymore.',
    'Said excuse me to {n} {c}. It went better for me than for them.',
    '{c}: {n}. Pokey: still here.',
    'Moved {n} {c} along. Politely. Mostly.',
    "{n} {c} thought I'd be easy. Usually they'd be right.",
    '{n} {c}, every one quicker than me. I was the one still standing.',
  ],
  freed: [
    'Let {n} out. They said thank you. One of them twice.',
    'Set {n} loose. Nobody should be kept in a box.',
    'Got {n} out. I know someone else who is waiting on a door.',
    "{n} out and gone before I'd straightened up.",
    'Freed {n}. Not one of them asked what took me so long. Kind of them.',
    "{n} freed. Every one ran off faster than I've ever done anything.",
  ],
  find: [
    'Found {x}. Put it in the satchel, on top.',
    'Found {x}. Meeca left it for me. I know she did.',
    '{x} is in the satchel now, next to the others.',
    "Found {x}, right where I'd have missed it if I were faster.",
    'Turned up {x}. Being low to the ground has its uses.',
    'Found {x}. I held it a while before I put it away.',
    'Found {x}. Dot made me hold it up to the light.',
  ],
  medal: [
    'Dot says I earned the {x} medal. She made a speech.',
    'Got the {x} medal. Dot wants to wear it.',
    "A medal: {x}. I'll show Meeca. She'll pretend to be surprised.",
    "Earned the {x} medal. It's heavier than it looks. So am I.",
    "The {x} medal. I didn't know they gave those out for this.",
    "Picked up the {x} medal on the way. I'll try not to let it change me.",
  ],
  replayed: [
    'Went back {n} since. Some places you visit again.',
    "Been back {n} since. It's a good place to be slow in.",
    'Came back {n}. It had moved things around on me.',
    'Went back {n} since. Still not in a hurry.',
    "Back here {n} since. Dot asks why. I don't have a good answer.",
    'Came this way again {n}. Meeca would understand.',
  ],
} as const;
export type LineKind = keyof typeof LINES;

/** the record lines an entry may carry, most notable first: the first two that apply (and have a line left on the page) are used */
export const RECORD_ORDER: readonly LineKind[] = ['clean', 'manyFalls', 'find', 'medal', 'allFlowers', 'freed', 'fewFalls', 'quick', 'long', 'foes', 'mostFlowers', 'fewFlowers', 'replayed'];
export const RECORD_MAX = 2;

/** the stage the story is known for in each world: the opener (1), halfway (5), the guardian's door (9) and the guardian (10) */
export const BEATS: Record<number, Partial<Record<number, string>>> = {
  1: { 1: 'A petal on a tree. Meeca was here.', 5: "Dot found a note. She read it to me twice. I didn't mind." },
  2: { 1: 'The village wants everyone to wait. I am good at that, usually.', 5: 'Another note. Meeca is walking faster than I am. Of course she is.' },
  3: { 1: 'The grotto glows. Something is watching. I watched it back.', 5: 'Dot sang to the glowworms. They lit up. So did she.' },
  4: { 1: 'Mist. Falls. Wings above the clouds. Dot is not afraid of heights. She told me so many times.', 5: 'Dot flew the netting on her own. Nine scratches. She showed me every one.' },
  5: { 1: 'Orchids everywhere. Cobwebs too. The Butler offered cake. I said no.', 5: 'The Queen\'s house is quiet. Too quiet. I like quiet, but not this quiet.' },
  6: { 1: 'Black water. A spear. A very strict lunch.', 5: "No Dot. I keep turning to tell her things." },
  7: { 1: 'Ten stone chairs in a ring, and an eleventh with a dent in it.', 5: 'Flicker lights the way. He doesn\'t say much. Neither do I.' },
  8: { 1: 'Fireflies. Moonlight. I dreamt of a petal.', 5: 'Dot is back. She brought a note and an apology. Mostly the note.' },
  9: { 1: 'Lava rivers. A dragon who is bad at visitors. So am I.', 5: 'Hot. Very hot. Meeca was here. The rocks are still warm.' },
  10: { 1: 'A thousand steps. One lit window. No hummingbird.', 5: 'Halfway up. I can see the window now.', 9: 'The fortress gate. Dot went around the back. Flicker stayed.' },
};

/** filler that must never be written (Matt, 2026-11-01: "Too many 'I didn't write it down, the ending was good.'") */
export const BANNED_FILLER = /write it down|wrote it down|the details are fuzzy|fuzzy|I remember it was|remembers more of it|don't remember|can't remember|the ending was good|cleared it\b|^\s*done\./i;

// ───────────────────────────── building the entries ─────────────────────────────

/** a stable small number from a string (the same stage always picks the same variant) */
export function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}
const fill = (t: string, v: Record<string, string | number>) => {
  const s = t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** "2:35", or "45 seconds" under a minute */
export function fmtTime(sec: number): string {
  if (sec < 60) return `${sec} seconds`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
/** small counts read as words in a journal ("Fell four times"), big ones as numbers */
const NUM_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const num = (n: number) => NUM_WORDS[n] ?? String(n);
/** a time the way he'd say it: "45 seconds", "a minute", "four minutes" */
export function sayTime(sec: number): string {
  if (sec < 60) return `${num(Math.max(1, Math.round(sec)))} seconds`;
  const m = Math.round(sec / 60);
  return m === 1 ? 'a minute' : `${num(m)} minutes`;
}
const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${num(n)} times`);

export interface EntryNames {
  /** a creature id to its plural name, for "3 golden tree snakes" */
  creature: (id: string, n: number) => string;
  find: (id: string) => string | undefined;
  medal: (id: string) => string | undefined;
}

export interface StageEntry {
  id: string;
  stage: string;
  /** the story: the stage's own line and the world's beat */
  story: string[];
  /** how it was played: at most two record lines (none for a save from before the journal kept records) */
  notes: string[];
  /** at a guardian, the world's line (POKEY_JOURNAL), closing the entry and the world */
  close?: string;
  /** all of it, in order: story, notes, close */
  lines: string[];
  /** the record had nothing to go on (a save from before the journal kept records) */
  plain: boolean;
  stars: number;
}

type EntryStage = { id: string; name: string; worldIndex: number; miniIndex: number; stars: number };

/** the record lines that apply to a first clear, in RECORD_ORDER, each with its values */
function candidates(stage: EntryStage, rec: PlayRecord, f: FirstClear, names: EntryNames): Array<{ kind: LineKind; v: Record<string, string | number>; salt: string }> {
  const out: Array<{ kind: LineKind; v: Record<string, string | number>; salt: string }> = [];
  const p = isPetalStage(stage.worldIndex, stage.miniIndex) ? 'petals' : 'night blooms';
  const share = f.ft > 0 ? f.fl / f.ft : 0;
  const md = f.md.map(names.medal).filter((x): x is string => !!x);
  const fd = f.fd.map((id) => names.find(id)).filter((x): x is string => !!x);
  for (const kind of RECORD_ORDER) {
    const add = (v: Record<string, string | number> = {}) => out.push({ kind, v, salt: '' });
    if (kind === 'clean' && f.ll === 0 && f.hl === 0) add();
    else if (kind === 'manyFalls' && f.ll >= 3) add({ n: num(f.ll) });
    else if (kind === 'fewFalls' && f.ll >= 1 && f.ll <= 2) add({ n: times(f.ll) });
    else if (kind === 'find' && fd.length) add({ x: `“${fd[0]}”` });
    else if (kind === 'medal' && md.length) add({ x: md[0] });
    else if (kind === 'allFlowers' && f.ft >= 2 && share >= 1) add({ ft: num(f.ft), p });
    else if (kind === 'mostFlowers' && f.ft > 0 && f.fl >= 2 && share >= 0.6 && share < 1) add({ f: num(f.fl), ft: num(f.ft), p });
    else if (kind === 'fewFlowers' && f.ft > 0 && f.fl >= 2 && share < 0.6) add({ f: num(f.fl), ft: num(f.ft), p });
    else if (kind === 'freed' && f.fr > 0) add({ n: num(f.fr) });
    else if (kind === 'quick' && f.t > 0 && f.t < 100) add({ t: sayTime(f.t) });
    else if (kind === 'long' && f.t >= 240) add({ t: sayTime(f.t) });
    else if (kind === 'foes' && f.kt && f.k >= 3) add({ n: num(f.k), c: names.creature(f.kt, f.k) });
    else if (kind === 'replayed' && rec.w > 1) add({ n: times(rec.w - 1) });
  }
  return out;
}

/**
 * the journal entry for one cleared stage. `used` holds the record lines already on this world's page: a line is never used twice
 * on a page, so a kind that has run out gives way to the next notable one. The same page always reads the same (worldEntries).
 */
export function stageEntry(stage: EntryStage, rec: PlayRecord | null, names: EntryNames, used: Set<string> = new Set()): StageEntry {
  const id = stage.id;
  const story: string[] = [];
  const notes: string[] = [];
  const own = STAGE_LINES[id];
  if (own) story.push(own);
  const beat = stage.miniIndex <= 10 ? BEATS[stage.worldIndex]?.[stage.miniIndex] : undefined;
  if (beat) story.push(beat);
  const f: FirstClear | undefined = rec?.first;
  if (rec && f) {
    const dot = dotPresent(stage.worldIndex, stage.miniIndex);
    let n = 0;
    for (const c of candidates(stage, rec, f, names)) {
      if (n >= RECORD_MAX) break;
      const list = (LINES[c.kind] as readonly string[]).filter((t) => (dot || !/\bDot\b/.test(t)) && !used.has(t));
      if (!list.length) continue;
      const t = list[(seedOf(id) + c.kind.length * 7) % list.length];
      used.add(t);
      notes.push(fill(t, c.v));
      n++;
    }
  }
  const close = stage.miniIndex === 10 ? POKEY_JOURNAL[stage.worldIndex] : undefined;
  return { id, stage: stage.name, story, notes, close, lines: [...story, ...notes, ...(close ? [close] : [])], plain: !f, stars: stage.stars };
}

/** every cleared stage's entry on one world's page, in the order they're played, with no record line used twice on the page */
export function worldEntries(
  world: number,
  stages: readonly (EntryStage & { completed: boolean })[],
  records: Record<string, PlayRecord>,
  names: EntryNames,
): StageEntry[] {
  const used = new Set<string>();
  // (in the game's own order, so Dot's flight sits after 4-5 and Meeca's night opens World 5)
  return stages.filter((l) => l.worldIndex === world && l.completed).map((l) => stageEntry(l, records[l.id] ?? null, names, used));
}

export interface WorldReview {
  world: number;
  /** the story so far: the world's teaser and, once its guardian is down, Pokey's line for it */
  story: string[];
  creatures: string[];
  best: string[];
  stats: { cleared: number; total: number; stars: number; time: number; falls: number; flowers: number; flowerTotal: number; finds: number; findTotal: number };
  done: boolean;
}

/** the review page at a world's end */
export function worldReview(
  world: number,
  stages: readonly { id: string; name: string; worldIndex: number; miniIndex: number; completed: boolean; stars: number }[],
  records: Record<string, PlayRecord>,
  extra: { teaser?: string; creatures: string[]; finds: number; findTotal: number },
): WorldReview {
  const mine = stages.filter((l) => l.worldIndex === world && l.miniIndex <= 10);
  const cleared = mine.filter((l) => l.completed);
  const done = mine.some((l) => l.miniIndex === 10 && l.completed);
  const stats = { cleared: cleared.length, total: mine.length, stars: 0, time: 0, falls: 0, flowers: 0, flowerTotal: 0, finds: extra.finds, findTotal: extra.findTotal };
  let fastest: { name: string; t: number } | null = null;
  let flowers: { name: string; f: number; ft: number } | null = null;
  const clean: string[] = [];
  for (const l of cleared) {
    stats.stars += l.stars;
    const f = records[l.id]?.first;
    if (!f) continue;
    stats.time += f.t;
    stats.falls += f.ll;
    stats.flowers += f.fl;
    stats.flowerTotal += f.ft;
    if (f.t > 0 && (!fastest || f.t < fastest.t)) fastest = { name: l.name, t: f.t };
    if (f.ft > 0 && (!flowers || f.fl / f.ft > flowers.f / flowers.ft)) flowers = { name: l.name, f: f.fl, ft: f.ft };
    if (f.ll === 0 && f.hl === 0) clean.push(l.name);
  }
  const best: string[] = [];
  if (clean.length) best.push(clean.length === 1 ? `Not a scratch in ${clean[0]}.` : `Not a scratch in ${num(clean.length)} stages.`);
  if (fastest) best.push(`Quickest: ${fastest.name}, in ${fmtTime(fastest.t)}.`);
  // (Meeca's petals are every stage's pickup but World 8's harvest, whose night blooms are its own: stagePlan isPetalStage)
  const fw = world === 8 ? 'flower' : 'petal';
  if (flowers && flowers.f > 0) best.push(flowers.f === flowers.ft ? `Every ${fw} in ${flowers.name}.` : `Most ${fw}s: ${flowers.f} of ${flowers.ft} in ${flowers.name}.`);
  if (extra.finds) best.push(`${num(extra.finds).replace(/^./, (c) => c.toUpperCase())} of Meeca's things found here.`);
  const story: string[] = [];
  if (extra.teaser) story.push(extra.teaser);
  if (done && POKEY_JOURNAL[world]) story.push(POKEY_JOURNAL[world]);
  return { world, story, creatures: extra.creatures, best, stats, done };
}

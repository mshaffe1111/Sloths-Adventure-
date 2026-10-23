/**
 * Finds: the notes, photo books and keepsakes hidden in the stages. Each world hides three:
 *  - a NOTE from Meeca in plain sight (a Keeper's Bell flower you just touch), in the world's 2nd stage,
 *  - a KEEPSAKE hidden in a Hush Fern (crouch beside it), in the 5th stage,
 *  - a BOOK, a photo album, hidden the same way, in the 8th stage.
 * They are a bonus layer: the cutscenes tell the whole story, and these deepen it. Every find that has been picked up stays in the
 * Trophy Room's Library, where it can be read again at any time.
 */

export type FindKind = 'note' | 'book' | 'keepsake';
export type PaperKind = 'leaf' | 'journal' | 'letter';
export type KeepsakeIcon = 'key' | 'locket' | 'medal' | 'ribbon' | 'petal' | 'rattle' | 'teddy' | 'seeds' | 'stopwatch' | 'bell' | 'token';

export interface FindPage {
  /** the words on the page */
  text?: string;
  /** a photograph, by its key (see photos.ts); a page without art shows a faded print */
  photo?: string;
  /** printed under the photograph */
  caption?: string;
}

export interface FindDef {
  id: string;
  world: number;
  kind: FindKind;
  title: string;
  /** shown on the locked card in the Library */
  hint: string;
  /** notes only: what the paper looks like */
  paper?: PaperKind;
  /** keepsakes only: the little picture */
  icon?: KeepsakeIcon;
  pages: FindPage[];
}

/** the stage of each world (1..9) that hides each kind of find; stage 7 hides the Thorn Gate in World 7 and stage 10 is the boss */
export const FIND_STAGE: Record<FindKind, number> = { note: 2, keepsake: 5, book: 8 };

export const FINDS: FindDef[] = [
  // ───────────── World 1: Emerald Canopy ─────────────
  {
    id: 'w1_note', world: 1, kind: 'note', paper: 'leaf',
    title: 'The first petal',
    hint: 'World 1, in plain sight. Look for a pink bell.',
    pages: [{ text: 'Pokey, you found the first one. Good. Keep going. The path is longer than it looks and shorter than you fear.\n\nP.S. Dot says hello. Dot says a lot of things, mostly fast.\n\nLove, M.' }],
  },
  {
    id: 'w1_keepsake', world: 1, kind: 'keepsake', icon: 'key',
    title: 'A small iron key',
    hint: 'World 1, hidden. Crouch beside a fern.',
    pages: [{ text: 'A tiny iron key on a green ribbon. The teeth are worn smooth from years of being carried. Somebody kept it very close.' }],
  },
  {
    id: 'w1_book', world: 1, kind: 'book',
    title: 'The Young Scholar',
    hint: 'World 1, hidden. A photo album in a fern.',
    pages: [
      { photo: 's1_01', caption: 'Top of the class', text: 'He was first in his class and did not seem to know it.' },
      { photo: 's1_02', caption: 'Graduation day', text: 'He held the diploma as if it might fly away.' },
      { photo: 's1_03', caption: 'Three friends, one bench', text: 'Before any of them had a rank, they had each other.' },
      { photo: 's1_04', caption: 'The first posting', text: 'A border outpost, a map, and a great deal of patience.' },
    ],
  },
  // ───────────── World 2: Sunlit Riverbank ─────────────
  {
    id: 'w2_note', world: 2, kind: 'note', paper: 'leaf',
    title: 'About the river',
    hint: 'World 2, in plain sight. Look for a pink bell.',
    pages: [{ text: 'Pokey, the river is wide. Don\'t swim. Actually, swim a little.\n\nP.S. The crocodile has a crown. Be polite about it.\n\nLove, M.' }],
  },
  {
    id: 'w2_keepsake', world: 2, kind: 'keepsake', icon: 'locket',
    title: 'A silver locket',
    hint: 'World 2, hidden. Crouch beside a fern.',
    pages: [{ text: 'A silver locket, engraved with a single name: Meeca. Inside there is nothing but a pressed petal, still faintly pink.' }],
  },
  {
    id: 'w2_book', world: 2, kind: 'book',
    title: 'The Hero of the River',
    hint: 'World 2, hidden. A photo album in a fern.',
    pages: [
      { photo: 's1_05', caption: 'The flood', text: 'A cub was swept off the bank. He did not stop to ask whose it was.' },
      { photo: 's1_06', caption: 'The medal', text: 'They gave him a medal. He kept it in a drawer.' },
      { photo: 's1_07', caption: 'Planting the future', text: 'Every year after, he planted one tree where the river had been.' },
      { photo: 's1_08', caption: 'A signature', text: 'Peace is mostly paperwork, he used to say. He was good at both.' },
    ],
  },
  // ───────────── World 3: Mossy Grotto ─────────────
  {
    id: 'w3_note', world: 3, kind: 'note', paper: 'leaf',
    title: 'About the dark',
    hint: 'World 3, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, it's dark in there and I can't help that. Here's what I can do: the glowworms only light up for people who stand still. You are very good at standing still.\n\nP.S. Dot has been hiding Grandma's things in ferns so the soldiers won't find them. Dot's memory is terrible. Crouch down and look around.\n\nLove, M." }],
  },
  {
    id: 'w3_keepsake', world: 3, kind: 'keepsake', icon: 'medal',
    title: 'A tarnished medal',
    hint: 'World 3, hidden. Crouch beside a fern.',
    pages: [{ text: "A tarnished medal on a faded blue ribbon. Someone scratched a line on the back with a pin: \"For the next cub.\"" }],
  },
  {
    id: 'w3_book', world: 3, kind: 'book',
    title: 'The Statesman',
    hint: 'World 3, hidden. A photo album in a fern.',
    pages: [
      { photo: 's1_09', caption: 'A speech to the valley', text: 'They cheered him. He looked slightly alarmed by it.' },
      { photo: 's1_10', caption: 'The banquet', text: 'He raised a glass to his fiercest rival, and meant it.' },
      { photo: 's1_14', caption: 'The Original Council', text: 'Five friends who agreed to disagree, in the same room, for twenty years.' },
      { photo: 's1_13', caption: 'The study', text: 'After every long day he went home and read. The books outnumbered the medals.' },
    ],
  },
  // ───────────── World 4: Mist Cascades ─────────────
  {
    id: 'w4_note', world: 4, kind: 'note', paper: 'journal',
    title: 'Not a map',
    hint: 'World 4, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, the soldiers keep asking me where Grandma's flower is. I keep telling them it's a plant, not a map.\n\nGrandma said the Heartbloom only opens for people who aren't in a hurry. I always thought she was being poetic. I am starting to think she was giving instructions.\n\nLove, M." }],
  },
  {
    id: 'w4_keepsake', world: 4, kind: 'keepsake', icon: 'ribbon',
    title: 'Half a ribbon',
    hint: 'World 4, hidden. Crouch beside a fern.',
    pages: [{ text: 'Half of a pink ribbon, the end torn clean across. A knot is still tied in it. Somewhere, someone is keeping the other half.' }],
  },
  {
    id: 'w4_book', world: 4, kind: 'book',
    title: 'Two Travelers',
    hint: 'World 4, hidden. A photo album in a fern.',
    pages: [
      { photo: 's3_01', caption: 'The mountains', text: 'She said the mountain was too tall. He said that was its only fault.' },
      { photo: 's3_02', caption: 'Tea on the veranda', text: 'Neither of them said much. It was the best conversation of the year.' },
      { photo: 's3_03', caption: 'The falls', text: 'He insisted on bringing the camera. She insisted on being in the picture.' },
      { photo: 's3_04', caption: 'The riverboat', text: 'She pointed at everything. He looked at her.' },
    ],
  },
  // ───────────── World 5: Orchid Sanctuary ─────────────
  {
    id: 'w5_note', world: 5, kind: 'note', paper: 'leaf',
    title: 'A blanket',
    hint: 'World 5, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, an officer gave me a blanket today. He said, \"Don't tell the General.\" I said thank you. He said, \"Please don't thank me. It's embarrassing.\"\n\nI am no longer sure whose side everyone is on. I think half of them are waiting for permission to stop.\n\nLove, M." }],
  },
  {
    id: 'w5_keepsake', world: 5, kind: 'keepsake', icon: 'petal',
    title: 'A pressed petal',
    hint: 'World 5, hidden. Crouch beside a fern.',
    pages: [{ text: "A single Heartbloom petal, pressed flat for a very long time. In tiny pencil, in a hand that has since stopped writing: \"Be patient with the slow ones. They always arrive.\"" }],
  },
  {
    id: 'w5_book', world: 5, kind: 'book',
    title: 'Where They Went',
    hint: 'World 5, hidden. A photo album in a fern.',
    pages: [
      { photo: 's3_05', caption: 'Low tide', text: 'They walked the whole shore and did not once check the time.' },
      { photo: 's3_06', caption: 'Lost, on purpose', text: 'The map said turn left. They turned right and found the better view.' },
      { photo: 's3_07', caption: 'The old temples', text: 'A place they promised to return to. They would, years later, for a different reason.' },
      { photo: 's3_08', caption: 'A toast', text: 'To slow mornings, she said. He agreed, mostly.' },
    ],
  },
  // ───────────── World 6: Deep Mangrove ─────────────
  {
    id: 'w6_note', world: 6, kind: 'note', paper: 'letter',
    title: 'A letter to Grandma',
    hint: 'World 6, in plain sight. Look for a pink bell.',
    pages: [{ text: "Dear Grandma,\n\nPokey is coming. I know you'd tell me not to wait for anyone. But he is slow and stubborn, and he has never once turned back. You would like him. You would tell him to eat something.\n\nLove, Meeca\n\n(Pokey: if Dot delivered this by mistake, hello. Please skip the part about your hat.)" }],
  },
  {
    id: 'w6_keepsake', world: 6, kind: 'keepsake', icon: 'rattle',
    title: 'A wooden rattle',
    hint: 'World 6, hidden. Crouch beside a fern.',
    pages: [{ text: 'A small wooden rattle, chewed at one end by someone with no teeth yet. It still rattles, very faintly, like a secret.' }],
  },
  {
    id: 'w6_book', world: 6, kind: 'book',
    title: 'The Guardian',
    hint: 'World 6, hidden. A photo album in a fern.',
    pages: [
      { photo: 's1_11', caption: 'On patrol', text: 'The armor was heavy. He wore it so that nobody else would have to.' },
      { photo: 's1_12', caption: 'Festival day', text: 'Confetti, a sash, a wave. He waved back at everyone, including the macaws.' },
      { photo: 's1_15', caption: "Guardian's watch", text: 'Evenings he watched the river road, in case anyone needed him.' },
      { photo: 's1_16', caption: 'A handshake', text: 'A traveler with a heavy pack and a lazy smile. They talked until dawn.' },
    ],
  },
  // ───────────── World 7: Ancient Ruins ─────────────
  {
    id: 'w7_note', world: 7, kind: 'note', paper: 'journal',
    title: 'The quiet',
    hint: 'World 7, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, this place is older than the General and older than Grandma's stories. I keep thinking someone I love walked here once. I can't think who.\n\nThe officers go quiet when the General passes my door. Not afraid-quiet. Sad-quiet. I don't understand it yet.\n\nLove, M." }],
  },
  {
    id: 'w7_keepsake', world: 7, kind: 'keepsake', icon: 'teddy',
    title: 'A mended bear',
    hint: 'World 7, hidden. Crouch beside a fern.',
    pages: [{ text: 'A small stuffed bear with one eye sewn back on. The stitches are tiny and careful, as if the one who made them practiced first, with very large hands.' }],
  },
  {
    id: 'w7_book', world: 7, kind: 'book',
    title: 'Our Girl',
    hint: 'World 7, hidden. A photo album in a fern.',
    pages: [
      { photo: 's3_09', caption: 'A picnic, with a new arrival', text: 'A basket, a blanket, and one very small passenger. On the back: "Our girl."' },
      { photo: 's4_02', caption: 'Bedtime', text: 'He read to her every night, long before she could follow a word. The books were all about generals who retire.' },
      { photo: 's4_01', caption: 'Hello', text: 'He held her as if she might break. Then, quickly, as if he might.' },
      { photo: 's4_04', caption: 'Meeca, three weeks old', text: 'In pencil, on the back: "Grandpa has not put her down since."' },
    ],
  },
  // ───────────── World 8: Twilight Treetops ─────────────
  {
    id: 'w8_note', world: 8, kind: 'note', paper: 'leaf',
    title: 'A pillow',
    hint: 'World 8, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, a lieutenant asked if I wanted a pillow. I said I'm a hostage, not a guest. He said, \"Yes, ma'am. Would you like a pillow?\"\n\nEvery night the General stands outside my door for a long time. He never comes in. I think he wants to say something. I am not going to make it easy.\n\nLove, M." }],
  },
  {
    id: 'w8_keepsake', world: 8, kind: 'keepsake', icon: 'seeds',
    title: 'A packet of seeds',
    hint: 'World 8, hidden. Crouch beside a fern.',
    pages: [{ text: 'A paper packet of seeds, labelled in a careful hand: "For the hill. Plant when it is quiet." It has never been opened.' }],
  },
  {
    id: 'w8_book', world: 8, kind: 'book',
    title: 'The Little Walks',
    hint: 'World 8, hidden. A photo album in a fern.',
    pages: [
      { photo: 's4_05', caption: 'First day of school', text: 'She insisted on carrying her own bag. He insisted on carrying the bag.' },
      { photo: 's4_06', caption: 'A gift', text: 'He knelt to fasten something small around her neck. "So you will always know your name," he said.' },
      { photo: 's4_08', caption: 'Festival day', text: 'She could see everything from up there. He could see only her.' },
      { photo: 's4_07', caption: 'Planting day', text: 'She watered it far too much. The tree survived out of politeness.' },
    ],
  },
  // ───────────── World 9: Volcanic Jungle ─────────────
  {
    id: 'w9_note', world: 9, kind: 'note', paper: 'leaf',
    title: 'It is very hot',
    hint: 'World 9, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, last night the General said something to nobody in particular: \"Fast people are the ones who arrive in time.\"\n\nI told him my friend is the slowest person I know and has never once failed to arrive. He didn't answer. He didn't leave, either.\n\nP.S. It is very hot in here. Dot has stopped glowing and started sweating.\n\nLove, M." }],
  },
  {
    id: 'w9_keepsake', world: 9, kind: 'keepsake', icon: 'stopwatch',
    title: 'A dented stopwatch',
    hint: 'World 9, hidden. Crouch beside a fern.',
    pages: [{ text: 'A dented stopwatch, glass cracked, still ticking. Scratched on the back: "I always stopped it a second early. She never knew."' }],
  },
  {
    id: 'w9_book', world: 9, kind: 'book',
    title: 'The Runner',
    hint: 'World 9, hidden. A photo album in a fern.',
    pages: [
      { photo: 's4_11', caption: 'Training day', text: 'She ran. He clapped. She was not keeping score, so he did.' },
      { photo: 's4_12', caption: 'The vine', text: 'She was not supposed to be that high. He was not supposed to be that proud.' },
      { photo: 's4_14', caption: 'The certificate', text: 'Her first medal. He read the certificate twice, then a third time out loud.' },
      { photo: 's4_16', caption: 'Side by side', text: 'He wore the suit. She wore the headband. Both were their best clothes.' },
    ],
  },
  // ───────────── World 10: Stormy Highlands Fortress ─────────────
  {
    id: 'w10_note', world: 10, kind: 'note', paper: 'letter',
    title: 'Come and get me',
    hint: 'World 10, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey,\n\nWhatever happens tomorrow, you were never too slow. I have just been waiting for someone who stops.\n\nCome and get me. Bring snacks.\n\nP.S. Don't hurt him more than you have to. I don't know why I wrote that.\n\nLove, M." }],
  },
  {
    id: 'w10_keepsake', world: 10, kind: 'keepsake', icon: 'bell',
    title: 'A small bronze bell',
    hint: 'World 10, hidden. Crouch beside a fern.',
    pages: [{ text: 'A small bronze bell, green with age. Grandma rang it whenever someone she loved was coming home. It has not rung since the day she died.' }],
  },
  {
    id: 'w10_book', world: 10, kind: 'book',
    title: 'The Last Pages',
    hint: 'World 10, hidden. A photo album in a fern.',
    pages: [
      { photo: 's2_05', caption: 'The whole family', text: 'Everyone who loved her stood close.' },
      { photo: 's2_06', caption: 'The hill', text: 'Under the old tree, where the valley is widest. He stood there a long time. Then he stopped coming.' },
      { photo: 's2_15', caption: 'Her chair', text: 'The chair by the window stayed where it was. So did he, for a year.' },
      { photo: 's2_16', caption: 'The last photograph', text: 'After this one there are no more pictures. Only orders.' },
    ],
  },
];

export const FIND_BY_ID: Record<string, FindDef> = Object.fromEntries(FINDS.map((f) => [f.id, f]));

/** the reward for finding all of them: it is never hidden in a stage, it opens in the Library when every other find is there */
export const BONUS_FIND: FindDef = {
  id: 'bonus_token', world: 0, kind: 'keepsake', icon: 'token',
  title: 'A secret token',
  hint: 'Find every note, album and keepsake to open it.',
  pages: [{ text: 'A small leather pouch tied with cord. Inside: one Heartbloom seed, and a folded note in the same hand as the petal.\n\n"To whoever was patient enough to find this. He will tell you he is not sorry. He is only afraid. Be slow with him. He has been fast for far too long."' }],
};
FIND_BY_ID[BONUS_FIND.id] = BONUS_FIND;

const REAL_IDS = new Set(FINDS.map((f) => f.id));

/** true once every note, album and keepsake in the stages has been found */
export function allFound(found: string[]): boolean {
  return FINDS.every((f) => found.includes(f.id));
}

/** the find that hides in this stage, if there is one */
export function findForStage(world: number, mini: number): FindDef | null {
  for (const kind of Object.keys(FIND_STAGE) as FindKind[]) {
    if (FIND_STAGE[kind] === mini) return FIND_BY_ID[`w${world}_${kind}`] ?? null;
  }
  return null;
}

// ───────────── what has been found (kept in the browser, and in save files) ─────────────

export const FINDS_KEY = 'sloth_finds';

/** accept only a well-formed record of known ids; anything else is treated as empty */
export function parseFinds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || o.v !== 1 || !Array.isArray(o.found)) return [];
    const seen = new Set<string>();
    for (const x of o.found) if (typeof x === 'string' && REAL_IDS.has(x)) seen.add(x);
    return [...seen];
  } catch {
    return [];
  }
}

export function loadFinds(): string[] {
  try {
    return parseFinds(localStorage.getItem(FINDS_KEY));
  } catch {
    return [];
  }
}

/** the list with this find added (the same list when it was already there) */
export function withFind(found: string[], id: string): string[] {
  return found.includes(id) || !REAL_IDS.has(id) ? found : [...found, id];
}

export function saveFinds(found: string[]) {
  try {
    localStorage.setItem(FINDS_KEY, JSON.stringify({ v: 1, found }));
  } catch {
    /* storage full or blocked: the find still shows for this session */
  }
}

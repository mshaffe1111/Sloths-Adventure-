/**
 * Finds: the notes, photo books and keepsakes hidden in the stages. Each world hides three:
 *  - a NOTE from Meeca in plain sight (a Keeper's Bell flower you just touch), in the world's 2nd stage,
 *  - a KEEPSAKE hidden in a Hush Fern (crouch beside it), in the 5th stage,
 *  - a BOOK, a photo album, hidden the same way, in the 8th stage.
 * They are a bonus layer: the cutscenes tell the whole story, and these deepen it. Every find that has been picked up stays in
 * Pokey's satchel (Satchel.tsx), where it can be read again at any time.
 *
 * And the finds that tell Pokey's, Dot's and the guardians' side (EXTRA_FINDS, the 2026-10-29 story report, approved):
 *  - DOT'S LOST POCKET, six things that fell out of her pouch in the thorns (4-D), one per world 4-9, in the 6th stage,
 *  - THE NOTCH, the growth-notch twig from the old nest, in 1-4 (not 1-1: a fern there would teach the crouch before 1-5 does),
 *  - THE SNAIL, once in every world, in the 3rd stage (4-9 and 5-9 in Worlds 4 and 5, whose 3rd stages hold their own things).
 */

export type FindKind = 'note' | 'book' | 'keepsake' | 'pocket' | 'notch' | 'snail';
export type PaperKind = 'leaf' | 'journal' | 'letter';
export type KeepsakeIcon = 'key' | 'locket' | 'medal' | 'ribbon' | 'petal' | 'rattle' | 'teddy' | 'seeds' | 'stopwatch' | 'bell' | 'token';

export interface FindPage {
  /** the words on the page (a blank line starts a new paragraph; ~~words~~ are crossed out, written and then thought better of) */
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
  /** what someone says about it, under the words (Dot's run-on for her pocket things) */
  said?: { who: string; text: string };
}

/** the stage of each world (1..9) that hides each kind of find; stage 7 hides the Thorn Gate in World 7 and stage 10 is the boss */
export const FIND_STAGE: Record<FindKind, number> = { note: 2, keepsake: 5, book: 8, pocket: 6, notch: 4, snail: 3 };
/** a world whose stages hide a find somewhere else, by design (World 4: the ribbon is behind the falls in 4-3, Waterfall Steps) */
export const FIND_STAGE_IN: Record<number, Partial<Record<FindKind, number>>> = { 4: { keepsake: 3, snail: 9 }, 5: { snail: 9 } };
/** the stage of world `world` that hides each kind of find */
export const findStage = (world: number, kind: FindKind): number => FIND_STAGE_IN[world]?.[kind] ?? FIND_STAGE[kind];

export const FINDS: FindDef[] = [
  // ───────────── World 1: Emerald Canopy ─────────────
  {
    id: 'w1_note', world: 1, kind: 'note', paper: 'leaf',
    title: 'The first petal',
    hint: 'World 1, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, if you're reading this, you're already further than they think you'll get. They walk too fast to look down. I've been dropping things the whole way and not one of them has noticed. Keep your eyes low.\n\nSorry about the handwriting. I'm writing this walking.\n\nP.S. If you see Dot, tell her I saw her in that bush.\n\nLove, M." }],
  },
  {
    id: 'w1_keepsake', world: 1, kind: 'keepsake', icon: 'key',
    title: 'A small iron key',
    hint: 'World 1, hidden. Crouch beside a fern.',
    pages: [{ text: "A tiny iron key on a green ribbon. The teeth are worn smooth from years of being carried. Somebody kept it close." }],
  },
  {
    id: 'w1_book', world: 1, kind: 'book',
    title: 'The Young Scholar',
    hint: 'World 1, hidden. A photo album in a fern.',
    pages: [
      { photo: 's1_01', caption: 'Top of the class', text: 'He was first in his class and did not seem to know it.' },
      { photo: 's1_02', caption: 'Graduation day', text: 'He held the diploma as if it might fly away.' },
      { photo: 's1_03', caption: 'Three friends, one bench', text: 'Three friends on one bench. Years later, two of them would sit on his council.' },
      { photo: 's1_04', caption: 'The first posting', text: 'A border outpost, a map, and a great deal of patience.' },
    ],
  },
  // ───────────── World 2: Sunlit Riverbank ─────────────
  {
    id: 'w2_note', world: 2, kind: 'note', paper: 'leaf',
    title: 'About the river',
    hint: 'World 2, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, we crossed the river today. The soldiers wouldn't touch the water, so the crocodile carried us over, three at a time. He has a crown now. I made it out of the petals I had left, so there won't be many for a while. You'll find the way.\n\nDon't swim.\n\nP.S. He's nicer than he looks. Don't tell him I said that.\n\nLove, M." }],
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
      { photo: 's1_07', caption: 'Planting the future', text: 'Every year after, he planted one tree where the bank had washed away.' },
      { photo: 's1_08', caption: 'A signature', text: 'Peace is mostly paperwork, he used to say. He was good at both.' },
    ],
  },
  // ───────────── World 3: Mossy Grotto ─────────────
  {
    id: 'w3_note', world: 3, kind: 'note', paper: 'leaf',
    title: 'About the dark',
    hint: 'World 3, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, it's dark in there, and I can't do anything about that. But Grandma told me once that the glowworms only light up for people who stand still and listen. You're the best I know at standing still.\n\nP.S. Ask Dot what I put in her bush.\n\nLove, M." }],
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
      { photo: 's1_14', caption: 'The Original Council', text: 'Ten of them around one table. They argued about everything, for twenty years.' },
      { photo: 's1_13', caption: 'The study', text: 'After every long day he went home and read. The books outnumbered the medals.' },
    ],
  },
  // ───────────── World 4: Mist Cascades ─────────────
  {
    id: 'w4_note', world: 4, kind: 'note', paper: 'journal',
    title: 'Not a door',
    hint: 'World 4, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, the soldiers keep asking me how to make the flower open. I keep telling them it's a plant, not a door.\n\nGrandma said the Heartbloom only opens for people who aren't in a hurry. I always thought she was being poetic. I'm starting to think she was giving instructions.\n\nLove, M." }],
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
    pages: [{ text: "Pokey, Lieutenant Pell brought me a blanket today. He said, \"It is not from the General.\" I hadn't asked. I said thank you. He said, \"Please do not thank me. It is embarrassing.\"\n\nI'm not sure anymore whose side everyone is on. I think half of them are waiting for permission to stop.\n\nLove, M." }],
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
    title: 'The soup, and a letter',
    hint: 'World 6, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, I told Pell the soup was lovely. It was not lovely. Now he brings it every day, and every day I say it's lovely. I don't know how to stop.\n\nLove, M." }, { text: "Dear Grandma,\n\nPokey is coming. I know you'd tell me not to wait for anyone. But he's slow and stubborn, and he has never once turned back. You always liked him. You'd tell him to stop looming in the doorway.\n\nLove, Meeca\n\n(Pokey: if Dot gave you this by mistake, hello. Please skip the part where I said you're slow.)" }],
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
      { photo: 's1_11', caption: 'On patrol', text: 'The armor was heavy. He wore it so the others would not have to.' },
      { photo: 's1_12', caption: 'Festival day', text: 'Confetti, a sash, a wave. He waved back at everyone, including the macaws.' },
      { photo: 's1_15', caption: "Guardian's watch", text: 'Evenings he watched the river road, in case anyone needed him.' },
      { photo: 's1_16', caption: 'A handshake', text: 'A traveler with a heavy pack and a lazy smile. They talked until dawn.' },
    ],
  },
  // ───────────── World 7: Ancient Ruins ─────────────
  {
    id: 'w7_note', world: 7, kind: 'note', paper: 'journal',
    title: 'The plain chair',
    hint: 'World 7, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, ~~I'm fine.~~ I'm tired.\n\nThey let us rest in the old temple tonight. I keep thinking someone I love walked here once. I can't think who.\n\nThe General stood in front of a plain stone chair for an hour. He didn't sit down. The soldiers wouldn't look at him. Not afraid. Sad. I don't understand it yet.\n\nLove, M." }],
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
    pages: [{ text: "Pokey, Pell asked me again if I wanted a pillow. I told him I'm a hostage, not a guest. He said, \"Yes, Miss. Would you like a pillow?\"\n\nEvery night somebody stands outside my door. Eleven steps there, eleven back. He never knocks. I know who it is now. I'm not going to make it easy for him.\n\nLove, M." }],
  },
  {
    id: 'w8_keepsake', world: 8, kind: 'keepsake', icon: 'seeds',
    title: 'A packet of seeds',
    hint: 'World 8, hidden. Crouch beside a fern.',
    pages: [{ text: 'A paper packet of seeds, labeled in a careful hand: "For the hill. Plant when it is quiet." It has never been opened.' }],
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
    title: 'Through the door',
    hint: 'World 9, in plain sight. Look for a pink bell.',
    pages: [{ text: "Pokey, last night the General said something through my door, to the corridor in general: \"Fast people are the ones who arrive in time.\"\n\nI told him my friend is the slowest person I know and has never once failed to arrive. He didn't answer. He didn't leave, either.\n\nP.S. Tell Dot the bars aren't getting any wider.\n\nP.P.S. Somebody's on the stairs. It isn't Pell. I have to" }],
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
    pages: [{ text: "Pokey,\n\nI've started this four times. The first three were too long, and you'd have stopped to read them halfway up a cliff.\n\nCome and get me. Bring snacks.\n\nP.S. Don't hurt him more than you have to. I'll explain when I see you.\n\nP.P.S. You were never too slow. Everybody else was just in a hurry.\n\nLove, M." }],
  },
  {
    id: 'w10_keepsake', world: 10, kind: 'keepsake', icon: 'bell',
    title: 'A small bronze bell',
    hint: 'World 10, hidden. Crouch beside a fern.',
    pages: [{ text: "A small bronze bell, green with age. Meeca's grandma rang it whenever someone she loved was coming home. It hasn't rung since the day she died." }],
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

/** Dot's lost pocket: what fell out of her pouch in the thorns, and what she says when it turns up */
const pocket = (world: number, title: string, card: string, dot: string): FindDef => ({
  id: `w${world}_pocket`, world, kind: 'pocket', title, hint: `World ${world}, hidden. Something of Dot's.`, pages: [{ text: card }], said: { who: 'Dot', text: dot },
});
export const POCKET_FINDS: FindDef[] = [
  pocket(4, 'A button', 'A plain brown button, the thread still in it.',
    "That's mine, that's off my pouch, the thorns took a few things, I'm not going to list them, it's a button, give it here, thank you."),
  pocket(5, 'A bent pin', 'A pin, bent double, the kind that holds an envelope shut.',
    "That's for pinning letters shut, no, not that letter, other letters, normal letters, mail, it's just mail."),
  pocket(6, 'A grey feather', "A grey feather, far too big to be Dot's. It smells of her pouch.",
    "That's not mine, I know it's not mine, it's from a friend, a messenger friend, from a long time ago, a bad night, can we look at the button again."),
  pocket(7, 'A blue ribbon', 'A strip of blue ribbon, the kind you tie on a nest so you can find it in the dark.',
    "I tied one of those on a nest once, on the far branches, so I'd find it fast, and I didn't find it fast."),
  pocket(8, 'A tiny map', "A map the size of a leaf, one tree circled over and over. Pokey's tree.",
    "That's my map, from before you could walk, I circled your tree so I'd never get lost getting to it, and I never did, not once, I came every morning."),
  pocket(9, 'An envelope scrap', 'A torn corner of yellowed envelope, with a faded petal pressed in the seal.',
    "Don't, don't open the pouch, that's off the letter, the corner tore, the letter's fine, the letter's still in here, I'm giving it to him, I am, at the top."),
];
/** the twig from the old nest: his parents' notches, and Grandma's */
export const NOTCH_FIND: FindDef = {
  id: 'w1_notch', world: 1, kind: 'notch', title: 'The Notch', hint: 'World 1, hidden. Crouch beside a fern.',
  pages: [{ text: 'A twig from the old nest, notched up its length, one notch a year. The low notches are cut deep and neat. The higher ones are in a different hand, and each has a tiny fern drawn beside it.' }],
};
/** the snail from the prologue, on the same trip, once in every world, a little further along each time (a tap, a tiny sound, nothing else) */
export const SNAIL_FINDS: FindDef[] = Array.from({ length: 10 }, (_, i) => ({
  id: `w${i + 1}_snail`, world: i + 1, kind: 'snail' as const, title: 'The snail', hint: `World ${i + 1}. He's out there somewhere.`,
  pages: [{ text: 'The snail from the garden path, a little further along. He does not stop.' }],
}));
/** the snail is only hidden in the stages once his painted sprite is in (story-art): never a code-drawn stand-in */
export const SNAIL_PAINTED = true;
/** the finds beyond the thirty notes, albums and keepsakes (they do not count toward "every find" or the secret token) */
export const EXTRA_FINDS: FindDef[] = [...POCKET_FINDS, NOTCH_FIND, ...(SNAIL_PAINTED ? SNAIL_FINDS : [])];
export const ALL_FINDS: FindDef[] = [...FINDS, ...EXTRA_FINDS];

/**
 * Pokey's note pushed up through the floor of the Under the Ruins level (SECRET-LEVELS.md): written, waiting for that level to give it.
 * Matt and the lead's pick (2026-10-29): it crosses out "I'm fine" the way her World 7 note does (the same ~~strike~~ in the reader).
 */
export const RUINS_NOTE = { id: 'w7_ruins', text: "Meeca. ~~I'm fine.~~ I'm tired too. Coming anyway. Save my chair. P." };

export const FIND_BY_ID: Record<string, FindDef> = Object.fromEntries(ALL_FINDS.map((f) => [f.id, f]));

/** the reward for finding all of them: it is never hidden in a stage, it opens in the Library when every other find is there */
export const BONUS_FIND: FindDef = {
  id: 'bonus_token', world: 0, kind: 'keepsake', icon: 'token',
  title: 'A secret token',
  hint: 'Find every note, album and keepsake to open it.',
  pages: [{ text: 'A small leather pouch tied with cord. Inside: one Heartbloom seed, and a folded note in the same hand as the petal.\n\n"To whoever was patient enough to find this. Plant the seed by his window. He won\'t stop for a flower. He\'ll stop for a weed he can\'t name. Be slow with him."' }],
};
FIND_BY_ID[BONUS_FIND.id] = BONUS_FIND;

const REAL_IDS = new Set(ALL_FINDS.map((f) => f.id));

/** true once every note, album and keepsake in the stages has been found (the extra finds are their own sets: allOf) */
export function allFound(found: string[]): boolean {
  return FINDS.every((f) => found.includes(f.id));
}

/** true once every find of a set has been found (Dot's pocket, the snails) */
export const allOf = (set: FindDef[], found: string[]) => set.length > 0 && set.every((f) => found.includes(f.id));

/** the find that hides in this stage, if there is one */
export function findForStage(world: number, mini: number): FindDef | null {
  for (const kind of Object.keys(FIND_STAGE) as FindKind[]) {
    if (findStage(world, kind) === mini) return FIND_BY_ID[`w${world}_${kind}`] ?? null;
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

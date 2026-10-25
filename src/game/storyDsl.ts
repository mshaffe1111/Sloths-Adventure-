/**
 * The script language. A cutscene picture is a record of actors, camera and effects, and the story is hundreds of them, so a line of
 * story is written as a Beat and compiled into a StoryPanel:
 *
 *     P('Eleven minutes. A personal best.', 'PF:surprised+happy@.34')
 *     M('Both. Mostly the second.', 'P:idle@.3 M:laugh@.7')
 *
 * A beat is who speaks, what they say, who is on screen (the "cast" string) and, when the picture needs more, a few overrides. Inside a
 * chapter the world, mood, music cue and intensity carry forward from beat to beat until a beat changes them, so a scene is written once
 * and only the changes are marked. Pure data, no drawing: the compiled panels go to StoryPlayer exactly as hand-written ones do.
 *
 * CAST STRING: actors separated by spaces, each  KIND[digits][:mood][@x][^y][*scale][<][>][~][!][#]
 *   P  Pokey (kind 'milo').  :mood is his mood (idle, talk, walk, run, sneak, urgent, sad, tired, determined, happy, cheer, surprised,
 *      worried, think, sleep, hurt, ko; or the old poses punch, duck)
 *   PF Pokey's face, big, chin on the ground line.  :a+b+c plays the faces face_a, face_b, face_c, one every 1.8 seconds
 *   M  Meeca (kind 'daisy').  :mood is her mood (idle, talk, happy, laugh, sing, think, surprised, sad, sob, scared, scaredwave, cheer,
 *      walk, run, hurt, ko)
 *   G  General Iron-Claw (the world-10 painted boss).   B<n>  the guardian of world n (B3 = Shadow Prowler)
 *   D  Dot the hummingbird, :pose is what she does (hover, perch, yelp, flinch, dizzy, cheer, puzzled, sad, gasp, sleep).   T  Thornbark.   H  the Heartbloom, :bud|bloom|epic|ultimate
 *   The story sheets (storyCels.ts has every pose; a bad pose name throws, so the tests catch it):
 *   GR Grandma   LP Lieutenant Pell   TC the town crier   PO the mail carrier   GN the General in his war look (GN:ready, GN:soften, GN:morph into GV)   GV the General as himself, a plain sloth   GY the grandfather, young (the same plain sloth)   GC the grandfather leading the cub Meeca by the hand (one picture, two figures)   GB/GP busts of the war look and the plain face
 *   MS Meeca's story poses (pink #07: faces, emotion, music box, the tower)   MF Meeca's face bust, :a+b+c changes expression   PN Pokey (satchel)   PV the cub (pink bow, satchel strap)   PX Pokey bandaged   PA PB Pokey and Meeca together   PH Pokey and Meeca hugging   e.g.  GR:water@.4  PH:hug_a@.5
 *   @x across the picture 0..1, ^y feet down the picture, *scale, < faces left, > faces right, ~ a dark silhouette, ! angry (boss), # beaten (boss)
 * An unset x, y and facing take the kind's usual place (Pokey on the left looking right, everyone else on the right looking left).
 * A cast of "=" means the same picture as the beat before.
 */
import { DOT_POSES, isDotPose, type DotPose } from './dotSprite.ts';
import { CEL_CAST, celPoses, celTrack, isCelCode } from './storyCels.ts';
import type { SceneActor, SceneMood, ScenePhoto, StoryCue, StoryPanel, StoryScene, StorySting } from './story.ts';
import { PLATES, isPlate } from './plateData.ts';

export interface Beat {
  /** who speaks ('Narrator' for the storyteller) */
  s: string;
  /** what they say */
  t: string;
  /** who is on screen (see the cast string above); '=' keeps the last picture's cast */
  c?: string;
  /** more for the picture: camera, effects, particles, zoom (overrides the automatic framing) */
  p?: Partial<StoryScene>;
  /** per cast member (by position in the cast string), extra actor fields, e.g. a painted-pose timeline */
  x?: Record<number, Partial<SceneActor>>;
  /** from this beat on: the backdrop world, the mood of the light, the music cue and how full it is */
  w?: number;
  m?: SceneMood;
  cue?: StoryCue;
  i?: number;
  /** a one-off sound as the picture appears */
  sting?: StorySting;
  /** a gameplay tip under the text */
  tip?: string;
  /** a photograph held up over the picture: key, caption, size (share of the width), lean */
  ph?: [key: string, caption?: string, size?: number, tilt?: number];
}

export interface ChapterSpec {
  /** the chapter title: "WORLD 3 · MOSSY GROTTO" splits into the small line and the big line of the title card */
  name: string;
  w: number;
  m?: SceneMood;
  cue?: StoryCue;
  i?: number;
  /** defaults for every picture of the chapter (particles, memory wash, castle...) */
  base?: Partial<StoryScene>;
}

/** a beat spoken by `s`:  const P = say('Pokey');  P('Hello.', 'P:happy') */
export const say =
  (s: string) =>
  (t: string, c?: string, o: Partial<Omit<Beat, 's' | 't' | 'c'>> = {}): Beat => ({ s, t, c, ...o });

export const N = say('Narrator');
export const P = say('Pokey');
export const M = say('Meeca');
export const D = say('Dot');
export const GM = say('Grandma');
export const GEN = say('General Iron-Claw');
/** the General once the war look has let go: his badge is the plain face, and Meeca's word for him */
export const GF = say('Grandfather');
export const OFF = say('Lieutenant Pell');

/** a slow camera move: from (zoom, focus x, focus y) to (zoom, x, y) over `dur` seconds */
export function pan(z0: number, x0: number, y0: number, z1: number, x1: number, y1: number, dur: number) {
  return { camera: { from: { zoom: z0, fx: x0, fy: y0 }, to: { zoom: z1, fx: x1, fy: y1 }, dur } } as Partial<StoryScene>;
}

// ───────────── the cast string ─────────────

const GUARDIAN_WORLD: Record<string, number> = {
  'Venom Fang': 1, 'Crocus Rex': 2, 'Shadow Prowler': 3, 'Sky Sovereign': 4, 'Tarantula Queen': 5,
  'Marsh Reaver': 6, 'Stone Idol Golem': 7, 'Night-Wing Monarch': 8, 'Magma Drake': 9, 'General Iron-Claw': 10,
};
const LEGACY_POSES = new Set(['idle', 'punch', 'duck', 'happy']);
const BLOOM_STAGES = new Set(['bud', 'bloom', 'epic', 'ultimate']);
/** how long each face of a "PF:a+b+c" cast stays up */
const FACE_SECONDS = 1.8;

interface Mods { mood?: string; x?: number; y?: number; scale?: number; face?: 1 | -1; sil?: boolean; angry?: boolean; beaten?: boolean }

function mods(rest: string, tok: string): Mods {
  const out: Mods = {};
  const re = /([:@^*])([A-Za-z0-9_.+-]+)|([<>~!#])/g;
  let used = 0;
  for (let m = re.exec(rest); m; m = re.exec(rest)) {
    used += m[0].length;
    if (m[3]) {
      if (m[3] === '<') out.face = -1;
      else if (m[3] === '>') out.face = 1;
      else if (m[3] === '~') out.sil = true;
      else if (m[3] === '!') out.angry = true;
      else out.beaten = true;
      continue;
    }
    const v = m[2];
    if (m[1] === ':') out.mood = v;
    else {
      const n = Number(v);
      if (!Number.isFinite(n)) throw new Error(`cast "${tok}": "${v}" is not a number`);
      if (m[1] === '@') out.x = n;
      else if (m[1] === '^') out.y = n;
      else out.scale = n;
    }
  }
  if (used !== rest.length) throw new Error(`cast "${tok}": cannot read "${rest}"`);
  return out;
}

function actor(tok: string): SceneActor {
  const k = /^([A-Z]+)(\d*)(.*)$/.exec(tok);
  if (!k) throw new Error(`cast "${tok}": cannot read`);
  const kind = k[1];
  const num = k[2];
  const m = mods(k[3], tok);
  const base = { x: m.x ?? 0.5 } as SceneActor;
  const scale = m.scale ?? 1.0;
  switch (kind) {
    case 'P': {
      const mood = m.mood ?? 'idle';
      const a: SceneActor = { kind: 'milo', x: m.x ?? 0.3, scale, facing: m.face ?? 1, mood: mood as never };
      if (LEGACY_POSES.has(mood)) a.pose = mood as SceneActor['pose'];
      if (m.y !== undefined) a.y = m.y;
      return a;
    }
    case 'PF': {
      const faces = (m.mood ?? 'calm').split('+');
      const a: SceneActor = {
        kind: 'milo', x: m.x ?? 0.34, y: m.y ?? 1.04, scale: m.scale ?? 1.25, portrait: true,
        seq: faces.map((f, i) => ({ at: i * FACE_SECONDS, frame: `face_${f}` })),
      };
      if (m.face) a.facing = m.face;
      return a;
    }
    case 'M':
    case 'MW': {
      const a: SceneActor = {
        kind: kind === 'MW' ? 'daisy_wave' : 'daisy', x: m.x ?? (kind === 'MW' ? 0.66 : 0.68), scale, facing: m.face ?? -1,
        mood: (m.mood ?? (kind === 'MW' ? 'scaredwave' : 'idle')) as never,
      };
      if (m.y !== undefined) a.y = m.y;
      else if (kind === 'MW') a.y = 0.6;
      return a;
    }
    case 'G':
    case 'B':
    case 'T': {
      const world = kind === 'G' ? 10 : kind === 'B' ? Number(num) : 0;
      if (kind === 'B' && !(world >= 1 && world <= 10)) throw new Error(`cast "${tok}": B needs a world 1..10`);
      const a: SceneActor = kind === 'T'
        ? { kind: 'thornbark', x: m.x ?? 0.72, scale, facing: m.face ?? -1 }
        : { kind: 'boss', world, x: m.x ?? 0.72, scale, facing: m.face ?? -1 };
      if (m.y !== undefined) a.y = m.y;
      if (m.sil) a.silhouette = true;
      if (m.angry) a.angry = true;
      if (m.beaten) a.beaten = true;
      return a;
    }
    case 'D': {
      if (m.mood !== undefined && !isDotPose(m.mood)) throw new Error(`cast "${tok}": ${m.mood} is not a Dot pose (${DOT_POSES.join(', ')})`);
      const a: SceneActor = { kind: 'dot', x: m.x ?? 0.62, y: m.y ?? 0.46, scale, facing: m.face ?? -1 };
      if (m.mood && m.mood !== 'hover') a.dotPose = m.mood as DotPose;
      return a;
    }
    case 'H': {
      const stage = m.mood ?? 'bloom';
      if (!BLOOM_STAGES.has(stage)) throw new Error(`cast "${tok}": ${stage} is not a Heartbloom stage`);
      return { ...base, kind: 'bloom', x: m.x ?? 0.5, y: m.y ?? 0.8, scale, stage: stage as never };
    }
    default: {
      if (!isCelCode(kind)) throw new Error(`cast "${tok}": unknown actor "${kind}"`);
      const c = CEL_CAST[kind];
      let seq;
      try {
        seq = celTrack(kind, m.mood);
      } catch (e) {
        throw new Error(`cast "${tok}": ${(e as Error).message}`);
      }
      const a: SceneActor = { kind: 'cel', cel: kind, x: m.x ?? c.x, scale: m.scale ?? c.scale ?? 1, facing: m.face ?? c.face, seq };
      if (m.y !== undefined) a.y = m.y;
      else if (c.y !== undefined) a.y = c.y;
      if (c.bust) a.portrait = true;
      return a;
    }
  }
}

/** the actors a cast string names */
export function cast(spec: string | undefined): SceneActor[] {
  if (!spec) return [];
  return spec.trim().split(/\s+/).filter(Boolean).map(actor);
}

/** does this actor speak this beat's line (used to aim the camera) */
function speaks(a: SceneActor, speaker: string): boolean {
  if (a.kind === 'cel') return !!a.cel && CEL_CAST[a.cel].who.includes(speaker);
  switch (speaker) {
    case 'Pokey': return a.kind === 'milo';
    case 'Meeca': return a.kind === 'daisy' || a.kind === 'daisy_wave';
    case 'Dot': return a.kind === 'dot';
    case 'Thornbark': return a.kind === 'thornbark';
    default: {
      const w = GUARDIAN_WORLD[speaker];
      return w !== undefined && a.kind === 'boss' && a.world === w;
    }
  }
}

// ───────────── compiling a chapter ─────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** compile beats into panels; the world, mood, cue and intensity (and the cast, for '=') carry forward from beat to beat */
export function chapter(spec: ChapterSpec, beats: Beat[]): StoryPanel[] {
  let world = spec.w;
  let mood: SceneMood = spec.m ?? 'day';
  let cue = spec.cue;
  let intensity = spec.i;
  let lastCast: SceneActor[] = [];
  return beats.map((b, n) => {
    if (b.w !== undefined) world = b.w;
    if (b.m !== undefined) mood = b.m;
    if (b.cue !== undefined) cue = b.cue;
    if (b.i !== undefined) intensity = b.i;
    let actors: SceneActor[];
    try {
      actors = b.c === '=' ? lastCast.map((a) => ({ ...a })) : cast(b.c);
    } catch (e) {
      throw new Error(`${spec.name} beat ${n + 1} ("${b.t.slice(0, 40)}"): ${(e as Error).message}`);
    }
    if (b.x) for (const [i, extra] of Object.entries(b.x)) if (actors[Number(i)]) Object.assign(actors[Number(i)], extra);
    lastCast = actors;
    // framing: close on whoever is talking, wider when many are in the picture
    const talker = actors.find((a) => speaks(a, b.s));
    const framed: Partial<StoryScene> = {};
    if (actors.some((a) => a.portrait)) {
      framed.zoom = 1.2;
    } else if (actors.length) {
      const many = actors.filter((a) => a.kind !== 'bloom' && a.kind !== 'dot').length >= 3;
      framed.zoom = talker ? (many ? 1.35 : 1.5) : many ? 1.15 : 1.3;
      framed.focusX = talker ? clamp(talker.x, 0.28, 0.72) : clamp(actors.reduce((s, a) => s + a.x, 0) / actors.length, 0.3, 0.7);
      framed.focusY = 0.58;
    }
    const scene: StoryScene = {
      world, mood, particles: 'sparkles', zoom: 1.25, focusX: 0.5,
      ...spec.base, ...framed, ...b.p, actors,
    } as StoryScene;
    // a plate brings its own floor: the actors stand on it unless the beat says otherwise
    if (scene.plate !== undefined) {
      if (!isPlate(scene.plate)) throw new Error(`${spec.name} beat ${n + 1}: unknown plate "${scene.plate}"`);
      if (scene.ground === undefined) scene.ground = PLATES[scene.plate].ground;
    }
    if (b.ph) scene.photo = { key: b.ph[0], caption: b.ph[1], size: b.ph[2] ?? 0.5, tilt: b.ph[3] } as ScenePhoto;
    const panel: StoryPanel = { chapter: spec.name, speaker: b.s, text: b.t, scene };
    if (b.tip) panel.tip = b.tip;
    if (cue) panel.cue = cue;
    if (intensity !== undefined) panel.intensity = intensity;
    if (b.sting) panel.sting = b.sting;
    return panel;
  });
}

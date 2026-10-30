/**
 * gen2/toyClimb — a tiny test world for the upward flow (ascent.ts): a few climbing sections (shelves to hop up, a stump shelf with a
 * spider, a liana up to a perch, a wide rest ledge) and two turns (a vine up to a shelf running back, a stack of hops). Used by
 * ascent.test.ts, and by a world's helper who needs a climb to build from before its own climbing sections exist. Nothing here is played.
 */
import type { SectionTemplate, WorldKit, WorldManifest } from './types.ts';
import { manifest as toy } from './toyWorld.ts';

const ALL = ['start', 'ki', 'sho', 'ten', 'ketsu', 'rest', 'goal'] as SectionTemplate['phases'];

export const shelves: SectionTemplate = {
  id: 'toyc-shelves',
  name: 'shelves to hop up',
  archetypes: ['ascent'],
  phases: ['start', 'ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3,
  flow: 'up',
  pieces: [
    { key: 'a', shape: 'branch', w: [260, 320], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [220, 280], place: { kind: 'jump', after: 'a', dy: [-80, -50], share: [0.5, 0.8] }, landing: true },
    { key: 'c', shape: 'branch', w: [240, 320], place: { kind: 'jump', after: 'b', dy: [-80, -50], share: [0.5, 0.8] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: -130,
  sockets: [
    { id: 'pb', role: 'pickup', on: 'b', t: 0.5, dn: 34 },
    { id: 'pc', role: 'pickup', on: 'c', t: 0.5, dn: 34, count: 2, span: 100 },
  ],
  mirrorable: true,
};

export const spiderShelf: SectionTemplate = {
  id: 'toyc-spider',
  name: 'a long shelf with a spider and a stump',
  archetypes: ['ascent'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  flow: 'up',
  pieces: [
    { key: 'a', shape: 'branch', w: [200, 240], place: { kind: 'start' } },
    { key: 'b', shape: 'bank', w: [560, 640], place: { kind: 'jump', after: 'a', dy: [-70, -40], share: [0.5, 0.75] }, landing: true },
    { key: 's', shape: 'block', w: [90, 110], place: { kind: 'on', on: 'b', at: [0.75, 0.85], h: [50, 65] } },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: -55,
  sockets: [{ id: 'foe', role: 'enemy', on: 'b', t: [0.3, 0.45], maxThreat: 3, easy: 'soften' }],
  mirrorable: true,
};

export const lianaUp: SectionTemplate = {
  id: 'toyc-liana',
  name: 'a liana up to a perch',
  archetypes: ['ascent'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  flow: 'up',
  pieces: [
    { key: 'a', shape: 'branch', w: [280, 320], place: { kind: 'start' } },
    { key: 'l', shape: 'liana', w: 0, place: { kind: 'swing', after: 'a' } },
    { key: 'b', shape: 'branch', w: [240, 280], place: { kind: 'land', after: 'l', dy: -80, share: [0.3, 0.6] } },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'b', kind: 'ledge' },
  exitDy: -80,
  sockets: [],
  mirrorable: false,
};

export const restLedge: SectionTemplate = {
  id: 'toyc-rest',
  name: 'a wide rest ledge',
  archetypes: ['ascent'],
  phases: ['start', 'rest', 'goal', 'ki'],
  difficulty: 1,
  flow: 'up',
  pieces: [{ key: 'a', shape: 'bank', w: [480, 600], place: { kind: 'start' } }],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'a', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'flag', role: 'flag', on: 'a', t: 0.7 },
    { id: 'petals', role: 'pickup', on: 'a', t: [0.3, 0.5], dn: 34, count: 3, span: 200 },
  ],
  mirrorable: true,
};

/** a vine up the row's end to a shelf running back over it */
export const vineTurn: SectionTemplate = {
  id: 'toyc-vine-turn',
  name: 'up a vine, back the other way',
  archetypes: ['ascent'],
  phases: ALL,
  difficulty: 2,
  flow: 'up',
  turn: true,
  pieces: [
    { key: 'a', shape: 'branch', w: [280, 340], place: { kind: 'start' } },
    { key: 'v', shape: 'vine', w: 0, place: { kind: 'climb', on: 'a', at: 0.85, h: [300, 340] } },
    { key: 'b', shape: 'branch', w: [300, 380], place: { kind: 'over', on: 'v', at: 0, dy: 0, align: 'end' } },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'b', kind: 'ledge' },
  exitDy: -320,
  sockets: [{ id: 'p', role: 'pickup', on: 'b', t: 0.5, dn: 34 }],
  mirrorable: false,
};

export const toyClimbManifest: WorldManifest = {
  ...toy,
  name: 'Toy climb',
  moves: ['double', 'punch', 'climb', 'swing'],
  sections: [shelves, spiderShelf, lianaUp, restLedge, vineTurn],
  handBuilt: [],
  lessons: { spider: '5-1' },
};

export const toyClimbKit: WorldKit = { manifest: toyClimbManifest };

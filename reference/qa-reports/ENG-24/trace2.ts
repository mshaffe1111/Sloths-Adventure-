import { fixtureSeed, lianaRun } from '../../../tools/inspect/lianaRiverToys.ts';
const seed = fixtureSeed('catch', 'twin', ['normal', 'easy'], 'long');
console.log('seed', seed);
const r = lianaRun('catch', 'twin', 'middle', 'normal', seed!, Number(process.env.VAR ?? 1), 'long', { realInput: true });
console.log(JSON.stringify(r.pieces.find((q) => q.id === 'toy-liana-catch')), r.ontoLog, r.fromLog, r.handed);

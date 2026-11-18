import { lianaBand, lianaRelease, VINE } from '../../../src/game/gen2/pipeline.ts';
const from = { x: -480, y: 400, w: 300 }; const L = { x: 0, topY: 0, bottomY: 420 };
const sw = (grip?: 'low' | 'high') => ({ amp: VINE.amp, period: VINE.period.normal, ...(grip ? { grip } : {}) });
const row: string[] = [];
for (let x = 200; x <= 560; x += 40) row.push(`${x}:${Math.round(1000 * lianaRelease(L, sw(), { x, y: 400, w: 300 }, 'normal'))}/${Math.round(1000 * lianaRelease(L, sw('high'), { x, y: 400, w: 300 }, 'normal'))}/${Math.round(1000 * lianaRelease(L, sw('low'), { x, y: 400, w: 300 }, 'normal'))}`);
console.log('def/high/low', row.join(' '));
for (const need of [0.167, 0.6, 1.0]) console.log(need, 'plain', lianaBand(from, L, sw(), 0, 300, need, -Infinity, 'normal', true), 'high', lianaBand(from, L, sw('high'), 0, 300, need, -Infinity, 'normal', true), 'low', lianaBand(from, L, sw('low'), 0, 300, need, -Infinity, 'normal', true));

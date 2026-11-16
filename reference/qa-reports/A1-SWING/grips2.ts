import { lianaRelease, VINE } from '../../../src/game/gen2/pipeline.ts';
for (const d of ['normal', 'easy'] as const) { const out: string[] = []; for (let near = 460; near <= 580; near += 10) {
  const sw = { amp: VINE.amp, period: VINE.period[d] };
  const r = (grip?: 'low' | 'high') => Math.round(1000 * lianaRelease({ x: 0, topY: 0, bottomY: 420 }, { ...sw, ...(grip ? { grip } : {}) }, { x: near, y: 400, w: 300 }, d));
  out.push(`${near}: ${r()}/${r('low')}/${r('high')}`);
} console.log(d, 'default/low/high ms\n ', out.join('\n  ')); }

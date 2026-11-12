// World 4's falling rocks of a stage on a layout, and when the shatter burst would read cycle -1 (w4Grit.ts sinceWarn idle branch)
const rp = await import(`${process.argv[2]}/src/game/realPlay.ts`);
const rf = await import(`${process.argv[2]}/src/game/rockfall.ts`);
const id = process.argv[3] ?? '4-1';
for (const seed of [0, 1, 2, 3, 4, 5]) {
  const r = new rp.RealPlay(id, seed);
  const w = r.e.w4;
  const rocks = w?.w4?.rocks ?? w?.extras?.rocks ?? w?.rocks ?? [];
  const bad: string[] = [];
  for (const q of rocks) {
    const fallT = Math.max(0.01, (q.land - q.top) / rf.ROCK.speed);
    const idleT = q.every - q.warn - fallT - rf.ROCK.shatter;
    for (let t = 0; t < 120; t += 1 / 30) {
      const s = rf.rockAt(q, t);
      let cycle = Math.floor((t + q.offset) / q.every);
      let e: number;
      if (s.phase === 'warn') e = s.u * q.warn; else if (s.phase === 'fall') e = q.warn + s.u * fallT; else if (s.phase === 'shatter') e = q.warn + fallT + s.u * rf.ROCK.shatter; else { e = q.warn + fallT + rf.ROCK.shatter + s.u * idleT; cycle -= 1; }
      const a = e - q.warn - fallT;
      if (a >= 0 && a < rf.ROCK.shatter + 0.25 && cycle < 0) { bad.push(`x${Math.round(q.x)} t=${t.toFixed(2)} cycle=${cycle}`); break; }
    }
  }
  console.log(`${id} layout ${seed}: keys ${w ? Object.keys(w).filter((k) => /rock|w4|extra/i.test(k)).join(',') : 'no w4'}; rocks ${rocks.length}; burst reads cycle<0 (W4_PEBBLES[negative] -> undefined): ${bad.length} ${bad.slice(0, 4).join(' | ')}`);
}

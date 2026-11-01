// A sample save for the satchel shots (tools/art/shot-satchel.mjs): Worlds 1-3 cleared and 4 started, play records with a mix of runs,
// a few finds, medals and flashbacks. Run in the page before load (localStorage only).
(() => {
  const L = localStorage;
  L.clear();
  const kinds = ['snake', 'boa', 'turtle', 'ocelot', 'jaguar'];
  let n = 0;
  for (let w = 1; w <= 4; w++)
    for (let m = 1; m <= 10; m++) {
      if (w === 4 && m > 3) break;
      const id = `${w}-${m}`;
      n++;
      const stars = 1 + ((w * 7 + m * 3) % 3);
      L.setItem(`sloth_lvl_${id}`, JSON.stringify({ completed: true, stars, highScore: 3000 + n * 50, bestTime: 120 + ((n * 37) % 200) }));
      const ll = (n * 5) % 7 === 0 ? 4 : (n * 3) % 5 === 0 ? 0 : (n % 3);
      const ft = 30 + (n % 12);
      const fl = (n % 4 === 0) ? ft : Math.round(ft * (0.45 + ((n * 13) % 50) / 100));
      const t = 80 + ((n * 41) % 230);
      const first = { t, ll, hl: ll === 0 && n % 2 ? 0 : ll + 1, fl, ft, st: stars, k: 2 + (n % 6), kt: kinds[(w + m) % (w === 1 ? 2 : kinds.length)], ch: n % 4, fr: m === 6 ? 2 : 0, sw: n % 9, fd: m === 2 ? [`w${w}_note`] : m === 5 ? [`w${w}_keepsake`] : [], md: m === 3 ? ['first_steps'] : [], d: 1793000000000 + n * 3600000 };
      L.setItem(`sloth_play_${id}`, JSON.stringify({ v: 1, n: 1 + (n % 3), w: 1 + (n % 2), bt: t - 10, bs: stars, first }));
      L.setItem(`sloth_story_w${w}`, '1');
    }
  L.setItem('sloth_finds', JSON.stringify({ v: 1, found: ['w1_note', 'w1_keepsake', 'w2_note', 'w2_keepsake', 'w3_note', 'w1_book'] }));
  L.setItem('sloth_memories', JSON.stringify({ v: 1, seen: ['waiting', 'horn', 'map'] }));
  L.setItem('sloth_badges', JSON.stringify({ v: 1, earned: {}, kills: { snake: 14, boa: 3, turtle: 9, ocelot: 6, jaguar: 2 }, seen: ['snake', 'boa', 'eagle', 'turtle', 'ocelot', 'jaguar'], counters: {}, quiet: [] }));
  L.setItem('sloth_howto_seen', '1');
  L.setItem('sloth_coach_done', '1');
})();

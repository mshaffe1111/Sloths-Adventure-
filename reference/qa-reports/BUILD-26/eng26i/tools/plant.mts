const T = await import('/home/user/wt-26i/src/game/gen2/tower.ts');
const solid = (x: number, y: number, width: number, id = 1) => ({ id, x, y, width, height: 24, type: 'solid' }) as any;
const floor = solid(0, 3000, 1280, 1), gate = solid(646, 1000, 440, 2), under = solid(566, 1400, 600, 3), low = solid(700, 1681, 580, 4);
const hang = { id: 1, x: 1166, topY: 1400, bottomY: 1681, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as any;
const cs = T.towerCatches('up', [floor, gate, under, low], [hang], 3000, 1280, [], (p: any) => (p.id === 1 ? 0 : 1), (p: any) => p.id === 2);
console.log(JSON.stringify(cs));

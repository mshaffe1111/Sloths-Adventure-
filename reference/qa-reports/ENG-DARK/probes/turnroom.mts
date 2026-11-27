// the turn-room plant on one roll (ENG-DARK-k): GEN2_DRAFT=3-1 npx tsx <this> <middle|child|adult|expert|kid> <normal|easy> <seed> [plant]:
// the run with noTurnRoom (plant 1) or without (0): shrine, rescues, the dark's crossings
import path from 'node:path';
const root = process.cwd();
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [bot, setting, seed, plant] = process.argv.slice(2);
const who = { MIDDLE: ft.FT_MIDDLE, CHILD: ft.FT_CHILD, ADULT: ft.FT_ADULT, EXPERT: ft.FT_EXPERT, KID: ft.FT_KID }[bot.toUpperCase()];
const r = ft.firstTimer('3-1', Number(seed), { ...who, setting, noTurnRoom: plant === '1' }, { cap: 600 });
console.log(bot, setting, seed, 'plant', plant, 'end', r.end ?? r.outcome, 'rescues', r.rescues?.length ?? r.rescues, JSON.stringify(r.dark));

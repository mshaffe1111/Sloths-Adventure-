// the phone's own sound settings survive a Load of a save that carries other values (EN-F saves#8), and a 0.9.6 file's g10 flag moves to t10
import { readFileSync } from 'node:fs';
const sf = await import('../../../../src/game/saveFile.ts');
const fill = await import('../../../../src/game/saveFill.ts');
const text = readFileSync(new URL('./saves/096/finished.save.json', import.meta.url), 'utf8');
const o = JSON.parse(text);
console.log('file carries', ['sloth_music_vol', 'sloth_sfx_vol', 'sloth_game_muted', 'sloth_story_g10'].map((k) => `${k}=${o.data[k]}`).join(' '));
const phone = fill.memStorage();
phone.setItem('sloth_music_vol', '0.3'); phone.setItem('sloth_sfx_vol', '0.25'); phone.setItem('sloth_game_muted', '1');
const r = sf.parseSave(text);
if (!r.ok) throw new Error(r.reason);
sf.applySave(phone, r.save);
console.log('phone after Load', ['sloth_music_vol', 'sloth_sfx_vol', 'sloth_game_muted', 'sloth_story_g10', 'sloth_story_t10'].map((k) => `${k}=${phone.getItem(k)}`).join(' '));
console.log('isSaveKey vol', sf.isSaveKey('sloth_music_vol'), 'isAdventureKey vol', sf.isAdventureKey('sloth_music_vol'));

import '../../../src/game/headlessDom.ts';
import { freezeWindow, isPredatorRead } from '../../../tools/difficulty/score.ts';
import { BOA } from '../../../src/game/predators/world1.ts';
console.log('isRead', isPredatorRead(BOA), 'normal', freezeWindow(BOA, 'normal'), 'easy', freezeWindow(BOA, 'easy'));

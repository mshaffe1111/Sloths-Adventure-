import type { WorldInfo, LevelConfig, ObjectiveType } from './types.ts';
import { testUnlockOn } from './testUnlock.ts';

export const WORLDS_DATA: WorldInfo[] = [
  {
    id: 1,
    name: 'Emerald Canopy',
    subtitle: 'The sun-dappled upper treetops where the adventure begins',
    theme: 'emerald_canopy',
    bossName: 'Venom Fang',
    bossTitle: 'Emerald Boa Monarch',
    bossQuote: 'Sssilly sloth... your journey endsss before the sun setsss!',
    ambientType: 'gentle_breeze',
    palette: {
      skyTop: '#38bdf8',
      skyBottom: '#bbf7d0',
      sunbeamColor: 'rgba(254, 240, 138, 0.22)',
      distantMountain: '#166534',
      canopyFar: '#15803d',
      canopyMid: '#22c55e',
      trunkColor: '#78350f',
      foliageColor: '#16a34a',
      foliageHighlight: '#86efac',
      flowerColor: '#f43f5e',
      fogColor: 'rgba(220, 252, 231, 0.25)',
      waterColor: '#38bdf8',
    },
  },
  {
    id: 2,
    name: 'Sunlit Riverbank',
    subtitle: 'Shimmering turquoise streams and slippery river boulders',
    theme: 'sunlit_river',
    bossName: 'Crocus Rex',
    bossTitle: 'River Terror',
    bossQuote: 'These waters belong to me! Prepare to be dragged under!',
    ambientType: 'river_flow',
    palette: {
      skyTop: '#0ea5e9',
      skyBottom: '#bae6fd',
      sunbeamColor: 'rgba(253, 224, 71, 0.28)',
      distantMountain: '#0f766e',
      canopyFar: '#115e59',
      canopyMid: '#14b8a6',
      trunkColor: '#854d0e',
      foliageColor: '#10b981',
      foliageHighlight: '#a7f3d0',
      flowerColor: '#fb923c',
      fogColor: 'rgba(204, 251, 241, 0.2)',
      waterColor: '#06b6d4',
    },
  },
  {
    id: 3,
    name: 'Mossy Grotto',
    subtitle: 'A cavernous emerald forest above a limestone sinkhole, lit by glowworm threads',
    theme: 'mossy_grotto',
    bossName: 'Shadow Prowler',
    bossTitle: 'The Night Jaguar',
    bossQuote: 'You cannot punch what you cannot catch, little sloth!',
    ambientType: 'deep_cave',
    palette: {
      skyTop: '#064e3b',
      skyBottom: '#047857',
      sunbeamColor: 'rgba(110, 231, 183, 0.18)',
      distantMountain: '#022c22',
      canopyFar: '#065f46',
      canopyMid: '#059669',
      trunkColor: '#582f0e',
      foliageColor: '#047857',
      foliageHighlight: '#6ee7b7',
      flowerColor: '#ec4899',
      fogColor: 'rgba(167, 243, 208, 0.15)',
      waterColor: '#10b981',
    },
  },
  {
    id: 4,
    name: 'Mist Cascades',
    subtitle: 'Roaring waterfalls and high-altitude moisture bridges',
    theme: 'mist_cascades',
    bossName: 'Sky Sovereign',
    bossTitle: 'Harpy Eagle Matriarch',
    bossQuote: 'My skies, my prey! Dive-bombing your hopes into feathers!',
    ambientType: 'waterfall',
    palette: {
      skyTop: '#0284c7',
      skyBottom: '#e0f2fe',
      sunbeamColor: 'rgba(224, 242, 254, 0.35)',
      distantMountain: '#075985',
      canopyFar: '#0369a1',
      canopyMid: '#0284c7',
      trunkColor: '#6d4c41',
      foliageColor: '#0d9488',
      foliageHighlight: '#99f6e4',
      flowerColor: '#f43f5e',
      fogColor: 'rgba(240, 249, 255, 0.45)',
      waterColor: '#38bdf8',
    },
  },
  {
    id: 5,
    name: 'Orchid Sanctuary',
    subtitle: 'A paradise of giant hibiscus flowers and sweet nectar pods',
    theme: 'orchid_sanctuary',
    bossName: 'Tarantula Queen',
    bossTitle: 'Jeweled Web Spinner',
    bossQuote: 'A delicious sloth snack caught neatly in my silky web!',
    ambientType: 'tropical_birds',
    palette: {
      skyTop: '#d946ef',
      skyBottom: '#fed7aa',
      sunbeamColor: 'rgba(253, 186, 116, 0.25)',
      distantMountain: '#701a75',
      canopyFar: '#86198f',
      canopyMid: '#c026d3',
      trunkColor: '#4a2810',
      foliageColor: '#15803d',
      foliageHighlight: '#4ade80',
      flowerColor: '#ec4899',
      fogColor: 'rgba(253, 232, 255, 0.25)',
      waterColor: '#c084fc',
    },
  },
  {
    id: 6,
    name: 'Deep Mangrove',
    subtitle: 'Tangled stilt root mazes rising above brackish swamps',
    theme: 'deep_mangrove',
    bossName: 'Marsh Reaver',
    bossTitle: 'Reaver of the Blackwater',
    bossQuote: 'The blackwater keeps what I take, slow traveler! Your footsteps are already mine!',
    ambientType: 'swamp_croaks',
    palette: {
      skyTop: '#1e293b',
      skyBottom: '#84cc16',
      sunbeamColor: 'rgba(190, 242, 100, 0.18)',
      distantMountain: '#0f172a',
      canopyFar: '#365314',
      canopyMid: '#4d7c0f',
      trunkColor: '#422006',
      foliageColor: '#3f6212',
      foliageHighlight: '#bef264',
      flowerColor: '#eab308',
      fogColor: 'rgba(236, 252, 203, 0.22)',
      waterColor: '#4d7c0f',
    },
  },
  {
    id: 7,
    name: 'Ancient Ruins',
    subtitle: 'Forgotten stone temples draped in centuries of strangler figs',
    theme: 'ancient_ruins',
    bossName: 'Stone Idol Golem',
    bossTitle: 'Monolith Protector',
    bossQuote: 'AWAKENED TO CRUSH ALL INTRUDERS UNDER STONE FISTS!',
    ambientType: 'ancient_echo',
    palette: {
      skyTop: '#475569',
      skyBottom: '#cbd5e1',
      sunbeamColor: 'rgba(254, 240, 138, 0.2)',
      distantMountain: '#1e293b',
      canopyFar: '#334155',
      canopyMid: '#475569',
      trunkColor: '#52525b',
      foliageColor: '#166534',
      foliageHighlight: '#86efac',
      flowerColor: '#f59e0b',
      fogColor: 'rgba(241, 245, 249, 0.3)',
      waterColor: '#0284c7',
    },
  },
  {
    id: 8,
    name: 'Twilight Treetops',
    subtitle: 'A mystical purple dusk where glowing fireflies illuminate branches',
    theme: 'twilight_treetops',
    bossName: 'Night-Wing Monarch',
    bossTitle: 'Giant Spectral Bat',
    bossQuote: 'The darkness is my domain! You shall wander lost forever!',
    ambientType: 'twilight_crickets',
    palette: {
      skyTop: '#312e81',
      skyBottom: '#f43f5e',
      sunbeamColor: 'rgba(244, 114, 182, 0.2)',
      distantMountain: '#1e1b4b',
      canopyFar: '#4338ca',
      canopyMid: '#6366f1',
      trunkColor: '#3b0764',
      foliageColor: '#1e1b4b',
      foliageHighlight: '#a855f7',
      flowerColor: '#38bdf8',
      fogColor: 'rgba(238, 242, 255, 0.15)',
      waterColor: '#818cf8',
    },
  },
  {
    id: 9,
    name: 'Volcanic Jungle',
    subtitle: 'Basalt ledges, thermal vents, and glowing ember canopies',
    theme: 'volcanic_jungle',
    bossName: 'Magma Drake',
    bossTitle: 'Primeval Fire Lizard',
    bossQuote: 'Turn to ash, furry intruder! The heat here is too much for you!',
    ambientType: 'volcanic_hum',
    palette: {
      skyTop: '#7f1d1d',
      skyBottom: '#fdba74',
      sunbeamColor: 'rgba(249, 115, 22, 0.3)',
      distantMountain: '#450a0a',
      canopyFar: '#7c2d12',
      canopyMid: '#b45309',
      trunkColor: '#292524',
      foliageColor: '#991b1b',
      foliageHighlight: '#fbbf24',
      flowerColor: '#ea580c',
      fogColor: 'rgba(254, 215, 170, 0.25)',
      waterColor: '#ea580c',
    },
  },
  {
    id: 10,
    name: 'Stormy Highlands Fortress',
    subtitle: 'The treacherous summit stronghold where Jennifur is held captive!',
    theme: 'stormy_highlands',
    bossName: 'General Iron-Claw',
    bossTitle: 'The Warlord Sloth General',
    bossQuote: 'Gwahaha! You made it this far, Sloth? Jennifur will never leave my tower!',
    ambientType: 'thunderstorm',
    palette: {
      skyTop: '#090d16',
      skyBottom: '#475569',
      sunbeamColor: 'rgba(192, 132, 252, 0.25)',
      distantMountain: '#020617',
      canopyFar: '#1e293b',
      canopyMid: '#334155',
      trunkColor: '#1c1917',
      foliageColor: '#0f172a',
      foliageHighlight: '#64748b',
      flowerColor: '#ec4899',
      fogColor: 'rgba(203, 213, 225, 0.2)',
      waterColor: '#38bdf8',
    },
  },
];

const OBJECTIVE_NAMES: Record<ObjectiveType, string> = {
  sprint: 'Canopy Sprint',
  harvest: 'Botanical Bloom',
  purge: 'Predator Purge',
  ascent: 'Treetop Ascent',
  stealth: 'Stealth Thicket',
  vine_runner: 'Vine Swing',
  relic_hunt: 'Idol Hunt',
  rescue: 'Canopy Rescue',
  gauntlet: 'Apex Gauntlet',
  boss_lair: 'Stage Boss Lair',
};

const OBJECTIVE_DESCRIPTIONS: Record<ObjectiveType, (target: number) => string> = {
  sprint: () => 'Race through towering rainforest trees and touch the sacred Exit Shrine!',
  harvest: (target) => `Gather ${target} exotic Rainforest Orchids & Golden Monstera Leaves!`,
  purge: (target) => `Defeat ${target} prowling jungle predators using your sharp Claw Punches!`,
  ascent: () => 'Climb vertical giant vines and bouncy fungus up through misty tree layers to the summit!',
  stealth: () => 'Evade dive-bombing Harpy Eagles by ducking under thick rainforest foliage to reach the end!',
  vine_runner: () => 'Grip hanging rainforest vines and swing across giant canopy chasms!',
  relic_hunt: (target) => `Search ancient moss-covered tree hollows to uncover ${target} hidden Jungle Idols!`,
  rescue: (target) => `Smash bamboo cages to free ${target} trapped baby animals!`,
  gauntlet: (target) => `Fight through intense enemy ambushes, defeat ${target} predators, and reach the exit!`,
  boss_lair: () => 'Confront the Stage Boss! Watch telegraphs, dodge devastating attacks, and rescue Jennifur!',
};

/** how long each kind of stage is, relative to a typical stage of its world (a sprint is the short one, a gauntlet the long one) */
const STAGE_MINUTES: Record<string, number> = { sprint: 0.75, harvest: 1.0, purge: 1.0, stealth: 1.0, vine_runner: 0.95, relic_hunt: 1.1, rescue: 1.15, gauntlet: 1.15 };
/** px per second a player really covers on each kind of stage (flat out for a sprint, slowly where there is fighting and looking) */
const STAGE_PACE: Record<string, number> = { sprint: 170, harvest: 105, purge: 95, stealth: 125, vine_runner: 150, relic_hunt: 100, rescue: 100, gauntlet: 90 };
/** the generator builds a stage a little wider than asked (it finishes the piece it is on, then adds the goal run): ask for that much less */
const STAGE_OVERSHOOT: Record<string, number> = { sprint: 1.05, harvest: 1.1, purge: 1.26, stealth: 1.17, vine_runner: 1.17, relic_hunt: 1.22, rescue: 1.21, gauntlet: 1.55 };
/** a stage is never shorter than this nor longer than that, so it neither flashes by nor outgrows a phone's memory */
export const STAGE_MIN_W = 6000;
export const STAGE_MAX_W = 24000;
const stageWidth = (minutes: number, pace: number) => Math.min(STAGE_MAX_W, Math.max(STAGE_MIN_W, Math.round((minutes * 60 * pace) / 100) * 100));
/** vertical stages: how tall they are (the climb is slower than a run, so they are tall) */
const ASCENT_BASE = 2600;
const ASCENT_PER_WORLD = 380;

/**
 * Generates the 100 level configs (10 worlds x 10 mini-stages).
 * Mini-stages 1..9 correspond to the 9 distinct mission archetypes.
 * Mini-stage 10 is the hardcoded Boss Lair.
 */
export function generateAllLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];
  const archetypes: ObjectiveType[] = [
    'sprint',
    'harvest',
    'purge',
    'ascent',
    'stealth',
    'vine_runner',
    'relic_hunt',
    'rescue',
    'gauntlet',
    'boss_lair',
  ];

  WORLDS_DATA.forEach((world) => {
    archetypes.forEach((objType, miniIdx0) => {
      const miniIndex = miniIdx0 + 1;
      const id = `${world.id}-${miniIndex}`;
      let targetCount = 1;
      let timeLimit = 0;
      let levelWidth = 3200;
      let levelHeight = 900;

      // Stage length is set from how long a stage should TAKE, then turned into pixels with the pace that kind of stage is played at
      // (a sprint is run flat out, a fight stage is mostly stopping, ducking and fighting). A typical stage is about a minute and a half in
      // World 1 and about four minutes in World 10; a stage type is longer or shorter than that by its own factor, each stage drifts a
      // little from the pattern so no two worlds feel like the same ten stages, and the first stages of World 1 ease in.
      const pattern = [0.7, 1.0, 1.2, 1.0, 0.8, 1.3, 1.5, 0.9, 1.1];
      const variety = 1 + (pattern[(miniIndex + world.id * 3) % pattern.length] - 1) * 0.5;
      const minutes = 1.5 + 0.28 * (world.id - 1);
      const easeIn = world.id === 1 ? 0.9 + 0.1 * ((miniIndex - 1) / 8) : 1;
      /** a timed stage allows twice the time it is meant to take, in whole 5 s steps */
      const timedLimit = (type: 'sprint' | 'stealth' | 'vine_runner') => Math.max(120, Math.round((2 * minutes * easeIn * variety * STAGE_MINUTES[type] * 60) / 5) * 5);
      const lengthOf = (type: Exclude<ObjectiveType, 'ascent' | 'boss_lair'>) => stageWidth(minutes * easeIn * variety * STAGE_MINUTES[type], STAGE_PACE[type] / STAGE_OVERSHOOT[type]);
      // how many of the old-size items a stage of this width holds: the quota grows with the stage but a little slower than it
      const grownQuota = (base: number, oldWidth: number, width: number, cap: number) => Math.min(cap, Math.round(base * Math.pow(width / oldWidth, 0.6)));
      const oldSized = (base: number) => Math.round((base * Math.min(world.id === 1 ? 1.1 : 2, 1 + (pattern[(miniIndex + world.id * 3) % pattern.length] - 1)) * (1 + 0.03 * (world.id - 1))) / 100) * 100;

      switch (objType) {
        case 'sprint':
          targetCount = 1;
          levelWidth = lengthOf('sprint');
          timeLimit = timedLimit(objType);
          break;
        case 'harvest':
          levelWidth = lengthOf('harvest');
          targetCount = grownQuota(8 + (world.id - 1) * 2, oldSized(4800), levelWidth, 45);
          break;
        case 'purge':
          levelWidth = lengthOf('purge');
          targetCount = grownQuota(5 + (world.id - 1), oldSized(4600), levelWidth, 22);
          break;
        case 'ascent':
          targetCount = 1;
          levelWidth = Math.round(3200 * (1 + 0.03 * (world.id - 1)) / 100) * 100;
          levelHeight = ASCENT_BASE + ASCENT_PER_WORLD * world.id;
          break;
        case 'stealth':
          targetCount = 1;
          levelWidth = lengthOf('stealth');
          timeLimit = timedLimit(objType);
          break;
        case 'vine_runner':
          targetCount = 1;
          levelWidth = lengthOf('vine_runner');
          timeLimit = timedLimit(objType);
          break;
        case 'relic_hunt':
          targetCount = 3 + (world.id > 6 ? 1 : 0);
          levelWidth = lengthOf('relic_hunt');
          levelHeight = 1100;
          break;
        case 'rescue':
          targetCount = 3 + (world.id > 3 ? 1 : 0) + (world.id > 7 ? 1 : 0);
          levelWidth = lengthOf('rescue');
          break;
        case 'gauntlet': {
          levelWidth = lengthOf('gauntlet');
          const oldW = Math.min(9500, Math.max(oldSized(5600), 4800 + (7 + (world.id - 1) * 2) * 130));
          targetCount = grownQuota(7 + (world.id - 1) * 2, oldW, levelWidth, 28);
          break;
        }
        case 'boss_lair':
          targetCount = 1;
          levelWidth = 2600; // expansive boss arena with multi-tiered boughs
          levelHeight = 900;
          break;
      }

      // Check persisted progress
      let unlocked = world.id === 1 && miniIndex === 1;
      let completed = false;
      let stars = 0;
      let highScore = 0;
      let bestTime = 0;

      try {
        const saved = localStorage.getItem(`sloth_lvl_${id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          completed = !!parsed.completed;
          stars = parsed.stars || 0;
          highScore = parsed.highScore || 0;
          bestTime = parsed.bestTime || 0;
          unlocked = true;
        }
        // If prior stage is completed, this one is unlocked
        if (world.id === 1 && miniIndex === 1) unlocked = true;
      } catch {}

      levels.push({
        worldIndex: world.id,
        miniIndex,
        id,
        name: objType === 'boss_lair' ? `${world.bossName}'s Lair` : `${OBJECTIVE_NAMES[objType]}`,
        objectiveType: objType,
        targetCount,
        timeLimit,
        levelWidth,
        levelHeight,
        description: OBJECTIVE_DESCRIPTIONS[objType](targetCount),
        unlocked,
        completed,
        stars,
        highScore,
        bestTime,
      });
    });
  });

  // a stage is open once the one before it has been cleared (this has to be rebuilt on every load: only results are saved)
  const openAll = testUnlockOn(); // the tester's switch (see testUnlock.ts)
  for (let i = 1; i < levels.length; i++) {
    if (openAll || levels[i - 1].completed) levels[i].unlocked = true;
  }

  return levels;
}

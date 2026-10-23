import type { WorldInfo, LevelConfig, ObjectiveType } from './types.ts';
import { testUnlockOn } from './testUnlock.ts';
import { targetSeconds } from './stageTime.ts';
import { STAGE_PLAN, stageSpec } from './stagePlan.ts';

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
    subtitle: 'The treacherous summit stronghold where Meeca is held captive!',
    theme: 'stormy_highlands',
    bossName: 'General Iron-Claw',
    bossTitle: 'The Warlord Sloth General',
    bossQuote: 'Gwahaha! You made it this far, Sloth? Meeca will never leave my tower!',
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
  sprint: () => 'Run through the treetops and reach the Exit Shrine.',
  harvest: (target) => `Gather ${target} flowers.`,
  purge: (target) => `Clear ${target} foes off the branches.`,
  ascent: () => 'Climb the vines up through the trees to the top.',
  stealth: () => 'Hide from the eagles under the leaves, and reach the end.',
  vine_runner: () => 'Swing on the hanging vines across the gaps.',
  relic_hunt: (target) => `Search the hollow trees for ${target} hidden relics.`,
  rescue: (target) => `Break the cages and free ${target} little ones.`,
  gauntlet: (target) => `Fight your way through. Defeat ${target} and reach the exit.`,
  boss_lair: () => 'Face the guardian. Watch for the warning before each attack, then hit back.',
};

/**
 * Stage length is set in SECONDS (stageTime.ts: targetSeconds, a typical first-time player, about 2:15 in World 1 and 4:00 in World 10) and turned into pixels with
 * the stage's own pace: this many px of stage width per second of modelled play. The generator measures what it built with the same model and
 * rebuilds a stage that came out short, so these are the first guess and the numbers only have to be close.
 */
export const PX_PER_SEC = 120;
/** a stage is never shorter than this nor longer than that, so it neither flashes by nor outgrows a phone's memory */
export const STAGE_MIN_W = 6000;
export const STAGE_MAX_W = 30000;
/** flowers asked for per 1000 px of a harvest stage (halved 2026-10 with the flowers themselves: about half the loose flowers are left out now, see
 * stageGenerator flower()); the generator tops a harvest up to about 1.6 times its quota */
const HARVEST_QUOTA_PER_KPX = 2.05;
const widthForSeconds = (sec: number) => Math.min(STAGE_MAX_W, Math.max(STAGE_MIN_W, Math.round((sec * PX_PER_SEC) / 100) * 100));
/** vertical stages: modelled seconds of a climb per px of height (a climb is slow: about 25 px of height a second) */
export const ASCENT_PX_PER_SEC = 24;
const ASCENT_MIN_H = 2600;

/**
 * Generates the 100 level configs (10 worlds x 10 mini-stages).
 * Mini-stages 1..9 are each world's own missions from the story (stagePlan.ts).
 * Mini-stage 10 is the hardcoded Boss Lair.
 */
export function generateAllLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];

  WORLDS_DATA.forEach((world) => {
    // each world's stages come from the story (stagePlan.ts); the tenth is always the guardian's lair
    const lineup: ObjectiveType[] = [...(STAGE_PLAN[world.id] ?? []).map((s) => s.type), 'boss_lair'];
    lineup.forEach((objType, miniIdx0) => {
      const miniIndex = miniIdx0 + 1;
      const spec = stageSpec(world.id, miniIndex);
      const id = `${world.id}-${miniIndex}`;
      let targetCount = 1;
      let timeLimit = 0;
      let levelWidth = 3200;
      let levelHeight = 900;

      // Stage length is set from how long a stage should TAKE (stageTime.ts): about 2:15 for a typical stage of World 1 and about 4:00 in World 10.
      const seconds = (type: ObjectiveType) => targetSeconds(world.id, miniIndex, type);
      /** a timed stage allows twice the time it is meant to take, in whole 5 s steps */
      const timedLimit = (type: 'sprint' | 'stealth' | 'vine_runner') => Math.max(120, Math.round((2 * seconds(type)) / 5) * 5);
      const lengthOf = (type: Exclude<ObjectiveType, 'ascent' | 'boss_lair'>) => widthForSeconds(seconds(type));
      const pattern = [0.7, 1.0, 1.2, 1.0, 0.8, 1.3, 1.5, 0.9, 1.1];
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
          // a harvest stage places about 1.6 times its quota (the rest is the reward on the longer lane of a fork): its generated flowers run about
          // HARVEST_FLOWERS_PER_KPX per 1000 px, so the quota is the share of them that makes the ratio come out near 1.6 (it used to be met in the first third)
          targetCount = Math.max(grownQuota(6 + (world.id - 1), oldSized(4800), levelWidth, 24), Math.round((levelWidth / 1000) * HARVEST_QUOTA_PER_KPX));
          break;
        case 'purge':
          levelWidth = lengthOf('purge');
          targetCount = grownQuota(5 + (world.id - 1), oldSized(4600), levelWidth, 22);
          break;
        case 'ascent':
          targetCount = 1;
          levelWidth = Math.round(3200 * (1 + 0.03 * (world.id - 1)) / 100) * 100;
          levelHeight = Math.max(ASCENT_MIN_H, Math.round((seconds('ascent') * ASCENT_PX_PER_SEC) / 100) * 100);
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
        name: objType === 'boss_lair' ? `${world.bossName}'s Lair` : spec?.name ?? OBJECTIVE_NAMES[objType],
        objectiveType: objType,
        targetCount,
        timeLimit,
        levelWidth,
        levelHeight,
        description: spec?.desc
          ? spec.desc.replace('{n}', String(targetCount))
          : objType === 'boss_lair'
            ? `Face ${world.bossName}. Watch for the warning before each attack, then hit back.`
            : OBJECTIVE_DESCRIPTIONS[objType](targetCount),
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

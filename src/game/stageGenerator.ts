import type {
  LevelConfig,
  Platform,
  Vine,
  Enemy,
  BossEntity,
  Collectible,
  TreeStructure,
} from './types.ts';
import { calculateDifficultyScaling } from './rules.ts';
import { WORLDS_DATA } from './worldsData.ts';

export interface GeneratedStage {
  config: LevelConfig;
  trees: TreeStructure[];
  platforms: Platform[];
  vines: Vine[];
  enemies: Enemy[];
  boss: BossEntity | null;
  collectibles: Collectible[];
  spawnX: number;
  spawnY: number;
  exitTotemX: number;
  exitTotemY: number;
  daisyX?: number;
  daisyY?: number;
}

export function generateStage(config: LevelConfig): GeneratedStage {
  const diff = calculateDifficultyScaling(config.worldIndex, config.miniIndex);
  const world = WORLDS_DATA[config.worldIndex - 1] || WORLDS_DATA[0];

  const trees: TreeStructure[] = [];
  const platforms: Platform[] = [];
  const vines: Vine[] = [];
  const enemies: Enemy[] = [];
  const collectibles: Collectible[] = [];
  let boss: BossEntity | null = null;

  const isBossLevel = config.objectiveType === 'boss_lair';
  const isAscent = config.objectiveType === 'ascent';
  const isVineRunner = config.objectiveType === 'vine_runner';

  let spawnX = 140;
  let spawnY = 510;
  let exitTotemX = config.levelWidth - 220;
  let exitTotemY = 480;

  let platformId = 1;
  let vineId = 1;
  let enemyId = 1;
  let collectibleId = 1;
  let treeId = 1;

  if (isBossLevel) {
    // --- BOSS ARENA ---
    // Two majestic ancient guardian trees flanking the arena with climbing vines
    trees.push(
      {
        id: treeId++,
        x: 420,
        groundY: 560,
        topY: 110,
        trunkWidth: 80,
        hasClimbVine: true,
        canopyRadius: 160,
      },
      {
        id: treeId++,
        x: 1380,
        groundY: 560,
        topY: 110,
        trunkWidth: 80,
        hasClimbVine: true,
        canopyRadius: 160,
      }
    );

    // Wide sturdy floor platform
    platforms.push({
      id: platformId++,
      x: 0,
      y: 560,
      width: config.levelWidth,
      height: 80,
      type: 'solid',
      style: 'log',
    });

    // Elevated tactical branches for Sloth to jump on to dodge ground attacks
    platforms.push(
      {
        id: platformId++,
        x: 310,
        y: 420,
        width: 240,
        height: 28,
        type: 'solid',
        style: 'branch',
      },
      {
        id: platformId++,
        x: 750,
        y: 350,
        width: 260,
        height: 28,
        type: 'solid',
        style: 'branch',
      },
      {
        id: platformId++,
        x: 1260,
        y: 420,
        width: 240,
        height: 28,
        type: 'solid',
        style: 'branch',
      }
    );

    // Bouncy spotted mushrooms on arena sides
    platforms.push(
      {
        id: platformId++,
        x: 180,
        y: 535,
        width: 70,
        height: 32,
        type: 'bouncy',
      },
      {
        id: platformId++,
        x: 1620,
        y: 535,
        width: 70,
        height: 32,
        type: 'bouncy',
      }
    );

    // Climbing vines on guardian trees
    vines.push(
      {
        id: vineId++,
        x: 420,
        topY: 140,
        bottomY: 540,
        swaySpeed: 1.0,
        swayPhase: 0,
        vineType: 'tree_climb',
        treeId: 1,
      },
      {
        id: vineId++,
        x: 1380,
        topY: 140,
        bottomY: 540,
        swaySpeed: 1.0,
        swayPhase: 1,
        vineType: 'tree_climb',
        treeId: 2,
      },
      {
        id: vineId++,
        x: 880,
        topY: 130,
        bottomY: 480,
        swaySpeed: 1.2,
        swayPhase: 0.5,
        vineType: 'swing_liana',
        isSwingingVine: true,
      }
    );

    // Boss entity!
    const bossMaxHp = 10 + config.worldIndex * 4;
    boss = {
      id: enemyId++,
      type: 'boss',
      x: 1200,
      y: 510,
      vx: -40,
      vy: 0,
      width: 60,
      height: 70,
      hp: bossMaxHp,
      maxHp: bossMaxHp,
      facing: -1,
      patrolMinX: 300,
      patrolMaxX: 1700,
      attackCooldown: 2.5,
      telegraphTimer: 0,
      isAttacking: false,
      animTimer: 0,
      hitFlashTimer: 0,
      defeated: false,
      koTimer: 0,
      behaviorTimer: 0,
      phase: 1,
      phaseMax: 3,
      specialAttackTimer: 4.0,
      shieldActive: false,
      dialogueIntro: world.bossQuote,
      dialogueDefeat: 'Nooo! Defeated by a sloth...!',
    };

    // Daisy in a grand cage at the sanctuary edge
    const daisyX = 1800;
    const daisyY = 490;

    // A few health nectar blooms in arena
    collectibles.push(
      {
        id: collectibleId++,
        type: 'heart',
        x: 400,
        y: 380,
        collected: false,
        bobPhase: 0,
      },
      {
        id: collectibleId++,
        type: 'heart',
        x: 1350,
        y: 380,
        collected: false,
        bobPhase: 1,
      }
    );

    return {
      config,
      trees,
      platforms,
      vines,
      enemies,
      boss,
      collectibles,
      spawnX,
      spawnY,
      exitTotemX,
      exitTotemY,
      daisyX,
      daisyY,
    };
  }

  // --- MISSION STAGE GENERATION (1..9) ---
  if (isAscent) {
    // Vertical climbing level: start at bottom, ascend to top!
    spawnX = 220;
    spawnY = config.levelHeight - 120;
    exitTotemX = config.levelWidth * 0.5;
    exitTotemY = 160;

    // 4 Towering ancient Ceiba trees spanning from ground to summit
    const numAscentTrees = 4;
    const treeSpacing = (config.levelWidth - 300) / (numAscentTrees - 1);
    for (let t = 0; t < numAscentTrees; t++) {
      const tx = 150 + t * treeSpacing;
      trees.push({
        id: treeId++,
        x: tx,
        groundY: config.levelHeight - 60,
        topY: 80,
        trunkWidth: 75,
        hasClimbVine: true,
        canopyRadius: 180,
      });

      // Continuous vertical climbing vine along each tree trunk
      vines.push({
        id: vineId++,
        x: tx,
        topY: 110,
        bottomY: config.levelHeight - 70,
        swaySpeed: 1.0,
        swayPhase: t * 0.8,
        vineType: 'tree_climb',
        treeId: treeId - 1,
      });
    }

    // Ground platform at bottom
    platforms.push({
      id: platformId++,
      x: 0,
      y: config.levelHeight - 60,
      width: config.levelWidth,
      height: 60,
      type: 'solid',
      style: 'log',
    });

    // Multi-tier ascending branches connecting the trees
    const tiers = 8;
    const tierHeight = (config.levelHeight - 280) / tiers;
    for (let t = 1; t <= tiers; t++) {
      const tierY = config.levelHeight - 60 - t * tierHeight;
      const numBranches = 3;
      for (let b = 0; b < numBranches; b++) {
        const bx = 160 + b * 560 + (t % 2 === 0 ? 100 : -60);
        const bWidth = 260 + Math.random() * 80;
        platforms.push({
          id: platformId++,
          x: bx,
          y: tierY,
          width: bWidth,
          height: 28,
          type: Math.random() < 0.2 ? 'fragile' : 'solid',
          style: 'branch',
        });

        // Bouncy spotted mushroom on some tiers for mega launch!
        if (Math.random() < 0.3) {
          platforms.push({
            id: platformId++,
            x: bx + bWidth - 60,
            y: tierY - 20,
            width: 65,
            height: 30,
            type: 'bouncy',
          });
        }

        // Botanical flowers & leaves
        const variant: 'orchid' | 'hibiscus' | 'monstera' | 'fern' =
          Math.random() < 0.35 ? 'orchid' : Math.random() < 0.65 ? 'fern' : Math.random() < 0.85 ? 'monstera' : 'hibiscus';
        collectibles.push({
          id: collectibleId++,
          type: (variant === 'fern' || variant === 'monstera') ? 'leaf' : 'flower',
          botanicalVariant: variant,
          x: bx + bWidth * 0.5,
          y: tierY - 24,
          collected: false,
          bobPhase: Math.random() * Math.PI,
        });

        // Patrolling tree snake
        if (Math.random() < 0.35) {
          enemies.push({
            id: enemyId++,
            type: 'snake',
            x: bx + bWidth * 0.5,
            y: tierY - 14,
            vx: 30 * diff.enemySpeedMultiplier,
            vy: 0,
            width: 38,
            height: 22,
            hp: 2,
            maxHp: 2,
            facing: 1,
            patrolMinX: bx + 10,
            patrolMaxX: bx + bWidth - 10,
            attackCooldown: 2,
            telegraphTimer: 0,
            isAttacking: false,
            animTimer: 0,
            hitFlashTimer: 0,
            defeated: false,
            koTimer: 0,
            behaviorTimer: 0,
          });
        }
      }
    }

    // Top summit branch with Exit Totem
    platforms.push({
      id: platformId++,
      x: exitTotemX - 180,
      y: exitTotemY + 40,
      width: 360,
      height: 35,
      type: 'solid',
      style: 'log',
    });

    collectibles.push({
      id: collectibleId++,
      type: 'exit_totem',
      x: exitTotemX,
      y: exitTotemY,
      collected: false,
      bobPhase: 0,
    });

    return {
      config,
      trees,
      platforms,
      vines,
      enemies,
      boss: null,
      collectibles,
      spawnX,
      spawnY,
      exitTotemX,
      exitTotemY,
    };
  }

  // --- HORIZONTAL EXPEDITION STAGES (Sprint, Harvest, Purge, Stealth, Vine Runner, Relic, Rescue, Gauntlet) ---
  // 1. Generate Towering Ancient Rainforest Trees (Ceiba & Banyan) along the entire level
  const numTrees = Math.floor(config.levelWidth / 420);
  for (let t = 0; t < numTrees; t++) {
    const tx = 220 + t * 420 + Math.sin(t * 3.5) * 35;
    const treeObj: TreeStructure = {
      id: treeId++,
      x: tx,
      groundY: 600,
      topY: 90 + (t % 3) * 25,
      trunkWidth: 72 + (t % 4) * 8,
      hasClimbVine: true, // Every grand tree has climbable lianas!
      canopyRadius: 160 + (t % 3) * 20,
    };
    trees.push(treeObj);

    // Continuous vertical climbing liana wound tightly around the tree trunk from ground to canopy
    vines.push({
      id: vineId++,
      x: tx,
      topY: treeObj.topY + 30,
      bottomY: 590,
      swaySpeed: 0.8,
      swayPhase: t * 0.6,
      vineType: 'tree_climb',
      treeId: treeObj.id,
    });

    // Sturdy sprawling boughs attached directly to the tree trunk at multiple elevations
    // Mid-level bough (Left or Right)
    const midSide = t % 2 === 0 ? -1 : 1;
    platforms.push({
      id: platformId++,
      x: midSide === -1 ? tx - 210 : tx + 20,
      y: 410,
      width: 200,
      height: 30,
      type: 'solid',
      style: 'branch',
    });

    // High canopy bough (Spans toward neighboring trees)
    const highSide = -midSide;
    platforms.push({
      id: platformId++,
      x: highSide === -1 ? tx - 240 : tx + 10,
      y: 280,
      width: 230,
      height: 28,
      type: 'solid',
      style: 'branch',
    });

    // Rare upper canopy perch (Secret high flora / relics)
    if (t % 2 === 0) {
      platforms.push({
        id: platformId++,
        x: tx - 70,
        y: 160,
        width: 140,
        height: 24,
        type: 'solid',
        style: 'branch',
      });
    }

    // Place botanical flowers / leaves / cages on tree branches
    if (config.objectiveType === 'harvest') {
      collectibles.push({
        id: collectibleId++,
        type: 'flower',
        botanicalVariant: t % 2 === 0 ? 'orchid' : 'hibiscus',
        x: midSide === -1 ? tx - 110 : tx + 110,
        y: 386,
        collected: false,
        bobPhase: t * 0.9,
      });
      collectibles.push({
        id: collectibleId++,
        type: 'leaf',
        botanicalVariant: 'monstera',
        x: highSide === -1 ? tx - 120 : tx + 120,
        y: 256,
        collected: false,
        bobPhase: t * 0.9 + 1,
      });
    } else if (config.objectiveType === 'rescue' && t % 3 === 1) {
      collectibles.push({
        id: collectibleId++,
        type: 'cage',
        x: tx + 60,
        y: 384,
        collected: false,
        bobPhase: 0,
        cageHp: 2,
      });
    } else if (config.objectiveType === 'relic_hunt' && t % 3 === 2) {
      collectibles.push({
        id: collectibleId++,
        type: 'relic',
        x: tx - 60,
        y: 256,
        collected: false,
        bobPhase: 0,
      });
    } else {
      if (t % 2 === 0) {
        collectibles.push({
          id: collectibleId++,
          type: 'flower',
          botanicalVariant: 'orchid',
          x: tx + (midSide * 90),
          y: 386,
          collected: false,
          bobPhase: t * 0.5,
        });
      }
    }

    // Between this tree and the next, suspend a dynamic swinging liana over the canopy gap
    if (t < numTrees - 1) {
      const nextTx = 220 + (t + 1) * 420 + Math.sin((t + 1) * 3.5) * 35;
      const midGapX = (tx + nextTx) * 0.5;
      vines.push({
        id: vineId++,
        x: midGapX,
        topY: 85,
        bottomY: 380,
        swaySpeed: 1.2,
        swayPhase: t * 1.1,
        vineType: 'swing_liana',
        isSwingingVine: true,
      });
    }
  }

  // 2. Organic Forest Floor & River Ravines (Gorges require tree climbing / swinging to cross)
  for (let rx = 0; rx < config.levelWidth; rx += 460) {
    const isRiverGorge = (rx > 600 && rx < config.levelWidth - 600) && (Math.floor(rx / 460) % 3 === 0);
    if (!isRiverGorge) {
      // Sturdy moss-covered root bank
      platforms.push({
        id: platformId++,
        x: rx,
        y: 580,
        width: 440,
        height: 70,
        type: 'solid',
        style: 'log',
      });
    } else {
      // River Ravine! In the gorge, place a lower log stepping stone and a springy mushroom
      platforms.push({
        id: platformId++,
        x: rx + 80,
        y: 595,
        width: 140,
        height: 40,
        type: 'solid',
        style: 'log',
      });
      // Giant springy mushroom that launches player up into the canopy!
      platforms.push({
        id: platformId++,
        x: rx + 240,
        y: 565,
        width: 72,
        height: 32,
        type: 'bouncy',
      });
    }
  }

  // 3. Canopy Pathway Bridges, High Platforms & Hidden Nooks
  let curX = 0;
  let curY = 490;

  // Safe starting bough
  platforms.push({
    id: platformId++,
    x: 0,
    y: curY,
    width: 420,
    height: 48,
    type: 'solid',
    style: 'branch',
  });
  curX = 420;

  while (curX < config.levelWidth - 360) {
    const gap = 80 + Math.random() * 60;
    curX += gap;

    // Platform height elevation
    const maxDelta = config.worldIndex === 1 ? 30 : 45 + config.worldIndex * 4;
    const yDelta = (Math.random() - 0.5) * (maxDelta * 2);
    curY = Math.max(310, Math.min(525, curY + yDelta));

    const pWidth = isVineRunner
      ? 240 + Math.random() * 120
      : 280 + Math.random() * 180;

    const isBouncy = Math.random() < (curY < 380 ? 0.25 : 0.14);
    const isFragile = !isBouncy && config.worldIndex > 1 && Math.random() < 0.12 * diff.hazardDensityMultiplier;
    const pType: Platform['type'] = isBouncy ? 'bouncy' : isFragile ? 'fragile' : 'solid';

    const actualWidth = isBouncy ? 74 : pWidth;
    const actualHeight = isBouncy ? 34 : 32;

    platforms.push({
      id: platformId++,
      x: curX,
      y: curY,
      width: actualWidth,
      height: actualHeight,
      type: pType,
      style: isBouncy ? undefined : 'branch',
    });

    // Also place bouncy mushroom on the ground below high platforms so ground runners can bounce up
    if (curY < 400 && Math.random() < 0.45) {
      platforms.push({
        id: platformId++,
        x: curX + 40,
        y: 548,
        width: 72,
        height: 32,
        type: 'bouncy',
      });
    }

    // 4. Botanical Collectibles (Fun Leaves & Flowers - No Generic Fruit!)
    const botanicalVariant: 'orchid' | 'hibiscus' | 'monstera' | 'fern' =
      Math.random() < 0.35 ? 'orchid' : Math.random() < 0.65 ? 'fern' : Math.random() < 0.85 ? 'hibiscus' : 'monstera';
    const collType: 'flower' | 'leaf' = botanicalVariant === 'fern' || botanicalVariant === 'monstera' ? 'leaf' : 'flower';

    if (config.objectiveType === 'harvest') {
      collectibles.push({
        id: collectibleId++,
        type: collType,
        botanicalVariant,
        x: curX + pWidth * 0.5,
        y: curY - 26,
        collected: false,
        bobPhase: Math.random() * 3,
      });
      if (pWidth > 280) {
        collectibles.push({
          id: collectibleId++,
          type: 'flower',
          botanicalVariant: 'orchid',
          x: curX + pWidth * 0.25,
          y: curY - 26,
          collected: false,
          bobPhase: Math.random() * 3,
        });
      }
    } else if (config.objectiveType === 'rescue') {
      if (collectibles.filter(c => c.type === 'cage').length < config.targetCount && Math.random() < 0.4) {
        collectibles.push({
          id: collectibleId++,
          type: 'cage',
          x: curX + pWidth * 0.5,
          y: curY - 26,
          collected: false,
          bobPhase: 0,
          cageHp: 2,
        });
      } else {
        collectibles.push({
          id: collectibleId++,
          type: collType,
          botanicalVariant,
          x: curX + pWidth * 0.5,
          y: curY - 26,
          collected: false,
          bobPhase: Math.random() * 3,
        });
      }
    } else if (config.objectiveType === 'relic_hunt') {
      if (collectibles.filter(c => c.type === 'relic').length < config.targetCount && Math.random() < 0.35) {
        collectibles.push({
          id: collectibleId++,
          type: 'relic',
          x: curX + pWidth * 0.5,
          y: curY - 26,
          collected: false,
          bobPhase: 0,
        });
      }
    } else {
      // General fun leaf / flower pickup for bonus score
      if (Math.random() < 0.7) {
        collectibles.push({
          id: collectibleId++,
          type: collType,
          botanicalVariant,
          x: curX + pWidth * 0.5,
          y: curY - 26,
          collected: false,
          bobPhase: Math.random() * 3,
        });
      }
    }

    // Occasional Health Nectar Bloom
    if (Math.random() < 0.12) {
      collectibles.push({
        id: collectibleId++,
        type: 'heart',
        x: curX + pWidth * 0.8,
        y: curY - 26,
        collected: false,
        bobPhase: 1,
      });
    }

    // 5. Enemies (Predators)
    const shouldSpawnEnemy =
      config.objectiveType === 'purge' ||
      config.objectiveType === 'gauntlet' ||
      Math.random() < 0.45 * diff.hazardDensityMultiplier;

    if (shouldSpawnEnemy && pWidth >= 200 && pType === 'solid') {
      const enemyChoice = Math.random();
      if (enemyChoice < 0.6) {
        // Tree Snake patrolling branch
        const snakeHp = config.worldIndex === 1 ? 1 : 2;
        enemies.push({
          id: enemyId++,
          type: 'snake',
          x: curX + pWidth * 0.5,
          y: curY - 14,
          vx: (config.worldIndex === 1 ? 28 : 36) * diff.enemySpeedMultiplier,
          vy: 0,
          width: 38,
          height: 22,
          hp: snakeHp,
          maxHp: snakeHp,
          facing: 1,
          patrolMinX: curX + 15,
          patrolMaxX: curX + pWidth - 15,
          attackCooldown: 2,
          telegraphTimer: 0,
          isAttacking: false,
          animTimer: 0,
          hitFlashTimer: 0,
          defeated: false,
          koTimer: 0,
          behaviorTimer: 0,
        });
      } else if (config.worldIndex >= 2 && enemyChoice < 0.85) {
        // Jungle Ocelot
        enemies.push({
          id: enemyId++,
          type: 'ocelot',
          x: curX + pWidth * 0.5,
          y: curY - 18,
          vx: 55 * diff.enemySpeedMultiplier,
          vy: 0,
          width: 48,
          height: 28,
          hp: 2,
          maxHp: 2,
          facing: -1,
          patrolMinX: curX + 15,
          patrolMaxX: curX + pWidth - 15,
          attackCooldown: 2.5,
          telegraphTimer: 0,
          isAttacking: false,
          animTimer: 0,
          hitFlashTimer: 0,
          defeated: false,
          koTimer: 0,
          behaviorTimer: 0,
        });
      }
    }

    curX += pWidth;
  }

  // Aerial Harpy Eagles soaring in the high canopy
  const numEagles = config.objectiveType === 'stealth'
    ? 2 + Math.floor(config.worldIndex * 0.4)
    : config.objectiveType === 'purge' || config.objectiveType === 'gauntlet'
    ? 1 + Math.floor(config.worldIndex * 0.3)
    : Math.floor(config.levelWidth / 1800);

  const eagleHp = config.worldIndex === 1 ? 1 : 2;
  for (let e = 0; e < numEagles; e++) {
    const ex = 850 + e * ((config.levelWidth - 1200) / Math.max(1, numEagles));
    enemies.push({
      id: enemyId++,
      type: 'eagle',
      x: ex,
      y: 290 + Math.random() * 40,
      vx: (config.worldIndex === 1 ? 30 : 42) * diff.enemySpeedMultiplier,
      vy: 0,
      width: 58,
      height: 42,
      hp: eagleHp,
      maxHp: eagleHp,
      facing: -1,
      patrolMinX: ex - 240,
      patrolMaxX: ex + 240,
      attackCooldown: 4.0,
      telegraphTimer: 0,
      isAttacking: false,
      animTimer: 0,
      hitFlashTimer: 0,
      defeated: false,
      koTimer: 0,
      behaviorTimer: 0,
      swoopPhase: 'patrol',
      hoverTimer: 0,
    });
  }

  // Ensure enough Relics or Cages were placed
  if (config.objectiveType === 'relic_hunt') {
    while (collectibles.filter(c => c.type === 'relic').length < config.targetCount) {
      const p = platforms[Math.floor(Math.random() * (platforms.length - 2)) + 1];
      collectibles.push({
        id: collectibleId++,
        type: 'relic',
        x: p.x + p.width * 0.5,
        y: p.y - 24,
        collected: false,
        bobPhase: 0,
      });
    }
  }

  if (config.objectiveType === 'rescue') {
    while (collectibles.filter(c => c.type === 'cage').length < config.targetCount) {
      const p = platforms[Math.floor(Math.random() * (platforms.length - 2)) + 1];
      collectibles.push({
        id: collectibleId++,
        type: 'cage',
        x: p.x + p.width * 0.5,
        y: p.y - 24,
        collected: false,
        bobPhase: 0,
        cageHp: 2,
      });
    }
  }

  if (config.objectiveType === 'harvest') {
    while (collectibles.filter(c => c.type === 'flower' || c.type === 'leaf').length < config.targetCount) {
      const p = platforms[Math.floor(Math.random() * (platforms.length - 2)) + 1];
      collectibles.push({
        id: collectibleId++,
        type: 'flower',
        botanicalVariant: 'orchid',
        x: p.x + p.width * 0.5,
        y: p.y - 24,
        collected: false,
        bobPhase: 0,
      });
    }
  }

  // Final End Platform & Exit Totem Sanctuary
  exitTotemX = curX + 160;
  exitTotemY = curY;

  // Main sanctuary platform where the sacred shrine stands
  platforms.push({
    id: platformId++,
    x: curX,
    y: curY,
    width: 460,
    height: 70,
    type: 'solid',
    style: 'log',
  });

  // Connect ground floor directly into the victory sanctuary so ground runners never get stranded
  platforms.push({
    id: platformId++,
    x: curX - 60,
    y: 535,
    width: 80,
    height: 36,
    type: 'bouncy',
  });
  platforms.push({
    id: platformId++,
    x: curX - 30,
    y: 580,
    width: 480,
    height: 65,
    type: 'solid',
    style: 'log',
  });

  // Exit Totem Sanctuary Portal
  collectibles.push({
    id: collectibleId++,
    type: 'exit_totem',
    x: exitTotemX,
    y: exitTotemY - 30,
    collected: false,
    bobPhase: 0,
  });

  return {
    config,
    trees,
    platforms,
    vines,
    enemies,
    boss: null,
    collectibles,
    spawnX,
    spawnY,
    exitTotemX,
    exitTotemY,
  };
}

export type GameScreen =
  | 'title'
  | 'world_map'
  | 'story_cutscene'
  | 'playing'
  | 'paused'
  | 'victory'
  | 'game_over'
  | 'boss_intro'
  | 'story_ending'
  | 'world_story'
  | 'boss_defeat'
  | 'ending_story';

export type ObjectiveType =
  | 'sprint'       // Canopy Sprint (Reach exit totem)
  | 'harvest'      // Berry Harvest / Botanical Bloom (Collect X Flowers & Leaves)
  | 'purge'        // Predator Purge (Defeat X Predators)
  | 'ascent'       // Treetop Ascent (Vertical climbing challenge)
  | 'stealth'      // Stealth Thicket (Survive aerial Eagle ambushes)
  | 'vine_runner'  // Vine Runner / Tarzan Swinger (Swing across giant chasms)
  | 'relic_hunt'   // Relic Hunt (Find 3 hidden Jungle Idols)
  | 'rescue'       // Canopy Rescue (Free trapped jungle critters)
  | 'gauntlet'     // Gauntlet Branch (High-density combat & platforming)
  | 'boss_lair';   // Stage Boss Lair (Hardcoded Boss with story)

export type EnemyType =
  | 'snake'        // Tree Snake / Emerald Boa
  | 'eagle'        // Harpy Eagle / Hawk
  | 'ocelot'       // Jaguar / Ocelot
  | 'frog'         // Poison Dart Frog
  | 'spider'       // Canopy Tarantula
  | 'ant_hazard'   // Marching Army Ants
  | 'boss';        // Hardcoded Stage Boss

export interface WorldPalette {
  skyTop: string;
  skyBottom: string;
  sunbeamColor: string;
  distantMountain: string;
  canopyFar: string;
  canopyMid: string;
  trunkColor: string;
  foliageColor: string;
  foliageHighlight: string;
  flowerColor: string;
  fogColor: string;
  waterColor: string;
}

export interface WorldInfo {
  id: number;
  name: string;
  subtitle: string;
  theme: string;
  palette: WorldPalette;
  bossName: string;
  bossTitle: string;
  bossQuote: string;
  ambientType: 'gentle_breeze' | 'river_flow' | 'deep_cave' | 'waterfall' | 'tropical_birds' | 'swamp_croaks' | 'ancient_echo' | 'twilight_crickets' | 'volcanic_hum' | 'thunderstorm';
}

export interface LevelConfig {
  worldIndex: number; // 1-10
  miniIndex: number;  // 1-10
  id: string;         // e.g. "1-1"
  name: string;
  objectiveType: ObjectiveType;
  targetCount: number;
  timeLimit: number;  // seconds (0 = no limit)
  levelWidth: number;
  levelHeight: number;
  description: string;
  unlocked: boolean;
  completed: boolean;
  stars: number;       // 0-3
  highScore: number;
  bestTime: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  grounded: boolean;
  climbing: boolean;
  climbingVineId?: number;
  isVineSwinging?: boolean;
  swingVineId?: number;
  swingAngle?: number;          // in radians (-1.2 to 1.2)
  swingAngularVelocity?: number; // rad/s
  swingLength?: number;         // distance from vine top anchor
  ducking: boolean;
  punching: boolean;
  punchTimer: number;
  kicking: boolean;
  kickTimer: number;
  attackType: 'none' | 'punch' | 'kick' | 'mega';
  punchType: 'normal' | 'mega';
  jumpsLeft: number; // 2 for double jump capability
  isDoubleJumping: boolean;
  somersaultAngle: number;
  megaCharge: number; // 0 to 1
  hp: number;
  maxHp: number;
  fruitsCollected: number;
  relicsFound: number;
  crittersRescued: number;
  enemiesDefeated: number;
  invincibleTimer: number;
  walkCycle: number;
  squashX: number;
  squashY: number;
  targetScaleX: number;
  targetScaleY: number;
  activePowerUp?: 'speed' | 'invincible' | 'magnet' | null;
  powerUpTimer?: number;
  maxPowerUpTimer?: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  patrolMinX: number;
  patrolMaxX: number;
  attackCooldown: number;
  telegraphTimer: number;
  isAttacking: boolean;
  animTimer: number;
  hitFlashTimer: number;
  defeated: boolean;
  koTimer: number;
  behaviorTimer: number;
  diveAngle?: number;
  swoopPhase?: 'patrol' | 'telegraph' | 'swoop' | 'hover' | 'ascend';
  hoverTimer?: number;
  /** cruising altitude for fliers (eagles return here after a swoop) */
  homeY?: number;
}

export interface BossEntity extends Enemy {
  phase: number;
  phaseMax: number;
  specialAttackTimer: number;
  shieldActive: boolean;
  dialogueIntro: string;
  dialogueDefeat: string;
}

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'fragile' | 'bouncy' | 'moving';
  fragileTimer?: number;
  broken?: boolean;
  moveRange?: number;
  moveSpeed?: number;
  baseX?: number;
  swayOffset?: number;
  style?: 'branch' | 'log' | 'moss_stone' | 'ruin' | 'canopy_bridge';
}

export interface TreeStructure {
  id: number;
  x: number;
  groundY: number;
  topY: number;
  trunkWidth: number;
  hasClimbVine: boolean;
  canopyRadius: number;
}

export interface Vine {
  id: number;
  x: number;
  topY: number;
  bottomY: number;
  swaySpeed: number;
  swayPhase: number;
  vineType?: 'tree_climb' | 'swing_liana';
  treeId?: number;
  isSwingingVine?: boolean;
  swingAngle?: number;
}

export interface Collectible {
  id: number;
  type: 'fruit' | 'flower' | 'leaf' | 'relic' | 'cage' | 'heart' | 'super_heart' | 'powerup_speed' | 'powerup_invincible' | 'powerup_magnet' | 'exit_totem';
  botanicalVariant?: 'orchid' | 'hibiscus' | 'monstera' | 'fern' | 'lotus' | 'cheetah_flower' | 'solar_bloom' | 'nectar_spore';
  x: number;
  y: number;
  collected: boolean;
  bobPhase: number;
  cageHp?: number;
  isLocked?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'leaf' | 'spark' | 'smoke' | 'star' | 'water' | 'feather' | 'claw_wave';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  zoom: number;
  targetZoom: number;
  trauma: number; // 0 to 1 for screen shake
  viewportWidth: number;
  viewportHeight: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  punchPressed: boolean;
  kickPressed: boolean;
  megaPunchPressed: boolean;
  layerSwitchPressed: boolean;
  touchJoystickAngle: number | null; // 0..360 deg or null
  touchJoystickMagnitude: number;    // 0..1
}

export interface MissionProgress {
  currentCount: number;
  targetCount: number;
  isComplete: boolean;
  elapsedTime: number;
  score: number;
}

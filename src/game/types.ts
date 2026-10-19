export type GameScreen =
  | 'title'
  | 'world_map'
  | 'trophy'
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
  | 'ocelot'       // Ocelot
  | 'jaguar'       // Jaguar: crouch, leap, land (the big sloth predator)
  | 'boa'          // Boa constrictor: coiled ambusher with a long strike
  | 'caiman'       // Spectacled caiman: slow armoured lunger
  | 'tayra'        // Tayra: fast low dasher
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
  /** a hidden bonus level that is not part of the 100 (see secret.ts) */
  secret?: 'thornbark';
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
  /** fight: how far the claw or foot is pulled back (0..1) and thrust out (0..1) right now, for the drawing */
  swingCock?: number;
  swingReach?: number;
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
  /** fight: seconds left staggered (it does nothing while staggered) and how long the stagger was */
  stagger?: number;
  staggerMax?: number;
  /** fight: sideways shove in px/s that wears off quickly */
  knockVx?: number;
  /** fight: 1 right after a hit, fading to 0; the drawing leans and squashes with it */
  recoil?: number;
  recoilDir?: 1 | -1;
  koLanded?: boolean;
  /** fight: how a defeated animal leaves (launch velocity, spin and how long it stays on screen) */
  koVx?: number;
  koVy?: number;
  koSpin?: number;
  koLife?: number;
  koAngle?: number;
  /** fight: the swing that last hit it, so one swing never hits twice */
  lastSwing?: number;
  diveAngle?: number;
  swoopPhase?: 'patrol' | 'telegraph' | 'swoop' | 'hover' | 'ascend';
  hoverTimer?: number;
  /** cruising altitude for fliers (eagles return here after a swoop) */
  homeY?: number;
  /** predator AI: current move (patrol, alert, windup, leap, strike, bite, recover) and seconds spent in it */
  state?: string;
  stateT?: number;
  /** predator AI: world y of the enemy's own origin while standing (leaps and lunges return to it) */
  groundY?: number;
  /** predator AI: where it started this move, and where it is going */
  fromX?: number;
  toX?: number;
  /** predator AI: normal patrol speed (px/s), so a dash or leap can end by restoring it */
  speed?: number;
  /** drawing only: true world position when the draw call is made in a translated frame (boss props) */
  wx?: number;
  wy?: number;
  /** drawing only: separates a boss's rig from a regular enemy with the same id */
  rigKey?: string;
  /** drawing only: the draw call is scaled up by this much (bosses), so the rig can keep feet planted on screen */
  rigScale?: number;
  /** drawing only: extra art drawn in the head's own frame (crowns, horns) so it follows the head */
  headDeco?: (ctx: CanvasRenderingContext2D) => void;
}

export interface BossEntity extends Enemy {
  phase: number;
  phaseMax: number;
  specialAttackTimer: number;
  shieldActive: boolean;
  dialogueIntro: string;
  dialogueDefeat: string;
  /** the move-by-move brain (bossAI.ts) */
  ai?: import('./bossAI.ts').BossBrain;
}

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'fragile' | 'bouncy' | 'moving' | 'drift';
  fragileTimer?: number;
  broken?: boolean;
  moveRange?: number;
  moveSpeed?: number;
  baseX?: number;
  swayOffset?: number;
  /** 'drift' platforms: a log carried across a river (see river.ts) */
  drift?: import('./river.ts').DriftInfo;
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
  type: 'fruit' | 'flower' | 'leaf' | 'relic' | 'cage' | 'heart' | 'super_heart' | 'powerup_speed' | 'powerup_invincible' | 'powerup_magnet' | 'exit_totem' | 'thorn_gate';
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
  /** which way a touch kick was flicked (-1 left, 1 right, 0 = no preference) */
  kickDir: number;
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

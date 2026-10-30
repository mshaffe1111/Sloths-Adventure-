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
  /** the scene halfway through a world: Dot and a note from Meeca (once) */
  | 'world_mid'
  /** the scene at the guardian's door after a world's ninth stage (World 10: the fortress gate, once) */
  | 'world_gate'
  /** a short scene after the ending (the stopwatch, if it was found) */
  | 'ending_tag'
  | 'boss_defeat'
  | 'ending_story'
  /** a remembered scene (a flashback between worlds, or one replayed from the Library) */
  | 'memory';

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
  | 'turtle'       // Snapping turtle (World 2's river snappers): hides in its shell from the front, kick the shell to send it sliding
  | 'jaguar'       // Jaguar: crouch, leap, land (the big sloth predator)
  | 'boa'          // Boa constrictor: coiled ambusher with a long strike
  | 'caiman'       // Spectacled caiman: slow armoured lunger
  | 'tayra'        // Tayra: fast low dasher
  | 'harpy'        // Night Harpy: crouches, slides, then leaps and stomps (the ground shakes)
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
  /** standing still right at the end of a ledge, facing out over it this way (1 its right end, -1 its left; engine.ts edgeOffset) */
  teeter?: -1 | 0 | 1;
  /** where he is drawn, px from where he stands: a step back from a ledge's end while he stands at it (engine.ts edgeOffset) */
  drawDx?: number;
  /** leaning into a log that moves (the push clip, heroClips.ts) */
  pushing?: boolean;
  /** game time he reached the exit, while the cheer plays before the stage clears (heroClips.ts) */
  cheerAt?: number;
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
  /** hanging from a rope (shimmy) */
  hanging?: boolean;
  /** swimming in calm water (swim.ts): the water's top, how far under he has dived (0..1), and seconds into his first swim's moment */
  swim?: { surfaceY: number; under: number; first?: number };
  /** how far the rope is drawn giving under him at his hands (world units, for the drawing only: ropeArt.ts ropeDip, heroRope.ts) */
  hangDip?: number;
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
  /** fight: which move is playing (jab, cross, hook, mega, kick, airKick) and how far through it (0..1), for the drawing */
  attackMove?: string;
  attackU?: number;
  /** fight: how far the claw or foot is pulled back (0..1) and thrust out (0..1) right now, for the drawing */
  swingCock?: number;
  swingReach?: number;
  /** falling with down held: a stomp dive (for the drawing only) */
  diving?: boolean;
  /** a bounce off an animal's head or a mushroom: which kind, and seconds since (for the drawing only) */
  bounce?: { kind: 'stomp' | 'big' | 'spring'; t: number };
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
  /** how wide its drawing is, when that is wider than its body (World 5's jumping spider, legs out): a strike can land across it */
  hitW?: number;
  /** landing on it from above beats it, though its kind cannot be stomped elsewhere (World 5's jumping spider on the ground) */
  stompable?: boolean;
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
  /** a snake that starts asleep (protoStage.ts 1-3): it lies still until Pokey comes close, so the first one is a free punch */
  asleep?: boolean;
  /** seconds left of the drowsy moment just after it woke (the waking head shows) */
  wakeT?: number;
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
  /** the harpy's dive in progress (see harpyDive.ts) */
  dive?: import('./harpyDive.ts').DiveState;
  /** cruising altitude for fliers (eagles return here after a swoop) */
  homeY?: number;
  /** predator AI: current move (patrol, alert, windup, leap, strike, bite, recover) and seconds spent in it */
  state?: string;
  stateT?: number;
  /** predator AI: world y of the enemy's own origin while standing (leaps and lunges return to it) */
  groundY?: number;
  /** a river snapper's shell, kicked: which way it slides (predatorAI.ts) */
  slideDir?: 1 | -1;
  /** 2-9: a snapper of the river king's guard: stands upright with a spear, jabs further, blocks a blow to the front instead of hiding,
   *  and is staggered back by a kick (it shares the snapper's brain, predatorAI.ts) */
  royal?: boolean;
  /** drawn as another creature than its kind: World 7's Stone Sentry and World 10's soldier fight as a prowler (an ocelot's brain, score
   *  and checks) and only look like a sentry (sentrySprite.ts) or the General's soldier (soldierSprite.ts) */
  look?: 'sentry' | 'soldier';
  /** a snapper listening to the puzzle kit's noise (noise.ts): where the noise is; it walks there along its ground and notices nobody */
  lureX?: number;
  /** predator AI: where it started this move, and where it is going */
  fromX?: number;
  toX?: number;
  /** predator AI: normal patrol speed (px/s), so a dash or leap can end by restoring it */
  speed?: number;
  /** enemy brain: seconds it stays locked on to the player (> 0 = it has noticed him and is hunting) */
  alertT?: number;
  /** enemy brain: how far it may run while hunting (a hunter can chase past its patrol patch, but never off the ground) */
  huntMinX?: number;
  huntMaxX?: number;
  /** enemy brain: the hard edges of the ground it stands on; it can never be placed past them */
  edgeMinX?: number;
  edgeMaxX?: number;
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
  /** World 7 ruin tiles: seconds the tile holds once stepped on (instead of the usual 1.1) */
  crumbleAfter?: number;
  /** a boss ledge that starts cracking (becomes fragile) from this phase of the fight */
  crackFrom?: number;
  broken?: boolean;
  /** a broken crumbling platform grows back at this game time (engine.ts), so nothing that breaks can ever be needed to finish */
  regrowAt?: number;
  moveRange?: number;
  moveSpeed?: number;
  baseX?: number;
  swayOffset?: number;
  /** 'drift' platforms: a log carried across a river (see river.ts) */
  drift?: import('./river.ts').DriftInfo;
  style?: 'branch' | 'log' | 'moss_stone' | 'ruin' | 'canopy_bridge';
  /** a hollow log Pokey pushes by walking into it (protoStage.ts): it slides between these x bounds */
  push?: { min: number; max: number };
  /** a section of 1-8's long branch: it falls when the collapse passes (chase.ts), drawn from Matt's long-branch sheet; `chaseTip`: the end */
  chase?: boolean;
  chaseTip?: boolean;
  /** a tree's crown to stand on, high in the canopy (Matt's crown painting: the end of 1-8) */
  crown?: boolean;
  /** World 2: a cluster of lily pads floating on still water (painted from Matt's river sheet, riverArt.ts) */
  lily?: boolean;
  /** World 2's rope-and-basket lift (a 'moving' platform that rides up and down: lift.ts) */
  lift?: import('./lift.ts').LiftInfo;
  /** drawn by a painted piece instead of the platform look: the lift's basket, a step of the carved steps, a porch deck (riverArt.ts), World 4's fern bridge, a pushed boulder and a pool's floating log (w4Play.ts), and World 4's little mossy rocks to hop (`rock`, protoArt drawRockArt), the mailbox post at a porch's dead end in 2-6 (`post`, a knot: `lip`), and 6-8's ledges in World 6's pieces (`stilt`, w6StiltArt.ts) */
  art?: 'lift' | 'steps' | 'porch' | 'frond' | 'boulder' | 'poolLog' | 'orchid' | 'kit' | 'rock' | 'post' | 'stilt' | 'hidden';
  /** one of the Sky Sovereign's rock pillars in 4-10 (sovereignFight.ts): its index. It is a wall with a top to stand on; it cracks, and broken it is a stump */
  pillar?: number;
  /** a knot of wood standing at the end of a high branch (4-6; a mailbox post on 2-6's porches): a little wall, so he cannot walk off it
   *  into a very long fall */
  lip?: boolean;
  /** a small piece of the ground under 90 tall (a soft pit's low step, or its walls under the banks): painted as the soil like a bank, or
   *  (a wall under a bank) left to that bank's soil, never drawn as a platform (protoArt.ts drawProtoScene, terrain.ts) */
  soil?: boolean;
}

/**
 * One of the two routes through a two-lane fork (see `chunkFork` in stageGenerator.ts). A fork has a shared platform where it splits, a HIGH lane
 * (branches, pillars, a swing: quick, risky, few flowers and one special reward) and a LOW lane (ground, trench, a hollow: safe, usually longer, animals
 * on patrol, many flowers), and a shared platform where the two meet again. Reversed forks swap the roles: the low lane is a quick hollow and the high lane the long way round.
 */
export interface LaneRoute {
  /** what the lane is made of; it sets how fast it can be travelled and how the lane looks */
  terrain: 'canopy' | 'swing' | 'pillars' | 'trench' | 'hollow';
  /** everything that belongs to this lane and no other: the platforms, vines and ropes of it, and the animals that patrol it */
  platforms: number[];
  vines: number[];
  ropes: number[];
  enemies: number[];
  /** pickups that lie on this lane (flowers and leaves) */
  flowers: number[];
  /** jumps between the lane's own platforms, stair steps on it, and the path walked beyond the straight span (a trench is walked down and back up) */
  hops: number;
  steps: number;
  extraPx: number;
  /** the height of the lane's walking surface where it leaves the shared split platform (px above the split platform's top; negative = below) */
  entryRise: number;
}

export interface LaneFork {
  id: number;
  /** where the lanes part (the right end of the shared split platform) and where they meet (the left end of the shared join platform) */
  x0: number;
  x1: number;
  /** the tops of the shared platforms at each end */
  splitY: number;
  joinY: number;
  /** false: the high lane is the quick one. true: the low lane is a hollow shortcut and the high lane the scenic long way */
  reversed: boolean;
  high: LaneRoute;
  low: LaneRoute;
  /** the one special reward on the high lane (a heart or a power-up) and the bigger cluster of flowers that goes with it */
  reward: { x: number; y: number } | null;
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
  /** where its swing has it now (radians; the engine sets it every frame from the vines' clock: physics.ts vineAngle) */
  swingAngle?: number;
  /** its own swing (physics.ts, the self-swing): radians either side (0 hangs still), seconds there and back, share of a period at clock 0 */
  swingAmp?: number;
  swingPeriod?: number;
  swingPhase?: number;
  /** a climbing vine hanging down a cliff (4-8's knotted vines), not a tree's trunk: its stage draws it (w4Play.ts), not the kapok art */
  rope?: boolean;
  /** a silk line in World 5 (w5Kit.ts silkLine): it swings like a liana and is drawn as shining silk (terrain.ts) */
  silk?: boolean;
  /**
   * a puzzle piece's climb (puzzleKit.ts: a sapling, a silk line, a vine ladder): the kit draws it and says what climbing it does, and
   * the level check leaves it out (a room's own check puts it in when it is there: puzzleCheck.ts)
   */
  kit?: boolean;
  /** not there now (a ladder still rolled up, a sapling bent over): it cannot be grabbed */
  off?: boolean;
  /** how a swinging liana is drawn where the world has more than one look (World 10: 'chain', 'banner', 'cage', 'rope', w10SwingArt.ts) */
  hangLook?: string;
}

/** A rope stretched across a gap. Pokey can hang from it and shimmy along it once he has learned the skill (see rope.ts). */
export interface Rope {
  id: number;
  /** the two ends (x), and the rope's height (y) at its ends */
  x0: number;
  x1: number;
  y: number;
  /** the ground height under each end (the ledges the rope joins) */
  g0: number;
  g1: number;
  /** true when the stage cannot be finished without it (only ever in stages where everyone has the skill) */
  required: boolean;
}

export interface Collectible {
  id: number;
  type: 'fruit' | 'flower' | 'leaf' | 'relic' | 'cage' | 'heart' | 'super_heart' | 'powerup_speed' | 'powerup_invincible' | 'powerup_magnet' | 'exit_totem' | 'thorn_gate' | 'find' | 'seed';
  botanicalVariant?: 'orchid' | 'hibiscus' | 'monstera' | 'fern' | 'lotus' | 'cheetah_flower' | 'solar_bloom' | 'nectar_spore';
  x: number;
  y: number;
  collected: boolean;
  bobPhase: number;
  cageHp?: number;
  isLocked?: boolean;
  /** the sanctuary door, sealed, with the new HUD (beta): how many of the goal are still missing (the door shows it) */
  missing?: number;
  /** a story find (note, book or keepsake): which one (see finds.ts) */
  findId?: string;
  /** World 3: one of Grandma's things hidden in a fern (a relic with `hidden`): what it is, for the words when it turns up */
  thing?: string;
  /** a hidden find sits in a Hush Fern and is found by crouching beside it; otherwise it is a Keeper's Bell flower you just touch */
  hidden?: boolean;
  /** how far the search has got, 0..1 (hidden finds) */
  search?: number;
  /** a Hush Fern: he is walking by it now, and how many times he has walked past it (Dot's "Hmm, that fern...", DOT-14) */
  fernBy?: boolean;
  fernPasses?: number;
  /** Pokey stands close but is not crouching: draws the hint */
  near?: boolean;
  /**
   * 3-7's "Which fern?" (a hidden relic among ferns that look and rustle alike): no "hold down" over it when he is beside it, so the
   * carved stones in the mushroom's light are what tell the right fern, not walking past it
   */
  riddle?: boolean;
  /**
   * World 2's reed cages: the little one inside (Matt's sheet: a baby capybara, duckling or otter), and when it was freed (game time).
   * 'eaglet': World 4's nests on the cliff (4-8), a chick caught in old netting (w4Nests.ts draws it)
   */
  critter?: 'capy' | 'duck' | 'otter' | 'eaglet';
  freedAt?: number;
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
  /**
   * puff: a frame of the painted dust strip (size = its width); flash: the painted hit spark with a brief glow (size = its width);
   * leaf: a painted leaf (green, or warm when `color` is 'warm'); grit: a painted chip of stone (multiplied by `color` unless it is
   * ''); water: a puff of painted spray; splash: the painted splash crown (size = its width); feather: the painted feather; star: a
   * small four-pointed sparkle (the one code-drawn touch)
   */
  type: 'leaf' | 'star' | 'water' | 'feather' | 'puff' | 'flash' | 'grit' | 'splash';
  /** 0..1, fixed for the particle's life: which painted piece, which way it spins */
  seed?: number;
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
  /**
   * which way the touch flick behind this jump press leaned (-1 left, 1 right), when it leaned 20 degrees or more off straight up
   * (touchGestures.ts); 0 or unset for a straight-up flick, a key or the pad. Letting go of a vine or a trunk leaps that way.
   */
  jumpLean?: -1 | 0 | 1;
  /** … and leaned 35 degrees or more, this way: a standing jump carries him that way (touchGestures.ts slantOf, CT-27) */
  jumpSlant?: -1 | 0 | 1;
  jumpHeld: boolean;
  punchPressed: boolean;
  /** take back a punch pressed a moment ago, if its swing has not struck yet (a touch jab the finger outran, CT-17) */
  punchCancel?: boolean;
  /** … and the punch just pressed may be taken back for this long (s): its swing waits in its wind-up until then */
  punchHold?: number;
  kickPressed: boolean;
  /** which way a touch kick was flicked (-1 left, 1 right, 0 = no preference) */
  kickDir: number;
  megaPunchPressed: boolean;
  layerSwitchPressed: boolean;
  touchJoystickAngle: number | null; // 0..360 deg or null
  touchJoystickMagnitude: number;    // 0..1
  /**
   * a thumb held still on the glass (TouchController.tsx), the hold key (L or Shift), the Pad's punch button or a pad's bumper held down:
   * Meeca's stage carves while it is held (meecaPlay.ts). Unset = not held.
   */
  hold?: boolean;
  /** how far a finger has traced round a circle since the engine last took it (radians: Meeca carves with it, circleTrace.ts) */
  circle?: number;
}

export interface MissionProgress {
  currentCount: number;
  targetCount: number;
  isComplete: boolean;
  elapsedTime: number;
  score: number;
}

import type {
  LevelConfig,
  PlayerState,
  Enemy,
  BossEntity,
  Collectible,
  Platform,
  Vine,
  Camera,
  Particle,
  FloatingText,
} from './types.ts';
import { WORLDS_DATA } from './worldsData.ts';
import { generateStage, GeneratedStage } from './stageGenerator.ts';
import { backgroundEngine } from './backgroundEngine.ts';
import {
  drawHeroSloth,
  drawTreeSnake,
  drawHarpyEagle,
  drawOcelot,
  drawHazardEntity,
  drawBossEntity,
  drawGirlfriendDaisy,
  drawCollectible,
} from './vectorArt.ts';
import {
  checkAABBCollision,
  distance2D,
  isObjectiveComplete,
  calculateLevelStars,
  calculateHitScore,
} from './rules.ts';
import { InputEngine } from './inputEngine.ts';
import { sound } from './audio.ts';

export interface GameEngineCallbacks {
  onProgressUpdate: (current: number, target: number, score: number, hp: number, distanceRatio?: number) => void;
  onVictory: (stars: number, timeSec: number, score: number) => void;
  onDefeat: (score: number) => void;
  onBossEncounter?: (boss: BossEntity) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputEngine;
  private callbacks: GameEngineCallbacks;

  private currentStage: GeneratedStage;
  private player: PlayerState;
  private platforms: Platform[];
  private vines: Vine[];
  private enemies: Enemy[];
  private boss: BossEntity | null;
  private collectibles: Collectible[];

  private camera: Camera;
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private lastRenderTime: number = 0;
  private readonly targetFps: number = 30;
  private readonly frameIntervalMs: number = 1000 / 30; // 33.33ms fixed 30 FPS

  private hitstopTimer: number = 0;
  private gameTime: number = 0;
  private runScore: number = 0;
  private comboCount: number = 0;
  private comboResetTimer: number = 0;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  private exitTotemReached: boolean = false;
  private daisyRescued: boolean = false;
  private isGameOver: boolean = false;
  private nearTreeVine: Vine | null = null;
  private nearSwingVine: Vine | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    config: LevelConfig,
    input: InputEngine,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get Canvas2D context');
    this.ctx = ctx;
    this.input = input;
    this.callbacks = callbacks;

    // Generate Stage data
    this.currentStage = generateStage(config);
    this.platforms = this.currentStage.platforms;
    this.vines = this.currentStage.vines;
    this.enemies = this.currentStage.enemies;
    this.boss = this.currentStage.boss;
    this.collectibles = this.currentStage.collectibles;

    // Initialize Hero Sloth
    this.player = {
      x: this.currentStage.spawnX,
      y: this.currentStage.spawnY,
      vx: 0,
      vy: 0,
      width: 44,
      height: 48,
      facing: 1,
      grounded: true,
      climbing: false,
      ducking: false,
      punching: false,
      punchTimer: 0,
      punchType: 'normal',
      kicking: false,
      kickTimer: 0,
      attackType: 'none',
      jumpsLeft: 2,
      isDoubleJumping: false,
      somersaultAngle: 0,
      megaCharge: 1.0,
      hp: 5,
      maxHp: 5,
      fruitsCollected: 0,
      relicsFound: 0,
      crittersRescued: 0,
      enemiesDefeated: 0,
      invincibleTimer: 0,
      walkCycle: 0,
      squashX: 1,
      squashY: 1,
      targetScaleX: 1,
      targetScaleY: 1,
    };

    // Initialize Camera
    this.camera = {
      x: Math.max(0, this.player.x - 300),
      y: Math.max(0, this.player.y - 300),
      targetX: this.player.x - 300,
      targetY: this.player.y - 300,
      zoom: 1.0,
      targetZoom: 1.0,
      trauma: 0,
      viewportWidth: canvas.width,
      viewportHeight: canvas.height,
    };

    this.resizeCanvas();
    window.addEventListener('resize', this.handleResize);

    sound.startAmbient();
  }

  private handleResize = () => {
    this.resizeCanvas();
  };

  public resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.camera.viewportWidth = w;
    this.camera.viewportHeight = h;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    sound.stopAmbient();
  }

  private loop = (now: number) => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    // 30 FPS Cap: Throttle loop to 30 frames per second to eliminate flicker
    const elapsed = now - this.lastRenderTime;
    if (elapsed < this.frameIntervalMs) {
      return;
    }
    this.lastRenderTime = now - (elapsed % this.frameIntervalMs);

    const dt = Math.min(elapsed / 1000, 0.05); // reliable fixed dt

    if (!this.isPaused) {
      // Hitstop freeze handling
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
        // Keep camera trauma shake ticking
        this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.5);
      } else {
        this.update(dt);
      }
    }

    this.render();
  };

  /**
   * Main Physics & Simulation Tick (30 FPS)
   */
  private update(dt: number) {
    this.gameTime += dt;
    this.input.update(dt);

    const p = this.player;

    // --- Invincibility Timer ---
    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
    }

    // --- Combo Reset Timer ---
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // --- Camera Trauma Shake Decay ---
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.2);

    // --- Squash & Stretch Restoration ---
    p.squashX += (p.targetScaleX - p.squashX) * Math.min(1, dt * 14);
    p.squashY += (p.targetScaleY - p.squashY) * Math.min(1, dt * 14);

    // --- Dynamic Rainforest Tree Climbing & Vine Swinging Mechanics ---
    let nearTreeVine: Vine | null = null;
    let nearSwingVine: Vine | null = null;

    for (const v of this.vines) {
      if (v.vineType === 'tree_climb') {
        if (Math.abs(p.x - v.x) < 42 && p.y >= v.topY - 10 && p.y <= v.bottomY + 25) {
          nearTreeVine = v;
          break;
        }
      } else {
        if (Math.abs(p.x - v.x) < 46 && p.y >= v.topY - 15 && p.y <= v.bottomY + 25) {
          nearSwingVine = v;
          break;
        }
      }
    }
    this.nearTreeVine = nearTreeVine;
    this.nearSwingVine = nearSwingVine;

    // 1. TREE CLIMBING LOGIC (Vertical vines on tree trunks)
    if (nearTreeVine && (p.climbing || this.input.state.up || (!p.grounded && this.input.state.down))) {
      p.climbing = true;
      p.isVineSwinging = false;
      p.grounded = false;
      p.vx = 0;
      p.vy = 0;
      p.x = nearTreeVine.x; // snap smoothly to tree trunk vine

      // Climb Up / Down
      if (this.input.state.up) {
        p.y = Math.max(nearTreeVine.topY, p.y - 210 * dt);
      } else if (this.input.state.down) {
        p.y = Math.min(nearTreeVine.bottomY, p.y + 210 * dt);
      }

      // Jump off tree trunk!
      if (this.input.state.jumpPressed) {
        p.climbing = false;
        this.input.state.jumpPressed = false;
        p.vy = -500;
        const jumpDir = this.input.state.left ? -1 : this.input.state.right ? 1 : p.facing;
        p.facing = jumpDir as 1 | -1;
        p.vx = jumpDir * 280;
        p.jumpsLeft = 1;
        p.isDoubleJumping = false;
        p.squashX = 0.8;
        p.squashY = 1.3;
        sound.playJump();
        this.addFloatingText('TREE LEAP!', p.x, p.y - 45, '#4ade80');
      } else if ((this.input.state.left && p.facing === 1) || (this.input.state.right && p.facing === -1)) {
        // Disengage if steering away from tree
        p.climbing = false;
        p.vx = (this.input.state.left ? -1 : 1) * 200;
      }
    } else {
      if (p.climbing && !nearTreeVine) {
        p.climbing = false;
      }

      // 2. SWINGING LIANA LOGIC (Chasms & ravines)
      if (
        nearSwingVine &&
        !p.isVineSwinging &&
        !p.grounded &&
        (this.input.state.up || Math.abs(p.vx) > 25 || this.input.state.left || this.input.state.right)
      ) {
        p.isVineSwinging = true;
        p.climbing = false;
        p.swingVineId = nearSwingVine.id;
        p.swingLength = Math.max(80, Math.min(nearSwingVine.bottomY - nearSwingVine.topY - 10, p.y - nearSwingVine.topY));
        p.swingAngle = Math.max(-0.65, Math.min(0.65, p.vx / 300));
        p.swingAngularVelocity = p.vx / p.swingLength;
        p.jumpsLeft = 2;
        p.isDoubleJumping = false;
        p.somersaultAngle = 0;
      }

      if (p.isVineSwinging && nearSwingVine) {
        p.grounded = false;
        p.somersaultAngle = 0;
        p.jumpsLeft = 2;

        const g = 1600;
        const angularAcc = (-g / Math.max(50, p.swingLength || 100)) * Math.sin(p.swingAngle || 0);
        p.swingAngularVelocity = (p.swingAngularVelocity || 0) + angularAcc * dt;

        if (this.input.state.right) {
          p.swingAngularVelocity += 4.5 * dt;
          p.facing = 1;
        }
        if (this.input.state.left) {
          p.swingAngularVelocity -= 4.5 * dt;
          p.facing = -1;
        }

        p.swingAngularVelocity *= 0.993;
        p.swingAngle = (p.swingAngle || 0) + p.swingAngularVelocity * dt;
        p.swingAngle = Math.max(-1.18, Math.min(1.18, p.swingAngle));

        if (this.input.state.up) {
          p.swingLength = Math.max(60, (p.swingLength || 100) - 140 * dt);
        } else if (this.input.state.down) {
          p.swingLength = Math.min(nearSwingVine.bottomY - nearSwingVine.topY, (p.swingLength || 100) + 140 * dt);
        }

        const vineLen = p.swingLength || 100;
        p.x = nearSwingVine.x + Math.sin(p.swingAngle) * vineLen;
        p.y = nearSwingVine.topY + Math.cos(p.swingAngle) * vineLen;
        nearSwingVine.swingAngle = p.swingAngle;
        nearSwingVine.isSwingingVine = true;

        const tangSpeed = p.swingAngularVelocity * vineLen;
        p.vx = Math.cos(p.swingAngle) * tangSpeed;
        p.vy = -Math.sin(p.swingAngle) * tangSpeed;

        if (this.input.state.jumpPressed) {
          p.isVineSwinging = false;
          nearSwingVine.isSwingingVine = false;
          this.input.state.jumpPressed = false;

          const releaseDir = Math.sin(p.swingAngle) > 0.05 ? 1 : Math.sin(p.swingAngle) < -0.05 ? -1 : p.facing;
          p.facing = releaseDir as 1 | -1;
          p.vx = releaseDir * Math.max(300, Math.abs(p.vx) * 1.35 + 100);
          p.vy = Math.min(-400, p.vy - 350);
          p.jumpsLeft = 1;
          p.isDoubleJumping = false;
          p.somersaultAngle = 0;
          p.squashX = 0.72;
          p.squashY = 1.38;

          sound.playJump();
          this.spawnSparkBurst(p.x, p.y, '#34d399');
          this.addFloatingText('TARZAN SWING!', p.x, p.y - 45, '#34d399');
        }
      } else {
        if (p.isVineSwinging) {
          p.isVineSwinging = false;
        }

        // --- Standard Ground / Aerial Movement ---
        if (this.input.state.down && p.grounded) {
          p.ducking = true;
          p.vx *= Math.pow(0.001, dt);
        } else {
          p.ducking = false;

          const moveAcc = p.grounded ? 1500 : 1150;
          const maxSpeed = 275;
          if (this.input.state.left) {
            p.vx -= moveAcc * dt;
            p.facing = -1;
            if (p.vx < -maxSpeed) p.vx = -maxSpeed;
          } else if (this.input.state.right) {
            p.vx += moveAcc * dt;
            p.facing = 1;
            if (p.vx > maxSpeed) p.vx = maxSpeed;
          } else {
            const friction = p.grounded ? 0.001 : 0.35;
            p.vx *= Math.pow(friction, dt);
            if (Math.abs(p.vx) < 5) p.vx = 0;
          }
        }

        if (p.grounded) {
          this.coyoteTimer = 0.22;
        } else {
          this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        }

        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer -= dt;
        }

        if (this.input.state.jumpPressed) {
          if (p.grounded || this.coyoteTimer > 0) {
            p.vy = -520;
            p.grounded = false;
            p.jumpsLeft = 1;
            p.isDoubleJumping = false;
            p.somersaultAngle = 0;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            this.input.state.jumpPressed = false;
            p.squashX = 0.82;
            p.squashY = 1.28;
            sound.playJump();
            this.spawnJumpDust(p.x, p.y);
          } else if (p.jumpsLeft > 0 && !p.climbing) {
            p.vy = -490;
            p.jumpsLeft = 0;
            p.isDoubleJumping = true;
            p.somersaultAngle = 0;
            this.jumpBufferTimer = 0;
            this.input.state.jumpPressed = false;
            p.squashX = 0.80;
            p.squashY = 1.32;
            sound.playDoubleJump();
            this.addFloatingText('DOUBLE JUMP!', p.x, p.y - 40, '#4ade80');
            this.spawnDoubleJumpBurst(p.x, p.y);
          } else {
            this.jumpBufferTimer = 0.18;
            this.input.state.jumpPressed = false;
          }
        }

        if (p.isDoubleJumping) {
          p.somersaultAngle += p.facing * dt * 14;
        }

        if (!this.input.state.jumpHeld && p.vy < -280) {
          p.vy = -280;
        }

        // Gravity only when NOT climbing!
        const gravity = 900;
        p.vy += gravity * dt;
        if (p.vy > 800) p.vy = 800;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }

      // Walk cycle animation
      if (p.grounded && Math.abs(p.vx) > 10) {
        p.walkCycle += Math.abs(p.vx) * dt * 0.08;
      }

      // Clamp horizontal level bounds (safely stops player right at the victory shrine altar)
      const maxX = this.currentStage.exitTotemX > 0
        ? this.currentStage.exitTotemX + 35
        : this.currentStage.config.levelWidth - 20;
      p.x = Math.max(20, Math.min(maxX, p.x));

      // --- Platform Collisions (with generous edge forgiveness) ---
      p.grounded = false;
      const playerFeet = p.y;
      const playerPrevFeet = p.y - p.vy * dt;

      for (const plat of this.platforms) {
        if (plat.broken) continue;

        // Check if player is horizontally within platform (generous width tolerance)
        if (p.x + p.width * 0.48 > plat.x && p.x - p.width * 0.48 < plat.x + plat.width) {
          // Check landing from above
          if (p.vy >= 0 && playerPrevFeet <= plat.y + 14 && playerFeet >= plat.y) {
            p.y = plat.y;
            p.vy = 0;
            p.grounded = true;
            p.jumpsLeft = 2; // Restore double jump capability on landing
            p.isDoubleJumping = false;
            p.somersaultAngle = 0;

            // Jump Buffering: If jump was tapped just before landing, instantly jump!
            if (this.jumpBufferTimer > 0) {
              this.jumpBufferTimer = 0;
              p.vy = -520;
              p.grounded = false;
              p.jumpsLeft = 1;
              p.squashX = 0.82;
              p.squashY = 1.28;
              sound.playJump();
              this.spawnJumpDust(p.x, p.y);
              break;
            }

            // Squash on landing
            if (p.squashY > 0.9) {
              p.squashX = 1.18;
              p.squashY = 0.82;
            }

            // Bouncy mushroom interaction
            if (plat.type === 'bouncy') {
              p.vy = -720;
              p.grounded = false;
              p.jumpsLeft = 1;
              p.isDoubleJumping = false;
              p.squashX = 0.78;
              p.squashY = 1.38;
              sound.playJump();
              this.addFloatingText('BOING!', p.x, p.y - 40, '#facc15');
              this.spawnSparkBurst(p.x, p.y, '#facc15');
            }

            // Fragile branch interaction
            if (plat.type === 'fragile') {
              if (plat.fragileTimer === undefined) {
                plat.fragileTimer = 1.1; // generous 1.1s before breaking
              }
            }
            break;
          }
        }
      }

      // Fall off bottom check (forgiving recovery: 1 damage and safe respawn)
      if (p.y > this.currentStage.config.levelHeight + 120) {
        this.damagePlayer(1);
        p.x = Math.max(100, p.x - 200);
        p.y = 350;
        p.vy = 0;
        p.jumpsLeft = 2;
      }

    // --- Fragile Platform Decay ---
    for (const plat of this.platforms) {
      if (plat.type === 'fragile' && plat.fragileTimer !== undefined && plat.fragileTimer > 0) {
        plat.fragileTimer -= dt;
        if (plat.fragileTimer <= 0) {
          plat.broken = true;
          this.spawnDebrisBurst(plat.x + plat.width * 0.5, plat.y, '#a16207');
          sound.playHitImpact(true);
        }
      }
    }

    // --- Claw Punch & Mega Punch Execution (Tap to Punch!) ---
    if ((this.input.state.punchPressed || this.input.state.megaPunchPressed) && !p.punching && !p.kicking) {
      const isMega = this.input.state.megaPunchPressed;
      p.punching = true;
      p.attackType = isMega ? 'mega' : 'punch';
      p.punchType = isMega ? 'mega' : 'normal';
      p.punchTimer = isMega ? 0.35 : 0.22;
      this.input.state.punchPressed = false;
      this.input.state.megaPunchPressed = false;

      if (isMega) {
        sound.playMegaPunch();
        this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.4);
        this.addFloatingText('MEGA PUNCH!', p.x, p.y - 50, '#fde047');
      } else {
        sound.playPunch();
      }

      this.executePunchHitbox(isMega);
    }

    if (p.punching) {
      p.punchTimer -= dt;
      if (p.punchTimer <= 0) {
        p.punching = false;
        if (p.attackType === 'punch' || p.attackType === 'mega') p.attackType = 'none';
      }
    }

    // --- Kung-Fu Dropkick Execution (Double Tap to Kick!) ---
    if (this.input.state.kickPressed && !p.kicking && !p.punching) {
      p.kicking = true;
      p.attackType = 'kick';
      p.kickTimer = 0.28;
      this.input.state.kickPressed = false;

      sound.playKick();
      this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.25);
      this.addFloatingText('KICK!', p.x, p.y - 48, '#fb923c');
      this.executeKickHitbox();
    }

    if (p.kicking) {
      p.kickTimer -= dt;
      if (p.kickTimer <= 0) {
        p.kicking = false;
        if (p.attackType === 'kick') p.attackType = 'none';
      }
    }

    // --- Enemy Behavior & AI ---
    for (const e of this.enemies) {
      if (e.defeated) {
        e.koTimer += dt;
        continue;
      }

      if (e.hitFlashTimer > 0) e.hitFlashTimer -= dt;

      // Distinct enemy movement & attack policies:
      if (e.type === 'snake') {
        // Snake patrols branch, lunges when Sloth is near
        e.x += e.vx * dt;
        if (e.x < e.patrolMinX || e.x > e.patrolMaxX) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 1 : -1;
        }

        const distToPlayer = distance2D(e.x, e.y, p.x, p.y);
        if (distToPlayer < 120 && Math.abs(e.y - p.y) < 30) {
          e.telegraphTimer = 0.4;
          e.isAttacking = true;
        } else {
          e.isAttacking = false;
          e.telegraphTimer = 0;
        }

        // Contact damage with player
        if (!isObjectiveComplete(this.currentStage.config.objectiveType, 0, 0, false, false)) {
          if (checkAABBCollision(p.x - 18, p.y - 40, 36, 40, e.x - 18, e.y - 12, 36, 22)) {
            this.damagePlayer(1);
          }
        }
      } else if (e.type === 'eagle') {
        // Harpy Eagle aerial trajectory & swoop attack cycle (fair, telegraphed, and easy to hit!)
        e.behaviorTimer += dt;
        if (!e.swoopPhase) e.swoopPhase = 'patrol';

        if (e.swoopPhase === 'patrol') {
          // Aerial patrol
          e.x += e.vx * dt;
          if (e.x < e.patrolMinX || e.x > e.patrolMaxX) {
            e.vx = -e.vx;
            e.facing = e.vx > 0 ? 1 : -1;
          }

          // Spot player and initiate telegraphed swoop warning
          if (Math.abs(e.x - p.x) < 260) {
            e.swoopPhase = 'telegraph';
            e.telegraphTimer = 0.8; // 0.8s clear visual/sound telegraph!
            sound.playEagleScreech();
            this.addFloatingText('!', e.x, e.y - 30, '#f59e0b');
          }
        } else if (e.swoopPhase === 'telegraph') {
          // Warning windup: eagle slows and flares wings
          e.telegraphTimer -= dt;
          e.facing = p.x > e.x ? 1 : -1;
          if (e.telegraphTimer <= 0) {
            e.swoopPhase = 'swoop';
            e.isAttacking = true;
          }
        } else if (e.swoopPhase === 'swoop') {
          // Swoop down at gentle readable speed (165 px/s)
          const diveSpeed = 165;
          const targetY = Math.min(500, p.y - 10);
          const dx = p.x - e.x;
          const dy = targetY - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 15) {
            e.x += (dx / dist) * diveSpeed * dt;
            e.y += (dy / dist) * diveSpeed * dt;
          }

          // Check collision with player
          if (checkAABBCollision(p.x - 18, p.y - 40, 36, 40, e.x - 24, e.y - 18, 48, 36)) {
            if (p.ducking) {
              // Successfully ducked under swoop!
              this.addFloatingText('DUCKED! SLICK!', p.x, p.y - 40, '#86efac');
              sound.playWhoosh();
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.4;
              e.isAttacking = false;
            } else if (!p.punching && !p.kicking) {
              this.damagePlayer(1);
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.0;
              e.isAttacking = false;
            }
          }

          // Reached swoop low point: enter vulnerable low hover glide!
          if (e.y >= targetY - 15 || dist <= 20) {
            e.swoopPhase = 'hover';
            e.hoverTimer = 1.4; // 1.4s of vulnerable low glide!
            e.isAttacking = false;
            this.addFloatingText('VULNERABLE!', e.x, e.y - 25, '#fde047');
          }
        } else if (e.swoopPhase === 'hover') {
          // VULNERABLE LOW HOVER / GLIDE: Easy to hit!
          e.hoverTimer = (e.hoverTimer ?? 1.4) - dt;
          e.x += e.facing * 50 * dt;
          e.y += Math.sin(this.gameTime * 5) * 8 * dt;

          if (e.hoverTimer <= 0) {
            e.swoopPhase = 'ascend';
          }
        } else if (e.swoopPhase === 'ascend') {
          // Gently ascend back to sky patrol
          e.y -= 110 * dt;
          e.x += e.facing * 40 * dt;
          if (e.y <= 310) {
            e.y = 310;
            e.swoopPhase = 'patrol';
            e.attackCooldown = 4.0;
          }
        }
      } else if (e.type === 'ocelot') {
        // Ocelot ground stalker and pouncer
        e.x += e.vx * dt;
        if (e.x < e.patrolMinX || e.x > e.patrolMaxX) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 1 : -1;
        }

        const dist = Math.abs(e.x - p.x);
        if (dist < 180 && Math.abs(e.y - p.y) < 40) {
          // Pounce leap
          e.vx = e.facing * 160;
          e.y -= 20 * dt;
        }

        if (checkAABBCollision(p.x - 18, p.y - 40, 36, 40, e.x - 22, e.y - 14, 44, 28)) {
          this.damagePlayer(1);
        }
      } else if (e.type === 'frog') {
        // Poison frog hopping
        e.animTimer += dt;
        if (checkAABBCollision(p.x - 18, p.y - 40, 36, 40, e.x - 12, e.y - 10, 24, 20)) {
          this.damagePlayer(1);
        }
      }
    }

    // --- Boss AI (Stage 10 Hardcoded Boss Encounter) ---
    if (this.boss && !this.boss.defeated) {
      const b = this.boss;
      if (b.hitFlashTimer > 0) b.hitFlashTimer -= dt;

      b.behaviorTimer += dt;
      b.specialAttackTimer -= dt;

      // Boss phases based on HP
      const hpRatio = b.hp / b.maxHp;
      if (hpRatio <= 0.35 && b.phase < 3) {
        b.phase = 3; // Enrage Phase 3!
        sound.playBossRoar();
        this.camera.trauma = 0.8;
        this.addFloatingText('PHASE 3: ENRAGED!', b.x, b.y - 60, '#ef4444');
      } else if (hpRatio <= 0.7 && b.phase < 2) {
        b.phase = 2; // Phase 2
        sound.playBossRoar();
        this.camera.trauma = 0.5;
        this.addFloatingText('PHASE 2: SPEED UP!', b.x, b.y - 60, '#f97316');
      }

      // Boss movement towards player
      const bossSpeed = b.phase === 3 ? 95 : b.phase === 2 ? 65 : 45;
      b.facing = p.x < b.x ? -1 : 1;
      b.x += b.facing * bossSpeed * dt;

      // Special attack: Seismic Smash or Dash
      if (b.specialAttackTimer <= 0) {
        b.specialAttackTimer = b.phase === 3 ? 2.5 : 4.0;
        b.telegraphTimer = 0.75;
        sound.playBossRoar();
      }

      if (b.telegraphTimer > 0) {
        b.telegraphTimer -= dt;
        if (b.telegraphTimer <= 0) {
          // Smash shockwave!
          this.camera.trauma = 0.6;
          sound.playHitImpact(true);
          this.spawnDebrisBurst(b.x, b.y + 20, '#e2e8f0');

          // Ground shockwave damages player if not jumping!
          if (p.grounded && Math.abs(p.x - b.x) < 280) {
            this.damagePlayer(1);
            this.addFloatingText('SHOCKWAVE HIT!', p.x, p.y - 40, '#ef4444');
          }
        }
      }

      // Contact damage
      if (checkAABBCollision(p.x - 18, p.y - 40, 36, 40, b.x - 30, b.y - 35, 60, 70)) {
        this.damagePlayer(1);
      }
    }

    // --- Collectibles Pickup & Objectives ---
    for (const c of this.collectibles) {
      if (c.collected) continue;

      if (c.type === 'cage') {
        // Cage is freed when punched (handled in executePunchHitbox)
        continue;
      }

      if (c.type === 'exit_totem') {
        const dx = Math.abs(p.x - c.x);
        // Generous vertical tolerance covering ground floor and upper sanctuary
        if (dx < 85 && p.y >= c.y - 140 && p.y <= c.y + 190) {
          c.collected = true;
          this.exitTotemReached = true;
          sound.playVictory();
          this.spawnSparkBurst(c.x, c.y - 30, '#34d399');
          this.addFloatingText('STAGE CLEAR!', c.x, c.y - 60, '#34d399');
        }
        continue;
      }

      const dist = distance2D(p.x, p.y - 20, c.x, c.y);
      if (dist < 34) {
        c.collected = true;

        if (c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit') {
          p.fruitsCollected++;
          this.runScore += 100;
          sound.playFruitPickup();
          const pColor = c.type === 'flower' ? '#f43f5e' : '#4ade80';
          this.spawnSparkBurst(c.x, c.y, pColor);
          const txt = c.botanicalVariant === 'orchid' ? '+100 ORCHID!'
            : c.botanicalVariant === 'monstera' ? '+100 MONSTERA!'
            : c.botanicalVariant === 'hibiscus' ? '+100 HIBISCUS!'
            : '+100 FLORA!';
          this.addFloatingText(txt, c.x, c.y - 20, pColor);
        } else if (c.type === 'relic') {
          p.relicsFound++;
          this.runScore += 500;
          sound.playRelicFound();
          this.spawnSparkBurst(c.x, c.y, '#38bdf8');
          this.addFloatingText('JUNGLE IDOL!', c.x, c.y - 30, '#38bdf8');
        } else if (c.type === 'heart') {
          p.hp = Math.min(p.maxHp, p.hp + 1);
          sound.playFruitPickup();
          this.addFloatingText('+1 HP', c.x, c.y - 20, '#f43f5e');
        }
      }
    }

    // --- Check Objective Completion ---
    let currentProgress = 0;
    const objType = this.currentStage.config.objectiveType;

    switch (objType) {
      case 'harvest':
        currentProgress = p.fruitsCollected;
        break;
      case 'purge':
        currentProgress = p.enemiesDefeated;
        break;
      case 'relic_hunt':
        currentProgress = p.relicsFound;
        break;
      case 'rescue':
        currentProgress = p.crittersRescued;
        break;
      case 'gauntlet':
        currentProgress = p.enemiesDefeated;
        break;
      default:
        currentProgress = this.exitTotemReached ? 1 : 0;
    }

    const isQuotaType =
      objType === 'harvest' ||
      objType === 'purge' ||
      objType === 'relic_hunt' ||
      objType === 'rescue' ||
      objType === 'gauntlet';

    const quotaMet = currentProgress >= this.currentStage.config.targetCount;
    const isExitUnlocked = !isQuotaType || quotaMet;

    // Update Exit Totem locked visual in collectibles list
    const exitItem = this.collectibles.find((c) => c.type === 'exit_totem');
    if (exitItem) {
      exitItem.isLocked = !isExitUnlocked;
    }

    // Interactive Exit Totem / Sacred Portal Encounter
    if (!this.exitTotemReached && this.currentStage.exitTotemX > 0) {
      if (p.x >= this.currentStage.exitTotemX - 25) {
        if (isExitUnlocked) {
          this.exitTotemReached = true;
          sound.playVictory();
          this.spawnSparkBurst(this.currentStage.exitTotemX, p.y - 30, '#34d399');
          this.addFloatingText('SANCTUARY UNLOCKED! VICTORY!', p.x, p.y - 60, '#34d399');
        } else {
          // Push player back gently from sealed barrier and show clear reminder
          p.x = this.currentStage.exitTotemX - 35;
          p.vx = -140;
          const remaining = this.currentStage.config.targetCount - currentProgress;
          const msg =
            objType === 'harvest'
              ? `🔒 Need ${remaining} more Flora!`
              : objType === 'purge'
              ? `🔒 Defeat ${remaining} more Beasts!`
              : objType === 'rescue'
              ? `🔒 Free ${remaining} more Critters!`
              : objType === 'relic_hunt'
              ? `🔒 Find ${remaining} more Idols!`
              : `🔒 Complete Mission Quota!`;
          this.addFloatingText(msg, this.currentStage.exitTotemX - 40, p.y - 45, '#f87171');
        }
      }
    }

    const bossDefeated = this.boss ? this.boss.defeated : false;
    const isWin = isObjectiveComplete(
      objType,
      currentProgress,
      this.currentStage.config.targetCount,
      this.exitTotemReached,
      bossDefeated
    );

    if (isWin && !this.isGameOver) {
      this.isGameOver = true;
      const stars = calculateLevelStars(
        this.gameTime,
        this.currentStage.config.timeLimit,
        p.hp / p.maxHp,
        currentProgress / Math.max(1, this.currentStage.config.targetCount)
      );

      this.callbacks.onVictory(stars, Math.round(this.gameTime), this.runScore);
    }

    // --- Particle System Update ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 300 * dt; // gravity
    }

    // --- Floating Texts Update ---
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y -= 35 * dt;
    }

    // --- Camera Tracking ---
    this.updateCamera(dt);

    // Calculate progress ratio across the level
    const totalDist = Math.max(1, (this.currentStage.exitTotemX || this.currentStage.config.levelWidth) - 140);
    const distTraveled = Math.max(0, p.x - 140);
    const distanceRatio = Math.min(1.0, distTraveled / totalDist);

    // Notify HUD
    this.callbacks.onProgressUpdate(
      currentProgress,
      this.currentStage.config.targetCount,
      this.runScore,
      p.hp,
      distanceRatio
    );
  }

  /**
   * Execute Sloth's Claw Punch Hitbox
   */
  private executePunchHitbox(isMega: boolean) {
    const p = this.player;
    // Generous punch radius with vertical coverage to easily strike aerial predators!
    const punchRadius = isMega ? 98 : 68;
    const punchX = isMega ? p.x : p.x + p.facing * 38;
    const punchY = p.y - 28;

    // Check hit on enemies
    for (const e of this.enemies) {
      if (e.defeated) continue;
      const dist = distance2D(punchX, punchY, e.x, e.y);
      if (dist < punchRadius + e.width * 0.5) {
        e.hp -= isMega ? 3 : 1;
        e.hitFlashTimer = 0.18;
        this.hitstopTimer = isMega ? 0.08 : 0.04; // Juice hitstop!
        sound.playHitImpact(isMega);
        this.camera.trauma = Math.min(1.0, this.camera.trauma + (isMega ? 0.35 : 0.15));

        this.comboCount++;
        this.comboResetTimer = 2.0;
        const pts = calculateHitScore(e.type, isMega, this.comboCount);
        this.runScore += pts;

        this.spawnClawHitSparks(e.x, e.y, isMega);

        if (e.type === 'eagle') {
          this.spawnEagleFeatherBurst(e.x, e.y);
          e.swoopPhase = 'hover';
          e.hoverTimer = 0.9;
        }

        if (e.hp <= 0) {
          e.defeated = true;
          p.enemiesDefeated++;
          sound.playEnemyDefeated();
          this.addFloatingText(`+${pts}`, e.x, e.y - 25, '#86efac');
          this.spawnDebrisBurst(e.x, e.y, e.type === 'eagle' ? '#f59e0b' : '#22c55e');
        } else {
          // Knockback
          e.x += p.facing * (isMega ? 55 : 30);
          this.addFloatingText('HIT!', e.x, e.y - 20, '#fef08a');
        }
      }
    }

    // Check hit on Boss
    if (this.boss && !this.boss.defeated) {
      const b = this.boss;
      const dist = distance2D(punchX, punchY, b.x, b.y);
      if (dist < punchRadius + 35) {
        b.hp -= isMega ? 2 : 1;
        b.hitFlashTimer = 0.15;
        this.hitstopTimer = 0.08;
        this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.4);
        sound.playHitImpact(true);
        this.spawnClawHitSparks(b.x, b.y, true);

        const pts = calculateHitScore('boss', isMega, this.comboCount);
        this.runScore += pts;
        this.addFloatingText(`BOSS HIT! +${pts}`, b.x, b.y - 45, '#facc15');

        if (b.hp <= 0) {
          b.defeated = true;
          this.daisyRescued = true;
          sound.playVictory();
          this.camera.trauma = 0.9;
          this.addFloatingText('VICTORY! DAISY SAVED!', b.x, b.y - 70, '#ec4899');
          this.spawnDebrisBurst(b.x, b.y, '#dc2626');
        }
      }
    }

    // Check hit on trapped Bamboo Cages
    for (const c of this.collectibles) {
      if (c.type === 'cage' && !c.collected) {
        const dist = distance2D(punchX, punchY, c.x, c.y);
        if (dist < punchRadius + 25) {
          c.cageHp = (c.cageHp ?? 2) - (isMega ? 2 : 1);
          sound.playHitImpact(true);
          this.spawnDebrisBurst(c.x, c.y, '#ca8a04');

          if (c.cageHp <= 0) {
            c.collected = true;
            p.crittersRescued++;
            this.runScore += 400;
            sound.playCritterRescued();
            this.addFloatingText('RESCUED! +400', c.x, c.y - 30, '#c084fc');
          } else {
            this.addFloatingText('CRACK!', c.x, c.y - 20, '#fef08a');
          }
        }
      }
    }
  }

  /**
   * Execute Sloth's Kung-Fu Kick Hitbox (Double tap to kick!)
   */
  private executeKickHitbox() {
    const p = this.player;
    // Generous kick radius with sweeping forward and vertical arc
    const kickRadius = 82;
    const kickX = p.x + p.facing * 48;
    const kickY = p.y - 22;

    // Check hit on enemies
    for (const e of this.enemies) {
      if (e.defeated) continue;
      const dist = distance2D(kickX, kickY, e.x, e.y);
      if (dist < kickRadius + e.width * 0.5) {
        e.hp -= 2; // Kick does 2 damage (heavy impact!)
        e.hitFlashTimer = 0.2;
        this.hitstopTimer = 0.06;
        sound.playHitImpact(true);
        this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.25);

        this.comboCount++;
        this.comboResetTimer = 2.0;
        const pts = calculateHitScore(e.type, false, this.comboCount) * 2;
        this.runScore += pts;

        this.spawnKickHitBurst(e.x, e.y);

        if (e.type === 'eagle') {
          this.spawnEagleFeatherBurst(e.x, e.y);
          e.swoopPhase = 'hover';
          e.hoverTimer = 0.9;
        }

        if (e.hp <= 0) {
          e.defeated = true;
          p.enemiesDefeated++;
          sound.playEnemyDefeated();
          this.addFloatingText(`K.O.! +${pts}`, e.x, e.y - 25, '#fb923c');
          this.spawnDebrisBurst(e.x, e.y, e.type === 'eagle' ? '#f59e0b' : '#f97316');
        } else {
          // Heavy knockback from kick
          e.x += p.facing * 65;
          this.addFloatingText('KICK HIT! -2', e.x, e.y - 20, '#fdba74');
        }
      }
    }

    // Check hit on Boss
    if (this.boss && !this.boss.defeated) {
      const b = this.boss;
      const dist = distance2D(kickX, kickY, b.x, b.y);
      if (dist < kickRadius + 35) {
        b.hp -= 2;
        b.hitFlashTimer = 0.2;
        this.hitstopTimer = 0.08;
        this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.35);
        sound.playHitImpact(true);
        this.spawnKickHitBurst(b.x, b.y);

        const pts = calculateHitScore('boss', false, this.comboCount) * 2;
        this.runScore += pts;
        this.addFloatingText(`BOSS KICK! -2`, b.x, b.y - 45, '#fb923c');

        if (b.hp <= 0) {
          b.defeated = true;
          this.daisyRescued = true;
          sound.playVictory();
          this.camera.trauma = 0.9;
          this.addFloatingText('VICTORY! DAISY SAVED!', b.x, b.y - 70, '#ec4899');
          this.spawnDebrisBurst(b.x, b.y, '#dc2626');
        }
      }
    }

    // Check hit on trapped Bamboo Cages (Kick instantly frees critters!)
    for (const c of this.collectibles) {
      if (c.type === 'cage' && !c.collected) {
        const dist = distance2D(kickX, kickY, c.x, c.y);
        if (dist < kickRadius + 25) {
          c.cageHp = (c.cageHp ?? 2) - 2;
          sound.playHitImpact(true);
          this.spawnDebrisBurst(c.x, c.y, '#f97316');

          if (c.cageHp <= 0) {
            c.collected = true;
            p.crittersRescued++;
            this.runScore += 500;
            sound.playCritterRescued();
            this.addFloatingText('FREED! +500', c.x, c.y - 30, '#c084fc');
          }
        }
      }
    }
  }

  /**
   * Apply damage to Player
   */
  private damagePlayer(amount: number) {
    const p = this.player;
    if (p.invincibleTimer > 0) return;

    p.hp = Math.max(0, p.hp - amount);
    p.invincibleTimer = 1.2; // 1.2s invulnerability
    p.squashX = 1.3;
    p.squashY = 0.7; // hurt flinch
    p.vy = -280;     // small knockup
    p.vx = -p.facing * 180;
    this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.5);
    sound.playPlayerHurt();
    this.addFloatingText(`-${amount} HP`, p.x, p.y - 45, '#ef4444');

    if (p.hp <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      sound.playDefeat();
      this.callbacks.onDefeat(this.runScore);
    }
  }

  /**
   * Camera Controller with lookahead and trauma screen shake
   */
  private updateCamera(dt: number) {
    const p = this.player;
    const { viewportWidth: vw, viewportHeight: vh } = this.camera;

    // Look-ahead tracking
    const lookAhead = p.facing * 90;
    this.camera.targetX = p.x - vw * 0.45 + lookAhead;
    this.camera.targetY = p.y - vh * 0.55;

    // Smooth damp camera
    const smoothFactor = Math.min(1, dt * 6.5);
    this.camera.x += (this.camera.targetX - this.camera.x) * smoothFactor;
    this.camera.y += (this.camera.targetY - this.camera.y) * smoothFactor;

    // Clamp camera within stage bounds
    this.camera.x = Math.max(0, Math.min(this.currentStage.config.levelWidth - vw, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.currentStage.config.levelHeight - vh, this.camera.y));
  }

  /**
   * Main Render Pass
   */
  public render() {
    const ctx = this.ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const world = WORLDS_DATA[this.currentStage.config.worldIndex - 1] || WORLDS_DATA[0];

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clean viewport clearing to prevent any screen flicker or ghosting
    ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);

    // Apply Screen Shake (Trauma squared for punchy feel)
    const shakeMag = this.camera.trauma * this.camera.trauma * 16;
    const shakeX = (Math.random() - 0.5) * shakeMag;
    const shakeY = (Math.random() - 0.5) * shakeMag;

    // 1. Render Multi-Layer Parallax Background
    backgroundEngine.renderBackground(ctx, world, this.camera, this.gameTime);

    // 2. Render In-World Game Elements with Camera Transform
    ctx.save();
    ctx.translate(-Math.round(this.camera.x) + shakeX, -Math.round(this.camera.y) + shakeY);

    // Render In-World Trees, Vines and Platforms
    backgroundEngine.renderPlatformsAndVines(
      ctx,
      world,
      this.platforms,
      this.vines,
      this.currentStage.trees,
      this.camera,
      this.gameTime
    );

    // Render Collectibles
    this.collectibles.forEach((item) => {
      drawCollectible(ctx, item, this.gameTime);
    });

    // Render Daisy if present in level
    if (this.currentStage.daisyX !== undefined && this.currentStage.daisyY !== undefined) {
      drawGirlfriendDaisy(
        ctx,
        this.currentStage.daisyX,
        this.currentStage.daisyY,
        this.gameTime,
        this.daisyRescued
      );
    }

    // Render Enemies
    this.enemies.forEach((enemy) => {
      if (enemy.defeated) return;
      if (enemy.type === 'snake') {
        drawTreeSnake(ctx, enemy, this.gameTime);
      } else if (enemy.type === 'eagle') {
        drawHarpyEagle(ctx, enemy, this.gameTime);
      } else if (enemy.type === 'ocelot') {
        drawOcelot(ctx, enemy, this.gameTime);
      } else {
        drawHazardEntity(ctx, enemy, this.gameTime);
      }
    });

    // Render Boss
    if (this.boss && !this.boss.defeated) {
      drawBossEntity(ctx, this.boss, this.gameTime);
    }

    // Render Hero Sloth
    drawHeroSloth(ctx, this.player, this.gameTime);

    // Contextual Action Badges (Climb Tree / Swing Liana / Jump Off)
    const p = this.player;
    if (this.nearTreeVine && !p.climbing && p.grounded) {
      const bob = Math.sin(this.gameTime * 6) * 4;
      ctx.save();
      ctx.translate(p.x, p.y - 75 + bob);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-64, -14, 128, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[W / UP] CLIMB TREE', 0, 0);
      ctx.restore();
    } else if (p.climbing) {
      const bob = Math.sin(this.gameTime * 6) * 3;
      ctx.save();
      ctx.translate(p.x, p.y - 72 + bob);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-66, -14, 132, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LEAP: [SPACE / RIGHT]', 0, 0);
      ctx.restore();
    } else if (p.isVineSwinging) {
      const bob = Math.sin(this.gameTime * 8) * 3;
      ctx.save();
      ctx.translate(p.x, p.y - 65 + bob);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-68, -14, 136, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TARZAN: [SPACE] JUMP', 0, 0);
      ctx.restore();
    }

    // Render Particles
    this.particles.forEach((pt) => {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * (pt.life / pt.maxLife), 0, Math.PI * 2);
      ctx.fill();
    });

    // Render Floating Combat Texts
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px Fredoka, sans-serif';
    this.floatingTexts.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore(); // end world transform

    // 3. Render Foreground Foliage (Framing screen edges)
    backgroundEngine.renderForeground(ctx, world, this.camera, this.gameTime);

    ctx.restore(); // end DPR transform
  }

  // --- Juice Helpers ---
  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      life: 0.8,
      maxLife: 0.8,
      scale: 1,
    });
  }

  private spawnSparkBurst(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 3 + Math.random() * 3,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        type: 'spark',
      });
    }
  }

  private spawnClawHitSparks(x: number, y: number, isMega: boolean) {
    const count = isMega ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const spd = 120 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: (this.player.facing * spd * 0.8) + (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 120,
        color: isMega ? '#fef08a' : '#86efac',
        size: 3.5,
        life: 0.35,
        maxLife: 0.35,
        type: 'spark',
      });
    }
  }

  private spawnDebrisBurst(x: number, y: number, color: string) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 180,
        vy: -80 - Math.random() * 160,
        color,
        size: 3 + Math.random() * 4,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        type: 'leaf',
      });
    }
  }

  private spawnJumpDust(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y,
        vx: (Math.random() - 0.5) * 60,
        vy: -20 - Math.random() * 40,
        color: '#e2f1e7',
        size: 2.5,
        life: 0.25,
        maxLife: 0.25,
        type: 'smoke',
      });
    }
  }

  private spawnDoubleJumpBurst(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const spd = 70 + Math.random() * 90;
      this.particles.push({
        x: x + Math.cos(angle) * 12,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd + 40,
        color: i % 2 === 0 ? '#4ade80' : '#86efac',
        size: 3.5,
        life: 0.45,
        maxLife: 0.45,
        type: 'leaf',
      });
    }
  }

  private spawnKickHitBurst(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const spd = 140 + Math.random() * 190;
      this.particles.push({
        x,
        y,
        vx: (this.player.facing * spd * 0.9) + (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 140,
        color: i % 2 === 0 ? '#f97316' : '#fde047',
        size: 4,
        life: 0.38,
        maxLife: 0.38,
        type: 'spark',
      });
    }
  }

  private spawnEagleFeatherBurst(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const spd = 50 + Math.random() * 120;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 18,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 35,
        color: i % 3 === 0 ? '#f8fafc' : i % 3 === 1 ? '#64748b' : '#f59e0b',
        size: 4,
        life: 0.6,
        maxLife: 0.6,
        type: 'leaf',
      });
    }
  }
}

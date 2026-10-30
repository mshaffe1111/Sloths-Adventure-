/**
 * The game's sound, as the rest of the code sees it.
 *
 * This file is a thin front door. The real work lives in src/audio:
 *   conductor.ts   plays music, ambience and effects on the Web Audio clock
 *   themes.ts      the score (every piece of music is written as notation)
 *   sfx.ts         layered sound effects
 *   stingers.ts    short written fanfares
 *   ambience.ts    the sound of each world
 *   speech.ts      dialogue blips for the story
 */
import { Conductor, type SceneOptions } from '../audio/conductor.ts';
import type { AmbientType } from '../audio/ambience.ts';
import { enemyIndex, hitArg, type Material } from '../audio/combat.ts';
import { CALM, type MusicState } from '../audio/adaptive.ts';
import type { CueName } from '../audio/cues.ts';
import { PUZZLE_KIND } from '../audio/sfxGame.ts';
import { WORLD_SURFACE } from '../audio/sfxRec.ts';
import { holdScene, sceneForPanel, sceneForScreen, type Held, type PanelInfo } from '../audio/scenes.ts';

type PredatorKind = 'ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra';

class SoundEngine {
  private readonly c = new Conductor();

  constructor() {
    // Browsers only allow sound after a tap or key press: the first one wakes the audio up.
    // (We keep listening: phones suspend audio when another app takes over, and the next tap revives it.)
    if (typeof window !== 'undefined') {
      // get the audio ready now, so the first tap only has to switch it on (and so it just plays where the browser allows sound without a tap)
      window.setTimeout(() => this.c.unlock(), 0);
      // a key press wakes the sound too, but it is not a press on the "Sound" chip, so only touches and clicks count as `fromTap`
      for (const ev of ['pointerdown', 'touchend', 'keydown', 'click'] as const) window.addEventListener(ev, () => this.c.unlock(ev !== 'keydown'), { capture: true, passive: true });
    }
  }

  // ------------------------------------------------------------------ settings
  get isMuted() {
    return this.c.muted;
  }
  toggleMute(): boolean {
    // a tap that only woke the sound up is not also a press on "Sound": otherwise the first tap on it would mute the game
    if (performance.now() - this.c.wokeAt < 700) return this.c.muted;
    this.c.setMuted(!this.c.muted);
    return this.c.muted;
  }
  /** sound is wanted but still waiting for a first tap */
  get locked() {
    return this.c.locked;
  }
  get musicVolume() {
    return this.c.musicVol;
  }
  get sfxVolume() {
    return this.c.sfxVol;
  }
  setMusicVolume(v: number) {
    this.c.setMusicVolume(v);
  }
  setSfxVolume(v: number) {
    this.c.setSfxVolume(v);
  }
  unlock() {
    this.c.unlock(true);
  }
  /** a snapshot of what the audio is doing (used by tests) */
  /** the control test's line about the sound (light or full, buffer, sound lost) */
  report(): string {
    return this.c.report();
  }
  debug() {
    return this.c.debug();
  }

  // ------------------------------------------------------------------ music
  scene(id: string | null, opts?: SceneOptions) {
    this.held = null;
    this.c.setScene(id, opts);
  }
  /** music for a non-cutscene screen (cutscenes choose their own, panel by panel) */
  screen(screen: string, world: number, isBoss: boolean, levelId = '', mini = 1, salt = 0, objective?: string) {
    this.held = null;
    // the stage's state (a dark zone, a danger, a boss phase) belongs to that stage: any other screen, or another stage, starts calm
    const stage = screen === 'playing' || screen === 'paused' ? levelId : '';
    if (stage !== this.stateStage) this.c.setMusicState(CALM);
    this.stateStage = stage;
    const s = sceneForScreen(screen, world, isBoss, levelId, mini, salt, objective);
    if (s) this.c.setScene(s.id, { intensity: s.intensity, seed: s.seed, tempo: s.tempo, form: s.form });
    this.c.setPaused(screen === 'paused');
  }
  private stateStage = '';
  /** the story piece being held (see scenes.ts holdScene); cleared when any other music is chosen */
  private held: Held | null = null;
  storyPanel(panel: PanelInfo) {
    const h = holdScene(this.held, sceneForPanel(panel), panel, performance.now() / 1000);
    this.held = h.held;
    const s = h.scene;
    this.c.setScene(s.id, { intensity: s.intensity });
    // the storm belongs to the storm panels only: the quiet scenes after it must not keep the thunder
    this.c.setAmbient(panel.chapter.toUpperCase().startsWith('THE STORM') ? 'thunderstorm' : 'gentle_breeze');
    this.c.warmStoryStings();
  }
  /** the short sting a story panel asks for, played once as its picture appears (see StoryPlayer) */
  storySting(name: string) {
    this.c.storySting(name);
  }
  setIntensity(v: number) {
    this.c.setIntensity(v);
  }
  /** the music's speed, 1 = as written (a boss enraging runs it faster) */
  setTempo(scale: number) {
    this.c.setTempo(scale);
  }
  setLowHealth(on: boolean) {
    this.c.setLowHealth(on);
  }
  /** what is happening, for the music to follow (see audio/adaptive.ts): danger 0..1, dark 0..1, exit 0..1, puzzle 0..1, boss phase, mood */
  setMusicState(s: Partial<MusicState>) {
    this.c.setMusicState(s);
  }
  /** an in-key stinger: 'checkpoint', 'discovery', 'secret', 'lowHealth', 'bossAppear' (see audio/cues.ts) */
  cue(name: CueName) {
    this.c.cue(name);
  }
  setAmbient(type: AmbientType | null) {
    this.c.setAmbient(type);
  }
  /** Dot's bubble opens in play: a soft chirp, once per line, and the music dips a moment (SN-7) */
  dotChirp() {
    this.c.dotChirp();
  }
  speak(speaker: string, ch: string, index: number) {
    this.c.speak(speaker, ch, index);
  }

  // ------------------------------------------------------------------ the old API (same names, new sounds)
  playJump() { this.c.fx('jump'); }
  playDoubleJump() { this.c.fx('doubleJump'); }
  /** Leaf Glide: 0 = the leaf opens, 1 = a little flutter while drifting, 2 = it folds away */
  playGlide(phase: 0 | 1 | 2) { this.c.fx('glide', phase); }
  playPunch() { this.c.fx('punch'); }
  playMegaPunch() { this.c.fx('megaPunch'); }
  playKick() { this.c.fx('kick'); }
  playWhoosh() { this.c.fx('whoosh'); }
  /** `material`: what was hit (see combat.ts) so a fur hit and a shell hit sound different */
  playHitImpact(isHeavy = false, material: Material = 'generic') { this.c.fx('hit', hitArg(isHeavy, material)); }
  playFlowerPickup(comboCount = 0) { this.c.fx('flower', comboCount); }
  playLeafPickup() { this.c.fx('leaf'); }
  playFruitPickup() { this.c.fx('fruit'); }
  playHeartPickup() { this.c.fx('heart'); }
  playSuperHeart() { this.c.fx('superHeart'); }
  playPowerUp(type: 'speed' | 'invincible' | 'magnet') { this.c.fx('power', type === 'speed' ? 0 : type === 'invincible' ? 1 : 2); }
  playVineGrab() { this.c.fx('vine'); }
  playTreeClimb() { this.c.fx('climb'); }
  playShrineUnlocked() { this.c.fx('shrine'); }
  playRelicFound() { this.c.fx('relic'); }
  playCritterRescued() { this.c.fx('critter'); }
  /** `type`: which animal fell, so each has its own last sound */
  playEnemyDefeated(type?: string) { this.c.fx('defeat', type ? enemyIndex(type) : undefined); }
  playPlayerHurt() { this.c.fx('hurt'); }
  playEagleScreech() { this.c.fx('eagle'); }
  /** `world` 1..10: each world's boss has its own voice */
  playBossRoar(world = 0) { this.c.fx('roar', world); }
  playVictory() { this.c.sting('victory'); }
  /** reaching the shrine: a short chime, the brightest of the results' star chimes (the victory sting plays when the Stage Cleared
   *  card lands: SN-5) */
  playExitChime() { this.c.fx('star', 2); }
  playDefeat() { this.c.sting('defeat'); }
  /** the old engine started and stopped one global ambience; the world now picks its own (see setAmbient) */
  startAmbient() {}
  stopAmbient() { this.c.setAmbient(null); }

  // ------------------------------------------------------------------ new
  playBossVictory() { this.c.sting('bossVictory'); }
  playBossAppear() { this.c.sting('bossAppear'); }
  playLand(strength = 0.4) { this.c.fx('land', strength); }
  playStep() { this.c.fx('step'); }
  playCheckpoint() { this.c.fx('checkpoint'); }
  playOneUp() { this.c.fx('oneUp'); }
  playLevelStart() { this.c.fx('levelStart'); }
  /** phase: 0 warning, 1 launch, 2 impact */
  playPredator(kind: PredatorKind, phase: 0 | 1 | 2) { this.c.fx(`${kind}Call`, phase); }
  playUiTap() { this.c.fx('uiTap'); }
  playUiConfirm() { this.c.fx('uiConfirm'); }
  playUiBack() { this.c.fx('uiBack'); }
  playStar(i: number) { this.c.fx('star', i); }
  playPause(on: boolean) { this.c.fx(on ? 'pauseIn' : 'pauseOut'); }

  // ------------------------------------------------------------------ the review's missing sounds (SN-3, audio/sfxGame.ts)
  /** into the water: 0 a full plunge, 1 a body-sized splash, 2 a small dip */
  playSplash(size: 0 | 1 | 2 = 0) { this.c.fx('splash', size); }
  playRespawn() { this.c.fx('respawn'); }
  /** every landing, `speed` 0..1 how fast he fell (a small hop is soft) */
  playLanding(speed: number) { this.c.fx('landing', speed); }
  /** a boss arriving: its roar over the orchestra's in-key sting (also the boss intro card) */
  playBossArrives(world = 0) { this.c.fx('bossAppear', world); }
  /** a puzzle kit's action by its event name (see PUZZLE_KIND); false when it has no sound of its own */
  playPuzzle(kind: string): boolean {
    const s = PUZZLE_KIND[kind];
    if (!s) return false;
    this.c.puzzleFx(s);
    return true;
  }

  // ------------------------------------------------------------------ the recorded set's own (polish-sfx: sounds that borrowed others)
  /** World 4's falling rock landing (it used to be a generic hit with a bell on top) */
  playRock() { this.c.fx('rock'); }
  /** the grit trickling down just before a rock lets go: a warning to hear */
  playRockWarn() { this.c.fx('rockWarn'); }
  /** 4-4's chimes swinging as the wind comes (they used to borrow the vine grab) */
  playWindChime() { this.c.fx('windChime'); }
  /** a mushroom or a springy pad throwing him up (it used to be the jump) */
  playBounce() { this.c.fx('bounce'); }
  /** a crumbling ledge giving way (it used to be a heavy hit) */
  playCrumble() { this.c.fx('crumble'); }
  /** the boss card's name landing (SN-10) */
  playBossSlam() { this.c.fx('bossSlam'); }
  /** what he walks on, for the footsteps (sfxRec.ts WORLD_SURFACE) */
  setWorld(world: number) { this.c.surface = WORLD_SURFACE[world] ?? 'moss'; }
}

export const sound = new SoundEngine();

if (typeof window !== 'undefined' && /[?&]audiodebug=1/.test(window.location.search)) (window as unknown as { __sound: SoundEngine }).__sound = sound;

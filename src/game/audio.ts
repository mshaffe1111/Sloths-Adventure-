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
import { sceneForPanel, sceneForScreen, type PanelInfo } from '../audio/scenes.ts';

type PredatorKind = 'ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra';

class SoundEngine {
  private readonly c = new Conductor();

  constructor() {
    // Browsers only allow sound after a tap or key press: the first one wakes the audio up.
    // (We keep listening: phones suspend audio when another app takes over, and the next tap revives it.)
    if (typeof window !== 'undefined') {
      const wake = () => this.c.unlock();
      for (const ev of ['pointerdown', 'touchend', 'keydown', 'click'] as const) window.addEventListener(ev, wake, { capture: true, passive: true });
    }
  }

  // ------------------------------------------------------------------ settings
  get isMuted() {
    return this.c.muted;
  }
  toggleMute(): boolean {
    this.c.setMuted(!this.c.muted);
    return this.c.muted;
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
    this.c.unlock();
  }
  /** a snapshot of what the audio is doing (used by tests) */
  debug() {
    return this.c.debug();
  }

  // ------------------------------------------------------------------ music
  scene(id: string | null, opts?: SceneOptions) {
    this.c.setScene(id, opts);
  }
  /** music for a non-cutscene screen (cutscenes choose their own, panel by panel) */
  screen(screen: string, world: number, isBoss: boolean, levelId = '', mini = 1, salt = 0) {
    const s = sceneForScreen(screen, world, isBoss, levelId, mini, salt);
    if (s) this.c.setScene(s.id, { intensity: s.intensity, seed: s.seed, tempo: s.tempo });
    this.c.setPaused(screen === 'paused');
  }
  storyPanel(panel: PanelInfo) {
    const s = sceneForPanel(panel);
    this.c.setScene(s.id, { intensity: s.intensity });
    if (panel.chapter.toUpperCase().startsWith('THE STORM')) this.c.setAmbient('thunderstorm');
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
  setAmbient(type: AmbientType | null) {
    this.c.setAmbient(type);
  }
  speak(speaker: string, ch: string, index: number) {
    this.c.speak(speaker, ch, index);
  }

  // ------------------------------------------------------------------ the old API (same names, new sounds)
  playJump() { this.c.fx('jump'); }
  playDoubleJump() { this.c.fx('doubleJump'); }
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
}

export const sound = new SoundEngine();

if (typeof window !== 'undefined' && /[?&]audiodebug=1/.test(window.location.search)) (window as unknown as { __sound: SoundEngine }).__sound = sound;

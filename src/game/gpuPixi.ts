/**
 * The only Pixi the GPU layer loads (gpuLayer.ts imports this module, on its own, when the layer starts): its WebGL renderer and the five
 * classes it draws with, so the bundler keeps just those. Importing all of 'pixi.js' shipped about 914 KB of script with every first
 * stage, its WebGPU and canvas renderers' code included (never used: WebGL 2 only, PERFORMANCE-RULES §4).
 */
export { WebGLRenderer, Container, Sprite, Texture, Rectangle, Graphics } from 'pixi.js';

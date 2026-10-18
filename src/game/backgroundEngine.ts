import type { WorldInfo, Camera, Platform, Vine, TreeStructure } from './types.ts';

export class BackgroundEngine {
  private ambientSpores: { x: number; y: number; speed: number; size: number; phase: number }[] = [];
  private butterflies: { x: number; y: number; speedX: number; speedY: number; color: string; phase: number }[] = [];
  private birds: { x: number; y: number; speed: number; wingPhase: number; color: string; beakColor: string }[] = [];

  constructor() {
    // Generate pre-seeded floating atmospheric spores / pollen motes
    for (let i = 0; i < 45; i++) {
      this.ambientSpores.push({
        x: Math.random() * 2400,
        y: Math.random() * 1200,
        speed: 12 + Math.random() * 28,
        size: 1.5 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Pre-seeded tropical butterflies (blue morphos, golden swallowtails, emeralds)
    const butterflyColors = ['#38bdf8', '#facc15', '#4ade80', '#fb923c', '#e879f9'];
    for (let i = 0; i < 10; i++) {
      this.butterflies.push({
        x: Math.random() * 2800,
        y: 100 + Math.random() * 500,
        speedX: 24 + Math.random() * 36,
        speedY: 8 + Math.random() * 18,
        color: butterflyColors[i % butterflyColors.length],
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Background flying tropical toucans / macaws
    const birdColors = [
      { body: '#09090b', beak: '#facc15' },
      { body: '#ef4444', beak: '#fde047' },
      { body: '#0284c7', beak: '#fbbf24' },
    ];
    for (let i = 0; i < 4; i++) {
      this.birds.push({
        x: Math.random() * 2400,
        y: 60 + Math.random() * 200,
        speed: 40 + Math.random() * 30,
        wingPhase: Math.random() * Math.PI * 2,
        color: birdColors[i % birdColors.length].body,
        beakColor: birdColors[i % birdColors.length].beak,
      });
    }
  }

  /**
   * Render Multi-Layer Parallax Rainforest Background
   */
  public renderBackground(
    ctx: CanvasRenderingContext2D,
    world: WorldInfo,
    camera: Camera,
    time: number
  ) {
    const { viewportWidth: vw, viewportHeight: vh } = camera;
    const pal = world.palette;

    // --- 1. Rainforest Sky Gradient with Canopy Mist ---
    const skyGrad = ctx.createLinearGradient(0, 0, 0, vh);
    skyGrad.addColorStop(0, pal.skyTop);
    skyGrad.addColorStop(0.7, pal.skyBottom);
    skyGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, vw, vh);

    // --- 2. Distant Misty Rainforest Mountain Ridges (Parallax 0.04) ---
    ctx.save();
    const p0Offset = (camera.x * 0.04) % 1000;
    ctx.fillStyle = pal.distantMountain;
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = -1000; x < vw + 1000; x += 180) {
      const ridgeY = vh * 0.42 + Math.sin((x + p0Offset) * 0.004) * 65 + Math.cos((x + p0Offset) * 0.01) * 35;
      ctx.lineTo(x - p0Offset, ridgeY);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();

    // Distant mountain mist layer
    const mountainMist = ctx.createLinearGradient(0, vh * 0.45, 0, vh * 0.7);
    mountainMist.addColorStop(0, 'rgba(255, 255, 255, 0)');
    mountainMist.addColorStop(1, 'rgba(220, 252, 231, 0.25)');
    ctx.fillStyle = mountainMist;
    ctx.fillRect(0, vh * 0.45, vw, vh * 0.25);
    ctx.restore();

    // --- 3. Mid-Distant Rainforest Canopy & Rushing Waterfalls (Parallax 0.12) ---
    ctx.save();
    const p1Offset = (camera.x * 0.12) % 800;
    ctx.fillStyle = pal.canopyFar;
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = -800; x < vw + 800; x += 120) {
      const treeTopY = vh * 0.58 + Math.sin((x + p1Offset) * 0.009) * 45;
      // Multi-arced tree crowns
      ctx.arc(x - p1Offset, treeTopY, 65, Math.PI, 0, false);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();

    // Cascading Rainforest Waterfalls (in river, mist, and canopy stages)
    const wfPositions = [280, 850, 1500];
    wfPositions.forEach((baseWfX) => {
      const wfX = ((baseWfX - p1Offset) % (vw + 500) + (vw + 500)) % (vw + 500) - 100;
      // White churning water stream
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(wfX - 8, vh * 0.48, 16, vh * 0.52);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.fillRect(wfX - 4, vh * 0.48, 8, vh * 0.52);

      // Billowing mist cloud at waterfall base
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      const mistBob = Math.sin(time * 3 + baseWfX) * 6;
      ctx.beginPath();
      ctx.arc(wfX, vh * 0.92 + mistBob, 45, 0, Math.PI * 2);
      ctx.arc(wfX - 25, vh * 0.94 + mistBob, 35, 0, Math.PI * 2);
      ctx.arc(wfX + 25, vh * 0.94 + mistBob, 35, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // --- 4. Massive Ancient Rainforest Trees (Kapok & Ceiba Trunks) (Parallax 0.28) ---
    ctx.save();
    const treeSpacing = 420;
    const treeOffset = (camera.x * 0.28) % treeSpacing;
    const startX = -treeOffset - 100;

    for (let tx = startX; tx < vw + 300; tx += treeSpacing) {
      const treeSeed = Math.floor((camera.x * 0.28 + tx) / treeSpacing);
      const trunkWidth = 55 + (Math.abs(treeSeed * 17) % 25);
      const trunkHeight = vh * 0.85;

      // Deep rich ancient bark gradient
      const barkGrad = ctx.createLinearGradient(tx - trunkWidth * 0.5, 0, tx + trunkWidth * 0.5, 0);
      barkGrad.addColorStop(0, '#1c1917');
      barkGrad.addColorStop(0.3, pal.trunkColor);
      barkGrad.addColorStop(0.7, '#451a03');
      barkGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = barkGrad;

      // Trunk with flared buttress roots at bottom
      ctx.beginPath();
      ctx.moveTo(tx - trunkWidth * 0.4, vh * 0.15);
      ctx.lineTo(tx + trunkWidth * 0.4, vh * 0.15);
      ctx.lineTo(tx + trunkWidth * 0.55, vh * 0.7);
      ctx.quadraticCurveTo(tx + trunkWidth * 1.3, vh * 0.95, tx + trunkWidth * 1.6, vh);
      ctx.lineTo(tx - trunkWidth * 1.6, vh);
      ctx.quadraticCurveTo(tx - trunkWidth * 1.3, vh * 0.95, tx - trunkWidth * 0.55, vh * 0.7);
      ctx.closePath();
      ctx.fill();

      // Giant sprawling diagonal canopy branches
      ctx.fillStyle = pal.trunkColor;
      ctx.beginPath();
      // Left high branch
      ctx.moveTo(tx - trunkWidth * 0.35, vh * 0.35);
      ctx.quadraticCurveTo(tx - trunkWidth * 1.8, vh * 0.28, tx - trunkWidth * 2.8, vh * 0.18);
      ctx.lineTo(tx - trunkWidth * 2.8, vh * 0.24);
      ctx.quadraticCurveTo(tx - trunkWidth * 1.6, vh * 0.34, tx - trunkWidth * 0.35, vh * 0.42);
      // Right high branch
      ctx.moveTo(tx + trunkWidth * 0.35, vh * 0.4);
      ctx.quadraticCurveTo(tx + trunkWidth * 1.8, vh * 0.32, tx + trunkWidth * 2.8, vh * 0.22);
      ctx.lineTo(tx + trunkWidth * 2.8, vh * 0.28);
      ctx.quadraticCurveTo(tx + trunkWidth * 1.6, vh * 0.38, tx + trunkWidth * 0.35, vh * 0.47);
      ctx.fill();

      // Lush foliage crowns on branches (Fan palms & Monstera crowns)
      ctx.fillStyle = pal.foliageColor;
      [-2.4, 0, 2.4].forEach((sideMult) => {
        const leafClusterX = tx + trunkWidth * sideMult;
        const leafClusterY = vh * 0.22;
        ctx.beginPath();
        ctx.arc(leafClusterX, leafClusterY, 65, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.foliageHighlight;
        ctx.beginPath();
        ctx.arc(leafClusterX - 10, leafClusterY - 12, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.foliageColor;
      });

      // Hanging moss / aerial strangler roots draped down from branches
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      for (let r = -2; r <= 2; r++) {
        const rootX = tx + r * 22;
        const rootLen = 80 + Math.sin(rootX) * 40;
        ctx.beginPath();
        ctx.moveTo(rootX, vh * 0.28);
        ctx.quadraticCurveTo(rootX + Math.sin(time + r) * 10, vh * 0.28 + rootLen * 0.5, rootX + Math.sin(time * 1.5 + r) * 15, vh * 0.28 + rootLen);
        ctx.stroke();
      }

      // Wild blooming pink orchids clinging to tree bark
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(tx - trunkWidth * 0.35, vh * 0.55, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tx - trunkWidth * 0.35, vh * 0.55, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // --- 5. Volumetric Rainforest God-Rays cutting through dense leaves ---
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const numBeams = 6;
    for (let b = 0; b < numBeams; b++) {
      const beamX = ((b * 260 + time * 10 - camera.x * 0.08) % (vw + 400)) - 200;
      const beamWidth = 65 + Math.sin(time * 1.2 + b) * 16;

      const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 180, vh);
      beamGrad.addColorStop(0, pal.sunbeamColor);
      beamGrad.addColorStop(0.5, pal.sunbeamColor);
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamX, -40);
      ctx.lineTo(beamX + beamWidth, -40);
      ctx.lineTo(beamX + beamWidth + 240, vh + 40);
      ctx.lineTo(beamX + 180, vh + 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // --- 6. Flying Background Birds (Toucans & Macaws) ---
    ctx.save();
    this.birds.forEach((bird) => {
      const bx = ((bird.x + time * bird.speed - camera.x * 0.2) % (vw + 300) + (vw + 300)) % (vw + 300) - 100;
      const by = bird.y + Math.sin(time * 2 + bird.wingPhase) * 16;
      const wingFlap = Math.sin(time * 12 + bird.wingPhase);

      ctx.save();
      ctx.translate(bx, by);
      // Bird body
      ctx.fillStyle = bird.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing
      ctx.beginPath();
      ctx.ellipse(-2, wingFlap * 6, 7, 3, -0.3 * wingFlap, 0, Math.PI * 2);
      ctx.fill();
      // Toucan Beak
      ctx.fillStyle = bird.beakColor;
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.lineTo(16, 1);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();

    // --- 7. Floating Jungle Pollen / Glow Spores ---
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    this.ambientSpores.forEach((spore) => {
      const sx = ((spore.x - camera.x * 0.2 + Math.sin(time + spore.phase) * 28) % vw + vw) % vw;
      const sy = ((spore.y + time * spore.speed) % vh + vh) % vh;
      ctx.beginPath();
      ctx.arc(sx, sy, spore.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // --- 8. Fluttering Tropical Butterflies (Blue Morphos, Swallowtails) ---
    ctx.save();
    this.butterflies.forEach((b) => {
      const bx = ((b.x + time * b.speedX - camera.x * 0.35) % (vw + 200) + (vw + 200)) % (vw + 200) - 100;
      const by = b.y + Math.sin(time * 3 + b.phase) * 20;
      const flap = Math.sin(time * 16 + b.phase);

      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = b.color;

      // Left wing
      ctx.beginPath();
      ctx.ellipse(-5, 0, 9, 6 * Math.abs(flap), 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.ellipse(5, 0, 9, 6 * Math.abs(flap), -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  /**
   * Render in-world ancient rainforest trees, platforms, branches, and swinging/climbing vines
   */
  public renderPlatformsAndVines(
    ctx: CanvasRenderingContext2D,
    world: WorldInfo,
    platforms: Platform[],
    vines: Vine[],
    trees: TreeStructure[] = [],
    camera: Camera,
    time: number
  ) {
    const pal = world.palette;

    // --- 0. Render Majestic In-World Ancient Rainforest Trees ---
    trees.forEach((tree) => {
      if (tree.x + tree.canopyRadius < camera.x - 120 || tree.x - tree.canopyRadius > camera.x + camera.viewportWidth + 120) return;

      ctx.save();

      // Deep Ancient Organic Bark Gradient
      const trunkGrad = ctx.createLinearGradient(
        tree.x - tree.trunkWidth * 0.5, 0,
        tree.x + tree.trunkWidth * 0.5, 0
      );
      trunkGrad.addColorStop(0, '#1c1917');
      trunkGrad.addColorStop(0.2, '#38200e');
      trunkGrad.addColorStop(0.5, pal.trunkColor);
      trunkGrad.addColorStop(0.8, '#573315');
      trunkGrad.addColorStop(1, '#180e06');
      ctx.fillStyle = trunkGrad;

      // Massive Tree Trunk with Flared Buttress Roots
      ctx.beginPath();
      ctx.moveTo(tree.x - tree.trunkWidth * 0.45, tree.topY);
      ctx.lineTo(tree.x + tree.trunkWidth * 0.45, tree.topY);
      ctx.lineTo(tree.x + tree.trunkWidth * 0.55, tree.groundY - 90);
      // Right buttress flare
      ctx.quadraticCurveTo(tree.x + tree.trunkWidth * 1.35, tree.groundY - 18, tree.x + tree.trunkWidth * 1.65, tree.groundY);
      ctx.lineTo(tree.x - tree.trunkWidth * 1.65, tree.groundY);
      // Left buttress flare
      ctx.quadraticCurveTo(tree.x - tree.trunkWidth * 1.35, tree.groundY - 18, tree.x - tree.trunkWidth * 0.55, tree.groundY - 90);
      ctx.closePath();
      ctx.fill();

      // Organic Bark Ridges & Striations
      ctx.strokeStyle = 'rgba(28, 25, 23, 0.7)';
      ctx.lineWidth = 2.8;
      [-0.24, 0, 0.24].forEach((offset) => {
        const rx = tree.x + tree.trunkWidth * offset;
        ctx.beginPath();
        ctx.moveTo(rx, tree.topY + 30);
        ctx.bezierCurveTo(
          rx + 8, tree.topY + 180,
          rx - 8, tree.topY + 320,
          rx + offset * 25, tree.groundY - 15
        );
        ctx.stroke();
      });

      // Moss & Lichen Patches Clinging to Bark
      ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
      [0.25, 0.52, 0.78].forEach((t) => {
        const my = tree.topY + (tree.groundY - tree.topY) * t;
        ctx.beginPath();
        ctx.ellipse(tree.x - tree.trunkWidth * 0.22, my, 12, 28, 0.15, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sprawling Canopy Branches Extending Out from Trunk
      ctx.fillStyle = pal.trunkColor;
      // Left sprawling bough
      ctx.beginPath();
      ctx.moveTo(tree.x - tree.trunkWidth * 0.4, tree.topY + 70);
      ctx.quadraticCurveTo(tree.x - tree.canopyRadius * 0.85, tree.topY + 50, tree.x - tree.canopyRadius * 1.25, tree.topY + 22);
      ctx.lineTo(tree.x - tree.canopyRadius * 1.25, tree.topY + 38);
      ctx.quadraticCurveTo(tree.x - tree.canopyRadius * 0.75, tree.topY + 72, tree.x - tree.trunkWidth * 0.35, tree.topY + 92);
      ctx.closePath();
      ctx.fill();

      // Right sprawling bough
      ctx.beginPath();
      ctx.moveTo(tree.x + tree.trunkWidth * 0.4, tree.topY + 80);
      ctx.quadraticCurveTo(tree.x + tree.canopyRadius * 0.85, tree.topY + 60, tree.x + tree.canopyRadius * 1.25, tree.topY + 30);
      ctx.lineTo(tree.x + tree.canopyRadius * 1.25, tree.topY + 46);
      ctx.quadraticCurveTo(tree.x + tree.canopyRadius * 0.75, tree.topY + 82, tree.x + tree.trunkWidth * 0.35, tree.topY + 102);
      ctx.closePath();
      ctx.fill();

      // Lush Rainforest Canopy Foliage Umbrella Crown
      const crownY = tree.topY + 10;
      ctx.fillStyle = pal.foliageColor;
      [-1.1, -0.5, 0, 0.5, 1.1].forEach((mult) => {
        ctx.beginPath();
        ctx.arc(tree.x + mult * tree.canopyRadius * 0.65, crownY + Math.abs(mult) * 14, 68, 0, Math.PI * 2);
        ctx.fill();
      });
      // Foliage Highlight Layer
      ctx.fillStyle = pal.foliageHighlight;
      [-0.8, 0, 0.8].forEach((mult) => {
        ctx.beginPath();
        ctx.arc(tree.x + mult * tree.canopyRadius * 0.55, crownY - 14, 46, 0, Math.PI * 2);
        ctx.fill();
      });

      // Hanging Spanish Moss / Bromeliads on Branches
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.4;
      [-70, -35, 35, 70].forEach((ox) => {
        ctx.beginPath();
        ctx.moveTo(tree.x + ox, crownY + 45);
        ctx.quadraticCurveTo(tree.x + ox + 6, crownY + 85, tree.x + ox - 3, crownY + 115);
        ctx.stroke();
      });

      // Wild Blooming Orchids on Tree Crookes
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(tree.x - tree.trunkWidth * 0.35, tree.topY + 110, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tree.x - tree.trunkWidth * 0.35, tree.topY + 110, 3, 0, Math.PI * 2);
      ctx.fill();

      // IF Tree Has Climbing Vine: Render the thick twisting climbing liana on trunk with footholds
      if (tree.hasClimbVine) {
        // Main climbing rope winding up the trunk
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 8.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tree.x, tree.groundY - 15);
        for (let vy = tree.groundY - 15; vy >= tree.topY + 30; vy -= 40) {
          const waveX = tree.x + Math.sin(vy * 0.05) * 12;
          ctx.lineTo(waveX, vy);
        }
        ctx.stroke();

        // Inner glowing fibrous core
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 3.0;
        ctx.stroke();

        // Glowing Emerald Leaf Steps / Footholds along the trunk
        for (let vy = tree.groundY - 45; vy >= tree.topY + 50; vy -= 55) {
          const waveX = tree.x + Math.sin(vy * 0.05) * 12;
          const leafSide = Math.floor(vy / 55) % 2 === 0 ? 1 : -1;
          
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(waveX + leafSide * 10, vy, 11, 6, leafSide * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Subtle glowing beacon
          ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
          ctx.beginPath();
          ctx.arc(waveX, vy, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });

    // --- 1. Render Vines (Swinging Lianas & Tree Vines) ---
    vines.forEach((v) => {
      if (v.x < camera.x - 120 || v.x > camera.x + camera.viewportWidth + 120) return;

      const vineLength = v.bottomY - v.topY;
      const isSwinging = v.isSwingingVine && v.swingAngle !== undefined;
      const angle = isSwinging ? (v.swingAngle || 0) : Math.sin(time * v.swaySpeed + v.swayPhase) * 0.12;

      ctx.save();

      // Anchor point at tree branch above
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(v.x, v.topY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Vine Rope with natural dynamic bending curve
      const tipX = v.x + Math.sin(angle) * vineLength;
      const tipY = v.topY + Math.cos(angle) * vineLength;
      const midX = (v.x + tipX) * 0.5 + Math.sin(angle * 0.5) * 14;
      const midY = (v.topY + tipY) * 0.5;

      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(v.x, v.topY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();

      // Inner lighter fibrous core
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Tropical Leaves sprouting along the vine
      const numLeaves = 6;
      for (let i = 1; i <= numLeaves; i++) {
        const t = i / (numLeaves + 1);
        const lx = v.x + (tipX - v.x) * t;
        const ly = v.topY + (tipY - v.topY) * t;
        const leafSide = i % 2 === 0 ? 1 : -1;

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(lx + leafSide * 8, ly, 7, 4, angle + leafSide * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // --- 2. Render Platforms (Gnarled Ancient Branches, Mossy Logs, Bouncy Mushrooms) ---
    platforms.forEach((p) => {
      if (p.x + p.width < camera.x - 50 || p.x > camera.x + camera.viewportWidth + 50) return;
      if (p.broken) return;

      ctx.save();

      if (p.type === 'fragile') {
        // Fragile rotting branch with tremor shake
        const shake = p.fragileTimer && p.fragileTimer > 0 ? (Math.random() - 0.5) * 5 : 0;
        ctx.translate(shake, shake);

        // Weathered rotten hollow wood
        ctx.fillStyle = '#a16207';
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 5);
        ctx.fill();
        ctx.stroke();

        // Cracks and peeling bark
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + p.width * 0.28, p.y + 2);
        ctx.lineTo(p.x + p.width * 0.35, p.y + p.height - 4);
        ctx.moveTo(p.x + p.width * 0.72, p.y + 3);
        ctx.lineTo(p.x + p.width * 0.65, p.y + p.height - 2);
        ctx.stroke();
      } else if (p.type === 'bouncy') {
        // Giant Rainforest Spotted Spring Mushroom
        const bounceScale = Math.sin(time * 3) * 0.06 + 1;
        ctx.save();
        ctx.translate(p.x + p.width * 0.5, p.y + p.height * 0.5);
        ctx.scale(1, bounceScale);

        // Fungal Stalk
        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-p.width * 0.25, 0, p.width * 0.5, p.height * 0.55, 4);
        ctx.fill();
        ctx.stroke();

        // Vibrant Red Mushroom Cap with 3D gradient
        const capGrad = ctx.createRadialGradient(-p.width * 0.1, -p.height * 0.4, 2, 0, 0, p.width * 0.52);
        capGrad.addColorStop(0, '#f87171');
        capGrad.addColorStop(0.65, '#dc2626');
        capGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.width * 0.5, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();

        // White spore polka dots
        ctx.fillStyle = '#ffffff';
        [-p.width * 0.25, 0, p.width * 0.25].forEach((dotX, idx) => {
          ctx.beginPath();
          ctx.arc(dotX, -p.height * (idx === 1 ? 0.35 : 0.18), p.width * 0.08, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else {
        // Gnarled Ancient Rainforest Branch / Moss-Covered Giant Bough
        const isGroundFloor = p.height >= 50;

        // Rich Organic Wood Gradient
        const branchGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        branchGrad.addColorStop(0, pal.trunkColor);
        branchGrad.addColorStop(0.4, '#451a03');
        branchGrad.addColorStop(1, '#1c1917');
        ctx.fillStyle = branchGrad;

        // Rounded natural branch shape
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, isGroundFloor ? 6 : 10);
        ctx.fill();

        // Thick Lush Rainforest Moss Carpet on top
        const mossGrad = ctx.createLinearGradient(p.x, p.y - 4, p.x, p.y + 6);
        mossGrad.addColorStop(0, '#86efac');
        mossGrad.addColorStop(0.5, pal.foliageColor);
        mossGrad.addColorStop(1, '#166534');
        ctx.fillStyle = mossGrad;
        ctx.beginPath();
        ctx.roundRect(p.x - 2, p.y - 4, p.width + 4, 9, 4);
        ctx.fill();

        // Sprouting Rainforest Fern Fronds & blade grass along top edge
        ctx.fillStyle = '#4ade80';
        for (let gx = p.x + 10; gx < p.x + p.width - 10; gx += 26) {
          ctx.beginPath();
          ctx.moveTo(gx, p.y - 3);
          ctx.lineTo(gx + 3, p.y - 9);
          ctx.lineTo(gx + 6, p.y - 3);
          ctx.closePath();
          ctx.fill();
        }

        // Hanging lianas / tropical vine festoons draped underneath
        if (!isGroundFloor) {
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2.5;
          const numVines = Math.floor(p.width / 45);
          for (let v = 0; v < numVines; v++) {
            const vx1 = p.x + 12 + v * 44;
            const vx2 = vx1 + 36;
            const drop = 14 + (v % 2 === 0 ? 12 : 5);
            ctx.beginPath();
            ctx.moveTo(vx1, p.y + p.height - 2);
            ctx.quadraticCurveTo((vx1 + vx2) * 0.5, p.y + p.height + drop, vx2, p.y + p.height - 2);
            ctx.stroke();

            // Hanging Monstera leaflet
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.ellipse((vx1 + vx2) * 0.5, p.y + p.height + drop, 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Blooming Tropical Jungle Wildflowers (Hibiscus & Orchids)
        const flowerStep = isGroundFloor ? 120 : 160;
        for (let fx = p.x + 35; fx < p.x + p.width - 25; fx += flowerStep) {
          ctx.fillStyle = pal.flowerColor;
          ctx.beginPath();
          ctx.arc(fx, p.y - 7, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(fx, p.y - 7, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  }

  /**
   * Foreground framing canopy leaves (Parallax 1.25)
   */
  public renderForeground(
    ctx: CanvasRenderingContext2D,
    world: WorldInfo,
    camera: Camera,
    _time: number
  ) {
    const { viewportWidth: vw } = camera;
    ctx.save();
    ctx.fillStyle = '#0f291e';
    // Top-left lush hanging leaves
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(vw * 0.15, 60, vw * 0.28, 0);
    ctx.fill();
    // Top-right lush hanging leaves
    ctx.beginPath();
    ctx.moveTo(vw, 0);
    ctx.quadraticCurveTo(vw * 0.85, 70, vw * 0.72, 0);
    ctx.fill();
    ctx.restore();
  }
}

export const backgroundEngine = new BackgroundEngine();

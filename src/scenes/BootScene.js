import Phaser from 'phaser';
import { GAME, MODES } from '../config.js';

/** Remet à zéro l'état d'une partie (pièces, décisions impulsives…). */
export function resetRun(registry, mode) {
  registry.set('mode', mode);
  registry.set('coins', 0);
  registry.set('flags', {});
}

const ASSETS = 'assets/kenney_pixel-platformer/';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const w = this.scale.width;
    const h = this.scale.height;
    const bar = this.add.rectangle(w / 2 - 150, h / 2, 0, 4, 0xc9b98f).setOrigin(0, 0.5);
    this.load.on('progress', (p) => (bar.width = 300 * p));

    const ts = GAME.tileSize;
    this.load.spritesheet('tiles', ASSETS + 'tilemap_packed.png', { frameWidth: ts, frameHeight: ts });
    this.load.image('tilesImg', ASSETS + 'tilemap_packed.png');
    this.load.spritesheet('chars', ASSETS + 'tilemap-characters_packed.png', { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet('bg', ASSETS + 'tilemap-backgrounds_packed.png', { frameWidth: 24, frameHeight: 24 });
  }

  create() {
    this.makeBackgrounds();
    this.makeToolTextures();
    this.makeAnims();
    resetRun(this.registry, 'type1');
    // Raccourci de test : ?mode=2&niveau=3 lance directement l'étape 3 du type 2
    const q = new URLSearchParams(location.search);
    const mode = q.get('mode') === '2' ? 'type2' : 'type1';
    const niveau = parseInt(q.get('niveau'), 10);
    if (niveau >= 1 && niveau <= MODES[mode].sequence.length) {
      resetRun(this.registry, mode);
      this.scene.start('Game', { mode, step: niveau - 1 });
    } else this.scene.start('Warning');
  }

  /** Assemble les bandes de décor (ciel / collines / sol) en une texture par ambiance. */
  makeBackgrounds() {
    const sets = { blue: [0, 1, 2, 3], orange: [4, 5], green: [6, 7] };
    for (const [name, cols] of Object.entries(sets)) {
      const tex = this.textures.createCanvas('bg_' + name, cols.length * 24, 72);
      for (let row = 0; row < 3; row++) {
        cols.forEach((col, i) => tex.drawFrame('bg', row * 8 + col, i * 24, row * 24));
      }
      tex.refresh();
    }
  }

  /** Petites icônes dessinées en code pour les outils de stabilisation. */
  makeToolTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const S = 18;
    const outline = 0x3b3f52;

    // Traitement : gélule
    g.clear();
    g.fillStyle(outline).fillRoundedRect(2, 5, 14, 8, 4);
    g.fillStyle(0xf2f0e8).fillRoundedRect(3, 6, 6, 6, { tl: 3, bl: 3, tr: 0, br: 0 });
    g.fillStyle(0x7fb3c8).fillRoundedRect(9, 6, 6, 6, { tl: 0, bl: 0, tr: 3, br: 3 });
    g.generateTexture('tool_traitement', S, S);

    // Suivi : calendrier
    g.clear();
    g.fillStyle(outline).fillRect(2, 3, 14, 13);
    g.fillStyle(0xf2f0e8).fillRect(3, 6, 12, 9);
    g.fillStyle(0xd9725a).fillRect(3, 4, 12, 2);
    g.fillStyle(outline).fillRect(5, 8, 2, 2).fillRect(8, 8, 2, 2).fillRect(11, 8, 2, 2).fillRect(5, 11, 2, 2);
    g.fillStyle(0x7fb3c8).fillRect(8, 11, 2, 2);
    g.generateTexture('tool_suivi', S, S);

    // Diagnostic : bloc-notes avec une coche
    g.clear();
    g.fillStyle(outline).fillRect(3, 2, 12, 15);
    g.fillStyle(0xf2f0e8).fillRect(4, 4, 10, 12);
    g.fillStyle(0x9a8a70).fillRect(6, 1, 6, 3);
    g.fillStyle(outline).fillRect(6, 7, 6, 1).fillRect(6, 10, 4, 1);
    g.fillStyle(0x6fae7a).fillRect(9, 13, 1, 2).fillRect(10, 12, 1, 2).fillRect(11, 11, 1, 2).fillRect(8, 12, 1, 2);
    g.generateTexture('tool_diagnostic', S, S);

    // Entourage : deux silhouettes
    g.clear();
    g.fillStyle(outline).fillCircle(6, 6, 3.5).fillCircle(12, 6, 3.5);
    g.fillStyle(outline).fillRoundedRect(1, 10, 10, 7, 3).fillRoundedRect(7, 10, 10, 7, 3);
    g.fillStyle(0xe8a87c).fillCircle(6, 6, 2.5).fillRoundedRect(2, 11, 8, 5, 2);
    g.fillStyle(0x9fc4a0).fillCircle(12, 6, 2.5).fillRoundedRect(8, 11, 8, 5, 2);
    g.generateTexture('tool_entourage', S, S);

    // Halo doux (réutilisé pour les lueurs)
    g.clear();
    for (let r = 16; r > 0; r--) {
      g.fillStyle(0xffffff, 0.04).fillCircle(16, 16, r);
    }
    g.generateTexture('glow', 32, 32);

    // Sommeil : croissant de lune (canvas, pour pouvoir creuser la forme)
    const moon = this.textures.createCanvas('tool_sommeil', S, S);
    const ctx = moon.getContext();
    ctx.fillStyle = '#3b3f52';
    ctx.beginPath();
    ctx.arc(9, 9, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2e6b0';
    ctx.beginPath();
    ctx.arc(9, 9, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(12.5, 6.5, 5, 0, Math.PI * 2);
    ctx.fill();
    moon.refresh();

    g.destroy();
  }

  makeAnims() {
    this.anims.create({ key: 'player-walk', frames: this.anims.generateFrameNumbers('chars', { frames: [0, 1] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'companion-walk', frames: this.anims.generateFrameNumbers('chars', { frames: [9, 10] }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'carer-walk', frames: this.anims.generateFrameNumbers('chars', { frames: [6, 7] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'coin-spin', frames: this.anims.generateFrameNumbers('tiles', { frames: [151, 152] }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'flag-wave', frames: this.anims.generateFrameNumbers('tiles', { frames: [111, 112] }), frameRate: 4, repeat: -1 });
  }
}

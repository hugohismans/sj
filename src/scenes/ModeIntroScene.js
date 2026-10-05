import Phaser from 'phaser';
import { MODE_INTRO } from '../content/content.js';
import { makeText, makeButton, COLORS } from '../ui/widgets.js';
import { resetRun } from './BootScene.js';

/** Écran court qui explique le type de trouble avant de jouer le mode. */
export default class ModeIntroScene extends Phaser.Scene {
  constructor() {
    super('ModeIntro');
  }

  init(data) {
    this.mode = data.mode;
    this.leaving = false;
  }

  create() {
    const { width: w, height: h } = this.scale;
    const c = MODE_INTRO[this.mode];
    makeText(this, w / 2, h * 0.18, c.title, { fontSize: '32px', color: COLORS.accent });
    makeText(this, w / 2, h * 0.47, c.body.join('\n\n'), { fontSize: '20px', wordWrap: { width: w * 0.74 } });
    makeButton(this, w / 2, h * 0.82, c.button, () => this.start(), { width: 260 });
    this.input.keyboard.once('keydown-ENTER', () => this.start());
    this.cameras.main.fadeIn(500, 27, 29, 38);
  }

  start() {
    if (this.leaving) return;
    this.leaving = true;
    resetRun(this.registry, this.mode);
    this.cameras.main.fadeOut(500, 27, 29, 38);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game', { mode: this.mode, step: 0 }));
  }
}

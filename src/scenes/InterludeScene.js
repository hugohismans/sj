import Phaser from 'phaser';
import { INTERLUDES, INTERLUDE_SPENT, CONTINUE } from '../content/texts.js';
import { makeText, COLORS } from '../ui/widgets.js';
import { LEVELS } from '../levels/index.js';

/** Écran de texte bref entre deux niveaux. */
export default class InterludeScene extends Phaser.Scene {
  constructor() {
    super('Interlude');
  }

  init(data) {
    this.after = data.after; // index du niveau qui vient de se terminer
    this.leaving = false;
  }

  create() {
    const { width: w, height: h } = this.scale;
    const lines = [...INTERLUDES[this.after]];
    if (this.after === 1 && this.registry.get('spentAll')) lines.push(INTERLUDE_SPENT);

    const texts = lines.map((line, i) =>
      makeText(this, w / 2, 0, line, { fontSize: '23px', wordWrap: { width: w * 0.7 } }).setAlpha(0)
    );
    // empilement vertical centré
    const gap = 26;
    const total = texts.reduce((s, t) => s + t.height, 0) + gap * (texts.length - 1);
    let y = h / 2 - total / 2 - 20;
    texts.forEach((t, i) => {
      t.y = y + t.height / 2;
      y += t.height + gap;
      this.tweens.add({ targets: t, alpha: 1, delay: 500 + i * 1600, duration: 1200 });
    });

    const cont = makeText(this, w / 2, h * 0.88, CONTINUE, { fontSize: '16px', color: COLORS.muted }).setAlpha(0);
    const readyAt = 500 + lines.length * 1600;
    this.time.delayedCall(readyAt, () => {
      this.tweens.add({ targets: cont, alpha: 0.8, duration: 800, yoyo: true, repeat: -1, hold: 600 });
      this.input.once('pointerup', () => this.next());
      this.input.keyboard.once('keydown', () => this.next());
    });

    this.cameras.main.fadeIn(700, 27, 29, 38);
  }

  next() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(600, 27, 29, 38);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const nextLevel = this.after + 1;
      if (nextLevel < LEVELS.length) this.scene.start('Game', { level: nextLevel });
      else this.scene.start('End');
    });
  }
}

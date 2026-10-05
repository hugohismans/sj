import Phaser from 'phaser';
import { COMPARISON } from '../content/content.js';
import { MODES } from '../config.js';
import { makeText, makeButton, COLORS } from '../ui/widgets.js';

/** Comparatif simple Type 1 / Type 2. */
export default class CompareScene extends Phaser.Scene {
  constructor() {
    super('Compare');
  }

  init(data) {
    this.mode = data.mode || 'type1';
  }

  create() {
    const { width: w, height: h } = this.scale;
    const C = COMPARISON;
    makeText(this, w / 2, 36, C.title, { fontSize: '28px', color: COLORS.accent });

    const labelX = 40;
    const colX = [330, 650]; // début des colonnes
    const colW = 280;
    C.columns.forEach((name, i) => {
      const mode = i === 0 ? 'type1' : 'type2';
      makeText(this, colX[i] + colW / 2, 84, name + (mode === this.mode ? '  ·  joué' : ''), {
        fontSize: '20px',
        fontStyle: 'bold',
      });
    });

    C.rows.forEach((row, r) => {
      const y = 132 + r * 112;
      makeText(this, labelX, y + 18, row.label, { fontSize: '18px', align: 'left', wordWrap: { width: 250 } }).setOrigin(0, 0.5);
      ['type1', 'type2'].forEach((mode, i) => {
        const cell = row[mode];
        const x = colX[i];
        const color = MODES[mode].gaugeHighColor;
        this.add.rectangle(x, y, colW, 10, 0x2c3040).setOrigin(0, 0.5);
        const bar = this.add.rectangle(x, y, 0, 10, r === 0 ? color : 0x8fa0c0).setOrigin(0, 0.5);
        this.tweens.add({ targets: bar, width: colW * cell.value, duration: 900, delay: 200 + r * 250, ease: 'Cubic.out' });
        makeText(this, x, y + 14, cell.text, {
          fontSize: '15px',
          color: '#c8c6c0',
          align: 'left',
          wordWrap: { width: colW },
        }).setOrigin(0, 0);
      });
    });

    makeText(this, w / 2, h - 96, C.note, { fontSize: '14px', color: COLORS.muted });
    makeButton(this, w / 2 - 130, h - 46, C.resources, () => this.scene.start('Resources', { from: 'Title' }), {
      width: 220,
      height: 48,
    });
    makeButton(this, w / 2 + 130, h - 46, C.title_screen, () => this.scene.start('Title'), {
      width: 220,
      height: 48,
      fill: 0x22252f,
    });
    this.cameras.main.fadeIn(500, 27, 29, 38);
  }
}

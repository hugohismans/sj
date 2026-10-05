import Phaser from 'phaser';
import { RESOURCES } from '../content/texts.js';
import { makeText, makeButton, COLORS } from '../ui/widgets.js';

export default class ResourcesScene extends Phaser.Scene {
  constructor() {
    super('Resources');
  }

  init(data) {
    this.from = data?.from || 'Title';
  }

  create() {
    const { width: w, height: h } = this.scale;
    makeText(this, w / 2, 40, RESOURCES.title, { fontSize: '30px', color: COLORS.accent });
    makeText(this, w / 2, 78, RESOURCES.warning, { fontSize: '16px', color: COLORS.warn, fontStyle: 'bold' });
    makeText(this, w / 2, 106, RESOURCES.intro, { fontSize: '17px', color: COLORS.muted });

    // Trois colonnes en paysage
    const colW = w / RESOURCES.sections.length;
    RESOURCES.sections.forEach((sec, i) => {
      const x = colW * i + colW / 2;
      makeText(this, x, 150, sec.heading, { fontSize: '19px', fontStyle: 'bold' }).setOrigin(0.5, 0);
      makeText(this, x, 186, sec.lines.join('\n\n'), {
        fontSize: '15px',
        align: 'center',
        wordWrap: { width: colW - 36 },
      }).setOrigin(0.5, 0);
    });

    makeButton(this, w / 2, h - 50, RESOURCES.back, () => this.scene.start(this.from), { width: 200, height: 48 });
    this.cameras.main.fadeIn(300, 27, 29, 38);
  }
}

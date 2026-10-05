import Phaser from 'phaser';
import { END } from '../content/content.js';
import { makeText, makeButton, COLORS } from '../ui/widgets.js';
import { moodAudio } from '../audio/MoodAudio.js';

/** Message de fin propre au mode, puis comparatif. */
export default class EndScene extends Phaser.Scene {
  constructor() {
    super('End');
  }

  init(data) {
    this.mode = data.mode || 'type1';
  }

  create() {
    const { width: w, height: h } = this.scale;
    const c = END[this.mode];
    moodAudio.stop();
    makeText(this, w / 2, h * 0.14, c.title, { fontSize: '32px', color: COLORS.accent });
    makeText(this, w / 2, h * 0.45, c.body.join('\n\n'), { fontSize: '20px', wordWrap: { width: w * 0.76 } });
    makeButton(this, w / 2, h * 0.84, END.compare, () => this.scene.start('Compare', { mode: this.mode }), { width: 320 });
    this.cameras.main.fadeIn(900, 27, 29, 38);
  }
}

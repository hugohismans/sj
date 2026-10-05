import Phaser from 'phaser';
import { END } from '../content/texts.js';
import { makeText, makeButton, COLORS } from '../ui/widgets.js';
import { moodAudio } from '../audio/MoodAudio.js';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super('End');
  }

  create() {
    const { width: w, height: h } = this.scale;
    moodAudio.stop();
    makeText(this, w / 2, h * 0.16, END.title, { fontSize: '32px', color: COLORS.accent });
    makeText(this, w / 2, h * 0.45, END.body.join('\n\n'), { fontSize: '20px', wordWrap: { width: w * 0.74 } });
    makeButton(this, w / 2 - 150, h * 0.82, END.resources, () => this.scene.start('Resources', { from: 'End' }), {
      width: 260,
    });
    makeButton(this, w / 2 + 150, h * 0.82, END.restart, () => this.scene.start('Title'), {
      width: 200,
      fill: 0x22252f,
    });
    this.cameras.main.fadeIn(900, 27, 29, 38);
  }
}

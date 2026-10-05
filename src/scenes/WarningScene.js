import Phaser from 'phaser';
import { WARNING } from '../content/content.js';
import { makeText, makeButton, COLORS } from '../ui/widgets.js';
import { moodAudio } from '../audio/MoodAudio.js';

export default class WarningScene extends Phaser.Scene {
  constructor() {
    super('Warning');
  }

  create() {
    const { width: w, height: h } = this.scale;
    makeText(this, w / 2, h * 0.2, WARNING.title, { fontSize: '30px', color: COLORS.accent });
    makeText(this, w / 2, h * 0.47, WARNING.body.join('\n\n'), {
      fontSize: '21px',
      wordWrap: { width: w * 0.72 },
    });
    makeButton(this, w / 2, h * 0.8, WARNING.button, () => {
      moodAudio.unlock(); // premier geste utilisateur : on peut activer le son
      moodAudio.ambient();
      this.cameras.main.fadeOut(400, 27, 29, 38);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Title'));
    });
    this.cameras.main.fadeIn(500, 27, 29, 38);
  }
}

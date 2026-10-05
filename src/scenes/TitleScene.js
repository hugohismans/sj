import Phaser from 'phaser';
import { TITLE } from '../content/texts.js';
import { makeText, makeButton, COLORS } from '../ui/widgets.js';
import { moodAudio } from '../audio/MoodAudio.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.starting = false;
    const { width: w, height: h } = this.scale;

    // Décor : les deux pôles qui se rejoignent lentement
    const left = this.add.circle(w * 0.3, h * 0.42, 70, 0x5b6b8c, 0.35);
    const right = this.add.circle(w * 0.7, h * 0.42, 70, 0xe0884a, 0.35);
    this.tweens.add({ targets: left, x: w * 0.44, duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: right, x: w * 0.56, duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    makeText(this, w / 2, h * 0.36, TITLE.title, { fontSize: '52px', fontStyle: 'bold' });
    makeText(this, w / 2, h * 0.5, TITLE.subtitle, { fontSize: '19px', color: COLORS.muted });

    makeButton(this, w / 2, h * 0.68, TITLE.start, () => this.startGame(), { width: 280 });
    makeButton(this, w / 2, h * 0.81, TITLE.resources, () => this.scene.start('Resources', { from: 'Title' }), {
      width: 200,
      height: 44,
      fontSize: '18px',
      fill: 0x22252f,
    });
    makeText(this, w / 2, h * 0.94, TITLE.hint, { fontSize: '14px', color: COLORS.muted });

    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
    this.cameras.main.fadeIn(500, 27, 29, 38);
  }

  startGame() {
    if (this.starting) return;
    this.starting = true;
    moodAudio.unlock();
    this.registry.set('coins', 0);
    this.registry.set('spentAll', false);
    // Plein écran sur mobile (facultatif, ignoré si refusé)
    if (this.sys.game.device.input.touch && !this.scale.isFullscreen) {
      try {
        this.scale.startFullscreen();
        screen.orientation?.lock?.('landscape').catch(() => {});
      } catch (e) {
        /* pas grave */
      }
    }
    this.cameras.main.fadeOut(500, 27, 29, 38);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game', { level: 0 }));
  }
}

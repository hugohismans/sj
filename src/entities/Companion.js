import Phaser from 'phaser';
import { GAME, COMPANION } from '../config.js';
import { makeText } from '../ui/widgets.js';

/**
 * Le proche / soignant. Il arrive, propose son aide, puis accompagne le joueur.
 * Ses propres déplacements ne dépendent pas de l'humeur : il est stable.
 * Quand il est à côté, le joueur saute plus haut et avance plus facilement.
 */
export default class Companion extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, player) {
    super(scene, x, y, 'chars', 9);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.player = player;
    this.setScale(GAME.scale);
    this.body.setSize(14, 19).setOffset(5, 5);
    this.setDepth(9);
    this.body.setMaxVelocity(400, 900);

    this.bubble = scene.add.container(x, y).setDepth(30).setAlpha(0);
    this.bubbleBg = scene.add.graphics();
    this.bubbleText = makeText(scene, 0, 0, '', { fontSize: '17px', color: '#2a2a33' });
    this.bubble.add([this.bubbleBg, this.bubbleText]);

    this.link = scene.add.graphics().setDepth(8);
    this.supporting = false;
  }

  say(text, duration = 3200) {
    this.bubbleText.setText(text);
    const w = this.bubbleText.width + 24;
    const h = this.bubbleText.height + 14;
    this.bubbleBg.clear();
    this.bubbleBg.fillStyle(0xf4f1ea, 0.95).fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.bubbleBg.fillTriangle(-6, h / 2 - 1, 6, h / 2 - 1, 0, h / 2 + 8);
    this.scene.tweens.killTweensOf(this.bubble);
    this.bubble.setAlpha(0);
    this.scene.tweens.add({ targets: this.bubble, alpha: 1, duration: 400 });
    this.scene.tweens.add({ targets: this.bubble, alpha: 0, duration: 600, delay: duration });
  }

  update(time, dt) {
    const p = this.player;
    const body = this.body;
    const dx = p.x - this.x;
    const dist = Math.abs(dx);
    const onGround = body.blocked.down;

    // suit le joueur en restant à distance douce
    let vx = 0;
    if (dist > COMPANION.followDistance) {
      const speed = Math.max(140, Math.abs(p.body.velocity.x) * COMPANION.followSpeed + 40);
      vx = Math.sign(dx) * Math.min(speed, 120 + dist * 1.5);
    }
    body.setVelocityX(vx);

    // franchit les obstacles : il saute si bloqué ou si le joueur est plus haut
    const blocked = body.blocked.left || body.blocked.right;
    if (onGround && ((blocked && vx !== 0) || (p.y < this.y - 60 && dist < 140))) {
      body.setVelocityY(-760);
    }
    // ne se perd jamais : s'il est trop loin, il revient près du joueur
    if (Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y) > 600) {
      this.setPosition(p.x - Math.sign(dx || 1) * 60, p.y - 20);
      body.setVelocity(0, 0);
    }

    if (vx !== 0) this.setFlipX(vx < 0);
    if (Math.abs(vx) > 5 && onGround) this.anims.play('companion-walk', true);
    else {
      this.anims.stop();
      this.setFrame(9);
    }

    this.bubble.setPosition(this.x, this.y - 56);

    // lien visuel discret quand le soutien agit
    const d = Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y);
    this.supporting = d < COMPANION.supportRadius;
    this.link.clear();
    if (this.supporting) {
      const a = 0.35 * (1 - d / COMPANION.supportRadius) + 0.1;
      this.link.lineStyle(3, 0xf2e6b0, a);
      this.link.lineBetween(this.x, this.y + 6, p.x, p.y + 6);
    }
  }

  destroy(fromScene) {
    this.bubble?.destroy();
    this.link?.destroy();
    super.destroy(fromScene);
  }
}

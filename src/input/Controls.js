import Phaser from 'phaser';

/**
 * État brut des commandes partagé entre l'UI tactile et le clavier.
 * L'UIScene écrit `touch`, la GameScene lit `read()`.
 */
export const touchState = { left: false, right: false, jump: false };

export class Controls {
  constructor(scene) {
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys({
      left: K.LEFT,
      right: K.RIGHT,
      up: K.UP,
      a: K.A,
      q: K.Q,
      d: K.D,
      w: K.W,
      z: K.Z,
      space: K.SPACE,
    });
    this.buffer = []; // historique { t, left, right, jump }
    this.prevJump = false;
  }

  raw() {
    const k = this.keys;
    return {
      left: k.left.isDown || k.a.isDown || k.q.isDown || touchState.left,
      right: k.right.isDown || k.d.isDown || touchState.right,
      jump: k.up.isDown || k.w.isDown || k.z.isDown || k.space.isDown || touchState.jump,
    };
  }

  /**
   * Enregistre l'état du moment et renvoie celui d'il y a `delayMs`.
   * C'est ce décalage qui donne la sensation d'être « en retard sur soi ».
   */
  sample(now, delayMs) {
    const r = this.raw();
    this.buffer.push({ t: now, ...r });
    // on garde ~1,5 s d'historique
    while (this.buffer.length > 2 && this.buffer[1].t < now - 1500) this.buffer.shift();

    let s = this.buffer[this.buffer.length - 1];
    if (delayMs > 1) {
      const target = now - delayMs;
      s = this.buffer[0];
      for (let i = this.buffer.length - 1; i >= 0; i--) {
        if (this.buffer[i].t <= target) {
          s = this.buffer[i];
          break;
        }
      }
      if (s.t > target) s = { left: false, right: false, jump: false };
    }
    const out = {
      left: s.left,
      right: s.right,
      jump: s.jump,
      jumpPressed: s.jump && !this.prevJump,
    };
    this.prevJump = s.jump;
    return out;
  }
}

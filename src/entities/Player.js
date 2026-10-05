import Phaser from 'phaser';
import { GAME } from '../config.js';

/**
 * Joueur. Toute la physique de déplacement est lue dans `mood.params` à chaque
 * frame : vitesse, inertie, saut, gravité… Les modificateurs (aide du proche,
 * dettes) sont appliqués par-dessus via `modifiers`.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'chars', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(GAME.scale);
    this.body.setSize(14, 19).setOffset(5, 5);
    this.setDepth(10);

    // control < 1 : les commandes ne répondent plus qu'en partie (crise)
    this.modifiers = { speed: 1, jump: 1, autoRun: 0, control: 1 };
    this.facing = 1;
    this.lastGrounded = 0;
    this.lastJumpPress = -9999;
    this.jumping = false;
    this.frozen = false;
    this.wasGrounded = true;
    this.stepDist = 0;
    this.fallSpeed = 0;
  }

  update(time, dt, input, p) {
    const body = this.body;
    if (this.frozen) {
      body.setVelocityX(0);
      this.anims.stop();
      return;
    }
    const onGround = body.blocked.down || body.touching.down;
    // bruitages : atterrissage et pas
    if (onGround && !this.wasGrounded && this.fallSpeed > 250) this.emit('land', Math.min(1, this.fallSpeed / 900));
    this.wasGrounded = onGround;
    this.fallSpeed = body.velocity.y;
    if (onGround && Math.abs(body.velocity.x) > 20) {
      this.stepDist += Math.abs(body.velocity.x) * dt;
      if (this.stepDist > 30) {
        this.stepDist = 0;
        this.emit('step');
      }
    }
    if (onGround) {
      this.lastGrounded = time;
      this.jumping = false;
    }

    // --- Horizontal : accélération / inertie
    const m = this.modifiers;
    let dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const maxSpeed = p.moveSpeed * m.speed;
    const autoRun = Math.max(p.autoRun, m.autoRun);
    let vx = body.velocity.x;
    if (dir !== 0 && dir !== this.facing && autoRun > 0.05 && m.control < 1) {
      // en crise : vouloir s'arrêter ou faire demi-tour ne marche presque plus
      vx = approach(vx, dir * maxSpeed, p.acceleration * p.turnFactor * m.control * dt);
    } else if (dir !== 0) {
      let accel = p.acceleration * (onGround ? 1 : p.airControl);
      if (vx !== 0 && Math.sign(vx) !== dir) accel *= p.turnFactor; // demi-tour
      vx = approach(vx, dir * maxSpeed, accel * dt);
    } else if (autoRun > 0.01) {
      // on lâche les commandes… mais le corps continue d'avancer
      vx = approach(vx, this.facing * maxSpeed * autoRun, p.acceleration * 0.5 * dt);
    } else {
      vx = approach(vx, 0, (onGround ? p.deceleration : p.airDeceleration) * dt);
    }
    if (dir !== 0 && (m.control >= 1 || autoRun < 0.05)) this.facing = dir;
    // si l'humeur ralentit soudain, on ne garde pas une vitesse impossible
    if (Math.abs(vx) > maxSpeed && dir !== 0) vx = approach(vx, dir * maxSpeed, p.deceleration * dt);
    body.setVelocityX(vx);

    // --- Saut : tolérance de bord (coyote) + mémoire d'appui (buffer)
    if (input.jumpPressed) this.lastJumpPress = time;
    const canJump = time - this.lastGrounded <= p.coyoteMs && !this.jumping;
    if (canJump && time - this.lastJumpPress <= p.jumpBufferMs) {
      body.setVelocityY(-p.jumpVelocity * this.modifiers.jump);
      this.jumping = true;
      this.lastJumpPress = -9999;
      this.lastGrounded = -9999; // pas de double saut via la tolérance de bord
      this.emit('jump');
    }
    // relâcher tôt = saut plus court
    if (this.jumping && !input.jump && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * p.jumpCut);
      this.jumping = false;
    }
    if (body.velocity.y > p.maxFallSpeed) body.setVelocityY(p.maxFallSpeed);

    // --- Animation
    if (Math.abs(vx) > 5) this.setFlipX(vx < 0);
    if (!onGround) {
      this.anims.stop();
      this.setFrame(1);
    } else if (Math.abs(vx) > 10) {
      this.anims.play('player-walk', true);
      this.anims.timeScale = Phaser.Math.Clamp(Math.abs(vx) / 200, 0.4, 2.2);
    } else {
      this.anims.stop();
      this.setFrame(0);
    }
  }
}

function approach(v, target, delta) {
  if (v < target) return Math.min(v + delta, target);
  return Math.max(v - delta, target);
}

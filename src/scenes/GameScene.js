import Phaser from 'phaser';
import { GAME, COMPANION, MANIC_EXTRAS, STABILISATION } from '../config.js';
import { LEVELS } from '../levels/index.js';
import { COMPANION_LINES, TOOLS, CHOICE } from '../content/texts.js';
import MoodManager from '../mood/MoodManager.js';
import Player from '../entities/Player.js';
import Companion from '../entities/Companion.js';
import { Controls } from '../input/Controls.js';
import { moodAudio } from '../audio/MoodAudio.js';
import { makeText } from '../ui/widgets.js';

const T = GAME.tile; // 36 px
const SOLID = '#';
const ONE_WAY = '=';
const ONE_WAY_TILES = [48, 49, 50];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.levelIndex = data.level ?? 0;
    this.level = LEVELS[this.levelIndex];
    this.finished = false;
    this.paused = false;
    this.respawning = false;
    this.companion = null;
  }

  create() {
    const level = this.level;
    const rows = level.map;
    this.cols = rows[0].length;
    this.rows = rows.length;
    this.worldW = this.cols * T;
    this.worldH = this.rows * T;
    this.isTouch = this.sys.game.device.input.touch;

    this.physics.world.setBounds(0, 0, this.worldW, this.worldH + 400);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.buildBackground(level.background);
    this.buildTilemap(rows);
    this.buildObjects(rows);

    // --- Humeur
    this.mood = new MoodManager(this, level.mood.start);
    this.osc = null;
    if (level.mood.mode === 'oscillation') {
      const S = STABILISATION;
      this.osc = {
        amp: S.startAmplitude,
        targetAmp: S.startAmplitude,
        period: S.periodSeconds,
        phase: Math.asin(Phaser.Math.Clamp((level.mood.start - S.baseMood) / S.startAmplitude, -1, 1)),
      };
      this.mood.followRate = 1.6; // suit l'oscillation de près
    }
    this.toolsCollected = 0;

    // --- Caméra
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, this.worldH);
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setDeadzone(40, 60);
    cam.setRoundPixels(false);
    this.mood.attachCamera(cam);

    // --- Son
    this.mood.attachAudio(moodAudio);
    moodAudio.start();

    // --- Commandes et interface
    this.controls = new Controls(this);
    this.scene.launch('UI', { game: this });
    this.ui = this.scene.get('UI');

    this.events.once('shutdown', () => this.cleanup());
    cam.fadeIn(800, 27, 29, 38);
  }

  // ===========================================================================
  //  Construction du niveau
  // ===========================================================================

  buildBackground(name) {
    const key = 'bg_' + name;
    const src = this.textures.get(key).getSourceImage();
    const scale = (GAME.height / src.height) * 1.2; // marge pour le zoom caméra
    this.bg = this.add
      .tileSprite(GAME.width / 2, GAME.height / 2, (GAME.width * 1.25) / scale, src.height, key)
      .setScale(scale)
      .setScrollFactor(0)
      .setDepth(-10);
    this.bgScale = scale;
  }

  buildTilemap(rows) {
    const at = (x, y) => (y < 0 || y >= this.rows || x < 0 || x >= this.cols ? ' ' : rows[y][x]);
    const data = [];
    for (let y = 0; y < this.rows; y++) {
      const line = [];
      for (let x = 0; x < this.cols; x++) {
        const c = rows[y][x];
        const l = at(x - 1, y);
        const r = at(x + 1, y);
        if (c === SOLID) {
          const top = at(x, y - 1) !== SOLID;
          const hasL = l === SOLID;
          const hasR = r === SOLID;
          const base = top ? 0 : 120; // herbe en surface, terre en dessous
          line.push(base + (!hasL && !hasR ? 0 : !hasL ? 1 : !hasR ? 3 : 2));
        } else if (c === ONE_WAY) {
          line.push(l !== ONE_WAY ? 48 : r !== ONE_WAY ? 50 : 49);
        } else {
          line.push(-1);
        }
      }
      data.push(line);
    }
    const ts = GAME.tileSize;
    const map = this.make.tilemap({ data, tileWidth: ts, tileHeight: ts });
    const tileset = map.addTilesetImage('tilesImg', 'tilesImg', ts, ts, 0, 0);
    this.layer = map.createLayer(0, tileset, 0, 0).setScale(GAME.scale);
    this.layer.setCollisionByExclusion([-1]);
    this.layer.forEachTile((t) => {
      if (ONE_WAY_TILES.includes(t.index)) t.setCollision(false, false, true, false);
    });
  }

  buildObjects(rows) {
    const level = this.level;
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
    this.checkpoints = [];
    this.triggers = [];
    this.tools = [];
    this.hints = [];
    let start = { x: T * 2, y: T * 10 };

    const cx = (x) => x * T + T / 2;
    const cy = (y) => y * T + T / 2;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const c = rows[y][x];
        switch (c) {
          case 'P':
            start = { x: cx(x), y: cy(y) };
            break;
          case 'K':
            this.checkpoints.push({ x: cx(x), y: cy(y) });
            break;
          case 'o': {
            const coin = this.coins.create(cx(x), cy(y), 'tiles', 151).setScale(GAME.scale);
            coin.play({ key: 'coin-spin', startFrame: Phaser.Math.Between(0, 1) });
            coin.body.setSize(12, 12);
            coin.baseY = coin.y;
            coin.seed = Math.random() * 10;
            break;
          }
          case 'F': {
            this.add.image(cx(x), cy(y), 'tiles', 131).setScale(GAME.scale);
            this.flag = this.physics.add
              .sprite(cx(x), cy(y - 1), 'tiles', 111)
              .setScale(GAME.scale)
              .play('flag-wave');
            this.flag.body.allowGravity = false;
            this.flag.body.setSize(14, 36).setOffset(2, 0);
            break;
          }
          case '$':
            this.buildChoiceBox(cx(x), y * T + T);
            break;
          case 'C':
            this.triggers.push({ x: cx(x), type: 'companion-arrive' });
            break;
          default:
            if (c >= 'a' && c <= 'd') this.buildTool(cx(x), cy(y), level.tools[c.charCodeAt(0) - 97]);
            else if (c >= '1' && c <= '9') {
              const ev = level.events[c];
              if (!ev) break;
              this.triggers.push({ x: cx(x), type: ev.type, ev });
              if (ev.type === 'hint') {
                const txt = this.isTouch && ev.touchText ? ev.touchText : ev.text;
                const t = makeText(this, cx(x), cy(y) - T * 3.2, txt, {
                  fontSize: '18px',
                  color: '#2a2a33',
                  backgroundColor: 'rgba(244,241,234,0.85)',
                  padding: { x: 10, y: 6 },
                })
                  .setAlpha(0)
                  .setDepth(6);
                this.hints.push(t);
              }
            }
        }
      }
    }
    this.checkpoints.sort((a, b) => a.x - b.x);
    this.triggers.sort((a, b) => a.x - b.x);
    this.respawnPoint = { ...start };

    this.player = new Player(this, start.x, start.y);
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.overlap(this.player, this.coins, (pl, coin) => this.collectCoin(coin));
    if (this.flag) this.physics.add.overlap(this.player, this.flag, () => this.finishLevel());
    if (this.choiceBox) this.physics.add.overlap(this.player, this.choiceBox.box, () => this.openChoice());
    for (const tool of this.tools) this.physics.add.overlap(this.player, tool.s, () => this.collectTool(tool));
  }

  buildChoiceBox(x, bottomY) {
    const glow = this.add.image(x, bottomY - 40, 'glow').setScale(5).setTint(0xffd36b).setDepth(4);
    const box = this.physics.add.sprite(x, bottomY - 27, 'tiles', 10).setScale(3).setDepth(5);
    box.body.allowGravity = false;
    box.body.setImmovable(true);
    this.tweens.add({ targets: glow, alpha: 0.4, scale: 6.5, duration: 500, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: box, y: box.y - 6, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.choiceBox = { box, glow, used: false };
  }

  buildTool(x, y, kind) {
    const glow = this.add.image(x, y, 'glow').setScale(3).setTint(0xf2e6b0).setAlpha(0.7).setDepth(4);
    const s = this.physics.add.image(x, y, 'tool_' + kind).setScale(GAME.scale).setDepth(5);
    s.body.allowGravity = false;
    this.tweens.add({ targets: [s, glow], y: y - 8, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const label = makeText(this, x, y - 44, TOOLS[kind].name, { fontSize: '15px', color: '#3b3f52' }).setDepth(5);
    const tool = { s, glow, label, kind, taken: false };
    this.tools.push(tool);
  }

  // ===========================================================================
  //  Boucle
  // ===========================================================================

  update(time, delta) {
    if (!this.player) return;
    const dt = Math.min(delta / 1000, 0.05);

    this.updateMoodTarget(dt);
    this.mood.update(dt);
    const p = this.mood.params;

    // Soutien du proche : plus fort quand l'humeur est basse
    const support = this.companion && this.companion.supporting;
    const supportK = support ? Phaser.Math.Clamp(0.3 + this.mood.depressive, 0, 1) : 0;
    const debt = this.levelIndex === 2 && this.registry.get('spentAll') ? MANIC_EXTRAS.spentDebtSpeedMultiplier : 1;
    this.player.modifiers.speed = debt * (1 + (COMPANION.speedBoost - 1) * supportK);
    this.player.modifiers.jump = 1 + (COMPANION.jumpBoost - 1) * supportK;

    const delay = p.inputDelayMs * (support ? COMPANION.inputDelayFactor : 1);
    const input = this.paused || this.finished ? { left: false, right: false, jump: false } : this.controls.sample(time, delay);
    this.player.update(time, dt, input, p);
    if (this.companion) this.companion.update(time, dt);

    this.updateCoins(time, dt);
    this.updateTriggers();
    this.updateHints();
    this.updateCheckpoints();

    // Décor en parallaxe
    const cam = this.cameras.main;
    this.bg.tilePositionX = (cam.scrollX * 0.15) / this.bgScale;

    // Chute dans le vide
    if (this.player.y > this.worldH + 80 && !this.respawning) this.respawn();
  }

  updateMoodTarget(dt) {
    const m = this.level.mood;
    let target;
    if (this.osc) {
      const S = STABILISATION;
      const o = this.osc;
      o.amp += (o.targetAmp - o.amp) * (1 - Math.exp(-S.amplitudeEaseRate * dt));
      o.phase += (dt * Math.PI * 2) / o.period;
      target = S.baseMood + o.amp * Math.sin(o.phase);
    } else {
      const progress = Phaser.Math.Clamp(this.player.x / this.worldW, 0, 1);
      target = sampleCurve(m.curve, progress);
    }
    if (this.companion && target < 0) target += COMPANION.moodLift;
    this.mood.setTarget(target);
  }

  updateCoins(time, dt) {
    if (!this.coins.countActive()) return;
    const manic = this.mood.manic;
    const radius = MANIC_EXTRAS.coinMagnetRadius * (0.3 + manic);
    const pulse = (Math.sin((time / MANIC_EXTRAS.coinGlowPulseMs) * Math.PI) + 1) / 2;
    this.coins.children.iterate((coin) => {
      if (!coin || !coin.active) return;
      // les objets brillants « appellent » davantage en phase maniaque
      coin.setScale(GAME.scale * (1 + manic * 0.35 * pulse));
      coin.y = coin.baseY + Math.sin(time / 300 + coin.seed) * 3 * manic;
      const d = Phaser.Math.Distance.Between(coin.x, coin.baseY, this.player.x, this.player.y);
      if (d < radius) {
        coin.x += (this.player.x - coin.x) * Math.min(1, dt * 6);
        coin.baseY += (this.player.y - coin.baseY) * Math.min(1, dt * 6);
      }
    });
  }

  updateTriggers() {
    while (this.triggers.length && this.player.x >= this.triggers[0].x) {
      const t = this.triggers.shift();
      if (t.type === 'thought') this.ui.forceThought(t.ev.text);
      else if (t.type === 'companion' && this.companion) this.companion.say(t.ev.text);
      else if (t.type === 'companion-arrive') this.scheduleCompanion();
    }
  }

  updateHints() {
    for (const h of this.hints) {
      const d = Math.abs(h.x - this.player.x);
      h.setAlpha(Phaser.Math.Clamp(1.4 - d / 260, 0, 1));
    }
  }

  updateCheckpoints() {
    for (const c of this.checkpoints) {
      if (this.player.x >= c.x && c.x > this.respawnPoint.x && this.player.body.blocked.down) {
        this.respawnPoint = { ...c };
      }
    }
  }

  // ===========================================================================
  //  Événements de jeu
  // ===========================================================================

  collectCoin(coin) {
    coin.disableBody(true, true);
    const n = this.registry.get('coins') + 1;
    this.registry.set('coins', n);
    moodAudio.blip(880 + Math.random() * 200, 0.08, 'square', 0.12);
  }

  openChoice() {
    const cb = this.choiceBox;
    if (!cb || cb.used || this.paused) return;
    cb.used = true;
    this.paused = true;
    this.player.body.setVelocity(0, 0);
    this.physics.pause();
    this.ui.showChoice((yes) => {
      this.paused = false;
      this.physics.resume();
      if (yes) {
        this.registry.set('spentAll', true);
        this.registry.set('coins', 0);
        this.cameras.main.flash(300, 255, 220, 140);
        moodAudio.blip(520, 0.4, 'sawtooth', 0.2);
        this.ui.forceThought(CHOICE.afterYes);
        this.tweens.add({ targets: [cb.box, cb.glow], alpha: 0, scale: 0, duration: 400 });
      } else {
        this.ui.forceThought(CHOICE.afterNo);
        this.tweens.add({ targets: cb.glow, alpha: 0.15, duration: 600 });
        this.tweens.killTweensOf(cb.box);
        cb.box.setAlpha(0.6);
      }
    });
  }

  scheduleCompanion() {
    if (this.companion) return;
    const delay = this.level.companion?.arriveDelayMs ?? 1500;
    this.time.delayedCall(delay, () => this.spawnCompanion([COMPANION_LINES.arrive, COMPANION_LINES.offer]));
  }

  spawnCompanion(lines = []) {
    if (this.companion) return;
    const cam = this.cameras.main;
    const x = Math.max(T, cam.worldView.x - 20);
    this.companion = new Companion(this, x, this.player.y - 40, this.player);
    this.physics.add.collider(this.companion, this.layer);
    moodAudio.blip(440, 0.5, 'sine', 0.2);
    lines.forEach((line, i) => this.time.delayedCall(900 + i * 3600, () => this.companion?.say(line)));
    // paroles d'encouragement de temps en temps, quand il aide
    this.time.addEvent({
      delay: 9000,
      loop: true,
      callback: () => {
        if (this.companion?.supporting && Math.random() < 0.6) {
          this.companion.say(Phaser.Utils.Array.GetRandom(COMPANION_LINES.helping), 2500);
        }
      },
    });
  }

  collectTool(tool) {
    if (tool.taken) return;
    tool.taken = true;
    this.toolsCollected++;
    const S = STABILISATION;
    if (this.osc) {
      this.osc.targetAmp = Math.max(S.minAmplitude, S.startAmplitude * Math.pow(S.dampingPerTool, this.toolsCollected));
      this.osc.period = S.periodSeconds * Math.pow(S.periodGrowthPerTool, this.toolsCollected);
    }
    this.tweens.add({ targets: [tool.s, tool.glow, tool.label], alpha: 0, y: '-=30', duration: 700 });
    moodAudio.blip(392, 0.6, 'sine', 0.22);
    this.ui.showToolInfo(TOOLS[tool.kind]);
    if (tool.kind === 'entourage') this.spawnCompanion([COMPANION_LINES.rejoin]);
  }

  respawn() {
    this.respawning = true;
    const cam = this.cameras.main;
    this.player.frozen = true;
    cam.fadeOut(200, 27, 29, 38);
    this.time.delayedCall(GAME.respawnDelayMs, () => {
      const r = this.respawnPoint;
      this.player.setPosition(r.x, r.y);
      this.player.body.setVelocity(0, 0);
      if (this.companion) this.companion.setPosition(r.x - 50, r.y - 10);
      this.player.frozen = false;
      this.respawning = false;
      cam.fadeIn(300, 27, 29, 38);
    });
  }

  finishLevel() {
    if (this.finished) return;
    this.finished = true;
    this.player.frozen = true;
    moodAudio.blip(523, 0.6, 'triangle', 0.2);
    const cam = this.cameras.main;
    this.time.delayedCall(600, () => {
      cam.fadeOut(1000, 27, 29, 38);
      cam.once('camerafadeoutcomplete', () => {
        this.scene.stop('UI');
        this.scene.start('Interlude', { after: this.levelIndex });
      });
    });
  }

  cleanup() {
    this.mood?.destroy();
    this.companion = null;
    this.choiceBox = null;
  }
}

/** Interpolation linéaire dans une liste de points [x, y] triés. */
function sampleCurve(curve, x) {
  if (x <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i];
    const [x0, y0] = curve[i - 1];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return curve[curve.length - 1][1];
}

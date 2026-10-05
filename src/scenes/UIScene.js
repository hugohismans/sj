import Phaser from 'phaser';
import { GAUGE } from '../config.js';
import { THOUGHTS, LEVEL_NAMES } from '../content/texts.js';
import { touchState } from '../input/Controls.js';
import { makeText, makeButton, FONT } from '../ui/widgets.js';
import { moodAudio } from '../audio/MoodAudio.js';

/**
 * Interface superposée au jeu (non affectée par les effets de caméra) :
 * jauge d'humeur, commandes tactiles, pensées, choix, infos d'outils.
 * Elle aussi réagit à l'humeur (opacité, tremblement, style des pensées).
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  init(data) {
    this.game_ = data.game;
  }

  create() {
    const { width: w, height: h } = this.scale;
    this.w = w;
    this.h = h;
    this.thoughts = [];
    this.thoughtTimer = 2500;
    this.silent = false;
    this.lastPool = [];

    // --- Nom du niveau (discret, disparaît)
    const name = makeText(this, 24, 24, LEVEL_NAMES[this.game_.level.key] || '', {
      fontSize: '18px',
      color: '#e8e6e1',
      stroke: '#1b1d26',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);
    this.tweens.add({ targets: name, alpha: 0, delay: 3500, duration: 1500 });

    // --- Jauge d'humeur
    this.gauge = this.add.container(w / 2, 22);
    const gw = GAUGE.width;
    const track = this.add.graphics();
    const steps = 40;
    const highColor = this.game_.mode.gaugeHighColor ?? GAUGE.manicColor;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const c =
        t < 0.5
          ? Phaser.Display.Color.Interpolate.ColorWithColor(
              Phaser.Display.Color.ValueToColor(GAUGE.depressiveColor),
              Phaser.Display.Color.ValueToColor(GAUGE.stableColor),
              100,
              t * 200
            )
          : Phaser.Display.Color.Interpolate.ColorWithColor(
              Phaser.Display.Color.ValueToColor(GAUGE.stableColor),
              Phaser.Display.Color.ValueToColor(highColor),
              100,
              (t - 0.5) * 200
            );
      track.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      track.fillRect(-gw / 2 + (gw / steps) * i, -GAUGE.height / 2, gw / steps + 1, GAUGE.height);
    }
    const center = this.add.rectangle(0, 0, 2, GAUGE.height + 6, 0xe8e6e1, 0.5);
    this.marker = this.add.circle(0, 0, 7, 0xf4f1ea).setStrokeStyle(2, 0x1b1d26);
    this.gauge.add([track, center, this.marker]);

    // --- Pièces
    this.coinIcon = this.add.image(w - 110, 26, 'tiles', 151).setScale(2).setVisible(false);
    this.coinText = makeText(this, w - 88, 26, '0', {
      fontSize: '20px',
      stroke: '#1b1d26',
      strokeThickness: 4,
    })
      .setOrigin(0, 0.5)
      .setVisible(false);
    this.showCoins = this.game_.coins.countActive() > 0 || this.registry.get('coins') > 0;

    // --- Son on/off
    this.muteBtn = makeText(this, w - 30, 26, moodAudio.muted ? '×' : '♪', { fontSize: '22px' })
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        const m = moodAudio.toggleMute();
        this.muteBtn.setText(m ? '×' : '♪');
      });

    // --- Commandes tactiles
    this.buildTouchControls();

    // --- Calques pour pensées / choix
    this.thoughtLayer = this.add.container(0, 0).setDepth(50);
    this.toolInfo = null;
    this.choice = null;
  }

  // ===========================================================================
  //  Commandes tactiles
  // ===========================================================================

  buildTouchControls() {
    const { w, h } = this;
    const r = 54;
    const mk = (x, y, glyph) => {
      const c = this.add.container(x, y);
      const g = this.add.circle(0, 0, r, 0xf4f1ea, 0.18).setStrokeStyle(3, 0xf4f1ea, 0.5);
      const t = makeText(this, 0, 0, glyph, { fontSize: '30px', color: '#f4f1ea' });
      c.add([g, t]);
      c.circle = g;
      c.r = r;
      return c;
    };
    this.btns = {
      left: mk(90, h - 84, '◀'),
      right: mk(220, h - 84, '▶'),
      jump: mk(w - 100, h - 90, '▲'),
    };
    this.touchUI = this.add.container(0, 0, Object.values(this.btns));
    this.touchUI.setVisible(this.sys.game.device.input.touch);
    // si on touche l'écran sur un appareil non détecté comme tactile, on affiche
    this.input.on('pointerdown', (p) => {
      if (p.wasTouch) this.touchUI.setVisible(true);
    });
  }

  updateTouch() {
    const state = { left: false, right: false, jump: false };
    if (this.touchUI.visible && !this.choice) {
      for (const p of this.input.manager.pointers) {
        if (!p || !p.isDown) continue;
        // zones généreuses : moitié gauche = direction, moitié droite = saut
        if (p.x > this.w * 0.55) {
          state.jump = true;
        } else if (p.x < this.w * 0.45 && p.y > this.h * 0.35) {
          const mid = (this.btns.left.x + this.btns.right.x) / 2;
          if (p.x < mid) state.left = true;
          else state.right = true;
        }
      }
    }
    Object.assign(touchState, state);
    for (const [k, b] of Object.entries(this.btns)) {
      b.circle.setFillStyle(0xf4f1ea, state[k] ? 0.42 : 0.18);
    }
  }

  // ===========================================================================
  //  Boucle
  // ===========================================================================

  update(time, delta) {
    const gs = this.game_;
    if (!gs || !gs.mood) return;
    const mood = gs.mood;
    const p = mood.params;

    this.updateTouch();

    // Jauge : position, opacité et tremblement selon l'humeur
    const jit = p.uiJitter;
    this.marker.x = (mood.value * GAUGE.width) / 2 + (jit ? Phaser.Math.FloatBetween(-jit, jit) : 0);
    this.gauge.y = 22 + (jit ? Phaser.Math.FloatBetween(-jit, jit) * 0.5 : 0);
    this.gauge.setAlpha(p.uiAlpha * 0.85);
    this.touchUI.setAlpha(p.uiAlpha);

    // Pièces
    const coins = this.registry.get('coins');
    this.showCoins = this.showCoins || coins > 0;
    this.coinIcon.setVisible(this.showCoins);
    this.coinText.setVisible(this.showCoins).setText(String(coins));
    this.coinText.setAlpha(p.uiAlpha);
    this.coinIcon.setAlpha(p.uiAlpha);
    // interface saturée en phase haute intense : le compteur s'agite
    const agit = p.uiJitter > 1 ? Math.sin(time / 70) * 0.06 * (p.uiJitter / 3) : 0;
    this.coinIcon.setScale(2 * (1 + agit));
    this.coinText.setScale(1 + agit);

    // Pensées spontanées
    if (!this.choice && !gs.finished && !this.silent) {
      this.thoughtTimer -= delta;
      const alive = this.thoughts.length;
      if (this.thoughtTimer <= 0 && alive < Math.round(p.thoughtMax)) {
        this.spawnThought(this.pickThought());
        this.thoughtTimer = p.thoughtIntervalMs * Phaser.Math.FloatBetween(0.6, 1.4);
      }
    }
  }

  // ===========================================================================
  //  Pensées
  // ===========================================================================

  pickThought() {
    const gs = this.game_;
    const v = gs.mood.value;
    let pool;
    if (v > 0.4) pool = THOUGHTS[gs.mode.highThoughts] || THOUGHTS.manic;
    else if (v < -0.4) {
      pool = THOUGHTS.depressive;
      if (gs.flags.spend && gs.level.key === 'depressive') pool = pool.concat(THOUGHTS.depressiveDebt, THOUGHTS.depressiveDebt);
    } else {
      const k = gs.level.thoughts;
      pool = k === 'stable' || k === 'stabilisation' ? THOUGHTS[k] : THOUGHTS.stable;
    }
    // évite de répéter les dernières pensées
    const fresh = pool.filter((t) => !this.lastPool.includes(t));
    const text = Phaser.Utils.Array.GetRandom(fresh.length ? fresh : pool);
    this.lastPool.push(text);
    if (this.lastPool.length > 4) this.lastPool.shift();
    return text;
  }

  /** Pensée imposée par le niveau ou un événement. */
  forceThought(text) {
    if (!this.thoughtLayer) return;
    // une pensée imposée remplace les pensées calmes en cours
    this.thoughts.filter((t) => t.style !== 'manic').forEach((t) => this.removeThought(t, true));
    this.spawnThought(text);
    this.thoughtTimer = Math.max(this.thoughtTimer, 2500);
  }

  spawnThought(text) {
    const v = this.game_.mood.value;
    const p = this.game_.mood.params;
    if (v > 0.4 && this.game_.mode.highThoughtStyle === 'bubbles') this.spawnManicThought(text, p);
    else this.spawnCalmThought(text, p, v);
  }

  /** Rafale de pensées envahissantes (pic de la crise maniaque). */
  thoughtBurst(n) {
    for (let i = 0; i < n; i++) {
      this.time.delayedCall(i * 160, () => this.spawnManicThought(this.pickThought(), this.game_.mood.params));
    }
  }

  /** Silence : toutes les pensées s'effacent (après l'intervention). */
  clearThoughts() {
    [...this.thoughts].forEach((t) => this.removeThought(t, true));
    this.silent = true;
  }

  /** Bulles rapides, envahissantes, un peu partout. */
  spawnManicThought(text, p) {
    moodAudio.thoughtPop();
    const { w, h } = this;
    const x = Phaser.Math.Between(w * 0.18, w * 0.82);
    const y = Phaser.Math.Between(h * 0.14, h * 0.62);
    const c = this.add.container(x, y);
    const t = this.add.text(0, 0, text, {
      fontFamily: FONT,
      fontSize: Phaser.Math.Between(19, 26) + 'px',
      fontStyle: 'bold',
      color: '#2a1a10',
      resolution: 2,
    });
    t.setOrigin(0.5);
    const bw = t.width + 26;
    const bh = t.height + 16;
    const g = this.add.graphics();
    const tint = Phaser.Utils.Array.GetRandom([0xfff4d6, 0xffe1c2, 0xfff9b8, 0xffd6e0]);
    g.fillStyle(tint, 0.95).fillRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2);
    g.lineStyle(2, 0xe0884a, 0.8).strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2);
    c.add([g, t]);
    c.x = Phaser.Math.Clamp(x, bw / 2 + 70, w - bw / 2 - 70); // reste lisible à l'écran
    c.setAngle(Phaser.Math.Between(-7, 7)).setScale(0.2).setAlpha(0);
    this.thoughtLayer.add(c);
    const th = { obj: c, style: 'manic' };
    this.thoughts.push(th);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 140, ease: 'Back.out' });
    this.tweens.add({
      targets: c,
      x: c.x + Phaser.Math.Between(-50, 50),
      y: y + Phaser.Math.Between(-30, 30),
      duration: p.thoughtLifeMs,
    });
    this.time.delayedCall(p.thoughtLifeMs, () => this.removeThought(th));
  }

  /** Pensée posée en bas de l'écran ; en phase dépressive, les mots arrivent lentement. */
  spawnCalmThought(text, p, v) {
    const { w, h } = this;
    const heavy = v < -0.4;
    if (heavy) moodAudio.thoughtHeavy();
    const warm = v > 0.4; // hypomanie : pensées agréables, couleur chaude
    const t = this.add.text(w / 2, h * 0.27, '', {
      fontFamily: FONT,
      fontSize: heavy ? '24px' : '20px',
      fontStyle: 'italic',
      color: heavy ? '#b9bcc6' : warm ? '#fff1c2' : '#f4f1ea',
      stroke: '#1b1d26',
      strokeThickness: 4,
      align: 'center',
      resolution: 2,
    });
    t.setOrigin(0.5).setAlpha(0);
    this.thoughtLayer.add(t);
    const th = { obj: t, style: heavy ? 'heavy' : 'calm' };
    this.thoughts.push(th);

    const typeMs = p.thoughtTypeSpeed;
    if (typeMs > 5) {
      let i = 0;
      th.typer = this.time.addEvent({
        delay: typeMs,
        repeat: text.length - 1,
        callback: () => t.setText(text.slice(0, ++i)),
      });
    } else t.setText(text);

    const life = p.thoughtLifeMs + (typeMs > 5 ? typeMs * text.length : 0);
    this.tweens.add({ targets: t, alpha: 0.95, duration: heavy ? 1500 : 500 });
    if (heavy) this.tweens.add({ targets: t, y: t.y + 8, duration: life });
    this.time.delayedCall(life, () => this.removeThought(th));
  }

  removeThought(th, fast = false) {
    if (th.removed) return;
    th.removed = true;
    th.typer?.remove();
    this.thoughts = this.thoughts.filter((x) => x !== th);
    this.tweens.add({
      targets: th.obj,
      alpha: 0,
      duration: fast ? 200 : th.style === 'manic' ? 160 : 1200,
      onComplete: () => th.obj.destroy(),
    });
  }

  // ===========================================================================
  //  Outils (stabilisation)
  // ===========================================================================

  showToolInfo(tool) {
    const { w } = this;
    this.toolInfo?.destroy();
    const c = this.add.container(w / 2, 82).setAlpha(0).setDepth(60);
    const title = makeText(this, 0, -14, tool.name, { fontSize: '22px', color: '#f2e6b0', fontStyle: 'bold' });
    const body = makeText(this, 0, 16, tool.text, { fontSize: '17px' });
    const bw = Math.max(title.width, body.width) + 40;
    const bg = this.add.graphics();
    bg.fillStyle(0x1b1d26, 0.75).fillRoundedRect(-bw / 2, -40, bw, 80, 12);
    c.add([bg, title, body]);
    this.toolInfo = c;
    this.tweens.add({ targets: c, alpha: 1, duration: 500 });
    this.tweens.add({ targets: c, alpha: 0, duration: 800, delay: 4200 });
  }

  // ===========================================================================
  //  Choix impulsif
  // ===========================================================================

  showChoice(def, onResult) {
    const { w, h } = this;
    Object.assign(touchState, { left: false, right: false, jump: false });
    const c = this.add.container(0, 0).setDepth(80);
    const shade = this.add.rectangle(w / 2, h / 2, w, h, 0x3a1a00, 0.35).setInteractive();
    const title = makeText(this, w / 2, h * 0.24, def.title, {
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#fff1c2',
      stroke: '#a0400a',
      strokeThickness: 6,
    });
    const body = makeText(this, w / 2, h * 0.4, def.body, {
      fontSize: '24px',
      color: '#fff8e8',
      stroke: '#2a1a10',
      strokeThickness: 5,
    });
    let done = false;
    const pick = (yes) => {
      if (done) return;
      done = true;
      this.tweens.add({
        targets: c,
        alpha: 0,
        duration: 250,
        onComplete: () => {
          c.destroy();
          this.choice = null;
          onResult(yes);
        },
      });
    };
    // Le « oui » est gros, brillant, tentant. Le « non » est petit.
    const yes = makeButton(this, w / 2, h * 0.6, def.yes, () => pick(true), {
      width: 360,
      height: 74,
      fontSize: '28px',
      fill: 0xe0702a,
      stroke: 0xfff1c2,
      textColor: '#fff8e8',
    });
    const no = makeButton(this, w / 2, h * 0.78, def.no, () => pick(false), {
      width: 130,
      height: 36,
      fontSize: '15px',
      fill: 0x3a2a20,
      stroke: 0x6a5a4a,
      textColor: '#c8b8a8',
    });
    c.add([shade, title, body, yes, no]);
    this.tweens.add({ targets: yes, scale: 1.08, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: title, angle: { from: -2, to: 2 }, duration: 120, yoyo: true, repeat: -1 });
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 200 });
    this.choice = c;

    // Clavier : Entrée/Espace = oui (le réflexe), Échap/N = attendre
    const kb = this.input.keyboard;
    const onKey = (e) => {
      if (['Enter', ' ', 'o', 'O', 'y', 'Y'].includes(e.key)) pick(true);
      else if (['Escape', 'n', 'N'].includes(e.key)) pick(false);
      if (done) kb.off('keydown', onKey);
    };
    // petit délai pour éviter qu'un saut en cours ne valide le choix par accident
    this.time.delayedCall(600, () => kb.on('keydown', onKey));
  }
}

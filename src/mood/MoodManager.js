import Phaser from 'phaser';
import { GAME, MOOD_PROFILES } from '../config.js';

const { STABLE, MANIC, DEPRESSIVE } = MOOD_PROFILES;
const KEYS = Object.keys(STABLE);

/**
 * MoodManager
 * - tient une humeur continue `value` dans [-1, 1] qui glisse vers `target`
 * - calcule les paramètres courants (`params`) par interpolation des profils
 * - applique les effets : physique, image (post-FX), caméra, son
 *
 * Les autres systèmes (joueur, UI, pensées) lisent `mood.params` à chaque frame.
 */
export default class MoodManager extends Phaser.Events.EventEmitter {
  constructor(scene, initialValue = 0) {
    super();
    this.scene = scene;
    this.value = initialValue;
    this.target = initialValue;
    this.followRate = GAME.moodFollowRate;
    this.params = {};
    this.time = 0;
    this.label = null; // nom de phase imposé par le niveau (ex. « stabilisation »)
    this._computeParams();

    this.fx = null;
    this.audio = null;
    this._lastState = this.state;
  }

  // ---------------------------------------------------------------- état ----

  /** 'depressive' | 'stable' | 'manic' (selon la valeur courante) */
  get state() {
    if (this.value <= -0.45) return 'depressive';
    if (this.value >= 0.45) return 'manic';
    return 'stable';
  }

  /** Intensité de la phase maniaque (0..1) et dépressive (0..1) */
  get manic() {
    return Math.max(0, this.value);
  }

  get depressive() {
    return Math.max(0, -this.value);
  }

  setTarget(v, rate) {
    this.target = Phaser.Math.Clamp(v, -1, 1);
    if (rate !== undefined) this.followRate = rate;
  }

  setImmediate(v) {
    this.value = this.target = Phaser.Math.Clamp(v, -1, 1);
    this._computeParams();
  }

  // -------------------------------------------------------- interpolation ----

  _computeParams() {
    const v = this.value;
    const other = v >= 0 ? MANIC : DEPRESSIVE;
    // courbe douce : les petites variations restent proches de la stabilité
    const t = easeInOut(Math.abs(v));
    for (const k of KEYS) {
      this.params[k] = STABLE[k] + (other[k] - STABLE[k]) * t;
    }
  }

  // --------------------------------------------------------------- effets ----

  /** Branche les effets visuels sur la caméra principale de la scène. */
  attachCamera(camera) {
    this.camera = camera;
    this.baseZoom = camera.zoom;
    const renderer = this.scene.sys.game.renderer;
    if (renderer.type === Phaser.WEBGL && camera.postFX) {
      this.fx = {
        color: camera.postFX.addColorMatrix(),
        vignette: camera.postFX.addVignette(0.5, 0.5, 0.75, 0.15),
      };
    }
  }

  attachAudio(audio) {
    this.audio = audio;
  }

  update(dt) {
    this.time += dt;

    // L'humeur rejoint sa cible progressivement (lissage exponentiel)
    const k = 1 - Math.exp(-this.followRate * dt);
    this.value += (this.target - this.value) * k;
    this._computeParams();

    const p = this.params;

    // --- Physique
    this.scene.physics.world.gravity.y = p.gravity;

    // --- Image
    if (this.fx) {
      const c = this.fx.color;
      c.reset();
      // saturate(-1.5) = niveaux de gris ; on ramène l'échelle de config à -1..1
      c.saturate(p.saturation < 0 ? p.saturation * 1.5 : p.saturation, true);
      c.brightness(p.brightness, true);
      if (Math.abs(p.contrast) > 0.001) c.contrast(p.contrast, true);
      if (Math.abs(p.hue) > 0.01) c.hue(p.hue, true);
      this.fx.vignette.strength = p.vignetteStrength;
      this.fx.vignette.radius = p.vignetteRadius;
    }

    // --- Caméra : suivi, tremblement nerveux, zoom pulsé sur le tempo
    if (this.camera) {
      const cam = this.camera;
      cam.setLerp(p.cameraLerp, p.cameraLerp * 1.4);
      const beat = (this.time * p.tempo) / 60;
      const pulse = Math.pow(Math.max(0, Math.cos(beat * Math.PI * 2)), 6);
      cam.setZoom(p.cameraZoom + pulse * p.cameraZoomPulse);
      if (p.cameraShake > 0.05) {
        const f = p.cameraJitterHz;
        // bruit pseudo-aléatoire mais continu (pas de saccades d'un frame à l'autre)
        const jx = Math.sin(this.time * f * 1.7) * 0.6 + Math.sin(this.time * f * 3.1 + 1.3) * 0.4;
        const jy = Math.sin(this.time * f * 2.3 + 0.7) * 0.6 + Math.sin(this.time * f * 4.1) * 0.4;
        cam.setFollowOffset(jx * p.cameraShake, jy * p.cameraShake);
      } else {
        cam.setFollowOffset(0, 0);
      }
    }

    // --- Son
    if (this.audio) this.audio.setParams(p);

    const s = this.state;
    if (s !== this._lastState) {
      this.emit('statechange', s, this._lastState);
      this._lastState = s;
    }
  }

  destroy() {
    if (this.camera && this.fx) {
      this.camera.postFX.clear();
    }
    this.fx = null;
    this.removeAllListeners();
  }
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

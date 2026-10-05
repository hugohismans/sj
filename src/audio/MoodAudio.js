/**
 * MoodAudio — musique générative et bruitages, tout en WebAudio.
 * Aucun fichier audio : tout est synthétisé, ce qui permet de faire glisser
 * en continu le tempo, l'harmonie, la saturation, l'ondulation de la bande,
 * la transposition, la réverbération… au rythme de l'humeur.
 *
 * Chaîne du signal :
 *   musique ─┐
 *            ├─► sec ──────────────┐
 *   bruitages┘─► saturation ───────┼─► passe-bas ─► compresseur ─► sortie
 *            └─► grain (crush) ────┘        └─► réverbération ─┘
 *
 * Paramètres lus dans MoodManager.params (voir config.js) :
 *   tempo, lowpassHz, musicVolume, noteDensity, hatVolume, kickVolume,
 *   heartbeat, padVolume, arpVolume, bassVolume, pump, distortion, crush,
 *   wobble, pitchShift, reverb, noiseVolume, tinnitus, sfxVolume
 */
import { AUDIO, MOOD_PROFILES } from '../config.js';

const ROOT = 146.83; // ré 3

// Harmonie selon l'humeur : couleurs claires en haut, sombres en bas.
// Accords et gammes en demi-tons au-dessus de la tonique.
const HARMONY = {
  high: {
    chords: [
      [0, 4, 7, 11], // Rémaj7
      [7, 11, 14, 18], // La add9
      [9, 12, 16, 19], // Sim7
      [5, 9, 12, 16], // Solmaj7
    ],
    scale: [0, 2, 4, 7, 9, 11, 12, 14, 16, 19, 21, 23, 24],
  },
  mid: {
    chords: [
      [0, 3, 7, 10], // Rém7
      [-4, 0, 3, 7], // Sib maj7
      [3, 7, 10, 14], // Fa maj7
      [-2, 2, 5, 9], // Do maj7
    ],
    scale: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22],
  },
  low: {
    chords: [
      [0, 3, 7], // Rém
      [-4, 0, 3], // Sib
      [-7, -4, 0], // Solm
      [-5, -1, 2], // La (tension, ne se résout pas)
    ],
    scale: [0, 3, 5, 7, 8, 12, 15],
  },
};

const DEFAULTS = { ...MOOD_PROFILES.STABLE };

class MoodAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.playing = false;
    this.params = { ...DEFAULTS };
    this.stepIndex = 0; // position dans le séquenceur (doubles croches)
    this.nextTime = 0;
    this.arpIndex = 4;
    this.hushUntil = 0;
    this._last = {};
  }

  // ===========================================================================
  //  Mise en place
  // ===========================================================================

  /** À appeler suite à un geste utilisateur (contrainte des navigateurs mobiles). */
  unlock() {
    // iPhone : sans ça, le bouton « silencieux » coupe tout le son WebAudio
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch (e) {
      /* non supporté */
    }
    this._unlockHtmlAudio();
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this._build();
    }
    // 'interrupted' : Safari après un appel, un passage en arrière-plan…
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    // petit son inaudible joué pendant le geste : débloque les anciens iOS
    if (!this._primed) {
      this._primed = true;
      const b = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = b;
      src.connect(this.ctx.destination);
      src.start(0);
    }
  }

  get running() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  /**
   * Anciens iPhone (sans navigator.audioSession) : jouer un élément <audio>
   * silencieux en boucle fait passer la page en mode « lecture », ce qui
   * permet d'entendre le WebAudio même avec le bouton silencieux activé.
   */
  _unlockHtmlAudio() {
    if (navigator.audioSession || this._htmlAudio) return;
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
    if (!ios) return;
    const el = document.createElement('audio');
    el.setAttribute('x-webkit-airplay', 'deny');
    el.preload = 'auto';
    el.loop = true;
    el.src = SILENT_WAV;
    el.setAttribute('playsinline', '');
    el.play().catch(() => {
      this._htmlAudio = null; // réessaiera au prochain geste
    });
    this._htmlAudio = el;
  }

  _build() {
    const ctx = this.ctx;
    const g = (v = 1) => {
      const n = ctx.createGain();
      n.gain.value = v;
      return n;
    };

    // Bus d'entrée
    this.musicBus = g(0); // volume musique (+ pompe)
    this.pumpGain = g(1);
    this.sfxBus = g(0.6);
    this.input = g(1);
    this.musicBus.connect(this.pumpGain).connect(this.input);
    this.sfxBus.connect(this.input);

    // Saturation et grain en parallèle du signal sec
    this.dry = g(1);
    this.driveWet = g(0);
    this.crushWet = g(0);
    // gain d'entrée fort puis compensation : les crêtes saturent, le volume
    // moyen reste comparable au signal sec
    this.drive = ctx.createWaveShaper();
    this.drive.curve = makeDriveCurve(3);
    this.drive.oversample = '2x';
    this.crusher = ctx.createWaveShaper();
    this.crusher.curve = makeCrushCurve(5);
    const preDrive = g(6);
    const postDrive = g(1 / 6);
    const preCrush = g(5);
    const postCrush = g(1 / 5);
    this.input.connect(this.dry);
    this.input.connect(preDrive).connect(this.drive).connect(postDrive).connect(this.driveWet);
    this.input.connect(preCrush).connect(this.crusher).connect(postCrush).connect(this.crushWet);

    // Passe-bas (son étouffé)
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 9000;
    this.filter.Q.value = 0.8;
    [this.dry, this.driveWet, this.crushWet].forEach((n) => n.connect(this.filter));

    // Réverbération (réponse impulsionnelle générée)
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeImpulse(ctx, 3.4, 2.6);
    this.reverbSend = g(0.2);
    this.filter.connect(this.reverbSend).connect(this.reverb);

    // Sortie
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -16;
    this.comp.ratio.value = 4;
    this.master = g(0);
    this.filter.connect(this.comp);
    this.reverb.connect(this.comp);
    this.comp.connect(this.master).connect(ctx.destination);

    // Ondulation de bande : un LFO commun module la hauteur de toutes les voix
    this.wobbleLfo = ctx.createOscillator();
    this.wobbleLfo.frequency.value = AUDIO.wobbleRateHz;
    this.wobbleDepth = g(0);
    this.wobbleLfo.connect(this.wobbleDepth);
    this.wobbleLfo.start();
    // un second LFO, plus rapide et faible : le « flutter »
    this.flutterLfo = ctx.createOscillator();
    this.flutterLfo.frequency.value = 5.3;
    this.flutterDepth = g(0);
    this.flutterLfo.connect(this.flutterDepth);
    this.flutterLfo.start();

    // Souffle de fond (bande / pièce vide)
    this.noise = makeNoise(ctx, 2);
    const hiss = ctx.createBufferSource();
    hiss.buffer = this.noise;
    hiss.loop = true;
    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.value = 1800;
    hissFilter.Q.value = 0.4;
    this.hissGain = g(0);
    hiss.connect(hissFilter).connect(this.hissGain).connect(this.filter);
    hiss.start();

    // Sifflement aigu (trop de stimulation)
    const tin = ctx.createOscillator();
    tin.frequency.value = 6800;
    this.tinGain = g(0);
    tin.connect(this.tinGain).connect(this.comp);
    tin.start();

    this._applyParams(this.params, true);
  }

  start() {
    this.unlock();
    if (!this.ctx || this.playing) return;
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this._schedule(), 25);
    this._applyParams(this.params, true);
  }

  stop() {
    this.playing = false;
    clearInterval(this.timer);
    if (this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
  }

  toggleMute() {
    this.muted = !this.muted;
    this._applyParams(this.params, true);
    return this.muted;
  }

  /** Ambiance des menus et écrans de texte : calme, lointaine. */
  ambient() {
    this.moodValue = 0;
    this.start();
    this.setParams({ ...DEFAULTS, ...AUDIO.menu });
  }

  setParams(p) {
    this.params = p;
    if (this.ctx) this._applyParams(p, false);
  }

  _applyParams(p, force) {
    const t = this.ctx.currentTime;
    const set = (key, param, value, tc = 0.25, eps = 0.002) => {
      if (!force && Math.abs((this._last[key] ?? Infinity) - value) < eps) return;
      this._last[key] = value;
      param.setTargetAtTime(value, t, tc);
    };
    const on = this.playing && !this.muted;
    const hushed = t < this.hushUntil;
    set('master', this.master.gain, on ? AUDIO.masterVolume : 0, 0.3);
    set('music', this.musicBus.gain, hushed ? p.musicVolume * 0.08 : p.musicVolume, hushed ? 0.08 : 0.6);
    set('sfx', this.sfxBus.gain, p.sfxVolume);
    set('lp', this.filter.frequency, p.lowpassHz, 0.3, 5);
    // saturation : on retire du signal sec ce qu'on ajoute de sale
    const d = clamp01(p.distortion);
    const c = clamp01(p.crush);
    set('dry', this.dry.gain, Math.max(0.15, 1 - d * 0.7 - c * 0.5));
    set('drive', this.driveWet.gain, d * 2.2);
    set('crush', this.crushWet.gain, c * 1.4);
    set('rev', this.reverbSend.gain, p.reverb * 1.4);
    set('wob', this.wobbleDepth.gain, p.wobble, 0.5, 0.2);
    set('flut', this.flutterDepth.gain, p.wobble * 0.18, 0.5, 0.2);
    set('hiss', this.hissGain.gain, p.noiseVolume * 0.5);
    set('tin', this.tinGain.gain, p.tinnitus * 0.05, 0.6, 0.0005);
  }

  // ===========================================================================
  //  Séquenceur
  // ===========================================================================

  _schedule() {
    if (!this.playing) return;
    const ctx = this.ctx;
    // réapplique en continu (le « hush » se termine tout seul)
    if (ctx.currentTime >= this.hushUntil && this._last.music !== this.params.musicVolume) {
      this._applyParams(this.params, false);
    }
    while (this.nextTime < ctx.currentTime + 0.12) {
      this._playStep(this.stepIndex, this.nextTime);
      const sixteenth = 60 / Math.max(30, this.params.tempo) / 4;
      this.nextTime += sixteenth;
      this.stepIndex++;
    }
  }

  _harmony() {
    // en stabilisation, l'humeur passe souvent par le milieu : seuils larges
    const v = this.moodValue ?? 0;
    return v > 0.35 ? HARMONY.high : v < -0.35 ? HARMONY.low : HARMONY.mid;
  }

  _freq(semi) {
    return ROOT * Math.pow(2, (semi + this.params.pitchShift) / 12);
  }

  _playStep(step, t) {
    const p = this.params;
    const H = this._harmony();
    const bar = Math.floor(step / 16) % H.chords.length;
    const chord = H.chords[bar];
    const s16 = step % 16;
    const beat = 60 / Math.max(30, p.tempo);

    // Nappe : accord tenu sur la mesure entière
    if (s16 === 0 && p.padVolume > 0.01) {
      const len = beat * 4.2;
      chord.forEach((semi, i) =>
        this._voice(this._freq(semi), t, len, {
          type: 'sawtooth',
          vol: 0.035 * p.padVolume,
          attack: beat * 1.2,
          release: beat * 1.6,
          detune: (i % 2 ? 7 : -7),
          lp: 1400,
        })
      );
    }

    // Basse
    if (p.bassVolume > 0.01) {
      const fast = p.tempo > 120;
      if (s16 === 0 || s16 === 8 || (fast && (s16 === 4 || s16 === 12)) || (fast && s16 % 2 === 0 && Math.random() < 0.3)) {
        this._voice(this._freq(chord[0] - 12), t, beat * (fast ? 0.45 : 1.6), {
          type: 'triangle',
          vol: 0.16 * p.bassVolume,
          attack: 0.01,
          release: beat * (fast ? 0.35 : 1.2),
        });
      }
    }

    // Grosse caisse (et effet de pompe)
    if (p.kickVolume > 0.01) {
      const fourFloor = p.kickVolume > 0.35;
      if (s16 % (fourFloor ? 4 : 8) === 0) {
        this._kick(t, p.kickVolume);
        if (p.pump > 0.01) this._pump(t, p.pump, beat);
      }
    }

    // Battement de cœur : « boum… boum » lourd
    if (p.heartbeat > 0.01 && (s16 === 0 || s16 === 3)) {
      this._kick(t, p.heartbeat * (s16 === 0 ? 1 : 0.7), 55, 0.25);
    }

    // Charleston
    if (p.hatVolume > 0.01 && s16 % 2 === 1) this._hat(t, p.hatVolume);

    // Arpège / mélodie : notes de l'accord surtout, quelques notes de passage
    const onGrid = p.tempo > 110 ? true : s16 % 2 === 0;
    if (onGrid && p.arpVolume > 0.01 && Math.random() < p.noteDensity) {
      let semi;
      if (Math.random() < 0.65) {
        semi = chord[Math.floor(Math.random() * chord.length)] + 12 * (Math.random() < 0.5 ? 1 : 0);
      } else {
        this.arpIndex += Math.round((Math.random() - 0.45) * 3);
        this.arpIndex = Math.max(0, Math.min(H.scale.length - 1, this.arpIndex));
        semi = H.scale[this.arpIndex];
      }
      const len = Math.min(0.9, beat * (p.tempo > 110 ? 0.4 : 0.9));
      this._voice(this._freq(semi + 12), t, len, {
        type: p.tempo > 130 ? 'square' : 'triangle',
        vol: 0.07 * p.arpVolume * (p.tempo > 130 ? 0.6 : 1),
        attack: 0.005,
        release: len,
      });
      // écho discret en phase haute, traînant en phase basse
      if (p.reverb > 0.4 && Math.random() < 0.4) {
        this._voice(this._freq(semi + 12), t + beat * 0.75, len, {
          type: 'sine',
          vol: 0.03 * p.arpVolume,
          attack: 0.02,
          release: len * 1.5,
        });
      }
    }
  }

  // ===========================================================================
  //  Instruments
  // ===========================================================================

  /** Une voix synthétique, reliée à l'ondulation de bande. */
  _voice(freq, t, dur, { type = 'triangle', vol = 0.1, attack = 0.01, release = 0.3, detune = 0, lp = 0, bus } = {}) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const gn = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    this.wobbleDepth.connect(o.detune);
    this.flutterDepth.connect(o.detune);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + Math.max(0.004, attack));
    gn.gain.setTargetAtTime(0.0001, t + Math.max(attack, dur - release * 0.3), release / 3);
    let out = gn;
    if (lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lp;
      gn.connect(f);
      out = f;
    }
    o.connect(gn);
    out.connect(bus || this.musicBus);
    const end = t + dur + release + 0.1;
    o.start(t);
    o.stop(end);
    o.onended = () => {
      try {
        this.wobbleDepth.disconnect(o.detune);
        this.flutterDepth.disconnect(o.detune);
      } catch (e) {
        /* déjà déconnecté */
      }
    };
  }

  _kick(t, vol, base = 50, dur = 0.18) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const gn = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(base * 3, t);
    o.frequency.exponentialRampToValueAtTime(base, t + 0.06);
    gn.gain.setValueAtTime(0.5 * vol, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn).connect(this.musicBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  _hat(t, vol) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(vol, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    src.connect(hp).connect(gn).connect(this.musicBus);
    src.start(t, Math.random());
    src.stop(t + 0.05);
  }

  /** La musique « respire » au rythme de la grosse caisse. */
  _pump(t, amount, beat) {
    const gp = this.pumpGain.gain;
    gp.cancelScheduledValues(t);
    gp.setValueAtTime(1 - amount * 0.7, t);
    gp.linearRampToValueAtTime(1, t + beat * 0.8);
  }

  /** Bruit filtré court (pas, chocs, souffles). */
  _noiseHit(t, { vol = 0.2, freq = 800, q = 1, dur = 0.08, type = 'bandpass', sweepTo } = {}) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.01, dur / 3));
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(gn).connect(this.sfxBus);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  _sfxTone(freq, t, dur, opts = {}) {
    this._voice(freq, t, dur, { attack: 0.005, release: dur, ...opts, bus: this.sfxBus });
  }

  // ===========================================================================
  //  Bruitages (tous passent par la chaîne d'humeur : étouffés en bas, vifs en haut)
  // ===========================================================================

  _ready() {
    return this.ctx && !this.muted;
  }

  /** Mood courant (-1..1), fourni par la scène, pour colorer les bruitages. */
  setMoodValue(v) {
    this.moodValue = v;
  }

  step() {
    if (!this._ready()) return;
    const v = this.moodValue ?? 0;
    const t = this.ctx.currentTime;
    if (v < -0.3) this._noiseHit(t, { vol: 0.22, freq: 180, q: 0.8, dur: 0.16, type: 'lowpass' }); // pas lourds
    else if (v > 0.3) this._noiseHit(t, { vol: 0.08, freq: 3200, q: 2, dur: 0.03 }); // pas légers, rapides
    else this._noiseHit(t, { vol: 0.1, freq: 900, q: 1.2, dur: 0.05 });
  }

  jump() {
    if (!this._ready()) return;
    const v = this.moodValue ?? 0;
    const t = this.ctx.currentTime;
    const f = this._freq(v > 0.3 ? 19 : v < -0.3 ? 0 : 12);
    const o = this.ctx.createOscillator();
    const gn = this.ctx.createGain();
    o.type = v > 0.3 ? 'square' : 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * (v < -0.3 ? 1.15 : 2), t + (v < -0.3 ? 0.18 : 0.12));
    gn.gain.setValueAtTime(v > 0.3 ? 0.06 : 0.12, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(gn).connect(this.sfxBus);
    o.start(t);
    o.stop(t + 0.25);
  }

  land(intensity = 1) {
    if (!this._ready()) return;
    const v = this.moodValue ?? 0;
    const t = this.ctx.currentTime;
    this._noiseHit(t, { vol: 0.12 + 0.15 * intensity + (v < -0.3 ? 0.1 : 0), freq: v < -0.3 ? 140 : 400, type: 'lowpass', dur: 0.14 });
  }

  coin() {
    if (!this._ready()) return;
    const v = this.moodValue ?? 0;
    const t = this.ctx.currentTime;
    const base = this._freq(24 + (Math.random() < 0.5 ? 0 : 7));
    this._sfxTone(base, t, 0.08, { type: 'square', vol: 0.05 });
    this._sfxTone(base * 1.5, t + 0.06, 0.12, { type: 'square', vol: 0.05 });
    if (v > 0.5) this._sfxTone(base * 2, t + 0.12, 0.1, { type: 'triangle', vol: 0.05 }); // scintille en manie
  }

  thoughtPop() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    this._sfxTone(this._freq(28 + Math.floor(Math.random() * 8)), t, 0.06, { type: 'sine', vol: 0.05 });
  }

  thoughtHeavy() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    this._sfxTone(this._freq(-12), t, 2.2, { type: 'sine', vol: 0.09, attack: 0.6, release: 1.6 });
  }

  /** Le choix impulsif s'ouvre : montée scintillante, séduisante. */
  choiceOpen() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    [0, 4, 7, 11, 14, 19, 23].forEach((s, i) =>
      this._sfxTone(this._freq(12 + s), t + i * 0.05, 0.5, { type: 'triangle', vol: 0.05 })
    );
    this._noiseHit(t, { vol: 0.08, freq: 2000, sweepTo: 9000, dur: 0.6, q: 0.5 });
  }

  choiceYes() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 10; i++) {
      this._sfxTone(this._freq(24 + [0, 4, 7, 12][i % 4] + (i > 5 ? 12 : 0)), t + i * 0.035, 0.15, { type: 'square', vol: 0.04 });
    }
  }

  choiceNo() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    this._sfxTone(this._freq(7), t, 0.5, { type: 'sine', vol: 0.08, attack: 0.05 });
  }

  gateClosed() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    this._noiseHit(t, { vol: 0.35, freq: 120, type: 'lowpass', dur: 0.3 });
    this._sfxTone(55, t, 0.5, { type: 'square', vol: 0.08, lp: 300 });
  }

  gateOpen() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    this._noiseHit(t, { vol: 0.15, freq: 300, sweepTo: 1200, dur: 0.5, q: 0.7 });
    this._sfxTone(this._freq(12), t + 0.1, 0.4, { type: 'triangle', vol: 0.06 });
  }

  /** Tout s'envole : glissando qui tombe. */
  lose() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const gn = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(this._freq(24), t);
    o.frequency.exponentialRampToValueAtTime(this._freq(-12), t + 1.2);
    gn.gain.setValueAtTime(0.08, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    o.connect(gn).connect(this.sfxBus);
    o.start(t);
    o.stop(t + 1.4);
    for (let i = 0; i < 8; i++) this._sfxTone(this._freq(30 - i * 3), t + i * 0.08, 0.1, { type: 'square', vol: 0.03 });
  }

  /** Crise : tout monte, tout s'accélère, le cœur s'emballe. */
  crisisRise(duration = 3) {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    this._noiseHit(t, { vol: 0.18, freq: 400, sweepTo: 8000, dur: duration, q: 3 });
    const o = this.ctx.createOscillator();
    const gn = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(this._freq(0), t);
    o.frequency.exponentialRampToValueAtTime(this._freq(24), t + duration);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(0.06, t + duration * 0.9);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.3);
    o.connect(gn).connect(this.sfxBus);
    o.start(t);
    o.stop(t + duration + 0.4);
    for (let i = 0; i < duration * 4; i++) this._kick(t + i * 0.25 * (1 - i / (duration * 10)), 0.5, 60, 0.15);
  }

  /** Silence soudain, puis un accord doux : quelqu'un est là. */
  hush(seconds = 3.5) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.hushUntil = t + seconds;
    this._applyParams(this.params, true);
    if (this.muted) return;
    [0, 4, 7, 12].forEach((s, i) =>
      this._sfxTone(this._freq(s), t + 0.3 + i * 0.12, 3, { type: 'sine', vol: 0.06, attack: 0.4, release: 2.5 })
    );
  }

  /** Arrivée du proche : accord chaud qui s'ouvre. */
  warmChord() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    [0, 7, 12, 16].forEach((s, i) =>
      this._sfxTone(this._freq(s), t + i * 0.18, 2.4, { type: 'triangle', vol: 0.05, attack: 0.3, release: 1.8 })
    );
  }

  tool() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    [12, 19, 24].forEach((s, i) => this._sfxTone(this._freq(s), t + i * 0.1, 1.4, { type: 'sine', vol: 0.07, release: 1.2 }));
  }

  flag() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    [0, 4, 7, 12, 16].forEach((s, i) => this._sfxTone(this._freq(12 + s), t + i * 0.09, 0.9, { type: 'triangle', vol: 0.06 }));
  }

  respawn() {
    if (!this._ready()) return;
    const t = this.ctx.currentTime;
    this._noiseHit(t, { vol: 0.12, freq: 3000, sweepTo: 300, dur: 0.4, q: 0.8 });
  }

  /** Compatibilité : petit son générique. */
  blip(freq = 660, dur = 0.12, type = 'triangle', vol = 0.25) {
    if (!this._ready()) return;
    this._sfxTone(freq, this.ctx.currentTime, dur, { type, vol: vol * 0.4 });
  }
}

// =============================================================================
//  Utilitaires de synthèse
// =============================================================================

// 0,1 s de silence en WAV 8 bits (pour _unlockHtmlAudio)
const SILENT_WAV = (() => {
  const n = 800;
  const bytes = new Uint8Array(44 + n);
  const v = new DataView(bytes.buffer);
  const str = (o, t) => [...t].forEach((c, i) => (bytes[o + i] = c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + n, true);
  str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 8000, true);
  v.setUint16(32, 1, true);
  v.setUint16(34, 8, true);
  str(36, 'data');
  v.setUint32(40, n, true);
  bytes.fill(128, 44);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return 'data:audio/wav;base64,' + btoa(bin);
})();

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

/** Saturation douce (tanh). */
function makeDriveCurve(k) {
  const n = 2048;
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return c;
}

/** Quantification grossière : son numérique abîmé. */
function makeCrushCurve(levels) {
  const n = 2048;
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.round(x * levels) / levels;
  }
  return c;
}

function makeNoise(ctx, seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Réverbération synthétique : bruit stéréo qui décroît. */
function makeImpulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

export const moodAudio = new MoodAudio();

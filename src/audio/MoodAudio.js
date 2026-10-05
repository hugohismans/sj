/**
 * MoodAudio — petite musique générative en WebAudio.
 * Aucun fichier audio : tout est synthétisé, ce qui permet de faire varier
 * en continu le tempo, la densité des notes et le filtre (son étouffé).
 *
 * Paramètres lus depuis MoodManager.params : tempo, lowpassHz, musicVolume,
 * noteDensity, hatVolume.
 */

// Gamme pentatonique mineure de ré, deux octaves (fréquences en Hz)
const SCALE = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0, 440.0, 523.25];
// Progression lente : indices de basse (dans SCALE)
const BASS = [0, 0, 3, 2];

class MoodAudio {
  constructor() {
    this.ctx = null;
    this.started = false;
    this.muted = false;
    this.params = { tempo: 84, lowpassHz: 9000, musicVolume: 0.3, noteDensity: 0.5, hatVolume: 0 };
    this.step = 0;
    this.nextTime = 0;
    this.arpIndex = 4;
    this.playing = false;
  }

  /** À appeler suite à un geste utilisateur (contrainte des navigateurs mobiles). */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 9000;
      this.filter.Q.value = 0.7;
      this.filter.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.noise = this._makeNoise();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  start() {
    this.unlock();
    if (!this.ctx || this.playing) return;
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this._schedule(), 25);
  }

  stop() {
    this.playing = false;
    clearInterval(this.timer);
    if (this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  setParams(p) {
    this.params = p;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = this.muted || !this.playing ? 0 : p.musicVolume;
    this.master.gain.setTargetAtTime(vol, t, 0.25);
    this.filter.frequency.setTargetAtTime(p.lowpassHz, t, 0.3);
  }

  /** Petit son ponctuel (ramassage, aide, outil…). */
  blip(freq = 660, dur = 0.12, type = 'triangle', vol = 0.25) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.filter);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // ---------------------------------------------------------------------------

  _schedule() {
    if (!this.playing) return;
    const ctx = this.ctx;
    while (this.nextTime < ctx.currentTime + 0.12) {
      this._playStep(this.step, this.nextTime);
      const sixteenth = 60 / Math.max(30, this.params.tempo) / 4;
      this.nextTime += sixteenth;
      this.step++;
    }
  }

  _playStep(step, t) {
    const p = this.params;
    const bar = Math.floor(step / 16) % BASS.length;
    const beatLen = 60 / Math.max(30, p.tempo);

    // Basse + nappe au début de chaque mesure
    if (step % 16 === 0) {
      const root = SCALE[BASS[bar]] / 2;
      this._tone(root, t, beatLen * 3.5, 'sine', 0.22, 0.05, beatLen * 2);
      this._tone(root * 1.5, t, beatLen * 3.5, 'triangle', 0.05, beatLen, beatLen * 2);
    }
    // Pulsation sur les temps
    if (step % 4 === 0 && p.tempo > 100) {
      this._tone(SCALE[BASS[bar]] / 2, t, 0.08, 'sine', 0.12, 0.003, 0.06);
    }
    // Arpège (marche aléatoire dans la gamme)
    const onGrid = p.tempo > 110 ? true : step % 2 === 0;
    if (onGrid && Math.random() < p.noteDensity) {
      this.arpIndex += Math.round((Math.random() - 0.45) * 3);
      this.arpIndex = Math.max(0, Math.min(SCALE.length - 1, this.arpIndex));
      const len = Math.min(0.6, beatLen * 0.9);
      this._tone(SCALE[this.arpIndex], t, len, 'triangle', 0.09, 0.005, len * 0.8);
    }
    // Charleston (tension maniaque)
    if (p.hatVolume > 0.01 && step % 2 === 1) {
      this._hat(t, p.hatVolume);
    }
  }

  _tone(freq, t, dur, type, vol, attack, release) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.max(0.003, attack));
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
    o.connect(g).connect(this.filter);
    o.start(t);
    o.stop(t + Math.max(dur, attack + release) + 0.05);
  }

  _hat(t, vol) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    src.connect(hp).connect(g).connect(this.filter);
    src.start(t);
    src.stop(t + 0.05);
  }

  _makeNoise() {
    const len = this.ctx.sampleRate * 0.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
}

export const moodAudio = new MoodAudio();

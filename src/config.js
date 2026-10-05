// =============================================================================
//  config.js — TOUS les réglages de ressenti sont ici.
//
//  L'humeur est une valeur continue entre -1 et +1 :
//      -1 = phase dépressive   0 = stabilité (euthymie)   +1 = phase haute
//  La « phase haute » dépend du mode : MANIC (type 1) ou HYPOMANIC (type 2).
//  Chaque paramètre est interpolé entre les profils DEPRESSIVE / STABLE / haut
//  selon cette valeur. Aucune bascule brutale : changer l'humeur, c'est glisser
//  d'un profil à l'autre.
//
//  Les deux modes de jeu (séquence de niveaux + intensités) sont définis dans
//  MODES, en bas de ce fichier.
//
//  Unités : pixels (monde à l'échelle x2, 1 tuile = 36 px), secondes, ms.
// =============================================================================

export const GAME = {
  width: 960,
  height: 540,
  tileSize: 18, // taille d'une tuile dans la planche Kenney
  scale: 2, // facteur d'agrandissement des sprites pixel art
  get tile() {
    return this.tileSize * this.scale; // 36 px à l'écran
  },
  // Vitesse à laquelle l'humeur courante rejoint l'humeur cible (par seconde).
  // Plus petit = transitions plus lentes et plus douces.
  moodFollowRate: 0.6,
  // Chute dans le vide : délai avant de réapparaître au dernier point de repère.
  respawnDelayMs: 700,
  debug: false, // true = affiche les hitbox et les valeurs d'humeur
};

// -----------------------------------------------------------------------------
//  Profils d'humeur. Chaque clé doit exister dans les trois profils.
// -----------------------------------------------------------------------------
const STABLE = {
  // --- Déplacement -----------------------------------------------------------
  moveSpeed: 210, // vitesse max au sol (px/s)
  acceleration: 1700, // px/s² quand on appuie
  deceleration: 2200, // px/s² quand on relâche (au sol) — faible = glisse
  turnFactor: 1.6, // multiplicateur d'accélération quand on change de sens
  airControl: 0.85, // fraction de l'accélération disponible en l'air
  airDeceleration: 900,

  // --- Saut ------------------------------------------------------------------
  jumpVelocity: 590, // impulsion initiale (px/s)
  gravity: 1450, // gravité (px/s²)
  jumpCut: 0.45, // relâcher le saut tôt multiplie la vitesse verticale par ceci
  maxFallSpeed: 900,
  coyoteMs: 90, // tolérance après avoir quitté le bord
  jumpBufferMs: 110, // tolérance si on appuie juste avant d'atterrir

  // --- Perception des commandes -----------------------------------------------
  inputDelayMs: 0, // retard entre l'appui et la réaction du personnage
  autoRun: 0, // 0..1 : le personnage continue d'avancer seul quand on lâche tout

  // --- Image -------------------------------------------------------------------
  saturation: 0, // -1 = gris, 0 = normal, +1 = très saturé
  brightness: 1, // multiplicateur de luminosité
  contrast: 0, // -1..1
  hue: 0, // rotation de teinte (degrés)
  vignetteStrength: 0.15, // 0..1
  vignetteRadius: 0.75, // 0..1 (plus petit = plus fermé)

  // --- Caméra ------------------------------------------------------------------
  cameraLerp: 0.12, // suivi (1 = collé, 0.02 = très en retard)
  cameraShake: 0, // intensité de tremblement continu (px)
  cameraJitterHz: 0, // fréquence du tremblement
  cameraZoom: 1,
  cameraZoomPulse: 0, // amplitude de zoom calée sur le tempo

  // --- Son ---------------------------------------------------------------------
  tempo: 84, // BPM de la musique procédurale
  lowpassHz: 9000, // filtre passe-bas (bas = étouffé)
  musicVolume: 0.95,
  noteDensity: 0.55, // probabilité de jouer une note à chaque pas
  hatVolume: 0, // petit charleston (tension)
  kickVolume: 0.12, // grosse caisse (temps 1 et 3 ; 4 temps si > 0,35)
  heartbeat: 0, // battement de cœur sourd (« boum-boum » à chaque mesure)
  padVolume: 0.5, // nappe d'accords
  arpVolume: 0.5, // arpège / mélodie
  bassVolume: 0.5,
  pump: 0, // effet de « pompe » rythmique sur la musique (0..1)
  distortion: 0, // saturation (0..1)
  crush: 0, // grain numérique, son abîmé (0..1)
  wobble: 0, // bande qui ondule : variation de hauteur en cents
  pitchShift: 0, // transposition globale en demi-tons (négatif = ralenti, grave)
  reverb: 0.2, // réverbération (0..1)
  noiseVolume: 0, // souffle de fond
  tinnitus: 0, // sifflement aigu (saturation sensorielle)
  sfxVolume: 0.6, // volume des bruitages

  // --- Pensées -------------------------------------------------------------------
  thoughtIntervalMs: 9000, // temps moyen entre deux pensées
  thoughtLifeMs: 3800, // durée d'affichage
  thoughtMax: 1, // nombre simultané
  thoughtTypeSpeed: 0, // ms par lettre (0 = immédiat)

  // --- Interface ----------------------------------------------------------------
  uiAlpha: 0.9, // opacité des boutons tactiles et de la jauge
  uiJitter: 0, // tremblement de la jauge (px)
};

// Manie (type 1) : niveau maximal. Difficile à doser, on ne s'arrête plus.
const MANIC = {
  moveSpeed: 420,
  acceleration: 1200,
  deceleration: 220, // glisse longtemps : dur de s'arrêter pile
  turnFactor: 0.45, // faire demi-tour prend du temps → on dépasse la cible
  airControl: 0.55,
  airDeceleration: 80,

  jumpVelocity: 780,
  gravity: 1350,
  jumpCut: 0.9, // on ne contrôle presque plus la hauteur
  maxFallSpeed: 1000,
  coyoteMs: 50,
  jumpBufferMs: 180,

  inputDelayMs: 0,
  autoRun: 0.3, // impossible de rester immobile

  saturation: 0.6,
  brightness: 1.06,
  contrast: 0.15,
  hue: 6,
  vignetteStrength: 0.05,
  vignetteRadius: 0.95,

  cameraLerp: 0.04,
  cameraShake: 4.5,
  cameraJitterHz: 20,
  cameraZoom: 0.94,
  cameraZoomPulse: 0.022,

  tempo: 160,
  lowpassHz: 14000,
  musicVolume: 0.75,
  noteDensity: 0.97,
  hatVolume: 0.14,
  kickVolume: 0.5,
  heartbeat: 0,
  padVolume: 0.35,
  arpVolume: 0.75,
  bassVolume: 0.6,
  pump: 0.6,
  distortion: 0.22, // son qui « crache » un peu : trop fort, trop vite
  crush: 0,
  wobble: 0,
  pitchShift: 1, // tout est un peu trop haut
  reverb: 0.06,
  noiseVolume: 0,
  tinnitus: 0.035,
  sfxVolume: 0.75,

  thoughtIntervalMs: 750,
  thoughtLifeMs: 1600,
  thoughtMax: 7,
  thoughtTypeSpeed: 0,

  uiAlpha: 1,
  uiJitter: 3.5,
};

// Hypomanie (type 2) : version atténuée. Plus rapide, plus précis, agréable.
// C'est voulu : le niveau doit sembler plus facile, presque « enfin la forme ».
const HYPOMANIC = {
  moveSpeed: 285,
  acceleration: 2300,
  deceleration: 2600, // s'arrête net : tout semble sous contrôle
  turnFactor: 1.8,
  airControl: 0.95,
  airDeceleration: 1000,

  jumpVelocity: 660,
  gravity: 1450,
  jumpCut: 0.45,
  maxFallSpeed: 900,
  coyoteMs: 130, // plus tolérant que la normale
  jumpBufferMs: 150,

  inputDelayMs: 0,
  autoRun: 0,

  saturation: 0.22,
  brightness: 1.06,
  contrast: 0.05,
  hue: 3,
  vignetteStrength: 0.06,
  vignetteRadius: 0.9,

  cameraLerp: 0.15,
  cameraShake: 0,
  cameraJitterHz: 0,
  cameraZoom: 1,
  cameraZoomPulse: 0.004,

  tempo: 112,
  lowpassHz: 12000,
  musicVolume: 0.85,
  noteDensity: 0.78,
  hatVolume: 0.05,
  kickVolume: 0.3,
  heartbeat: 0,
  padVolume: 0.5,
  arpVolume: 0.65,
  bassVolume: 0.55,
  pump: 0.2,
  distortion: 0,
  crush: 0,
  wobble: 0,
  pitchShift: 0,
  reverb: 0.16,
  noiseVolume: 0,
  tinnitus: 0,
  sfxVolume: 0.65,

  thoughtIntervalMs: 5500,
  thoughtLifeMs: 3200,
  thoughtMax: 1,
  thoughtTypeSpeed: 0,

  uiAlpha: 1,
  uiJitter: 0,
};

const DEPRESSIVE = {
  moveSpeed: 95,
  acceleration: 420,
  deceleration: 1600,
  turnFactor: 1,
  airControl: 0.55,
  airDeceleration: 700,

  jumpVelocity: 405, // ~1,5 tuile : une marche de 3 tuiles est infranchissable seul
  gravity: 1650,
  jumpCut: 0.5,
  maxFallSpeed: 800,
  coyoteMs: 50,
  jumpBufferMs: 60,

  inputDelayMs: 190, // léger décalage, on se sent « en retard » sur soi-même
  autoRun: 0,

  saturation: -0.85,
  brightness: 0.82,
  contrast: -0.1,
  hue: -6,
  vignetteStrength: 0.42,
  vignetteRadius: 0.6,

  cameraLerp: 0.06,
  cameraShake: 0,
  cameraJitterHz: 0,
  cameraZoom: 1.1,
  cameraZoomPulse: 0,

  tempo: 50, // lent, traînant
  lowpassHz: 900,
  musicVolume: 0.22,
  noteDensity: 0.25,
  hatVolume: 0,
  kickVolume: 0,
  heartbeat: 0.35,
  padVolume: 0.75,
  arpVolume: 0.35,
  bassVolume: 0.7,
  pump: 0,
  distortion: 0.5, // son saturé, sale
  crush: 0.35, // grain abîmé, comme une vieille cassette
  wobble: 28, // la bande ondule, la musique « tangue »
  pitchShift: -3, // ralentie, plus grave
  reverb: 0.55, // tout est lointain
  noiseVolume: 0.05,
  tinnitus: 0,
  sfxVolume: 0.45,

  thoughtIntervalMs: 7000,
  thoughtLifeMs: 6500,
  thoughtMax: 1,
  thoughtTypeSpeed: 75, // les mots arrivent lentement

  uiAlpha: 0.45,
  uiJitter: 0,
};

export const MOOD_PROFILES = { STABLE, MANIC, HYPOMANIC, DEPRESSIVE };

// -----------------------------------------------------------------------------
//  Aide (compagnon / proche soignant) pendant la phase dépressive
// -----------------------------------------------------------------------------
export const COMPANION = {
  supportRadius: 110, // distance à laquelle le soutien agit (px)
  jumpBoost: 1.6, // multiplicateur de saut quand le proche est à côté
  speedBoost: 1.25, // on avance un peu plus facilement à deux
  inputDelayFactor: 0.5, // le retard des commandes est divisé de moitié
  followDistance: 54, // distance à laquelle il suit
  followSpeed: 1.05, // relatif à la vitesse du joueur
  moodLift: 0.12, // remonte légèrement l'humeur cible quand il est là
};

// -----------------------------------------------------------------------------
//  Phase maniaque : objets brillants, choix impulsifs, crise
// -----------------------------------------------------------------------------
export const MANIC_EXTRAS = {
  coinMagnetRadius: 70, // les pièces attirent quand on passe à côté
  coinGlowPulseMs: 380,
  // Conséquence au niveau dépressif si on a « tout dépensé » :
  spentDebtSpeedMultiplier: 0.9,
  // Crise au pic de la manie (type 1) :
  crisisControl: 0.15, // part des commandes qui répond encore (0..1)
  crisisAutoRun: 1, // le personnage fonce tout seul
  crisisCarerSpeed: 150, // vitesse du soignant qui vient à sa rencontre (px/s)
  crisisCalmDelayMs: 8500, // durée de l'intervention avant la fin du niveau
};

// -----------------------------------------------------------------------------
//  Stabilisation : l'humeur oscille, chaque outil réduit l'amplitude.
//  Les variations ne disparaissent jamais complètement (pas de guérison magique).
// -----------------------------------------------------------------------------
export const STABILISATION = {
  baseMood: 0, // centre de l'oscillation
  startAmplitude: 0.85, // amplitude initiale (0..1)
  dampingPerTool: 0.55, // l'amplitude est multipliée par ceci à chaque outil
  minAmplitude: 0.1, // il reste toujours un peu de variation
  periodSeconds: 9, // durée d'un cycle haut → bas → haut
  periodGrowthPerTool: 1.2, // les cycles deviennent plus lents, plus prévisibles
  amplitudeEaseRate: 0.35, // vitesse à laquelle la nouvelle amplitude s'installe
  upScale: 1, // échelle des pics hauts (< 1 : les hauts sont plus discrets que les bas)
};

// -----------------------------------------------------------------------------
//  Son (global). Le reste est dans les profils d'humeur ci-dessus.
// -----------------------------------------------------------------------------
export const AUDIO = {
  masterVolume: 0.9,
  // ambiance des menus et écrans de texte (surcharge le profil STABLE)
  menu: { tempo: 66, noteDensity: 0.3, lowpassHz: 2600, kickVolume: 0, hatVolume: 0, reverb: 0.45, musicVolume: 0.6 },
  wobbleRateHz: 0.35, // vitesse d'ondulation de la bande
};

// Couleurs de la jauge d'humeur
export const GAUGE = {
  width: 180,
  height: 6,
  depressiveColor: 0x5b6b8c,
  stableColor: 0x9fb8a0,
  manicColor: 0xe0884a,
};

// =============================================================================
//  MODES DE JEU
//  Même moteur, séquences et intensités différentes.
//  - profileOverrides : remplace des valeurs des profils ci-dessus pour ce mode
//  - sequence : niveaux joués dans l'ordre (clés de src/levels/index.js) ;
//    chaque étape peut surcharger des champs du niveau (ex. tools)
// =============================================================================
export const MODES = {
  type1: {
    highProfile: 'MANIC',
    highThoughts: 'manic', // groupe de pensées en phase haute
    highThoughtStyle: 'bubbles', // 'bubbles' (envahissant) ou 'calm'
    gaugeHighColor: 0xe0884a,
    profileOverrides: {
      DEPRESSIVE: {},
    },
    stabilisation: { upScale: 1 },
    sequence: [
      { level: 'stable' },
      { level: 'rise' },
      { level: 'manic' },
      { level: 'fall' },
      { level: 'depressive' },
      { level: 'stabilisation', tools: ['traitement', 'suivi', 'entourage', 'sommeil'] },
    ],
  },

  type2: {
    highProfile: 'HYPOMANIC',
    highThoughts: 'hypomanic',
    highThoughtStyle: 'calm',
    gaugeHighColor: 0xc9c27a, // le haut de la jauge se remarque à peine
    profileOverrides: {
      // dépression plus lente et plus lourde encore : elle domine le type 2
      DEPRESSIVE: { moveSpeed: 82, acceleration: 360, inputDelayMs: 220, tempo: 46, wobble: 34, pitchShift: -4 },
    },
    // pics hauts discrets, centre légèrement bas
    stabilisation: { baseMood: -0.1, startAmplitude: 0.75, upScale: 0.55 },
    sequence: [
      { level: 'stable' },
      { level: 'hypomanic' },
      { level: 'depressiveLong' },
      { level: 'stableShort' },
      { level: 'depressiveAgain' },
      { level: 'stabilisation', tools: ['diagnostic', 'traitement', 'entourage', 'sommeil'] },
    ],
  },
};

/** Profils { STABLE, HIGH, DEPRESSIVE } d'un mode, surcharges appliquées. */
export function buildProfiles(modeKey) {
  const mode = MODES[modeKey] || MODES.type1;
  const o = mode.profileOverrides || {};
  return {
    STABLE: { ...STABLE, ...(o.STABLE || {}) },
    HIGH: { ...MOOD_PROFILES[mode.highProfile], ...(o[mode.highProfile] || {}) },
    DEPRESSIVE: { ...DEPRESSIVE, ...(o.DEPRESSIVE || {}) },
  };
}

/** Réglages de stabilisation d'un mode. */
export function stabilisationFor(modeKey) {
  return { ...STABILISATION, ...((MODES[modeKey] || MODES.type1).stabilisation || {}) };
}

// =============================================================================
//  config.js — TOUS les réglages de ressenti sont ici.
//
//  L'humeur est une valeur continue entre -1 et +1 :
//      -1 = phase dépressive   0 = stabilité (euthymie)   +1 = phase maniaque
//  Chaque paramètre est interpolé entre les profils DEPRESSIVE / STABLE / MANIC
//  selon cette valeur. Aucune bascule brutale : changer l'humeur, c'est glisser
//  d'un profil à l'autre.
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
  musicVolume: 0.32,
  noteDensity: 0.55, // probabilité de jouer une note à chaque pas
  hatVolume: 0, // petit charleston (tension)

  // --- Pensées -------------------------------------------------------------------
  thoughtIntervalMs: 9000, // temps moyen entre deux pensées
  thoughtLifeMs: 3800, // durée d'affichage
  thoughtMax: 1, // nombre simultané
  thoughtTypeSpeed: 0, // ms par lettre (0 = immédiat)

  // --- Interface ----------------------------------------------------------------
  uiAlpha: 0.9, // opacité des boutons tactiles et de la jauge
  uiJitter: 0, // tremblement de la jauge (px)
};

const MANIC = {
  moveSpeed: 390,
  acceleration: 1250,
  deceleration: 300, // glisse longtemps : dur de s'arrêter pile
  turnFactor: 0.55, // faire demi-tour prend du temps → on dépasse la cible
  airControl: 0.6,
  airDeceleration: 120,

  jumpVelocity: 760,
  gravity: 1350,
  jumpCut: 0.85, // on ne contrôle presque plus la hauteur
  maxFallSpeed: 1000,
  coyoteMs: 60,
  jumpBufferMs: 160,

  inputDelayMs: 0,

  saturation: 0.55,
  brightness: 1.05,
  contrast: 0.12,
  hue: 5,
  vignetteStrength: 0.05,
  vignetteRadius: 0.95,

  cameraLerp: 0.045,
  cameraShake: 3.5,
  cameraJitterHz: 18,
  cameraZoom: 0.95,
  cameraZoomPulse: 0.018,

  tempo: 152,
  lowpassHz: 14000,
  musicVolume: 0.38,
  noteDensity: 0.95,
  hatVolume: 0.12,

  thoughtIntervalMs: 900,
  thoughtLifeMs: 1700,
  thoughtMax: 6,
  thoughtTypeSpeed: 0,

  uiAlpha: 1,
  uiJitter: 2.5,
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

  tempo: 58,
  lowpassHz: 650,
  musicVolume: 0.26,
  noteDensity: 0.22,
  hatVolume: 0,

  thoughtIntervalMs: 7000,
  thoughtLifeMs: 6500,
  thoughtMax: 1,
  thoughtTypeSpeed: 75, // les mots arrivent lentement

  uiAlpha: 0.45,
  uiJitter: 0,
};

export const MOOD_PROFILES = { STABLE, MANIC, DEPRESSIVE };

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
//  Phase maniaque : objets brillants et choix impulsif
// -----------------------------------------------------------------------------
export const MANIC_EXTRAS = {
  coinMagnetRadius: 70, // les pièces attirent quand on passe à côté
  coinGlowPulseMs: 380,
  // Conséquence plus tard si on a « tout dépensé » :
  spentDebtSpeedMultiplier: 0.9, // niveau dépressif un peu plus lourd
  spentExtraThoughts: true,
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
};

// Couleurs de la jauge d'humeur
export const GAUGE = {
  width: 180,
  height: 6,
  depressiveColor: 0x5b6b8c,
  stableColor: 0x9fb8a0,
  manicColor: 0xe0884a,
};

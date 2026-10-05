// =============================================================================
//  texts.js — tous les textes du jeu, en un seul endroit.
//  Ton : court, sobre, respectueux. Ni romantiser la manie, ni caricaturer
//  la dépression.
// =============================================================================

export const WARNING = {
  title: 'Avant de commencer',
  body: [
    'Ce jeu évoque les troubles de l’humeur, en particulier le trouble bipolaire, à travers des sensations de jeu.',
    'Il ne remplace pas un avis médical. Si vous traversez une période difficile, parlez-en à un professionnel de santé. Des contacts sont proposés à la fin.',
  ],
  button: 'J’ai compris',
};

export const TITLE = {
  title: 'Entre deux pôles',
  subtitle: 'Un court prototype sur le trouble bipolaire, vécu de l’intérieur.',
  start: 'Commencer',
  resources: 'Ressources',
  hint: 'Paysage conseillé · son conseillé',
};

// Nom affiché (discrètement) en début de niveau
export const LEVEL_NAMES = ['Un jour ordinaire', 'Plus vite', 'Le poids', 'Trouver un rythme'];

// -----------------------------------------------------------------------------
//  Pensées. Le jeu choisit le groupe selon l'humeur courante.
// -----------------------------------------------------------------------------
export const THOUGHTS = {
  stable: [
    'Il fait doux, aujourd’hui.',
    'Une chose après l’autre.',
    'Penser à rappeler Sam ce soir.',
    'J’ai bien dormi.',
    'Rien d’extraordinaire. C’est bien.',
  ],
  manic: [
    'Je peux tout faire.',
    'Pourquoi dormir ? Il y a tant à faire.',
    'J’ai une idée. Non, trois. Non —',
    'Tout le monde est si lent.',
    'Je n’ai jamais été aussi lucide.',
    'Il faut que j’appelle tout le monde. Maintenant.',
    'Plus vite.',
    'Rien ne peut m’arrêter.',
    'Un projet, puis un autre, puis encore un.',
    'Pourquoi ils me regardent comme ça ?',
    'Je finirai cette nuit.',
    'C’est évident, non ?',
    'Ça brille, là-bas —',
    'Je n’ai pas besoin de manger.',
    'Ils ne comprennent pas.',
    'Encore.',
  ],
  depressive: [
    'À quoi bon.',
    'Cette fatigue. Depuis longtemps.',
    'Les autres y arrivent, eux.',
    'Même ça, c’est trop.',
    'Je ne veux déranger personne.',
    'Juste rester là.',
    'Tout est lourd.',
    'Je ne ressens plus grand-chose.',
    'Demain sera pareil.',
  ],
  // Ajoutées en phase dépressive si le joueur a « tout dépensé » en phase maniaque
  depressiveDebt: [
    'Le relevé de compte est arrivé.',
    'Comment j’ai pu dépenser tout ça ?',
    'Je n’ose pas ouvrir le courrier.',
  ],
  stabilisation: [
    'Ça monte un peu. Je le remarque.',
    'Ça redescend. Ça va passer.',
    'Je le noterai pour le prochain rendez-vous.',
    'Dormir à heure fixe, même ce soir.',
    'Ce n’est pas parfait. C’est vivable.',
  ],
};

// -----------------------------------------------------------------------------
//  Choix impulsif (phase maniaque)
// -----------------------------------------------------------------------------
export const CHOICE = {
  title: 'MAINTENANT',
  body: 'Tout dépenser, d’un coup.\nTu le mérites. Tu le sens.',
  yes: 'TOUT DÉPENSER',
  no: 'attendre',
  afterYes: 'Évidemment ! Pourquoi attendre ?',
  afterNo: '… plus tard. Peut-être.',
};

// -----------------------------------------------------------------------------
//  Proche / soignant (phase dépressive, puis stabilisation)
// -----------------------------------------------------------------------------
export const COMPANION_LINES = {
  arrive: 'Hé. Je suis là.',
  offer: 'On y va ensemble ? À ton rythme.',
  helping: ['Appuie-toi sur moi.', 'Pas à pas.', 'Je reste là.', 'Prends ton temps.'],
  after: 'On continue ?',
  rejoin: 'Je suis toujours là, si besoin.',
};

// -----------------------------------------------------------------------------
//  Outils de stabilisation
// -----------------------------------------------------------------------------
export const TOOLS = {
  traitement: { name: 'Traitement', text: 'Pris chaque jour, ajusté avec le médecin.' },
  suivi: { name: 'Suivi', text: 'Des rendez-vous réguliers pour repérer les signes tôt.' },
  entourage: { name: 'Entourage', text: 'Des proches qui savent, et qui sont là.' },
  sommeil: { name: 'Sommeil', text: 'Des horaires stables, même quand tout pousse à veiller.' },
};

// -----------------------------------------------------------------------------
//  Écrans entre les niveaux (2–3 phrases)
// -----------------------------------------------------------------------------
export const INTERLUDES = [
  // après le niveau 1
  [
    'C’était un jour ordinaire. Ni trop, ni trop peu.',
    'On ne remarque souvent cet équilibre qu’au moment où il s’éloigne.',
  ],
  // après le niveau 2
  [
    'Tout allait vite. Trop vite pour s’arrêter, trop vite pour voir les conséquences.',
    'Ce qui ressemblait à de l’énergie était aussi une perte de contrôle.',
  ],
  // après le niveau 3
  [
    'Chaque geste demandait un effort. Ce n’était pas un manque de volonté : c’était la maladie.',
    'Avancer a été possible, mais pas sans aide.',
  ],
  // après le niveau 4
  [
    'Le traitement, le suivi, le sommeil et l’entourage ne font pas disparaître les variations.',
    'Ils les rendent plus douces, plus prévisibles. Ils laissent de la place pour vivre.',
  ],
];

// Phrase ajoutée à l'interlude 2 si le joueur a tout dépensé
export const INTERLUDE_SPENT = 'L’argent dépensé, lui, ne revient pas.';

export const CONTINUE = 'Toucher pour continuer';

// -----------------------------------------------------------------------------
//  Fin
// -----------------------------------------------------------------------------
export const END = {
  title: 'Merci d’avoir joué',
  body: [
    'Le trouble bipolaire est une maladie fréquente, et elle se soigne.',
    'Les phases maniaques et dépressives ne sont ni des traits de caractère, ni des choix.',
    'Si ces sensations vous parlent, pour vous ou pour un proche, vous n’êtes pas seul·e. Parlez-en à un médecin.',
  ],
  resources: 'Ressources',
  restart: 'Rejouer',
};

// -----------------------------------------------------------------------------
//  Ressources — ⚠️ CONTENU À VÉRIFIER AVANT TOUTE DIFFUSION ⚠️
//  Numéros et associations donnés comme pistes : vérifier qu'ils sont exacts,
//  à jour et adaptés au public visé (pays, horaires, gratuité).
// -----------------------------------------------------------------------------
export const RESOURCES = {
  title: 'Ressources',
  warning: '[À VÉRIFIER] Contenu provisoire, non validé.',
  intro: 'En cas de danger immédiat, appelez les urgences.',
  sections: [
    {
      heading: 'Urgences',
      lines: [
        '[À VÉRIFIER] 112 — numéro d’urgence européen',
        '[À VÉRIFIER] 15 — SAMU (France)',
      ],
    },
    {
      heading: 'Écoute et prévention',
      lines: [
        '[À VÉRIFIER] 3114 — prévention du suicide, 24h/24 (France)',
        '[À VÉRIFIER] 0800 32 123 — Centre de Prévention du Suicide (Belgique)',
        '[À VÉRIFIER] 143 — La Main Tendue (Suisse)',
        '[À VÉRIFIER] 988 — ligne de prévention du suicide (Canada)',
      ],
    },
    {
      heading: 'Associations',
      lines: [
        '[À VÉRIFIER] Argos 2001 — personnes bipolaires et proches (France)',
        '[À VÉRIFIER] UNAFAM — soutien aux familles et proches (France)',
        '[À VÉRIFIER] France Dépression',
        '[À VÉRIFIER] Similes — proches de personnes concernées (Belgique)',
      ],
    },
  ],
  back: 'Retour',
};

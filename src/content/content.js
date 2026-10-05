// =============================================================================
//  content.js — EXPLICATIONS MÉDICALES ET TEXTES DE SENS
//
//  ⚠️ Tout ce fichier est à faire relire par un·e professionnel·le de santé
//  avant diffusion. Il regroupe tout ce qui « explique » : avertissement,
//  définitions des deux types, textes entre les niveaux, outils de soin,
//  messages de fin, comparatif et ressources.
//
//  Les textes « vécus » (pensées, paroles du proche, choix impulsifs, indices)
//  sont dans texts.js.
//
//  Repères utilisés (classification DSM-5, à vérifier) :
//  - Type 1 : au moins un épisode maniaque (≥ 7 jours, ou toute durée si
//    hospitalisation). Les épisodes dépressifs sont fréquents mais ne sont pas
//    nécessaires au diagnostic.
//  - Type 2 : au moins un épisode hypomaniaque (≥ 4 jours) et au moins un
//    épisode dépressif majeur (≥ 2 semaines), sans aucun épisode maniaque.
// =============================================================================

export const WARNING = {
  title: 'Avant de commencer',
  body: [
    'Ce jeu évoque les troubles de l’humeur, en particulier le trouble bipolaire, à travers des sensations de jeu.',
    'Il ne remplace pas un avis médical. Si vous traversez une période difficile, parlez-en à un professionnel de santé. Des contacts sont proposés à la fin.',
  ],
  button: 'J’ai compris',
};

// -----------------------------------------------------------------------------
//  Écran avant chaque mode
// -----------------------------------------------------------------------------
export const MODE_INTRO = {
  type1: {
    title: 'Trouble bipolaire de type 1',
    body: [
      'Il est défini par au moins un épisode maniaque complet : une période d’au moins une semaine où l’humeur et l’énergie s’emballent, au point de perturber fortement la vie, parfois jusqu’à l’hospitalisation.',
      'Les épisodes dépressifs sont fréquents, mais ils ne sont pas nécessaires au diagnostic.',
    ],
    button: 'Commencer',
  },
  type2: {
    title: 'Trouble bipolaire de type 2',
    body: [
      'Il est défini par au moins un épisode hypomaniaque (une forme atténuée de la manie, d’au moins quatre jours) et au moins un épisode dépressif majeur, sans jamais d’épisode maniaque complet.',
      'Ce n’est pas une forme « légère » du type 1 : la dépression y occupe souvent la plus grande place.',
    ],
    button: 'Commencer',
  },
};

// Bouton de l'écran titre
export const MODE_BUTTONS = {
  type1: { label: 'Type 1', hint: 'manie et dépression' },
  type2: { label: 'Type 2', hint: 'hypomanie et dépression' },
};

// -----------------------------------------------------------------------------
//  Textes entre les niveaux (2–3 phrases), un par étape de chaque mode
// -----------------------------------------------------------------------------
export const INTERLUDES = {
  type1: [
    // après « stabilité »
    [
      'C’était un jour ordinaire. Ni trop, ni trop peu.',
      'On ne remarque souvent cet équilibre qu’au moment où il s’éloigne.',
    ],
    // après « montée »
    [
      'Moins de sommeil, plus d’idées, plus de vitesse. Au début, cela ressemble à de l’énergie.',
      'La montée est progressive : c’est souvent l’entourage qui la remarque en premier.',
    ],
    // après « manie »
    [
      'Au plus fort de la manie, on ne voit plus le danger. Les décisions prises sur le moment ont des conséquences bien réelles.',
      'Une aide extérieure, parfois urgente, peut être nécessaire. Ce n’est pas un échec : c’est une protection.',
    ],
    // après « chute »
    [
      'Après la manie vient souvent la chute.',
      'Il reste parfois de la honte ou de la culpabilité pour ce qui s’est passé pendant l’épisode.',
    ],
    // après « dépression »
    [
      'Chaque geste demandait un effort. Ce n’était pas un manque de volonté : c’était la maladie.',
      'Avancer a été possible, mais pas sans aide.',
    ],
    // après « stabilisation »
    [
      'Le traitement, le suivi, le sommeil et l’entourage ne font pas disparaître les variations.',
      'Ils les rendent plus douces, plus prévisibles. Ils laissent de la place pour vivre.',
    ],
  ],
  type2: [
    // après « stabilité »
    [
      'C’était un jour ordinaire. Ni trop, ni trop peu.',
      'On ne remarque souvent cet équilibre qu’au moment où il s’éloigne.',
    ],
    // après « hypomanie »
    [
      'Tout semblait plus facile. Plus rapide, plus efficace, presque agréable.',
      'C’est ce qui rend l’hypomanie difficile à repérer : elle ressemble à « enfin la forme ».',
    ],
    // après « dépression longue »
    [
      'Cette fois, ça a duré. Des semaines, parfois des mois.',
      'Dans le type 2, la dépression occupe souvent bien plus de temps que les phases hautes.',
    ],
    // après « courte stabilité »
    [
      'Une éclaircie. On ose y croire.',
      'Puis le poids revient, parfois sans raison apparente.',
    ],
    // après « dépression à nouveau »
    [
      'Une dépression de plus. Les périodes « en forme » d’avant n’avaient semblé être un problème pour personne.',
      'Parler aussi de ces périodes hautes peut changer le diagnostic, et donc le traitement.',
    ],
    // après « stabilisation »
    [
      'Un diagnostic juste, un traitement adapté, un suivi régulier.',
      'Les variations ne disparaissent pas. Elles deviennent plus douces, et on apprend à les voir venir.',
    ],
  ],
};

// Ajouté au texte après le niveau de manie si le joueur a tout dépensé
export const INTERLUDE_SPENT = 'L’argent dépensé, lui, ne revient pas.';

// -----------------------------------------------------------------------------
//  Outils de stabilisation (niveau final)
// -----------------------------------------------------------------------------
export const TOOLS = {
  diagnostic: { name: 'Diagnostic', text: 'Mettre un nom juste sur ce qui se passe.' },
  traitement: { name: 'Traitement', text: 'Pris chaque jour, ajusté avec le médecin.' },
  suivi: { name: 'Suivi', text: 'Des rendez-vous réguliers pour repérer les signes tôt.' },
  entourage: { name: 'Entourage', text: 'Des proches qui savent, et qui sont là.' },
  sommeil: { name: 'Sommeil', text: 'Des horaires stables, même quand tout pousse à veiller.' },
};

// -----------------------------------------------------------------------------
//  Fin de chaque mode
// -----------------------------------------------------------------------------
export const END = {
  type1: {
    title: 'Merci d’avoir joué',
    body: [
      'Le trouble bipolaire de type 1 se soigne. Un épisode maniaque peut demander une aide urgente, parfois une hospitalisation : ce n’est ni une faute, ni un échec.',
      'Les phases maniaques et dépressives ne sont ni des traits de caractère, ni des choix.',
      'Si ces sensations vous parlent, pour vous ou pour un proche, parlez-en à un médecin.',
    ],
  },
  type2: {
    title: 'Merci d’avoir joué',
    body: [
      'Le trouble bipolaire de type 2 est souvent diagnostiqué tard, parfois après des années.',
      'Il est fréquemment confondu avec une dépression « simple », parce que l’hypomanie n’est pas perçue comme un problème, ni par la personne, ni par son entourage.',
      'Si vous vous reconnaissez dans ces périodes « trop en forme », mentionnez-les à votre médecin.',
    ],
  },
  compare: 'Comparer les deux types',
};

// -----------------------------------------------------------------------------
//  Comparatif simple Type 1 / Type 2
//  Les barres sont illustratives (0..1), pas des statistiques.
// -----------------------------------------------------------------------------
export const COMPARISON = {
  title: 'Type 1 et type 2',
  note: 'Illustration simplifiée, pas des statistiques. Chaque parcours est différent.',
  columns: ['Type 1', 'Type 2'],
  rows: [
    {
      label: 'Intensité des phases hautes',
      type1: { value: 1, text: 'Manie : perte de contrôle possible, aide urgente parfois nécessaire' },
      type2: { value: 0.45, text: 'Hypomanie : plus discrète, souvent vécue comme positive' },
    },
    {
      label: 'Place de la dépression',
      type1: { value: 0.55, text: 'Fréquente, mais pas nécessaire au diagnostic' },
      type2: { value: 0.9, text: 'Obligatoire au diagnostic, et souvent dominante dans le temps' },
    },
    {
      label: 'Difficulté du diagnostic',
      type1: { value: 0.4, text: 'La manie se voit : elle est plus souvent repérée' },
      type2: { value: 0.85, text: 'Souvent tardif, parfois confondu avec une dépression simple' },
    },
  ],
  resources: 'Ressources',
  title_screen: 'Écran titre',
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

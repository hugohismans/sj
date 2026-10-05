// =============================================================================
//  texts.js — la « voix » du jeu : pensées, paroles, choix, interface.
//  Les explications médicales sont dans content.js.
//  Ton : court, sobre, respectueux. Ni romantiser la manie, ni caricaturer
//  la dépression.
// =============================================================================

export const TITLE = {
  title: 'Entre deux pôles',
  subtitle: 'Un court prototype sur le trouble bipolaire, vécu de l’intérieur.',
  resources: 'Ressources',
  hint: 'Paysage conseillé · son conseillé',
};

// Nom affiché (discrètement) en début de niveau, par clé de niveau
export const LEVEL_NAMES = {
  stable: 'Un jour ordinaire',
  rise: 'Ça monte',
  manic: 'Plus rien ne m’arrête',
  fall: 'La chute',
  depressive: 'Le poids',
  hypomanic: 'Enfin en forme',
  depressiveLong: 'Longtemps',
  stableShort: 'Une éclaircie',
  depressiveAgain: 'Encore',
  stabilisation: 'Trouver un rythme',
};

// -----------------------------------------------------------------------------
//  Pensées. Le jeu choisit le groupe selon l'humeur courante et le mode.
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
  // Hypomanie : agréable, efficace. Les signes sont là, mais discrets.
  hypomanic: [
    'Enfin en forme.',
    'Je fais tout, et bien.',
    'Pourquoi je n’ai pas toujours été comme ça ?',
    'Cinq heures de sommeil, ça suffit, finalement.',
    'Tout le monde me trouve en forme.',
    'J’ai fini en une heure ce qui m’en prenait trois.',
    'J’ai envie de voir du monde.',
    'Et si je m’inscrivais à ce truc aussi ?',
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
  // Ajoutées en dépression (type 1) si le joueur a « tout dépensé »
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
//  Choix impulsifs (manie, type 1) — dans l'ordre des '$' de la carte
// -----------------------------------------------------------------------------
export const CHOICES = {
  spend: {
    title: 'MAINTENANT',
    body: 'Tout dépenser, d’un coup.\nTu le mérites. Tu le sens.',
    yes: 'TOUT DÉPENSER',
    no: 'attendre',
    afterYes: 'Évidemment ! Pourquoi attendre ?',
    afterNo: '… plus tard. Peut-être.',
  },
  gamble: {
    title: 'UNE IDÉE GÉNIALE',
    body: 'Tout miser dessus. Tout de suite.\nC’est sûr, ça va marcher.',
    yes: 'TOUT MISER',
    no: 'réfléchir',
    afterYes: 'Je le savais !',
    afterNo: '… je verrai demain.',
  },
};

// Conséquences, plus loin dans le même niveau
export const CONSEQUENCES = {
  gateLabel: 'Péage',
  gateClosed: 'Plus rien pour payer. Il faut faire le grand tour.',
  gateOpen: 'Il me restait de quoi passer.',
  lose: 'Tout est parti. D’un coup.',
};

// -----------------------------------------------------------------------------
//  Proche (dépression, stabilisation) et soignant (crise maniaque)
// -----------------------------------------------------------------------------
export const COMPANION_LINES = {
  arrive: 'Hé. Je suis là.',
  offer: 'On y va ensemble ? À ton rythme.',
  helping: ['Appuie-toi sur moi.', 'Pas à pas.', 'Je reste là.', 'Prends ton temps.'],
  after: 'On continue ?',
  rejoin: 'Je suis toujours là, si besoin.',
};

export const CARER_LINES = {
  warn: 'Attends !',
  stop: 'Stop. Regarde où tu allais.',
  help: 'On va voir un médecin. Maintenant.',
  stay: 'Je reste avec toi.',
};

// -----------------------------------------------------------------------------
//  Interface
// -----------------------------------------------------------------------------
export const CONTINUE = 'Toucher pour continuer';

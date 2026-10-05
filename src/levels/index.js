// =============================================================================
//  Niveaux en ASCII — faciles à modifier à la main.
//  Une ligne = une rangée de tuiles (15 rangées, 36 px chacune à l'écran).
//
//  Légende :
//    ' '  vide                    '#'  sol (habillage automatique herbe/terre)
//    '='  plateforme traversable par le dessous
//    'P'  départ du joueur        'F'  drapeau de fin de niveau
//    'K'  point de reprise (si chute dans le vide)
//    'o'  objet brillant          '$'  choix impulsif (ordre : `choices`)
//    'G'  péage : fermé si on a tout dépensé ('spend')
//    'L'  perte des objets ramassés si on a tout misé ('gamble')
//    'S'  soignant qui intervient pendant la crise maniaque
//    '^'  pointes (décor de danger, sans collision)
//    'C'  arrivée du proche (phase dépressive)
//    'a'..'d'  outils de stabilisation (voir `tools`, fixés par le mode)
//    '1'..'9'  événements → `events` : hint (indice), thought (pensée imposée),
//              companion (parole du proche), crisis (crise maniaque)
//
//  `mood` : humeur de départ et courbe cible selon la progression horizontale
//  (0 = début du niveau, 1 = fin). Les valeurs vont de -1 (dépressif) à +1
//  (phase haute du mode). Le MoodManager interpole doucement vers la cible.
//
//  L'ordre des niveaux de chaque mode est dans MODES (config.js).
// =============================================================================

import stable from './stable.js';
import rise from './rise.js';
import manic from './manic.js';
import fall from './fall.js';
import depressive from './depressive.js';
import hypomanic from './hypomanic.js';
import depressiveLong from './depressiveLong.js';
import stableShort from './stableShort.js';
import depressiveAgain from './depressiveAgain.js';
import stabilisation from './stabilisation.js';

export const LEVELS = {
  stable,
  rise,
  manic,
  fall,
  depressive,
  hypomanic,
  depressiveLong,
  stableShort,
  depressiveAgain,
  stabilisation,
};

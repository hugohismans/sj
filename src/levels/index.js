// =============================================================================
//  Niveaux en ASCII — faciles à modifier à la main.
//  Une ligne = une rangée de tuiles (15 rangées, 36 px chacune à l'écran).
//
//  Légende :
//    ' '  vide                    '#'  sol (habillage automatique herbe/terre)
//    '='  plateforme traversable par le dessous
//    'P'  départ du joueur        'F'  drapeau de fin de niveau
//    'K'  point de reprise (si chute dans le vide)
//    'o'  objet brillant          '$'  choix impulsif (phase maniaque)
//    'C'  arrivée du proche (phase dépressive)
//    'a'..'d'  outils de stabilisation (voir `tools` du niveau)
//    '1'..'9'  événements (indice, pensée imposée, parole du proche) → `events`
//
//  `mood` : humeur de départ et courbe cible selon la progression horizontale
//  (0 = début du niveau, 1 = fin). Les valeurs vont de -1 (dépressif) à +1
//  (maniaque). Le MoodManager interpole doucement vers la cible.
// =============================================================================

import level1 from './level1.js';
import level2 from './level2.js';
import level3 from './level3.js';
import level4 from './level4.js';

export const LEVELS = [level1, level2, level3, level4];

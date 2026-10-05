// Type 1 — Manie intense (niveau maximal).
// Contrôles très difficiles à doser, le personnage avance même sans commande.
// Deux décisions impulsives ('$', dans l'ordre de `choices`) aux conséquences
// plus loin dans le niveau :
//   - spend  → 'G' : le péage reste fermé, il faut faire le grand tour
//   - gamble → 'L' : tout ce qui a été ramassé est perdu
// Au pic ('2', type 'crisis'), le joueur perd en partie le contrôle et fonce
// vers le vide ('^') ; le soignant ('S') intervient et l'arrête. Fin du niveau.
export default {
  key: 'manic',
  background: 'orange',
  thoughts: 'manic',
  mood: {
    start: 0.7,
    curve: [
      [0, 0.8],
      [0.1, 1],
      [1, 1],
    ],
  },
  choices: ['spend', 'gamble'],
  events: {
    1: { type: 'thought', text: 'Et si je dépensais tout ? Juste là. Maintenant.' },
    2: { type: 'crisis' },
  },
  map: [
    '                                                                                                                                                                                                                        ',
    '                                                                                                                                                                                                                        ',
    '                                                                                                                                                                                                                        ',
    '                                                                               ooooooooo                            ======                                                                                              ',
    '                                                                  ooooooo                                                                                                                                               ',
    '                                                                                                                                                                                                                        ',
    '                                                                                                               ====                                        ooooo                                                        ',
    '                    ooooo                                ooo                                                                                                                                                            ',
    '                                                        o   o                        ====                                                       ooooo                                                                   ',
    '        ooooo                               ooooo                             ====                        ====                                                                                                          ',
    '                                                              K                                      oooo                    oooooo                       #######                                                       ',
    '  P             K           1       $                        ###############                K    $                    G    K         L     K   #######    #######     K           2               S                     ',
    '########################################################     ###############               ##################################################  #######    #######    ####################################               ',
    '########################################################     ###############               ##################################################  #######    #######    ####################################               ',
    '########################################################     ###############               ##################################################  #######    #######    #################################### ^^^^^^^^^^^^  ',
  ],
};

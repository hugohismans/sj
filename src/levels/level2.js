// Niveau 2 — Phase maniaque.
// Vitesse et saut augmentés, forte inertie : on dépasse sa cible.
// Beaucoup d'objets brillants hors du chemin, et un choix impulsif ('$').
export default {
  key: 'manic',
  background: 'orange',
  thoughts: 'manic',
  mood: {
    start: 0.3,
    curve: [
      [0, 0.45],
      [0.12, 1],
      [0.88, 1],
      [1, 0.55],
    ],
  },
  events: {
    1: { type: 'thought', text: 'Et si je dépensais tout ? Juste là. Maintenant.' },
  },
  map: [
    '                                                                                                                                                                                                        ',
    '                                                                                                                                                                                                        ',
    '                                                                                                                                                                                                        ',
    '                                                       oooooooo                          oooooooo                                                                                                       ',
    '                                                                                         ========                                                                                                       ',
    '                                                                                                                                                                  ooooooooooo                           ',
    '                oooo                                                                              oooo                                                                                                  ',
    '                           oooo                          ====                                         oooooo                                               o o                                          ',
    '        oooo              o    o                                                                                                                                                     ooooo              ',
    '                                                 ====            ====                                           ooooo                           o o                                                     ',
    '                                                                         K             ###############                                                   #######                                        ',
    '  P                               K                                     ##############################       K        1     $           K     #######    #######    #######     K               F       ',
    '##########################      ##############                          ##############################      ###############################   #######    #######    #######    #########################',
    '##########################      ##############                          ##############################      ###############################   #######    #######    #######    #########################',
    '##########################      ##############                          ##############################      ###############################   #######    #######    #######    #########################',
  ],
};

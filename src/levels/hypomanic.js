// Type 2 — Hypomanie. Plus rapide, plus précis : le niveau semble plus facile
// et agréable. C'est voulu : l'hypomanie passe souvent inaperçue.
export default {
  key: 'hypomanic',
  background: 'green',
  thoughts: 'stable',
  mood: {
    start: 0.35,
    curve: [
      [0, 0.35],
      [0.1, 1],
      [0.92, 1],
      [1, 0.7],
    ],
  },
  events: {
    1: { type: 'thought', text: 'Pourquoi je n\u2019ai pas toujours été comme ça ?' },
    2: { type: 'thought', text: 'Tout le monde me dit que j\u2019ai bonne mine.' },
  },
  map: [
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                      oooo                                                                                            ',
    '                                                oooo                                                                  oooo                            ',
    '                          ooo                         ====      oooooooo                         oo                                                   ',
    '                                    ooooo       ====         K1                                         ooooooo       ====                            ',
    '          ooooo               K                             #####################   ooooooo         K       2                   ooooooo               ',
    '  P                          #################              #####################                  #################         K                F       ',
    '##########################   #################              ####################################   #################        ##########################',
    '##########################   #################              ####################################   #################        ##########################',
    '##########################   #################              ####################################   #################        ##########################',
  ],
};

// Niveau 3 — Phase dépressive.
// Lent, saut faible, léger retard des commandes. Les murs de 3 tuiles sont
// infranchissables seul : le proche ('C') arrive et aide à passer.
export default {
  key: 'depressive',
  background: 'blue',
  thoughts: 'depressive',
  mood: {
    start: -0.45,
    curve: [
      [0, -0.6],
      [0.14, -1],
      [1, -1],
    ],
  },
  companion: {
    // délai entre l'arrivée du joueur sur 'C' et l'apparition du proche
    arriveDelayMs: 3500,
  },
  events: {
    2: { type: 'thought', text: 'Je n’y arriverai pas.' },
    3: { type: 'companion', text: 'Encore une. On la fait ensemble.' },
    4: { type: 'companion', text: 'Tu vois. Pas à pas.' },
  },
  map: [
    '                                                                                                    ',
    '                                                                                                    ',
    '                                                                                                    ',
    '                                                                                                    ',
    '                                                                                                    ',
    '                                                                                                    ',
    '                                                                                                    ',
    '                                                               ################                     ',
    '                                                               ################                     ',
    '                                     ################   3      ################ 4             F     ',
    '                                     ###############################################################',
    '  P           ###########        C 2 ###############################################################',
    '####################################################################################################',
    '####################################################################################################',
    '####################################################################################################',
  ],
};

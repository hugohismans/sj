// Niveau 4 — Stabilisation.
// L'humeur oscille ; chaque outil réduit l'amplitude (voir STABILISATION dans
// config.js). Les variations restent, mais elles deviennent vivables.
export default {
  key: 'stabilisation',
  background: 'green',
  thoughts: 'stabilisation',
  mood: {
    start: -0.55,
    mode: 'oscillation',
  },
  // ordre des outils 'a', 'b', 'c', 'd' dans la carte
  tools: ['traitement', 'suivi', 'entourage', 'sommeil'],
  events: {},
  map: [
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                                                                      ',
    '                                                                                                         ##########      d                            ',
    '                          a                                    b                   ====   K      c       ######################                       ',
    '  P                ############             K              ########                      ###################################### K             F       ',
    '#########################################  ######################################        #############################################################',
    '#########################################  ######################################        #############################################################',
    '#########################################  ######################################        #############################################################',
  ],
};

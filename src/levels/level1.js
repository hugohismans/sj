// Niveau 1 — Stabilité (euthymie). Sert de tutoriel et de référence.
export default {
  key: 'stable',
  background: 'green',
  thoughts: 'stable',
  mood: {
    start: 0,
    // à la toute fin, l'humeur commence à monter : annonce du niveau suivant
    curve: [
      [0, 0],
      [0.82, 0],
      [1, 0.3],
    ],
  },
  events: {
    1: { type: 'hint', text: '← →  pour avancer', touchText: '◀ ▶  pour avancer' },
    2: { type: 'hint', text: '↑ ou Espace  pour sauter', touchText: '▲  pour sauter' },
    3: { type: 'hint', text: 'Rester appuyé = sauter plus haut', touchText: 'Rester appuyé = sauter plus haut' },
    4: { type: 'thought', text: 'Une chose après l’autre.' },
    5: { type: 'hint', text: 'Si vous tombez, vous reprenez un peu plus loin.', touchText: 'Si vous tombez, vous reprenez un peu plus loin.' },
    6: { type: 'thought', text: 'Tiens… je me sens plein d’énergie, tout à coup.' },
  },
  map: [
    '                                                                                                                            ',
    '                                                                                                                            ',
    '                                                                                                                            ',
    '                                                                                                                            ',
    '                                                                                                                            ',
    '                                                                                                                            ',
    '                                                                                                                            ',
    '                                                                                                                            ',
    '                                                            5    ====                      oooo                             ',
    '                                           ooooo   ############          K                 ====                             ',
    '                                    3   K       4  ############         ###############                                     ',
    '  P 1          2     ##############   #########################         ###############                   6        F        ',
    '###################################   #########################         ####################################################',
    '###################################   #########################         ####################################################',
    '###################################   #########################         ####################################################',
  ],
};

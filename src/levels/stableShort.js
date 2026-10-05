// Type 2 — Courte stabilité, puis retour du poids.
export default {
  key: 'stableShort',
  background: 'green',
  thoughts: 'stable',
  mood: {
    start: -0.35,
    curve: [
      [0, -0.35],
      [0.25, 0],
      [0.7, 0],
      [1, -0.55],
    ],
  },
  events: {
    1: { type: 'thought', text: 'Ça va mieux. Je crois.' },
    2: { type: 'thought', text: 'Non\u2026 pas encore.' },
  },
  map: [
    '                                                                ',
    '                                                                ',
    '                                                                ',
    '                                                                ',
    '                                                                ',
    '                                                                ',
    '                                                                ',
    '                                                                ',
    '                                                                ',
    '                          oooo                                  ',
    '                                                                ',
    '  P               1  ###############              2       F     ',
    '####################################  ##########################',
    '####################################  ##########################',
    '####################################  ##########################',
  ],
};

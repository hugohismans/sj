// Type 2 — Dépression, à nouveau. Le proche arrive plus vite cette fois,
// et pose la question qui peut changer le diagnostic.
export default {
  key: 'depressiveAgain',
  background: 'blue',
  thoughts: 'depressive',
  mood: {
    start: -0.6,
    curve: [
      [0, -0.6],
      [0.12, -1],
      [1, -1],
    ],
  },
  companion: {
    arriveDelayMs: 1200,
    lines: ['Je suis encore là.', 'On a déjà traversé ça. On recommence, ensemble.'],
  },
  events: {
    1: { type: 'thought', text: 'Ça recommence.' },
    2: { type: 'thought', text: 'On m\u2019a dit que c\u2019était une dépression. Encore une.' },
    3: { type: 'companion', text: 'Et les périodes où tout allait trop bien ? Tu en as parlé au médecin ?' },
  },
  map: [
    '                                                                                                          ',
    '                                                                                                          ',
    '                                                                                                          ',
    '                                                                                                          ',
    '                                                                                                          ',
    '                                                                                                          ',
    '                                                                          3                               ',
    '                                                            #####################                         ',
    '                                        2                   #####################                         ',
    '                              ################              #####################                 F       ',
    '                              ############################################################################',
    '  P   1       C               ############################################################################',
    '##########################################################################################################',
    '##########################################################################################################',
    '##########################################################################################################',
  ],
};

import Phaser from 'phaser';

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const COLORS = {
  bg: 0x1b1d26,
  text: '#e8e6e1',
  muted: '#9a9aa6',
  accent: '#c9b98f',
  warn: '#e0a050',
};

/** Texte net (rendu à haute résolution) avec les styles du jeu. */
export function makeText(scene, x, y, str, style = {}) {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: '22px',
    color: COLORS.text,
    align: 'center',
    lineSpacing: 6,
    resolution: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
    ...style,
  });
  t.setOrigin(0.5);
  return t;
}

/** Bouton simple : rectangle arrondi + texte, accessible au tactile. */
export function makeButton(scene, x, y, label, onClick, opts = {}) {
  const {
    width = 260,
    height = 56,
    fontSize = '22px',
    fill = 0x2c3040,
    stroke = 0x8c8a80,
    textColor = COLORS.text,
  } = opts;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const draw = (hover) => {
    g.clear();
    g.fillStyle(hover ? Phaser.Display.Color.ValueToColor(fill).lighten(12).color : fill, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    g.lineStyle(2, stroke, 1);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
  };
  draw(false);
  const t = makeText(scene, 0, 0, label, { fontSize, color: textColor });
  c.add([g, t]);
  c.setSize(width, height);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerover', () => draw(true));
  c.on('pointerout', () => draw(false));
  c.on('pointerup', () => onClick && onClick());
  c.label = t;
  return c;
}

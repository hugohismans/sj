# Entre deux pôles

Prototype jouable d'un jeu de plateforme 2D, mobile-first, qui fait ressentir le
trouble bipolaire de l'intérieur : l'humeur du personnage modifie directement les
commandes, la physique, l'image, le son et l'interface.

> Ce jeu évoque des troubles de l'humeur. Il ne remplace pas un avis médical.

## Deux modes

| | Type 1 | Type 2 |
|---|---|---|
| Séquence | Stabilité → Montée → Manie intense → Chute → Dépression → Stabilisation | Stabilité → Hypomanie → Dépression longue → Courte stabilité → Dépression → Stabilisation |
| Phase haute | Manie maximale : inertie, le personnage avance seul, 2 décisions impulsives (péage fermé, objets perdus), crise et intervention d'un soignant | Hypomanie : plus rapide et plus précis, niveau agréable, presque « enfin la forme » |
| Dépression | Un niveau, le proche aide à franchir les murs | Deux niveaux, plus longs et plus lents |

Même moteur pour les deux modes ; séquences et intensités dans `MODES` (`src/config.js`).

## Lancer

```bash
npm install
npm run dev        # http://localhost:5173 (accessible depuis le téléphone sur le même réseau)
npm run build      # build statique dans dist/
npm run preview    # sert dist/
```

Raccourcis de test :
- `?mode=1&niveau=3` : lance directement l'étape 3 du type 1 (`mode=2` pour le type 2).
- `?debug` : expose `window.game` dans la console.
- `GAME.debug = true` dans `src/config.js` : affiche les hitbox.

Commandes : ◀ ▶ ▲ tactiles (paysage) · clavier : flèches / ZQSD / WASD + Espace.

## Régler le ressenti

Tout est dans **`src/config.js`** :
- `MODES` : séquence de niveaux de chaque mode, profil haut (manie ou hypomanie),
  surcharges d'intensité par mode, réglages de stabilisation.
- `MOOD_PROFILES.STABLE / MANIC / HYPOMANIC / DEPRESSIVE` : vitesse, inertie, saut, gravité,
  retard des commandes, saturation, vignette, caméra, tempo, filtre audio, fréquence
  des pensées, opacité de l'interface…
- `COMPANION` : force de l'aide du proche (saut, vitesse, retard réduit).
- `MANIC_EXTRAS` : aimant des objets brillants, conséquences, crise maniaque.
- `STABILISATION` : amplitude/période de l'oscillation et effet de chaque outil.

L'humeur est une valeur continue de -1 (dépressif) à +1 (maniaque) : chaque
paramètre est interpolé entre les profils, les transitions sont donc progressives.

Textes :
- **`src/content/content.js`** : toutes les explications médicales (définitions des
  types, textes entre niveaux, outils, fins, comparatif, ressources) — à faire relire.
- **`src/content/texts.js`** : pensées, paroles, choix, interface.

Niveaux (cartes ASCII) : **`src/levels/`**.

## Architecture

```
src/
  config.js              réglages de gameplay par état d'humeur
  main.js                configuration Phaser (FIT, paysage, multi-touch)
  mood/MoodManager.js    humeur courante, interpolation, effets (post-FX, caméra, son)
  audio/MoodAudio.js     musique générative WebAudio (tempo, filtre, densité)
  input/Controls.js      clavier + tactile, retard d'input configurable
  entities/Player.js     déplacement piloté par mood.params
  entities/Companion.js  proche/soignant : suit et soutient
  levels/                10 niveaux en ASCII + courbes d'humeur
  content/content.js     explications médicales (à relire)
  content/texts.js       pensées, paroles, interface
  scenes/                Boot, Warning, Title, ModeIntro, Game, UI, Interlude,
                         End, Compare, Resources
  ui/widgets.js          texte et boutons
```

## Déployer sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit et publie `dist/` à chaque push
sur `main`. Dans le dépôt GitHub : **Settings → Pages → Source : GitHub Actions**.

## Crédits

Voir [CREDITS.md](CREDITS.md). Graphismes : Kenney (CC0).

## À valider avant diffusion

- Tout `src/content/content.js` (définitions médicales, messages de fin, comparatif).
- L'écran **Ressources** : numéros et associations marqués **[À VÉRIFIER]**.

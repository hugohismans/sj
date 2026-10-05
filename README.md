# Entre deux pôles

Prototype jouable d'un jeu de plateforme 2D, mobile-first, qui fait ressentir le
trouble bipolaire de l'intérieur : l'humeur du personnage modifie directement les
commandes, la physique, l'image, le son et l'interface.

> Ce jeu évoque des troubles de l'humeur. Il ne remplace pas un avis médical.

## Lancer

```bash
npm install
npm run dev        # http://localhost:5173 (accessible depuis le téléphone sur le même réseau)
npm run build      # build statique dans dist/
npm run preview    # sert dist/
```

Raccourcis de test :
- `?niveau=1` … `?niveau=4` : lance directement un niveau.
- `?debug` : expose `window.game` dans la console.
- `GAME.debug = true` dans `src/config.js` : affiche les hitbox.

Commandes : ◀ ▶ ▲ tactiles (paysage) · clavier : flèches / ZQSD / WASD + Espace.

## Régler le ressenti

Tout est dans **`src/config.js`** :
- `MOOD_PROFILES.STABLE / MANIC / DEPRESSIVE` : vitesse, inertie, saut, gravité,
  retard des commandes, saturation, vignette, caméra, tempo, filtre audio, fréquence
  des pensées, opacité de l'interface…
- `COMPANION` : force de l'aide du proche (saut, vitesse, retard réduit).
- `MANIC_EXTRAS` : aimant des objets brillants, conséquence du choix impulsif.
- `STABILISATION` : amplitude/période de l'oscillation et effet de chaque outil.

L'humeur est une valeur continue de -1 (dépressif) à +1 (maniaque) : chaque
paramètre est interpolé entre les profils, les transitions sont donc progressives.

Textes : **`src/content/texts.js`**. Niveaux (cartes ASCII) : **`src/levels/`**.

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
  levels/                4 niveaux en ASCII + courbes d'humeur
  content/texts.js       tous les textes (FR)
  scenes/                Boot, Warning, Title, Game, UI, Interlude, End, Resources
  ui/widgets.js          texte et boutons
```

## Déployer sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit et publie `dist/` à chaque push
sur `main`. Dans le dépôt GitHub : **Settings → Pages → Source : GitHub Actions**.

## Crédits

Voir [CREDITS.md](CREDITS.md). Graphismes : Kenney (CC0).

## À valider avant diffusion

L'écran **Ressources** contient des numéros et associations marqués **[À VÉRIFIER]**
(`src/content/texts.js`, objet `RESOURCES`).

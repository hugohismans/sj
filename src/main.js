import Phaser from 'phaser';
import { GAME } from './config.js';
import BootScene from './scenes/BootScene.js';
import WarningScene from './scenes/WarningScene.js';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import InterludeScene from './scenes/InterludeScene.js';
import EndScene from './scenes/EndScene.js';
import ResourcesScene from './scenes/ResourcesScene.js';
import { moodAudio } from './audio/MoodAudio.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.width,
  height: GAME.height,
  backgroundColor: '#1b1d26',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: { noAudio: true }, // musique générée par MoodAudio (WebAudio)
  input: {
    activePointers: 4, // multi-touch : avancer et sauter en même temps
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1400 },
      debug: GAME.debug,
    },
  },
  scene: [BootScene, WarningScene, TitleScene, GameScene, UIScene, InterludeScene, EndScene, ResourcesScene],
});

// Les navigateurs mobiles exigent un geste utilisateur pour activer le son
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => moodAudio.unlock(), { passive: true }));

// Raccourcis de test : ?niveau=3 lance directement le niveau 3, ?debug expose `window.game`
const params = new URLSearchParams(location.search);
if (GAME.debug || params.has('debug')) window.game = game;

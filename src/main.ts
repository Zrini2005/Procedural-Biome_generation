 
import { SceneMain } from './scenes/SceneMain';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: "#90EE90",
  physics: {
    default: 'arcade',
    arcade: {
        debug: true, // Enable debug visuals
    },
},
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    SceneMain,
  ]
};

export default new Game(config);

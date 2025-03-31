import "phaser";
import { GameScene } from "./scenes/GameScene";
import { BuyMenuScene } from "./scenes/BuyMenuScene";
import { SellMenuScene } from "./scenes/SellMenuScene";
import { TravelMenuScene } from "./scenes/TravelMenuScene";
import { DebtMenuScene } from "./scenes/DebtMenuScene";
import { SaveMenuScene } from "./scenes/SaveMenuScene";
import { NewGameScene } from "./scenes/NewGameScene";
import { GameOverScene } from "./scenes/GameOverScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game",
  scene: [
    NewGameScene,
    GameScene,
    BuyMenuScene,
    SellMenuScene,
    TravelMenuScene,
    DebtMenuScene,
    SaveMenuScene,
    GameOverScene,
  ],
  backgroundColor: "#000000",
};

new Phaser.Game(config);

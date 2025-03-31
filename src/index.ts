import { GameScene } from "./scenes/GameScene";
import { BuyMenuScene } from "./scenes/Buy/scene";
import { SellMenuScene } from "./scenes/SellMenuScene";
import { TravelMenuScene } from "./scenes/TravelMenuScene";
import { SaveMenuScene } from "./scenes/SaveMenuScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { NewGameScene } from "./scenes/NewGameScene";
import { DebtMenuScene } from "./scenes/DebtMenuScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: [
    NewGameScene,
    GameScene,
    BuyMenuScene,
    SellMenuScene,
    TravelMenuScene,
    SaveMenuScene,
    GameOverScene,
    DebtMenuScene,
  ],
  backgroundColor: "#000000",
};

export default new Phaser.Game(config);

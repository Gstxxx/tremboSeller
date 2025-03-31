import { Scene } from "phaser";
import { SaveManager } from "../services/SaveManager";

export class SaveMenuScene extends Scene {
  private saveManager: SaveManager;
  private mode: "save" | "load" = "save";

  private readonly COLORS = {
    background: "#000000",
    primary: "#00ff00",
    secondary: "#1a1a1a",
    accent: "#ff0000",
    text: "#ffffff",
    textDark: "#888888",
  };

  private readonly STYLES = {
    title: {
      fontSize: "40px",
      color: this.COLORS.primary,
      fontStyle: "bold",
    },
    subtitle: {
      fontSize: "24px",
      color: this.COLORS.text,
    },
    info: {
      fontSize: "28px",
      color: this.COLORS.primary,
    },
    button: {
      fontSize: "20px",
      color: this.COLORS.text,
      backgroundColor: this.COLORS.secondary,
      padding: { x: 15, y: 10 },
    },
    slotText: {
      fontSize: "24px",
      color: this.COLORS.text,
    },
  };

  constructor() {
    super({ key: "SaveMenuScene" });
    this.saveManager = new SaveManager();
  }

  init(data: { mode: "save" | "load" }) {
    this.mode = data.mode;
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createSlotList();
    this.createFooter();
  }

  private createBackground() {
    const bg = this.add.rectangle(0, 0, 1280, 720, 0x000000);
    bg.setOrigin(0, 0);

    for (let i = 0; i < 1280; i += 40) {
      this.add.line(0, 0, i, 0, i, 720, 0x111111);
    }
    for (let i = 0; i < 720; i += 40) {
      this.add.line(0, 0, 0, i, 1280, i, 0x111111);
    }
  }

  private createHeader() {
    const headerPanel = this.add.rectangle(0, 0, 1280, 120, 0x111111);
    headerPanel.setOrigin(0, 0);

    this.add
      .text(
        640,
        40,
        this.mode === "save" ? "SALVAR JOGO" : "CARREGAR JOGO",
        this.STYLES.title
      )
      .setOrigin(0.5);

    this.add.text(50, 85, "SELECIONE UM SLOT", {
      ...this.STYLES.subtitle,
      color: this.COLORS.textDark,
    });
  }

  private createSlotList() {
    const startY = 150;
    const spacing = 120;
    let y = startY;

    const slots = this.saveManager.getSaveSlots();

    slots.forEach(({ slot, lastSaved }) => {
      if (slot === null) return;

      const slotBg = this.add.rectangle(50, y - 10, 1180, 100, 0x222222);
      slotBg.setOrigin(0, 0);

      this.add.text(100, y + 20, `SLOT ${slot}`, {
        ...this.STYLES.slotText,
        fontSize: "32px",
      });

      this.add.text(
        400,
        y + 20,
        this.saveManager.formatLastSaved(lastSaved ?? 0),
        {
          ...this.STYLES.slotText,
          color: lastSaved ? this.COLORS.primary : this.COLORS.textDark,
        }
      );

      if (this.mode === "save" || lastSaved) {
        const actionButton = this.add
          .text(1000, y + 20, this.mode === "save" ? "SALVAR" : "CARREGAR", {
            ...this.STYLES.button,
            fontSize: "28px",
            backgroundColor: this.COLORS.primary,
            color: this.COLORS.background,
            padding: { x: 30, y: 15 },
          })
          .setInteractive()
          .on("pointerdown", () =>
            this.mode === "save" ? this.saveGame(slot) : this.loadGame(slot)
          );
      }

      if (lastSaved) {
        const deleteButton = this.add
          .text(800, y + 20, "APAGAR", {
            ...this.STYLES.button,
            fontSize: "28px",
            backgroundColor: this.COLORS.accent,
            padding: { x: 30, y: 15 },
          })
          .setInteractive()
          .on("pointerdown", () => this.deleteSave(slot));
      }

      y += spacing;
    });
  }

  private createFooter() {
    const footerY = 620;

    const footerPanel = this.add.rectangle(
      0,
      footerY - 20,
      1280,
      120,
      0x111111
    );
    footerPanel.setOrigin(0, 0);

    const backButton = this.add
      .text(640, footerY + 20, "VOLTAR", {
        ...this.STYLES.button,
        fontSize: "32px",
        padding: { x: 30, y: 15 },
      })
      .setInteractive()
      .on("pointerdown", () => this.scene.start("GameScene"));
  }

  private saveGame(slot: number) {
    try {
      this.saveManager.setCurrentSlot(slot);
      const gameScene = this.scene.get("GameScene") as any;
      const state = {
        playerMoney: gameScene.playerMoney,
        inventory: gameScene.inventory,
        currentLocation: gameScene.currentLocation,
        debts: gameScene.debtManager.getDebts(),
        lastSaved: Date.now(),
        currentPrices: gameScene.priceManager.getAllPrices(),
        gameTime: {
          day: gameScene.timeManager.getCurrentDay(),
          hour: gameScene.timeManager.getCurrentHour(),
        },
      };
      this.saveManager.saveGame(state);
      this.showMessage("JOGO SALVO!", this.COLORS.primary);
      this.time.delayedCall(1000, () => {
        this.scene.restart({ mode: this.mode });
      });
    } catch (error) {
      this.showMessage("ERRO AO SALVAR!", this.COLORS.accent);
    }
  }

  private loadGame(slot: number) {
    try {
      const state = this.saveManager.loadGame(slot);
      if (!state) {
        this.showMessage("SAVE NÃO ENCONTRADO!", this.COLORS.accent);
        return;
      }

      const gameScene = this.scene.get("GameScene") as any;
      gameScene.playerMoney = state.playerMoney;
      gameScene.inventory = state.inventory;
      gameScene.currentLocation = state.currentLocation;
      gameScene.debtManager.debts = state.debts;
      gameScene.priceManager.setPrices(state.currentPrices);
      gameScene.timeManager.setTime(state.gameTime.day, state.gameTime.hour);

      this.showMessage("JOGO CARREGADO!", this.COLORS.primary);
      this.time.delayedCall(1000, () => {
        this.scene.start("GameScene");
      });
    } catch (error) {
      this.showMessage("ERRO AO CARREGAR!", this.COLORS.accent);
    }
  }

  private deleteSave(slot: number) {
    try {
      this.saveManager.deleteSave(slot);
      this.showMessage("SAVE APAGADO!", this.COLORS.primary);
      this.time.delayedCall(1000, () => {
        this.scene.restart({ mode: this.mode });
      });
    } catch (error) {
      this.showMessage("ERRO AO APAGAR!", this.COLORS.accent);
    }
  }

  private showMessage(text: string, color: string = this.COLORS.text) {
    const message = this.add
      .text(640, 360, text, {
        fontSize: "32px",
        color: color,
        backgroundColor: this.COLORS.secondary,
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => message.destroy(),
    });
  }
}

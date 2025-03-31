import { Scene } from "phaser";

export class NewGameScene extends Scene {
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
      fontSize: "64px",
      color: this.COLORS.primary,
      fontStyle: "bold",
    },
    subtitle: {
      fontSize: "32px",
      color: this.COLORS.text,
    },
    button: {
      fontSize: "28px",
      color: this.COLORS.text,
      backgroundColor: this.COLORS.secondary,
      padding: { x: 30, y: 15 },
    },
  };

  constructor() {
    super({ key: "NewGameScene" });
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createButtons();
  }

  private createBackground() {
    const bg = this.add.rectangle(0, 0, 1280, 720, 0x000000);
    bg.setOrigin(0, 0);

    // Grade de fundo (efeito cyberpunk)
    for (let i = 0; i < 1280; i += 40) {
      this.add.line(0, 0, i, 0, i, 720, 0x111111);
    }
    for (let i = 0; i < 720; i += 40) {
      this.add.line(0, 0, 0, i, 1280, i, 0x111111);
    }

    // Efeito de brilho pulsante
    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x00ff00, 0.1);
    overlay.setOrigin(0, 0);

    this.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createTitle() {
    const title = this.add
      .text(640, 200, "DRUGLORD 2", this.STYLES.title)
      .setOrigin(0.5);

    const subtitle = this.add
      .text(640, 280, "O IMPÉRIO DO TRÁFICO", {
        ...this.STYLES.subtitle,
        color: this.COLORS.textDark,
      })
      .setOrigin(0.5);

    // Efeito de glitch no título
    this.time.addEvent({
      delay: 3000,
      callback: () => this.createGlitchEffect(title),
      loop: true,
    });
  }

  private createButtons() {
    const startY = 400;
    const spacing = 80;

    // Botão Novo Jogo
    const newGameButton = this.add
      .text(640, startY, "NOVO JOGO", {
        ...this.STYLES.button,
        backgroundColor: this.COLORS.primary,
        color: this.COLORS.background,
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.startNewGame());

    // Botão Carregar Jogo
    const loadGameButton = this.add
      .text(640, startY + spacing, "CARREGAR JOGO", this.STYLES.button)
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () =>
        this.scene.start("SaveMenuScene", { mode: "load" })
      );

    // Adicionar efeito hover nos botões
    [newGameButton, loadGameButton].forEach((button) => {
      button.on("pointerover", () => {
        button.setScale(1.1);
      });
      button.on("pointerout", () => {
        button.setScale(1);
      });
    });
  }

  private createGlitchEffect(target: Phaser.GameObjects.Text) {
    const originalText = target.text;
    const glitchChars = "!@#$%¨&*()_+";
    let glitchCount = 0;
    const maxGlitches = 3;

    const glitchInterval = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (glitchCount >= maxGlitches) {
          target.setText(originalText);
          glitchInterval.destroy();
          return;
        }

        const glitchedText = originalText
          .split("")
          .map((char) =>
            Math.random() < 0.3
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : char
          )
          .join("");

        target.setText(glitchedText);
        glitchCount++;
      },
      repeat: maxGlitches,
    });
  }

  private startNewGame() {
    // Efeito de fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      this.scene.start("GameScene");
    });
  }
}

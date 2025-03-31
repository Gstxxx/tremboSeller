import { Scene } from "phaser";

export class GameOverScene extends Scene {
  private reason: string = "";
  private stats: {
    daysSurvived: number;
    maxMoney: number;
    totalDeals: number;
  } = {
    daysSurvived: 0,
    maxMoney: 0,
    totalDeals: 0,
  };

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
      color: this.COLORS.accent,
      fontStyle: "bold",
    },
    subtitle: {
      fontSize: "32px",
      color: this.COLORS.text,
    },
    stats: {
      fontSize: "24px",
      color: this.COLORS.primary,
    },
    button: {
      fontSize: "28px",
      color: this.COLORS.text,
      backgroundColor: this.COLORS.secondary,
      padding: { x: 30, y: 15 },
    },
  };

  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data: {
    reason: string;
    stats: {
      daysSurvived: number;
      maxMoney: number;
      totalDeals: number;
    };
  }) {
    this.reason = data.reason;
    this.stats = data.stats;
  }

  create() {
    this.createBackground();
    this.createContent();
    this.createButtons();
  }

  private createBackground() {
    const bg = this.add.rectangle(0, 0, 1280, 720, 0x000000);
    bg.setOrigin(0, 0);

    // Grade de fundo com efeito vermelho
    for (let i = 0; i < 1280; i += 40) {
      this.add.line(0, 0, i, 0, i, 720, 0x330000);
    }
    for (let i = 0; i < 720; i += 40) {
      this.add.line(0, 0, 0, i, 1280, i, 0x330000);
    }

    // Efeito de brilho pulsante vermelho
    const overlay = this.add.rectangle(0, 0, 1280, 720, 0xff0000, 0.1);
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

  private createContent() {
    // Título
    const title = this.add
      .text(640, 160, "GAME OVER", this.STYLES.title)
      .setOrigin(0.5);

    // Razão do game over
    this.add
      .text(640, 240, this.reason, {
        ...this.STYLES.subtitle,
        color: this.COLORS.accent,
      })
      .setOrigin(0.5);

    // Estatísticas
    const statsY = 340;
    const spacing = 50;

    this.add
      .text(
        640,
        statsY,
        `Dias Sobrevividos: ${this.stats.daysSurvived}`,
        this.STYLES.stats
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        statsY + spacing,
        `Maior Quantia: $${this.stats.maxMoney}`,
        this.STYLES.stats
      )
      .setOrigin(0.5);

    this.add
      .text(
        640,
        statsY + spacing * 2,
        `Total de Negócios: ${this.stats.totalDeals}`,
        this.STYLES.stats
      )
      .setOrigin(0.5);

    // Efeito de glitch no título
    this.time.addEvent({
      delay: 2000,
      callback: () => this.createGlitchEffect(title),
      loop: true,
    });
  }

  private createButtons() {
    const startY = 520;
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
      .on("pointerdown", () => this.scene.start("NewGameScene"));

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
}

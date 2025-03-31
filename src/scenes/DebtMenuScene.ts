import { Scene } from "phaser";
import { Debt, DebtManager, Lender } from "../services/DebtManager";

export class DebtMenuScene extends Scene {
  private debtManager: DebtManager;
  private playerMoney: number = 0;
  private selectedDebt: Debt | null = null;
  private selectedLender: Lender | null = null;
  private loanAmount: number = 0;

  private readonly COLORS = {
    background: "#000000",
    primary: "#00ff00",
    secondary: "#1a1a1a",
    accent: "#ff0000",
    text: "#ffffff",
    textDark: "#888888",
    panel: "#111111",
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
    debtText: {
      fontSize: "24px",
      color: this.COLORS.text,
    },
  };

  constructor() {
    super({ key: "DebtMenuScene" });
    this.debtManager = new DebtManager();
  }

  init(data: { playerMoney: number }) {
    this.playerMoney = data.playerMoney;
  }

  create() {
    // Fundo semi-transparente
    const bg = this.add
      .rectangle(0, 0, 1280, 720, 0x000000)
      .setOrigin(0)
      .setAlpha(0.8);

    // Painel principal
    const panel = this.add.rectangle(340, 160, 600, 400, 0x111111).setOrigin(0);

    // Borda do painel
    const border = this.add.rectangle(340, 160, 600, 400, 0x00ff00);
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, 0x00ff00);
    border.setFillStyle();

    // Título
    this.add.text(360, 180, "🦈 MENU DO AGIOTA", {
      fontSize: "32px",
      color: this.COLORS.primary,
    });

    // Seu dinheiro atual
    this.add.text(360, 240, `💰 Seu dinheiro: $${this.playerMoney}`, {
      fontSize: "24px",
      color: this.COLORS.text,
    });

    // Opções de empréstimo
    const loanOptions = [
      { amount: 1000, interest: 20 },
      { amount: 5000, interest: 30 },
      { amount: 10000, interest: 50 },
    ];

    let y = 300;
    loanOptions.forEach((option) => {
      const totalRepay = option.amount * (1 + option.interest / 100);

      const buttonBg = this.add.rectangle(360, y, 560, 50, 0x222222);
      buttonBg.setOrigin(0, 0);
      buttonBg.setInteractive();

      buttonBg.on("pointerover", () => {
        buttonBg.setFillStyle(0x333333);
      });

      buttonBg.on("pointerout", () => {
        buttonBg.setFillStyle(0x222222);
      });

      buttonBg.on("pointerdown", () => {
        this.events.emit("loan", { amount: option.amount });
        this.scene.stop();
      });

      this.add.text(
        380,
        y + 10,
        `Pegar $${option.amount} (Juros: ${option.interest}% - Total: $${totalRepay})`,
        {
          fontSize: "20px",
          color: this.COLORS.text,
        }
      );

      y += 70;
    });

    // Botão de fechar
    const closeButton = this.add
      .text(890, 170, "❌", {
        fontSize: "24px",
        color: this.COLORS.text,
      })
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.stop();
      });

    // Botão de pagar dívida
    const payDebtButton = this.add.rectangle(360, 480, 560, 50, 0x333333);
    payDebtButton.setOrigin(0, 0);
    payDebtButton.setInteractive();

    payDebtButton.on("pointerover", () => {
      payDebtButton.setFillStyle(0x444444);
    });

    payDebtButton.on("pointerout", () => {
      payDebtButton.setFillStyle(0x333333);
    });

    const payDebtText = this.add
      .text(380, 490, "💸 PAGAR DÍVIDA", {
        fontSize: "24px",
        color: this.COLORS.primary,
      })
      .setInteractive()
      .on("pointerdown", () => {
        // Aqui você pode implementar a lógica de pagamento
        if (this.playerMoney >= 1000) {
          this.events.emit("debtPayment", { amount: 1000 });
          this.showMessage(
            "Pagamento realizado com sucesso!",
            this.COLORS.primary
          );
        } else {
          this.showMessage("Dinheiro insuficiente!", this.COLORS.accent);
        }
      });
  }

  private showMessage(text: string, color: string) {
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
      y: 310,
      duration: 2000,
      ease: "Power2",
      onComplete: () => message.destroy(),
    });
  }
}

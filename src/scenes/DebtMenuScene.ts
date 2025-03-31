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
    this.createBackground();
    this.createHeader();
    this.createDebtList();
    this.createLenderList();
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
      .text(640, 40, "DÍVIDAS E EMPRÉSTIMOS", this.STYLES.title)
      .setOrigin(0.5);

    this.add.text(750, 85, `CASH: $${this.playerMoney}`, {
      ...this.STYLES.info,
      align: "right",
    });
  }

  private createDebtList() {
    const startY = 150;
    const spacing = 100;
    let y = startY;

    const debts = this.debtManager.getDebts();
    const activeDebts = debts.filter((debt) => !debt.isPaid);

    const debtPanel = this.add.rectangle(
      50,
      startY - 20,
      580,
      400,
      0x111111,
      0.5
    );
    debtPanel.setOrigin(0, 0);

    this.add.text(70, y, "DÍVIDAS ATIVAS", {
      ...this.STYLES.subtitle,
      color: this.COLORS.primary,
    });

    y += 50;

    if (activeDebts.length === 0) {
      this.add.text(70, y, "NENHUMA DÍVIDA ATIVA", {
        ...this.STYLES.debtText,
        color: this.COLORS.textDark,
      });
      return;
    }

    activeDebts.forEach((debt) => {
      const totalDue = this.debtManager.calculateTotalDue(debt);
      const daysLeft = Math.ceil(
        (debt.dueDate - Date.now()) / (24 * 60 * 60 * 1000)
      );

      const debtBg = this.add.rectangle(70, y - 10, 540, 80, 0x222222);
      debtBg.setOrigin(0, 0);

      this.add.text(90, y, `AGIOTA: ${debt.lender}`, this.STYLES.debtText);
      this.add.text(90, y + 30, `VALOR: $${totalDue}`, {
        ...this.STYLES.debtText,
        color: this.COLORS.accent,
      });
      this.add.text(400, y + 30, `PRAZO: ${daysLeft}d`, {
        ...this.STYLES.debtText,
        color: daysLeft > 0 ? this.COLORS.primary : this.COLORS.accent,
      });

      const payButton = this.add
        .text(500, y + 15, "PAGAR", {
          ...this.STYLES.button,
          backgroundColor: this.COLORS.primary,
          color: this.COLORS.background,
        })
        .setInteractive()
        .on("pointerdown", () => this.selectDebt(debt));

      y += spacing;
    });
  }

  private createLenderList() {
    const startY = 150;
    const spacing = 100;
    let y = startY;

    const lenders = this.debtManager.getLenders();

    const lenderPanel = this.add.rectangle(
      650,
      startY - 20,
      580,
      400,
      0x111111,
      0.5
    );
    lenderPanel.setOrigin(0, 0);

    this.add.text(670, y, "AGIOTAS DISPONÍVEIS", {
      ...this.STYLES.subtitle,
      color: this.COLORS.primary,
    });

    y += 50;

    lenders.forEach((lender) => {
      const lenderBg = this.add.rectangle(670, y - 10, 540, 80, 0x222222);
      lenderBg.setOrigin(0, 0);

      this.add.text(690, y, lender.name, this.STYLES.debtText);
      this.add.text(690, y + 30, `JUROS: ${lender.baseInterest * 100}%/dia`, {
        ...this.STYLES.debtText,
        color: this.COLORS.accent,
      });
      this.add.text(
        900,
        y + 30,
        `$${lender.minLoan}-${lender.maxLoan}`,
        this.STYLES.debtText
      );

      const loanButton = this.add
        .text(1100, y + 15, "PEDIR", {
          ...this.STYLES.button,
          backgroundColor: this.COLORS.primary,
          color: this.COLORS.background,
        })
        .setInteractive()
        .on("pointerdown", () => this.selectLender(lender));

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

  private selectDebt(debt: Debt) {
    this.selectedDebt = debt;
    const totalDue = this.debtManager.calculateTotalDue(debt);

    if (this.playerMoney < totalDue) {
      this.showMessage("DINHEIRO INSUFICIENTE!", this.COLORS.accent);
      return;
    }

    // Pagar a dívida
    const paid = this.debtManager.payDebt(debt.id, this.playerMoney);

    // Emitir evento de pagamento
    const gameScene = this.scene.get("GameScene");
    gameScene.events.emit("debtPayment", { amount: paid });

    // Mostrar mensagem de sucesso
    this.showMessage("DÍVIDA PAGA!", this.COLORS.primary);

    // Atualizar a UI
    this.time.delayedCall(1000, () => {
      this.scene.restart({ playerMoney: this.playerMoney - paid });
    });
  }

  private selectLender(lender: Lender) {
    this.selectedLender = lender;
    this.showLoanDialog(lender);
  }

  private showLoanDialog(lender: Lender) {
    const dialog = this.add.rectangle(340, 210, 600, 300, 0x000000);
    dialog.setOrigin(0, 0);
    dialog.setStrokeStyle(2, 0x00ff00);

    this.add
      .text(640, 240, "NOVO EMPRÉSTIMO", {
        ...this.STYLES.title,
        fontSize: "32px",
      })
      .setOrigin(0.5);

    this.add.text(
      360,
      300,
      `VALOR MIN: $${lender.minLoan}`,
      this.STYLES.debtText
    );
    this.add.text(
      360,
      340,
      `VALOR MAX: $${lender.maxLoan}`,
      this.STYLES.debtText
    );
    this.add.text(
      360,
      380,
      `JUROS: ${lender.baseInterest * 100}%/dia`,
      this.STYLES.debtText
    );
    this.add.text(
      360,
      420,
      `PRAZO: ${lender.gracePeriod} dias`,
      this.STYLES.debtText
    );

    const amountInput = this.add
      .text(640, 360, "0", {
        ...this.STYLES.debtText,
        backgroundColor: this.COLORS.secondary,
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5);

    const confirmButton = this.add
      .text(740, 440, "CONFIRMAR", {
        ...this.STYLES.button,
        backgroundColor: this.COLORS.primary,
        color: this.COLORS.background,
      })
      .setInteractive()
      .on("pointerdown", () => {
        const amount = parseInt(amountInput.text);
        this.requestLoan(amount);
        dialog.destroy();
        amountInput.destroy();
        confirmButton.destroy();
        cancelButton.destroy();
      });

    const cancelButton = this.add
      .text(540, 440, "CANCELAR", this.STYLES.button)
      .setInteractive()
      .on("pointerdown", () => {
        dialog.destroy();
        amountInput.destroy();
        confirmButton.destroy();
        cancelButton.destroy();
      });

    // Adicionar controles de quantidade
    const minusButton = this.add
      .text(540, 360, "-", {
        ...this.STYLES.button,
        fontSize: "32px",
      })
      .setInteractive()
      .on("pointerdown", () => {
        const current = parseInt(amountInput.text) || 0;
        const newAmount = Math.max(lender.minLoan, current - 100);
        amountInput.setText(newAmount.toString());
      });

    const plusButton = this.add
      .text(740, 360, "+", {
        ...this.STYLES.button,
        fontSize: "32px",
      })
      .setInteractive()
      .on("pointerdown", () => {
        const current = parseInt(amountInput.text) || 0;
        const newAmount = Math.min(lender.maxLoan, current + 100);
        amountInput.setText(newAmount.toString());
      });
  }

  private requestLoan(amount: number) {
    if (!this.selectedLender) return;

    const terms = this.debtManager.getLoanTerms(
      this.selectedLender.name,
      amount
    );
    if (!terms) {
      this.showMessage("VALOR INVÁLIDO!", this.COLORS.accent);
      return;
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      amount,
      interest: terms.interest,
      dueDate: terms.dueDate,
      lender: terms.lender,
      isPaid: false,
    };

    this.debtManager.addDebt(newDebt);

    // Emitir evento de empréstimo
    const gameScene = this.scene.get("GameScene");
    gameScene.events.emit("loan", { amount });

    // Mostrar mensagem de sucesso
    this.showMessage("EMPRÉSTIMO APROVADO!", this.COLORS.primary);

    // Atualizar a UI
    this.time.delayedCall(1000, () => {
      this.scene.restart({ playerMoney: this.playerMoney + amount });
    });
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

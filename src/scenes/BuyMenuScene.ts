import { Scene } from "phaser";

export class BuyMenuScene extends Scene {
  private drugPrices: { [key: string]: number } = {};
  private currentLocation: string = "";
  private playerMoney: number = 0;
  private quantityInputs: { [key: string]: Phaser.GameObjects.Text } = {};
  private totalCostText!: Phaser.GameObjects.Text;
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
    itemText: {
      fontSize: "24px",
      color: this.COLORS.text,
    },
    price: {
      fontSize: "24px",
      color: this.COLORS.primary,
    },
  };

  constructor() {
    super({ key: "BuyMenuScene" });
  }

  init(data: {
    drugPrices: { [key: string]: number };
    currentLocation: string;
    playerMoney: number;
  }) {
    this.drugPrices = data.drugPrices;
    this.currentLocation = data.currentLocation;
    this.playerMoney = data.playerMoney;
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createDrugList();
    this.createFooter();
  }

  private createBackground() {
    // Fundo principal
    const bg = this.add.rectangle(0, 0, 1280, 720, 0x000000);
    bg.setOrigin(0, 0);

    // Grade de fundo (efeito cyberpunk)
    for (let i = 0; i < 1280; i += 40) {
      this.add.line(0, 0, i, 0, i, 720, 0x111111);
    }
    for (let i = 0; i < 720; i += 40) {
      this.add.line(0, 0, 0, i, 1280, i, 0x111111);
    }
  }

  private createHeader() {
    // Painel superior
    const headerPanel = this.add.rectangle(0, 0, 1280, 120, 0x111111);
    headerPanel.setOrigin(0, 0);

    // Título
    this.add.text(640, 40, "MERCADO NEGRO", this.STYLES.title).setOrigin(0.5);

    // Info da cidade
    this.add.text(50, 85, `LOCALIZAÇÃO: ${this.currentLocation}`, {
      ...this.STYLES.subtitle,
      color: this.COLORS.textDark,
    });

    // Info do dinheiro
    this.add.text(750, 85, `CASH: $${this.playerMoney}`, {
      ...this.STYLES.info,
      align: "right",
    });
  }

  private createDrugList() {
    const startY = 150;
    const spacing = 100;
    let y = startY;

    // Painel de itens
    const itemsPanel = this.add.rectangle(
      50,
      startY - 20,
      1180,
      Object.keys(this.drugPrices).length * spacing + 40,
      0x111111,
      0.5
    );
    itemsPanel.setOrigin(0, 0);

    Object.entries(this.drugPrices).forEach(([drug, price], index) => {
      // Container do item
      const itemBg = this.add.rectangle(75, y - 10, 1130, 80, 0x222222);
      itemBg.setOrigin(0, 0);

      // Nome do item
      this.add.text(100, y + 20, drug, {
        ...this.STYLES.itemText,
        fontSize: "32px",
      });

      // Preço
      this.add.text(400, y + 20, `$${price}`, {
        ...this.STYLES.price,
        fontSize: "32px",
      });

      // Controles de quantidade
      const quantityContainer = this.createQuantityControls(drug, 750, y + 20);
      this.quantityInputs[drug] = quantityContainer.quantityText;

      y += spacing;
    });
  }

  private createQuantityControls(drug: string, x: number, y: number) {
    const containerWidth = 300;
    const buttonWidth = 60;

    // Container de quantidade
    const container = this.add.rectangle(
      x,
      y - 5,
      containerWidth,
      50,
      0x333333
    );
    container.setOrigin(0, 0);

    // Botão menos
    const minusButton = this.add
      .text(x + 10, y, "-", {
        ...this.STYLES.button,
        fontSize: "32px",
        backgroundColor: this.COLORS.secondary,
      })
      .setInteractive()
      .on("pointerdown", () => this.updateQuantity(drug, -1));

    // Quantidade
    const quantityText = this.add
      .text(x + containerWidth / 2, y, "0", {
        ...this.STYLES.itemText,
        fontSize: "32px",
        color: this.COLORS.primary,
      })
      .setOrigin(0.5, 0);

    // Botão mais
    const plusButton = this.add
      .text(x + containerWidth - buttonWidth - 10, y, "+", {
        ...this.STYLES.button,
        fontSize: "32px",
        backgroundColor: this.COLORS.secondary,
      })
      .setInteractive()
      .on("pointerdown", () => this.updateQuantity(drug, 1));

    return { quantityText, minusButton, plusButton };
  }

  private createFooter() {
    const footerY = 620;

    // Painel do footer
    const footerPanel = this.add.rectangle(
      0,
      footerY - 20,
      1280,
      120,
      0x111111
    );
    footerPanel.setOrigin(0, 0);

    // Total
    this.totalCostText = this.add.text(50, footerY + 20, "TOTAL: $0", {
      ...this.STYLES.info,
      fontSize: "32px",
      align: "left",
    });

    // Botões
    const buyButton = this.add
      .text(900, footerY + 20, "CONFIRMAR", {
        ...this.STYLES.button,
        fontSize: "32px",
        backgroundColor: this.COLORS.primary,
        color: this.COLORS.background,
        padding: { x: 30, y: 15 },
      })
      .setInteractive()
      .on("pointerdown", () => this.confirmPurchase());

    const backButton = this.add
      .text(650, footerY + 20, "VOLTAR", {
        ...this.STYLES.button,
        fontSize: "32px",
        padding: { x: 30, y: 15 },
      })
      .setInteractive()
      .on("pointerdown", () => this.scene.start("GameScene"));
  }

  private updateQuantity(drug: string, change: number) {
    const currentQuantity = parseInt(this.quantityInputs[drug].text) || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    this.quantityInputs[drug].setText(newQuantity.toString());
    this.updateTotalCost();

    // Efeito visual de atualização
    this.quantityInputs[drug].setScale(1.2);
    this.tweens.add({
      targets: this.quantityInputs[drug],
      scale: 1,
      duration: 100,
    });
  }

  private updateTotalCost() {
    let total = 0;
    Object.entries(this.quantityInputs).forEach(([drug, text]) => {
      const quantity = parseInt(text.text) || 0;
      total += quantity * this.drugPrices[drug];
    });
    this.totalCostText.setText(`TOTAL: $${total}`);
  }

  private confirmPurchase() {
    let total = 0;
    const purchase: { [key: string]: number } = {};

    Object.entries(this.quantityInputs).forEach(([drug, text]) => {
      const quantity = parseInt(text.text) || 0;
      if (quantity > 0) {
        total += quantity * this.drugPrices[drug];
        purchase[drug] = quantity;
      }
    });

    if (total > this.playerMoney) {
      this.showMessage("DINHEIRO INSUFICIENTE!", this.COLORS.accent);
      return;
    }

    if (total === 0) {
      this.showMessage("SELECIONE ALGUM ITEM!", this.COLORS.accent);
      return;
    }

    // Efeito visual de sucesso
    this.cameras.main.flash(500, 0, 255, 0);

    // Emitir evento de compra para a cena principal
    const gameScene = this.scene.get("GameScene");
    gameScene.events.emit("purchase", { purchase, total });

    // Mostrar mensagem de sucesso
    this.showMessage("COMPRA REALIZADA!", this.COLORS.primary);

    // Aguardar um pouco antes de voltar para dar tempo de ver a mensagem
    this.time.delayedCall(1000, () => {
      this.scene.start("GameScene");
    });
  }

  private showMessage(text: string, color: string = this.COLORS.text) {
    const message = this.add
      .text(400, 300, text, {
        fontSize: "32px",
        color: color,
        backgroundColor: this.COLORS.secondary,
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    // Efeito de fade
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => message.destroy(),
    });
  }
}

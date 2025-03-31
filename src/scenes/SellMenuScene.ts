import { Scene } from "phaser";

export class SellMenuScene extends Scene {
  private inventory: { [key: string]: number } = {};
  private currentLocation: string = "";
  private playerMoney: number = 0;
  private quantityInputs: { [key: string]: Phaser.GameObjects.Text } = {};
  private totalValueText!: Phaser.GameObjects.Text;
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
    super({ key: "SellMenuScene" });
  }

  init(data: {
    inventory: { [key: string]: number };
    currentLocation: string;
    playerMoney: number;
  }) {
    this.inventory = data.inventory;
    this.currentLocation = data.currentLocation;
    this.playerMoney = data.playerMoney;
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createInventoryList();
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
      .text(640, 40, "VENDER MERCADORIA", this.STYLES.title)
      .setOrigin(0.5);

    this.add.text(50, 85, `LOCALIZAÇÃO: ${this.currentLocation}`, {
      ...this.STYLES.subtitle,
      color: this.COLORS.textDark,
    });

    this.add.text(750, 85, `CASH: $${this.playerMoney}`, {
      ...this.STYLES.info,
      align: "right",
    });
  }

  private createInventoryList() {
    const startY = 150;
    const spacing = 100;
    let y = startY;

    const itemsPanel = this.add.rectangle(
      50,
      startY - 20,
      1180,
      Object.keys(this.inventory).length * spacing + 40,
      0x111111,
      0.5
    );
    itemsPanel.setOrigin(0, 0);

    if (Object.keys(this.inventory).length === 0) {
      this.add
        .text(640, 360, "INVENTÁRIO VAZIO", {
          ...this.STYLES.title,
          color: this.COLORS.textDark,
        })
        .setOrigin(0.5);
      return;
    }

    Object.entries(this.inventory).forEach(([drug, quantity], index) => {
      const itemBg = this.add.rectangle(75, y - 10, 1130, 80, 0x222222);
      itemBg.setOrigin(0, 0);

      this.add.text(100, y + 20, drug, {
        ...this.STYLES.itemText,
        fontSize: "32px",
      });

      this.add.text(400, y + 20, `QUANTIDADE: ${quantity}`, {
        ...this.STYLES.price,
        fontSize: "32px",
      });

      const quantityContainer = this.createQuantityControls(
        drug,
        750,
        y + 20,
        quantity
      );
      this.quantityInputs[drug] = quantityContainer.quantityText;

      y += spacing;
    });
  }

  private createQuantityControls(
    drug: string,
    x: number,
    y: number,
    maxQuantity: number
  ) {
    const containerWidth = 300;
    const buttonWidth = 60;

    const container = this.add.rectangle(
      x,
      y - 5,
      containerWidth,
      50,
      0x333333
    );
    container.setOrigin(0, 0);

    const minusButton = this.add
      .text(x + 10, y, "-", {
        ...this.STYLES.button,
        fontSize: "32px",
        backgroundColor: this.COLORS.secondary,
      })
      .setInteractive()
      .on("pointerdown", () => this.updateQuantity(drug, -1, maxQuantity));

    const quantityText = this.add
      .text(x + containerWidth / 2, y, "0", {
        ...this.STYLES.itemText,
        fontSize: "32px",
        color: this.COLORS.primary,
      })
      .setOrigin(0.5, 0);

    const plusButton = this.add
      .text(x + containerWidth - buttonWidth - 10, y, "+", {
        ...this.STYLES.button,
        fontSize: "32px",
        backgroundColor: this.COLORS.secondary,
      })
      .setInteractive()
      .on("pointerdown", () => this.updateQuantity(drug, 1, maxQuantity));

    return { quantityText, minusButton, plusButton };
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

    this.totalValueText = this.add.text(50, footerY + 20, "TOTAL: $0", {
      ...this.STYLES.info,
      fontSize: "32px",
      align: "left",
    });

    const sellButton = this.add
      .text(900, footerY + 20, "VENDER", {
        ...this.STYLES.button,
        fontSize: "32px",
        backgroundColor: this.COLORS.primary,
        color: this.COLORS.background,
        padding: { x: 30, y: 15 },
      })
      .setInteractive()
      .on("pointerdown", () => this.confirmSale());

    const backButton = this.add
      .text(650, footerY + 20, "VOLTAR", {
        ...this.STYLES.button,
        fontSize: "32px",
        padding: { x: 30, y: 15 },
      })
      .setInteractive()
      .on("pointerdown", () => this.scene.start("GameScene"));
  }

  private updateQuantity(drug: string, change: number, maxQuantity: number) {
    const currentQuantity = parseInt(this.quantityInputs[drug].text) || 0;
    const newQuantity = Math.max(
      0,
      Math.min(maxQuantity, currentQuantity + change)
    );
    this.quantityInputs[drug].setText(newQuantity.toString());
    this.updateTotalValue();

    this.quantityInputs[drug].setScale(1.2);
    this.tweens.add({
      targets: this.quantityInputs[drug],
      scale: 1,
      duration: 100,
    });
  }

  private updateTotalValue() {
    let total = 0;
    Object.entries(this.quantityInputs).forEach(([drug, text]) => {
      const quantity = parseInt(text.text) || 0;
      const price = this.getPriceForDrug(drug);
      total += quantity * price;
    });
    this.totalValueText.setText(`TOTAL: $${total}`);
  }

  private getPriceForDrug(drug: string): number {
    // Aqui você pode implementar a lógica de preços de venda
    // Por enquanto, retornando um valor fixo para teste
    const basePrices: { [key: string]: number } = {
      Trembolona: 80,
      Durateston: 400,
      Stanozolol: 800,
      Deca: 150,
    };
    return basePrices[drug] || 0;
  }

  private confirmSale() {
    let total = 0;
    const sale: { [key: string]: number } = {};

    Object.entries(this.quantityInputs).forEach(([drug, text]) => {
      const quantity = parseInt(text.text) || 0;
      if (quantity > 0) {
        const price = this.getPriceForDrug(drug);
        total += quantity * price;
        sale[drug] = quantity;
      }
    });

    if (Object.keys(sale).length === 0) {
      this.showMessage("SELECIONE ALGUM ITEM!", this.COLORS.accent);
      return;
    }

    // Efeito visual de sucesso
    this.cameras.main.flash(500, 0, 255, 0);

    // Emitir evento de venda para a cena principal
    const gameScene = this.scene.get("GameScene");
    gameScene.events.emit("sale", { sale, total });

    // Mostrar mensagem de sucesso
    this.showMessage("VENDA REALIZADA!", this.COLORS.primary);

    // Aguardar um pouco antes de voltar
    this.time.delayedCall(1000, () => {
      this.scene.start("GameScene");
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

import { Scene } from "phaser";
import { COLORS, STYLES } from "./style";
import { BuyMenuLogic, BuyMenuData } from "./logic";

export class BuyMenuScene extends Scene {
  private logic: BuyMenuLogic;
  private quantityInputs: { [key: string]: Phaser.GameObjects.Text } = {};
  private totalCostText!: Phaser.GameObjects.Text;
  private onPurchaseCallback: (data: {
    purchase: { [key: string]: number };
    total: number;
  }) => void;

  constructor() {
    super({ key: "BuyMenuScene" });
    this.logic = new BuyMenuLogic();
    this.onPurchaseCallback = () => {};
  }

  init(
    data: BuyMenuData & {
      onPurchase: (data: {
        purchase: { [key: string]: number };
        total: number;
      }) => void;
    }
  ) {
    this.logic.init(data);
    this.onPurchaseCallback = data.onPurchase;
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createDrugList();
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

    this.add.text(640, 40, "MERCADO NEGRO", STYLES.title).setOrigin(0.5);

    this.add.text(50, 85, `LOCALIZAÇÃO: ${this.logic.getCurrentLocation()}`, {
      ...STYLES.subtitle,
      color: COLORS.textDark,
    });

    this.add.text(750, 85, `CASH: $${this.logic.getPlayerMoney()}`, {
      ...STYLES.info,
      align: "right",
    });
  }

  private createDrugList() {
    const startY = 150;
    const spacing = 100;
    let y = startY;

    const itemsPanel = this.add.rectangle(
      50,
      startY - 20,
      1180,
      Object.keys(this.logic.getDrugPrices()).length * spacing + 40,
      0x111111,
      0.5
    );
    itemsPanel.setOrigin(0, 0);

    Object.entries(this.logic.getDrugPrices()).forEach(
      ([drug, price], index) => {
        const itemBg = this.add.rectangle(75, y - 10, 1130, 80, 0x222222);
        itemBg.setOrigin(0, 0);

        this.add.text(100, y + 20, drug, {
          ...STYLES.itemText,
          fontSize: "32px",
        });

        this.add.text(400, y + 20, `$${price}`, {
          ...STYLES.price,
          fontSize: "32px",
        });

        const quantityContainer = this.createQuantityControls(
          drug,
          750,
          y + 20
        );
        this.quantityInputs[drug] = quantityContainer.quantityText;

        y += spacing;
      }
    );
  }

  private createQuantityControls(drug: string, x: number, y: number) {
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
        ...STYLES.button,
        fontSize: "32px",
        backgroundColor: COLORS.secondary,
      })
      .setInteractive()
      .on("pointerdown", () => this.updateQuantity(drug, -1));

    const quantityText = this.add
      .text(x + containerWidth / 2, y, "0", {
        ...STYLES.itemText,
        fontSize: "32px",
        color: COLORS.primary,
      })
      .setOrigin(0.5, 0);

    const plusButton = this.add
      .text(x + containerWidth - buttonWidth - 10, y, "+", {
        ...STYLES.button,
        fontSize: "32px",
        backgroundColor: COLORS.secondary,
      })
      .setInteractive()
      .on("pointerdown", () => this.updateQuantity(drug, 1));

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

    this.totalCostText = this.add.text(50, footerY + 20, "TOTAL: $0", {
      ...STYLES.info,
      fontSize: "32px",
      align: "left",
    });

    const buyButton = this.add
      .text(900, footerY + 20, "CONFIRMAR", {
        ...STYLES.button,
        fontSize: "32px",
        backgroundColor: COLORS.primary,
        color: COLORS.background,
        padding: { x: 30, y: 15 },
      })
      .setInteractive()
      .on("pointerdown", () => this.confirmPurchase());

    const backButton = this.add
      .text(650, footerY + 20, "VOLTAR", {
        ...STYLES.button,
        fontSize: "32px",
        padding: { x: 30, y: 15 },
      })
      .setInteractive()
      .on("pointerdown", () => this.scene.start("GameScene"));
  }

  private updateQuantity(drug: string, change: number) {
    const newQuantity = this.logic.updateQuantity(drug, change);
    this.quantityInputs[drug].setText(newQuantity.toString());
    this.updateTotalCost();

    this.quantityInputs[drug].setScale(1.2);
    this.tweens.add({
      targets: this.quantityInputs[drug],
      scale: 1,
      duration: 100,
    });
  }

  private updateTotalCost() {
    const total = this.logic.calculateTotalCost();
    this.totalCostText.setText(`TOTAL: $${total}`);
  }

  private confirmPurchase() {
    const validation = this.logic.validatePurchase();

    if (!validation.isValid) {
      this.showMessage(validation.message, COLORS.accent);
      return;
    }

    this.cameras.main.flash(500, 0, 255, 0);

    const purchaseData = this.logic.getPurchaseData();
    console.log("Dados da compra antes do callback:", purchaseData);
    this.onPurchaseCallback(purchaseData);

    this.showMessage(validation.message, COLORS.primary);
  }

  private showMessage(text: string, color: string = COLORS.text) {
    const message = this.add
      .text(400, 300, text, {
        fontSize: "32px",
        color: color,
        backgroundColor: COLORS.secondary,
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

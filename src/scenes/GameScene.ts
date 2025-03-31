import { Scene } from "phaser";
import { BuyMenuScene } from "./BuyMenuScene";
import { PriceManager, MarketEvent } from "../services/PriceManager";
import { DebtManager } from "../services/DebtManager";
import { TimeManager } from "../services/TimeManager";

export class GameScene extends Scene {
  private playerMoney: number = 1000;
  private playerDebt: number = 5000;
  private currentLocation: string = "Nova York";
  private inventory: { [key: string]: number } = {};
  private priceManager: PriceManager;
  private timeManager: TimeManager;
  private readonly PRICE_UPDATE_INTERVAL = 5000; // Atualizar preços a cada 5 segundos
  private drugPrices: { [key: string]: { [key: string]: number } } = {
    "Nova York": {
      Trembolona: 100,
      Durateston: 500,
      Stanozolol: 1000,
      Deca: 200,
    },
    "Los Angeles": {
      Trembolona: 150,
      Durateston: 450,
      Stanozolol: 950,
      Deca: 250,
    },
    Chicago: {
      Trembolona: 120,
      Durateston: 480,
      Stanozolol: 980,
      Deca: 220,
    },
  };

  private readonly COLORS = {
    background: "#000000",
    primary: "#00ff00",
    secondary: "#1a1a1a",
    accent: "#ff0000",
    text: "#ffffff",
    textDark: "#888888",
    panel: "#111111",
    itemBg: "#222222",
  };

  private readonly STYLES = {
    title: {
      fontSize: "32px",
      color: this.COLORS.primary,
      fontStyle: "bold",
    },
    info: {
      fontSize: "24px",
      color: this.COLORS.text,
    },
    money: {
      fontSize: "28px",
      color: this.COLORS.primary,
    },
    debt: {
      fontSize: "28px",
      color: this.COLORS.accent,
    },
    button: {
      fontSize: "20px",
      color: this.COLORS.text,
      backgroundColor: this.COLORS.secondary,
      padding: { x: 15, y: 10 },
    },
  };

  private debtManager: DebtManager;
  private startTime: number = Date.now();
  private maxMoney: number = 1000;
  private totalDeals: number = 0;
  private timeText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
    this.priceManager = new PriceManager();
    this.debtManager = new DebtManager();
    this.timeManager = new TimeManager();
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createInventory();
    this.createControls();
    this.createPriceDisplay();
    this.createTimeDisplay();

    // Configurar timer para atualização de preços
    this.time.addEvent({
      delay: this.PRICE_UPDATE_INTERVAL,
      callback: this.updatePrices,
      callbackScope: this,
      loop: true,
    });

    // Configurar timer para atualização de dívidas
    this.time.addEvent({
      delay: 5000, // Verificar dívidas a cada 5 segundos
      callback: this.updateDebts,
      callbackScope: this,
      loop: true,
    });

    // Configurar timer para verificação de game over
    this.time.addEvent({
      delay: 1000, // Verificar a cada segundo
      callback: this.checkGameOver,
      callbackScope: this,
      loop: true,
    });

    // Atualizar maxMoney se necessário
    if (this.playerMoney > this.maxMoney) {
      this.maxMoney = this.playerMoney;
    }
  }

  private createBackground() {
    // Fundo principal
    const bg = this.add.rectangle(0, 0, 1280, 720, 0x000000);
    bg.setOrigin(0, 0);
  }

  private createHeader() {
    // Painel superior com gradiente
    const headerPanel = this.add.rectangle(0, 0, 1280, 120, 0x111111);
    headerPanel.setOrigin(0, 0);

    // Adicionar borda inferior
    const borderLine = this.add.rectangle(0, 120, 1280, 2, 0x00ff00);
    borderLine.setOrigin(0, 0);
    borderLine.setAlpha(0.3);

    // Status do jogador com ícones
    this.add.text(50, 20, "STATUS", this.STYLES.title);

    // Container para o dinheiro
    const moneyContainer = this.add.rectangle(50, 70, 300, 40, 0x222222);
    moneyContainer.setOrigin(0, 0);
    this.add.text(65, 75, "💰", { fontSize: "24px" });
    this.add.text(100, 75, `$${this.playerMoney}`, this.STYLES.money);

    // Container para a dívida
    const debtContainer = this.add.rectangle(400, 70, 300, 40, 0x222222);
    debtContainer.setOrigin(0, 0);
    this.add.text(415, 75, "💸", { fontSize: "24px" });
    this.add.text(450, 75, `$${this.playerDebt}`, this.STYLES.debt);

    // Container para a localização
    const locationContainer = this.add.rectangle(750, 70, 300, 40, 0x222222);
    locationContainer.setOrigin(0, 0);
    this.add.text(765, 75, "📍", { fontSize: "24px" });
    this.add.text(800, 75, this.currentLocation, {
      ...this.STYLES.info,
      color: this.COLORS.textDark,
    });
  }

  private createInventory() {
    // Painel de inventário com borda
    const inventoryPanel = this.add.rectangle(50, 480, 300, 220, 0x222222);
    inventoryPanel.setOrigin(0, 0);

    // Borda do painel
    const border = this.add.rectangle(50, 480, 300, 220, 0x00ff00);
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, 0x00ff00);
    border.setFillStyle();

    this.add.text(70, 500, "🎒 INVENTÁRIO", this.STYLES.title);

    let y = 550;
    const spacing = 40;

    if (Object.keys(this.inventory).length === 0) {
      this.add.text(70, y, "Vazio", {
        ...this.STYLES.info,
        color: this.COLORS.textDark,
      });
    } else {
      Object.entries(this.inventory).forEach(([drug, quantity]) => {
        const itemBg = this.add.rectangle(70, y - 5, 260, 30, 0x333333);
        itemBg.setOrigin(0, 0);
        itemBg.setInteractive();

        itemBg.on("pointerover", () => {
          itemBg.setFillStyle(0x444444);
        });

        itemBg.on("pointerout", () => {
          itemBg.setFillStyle(0x333333);
        });

        this.add.text(80, y, drug, this.STYLES.info);
        this.add.text(250, y, quantity.toString(), {
          ...this.STYLES.info,
          color: this.COLORS.primary,
        });
        y += spacing;
      });
    }
  }

  private createControls() {
    const mainActionsPanel = this.add.rectangle(1000, 150, 250, 400, 0x222222);
    mainActionsPanel.setOrigin(0, 0);

    // Adicionar borda ao painel
    const border = this.add.rectangle(1000, 150, 250, 400, 0x00ff00);
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, 0x00ff00);
    border.setFillStyle();

    const buttonStyle = {
      fontSize: "24px",
      color: this.COLORS.text,
      backgroundColor: this.COLORS.secondary,
      padding: { x: 20, y: 10 },
    };

    const buttonSpacing = 80;
    let currentY = 180;

    // Botões com ícones
    const buttons = [
      { text: "💊 COMPRAR", action: () => this.showBuyMenu() },
      { text: "💰 VENDER", action: () => this.showSellMenu() },
      { text: "✈️ VIAJAR", action: () => this.showTravelMenu() },
    ];

    buttons.forEach((button) => {
      const buttonBg = this.add.rectangle(1025, currentY, 200, 50, 0x333333);
      buttonBg.setOrigin(0, 0);
      buttonBg.setInteractive();

      buttonBg.on("pointerover", () => {
        buttonBg.setFillStyle(0x444444);
      });

      buttonBg.on("pointerout", () => {
        buttonBg.setFillStyle(0x333333);
      });

      const buttonText = this.add
        .text(1045, currentY + 10, button.text, buttonStyle)
        .setInteractive()
        .on("pointerdown", button.action);

      currentY += buttonSpacing;
    });

    // Criar botão de menu no canto superior direito
    this.createMenuButton();
  }

  private createMenuButton() {
    // Botão de menu no canto superior direito
    const menuButton = this.add
      .text(1200, 20, "☰", {
        fontSize: "36px",
        color: this.COLORS.primary,
      })
      .setInteractive()
      .on("pointerdown", () => this.toggleMenu());
  }

  private menuVisible: boolean = false;
  private menuPanel?: Phaser.GameObjects.Rectangle;
  private menuButtons: Phaser.GameObjects.Text[] = [];

  private toggleMenu() {
    if (this.menuVisible) {
      // Esconder menu
      this.menuPanel?.destroy();
      this.menuButtons.forEach((button) => button.destroy());
      this.menuButtons = [];
      this.menuVisible = false;
    } else {
      // Mostrar menu
      this.menuPanel = this.add.rectangle(1050, 20, 200, 120, 0x111111);
      this.menuPanel.setOrigin(0, 0);

      const buttonStyle = {
        fontSize: "24px",
        color: this.COLORS.text,
        backgroundColor: this.COLORS.secondary,
        padding: { x: 15, y: 10 },
      };

      // Botão Salvar
      const saveButton = this.add
        .text(1070, 40, "SALVAR", buttonStyle)
        .setInteractive()
        .on("pointerdown", () => {
          this.scene.start("SaveMenuScene", { mode: "save" });
          this.toggleMenu();
        });

      // Botão Carregar
      const loadButton = this.add
        .text(1070, 90, "CARREGAR", buttonStyle)
        .setInteractive()
        .on("pointerdown", () => {
          this.scene.start("SaveMenuScene", { mode: "load" });
          this.toggleMenu();
        });

      this.menuButtons.push(saveButton, loadButton);
      this.menuVisible = true;
    }
  }

  private createTimeDisplay() {
    const timePanel = this.add.rectangle(50, 140, 300, 50, 0x222222);
    timePanel.setOrigin(0, 0);

    // Adicionar ícone de relógio
    this.add.text(65, 150, "🕒", { fontSize: "24px" });
    this.timeText = this.add.text(100, 150, this.timeManager.getTimeString(), {
      ...this.STYLES.info,
      fontSize: "28px",
    });
  }

  private createPriceDisplay() {
    const prices = this.priceManager.getPrices(this.currentLocation);
    const startY = 240;
    const spacing = 45;

    // Painel de preços com borda
    const pricePanel = this.add.rectangle(50, 210, 300, 250, 0x222222);
    pricePanel.setOrigin(0, 0);

    // Borda do painel
    const borderWidth = 2;
    const border = this.add.rectangle(50, 210, 300, 250, 0x00ff00);
    border.setOrigin(0, 0);
    border.setStrokeStyle(borderWidth, 0x00ff00);
    border.setFillStyle();

    this.add.text(65, startY, "💊 PREÇOS", this.STYLES.title);

    Object.entries(prices).forEach(([drug, price], index) => {
      const y = startY + 50 + spacing * index;

      // Container do item com hover effect
      const itemBg = this.add.rectangle(70, y - 5, 260, 30, 0x333333);
      itemBg.setOrigin(0, 0);
      itemBg.setInteractive();

      itemBg.on("pointerover", () => {
        itemBg.setFillStyle(0x444444);
      });

      itemBg.on("pointerout", () => {
        itemBg.setFillStyle(0x333333);
      });

      this.add.text(80, y, drug, this.STYLES.info);
      this.add.text(250, y, `$${price}`, {
        ...this.STYLES.info,
        color: this.COLORS.primary,
      });
    });
  }

  private updateTimeDisplay() {
    this.timeText.setText(this.timeManager.getTimeString());
  }

  private updatePrices = () => {
    this.timeManager.update();
    this.priceManager.updatePrices(this.timeManager.getCurrentDay());
    this.updateTimeDisplay();

    // Chance de eventos aleatórios (10% de chance a cada atualização)
    if (Math.random() < 0.1) {
      const events: MarketEvent[] = [
        "POLICE_RAID",
        "HIGH_DEMAND",
        "SUPPLY_SHORTAGE",
        "NEW_SUPPLIER",
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      this.priceManager.triggerEvent(this.currentLocation, randomEvent);
      this.showEventMessage(randomEvent);
    }

    this.updateUI();
  };

  private showEventMessage(eventType: MarketEvent) {
    const messages: { [K in MarketEvent]: string } = {
      POLICE_RAID: "BATIDA DA ANVISA! Preços caíram!",
      HIGH_DEMAND: "ALTA DEMANDA! Preços subiram!",
      SUPPLY_SHORTAGE: "ESCASSEZ DE SUPRIMENTOS! Preços dispararam!",
      NEW_SUPPLIER: "NOVO FORNECEDOR! Preços em promoção!",
    };

    const message = this.add
      .text(640, 360, messages[eventType], {
        fontSize: "32px",
        color: this.COLORS.accent,
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

  private showTravelMessage(text: string) {
    const message = this.add
      .text(640, 360, text, {
        fontSize: "32px",
        color: this.COLORS.primary,
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

  private showBuyMenu() {
    this.scene.launch("BuyMenuScene", {
      drugPrices: this.priceManager.getPrices(this.currentLocation),
      currentLocation: this.currentLocation,
      playerMoney: this.playerMoney,
    });

    this.events.removeListener("purchase");

    this.events.on(
      "purchase",
      (data: { purchase: { [key: string]: number }; total: number }) => {
        console.log("Compra realizada:", data);

        Object.entries(data.purchase).forEach(([drug, quantity]) => {
          this.inventory[drug] = (this.inventory[drug] || 0) + quantity;
          this.priceManager.recordTransaction(
            this.currentLocation,
            drug,
            quantity
          );
        });

        this.playerMoney -= data.total;
        this.totalDeals++; // Incrementar contador de negócios

        if (this.playerMoney > this.maxMoney) {
          this.maxMoney = this.playerMoney;
        }

        this.updateUI();
      }
    );
  }

  private showSellMenu() {
    this.scene.launch("SellMenuScene", {
      inventory: this.inventory,
      currentLocation: this.currentLocation,
      playerMoney: this.playerMoney,
      drugPrices: this.priceManager.getPrices(this.currentLocation),
    });

    this.events.removeListener("sale");

    this.events.on(
      "sale",
      (data: { sale: { [key: string]: number }; total: number }) => {
        console.log("Venda realizada:", data);

        Object.entries(data.sale).forEach(([drug, quantity]) => {
          this.inventory[drug] -= quantity;
          this.priceManager.recordTransaction(
            this.currentLocation,
            drug,
            quantity
          );
        });

        this.playerMoney += data.total;
        this.totalDeals++; // Incrementar contador de negócios

        if (this.playerMoney > this.maxMoney) {
          this.maxMoney = this.playerMoney;
        }

        this.updateUI();
      }
    );
  }

  private showTravelMenu() {
    this.scene.launch("TravelMenuScene", {
      currentLocation: this.currentLocation,
      availableLocations: Object.keys(this.drugPrices).filter(
        (loc) => loc !== this.currentLocation
      ),
    });

    this.events.removeListener("travel");

    this.events.on("travel", (location: string) => {
      this.currentLocation = location;
      this.updateUI();
    });
  }

  private showDebtMenu() {
    this.scene.launch("DebtMenuScene", {
      playerMoney: this.playerMoney,
    });

    // Remover qualquer listener anterior para evitar duplicatas
    this.events.removeListener("debtPayment");
    this.events.removeListener("loan");

    // Escutar evento de pagamento de dívida
    this.events.on("debtPayment", (data: { amount: number }) => {
      console.log("Pagamento de dívida:", data);

      // Deduzir o valor pago
      this.playerMoney -= data.amount;

      // Atualizar UI
      this.updateUI();
    });

    // Escutar evento de novo empréstimo
    this.events.on("loan", (data: { amount: number }) => {
      console.log("Novo empréstimo:", data);

      // Adicionar o valor do empréstimo
      this.playerMoney += data.amount;

      // Atualizar UI
      this.updateUI();
    });
  }

  private updateDebts = () => {
    this.debtManager.updateDebts();
    const debts = this.debtManager.getDebts();
    const activeDebts = debts.filter((debt) => !debt.isPaid);

    activeDebts.forEach((debt) => {
      const consequences = this.debtManager.getConsequences(debt);
      if (consequences.length > 0) {
        const randomConsequence =
          consequences[Math.floor(Math.random() * consequences.length)];
        this.showDebtMessage(
          `${debt.lender}: ${randomConsequence}`,
          this.COLORS.accent
        );
      }
    });
  };

  private showDebtMessage(text: string, color: string = this.COLORS.text) {
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

  private updateUI() {
    this.children.removeAll();
    this.create();
  }

  private checkGameOver = () => {
    let gameOver = false;
    let reason = "";

    // Verificar se o jogador está sem dinheiro
    if (this.playerMoney <= 0) {
      gameOver = true;
      reason = "VOCÊ ESTÁ FALIDO!";
    }

    // Verificar se o jogador está sem estoque e sem dinheiro suficiente para comprar
    if (Object.keys(this.inventory).length === 0) {
      const prices = this.priceManager.getPrices(this.currentLocation);
      const cheapestPrice = Math.min(...Object.values(prices));

      if (this.playerMoney < cheapestPrice) {
        gameOver = true;
        reason = "SEM DINHEIRO PARA COMPRAR E SEM ESTOQUE!";
      }
    }

    if (gameOver) {
      const stats = {
        daysSurvived: Math.floor(
          (Date.now() - this.startTime) / (24 * 60 * 60 * 1000)
        ),
        maxMoney: this.maxMoney,
        totalDeals: this.totalDeals,
      };

      this.scene.start("GameOverScene", { reason, stats });
    }
  };
}

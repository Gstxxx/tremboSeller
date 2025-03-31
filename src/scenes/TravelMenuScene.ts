import { Scene } from "phaser";

export class TravelMenuScene extends Scene {
  private currentLocation: string = "";
  private playerMoney: number = 0;
  private readonly CITIES = ["Nova York", "Los Angeles", "Chicago"];
  private readonly TRAVEL_COSTS: { [key: string]: { [key: string]: number } } =
    {
      "Nova York": {
        "Los Angeles": 1000,
        Chicago: 500,
      },
      "Los Angeles": {
        "Nova York": 1000,
        Chicago: 800,
      },
      Chicago: {
        "Nova York": 500,
        "Los Angeles": 800,
      },
    };
  private readonly TRAVEL_TIMES: { [key: string]: { [key: string]: number } } =
    {
      "Nova York": {
        "Los Angeles": 6,
        Chicago: 2,
      },
      "Los Angeles": {
        "Nova York": 6,
        Chicago: 4,
      },
      Chicago: {
        "Nova York": 2,
        "Los Angeles": 4,
      },
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
    cityText: {
      fontSize: "32px",
      color: this.COLORS.text,
    },
  };

  constructor() {
    super({ key: "TravelMenuScene" });
  }

  init(data: { currentLocation: string; playerMoney: number }) {
    this.currentLocation = data.currentLocation;
    this.playerMoney = data.playerMoney;
  }

  create() {
    this.createBackground();
    this.createHeader();
    this.createCityList();
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

    this.add.text(640, 40, "VIAJAR", this.STYLES.title).setOrigin(0.5);

    this.add.text(50, 85, `LOCALIZAÇÃO ATUAL: ${this.currentLocation}`, {
      ...this.STYLES.subtitle,
      color: this.COLORS.textDark,
    });

    this.add.text(750, 85, `CASH: $${this.playerMoney}`, {
      ...this.STYLES.info,
      align: "right",
    });
  }

  private createCityList() {
    const startY = 150;
    const spacing = 120;
    let y = startY;

    const availableCities = this.CITIES.filter(
      (city) => city !== this.currentLocation
    );

    const itemsPanel = this.add.rectangle(
      50,
      startY - 20,
      1180,
      availableCities.length * spacing + 40,
      0x111111,
      0.5
    );
    itemsPanel.setOrigin(0, 0);

    availableCities.forEach((city) => {
      const itemBg = this.add.rectangle(75, y - 10, 1130, 100, 0x222222);
      itemBg.setOrigin(0, 0);

      // Nome da cidade
      this.add.text(100, y + 20, city, {
        ...this.STYLES.cityText,
        fontSize: "36px",
      });

      // Custo da viagem
      const cost = this.TRAVEL_COSTS[this.currentLocation][city];
      this.add.text(400, y + 20, `CUSTO: $${cost}`, {
        ...this.STYLES.info,
        fontSize: "28px",
      });

      // Tempo de viagem
      const time = this.TRAVEL_TIMES[this.currentLocation][city];
      this.add.text(700, y + 20, `TEMPO: ${time}h`, {
        ...this.STYLES.info,
        fontSize: "28px",
      });

      // Botão de viagem
      const travelButton = this.add
        .text(1000, y + 20, "VIAJAR", {
          ...this.STYLES.button,
          fontSize: "28px",
          backgroundColor: this.COLORS.primary,
          color: this.COLORS.background,
          padding: { x: 30, y: 15 },
        })
        .setInteractive()
        .on("pointerdown", () => this.travel(city, cost));

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

  private travel(destination: string, cost: number) {
    if (cost > this.playerMoney) {
      this.showMessage("DINHEIRO INSUFICIENTE!", this.COLORS.accent);
      return;
    }

    // Efeito visual de transição
    this.cameras.main.fade(1000, 0, 0, 0);

    // Emitir evento de viagem para a cena principal
    const gameScene = this.scene.get("GameScene");
    gameScene.events.emit("travel", { destination, cost });

    // Aguardar a transição antes de voltar
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

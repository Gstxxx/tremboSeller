export interface DrugPrices {
  [key: string]: number;
}

export interface CityPrices {
  [key: string]: DrugPrices;
}

export type MarketEvent =
  | "POLICE_RAID"
  | "HIGH_DEMAND"
  | "SUPPLY_SHORTAGE"
  | "NEW_SUPPLIER";

export class PriceManager {
  private basePrices: CityPrices;
  private currentPrices: CityPrices;
  private readonly FLUCTUATION_RANGE = 0.3; // 30% para cima ou para baixo
  private readonly CITY_MODIFIERS: { [key: string]: number } = {
    "Nova York": 1.0, // Preços base
    "Los Angeles": 1.2, // 20% mais caro
    Chicago: 0.9, // 10% mais barato
  };
  private lastUpdateDay: number = 1;
  private transactionHistory: { [key: string]: { [key: string]: number } } = {};

  public readonly EVENTS: { [K in MarketEvent]: { min: number; max: number } } =
    {
      POLICE_RAID: { min: -0.5, max: -0.3 }, // Reduz preços em 30-50%
      HIGH_DEMAND: { min: 0.3, max: 0.5 }, // Aumenta preços em 30-50%
      SUPPLY_SHORTAGE: { min: 0.4, max: 0.6 }, // Aumenta preços em 40-60%
      NEW_SUPPLIER: { min: -0.4, max: -0.2 }, // Reduz preços em 20-40%
    };

  constructor() {
    // Preços base para Nova York
    this.basePrices = {
      "Nova York": {
        Trembolona: 100,
        Durateston: 500,
        Stanozolol: 1000,
        Deca: 200,
      },
    };

    // Inicializar preços para outras cidades
    this.currentPrices = this.initializePrices();
  }

  private initializePrices(): CityPrices {
    const prices: CityPrices = {};

    // Para cada cidade
    Object.keys(this.CITY_MODIFIERS).forEach((city) => {
      prices[city] = {};
      // Para cada droga
      Object.entries(this.basePrices["Nova York"]).forEach(
        ([drug, basePrice]) => {
          // Aplicar modificador da cidade e flutuação inicial
          const cityModifier = this.CITY_MODIFIERS[city];
          const randomFluctuation = this.getRandomFluctuation();
          prices[city][drug] = Math.round(
            basePrice * cityModifier * (1 + randomFluctuation)
          );
        }
      );
    });

    return prices;
  }

  private getRandomFluctuation(): number {
    return (Math.random() * 2 - 1) * this.FLUCTUATION_RANGE;
  }

  public updatePrices(currentDay: number): void {
    // Só atualiza preços se mudou o dia
    if (currentDay === this.lastUpdateDay) {
      return;
    }

    this.lastUpdateDay = currentDay;

    // Atualizar preços baseado nas transações do dia anterior
    Object.keys(this.currentPrices).forEach((city) => {
      Object.keys(this.currentPrices[city]).forEach((drug) => {
        const basePrice = this.basePrices["Nova York"][drug];
        const cityModifier = this.CITY_MODIFIERS[city];
        const randomFluctuation = this.getRandomFluctuation();
        const transactionModifier = this.calculateTransactionModifier(
          city,
          drug
        );

        // Calcular novo preço com flutuação e modificador de transações
        const newPrice = Math.round(
          basePrice *
            cityModifier *
            (1 + randomFluctuation + transactionModifier)
        );

        // Garantir que o preço não fique muito baixo
        this.currentPrices[city][drug] = Math.max(newPrice, basePrice * 0.5);
      });
    });

    // Limpar histórico de transações do dia anterior
    this.transactionHistory = {};
  }

  public updatePricesForNewCity(city: string): void {
    // Atualizar preços apenas para a cidade específica
    Object.keys(this.currentPrices[city]).forEach((drug) => {
      const basePrice = this.basePrices["Nova York"][drug];
      const cityModifier = this.CITY_MODIFIERS[city];
      const randomFluctuation = this.getRandomFluctuation();

      // Calcular novo preço com flutuação
      this.currentPrices[city][drug] = Math.round(
        basePrice * cityModifier * (1 + randomFluctuation)
      );
    });
  }

  private calculateTransactionModifier(city: string, drug: string): number {
    const transactions = this.transactionHistory[city]?.[drug] || 0;

    // Se não houve transações, não há modificador
    if (transactions === 0) {
      return 0;
    }

    // Se houve muitas transações, o preço tende a subir
    if (transactions > 5) {
      return 0.1; // Aumenta 10% se houver muitas transações
    }

    // Se houve poucas transações, o preço tende a cair
    if (transactions < 2) {
      return -0.1; // Diminui 10% se houver poucas transações
    }

    return 0;
  }

  public recordTransaction(city: string, drug: string, quantity: number): void {
    if (!this.transactionHistory[city]) {
      this.transactionHistory[city] = {};
    }
    if (!this.transactionHistory[city][drug]) {
      this.transactionHistory[city][drug] = 0;
    }
    this.transactionHistory[city][drug] += Math.abs(quantity);
  }

  public triggerEvent(city: string, eventType: keyof typeof this.EVENTS): void {
    const event = this.EVENTS[eventType];
    const modifier = event.min + Math.random() * (event.max - event.min);

    Object.keys(this.currentPrices[city]).forEach((drug) => {
      const currentPrice = this.currentPrices[city][drug];
      this.currentPrices[city][drug] = Math.round(
        currentPrice * (1 + modifier)
      );
    });
  }

  public getPrices(city: string): DrugPrices {
    return this.currentPrices[city];
  }

  public getAllPrices(): CityPrices {
    return this.currentPrices;
  }

  public setPrices(prices: CityPrices): void {
    this.currentPrices = prices;
  }
}

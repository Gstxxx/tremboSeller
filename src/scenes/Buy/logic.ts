export interface BuyMenuData {
  drugPrices: { [key: string]: number };
  currentLocation: string;
  playerMoney: number;
}

export interface PurchaseData {
  purchase: { [key: string]: number };
  total: number;
}

export class BuyMenuLogic {
  private drugPrices: { [key: string]: number } = {};
  private currentLocation: string = "";
  private playerMoney: number = 0;
  private quantityInputs: { [key: string]: number } = {};

  init(data: BuyMenuData) {
    this.drugPrices = data.drugPrices;
    this.currentLocation = data.currentLocation;
    this.playerMoney = data.playerMoney;
  }

  updateQuantity(drug: string, change: number): number {
    const currentQuantity = this.quantityInputs[drug] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    this.quantityInputs[drug] = newQuantity;
    return newQuantity;
  }

  calculateTotalCost(): number {
    let total = 0;
    Object.entries(this.quantityInputs).forEach(([drug, quantity]) => {
      total += quantity * this.drugPrices[drug];
    });
    return total;
  }

  validatePurchase(): { isValid: boolean; message: string } {
    const total = this.calculateTotalCost();

    if (total === 0) {
      return { isValid: false, message: "SELECIONE ALGUM ITEM!" };
    }

    if (total > this.playerMoney) {
      return { isValid: false, message: "DINHEIRO INSUFICIENTE!" };
    }

    return { isValid: true, message: "COMPRA REALIZADA!" };
  }

  getPurchaseData(): PurchaseData {
    const purchase: { [key: string]: number } = {};
    let total = 0;

    Object.entries(this.quantityInputs).forEach(([drug, quantity]) => {
      if (quantity > 0) {
        purchase[drug] = quantity;
        total += quantity * this.drugPrices[drug];
      }
    });

    return { purchase, total };
  }

  getDrugPrices(): { [key: string]: number } {
    return this.drugPrices;
  }

  getCurrentLocation(): string {
    return this.currentLocation;
  }

  getPlayerMoney(): number {
    return this.playerMoney;
  }
}

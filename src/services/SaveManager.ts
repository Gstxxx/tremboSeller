export interface GameState {
  playerMoney: number;
  inventory: { [key: string]: number };
  currentLocation: string;
  debts: {
    id: string;
    amount: number;
    interest: number;
    dueDate: number;
    lender: string;
    isPaid: boolean;
  }[];
  lastSaved: number;
  currentPrices: {
    [key: string]: {
      [key: string]: number;
    };
  };
  gameTime: {
    day: number;
    hour: number;
  };
}

export class SaveManager {
  private readonly SAVE_PREFIX = "druglord2_save_";
  private readonly MAX_SLOTS = 3;
  private currentSlot: number = 1;

  constructor() {
    this.loadLastUsedSlot();
  }

  private loadLastUsedSlot() {
    const lastSlot = localStorage.getItem("druglord2_last_slot");
    if (lastSlot) {
      this.currentSlot = parseInt(lastSlot);
    }
  }

  public saveGame(state: GameState): void {
    try {
      const saveKey = this.SAVE_PREFIX + this.currentSlot;
      const saveData = {
        ...state,
        lastSaved: Date.now(),
      };
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      localStorage.setItem("druglord2_last_slot", this.currentSlot.toString());
      console.log(`Jogo salvo no slot ${this.currentSlot}`);
    } catch (error) {
      console.error("Erro ao salvar o jogo:", error);
      throw new Error("Não foi possível salvar o jogo");
    }
  }

  public loadGame(slot: number): GameState | null {
    try {
      const saveKey = this.SAVE_PREFIX + slot;
      const saveData = localStorage.getItem(saveKey);
      if (!saveData) return null;

      const state = JSON.parse(saveData);
      this.currentSlot = slot;
      localStorage.setItem("druglord2_last_slot", slot.toString());
      return state;
    } catch (error) {
      console.error("Erro ao carregar o jogo:", error);
      return null;
    }
  }

  public getSaveSlots(): { slot: number; lastSaved: number | null }[] {
    const slots = [];
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const saveKey = this.SAVE_PREFIX + i;
      const saveData = localStorage.getItem(saveKey);
      const lastSaved = saveData ? JSON.parse(saveData).lastSaved : null;
      slots.push({ slot: i, lastSaved });
    }
    return slots;
  }

  public getCurrentSlot(): number {
    return this.currentSlot;
  }

  public setCurrentSlot(slot: number): void {
    if (slot < 1 || slot > this.MAX_SLOTS) {
      throw new Error("Slot inválido");
    }
    this.currentSlot = slot;
  }

  public deleteSave(slot: number): void {
    const saveKey = this.SAVE_PREFIX + slot;
    localStorage.removeItem(saveKey);
    if (this.currentSlot === slot) {
      this.currentSlot = 1;
      localStorage.setItem("druglord2_last_slot", "1");
    }
  }

  public formatLastSaved(timestamp: number): string {
    if (!timestamp) return "Slot Vazio";
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export interface Debt {
  id: string;
  amount: number;
  interest: number;
  dueDate: number;
  lender: string;
  isPaid: boolean;
}

export interface Lender {
  name: string;
  baseInterest: number;
  minLoan: number;
  maxLoan: number;
  gracePeriod: number; // Em dias
  aggressiveness: number; // 1-10, afeta as consequências
}

export class DebtManager {
  private debts: Debt[] = [];
  private readonly LENDERS: { [key: string]: Lender } = {
    "Tony Maluco": {
      name: "Tony Maluco",
      baseInterest: 0.15, // 15% ao dia
      minLoan: 1000,
      maxLoan: 10000,
      gracePeriod: 3,
      aggressiveness: 8,
    },
    "Zé Tranquilo": {
      name: "Zé Tranquilo",
      baseInterest: 0.1, // 10% ao dia
      minLoan: 500,
      maxLoan: 5000,
      gracePeriod: 5,
      aggressiveness: 4,
    },
    "Dona Maria": {
      name: "Dona Maria",
      baseInterest: 0.05, // 5% ao dia
      minLoan: 100,
      maxLoan: 2000,
      gracePeriod: 7,
      aggressiveness: 2,
    },
  };

  constructor() {
    // Inicializar com uma dívida padrão
    this.addDebt({
      id: "initial",
      amount: 5000,
      interest: 0.1,
      dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 dias
      lender: "Zé Tranquilo",
      isPaid: false,
    });
  }

  public getLenders(): Lender[] {
    return Object.values(this.LENDERS);
  }

  public getDebts(): Debt[] {
    return this.debts;
  }

  public addDebt(debt: Debt): void {
    this.debts.push(debt);
  }

  public payDebt(debtId: string, amount: number): number {
    const debt = this.debts.find((d) => d.id === debtId);
    if (!debt) return 0;

    const totalDue = this.calculateTotalDue(debt);
    if (amount >= totalDue) {
      debt.isPaid = true;
      return totalDue;
    }

    debt.amount -= amount;
    return amount;
  }

  public calculateTotalDue(debt: Debt): number {
    if (debt.isPaid) return 0;

    const now = Date.now();
    const daysOverdue = Math.max(
      0,
      (now - debt.dueDate) / (24 * 60 * 60 * 1000)
    );
    const interestMultiplier = Math.pow(1 + debt.interest, daysOverdue);
    return Math.floor(debt.amount * interestMultiplier);
  }

  public getLoanTerms(
    lenderName: string,
    amount: number
  ): {
    interest: number;
    dueDate: number;
    lender: string;
  } | null {
    const lender = this.LENDERS[lenderName];
    if (!lender) return null;

    if (amount < lender.minLoan || amount > lender.maxLoan) {
      return null;
    }

    return {
      interest: lender.baseInterest,
      dueDate: Date.now() + lender.gracePeriod * 24 * 60 * 60 * 1000,
      lender: lenderName,
    };
  }

  public getConsequences(debt: Debt): string[] {
    if (debt.isPaid) return [];

    const now = Date.now();
    const daysOverdue = Math.max(
      0,
      (now - debt.dueDate) / (24 * 60 * 60 * 1000)
    );
    const lender = this.LENDERS[debt.lender];
    const consequences: string[] = [];

    if (daysOverdue > 0) {
      if (lender.aggressiveness >= 8) {
        consequences.push("AMEAÇA DE MORTE");
        consequences.push("PERSEGUIÇÃO");
      } else if (lender.aggressiveness >= 5) {
        consequences.push("AMEAÇA DE VIOLÊNCIA");
        consequences.push("INTIMIDAÇÃO");
      } else {
        consequences.push("COBRANÇA INSISTENTE");
        consequences.push("AVISOS");
      }
    }

    return consequences;
  }

  public updateDebts(): void {
    const now = Date.now();
    this.debts.forEach((debt) => {
      if (!debt.isPaid && now > debt.dueDate) {
        // Aplicar penalidades e consequências
        const consequences = this.getConsequences(debt);
        // Aqui você pode emitir eventos baseados nas consequências
      }
    });
  }
}

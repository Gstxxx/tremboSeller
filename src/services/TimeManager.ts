export class TimeManager {
  private currentDay: number = 1;
  private currentHour: number = 0;
  private readonly HOURS_PER_DAY = 24;
  private readonly MILLISECONDS_PER_HOUR = 1000 * 60 * 60; // 1 hora = 1 segundo real
  private lastUpdate: number = Date.now();

  constructor() {
    this.lastUpdate = Date.now();
  }

  public update(): void {
    const now = Date.now();
    const elapsedHours = Math.floor(
      (now - this.lastUpdate) / this.MILLISECONDS_PER_HOUR
    );

    if (elapsedHours > 0) {
      this.currentHour += elapsedHours;
      this.lastUpdate = now;

      // Atualizar dia se necessário
      if (this.currentHour >= this.HOURS_PER_DAY) {
        this.currentDay += Math.floor(this.currentHour / this.HOURS_PER_DAY);
        this.currentHour = this.currentHour % this.HOURS_PER_DAY;
      }
    }
  }

  public getCurrentDay(): number {
    return this.currentDay;
  }

  public getCurrentHour(): number {
    return this.currentHour;
  }

  public getTimeString(): string {
    return `Dia ${this.currentDay} - ${this.currentHour
      .toString()
      .padStart(2, "0")}:00`;
  }

  public setTime(day: number, hour: number): void {
    this.currentDay = day;
    this.currentHour = hour;
    this.lastUpdate = Date.now();
  }
}

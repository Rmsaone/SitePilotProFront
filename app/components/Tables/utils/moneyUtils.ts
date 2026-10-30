import type { Money } from '~/components/Tables/Types/api.interface';

const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

/** Converts an API Money (cents) to euros. */
export function toEuros(money: Money | null | undefined): number {
  return money ? Number(money.amount) / 100 : 0;
}

export function formatEuros(value: number): string {
  return formatter.format(value);
}

export function formatMoney(money: Money | null | undefined): string {
  return formatEuros(toEuros(money));
}

export function sumMoney<T>(rows: T[], pick: (row: T) => Money | null | undefined): number {
  return rows.reduce((total, row) => total + toEuros(pick(row)), 0);
}

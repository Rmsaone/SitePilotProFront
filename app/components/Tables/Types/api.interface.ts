/** Serialized Cknow\Money\Money (amount in cents). */
export interface Money {
  amount: string;
  currency: string;
  formatted: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Resource<T> {
  data: T;
}

export type BadgeColor
  = 'neutral'
    | 'error'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning';

import type { Money } from '~/components/Tables/Types/api.interface';
import type { QuoteStatusEnum, TvaRateEnum, UnitEnum } from '~/components/Quotes/Types/quoteStatusEnum';

export interface QuoteClient {
  id: number;
  contact_name: string;
  company: string | null;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  zip_code?: number;
  country?: string;
  siret?: string | null;
}

/** IndexQuoteResource */
export interface Quote {
  id: number;
  quote_number: string;
  issue_date: string;
  validity_date: string;
  quote_status: QuoteStatusEnum;
  quote_status_title: string;
  subtotal_ht: Money;
  tva_rate: TvaRateEnum;
  tva_rate_numeric: number;
  tva_amount: Money;
  total_ttc: Money;
  client?: QuoteClient;
  worksites?: { id: number; name_worksite: string }[];
}

/** IndexProductLineResource */
export interface QuoteProductLine {
  id: number;
  description: string;
  quantity: number;
  unit: UnitEnum;
  unit_title: string;
  unit_price_ht: Money;
  total_ht: Money;
  total_ttc: Money;
  sort_order: number;
  category: string | null;
}

/** ShowQuoteResource */
export interface QuoteDetail extends Quote {
  tva_rate_title: string;
  product_lines: QuoteProductLine[];
}

export function quoteClientName(client?: QuoteClient): string {
  return client ? client.company || client.contact_name : '-';
}

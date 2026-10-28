import type { Money } from '~/components/Tables/Types/api.interface';
import type { PaymentMethodEnum, PaymentStatusEnum } from '~/components/Invoices/Types/paymentStatusEnum';
import type { QuoteClient, QuoteProductLine } from '~/components/Quotes/Types/quote.interface';

/** InvoiceClientResource */
export interface ClientInvoice {
  id: number;
  delivery_date: string;
  number_invoice: string;
  invoice_description: string;
  total_ht: Money;
  tva_rate: string;
  tva_rate_numeric: number;
  tva_amount: Money;
  total_ttc: Money;
  payment_date: string | null;
  payment_status: PaymentStatusEnum;
  payment_status_title: string;
  payment_method: PaymentMethodEnum | null;
  payment_method_title: string | null;
  client?: QuoteClient;
  worksite?: { id: number; name_worksite: string } | null;
  quote?: { id: number; quote_number: string } | null;
}

/** ShowInvoiceClientResource */
export interface ClientInvoiceDetail extends ClientInvoice {
  product_lines: QuoteProductLine[];
}

/** InvoiceGenResource: supplier, subcontractor and other invoices */
export interface PurchaseInvoice {
  id: number;
  worksite_id: number;
  delivery_date: string;
  number_invoice: string;
  invoice_description: string;
  purchase_price: Money;
  cost_price: Money;
  has_attachment: boolean;
  attachment_name: string | null;
}

/** IndexWorkforceResource */
export interface WorkforceEntry {
  id: number;
  worksite_id: number;
  code: string;
  worker: string;
  hr_working: number;
  hr_rate: Money;
  cost_hr_working: Money;
  additional_costs: Money;
  total_gross_cost: Money;
}

export function invoiceClientName(invoice: Pick<ClientInvoice, 'client'>): string {
  return invoice.client ? invoice.client.company || invoice.client.contact_name : '-';
}

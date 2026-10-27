import type { Money } from '~/components/Tables/Types/api.interface';
import type { PaymentStatusEnum } from '~/components/Invoices/Types/paymentStatusEnum';
import type { WorksiteClient } from '~/components/Worksites/Types/worksite.interface';

/** InvoiceClientResource */
export interface ClientInvoice {
  id: number;
  delivery_date: string;
  number_invoice: string;
  invoice_description: string;
  total_ht: Money;
  tva_rate: number;
  payment_date: string | null;
  payment_status: PaymentStatusEnum;
  payment_status_title: string;
  payment_method: string | null;
  client?: WorksiteClient;
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

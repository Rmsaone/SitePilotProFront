import type { Money } from '~/components/Tables/Types/api.interface';
import type { WorksitePriorityEnum } from '~/components/Worksites/Types/worksitePriorityEnum';
import type { WorksiteStatusEnum } from '~/components/Worksites/Types/worksiteStatusEnum';

export interface WorksiteClient {
  id: number;
  contact_name: string;
  company: string | null;
  email: string;
  phone: string;
}

export interface WorksiteUser {
  id: number;
  full_name: string;
  user_role_title: string;
}

export interface WorksiteQuote {
  id: number;
  quote_number: string;
  issue_date: string;
  quote_status: string;
  subtotal_ht: Money;
  tva_rate: string;
  client?: WorksiteClient;
}

/** IndexWorksiteResource */
export interface WorksiteInterface {
  id: number;
  code: string | null;
  client?: WorksiteClient;
  name_worksite: string;
  start_date: string | null;
  end_date: string | null;
  worksite_priority: WorksitePriorityEnum;
  worksite_status: WorksiteStatusEnum;
  city: string;
  zip_code: number;
}

/** ShowWorksiteResource */
export interface WorksiteDetail extends WorksiteInterface {
  description: string | null;
  street: string;
  country: string;
  responsible?: WorksiteUser | null;
  quotes?: WorksiteQuote[];
}

export interface WorksiteSummary {
  market_amount: Money;
  invoiced_amount: Money;
  remaining_to_invoice: Money;
  remaining_to_spend: Money;
  pending_invoices: { amount: Money; count: number };
  pending_quotes: { amount: Money; count: number };
  costs: Record<'supplier' | 'subcontractor' | 'other' | 'workforce', { purchase: Money; cost: Money }>;
  total_costs: { purchase: Money; cost: Money };
  gross_margin: { amount: Money; rate: number | null };
  net_margin: { amount: Money; rate: number | null };
  monthly: { month: string; invoiced: Money; spent: Money }[];
}

export function worksiteClientName(client?: WorksiteClient): string {
  return client ? client.company || client.contact_name : '-';
}

export function worksitePlace(worksite: Pick<WorksiteInterface, 'city' | 'zip_code'>): string {
  return [worksite.city, worksite.zip_code].filter(Boolean).join(', ') || '-';
}

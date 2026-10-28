import type { ClientTypeEnum } from '~/components/Clients/Types/clientTypeEnum';
import type { WorksiteUser } from '~/components/Worksites/Types/worksite.interface';

/** IndexClientResource */
export interface ClientInterface {
  id: number;
  contact_name: string;
  private_name: string | null;
  email: string;
  company: string | null;
  phone: string;
  city: string;
  zip_code: number;
  client_type: ClientTypeEnum;
  client_type_title: string;
  responsible?: WorksiteUser;
  worksites_count?: number;
  quotes_count?: number;
  invoices_count?: number;
}

/** ShowClientResource */
export interface ClientDetail extends ClientInterface {
  street: string;
  country: string;
  siret: string | null;
  tva_intra: string | null;
  created_at: string;
}

export function clientDisplayName(client: Pick<ClientInterface, 'company' | 'contact_name'>): string {
  return client.company || client.contact_name;
}

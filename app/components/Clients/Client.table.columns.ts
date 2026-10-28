import type { TableColumn } from '@nuxt/ui';
import type { ClientInterface } from '~/components/Clients/Types/client.interface';

export const clientColumns: TableColumn<ClientInterface>[] = [
  {
    id: 'name',
    header: 'Nom du client',
    meta: { class: { td: 'font-medium' } }
  }, {
    accessorKey: 'contact_name',
    header: 'Contact',
    meta: { class: { td: 'text-muted' } }
  }, {
    accessorKey: 'email',
    header: 'Email',
    meta: { class: { td: 'text-muted' } }
  }, {
    accessorKey: 'phone',
    header: 'Téléphone',
    meta: { class: { td: 'text-muted whitespace-nowrap' } }
  }, {
    id: 'city',
    accessorKey: 'city',
    header: 'Ville',
    meta: { class: { td: 'text-muted' } }
  }, {
    id: 'worksites_count',
    header: 'Chantiers'
  }, {
    id: 'actions',
    header: 'Actions',
    enableHiding: false
  }];

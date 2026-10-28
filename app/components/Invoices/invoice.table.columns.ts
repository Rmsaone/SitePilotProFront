import type { TableColumn } from '@nuxt/ui';
import type { ClientInvoice } from '~/components/Invoices/Types/invoice.interface';

export const invoiceColumns: TableColumn<ClientInvoice>[] = [
  {
    accessorKey: 'number_invoice',
    header: 'N°',
    meta: { class: { td: 'font-mono text-xs font-medium text-toned whitespace-nowrap' } }
  }, {
    id: 'client',
    header: 'Nom du client',
    meta: { class: { td: 'font-medium text-highlighted max-w-40 truncate' } }
  }, {
    id: 'delivery_date',
    header: 'Date d\'émission',
    meta: { class: { td: 'text-xs text-muted whitespace-nowrap' } }
  }, {
    id: 'total_ht',
    header: 'Montant HT',
    meta: { class: { td: 'font-semibold text-highlighted whitespace-nowrap' } }
  }, {
    id: 'tva',
    header: 'TVA'
  }, {
    id: 'payment_status',
    header: 'Statut'
  }, {
    id: 'payment_date',
    header: 'Date paiement',
    meta: { class: { td: 'text-xs text-muted whitespace-nowrap' } }
  }, {
    id: 'payment_method',
    header: 'Mode'
  }, {
    id: 'actions',
    header: 'Actions',
    enableHiding: false
  }];

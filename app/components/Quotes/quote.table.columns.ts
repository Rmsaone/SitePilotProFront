import type { TableColumn } from '@nuxt/ui';
import type { Quote } from '~/components/Quotes/Types/quote.interface';

export const quoteColumns: TableColumn<Quote>[] = [
  {
    accessorKey: 'quote_number',
    header: 'N°',
    meta: { class: { td: 'font-mono font-medium text-info whitespace-nowrap' } }
  }, {
    id: 'client',
    header: 'Nom du client',
    meta: { class: { td: 'font-medium text-highlighted' } }
  }, {
    id: 'issue_date',
    header: 'Date d\'émission',
    meta: { class: { td: 'text-muted whitespace-nowrap' } }
  }, {
    id: 'subtotal_ht',
    header: 'Montant HT',
    meta: { class: { td: 'font-semibold text-highlighted whitespace-nowrap' } }
  }, {
    id: 'tva',
    header: 'TVA'
  }, {
    id: 'quote_status',
    header: 'Statut'
  }, {
    id: 'actions',
    header: 'Actions',
    enableHiding: false
  }];

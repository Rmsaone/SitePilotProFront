<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import { formatEuros, formatMoney, sumMoney } from '~/components/Tables/utils/moneyUtils';
import type { ClientInvoice } from '~/components/Invoices/Types/invoice.interface';
import {
  PaymentStatusColorMap,
  PaymentStatusEnum,
  PaymentStatusEnumMap
} from '~/components/Invoices/Types/paymentStatusEnum';
import { worksiteClientName } from '~/components/Worksites/Types/worksite.interface';

const props = defineProps<{
  worksiteId: number;
}>();

const { t } = useI18n();
const search = ref('');
const statusFilter = ref<PaymentStatusEnum | 'all'>('all');

const { data, status } = useApi<Paginated<ClientInvoice>>('/api/v1/invoice_clients', {
  query: { worksite_id: props.worksiteId, per_page: 100 }
});

const statusItems = computed(() => [
  { label: t('worksite.tabs.allStatuses'), value: 'all' as const },
  ...Object.values(PaymentStatusEnum).map(value => ({ label: PaymentStatusEnumMap.get(value) ?? value, value }))
]);

const rows = computed(() => (data.value?.data ?? []).filter((invoice) => {
  const term = search.value.trim().toLowerCase();
  const matchSearch = !term
    || invoice.number_invoice.toLowerCase().includes(term)
    || worksiteClientName(invoice.client).toLowerCase().includes(term);

  return matchSearch && (statusFilter.value === 'all' || invoice.payment_status === statusFilter.value);
}));

const columns: TableColumn<ClientInvoice>[] = [
  { accessorKey: 'number_invoice', header: 'N°', meta: { class: { td: 'font-mono font-medium text-info' } } },
  { id: 'client', header: 'Nom du client', meta: { class: { td: 'font-medium text-highlighted' } } },
  { id: 'delivery_date', header: 'Date d\'émission', meta: { class: { td: 'text-muted whitespace-nowrap' } } },
  { id: 'tva', header: 'TVA' },
  { accessorKey: 'payment_status', header: 'Statut' },
  { id: 'amount', header: 'Montant HT', footer: '', meta: { class: { th: 'text-right', td: 'text-right font-semibold text-highlighted whitespace-nowrap' } } },
  { id: 'payment_date', header: 'Date paiement', meta: { class: { td: 'text-xs text-muted whitespace-nowrap' } } },
  { accessorKey: 'payment_method', header: 'Mode', meta: { class: { td: 'text-xs text-toned' } } }
];
</script>

<template>
  <WorksitesTabsTabShell
    v-model:search="search"
    :search-placeholder="t('worksite.tabs.clientInvoices.search')"
    :count="rows.length"
    :count-label="t('worksite.tabs.invoiceCount')"
  >
    <template #filters>
      <USelect
        v-model="statusFilter"
        :items="statusItems"
        class="w-52"
        :aria-label="t('worksite.tabs.statusFilter')"
      />
    </template>

    <UTable
      :data="rows"
      :columns="columns"
      :loading="status === 'pending'"
      :empty="t('worksite.tabs.invoiceEmpty')"
      :ui="{ th: 'text-[11px] uppercase tracking-[0.05em] text-muted', td: 'text-[13px]', tfoot: 'bg-info/5' }"
    >
      <template #client-cell="{ row }">
        {{ worksiteClientName(row.original.client) }}
      </template>
      <template #delivery_date-cell="{ row }">
        {{ formatDate(row.original.delivery_date) }}
      </template>
      <template #tva-cell="{ row }">
        <UBadge
          color="neutral"
          variant="soft"
          :label="`${row.original.tva_rate} %`"
        />
      </template>
      <template #payment_status-cell="{ row }">
        <UBadge
          :color="PaymentStatusColorMap[row.original.payment_status] ?? 'neutral'"
          variant="subtle"
          :label="row.original.payment_status_title"
        />
      </template>
      <template #amount-cell="{ row }">
        {{ formatMoney(row.original.total_ht) }}
      </template>
      <template #payment_date-cell="{ row }">
        {{ row.original.payment_date ? formatDate(row.original.payment_date) : '—' }}
      </template>
      <template #amount-footer>
        <span class="font-bold text-primary-700 dark:text-primary-300">
          {{ formatEuros(sumMoney(rows, row => row.total_ht)) }}
        </span>
      </template>
    </UTable>
  </WorksitesTabsTabShell>
</template>

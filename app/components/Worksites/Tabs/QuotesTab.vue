<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { formatMoney, sumMoney, formatEuros } from '~/components/Tables/utils/moneyUtils';
import {
  QuoteStatusColorMap,
  QuoteStatusEnum,
  QuoteStatusEnumMap,
  TvaRateMap
} from '~/components/Quotes/Types/quoteStatusEnum';
import { type WorksiteQuote, worksiteClientName } from '~/components/Worksites/Types/worksite.interface';

const props = defineProps<{
  worksiteId: number;
}>();

const { t } = useI18n();
const search = ref('');
const statusFilter = ref<QuoteStatusEnum | 'all'>('all');

const { data, status } = useApi<Paginated<WorksiteQuote>>('/api/v1/quotes', {
  query: { worksite_id: props.worksiteId, per_page: 100 }
});

const statusItems = computed(() => [
  { label: t('worksite.tabs.allStatuses'), value: 'all' as const },
  ...Object.values(QuoteStatusEnum).map(value => ({ label: QuoteStatusEnumMap.get(value) ?? value, value }))
]);

const rows = computed(() => (data.value?.data ?? []).filter((quote) => {
  const term = search.value.trim().toLowerCase();
  const matchSearch = !term
    || quote.quote_number.toLowerCase().includes(term)
    || worksiteClientName(quote.client).toLowerCase().includes(term);

  return matchSearch && (statusFilter.value === 'all' || quote.quote_status === statusFilter.value);
}));

const columns: TableColumn<WorksiteQuote>[] = [
  { accessorKey: 'quote_number', header: 'N°', meta: { class: { td: 'font-mono font-medium text-info' } } },
  { id: 'client', header: 'Nom du client', meta: { class: { td: 'font-medium text-highlighted' } } },
  { accessorKey: 'issue_date', header: 'Date d\'émission', meta: { class: { td: 'text-muted whitespace-nowrap' } } },
  { id: 'tva', header: 'TVA' },
  { accessorKey: 'quote_status', header: 'Statut' },
  { id: 'amount', header: 'Montant HT', footer: '', meta: { class: { th: 'text-right', td: 'text-right font-semibold text-highlighted whitespace-nowrap' } } }
];
</script>

<template>
  <WorksitesTabsTabShell
    v-model:search="search"
    :search-placeholder="t('worksite.tabs.quotes.search')"
    :count="rows.length"
    :count-label="t('worksite.tabs.quotes.count')"
  >
    <template #filters>
      <USelect
        v-model="statusFilter"
        :items="statusItems"
        class="w-48"
        :aria-label="t('worksite.tabs.statusFilter')"
      />
    </template>

    <UTable
      :data="rows"
      :columns="columns"
      :loading="status === 'pending'"
      :empty="t('worksite.tabs.quotes.empty')"
      :ui="{ th: 'text-[11px] uppercase tracking-[0.05em] text-muted', td: 'text-[13px]', tfoot: 'bg-info/5' }"
    >
      <template #client-cell="{ row }">
        {{ worksiteClientName(row.original.client) }}
      </template>
      <template #tva-cell="{ row }">
        <UBadge
          color="neutral"
          variant="soft"
          :label="`${TvaRateMap[row.original.tva_rate] ?? 0} %`"
        />
      </template>
      <template #quote_status-cell="{ row }">
        <UBadge
          :color="QuoteStatusColorMap[row.original.quote_status as QuoteStatusEnum] ?? 'neutral'"
          variant="subtle"
          :label="QuoteStatusEnumMap.get(row.original.quote_status as QuoteStatusEnum) ?? row.original.quote_status"
        />
      </template>
      <template #amount-cell="{ row }">
        {{ formatMoney(row.original.subtotal_ht) }}
      </template>
      <template #amount-footer>
        <span class="font-bold text-primary-700 dark:text-primary-300">
          {{ formatEuros(sumMoney(rows, row => row.subtotal_ht)) }}
        </span>
      </template>
    </UTable>
  </WorksitesTabsTabShell>
</template>

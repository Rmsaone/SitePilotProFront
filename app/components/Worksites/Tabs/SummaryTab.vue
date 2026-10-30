<script setup lang="ts">
import type { Money, Resource } from '~/components/Tables/Types/api.interface';
import { formatEuros, formatMoney, toEuros } from '~/components/Tables/utils/moneyUtils';
import type { WorksiteSummary } from '~/components/Worksites/Types/worksite.interface';

const props = defineProps<{
  worksiteId: number;
}>();

const emit = defineEmits<{
  navigate: [tab: 'quotes' | 'client-invoices'];
}>();

const { t } = useI18n();
const dayjs = useDayjs();

const { data, status } = useApi<Resource<WorksiteSummary>>(
  () => `/api/v1/worksites/${props.worksiteId}/summary`
);

const summary = computed(() => data.value?.data ?? null);

const kpis = computed(() => {
  if (!summary.value) {
    return [];
  }

  const remainingToSpend = toEuros(summary.value.remaining_to_spend);
  const remainingToInvoice = toEuros(summary.value.remaining_to_invoice);

  return [
    {
      label: t('worksite.summary.market'),
      value: summary.value.market_amount,
      badge: toEuros(summary.value.market_amount) > 0 ? t('worksite.summary.marketSigned') : t('worksite.summary.noMarket'),
      color: 'info' as const
    },
    {
      label: t('worksite.summary.remainingToSpend'),
      value: summary.value.remaining_to_spend,
      badge: remainingToSpend < 0 ? t('worksite.summary.overBudget') : t('worksite.summary.withinBudget'),
      color: remainingToSpend < 0 ? 'error' as const : 'warning' as const
    },
    {
      label: t('worksite.summary.remainingToInvoice'),
      value: summary.value.remaining_to_invoice,
      badge: remainingToInvoice === 0 ? t('worksite.summary.allInvoiced') : t('worksite.summary.toInvoice'),
      color: remainingToInvoice === 0 ? 'success' as const : 'warning' as const
    }
  ];
});

const costRows = computed(() => summary.value
  ? [
      { label: t('worksite.summary.costs.supplier'), ...summary.value.costs.supplier },
      { label: t('worksite.summary.costs.subcontractor'), ...summary.value.costs.subcontractor },
      { label: t('worksite.summary.costs.other'), ...summary.value.costs.other },
      { label: t('worksite.summary.costs.workforce'), ...summary.value.costs.workforce }
    ]
  : []);

const margins = computed(() => summary.value
  ? [
      { label: t('worksite.summary.grossMargin'), ...summary.value.gross_margin },
      { label: t('worksite.summary.netMargin'), ...summary.value.net_margin }
    ]
  : []);

const chartLabels = computed(() => summary.value?.monthly.map(point => dayjs(`${point.month}-01`).format('MMM')) ?? []);
const chartSeries = computed(() => summary.value
  ? [
      { label: t('worksite.summary.chart.invoiced'), colorClass: 'text-primary-700 dark:text-primary-300', values: summary.value.monthly.map(point => toEuros(point.invoiced)) },
      { label: t('worksite.summary.chart.spent'), colorClass: 'text-error', values: summary.value.monthly.map(point => toEuros(point.spent)) }
    ]
  : []);

function isNegative(money: Money): boolean {
  return toEuros(money) < 0;
}
</script>

<template>
  <div
    v-if="status === 'pending' && !summary"
    class="grid grid-cols-1 sm:grid-cols-3 gap-4"
  >
    <USkeleton
      v-for="i in 3"
      :key="i"
      class="h-32 rounded-xl"
    />
  </div>

  <div
    v-else-if="summary"
    class="flex flex-col gap-4 md:gap-5"
  >
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
      <UCard
        v-for="kpi in kpis"
        :key="kpi.label"
        :ui="{ root: 'rounded-xl', body: 'p-4 md:p-6 sm:p-6 flex flex-col gap-2' }"
      >
        <p class="text-[11px] font-semibold text-muted uppercase tracking-[0.08em]">
          {{ kpi.label }}
        </p>
        <p
          class="text-2xl md:text-[32px] font-extrabold leading-none"
          :class="isNegative(kpi.value) ? 'text-error' : 'text-highlighted'"
        >
          {{ formatMoney(kpi.value) }}
        </p>
        <UBadge
          :color="kpi.color"
          variant="subtle"
          class="self-start font-semibold"
          :label="kpi.badge"
        />
      </UCard>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
      <UCard
        :ui="{ root: 'rounded-[14px] overflow-hidden relative', body: 'p-5 sm:p-5 flex items-center justify-between gap-4' }"
      >
        <span class="absolute left-0 inset-y-0 w-1 bg-success" />
        <div class="flex flex-col gap-1 pl-3">
          <p class="text-[11px] font-semibold text-muted uppercase tracking-[0.08em]">
            {{ t('worksite.summary.pendingInvoices') }}
          </p>
          <p class="text-[26px] font-extrabold leading-none text-success">
            {{ formatMoney(summary.pending_invoices.amount) }}
          </p>
          <p class="text-xs text-muted mt-0.5">
            {{ t('worksite.summary.pendingInvoicesCount', { count: summary.pending_invoices.count }, summary.pending_invoices.count) }}
          </p>
        </div>
        <UButton
          color="success"
          variant="outline"
          :label="t('worksite.summary.access')"
          @click="emit('navigate', 'client-invoices')"
        />
      </UCard>
      <UCard
        :ui="{ root: 'rounded-[14px] overflow-hidden relative', body: 'p-5 sm:p-5 flex items-center justify-between gap-4' }"
      >
        <span class="absolute left-0 inset-y-0 w-1 bg-error" />
        <div class="flex flex-col gap-1 pl-3">
          <p class="text-[11px] font-semibold text-muted uppercase tracking-[0.08em]">
            {{ t('worksite.summary.pendingQuotes') }}
          </p>
          <p class="text-[26px] font-extrabold leading-none text-error">
            {{ formatMoney(summary.pending_quotes.amount) }}
          </p>
          <p class="text-xs text-muted mt-0.5">
            {{ t('worksite.summary.pendingQuotesCount', { count: summary.pending_quotes.count }, summary.pending_quotes.count) }}
          </p>
        </div>
        <UButton
          color="error"
          variant="outline"
          :label="t('worksite.summary.access')"
          @click="emit('navigate', 'quotes')"
        />
      </UCard>
    </div>

    <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-5">
      <UCard
        class="lg:col-span-2"
        :ui="{ root: 'rounded-xl overflow-hidden', header: 'bg-primary-700 px-4 md:px-5 py-3 sm:px-5', body: 'p-0 sm:p-0' }"
      >
        <template #header>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span class="text-xs font-bold text-white uppercase tracking-[0.07em]">{{ t('worksite.summary.costsTitle') }}</span>
            <span class="text-[11px] md:text-xs text-primary-200">
              {{ t('worksite.summary.totalInvoiced') }} :
              <span class="font-bold text-white">{{ formatMoney(summary.invoiced_amount) }}</span>
            </span>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full min-w-95">
            <thead>
              <tr class="bg-elevated border-b border-default">
                <th
                  scope="col"
                  class="px-4 md:px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-[0.06em]"
                >
                  {{ t('worksite.summary.post') }}
                </th>
                <th
                  scope="col"
                  class="px-4 md:px-5 py-2.5 text-right text-[11px] font-semibold text-muted uppercase tracking-[0.06em]"
                >
                  {{ t('worksite.summary.purchasePrice') }}
                </th>
                <th
                  scope="col"
                  class="px-4 md:px-5 py-2.5 text-right text-[11px] font-semibold text-muted uppercase tracking-[0.06em]"
                >
                  {{ t('worksite.summary.costPrice') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in costRows"
                :key="row.label"
                class="border-b border-default"
                :class="{ 'bg-elevated/40': index % 2 === 1 }"
              >
                <td class="px-4 md:px-5 py-3 text-[13px] text-toned">
                  {{ row.label }}
                </td>
                <td class="px-4 md:px-5 py-3 text-[13px] font-semibold text-toned text-right whitespace-nowrap">
                  {{ formatMoney(row.purchase) }}
                </td>
                <td class="px-4 md:px-5 py-3 text-[13px] font-semibold text-toned text-right whitespace-nowrap">
                  {{ formatMoney(row.cost) }}
                </td>
              </tr>
              <tr class="bg-info/5 border-t-2 border-primary-700">
                <td class="px-4 md:px-5 py-3 text-[13px] font-bold text-primary-700 dark:text-primary-300">
                  {{ t('worksite.summary.total') }}
                </td>
                <td class="px-4 md:px-5 py-3 text-[13px] font-bold text-primary-700 dark:text-primary-300 text-right whitespace-nowrap">
                  {{ formatMoney(summary.total_costs.purchase) }}
                </td>
                <td class="px-4 md:px-5 py-3 text-[13px] font-bold text-primary-700 dark:text-primary-300 text-right whitespace-nowrap">
                  {{ formatMoney(summary.total_costs.cost) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <UCard :ui="{ root: 'rounded-xl overflow-hidden flex flex-col', header: 'bg-primary-700 px-4 md:px-5 py-3 sm:px-5', body: 'p-0 sm:p-0 flex flex-row lg:flex-col divide-x lg:divide-x-0 lg:divide-y divide-default flex-1' }">
        <template #header>
          <span class="text-xs font-bold text-white uppercase tracking-[0.07em]">{{ t('worksite.summary.result') }}</span>
        </template>
        <div
          v-for="margin in margins"
          :key="margin.label"
          class="flex-1 flex flex-col items-center justify-center px-4 py-5 md:py-6 gap-1"
        >
          <p class="text-[11px] font-semibold text-muted uppercase tracking-[0.08em] text-center">
            {{ margin.label }}
          </p>
          <p
            class="text-xl md:text-[28px] font-extrabold leading-none text-center"
            :class="isNegative(margin.amount) ? 'text-error' : 'text-success'"
          >
            {{ formatMoney(margin.amount) }}
          </p>
          <UBadge
            v-if="margin.rate !== null"
            :color="isNegative(margin.amount) ? 'error' : 'success'"
            variant="subtle"
            class="mt-1"
            :label="`${margin.rate > 0 ? '+' : ''}${margin.rate.toLocaleString('fr-FR')} %`"
          />
        </div>
      </UCard>
    </div>

    <UCard :ui="{ root: 'rounded-xl', body: 'p-4 md:p-6 sm:p-6' }">
      <div class="mb-4">
        <h3 class="text-sm font-bold text-highlighted">
          {{ t('worksite.summary.chart.title') }}
        </h3>
        <p class="text-xs text-muted mt-0.5">
          {{ t('worksite.summary.chart.subtitle') }}
        </p>
      </div>
      <ChartsLineChart
        :labels="chartLabels"
        :series="chartSeries"
        :format-value="formatEuros"
      />
    </UCard>
  </div>
</template>

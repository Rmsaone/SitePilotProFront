<script setup lang="ts">
import type { Money, Resource } from '~/components/Tables/Types/api.interface';
import { formatEuros, toEuros } from '~/components/Tables/utils/moneyUtils';

type Period = 'month' | 'quarter' | 'year' | 'all';

interface Counter {
  value: number;
  trend: number | null;
}

interface Dashboard {
  period: Period;
  period_title: string;
  worksites_in_progress: Counter;
  accepted_quotes: Counter;
  invoices: Counter;
  created_quotes: Counter;
  revenue: { amount: Money; trend: number | null };
  remaining_to_invoice: { amount: Money; worksites: number };
  monthly: { month: string; invoiced: Money; spent: Money }[];
}

const PERIODS: Period[] = ['month', 'quarter', 'year', 'all'];

const { t } = useI18n();
const dayjs = useDayjs();

const period = ref<Period>('month');
const periodItems = computed(() => PERIODS.map(value => ({ value, label: t(`dashboard.periods.${value}`) })));

const { data, status, refresh } = useApi<Resource<Dashboard>>('/api/v1/dashboard', {
  query: () => ({ period: period.value })
});

const dashboard = computed(() => data.value?.data ?? null);

const kpis = computed(() => dashboard.value
  ? [
      { key: 'worksites', label: t('dashboard.kpis.worksites'), icon: 'i-lucide-building-2', gradientClass: 'from-primary-700 to-blue-600', to: '/worksite?status=in_progress', ...dashboard.value.worksites_in_progress },
      { key: 'invoices', label: t('dashboard.kpis.invoices'), icon: 'i-lucide-receipt', gradientClass: 'from-green-600 to-success', to: '/invoice', ...dashboard.value.invoices },
      { key: 'quotes', label: t('dashboard.kpis.quotes'), icon: 'i-lucide-file-text', gradientClass: 'from-secondary to-secondary-400', to: '/quote', ...dashboard.value.created_quotes }
    ]
  : []);

const remaining = computed(() => {
  const value = formatEuros(toEuros(dashboard.value?.remaining_to_invoice.amount)).replace(/\s?€$/, '');
  const [integer, decimals] = value.split(',');

  return { integer, decimals };
});

const chartLabels = computed(() => dashboard.value?.monthly.map(point => dayjs(`${point.month}-01`).format('MMM')) ?? []);
const chartSeries = computed(() => dashboard.value
  ? [
      { label: t('dashboard.chart.invoiced'), colorClass: 'text-primary-700 dark:text-primary-300', values: dashboard.value.monthly.map(point => toEuros(point.invoiced)) },
      { label: t('dashboard.chart.spent'), colorClass: 'text-red-400', values: dashboard.value.monthly.map(point => toEuros(point.spent)) }
    ]
  : []);
const chartRange = computed(() => {
  const months = dashboard.value?.monthly ?? [];

  return months.length
    ? `${dayjs(`${months[0]!.month}-01`).format('MMM YYYY')} – ${dayjs(`${months.at(-1)!.month}-01`).format('MMM YYYY')}`
    : '';
});

// Quick actions
const importOpen = ref(false);
const clientFormOpen = ref(false);
const quoteFormOpen = ref(false);
const worksiteFormOpen = ref(false);

async function onImported(): Promise<void> {
  await refresh();
}

async function onClientSaved(client: { id: number }): Promise<void> {
  clientFormOpen.value = false;
  await navigateTo(`/client/${client.id}`);
}

async function onQuoteSaved(quote: { id: number }): Promise<void> {
  quoteFormOpen.value = false;
  await navigateTo(`/quote/${quote.id}`);
}

async function onWorksiteSaved(worksiteId: number): Promise<void> {
  worksiteFormOpen.value = false;
  await navigateTo(`/worksite/${worksiteId}`);
}
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-5">
    <div class="grid grid-cols-3 sm:flex sm:flex-wrap gap-3">
      <UButton
        icon="i-lucide-receipt"
        size="xl"
        class="h-14 justify-center px-4 sm:px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-[0_3px_12px_rgba(124,58,237,0.35)]"
        :ui="{ label: 'hidden sm:inline text-[15px]' }"
        :label="t('dashboard.actions.addInvoice')"
        :aria-label="t('dashboard.actions.addInvoice')"
        @click="importOpen = true"
      />
      <UButton
        icon="i-lucide-users"
        size="xl"
        class="h-14 justify-center px-4 sm:px-6 rounded-xl bg-primary-700 hover:bg-primary-800 text-white shadow-[0_3px_12px_rgba(30,58,95,0.35)]"
        :ui="{ label: 'hidden sm:inline text-[15px]' }"
        :label="t('dashboard.actions.createClient')"
        :aria-label="t('dashboard.actions.createClient')"
        @click="clientFormOpen = true"
      />
      <UButton
        icon="i-lucide-file-text"
        size="xl"
        color="success"
        class="h-14 justify-center px-4 sm:px-6 rounded-xl text-white shadow-[0_3px_12px_rgba(34,197,94,0.35)]"
        :ui="{ label: 'hidden sm:inline text-[15px]' }"
        :label="t('dashboard.actions.createQuote')"
        :aria-label="t('dashboard.actions.createQuote')"
        @click="quoteFormOpen = true"
      />
    </div>

    <UTabs
      v-model="period"
      :items="periodItems"
      :content="false"
      size="xs"
      class="w-fit"
      :ui="{ list: 'bg-default border border-default rounded-[10px] p-1 shadow-xs', indicator: 'bg-primary-700 rounded-[7px]', trigger: 'px-3 text-xs font-semibold data-[state=active]:text-white' }"
    />

    <div
      v-if="!dashboard && status === 'pending'"
      class="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      <USkeleton
        v-for="i in 4"
        :key="i"
        class="h-28 rounded-xl"
      />
    </div>

    <template v-else-if="dashboard">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardKpiCard
          v-bind="kpis[0]!"
        />

        <NuxtLink
          to="/quote?status=accept"
          class="bg-default rounded-xl border border-default shadow-xs p-3 flex flex-col gap-2 hover:border-accented transition-colors"
        >
          <div class="flex items-start justify-between">
            <span class="size-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
              <UIcon
                name="i-lucide-circle-check"
                class="size-3.5 text-violet-600"
              />
            </span>
            <UBadge
              v-if="dashboard.accepted_quotes.trend !== null"
              :color="dashboard.accepted_quotes.trend >= 0 ? 'success' : 'error'"
              variant="subtle"
              size="sm"
              class="rounded-full text-[10px] font-bold"
              :icon="dashboard.accepted_quotes.trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
              :label="`${dashboard.accepted_quotes.trend > 0 ? '+' : ''}${dashboard.accepted_quotes.trend.toLocaleString('fr-FR')} %`"
            />
          </div>
          <div>
            <p class="text-[22px] font-extrabold text-primary-700 dark:text-primary-300 leading-none">
              {{ dashboard.accepted_quotes.value }}
            </p>
            <p class="text-[11px] mt-0.5 text-muted font-medium">
              {{ t('dashboard.kpis.acceptedQuotes') }}
            </p>
          </div>
          <UButton
            size="xs"
            color="secondary"
            variant="soft"
            block
            icon="i-lucide-building-2"
            :label="t('client.detail.createWorksite')"
            @click.prevent.stop="worksiteFormOpen = true"
          />
        </NuxtLink>

        <DashboardKpiCard v-bind="kpis[1]!" />
        <DashboardKpiCard v-bind="kpis[2]!" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UCard :ui="{ root: 'rounded-2xl overflow-hidden', body: 'p-0 sm:p-0 flex' }">
          <span class="w-1.5 shrink-0 bg-linear-to-b from-primary-700 to-blue-600" />
          <div class="flex-1 p-5 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="size-7 rounded-lg bg-info/10 flex items-center justify-center">
                  <UIcon
                    name="i-lucide-trending-up"
                    class="size-3.5 text-info"
                  />
                </span>
                <span class="text-[11px] font-bold text-muted uppercase tracking-[0.09em]">{{ t('dashboard.revenue.title') }}</span>
              </div>
              <UBadge
                v-if="dashboard.revenue.trend !== null"
                :color="dashboard.revenue.trend >= 0 ? 'success' : 'error'"
                variant="subtle"
                size="sm"
                class="rounded-full text-[10px] font-bold"
                :icon="dashboard.revenue.trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                :label="`${dashboard.revenue.trend > 0 ? '+' : ''}${dashboard.revenue.trend.toLocaleString('fr-FR')} %`"
              />
            </div>
            <div>
              <p class="text-[32px] font-black text-highlighted leading-none tracking-tight">
                {{ formatEuros(toEuros(dashboard.revenue.amount)) }}
              </p>
              <p class="text-xs text-dimmed mt-1 font-medium">
                {{ t('dashboard.revenue.subtitle', { period: dashboard.period_title.toLowerCase() }) }}
              </p>
            </div>
            <p
              v-if="dashboard.revenue.trend !== null"
              class="text-[11px] text-muted"
            >
              {{ t('dashboard.revenue.compared') }}
            </p>
          </div>
        </UCard>

        <UCard :ui="{ root: 'rounded-2xl overflow-hidden ring-secondary/30 shadow-[0_4px_16px_rgba(249,115,22,0.12)]', body: 'p-0 sm:p-0' }">
          <div class="h-0.75 bg-linear-to-r from-secondary to-secondary-400" />
          <div class="p-5 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="size-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <UIcon
                    name="i-lucide-hard-drive-upload"
                    class="size-3.5 text-secondary"
                  />
                </span>
                <span class="text-[10px] font-bold text-toned uppercase tracking-[0.12em]">{{ t('dashboard.remaining.title') }}</span>
              </div>
              <UBadge
                color="secondary"
                variant="outline"
                size="sm"
                class="rounded-full text-[10px] font-bold"
                :label="t('dashboard.remaining.worksites', { count: dashboard.remaining_to_invoice.worksites }, dashboard.remaining_to_invoice.worksites)"
              />
            </div>
            <div>
              <p class="text-[34px] font-black text-primary-700 dark:text-primary-300 leading-none tracking-tight">
                {{ remaining.integer }}<span class="text-secondary">,{{ remaining.decimals }}</span>
              </p>
              <p class="text-sm font-bold text-secondary leading-none mt-0.5">
                € HT
              </p>
              <p class="text-[11px] text-dimmed mt-1.5">
                {{ t('dashboard.remaining.subtitle') }}
              </p>
            </div>
            <UButton
              to="/worksite?status=in_progress"
              variant="link"
              color="secondary"
              size="sm"
              class="px-0 w-fit font-semibold"
              trailing-icon="i-lucide-arrow-right"
              :label="t('dashboard.remaining.link')"
            />
          </div>
        </UCard>
      </div>

      <UCard :ui="{ root: 'rounded-xl', body: 'p-4 md:p-6 sm:p-6' }">
        <div class="flex items-start justify-between mb-1">
          <div>
            <h2 class="text-[15px] font-bold text-highlighted">
              {{ t('dashboard.chart.title') }}
            </h2>
            <p class="text-[13px] text-muted mt-0.5">
              {{ t('dashboard.chart.subtitle', { range: chartRange }) }}
            </p>
          </div>
          <UButton
            to="/worksite"
            variant="link"
            color="info"
            size="sm"
            trailing-icon="i-lucide-arrow-right"
            :label="t('dashboard.chart.link')"
          />
        </div>
        <div class="flex items-center gap-4 mt-3 mb-4 text-xs text-muted">
          <span
            v-for="serie in chartSeries"
            :key="serie.label"
            class="flex items-center gap-1.5"
          >
            <span
              class="size-3 rounded-sm inline-block bg-current"
              :class="serie.colorClass"
            />
            {{ serie.label }}
          </span>
        </div>
        <ChartsBarChart
          :labels="chartLabels"
          :series="chartSeries"
          :format-value="formatEuros"
        />
      </UCard>
    </template>

    <InvoicesImportInvoiceModal
      v-model:open="importOpen"
      @saved="onImported"
    />
    <ClientsClientFormModal
      v-model:open="clientFormOpen"
      :client-id="null"
      @saved="onClientSaved"
    />
    <QuotesQuoteFormModal
      v-model:open="quoteFormOpen"
      :quote-id="null"
      @saved="onQuoteSaved"
    />
    <WorksitesWorksiteFormModal
      v-model:open="worksiteFormOpen"
      :worksite-id="null"
      @saved="onWorksiteSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { useTableColumns } from '~/components/Tables/Composables/useTableColumns';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';
import { type Quote, type QuoteDetail, quoteClientName } from '~/components/Quotes/Types/quote.interface';
import {
  QuoteStatusColorMap,
  QuoteStatusEnum,
  QuoteStatusEnumMap
} from '~/components/Quotes/Types/quoteStatusEnum';

const PER_PAGE = 10;

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();
const { quoteColumns } = useTableColumns();

const page = ref(1);
const search = ref('');
const debouncedSearch = ref('');
const selectedStatus = ref<QuoteStatusEnum | 'all'>(
  Object.values(QuoteStatusEnum).includes(route.query.status as QuoteStatusEnum)
    ? route.query.status as QuoteStatusEnum
    : 'all'
);

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value.trim();
  }, 300);
});
watch([debouncedSearch, selectedStatus], () => {
  page.value = 1;
});

const query = computed(() => ({
  page: page.value,
  per_page: PER_PAGE,
  search: debouncedSearch.value || undefined,
  quote_status: selectedStatus.value === 'all' ? undefined : selectedStatus.value
}));

const { data, status, refresh } = useApi<Paginated<Quote>>('/api/v1/quotes', { query });

const quotes = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.meta.total ?? 0);

const statusItems = computed(() => [
  { label: t('quote.list.allStatuses'), value: 'all' as const },
  ...Object.values(QuoteStatusEnum).map(value => ({ label: QuoteStatusEnumMap.get(value) ?? value, value }))
]);

const statuses = Object.values(QuoteStatusEnum);
const statusLabel = (value: QuoteStatusEnum) => QuoteStatusEnumMap.get(value) ?? value;
const statusColor = (value: QuoteStatusEnum) => QuoteStatusColorMap[value] ?? 'neutral';

async function updateStatus(quote: Quote, quoteStatus: QuoteStatusEnum): Promise<void> {
  const previous = quote.quote_status;
  quote.quote_status = quoteStatus;

  try {
    await client(`/api/v1/quotes/${quote.id}/status`, {
      method: 'patch',
      body: { quote_status: quoteStatus }
    });
  } catch (error) {
    quote.quote_status = previous;
    handle(error);
  }
}

// Create / edit
const formOpen = ref(false);
const editedId = ref<number | null>(null);
const createdQuote = ref<QuoteDetail | null>(null);
const popupOpen = ref(false);

function openForm(quoteId: number | null): void {
  editedId.value = quoteId;
  formOpen.value = true;
}

async function onSaved(quote: QuoteDetail, created: boolean): Promise<void> {
  formOpen.value = false;
  await refresh();

  if (created) {
    createdQuote.value = quote;
    popupOpen.value = true;

    return;
  }

  toast.add({ title: t('quote.form.updated'), color: 'success', icon: 'i-lucide-circle-check' });
}

const popupActions = computed(() => createdQuote.value
  ? [
      {
        icon: 'i-lucide-mail',
        label: t('quote.popup.sendByEmail'),
        description: t('quote.popup.sendByEmailHint'),
        color: 'info' as const,
        href: quoteMailto(createdQuote.value)
      },
      {
        icon: 'i-lucide-file-text',
        label: t('quote.popup.open'),
        description: t('quote.popup.openHint'),
        color: 'success' as const,
        to: `/quote/${createdQuote.value.id}`
      }
    ]
  : []);

const convertOpen = ref(false);
const convertTarget = ref<Quote | null>(null);

// Delete
const deleteTarget = ref<Quote | null>(null);
const deleting = ref(false);
const deleteOpen = computed({
  get: () => deleteTarget.value !== null,
  set: (value: boolean) => {
    if (!value) {
      deleteTarget.value = null;
    }
  }
});

async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value) {
    return;
  }

  deleting.value = true;

  try {
    await client(`/api/v1/quotes/${deleteTarget.value.id}`, { method: 'delete' });
    deleteTarget.value = null;
    toast.add({ title: t('quote.list.deleted'), color: 'success', icon: 'i-lucide-circle-check' });
    await refresh();
  } catch (error) {
    handle(error);
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row gap-2">
      <div class="flex gap-2 flex-1 min-w-0">
        <UInput
          v-model="search"
          class="flex-1 max-w-sm"
          icon="i-lucide-search"
          :placeholder="t('quote.list.searchPlaceholder')"
          :aria-label="t('quote.list.searchPlaceholder')"
        />
        <USelect
          v-model="selectedStatus"
          :items="statusItems"
          class="w-44"
          :aria-label="t('quote.list.statusFilter')"
        />
      </div>
      <UButton
        icon="i-lucide-plus"
        color="success"
        :label="t('quote.add')"
        @click="openForm(null)"
      />
    </div>

    <UCard :ui="{ root: 'rounded-xl overflow-hidden', body: 'p-0 sm:p-0' }">
      <UTable
        :data="quotes"
        :columns="quoteColumns"
        :loading="status === 'pending'"
        :empty="t('quote.list.noData')"
        :ui="{ th: 'text-[11px] uppercase tracking-[0.05em] text-muted', td: 'text-[13px]', tr: 'cursor-pointer' }"
        @select="(_event, row) => navigateTo(`/quote/${row.original.id}`)"
      >
        <template #client-cell="{ row }">
          {{ quoteClientName(row.original.client) }}
        </template>
        <template #issue_date-cell="{ row }">
          {{ formatDate(row.original.issue_date) }}
        </template>
        <template #subtotal_ht-cell="{ row }">
          {{ formatMoney(row.original.subtotal_ht) }}
        </template>
        <template #tva-cell="{ row }">
          <UBadge
            color="neutral"
            variant="soft"
            :label="`${row.original.tva_rate_numeric.toLocaleString('fr-FR')} %`"
          />
        </template>
        <template #quote_status-cell="{ row }">
          <TablesComponentsStatusPicker
            :status="row.original.quote_status"
            :options="statuses"
            :label="statusLabel"
            :color="statusColor"
            @change="value => updateStatus(row.original, value)"
          />
        </template>
        <template #actions-cell="{ row }">
          <TablesComponentsRowActions
            convert
            :convert-disabled="row.original.quote_status !== QuoteStatusEnum.Accept"
            download
            @convert="convertTarget = row.original; convertOpen = true"
            @view="navigateTo(`/quote/${row.original.id}`)"
            @download="navigateTo(`/quote/${row.original.id}?print=1`)"
            @edit="openForm(row.original.id)"
            @remove="deleteTarget = row.original"
          />
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-2 px-4 py-3 border-t border-default">
        <p class="text-xs text-muted">
          {{ t('quote.list.total', { count: total }, total) }}
        </p>
        <UPagination
          v-model:page="page"
          :items-per-page="PER_PAGE"
          :total="total"
          size="sm"
        />
      </div>
    </UCard>

    <QuotesQuoteFormModal
      v-model:open="formOpen"
      :quote-id="editedId"
      @saved="onSaved"
    />

    <FeedbackPostCreationPopup
      v-model:open="popupOpen"
      :title="t('quote.popup.title')"
      :subtitle="t('quote.popup.subtitle')"
      :actions="popupActions"
      :dismiss-label="t('quote.popup.dismiss')"
    />

    <QuotesConvertToInvoiceModal
      v-model:open="convertOpen"
      :quote="convertTarget"
    />

    <TablesComponentsDeleteConfirmModal
      v-model:open="deleteOpen"
      :label="deleteTarget?.quote_number ?? ''"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

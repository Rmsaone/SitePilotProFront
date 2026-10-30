<script setup lang="ts">
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { useTableColumns } from '~/components/Tables/Composables/useTableColumns';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';
import { type ClientInvoice, invoiceClientName } from '~/components/Invoices/Types/invoice.interface';
import {
  PaymentMethodIconMap,
  PaymentStatusColorMap,
  PaymentStatusEnum,
  PaymentStatusEnumMap,
  RECEIVED_STATUSES
} from '~/components/Invoices/Types/paymentStatusEnum';

const PER_PAGE = 10;

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();
const { invoiceColumns } = useTableColumns();

const page = ref(1);
const search = ref('');
const debouncedSearch = ref('');
const selectedStatus = ref<PaymentStatusEnum | 'all'>(
  Object.values(PaymentStatusEnum).includes(route.query.status as PaymentStatusEnum)
    ? route.query.status as PaymentStatusEnum
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
  payment_status: selectedStatus.value === 'all' ? undefined : selectedStatus.value
}));

const { data, status, refresh } = useApi<Paginated<ClientInvoice>>('/api/v1/invoice_clients', { query });

const invoices = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.meta.total ?? 0);

const statusItems = computed(() => [
  { label: t('invoice.list.allStatuses'), value: 'all' as const },
  ...Object.values(PaymentStatusEnum).map(value => ({ label: PaymentStatusEnumMap.get(value) ?? value, value }))
]);

const statuses = Object.values(PaymentStatusEnum);
const statusLabel = (value: PaymentStatusEnum) => PaymentStatusEnumMap.get(value) ?? value;
const statusColor = (value: PaymentStatusEnum) => PaymentStatusColorMap[value] ?? 'neutral';

// A received payment needs a date and a method: ask for them in a modal.
const paymentOpen = ref(false);
const paymentInvoice = ref<ClientInvoice | null>(null);
const paymentStatus = ref<PaymentStatusEnum>();

async function changeStatus(invoice: ClientInvoice, value: PaymentStatusEnum): Promise<void> {
  if (RECEIVED_STATUSES.includes(value)) {
    paymentInvoice.value = invoice;
    paymentStatus.value = value;
    paymentOpen.value = true;

    return;
  }

  try {
    await client(`/api/v1/invoice_clients/${invoice.id}/payment`, {
      method: 'patch',
      body: { payment_status: value }
    });
    await refresh();
  } catch (error) {
    handle(error);
  }
}

async function onPaymentSaved(): Promise<void> {
  paymentOpen.value = false;
  toast.add({ title: t('invoice.payment.saved'), color: 'success', icon: 'i-lucide-circle-check' });
  await refresh();
}

const importOpen = ref(false);

// Delete
const deleteTarget = ref<ClientInvoice | null>(null);
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
    await client(`/api/v1/invoice_clients/${deleteTarget.value.id}`, { method: 'delete' });
    deleteTarget.value = null;
    toast.add({ title: t('invoice.list.deleted'), color: 'success', icon: 'i-lucide-circle-check' });
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
          :placeholder="t('invoice.list.searchPlaceholder')"
          :aria-label="t('invoice.list.searchPlaceholder')"
        />
        <USelect
          v-model="selectedStatus"
          :items="statusItems"
          class="w-56"
          :aria-label="t('invoice.list.statusFilter')"
        />
      </div>
      <UButton
        icon="i-lucide-upload"
        class="bg-violet-600 hover:bg-violet-700 text-white"
        :label="t('invoice.import.button')"
        @click="importOpen = true"
      />
    </div>

    <UCard :ui="{ root: 'rounded-xl overflow-hidden', body: 'p-0 sm:p-0' }">
      <UTable
        :data="invoices"
        :columns="invoiceColumns"
        :loading="status === 'pending'"
        :empty="t('invoice.list.noData')"
        :ui="{ th: 'text-[11px] uppercase tracking-[0.05em] text-muted px-3', td: 'text-[13px] px-3', tr: 'cursor-pointer' }"
        @select="(_event, row) => navigateTo(`/invoice/${row.original.id}`)"
      >
        <template #client-cell="{ row }">
          {{ invoiceClientName(row.original) }}
        </template>
        <template #delivery_date-cell="{ row }">
          {{ formatDate(row.original.delivery_date) }}
        </template>
        <template #total_ht-cell="{ row }">
          {{ formatMoney(row.original.total_ht) }}
        </template>
        <template #tva-cell="{ row }">
          <UBadge
            color="neutral"
            variant="soft"
            :label="`${row.original.tva_rate_numeric.toLocaleString('fr-FR')} %`"
          />
        </template>
        <template #payment_status-cell="{ row }">
          <TablesComponentsStatusPicker
            :status="row.original.payment_status"
            :options="statuses"
            :label="statusLabel"
            :color="statusColor"
            @change="value => changeStatus(row.original, value)"
          />
        </template>
        <template #payment_date-cell="{ row }">
          {{ row.original.payment_date ? formatDate(row.original.payment_date) : '—' }}
        </template>
        <template #payment_method-cell="{ row }">
          <UBadge
            v-if="row.original.payment_method"
            color="neutral"
            variant="soft"
            :icon="PaymentMethodIconMap[row.original.payment_method]"
            :label="row.original.payment_method_title ?? ''"
          />
        </template>
        <template #actions-cell="{ row }">
          <TablesComponentsRowActions
            :edit="false"
            download
            @view="navigateTo(`/invoice/${row.original.id}`)"
            @download="navigateTo(`/invoice/${row.original.id}?print=1`)"
            @remove="deleteTarget = row.original"
          />
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-2 px-4 py-3 border-t border-default">
        <p class="text-xs text-muted">
          {{ t('invoice.list.total', { count: total }, total) }}
        </p>
        <UPagination
          v-model:page="page"
          :items-per-page="PER_PAGE"
          :total="total"
          size="sm"
        />
      </div>
    </UCard>

    <InvoicesPaymentModal
      v-model:open="paymentOpen"
      :invoice="paymentInvoice"
      :status="paymentStatus"
      @saved="onPaymentSaved"
    />

    <InvoicesImportInvoiceModal v-model:open="importOpen" />

    <TablesComponentsDeleteConfirmModal
      v-model:open="deleteOpen"
      :label="deleteTarget?.number_invoice ?? ''"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

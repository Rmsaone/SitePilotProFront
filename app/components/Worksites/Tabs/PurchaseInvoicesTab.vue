<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import { formatEuros, formatMoney, sumMoney } from '~/components/Tables/utils/moneyUtils';
import type { PurchaseInvoice } from '~/components/Invoices/Types/invoice.interface';

export type PurchaseInvoiceKind = 'suppliers' | 'subcontractors' | 'others';

const props = defineProps<{
  worksiteId: number;
  kind: PurchaseInvoiceKind;
}>();

const emit = defineEmits<{
  changed: [];
}>();

const ENDPOINTS: Record<PurchaseInvoiceKind, string> = {
  suppliers: '/api/v1/invoice_suppliers',
  subcontractors: '/api/v1/invoice_subcontractors',
  others: '/api/v1/invoice_others'
};

const { t } = useI18n();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();
const { download } = useAttachmentDownload();

const endpoint = computed(() => ENDPOINTS[props.kind]);
const search = ref('');

const { data, status, refresh } = useApi<Paginated<PurchaseInvoice>>(endpoint, {
  query: { worksite_id: props.worksiteId, per_page: 100 }
});

const rows = computed(() => (data.value?.data ?? []).filter((invoice) => {
  const term = search.value.trim().toLowerCase();

  return !term
    || invoice.invoice_description.toLowerCase().includes(term)
    || invoice.number_invoice.toLowerCase().includes(term);
}));

const columns = computed<TableColumn<PurchaseInvoice>[]>(() => [
  { id: 'delivery_date', header: 'Date', meta: { class: { td: 'text-xs text-muted whitespace-nowrap' } } },
  { accessorKey: 'number_invoice', header: 'N° Facture', meta: { class: { td: 'font-mono font-medium text-info' } } },
  { accessorKey: 'invoice_description', header: t(`worksite.tabs.${props.kind}.party`), meta: { class: { td: 'font-medium text-highlighted whitespace-normal' } } },
  { id: 'purchase_price', header: 'Prix d\'achat', footer: '', meta: { class: { th: 'text-right', td: 'text-right font-semibold text-toned whitespace-nowrap' } } },
  { id: 'cost_price', header: 'Prix de revient', meta: { class: { th: 'text-right', td: 'text-right font-semibold text-toned whitespace-nowrap' } } },
  { id: 'attachment', header: '', meta: { class: { th: 'w-10', td: 'w-10' } } },
  { id: 'actions', header: 'Actions' }
]);

const formOpen = ref(false);
const edited = ref<PurchaseInvoice | null>(null);

function openForm(invoice: PurchaseInvoice | null): void {
  edited.value = invoice;
  formOpen.value = true;
}

async function onSaved(): Promise<void> {
  formOpen.value = false;
  toast.add({ title: t('worksite.tabs.saved'), color: 'success', icon: 'i-lucide-circle-check' });
  emit('changed');
  await refresh();
}

const deleteTarget = ref<PurchaseInvoice | null>(null);
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
    await client(`${endpoint.value}/${deleteTarget.value.id}`, { method: 'delete' });
    deleteTarget.value = null;
    emit('changed');
    await refresh();
  } catch (error) {
    handle(error);
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <WorksitesTabsTabShell
    v-model:search="search"
    :search-placeholder="t(`worksite.tabs.${kind}.search`)"
    :count="rows.length"
    :count-label="t('worksite.tabs.invoiceCount')"
    :add-label="t('worksite.tabs.addInvoice')"
    @add="openForm(null)"
  >
    <UTable
      :data="rows"
      :columns="columns"
      :loading="status === 'pending'"
      :empty="t('worksite.tabs.invoiceEmpty')"
      :ui="{ th: 'text-[11px] uppercase tracking-[0.05em] text-muted', td: 'text-[13px]', tfoot: 'bg-info/5' }"
    >
      <template #delivery_date-cell="{ row }">
        {{ formatDate(row.original.delivery_date) }}
      </template>
      <template #number_invoice-cell="{ row }">
        {{ row.original.number_invoice || '—' }}
      </template>
      <template #purchase_price-cell="{ row }">
        {{ formatMoney(row.original.purchase_price) }}
      </template>
      <template #cost_price-cell="{ row }">
        {{ formatMoney(row.original.cost_price) }}
      </template>
      <template #attachment-cell="{ row }">
        <UTooltip
          v-if="row.original.has_attachment"
          :text="row.original.attachment_name ?? ''"
        >
          <UButton
            icon="i-lucide-paperclip"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="t('worksite.tabs.downloadAttachment')"
            @click.stop="download(`${endpoint}/${row.original.id}/attachment`, row.original.attachment_name ?? 'facture')"
          />
        </UTooltip>
      </template>
      <template #actions-cell="{ row }">
        <TablesComponentsRowActions
          :view="false"
          @edit="openForm(row.original)"
          @remove="deleteTarget = row.original"
        />
      </template>
      <template #invoice_description-footer>
        <span class="font-bold text-primary-700 dark:text-primary-300">{{ t('worksite.summary.total') }}</span>
      </template>
      <template #purchase_price-footer>
        <span class="block text-right font-bold text-primary-700 dark:text-primary-300">
          {{ formatEuros(sumMoney(rows, row => row.purchase_price)) }}
        </span>
      </template>
      <template #cost_price-footer>
        <span class="block text-right font-bold text-primary-700 dark:text-primary-300">
          {{ formatEuros(sumMoney(rows, row => row.cost_price)) }}
        </span>
      </template>
    </UTable>
  </WorksitesTabsTabShell>

  <WorksitesTabsPurchaseInvoiceFormModal
    v-model:open="formOpen"
    :kind="kind"
    :endpoint="endpoint"
    :worksite-id="worksiteId"
    :invoice="edited"
    @saved="onSaved"
  />

  <TablesComponentsDeleteConfirmModal
    v-model:open="deleteOpen"
    :label="deleteTarget?.invoice_description ?? ''"
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>

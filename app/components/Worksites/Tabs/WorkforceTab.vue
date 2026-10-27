<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { formatEuros, formatMoney, sumMoney, toEuros } from '~/components/Tables/utils/moneyUtils';
import type { WorkforceEntry } from '~/components/Invoices/Types/invoice.interface';

const props = defineProps<{
  worksiteId: number;
}>();

const emit = defineEmits<{
  changed: [];
}>();

const { t } = useI18n();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();
const search = ref('');

const { data, status, refresh } = useApi<Paginated<WorkforceEntry>>('/api/v1/workforces', {
  query: { worksite_id: props.worksiteId, per_page: 100 }
});

const rows = computed(() => (data.value?.data ?? []).filter((entry) => {
  const term = search.value.trim().toLowerCase();

  return !term || entry.worker.toLowerCase().includes(term) || entry.code.toLowerCase().includes(term);
}));

const totalHours = computed(() => rows.value.reduce((total, row) => total + Number(row.hr_working), 0));
const averageRate = computed(() => totalHours.value > 0
  ? sumMoney(rows.value, row => row.cost_hr_working) / totalHours.value
  : 0);

const hours = (value: number) => Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const columns: TableColumn<WorkforceEntry>[] = [
  { accessorKey: 'code', header: 'Code', meta: { class: { td: 'font-mono text-xs font-semibold text-toned' } } },
  { accessorKey: 'worker', header: 'Nom', meta: { class: { td: 'font-medium text-highlighted' } } },
  { id: 'hr_working', header: 'Hr Trav', meta: { class: { th: 'text-right', td: 'text-right text-xs text-toned' } } },
  { id: 'hr_rate', header: 'Taux/Hr', meta: { class: { th: 'text-right', td: 'text-right text-xs text-toned whitespace-nowrap' } } },
  { id: 'cost_hr_working', header: 'Coût Hr Trav', meta: { class: { th: 'text-right', td: 'text-right text-xs font-semibold text-toned whitespace-nowrap' } } },
  { id: 'additional_costs', header: 'Coûts annexes', meta: { class: { th: 'text-right', td: 'text-right text-xs text-muted whitespace-nowrap' } } },
  { id: 'total_gross_cost', header: 'Coût brut', footer: '', meta: { class: { th: 'text-right', td: 'text-right font-bold text-highlighted whitespace-nowrap' } } },
  { id: 'actions', header: 'Actions' }
];

const formOpen = ref(false);
const edited = ref<WorkforceEntry | null>(null);

function openForm(entry: WorkforceEntry | null): void {
  edited.value = entry;
  formOpen.value = true;
}

async function onSaved(): Promise<void> {
  formOpen.value = false;
  toast.add({ title: t('worksite.tabs.saved'), color: 'success', icon: 'i-lucide-circle-check' });
  emit('changed');
  await refresh();
}

const deleteTarget = ref<WorkforceEntry | null>(null);
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
    await client(`/api/v1/workforces/${deleteTarget.value.id}`, { method: 'delete' });
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
    :search-placeholder="t('worksite.tabs.workforce.search')"
    :count="rows.length"
    :count-label="t('worksite.tabs.workforce.count')"
    :add-label="t('worksite.tabs.workforce.add')"
    @add="openForm(null)"
  >
    <UTable
      :data="rows"
      :columns="columns"
      :loading="status === 'pending'"
      :empty="t('worksite.tabs.workforce.empty')"
      :ui="{ th: 'text-[11px] uppercase tracking-[0.05em] text-muted', td: 'text-[13px]', tfoot: 'bg-info/5' }"
    >
      <template #hr_working-cell="{ row }">
        {{ hours(row.original.hr_working) }}
      </template>
      <template #hr_rate-cell="{ row }">
        {{ formatMoney(row.original.hr_rate) }}
      </template>
      <template #cost_hr_working-cell="{ row }">
        {{ formatMoney(row.original.cost_hr_working) }}
      </template>
      <template #additional_costs-cell="{ row }">
        {{ toEuros(row.original.additional_costs) > 0 ? formatMoney(row.original.additional_costs) : '—' }}
      </template>
      <template #total_gross_cost-cell="{ row }">
        {{ formatMoney(row.original.total_gross_cost) }}
      </template>
      <template #actions-cell="{ row }">
        <TablesComponentsRowActions
          :view="false"
          @edit="openForm(row.original)"
          @remove="deleteTarget = row.original"
        />
      </template>
      <template #code-footer>
        <span class="font-bold text-primary-700 dark:text-primary-300">{{ t('worksite.summary.total') }}</span>
      </template>
      <template #hr_working-footer>
        <span class="block text-right text-xs font-bold text-primary-700 dark:text-primary-300">{{ hours(totalHours) }}</span>
      </template>
      <template #hr_rate-footer>
        <span class="block text-right text-xs font-bold text-primary-700 dark:text-primary-300">{{ formatEuros(averageRate) }}</span>
      </template>
      <template #cost_hr_working-footer>
        <span class="block text-right text-xs font-bold text-primary-700 dark:text-primary-300">{{ formatEuros(sumMoney(rows, row => row.cost_hr_working)) }}</span>
      </template>
      <template #total_gross_cost-footer>
        <span class="block text-right font-bold text-primary-700 dark:text-primary-300">{{ formatEuros(sumMoney(rows, row => row.total_gross_cost)) }}</span>
      </template>
    </UTable>
  </WorksitesTabsTabShell>

  <WorksitesTabsWorkforceFormModal
    v-model:open="formOpen"
    :worksite-id="worksiteId"
    :entry="edited"
    @saved="onSaved"
  />

  <TablesComponentsDeleteConfirmModal
    v-model:open="deleteOpen"
    :label="deleteTarget?.worker ?? ''"
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { upperFirst } from 'scule';
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { useTableColumns } from '~/components/Tables/Composables/useTableColumns';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import {
  type WorksiteInterface,
  worksiteClientName,
  worksitePlace
} from '~/components/Worksites/Types/worksite.interface';
import {
  WorksiteStatusColorMap,
  WorksiteStatusEnum,
  WorksiteStatusEnumMap
} from '~/components/Worksites/Types/worksiteStatusEnum';
import WorksiteFilters from '~/components/Worksites/WorksiteFilters.vue';

type SortColumn = 'start_date' | 'end_date';

const PER_PAGE = 10;

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();
const { worksiteColumns } = useTableColumns();

const table = useTemplateRef('table');
const page = ref(1);
const search = ref('');
const debouncedSearch = ref('');
const selectedStatus = ref<WorksiteStatusEnum | 'all'>(
  Object.values(WorksiteStatusEnum).includes(route.query.status as WorksiteStatusEnum)
    ? route.query.status as WorksiteStatusEnum
    : 'all'
);
const sort = ref<{ column: SortColumn; direction: 'asc' | 'desc' } | null>(null);
const expanded = ref<Record<string, boolean>>({});

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value.trim();
  }, 300);
});
watch([debouncedSearch, selectedStatus, sort], () => {
  page.value = 1;
});

const query = computed(() => ({
  page: page.value,
  per_page: PER_PAGE,
  search: debouncedSearch.value || undefined,
  worksite_status: selectedStatus.value === 'all' ? undefined : selectedStatus.value,
  sort: sort.value?.column,
  direction: sort.value?.direction
}));

const { data, status, refresh } = useApi<Paginated<WorksiteInterface>>('/api/v1/worksites', {
  query
});

const worksites = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.meta.total ?? 0);

function toggleSort(column: SortColumn): void {
  if (sort.value?.column !== column) {
    sort.value = { column, direction: 'asc' };
  } else if (sort.value.direction === 'asc') {
    sort.value = { column, direction: 'desc' };
  } else {
    sort.value = null;
  }
}

function sortIcon(column: SortColumn): string {
  if (sort.value?.column !== column) {
    return 'i-lucide-arrow-up-down';
  }

  return sort.value.direction === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow';
}

const statuses = Object.values(WorksiteStatusEnum);
const statusLabel = (value: WorksiteStatusEnum) => WorksiteStatusEnumMap.get(value) ?? value;
const statusColor = (value: WorksiteStatusEnum) => WorksiteStatusColorMap[value] ?? 'neutral';

async function updateStatus(worksite: WorksiteInterface, worksiteStatus: WorksiteStatusEnum): Promise<void> {
  const previous = worksite.worksite_status;
  worksite.worksite_status = worksiteStatus;

  try {
    await client(`/api/v1/worksites/${worksite.id}/status`, {
      method: 'patch',
      body: { worksite_status: worksiteStatus }
    });
  } catch (error) {
    worksite.worksite_status = previous;
    handle(error);
  }
}

// Create / edit
const formOpen = ref(false);
const editedId = ref<number | null>(null);

function openCreate(): void {
  editedId.value = null;
  formOpen.value = true;
}

function openEdit(worksite: WorksiteInterface): void {
  editedId.value = worksite.id;
  formOpen.value = true;
}

async function onSaved(worksiteId: number, created: boolean): Promise<void> {
  formOpen.value = false;
  toast.add({
    title: created ? t('worksite.form.created') : t('worksite.form.updated'),
    color: 'success',
    icon: 'i-lucide-circle-check'
  });

  if (created) {
    await navigateTo(`/worksite/${worksiteId}`);

    return;
  }

  await refresh();
}

// Delete
const deleteTarget = ref<WorksiteInterface | null>(null);
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
    await client(`/api/v1/worksites/${deleteTarget.value.id}`, { method: 'delete' });
    deleteTarget.value = null;
    toast.add({ title: t('worksite.list.deleted'), color: 'success', icon: 'i-lucide-circle-check' });
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
      <WorksiteFilters
        v-model:search="search"
        v-model:selected-status="selectedStatus"
      />
      <div class="flex gap-2">
        <UDropdownMenu
          :items="table?.tableApi?.getAllColumns().filter(column => column.getCanHide()).map(column => ({
            label: typeof column.columnDef.header === 'string'
              ? column.columnDef.header
              : upperFirst(column.id),
            type: 'checkbox' as const,
            checked: column.getIsVisible(),
            onUpdateChecked(checked: boolean) {
              table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
            },
            onSelect(e: Event) {
              e.preventDefault()
            }
          }))"
          :content="{ align: 'end' }"
        >
          <UButton
            :label="t('worksite.list.display')"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
          />
        </UDropdownMenu>
        <UButton
          icon="i-lucide-plus"
          color="secondary"
          :label="t('worksite.add')"
          @click="openCreate"
        />
      </div>
    </div>

    <UCard :ui="{ root: 'rounded-xl overflow-hidden', body: 'p-0 sm:p-0' }">
      <UTable
        ref="table"
        v-model:expanded="expanded"
        :data="worksites"
        :columns="worksiteColumns"
        :loading="status === 'pending'"
        :empty="t('worksite.list.noData')"
        :get-row-id="row => String(row.id)"
        class="flex-1"
        :ui="{ th: 'text-xs font-semibold text-toned', td: 'text-[13px]', tr: 'data-[expanded=true]:bg-info/5' }"
      >
        <template #expand-cell="{ row }">
          <UButton
            color="neutral"
            variant="outline"
            size="xs"
            square
            :icon="row.getIsExpanded() ? 'i-lucide-x' : 'i-lucide-plus'"
            :aria-label="t('worksite.list.details')"
            @click="row.toggleExpanded()"
          />
        </template>

        <template #name_worksite-cell="{ row }">
          <NuxtLink
            :to="`/worksite/${row.original.id}`"
            class="hover:text-info transition-colors"
          >
            {{ row.original.name_worksite }}
          </NuxtLink>
        </template>

        <template #client-cell="{ row }">
          {{ worksiteClientName(row.original.client) }}
        </template>

        <template #place-cell="{ row }">
          {{ worksitePlace(row.original) }}
        </template>

        <template #start_date-header>
          <UButton
            color="neutral"
            variant="ghost"
            class="-mx-2.5 text-xs font-semibold"
            :label="t('worksite.list.startDate')"
            :trailing-icon="sortIcon('start_date')"
            @click="toggleSort('start_date')"
          />
        </template>
        <template #start_date-cell="{ row }">
          {{ formatDate(row.original.start_date ?? undefined) }}
        </template>

        <template #end_date-header>
          <UButton
            color="neutral"
            variant="ghost"
            class="-mx-2.5 text-xs font-semibold"
            :label="t('worksite.list.endDate')"
            :trailing-icon="sortIcon('end_date')"
            @click="toggleSort('end_date')"
          />
        </template>
        <template #end_date-cell="{ row }">
          {{ formatDate(row.original.end_date ?? undefined) }}
        </template>

        <template #worksite_status-cell="{ row }">
          <TablesComponentsStatusPicker
            :status="row.original.worksite_status"
            :options="statuses"
            :label="statusLabel"
            :color="statusColor"
            @change="value => updateStatus(row.original, value)"
          />
        </template>

        <template #actions-cell="{ row }">
          <TablesComponentsRowActions
            @view="navigateTo(`/worksite/${row.original.id}`)"
            @edit="openEdit(row.original)"
            @remove="deleteTarget = row.original"
          />
        </template>

        <template #expanded="{ row }">
          <div class="flex flex-wrap items-center gap-6 text-xs text-toned">
            <span class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-map-pin"
                class="size-3 text-muted"
              />
              <span class="font-medium">{{ t('worksite.list.place') }} :</span>
              {{ worksitePlace(row.original) }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-users"
                class="size-3 text-muted"
              />
              <span class="font-medium">{{ t('worksite.list.client') }} :</span>
              {{ worksiteClientName(row.original.client) }}
            </span>
            <span
              v-if="row.original.code"
              class="flex items-center gap-1.5"
            >
              <UIcon
                name="i-lucide-hash"
                class="size-3 text-muted"
              />
              {{ row.original.code }}
            </span>
            <UButton
              :to="`/worksite/${row.original.id}`"
              variant="link"
              color="info"
              size="xs"
              class="ml-auto"
              trailing-icon="i-lucide-chevron-right"
              :label="t('worksite.list.seeDetail')"
            />
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-2 px-4 py-3 border-t border-default">
        <p class="text-xs text-muted">
          {{ t('worksite.list.total', { count: total }, total) }}
        </p>
        <UPagination
          v-model:page="page"
          :items-per-page="PER_PAGE"
          :total="total"
          size="sm"
        />
      </div>
    </UCard>

    <WorksitesWorksiteFormModal
      v-model:open="formOpen"
      :worksite-id="editedId"
      @saved="onSaved"
    />

    <TablesComponentsDeleteConfirmModal
      v-model:open="deleteOpen"
      :label="deleteTarget?.name_worksite ?? ''"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

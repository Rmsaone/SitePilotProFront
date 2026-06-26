<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table';
import { worksitesData } from '~/data/worksite';
import { useTableColumns } from '~/components/Tables/Composables/useTableColumns';
import WorksiteFilters from '~/components/Worksites/WorksiteFilters.vue';
import { upperFirst } from 'scule';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import {
  WorksiteStatusColorMap,
  type WorksiteStatusEnum,
  WorksiteStatusEnumMap,
  type BadgeColor
} from '~/components/Worksites/Types/worksiteStatusEnum';
import ActionsDropdown from '~/components/Tables/components/ActionsDropdown.vue';

const table = useTemplateRef('table');
const { worksiteColumns } = useTableColumns();
const pagination = ref({
  pageIndex: 0,
  pageSize: 5
});
const globalFilter = ref('');
const selectedStatus = ref<WorksiteStatusEnum>();

const getStatusColor = computed(() => {
  return (status: WorksiteStatusEnum): BadgeColor => {
    return WorksiteStatusColorMap[status] ?? 'neutral';
  };
});

const getStatusLabel = computed(() => {
  return (status: WorksiteStatusEnum): string => {
    return WorksiteStatusEnumMap.get(status) ?? 'Inconnu';
  };
});
</script>

<template>
  <div class="w-full space-y-4">
    <div class="flex flex-row justify-between">
      <div class="flex">
        <WorksiteFilters
          v-model:global-filter="globalFilter"
          v-model:selected-status="selectedStatus"
        />
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
          <div class="px-4 py-3.5">
            <UButton
              label="Affichage"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
              class="ml-auto"
              aria-label="Columns select dropdown"
            />
          </div>
        </UDropdownMenu>
      </div>
      <div class="flex px-4 py-3.5">
        <UButton
          icon="i-lucide-plus"
          size="md"
          color="secondary"
          variant="solid"
        >
          {{ $t('worksite.add') }}
        </UButton>
      </div>
    </div>
  </div>
  <UTable
    ref="table"
    v-model:pagination="pagination"
    v-model:global-filter="globalFilter"
    :data="worksitesData"
    :columns="worksiteColumns"
    :pagination-options="{
      getPaginationRowModel: getPaginationRowModel()
    }"
    class="flex-1"
  >
    <template #expand-cell="{ row }">
      <UButton
        color="neutral"
        variant="ghost"
        :icon="row.getIsExpanded() ? 'i-lucide-minus' : 'i-lucide-plus'"
        square
        aria-label="Expand"
        @click="row.toggleExpanded()"
      />
    </template>

    <template #client-cell="{ row }">
      {{ row.original.client?.company ?? '-' }}
    </template>

    <!-- Sortable header: start_date -->
    <template #start_date-header="{ column }">
      <UButton
        color="neutral"
        variant="ghost"
        label="Date de début"
        :icon="
          column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up-narrow-wide'
          : column.getIsSorted() === 'desc' ? 'i-lucide-arrow-down-wide-narrow'
            : 'i-lucide-arrow-up-down'
        "
        @click="column.toggleSorting(column.getIsSorted() === 'asc')"
      />
    </template>

    <template #start_date-cell="{ row }">
      {{ formatDate(row.original.start_date) }}
    </template>

    <!-- Sortable header: end_date -->
    <template #end_date-header="{ column }">
      <UButton
        color="neutral"
        variant="ghost"
        label="Date de fin"
        :icon="
          column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up-narrow-wide'
          : column.getIsSorted() === 'desc' ? 'i-lucide-arrow-down-wide-narrow'
            : 'i-lucide-arrow-up-down'
        "
        @click="column.toggleSorting(column.getIsSorted() === 'asc')"
      />
    </template>

    <template #end_date-cell="{ row }">
      {{ formatDate(row.original.end_date) }}
    </template>

    <!-- Status badge -->
    <template #worksite_status-cell="{ row }">
      <UBadge
        :color="getStatusColor(row.original.worksite_status)"
        :label="getStatusLabel(row.original.worksite_status)"
      />
    </template>

    <!-- Actions -->
    <template #actions-cell="{ row }">
      <ActionsDropdown
        :is-expanded="row.getIsExpanded()"
        @toggle-expand="row.toggleExpanded()"
      />
    </template>
    <template #expanded="{ row }">
      <pre>{{ row.original }}</pre>
    </template>
  </UTable>

  <div class="flex justify-end border-t border-default pt-4 px-4">
    <UPagination
      :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
      :items-per-page="table?.tableApi?.getState().pagination.pageSize"
      :total="table?.tableApi?.getFilteredRowModel().rows.length"
      @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
    />
  </div>
</template>

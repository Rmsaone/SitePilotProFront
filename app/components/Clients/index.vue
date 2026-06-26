<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table';
import { clientsData } from '~/data/clients';
import { useTableColumns } from '~/components/Tables/Composables/useTableColumns';
import { upperFirst } from 'scule';
import ClientFilters from '~/components/Clients/ClientFilters.vue';
import ActionsDropdown from '~/components/Tables/components/ActionsDropdown.vue';

const table = useTemplateRef('table');
const { clientColumns } = useTableColumns();
const pagination = ref({
  pageIndex: 0,
  pageSize: 5
});
const globalFilter = ref('');
</script>

<template>
  <div class="w-full space-y-4">
    <div class="flex flex-row justify-between">
      <div class="flex">
        <ClientFilters
          v-model:global-filter="globalFilter"
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
          {{ $t('client.add') }}
        </UButton>
      </div>
    </div>
  </div>
  <UTable
    ref="table"
    v-model:pagination="pagination"
    v-model:global-filter="globalFilter"
    :data="clientsData"
    :columns="clientColumns"
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
    <template #company-cell="{ row }">
      {{ row.original.company ?? '-' }}
    </template>
    <template #contact_name-cell="{ row }">
      {{ row.original.contact_name ?? '-' }}
    </template>
    <template #email-cell="{ row }">
      {{ row.original.email }}
    </template>
    <template #phone-cell="{ row }">
      {{ row.original.phone ?? '-' }}
    </template>
    <template #clientType-cell="{ row }">
      {{ row.original.clientType === 'pro' ? 'Professionnel' : 'Particulier' }}
    </template>

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

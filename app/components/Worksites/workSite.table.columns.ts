import type { TableColumn } from '@nuxt/ui';
import type { WorksiteInterface } from '~/components/Worksites/Types/worksite.interface';

export const worksiteColumns: TableColumn<WorksiteInterface>[] = [
  {
    id: 'expand',
    header: '',
    enableHiding: false,
    meta: {
      class: {
        th: 'w-12',
        td: 'w-12'
      }
    }
  }, {
    id: 'name_worksite',
    accessorKey: 'name_worksite',
    header: 'Nom du chantier',
    meta: {
      class: {
        th: 'text-left w-[26%]',
        td: 'text-left font-medium text-highlighted w-[26%] whitespace-normal'
      }
    }
  }, {
    id: 'client',
    header: 'Client',
    meta: {
      class: {
        th: 'text-left w-[18%]',
        td: 'text-left text-muted w-[18%]'
      }
    }
  }, {
    id: 'place',
    header: 'Lieu',
    meta: {
      class: {
        th: 'text-left w-[14%]',
        td: 'text-left text-muted w-[14%]'
      }
    }
  }, {
    id: 'start_date',
    accessorKey: 'start_date',
    header: 'Date de début',
    meta: { class: { th: 'w-[11%]', td: 'text-muted w-[11%]' } }
  }, {
    id: 'end_date',
    accessorKey: 'end_date',
    header: 'Date de fin',
    meta: { class: { th: 'w-[11%]', td: 'text-muted w-[11%]' } }
  }, {
    id: 'worksite_status',
    accessorKey: 'worksite_status',
    header: 'Statut',
    meta: {
      class: {
        th: 'text-left w-[10%]',
        td: 'text-left w-[10%]'
      }
    }
  }, {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    meta: {
      class: {
        th: 'text-left w-[10%]',
        td: 'text-left w-[10%]'
      }
    }
  }];

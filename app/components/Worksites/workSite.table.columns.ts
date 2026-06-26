import type { TableColumn } from '@nuxt/ui';
import type { WorksiteInterface } from '~/components/Worksites/Types/worksite.interface';

export const worksiteColumns: TableColumn<WorksiteInterface>[] = [
  {
    id: 'expand',
    header: 'Détails',
    meta: {
      class: {
        th: 'text-center w-[5%]',
        td: 'text-center font-medium w-[5%]'
      }
    }
  }, {
    accessorKey: 'name_worksite',
    header: 'Nom du chantier',
    meta: {
      class: {
        th: 'text-left w-[20%]',
        td: 'text-left font-medium w-[20%]'
      }
    }
  }, {
    id: 'client',
    accessorKey: 'client',
    header: 'Client',
    meta: {
      class: {
        th: 'text-left w-[20%]',
        td: 'text-left font-medium w-[20%]'
      }
    }
  }, {
    accessorKey: 'zip_code',
    header: 'Code postal',
    meta: {
      class: {
        th: 'text-left w-[10%]',
        td: 'text-left font-medium w-[10%]'
      }
    }
  }, {
    id: 'start_date',
    accessorKey: 'start_date',
    meta: { class: { th: 'text-center w-[10%]', td: 'text-center font-medium w-[10%]' } }
  }, {
    id: 'end_date',
    accessorKey: 'end_date',
    meta: { class: { th: 'text-center w-[10%]', td: 'text-center font-medium w-[10%]' } }
  }, {
    accessorKey: 'worksite_status',
    header: 'Statut',
    meta: {
      class: {
        th: 'text-center w-[10%]',
        td: 'text-center font-medium w-[10%]'
      }
    }
  }, {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    meta: {
      class: {
        th: 'text-center w-[10%]',
        td: 'text-center font-medium w-[10%]'
      }
    }
  }];

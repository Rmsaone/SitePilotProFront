import type { TableColumn } from '@nuxt/ui';
import type { ClientInterface } from '~/components/Clients/Types/client.interface';

export const clientColumns: TableColumn<ClientInterface>[] = [
  {
    id: 'expand',
    header: 'Détails',
    meta: {
      class: {
        th: 'text-center w-[10%]',
        td: 'text-center font-medium w-[10%]'
      }
    }
  }, {
    accessorKey: 'company',
    header: 'Société',
    meta: {
      class: {
        th: 'text-left w-[20%]',
        td: 'text-left font-medium w-[20%]'
      }
    }
  }, {
    accessorKey: 'contact_name',
    header: 'Nom du Contact',
    meta: {
      class: {
        th: 'text-left w-[15%]',
        td: 'text-left font-medium w-[15%]'
      }
    }
  }, {
    accessorKey: 'email',
    header: 'Email',
    meta: {
      class: {
        th: 'text-left w-[20%]',
        td: 'text-left font-medium w-[20%]'
      }
    }
  }, {
    accessorKey: 'phone',
    header: 'Téléphone',
    meta: {
      class: {
        th: 'text-left w-[15%]',
        td: 'text-left font-medium w-[15%]'
      }
    }
  }, {
    accessorKey: 'clientType',
    header: 'Type',
    meta: {
      class: {
        th: 'text-left w-[10%]',
        td: 'text-left font-medium w-[10%]'
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

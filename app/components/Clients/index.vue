<script setup lang="ts">
import type { Paginated } from '~/components/Tables/Types/api.interface';
import { useTableColumns } from '~/components/Tables/Composables/useTableColumns';
import {
  type ClientDetail,
  type ClientInterface,
  clientDisplayName
} from '~/components/Clients/Types/client.interface';
import { ClientTypeEnum, ClientTypeEnumMap } from '~/components/Clients/Types/clientTypeEnum';

const PER_PAGE = 10;

const { t } = useI18n();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();
const { clientColumns } = useTableColumns();

const page = ref(1);
const search = ref('');
const debouncedSearch = ref('');
const selectedType = ref<ClientTypeEnum | 'all'>('all');
const sortDirection = ref<'asc' | 'desc' | null>(null);

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value.trim();
  }, 300);
});
watch([debouncedSearch, selectedType, sortDirection], () => {
  page.value = 1;
});

const query = computed(() => ({
  page: page.value,
  per_page: PER_PAGE,
  search: debouncedSearch.value || undefined,
  client_type: selectedType.value === 'all' ? undefined : selectedType.value,
  sort: sortDirection.value ? 'city' : undefined,
  direction: sortDirection.value ?? undefined
}));

const { data, status, refresh } = useApi<Paginated<ClientInterface>>('/api/v1/clients', { query });

const clients = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.meta.total ?? 0);

const typeItems = computed(() => [
  { label: t('client.list.allTypes'), value: 'all' as const },
  ...Object.values(ClientTypeEnum).map(value => ({ label: ClientTypeEnumMap.get(value) ?? value, value }))
]);

function toggleCitySort(): void {
  sortDirection.value = sortDirection.value === null ? 'asc' : sortDirection.value === 'asc' ? 'desc' : null;
}

// Create / edit
const formOpen = ref(false);
const editedId = ref<number | null>(null);
const createdClient = ref<ClientDetail | null>(null);
const popupOpen = ref(false);
const quoteFormOpen = ref(false);

function openForm(clientId: number | null): void {
  editedId.value = clientId;
  formOpen.value = true;
}

async function onSaved(saved: ClientDetail, created: boolean): Promise<void> {
  formOpen.value = false;
  await refresh();

  if (created) {
    createdClient.value = saved;
    popupOpen.value = true;

    return;
  }

  toast.add({ title: t('client.form.updated'), color: 'success', icon: 'i-lucide-circle-check' });
}

const popupActions = computed(() => createdClient.value
  ? [
      {
        icon: 'i-lucide-file-text',
        label: t('quote.add'),
        description: t('client.popup.createQuoteHint'),
        color: 'success' as const,
        onSelect: () => {
          quoteFormOpen.value = true;
        }
      },
      {
        icon: 'i-lucide-user',
        label: t('client.popup.open'),
        description: t('client.popup.openHint'),
        color: 'info' as const,
        to: `/client/${createdClient.value.id}`
      }
    ]
  : []);

async function onQuoteSaved(quote: { id: number }): Promise<void> {
  quoteFormOpen.value = false;
  await navigateTo(`/quote/${quote.id}`);
}

// Delete
const deleteTarget = ref<ClientInterface | null>(null);
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
    await client(`/api/v1/clients/${deleteTarget.value.id}`, { method: 'delete' });
    deleteTarget.value = null;
    toast.add({ title: t('client.list.deleted'), color: 'success', icon: 'i-lucide-circle-check' });
    await refresh();
  } catch (error) {
    deleteTarget.value = null;
    handle(error, (serverErrors) => {
      toast.add({ title: serverErrors.client, color: 'error', icon: 'i-lucide-circle-alert' });
    });
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
          :placeholder="t('client.list.searchPlaceholder')"
          :aria-label="t('client.list.searchPlaceholder')"
        />
        <USelect
          v-model="selectedType"
          :items="typeItems"
          class="w-44"
          :aria-label="t('client.list.typeFilter')"
        />
      </div>
      <UButton
        icon="i-lucide-plus"
        color="secondary"
        :label="t('client.add')"
        @click="openForm(null)"
      />
    </div>

    <UCard :ui="{ root: 'rounded-xl overflow-hidden', body: 'p-0 sm:p-0' }">
      <UTable
        :data="clients"
        :columns="clientColumns"
        :loading="status === 'pending'"
        :empty="t('client.list.noData')"
        :ui="{ th: 'text-xs font-semibold text-toned', td: 'text-[13px]', tr: 'cursor-pointer' }"
        @select="(_event, row) => navigateTo(`/client/${row.original.id}`)"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-2.5">
            <UAvatar
              :text="clientDisplayName(row.original).charAt(0).toUpperCase()"
              size="sm"
              :ui="{ root: 'bg-info/10', fallback: 'text-info font-bold' }"
            />
            <span class="text-info">{{ clientDisplayName(row.original) }}</span>
          </div>
        </template>
        <template #contact_name-cell="{ row }">
          <span class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-user"
              class="size-3 text-dimmed"
            />
            {{ row.original.contact_name }}
          </span>
        </template>
        <template #email-cell="{ row }">
          <a
            :href="`mailto:${row.original.email}`"
            class="flex items-center gap-1.5 hover:text-info"
            @click.stop
          >
            <UIcon
              name="i-lucide-mail"
              class="size-3 text-dimmed"
            />
            {{ row.original.email }}
          </a>
        </template>
        <template #phone-cell="{ row }">
          <span class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-phone"
              class="size-3 text-dimmed"
            />
            {{ row.original.phone }}
          </span>
        </template>
        <template #city-header>
          <UButton
            color="neutral"
            variant="ghost"
            class="-mx-2.5 text-xs font-semibold"
            :label="t('client.list.city')"
            :trailing-icon="sortDirection === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : sortDirection === 'desc' ? 'i-lucide-arrow-down-wide-narrow' : 'i-lucide-arrow-up-down'"
            @click="toggleCitySort"
          />
        </template>
        <template #city-cell="{ row }">
          <span class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-map-pin"
              class="size-3 text-dimmed"
            />
            {{ row.original.city }}
          </span>
        </template>
        <template #worksites_count-cell="{ row }">
          <span class="inline-flex items-center justify-center size-7 rounded-full bg-info/10 text-xs font-bold text-info">
            {{ row.original.worksites_count ?? 0 }}
          </span>
        </template>
        <template #actions-cell="{ row }">
          <TablesComponentsRowActions
            @view="navigateTo(`/client/${row.original.id}`)"
            @edit="openForm(row.original.id)"
            @remove="deleteTarget = row.original"
          />
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-2 px-4 py-3 border-t border-default">
        <p class="text-xs text-muted">
          {{ t('client.list.total', { count: total }, total) }}
        </p>
        <UPagination
          v-model:page="page"
          :items-per-page="PER_PAGE"
          :total="total"
          size="sm"
        />
      </div>
    </UCard>

    <ClientsClientFormModal
      v-model:open="formOpen"
      :client-id="editedId"
      @saved="onSaved"
    />

    <FeedbackPostCreationPopup
      v-model:open="popupOpen"
      :title="t('client.popup.title')"
      :subtitle="t('client.popup.subtitle')"
      :actions="popupActions"
      :dismiss-label="t('client.popup.dismiss')"
    />

    <QuotesQuoteFormModal
      v-model:open="quoteFormOpen"
      :quote-id="null"
      :client-id="createdClient?.id"
      @saved="onQuoteSaved"
    />

    <TablesComponentsDeleteConfirmModal
      v-model:open="deleteOpen"
      :label="deleteTarget ? clientDisplayName(deleteTarget) : ''"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

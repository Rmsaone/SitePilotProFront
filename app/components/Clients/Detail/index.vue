<script setup lang="ts">
import type { Paginated, Resource } from '~/components/Tables/Types/api.interface';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';
import { type ClientDetail, clientDisplayName } from '~/components/Clients/Types/client.interface';
import type { Quote } from '~/components/Quotes/Types/quote.interface';
import { QuoteStatusColorMap, type QuoteStatusEnum } from '~/components/Quotes/Types/quoteStatusEnum';
import type { WorksiteInterface } from '~/components/Worksites/Types/worksite.interface';
import { WorksiteStatusColorMap, WorksiteStatusEnumMap } from '~/components/Worksites/Types/worksiteStatusEnum';

const props = defineProps<{
  clientId: number;
}>();

const { t } = useI18n();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();

const { data, error, refresh } = useApi<Resource<ClientDetail>>(() => `/api/v1/clients/${props.clientId}`);
const { data: worksiteData, refresh: refreshWorksites } = useApi<Paginated<WorksiteInterface>>('/api/v1/worksites', {
  query: () => ({ client_id: props.clientId, per_page: 100 })
});
const { data: quoteData, refresh: refreshQuotes } = useApi<Paginated<Quote>>('/api/v1/quotes', {
  query: () => ({ client_id: props.clientId, per_page: 100 })
});

const detail = computed(() => data.value?.data ?? null);
const worksites = computed(() => worksiteData.value?.data ?? []);
const quotes = computed(() => quoteData.value?.data ?? []);

useHead({
  title: computed(() => detail.value ? clientDisplayName(detail.value) : t('client.detail.title'))
});

const kpis = computed(() => [
  { label: t('client.detail.worksites'), value: detail.value?.worksites_count ?? 0, class: 'text-secondary' },
  { label: t('client.detail.quotes'), value: detail.value?.quotes_count ?? 0, class: 'text-success' },
  { label: t('client.detail.invoices'), value: detail.value?.invoices_count ?? 0, class: 'text-primary-700 dark:text-primary-300' }
]);

const contactRows = computed(() => detail.value
  ? [
      { label: t('client.form.contactName'), value: detail.value.contact_name, icon: 'i-lucide-user' },
      { label: t('client.form.email'), value: detail.value.email, icon: 'i-lucide-mail' },
      { label: t('client.form.phone'), value: detail.value.phone, icon: 'i-lucide-phone' },
      { label: t('client.form.address'), value: `${detail.value.street}, ${detail.value.zip_code} ${detail.value.city}`, icon: 'i-lucide-map-pin' },
      ...(detail.value.siret ? [{ label: t('client.form.siret'), value: detail.value.siret, icon: 'i-lucide-building' }] : []),
      ...(detail.value.tva_intra ? [{ label: t('client.form.tvaIntra'), value: detail.value.tva_intra, icon: 'i-lucide-receipt' }] : []),
      ...(detail.value.responsible ? [{ label: t('client.form.responsible'), value: detail.value.responsible.full_name, icon: 'i-lucide-hard-hat' }] : [])
    ]
  : []);

const formOpen = ref(false);
const quoteFormOpen = ref(false);
const worksiteFormOpen = ref(false);

async function onSaved(): Promise<void> {
  formOpen.value = false;
  toast.add({ title: t('client.form.updated'), color: 'success', icon: 'i-lucide-circle-check' });
  await refresh();
}

async function onQuoteSaved(quote: { id: number }): Promise<void> {
  quoteFormOpen.value = false;
  await navigateTo(`/quote/${quote.id}`);
}

async function onWorksiteSaved(worksiteId: number): Promise<void> {
  worksiteFormOpen.value = false;
  await navigateTo(`/worksite/${worksiteId}`);
}

const deleteOpen = ref(false);
const deleting = ref(false);

async function confirmDelete(): Promise<void> {
  deleting.value = true;

  try {
    await client(`/api/v1/clients/${props.clientId}`, { method: 'delete' });
    toast.add({ title: t('client.list.deleted'), color: 'success', icon: 'i-lucide-circle-check' });
    await navigateTo('/client');
  } catch (err) {
    deleteOpen.value = false;
    handle(err, (serverErrors) => {
      toast.add({ title: serverErrors.client, color: 'error', icon: 'i-lucide-circle-alert' });
    });
  } finally {
    deleting.value = false;
  }
}

watch(() => props.clientId, () => {
  refreshWorksites();
  refreshQuotes();
});
</script>

<template>
  <div class="-m-4 sm:-m-6 min-h-full bg-muted">
    <div
      v-if="error"
      class="p-6"
    >
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="t('client.detail.notFound')"
      >
        <template #actions>
          <UButton
            to="/client"
            color="error"
            variant="outline"
            :label="t('client.detail.back')"
          />
        </template>
      </UAlert>
    </div>

    <template v-else>
      <div class="bg-default border-b border-default px-4 md:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sticky top-0 z-10">
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            to="/client"
            variant="link"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-left"
            class="px-0 text-muted"
            :label="t('client.detail.back')"
          />
          <span class="w-px h-4 bg-(--ui-border)" />
          <span
            v-if="detail"
            class="text-[13px] font-semibold text-toned"
          >{{ clientDisplayName(detail) }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-pencil"
            :disabled="!detail"
            :label="t('base.btn.update')"
            @click="formOpen = true"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :disabled="!detail"
            :aria-label="t('base.btn.delete')"
            @click="deleteOpen = true"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-file-text"
            :ui="{ leadingIcon: 'text-success' }"
            :disabled="!detail"
            :label="t('quote.add')"
            @click="quoteFormOpen = true"
          />
          <UButton
            color="secondary"
            icon="i-lucide-building-2"
            :disabled="!detail"
            :label="t('client.detail.createWorksite')"
            @click="worksiteFormOpen = true"
          />
        </div>
      </div>

      <div class="max-w-225 mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">
        <USkeleton
          v-if="!detail"
          class="h-40 rounded-2xl"
        />

        <template v-else>
          <UCard :ui="{ root: 'rounded-2xl overflow-hidden', body: 'p-0 sm:p-0' }">
            <div class="h-2 bg-linear-to-r from-primary-700 to-secondary" />
            <div class="px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center gap-6">
              <div class="size-20 rounded-2xl bg-linear-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-[0_4px_16px_rgba(30,58,95,0.25)] shrink-0">
                <span class="text-[28px] font-extrabold text-white">{{ clientDisplayName(detail).charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-3 mb-1">
                  <h2 class="text-[22px] font-extrabold text-highlighted">
                    {{ clientDisplayName(detail) }}
                  </h2>
                  <UBadge
                    color="info"
                    variant="subtle"
                    :label="detail.client_type_title"
                  />
                </div>
                <p class="text-sm text-muted">
                  {{ detail.contact_name }}<template v-if="detail.private_name">
                    · {{ detail.private_name }}
                  </template>
                </p>
                <div class="flex flex-wrap items-center gap-4 mt-3 text-xs">
                  <a
                    :href="`mailto:${detail.email}`"
                    class="flex items-center gap-1.5 text-info hover:underline"
                  >
                    <UIcon
                      name="i-lucide-mail"
                      class="size-3.5"
                    />
                    {{ detail.email }}
                  </a>
                  <span class="flex items-center gap-1.5 text-muted">
                    <UIcon
                      name="i-lucide-phone"
                      class="size-3.5"
                    />
                    {{ detail.phone }}
                  </span>
                  <span class="flex items-center gap-1.5 text-muted">
                    <UIcon
                      name="i-lucide-map-pin"
                      class="size-3.5"
                    />
                    {{ detail.city }}
                  </span>
                </div>
              </div>
              <div class="flex gap-3 shrink-0">
                <div
                  v-for="kpi in kpis"
                  :key="kpi.label"
                  class="flex flex-col items-center px-5 py-3 rounded-xl bg-elevated/50 border border-default"
                >
                  <span
                    class="text-[26px] font-extrabold"
                    :class="kpi.class"
                  >{{ kpi.value }}</span>
                  <span class="text-[11px] text-dimmed font-medium mt-0.5">{{ kpi.label }}</span>
                </div>
              </div>
            </div>
          </UCard>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AccountCard
              :title="t('client.detail.contactInfo')"
              icon="i-lucide-user"
            >
              <div class="flex flex-col gap-3 -my-1">
                <div
                  v-for="row in contactRows"
                  :key="row.label"
                  class="flex items-start gap-3"
                >
                  <span class="size-7 rounded-md bg-elevated flex items-center justify-center shrink-0 mt-0.5">
                    <UIcon
                      :name="row.icon"
                      class="size-3.5 text-dimmed"
                    />
                  </span>
                  <div class="min-w-0">
                    <p class="text-[10px] font-semibold text-dimmed uppercase tracking-[0.07em]">
                      {{ row.label }}
                    </p>
                    <p class="text-[13px] text-toned mt-0.5 font-medium break-words">
                      {{ row.value }}
                    </p>
                  </div>
                </div>
              </div>
            </AccountCard>

            <AccountCard
              :title="t('client.detail.linkedWorksites')"
              icon="i-lucide-building-2"
            >
              <template #actions>
                <span class="text-[11px] font-semibold text-dimmed">{{ t('client.detail.worksiteCount', { count: worksites.length }, worksites.length) }}</span>
              </template>
              <div class="flex flex-col max-h-55 overflow-y-auto -my-2">
                <p
                  v-if="!worksites.length"
                  class="text-xs text-dimmed py-4 text-center"
                >
                  {{ t('client.detail.noWorksite') }}
                </p>
                <NuxtLink
                  v-for="worksite in worksites"
                  :key="worksite.id"
                  :to="`/worksite/${worksite.id}`"
                  class="flex items-center justify-between gap-3 py-2 border-b border-default last:border-0 hover:bg-elevated/40 rounded"
                >
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-toned leading-tight truncate">
                      {{ worksite.name_worksite }}
                    </p>
                    <p class="text-[11px] text-dimmed mt-0.5">
                      {{ formatDate(worksite.start_date ?? undefined) }} — {{ formatDate(worksite.end_date ?? undefined) }}
                    </p>
                  </div>
                  <UBadge
                    :color="WorksiteStatusColorMap[worksite.worksite_status]"
                    variant="subtle"
                    :label="WorksiteStatusEnumMap.get(worksite.worksite_status)"
                  />
                </NuxtLink>
              </div>
            </AccountCard>
          </div>

          <UCard :ui="{ root: 'rounded-[14px] overflow-hidden', header: 'px-6 py-3.5 sm:px-6', body: 'p-0 sm:p-0' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="flex items-center gap-2 text-[13px] font-bold text-highlighted">
                  <UIcon
                    name="i-lucide-file-text"
                    class="size-3.5 text-success"
                  />
                  {{ t('client.detail.quotes') }}
                </h3>
                <span class="text-[11px] font-semibold text-dimmed">{{ t('client.detail.quoteCount', { count: quotes.length }, quotes.length) }}</span>
              </div>
            </template>
            <p
              v-if="!quotes.length"
              class="px-6 py-8 text-center text-xs text-dimmed"
            >
              {{ t('client.detail.noQuote') }}
            </p>
            <div
              v-else
              class="overflow-x-auto"
            >
              <table class="w-full min-w-140">
                <thead>
                  <tr class="bg-elevated/40 border-b border-default">
                    <th
                      v-for="header in [t('quote.columns.number'), t('quote.columns.issueDate'), t('quote.columns.amount'), t('quote.columns.tva'), t('quote.columns.status'), '']"
                      :key="header"
                      scope="col"
                      class="px-5 py-2.5 text-left text-[10px] font-bold text-dimmed uppercase tracking-[0.07em]"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="quote in quotes"
                    :key="quote.id"
                    class="border-b border-default last:border-0 hover:bg-elevated/40"
                  >
                    <td class="px-5 py-3 text-xs font-mono font-semibold text-info">
                      {{ quote.quote_number }}
                    </td>
                    <td class="px-5 py-3 text-xs text-muted">
                      {{ formatDate(quote.issue_date) }}
                    </td>
                    <td class="px-5 py-3 text-[13px] font-semibold text-highlighted whitespace-nowrap">
                      {{ formatMoney(quote.subtotal_ht) }}
                    </td>
                    <td class="px-5 py-3">
                      <UBadge
                        color="neutral"
                        variant="soft"
                        :label="`${quote.tva_rate_numeric.toLocaleString('fr-FR')} %`"
                      />
                    </td>
                    <td class="px-5 py-3">
                      <UBadge
                        :color="QuoteStatusColorMap[quote.quote_status as QuoteStatusEnum]"
                        variant="subtle"
                        :label="quote.quote_status_title"
                      />
                    </td>
                    <td class="px-5 py-3">
                      <UButton
                        :to="`/quote/${quote.id}`"
                        variant="link"
                        color="info"
                        size="xs"
                        trailing-icon="i-lucide-chevron-right"
                        :label="t('client.detail.see')"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </template>
      </div>
    </template>

    <ClientsClientFormModal
      v-model:open="formOpen"
      :client-id="clientId"
      @saved="onSaved"
    />

    <QuotesQuoteFormModal
      v-model:open="quoteFormOpen"
      :quote-id="null"
      :client-id="clientId"
      @saved="onQuoteSaved"
    />

    <WorksitesWorksiteFormModal
      v-model:open="worksiteFormOpen"
      :worksite-id="null"
      :client-id="clientId"
      @saved="onWorksiteSaved"
    />

    <TablesComponentsDeleteConfirmModal
      v-model:open="deleteOpen"
      :label="detail ? clientDisplayName(detail) : ''"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

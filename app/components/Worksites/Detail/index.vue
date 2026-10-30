<script setup lang="ts">
import type { Resource } from '~/components/Tables/Types/api.interface';
import type { WorksiteDetail } from '~/components/Worksites/Types/worksite.interface';
import { worksiteClientName, worksitePlace } from '~/components/Worksites/Types/worksite.interface';
import {
  WorksiteStatusColorMap,
  WorksiteStatusEnum,
  WorksiteStatusEnumMap
} from '~/components/Worksites/Types/worksiteStatusEnum';

type DetailTab = 'summary' | 'quotes' | 'client-invoices' | 'suppliers' | 'subcontractors' | 'others' | 'workforce';

const DETAIL_TABS: DetailTab[] = ['summary', 'quotes', 'client-invoices', 'suppliers', 'subcontractors', 'others', 'workforce'];

const props = defineProps<{
  worksiteId: number;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();

const { data, error, refresh } = useApi<Resource<WorksiteDetail>>(
  () => `/api/v1/worksites/${props.worksiteId}`
);

const worksite = computed(() => data.value?.data ?? null);

useHead({
  title: computed(() => worksite.value?.name_worksite ?? t('worksite.detail.title'))
});

const tab = computed<DetailTab>({
  get: () => DETAIL_TABS.includes(route.query.tab as DetailTab) ? route.query.tab as DetailTab : 'summary',
  set: value => router.replace({ query: { ...route.query, tab: value } })
});

const tabs = computed(() => DETAIL_TABS.map(value => ({
  value,
  label: t(`worksite.detail.tabs.${value}`)
})));

const isFinished = computed(() => worksite.value?.worksite_status === WorksiteStatusEnum.Finished);
const closing = ref(false);
const summaryKey = ref(0);

async function closeWorksite(): Promise<void> {
  closing.value = true;

  try {
    await client(`/api/v1/worksites/${props.worksiteId}/status`, {
      method: 'patch',
      body: { worksite_status: WorksiteStatusEnum.Finished }
    });
    await refresh();
    toast.add({ title: t('worksite.detail.closed'), color: 'success', icon: 'i-lucide-circle-check' });
  } catch (err) {
    handle(err);
  } finally {
    closing.value = false;
  }
}

const formOpen = ref(false);

async function onSaved(): Promise<void> {
  formOpen.value = false;
  toast.add({ title: t('worksite.form.updated'), color: 'success', icon: 'i-lucide-circle-check' });
  await refresh();
}

function onDataChanged(): void {
  // Purchase invoices and workforce change the summary amounts.
  summaryKey.value++;
}
</script>

<template>
  <div class="-m-4 sm:-m-6 min-h-full bg-muted flex flex-col">
    <div
      v-if="error"
      class="p-6"
    >
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="t('worksite.detail.notFound')"
      >
        <template #actions>
          <UButton
            to="/worksite"
            color="error"
            variant="outline"
            :label="t('worksite.detail.back')"
          />
        </template>
      </UAlert>
    </div>

    <template v-else>
      <div class="bg-default border-b border-default px-4 md:px-6 pt-4 md:pt-5">
        <UButton
          to="/worksite"
          variant="link"
          color="neutral"
          size="sm"
          icon="i-lucide-chevron-left"
          class="px-0 mb-3 text-muted"
          :label="t('worksite.detail.back')"
        />

        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <USkeleton
                v-if="!worksite"
                class="h-7 w-80"
              />
              <template v-else>
                <h2 class="text-lg md:text-[22px] font-bold text-highlighted leading-snug">
                  {{ worksite.name_worksite }}
                </h2>
                <UBadge
                  :color="WorksiteStatusColorMap[worksite.worksite_status]"
                  variant="subtle"
                  class="font-semibold"
                  :label="WorksiteStatusEnumMap.get(worksite.worksite_status)"
                />
              </template>
            </div>
            <p
              v-if="worksite"
              class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted"
            >
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-users"
                  class="size-3"
                />
                {{ worksiteClientName(worksite.client) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-map-pin"
                  class="size-3"
                />
                {{ worksitePlace(worksite) }}
              </span>
              <span
                v-if="worksite.responsible"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-hard-hat"
                  class="size-3"
                />
                {{ worksite.responsible.full_name }}
              </span>
            </p>
          </div>

          <div class="flex gap-2 self-start md:self-auto">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-pencil"
              :disabled="!worksite"
              :label="t('base.btn.update')"
              @click="formOpen = true"
            />
            <UButton
              color="neutral"
              variant="outline"
              :disabled="!worksite || isFinished"
              :loading="closing"
              :label="t('worksite.detail.close')"
              @click="closeWorksite"
            />
          </div>
        </div>

        <UTabs
          v-model="tab"
          :items="tabs"
          :content="false"
          variant="link"
          color="secondary"
          :ui="{ root: '-mb-px', list: 'border-b-0 overflow-x-auto', trigger: 'px-3 md:px-4 py-3 text-xs md:text-[13px] whitespace-nowrap' }"
        />
      </div>

      <div class="flex-1 p-4 md:p-6">
        <WorksitesTabsSummaryTab
          v-if="tab === 'summary'"
          :key="summaryKey"
          :worksite-id="worksiteId"
          @navigate="value => tab = value"
        />
        <WorksitesTabsQuotesTab
          v-else-if="tab === 'quotes'"
          :worksite-id="worksiteId"
          :client-id="worksite?.client?.id"
          @changed="onDataChanged"
        />
        <WorksitesTabsClientInvoicesTab
          v-else-if="tab === 'client-invoices'"
          :worksite-id="worksiteId"
        />
        <WorksitesTabsPurchaseInvoicesTab
          v-else-if="tab === 'suppliers' || tab === 'subcontractors' || tab === 'others'"
          :key="tab"
          :worksite-id="worksiteId"
          :kind="tab"
          @changed="onDataChanged"
        />
        <WorksitesTabsWorkforceTab
          v-else
          :worksite-id="worksiteId"
          @changed="onDataChanged"
        />
      </div>
    </template>

    <WorksitesWorksiteFormModal
      v-model:open="formOpen"
      :worksite-id="worksiteId"
      @saved="onSaved"
    />
  </div>
</template>

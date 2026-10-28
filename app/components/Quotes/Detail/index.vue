<script setup lang="ts">
import LogoComplet from '~/assets/images/imageSitePilot.png';
import type { Resource } from '~/components/Tables/Types/api.interface';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';
import {
  type QuoteDetail,
  type QuoteProductLine,
  quoteClientName
} from '~/components/Quotes/Types/quote.interface';
import {
  QuoteStatusColorMap,
  QuoteStatusEnum,
  QuoteStatusEnumMap,
  UnitShortLabelMap
} from '~/components/Quotes/Types/quoteStatusEnum';

const props = defineProps<{
  quoteId: number;
}>();

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const appConfig = useAppConfig();
const client = useSanctumClient();
const { handle } = useApiErrors();

const company = appConfig.company;

const { data, error, refresh } = useApi<Resource<QuoteDetail>>(() => `/api/v1/quotes/${props.quoteId}`);

const quote = computed(() => data.value?.data ?? null);

useHead({
  title: computed(() => quote.value?.quote_number ?? t('quote.detail.title'))
});

/** Lines grouped by consecutive category, as entered in the form. */
const groups = computed(() => {
  const result: { category: string | null; lines: QuoteProductLine[] }[] = [];

  for (const line of quote.value?.product_lines ?? []) {
    const last = result.at(-1);

    if (last && last.category === line.category) {
      last.lines.push(line);
    } else {
      result.push({ category: line.category, lines: [line] });
    }
  }

  return result;
});

const statuses = Object.values(QuoteStatusEnum);
const statusLabel = (value: QuoteStatusEnum) => QuoteStatusEnumMap.get(value) ?? value;
const statusColor = (value: QuoteStatusEnum) => QuoteStatusColorMap[value] ?? 'neutral';

async function updateStatus(quoteStatus: QuoteStatusEnum): Promise<void> {
  try {
    await client(`/api/v1/quotes/${props.quoteId}/status`, {
      method: 'patch',
      body: { quote_status: quoteStatus }
    });
    await refresh();
  } catch (err) {
    handle(err);
  }
}

function quantity(value: number): string {
  return Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function print(): void {
  window.print();
}

// "Télécharger" from the list opens the page with ?print=1.
watch(quote, async (value) => {
  if (value && route.query.print) {
    await nextTick();
    print();
  }
}, { once: true });

const formOpen = ref(false);
const convertOpen = ref(false);

async function onSaved(): Promise<void> {
  formOpen.value = false;
  toast.add({ title: t('quote.form.updated'), color: 'success', icon: 'i-lucide-circle-check' });
  await refresh();
}
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
        :title="t('quote.detail.notFound')"
      >
        <template #actions>
          <UButton
            to="/quote"
            color="error"
            variant="outline"
            :label="t('quote.detail.back')"
          />
        </template>
      </UAlert>
    </div>

    <template v-else>
      <div class="quote-actions bg-default border-b border-default px-4 md:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sticky top-0 z-10">
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            to="/quote"
            variant="link"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-left"
            class="px-0 text-muted"
            :label="t('quote.detail.back')"
          />
          <span class="w-px h-4 bg-(--ui-border)" />
          <template v-if="quote">
            <span class="text-[13px] font-semibold text-toned">{{ quote.quote_number }}</span>
            <TablesComponentsStatusPicker
              :status="quote.quote_status"
              :options="statuses"
              :label="statusLabel"
              :color="statusColor"
              @change="updateStatus"
            />
          </template>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-pencil"
            :disabled="!quote"
            :label="t('base.btn.update')"
            @click="formOpen = true"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-mail"
            :disabled="!quote?.client?.email"
            :href="quote ? quoteMailto(quote) : undefined"
            external
            :label="t('quote.detail.sendByEmail')"
          />
          <UTooltip
            :text="t('base.actions.convertAcceptedOnly')"
            :disabled="quote?.quote_status === QuoteStatusEnum.Accept"
          >
            <UButton
              icon="i-lucide-arrow-right-left"
              class="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40"
              :disabled="quote?.quote_status !== QuoteStatusEnum.Accept"
              :label="t('base.actions.convert')"
              @click="convertOpen = true"
            />
          </UTooltip>
          <UButton
            icon="i-lucide-file-text"
            class="bg-primary-700 hover:bg-primary-800 text-white"
            :disabled="!quote"
            :label="t('quote.detail.download')"
            @click="print"
          />
        </div>
      </div>

      <div class="max-w-205 mx-auto my-8 px-4">
        <USkeleton
          v-if="!quote"
          class="h-200 w-full"
        />

        <article
          v-else
          id="quote-document"
          class="bg-white text-[#111827] rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <header class="px-7 py-4 flex items-center justify-between border-b border-[#F3F4F6]">
            <img
              :src="LogoComplet"
              alt="SitePilotPro"
              class="h-22 w-auto object-contain object-left"
            >
            <div class="text-right">
              <p class="text-[22px] font-extrabold text-primary-700 tracking-tight">
                {{ t('quote.document.title') }}
              </p>
              <p class="text-[11px] font-mono font-bold text-secondary mt-0.5">
                {{ quote.quote_number }}
              </p>
            </div>
          </header>
          <div class="h-0.75 bg-secondary" />

          <section class="px-6 sm:px-10 py-7 grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-[#E5E7EB]">
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">
                {{ t('quote.document.issuer') }}
              </p>
              <p class="text-sm font-bold">
                {{ company.name }}
              </p>
              <p class="text-xs text-[#6B7280] mt-0.5">
                {{ company.street }}
              </p>
              <p class="text-xs text-[#6B7280]">
                {{ company.city }}
              </p>
              <p class="text-xs text-[#6B7280] mt-1">
                {{ company.email }}
              </p>
              <p class="text-xs text-[#6B7280]">
                {{ company.phone }}
              </p>
              <p class="text-[11px] text-[#9CA3AF] mt-2">
                SIRET : {{ company.siret }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">
                {{ t('quote.document.client') }}
              </p>
              <p class="text-sm font-bold">
                {{ quoteClientName(quote.client) }}
              </p>
              <p
                v-if="quote.client?.company"
                class="text-xs text-[#6B7280] mt-0.5"
              >
                {{ quote.client.contact_name }}
              </p>
              <p class="text-xs text-[#6B7280] mt-1">
                {{ quote.client?.email }}
              </p>
              <p class="text-xs text-[#6B7280]">
                {{ quote.client?.phone }}
              </p>
              <p class="text-xs text-[#6B7280] mt-0.5">
                {{ quote.client?.street }}
              </p>
              <p class="text-xs text-[#6B7280]">
                {{ quote.client?.zip_code }} {{ quote.client?.city }}
              </p>
            </div>
          </section>

          <section class="px-6 sm:px-10 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('quote.document.issueDate') }}
              </p>
              <p class="text-[13px] font-semibold text-[#374151]">
                {{ formatDate(quote.issue_date) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('quote.document.validityDate') }}
              </p>
              <p class="text-[13px] font-semibold text-[#374151]">
                {{ formatDate(quote.validity_date) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('quote.document.status') }}
              </p>
              <p class="text-[13px] font-semibold text-[#374151]">
                {{ quote.quote_status_title }}
              </p>
            </div>
            <div v-if="quote.worksites?.length">
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('quote.document.worksite') }}
              </p>
              <NuxtLink
                :to="`/worksite/${quote.worksites[0]!.id}`"
                class="text-[13px] font-semibold text-[#374151] hover:text-info"
              >
                {{ quote.worksites[0]!.name_worksite }}
              </NuxtLink>
            </div>
          </section>

          <section class="px-6 sm:px-10 py-6 overflow-x-auto">
            <table class="w-full min-w-130">
              <thead>
                <tr class="border-b-2 border-primary-700">
                  <th
                    scope="col"
                    class="pb-2.5 text-left text-[10px] font-bold text-primary-700 uppercase tracking-[0.09em]"
                  >
                    {{ t('quote.lines.description') }}
                  </th>
                  <th
                    scope="col"
                    class="pb-2.5 text-center text-[10px] font-bold text-primary-700 uppercase tracking-[0.09em] w-16"
                  >
                    {{ t('quote.lines.quantity') }}
                  </th>
                  <th
                    scope="col"
                    class="pb-2.5 text-center text-[10px] font-bold text-primary-700 uppercase tracking-[0.09em] w-20"
                  >
                    {{ t('quote.lines.unit') }}
                  </th>
                  <th
                    scope="col"
                    class="pb-2.5 text-right text-[10px] font-bold text-primary-700 uppercase tracking-[0.09em] w-28"
                  >
                    {{ t('quote.lines.unitPrice') }}
                  </th>
                  <th
                    scope="col"
                    class="pb-2.5 text-right text-[10px] font-bold text-primary-700 uppercase tracking-[0.09em] w-28"
                  >
                    {{ t('quote.lines.total') }}
                  </th>
                </tr>
              </thead>
              <tbody
                v-for="(group, index) in groups"
                :key="index"
              >
                <tr v-if="group.category">
                  <td
                    colspan="5"
                    class="pt-5 pb-1.5"
                  >
                    <div class="flex items-center gap-2">
                      <span class="w-1 h-4 bg-secondary rounded-full shrink-0" />
                      <span class="text-[11px] font-bold text-primary-700 uppercase tracking-[0.08em]">{{ group.category }}</span>
                      <span class="flex-1 h-px bg-[#E5E7EB]" />
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="line in group.lines"
                  :key="line.id"
                  class="border-b border-[#F3F4F6]"
                >
                  <td class="py-2.5 pr-4 text-xs text-[#374151]">
                    {{ line.description }}
                  </td>
                  <td class="py-2.5 text-center text-xs text-[#374151]">
                    {{ quantity(line.quantity) }}
                  </td>
                  <td class="py-2.5 text-center text-[11px] text-[#6B7280] bg-[#F9FAFB] rounded">
                    {{ UnitShortLabelMap.get(line.unit) ?? line.unit_title }}
                  </td>
                  <td class="py-2.5 text-right text-xs text-[#374151] whitespace-nowrap">
                    {{ formatMoney(line.unit_price_ht) }}
                  </td>
                  <td class="py-2.5 text-right text-xs font-semibold whitespace-nowrap">
                    {{ formatMoney(line.total_ht) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="px-6 sm:px-10 pb-8 flex justify-end">
            <div class="w-64 flex flex-col divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div class="flex justify-between items-center px-4 py-2.5">
                <span class="text-xs text-[#6B7280]">{{ t('quote.totals.ht') }}</span>
                <span class="text-[13px] font-semibold">{{ formatMoney(quote.subtotal_ht) }}</span>
              </div>
              <div class="flex justify-between items-center px-4 py-2.5">
                <span class="text-xs text-[#6B7280]">{{ t('quote.totals.tva', { rate: quote.tva_rate_numeric.toLocaleString('fr-FR') }) }}</span>
                <span class="text-[13px] font-semibold">{{ formatMoney(quote.tva_amount) }}</span>
              </div>
              <div class="flex justify-between items-center px-4 py-3.5 bg-primary-700">
                <span class="text-[13px] font-bold text-primary-200">{{ t('quote.totals.ttc') }}</span>
                <span class="text-base font-extrabold text-white">{{ formatMoney(quote.total_ttc) }}</span>
              </div>
            </div>
          </section>

          <section class="mx-6 sm:mx-10 mb-10 border border-[#E5E7EB] rounded-[10px] overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]">
            <div class="p-5">
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.09em] mb-2">
                {{ t('quote.document.conditions') }}
              </p>
              <p class="text-[11px] text-[#6B7280] leading-relaxed">
                {{ t('quote.document.conditionsText', { date: formatDate(quote.validity_date) }) }}
              </p>
            </div>
            <div class="p-5 flex flex-col">
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.09em] mb-2">
                {{ t('quote.document.signature') }}
              </p>
              <p class="text-[11px] text-[#9CA3AF] italic mb-4">
                {{ t('quote.document.signatureHint') }}
              </p>
              <div class="flex-1 border border-dashed border-[#D1D5DB] rounded-md min-h-12" />
            </div>
          </section>

          <footer class="bg-[#F8FAFC] border-t border-[#E5E7EB] px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-1">
            <p class="text-[10px] text-[#9CA3AF]">
              {{ company.name }} — SIRET {{ company.siret }} — TVA {{ company.tvaIntra }}
            </p>
            <p class="text-[10px] text-[#9CA3AF]">
              {{ quote.quote_number }} · {{ t('quote.document.page') }}
            </p>
          </footer>
        </article>
      </div>
    </template>

    <QuotesQuoteFormModal
      v-model:open="formOpen"
      :quote-id="quoteId"
      @saved="onSaved"
    />

    <QuotesConvertToInvoiceModal
      v-model:open="convertOpen"
      :quote="quote"
    />
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  #quote-document,
  #quote-document * {
    visibility: visible;
  }

  #quote-document {
    position: absolute;
    inset: 0 0 auto;
    box-shadow: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

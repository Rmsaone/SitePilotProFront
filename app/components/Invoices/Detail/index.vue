<script setup lang="ts">
import LogoComplet from '~/assets/images/imageSitePilot.png';
import type { Resource } from '~/components/Tables/Types/api.interface';
import { formatDate } from '~/components/Tables/utils/dateUtils';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';
import { type ClientInvoiceDetail, invoiceClientName } from '~/components/Invoices/Types/invoice.interface';
import {
  PaymentStatusColorMap,
  PaymentStatusEnum,
  RECEIVED_STATUSES
} from '~/components/Invoices/Types/paymentStatusEnum';
import type { QuoteProductLine } from '~/components/Quotes/Types/quote.interface';
import { UnitShortLabelMap } from '~/components/Quotes/Types/quoteStatusEnum';

const props = defineProps<{
  invoiceId: number;
}>();

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const appConfig = useAppConfig();

const company = appConfig.company;

const { data, error, refresh } = useApi<Resource<ClientInvoiceDetail>>(() => `/api/v1/invoice_clients/${props.invoiceId}`);

const invoice = computed(() => data.value?.data ?? null);

useHead({
  title: computed(() => invoice.value?.number_invoice ?? t('invoice.detail.title'))
});

const groups = computed(() => {
  const result: { category: string | null; lines: QuoteProductLine[] }[] = [];

  for (const line of invoice.value?.product_lines ?? []) {
    const last = result.at(-1);

    if (last && last.category === line.category) {
      last.lines.push(line);
    } else {
      result.push({ category: line.category, lines: [line] });
    }
  }

  return result;
});

const isReceived = computed(() => invoice.value ? RECEIVED_STATUSES.includes(invoice.value.payment_status) : false);

const bannerClasses: Record<string, string> = {
  success: 'border-success/30 bg-success/5 text-success',
  info: 'border-info/30 bg-info/5 text-info',
  warning: 'border-warning/30 bg-warning/5 text-warning',
  error: 'border-error/30 bg-error/5 text-error',
  neutral: 'border-default bg-elevated text-muted'
};

const bannerClass = computed(() => bannerClasses[invoice.value ? PaymentStatusColorMap[invoice.value.payment_status] : 'neutral']);

function quantity(value: number): string {
  return Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function print(): void {
  window.print();
}

watch(invoice, async (value) => {
  if (value && route.query.print) {
    await nextTick();
    print();
  }
}, { once: true });

const paymentOpen = ref(false);

async function onPaymentSaved(): Promise<void> {
  paymentOpen.value = false;
  toast.add({ title: t('invoice.payment.saved'), color: 'success', icon: 'i-lucide-circle-check' });
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
        :title="t('invoice.detail.notFound')"
      >
        <template #actions>
          <UButton
            to="/invoice"
            color="error"
            variant="outline"
            :label="t('invoice.detail.back')"
          />
        </template>
      </UAlert>
    </div>

    <template v-else>
      <div class="bg-default border-b border-default px-4 md:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sticky top-0 z-10">
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            to="/invoice"
            variant="link"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-left"
            class="px-0 text-muted"
            :label="t('invoice.detail.back')"
          />
          <span class="w-px h-4 bg-(--ui-border)" />
          <template v-if="invoice">
            <span class="text-[13px] font-semibold text-toned">{{ invoice.number_invoice }}</span>
            <UBadge
              :color="PaymentStatusColorMap[invoice.payment_status]"
              variant="subtle"
              class="font-semibold"
              :label="invoice.payment_status_title"
            />
          </template>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="success"
            variant="outline"
            icon="i-lucide-wallet"
            :disabled="!invoice"
            :label="t('invoice.detail.recordPayment')"
            @click="paymentOpen = true"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-mail"
            :disabled="!invoice?.client?.email"
            :href="invoice ? invoiceMailto(invoice) : undefined"
            external
            :label="t('invoice.detail.sendByEmail')"
          />
          <UButton
            icon="i-lucide-arrow-down-to-line"
            class="bg-primary-700 hover:bg-primary-800 text-white"
            :disabled="!invoice"
            :label="t('invoice.detail.download')"
            @click="print"
          />
        </div>
      </div>

      <div class="max-w-205 mx-auto my-8 px-4">
        <USkeleton
          v-if="!invoice"
          class="h-200 w-full"
        />

        <article
          v-else
          id="invoice-document"
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
                {{ t('invoice.document.title') }}
              </p>
              <p class="text-[11px] font-mono font-bold text-secondary mt-0.5">
                {{ invoice.number_invoice }}
              </p>
            </div>
          </header>
          <div class="h-0.75 bg-primary-700" />

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
              <p class="text-[11px] text-[#9CA3AF] mt-2">
                SIRET : {{ company.siret }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">
                {{ t('invoice.document.billedTo') }}
              </p>
              <p class="text-sm font-bold">
                {{ invoiceClientName(invoice) }}
              </p>
              <p
                v-if="invoice.client?.company"
                class="text-xs text-[#6B7280] mt-0.5"
              >
                {{ invoice.client.contact_name }}
              </p>
              <p class="text-xs text-[#6B7280] mt-1">
                {{ invoice.client?.email }}
              </p>
              <p class="text-xs text-[#6B7280]">
                {{ invoice.client?.phone }}
              </p>
              <p class="text-xs text-[#6B7280] mt-0.5">
                {{ invoice.client?.street }}
              </p>
              <p class="text-xs text-[#6B7280]">
                {{ invoice.client?.zip_code }} {{ invoice.client?.city }}
              </p>
            </div>
          </section>

          <section class="px-6 sm:px-10 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('quote.document.issueDate') }}
              </p>
              <p class="text-xs font-semibold text-[#374151]">
                {{ formatDate(invoice.delivery_date) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('invoice.document.paymentDate') }}
              </p>
              <p class="text-xs font-semibold text-[#374151]">
                {{ invoice.payment_date ? formatDate(invoice.payment_date) : t('invoice.document.waiting') }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('invoice.document.paymentMethod') }}
              </p>
              <p class="text-xs font-semibold text-[#374151]">
                {{ invoice.payment_method_title ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {{ t('invoice.document.reference') }}
              </p>
              <NuxtLink
                v-if="invoice.quote"
                :to="`/quote/${invoice.quote.id}`"
                class="text-xs font-semibold text-[#374151] hover:text-info"
              >
                {{ invoice.quote.quote_number }}
              </NuxtLink>
              <p
                v-if="invoice.worksite"
                class="text-[11px] text-[#6B7280] truncate"
              >
                {{ invoice.worksite.name_worksite }}
              </p>
            </div>
          </section>

          <section class="px-6 sm:px-10 py-6 overflow-x-auto">
            <p
              v-if="!groups.length"
              class="text-xs text-[#6B7280]"
            >
              {{ invoice.invoice_description }}
            </p>
            <table
              v-else
              class="w-full min-w-130"
            >
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
                      <span class="w-1 h-4 bg-primary-700 rounded-full shrink-0" />
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
                  <td class="py-2.5 text-center text-[11px] text-[#9CA3AF] font-medium">
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

          <section class="px-6 sm:px-10 pb-8">
            <div class="ml-auto w-70 flex flex-col">
              <div class="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                <span class="text-xs text-[#6B7280]">{{ t('quote.totals.ht') }}</span>
                <span class="text-[13px] font-semibold text-[#374151]">{{ formatMoney(invoice.total_ht) }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                <span class="text-xs text-[#6B7280]">{{ t('quote.totals.tva', { rate: invoice.tva_rate_numeric.toLocaleString('fr-FR') }) }}</span>
                <span class="text-[13px] font-semibold text-[#374151]">{{ formatMoney(invoice.tva_amount) }}</span>
              </div>
              <div class="flex items-center justify-between py-3 mt-1 rounded-lg bg-info/10 px-3 -mx-3">
                <span class="text-[13px] font-bold text-primary-700">{{ t('quote.totals.ttc') }}</span>
                <span class="text-lg font-extrabold text-primary-700">{{ formatMoney(invoice.total_ttc) }}</span>
              </div>
            </div>
          </section>

          <section
            class="mx-6 sm:mx-10 mb-8 rounded-[10px] border-2 p-4 flex items-center gap-3"
            :class="bannerClass"
          >
            <UIcon
              :name="isReceived ? 'i-lucide-circle-check' : invoice.payment_status === PaymentStatusEnum.Canceled ? 'i-lucide-ban' : 'i-lucide-circle-alert'"
              class="size-5 shrink-0"
            />
            <div>
              <p class="text-[13px] font-bold">
                {{ invoice.payment_status_title }}
              </p>
              <p
                v-if="invoice.payment_date"
                class="text-[11px] opacity-80"
              >
                {{ t('invoice.document.receivedOn', { date: formatDate(invoice.payment_date), method: invoice.payment_method_title }) }}
              </p>
            </div>
          </section>

          <footer class="px-6 sm:px-10 py-5 bg-[#F8FAFC] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-1">
            <p class="text-[10px] text-[#9CA3AF]">
              {{ company.name }} · SIRET {{ company.siret }} · TVA {{ company.tvaIntra }}
            </p>
            <p class="text-[10px] text-[#9CA3AF]">
              {{ t('invoice.document.latePenalty') }}
            </p>
          </footer>
        </article>
      </div>
    </template>

    <InvoicesPaymentModal
      v-model:open="paymentOpen"
      :invoice="invoice"
      @saved="onPaymentSaved"
    />
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  #invoice-document,
  #invoice-document * {
    visibility: visible;
  }

  #invoice-document {
    position: absolute;
    inset: 0 0 auto;
    box-shadow: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

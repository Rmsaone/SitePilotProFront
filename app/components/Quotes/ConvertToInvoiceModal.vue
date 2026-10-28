<script setup lang="ts">
import type { Paginated, Resource } from '~/components/Tables/Types/api.interface';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';
import type { ClientInvoice } from '~/components/Invoices/Types/invoice.interface';
import { type Quote, quoteClientName } from '~/components/Quotes/Types/quote.interface';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  quote: Quote | null;
}>();

const { t } = useI18n();
const dayjs = useDayjs();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();

const deliveryDate = ref('');
const worksiteId = ref<number | undefined>();
const worksites = ref<{ id: number; name_worksite: string }[]>([]);
const errors = ref<Record<string, string | undefined>>({});
const submitting = ref(false);

const linkedWorksite = computed(() => props.quote?.worksites?.[0] ?? null);
const worksiteItems = computed(() => worksites.value.map(item => ({ value: item.id, label: item.name_worksite })));

watch(open, async (value) => {
  if (!value || !props.quote) {
    return;
  }

  deliveryDate.value = dayjs().format('YYYY-MM-DD');
  worksiteId.value = linkedWorksite.value?.id;
  errors.value = {};

  if (!linkedWorksite.value && props.quote.client) {
    try {
      const response = await client<Paginated<{ id: number; name_worksite: string }>>('/api/v1/worksites', {
        query: { client_id: props.quote.client.id, per_page: 100 }
      });
      worksites.value = response.data;
    } catch (error) {
      handle(error);
    }
  }
});

async function convert(): Promise<void> {
  if (!props.quote) {
    return;
  }

  submitting.value = true;

  try {
    const response = await client<Resource<ClientInvoice>>(`/api/v1/quotes/${props.quote.id}/invoice`, {
      method: 'post',
      // Without a choice, the API invoices the worksite linked to the quote.
      body: { delivery_date: deliveryDate.value, worksite_id: linkedWorksite.value ? null : worksiteId.value ?? null }
    });
    toast.add({ title: t('invoice.convert.created', { number: response.data.number_invoice }), color: 'success', icon: 'i-lucide-circle-check' });
    open.value = false;
    await navigateTo(`/invoice/${response.data.id}`);
  } catch (error) {
    handle(error, (serverErrors) => {
      errors.value = serverErrors;

      if (serverErrors.quote) {
        toast.add({ title: serverErrors.quote, color: 'error', icon: 'i-lucide-circle-alert' });
      }
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('invoice.convert.title')"
    :description="quote ? `${quote.quote_number} — ${quoteClientName(quote.client)}` : undefined"
    :ui="{
      content: 'max-w-110',
      header: 'bg-linear-to-br from-violet-600 to-violet-800',
      title: 'text-base font-extrabold text-white',
      description: 'text-violet-200',
      close: 'text-white hover:bg-white/20',
      footer: 'justify-end'
    }"
  >
    <template #body>
      <div
        v-if="quote"
        class="flex flex-col gap-4"
      >
        <div class="flex items-center justify-between rounded-lg bg-elevated/60 border border-default px-4 py-3">
          <span class="text-xs font-semibold text-muted uppercase tracking-[0.06em]">{{ t('quote.totals.ttc') }}</span>
          <span class="text-base font-extrabold text-highlighted">{{ formatMoney(quote.total_ttc) }}</span>
        </div>
        <UFormField
          :label="t('invoice.convert.date')"
          name="delivery_date"
          :error="errors.delivery_date"
        >
          <UInput
            v-model="deliveryDate"
            type="date"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="t('invoice.convert.worksite')"
          name="worksite_id"
          :required="!linkedWorksite"
          :error="errors.worksite_id"
        >
          <UInput
            v-if="linkedWorksite"
            :model-value="linkedWorksite.name_worksite"
            disabled
            class="w-full"
          />
          <USelectMenu
            v-else
            v-model="worksiteId"
            :items="worksiteItems"
            value-key="value"
            :placeholder="t('invoice.convert.worksitePlaceholder')"
            class="w-full"
          />
        </UFormField>
        <p class="text-xs text-muted">
          {{ t('invoice.convert.hint') }}
        </p>
      </div>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="t('base.btn.cancel')"
        @click="open = false"
      />
      <UButton
        icon="i-lucide-arrow-right-left"
        class="bg-violet-600 hover:bg-violet-700 text-white"
        :loading="submitting"
        :label="t('base.actions.convert')"
        @click="convert"
      />
    </template>
  </UModal>
</template>

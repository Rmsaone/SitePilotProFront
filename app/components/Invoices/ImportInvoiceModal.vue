<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { Paginated } from '~/components/Tables/Types/api.interface';
import {
  type WorksiteInterface,
  worksiteClientName
} from '~/components/Worksites/Types/worksite.interface';
import { WorksiteStatusEnumMap } from '~/components/Worksites/Types/worksiteStatusEnum';

type ImportKind = 'suppliers' | 'subcontractors' | 'others';

const ENDPOINTS: Record<ImportKind, string> = {
  suppliers: '/api/v1/invoice_suppliers',
  subcontractors: '/api/v1/invoice_subcontractors',
  others: '/api/v1/invoice_others'
};

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  /** Skip the worksite step when importing from a worksite page */
  worksiteId?: number | null;
}>();

const emit = defineEmits<{
  saved: [worksiteId: number, kind: ImportKind];
}>();

const { t } = useI18n();
const dayjs = useDayjs();
const toast = useToast();
const client = useSanctumClient();
const { handle } = useApiErrors();

const step = ref(0);
const file = ref<File | null>(null);
const selectedWorksite = ref<number | null>(null);
const worksiteSearch = ref('');
const kind = ref<ImportKind>('suppliers');
const worksites = ref<WorksiteInterface[]>([]);

const steps = computed(() => [
  { title: t('invoice.import.steps.source'), icon: 'i-lucide-upload' },
  { title: t('invoice.import.steps.worksite'), icon: 'i-lucide-building-2' },
  { title: t('invoice.import.steps.form'), icon: 'i-lucide-file-text' }
]);

const kinds = computed(() => (['suppliers', 'subcontractors', 'others'] as ImportKind[]).map(value => ({
  value,
  label: t(`invoice.import.kinds.${value}`)
})));

const filteredWorksites = computed(() => {
  const term = worksiteSearch.value.trim().toLowerCase();

  return worksites.value.filter(worksite => !term
    || worksite.name_worksite.toLowerCase().includes(term)
    || worksiteClientName(worksite.client).toLowerCase().includes(term));
});

const required = () => z.string({ required_error: t('auth.validation.required') }).trim().min(1, t('auth.validation.required'));
const amount = () => z.number({ required_error: t('auth.validation.required'), invalid_type_error: t('auth.validation.required') }).min(0);

const schema = toTypedSchema(z.object({
  delivery_date: required(),
  number_invoice: required().max(55),
  invoice_description: required().max(255),
  purchase_price: amount(),
  cost_price: amount()
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors, resetForm } = useForm({
  validationSchema: schema
});

const [deliveryDate] = defineField('delivery_date');
const [numberInvoice] = defineField('number_invoice');
const [description] = defineField('invoice_description');
const [purchasePrice] = defineField('purchase_price');
const [costPrice] = defineField('cost_price');

const canGoNext = computed(() => (step.value === 0 && file.value !== null) || (step.value === 1 && selectedWorksite.value !== null));

function fileSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} Ko` : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

watch(open, async (value) => {
  if (!value) {
    return;
  }

  step.value = 0;
  file.value = null;
  selectedWorksite.value = props.worksiteId ?? null;
  worksiteSearch.value = '';
  kind.value = 'suppliers';
  resetForm({ values: { delivery_date: dayjs().format('YYYY-MM-DD') } });

  try {
    const response = await client<Paginated<WorksiteInterface>>('/api/v1/worksites', { query: { per_page: 100 } });
    worksites.value = response.data;
  } catch (error) {
    handle(error);
  }
});

function next(): void {
  // The worksite is already known when importing from a worksite.
  step.value = step.value === 0 && props.worksiteId ? 2 : step.value + 1;
}

function back(): void {
  step.value = step.value === 2 && props.worksiteId ? 0 : step.value - 1;
}

const onSubmit = handleSubmit(async (values) => {
  if (!file.value || selectedWorksite.value === null) {
    return;
  }

  // multipart: the scanned invoice is sent with the form values.
  const body = new FormData();
  body.append('worksite_id', String(selectedWorksite.value));
  body.append('delivery_date', values.delivery_date);
  body.append('number_invoice', values.number_invoice);
  body.append('invoice_description', values.invoice_description);
  body.append('purchase_price', String(values.purchase_price));
  body.append('cost_price', String(values.cost_price));
  body.append('attachment', file.value);

  try {
    await client(ENDPOINTS[kind.value], { method: 'post', body });
    toast.add({ title: t('invoice.import.saved'), color: 'success', icon: 'i-lucide-circle-check' });
    emit('saved', selectedWorksite.value, kind.value);
    open.value = false;
  } catch (error) {
    handle(error, (serverErrors) => {
      if (serverErrors.attachment || serverErrors.worksite_id) {
        toast.add({ title: serverErrors.attachment ?? serverErrors.worksite_id, color: 'error', icon: 'i-lucide-circle-alert' });
      }
      setErrors(serverErrors);
    });
  }
});
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('invoice.import.title')"
    :description="t('invoice.import.stepOf', { step: step + 1, label: steps[step]?.title })"
    :ui="{
      content: 'max-w-135 rounded-[18px]',
      header: 'bg-linear-to-br from-violet-600 to-violet-800',
      title: 'text-base font-extrabold text-white',
      description: 'text-violet-200',
      close: 'text-white hover:bg-white/20',
      footer: 'justify-between'
    }"
  >
    <template #body>
      <UStepper
        v-model="step"
        :items="steps"
        size="sm"
        disabled
        class="mb-5"
        :ui="{ trigger: 'group-data-[state=completed]:bg-violet-600 group-data-[state=active]:bg-violet-600', separator: 'group-data-[state=completed]:bg-violet-600' }"
      />

      <div
        v-if="step === 0"
        class="flex flex-col gap-3"
      >
        <UFileUpload
          v-model="file"
          accept="application/pdf,image/png,image/jpeg"
          icon="i-lucide-upload"
          :label="t('invoice.import.dropLabel')"
          :description="t('invoice.import.dropHint')"
          layout="list"
          class="w-full min-h-48"
        />
        <p
          v-if="file"
          class="text-[11px] text-muted"
        >
          {{ file.name }} · {{ fileSize(file.size) }}
        </p>
      </div>

      <div
        v-else-if="step === 1"
        class="flex flex-col gap-3"
      >
        <p class="text-[13px] text-muted">
          {{ t('invoice.import.worksiteHint') }}
        </p>
        <UInput
          v-model="worksiteSearch"
          icon="i-lucide-search"
          :placeholder="t('worksite.list.searchPlaceholder')"
          class="w-full"
        />
        <div
          role="radiogroup"
          class="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1"
        >
          <button
            v-for="worksite in filteredWorksites"
            :key="worksite.id"
            type="button"
            role="radio"
            :aria-checked="selectedWorksite === worksite.id"
            class="flex items-center gap-3 px-4 py-3 rounded-[10px] border-2 text-left transition-colors"
            :class="selectedWorksite === worksite.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950' : 'border-default hover:border-violet-300'"
            @click="selectedWorksite = worksite.id"
          >
            <span class="size-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-building-2"
                class="size-3.5 text-secondary"
              />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-[13px] font-semibold text-highlighted truncate">{{ worksite.name_worksite }}</span>
              <span class="block text-[11px] text-muted">
                {{ worksiteClientName(worksite.client) }} · {{ WorksiteStatusEnumMap.get(worksite.worksite_status) }}
              </span>
            </span>
            <UIcon
              v-if="selectedWorksite === worksite.id"
              name="i-lucide-circle-check"
              class="size-4 text-violet-600 shrink-0"
            />
          </button>
          <p
            v-if="!filteredWorksites.length"
            class="text-center text-xs text-dimmed py-6"
          >
            {{ t('worksite.list.noData') }}
          </p>
        </div>
      </div>

      <form
        v-else
        id="import-invoice-form"
        class="flex flex-col gap-4"
        novalidate
        @submit="onSubmit"
      >
        <UTabs
          v-model="kind"
          :items="kinds"
          :content="false"
          size="sm"
          :ui="{ list: 'bg-elevated rounded-[10px] p-1', indicator: 'bg-violet-600 rounded-lg', trigger: 'flex-1 text-xs font-semibold data-[state=active]:text-white' }"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField
            :label="t('worksite.tabs.form.date')"
            name="delivery_date"
            required
            :error="errors.delivery_date"
          >
            <UInput
              v-model="deliveryDate"
              type="date"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('worksite.tabs.form.number')"
            name="number_invoice"
            required
            :error="errors.number_invoice"
          >
            <UInput
              v-model="numberInvoice"
              placeholder="ex. INV-2026-001"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField
          :label="t(`worksite.tabs.${kind}.party`)"
          name="invoice_description"
          required
          :error="errors.invoice_description"
        >
          <UInput
            v-model="description"
            :placeholder="t(`worksite.tabs.${kind}.partyPlaceholder`)"
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField
            :label="t('worksite.tabs.form.purchasePrice')"
            name="purchase_price"
            required
            :error="errors.purchase_price"
          >
            <UInputNumber
              v-model="purchasePrice"
              :min="0"
              :step="0.01"
              :format-options="{ style: 'currency', currency: 'EUR' }"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('worksite.tabs.form.costPrice')"
            name="cost_price"
            required
            :error="errors.cost_price"
          >
            <UInputNumber
              v-model="costPrice"
              :min="0"
              :step="0.01"
              :format-options="{ style: 'currency', currency: 'EUR' }"
              class="w-full"
            />
          </UFormField>
        </div>
        <p
          v-if="file"
          class="flex items-center gap-2 text-xs text-muted"
        >
          <UIcon
            name="i-lucide-paperclip"
            class="size-3.5"
          />
          {{ file.name }}
        </p>
      </form>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :icon="step === 0 ? undefined : 'i-lucide-chevron-left'"
        :label="step === 0 ? t('base.btn.cancel') : t('invoice.import.back')"
        @click="step === 0 ? open = false : back()"
      />
      <UButton
        v-if="step < 2"
        class="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40"
        trailing-icon="i-lucide-chevron-right"
        :disabled="!canGoNext"
        :label="t('invoice.import.next')"
        @click="next"
      />
      <UButton
        v-else
        type="submit"
        form="import-invoice-form"
        class="bg-violet-600 hover:bg-violet-700 text-white"
        :loading="isSubmitting"
        :label="t('invoice.import.submit')"
      />
    </template>
  </UModal>
</template>

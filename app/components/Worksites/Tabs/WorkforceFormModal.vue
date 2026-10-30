<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { WorkforceEntry } from '~/components/Invoices/Types/invoice.interface';
import { formatEuros, toEuros } from '~/components/Tables/utils/moneyUtils';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  worksiteId: number;
  entry: WorkforceEntry | null;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const { t } = useI18n();
const client = useSanctumClient();
const { handle } = useApiErrors();

const required = () => z.string({ required_error: t('auth.validation.required') }).trim().min(1, t('auth.validation.required'));
const amount = () => z.number({ required_error: t('auth.validation.required'), invalid_type_error: t('auth.validation.required') }).min(0);

const schema = toTypedSchema(z.object({
  code: required().max(20),
  worker: required().max(255),
  hr_working: amount(),
  hr_rate: amount(),
  additional_costs: z.number().min(0).nullable().optional()
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors, resetForm, values } = useForm({
  validationSchema: schema
});

const [code] = defineField('code');
const [worker] = defineField('worker');
const [hrWorking] = defineField('hr_working');
const [hrRate] = defineField('hr_rate');
const [additionalCosts] = defineField('additional_costs');

// Preview of the server-side computation (hours × rate + additional costs).
const grossCost = computed(() => (values.hr_working ?? 0) * (values.hr_rate ?? 0) + (values.additional_costs ?? 0));

watch(open, (value) => {
  if (!value) {
    return;
  }

  resetForm({
    values: props.entry
      ? {
          code: props.entry.code,
          worker: props.entry.worker,
          hr_working: Number(props.entry.hr_working),
          hr_rate: toEuros(props.entry.hr_rate),
          additional_costs: toEuros(props.entry.additional_costs)
        }
      : {}
  });
});

const onSubmit = handleSubmit(async (formValues) => {
  try {
    await client(props.entry ? `/api/v1/workforces/${props.entry.id}` : '/api/v1/workforces', {
      method: props.entry ? 'put' : 'post',
      body: { ...formValues, worksite_id: props.worksiteId }
    });
    emit('saved');
  } catch (error) {
    handle(error, setErrors);
  }
});
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'max-w-130',
      header: 'bg-primary-700',
      close: 'text-white/70 hover:text-white hover:bg-white/10',
      footer: 'justify-end'
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="size-8 rounded-full bg-white/10 flex items-center justify-center text-white">
          <UIcon
            name="i-lucide-users"
            class="size-4"
          />
        </span>
        <h2 class="text-[15px] font-bold text-white">
          {{ entry ? t('worksite.tabs.workforce.editTitle') : t('worksite.tabs.workforce.addTitle') }}
        </h2>
      </div>
    </template>

    <template #body>
      <form
        id="workforce-form"
        class="flex flex-col gap-4"
        novalidate
        @submit="onSubmit"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UFormField
            :label="t('worksite.tabs.workforce.code')"
            name="code"
            required
            :error="errors.code"
          >
            <UInput
              v-model="code"
              placeholder="145"
              class="w-full"
            />
          </UFormField>
          <UFormField
            class="sm:col-span-2"
            :label="t('worksite.tabs.workforce.worker')"
            name="worker"
            required
            :error="errors.worker"
          >
            <UInput
              v-model="worker"
              placeholder="Prénom NOM"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UFormField
            :label="t('worksite.tabs.workforce.hours')"
            name="hr_working"
            required
            :error="errors.hr_working"
          >
            <UInputNumber
              v-model="hrWorking"
              :min="0"
              :step="0.5"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('worksite.tabs.workforce.rate')"
            name="hr_rate"
            required
            :error="errors.hr_rate"
          >
            <UInputNumber
              v-model="hrRate"
              :min="0"
              :step="0.01"
              :format-options="{ style: 'currency', currency: 'EUR' }"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('worksite.tabs.workforce.additionalCosts')"
            name="additional_costs"
            :error="errors.additional_costs"
          >
            <UInputNumber
              v-model="additionalCosts"
              :min="0"
              :step="0.01"
              :format-options="{ style: 'currency', currency: 'EUR' }"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-elevated/60 border border-default px-4 py-3">
          <span class="text-xs font-semibold text-muted uppercase tracking-[0.06em]">{{ t('worksite.tabs.workforce.grossCost') }}</span>
          <span class="text-base font-extrabold text-highlighted">{{ formatEuros(grossCost) }}</span>
        </div>
      </form>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="t('base.btn.cancel')"
        @click="open = false"
      />
      <UButton
        type="submit"
        form="workforce-form"
        color="secondary"
        :loading="isSubmitting"
        :label="t('base.btn.save')"
      />
    </template>
  </UModal>
</template>

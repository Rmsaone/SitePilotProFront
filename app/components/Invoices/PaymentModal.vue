<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { Resource } from '~/components/Tables/Types/api.interface';
import type { ClientInvoice } from '~/components/Invoices/Types/invoice.interface';
import {
  PaymentMethodEnum,
  PaymentMethodEnumMap,
  PaymentStatusEnum,
  PaymentStatusEnumMap,
  RECEIVED_STATUSES
} from '~/components/Invoices/Types/paymentStatusEnum';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  invoice: ClientInvoice | null;
  /** Status picked in a list, applied when the modal opens */
  status?: PaymentStatusEnum;
}>();

const emit = defineEmits<{
  saved: [invoice: ClientInvoice];
}>();

const { t } = useI18n();
const dayjs = useDayjs();
const client = useSanctumClient();
const { handle } = useApiErrors();

const schema = toTypedSchema(z.object({
  payment_status: z.nativeEnum(PaymentStatusEnum),
  payment_date: z.string().optional(),
  payment_method: z.nativeEnum(PaymentMethodEnum).optional()
}).superRefine((values, context) => {
  if (!RECEIVED_STATUSES.includes(values.payment_status)) {
    return;
  }
  if (!values.payment_date) {
    context.addIssue({ code: 'custom', path: ['payment_date'], message: t('auth.validation.required') });
  }
  if (!values.payment_method || values.payment_method === PaymentMethodEnum.Other) {
    context.addIssue({ code: 'custom', path: ['payment_method'], message: t('invoice.payment.methodRequired') });
  }
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors, resetForm, values } = useForm({
  validationSchema: schema
});

const [paymentStatus] = defineField('payment_status');
const [paymentDate] = defineField('payment_date');
const [paymentMethod] = defineField('payment_method');

const received = computed(() => RECEIVED_STATUSES.includes(values.payment_status as PaymentStatusEnum));

const statusItems = Object.values(PaymentStatusEnum).map(value => ({ value, label: PaymentStatusEnumMap.get(value) ?? value }));
const methodItems = Object.values(PaymentMethodEnum)
  .filter(value => value !== PaymentMethodEnum.Other)
  .map((value): { value: PaymentMethodEnum; label: string } => ({ value, label: PaymentMethodEnumMap.get(value) ?? value }));

watch(open, (value) => {
  if (!value || !props.invoice) {
    return;
  }

  resetForm({
    values: {
      payment_status: props.status ?? props.invoice.payment_status,
      payment_date: props.invoice.payment_date ?? dayjs().format('YYYY-MM-DD'),
      payment_method: props.invoice.payment_method && props.invoice.payment_method !== PaymentMethodEnum.Other
        ? props.invoice.payment_method
        : PaymentMethodEnum.BankTransfer
    }
  });
});

const onSubmit = handleSubmit(async (formValues) => {
  if (!props.invoice) {
    return;
  }

  try {
    const response = await client<Resource<ClientInvoice>>(`/api/v1/invoice_clients/${props.invoice.id}/payment`, {
      method: 'patch',
      body: received.value ? formValues : { payment_status: formValues.payment_status }
    });
    emit('saved', response.data);
  } catch (error) {
    handle(error, setErrors);
  }
});
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('invoice.payment.title')"
    :description="invoice ? `${invoice.number_invoice} — ${formatMoney(invoice.total_ttc)} TTC` : undefined"
    :ui="{ content: 'max-w-110', footer: 'justify-end' }"
  >
    <template #body>
      <form
        id="payment-form"
        class="flex flex-col gap-4"
        novalidate
        @submit="onSubmit"
      >
        <UFormField
          :label="t('invoice.payment.status')"
          name="payment_status"
          required
          :error="errors.payment_status"
        >
          <USelect
            v-model="paymentStatus"
            :items="statusItems"
            class="w-full"
          />
        </UFormField>
        <template v-if="received">
          <UFormField
            :label="t('invoice.payment.date')"
            name="payment_date"
            required
            :error="errors.payment_date"
          >
            <UInput
              v-model="paymentDate"
              type="date"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('invoice.payment.method')"
            name="payment_method"
            required
            :error="errors.payment_method"
          >
            <USelect
              v-model="paymentMethod"
              :items="methodItems"
              class="w-full"
            />
          </UFormField>
        </template>
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
        form="payment-form"
        color="secondary"
        :loading="isSubmitting"
        :label="t('base.btn.save')"
      />
    </template>
  </UModal>
</template>

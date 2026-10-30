<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { PurchaseInvoice } from '~/components/Invoices/Types/invoice.interface';
import { toEuros } from '~/components/Tables/utils/moneyUtils';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  kind: 'suppliers' | 'subcontractors' | 'others';
  endpoint: string;
  worksiteId: number;
  invoice: PurchaseInvoice | null;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const { t } = useI18n();
const client = useSanctumClient();
const { handle } = useApiErrors();

const icons = {
  suppliers: 'i-lucide-package',
  subcontractors: 'i-lucide-wrench',
  others: 'i-lucide-receipt'
};

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
const attachment = ref<File | null>(null);
const attachmentError = ref<string>();

watch(open, (value) => {
  if (!value) {
    return;
  }

  attachment.value = null;
  attachmentError.value = undefined;

  resetForm({
    values: props.invoice
      ? {
          delivery_date: props.invoice.delivery_date.slice(0, 10),
          number_invoice: props.invoice.number_invoice,
          invoice_description: props.invoice.invoice_description,
          purchase_price: toEuros(props.invoice.purchase_price),
          cost_price: toEuros(props.invoice.cost_price)
        }
      : { delivery_date: new Date().toISOString().slice(0, 10) }
  });
});

const onSubmit = handleSubmit(async (values) => {
  try {
    // multipart (PUT is spoofed: PHP does not parse multipart PUT bodies).
    const body = new FormData();
    Object.entries({ ...values, worksite_id: props.worksiteId }).forEach(([key, value]) => body.append(key, String(value)));

    if (attachment.value) {
      body.append('attachment', attachment.value);
    }
    if (props.invoice) {
      body.append('_method', 'PUT');
    }

    await client(props.invoice ? `${props.endpoint}/${props.invoice.id}` : props.endpoint, {
      method: 'post',
      body
    });
    emit('saved');
  } catch (error) {
    handle(error, (serverErrors) => {
      setErrors(serverErrors);
      attachmentError.value = serverErrors.attachment;
    });
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
            :name="icons[kind]"
            class="size-4"
          />
        </span>
        <h2 class="text-[15px] font-bold text-white">
          {{ invoice ? t(`worksite.tabs.${kind}.editTitle`) : t(`worksite.tabs.${kind}.addTitle`) }}
        </h2>
      </div>
    </template>

    <template #body>
      <form
        id="purchase-invoice-form"
        class="flex flex-col gap-4"
        novalidate
        @submit="onSubmit"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="F261005"
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <UFormField
          :label="t('worksite.tabs.form.attachment')"
          name="attachment"
          :hint="invoice?.attachment_name ?? undefined"
          :error="attachmentError"
        >
          <UFileUpload
            v-model="attachment"
            accept="application/pdf,image/png,image/jpeg"
            icon="i-lucide-paperclip"
            :label="t('worksite.tabs.form.attachmentLabel')"
            layout="list"
            class="w-full min-h-24"
          />
        </UFormField>
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
        form="purchase-invoice-form"
        color="secondary"
        :loading="isSubmitting"
        :label="t('base.btn.save')"
      />
    </template>
  </UModal>
</template>

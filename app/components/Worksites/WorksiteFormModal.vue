<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { Paginated, Resource } from '~/components/Tables/Types/api.interface';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';
import {
  type WorksiteDetail,
  type WorksiteQuote,
  type WorksiteUser,
  worksiteClientName
} from '~/components/Worksites/Types/worksite.interface';
import {
  WorksitePriorityColorMap,
  WorksitePriorityEnum,
  WorksitePriorityEnumMap
} from '~/components/Worksites/Types/worksitePriorityEnum';
import { WorksiteStatusEnum, WorksiteStatusEnumMap } from '~/components/Worksites/Types/worksiteStatusEnum';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  /** null to create a worksite */
  worksiteId: number | null;
}>();

const emit = defineEmits<{
  saved: [worksiteId: number, created: boolean];
}>();

const { t } = useI18n();
const client = useSanctumClient();
const { handle } = useApiErrors();

const isEdit = computed(() => props.worksiteId !== null);
const loading = ref(false);
const quotes = ref<WorksiteQuote[]>([]);
const users = ref<WorksiteUser[]>([]);
const clientId = ref<number | null>(null);

const required = () => z.string({ required_error: t('auth.validation.required') }).trim().min(1, t('auth.validation.required'));

const schema = computed(() => toTypedSchema(z.object({
  quote_id: isEdit.value
    ? z.number().optional()
    : z.number({ required_error: t('worksite.form.quoteRequired'), invalid_type_error: t('worksite.form.quoteRequired') }),
  name_worksite: required().min(2).max(55),
  description: z.string().max(255).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  worksite_priority: z.nativeEnum(WorksitePriorityEnum),
  worksite_status: z.nativeEnum(WorksiteStatusEnum),
  street: z.string().max(55).optional(),
  zip_code: z.string().regex(/^\d{0,5}$/, t('worksite.form.zipInvalid')).optional(),
  city: z.string().max(25).optional(),
  country: z.string().max(25).optional(),
  user_id: z.number().optional()
}).refine(values => !values.start_date || !values.end_date || values.end_date >= values.start_date, {
  message: t('worksite.form.endBeforeStart'),
  path: ['end_date']
})));

const defaults = {
  quote_id: undefined as number | undefined,
  name_worksite: '',
  description: '',
  start_date: '',
  end_date: '',
  worksite_priority: WorksitePriorityEnum.Medium,
  worksite_status: WorksiteStatusEnum.Pending,
  street: '',
  zip_code: '',
  city: '',
  country: 'France',
  user_id: undefined as number | undefined
};

const { defineField, errors, handleSubmit, isSubmitting, setErrors, resetForm, values } = useForm({
  validationSchema: schema
});

const [quoteId] = defineField('quote_id');
const [name] = defineField('name_worksite');
const [description] = defineField('description');
const [startDate] = defineField('start_date');
const [endDate] = defineField('end_date');
const [priority] = defineField('worksite_priority');
const [worksiteStatus] = defineField('worksite_status');
const [street] = defineField('street');
const [zipCode] = defineField('zip_code');
const [city] = defineField('city');
const [country] = defineField('country');
const [userId] = defineField('user_id');

const selectedQuote = computed(() => quotes.value.find(quote => quote.id === values.quote_id) ?? null);
const isUnlocked = computed(() => isEdit.value || selectedQuote.value !== null);

const quoteItems = computed(() => quotes.value.map(quote => ({
  value: quote.id,
  label: `${quote.quote_number} — ${worksiteClientName(quote.client)} (${formatMoney(quote.subtotal_ht)})`
})));

const userItems = computed(() => users.value.map(user => ({
  value: user.id,
  label: user.full_name,
  description: user.user_role_title
})));

const priorityItems = Object.values(WorksitePriorityEnum).map(value => ({
  value,
  label: WorksitePriorityEnumMap.get(value) ?? value
}));

const statusItems = Object.values(WorksiteStatusEnum).map(value => ({
  value,
  label: WorksiteStatusEnumMap.get(value) ?? value
}));

const priorityClasses: Record<string, string> = {
  success: 'border-success bg-success/10 text-success',
  warning: 'border-warning bg-warning/10 text-warning',
  error: 'border-error bg-error/10 text-error'
};

watch(quoteId, (id) => {
  const quote = quotes.value.find(item => item.id === id);

  if (!quote || isEdit.value) {
    return;
  }

  clientId.value = quote.client?.id ?? null;

  if (!values.name_worksite) {
    name.value = `Chantier – ${worksiteClientName(quote.client)}`;
  }
});

async function load(): Promise<void> {
  loading.value = true;
  resetForm({ values: { ...defaults } });
  clientId.value = null;

  try {
    const [quoteResponse, userResponse, worksiteResponse] = await Promise.all([
      client<Paginated<WorksiteQuote>>('/api/v1/quotes', { query: { quote_status: 'accept', per_page: 100 } }),
      client<Paginated<WorksiteUser>>('/api/v1/users'),
      props.worksiteId !== null
        ? client<Resource<WorksiteDetail>>(`/api/v1/worksites/${props.worksiteId}`)
        : Promise.resolve(null)
    ]);

    quotes.value = quoteResponse.data;
    users.value = userResponse.data;

    if (worksiteResponse) {
      const worksite = worksiteResponse.data;
      clientId.value = worksite.client?.id ?? null;
      resetForm({
        values: {
          quote_id: worksite.quotes?.[0]?.id,
          name_worksite: worksite.name_worksite,
          description: worksite.description ?? '',
          start_date: worksite.start_date?.slice(0, 10) ?? '',
          end_date: worksite.end_date?.slice(0, 10) ?? '',
          worksite_priority: worksite.worksite_priority,
          worksite_status: worksite.worksite_status,
          street: worksite.street,
          zip_code: worksite.zip_code ? String(worksite.zip_code) : '',
          city: worksite.city,
          country: worksite.country,
          user_id: worksite.responsible?.id
        }
      });
    }
  } catch (error) {
    handle(error);
  } finally {
    loading.value = false;
  }
}

watch(open, (value) => {
  if (value) {
    load();
  }
});

const onSubmit = handleSubmit(async (formValues) => {
  try {
    const body = {
      ...formValues,
      client_id: clientId.value,
      quote_id: formValues.quote_id ?? null,
      user_id: formValues.user_id ?? null,
      start_date: formValues.start_date || null,
      end_date: formValues.end_date || null,
      zip_code: formValues.zip_code ? Number(formValues.zip_code) : null
    };

    const response = await client<Resource<WorksiteDetail>>(
      isEdit.value ? `/api/v1/worksites/${props.worksiteId}` : '/api/v1/worksites',
      { method: isEdit.value ? 'put' : 'post', body }
    );

    emit('saved', response.data.id, !isEdit.value);
  } catch (error) {
    handle(error, setErrors);
  }
});
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? t('worksite.form.editTitle') : t('worksite.form.createTitle')"
    :description="isEdit ? undefined : t('worksite.form.createSubtitle')"
    :ui="{
      content: 'max-w-155',
      header: 'bg-linear-to-br from-secondary to-secondary-600',
      title: 'text-xl font-extrabold text-white',
      description: 'text-secondary-100',
      close: 'text-white hover:bg-white/20',
      footer: 'justify-end'
    }"
  >
    <template #body>
      <div
        v-if="loading"
        class="flex justify-center py-10"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 animate-spin text-muted"
        />
      </div>

      <form
        v-else
        id="worksite-form"
        class="flex flex-col gap-6"
        novalidate
        @submit="onSubmit"
      >
        <div>
          <UFormField
            :label="t('worksite.form.quote')"
            name="quote_id"
            :required="!isEdit"
            :error="errors.quote_id"
          >
            <USelectMenu
              v-model="quoteId"
              :items="quoteItems"
              value-key="value"
              :placeholder="t('worksite.form.quotePlaceholder')"
              :search-input="{ placeholder: t('worksite.form.search') }"
              class="w-full"
            />
          </UFormField>
          <p
            v-if="!quotes.length"
            class="mt-1 flex items-center gap-1 text-[11px] text-error"
          >
            <UIcon
              name="i-lucide-circle-alert"
              class="size-3"
            />
            {{ t('worksite.form.noAcceptedQuote') }}
          </p>
          <div
            v-if="selectedQuote && !isEdit"
            class="mt-3 flex items-center gap-2 px-3 py-2.5 bg-success/10 border border-success/30 rounded-lg"
          >
            <UIcon
              name="i-lucide-circle-check"
              class="size-3.5 text-success shrink-0"
            />
            <p class="flex-1 min-w-0 text-xs">
              <span class="font-semibold text-success">{{ t('worksite.form.linkedClient') }} :</span>
              <span class="text-toned">{{ worksiteClientName(selectedQuote.client) }}</span>
            </p>
            <span class="text-[11px] font-bold text-success shrink-0">{{ formatMoney(selectedQuote.subtotal_ht) }} HT</span>
          </div>
        </div>

        <fieldset
          :disabled="!isUnlocked"
          class="flex flex-col gap-6 transition-opacity"
          :class="{ 'opacity-40 select-none': !isUnlocked }"
        >
          <section class="flex flex-col gap-4">
            <FormSectionDivider :label="t('worksite.form.identity')" />

            <UFormField
              :label="t('worksite.form.name')"
              name="name_worksite"
              required
              :error="errors.name_worksite"
            >
              <UInput
                v-model="name"
                :placeholder="t('worksite.form.namePlaceholder')"
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="t('worksite.form.description')"
              name="description"
              :error="errors.description"
            >
              <UTextarea
                v-model="description"
                :rows="3"
                :placeholder="t('worksite.form.descriptionPlaceholder')"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField
                :label="t('worksite.form.startDate')"
                name="start_date"
                :error="errors.start_date"
              >
                <UInput
                  v-model="startDate"
                  type="date"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                :label="t('worksite.form.endDate')"
                name="end_date"
                :error="errors.end_date"
              >
                <UInput
                  v-model="endDate"
                  type="date"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField
              :label="t('worksite.form.priority')"
              name="worksite_priority"
              required
              :error="errors.worksite_priority"
            >
              <div
                role="radiogroup"
                class="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <button
                  v-for="item in priorityItems"
                  :key="item.value"
                  type="button"
                  role="radio"
                  :aria-checked="priority === item.value"
                  class="flex items-center gap-2.5 px-4 py-3 rounded-[10px] border-2 text-[13px] font-semibold transition-colors"
                  :class="priority === item.value
                    ? priorityClasses[WorksitePriorityColorMap[item.value]]
                    : 'border-default bg-elevated/50 text-muted hover:border-accented'"
                  @click="priority = item.value"
                >
                  <span
                    class="size-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    :class="priority === item.value ? 'border-current' : 'border-accented'"
                  >
                    <span
                      v-if="priority === item.value"
                      class="size-2 rounded-full bg-current"
                    />
                  </span>
                  {{ item.label }}
                </button>
              </div>
            </UFormField>

            <UFormField
              v-if="isEdit"
              :label="t('worksite.form.status')"
              name="worksite_status"
              required
              :error="errors.worksite_status"
            >
              <USelect
                v-model="worksiteStatus"
                :items="statusItems"
                class="w-full"
              />
            </UFormField>
          </section>

          <section class="flex flex-col gap-4">
            <FormSectionDivider :label="t('worksite.form.address')" />

            <UFormField
              :label="t('worksite.form.street')"
              name="street"
              :error="errors.street"
            >
              <UInput
                v-model="street"
                :placeholder="t('worksite.form.streetPlaceholder')"
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <UFormField
                :label="t('worksite.form.zipCode')"
                name="zip_code"
                :error="errors.zip_code"
              >
                <UInput
                  v-model="zipCode"
                  inputmode="numeric"
                  placeholder="75001"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                :label="t('worksite.form.city')"
                name="city"
                :error="errors.city"
              >
                <UInput
                  v-model="city"
                  placeholder="Paris"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                :label="t('worksite.form.country')"
                name="country"
                :error="errors.country"
              >
                <UInput
                  v-model="country"
                  placeholder="France"
                  class="w-full"
                />
              </UFormField>
            </div>
          </section>

          <section class="flex flex-col gap-4">
            <FormSectionDivider :label="t('worksite.form.responsibleSection')" />

            <UFormField
              :label="t('worksite.form.responsible')"
              name="user_id"
              :error="errors.user_id"
            >
              <USelectMenu
                v-model="userId"
                :items="userItems"
                value-key="value"
                :placeholder="t('worksite.form.responsiblePlaceholder')"
                class="w-full"
              />
            </UFormField>
          </section>
        </fieldset>
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
        form="worksite-form"
        color="secondary"
        :disabled="!isUnlocked || loading"
        :loading="isSubmitting"
        :label="isEdit ? t('base.btn.save') : t('worksite.form.submit')"
      />
    </template>
  </UModal>
</template>

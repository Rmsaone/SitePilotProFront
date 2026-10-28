<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { Paginated, Resource } from '~/components/Tables/Types/api.interface';
import type { ClientDetail } from '~/components/Clients/Types/client.interface';
import { ClientTypeEnum, ClientTypeEnumMap } from '~/components/Clients/Types/clientTypeEnum';
import type { WorksiteUser } from '~/components/Worksites/Types/worksite.interface';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  /** null to create a client */
  clientId: number | null;
}>();

const emit = defineEmits<{
  saved: [client: ClientDetail, created: boolean];
}>();

const { t } = useI18n();
const client = useSanctumClient();
const { handle } = useApiErrors();
const { user } = useAuthUser();

const isEdit = computed(() => props.clientId !== null);
const loading = ref(false);
const users = ref<WorksiteUser[]>([]);

const required = () => z.string({ required_error: t('auth.validation.required') }).trim().min(1, t('auth.validation.required'));

const schema = toTypedSchema(z.object({
  client_type: z.nativeEnum(ClientTypeEnum),
  contact_name: required().max(255),
  private_name: z.string().max(255).optional(),
  email: required().email(t('auth.validation.email')),
  phone: required().max(20),
  company: z.string().max(255).optional(),
  siret: z.string().optional(),
  tva_intra: z.string().max(20).optional(),
  street: required().max(255),
  zip_code: required().regex(/^\d{4,5}$/, t('worksite.form.zipInvalid')),
  city: required().max(255),
  country: required().max(255),
  user_id: z.number({ required_error: t('auth.validation.required'), invalid_type_error: t('auth.validation.required') })
}).superRefine((values, context) => {
  if (values.client_type !== ClientTypeEnum.Pro) {
    return;
  }
  if (!values.company?.trim()) {
    context.addIssue({ code: 'custom', path: ['company'], message: t('auth.validation.required') });
  }
  if (!/^\d{14}$/.test((values.siret ?? '').replace(/\s+/g, ''))) {
    context.addIssue({ code: 'custom', path: ['siret'], message: t('client.form.siretInvalid') });
  }
  if (!values.tva_intra?.trim()) {
    context.addIssue({ code: 'custom', path: ['tva_intra'], message: t('auth.validation.required') });
  }
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors, resetForm, values } = useForm({
  validationSchema: schema
});

const [clientType] = defineField('client_type');
const [contactName] = defineField('contact_name');
const [privateName] = defineField('private_name');
const [email] = defineField('email');
const [phone] = defineField('phone');
const [company] = defineField('company');
const [siret] = defineField('siret');
const [tvaIntra] = defineField('tva_intra');
const [street] = defineField('street');
const [zipCode] = defineField('zip_code');
const [city] = defineField('city');
const [country] = defineField('country');
const [userId] = defineField('user_id');

const isPro = computed(() => values.client_type === ClientTypeEnum.Pro);

const typeItems = Object.values(ClientTypeEnum).map(value => ({ value, label: ClientTypeEnumMap.get(value) ?? value }));
const userItems = computed(() => users.value.map(item => ({ value: item.id, label: item.full_name, description: item.user_role_title })));

async function load(): Promise<void> {
  loading.value = true;
  resetForm({
    values: {
      client_type: ClientTypeEnum.Private,
      country: 'France',
      user_id: user.value?.id
    }
  });

  try {
    const [userResponse, clientResponse] = await Promise.all([
      client<Paginated<WorksiteUser>>('/api/v1/users'),
      props.clientId !== null ? client<Resource<ClientDetail>>(`/api/v1/clients/${props.clientId}`) : Promise.resolve(null)
    ]);
    users.value = userResponse.data;

    if (clientResponse) {
      const data = clientResponse.data;
      resetForm({
        values: {
          client_type: data.client_type,
          contact_name: data.contact_name,
          private_name: data.private_name ?? '',
          email: data.email,
          phone: data.phone,
          company: data.company ?? '',
          siret: data.siret ?? '',
          tva_intra: data.tva_intra ?? '',
          street: data.street,
          zip_code: String(data.zip_code),
          city: data.city,
          country: data.country,
          user_id: data.responsible?.id
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
    const response = await client<Resource<ClientDetail>>(isEdit.value ? `/api/v1/clients/${props.clientId}` : '/api/v1/clients', {
      method: isEdit.value ? 'put' : 'post',
      body: {
        ...formValues,
        zip_code: Number(formValues.zip_code),
        company: formValues.company || null,
        private_name: formValues.private_name || null,
        siret: isPro.value ? formValues.siret : null,
        tva_intra: isPro.value ? formValues.tva_intra : null
      }
    });
    emit('saved', response.data, !isEdit.value);
  } catch (error) {
    handle(error, setErrors);
  }
});
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? t('client.form.editTitle') : t('client.form.createTitle')"
    :description="t('client.form.subtitle')"
    :ui="{
      content: 'max-w-160',
      header: 'bg-primary-700',
      title: 'text-xl font-extrabold text-white',
      description: 'text-primary-200',
      close: 'text-white hover:bg-white/10',
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
        id="client-form"
        class="flex flex-col gap-5"
        novalidate
        @submit="onSubmit"
      >
        <UTabs
          v-model="clientType"
          :items="typeItems"
          :content="false"
          size="sm"
          class="self-start"
          :ui="{ list: 'bg-elevated rounded-[10px] p-1', indicator: 'bg-primary-700 rounded-lg', trigger: 'px-4 text-xs font-semibold data-[state=active]:text-white' }"
        />

        <section class="flex flex-col gap-4">
          <FormSectionDivider :label="t('client.form.identity')" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              :label="t('client.form.contactName')"
              name="contact_name"
              required
              :error="errors.contact_name"
            >
              <UInput
                v-model="contactName"
                placeholder="ex. Jean Dupont"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('client.form.privateName')"
              name="private_name"
              :error="errors.private_name"
            >
              <UInput
                v-model="privateName"
                placeholder="ex. Villa Les Pins"
                class="w-full"
              />
            </UFormField>
          </div>
        </section>

        <section class="flex flex-col gap-4">
          <FormSectionDivider :label="t('client.form.contact')" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              :label="t('client.form.email')"
              name="email"
              required
              :error="errors.email"
            >
              <UInput
                v-model="email"
                type="email"
                icon="i-lucide-mail"
                placeholder="jean.dupont@exemple.fr"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('client.form.phone')"
              name="phone"
              required
              :error="errors.phone"
            >
              <UInput
                v-model="phone"
                type="tel"
                icon="i-lucide-phone"
                placeholder="06 12 34 56 78"
                class="w-full"
              />
            </UFormField>
          </div>
        </section>

        <section
          v-if="isPro"
          class="flex flex-col gap-4"
        >
          <FormSectionDivider :label="t('client.form.company')" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              :label="t('client.form.companyName')"
              name="company"
              required
              :error="errors.company"
            >
              <UInput
                v-model="company"
                placeholder="ex. BTP Sarl"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('client.form.siret')"
              name="siret"
              required
              :error="errors.siret"
            >
              <UInput
                v-model="siret"
                placeholder="ex. 123 456 789 00012"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField
            :label="t('client.form.tvaIntra')"
            name="tva_intra"
            required
            :error="errors.tva_intra"
          >
            <UInput
              v-model="tvaIntra"
              placeholder="ex. FR 12 345678901"
              class="w-full"
            />
          </UFormField>
        </section>

        <section class="flex flex-col gap-4">
          <FormSectionDivider :label="t('client.form.address')" />
          <UFormField
            :label="t('client.form.street')"
            name="street"
            required
            :error="errors.street"
          >
            <UInput
              v-model="street"
              placeholder="ex. 12 avenue des Fleurs"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UFormField
              :label="t('client.form.zipCode')"
              name="zip_code"
              required
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
              :label="t('client.form.city')"
              name="city"
              required
              :error="errors.city"
            >
              <UInput
                v-model="city"
                placeholder="Paris"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('client.form.country')"
              name="country"
              required
              :error="errors.country"
            >
              <UInput
                v-model="country"
                class="w-full"
              />
            </UFormField>
          </div>
        </section>

        <section class="flex flex-col gap-4">
          <FormSectionDivider :label="t('client.form.responsibleSection')" />
          <UFormField
            :label="t('client.form.responsible')"
            name="user_id"
            required
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
        form="client-form"
        color="secondary"
        :disabled="loading"
        :loading="isSubmitting"
        :label="isEdit ? t('base.btn.save') : t('client.form.submit')"
      />
    </template>
  </UModal>
</template>

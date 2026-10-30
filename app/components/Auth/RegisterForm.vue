<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const emit = defineEmits<{
  login: [];
}>();

const { t } = useI18n();
const client = useSanctumClient();
const { refreshIdentity } = useSanctumAuth();
const { handle } = useApiErrors();
const passwordSchema = usePasswordSchema();

const required = () => z.string({ required_error: t('auth.validation.required') }).trim().min(1, t('auth.validation.required'));

const schema = toTypedSchema(z.object({
  first_name: required(),
  last_name: required(),
  email: required().email(t('auth.validation.email')),
  phone: required().max(20),
  password: passwordSchema,
  password_confirmation: required(),
  affiliation_code: z.string().max(20).optional()
}).refine(values => values.password === values.password_confirmation, {
  message: t('auth.validation.passwordMatch'),
  path: ['password_confirmation']
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors } = useForm({
  validationSchema: schema
});

const [firstName] = defineField('first_name');
const [lastName] = defineField('last_name');
const [email] = defineField('email');
const [phone] = defineField('phone');
const [password] = defineField('password');
const [passwordConfirmation] = defineField('password_confirmation');
const [affiliationCode] = defineField('affiliation_code');

const onSubmit = handleSubmit(async (values) => {
  try {
    await client('/api/v1/auth/register', {
      method: 'post',
      body: {
        ...values,
        affiliation_code: values.affiliation_code || null
      }
    });

    await refreshIdentity();
    await navigateTo('/');
  } catch (error) {
    handle(error, setErrors);
  }
});
</script>

<template>
  <form
    class="flex flex-col gap-3"
    novalidate
    @submit="onSubmit"
  >
    <div class="grid grid-cols-2 gap-3">
      <UFormField
        :label="t('auth.register.firstName')"
        name="first_name"
        required
        :error="errors.first_name"
      >
        <UInput
          v-model="firstName"
          size="lg"
          autocomplete="given-name"
          placeholder="Jean"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="t('auth.register.lastName')"
        name="last_name"
        required
        :error="errors.last_name"
      >
        <UInput
          v-model="lastName"
          size="lg"
          autocomplete="family-name"
          placeholder="Dupont"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField
      :label="t('auth.register.email')"
      name="email"
      required
      :error="errors.email"
    >
      <UInput
        v-model="email"
        type="email"
        size="lg"
        icon="i-lucide-mail"
        autocomplete="email"
        placeholder="jean.dupont@exemple.fr"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('auth.register.phone')"
      name="phone"
      required
      :error="errors.phone"
    >
      <UInput
        v-model="phone"
        type="tel"
        size="lg"
        icon="i-lucide-phone"
        autocomplete="tel"
        placeholder="06 12 34 56 78"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('auth.register.password')"
      name="password"
      required
      :error="errors.password"
    >
      <AuthPasswordInput
        v-model="password"
        autocomplete="new-password"
      />
    </UFormField>

    <UFormField
      :label="t('auth.register.passwordConfirmation')"
      name="password_confirmation"
      required
      :error="errors.password_confirmation"
    >
      <AuthPasswordInput
        v-model="passwordConfirmation"
        autocomplete="new-password"
      />
    </UFormField>

    <UFormField
      name="affiliation_code"
      :error="errors.affiliation_code"
    >
      <template #label>
        {{ t('auth.register.affiliationCode') }}
        <span class="text-dimmed font-normal">{{ t('auth.register.optional') }}</span>
      </template>
      <UInput
        :model-value="affiliationCode"
        size="lg"
        icon="i-lucide-hash"
        :maxlength="20"
        :placeholder="t('auth.register.affiliationPlaceholder')"
        class="w-full"
        :ui="{ base: 'font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal' }"
        @update:model-value="value => affiliationCode = String(value).toUpperCase()"
      />
    </UFormField>

    <UButton
      type="submit"
      color="secondary"
      size="xl"
      block
      class="mt-1 font-bold shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
      :loading="isSubmitting"
      :label="t('auth.register.submit')"
    />

    <p class="text-center text-xs text-dimmed">
      {{ t('auth.register.alreadyRegistered') }}
      <UButton
        variant="link"
        size="xs"
        class="p-0 font-semibold text-primary-700 dark:text-primary-300"
        :label="t('auth.register.login')"
        @click="emit('login')"
      />
    </p>
  </form>
</template>

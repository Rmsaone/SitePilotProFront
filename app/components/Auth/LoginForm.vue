<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const emit = defineEmits<{
  register: [];
}>();

const { t } = useI18n();
const toast = useToast();
const config = useRuntimeConfig();
const { login } = useSanctumAuth();
const { handle } = useApiErrors();

const schema = toTypedSchema(z.object({
  email: z.string({ required_error: t('auth.validation.required') }).email(t('auth.validation.email')),
  password: z.string({ required_error: t('auth.validation.required') }).min(1, t('auth.validation.required'))
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors, setValues } = useForm({
  validationSchema: schema
});

const [email] = defineField('email');
const [password] = defineField('password');

const hasDemo = computed(() => Boolean(config.public.demoEmail && config.public.demoPassword));

const onSubmit = handleSubmit(async (values) => {
  try {
    await login(values);
  } catch (error) {
    handle(error, setErrors);
  }
});

async function loginWithDemo(): Promise<void> {
  setValues({
    email: config.public.demoEmail as string,
    password: config.public.demoPassword as string
  });
  await onSubmit();
}

function onForgotPassword(): void {
  toast.add({ title: t('base.toast.comingSoon'), icon: 'i-lucide-info' });
}
</script>

<template>
  <form
    class="flex flex-col gap-5"
    novalidate
    @submit="onSubmit"
  >
    <div>
      <h2 class="text-[26px] font-extrabold text-highlighted">
        {{ t('auth.login.title') }}
      </h2>
      <p class="text-[13px] text-muted mt-1">
        {{ t('auth.login.subtitle') }}
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <UFormField
        :label="t('auth.login.email')"
        name="email"
        :error="errors.email"
      >
        <UInput
          v-model="email"
          type="email"
          size="lg"
          icon="i-lucide-mail"
          autocomplete="email"
          placeholder="vous@exemple.fr"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('auth.login.password')"
        name="password"
        :error="errors.password"
      >
        <template #hint>
          <UButton
            variant="link"
            color="secondary"
            size="xs"
            class="p-0"
            :label="t('auth.login.forgot')"
            @click="onForgotPassword"
          />
        </template>
        <AuthPasswordInput
          v-model="password"
          autocomplete="current-password"
        />
      </UFormField>
    </div>

    <UButton
      type="submit"
      color="secondary"
      size="xl"
      block
      class="font-bold shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
      :loading="isSubmitting"
      :label="t('auth.login.submit')"
    />

    <p class="text-center text-xs text-dimmed">
      {{ t('auth.login.noAccount') }}
      <UButton
        variant="link"
        color="primary"
        size="xs"
        class="p-0 font-semibold text-primary-700 dark:text-primary-300"
        :label="t('auth.login.createAccount')"
        @click="emit('register')"
      />
    </p>

    <template v-if="hasDemo">
      <USeparator :label="t('auth.login.or')" />

      <UButton
        color="neutral"
        variant="outline"
        size="xl"
        block
        icon="i-lucide-rocket"
        class="border-2 border-dashed ring-0 border-default text-muted hover:border-secondary hover:text-secondary hover:bg-secondary-50"
        :label="t('auth.login.demo')"
        :disabled="isSubmitting"
        @click="loginWithDemo"
      />
    </template>
  </form>
</template>

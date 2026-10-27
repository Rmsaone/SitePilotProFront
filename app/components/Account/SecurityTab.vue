<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const { t, tm, rt } = useI18n();
const toast = useToast();
const nuxtApp = useNuxtApp();
const client = useSanctumClient();
const appConfig = useSanctumAppConfig();
const { setUser } = useAuthUser();
const { handle } = useApiErrors();
const passwordSchema = usePasswordSchema();

const hints = computed(() => (tm('account.security.hints') as string[]).map(hint => rt(hint)));

const schema = toTypedSchema(z.object({
  current_password: z.string({ required_error: t('auth.validation.required') }).min(1, t('auth.validation.required')),
  password: passwordSchema,
  password_confirmation: z.string({ required_error: t('auth.validation.required') })
}).refine(values => values.password === values.password_confirmation, {
  message: t('auth.validation.passwordMatch'),
  path: ['password_confirmation']
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors, resetForm } = useForm({
  validationSchema: schema
});

const [currentPassword] = defineField('current_password');
const [password] = defineField('password');
const [passwordConfirmation] = defineField('password_confirmation');

const onSubmit = handleSubmit(async (values) => {
  try {
    await client('/api/v1/profile/password', {
      method: 'put',
      body: values
    });

    resetForm();
    toast.add({ title: t('account.security.saved'), color: 'success', icon: 'i-lucide-circle-check' });
  } catch (error) {
    handle(error, setErrors);
  }
});

const loggingOut = ref(false);

async function logoutEverywhere(): Promise<void> {
  loggingOut.value = true;

  try {
    await client('/api/v1/auth/logout-everywhere', { method: 'post' });
    await appConfig.tokenStorage?.set(nuxtApp, undefined);
    setUser(null);
    await navigateTo('/login');
  } catch (error) {
    handle(error);
  } finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <form
      novalidate
      @submit="onSubmit"
    >
      <AccountCard
        :title="t('account.security.changePassword')"
        icon="i-lucide-lock"
      >
        <div class="flex flex-col gap-4">
          <UFormField
            :label="t('account.security.currentPassword')"
            name="current_password"
            required
            :error="errors.current_password"
          >
            <AuthPasswordInput
              v-model="currentPassword"
              size="md"
              autocomplete="current-password"
            />
          </UFormField>
          <UFormField
            :label="t('account.security.newPassword')"
            name="password"
            required
            :error="errors.password"
          >
            <AuthPasswordInput
              v-model="password"
              size="md"
              autocomplete="new-password"
            />
          </UFormField>
          <UFormField
            :label="t('account.security.confirmPassword')"
            name="password_confirmation"
            required
            :error="errors.password_confirmation"
          >
            <AuthPasswordInput
              v-model="passwordConfirmation"
              size="md"
              autocomplete="new-password"
            />
          </UFormField>

          <ul class="grid grid-cols-2 gap-2 mt-1">
            <li
              v-for="hint in hints"
              :key="hint"
              class="flex items-center gap-1.5 text-[11px] text-dimmed"
            >
              <span class="size-1.5 rounded-full bg-accented" />
              {{ hint }}
            </li>
          </ul>

          <div class="flex justify-end pt-3 border-t border-default">
            <UButton
              type="submit"
              color="secondary"
              size="lg"
              :loading="isSubmitting"
              :label="t('account.security.submit')"
            />
          </div>
        </div>
      </AccountCard>
    </form>

    <AccountCard
      :title="t('account.security.dangerZone')"
      icon="i-lucide-x"
      danger
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-[13px] font-semibold text-toned">
            {{ t('account.security.logoutAll') }}
          </p>
          <p class="text-xs text-dimmed mt-0.5">
            {{ t('account.security.logoutAllHint') }}
          </p>
        </div>
        <UButton
          color="error"
          variant="outline"
          class="ring-2"
          :loading="loggingOut"
          :label="t('account.security.logoutAllButton')"
          @click="logoutEverywhere"
        />
      </div>
    </AccountCard>
  </div>
</template>

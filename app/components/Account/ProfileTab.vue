<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { UserResponse } from '~/components/Account/Types/user.interface';
import {
  UserRoleDescriptionMap,
  UserRoleEnum,
  UserRoleEnumMap
} from '~/components/Account/Types/userRoleEnum';

const { t } = useI18n();
const toast = useToast();
const client = useSanctumClient();
const { user, isAdmin, setUser } = useAuthUser();
const { handle } = useApiErrors();

const required = () => z.string({ required_error: t('auth.validation.required') }).trim().min(1, t('auth.validation.required'));

const schema = toTypedSchema(z.object({
  first_name: required(),
  last_name: required(),
  email: required().email(t('auth.validation.email')),
  phone: required().max(20),
  user_role: z.nativeEnum(UserRoleEnum).optional()
}));

const { defineField, errors, handleSubmit, isSubmitting, setErrors, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    first_name: user.value?.first_name,
    last_name: user.value?.last_name,
    email: user.value?.email,
    phone: user.value?.phone,
    user_role: user.value?.user_role
  }
});

const [firstName] = defineField('first_name');
const [lastName] = defineField('last_name');
const [email] = defineField('email');
const [phone] = defineField('phone');
const [userRole] = defineField('user_role');

const roleItems = computed(() => Object.values(UserRoleEnum).map(role => ({
  value: role,
  label: UserRoleEnumMap.get(role),
  description: UserRoleDescriptionMap.get(role)
})));

const onSubmit = handleSubmit(async (values) => {
  try {
    const body = isAdmin.value ? values : { ...values, user_role: undefined };
    const response = await client<UserResponse>('/api/v1/profile', {
      method: 'put',
      body
    });

    setUser(response.data);
    resetForm({ values: { ...response.data } });
    toast.add({ title: t('account.profile.saved'), color: 'success', icon: 'i-lucide-circle-check' });
  } catch (error) {
    handle(error, setErrors);
  }
});
</script>

<template>
  <form
    class="flex flex-col gap-5"
    novalidate
    @submit="onSubmit"
  >
    <AccountCard
      :title="t('account.profile.personalInfo')"
      icon="i-lucide-user"
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField
            :label="t('account.profile.firstName')"
            name="first_name"
            required
            :error="errors.first_name"
          >
            <UInput
              v-model="firstName"
              autocomplete="given-name"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('account.profile.lastName')"
            name="last_name"
            required
            :error="errors.last_name"
          >
            <UInput
              v-model="lastName"
              autocomplete="family-name"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField
          :label="t('account.profile.email')"
          name="email"
          required
          :error="errors.email"
        >
          <UInput
            v-model="email"
            type="email"
            icon="i-lucide-mail"
            autocomplete="email"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="t('account.profile.phone')"
          name="phone"
          required
          :error="errors.phone"
        >
          <UInput
            v-model="phone"
            type="tel"
            icon="i-lucide-phone"
            autocomplete="tel"
            class="w-full"
          />
        </UFormField>
      </div>
    </AccountCard>

    <AccountCard
      v-if="isAdmin"
      :title="t('account.profile.roleAccess')"
      icon="i-lucide-settings"
    >
      <UFormField
        name="user_role"
        :error="errors.user_role"
      >
        <URadioGroup
          v-model="userRole"
          :items="roleItems"
          variant="card"
          orientation="horizontal"
          :ui="{
            fieldset: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
            item: 'rounded-[10px] has-data-[state=checked]:border-primary-700 has-data-[state=checked]:bg-primary-50 dark:has-data-[state=checked]:bg-primary-950',
            label: 'text-[13px] font-semibold',
            description: 'text-[11px]'
          }"
        />
      </UFormField>
    </AccountCard>

    <div class="flex justify-end">
      <UButton
        type="submit"
        color="secondary"
        size="lg"
        :loading="isSubmitting"
        :label="t('account.profile.save')"
      />
    </div>
  </form>
</template>

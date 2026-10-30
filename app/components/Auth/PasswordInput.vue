<script setup lang="ts">
const model = defineModel<string>();

defineProps<{
  id?: string;
  size?: 'md' | 'lg' | 'xl';
  autocomplete?: string;
}>();

const { t } = useI18n();
const visible = ref(false);
</script>

<template>
  <UInput
    :id="id"
    v-model="model"
    :type="visible ? 'text' : 'password'"
    :size="size ?? 'lg'"
    :autocomplete="autocomplete"
    icon="i-lucide-lock"
    placeholder="••••••••"
    class="w-full"
    :ui="{ trailing: 'pe-1' }"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="visible ? t('auth.hidePassword') : t('auth.showPassword')"
        :aria-pressed="visible"
        @click="visible = !visible"
      />
    </template>
  </UInput>
</template>

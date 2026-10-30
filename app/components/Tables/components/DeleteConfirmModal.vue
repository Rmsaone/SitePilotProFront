<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false });

defineProps<{
  label: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();

const { t } = useI18n();
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'max-w-100', header: 'bg-error/5 border-error/20', footer: 'justify-end' }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="size-9 rounded-full bg-error/10 flex items-center justify-center shrink-0">
          <UIcon
            name="i-lucide-trash-2"
            class="size-4 text-error"
          />
        </span>
        <h2 class="text-base font-bold text-error">
          {{ t('base.modal.titleDelete') }}
        </h2>
      </div>
    </template>

    <template #body>
      <p class="text-sm text-toned">
        {{ t('base.modal.deleteTarget') }}
        <strong class="text-highlighted">« {{ label }} »</strong>.
      </p>
      <p class="text-xs text-dimmed mt-1.5">
        {{ t('base.modal.irreversibleMessage') }}
      </p>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="t('base.btn.cancel')"
        @click="open = false"
      />
      <UButton
        color="error"
        :loading="loading"
        :label="t('base.btn.deleteForever')"
        @click="emit('confirm')"
      />
    </template>
  </UModal>
</template>

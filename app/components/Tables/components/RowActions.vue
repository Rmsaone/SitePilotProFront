<script setup lang="ts">
withDefaults(defineProps<{
  view?: boolean;
  edit?: boolean;
  remove?: boolean;
  /** Extra "convert to invoice" action (quotes) */
  convert?: boolean;
  convertDisabled?: boolean;
  download?: boolean;
}>(), {
  view: true,
  edit: true,
  remove: true,
  convert: false,
  convertDisabled: false,
  download: false
});

const emit = defineEmits<{
  view: [];
  edit: [];
  remove: [];
  convert: [];
  download: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div
    class="flex items-center gap-0.5"
    role="group"
    :aria-label="t('base.actions.label')"
  >
    <UTooltip
      v-if="view"
      :text="t('base.actions.view')"
    >
      <UButton
        icon="i-lucide-eye"
        color="info"
        variant="ghost"
        size="sm"
        :aria-label="t('base.actions.view')"
        @click.stop="emit('view')"
      />
    </UTooltip>
    <UTooltip
      v-if="convert"
      :text="convertDisabled ? t('base.actions.convertSoon') : t('base.actions.convert')"
    >
      <UButton
        icon="i-lucide-arrow-right-left"
        color="neutral"
        variant="ghost"
        size="sm"
        class="text-violet-600 disabled:opacity-40"
        :disabled="convertDisabled"
        :aria-label="t('base.actions.convert')"
        @click.stop="emit('convert')"
      />
    </UTooltip>
    <UTooltip
      v-if="edit"
      :text="t('base.actions.edit')"
    >
      <UButton
        icon="i-lucide-pencil"
        color="warning"
        variant="ghost"
        size="sm"
        :aria-label="t('base.actions.edit')"
        @click.stop="emit('edit')"
      />
    </UTooltip>
    <UTooltip
      v-if="download"
      :text="t('base.actions.download')"
    >
      <UButton
        icon="i-lucide-arrow-down-to-line"
        color="success"
        variant="ghost"
        size="sm"
        :aria-label="t('base.actions.download')"
        @click.stop="emit('download')"
      />
    </UTooltip>
    <UTooltip
      v-if="remove"
      :text="t('base.actions.delete')"
    >
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="sm"
        :aria-label="t('base.actions.delete')"
        @click.stop="emit('remove')"
      />
    </UTooltip>
  </div>
</template>

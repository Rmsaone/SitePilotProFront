<script setup lang="ts">
withDefaults(defineProps<{
  view?: boolean;
  edit?: boolean;
  remove?: boolean;
}>(), {
  view: true,
  edit: true,
  remove: true
});

const emit = defineEmits<{
  view: [];
  edit: [];
  remove: [];
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

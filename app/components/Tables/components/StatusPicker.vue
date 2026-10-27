<script setup lang="ts" generic="T extends string">
import type { BadgeColor } from '~/components/Tables/Types/api.interface';

const props = defineProps<{
  status: T;
  options: T[];
  label: (status: T) => string;
  color: (status: T) => BadgeColor;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [status: T];
}>();

const items = computed(() => props.options.map(option => ({
  label: props.label(option),
  checked: option === props.status,
  type: 'checkbox' as const,
  onSelect: () => {
    if (option !== props.status) {
      emit('change', option);
    }
  }
})));
</script>

<template>
  <UDropdownMenu
    :items="items"
    :disabled="disabled"
    :content="{ align: 'start' }"
  >
    <UButton
      variant="link"
      class="p-0"
      trailing-icon="i-lucide-chevron-down"
      :ui="{ trailingIcon: 'size-3 text-dimmed' }"
      @click.stop
    >
      <UBadge
        :color="color(status)"
        variant="subtle"
        class="font-semibold"
        :label="label(status)"
      />
    </UButton>
  </UDropdownMenu>
</template>

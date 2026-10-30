<script setup lang="ts">
const search = defineModel<string>('search', { default: '' });

defineProps<{
  searchPlaceholder: string;
  count: number;
  countLabel: string;
  addLabel?: string;
}>();

const emit = defineEmits<{
  add: [];
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          class="w-full sm:w-65"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
        />
        <slot name="filters" />
      </div>
      <UButton
        v-if="addLabel"
        icon="i-lucide-plus"
        color="secondary"
        :label="addLabel"
        @click="emit('add')"
      />
    </div>

    <UCard :ui="{ root: 'rounded-xl overflow-hidden', body: 'p-0 sm:p-0' }">
      <slot />
      <div class="px-4 py-3 border-t border-default">
        <p class="text-xs text-muted">
          {{ count }} {{ countLabel }}
        </p>
      </div>
    </UCard>
  </div>
</template>

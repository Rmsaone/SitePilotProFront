<script setup lang="ts">
defineProps<{
  title: string;
  icon: string;
  danger?: boolean;
}>();
</script>

<template>
  <UCard
    :ui="{
      root: danger ? 'ring-error/30 rounded-[14px] overflow-hidden' : 'rounded-[14px] overflow-hidden',
      header: danger ? 'px-6 py-4 sm:px-6 bg-error/5 border-error/30' : 'px-6 py-4 sm:px-6',
      body: 'px-6 py-5 sm:px-6'
    }"
  >
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2
          class="flex items-center gap-2 text-sm font-bold"
          :class="danger ? 'text-error' : 'text-highlighted'"
        >
          <UIcon
            :name="icon"
            class="size-4"
            :class="danger ? 'text-error' : 'text-secondary'"
          />
          {{ title }}
        </h2>
        <slot name="actions" />
      </div>
    </template>

    <slot />
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <div class="flex items-center gap-3 mt-1">
    <span class="h-0.5 w-3 bg-secondary rounded-full shrink-0" />
    <span class="text-[11px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-[0.1em] whitespace-nowrap">{{ label }}</span>
    <span class="flex-1 h-px bg-(--ui-border)" />
  </div>
</template>

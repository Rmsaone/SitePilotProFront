<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const items: DropdownMenuItem[] = [
  {
    type: 'label',
    label: 'Actions'
  },
  { label: 'Voir fiche' },
  { type: 'separator' },
  { label: 'Modifier' },
  { label: 'Supprimer' }
];
</script>

<template>
  <UDropdownMenu
    :items="items"
    content-align="end"
  >
    <div class="flex justify-center">
      <UButton
        icon="i-lucide-ellipsis-vertical"
        color="neutral"
        variant="ghost"
      />
    </div>
  </UDropdownMenu>
</template>

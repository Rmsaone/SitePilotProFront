<script setup lang="ts">
import { WorksiteStatusEnum, WorksiteStatusEnumMap } from '~/components/Worksites/Types/worksiteStatusEnum';

const search = defineModel<string>('search', { default: '' });
const selectedStatus = defineModel<WorksiteStatusEnum | 'all'>('selectedStatus', { default: 'all' });

const { t } = useI18n();

const statusOptions = computed(() => [
  { label: t('worksite.list.allStatuses'), value: 'all' as const },
  ...Object.values(WorksiteStatusEnum).map(status => ({
    label: WorksiteStatusEnumMap.get(status) ?? status,
    value: status
  }))
]);
</script>

<template>
  <div class="flex gap-2 flex-1 min-w-0">
    <UInput
      v-model="search"
      class="flex-1 max-w-sm"
      :placeholder="t('worksite.list.searchPlaceholder')"
      icon="i-lucide-search"
      :aria-label="t('worksite.list.search')"
    />
    <USelect
      v-model="selectedStatus"
      :items="statusOptions"
      class="w-44"
      :aria-label="t('worksite.list.statusSearch')"
    />
  </div>
</template>

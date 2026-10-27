<script setup lang="ts">
import UserMenu from '~/components/layout/UserMenu.vue';

const { t } = useI18n();
const route = useRoute();

const pageTitle = computed(() => {
  if (route.meta.i18nTitle) {
    return t(route.meta.i18nTitle as string);
  }
  return t('base.default');
});

useHead({
  title: pageTitle
});
</script>

<template>
  <UDashboardPanel id="main-content">
    <template #header>
      <UDashboardNavbar :ui="{ root: 'bg-default' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #title>
          <h1 class="text-base md:text-xl font-bold text-highlighted truncate">
            {{ pageTitle }}
          </h1>
        </template>

        <template #right>
          <UChip
            color="secondary"
            inset
            size="md"
          >
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-bell"
              :aria-label="t('base.notifications')"
            />
          </UChip>
          <UserMenu />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <slot />
    </template>
  </UDashboardPanel>
</template>

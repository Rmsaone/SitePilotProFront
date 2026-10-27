<script setup lang="ts">
import type { CommandPaletteGroup, NavigationMenuItem } from '@nuxt/ui';
import Logo from '~/assets/images/Logo.png';

const { t } = useI18n();
const open = ref(false);

const links = computed<NavigationMenuItem[][]>(() => [[{
  label: t('base.nav.dashboard'),
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  onSelect: () => {
    open.value = false;
  }
}, {
  label: t('base.nav.worksites'),
  icon: 'i-lucide-building-2',
  to: '/worksite',
  onSelect: () => {
    open.value = false;
  }
}, {
  label: t('base.nav.clients'),
  icon: 'i-lucide-users',
  to: '/client',
  onSelect: () => {
    open.value = false;
  }
}, {
  label: t('base.nav.quotes'),
  icon: 'i-lucide-file-text',
  disabled: true,
  badge: t('base.nav.soon')
}, {
  label: t('base.nav.invoices'),
  icon: 'i-lucide-receipt',
  disabled: true,
  badge: t('base.nav.soon')
}], [{
  label: t('base.nav.purchases'),
  icon: 'i-lucide-shopping-cart',
  disabled: true,
  badge: t('base.nav.soon')
}, {
  label: t('base.nav.timeTracking'),
  icon: 'i-lucide-clock',
  disabled: true,
  badge: t('base.nav.soon')
}, {
  label: t('base.nav.reports'),
  icon: 'i-lucide-trending-up',
  disabled: true,
  badge: t('base.nav.soon')
}]]);

const groups = computed<CommandPaletteGroup[]>(() => [{
  id: 'links',
  label: 'Pages',
  items: links.value[0]!
    .filter(link => !link.disabled)
    .map(link => ({ label: link.label, icon: link.icon, to: link.to }))
}]);

const navUi = {
  link: 'text-[13px] font-medium py-[9px]',
  linkLeadingIcon: 'size-4',
  linkTrailingBadge: 'text-[9px] font-bold uppercase tracking-wide'
};
</script>

<template>
  <UDashboardGroup unit="rem">
    <UButton
      to="#main-content"
      color="secondary"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200]"
      :label="t('base.skipToContent')"
    />

    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      class="bg-default"
      :ui="{ header: 'border-b border-default' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 min-w-0"
          :class="{ 'justify-center w-full': collapsed }"
        >
          <img
            :src="Logo"
            alt="SitePilotPro"
            class="size-8 object-contain shrink-0"
          >
          <span
            v-if="!collapsed"
            class="font-bold text-sm tracking-tight truncate"
          >
            <span class="text-primary-800 dark:text-white">SitePilot</span><span class="text-secondary">Pro</span>
          </span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <nav :aria-label="t('base.nav.main')">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[0]"
            orientation="vertical"
            color="info"
            tooltip
            :ui="navUi"
          />

          <USeparator class="my-2" />

          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[1]"
            orientation="vertical"
            tooltip
            class="opacity-60"
            :ui="navUi"
          />
        </nav>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />
    <LayoutAppHeader>
      <slot />
    </LayoutAppHeader>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import Logo from '~/assets/images/Logo.png';

const open = ref(false);

const links = [[{
  label: 'Tableau de Bord',
  icon: 'i-lucide-layout-dashboard',
  to: '/'
}, {
  label: 'Chantier',
  icon: 'i-lucide-hard-hat',
  to: '/worksite'
}, {
  label: 'Clients',
  icon: 'i-lucide-users',
  to: '/client'
}, {
  label: 'Devis',
  icon: 'i-lucide-file-text',
  to: '/devis'
}, {
  label: 'Factures',
  icon: 'i-lucide-receipt',
  to: '/factures'
}, {
  label: 'Achats',
  icon: 'i-lucide-shopping-cart',
  badge: 'Bientôt',
  class: 'opacity-50 pointer-events-none'
}, {
  label: 'Suivi du temps',
  icon: 'i-lucide-clock',
  badge: 'Bientôt',
  class: 'opacity-50 pointer-events-none'
}, {
  label: 'Rapports',
  icon: 'i-lucide-bar-chart-2',
  badge: 'Bientôt',
  class: 'opacity-50 pointer-events-none'
}], [{
  label: 'Settings',
  to: '/settings',
  icon: 'i-lucide-settings',
  defaultOpen: false,
  type: 'trigger',
  onSelect: () => {
    open.value = false;
  },
  children: [{
    label: 'General',
    to: '/settings'
  }, {
    label: 'Members',
    to: '/settings/members'
  }, {
    label: 'Notifications',
    to: '/settings/notifications'
  }, {
    label: 'Security',
    to: '/settings/security'
  }]
}]] satisfies NavigationMenuItem[][];

const groups = computed(() => [{
  id: 'links',
  label: 'Pages',
  items: links.flat()
}]);

const site = ref({
  name: 'SitePilot',
  suffixeName: 'Pro',
  avatar: {
    src: Logo,
    alt: 'SitePilotPro'
  }
});
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div class="flex justify-center w-full">
          <NuxtLink
            to="/"
            class="flex items-center gap-2"
          >
            <UAvatar
              v-bind="site.avatar"
              size="2xl"
            />
            <div v-if="!collapsed">
              <strong class="text-primary">
                {{ site.name }}
              </strong>
              <span class="text-secondary font-semibold">
                {{ site.suffixeName }}
              </span>
            </div>

          </NuxtLink>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />
    <LayoutAppHeader>
      <slot />
    </LayoutAppHeader>
  </UDashboardGroup>
</template>

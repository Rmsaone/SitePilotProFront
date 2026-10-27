<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const { t } = useI18n();
const { logout } = useSanctumAuth();
const { fullName, initials } = useAuthUser();

const items = computed<DropdownMenuItem[][]>(() => [[{
  type: 'label',
  label: fullName.value,
  avatar: { text: initials.value }
}], [{
  label: t('base.userMenu.account'),
  icon: 'i-lucide-user',
  to: '/account'
}, {
  label: t('base.userMenu.appearance'),
  icon: 'i-lucide-palette',
  to: { path: '/account', query: { tab: 'appearance' } }
}, {
  label: t('base.userMenu.documentation'),
  icon: 'i-lucide-book-open',
  to: '/documentation'
}, {
  label: t('base.userMenu.subscription'),
  icon: 'i-lucide-credit-card',
  to: { path: '/account', query: { tab: 'subscription' } }
}, {
  label: t('base.userMenu.settings'),
  icon: 'i-lucide-settings',
  disabled: true
}], [{
  label: t('base.userMenu.logout'),
  icon: 'i-lucide-log-out',
  color: 'error',
  onSelect: () => logout()
}]]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', collisionPadding: 12 }"
    :ui="{ content: 'w-52' }"
  >
    <UButton
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-chevron-down"
      :avatar="{ text: initials, size: '2xs', ui: { root: 'bg-primary-700', fallback: 'text-white' } }"
      :label="fullName"
      :aria-label="t('base.userMenu.label')"
      :ui="{ label: 'hidden sm:inline' }"
    />
  </UDropdownMenu>
</template>

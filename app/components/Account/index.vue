<script setup lang="ts">
type AccountTab = 'profile' | 'security' | 'subscription' | 'appearance';

const ACCOUNT_TABS: AccountTab[] = ['profile', 'security', 'subscription', 'appearance'];

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { user, fullName, initials } = useAuthUser();

const tab = computed<AccountTab>({
  get: () => ACCOUNT_TABS.includes(route.query.tab as AccountTab)
    ? route.query.tab as AccountTab
    : 'profile',
  set: value => router.replace({ query: { ...route.query, tab: value } })
});

const tabs = computed(() => [
  { value: 'profile', label: t('account.tabs.profile'), icon: 'i-lucide-user' },
  { value: 'security', label: t('account.tabs.security'), icon: 'i-lucide-lock' },
  { value: 'subscription', label: t('account.tabs.subscription'), icon: 'i-lucide-credit-card' },
  { value: 'appearance', label: t('account.tabs.appearance'), icon: 'i-lucide-palette' }
]);
</script>

<template>
  <div class="-m-4 sm:-m-6 min-h-full bg-muted">
    <div class="bg-default border-b border-default shadow-xs">
      <div class="px-4 sm:px-8 pt-6 flex flex-col lg:flex-row lg:items-end gap-6">
        <div class="flex items-end gap-6">
          <div class="relative shrink-0">
            <div class="size-20 rounded-full bg-linear-to-br from-secondary to-secondary-600 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.35)] border-4 border-default">
              <span class="text-[28px] font-extrabold text-white">{{ initials }}</span>
            </div>
            <span class="absolute -bottom-1 -right-1 size-6 bg-success rounded-full border-2 border-default flex items-center justify-center">
              <UIcon
                name="i-lucide-circle-check"
                class="size-3 text-white"
              />
            </span>
          </div>

          <div class="pb-4">
            <p class="text-xl font-extrabold text-highlighted leading-tight">
              {{ fullName }}
            </p>
            <div class="flex flex-wrap items-center gap-2 mt-1">
              <UBadge
                color="secondary"
                variant="subtle"
                class="rounded-full uppercase font-bold tracking-[0.06em]"
                :label="user?.user_role_title"
              />
              <span class="text-xs text-muted">{{ user?.email }}</span>
            </div>
          </div>
        </div>

        <UTabs
          v-model="tab"
          :items="tabs"
          :content="false"
          variant="link"
          color="secondary"
          class="lg:ml-auto"
          :ui="{ list: 'border-b-0 overflow-x-auto', trigger: 'px-5 py-3 text-[13px]' }"
        />
      </div>
    </div>

    <div class="max-w-180 mx-auto px-4 py-8">
      <AccountProfileTab v-if="tab === 'profile'" />
      <AccountSecurityTab v-else-if="tab === 'security'" />
      <AccountSubscriptionTab v-else-if="tab === 'subscription'" />
      <AccountAppearanceTab v-else />
    </div>
  </div>
</template>

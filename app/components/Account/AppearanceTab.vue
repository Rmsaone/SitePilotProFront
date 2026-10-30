<script setup lang="ts">
type ThemePreference = 'light' | 'dark' | 'system';

const { t } = useI18n();
const colorMode = useColorMode();

const themes = computed(() => [
  { key: 'light' as ThemePreference, icon: 'i-lucide-sun', label: t('account.appearance.light'), description: t('account.appearance.lightDesc') },
  { key: 'dark' as ThemePreference, icon: 'i-lucide-moon', label: t('account.appearance.dark'), description: t('account.appearance.darkDesc') },
  { key: 'system' as ThemePreference, icon: 'i-lucide-monitor', label: t('account.appearance.system'), description: t('account.appearance.systemDesc') }
]);

const ratios = computed(() => [
  { label: t('account.appearance.ratios.lightText'), value: '8,2:1' },
  { label: t('account.appearance.ratios.darkText'), value: '7,1:1' },
  { label: t('account.appearance.ratios.primaryButtons'), value: '4,8:1' },
  { label: t('account.appearance.ratios.secondaryText'), value: '4,6:1' }
]);
</script>

<template>
  <div class="flex flex-col gap-5">
    <AccountCard
      :title="t('account.appearance.theme')"
      icon="i-lucide-palette"
    >
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          v-for="theme in themes"
          :key="theme.key"
          type="button"
          class="flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all"
          :class="colorMode.preference === theme.key
            ? 'border-secondary bg-secondary-50 dark:bg-secondary-950'
            : 'border-default bg-elevated/50 hover:border-accented'"
          :aria-pressed="colorMode.preference === theme.key"
          :aria-label="t('account.appearance.themeLabel', { label: theme.label })"
          @click="colorMode.preference = theme.key"
        >
          <span
            class="w-full h-14 rounded-lg overflow-hidden border border-default relative"
            :class="theme.key === 'dark' ? 'bg-[#0D1B2E]' : 'bg-[#F3F4F6]'"
          >
            <span
              class="absolute left-0 inset-y-0 w-1/4"
              :class="theme.key === 'dark' ? 'bg-[#07111E]' : 'bg-[#0F1F3D]'"
            />
            <span
              class="absolute left-1/4 top-1/4 right-1 bottom-1 rounded"
              :class="theme.key === 'dark' ? 'bg-[#152238]' : 'bg-white'"
            />
          </span>
          <span
            class="flex items-center gap-2"
            :class="colorMode.preference === theme.key ? 'text-secondary' : 'text-toned'"
          >
            <UIcon
              :name="theme.icon"
              class="size-5.5"
            />
            <span class="text-[13px] font-semibold">{{ theme.label }}</span>
          </span>
          <span class="text-[11px] text-dimmed text-center">{{ theme.description }}</span>
          <span
            v-if="colorMode.preference === theme.key"
            class="flex items-center gap-1 text-[11px] font-semibold text-secondary"
          >
            <UIcon
              name="i-lucide-circle-check"
              class="size-3"
            />
            {{ t('account.appearance.active') }}
          </span>
        </button>
      </div>
    </AccountCard>

    <AccountCard
      :title="t('account.appearance.accessibility')"
      icon="i-lucide-info"
    >
      <div class="flex flex-col gap-3">
        <p class="text-[13px] text-muted leading-relaxed">
          {{ t('account.appearance.accessibilityText') }}
          <strong class="text-toned">{{ t('account.appearance.accessibilityCriterion') }}</strong>
          {{ t('account.appearance.accessibilityTextEnd') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="ratio in ratios"
            :key="ratio.label"
            class="flex items-center justify-between p-3 rounded-lg bg-elevated/50 border border-default"
          >
            <span class="text-xs text-toned">{{ ratio.label }}</span>
            <span class="flex items-center gap-1.5 text-xs font-bold text-success">
              {{ ratio.value }}
              <UIcon
                name="i-lucide-circle-check"
                class="size-3.5"
              />
            </span>
          </div>
        </div>
      </div>
    </AccountCard>
  </div>
</template>

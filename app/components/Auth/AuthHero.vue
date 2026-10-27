<script setup lang="ts">
import LogoComplet from '~/assets/images/imageSitePilot.png';

const { t, tm, rt } = useI18n();

const features = computed(() => (tm('auth.features') as string[]).map(feature => rt(feature)));
</script>

<template>
  <div class="hidden lg:flex flex-col w-[52%] bg-white dark:bg-neutral-900 relative overflow-hidden border-r border-default">
    <div class="absolute inset-0 opacity-[0.03] auth-grid" />
    <div class="absolute -top-30 -right-30 size-100 rounded-full bg-secondary/8" />
    <div class="absolute -bottom-20 -left-20 size-80 rounded-full bg-primary-700/6" />
    <div class="absolute top-[45%] -right-15 size-50 rounded-full bg-info/8" />

    <div class="relative z-10 flex flex-col h-full px-12 py-10">
      <img
        :src="LogoComplet"
        alt="SitePilotPro"
        class="h-35 w-auto self-start object-contain object-left"
      >

      <div class="mt-10">
        <p class="text-[13px] font-bold text-secondary uppercase tracking-[0.14em] mb-3">
          {{ t('auth.tagline') }}
        </p>
        <h1 class="text-4xl font-extrabold text-primary-700 dark:text-white leading-[1.15] mb-4">
          {{ t('auth.heroTitleStart') }}
          <span class="text-secondary">{{ t('auth.heroTitleHighlight') }}</span>
          {{ t('auth.heroTitleEnd') }}
        </h1>
        <p class="text-muted text-sm leading-relaxed max-w-90">
          {{ t('auth.heroText') }}
        </p>

        <ul class="mt-7 flex flex-col gap-3">
          <li
            v-for="feature in features"
            :key="feature"
            class="flex items-center gap-3"
          >
            <span class="size-5 rounded-full bg-secondary-50 border border-secondary/30 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-circle-check"
                class="size-3.5 text-secondary"
              />
            </span>
            <span class="text-toned text-[13px] font-medium">{{ feature }}</span>
          </li>
        </ul>
      </div>

      <div class="mt-auto flex items-center gap-3 bg-elevated rounded-xl px-4 py-3 w-fit border border-default shadow-xs">
        <span class="size-8 rounded-full bg-secondary-50 border border-secondary/20 flex items-center justify-center">
          <UIcon
            name="i-lucide-building-2"
            class="size-3.5 text-secondary"
          />
        </span>
        <div>
          <p class="text-highlighted text-xs font-semibold">
            {{ t('auth.statsTitle') }}
          </p>
          <p class="text-muted text-[11px]">
            {{ t('auth.statsSubtitle') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-grid {
  background-image:
    linear-gradient(var(--color-primarySite-700) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-primarySite-700) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>

<script setup lang="ts">
defineProps<{
  label: string;
  value: number;
  icon: string;
  gradientClass: string;
  trend: number | null;
  to: string;
}>();

const { t } = useI18n();
</script>

<template>
  <NuxtLink
    :to="to"
    class="rounded-xl p-3 flex flex-col gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.10)] bg-linear-to-br hover:scale-[1.02] transition-transform"
    :class="gradientClass"
  >
    <div class="flex items-start justify-between">
      <span class="size-8 rounded-lg bg-white/20 flex items-center justify-center">
        <UIcon
          :name="icon"
          class="size-3.5 text-white"
        />
      </span>
      <span
        v-if="trend !== null"
        class="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/30 text-white"
        :aria-label="t('dashboard.trend')"
      >
        <UIcon
          :name="trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
          class="size-2.5"
        />
        {{ trend > 0 ? '+' : '' }}{{ trend.toLocaleString('fr-FR') }} %
      </span>
    </div>
    <div>
      <p class="text-[22px] font-extrabold text-white leading-none">
        {{ value }}
      </p>
      <p class="text-[11px] mt-0.5 text-white/80 font-medium">
        {{ label }}
      </p>
    </div>
  </NuxtLink>
</template>

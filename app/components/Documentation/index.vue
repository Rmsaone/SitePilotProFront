<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import {
  complianceChanges,
  lighthouseScores,
  type RgaaItem,
  rgaaItems,
  type RgaaStatus
} from '~/data/documentation';

type BadgeColor = 'success' | 'warning' | 'error' | 'neutral' | 'info';

const { t } = useI18n();

const CIRCUMFERENCE = 2 * Math.PI * 34;

const statusConfig: Record<RgaaStatus, { color: BadgeColor; icon: string }> = {
  pass: { color: 'success', icon: 'i-lucide-circle-check' },
  warn: { color: 'warning', icon: 'i-lucide-circle-alert' },
  fail: { color: 'error', icon: 'i-lucide-x' },
  na: { color: 'neutral', icon: 'i-lucide-info' }
};

const passCount = rgaaItems.filter(item => item.status === 'pass').length;
const warnCount = rgaaItems.filter(item => item.status === 'warn').length;

function scoreColor(score: number): BadgeColor {
  return score >= 90 ? 'success' : 'info';
}

function scoreTextClass(score: number): string {
  return score >= 90 ? 'text-success' : 'text-info';
}

function scoreLabel(score: number): string {
  if (score >= 90) {
    return t('documentation.score.excellent');
  }

  return score >= 70 ? t('documentation.score.good') : t('documentation.score.improve');
}

const columns = computed<TableColumn<RgaaItem>[]>(() => [
  { accessorKey: 'criterion', header: t('documentation.criterion'), meta: { class: { td: 'text-xs font-bold text-primary-700 dark:text-primary-300 whitespace-nowrap' } } },
  { accessorKey: 'label', header: t('documentation.label'), meta: { class: { td: 'text-[13px] text-toned' } } },
  { accessorKey: 'status', header: t('documentation.status') },
  { accessorKey: 'note', header: t('documentation.note'), meta: { class: { td: 'text-xs text-muted whitespace-normal' } } }
]);
</script>

<template>
  <div class="max-w-225 mx-auto py-2 flex flex-col gap-8">
    <div>
      <h2 class="flex items-center gap-2 mb-1 text-[22px] font-extrabold text-highlighted">
        <UIcon
          name="i-lucide-book-open"
          class="size-4.5 text-secondary"
        />
        {{ t('documentation.heading') }}
      </h2>
      <p class="text-[13px] text-muted">
        {{ t('documentation.subtitle') }}
      </p>
    </div>

    <section aria-labelledby="lighthouse-title">
      <h3
        id="lighthouse-title"
        class="text-[15px] font-bold text-highlighted mb-4 flex items-center gap-2"
      >
        <span class="w-1 h-5 bg-secondary rounded-full" />
        {{ t('documentation.lighthouseTitle') }}
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UCard
          v-for="item in lighthouseScores"
          :key="item.label"
          :ui="{ root: 'rounded-[14px]', body: 'p-5 sm:p-5 flex flex-col items-center gap-3' }"
        >
          <div
            class="relative size-20"
            :class="scoreTextClass(item.score)"
          >
            <svg
              viewBox="0 0 80 80"
              class="size-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                class="stroke-(--ui-bg-elevated)"
                stroke-width="8"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="currentColor"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="CIRCUMFERENCE * (1 - item.score / 100)"
              />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-xl font-extrabold">{{ item.score }}</span>
          </div>
          <span class="text-xs font-semibold text-toned text-center">{{ item.label }}</span>
          <UBadge
            :color="scoreColor(item.score)"
            variant="subtle"
            class="rounded-full"
            :label="scoreLabel(item.score)"
          />
        </UCard>
      </div>
      <UAlert
        color="info"
        variant="subtle"
        icon="i-lucide-info"
        class="mt-3"
      >
        <template #description>
          {{ t('documentation.lighthouseNote') }}
          {{ t('documentation.lighthouseNoteLink') }}
          <strong>{{ t('documentation.lighthouseNoteTool') }}</strong>.
        </template>
      </UAlert>
    </section>

    <section aria-labelledby="rgaa-title">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3
          id="rgaa-title"
          class="text-[15px] font-bold text-highlighted flex items-center gap-2"
        >
          <span class="w-1 h-5 bg-primary-700 rounded-full" />
          {{ t('documentation.rgaaTitle') }}
        </h3>
        <div class="flex items-center gap-3 text-xs font-semibold">
          <span class="flex items-center gap-1.5 text-success">
            <UIcon
              name="i-lucide-circle-check"
              class="size-3.5"
            />
            {{ t('documentation.compliant', { count: passCount }) }}
          </span>
          <span class="flex items-center gap-1.5 text-warning">
            <UIcon
              name="i-lucide-circle-alert"
              class="size-3.5"
            />
            {{ t('documentation.partial', { count: warnCount }) }}
          </span>
        </div>
      </div>

      <UCard :ui="{ root: 'rounded-[14px] overflow-hidden', body: 'p-0 sm:p-0' }">
        <UTable
          :data="rgaaItems"
          :columns="columns"
          :aria-label="t('documentation.rgaaTitle')"
          :ui="{ th: 'text-[11px] font-bold uppercase tracking-[0.06em] text-muted px-5', td: 'px-5' }"
        >
          <template #status-cell="{ row }">
            <UBadge
              :color="statusConfig[row.original.status].color"
              :icon="statusConfig[row.original.status].icon"
              variant="subtle"
              class="whitespace-nowrap"
              :label="t(`documentation.statuses.${row.original.status}`)"
            />
          </template>
        </UTable>
      </UCard>
    </section>

    <section aria-labelledby="changes-title">
      <h3
        id="changes-title"
        class="text-[15px] font-bold text-highlighted mb-4 flex items-center gap-2"
      >
        <span class="w-1 h-5 bg-success rounded-full" />
        {{ t('documentation.changesTitle') }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard
          v-for="change in complianceChanges"
          :key="change.title"
          :ui="{ root: 'rounded-[14px]', header: 'px-5 py-3.5 sm:px-5', body: 'px-5 py-4 sm:px-5' }"
        >
          <template #header>
            <h4 class="flex items-center gap-2 text-[13px] font-bold text-highlighted">
              <UIcon
                name="i-lucide-file-check"
                class="size-3.5 text-secondary"
              />
              {{ change.title }}
            </h4>
          </template>
          <ul class="flex flex-col gap-2.5">
            <li
              v-for="item in change.items"
              :key="item"
              class="flex items-start gap-2 text-xs text-toned"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="size-3.5 text-success shrink-0 mt-0.5"
                aria-hidden="true"
              />
              {{ item }}
            </li>
          </ul>
        </UCard>
      </div>
    </section>
  </div>
</template>

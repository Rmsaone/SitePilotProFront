<script setup lang="ts">
interface Series {
  label: string;
  /** Tailwind text color class, used through currentColor */
  colorClass: string;
  values: number[];
  dashed?: boolean;
}

const props = defineProps<{
  labels: string[];
  series: Series[];
  formatValue?: (value: number) => string;
}>();

const WIDTH = 600;
const HEIGHT = 200;
const PADDING = { top: 10, right: 10, bottom: 24, left: 48 };
const TICKS = 4;

const maxValue = computed(() => {
  const max = Math.max(0, ...props.series.flatMap(serie => serie.values));

  if (max === 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(max));

  return Math.ceil(max / magnitude) * magnitude;
});

const innerWidth = WIDTH - PADDING.left - PADDING.right;
const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

function x(index: number): number {
  const steps = Math.max(props.labels.length - 1, 1);

  return PADDING.left + (index / steps) * innerWidth;
}

function y(value: number): number {
  return PADDING.top + innerHeight - (value / maxValue.value) * innerHeight;
}

const ticks = computed(() => Array.from({ length: TICKS + 1 }, (_, i) => (maxValue.value / TICKS) * i));

function compact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(Math.round(value));
}

function path(values: number[]): string {
  return values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(value)}`).join(' ');
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-4 mb-2">
      <span
        v-for="serie in series"
        :key="serie.label"
        class="flex items-center gap-1.5 text-[11px] text-muted"
      >
        <span
          class="w-6 h-0.5 inline-block bg-current"
          :class="serie.colorClass"
        />
        {{ serie.label }}
      </span>
    </div>
    <svg
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="w-full h-auto"
      role="img"
      :aria-label="series.map(serie => serie.label).join(', ')"
    >
      <g
        v-for="tick in ticks"
        :key="tick"
      >
        <line
          :x1="PADDING.left"
          :x2="WIDTH - PADDING.right"
          :y1="y(tick)"
          :y2="y(tick)"
          class="stroke-(--ui-border)"
          stroke-dasharray="4 4"
        />
        <text
          :x="PADDING.left - 6"
          :y="y(tick) + 4"
          text-anchor="end"
          class="fill-(--ui-text-muted) text-[11px]"
        >{{ compact(tick) }}</text>
      </g>
      <text
        v-for="(label, index) in labels"
        :key="label"
        :x="x(index)"
        :y="HEIGHT - 6"
        text-anchor="middle"
        class="fill-(--ui-text-muted) text-[11px]"
      >{{ label }}</text>
      <g
        v-for="serie in series"
        :key="serie.label"
        :class="serie.colorClass"
      >
        <path
          :d="path(serie.values)"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :stroke-dasharray="serie.dashed ? '5 3' : undefined"
        />
        <circle
          v-for="(value, index) in serie.values"
          :key="index"
          :cx="x(index)"
          :cy="y(value)"
          r="3"
          fill="currentColor"
        >
          <title>{{ labels[index] }} — {{ serie.label }} : {{ formatValue ? formatValue(value) : value }}</title>
        </circle>
      </g>
    </svg>
  </div>
</template>

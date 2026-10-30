<script setup lang="ts">
interface Series {
  label: string;
  /** Tailwind fill class, used through currentColor */
  colorClass: string;
  values: number[];
}

const props = defineProps<{
  labels: string[];
  series: Series[];
  formatValue?: (value: number) => string;
}>();

const WIDTH = 720;
const HEIGHT = 260;
const PADDING = { top: 10, right: 8, bottom: 24, left: 52 };
const TICKS = 4;
const innerWidth = WIDTH - PADDING.left - PADDING.right;
const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

const hovered = ref<number | null>(null);

const maxValue = computed(() => {
  const max = Math.max(0, ...props.series.flatMap(serie => serie.values));

  if (max === 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(max));

  return Math.ceil(max / magnitude) * magnitude;
});

const ticks = computed(() => Array.from({ length: TICKS + 1 }, (_, i) => (maxValue.value / TICKS) * i));
const slot = computed(() => innerWidth / Math.max(props.labels.length, 1));
const barWidth = computed(() => slot.value * 0.7 / Math.max(props.series.length, 1));

function y(value: number): number {
  return PADDING.top + innerHeight - (value / maxValue.value) * innerHeight;
}

function barX(index: number, serieIndex: number): number {
  return PADDING.left + index * slot.value + slot.value * 0.15 + serieIndex * barWidth.value;
}

function compact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M€`;
  }

  return value >= 1000 ? `${Math.round(value / 1000)}k€` : `${Math.round(value)}€`;
}
</script>

<template>
  <div class="relative">
    <svg
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="w-full h-auto"
      role="img"
      :aria-label="series.map(serie => serie.label).join(', ')"
      @mouseleave="hovered = null"
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
          class="fill-(--ui-text-dimmed) text-[10px]"
        >{{ compact(tick) }}</text>
      </g>

      <g
        v-for="(label, index) in labels"
        :key="label"
        @mouseenter="hovered = index"
      >
        <rect
          :x="PADDING.left + index * slot"
          :y="PADDING.top"
          :width="slot"
          :height="innerHeight"
          :class="hovered === index ? 'fill-(--ui-bg-elevated)' : 'fill-transparent'"
        />
        <rect
          v-for="(serie, serieIndex) in series"
          :key="serie.label"
          :x="barX(index, serieIndex)"
          :y="y(serie.values[index] ?? 0)"
          :width="barWidth - 2"
          :height="Math.max(innerHeight + PADDING.top - y(serie.values[index] ?? 0), 2)"
          rx="3"
          fill="currentColor"
          :class="serie.colorClass"
        />
        <text
          :x="PADDING.left + index * slot + slot / 2"
          :y="HEIGHT - 6"
          text-anchor="middle"
          class="fill-(--ui-text-dimmed) text-[10px]"
        >{{ label }}</text>
      </g>
    </svg>

    <div
      v-if="hovered !== null"
      class="pointer-events-none absolute top-0 z-10 bg-default border border-default rounded-lg shadow-lg px-3 py-2 text-xs"
      :style="{ left: `${Math.min(((PADDING.left + hovered * slot) / WIDTH) * 100, 75)}%` }"
    >
      <p class="font-semibold text-highlighted mb-1">
        {{ labels[hovered] }}
      </p>
      <p
        v-for="serie in series"
        :key="serie.label"
        :class="serie.colorClass"
      >
        {{ serie.label }} : <span class="font-bold">{{ formatValue ? formatValue(serie.values[hovered] ?? 0) : serie.values[hovered] }}</span>
      </p>
    </div>
  </div>
</template>

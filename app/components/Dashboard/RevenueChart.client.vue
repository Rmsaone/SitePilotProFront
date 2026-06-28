<script setup lang="ts">
import { Chart, registerables } from 'chart.js';
import { onMounted, onBeforeUnmount, ref } from 'vue';

Chart.register(...registerables);

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

onMounted(() => {
  if (!canvas.value) return;

  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Facturé',
          data: [200000, 1200000, 4000000, 6000000, 11000000, 14000000, 16500000, 18000000, 21000000, 22000000, 24000000, 26000000],
          backgroundColor: '#0C2347',
          borderRadius: 3,
          barPercentage: 0.8
        },
        {
          label: 'Dépensé',
          data: [150000, 1000000, 3500000, 5500000, 10000000, 13000000, 15000000, 17000000, 19500000, 21000000, 22500000, 25000000],
          backgroundColor: '#f87171',
          borderRadius: 3,
          barPercentage: 0.8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw as number;
              const formatted = new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(val);
              return ` ${ctx.dataset.label}: ${formatted}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false }
        },
        y: {
          max: 27000000,
          grid: { color: '#f3f4f6' },
          border: { display: false },
          ticks: {
            callback: (value) => {
              const n = Number(value);
              if (n === 0) return '0€';
              return `${(n / 1000000).toFixed(1)}M€`;
            }
          }
        }
      }
    }
  });
});

onBeforeUnmount(() => {
  chart?.destroy();
});
</script>

<template>
  <canvas ref="canvas" />
</template>

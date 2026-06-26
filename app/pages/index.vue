<script setup lang="ts">
definePageMeta({ i18nTitle: 'home.dashboard.title' });

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

const stats = [
  { label: 'Chantiers en cours', value: 668 },
  { label: 'Factures créées ce mois-ci', value: 32 },
  { label: 'Devis créés ce mois-ci', value: 61 },
  { label: 'Devis acceptés ce mois-ci', value: 39 }
];
</script>

<template>
  <div class="p-6 space-y-5">

    <!-- Workflow -->
    <div class="bg-white rounded-xl border border-gray-100 px-8 py-6">
      <div class="flex items-center justify-center">

        <!-- Étape 1 -->
        <div class="flex flex-col items-start gap-1.5 shrink-0 pr-2">
          <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Étape 1</span>
          <UButton color="primary" size="md">
            Créer un client
          </UButton>
        </div>

        <!-- Connecteur courbé en "}" -->
        <div class="self-stretch flex flex-col w-10 shrink-0">
          <div class="flex-1 border-t-2 border-r-2 border-gray-200 rounded-tr-3xl" />
          <div class="flex-1 border-b-2 border-r-2 border-gray-200 rounded-br-3xl" />
        </div>

        <!-- Branches -->
        <div class="flex flex-col gap-8 pl-2">
          <!-- Branche haute: Étape 2 → Étape 4 -->
          <div class="flex items-center gap-4">
            <div class="flex flex-col items-start gap-1.5">
              <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Étape 2</span>
              <UButton color="success" variant="outline" size="md">
                Créer un devis
              </UButton>
            </div>
            <UIcon name="i-lucide-arrow-right" class="text-gray-300 mt-5" />
            <div class="flex flex-col items-start gap-1.5 opacity-50">
              <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Étape 4</span>
              <div class="flex items-center gap-1.5 border border-dashed border-gray-200 rounded-lg px-4 py-2">
                <span class="text-sm text-gray-400">Créer une facture</span>
                <span class="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">BIENTÔT</span>
              </div>
            </div>
          </div>

          <!-- Branche basse: Étape 3 → Suivi → Rapport -->
          <div class="flex items-center gap-4">
            <div class="flex flex-col items-start gap-1.5">
              <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Étape 3</span>
              <UButton color="secondary" variant="outline" size="md">
                Créer un chantier
              </UButton>
            </div>
            <UIcon name="i-lucide-arrow-right" class="text-gray-300 mt-5" />
            <div class="flex items-center gap-3 mt-5">
              <div class="border border-gray-200 rounded-lg px-4 py-2 opacity-50">
                <span class="text-sm text-gray-400">Suivi</span>
              </div>
              <UIcon name="i-lucide-arrow-right" class="text-gray-300" />
              <div class="border border-gray-200 rounded-lg px-4 py-2 opacity-50">
                <span class="text-sm text-gray-400">Rapport</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 stats cards -->
    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl border border-gray-100 px-5 py-5"
      >
        <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
          {{ stat.label }}
        </p>
        <p class="text-4xl font-bold text-primarySite-800">
          {{ stat.value }}
        </p>
      </div>
    </div>

    <!-- Factures + Devis en attente -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Factures en attente -->
      <div class="bg-white rounded-xl border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
            Factures en attente
          </p>
          <p class="text-3xl font-bold text-tertiarySite-600 mb-1">
            {{ formatCurrency(21957.56) }}
          </p>
          <p class="text-sm text-gray-400">8 factures en attente</p>
        </div>
        <UButton variant="outline" color="success" size="sm">
          Accéder
        </UButton>
      </div>

      <!-- Devis en attente -->
      <div class="bg-white rounded-xl border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
            Devis en attente
          </p>
          <p class="text-3xl font-bold text-red-500 mb-1">
            {{ formatCurrency(3871.44) }}
          </p>
          <p class="text-sm text-gray-400">4 devis en attente</p>
        </div>
        <UButton variant="outline" color="error" size="sm">
          Accéder
        </UButton>
      </div>
    </div>

    <!-- CA + Reste à facturer -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-gray-100 px-6 py-5">
        <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
          Montant CA HT
        </p>
        <p class="text-3xl font-bold text-primarySite-800 mb-1">
          {{ formatCurrency(40844.20) }}
        </p>
        <p class="text-sm text-gray-400">Exercice en cours</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 px-6 py-5">
        <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
          Reste à facturer HT
        </p>
        <p class="text-3xl font-bold text-primarySite-800 mb-1">
          {{ formatCurrency(24914.53) }}
        </p>
        <p class="text-sm text-gray-400">Sur chantiers actifs</p>
      </div>
    </div>

    <!-- Graphique -->
    <div class="bg-white rounded-xl border border-gray-100 px-6 py-5">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="font-semibold text-primarySite-800">Facture vs. Dépensé</h3>
          <p class="text-sm text-gray-400">Comparaison mensuelle — exercice 2024</p>
        </div>
        <a href="#" class="text-sm text-primarySite-500 hover:underline flex items-center gap-1">
          Voir le détail
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
        </a>
      </div>

      <!-- Légende -->
      <div class="flex items-center gap-6 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-primarySite-800" />
          <span class="text-xs text-gray-500">Facturé</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-red-400" />
          <span class="text-xs text-gray-500">Dépensé</span>
        </div>
      </div>

      <!-- Chart -->
      <div class="h-64">
        <DashboardRevenueChart />
      </div>
    </div>

  </div>
</template>

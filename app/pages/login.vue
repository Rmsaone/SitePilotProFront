<script setup lang="ts">
import Logo from '~/assets/images/imageSitePilot.png';

definePageMeta({ layout: 'auth' });

const activeTab = ref<'login' | 'register'>('login');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');
const loading = ref(false);

const { login } = useAuth();

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await login(email.value, password.value);
    await navigateTo('/');
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message ?? 'Erreur de connexion';
  } finally {
    loading.value = false;
  }
}

const features = [
  'Gérez vos chantiers en temps réel',
  'Devis & factures en quelques clics',
  'Suivi budgétaire avancé',
  'Rapports & statistiques détaillés'
];
</script>

<template>
  <div class="min-h-screen flex bg-white">

    <!-- Colonne gauche -->
    <div
      class="relative flex-1 flex flex-col justify-center px-16 py-12 overflow-hidden"
      style="background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px); background-size: 32px 32px;"
    >

      <!-- Blobs décoratifs -->
      <div
        class="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style="background: #F86A02; transform: translate(25%, -25%);"
      />
      <div
        class="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style="background: #a78bfa;"
      />

      <!-- Logo -->
      <div class="mb-12 relative z-10">
        <img
          :src="Logo"
          alt="SitePilotPro"
          class="h-28 w-auto"
        >
      </div>

      <!-- Contenu marketing -->
      <div class="relative z-10 max-w-xl">
        <p class="text-secondarySite-500 font-semibold text-xs tracking-widest uppercase mb-4">
          Plateforme de Gestion BTP
        </p>

        <h1 class="text-4xl font-bold text-primarySite-800 mb-6 leading-tight">
          Pilotez vos <span class="text-secondarySite-500">chantiers</span> avec précision.
        </h1>

        <p class="text-gray-500 text-base mb-8 leading-relaxed">
          Centralisez devis, factures et suivi budgétaire sur une seule plateforme conçue pour les professionnels du bâtiment.
        </p>

        <!-- Liste des fonctionnalités -->
        <ul class="space-y-3 mb-10">
          <li
            v-for="feature in features"
            :key="feature"
            class="flex items-center gap-3 text-gray-700"
          >
            <UIcon
              name="i-lucide-circle-check"
              class="text-secondarySite-500 shrink-0"
              size="20"
            />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <!-- Badge stats -->
        <div class="flex items-center gap-3 bg-secondarySite-50 rounded-xl px-5 py-3 w-fit">
          <div class="bg-secondarySite-500 rounded-lg p-2">
            <UIcon
              name="i-lucide-building-2"
              class="text-white"
              size="20"
            />
          </div>
          <div>
            <p class="font-bold text-primarySite-800 text-sm">+668 chantiers actifs</p>
            <p class="text-xs text-gray-500">gérés sur la plateforme</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Colonne droite -->
    <div class="w-[480px] shrink-0 flex items-center justify-center p-10">
      <div class="light bg-white shadow-2xl rounded-2xl p-8 w-full">

        <!-- Onglets -->
        <div class="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            :class="activeTab === 'login'
              ? 'bg-primarySite-800 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'login'"
          >
            Se connecter
          </button>
          <button
            class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            :class="activeTab === 'register'
              ? 'bg-primarySite-800 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'register'"
          >
            Créer un compte
          </button>
        </div>

        <!-- Titre -->
        <h2 class="text-2xl font-bold text-primarySite-800 mb-1">
          Bon retour 👋
        </h2>
        <p class="text-gray-500 text-sm mb-6">
          Connectez-vous à votre espace
        </p>

        <!-- Champ email -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse email
          </label>
          <UInput
            v-model="email"
            type="email"
            placeholder="vous@exemple.fr"
            leading-icon="i-lucide-mail"
            size="lg"
            class="w-full"
          />
        </div>

        <!-- Champ mot de passe -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-1.5">
            <label class="text-sm font-medium text-gray-700">Mot de passe</label>
            <a
              href="#"
              class="text-sm text-secondarySite-500 font-medium hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <UInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            leading-icon="i-lucide-lock"
            :trailing-icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            size="lg"
            class="w-full"
            @click-trailing="showPassword = !showPassword"
          />
        </div>

        <!-- Message d'erreur -->
        <p
          v-if="error"
          class="text-red-500 text-sm mb-4 text-center"
        >
          {{ error }}
        </p>

        <!-- Bouton connexion -->
        <UButton
          size="lg"
          color="secondary"
          block
          :loading="loading"
          class="mb-5 font-semibold"
          @click="handleLogin"
        >
          Se connecter
        </UButton>

        <!-- Lien inscription -->
        <p class="text-center text-sm text-gray-500 mb-5">
          Pas encore de compte ?
          <button
            class="font-bold text-primarySite-800 hover:underline ml-1"
            @click="activeTab = 'register'"
          >
            Créer un compte
          </button>
        </p>

        <!-- Séparateur -->
        <div class="flex items-center gap-3 mb-5">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="text-sm text-gray-400">ou</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Bouton démo -->
        <button class="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-700 transition-colors">
          🚀 Accéder à la démo
        </button>
      </div>
    </div>
  </div>
</template>

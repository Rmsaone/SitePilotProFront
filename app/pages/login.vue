<script setup lang="ts">
import LogoComplet from '~/assets/images/imageSitePilot.png';

type AuthTab = 'login' | 'register';

definePageMeta({
  layout: false,
  i18nTitle: 'auth.tabs.login'
});

const { t } = useI18n();
const tab = ref<AuthTab>('login');

const tabs = computed(() => [
  { label: t('auth.tabs.login'), value: 'login' },
  { label: t('auth.tabs.register'), value: 'register' }
]);

useHead({
  title: computed(() => tab.value === 'login' ? t('auth.tabs.login') : t('auth.tabs.register'))
});
</script>

<template>
  <div class="h-dvh w-full flex overflow-hidden">
    <AuthHero />

    <main class="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-6 lg:py-10 overflow-y-auto gap-4 lg:gap-0 relative auth-background">
      <div
        v-if="tab === 'login'"
        class="lg:hidden relative flex items-center justify-center w-full"
      >
        <div class="absolute w-70 h-35 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <img
          :src="LogoComplet"
          alt="SitePilotPro"
          class="relative w-full max-w-120 max-h-55 object-contain"
        >
      </div>

      <div class="w-full max-w-110 bg-default rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-default px-6 sm:px-8 py-7">
        <UTabs
          v-model="tab"
          :items="tabs"
          :content="false"
          class="mb-5"
          :ui="{
            list: 'bg-elevated rounded-xl p-1',
            indicator: 'bg-primary-700 rounded-[9px] shadow-[0_2px_8px_rgba(30,58,95,0.25)]',
            trigger: 'h-9 text-[13px] font-semibold data-[state=inactive]:text-muted data-[state=active]:text-white'
          }"
        />

        <AuthLoginForm
          v-if="tab === 'login'"
          @register="tab = 'register'"
        />
        <AuthRegisterForm
          v-else
          @login="tab = 'login'"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-background {
  background: linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 50%, var(--color-secondarySite-50) 100%);
}

:global(.dark) .auth-background {
  background: linear-gradient(145deg, #0D1B2E 0%, #0A1626 50%, #152238 100%);
}
</style>

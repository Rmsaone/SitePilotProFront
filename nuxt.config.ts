export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n'
  ],

  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        semi: true,
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  i18n: {
    lazy: true,
    type: 'composition',
    langDir: 'locales',
    strategy: 'no_prefix',
    locales: [
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français',
        files: [
          'fr/error.json',
          'fr/base.json',
          'fr/client.json',
          'fr/worksite.json',
          'fr/home.json'
        ]
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        files: [
          'en/error.json',
          'en/base.json',
          'en/client.json',
          'en/worksite.json',
          'en/home.json'
        ]
      }
    ],
    defaultLocale: 'fr'
  }
});

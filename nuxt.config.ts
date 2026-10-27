export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    'nuxt-auth-sanctum',
    'dayjs-nuxt',
    '@vee-validate/nuxt'
  ],

  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      demoEmail: '',
      demoPassword: ''
    }
  },

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
    defaultLocale: 'fr',
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
          'fr/home.json',
          'fr/auth.json',
          'fr/account.json',
          'fr/documentation.json'
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
          'en/home.json',
          'en/auth.json',
          'en/account.json',
          'en/documentation.json'
        ]
      }
    ],

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },
  sanctum: {
    baseUrl: 'http://localhost',
    mode: 'token',
    endpoints: {
      login: '/api/v1/auth/login',
      logout: '/api/v1/auth/logout',
      user: '/api/v1/auth/me'
    },
    redirect: {
      keepRequestedRoute: true,
      onLogin: '/',
      onLogout: '/login',
      onAuthOnly: '/login',
      onGuestOnly: '/'
    },
    globalMiddleware: {
      enabled: true
    }
  }
});

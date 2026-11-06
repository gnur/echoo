// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    // Report non-pod hostnames as "localhost". Override with NUXT_MASK_HOSTNAME=false.
    maskHostname: true,
  },
  css: ['~/assets/css/design-tokens.css', '~/assets/css/main.css'],
  app: {
    head: {
      title: 'echoo',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Visualize which backend pods answer your requests' },
        { name: 'color-scheme', content: 'dark' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})

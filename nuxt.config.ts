// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // DinoLand is a fully client-side learning app: progress lives in the
  // browser (localStorage) and there is no backend, so render as an SPA.
  ssr: false,

  modules: ['motion-v/nuxt', '@vite-pwa/nuxt'],

  // Components are organised in folders but used by their plain names.
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['@fontsource-variable/fredoka', '~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'DinoLand',
      htmlAttrs: { lang: 'en' },
      meta: [
        // Disable pinch-zoom so little fingers don't accidentally zoom the UI.
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: 'DinoLand — a playful learning playground for toddlers: numbers, letters, colors, shapes and games.' },
        { name: 'theme-color', content: '#8ED8F8' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'DinoLand' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/icon.svg' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'DinoLand',
      short_name: 'DinoLand',
      description: 'A playful learning playground for toddlers.',
      theme_color: '#8ED8F8',
      background_color: '#FFFDF5',
      display: 'standalone',
      orientation: 'any',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // Any route opened offline is served by the precached app shell.
      navigateFallback: '/index.html',
      // Precache the app shell plus every illustration and voice clip so the
      // whole playground works offline after the first visit.
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2,m4a}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      cleanupOutdatedCaches: true,
      // This is an SPA: every route is served by the app shell. Drop the
      // extension-less route URLs the generator adds ("/numbers", "/404"…):
      // hosts that don't map them would make the whole install fail.
      manifestTransforms: [
        async (entries) => ({
          manifest: entries.filter((e) => e.url === '/' || /\.[a-z0-9]+$/i.test(e.url)),
          warnings: [],
        }),
      ],
    },
    client: {
      installPrompt: false,
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },

  typescript: {
    strict: true,
  },
})

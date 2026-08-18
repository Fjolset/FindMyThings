import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Set VITE_BASE_PATH to "/<repo-name>/" when deploying to GitHub Pages
// (a project site is served from https://<user>.github.io/<repo-name>/).
// Locally, and when deploying to a custom domain or a user/org site
// (https://<user>.github.io/), it defaults to "/".
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Find My Stuff',
        short_name: 'Find My Stuff',
        description:
          'Din personlige hukommelse for ejendele. Fortæl hvor du lagde det – find det igen ved at spørge.',
        theme_color: '#F7F3EC',
        background_color: '#F7F3EC',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        lang: 'da',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})

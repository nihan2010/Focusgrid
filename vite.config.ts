import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'FocusGrid',
    //     short_name: 'FocusGrid',
    //     theme_color: '#09090b',
    //     background_color: '#09090b',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: '/vite.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml'
    //       }
    //     ]
    //   }
    // })
  ],
})

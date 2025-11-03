import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  // 👇 Add these lines for multi-page builds
  build: {
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
        resume:   resolve(__dirname, 'resume.html'),
      },
    },
  },
  // 👇 Optional: if deploying under a subpath (e.g. GitHub Pages)
  // base: '/your-repo-name/',
})


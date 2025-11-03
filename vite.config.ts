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
        presentation:resolve(__dirname, 'presentation.html'),
        case1:       resolve(__dirname, 'case1.html'),
        case2:       resolve(__dirname, 'case2.html'),
        case3:       resolve(__dirname, 'case3.html'),
        case4:       resolve(__dirname, 'case4.html'),
        case5:       resolve(__dirname, 'case5.html'),
        case6:       resolve(__dirname, 'case6.html'),
      },
    },
  },
  // 👇 Optional: if deploying under a subpath (e.g. GitHub Pages)
  // base: '/your-repo-name/',
})


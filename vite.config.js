import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/first-vue/', // 直接写死，和 GitHub 仓库名完全一致（必须带前后斜杠）
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8087',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 关键添加：配置 GitHub Pages 基础路径（必须和你的 GitHub 仓库名一致）
  base: '/first-vue/', // 你的仓库名是 first-vue，所以填 /仓库名/

  plugins: [vue()],

  server: {
    proxy: {
      // 你原有的后端接口代理配置（本地开发用，不影响部署）
      '/api': {
        target: 'http://localhost:8081',  // 本地后端接口地址（开发时用）
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // 去掉 /api 前缀
      }
    }
  }
})
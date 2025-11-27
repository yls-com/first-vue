import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/first-vue/' : '/',
    plugins: [vue()],
    server: {
      // 开发环境代理（只在本地dev生效）
      proxy: {
        '/api': {
          target: 'http://localhost:8087', // 本地后端地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    // 生产环境：配置全局环境变量（让前端知道生产环境的后端地址）
    define: {
      'process.env': {
        VITE_API_BASE_URL: mode === 'production'
            ? 'https://first-springboot.onrender.com' // Render后端地址
            : '/api' // 开发环境代理前缀
      }
    }
  }
})
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 配置后端接口代理
      '/api': {
        target: 'http://localhost:8081',  // 后端接口地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // 去掉请求路径中的/api前缀
      }
    }
  }
})
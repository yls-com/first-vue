import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 重点：通过 mode 参数判断环境（development=本地开发，production=打包部署）
export default defineConfig(({ mode }) => {
  return {
    // 本地开发用 '/'（无 /first-vue），部署时用 '/first-vue/'（适配 GitHub 仓库名）
    base: mode === 'development' ? '/' : '/first-vue/',

    plugins: [vue()],

    server: {
      proxy: {
        // 本地开发的代理配置（仅本地生效，部署后不影响）
        '/api': {
          target: 'http://localhost:8087',  // 本地后端地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')  // 去掉 /api 前缀
        }
      }
    }
  }
})
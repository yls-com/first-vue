import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 引入路由
import ElementPlus from 'element-plus';  // 引入ElementPlus
import 'element-plus/dist/index.css';  // 引入ElementPlus样式

createApp(App)
    .use(router)
    .use(ElementPlus)
    .mount('#app');
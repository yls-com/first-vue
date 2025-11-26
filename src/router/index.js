import { createRouter, createWebHashHistory } from 'vue-router' // 关键：替换为 createWebHashHistory
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Device from '../views/Device.vue'
import Register from '../views/Register.vue'

const routes = [
    {
        path: '/',
        redirect: '/login' // 默认跳登录页（Hash模式下会变成 #/login）
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true } // 需要登录才能访问
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true } // 需要登录才能访问
    },
    {
        path: '/device',
        name: 'Device',
        component: Device,
        meta: { requiresAuth: true } // 需要登录才能访问
    }
]

const router = createRouter({
    history: createWebHashHistory(), // 关键：改用Hash模式（带#的路由）
    routes
})

// 路由守卫：未登录拦截（逻辑不变，正常使用）
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('token')
        if (token) {
            next()
        } else {
            next('/login') // 未登录跳登录页
        }
    } else {
        next()
    }
})

export default router
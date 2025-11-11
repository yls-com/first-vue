import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Device from '../views/Device.vue'

const routes = [
    {
        path: '/',
        redirect: '/login' // 默认跳登录页
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
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
    history: createWebHistory(),
    routes
})

// 路由守卫：未登录拦截
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
            next()
        } else {
            next('/login') // 未登录跳登录页
        }
    } else {
        next()
    }
})

export default router
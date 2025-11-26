import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
    baseURL: '/api', // 使用代理前缀
    timeout: 5000, // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 获取存储在localStorage中的token
        const token = localStorage.getItem('token')
        console.log('Token value:', token)
        // 如果有token，则在请求头中添加token字段
        if (token) {
            config.headers['token'] = token
            console.log('Token added to headers')
        }
        return config
    },
    error => {
        ElMessage.error('请求发送失败')
        return Promise.reject(error)
    }
)

// 添加一个额外的拦截器来确保请求被正确处理
request.interceptors.request.use(
    config => {
        // 确保config对象存在
        if (!config) {
            throw new Error('Request config is null')
        }
        
        // 打印请求信息用于调试
        console.log('Request URL:', config.url)
        console.log('Request Method:', config.method)
        console.log('Request Headers:', config.headers)
        
        return config
    },
    error => {
        ElMessage.error('请求配置错误')
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        // 直接返回后端数据（假设后端统一返回Result对象）
        return response.data
    },
    error => {
        // 特别处理未登录的情况
        if (error.response && error.response.status === 401) {
            // 清除本地存储的token和用户信息
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            // 跳转到登录页
            window.location.href = '/#/login'
            ElMessage.error('登录已过期，请重新登录')
        } else {
            ElMessage.error('请求响应失败：' + (error.message || '网络错误'))
        }
        return Promise.reject(error)
    }
)

export default request
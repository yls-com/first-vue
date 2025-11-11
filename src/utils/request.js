import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
    baseURL: 'http://localhost:8081', // 后端服务地址（根据实际端口修改）
    timeout: 5000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 可在这里添加Token等请求头信息
        return config
    },
    error => {
        ElMessage.error('请求发送失败')
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
        ElMessage.error('请求响应失败：' + (error.message || '网络错误'))
        return Promise.reject(error)
    }
)

export default request
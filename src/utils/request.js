import axios from 'axios'
import { ElMessage } from 'element-plus'

// 核心：自动区分环境，切换后端地址
// 开发环境（npm run dev）：用 /api 走 Vite 代理（对应 localhost:8081）
// 生产环境（npm run build）：直接请求 Render 后端地址
const baseURL = import.meta.env.MODE === 'production'
    ? 'https://first-springboot.onrender.com' // 生产环境：Render 后端
    : '/api'; // 开发环境：Vite 代理前缀

// 创建axios实例（关键：baseURL 结尾不要加 /，确保路径拼接正确）
const request = axios.create({
    baseURL,
    timeout: 15000, // 进一步延长超时（Render 免费版冷启动可能更慢）
    headers: {
        'Content-Type': 'application/json;charset=UTF-8' // 明确请求格式
    },
    withCredentials: true // 关键：配合后端 CorsConfig.allowCredentials = true（携带 Cookie）
})

// 请求拦截器：统一添加Token（保留原有优化逻辑）
request.interceptors.request.use(
    config => {
        // 确保config和config.headers存在（避免空指针）
        if (!config) throw new Error('请求配置为空')
        if (!config.headers) config.headers = {}

        // 获取并添加Token（登录后才会有，未登录时不添加）
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = token
            console.log(`[${import.meta.env.MODE}] 已添加Token到请求头：`, token)
        } else {
            console.log(`[${import.meta.env.MODE}] 未获取到Token，无需添加（登录/注册接口无需Token）`)
        }

        // 调试用：打印请求关键信息（含环境标识，方便区分）
        console.log(`[${import.meta.env.MODE}] 请求地址：${config.baseURL}${config.url}`)
        console.log(`[${import.meta.env.MODE}] 请求方法：`, config.method)
        console.log(`[${import.meta.env.MODE}] 请求头：`, config.headers)

        return config
    },
    error => {
        ElMessage.error('请求发送失败：' + error.message)
        return Promise.reject(error)
    }
)

// 响应拦截器：统一处理结果和错误（保留原有逻辑，优化环境提示）
request.interceptors.response.use(
    response => {
        console.log(`[${import.meta.env.MODE}] 响应数据：`, response.data) // 调试用
        // 后端返回格式：{ code: 200, data: ..., msg: ... }（根据实际格式调整）
        const res = response.data
        if (res.code !== 200 && res.code !== 0) {
            ElMessage.error(res.msg || '操作失败')
            return Promise.reject(res)
        }
        return res // 成功则返回数据
    },
    error => {
        // 分情况处理错误（优化提示，区分环境）
        if (!error.response) {
            // 无响应：网络错误/后端未启动
            const tip = import.meta.env.MODE === 'production'
                ? '网络错误或服务器未响应，请稍后重试'
                : '网络错误，请检查本地后端服务（localhost:8081）是否启动';
            ElMessage.error(tip)
        } else {
            const status = error.response.status
            const requestUrl = error.response.config.baseURL + error.response.config.url
            switch (status) {
                case 401:
                    // 未登录/Token过期：清除缓存并跳登录页
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    window.location.href = '/#/login' // 适配Vue Router哈希模式
                    ElMessage.error('登录已过期，请重新登录')
                    break
                case 404:
                    // 接口不存在：提示更详细（含环境）
                    const notFoundTip = import.meta.env.MODE === 'production'
                        ? `请求的接口不存在（${requestUrl}），请确认后端地址和接口路径`
                        : `请求的接口不存在（${requestUrl}），请检查本地后端接口是否正确`;
                    ElMessage.error(notFoundTip)
                    console.error(`[${import.meta.env.MODE}] 404错误：`, requestUrl)
                    break
                case 500:
                    // 后端报错：区分环境提示
                    const serverErrTip = import.meta.env.MODE === 'production'
                        ? '服务器内部错误，请联系管理员（Render后端异常）'
                        : '服务器内部错误（本地后端异常），请查看后端日志';
                    ElMessage.error(serverErrTip)
                    break
                default:
                    ElMessage.error(`请求失败（状态码：${status}）：${error.message}`)
            }
        }
        return Promise.reject(error)
    }
)

export default request
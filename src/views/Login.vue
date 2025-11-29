<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="header-text">
          <h1 class="title">南宁学院</h1>
          <p class="subtitle">顺路互助平台管理端</p>
        </div>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名/工号" 
            size="large"
            clearable
            prefix-icon="User">
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
            size="large"
            prefix-icon="Lock">
          </el-input>
        </el-form-item>

        <el-form-item class="remember-item">
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            :disabled="loading" 
            @click="handleLogin" 
            size="large"
            class="login-button"
            native-type="submit">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="success" 
            @click="handleRegister" 
            size="large"
            class="register-button"
            plain>
            注 册
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>© 2025 南宁学院 顺路互助平台</p>
        <p>技术支持：信息工程学院</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const loginForm = ref({
  username: '',
  password: ''
})

const rememberMe = ref(false)

const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const loginFormRef = ref(null)
const router = useRouter()
const loading = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('savedUsername')
  if (saved) {
    loginForm.value.username = saved
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  // 安全地校验表单
  try {
    await loginFormRef.value.validate()
  } catch (err) {
    // 校验未通过，停止提交
    return
  }

  loading.value = true

  try {
    const response = await request.post('/user/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    if (response && response.code === 200) {
      ElMessage.success({ message: '登录成功', duration: 1200 })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userInfo', JSON.stringify(response.data.user))

      if (rememberMe.value) {
        localStorage.setItem('savedUsername', loginForm.value.username)
      } else {
        localStorage.removeItem('savedUsername')
      }

      // 跳转到首页
      router.push('/home')
    } else {
      ElMessage.error(response && response.msg ? response.msg : '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录请求失败，请检查网络或后端服务')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(120deg, #e6f2ff, #ffffff, #cce5ff);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 40px 35px;
  position: relative;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.header-text .title {
  font-size: 28px;
  color: #1e5aaa;
  margin: 0 0 8px;
  font-weight: bold;
  letter-spacing: 2px;
}

.header-text .subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  letter-spacing: 1px;
}

.login-form {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  padding: 8px 15px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: box-shadow 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #1e5aaa inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #1e5aaa inset;
}

.remember-item {
  margin-bottom: 25px !important;
}

.login-button {
  width: 100%;
  background: linear-gradient(to right, #1e5aaa, #2c7bb6);
  border: none;
  border-radius: 6px;
  padding: 15px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button:hover {
  background: linear-gradient(to right, #2c7bb6, #1e5aaa);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(30, 90, 170, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.register-button {
  width: 100%;
  border-radius: 6px;
  padding: 15px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
}

.login-footer {
  text-align: center;
  color: #888;
  font-size: 12px;
  line-height: 1.6;
}

.login-footer p {
  margin: 0;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
  
  .header-text .title {
    font-size: 24px;
  }
  
  .header-text .subtitle {
    font-size: 14px;
  }
}
</style>
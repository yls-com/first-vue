<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <div class="header-text">
          <h1 class="title">南宁学院</h1>
          <p class="subtitle">顺路互助平台注册</p>
        </div>
      </div>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="register-form">
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="请输入用户名" 
            size="large"
            clearable
            prefix-icon="User">
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input 
            v-model="registerForm.email" 
            placeholder="请输入邮箱" 
            size="large"
            clearable
            prefix-icon="Message">
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码（至少8位，包含字母和数字）" 
            show-password
            size="large"
            prefix-icon="Lock">
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码" 
            show-password
            size="large"
            prefix-icon="Lock">
          </el-input>
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input 
            v-model="registerForm.nickname" 
            placeholder="请输入昵称（可选）" 
            size="large"
            clearable
            prefix-icon="User">
          </el-input>
        </el-form-item>

        <el-form-item prop="phone">
          <el-input 
            v-model="registerForm.phone" 
            placeholder="请输入手机号码（可选）" 
            size="large"
            clearable
            prefix-icon="Phone">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            :disabled="loading" 
            @click="handleRegister" 
            size="large"
            class="register-button"
            native-type="submit">
            {{ loading ? '注册中...' : '注 册' }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            @click="goToLogin" 
            size="large"
            class="login-button"
            plain>
            返回登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
        <p>© 2025 南宁学院 顺路互助平台</p>
        <p>技术支持：信息工程学院</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: ''
})

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 20, message: '用户名长度应在1-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
      message: '密码至少8位，必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { 
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ]
})

const registerFormRef = ref(null)
const router = useRouter()
const loading = ref(false)

const handleRegister = async () => {
  // 安全地校验表单
  try {
    await registerFormRef.value.validate()
  } catch (err) {
    // 校验未通过，停止提交
    return
  }

  loading.value = true

  try {
    const response = await request.post('/user/register', {
      username: registerForm.value.username,
      password: registerForm.value.password,
      email: registerForm.value.email,
      nickname: registerForm.value.nickname || undefined,
      phone: registerForm.value.phone || undefined
    })

    if (response && response.code === 200) {
      ElMessage.success({ message: '注册成功', duration: 1200 })
      // 注册成功后跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(response && response.msg ? response.msg : '注册失败')
    }
  } catch (error) {
    ElMessage.error('注册请求失败，请检查网络或后端服务')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(120deg, #e6f2ff, #ffffff, #cce5ff);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 40px 35px;
  position: relative;
  backdrop-filter: blur(10px);
}

.register-header {
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

.register-form {
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

.register-button {
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
  margin-bottom: 15px;
}

.register-button:hover {
  background: linear-gradient(to right, #2c7bb6, #1e5aaa);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(30, 90, 170, 0.3);
}

.register-button:active {
  transform: translateY(0);
}

.login-button {
  width: 100%;
  border-radius: 6px;
  padding: 15px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
}

.register-footer {
  text-align: center;
  color: #888;
  font-size: 12px;
  line-height: 1.6;
}

.register-footer p {
  margin: 0;
}

@media (max-width: 480px) {
  .register-box {
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
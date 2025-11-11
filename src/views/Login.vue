<template>
  <div class="login-container">
    <el-card class="login-card">
      <div slot="header" class="login-title">
        <h2>用户登录</h2>
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const loginForm = ref({
  username: '',
  password: ''
})

const rules = ref({
  username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}]
})

const loginFormRef = ref(null)
const router = useRouter()

const handleLogin = async () => {
  // 表单验证
  await loginFormRef.value.validate()

  try {
    // 调用后端登录接口（参数通过params传递，匹配后端@PostMapping("/login")接收方式）
    const response = await request.post('/login', null, {
      params: {
        username: loginForm.value.username,
        password: loginForm.value.password
      }
    })

    if (response.code === 200) {
      ElMessage.success('登录成功')
      // 存储用户信息到本地
      localStorage.setItem('userInfo', JSON.stringify(response.data))
      // 跳转到首页
      router.push('/home')
    } else {
      ElMessage.error(response.msg || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录请求失败，请检查网络或后端服务')
    console.error(error)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
}

.login-title {
  text-align: center;
}
</style>
<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <div slot="header" class="profile-header">
        <span>个人信息</span>
      </div>
      
      <el-form :model="profileForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input v-model="profileForm.user_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="profileForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" disabled></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateProfile">更新信息</el-button>
          <el-button @click="goBack" style="margin-left: 10px">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 修改密码表单 -->
    <el-card class="change-password-card" style="margin-top: 20px">
      <div slot="header" class="password-header">
        <span>修改密码</span>
      </div>
      
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="passwordForm.email" disabled></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-row :gutter="10">
            <el-col :span="14">
              <el-input v-model="passwordForm.code" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col :span="10">
              <el-button @click="sendVerificationCode" :disabled="isCodeButtonDisabled" type="primary">
                {{ codeButtonText }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const profileForm = ref({
  user_id: '',
  username: '',
  nickname: '',
  phone: '',
  email: ''
})

const passwordForm = ref({
  email: '',
  newPassword: '',
  confirmPassword: '',
  code: ''
})

const passwordFormRef = ref(null)

// 验证码按钮状态
const isCodeButtonDisabled = ref(false)
const codeButtonText = ref('获取验证码')
let countdownTimer = null

const passwordRules = {
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const router = useRouter()

// 页面加载时获取用户信息
onMounted(() => {
  loadUserProfile()
})

// 加载用户信息
const loadUserProfile = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr)
    profileForm.value = { ...userInfo }
    // 同时设置密码表单中的邮箱
    passwordForm.value.email = userInfo.email
  }
}

// 更新用户信息
const updateProfile = async () => {
  try {
    const response = await request.put('/updateNickname', null, {
      params: {
        user_id: profileForm.value.user_id,
        nickname: profileForm.value.nickname
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('信息更新成功')
      // 更新本地存储的用户信息
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        userInfo.nickname = profileForm.value.nickname
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
    } else {
      ElMessage.error(response.msg || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败，请稍后重试')
    console.error(error)
  }
}

// 发送验证码
const sendVerificationCode = async () => {
  try {
    // 调用后端发送验证码接口
    const response = await request.get('/sendEmailCode', {
      params: {
        email: passwordForm.value.email
      }
    })

    if (response.code === 200) {
      ElMessage.success('验证码已发送，请查收邮箱')
      // 启动倒计时
      startCountdown(60)
    } else {
      ElMessage.error(response.msg || '发送验证码失败')
    }
  } catch (error) {
    ElMessage.error('发送验证码失败，请稍后重试')
    console.error(error)
  }
}

// 启动倒计时
const startCountdown = (seconds) => {
  isCodeButtonDisabled.value = true
  let count = seconds
  
  countdownTimer = setInterval(() => {
    codeButtonText.value = `${count}秒后重新获取`
    count--
    
    if (count < 0) {
      clearInterval(countdownTimer)
      codeButtonText.value = '获取验证码'
      isCodeButtonDisabled.value = false
    }
  }, 1000)
}

// 修改密码
const changePassword = async () => {
  // 表单验证
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 验证码校验并执行修改密码
        const updateResponse = await request.put('/updatePasswordByEmail', null, {
          params: {
            email: passwordForm.value.email,
            password: passwordForm.value.newPassword,
            code: passwordForm.value.code
          }
        })
        
        if (updateResponse.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          // 清除本地存储的token和用户信息
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          // 跳转到登录页
          router.push('/login')
        } else {
          ElMessage.error(updateResponse.msg || '密码修改失败')
        }
      } catch (error) {
        ElMessage.error('密码修改失败，请稍后重试')
        console.error(error)
      }
    }
  })
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 组件销毁时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.profile-card, .change-password-card {
  width: 100%;
}

.profile-header, .password-header {
  font-weight: bold;
}
</style>
<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
          <el-button class="close-button" type="primary" @click="goBack" size="small">返回</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 用户信息展示 -->
        <el-tab-pane label="个人信息" name="info">
          <el-form label-width="100px" class="profile-form">
            <el-form-item label="用户ID：">
              <span>{{ userInfo.user_id }}</span>
            </el-form-item>
            <el-form-item label="用户名：">
              <span>{{ userInfo.username }}</span>
            </el-form-item>
            <el-form-item label="昵称：">
              <span v-if="!isEditingNickname">{{ userInfo.nickname }}</span>
              <el-input 
                v-else 
                v-model="editNicknameForm.nickname" 
                size="small" 
                style="width: 200px; margin-right: 10px;"
              />
              <el-button 
                v-if="!isEditingNickname" 
                type="primary" 
                size="small" 
                @click="startEditNickname"
              >
                修改昵称
              </el-button>
              <div v-else>
                <el-button type="success" size="small" @click="saveNickname">保存</el-button>
                <el-button type="info" size="small" @click="cancelEditNickname" style="margin-left: 10px;">取消</el-button>
              </div>
            </el-form-item>
            <el-form-item label="电话：">
              <span>{{ userInfo.phone }}</span>
            </el-form-item>
            <el-form-item label="邮箱：">
              <span>{{ userInfo.email }}</span>
            </el-form-item>
            <el-form-item label="状态：">
              <el-tag :type="userInfo.is_active === 1 ? 'success' : 'danger'">
                {{ userInfo.is_active === 1 ? '激活' : '未激活' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="创建时间：">
              <span>{{ userInfo.created_time }}</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form 
            :model="passwordForm" 
            :rules="passwordRules" 
            ref="passwordFormRef" 
            label-width="100px" 
            class="password-form"
          >
            <el-form-item label="当前邮箱：" prop="email">
              <el-input v-model="passwordForm.email" disabled></el-input>
            </el-form-item>
            <el-form-item label="旧密码：" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码：" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认密码：" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="验证码：" prop="code">
              <el-input v-model="passwordForm.code" style="width: 60%"></el-input>
              <el-button 
                type="primary" 
                style="margin-left: 10px"
                @click="getCode"
                :disabled="isCountingDown"
              >
                {{ isCountingDown ? `${countDown}秒后重新获取` : '获取验证码' }}
              </el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updatePassword">确认修改</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const activeTab = ref('info')
const isCountingDown = ref(false)
const countDown = ref(60)
const passwordFormRef = ref(null)
const isEditingNickname = ref(false)

// 用户信息
const userInfo = ref({
  user_id: '',
  username: '',
  nickname: '',
  phone: '',
  email: '',
  is_active: 1,
  created_time: ''
})

// 昵称修改表单
const editNicknameForm = ref({
  nickname: ''
})

// 修改密码表单
const passwordForm = ref({
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  code: ''
})

// 密码修改规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
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

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取用户信息
const getUserInfo = () => {
  const user = localStorage.getItem('userInfo')
  if (user) {
    userInfo.value = JSON.parse(user)
    passwordForm.value.email = userInfo.value.email
  }
}

// 开始编辑昵称
const startEditNickname = () => {
  isEditingNickname.value = true
  editNicknameForm.value.nickname = userInfo.value.nickname
}

// 取消编辑昵称
const cancelEditNickname = () => {
  isEditingNickname.value = false
  editNicknameForm.value.nickname = ''
}

// 保存昵称
const saveNickname = async () => {
  if (!editNicknameForm.value.nickname.trim()) {
    ElMessage.error('昵称不能为空')
    return
  }
  
  if (editNicknameForm.value.nickname === userInfo.value.nickname) {
    ElMessage.info('昵称未发生变化')
    isEditingNickname.value = false
    return
  }

  try {
    const response = await request.put('/updateNickname', null, {
      params: {
        user_id: userInfo.value.user_id,
        nickname: editNicknameForm.value.nickname
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('昵称修改成功')
      // 更新用户信息
      userInfo.value.nickname = editNicknameForm.value.nickname
      // 更新localStorage中的用户信息
      const user = localStorage.getItem('userInfo')
      if (user) {
        const updatedUser = JSON.parse(user)
        updatedUser.nickname = editNicknameForm.value.nickname
        localStorage.setItem('userInfo', JSON.stringify(updatedUser))
      }
      isEditingNickname.value = false
    } else {
      ElMessage.error(response.msg || '昵称修改失败')
    }
  } catch (error) {
    ElMessage.error('昵称修改失败：' + (error.response?.data?.message || error.message || '未知错误'))
    console.error('昵称修改失败:', error)
  }
}

// 获取验证码
const getCode = async () => {
  if (!passwordForm.value.email) {
    ElMessage.error('邮箱不能为空')
    return
  }

  try {
    // 调用后端获取验证码接口
    const response = await request.get('/sendEmailCode', {
      params: {
        email: passwordForm.value.email
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('验证码已发送至您的邮箱，请注意查收')
      startCountDown()
    } else {
      ElMessage.error(response.msg || '获取验证码失败')
    }
  } catch (error) {
    ElMessage.error('获取验证码失败：' + (error.response?.data?.message || error.message || '未知错误'))
    console.error('获取验证码失败:', error)
  }
}

// 开始倒计时
const startCountDown = () => {
  isCountingDown.value = true
  countDown.value = 60
  const timer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(timer)
      isCountingDown.value = false
    }
  }, 1000)
}

// 更新密码
const updatePassword = async () => {
  await passwordFormRef.value.validate()
  
  try {
    const response = await request.put('/updatePasswordByEmail', null, {
      params: {
        email: passwordForm.value.email,
        password: passwordForm.value.newPassword,
        code: passwordForm.value.code
      }
    })
    
    if (response.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      // 清除用户信息并跳转到登录页
      localStorage.removeItem('userInfo')
      router.push('/login')
    } else {
      ElMessage.error(response.msg || '密码修改失败')
    }
  } catch (error) {
    ElMessage.error('密码修改失败：' + (error.response?.data?.message || error.message || '未知错误'))
    console.error('密码修改失败:', error)
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordFormRef.value.resetFields()
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-form .el-form-item {
  margin-bottom: 20px;
}

.password-form {
  max-width: 500px;
  margin-top: 20px;
}

.close-button {
  float: right;
}
</style>
<template>
  <div class="home-container">
    <div class="header">
      <h1>用户管理</h1>
      <div>
        <el-button type="primary" @click="goToDevice" style="margin-right: 10px">设备管理</el-button>
        <el-button type="primary" @click="goToProfile" style="margin-right: 10px">个人中心</el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <el-table :data="userList" border style="width: 100%">
      <el-table-column prop="user_id" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="username" label="用户名" width="120"></el-table-column>
      <el-table-column prop="nickname" label="昵称" width="120"></el-table-column>
      <el-table-column prop="phone" label="电话" width="150"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="is_active" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active === 1 ? 'success' : 'danger'">
            {{ scope.row.is_active === 1 ? '激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_time" label="创建时间" width="200"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const userList = ref([])
const router = useRouter()

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList()
})

// 调用后端接口获取所有用户
const fetchUserList = async () => {
  try {
    const response = await request.get('/selectAllUser')
    if (response.code === 200) {
      userList.value = response.data || []
    } else {
      ElMessage.error('获取用户列表失败：' + (response.msg || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('请求失败，请检查后端服务是否启动')
    console.error('接口调用错误：', error)
  }
}

// 跳转到设备管理页面
const goToDevice = () => {
  router.push('/device')
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/profile')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
<template>
  <div class="device-container">
    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button class="close-button" type="primary" @click="goBack" size="small">返回</el-button>
        </div>
      </template>

      <el-table :data="deviceList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="device_id" label="设备ID" width="100"></el-table-column>
        <el-table-column prop="name" label="设备名称" width="150"></el-table-column>
        <el-table-column prop="type" label="设备类型" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '在线' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brightness" label="亮度" width="100">
          <template #default="scope">
            {{ scope.row.brightness }}%
          </template>
        </el-table-column>
        <el-table-column prop="room" label="房间" width="120"></el-table-column>
        <el-table-column prop="install_time" label="安装时间" width="200">
          <template #default="scope">
            {{ formatDate(scope.row.install_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 当没有设备数据时显示提示 -->
      <el-empty v-if="!loading && deviceList.length === 0" description="暂无设备数据"></el-empty>
      
      <!-- 添加刷新按钮 -->
      <div style="margin-top: 20px; text-align: center;">
        <el-button type="primary" @click="fetchDeviceList" :loading="loading">刷新数据</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const deviceList = ref([])
const loading = ref(false)

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? dateString : date.toLocaleString('zh-CN')
}

// 获取设备列表
const fetchDeviceList = async () => {
  loading.value = true
  try {
    const response = await request.get('/findAllDevices')
    if (response.code === 200) {
      // 过滤掉无效数据，只保留有设备名称的有效记录
      const validDevices = (response.data || []).filter(device => 
        device && device.name && device.device_id && device.type
      )
      
      deviceList.value = validDevices
      
      // 如果没有有效数据，显示通知
      if (validDevices.length === 0) {
        ElNotification({
          title: '提示',
          message: '当前暂无有效设备数据',
          type: 'info'
        })
      }
    } else {
      ElMessage.error('获取设备列表失败：' + (response.msg || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('请求失败，请检查后端服务是否启动')
    console.error('接口调用错误：', error)
  } finally {
    loading.value = false
  }
}

// 查看设备详情
const handleView = (device) => {
  ElMessage.info('查看设备: ' + device.name)
  // 这里可以跳转到设备详情页
}

// 编辑设备
const handleEdit = (device) => {
  ElMessage.info('编辑设备: ' + device.name)
  // 这里可以跳转到设备编辑页
}

// 删除设备
const handleDelete = (device) => {
  ElMessageBox.confirm(
    `确定要删除设备 "${device.name}" 吗？此操作无法撤销！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    // 调用删除接口
    try {
      const response = await request.delete(`/deleteDeviceById?device_id=${device.device_id}`)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        // 重新获取设备列表
        fetchDeviceList()
      } else {
        ElMessage.error('删除失败: ' + (response.msg || '未知错误'))
      }
    } catch (error) {
      ElMessage.error('删除请求失败: ' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

onMounted(() => {
  fetchDeviceList()
})
</script>

<style scoped>
.device-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.device-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  float: right;
}
</style>
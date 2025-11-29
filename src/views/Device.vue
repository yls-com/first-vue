<template>
  <div class="device-container">
    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <div>
            <el-button class="add-button" type="primary" @click="showAddDeviceDialog" size="small">添加设备</el-button>
            <el-button class="batch-add-button" type="success" @click="showBatchAddDialog" size="small">批量添加</el-button>
            <el-button class="close-button" type="primary" @click="goBack" size="small">返回</el-button>
          </div>
        </div>
      </template>

      <!-- 筛选功能 -->
      <div class="filter-container" style="margin-bottom: 20px;">
        <el-input
          v-model="filterText"
          placeholder="请输入设备名称进行筛选"
          style="width: 300px; margin-right: 20px;"
          clearable
          @keyup.enter="handleFilter"
        />
        <el-button type="primary" @click="handleFilter">搜索</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>

      <el-table :data="filteredDeviceList" border style="width: 100%" v-loading="loading">
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
      <el-empty v-if="!loading && filteredDeviceList.length === 0" description="暂无设备数据"></el-empty>
      
      <!-- 添加刷新按钮 -->
      <div style="margin-top: 20px; text-align: center;">
        <el-button type="primary" @click="fetchDeviceList" :loading="loading">刷新数据</el-button>
      </div>
    </el-card>

    <!-- 添加设备对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加设备" width="500px">
      <el-form :model="addingDevice" label-width="80px">
        <el-form-item label="设备ID" prop="device_id" :rules="[{ required: true, message: '请输入设备ID'}]">
          <el-input v-model.number="addingDevice.device_id" type="number"></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="name" :rules="[{ required: true, message: '请输入设备名称'}]">
          <el-input v-model="addingDevice.name"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="type" :rules="[{ required: true, message: '请输入设备类型'}]">
          <el-input v-model="addingDevice.type"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status" :rules="[{ required: true, message: '请选择状态'}]">
          <el-select v-model="addingDevice.status" placeholder="请选择状态">
            <el-option label="在线" value="在线"></el-option>
            <el-option label="离线" value="离线"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="亮度">
          <el-slider v-model="addingDevice.brightness" :min="0" :max="100" show-input></el-slider>
        </el-form-item>
        <el-form-item label="房间" prop="room" :rules="[{ required: true, message: '请输入房间'}]">
          <el-input v-model="addingDevice.room"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAddDevice">添加</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量添加设备对话框 -->
    <el-dialog v-model="batchAddDialogVisible" title="批量添加设备" width="800px">
      <el-alert title="请按照指定格式输入设备信息，每行一条设备记录" type="info" show-icon style="margin-bottom: 20px;" />
      <el-form :model="batchAddingDevices" label-width="100px">
        <el-form-item label="设备信息" prop="devicesData" :rules="[{ required: true, message: '请输入设备信息'}]">
          <el-input
            v-model="batchAddingDevices.devicesData"
            type="textarea"
            :rows="10"
            placeholder='请输入设备信息，格式如下(以换行分隔)：
device_id,name,type,status,brightness,room
1,智能灯泡,照明,在线,80,客厅
2,智能插座,插座,离线,0,卧室'
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBatchAddDevices">批量添加</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑设备对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑设备" width="500px">
      <el-form :model="editingDevice" label-width="80px">
        <el-form-item label="设备ID">
          <el-input v-model="editingDevice.device_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="editingDevice.name"></el-input>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-input v-model="editingDevice.type"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editingDevice.status" placeholder="请选择状态">
            <el-option label="在线" value="在线"></el-option>
            <el-option label="离线" value="离线"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="亮度">
          <el-slider v-model="editingDevice.brightness" :min="0" :max="100" show-input></el-slider>
        </el-form-item>
        <el-form-item label="房间">
          <el-input v-model="editingDevice.room"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const deviceList = ref([])
const loading = ref(false)
const filterText = ref('')

// 添加设备相关
const addDialogVisible = ref(false)
const addingDevice = ref({
  device_id: '',
  name: '',
  type: '',
  status: '',
  brightness: 0,
  room: ''
})

// 批量添加设备相关
const batchAddDialogVisible = ref(false)
const batchAddingDevices = ref({
  devicesData: ''
})

// 编辑设备相关
const editDialogVisible = ref(false)
const editingDevice = ref({
  device_id: 0,
  name: '',
  type: '',
  status: '',
  brightness: 0,
  room: ''
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 显示添加设备对话框
const showAddDeviceDialog = () => {
  // 重置表单数据
  addingDevice.value = {
    device_id: '',
    name: '',
    type: '',
    status: '',
    brightness: 0,
    room: ''
  }
  addDialogVisible.value = true
}

// 显示批量添加设备对话框
const showBatchAddDialog = () => {
  batchAddingDevices.value.devicesData = ''
  batchAddDialogVisible.value = true
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? dateString : date.toLocaleString('zh-CN')
}

// 筛选后的设备列表
const filteredDeviceList = computed(() => {
  if (!filterText.value) {
    return deviceList.value
  }
  return deviceList.value.filter(device => 
    device.name && device.name.includes(filterText.value)
  )
})

// 处理筛选
const handleFilter = () => {
  // 这里不需要做任何事情，因为使用了computed属性
}

// 重置筛选
const resetFilter = () => {
  filterText.value = ''
}

// 获取设备列表
const fetchDeviceList = async () => {
  loading.value = true
  try {
    const response = await request.get('/device/findAllDevices')
    if (response.code === 200) {
      // 过滤掉无效数据，只保留有设备名称的有效记录
      const validDevices = (response.data || []).filter(device => 
        device && device.name && device.device_id !== undefined && device.type
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

// 保存添加的设备
const saveAddDevice = async () => {
  try {
    // 将数据转换为表单格式
    const formData = new URLSearchParams();
    formData.append('device_id', addingDevice.value.device_id);
    formData.append('name', addingDevice.value.name);
    formData.append('type', addingDevice.value.type);
    formData.append('status', addingDevice.value.status);
    formData.append('brightness', addingDevice.value.brightness);
    formData.append('room', addingDevice.value.room);

    const response = await request.post('/device/addDevice', formData)

    if (response.code === 200) {
      ElMessage.success('设备添加成功')
      addDialogVisible.value = false
      // 重新获取设备列表
      await fetchDeviceList()
    } else {
      ElMessage.error('添加失败: ' + (response.msg || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('添加请求失败: ' + error.message)
  }
}

// 查看设备详情
const handleView = (device) => {
  ElMessage.info('查看设备: ' + device.name)
  // 这里可以跳转到设备详情页
}

// 编辑设备
const handleEdit = (device) => {
  // 初始化编辑数据
  editingDevice.value = {
    device_id: device.device_id,
    name: device.name,
    type: device.type,
    status: device.status,
    brightness: device.brightness,
    room: device.room
  }
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  try {
    // 将数据转换为表单格式
    const formData = new URLSearchParams();
    formData.append('device_id', editingDevice.value.device_id);
    formData.append('name', editingDevice.value.name || '');
    formData.append('type', editingDevice.value.type || '');
    formData.append('status', editingDevice.value.status || '');
    formData.append('brightness', editingDevice.value.brightness);
    formData.append('room', editingDevice.value.room || '');

    const response = await request.post('/device/updateDeviceById', formData)

    if (response.code === 200) {
      ElMessage.success('设备更新成功')
      editDialogVisible.value = false
      // 重新获取设备列表
      await fetchDeviceList()
    } else {
      ElMessage.error('更新失败: ' + (response.msg || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('更新请求失败: ' + error.message)
  }
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
      const response = await request.delete(`/device/deleteDeviceById?device_id=${device.device_id}`)
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

// 保存批量添加的设备
const saveBatchAddDevices = async () => {
  try {
    // 解析输入的数据
    const lines = batchAddingDevices.value.devicesData.trim().split('\n');
    if (lines.length < 2) {
      ElMessage.error('请按照正确的格式输入设备信息');
      return;
    }

    // 获取标题行
    const headers = lines[0].split(',');
    // 验证标题行
    const requiredHeaders = ['device_id', 'name', 'type', 'status', 'brightness', 'room'];
    if (!requiredHeaders.every(header => headers.includes(header))) {
      ElMessage.error('CSV格式不正确，请确保包含所有必需的列标题');
      return;
    }

    // 解析数据行
    const devices = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length !== headers.length) {
        ElMessage.error(`第${i + 1}行数据格式不正确`);
        return;
      }

      const device = {};
      headers.forEach((header, index) => {
        let value = values[index];
        // 根据列名进行相应的类型转换
        if (header === 'device_id' || header === 'brightness') {
          value = Number(value);
        }
        device[header] = value;
      });
      
      devices.push(device);
    }

    // 发送请求到后端
    const response = await request.post('/device/batchAddDevices', devices);

    if (response.code === 200) {
      ElMessage.success('设备批量添加成功');
      batchAddDialogVisible.value = false;
      // 重新获取设备列表
      await fetchDeviceList();
    } else {
      ElMessage.error('批量添加失败: ' + (response.msg || '未知错误'));
    }
  } catch (error) {
    ElMessage.error('批量添加请求失败: ' + error.message);
  }
}

onMounted(() => {
  fetchDeviceList()
})
</script>
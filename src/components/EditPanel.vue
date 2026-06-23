<script setup>
import { ref } from 'vue';

// 定义 props
const props = defineProps({
  selectedCell: {
    type: String,
    default: ''
  },
  bindingPath: {
    type: String,
    default: ''
  }
});

// 定义 emit 事件
const emit = defineEmits(['update:bindingPath', 'applyBinding', 'selectField', 'saveTemplate']);

// 当前激活的选项卡
const activeTab = ref('binding');

// 模板名称
const templateName = ref('');

// 保存状态
const saveStatus = ref('');

// 模拟数据源
const dataSources = ref([
  {
    name: '员工信息',
    expanded: false,
    fields: ['员工ID', '姓名', '部门', '职位', '入职日期', '薪资']
  },
  {
    name: '销售数据',
    expanded: false,
    fields: ['订单ID', '产品名称', '数量', '单价', '金额', '客户名称']
  },
  {
    name: '产品库存',
    expanded: false,
    fields: ['产品ID', '产品名称', '类别', '库存数量', '单价', '供应商']
  },
  {
    name: '部门信息',
    expanded: false,
    fields: ['部门ID', '部门名称', '负责人', '人数', '办公地点']
  }
]);

// 切换选项卡
const switchTab = (tabName) => {
  activeTab.value = tabName;
  saveStatus.value = '';
};

// 切换数据源展开状态
const toggleDataSource = (index) => {
  dataSources.value[index].expanded = !dataSources.value[index].expanded;
};

// 点击字段设置绑定路径
const setFieldBinding = (dataSourceName, fieldName) => {
  const path = `${dataSourceName}.${fieldName}`;
  emit('update:bindingPath', path);
  emit('selectField', path);
};

// 设置绑定路径按钮
const applyBinding = () => {
  emit('applyBinding');
};

// 保存模板
const saveTemplate = () => {
  if (!templateName.value.trim()) {
    saveStatus.value = '请输入模板名称';
    return;
  }
  saveStatus.value = '保存中...';
  emit('saveTemplate', templateName.value.trim());
};

// 设置保存状态
const setSaveStatus = (status) => {
  saveStatus.value = status;
};

// 暴露方法给父组件
defineExpose({
  setSaveStatus
});
</script>

<template>
  <div class="panel-container">
    <div class="panel-header">
      <h3>编辑面板</h3>
    </div>
    
    <!-- 选项卡 -->
    <div class="tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'binding' }"
        @click="switchTab('binding')"
      >
        单元格绑定
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'template' }"
        @click="switchTab('template')"
      >
        模板信息
      </div>
    </div>
    
    <!-- 选项卡内容 -->
    <div class="tab-content">
      <!-- 单元格绑定设置 -->
      <div v-if="activeTab === 'binding'" class="panel-section">
        <div class="section-header">
          <h4>单元格绑定设置</h4>
        </div>
        <div class="section-content">
          <div class="form-group">
            <label>当前单元格：</label>
            <input 
              type="text" 
              :value="selectedCell" 
              readonly 
              class="input-field"
              placeholder="未选中单元格"
            />
          </div>
          <div class="form-group">
            <label>绑定路径：</label>
            <input 
              type="text" 
              :value="bindingPath"
              @input="emit('update:bindingPath', $event.target.value)"
              class="input-field"
              placeholder="输入绑定路径"
            />
          </div>
          <button class="btn-set-binding" @click="applyBinding">
            设置绑定路径
          </button>
        </div>
        
        <!-- 分隔线 -->
        <div class="panel-divider"></div>
        
        <!-- 数据源信息 -->
        <div class="section-header">
          <h4>数据源信息</h4>
        </div>
        <div class="section-content data-sources">
          <div 
            v-for="(source, index) in dataSources" 
            :key="source.name"
            class="data-source-item"
          >
            <div 
              class="data-source-header" 
              @click="toggleDataSource(index)"
            >
              <span class="expand-icon">{{ source.expanded ? '▼' : '▶' }}</span>
              <span class="source-name">{{ source.name }}</span>
            </div>
            <div v-if="source.expanded" class="fields-list">
              <div 
                v-for="field in source.fields" 
                :key="field"
                class="field-item"
                @click="setFieldBinding(source.name, field)"
              >
                {{ field }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 模板信息设置 -->
      <div v-if="activeTab === 'template'" class="panel-section">
        <div class="section-header">
          <h4>模板信息设置</h4>
        </div>
        <div class="section-content">
          <div class="form-group">
            <label>模板名称：</label>
            <input 
              type="text" 
              v-model="templateName" 
              class="input-field"
              placeholder="输入模板名称"
            />
          </div>
          <button class="btn-save-template" @click="saveTemplate">
            保存为 SSJSON 文件
          </button>
          <div v-if="saveStatus" class="save-status" :class="{ success: saveStatus.includes('成功'), error: !saveStatus.includes('成功') && !saveStatus.includes('保存中') }">
            {{ saveStatus }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-container {
  width: 320px;
  height: 100%;
  background: #f5f5f5;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  background: #4a90d9;
  color: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

/* 选项卡样式 */
.tabs {
  display: flex;
  background: #e8e8e8;
  border-bottom: 1px solid #d0d0d0;
}

.tab-item {
  flex: 1;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  transition: background 0.2s;
}

.tab-item:hover {
  background: #d8d8d8;
}

.tab-item.active {
  background: #fff;
  color: #4a90d9;
  font-weight: 500;
  border-bottom: 2px solid #4a90d9;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.panel-section {
  padding: 12px;
}

.section-header {
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.section-content {
  background: white;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.input-field[readonly] {
  background: #f8f8f8;
  color: #888;
}

.btn-set-binding, .btn-save-template {
  width: 100%;
  padding: 10px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
}

.btn-set-binding:hover, .btn-save-template:hover {
  background: #3a7fc8;
}

.panel-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 16px 0;
}

.data-sources {
  max-height: calc(100vh - 450px);
  overflow-y: auto;
}

.data-source-item {
  margin-bottom: 8px;
}

.data-source-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #4a90d9;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.data-source-header:hover {
  background: #3a7fc8;
}

.expand-icon {
  margin-right: 8px;
  font-size: 10px;
}

.source-name {
  font-weight: 500;
}

.fields-list {
  margin-top: 4px;
  padding-left: 8px;
  border-left: 2px solid #4a90d9;
}

.field-item {
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.field-item:last-child {
  border-bottom: none;
  border-radius: 0 0 4px 4px;
}

.field-item:first-child {
  border-radius: 4px 4px 0 0;
}

.field-item:hover {
  background: #e8f0fe;
  color: #4a90d9;
}

/* 保存状态 */
.save-status {
  margin-top: 12px;
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.save-status.success {
  background: #d4edda;
  color: #155724;
}

.save-status.error {
  background: #f8d7da;
  color: #721c24;
}
</style>
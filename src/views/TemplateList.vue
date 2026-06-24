<template>
  <div class="template-list-container">
    <div class="page-header">
      <h2>模板列表</h2>
      <span class="template-count">共 {{ templates.length }} 个模板</span>
    </div>
    
    <div v-if="templates.length === 0" class="empty-message">
      <div class="empty-icon">📋</div>
      <p>暂无模板，请先在表格设计器中创建并保存模板。</p>
    </div>
    
    <div v-else class="table-wrapper">
      <table class="template-table">
        <thead>
          <tr>
            <th style="width: 60px;">序号</th>
            <th style="flex: 1;">模板名称</th>
            <th style="width: 160px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(template, index) in templates" :key="template">
            <td>{{ index + 1 }}</td>
            <td><span class="file-icon">📄</span>{{ getTemplateName(template) }}</td>
            <td>
              <div class="actions">
                <button @click="handleFill(template)" class="btn btn-fill" title="填报">✏️</button>
                <button @click="handleEdit(template)" class="btn btn-edit" title="更改">✏️</button>
                <button @click="handleDelete(template)" class="btn btn-delete" title="删除">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 删除确认弹窗 -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-icon">⚠️</div>
        <h3>确认删除</h3>
        <p>确定要删除模板 "<strong>{{ deletingTemplate }}</strong>" 吗？</p>
        <p class="modal-warning">此操作不可撤销！</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-cancel">取消</button>
          <button @click="confirmDelete" class="btn btn-confirm">确定删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const templates = ref([]);
const showConfirmModal = ref(false);
const deletingTemplate = ref('');

// 获取模板名称（去掉.ssjson扩展名）
const getTemplateName = (filename) => {
  if (filename.endsWith('.ssjson')) {
    return filename.slice(0, -7);
  }
  return filename;
};

// 获取模板列表
const fetchTemplates = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/templates');
    const result = await response.json();
    if (result.success) {
      templates.value = result.templates;
    }
  } catch (error) {
    console.error('获取模板列表失败:', error);
  }
};

// 填报操作
const handleFill = (templateName) => {
  router.push({ name: 'DataFill', query: { template: encodeURIComponent(templateName), mode: 'fill' } });
};

// 更改操作
const handleEdit = (templateName) => {
  router.push({ name: 'DataFill', query: { template: encodeURIComponent(templateName), mode: 'edit' } });
};

// 删除操作（显示确认）
const handleDelete = (templateName) => {
  deletingTemplate.value = templateName;
  showConfirmModal.value = true;
};

// 确认删除
const confirmDelete = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/template/${deletingTemplate.value}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (result.success) {
      templates.value = templates.value.filter(t => t !== deletingTemplate.value);
    }
  } catch (error) {
    console.error('删除模板失败:', error);
  }
  showConfirmModal.value = false;
};

// 取消删除
const cancelDelete = () => {
  showConfirmModal.value = false;
};

// 页面加载时获取模板列表
onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.template-list-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
  background: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.template-count {
  background: #e9ecef;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #6c757d;
}

.empty-message {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-message p {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.template-table {
  width: 100%;
  border-collapse: collapse;
}

.template-table thead {
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
}

.template-table th {
  padding: 14px 20px;
  text-align: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.template-table th:first-child {
  border-radius: 12px 0 0 0;
}

.template-table th:last-child {
  border-radius: 0 12px 0 0;
}

.template-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
}

.template-table tbody tr:hover {
  background: #f8fafc;
}

.template-table tbody tr:last-child {
  border-bottom: none;
}

.template-table td {
  padding: 14px 20px;
  font-size: 15px;
  color: #495057;
  text-align: center;
  vertical-align: middle;
}

.template-table td:nth-child(2) {
  text-align: left;
}

.file-icon {
  margin-right: 10px;
  font-size: 18px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-fill {
  background: #4a90d9;
  color: white;
}

.btn-fill:hover {
  background: #357abd;
}

.btn-edit {
  background: #28a745;
  color: white;
}

.btn-edit:hover {
  background: #218838;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 16px;
  min-width: 360px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-content h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.modal-content p {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 15px;
}

.modal-warning {
  color: #dc3545 !important;
  font-weight: 500;
  margin-bottom: 24px !important;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.modal-actions .btn {
  width: 100px;
  height: auto;
  padding: 10px 20px;
}

.btn-confirm {
  background: #dc3545;
  color: white;
}

.btn-cancel {
  background: #e9ecef;
  color: #495057;
}
</style>

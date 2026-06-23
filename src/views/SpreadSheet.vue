<script setup>
import { ref, onUnmounted } from 'vue';
import '@grapecity-software/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import "@grapecity-software/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";
import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-designer-resources-cn";
import Designer from "@grapecity-software/spread-sheets-designer-vue";
import EditPanel from '../components/EditPanel.vue';
import "@grapecity-software/spread-sheets-io";

const styleInfo = { height: "calc(100vh - 48px)", width: "100%" };
const config = GC.Spread.Sheets.Designer.DefaultConfig;
const spreadOptions = {
  sheetCount: 2,
};

let designer = null;
let spread = null;

// 当前选中单元格位置
const selectedCell = ref('');
// 当前单元格绑定路径
const bindingPath = ref('');

// 编辑面板引用
const editPanelRef = ref(null);

const designerInitialized = (value) => {
  designer = value;
  spread = designer.getWorkbook();
  
  // 监听单元格选中事件
  spread.bind(GC.Spread.Sheets.Events.SelectionChanged, (e, args) => {
    const sheet = args.sheet;
    const selections = sheet.getSelections();
    if (selections && selections.length > 0) {
      const sel = selections[0];
      const row = sel.row;
      const col = sel.col;
      // 转换为 Excel 列名
      const colName = columnIndexToName(col);
      selectedCell.value = `${colName}${row + 1}`;
      
      // 获取单元格绑定路径（使用 SpreadJS 绑定 API）
      const binding = sheet.getBindingPath(row, col);
      bindingPath.value = binding || '';
    }
  });
};

// 列索引转列名
const columnIndexToName = (index) => {
  let name = '';
  let num = index;
  while (num >= 0) {
    name = String.fromCharCode(65 + (num % 26)) + name;
    num = Math.floor(num / 26) - 1;
  }
  return name;
};

// 设置绑定路径（使用 SpreadJS 绑定 API）
const applyBinding = () => {
  if (spread && selectedCell.value && bindingPath.value) {
    const sheet = spread.getActiveSheet();
    const selections = sheet.getSelections();
    if (selections && selections.length > 0) {
      const sel = selections[0];
      // 使用 setBindingPath 设置单元格绑定路径
      sheet.setBindingPath(sel.row, sel.col, bindingPath.value);
    }
  }
};

// 选择字段（使用 SpreadJS 绑定 API）
const handleSelectField = (path) => {
  if (spread && selectedCell.value) {
    const sheet = spread.getActiveSheet();
    const selections = sheet.getSelections();
    if (selections && selections.length > 0) {
      const sel = selections[0];
      // 使用 setBindingPath 设置单元格绑定路径
      sheet.setBindingPath(sel.row, sel.col, path);
    }
  }
};

// 保存模板为 SSJSON 文件
const handleSaveTemplate = async (templateName) => {
  if (!spread) {
    if (editPanelRef.value) {
      editPanelRef.value.setSaveStatus('错误：无法获取工作簿');
    }
    return;
  }
  
  try {
    // 获取工作簿的 JSON 数据
    const jsonData = spread.toJSON();
    
    // 序列化为字符串
    const jsonString = JSON.stringify(jsonData);
    
    // 创建文件对象
    const fileName = `${templateName}.ssjson`;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });
    
    // 创建 FormData 并添加文件
    const formData = new FormData();
    formData.append('file', file);
    
    // 调用后端接口保存文件
    try {
      const response = await fetch('http://localhost:3001/api/save-template', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (editPanelRef.value) {
          editPanelRef.value.setSaveStatus(`保存成功：${fileName}`);
        }
      } else {
        // 如果后端接口不可用，尝试下载到本地
        downloadFileFromBlob(blob, fileName);
        if (editPanelRef.value) {
          editPanelRef.value.setSaveStatus(`已下载到本地：${fileName}`);
        }
      }
    } catch (e) {
      // 网络错误，下载到本地
      downloadFileFromBlob(blob, fileName);
      if (editPanelRef.value) {
        editPanelRef.value.setSaveStatus(`已下载到本地：${fileName}`);
      }
    }
  } catch (error) {
    console.error('保存模板失败:', error);
    if (editPanelRef.value) {
      editPanelRef.value.setSaveStatus('保存失败：' + error.message);
    }
  }
};

// 从 blob 下载文件
const downloadFileFromBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 下载文件到本地
const downloadFile = (content, fileName) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 组件卸载时清理资源
onUnmounted(() => {
  if (spread) {
    // 解绑所有事件监听
    try {
      spread.unbind(GC.Spread.Sheets.Events.SelectionChanged);
    } catch (e) {
      console.warn('Error unbinding events:', e);
    }
    spread = null;
  }
  if (designer) {
    // 销毁 Designer 实例
    try {
      if (typeof designer.destroy === 'function') {
        designer.destroy();
      } else if (typeof designer.dispose === 'function') {
        designer.dispose();
      }
    } catch (e) {
      console.warn('Error destroying designer:', e);
    }
    designer = null;
  }
});
</script>

<template>
  <div class="app-container">
    <!-- SpreadJS Designer -->
    <div class="designer-container">
      <Designer 
        :styleInfo="styleInfo" 
        :config="config" 
        :spreadOptions="spreadOptions"
        @designerInitialized="designerInitialized" 
      />
    </div>
    
    <!-- 右侧编辑面板 -->
    <EditPanel 
      ref="editPanelRef"
      :selectedCell="selectedCell"
      v-model:bindingPath="bindingPath"
      @applyBinding="applyBinding"
      @selectField="handleSelectField"
      @saveTemplate="handleSaveTemplate"
    />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: calc(100vh - 48px);
}

.designer-container {
  flex: 1;
  height: 100%;
}
</style>
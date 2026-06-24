<template>
  <div class="data-fill-container">
    <div class="header">
      <h2>{{ templateName ? templateName + ' - 数据填写' : '数据填写' }}</h2>
      <p>{{ mode === 'fill' ? '填报模式' : '更改模式' }}：请填写以下数据</p>
    </div>
    <!-- 使用 v-show 保持 DOM 元素始终存在 -->
    <div v-show="loading" class="loading-overlay">正在加载模板...</div>
    <div v-show="error" class="error-overlay">{{ error }}</div>
    <div ref="spreadRef" class="spread-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import '@grapecity-software/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import * as GC from "@grapecity-software/spread-sheets";

const route = useRoute();
const router = useRouter();
const spreadRef = ref(null);
const templateName = ref('');
const mode = ref('fill');
const loading = ref(true);
const error = ref('');
let spread = null;

// 监听路由参数变化
watch(() => route.query.template, async (newTemplateName) => {
  console.log('Route template changed:', newTemplateName);
  if (newTemplateName && spread) {
    templateName.value = decodeURIComponent(newTemplateName);
    mode.value = route.query.mode || 'fill';
    loading.value = true;
    error.value = '';
    await loadTemplate();
    loading.value = false;
  }
});

watch(() => route.query.mode, (newMode) => {
  console.log('Route mode changed:', newMode);
  if (newMode) {
    mode.value = newMode;
  }
});

onMounted(async () => {
  // 获取 URL 参数并解码中文
  templateName.value = route.query.template ? decodeURIComponent(route.query.template) : '';
  mode.value = route.query.mode || 'fill';
  
  console.log('DataFill mounted:', { templateName: templateName.value, mode: mode.value });
  
  // 初始化 SpreadJS
  if (spreadRef.value) {
    try {
      spread = new GC.Spread.Sheets.Workbook(spreadRef.value, {
        sheetCount: 1
      });
      
      // 如果有模板名称，加载模板文件
      if (templateName.value) {
        await loadTemplate();
      } else {
        // 没有模板名称时设置默认样式
        initDefaultSheet();
      }
      
      // 监听单元格变化
      spread.bind(GC.Spread.Sheets.Events.CellChanged, (e, args) => {
        const sheet = args.sheet;
        const row = args.row;
        const col = args.col;
        console.log(`Cell ${columnIndexToName(col)}${row + 1} changed`);
      });
      
      loading.value = false;
      console.log('SpreadJS initialized successfully');
    } catch (err) {
      console.error('Error initializing SpreadJS:', err);
      error.value = '初始化失败: ' + err.message;
      loading.value = false;
    }
  } else {
    console.error('spreadRef is null');
    error.value = '无法初始化表格控件';
    loading.value = false;
  }
});

// 初始化默认工作表
const initDefaultSheet = () => {
  const sheet = spread.getActiveSheet();
  sheet.setColumnWidth(0, 120);
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 120);
};

// 加载模板文件
const loadTemplate = async () => {
  try {
    console.log('Loading template:', templateName.value);
    
    // 并行加载模板和数据源
    const [templateResponse, datasourceResponse] = await Promise.all([
      fetch(`http://localhost:3001/api/template/${templateName.value}`),
      fetch(`http://localhost:3001/api/template-datasource/${templateName.value}`)
    ]);
    
    console.log('Template response status:', templateResponse.status);
    console.log('Datasource response status:', datasourceResponse.status);
    
    if (!templateResponse.ok) {
      throw new Error('HTTP error: ' + templateResponse.status);
    }
    
    const templateResult = await templateResponse.json();
    const datasourceResult = await datasourceResponse.json();
    
    console.log('Template result:', templateResult);
    console.log('Datasource result:', datasourceResult);
    
    if (templateResult.success && templateResult.data) {
      console.log('Calling spread.fromJSON...');
      // 使用 setTimeout 确保 DOM 更新完成
      setTimeout(() => {
        try {
          spread.fromJSON(templateResult.data);
          console.log('spread.fromJSON completed');
          
          // 设置数据源
          if (datasourceResult.success && datasourceResult.datasource) {
            const sheet = spread.getActiveSheet();
            console.log('Setting datasource:', datasourceResult.datasource);
            // 将数据源实例化为 CellBindingSource
            const dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(datasourceResult.datasource);
            sheet.setDataSource(dataSource);
            console.log('Datasource set successfully');
          }
          
          // 更新视图
          if (spread) {
            spread.invalidateLayout();
            spread.repaint();
            console.log('UI updated');
          }
        } catch (jsonErr) {
          console.error('Error in spread.fromJSON:', jsonErr);
          error.value = '加载模板数据失败: ' + jsonErr.message;
          initDefaultSheet();
        }
      }, 100);
    } else {
      error.value = templateResult.message || '加载模板失败';
      initDefaultSheet();
    }
  } catch (err) {
    console.error('加载模板出错:', err);
    error.value = '加载模板失败，请检查后端服务是否启动: ' + err.message;
    initDefaultSheet();
  }
};

onUnmounted(() => {
  // 清理资源
  if (spread) {
    try {
      spread.unbind(GC.Spread.Sheets.Events.CellChanged);
    } catch (e) {
      console.warn('Error unbinding events:', e);
    }
    try {
      if (typeof spread.destroy === 'function') {
        spread.destroy();
      }
    } catch (e) {
      console.warn('Error destroying workbook:', e);
    }
    spread = null;
  }
});

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
</script>

<style scoped>
.data-fill-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 48px);
  position: relative;
}

.header {
  padding: 16px 24px;
  background: #4a90d9;
  color: white;
}

.header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.spread-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.loading-overlay {
  color: #666;
  font-size: 16px;
}

.error-overlay {
  color: #d9534f;
  font-size: 16px;
}
</style>
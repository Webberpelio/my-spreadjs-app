<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import '@grapecity-software/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import * as GC from "@grapecity-software/spread-sheets";

const spreadRef = ref(null);
let spread = null;

onMounted(() => {
  // 初始化 SpreadJS
  if (spreadRef.value) {
    spread = new GC.Spread.Sheets.Workbook(spreadRef.value, {
      sheetCount: 1
    });
    
    // 获取第一个工作表
    const sheet = spread.getActiveSheet();
    
    // 设置一些初始样式
    sheet.setColumnWidth(0, 120);
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 120);
    
    // 监听绑定路径变化
    spread.bind(GC.Spread.Sheets.Events.CellChanged, (e, args) => {
      const sheet = args.sheet;
      const row = args.row;
      const col = args.col;
      // 可以在这里处理数据变化
      console.log(`Cell ${columnIndexToName(col)}${row + 1} changed`);
    });
  }
});

onUnmounted(() => {
  // 清理资源
  if (spread) {
    // 解绑事件监听
    try {
      spread.unbind(GC.Spread.Sheets.Events.CellChanged);
    } catch (e) {
      console.warn('Error unbinding events:', e);
    }
    // 使用 destroy 方法销毁 Workbook
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

<template>
  <div class="data-fill-container">
    <div class="header">
      <h2>数据填充页面</h2>
      <p>在此页面中填写数据，无需工具栏操作</p>
    </div>
    <div ref="spreadRef" class="spread-container"></div>
  </div>
</template>

<style scoped>
.data-fill-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 48px);
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
</style>
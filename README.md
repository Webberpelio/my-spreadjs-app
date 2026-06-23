# SpreadJS 表格设计器与数据填充系统

基于 Vue 3 + SpreadJS V19.1.1 构建的电子表格设计器与数据填充系统。

## 功能特点

### 表格设计器页面
- 完整的 SpreadJS Designer 工具栏
- 单元格绑定路径设置
- 数据源管理（支持展开/折叠字段列表）
- 模板信息管理与保存
- SSJSON 文件导出功能

### 数据填充页面
- 简洁的 SpreadJS 表格控件（无工具栏）
- 专注于数据填写操作

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **路由**: Vue Router 4
- **电子表格**: SpreadJS V19.1.1
- **构建工具**: Vite 6
- **后端服务**: Express.js

## 项目结构

```
data-fill-demo/
├── src/
│   ├── components/
│   │   └── EditPanel.vue      # 编辑面板组件
│   ├── router/
│   │   └── index.js           # 路由配置
│   ├── views/
│   │   ├── SpreadSheet.vue    # 表格设计器页面
│   │   └── DataFill.vue       # 数据填充页面
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── data-templates/            # 模板文件存储目录
├── server.cjs                 # 后端服务（文件保存）
├── package.json
├── vite.config.js
├── jsconfig.json
└── .gitignore
```

## 安装依赖

```bash
npm install
```

## 运行项目

### 启动后端服务

```bash
node server.cjs
```

后端服务运行在 http://localhost:3001

### 启动前端开发服务器

```bash
npm run dev
```

前端开发服务器运行在 http://localhost:5173

### 生产构建

```bash
npm run build
```

## 使用说明

### 表格设计器

1. 访问 http://localhost:5173/
2. 在 SpreadJS Designer 中设计表格模板
3. 使用右侧编辑面板进行：
   - **单元格绑定**：设置单元格的数据绑定路径
   - **模板信息**：输入模板名称并保存为 SSJSON 文件

### 数据填充

1. 点击导航栏的「数据填充」链接
2. 在表格中填写数据
3. 表格设计器中设置的绑定路径会在此生效

### 数据源管理

1. 在「单元格绑定」选项卡中查看数据源列表
2. 点击数据源名称展开/折叠字段列表
3. 点击字段名称自动设置绑定路径到当前选中单元格

## API 接口

### 保存模板文件

**POST** `/api/save-template`

请求体：`multipart/form-data`

| 参数 | 类型 | 说明 |
|------|------|------|
| file | File | SSJSON 文件 |

响应示例：

```json
{
  "success": true,
  "message": "文件保存成功",
  "filename": "模板名称.ssjson"
}
```

### 获取模板列表

**GET** `/api/templates`

响应示例：

```json
{
  "success": true,
  "templates": ["模板1.ssjson", "模板2.ssjson"]
}
```

## 许可证

MIT License

## SpreadJS 许可证

本项目使用 SpreadJS V19.1.1，需要有效的 GrapeCity 许可证才能在生产环境使用。

更多信息请访问 [GrapeCity SpreadJS 官网](https://www.grapecity.com/spreadjs/)
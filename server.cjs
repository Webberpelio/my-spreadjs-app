const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

// 配置跨域
app.use(cors());

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './data-templates');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// 保存模板文件接口
app.post('/api/save-template', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有上传文件' });
  }
  res.json({ success: true, message: '文件保存成功', filename: req.file.filename });
});

// 获取模板列表接口
app.get('/api/templates', (req, res) => {
  const fs = require('fs');
  const templatesDir = './data-templates';
  
  fs.readdir(templatesDir, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: '读取目录失败' });
    }
    const templates = files.filter(file => file.endsWith('.ssjson'));
    res.json({ success: true, templates });
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
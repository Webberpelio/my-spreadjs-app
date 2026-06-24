const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

// 配置跨域
app.use(cors());

// 确保所有响应都是 UTF-8 编码
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './data-templates');
  },
  filename: function (req, file, cb) {
    // 暂时使用原始文件名
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// 保存模板文件接口
app.post('/api/save-template', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有上传文件' });
  }
  
  const fs = require('fs');
  
  // 获取编码后的文件名
  const encodedFileName = req.body ? req.body.fileName : null;
  
  if (encodedFileName) {
    // 解码文件名
    const decodedFileName = decodeURIComponent(encodedFileName);
    const oldPath = req.file.path;
    const newPath = path.join('./data-templates', decodedFileName);
    
    // 重命名文件
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error('重命名文件失败:', err);
        return res.status(500).json({ success: false, message: '保存文件失败' });
      }
      console.log('文件已重命名:', decodedFileName);
      res.json({ success: true, message: '文件保存成功', filename: decodedFileName });
    });
  } else {
    res.json({ success: true, message: '文件保存成功', filename: req.file.filename });
  }
});

// 获取模板列表接口
app.get('/api/templates', (req, res) => {
  const fs = require('fs');
  const templatesDir = './data-templates';
  
  // 使用 UTF-8 编码读取文件列表
  fs.readdir(templatesDir, { encoding: 'utf8' }, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: '读取目录失败' });
    }
    const templates = files.filter(file => file.endsWith('.ssjson'));
    res.json({ success: true, templates });
  });
});

// 获取模板文件内容接口
app.get('/api/template/:filename', (req, res) => {
  const fs = require('fs');
  // 解码 URL 参数中的中文文件名
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join('./data-templates', filename);
  
  console.log('Request received for:', filename);
  console.log('Full path:', path.resolve(filePath));
  
  // 安全检查：防止路径遍历
  if (!filename.endsWith('.ssjson')) {
    console.log('Invalid file type:', filename);
    return res.status(400).json({ success: false, message: '无效的文件类型' });
  }
  
  fs.exists(filePath, (exists) => {
    if (!exists) {
      console.log('File does not exist:', filePath);
      return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('读取文件失败:', err);
        return res.status(500).json({ success: false, message: '读取文件失败: ' + err.message });
      }
      try {
        const jsonData = JSON.parse(data);
        console.log('File read successfully, size:', data.length);
        res.json({ success: true, data: jsonData });
      } catch (e) {
        console.error('JSON parse error:', e);
        return res.status(500).json({ success: false, message: '文件格式错误' });
      }
    });
  });
});

// 删除模板文件接口
app.delete('/api/template/:filename', (req, res) => {
  const fs = require('fs');
  // 解码 URL 参数中的中文文件名
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join('./data-templates', filename);
  
  // 安全检查：防止路径遍历
  if (!filename.endsWith('.ssjson')) {
    return res.status(400).json({ success: false, message: '无效的文件类型' });
  }
  
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('删除文件失败:', err);
      return res.status(500).json({ success: false, message: '删除失败' });
    }
    res.json({ success: true, message: '删除成功' });
  });
});

// 获取模板对应的空数据源接口
app.get('/api/template-datasource/:filename', (req, res) => {
  const fs = require('fs');
  // 解码 URL 参数中的中文文件名
  const filename = decodeURIComponent(req.params.filename);
  
  // 查找对应的数据源文件，命名规则：模板名.datasource.json
  const datasourceFilename = filename.replace('.ssjson', '.datasource.json');
  const filePath = path.join('./data-templates', datasourceFilename);
  
  console.log('Request datasource for:', filename);
  console.log('Datasource file:', datasourceFilename);
  
  // 安全检查
  if (!datasourceFilename.endsWith('.datasource.json')) {
    return res.status(400).json({ success: false, message: '无效的文件类型' });
  }
  
  fs.exists(filePath, (exists) => {
    if (!exists) {
      console.log('Datasource file does not exist, returning empty object');
      // 如果没有对应的数据源文件，返回空对象
      res.json({ success: true, datasource: {} });
    } else {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error('读取数据源文件失败:', err);
          return res.status(500).json({ success: false, message: '读取数据源失败: ' + err.message });
        }
        try {
          const datasource = JSON.parse(data);
          console.log('Datasource loaded successfully');
          res.json({ success: true, datasource });
        } catch (e) {
          console.error('JSON parse error:', e);
          return res.status(500).json({ success: false, message: '数据源文件格式错误' });
        }
      });
    }
  });
});

// 保存模板数据源接口
app.post('/api/save-datasource/:filename', (req, res) => {
  const fs = require('fs');
  // 解码 URL 参数中的中文文件名
  const filename = decodeURIComponent(req.params.filename);
  
  const datasourceFilename = filename.replace('.ssjson', '.datasource.json');
  const filePath = path.join('./data-templates', datasourceFilename);
  
  // 安全检查
  if (!datasourceFilename.endsWith('.datasource.json')) {
    return res.status(400).json({ success: false, message: '无效的文件类型' });
  }
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const datasource = JSON.parse(body);
      fs.writeFile(filePath, JSON.stringify(datasource, null, 2), 'utf-8', (err) => {
        if (err) {
          console.error('保存数据源失败:', err);
          return res.status(500).json({ success: false, message: '保存数据源失败' });
        }
        console.log('Datasource saved successfully:', datasourceFilename);
        res.json({ success: true, message: '数据源保存成功', filename: datasourceFilename });
      });
    } catch (e) {
      console.error('JSON parse error:', e);
      return res.status(400).json({ success: false, message: '数据源格式错误' });
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
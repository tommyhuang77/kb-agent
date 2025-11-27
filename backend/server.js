const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DOCUMENTS_FILE = path.join(__dirname, 'documents.json');

// 中間件
app.use(cors());
app.use(express.json());

// 日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 讀取文檔
async function readDocuments() {
  try {
    const data = await fs.readFile(DOCUMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，返回默認文檔
      const defaultDocs = [
        {
          id: '1',
          title: 'QA：生產依據與規範',
          content: `# 生產依據

### Q: 生產的主要依據有哪些？
A: 生產依據包含以下核心文件：
* **確認樣 (Confirmation Sample)**: 客戶簽核的最終樣品。
* **製單 (Production Order)**: 包含詳細規格表。
* **工藝單 (Tech Pack)**: 縫製說明。`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'QA：生產標準與品質',
          content: `# 生產標準

### Q: 生產的檢驗標準是什麼？
A: 我們的生產標準遵循 ISO 9001 規範。
- 這與 **生產依據** 不同。
- 標準是指品質底線。
- 請務必區分兩者差異。`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      await writeDocuments(defaultDocs);
      return defaultDocs;
    }
    throw error;
  }
}

// 寫入文檔（帶鎖機制）
let writeLock = Promise.resolve();
async function writeDocuments(documents) {
  writeLock = writeLock.then(async () => {
    await fs.writeFile(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
  });
  return writeLock;
}

// API 路由

// 獲取所有文檔
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await readDocuments();
    res.json(documents);
  } catch (error) {
    console.error('Error reading documents:', error);
    res.status(500).json({ error: 'Failed to read documents' });
  }
});

// 新增文檔
app.post('/api/documents', async (req, res) => {
  try {
    const { id, title, content } = req.body;
    
    if (!id || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const documents = await readDocuments();
    
    // 檢查ID是否已存在
    const existingIndex = documents.findIndex(doc => doc.id === id);
    if (existingIndex !== -1) {
      return res.status(409).json({ error: 'Document ID already exists' });
    }

    const newDoc = {
      id,
      title,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    documents.push(newDoc);
    await writeDocuments(documents);

    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// 更新文檔
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const documents = await readDocuments();
    const docIndex = documents.findIndex(doc => doc.id === id);

    if (docIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    documents[docIndex] = {
      ...documents[docIndex],
      title: title || documents[docIndex].title,
      content: content || documents[docIndex].content,
      updated_at: new Date().toISOString()
    };

    await writeDocuments(documents);
    res.json(documents[docIndex]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// 刪除文檔
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await readDocuments();
    
    const filteredDocs = documents.filter(doc => doc.id !== id);
    
    if (filteredDocs.length === documents.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await writeDocuments(filteredDocs);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Documents file: ${DOCUMENTS_FILE}`);
});

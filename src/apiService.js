// API 服務層 - 連接 Express 後端
console.log('📡 apiService.js loading...');

// API 基礎 URL - 根據環境自動切換
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kb-agent-backend-production.up.railway.app'  // 生產環境（稍後部署後更新）
  : 'http://localhost:3001';  // 開發環境

console.log('🌐 API Base URL:', API_BASE_URL);

// 獲取所有文檔
export async function fetchDocuments() {
  try {
    console.log('📥 Fetching documents from API...');
    const response = await fetch(`${API_BASE_URL}/api/documents`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const documents = await response.json();
    console.log(`✅ Fetched ${documents.length} documents`);
    return documents;
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return [];
  }
}

// 新增文檔
export async function saveDocument(doc) {
  try {
    console.log('💾 Saving document:', doc.id);
    
    // 檢查文檔是否已存在
    const existingDocs = await fetchDocuments();
    const exists = existingDocs.some(d => d.id === doc.id);
    
    let response;
    if (exists) {
      // 更新現有文檔
      response = await fetch(`${API_BASE_URL}/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: doc.title,
          content: doc.content
        })
      });
    } else {
      // 新增文檔
      response = await fetch(`${API_BASE_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doc)
      });
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Document saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving document:', error);
    return false;
  }
}

// 刪除文檔
export async function deleteDocument(docId) {
  try {
    console.log('🗑️ Deleting document:', docId);
    const response = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Document deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return false;
  }
}

// 健康檢查
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    console.log('💚 Backend health:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
}

// 檢查 API 是否可用
export function isApiReady() {
  return true; // 簡單返回 true，實際連接在調用時處理
}

console.log('✅ apiService.js loaded');

# 💾 LocalStorage 持久化功能指南

## ✨ 新功能：知識庫文檔持久化存儲

現在已經實現了文檔的自動保存和恢復功能！

## 🎯 功能說明

### 什麼被保存？
- ✅ 所有添加的 QA 文檔
- ✅ 文檔的標題和內容
- ✅ 文檔的唯一 ID

### 保存位置
- 位置：瀏覽器的 **LocalStorage**
- 容量：5-10 MB（對於絕大多數知識庫足夠）
- 有效期：永久（除非手動清除瀏覽器數據）

### 保存時機
- 自動保存：每次添加或刪除文檔時
- 無需手動操作：一切自動進行
- 無網絡延遲：所有操作都在本地完成

## 📱 使用流程

### 新增文檔
1. 點擊 "Library" 標籤
2. 點擊 "Add New" 按鈕
3. 輸入標題和內容
4. 點擊 "Create"
5. ✅ 文檔已自動保存

### 查看保存的文檔
1. 重新開啟或刷新網頁
2. 前往 "Library" 標籤
3. 📍 所有之前添加的文檔都在這裡

### 刪除文檔
1. 在 "Library" 找到要刪除的文檔
2. 點擊紅色垃圾桶圖標
3. ✅ 文檔已自動刪除並從儲存中移除

## 🔒 重要注意事項

### ⚠️ LocalStorage 的局限

| 特性 | 說明 |
|------|------|
| **跨設備同步** | ❌ 不支持（每台設備獨立保存） |
| **跨瀏覽器** | ❌ 不支持（Chrome、Firefox 各自獨立） |
| **多用戶共享** | ❌ 不支持（每個用戶各自保存） |
| **本地持久化** | ✅ 支持（同一瀏覽器永久保存） |
| **容量限制** | ⚠️ 5-10 MB 限制 |

### 🧹 清除數據

如果要清除所有保存的文檔：

**方法 1：手動清除**
```javascript
// 在瀏覽器控制台執行
localStorage.removeItem('kb-agent-documents');
// 然後刷新頁面
```

**方法 2：瀏覽器設置清除所有本地數據**
- Chrome：設置 → 隱私權和安全性 → 清除瀏覽數據 → LocalStorage
- Firefox：設置 → 隱私與安全 → Cookie 和網站資料 → 清除所有

## 🚀 升級建議

如果需要更強大的功能，可以升級到：

### 方案 1：Firebase Realtime Database
- ✅ 跨設備同步
- ✅ 多用戶支持
- ✅ 自動備份
- 成本：免費版本適合小型應用
- 設置時間：15-20 分鐘

### 方案 2：Supabase
- ✅ PostgreSQL 後端
- ✅ 完整的數據庫功能
- ✅ 用戶認證支持
- 成本：免費版本充足
- 設置時間：20-30 分鐘

### 方案 3：自建後端
- ✅ 完全控制
- ✅ 無限制功能
- ❌ 需要伺服器維護
- 成本：需要付費伺服器
- 設置時間：1-2 天

## 💡 技術細節

### 實現方式

```javascript
// LocalStorage 工具函數
const saveDocsToStorage = (docs) => {
  try {
    localStorage.setItem('kb-agent-documents', JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save:', e);
  }
};

const loadDocsFromStorage = () => {
  try {
    const saved = localStorage.getItem('kb-agent-documents');
    return saved ? JSON.parse(saved) : DEFAULT_DOCS;
  } catch (e) {
    console.error('Failed to load:', e);
    return DEFAULT_DOCS;
  }
};

// React Hook 自動保存
useEffect(() => {
  saveDocsToStorage(documents);
}, [documents]);

// 初始化時載入
const [documents, setDocuments] = useState(() => loadDocsFromStorage());
```

### 數據格式

保存在 LocalStorage 中的數據格式：

```json
{
  "kb-agent-documents": [
    {
      "id": "1732462500000",
      "title": "QA：生產依據與規範",
      "content": "# 生產依據\n\n### Q: 生產的主要依據有哪些？\nA: ..."
    },
    {
      "id": "1732462550000",
      "title": "QA：生產標準與品質",
      "content": "# 生產標準\n\n### Q: 生產的檢驗標準是什麼？\nA: ..."
    }
  ]
}
```

## 📊 常見問題

**Q：我在 Chrome 保存的文檔，能在 Firefox 看到嗎？**
A：不能。每個瀏覽器的 LocalStorage 是獨立的。

**Q：我刪除了瀏覽器 Cookie，會失去文檔嗎？**
A：可能。有些瀏覽器設置會同時清除 LocalStorage。建議先備份重要文檔。

**Q：可以導出我的文檔嗎？**
A：可以！在瀏覽器控制台執行：
```javascript
console.log(JSON.stringify(JSON.parse(localStorage.getItem('kb-agent-documents')), null, 2));
```

**Q：最多可以保存多少文檔？**
A：取決於文檔大小，通常 500-1000 份簡單 QA 文檔應該沒問題。

**Q：文檔保存是實時的嗎？**
A：是的，每次修改都會立即保存到 LocalStorage。

## ✅ 驗證方式

1. 訪問 https://kb-agent-production.up.railway.app
2. 在 "Library" 中添加一份文檔
3. 刷新頁面（F5）
4. 驗證文檔仍然存在 ✅

## 🎉 下一步

- 如果需要多用戶支持，考慮升級到 Firebase 或 Supabase
- 定期備份重要的知識庫文檔
- 如有問題，查看瀏覽器控制台的錯誤訊息

---

**現在你的知識庫 Agent 支持本地文檔持久化了！** 💾

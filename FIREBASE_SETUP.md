# 🔥 Firebase 集成設置指南

## 3 分鐘快速設置

### 步驟 1：創建 Firebase 項目

1. 訪問 https://console.firebase.google.com
2. 點擊 "Create a new project"
3. 項目名稱：`kb-agent`
4. 點擊 "Create"
5. 等待項目創建完成

### 步驟 2：獲取 Firebase 配置

1. 在 Firebase Console 中，點擊左上角的齒輪圖標 ⚙️
2. 選擇 "Project settings"
3. 在 "Your apps" 部分，點擊 "Web" 圖標 (如果沒有則創建一個)
4. 複製顯示的配置對象，應該看起來像這樣：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 步驟 3：啟用 Realtime Database

1. 在 Firebase Console 左側菜單中，找到 "Realtime Database"
2. 點擊 "Create Database"
3. 選擇地區（選擇離你最近的）
4. 安全規則選擇 "Start in test mode"（演示用）
5. 點擊 "Create"

### 步驟 4：設定數據庫安全規則

1. 在 Realtime Database 頁面，點擊 "Rules" 標籤
2. 替換為以下規則：

```json
{
  "rules": {
    "documents": {
      ".read": true,
      ".write": true,
      "$docId": {
        ".validate": "newData.hasChildren(['id', 'title', 'content'])",
        "id": { ".validate": "newData.isString()" },
        "title": { ".validate": "newData.isString()" },
        "content": { ".validate": "newData.isString()" }
      }
    }
  }
}
```

3. 點擊 "Publish"

### 步驟 5：在應用中配置 Firebase

將以下配置信息複製到文件：`src/firebaseConfig.js`

```javascript
// src/firebaseConfig.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 步驟 6：安裝 Firebase 依賴

```bash
npm install firebase
```

### 步驟 7：更新應用代碼

將使用 Firebase 進行文檔同步的代碼集成到你的應用中。

---

## ⚠️ 測試模式注意

當前的安全規則是 "測試模式"，意味著：
- ✅ 任何人都可以讀取和寫入數據
- ⚠️ 30 天後自動禁用（安全考慮）

**生產環境建議**：實施用戶認證和適當的安全規則。

---

## 🎯 完成後的效果

- ✅ 用戶 A 添加文檔 → 實時同步到 Firebase
- ✅ 用戶 B 訪問應用 → 立即看到用戶 A 的文檔
- ✅ 用戶 C 刷新頁面 → 所有文檔仍然存在
- ✅ 跨瀏覽器、跨設備同步

---

## 常見問題

**Q：為什麼使用 Firebase？**
A：免費、無需後端維護、實時同步、自動備份。

**Q：費用是多少？**
A：免費版本適合中小型應用，有慷慨的免費配額。

**Q：數據安全嗎？**
A：Firebase 由 Google 運營，採用企業級安全。建議生產環境時添加用戶認證。

**Q：可以遷移到其他數據庫嗎？**
A：可以，但 Firebase 是最簡單的無需後端的解決方案。

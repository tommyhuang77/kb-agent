# 🚀 Supabase PostgreSQL 集成指南

## 為什麼選擇 Supabase？

相比 Firebase：
- ✅ **無限專案數量**（你有 Pro 訂閱）
- ✅ **完整 PostgreSQL 數據庫**
- ✅ **更好的成本控制**
- ✅ **更靈活的數據結構**
- ✅ **實時訂閱功能**

---

## 🎯 5 分鐘快速設置

### 步驟 1：登入 Supabase 並創建表

1. 訪問 https://app.supabase.com
2. 登入你的 Pro 帳戶
3. 選擇一個現有專案或創建新專案
4. 進入 **SQL Editor**
5. 執行以下 SQL 創建表：

```sql
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 添加索引以提高查詢性能
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- 啟用 RLS（行級安全）
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取和寫入（測試模式）
CREATE POLICY "Allow all operations on documents"
  ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 步驟 2：獲取 API 密鑰

1. 在 Supabase 中，進入 **Settings** → **API Keys**
2. 複製：
   - **Project URL**（格式：`https://xxxxx.supabase.co`）
   - **anon public key**（以 `eyJ` 開頭的長字符串）

### 步驟 3：更新配置

編輯 `src/supabaseService.js`，找到第 11-12 行：

```javascript
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key-here';
```

替換為：

```javascript
const SUPABASE_URL = 'https://你的-project-id.supabase.co';
const SUPABASE_ANON_KEY = '你複製的-anon-key';
```

或者使用環境變量（推薦）：

在項目根目錄創建 `.env.local`：

```env
REACT_APP_SUPABASE_URL=https://你的-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=你複製的-anon-key
```

### 步驟 4：安裝依賴

```bash
cd /Users/angelchang3/Gemini_Prj
npm install
```

### 步驟 5：提交代碼

```bash
git add src/supabaseService.js package.json .env.local
git commit -m "Integrate Supabase PostgreSQL database"
git push origin main
```

---

## ✅ 驗證設置

打開瀏覽器控制台（F12）：

- ✅ `"✅ Supabase initialized successfully"` - 配置正確
- ❌ `"⚠️ Supabase initialization failed"` - 檢查 API 密鑰

---

## 🎯 SQL 表結構說明

```sql
CREATE TABLE documents (
  id              TEXT        -- 文檔唯一 ID
  title           TEXT        -- 文檔標題
  content         TEXT        -- 文檔內容
  created_at      TIMESTAMP   -- 創建時間
  updated_at      TIMESTAMP   -- 更新時間
)
```

---

## 🔒 安全規則（可選升級）

目前使用的是開放規則（任何人都可讀寫），適合演示。

生產環境建議添加用戶認證：

```sql
-- 例子：只允許登入用戶編輯
CREATE POLICY "Users can edit own documents"
  ON documents
  FOR UPDATE
  USING (auth.uid()::text = created_by)
  WITH CHECK (auth.uid()::text = created_by);
```

---

## 💾 數據流圖

```
React App
    ↓
supabaseService.js
    ↓
Supabase JavaScript SDK
    ↓
PostgreSQL Database (Supabase)
    ↓
實時推送 WebSocket
    ↓
所有連接的客戶端
```

---

## 📊 Pro 訂閱包含

你的 Pro 訂閱已包含：
- ✅ 無限數據庫
- ✅ 無限連接
- ✅ 實時訂閱
- ✅ 自動備份
- ✅ 優先支持

---

## 🆘 故障排查

### 問題：表不存在

**解決**：
1. 訪問 Supabase SQL Editor
2. 執行上方的 CREATE TABLE SQL 語句

### 問題：Permission denied

**解決**：
1. 檢查 RLS 策略
2. 確保 `ALLOW ALL` 策略已啟用

### 問題：無法連接

**解決**：
1. 檢查 API 密鑰是否正確複製
2. 確認 Project URL 格式正確
3. 檢查網絡連接

---

**設置完成！現在你的知識庫由 PostgreSQL 支持。** 🎉

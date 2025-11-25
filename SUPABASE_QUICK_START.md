# ⚡ Supabase 快速集成（10 分鐘）

你已經準備好了所有代碼。現在只需 **3 個步驟**！

---

## 步驟 1：在 Supabase 中創建表（3 分鐘）

### 1.1 訪問 Supabase

打開 https://app.supabase.com，登入你的 Pro 帳戶

### 1.2 選擇或創建專案

- 如果已有專案，選擇它
- 如果需要新專案，點擊 "Create a new project"

### 1.3 進入 SQL Editor

左側菜單 → **SQL Editor** → **New query**

### 1.4 執行建表 SQL

複製以下代碼，粘貼到 SQL Editor，然後點擊 **Run**：

```sql
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on documents"
  ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

✅ 完成！表已創建

---

## 步驟 2：複製 API 密鑰（2 分鐘）

### 2.1 進入 Settings

左側菜單 → **Settings** → **API**

### 2.2 複製信息

找到以下兩項並複製（完整複製，包括 https://）：

1. **Project URL**
   - 格式：`https://xxxxx.supabase.co`
   - 位置：頁面左上角

2. **anon public key**
   - 以 `eyJ` 開頭的長字符串
   - 位置："Project API keys" 部分

---

## 步驟 3：配置應用（5 分鐘）

### 3.1 打開配置文件

打開：`/Users/angelchang3/Gemini_Prj/src/supabaseService.js`

### 3.2 找到第 11-12 行

```javascript
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key-here';
```

### 3.3 替換為你複製的值

```javascript
const SUPABASE_URL = 'https://你複製的-Project-URL';
const SUPABASE_ANON_KEY = '你複製的-anon-key';
```

### 3.4 保存文件

按 **Cmd+S**（Mac）或 **Ctrl+S**（Windows）

### 3.5 提交代碼

在終端執行：

```bash
cd /Users/angelchang3/Gemini_Prj
git add src/supabaseService.js
git commit -m "Configure Supabase credentials"
git push origin main
```

---

## ✅ 完成！

- ✅ Supabase 表已創建
- ✅ 應用已配置
- ✅ 代碼已推送到 GitHub
- ✅ Railway 自動部署（等待 5-10 分鐘）

---

## 🧪 驗證

訪問你的應用：https://kb-agent-production.up.railway.app

### 驗證步驟

1. 打開應用
2. 打開瀏覽器控制台（F12）
3. 檢查是否看到：
   ```
   ✅ Supabase initialized successfully
   ```
4. 添加新文檔
5. 用其他瀏覽器訪問同一 URL
6. ✅ 看到相同的文檔

---

## 🎯 現在...

所有用戶都能：
- 👥 看到共享的知識庫
- 📝 添加文檔（實時同步到 PostgreSQL）
- 🗑️ 刪除文檔
- 🔄 刷新頁面後保留所有數據
- 🌍 跨設備、跨瀏覽器訪問

---

## 📞 遇到問題？

### 問題：看不到 "✅ Supabase initialized successfully"

**檢查**：
1. API 密鑰是否正確複製（沒有多餘空格）
2. Project URL 格式是否正確（`https://` 開頭）
3. 頁面是否已重新加載

### 問題：表不存在錯誤

**檢查**：
1. SQL 是否在 Supabase 中成功執行
2. 表名是否為 `documents`（小寫）
3. RLS 策略是否已啟用

### 問題：Permission denied

**解決**：在 Supabase SQL Editor 重新執行 `CREATE POLICY` 語句

---

**恭喜！你的多用戶知識庫已就緒！** 🎉

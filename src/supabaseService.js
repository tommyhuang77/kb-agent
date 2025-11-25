// Supabase 服務層 - PostgreSQL 數據庫集成
import { createClient } from '@supabase/supabase-js';

// ⚠️ 重要：替換為你的 Supabase 專案信息
// 步驟：
// 1. 訪問 https://app.supabase.com
// 2. 選擇你的專案
// 3. 進入 Settings → API Keys
// 4. 複製 anon key 和 project URL

const SUPABASE_URL = 'https://grolfjktzmibeupkqrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2xmamt0em1pYmV1cGtxcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMTMzMjYsImV4cCI6MjA3MDc4OTMyNn0.4gbWx4wGo0JybfQcvjfNQVbiAGU6DifaMsLU5lG36uU';

let supabase = null;
let supabaseError = null;

// 初始化全局診斷對象
if (!window.__SUPABASE_DEBUG__) {
  window.__SUPABASE_DEBUG__ = {
    logs: [],
    errors: [],
    initialized: false,
    ready: false
  };
}

const debug = (msg, data = null) => {
  console.log(msg, data);
  window.__SUPABASE_DEBUG__.logs.push({ time: new Date().toISOString(), msg, data });
};

const debugError = (msg, error) => {
  console.error(msg, error);
  window.__SUPABASE_DEBUG__.errors.push({ time: new Date().toISOString(), msg, error });
};

debug('🚀 Starting Supabase initialization');
debug('URL:', SUPABASE_URL);
debug('Key exists:', !!SUPABASE_ANON_KEY);

try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }
  
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  debug('✅ Supabase client created successfully');
  debug('Type:', typeof supabase);
  debug('Has channel method:', typeof supabase.channel === 'function');
  window.__SUPABASE_DEBUG__.initialized = true;
} catch (error) {
  supabaseError = error;
  debugError('❌ Supabase initialization failed', error);
  window.__SUPABASE_DEBUG__.initialized = false;
}

if (supabase) {
  debug('✅ Supabase initialized successfully');
  window.__SUPABASE_DEBUG__.ready = true;
} else {
  debugError('❌ Supabase is null after initialization', supabaseError);
  window.__SUPABASE_DEBUG__.ready = false;
}

// 初始化表（自動創建）
export const initializeTable = async () => {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return false;
  }

  try {
    // 檢查表是否存在，不存在則創建
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // 表不存在，需要在 Supabase 面板手動創建
      console.log('⚠️ Please create the "documents" table in Supabase');
    }
    return true;
  } catch (error) {
    console.error('Error initializing table:', error);
    return false;
  }
};

// 獲取所有文檔
export const fetchDocuments = async () => {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchDocuments:', error);
    return [];
  }
};

// 訂閱文檔變化（實時更新）
export const subscribeToDocuments = (callback) => {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return null;
  }

  try {
    debug('🗣️ Creating channel for real-time updates');
    
    const subscription = supabase
      .channel('documents_channel', { 
        config: { 
          broadcast: { self: true }
        } 
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        (payload) => {
          debug('📡 Document changed:', payload);
          // 重新獲取所有文檔
          fetchDocuments().then(callback);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          debug('✅ Subscribed to documents channel');
        } else if (status === 'CHANNEL_ERROR') {
          debugError('❌ Channel error', err);
        } else if (status === 'TIMED_OUT') {
          debug('⏱️ Subscription timeout');
        }
      });

    debug('🗣️ Subscription object created');

    // 返回帶有 unsubscribe 方法的物件
    return {
      unsubscribe: async () => {
        try {
          debug('🔕 Unsubscribing from documents');
          if (subscription) {
            await subscription.unsubscribe?.();
          }
        } catch (e) {
          debugError('Error unsubscribing', e);
        }
      },
      channel: subscription
    };
  } catch (error) {
    debugError('Error subscribing to documents', error);
    return null;
  }
};

// 添加或更新文檔
export const saveDocument = async (doc) => {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return false;
  }

  try {
    // 檢查文檔是否存在
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('id', doc.id)
      .single();

    if (existing) {
      // 更新現有文檔
      const { error } = await supabase
        .from('documents')
        .update({
          title: doc.title,
          content: doc.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', doc.id);

      if (error) {
        console.error('Error updating document:', error);
        return false;
      }
    } else {
      // 插入新文檔
      const { error } = await supabase
        .from('documents')
        .insert([
          {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error inserting document:', error);
        return false;
      }
    }

    console.log('✅ Document saved:', doc.id);
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    return false;
  }
};

// 刪除文檔
export const deleteDocument = async (docId) => {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return false;
  }

  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId);

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }

    console.log('✅ Document deleted:', docId);
    return true;
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    return false;
  }
};

// 檢查 Supabase 是否已初始化
export const isSupabaseReady = () => {
  return supabase !== null && supabase !== undefined;
};

// 獲取原始 Supabase 客戶端（高級用途）
export const getSupabaseClient = () => {
  return supabase;
};

export default {
  initializeTable,
  fetchDocuments,
  subscribeToDocuments,
  saveDocument,
  deleteDocument,
  isSupabaseReady,
  getSupabaseClient
};

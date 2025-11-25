// Firebase Realtime Database 服務
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove } from 'firebase/database';

// ⚠️ 重要：你需要替換為你自己的 Firebase 配置
// 步驟：
// 1. 訪問 https://console.firebase.google.com
// 2. 創建新項目或選擇現有項目
// 3. 在 Project Settings 中獲取你的配置
// 4. 替換下方的值

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB_YOUR_KEY_HERE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "kb-agent-XXXX.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://kb-agent-XXXX.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "kb-agent-XXXX",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "kb-agent-XXXX.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abc123def456"
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization failed - using local storage fallback', error);
}

// 獲取所有文檔
export const fetchDocuments = (callback) => {
  if (!db) {
    console.warn('Firebase not initialized, cannot fetch documents');
    return () => {};
  }
  
  try {
    const docsRef = ref(db, 'documents');
    const unsubscribe = onValue(
      docsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const docs = Object.values(data);
          callback(docs);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error('Error fetching documents:', error);
        callback([]);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up listener:', error);
    return () => {};
  }
};

// 添加或更新文檔
export const saveDocument = async (doc) => {
  if (!db) {
    console.warn('Firebase not initialized, cannot save document');
    return false;
  }
  
  try {
    const docRef = ref(db, `documents/${doc.id}`);
    await set(docRef, {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Document saved:', doc.id);
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    return false;
  }
};

// 刪除文檔
export const deleteDocument = async (docId) => {
  if (!db) {
    console.warn('Firebase not initialized, cannot delete document');
    return false;
  }
  
  try {
    const docRef = ref(db, `documents/${docId}`);
    await remove(docRef);
    console.log('✅ Document deleted:', docId);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};

// 檢查 Firebase 是否已初始化
export const isFirebaseReady = () => {
  return db !== null && db !== undefined;
};

export default {
  fetchDocuments,
  saveDocument,
  deleteDocument,
  isFirebaseReady
};

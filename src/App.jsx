import React, { useState, useRef, useEffect } from 'react';
import * as apiService from './apiService';

console.log('🚀 App.jsx loading with Express backend');
import { 
  BookOpen, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Bot, 
  User, 
  FileText, 
  Database,
  X,
  AlertCircle,
  Send,
  CheckCircle2,
  Crosshair, 
  Eye,       
  EyeOff,    
  Scissors,
  Sparkles,
  Layout,
  ChevronDown,
  ChevronUp,
  Globe, // 新增：語言切換圖示
  Languages,
  Cpu
} from 'lucide-react';

// --- i18n 翻譯字典 ---
const TRANSLATIONS = {
  'zh-TW': {
    app_chat_title: '智能助手',
    app_kb_title: '知識庫管理',
    app_version: 'V14 國際版',
    sidebar_chat: '對話',
    sidebar_kb: '知識庫',
    docs_loaded: '份文件已載入',
    found_results: '找到 {count} 條相關結果',
    ask_placeholder: '輸入問題 (例如：生產依據)...',
    kb_header_title: '知識庫中心',
    kb_header_desc: '管理您的 QA 文件與知識片段',
    btn_add_new: '新增文件',
    btn_view_chunks: '查看切分',
    btn_hide_chunks: '隱藏切分',
    label_chunks: '個切分',
    label_ai_view: 'AI 切分視角 (AI Chunking View)',
    modal_title: '新增 QA 文件',
    modal_label_title: '標題',
    modal_label_content: '內容 (Markdown / QA)',
    modal_placeholder_title: '例如：產品手冊',
    modal_placeholder_content: '建議格式：\n### Q: 問題...\nA: 答案...',
    btn_cancel: '取消',
    btn_create: '確認新增',
    agent_intro: '你好！我是 V14 國際版 Agent。\n\n我現在支援 **中英文介面切換**！\n同時保留了 V13.5 的所有視覺優化：\n* 極致玻璃擬態 UI\n* 智慧去符號排版\n* 標題直達搜尋\n\n請試試看右上角的語言按鈕！',
    no_results: '抱歉，在知識庫中找不到相關資訊。',
    debug_render: '渲染引擎',
    debug_score: '信心分數'
  },
  'en': {
    app_chat_title: 'AI Assistant',
    app_kb_title: 'Knowledge Base',
    app_version: 'V14 GLOBAL',
    sidebar_chat: 'Chat',
    sidebar_kb: 'Library',
    docs_loaded: 'Documents Loaded',
    found_results: 'Found {count} Results',
    ask_placeholder: 'Ask anything (e.g., Production Basis)...',
    kb_header_title: 'Knowledge Center',
    kb_header_desc: 'Manage your QA documents and snippets',
    btn_add_new: 'Add New',
    btn_view_chunks: 'View Chunks',
    btn_hide_chunks: 'Hide Chunks',
    label_chunks: 'CHUNKS',
    label_ai_view: 'AI Chunking View',
    modal_title: 'Create New Document',
    modal_label_title: 'Title',
    modal_label_content: 'Content (Markdown / QA)',
    modal_placeholder_title: 'e.g., Product Manual',
    modal_placeholder_content: 'Format:\n### Q: Question...\nA: Answer...',
    btn_cancel: 'Cancel',
    btn_create: 'Create',
    agent_intro: 'Hello! I am the V14 International Agent.\n\nI now support **English/Chinese Interface Switching**!\nKeeping all V13.5 visual enhancements:\n* Glassmorphism UI\n* Clean Markdown Rendering\n* Title Sniper Search\n\nTry the language button on the top right!',
    no_results: 'Sorry, no relevant information found in the knowledge base.',
    debug_render: 'Render Engine',
    debug_score: 'Confidence'
  }
};

// --- V13 核心邏輯保持不變 ---

const SIMP_TRAD_MAP = {
  '产': '產', '品': '品', '质': '質', '量': '量', '依': '依', '据': '據', 
  '发': '發', '现': '現', '程': '程', '度': '度', '问': '問', '题': '題',
  '实': '實', '际': '際', '样': '樣', '本': '本', '书': '書', '记': '記',
  '录': '錄', '准': '準', '备': '備', '确': '確', '认': '認', '货': '貨',
  '运': '運', '输': '輸', '长': '長', '期': '期', '车': '車', '间': '間',
  '应': '應', '该': '該', '对': '對', '开': '開', '关': '關', '系': '係',
  '气': '氣', '两': '兩', '严': '嚴', '格': '格', '报': '報', '告': '告',
  '务': '務', '员': '員', '个': '個', '体': '體', '表': '表', '面': '面',
  '制': '製', '造': '造', '码': '碼', '专': '專', '业': '業', '项': '項',
  '么': '麼', '什': '甚', '范': '範', '规': '規', '划': '劃',
  // 新增：培训相關
  '培': '培', '训': '訓', '学': '學', '习': '習', '练': '練',
  // 新增：常用字
  '检': '檢', '验': '驗', '测': '測', '试': '試', '标': '標', '查': '查',
  '过': '過', '处': '處', '理': '理', '时': '時', '术': '術', '技': '技',
  '线': '線', '号': '號', '单': '單', '组': '組', '织': '織', '设': '設',
  '计': '計', '资': '資', '料': '料', '档': '檔', '案': '案', '库': '庫',
  '区': '區', '环': '環', '境': '境', '场': '場', '险': '險',
  '层': '層', '级': '級', '变': '變', '换': '換', '转': '轉', '态': '態'
};

const STOP_WORDS = new Set([
  '什麼', '什么', '是', '的', '嗎', '吗', '怎麼', '怎么', '如何', '為', '为', '了', '?', '？', '能', '不能', '有', '沒有', '没有', '我', '想', '問', '问', '有哪些', '哪些', '關於', '关于', '包含', '包括'
]);

const createFlexibleRegex = (text) => {
  let pattern = '';
  for (let char of text) {
    if (/[a-zA-Z0-9]/.test(char)) {
      pattern += char; 
    } else {
      const trad = SIMP_TRAD_MAP[char]; 
      const reverseKey = Object.keys(SIMP_TRAD_MAP).find(k => SIMP_TRAD_MAP[k] === char); 
      
      if (trad) pattern += `(${char}|${trad})`;
      else if (reverseKey) pattern += `(${char}|${reverseKey})`;
      else pattern += char; 
    }
  }
  return new RegExp(pattern, 'gi');
};

const cleanHeader = (line) => {
    return line.replace(/^[#\s]+|(Q:|問：)\s*/g, '').trim();
};

const chunkDocument = (docId, docTitle, content) => {
  const chunks = [];
  const lines = content.split('\n');
  let currentParentContext = docTitle; 
  let currentChunk = { title: docTitle, body: [], hasRealContent: false };
  let chunkIndex = 0;

  const flushChunk = () => {
    if (currentChunk.hasRealContent && currentChunk.body.length > 0) {
      const fullContent = currentChunk.body.join('\n').trim();
      const combinedTitle = currentParentContext && currentParentContext !== currentChunk.title 
        ? `${currentParentContext} > ${currentChunk.title}` 
        : currentChunk.title;

      chunks.push({
        id: `${docId}-${chunkIndex++}`,
        docId,
        docTitle: docTitle, 
        chunkTitle: currentChunk.title,
        combinedTitle: combinedTitle,
        content: fullContent,
        rawText: (combinedTitle + '\n' + fullContent)
      });
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    const isAnswerLine = trimmedLine.match(/^(###\s*)?(A:|答:|Answer:|Ans:)/i);
    const isHeader = (line.startsWith('#') || trimmedLine.match(/^(Q:|Q：|問:|問：|Question:)/i)) && !isAnswerLine;

    if (isHeader) {
      flushChunk();
      const newTitle = cleanHeader(line);
      if (line.startsWith('# ') || line.startsWith('## ')) currentParentContext = newTitle;
      currentChunk = { title: newTitle, body: [line], hasRealContent: false };
    } else {
      currentChunk.body.push(line);
      currentChunk.hasRealContent = true; 
    }
  });
  flushChunk();
  return chunks;
};

const sniperSearch = (query, allChunks) => {
  // 第一步：移除停用詞片段（先處理多字詞）
  let cleanQuery = query;
  STOP_WORDS.forEach(stopWord => {
    // 轉義正則表達式特殊字符
    const escapedWord = stopWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedWord, 'g');
    cleanQuery = cleanQuery.replace(regex, ' ');
  });
  
  // 第二步：清理特殊字元和多餘空格
  cleanQuery = cleanQuery.replace(/[^\w\u4e00-\u9fa5]/g, '').trim();
  
  const effectiveQuery = cleanQuery;
  
  if (effectiveQuery.length === 0) return [];

  // 第一階段：尋找完全匹配
  const perfectMatches = allChunks.filter(chunk => {
    const regex = createFlexibleRegex(effectiveQuery);
    // 只在文件標題或 chunk 標題中尋找完全匹配
    const docTitleMatch = regex.test(chunk.docTitle);
    const chunkTitleMatch = regex.test(chunk.chunkTitle);
    return docTitleMatch || chunkTitleMatch;
  });

  if (perfectMatches.length > 0) {
    return perfectMatches.map(chunk => {
        let score = 1000; 
        const regex = createFlexibleRegex(effectiveQuery);
        // 如果在內容中也找到，加分
        if (regex.test(chunk.content)) score += 500;
        // 如果在 chunk 標題中（比文件標題更精確）
        if (regex.test(chunk.chunkTitle)) score += 300;
        return { ...chunk, score, debug: { method: 'Title Sniper', exact: true } };
    }).sort((a, b) => b.score - a.score);
  }

  // 第二階段：內容匹配
  return allChunks.map(chunk => {
    let score = 0;
    const chunkText = chunk.rawText; 
    const exactRegex = createFlexibleRegex(effectiveQuery);

    // 在整個文本中尋找完全匹配
    if (exactRegex.test(chunkText)) score += 200;

    // 如果沒有找到完全匹配，也不要返回（避免無關結果）
    if (score === 0) return { ...chunk, score: -1, debug: { method: 'No Match' } };

    // Bigram 匹配作為輔助
    let bigramHits = 0;
    for (let i = 0; i < effectiveQuery.length - 1; i++) {
      const bigram = effectiveQuery.substring(i, i+2);
      const bigramRegex = createFlexibleRegex(bigram);
      if (bigramRegex.test(chunkText)) {
        score += 50;
        bigramHits++;
      }
    }

    const lengthPenalty = Math.max(1, Math.log10(chunkText.length));
    let finalScore = score / lengthPenalty;

    return { 
      ...chunk, 
      score: finalScore, 
      debug: { method: 'Content Match', bigramHits }
    };
  })
  .filter(c => c.score > 0)  // 只返回有相關性的結果
  .sort((a, b) => b.score - a.score);
};

const cleanChunkContent = (content) => {
  return content
    .replace(/^(###\s*)?(Q:|A:|問：|答：|問題：|回答：|Answer:).*$/gim, '')
    .replace(/^#+\s+/gm, '') 
    .trim();
};

// --- UI 元件 (支援 i18n) ---

const IOS26Content = ({ content, query }) => {
  const lines = content.split('\n');
  
  const highlight = (text) => {
    if (!query) return text;
    const cleanQuery = query.replace(/[^\w\u4e00-\u9fa5]/g, ' ');
    const keywords = cleanQuery.split(' ').filter(k => k.length > 0 && !STOP_WORDS.has(k));
    
    let parts = text;
    keywords.forEach(keyword => {
      try {
        const regex = createFlexibleRegex(keyword);
        parts = parts.replace(regex, (match) => `__HL__${match}__HLEND__`);
      } catch (e) {}
    });
    
    return parts.split(/(__HL__|__HLEND__)/).map((part, i) => {
      if (part === '__HL__') return null;
      if (part === '__HLEND__') return null;
      return i % 4 === 2 ? <span key={i} className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm">{part}</span> : part;
    });
  };

  const renderFormattedLine = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanPart = part.slice(2, -2);
        return <span key={index} className="font-bold text-slate-800">{highlight(cleanPart)}</span>;
      } else {
        return <span key={index}>{highlight(part)}</span>;
      }
    });
  };

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-600 font-medium tracking-wide">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2"></div>;

        const isBullet = /^[\*\-]\s/.test(trimmed);
        const isNumber = /^\d+\.\s/.test(trimmed);
        
        if (isBullet || isNumber) {
          const contentText = trimmed.replace(/^([\*\-]\s|\d+\.\s)/, '');
          return (
            <div key={idx} className="flex gap-3 group items-start pl-1">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-300 shadow-[0_0_5px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <div className="flex-1 p-2 rounded-xl group-hover:bg-white/60 group-hover:backdrop-blur-sm transition-colors duration-300">
                {renderFormattedLine(contentText)}
              </div>
            </div>
          );
        }
        return <p key={idx} className="pl-1">{renderFormattedLine(trimmed)}</p>;
      })}
    </div>
  );
};

const GlassCard = ({ chunk, index, query }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const cleanContent = cleanChunkContent(chunk.content);

  return (
    <div className="relative group mb-4 last:mb-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-[24px] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-all duration-500">
          <div 
            className="px-5 py-4 flex justify-between items-center cursor-pointer select-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shadow-inner border border-white">
                {index + 1}
              </div>
              <span className="text-sm font-bold text-slate-800 truncate max-w-[220px] sm:max-w-md tracking-tight">
                {chunk.chunkTitle || chunk.docTitle}
              </span>
            </div>
            <div className={`p-2 rounded-full bg-slate-100/50 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
               <ChevronDown size={16} />
            </div>
          </div>
          
          {isExpanded && (
            <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4 opacity-50"></div>
              <IOS26Content content={cleanContent} query={query} />
            </div>
          )}
        </div>
    </div>
  );
};

// --- 主程式 ---

const DEFAULT_DOCS = [
  {
    id: '1',
    title: 'QA：生產依據與規範',
    content: `# 生產依據

### Q: 生產的主要依據有哪些？
A: 生產依據包含以下核心文件：
* **確認樣 (Confirmation Sample)**: 客戶簽核的最終樣品。
* **製單 (Production Order)**: 包含詳細規格表。
* **工藝單 (Tech Pack)**: 縫製說明。`
  },
  {
    id: '2',
    title: 'QA：生產標準與品質',
    content: `# 生產標準

### Q: 生產的檢驗標準是什麼？
A: 我們的生產標準遵循 ISO 9001 規範。
- 這與 **生產依據** 不同。
- 標準是指品質底線。
- 請務必區分兩者差異。`
  }
];

// LocalStorage 工具函數
const saveDocsToStorage = (docs) => {
  try {
    localStorage.setItem('kb-agent-documents', JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents to localStorage:', e);
  }
};

const loadDocsFromStorage = () => {
  try {
    const saved = localStorage.getItem('kb-agent-documents');
    return saved ? JSON.parse(saved) : DEFAULT_DOCS;
  } catch (e) {
    console.error('Failed to load documents from localStorage:', e);
    return DEFAULT_DOCS;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); 
  const [documents, setDocuments] = useState(() => loadDocsFromStorage());
  const [chunks, setChunks] = useState([]);
  const [expandedDocId, setExpandedDocId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [apiReady, setApiReady] = useState(false);
  
  // V14: 語言狀態
  const [lang, setLang] = useState('zh-TW'); // 'zh-TW' or 'en'
  const t = TRANSLATIONS[lang]; // 便捷存取函數

  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  // 初始化 API 並加載文檔
  useEffect(() => {
    const initApi = async () => {
      try {
        console.log('🔄 Initializing API backend...');
        
        // 檢查後端健康狀態
        const isHealthy = await apiService.checkHealth();
        console.log('Backend healthy:', isHealthy);
        
        console.log('📏 Fetching documents from API...');
        const docs = await apiService.fetchDocuments();
        console.log('📚 Loaded documents from API:', docs);
        
        if (docs && docs.length > 0) {
          setDocuments(docs);
          setApiReady(true);
          console.log('✅ API loaded successfully with', docs.length, 'docs');
          
          // 設置輪詢（必須在成功後立即設置，而不是檢查舊的 apiReady）
          console.log('🗣️ Setting up periodic polling...');
          const pollInterval = setInterval(async () => {
            try {
              const latestDocs = await apiService.fetchDocuments();
              if (latestDocs.length > 0) {
                setDocuments(prevDocs => {
                  // 只有在真的有變化時才更新
                  if (JSON.stringify(latestDocs) !== JSON.stringify(prevDocs)) {
                    console.log('🔄 Detected document changes via polling');
                    return latestDocs;
                  }
                  return prevDocs;
                });
              }
            } catch (err) {
              console.warn('⚠️ Polling error:', err);
            }
          }, 5000);
          
          subscriptionRef.current = { unsubscribe: () => clearInterval(pollInterval) };
          console.log('✅ Polling established');
        } else {
          // 如果 API 返回空，從本地存儲加載
          console.log('📏 API returned empty, loading from localStorage');
          const localDocs = loadDocsFromStorage();
          setDocuments(localDocs);
          setApiReady(false);  // API 連接失敗
          console.log('⚠️ API not ready, polling disabled. Using localStorage only.');
        }
      } catch (error) {
        console.error('❌ Error initializing API:', error);
        setApiReady(false);
        // 回退到 localStorage
        const localDocs = loadDocsFromStorage();
        setDocuments(localDocs);
      }
    };
    
    initApi();
    
    return () => {
      // 清理訂閱
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe?.();
      }
    };
  }, []);

  // 當 documents 改變時，保存到 localStorage
  useEffect(() => {
    if (!documents || documents.length === 0) return;
    saveDocsToStorage(documents);
  }, [documents]);

  // 初始化與語言變更時更新歡迎訊息
  useEffect(() => {
    // 只有當訊息列表為空，或者想重置歡迎訊息時
    if (messages.length === 0) {
        setMessages([
            {
              id: 1,
              role: 'agent',
              content: t.agent_intro,
              sources: []
            }
        ]);
    }
  }, []); // 只在掛載時執行一次，避免切換語言時清空對話歷史

  useEffect(() => {
    let allChunks = [];
    documents.forEach(doc => {
      const docChunks = chunkDocument(doc.id, doc.title, doc.content);
      console.log(`📦 Document "${doc.title}" generated ${docChunks.length} chunks`);
      allChunks = [...allChunks, ...docChunks];
    });
    console.log(`📊 Total chunks in memory: ${allChunks.length}`);
    setChunks(allChunks);
  }, [documents]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh-TW' ? 'en' : 'zh-TW');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      console.log(`🔍 Searching for: "${userMsg.content}" in ${chunks.length} chunks`);
      const results = sniperSearch(userMsg.content, chunks);
      console.log(`🎯 Search results: ${results.length} matches`);
      if (results.length > 0) {
        console.log('Top 3 results:', results.slice(0, 3).map(r => ({ title: r.chunkTitle, score: r.score })));
      }
      
      let relevantChunks = [];
      let debugInfo = null;

      if (results.length > 0) {
        const topScore = results[0].score;
        relevantChunks = results.filter(r => r.score >= topScore * 0.7).slice(0, 3);
        
        debugInfo = {
          method: 'iOS26 Render Engine',
          count: relevantChunks.length,
          topScore: results[0].score.toFixed(0)
        };
      }

      const agentMsg = {
        id: Date.now() + 1,
        role: 'agent',
        structuredData: relevantChunks,
        fallbackContent: relevantChunks.length === 0 ? t.no_results : null,
        sources: relevantChunks.map(c => c.docTitle),
        debugInfo: debugMode && debugInfo ? debugInfo : null
      };

      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    
    const newDoc = {
      id: Date.now().toString(),
      title: newDocTitle,
      content: newDocContent
    };
    
    // 立即更新本地狀態
    setDocuments([...documents, newDoc]);
    
    // 同步到後端
    if (apiReady) {
      try {
        await apiService.saveDocument(newDoc);
        console.log('✅ Document saved to backend:', newDoc.id);
      } catch (error) {
        console.error('Error saving to backend:', error);
      }
    }
    
    setNewDocTitle('');
    setNewDocContent('');
    setShowAddModal(false);
  };

  const handleDeleteDocument = async (id) => {
    // 立即更新本地狀態
    setDocuments(documents.filter(doc => doc.id !== id));
    
    // 從後端刪除
    if (apiReady) {
      try {
        await apiService.deleteDocument(id);
        console.log('✅ Document deleted from backend:', id);
      } catch (error) {
        console.error('Error deleting from backend:', error);
      }
    }
  };

  return (
    <div className="flex h-screen font-sans text-slate-800 overflow-hidden bg-[#f2f6fa]">
      <div className="fixed inset-0 pointer-events-none opacity-60" 
           style={{
             backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(219, 234, 254, 0.8) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(237, 233, 254, 0.8) 0%, transparent 20%)'
           }}>
      </div>

      {/* Sidebar */}
      <div className="w-20 py-6 z-20 flex flex-col items-center gap-8 shrink-0">
        <div className="p-4 bg-white/40 backdrop-blur-md rounded-[24px] shadow-lg border border-white/50">
          <Layout className="w-6 h-6 text-slate-700" />
        </div>
        
        <div className="flex flex-col gap-6 bg-white/30 backdrop-blur-xl p-3 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/40">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-[20px] transition-all duration-500 relative group ${activeTab === 'chat' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:bg-white/40'}`}
            title={t.sidebar_chat}
          >
            <MessageSquare className="w-6 h-6" />
            {activeTab === 'chat' && <div className="absolute -right-1 top-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>}
          </button>
          
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`p-3 rounded-[20px] transition-all duration-500 ${activeTab === 'knowledge' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:bg-white/40'}`}
            title={t.sidebar_kb}
          >
            <Database className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={toggleLanguage} 
            className="p-3 rounded-full transition-all duration-300 bg-white/50 text-slate-600 hover:bg-white shadow-sm hover:shadow-md"
            title="Switch Language"
          >
            <Globe className="w-6 h-6" />
            <span className="text-[8px] font-bold mt-0.5 block text-center uppercase">{lang === 'zh-TW' ? 'TW' : 'EN'}</span>
          </button>

          <button 
            onClick={() => {
              setDebugMode(!debugMode);
              if (!debugMode) {
                console.log('🔍 Debug Info - API Ready:', apiReady);
              }
            }}
            className={`p-3 rounded-full transition-all duration-300 ${debugMode ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-white/50'}`}
            title="Debug Mode"
          >
            <AlertCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative z-10 p-4">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
              {activeTab === 'chat' ? t.app_chat_title : t.app_kb_title}
              <span className="text-[10px] font-bold px-2 py-1 bg-white/60 backdrop-blur text-slate-500 rounded-full border border-white/50 shadow-sm">{t.app_version}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shadow-sm ${apiReady ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                DB: {apiReady ? 'API' : 'Local'}
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-1 ml-1">
              {activeTab === 'chat' ? (lang === 'zh-TW' ? 'iOS 26 極致介面' : 'iOS 26 Concept UI') : `${documents.length} ${t.docs_loaded}`}
            </p>
          </div>
          {debugMode && (
            <div className="text-[10px] font-mono bg-black/80 text-white rounded-lg px-3 py-2 border border-white/10 max-w-xs">
              <div className="text-emerald-400 font-bold mb-1">🔍 BACKEND STATUS</div>
              <div className="space-y-0.5">
                <div>API Ready: {apiReady ? '✅' : '❌'}</div>
                <div>Documents: {documents.length}</div>
                <div>Mode: {apiReady ? 'Multi-user' : 'Local'}</div>
              </div>
            </div>
          )}
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.5)_inset] border border-white/60 relative">
            {/* 聊天內容區 */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md border-2 border-white ${msg.role === 'agent' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-slate-800 text-white'}`}>
                    {msg.role === 'agent' ? <Sparkles size={18} /> : <User size={18} />}
                  </div>
                  
                  <div className={`flex flex-col gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    
                    {msg.role === 'agent' && msg.structuredData ? (
                      <div className="w-full space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 ml-1 mb-1">
                           <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {t.found_results.replace('{count}', msg.structuredData.length)}
                           </span>
                           <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        </div>
                        
                        {msg.structuredData.map((chunk, idx) => (
                          <GlassCard 
                            key={chunk.id} 
                            chunk={chunk} 
                            index={idx} 
                            query={messages[messages.length - 2]?.content || ''} 
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={`px-6 py-4 rounded-[24px] shadow-sm backdrop-blur-md border border-white/20 text-[15px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'agent' 
                          ? 'bg-white/80 text-slate-700 rounded-tl-none' 
                          : 'bg-slate-800/90 text-white rounded-tr-none shadow-lg'
                      }`}>
                        {msg.role === 'agent' ? <IOS26Content content={msg.content || msg.fallbackContent} /> : msg.content}
                      </div>
                    )}

                    {msg.role === 'agent' && debugMode && msg.debugInfo && (
                      <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 text-[10px] text-white font-mono w-full mt-2 border border-white/10 shadow-xl">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
                          <Cpu size={12}/> SYSTEM DIAGNOSTICS
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                             <div className="text-slate-400">{t.debug_render}</div>
                             <div>{msg.debugInfo.method}</div>
                           </div>
                           <div>
                             <div className="text-slate-400">{t.debug_score}</div>
                             <div className="text-emerald-400">{msg.debugInfo.topScore}</div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-4 max-w-4xl mx-auto">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-white"><Sparkles size={18} /></div>
                   <div className="bg-white/60 backdrop-blur-md px-5 py-4 rounded-[24px] rounded-tl-none border border-white/40 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 shrink-0 flex justify-center">
              <div className="w-full max-w-3xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.ask_placeholder} 
                  className="w-full pl-6 pr-16 py-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 transition-all text-[15px] shadow-lg text-slate-700 placeholder:text-slate-400 relative z-10"
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isTyping} 
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-black hover:scale-105 active:scale-95 disabled:bg-slate-300 disabled:scale-100 transition-all z-20 shadow-md"
                >
                  <Send size={18} className={isTyping ? 'opacity-0' : 'opacity-100'} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.5)_inset] border border-white/60 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t.kb_header_title}</h2>
                  <p className="text-slate-500 mt-1">{t.kb_header_desc}</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-slate-800 text-white rounded-full hover:bg-black hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-medium">
                  <Plus size={20} /> {t.btn_add_new}
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {documents.map((doc) => {
                  const docChunks = chunks.filter(c => c.docId === doc.id);
                  const isExpanded = expandedDocId === doc.id;
                  return (
                    <div key={doc.id} className="group bg-white/70 backdrop-blur-xl rounded-[28px] border border-white/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                       <div className="p-6 flex justify-between items-start">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-3">
                             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                               <FileText size={20}/>
                             </div>
                             <h3 className="font-bold text-slate-700 text-lg">{doc.title}</h3>
                             <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-wider">
                               {docChunks.length} {t.label_chunks}
                             </span>
                           </div>
                           <p className="text-sm text-slate-500 line-clamp-2 pl-1">{doc.content}</p>
                         </div>
                         <div className="flex gap-2 ml-6">
                           <button 
                             onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                             className={`px-4 py-2 rounded-full transition-all text-xs font-bold flex items-center gap-2 border ${isExpanded ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                           >
                             {isExpanded ? <EyeOff size={14}/> : <Eye size={14}/>}
                             {isExpanded ? t.btn_hide_chunks : t.btn_view_chunks}
                           </button>
                           <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18}/></button>
                         </div>
                       </div>
                       
                       {isExpanded && (
                         <div className="bg-slate-50/50 border-t border-slate-100 p-6 animate-in slide-in-from-top-4 duration-300">
                           <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                             <Scissors size={14} />
                             {t.label_ai_view}
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {docChunks.map(chunk => (
                               <div key={chunk.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm hover:border-blue-300 transition-colors relative group">
                                 <div className="text-[10px] text-blue-400 font-medium mb-1 flex items-center gap-1">
                                    <Crosshair size={10} />
                                    {chunk.chunkTitle || 'Fragment'}
                                 </div>
                                 <IOS26Content content={cleanChunkContent(chunk.content)} />
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <h3 className="text-2xl font-bold mb-6 text-slate-800">{t.modal_title}</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.modal_label_title}</label>
                <input 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" 
                  placeholder={t.modal_placeholder_title} 
                  value={newDocTitle} 
                  onChange={e => setNewDocTitle(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.modal_label_content}</label>
                <textarea 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl h-48 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" 
                  placeholder={t.modal_placeholder_content} 
                  value={newDocContent} 
                  onChange={e => setNewDocContent(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-full font-medium transition-colors">{t.btn_cancel}</button>
              <button onClick={handleAddDocument} className="px-8 py-3 bg-slate-800 text-white rounded-full hover:bg-black shadow-lg hover:scale-105 transition-all font-bold">{t.btn_create}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

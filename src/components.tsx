import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { i18n, TranslationKey } from './i18n';
import { generateMotivationalQuote } from './services/gemini';
import { CheckCircle2, Circle, Flame, Sparkles, TrendingUp, Plus, Trash2, Edit3, Save, X, Search, Settings as SettingsIcon, Home as HomeIcon, FileText, CheckSquare, Moon, Sun, Globe, Pin, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { improveNoteContent, suggestDailyGoals } from './services/gemini';

// Helper for translations
const useTranslation = () => {
  const { language } = useAppStore();
  return (key: TranslationKey) => i18n[language][key];
};

// --- Components ---

function Header() {
  const { language, setLanguage, theme, setTheme, streak } = useAppStore();
  const t = useTranslation();

  return (
    <header className="pt-4 pb-4 px-5 bg-white dark:bg-[#0b1120] flex items-center justify-between z-10 sticky top-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
          <Sparkles className="text-white" size={14} />
        </div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {language === 'bn' ? 'নোটমি' : 'NoteMe'}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800/80 px-2 py-1.5 rounded-md text-gray-600 dark:text-gray-300 tracking-wide"
        >
          🌐 {language === 'en' ? 'EN' : 'বাংলা'}
        </button>
        <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-800/30">
          <Flame size={14} className="text-orange-500" />
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak.current}</span>
        </div>
      </div>
    </header>
  );
}

function MotivationalQuote() {
  const { language } = useAppStore();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const fetchQuote = async () => {
      const q = await generateMotivationalQuote(language);
      setQuote(q);
    };
    fetchQuote();
  }, [language]);

  if (!quote) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-xl mb-5 flex items-start gap-2 border border-emerald-100 dark:border-emerald-800/30"
    >
      <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={14} />
      <p className="text-emerald-800 dark:text-emerald-200 font-medium italic text-xs leading-relaxed">"{quote}"</p>
    </motion.div>
  );
}

function DailyGoals() {
  const { goals, addGoal, toggleGoal, deleteGoal, language } = useAppStore();
  const t = useTranslation();
  const [newGoal, setNewGoal] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysGoals = goals.filter(g => g.date === todayStr);
  const completedCount = todaysGoals.filter(g => g.completed).length;
  const progress = todaysGoals.length > 0 ? (completedCount / todaysGoals.length) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim() && todaysGoals.length < 5) {
      addGoal(newGoal.trim());
      setNewGoal('');
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    const suggestions = await suggestDailyGoals(language);
    suggestions.forEach(g => {
      if (todaysGoals.length < 5) {
        addGoal(g);
      }
    });
    setIsSuggesting(false);
  };

  return (
    <div className="bg-white dark:bg-[#15233b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/50 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          <TrendingUp size={16} className="text-emerald-500" />
          {t('dailyGoals')}
        </h2>
        {todaysGoals.length < 5 && (
          <button 
            onClick={handleSuggest}
            disabled={isSuggesting}
            className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <Sparkles size={12} />
            {isSuggesting ? t('generating') : t('generateGoals')}
          </button>
        )}
      </div>

      {todaysGoals.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
            <span>{t('progress')}</span>
            <span>{completedCount} / {todaysGoals.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {progress === 100 && todaysGoals.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl text-xs font-bold mb-3 text-center border border-emerald-100 dark:border-emerald-800/30"
        >
          {t('goalsCompletedMsg')}
        </motion.div>
      )}

      <ul className="space-y-2 mb-3">
        <AnimatePresence>
          {todaysGoals.map(goal => (
            <motion.li 
              key={goal.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <button 
                onClick={() => toggleGoal(goal.id)}
                className="flex items-center gap-2.5 flex-1 text-left"
              >
                {goal.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                )}
                <span className={`text-xs font-medium ${goal.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                  {goal.title}
                </span>
              </button>
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="text-gray-400 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {todaysGoals.length < 5 && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder={t('goalPlaceholder')}
            className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
          />
          <button 
            type="submit"
            disabled={!newGoal.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 rounded-xl transition-colors flex items-center justify-center"
          >
            <Plus size={16} />
          </button>
        </form>
      )}
    </div>
  );
}

function TaskList({ limit, filter = 'all' }: { limit?: number, filter?: 'all' | 'pending' | 'completed' }) {
  const { tasks, toggleTask, deleteTask } = useAppStore();
  const t = useTranslation();
  
  let displayTasks = tasks;
  if (filter === 'pending') displayTasks = tasks.filter(t => !t.completed);
  if (filter === 'completed') displayTasks = tasks.filter(t => t.completed);
  if (limit) displayTasks = displayTasks.slice(0, limit);

  if (displayTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs font-medium">
        {t('noTasks')}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence>
        {displayTasks.map(task => (
          <div key={task.id} className="relative rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-xl">
              <Trash2 className="text-white" size={16} />
            </div>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -60) deleteTask(task.id);
              }}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white dark:bg-[#15233b] p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 flex items-center justify-between"
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2.5 flex-1 text-left"
              >
                {task.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                )}
                <span className={`text-xs font-medium ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                  {task.title}
                </span>
              </button>
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function NoteList({ limit, showLocked = false, search = '' }: { limit?: number, showLocked?: boolean, search?: string }) {
  const { notes, deleteNote, togglePinNote, toggleNoteLock } = useAppStore();
  const t = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredNotes = notes.filter(n => {
    const matchesLock = showLocked ? n.isLocked : !n.isLocked;
    const matchesSearch = search === '' || 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchesLock && matchesSearch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const displayNotes = limit ? sortedNotes.slice(0, limit) : sortedNotes;

  if (displayNotes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs font-medium flex-1">
        {t('noNotes')}
      </div>
    );
  }

  return (
    <>
      <div 
        className="grid gap-2.5 grid-cols-2 flex-1 overflow-y-auto scroll-smooth no-scrollbar min-h-0 pb-24"
        style={{
          gridAutoRows: 'calc((100% - 20px) / 3)'
        }}
      >
        <AnimatePresence>
          {displayNotes.map(note => (
            <motion.div 
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gradient-to-br dark:from-[#1a2942] dark:to-[#111c30] p-3 rounded-[14px] border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              onClick={() => setEditingId(note.id)}
            >
              <div className="flex justify-between items-start mb-1.5 gap-2 shrink-0">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xs line-clamp-1 flex-1">{note.title || 'Untitled'}</h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); togglePinNote(note.id); }}
                  className="shrink-0 p-0.5"
                >
                  <Pin size={12} className={note.pinned ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400 dark:text-gray-600'} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative mb-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed absolute inset-0 mask-image-bottom">{note.content}</p>
              </div>
              <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700/50 shrink-0">
                <span className="opacity-70">{new Date(note.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleNoteLock(note.id); }}
                    className="hover:text-amber-500 transition-colors p-1"
                  >
                    {note.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {editingId && (
        <NoteEditorModal 
          noteId={editingId} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </>
  );
}

function NoteEditorModal({ noteId, onClose }: { noteId?: string, onClose: () => void }) {
  const { notes, addNote, updateNote, language } = useAppStore();
  const t = useTranslation();
  
  const existingNote = noteId ? notes.find(n => n.id === noteId) : null;
  
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [isImproving, setIsImproving] = useState(false);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    
    if (existingNote) {
      updateNote(existingNote.id, { title, content });
    } else {
      addNote({ title, content });
    }
    onClose();
  };

  const handleImprove = async () => {
    if (!content.trim()) return;
    setIsImproving(true);
    const improved = await improveNoteContent(content, language);
    setContent(improved);
    setIsImproving(false);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-[#0b1120]">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full w-full"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold dark:text-white">{existingNote ? t('edit') : t('addNote')}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            className="text-xl font-bold bg-transparent border-none outline-none dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('contentPlaceholder')}
            className="flex-1 bg-transparent border-none outline-none resize-none dark:text-gray-200 placeholder:text-gray-400 min-h-[200px]"
          />
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleImprove}
            disabled={isImproving || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isImproving ? t('generating') : t('improveWithAI')}
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function QuickAddModal({ onClose, defaultMode = 'note' }: { onClose: () => void, defaultMode?: 'task' | 'note' }) {
  const { addTask, language } = useAppStore();
  const t = useTranslation();
  const [taskTitle, setTaskTitle] = useState('');
  const [mode, setMode] = useState<'task' | 'note'>(defaultMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'task' && taskTitle.trim()) {
      addTask(taskTitle.trim());
      onClose();
    }
  };

  if (mode === 'note') {
    return <NoteEditorModal onClose={onClose} />;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-5"
      >
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setMode('task')}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${mode === 'task' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            {t('addTask')}
          </button>
          <button 
            onClick={() => setMode('note')}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${mode === 'note' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            {t('addNote')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder={t('taskPlaceholder')}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
          />
          <button 
            type="submit"
            disabled={!taskTitle.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 rounded-xl transition-colors font-medium"
          >
            {t('save')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// --- Main Views ---

function HomeView() {
  const t = useTranslation();
  const { tasks, lockPassword } = useAppStore();
  const pendingTasks = tasks.filter(t => !t.completed);
  const [viewMode, setViewMode] = useState<'normal' | 'locked'>('normal');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLockToggle = () => {
    if (viewMode === 'locked') {
      setViewMode('normal');
    } else {
      if (lockPassword) {
        setShowAuthModal(true);
      } else {
        setViewMode('locked');
      }
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === lockPassword) {
      setViewMode('locked');
      setShowAuthModal(false);
      setAuthPassword('');
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
    }
  };

  return (
    <div className="pt-2 flex-1 flex flex-col min-h-0">
      {pendingTasks.length > 0 && viewMode === 'normal' && (
        <div className="mb-6 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <CheckSquare size={16} className="text-emerald-500" />
              {t('continueTasks')}
            </h2>
          </div>
          <TaskList limit={3} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <FileText size={16} className="text-emerald-500" />
            {viewMode === 'normal' ? t('notes') : 'Locked Notes'}
          </h2>
          <button
            onClick={handleLockToggle}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            {viewMode === 'normal' ? <Lock size={12} /> : <Unlock size={12} />}
            {viewMode === 'normal' ? 'NoteLock' : 'Back to Notes'}
          </button>
        </div>
        <NoteList showLocked={viewMode === 'locked'} />
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#15233b] rounded-2xl p-5 w-full max-w-sm shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock size={18} className="text-emerald-500" />
                  Enter Password
                </h3>
                <button onClick={() => { setShowAuthModal(false); setAuthPassword(''); setAuthError(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAuthSubmit}>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white mb-2"
                  autoFocus
                />
                {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                >
                  Unlock
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalsView() {
  return (
    <div className="pb-24 pt-2 overflow-y-auto scroll-smooth no-scrollbar flex-1">
      <DailyGoals />
    </div>
  );
}

function NotesView() {
  const t = useTranslation();
  const [search, setSearch] = useState('');
  const { notes } = useAppStore();

  return (
    <div className="pt-2 flex-1 flex flex-col min-h-0">
      <div className="relative mb-5 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-white dark:bg-[#15233b] border border-gray-200 dark:border-gray-800/50 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all shadow-sm"
        />
      </div>
      <NoteList search={search} />
    </div>
  );
}

function TasksView() {
  const t = useTranslation();
  const { tasks, toggleTask, deleteTask } = useAppStore();
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

  const filteredTasks = tasks.filter(task => 
    filter === 'pending' ? !task.completed : task.completed
  );

  return (
    <div className="pt-2 flex-1 flex flex-col min-h-0">
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl mb-5 shrink-0">
        <button 
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'pending' ? 'bg-white dark:bg-[#15233b] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {t('pending')}
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'completed' ? 'bg-white dark:bg-[#15233b] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {t('completed')}
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs font-medium shrink-0">
          {t('noTasks')}
        </div>
      ) : (
        <ul className="space-y-2 flex-1 overflow-y-auto scroll-smooth no-scrollbar pb-24">
          <AnimatePresence>
            {filteredTasks.map(task => (
              <div key={task.id} className="relative rounded-xl overflow-hidden group">
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-xl">
                  <Trash2 className="text-white" size={16} />
                </div>
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x < -60) deleteTask(task.id);
                  }}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative bg-white dark:bg-[#15233b] p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 flex items-center justify-between"
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2.5 flex-1 text-left"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                      {task.title}
                    </span>
                  </button>
                </motion.div>
              </div>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function SettingsView() {
  const { theme, setTheme, language, setLanguage, resetData, tasks, lockPassword, setLockPassword } = useAppStore();
  const t = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length > 0 && newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }
    setLockPassword(newPassword || null);
    setShowPasswordModal(false);
    setNewPassword('');
    setPasswordError('');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const dailyCompleted = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === todayStr).length;
  
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyCompleted = tasks.filter(t => t.completed && t.completedAt && t.completedAt > oneWeekAgo).length;

  return (
    <div className="pb-24 pt-2 space-y-5 flex-1 overflow-y-auto scroll-smooth no-scrollbar">
      <div className="bg-white dark:bg-[#15233b] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/50">
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{t('stats')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">{dailyCompleted}</div>
            <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">{t('dailyTasksCompleted')}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-0.5">{weeklyCompleted}</div>
            <div className="text-[10px] text-blue-800 dark:text-blue-300 font-bold">{t('weeklyTasksCompleted')}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15233b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider p-4 pb-1">{t('settings')}</h3>
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200 font-bold text-xs">
            <Globe size={16} className="text-gray-400" />
            {t('language')}
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-lg p-1">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              {i18n.en.english}
            </button>
            <button 
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'bn' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              {i18n.en.bangla}
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200 font-bold text-xs">
            {theme === 'light' ? <Sun size={16} className="text-gray-400" /> : <Moon size={16} className="text-gray-400" />}
            {t('theme')}
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-lg p-1">
            <button 
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              {t('light')}
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              {t('dark')}
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200 font-bold text-xs">
            <Lock size={16} className="text-gray-400" />
            NoteLock Password
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-3 py-1.5 text-[10px] font-bold rounded-md transition-all bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {lockPassword ? 'Change / Remove' : 'Set Password'}
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            {t('resetData')}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#15233b] p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">NoteLock Password</h3>
                <button onClick={() => { setShowPasswordModal(false); setNewPassword(''); setPasswordError(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs">Set a password to lock your notes. Leave empty to remove the password.</p>
              <form onSubmit={handleSavePassword}>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 4 chars)"
                  className="w-full bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white mb-2"
                  autoFocus
                />
                {passwordError && <p className="text-red-500 text-xs mb-3">{passwordError}</p>}
                <div className="flex gap-3 justify-end mt-4">
                  <button 
                    type="button"
                    onClick={() => { setShowPasswordModal(false); setNewPassword(''); setPasswordError(''); }} 
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors shadow-sm text-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{t('resetData')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{t('resetConfirm')}</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => { resetData(); setShowConfirm(false); }} 
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-sm"
                >
                  {t('resetData')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main App Component ---

export function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'notes' | 'tasks' | 'settings'>('home');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const t = useTranslation();

  const tabs = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'notes', icon: FileText, label: t('notes') },
    { id: 'tasks', icon: CheckSquare, label: t('tasks') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#070b14] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="max-w-md mx-auto min-h-screen relative bg-[#f8f9fa] dark:bg-[#0b1120] shadow-2xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-hidden px-4 pt-4 pb-0 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {activeTab === 'home' && <HomeView />}
              {activeTab === 'notes' && <NotesView />}
              {activeTab === 'tasks' && <TasksView />}
              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Bottom Navigation */}
        <div className="absolute bottom-6 left-4 right-4 z-20">
          <nav className="bg-white/90 dark:bg-[#15233b]/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-3xl px-4 py-3 flex justify-between items-center shadow-xl shadow-gray-200/50 dark:shadow-black/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'text-emerald-500 scale-110' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  <Icon size={22} className={isActive ? 'fill-emerald-50 dark:fill-emerald-900/30' : ''} />
                  <span className="text-[9px] font-bold tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowQuickAdd(true)}
          className="absolute bottom-28 right-6 w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
        >
          <Plus size={24} />
        </button>

        {/* Modals */}
        <AnimatePresence>
          {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} defaultMode={activeTab === 'tasks' ? 'task' : 'note'} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  isLocked?: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface AppState {
  language: Language;
  theme: Theme;
  notes: Note[];
  tasks: Task[];
  goals: Goal[];
  streak: {
    current: number;
    lastActiveDate: string;
  };
  lockPassword?: string | null;
}

interface AppContextType extends AppState {
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setLockPassword: (password: string | null) => void;
  toggleNoteLock: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addGoal: (title: string) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  resetData: () => void;
  updateStreak: () => void;
}

const defaultState: AppState = {
  language: 'en',
  theme: 'light',
  notes: [],
  tasks: [],
  goals: [],
  streak: { current: 0, lastActiveDate: '' },
  lockPassword: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'noteme_data';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultState, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse local storage data', e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Apply theme
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const setLanguage = (language: Language) => updateState({ language });
  const setTheme = (theme: Theme) => updateState({ theme });
  const setLockPassword = (lockPassword: string | null) => updateState({ lockPassword });

  const toggleNoteLock = (id: string) => {
    updateState({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, isLocked: !n.isLocked } : n
      ),
    });
  };

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateState({ notes: [newNote, ...state.notes] });
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    updateState({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      ),
    });
  };

  const deleteNote = (id: string) => {
    updateState({ notes: state.notes.filter((n) => n.id !== id) });
  };

  const togglePinNote = (id: string) => {
    updateState({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      ),
    });
  };

  const addTask = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
    };
    updateState({ tasks: [newTask, ...state.tasks] });
  };

  const toggleTask = (id: string) => {
    updateState({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
          : t
      ),
    });
  };

  const deleteTask = (id: string) => {
    updateState({ tasks: state.tasks.filter((t) => t.id !== id) });
  };

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const addGoal = (title: string) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      date: getTodayDateString(),
    };
    updateState({ goals: [...state.goals, newGoal] });
  };

  const toggleGoal = (id: string) => {
    updateState({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, completed: !g.completed } : g
      ),
    });
  };

  const deleteGoal = (id: string) => {
    updateState({ goals: state.goals.filter((g) => g.id !== id) });
  };

  const resetData = () => {
    setState(defaultState);
  };

  const updateStreak = () => {
    const today = getTodayDateString();
    const { current, lastActiveDate } = state.streak;

    if (lastActiveDate === today) return; // Already updated today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = current;
    if (lastActiveDate === yesterdayStr) {
      newStreak += 1; // Consecutive day
    } else {
      newStreak = 1; // Streak broken or first day
    }

    updateState({ streak: { current: newStreak, lastActiveDate: today } });
  };

  useEffect(() => {
    updateStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setLanguage,
        setTheme,
        setLockPassword,
        toggleNoteLock,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addTask,
        toggleTask,
        deleteTask,
        addGoal,
        toggleGoal,
        deleteGoal,
        resetData,
        updateStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

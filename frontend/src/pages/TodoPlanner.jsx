import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import OptionsMenu from '../components/OptionsMenu';
import SEO from '../components/SEO';
import { useMood } from '../context/MoodContext';

// ─── Constants ──────────────────────────────────────────────
const STORAGE_KEY = 'echona_todos';
const HABITS_KEY = 'echona_habits';
const FOCUS_LOG_KEY = 'echona_focus_log';

const MOODS = ['Calm', 'Happy', 'Excited', 'Sad', 'Angry', 'Anxious'];
const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['Personal', 'Work', 'Health', 'Creative', 'Learning', 'Social'];
const STATUS_FLOW = ['backlog', 'today', 'in-progress', 'done'];
const EFFORT_VALUES = [1, 2, 3, 5, 8];

const moodConfig = {
  Happy:   { accent: 'amber',   emoji: '😊', bg: 'bg-amber-500/10',   border: 'border-amber-500/25',  text: 'text-amber-400',   dot: 'bg-amber-400' },
  Calm:    { accent: 'emerald', emoji: '😌', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Excited: { accent: 'pink',    emoji: '🤩', bg: 'bg-pink-500/10',    border: 'border-pink-500/25',    text: 'text-pink-400',    dot: 'bg-pink-400' },
  Sad:     { accent: 'blue',    emoji: '😢', bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  Angry:   { accent: 'rose',    emoji: '😤', bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    text: 'text-rose-400',    dot: 'bg-rose-400' },
  Anxious: { accent: 'purple',  emoji: '😰', bg: 'bg-purple-500/10',  border: 'border-purple-500/25',  text: 'text-purple-400',  dot: 'bg-purple-400' },
};

const priorityConfig = {
  high:   { label: 'High',   color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',   dot: 'bg-rose-400' },
  medium: { label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',  dot: 'bg-amber-400' },
  low:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
};

const statusConfig = {
  backlog: { label: 'Backlog', tone: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  today: { label: 'Today', tone: 'text-indigo-300', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25' },
  'in-progress': { label: 'In Progress', tone: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/25' },
  done: { label: 'Done', tone: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
};

const songBucket = {
  Happy:   [{ title: "Happy - Pharrell Williams", url: "https://www.youtube.com/watch?v=ZbZSe6N_BXs" }, { title: "Walking on Sunshine", url: "https://www.youtube.com/watch?v=iPUmE-tne5U" }, { title: "Good Vibrations", url: "https://www.youtube.com/watch?v=Eab_beh07HU" }],
  Calm:    [{ title: "Weightless - Marconi Union", url: "https://www.youtube.com/watch?v=UfcAVejslrU" }, { title: "Clair de Lune", url: "https://www.youtube.com/watch?v=CvFH_6DNRCY" }, { title: "Aqueous Transmission", url: "https://www.youtube.com/watch?v=3k0-sGqxIiQ" }],
  Excited: [{ title: "Eye of the Tiger", url: "https://www.youtube.com/watch?v=btPJPFnesV4" }, { title: "Uptown Funk", url: "https://www.youtube.com/watch?v=OPf0YbXqDm0" }, { title: "Can't Stop the Feeling", url: "https://www.youtube.com/watch?v=ru0K8uYEZWw" }],
  Sad:     [{ title: "Someone Like You - Adele", url: "https://www.youtube.com/watch?v=hLQl3WQQoQ0" }, { title: "Fix You - Coldplay", url: "https://www.youtube.com/watch?v=k4V3Mo61fJM" }, { title: "The Night We Met", url: "https://www.youtube.com/watch?v=KIkrHlAHKO4" }],
  Angry:   [{ title: "Lose Yourself - Eminem", url: "https://www.youtube.com/watch?v=_Yhyp-_hX2s" }, { title: "In the End - Linkin Park", url: "https://www.youtube.com/watch?v=eVTXPUF4Oz4" }, { title: "Break Stuff", url: "https://www.youtube.com/watch?v=ZpUYjpKg9KY" }],
  Anxious: [{ title: "Breathe Me - Sia", url: "https://www.youtube.com/watch?v=SFGvmrJ5rjM" }, { title: "Mad World", url: "https://www.youtube.com/watch?v=4N3N1MlvVc4" }, { title: "Skinny Love", url: "https://www.youtube.com/watch?v=ssdgFoHLwnk" }],
};

const affirmations = {
  Happy:   "Your positive energy is contagious. Channel it into great work!",
  Calm:    "A peaceful mind is a productive mind. You're in the zone.",
  Excited: "That energy is powerful — use it to knock out your toughest task!",
  Sad:     "It's okay to feel this way. Start small and be gentle with yourself.",
  Angry:   "Transform that intensity into focus. You've got this.",
  Anxious: "One step at a time. Breathe first, then tackle the easiest task.",
};

// ─── Helpers ────────────────────────────────────────────────
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date() && !isToday(dateStr);
};

const formatDueDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (isToday(dateStr)) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days <= 7) return `In ${days} days`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const normalizeTodo = (todo) => {
  const completed = Boolean(todo.completed);
  const status = completed ? 'done' : (STATUS_FLOW.includes(todo.status) ? todo.status : 'backlog');
  const tags = Array.isArray(todo.tags)
    ? todo.tags.filter(Boolean)
    : String(todo.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    ...todo,
    status,
    effort: Number(todo.effort) > 0 ? Number(todo.effort) : 2,
    tags,
  };
};

const getTaskScore = (task, energyBudget = 6) => {
  const priorityBoost = task.priority === 'high' ? 10 : task.priority === 'medium' ? 6 : 3;
  const overdueBoost = !task.completed && isOverdue(task.dueDate) ? 8 : 0;
  const dueSoonBoost = task.dueDate && !task.completed && !isOverdue(task.dueDate) ? 3 : 0;
  const effortPenalty = Math.max(0, Number(task.effort || 2) - energyBudget) * 2;
  const statusBoost = task.status === 'today' ? 4 : task.status === 'in-progress' ? 2 : 0;
  return priorityBoost + overdueBoost + dueSoonBoost + statusBoost - effortPenalty;
};

// ═════════════════════════════════════════════════════════════
//  COMPONENT
// ═════════════════════════════════════════════════════════════
const TodoPlanner = () => {
  const navigate = useNavigate();
  const { currentMood } = useMood();

  // ─── State ──────────────────────────────────────────────
  const [todos, setTodos] = useState([]);
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks | habits | focus
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list | board
  const [quickCapture, setQuickCapture] = useState('');
  const [energyBudget, setEnergyBudget] = useState(6);

  // Focus timer
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusTimeLeft, setFocusTimeLeft] = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [focusCompleted, setFocusCompleted] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);
  const focusRef = useRef(null);

  // New task form
  const [newTodo, setNewTodo] = useState({
    title: '', description: '', priority: 'medium',
    mood: currentMood || 'Calm', category: 'Personal',
    dueDate: '', dueTime: '', subtasks: '',
    effort: 2, tags: '', status: 'backlog',
  });

  // New habit form
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', frequency: 'daily', mood: 'Calm' });

  // ─── Persistence ────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) setTodos(p.map(normalizeTodo));
      }
      const savedH = localStorage.getItem(HABITS_KEY);
      if (savedH) { const p = JSON.parse(savedH); if (Array.isArray(p)) setHabits(p); }
      const savedF = localStorage.getItem(FOCUS_LOG_KEY);
      if (savedF) setFocusSessions(parseInt(savedF, 10) || 0);
      const savedView = localStorage.getItem('echona_planner_view');
      if (savedView === 'list' || savedView === 'board') setViewMode(savedView);
      const savedEnergy = Number(localStorage.getItem('echona_planner_energy'));
      if (Number.isFinite(savedEnergy) && savedEnergy >= 1 && savedEnergy <= 10) setEnergyBudget(savedEnergy);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem(FOCUS_LOG_KEY, String(focusSessions)); }, [focusSessions]);
  useEffect(() => { localStorage.setItem('echona_planner_view', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('echona_planner_energy', String(energyBudget)); }, [energyBudget]);

  // Auto-set mood when detected
  useEffect(() => {
    if (currentMood) setNewTodo(prev => ({ ...prev, mood: currentMood }));
  }, [currentMood]);

  useEffect(() => {
    if (!selectedTodo?.id) return;
    const fresh = todos.find((todo) => todo.id === selectedTodo.id);
    if (!fresh) {
      setSelectedTodo(null);
      return;
    }
    setSelectedTodo(fresh);
  }, [todos, selectedTodo?.id]);

  // ─── Focus Timer ────────────────────────────────────────
  useEffect(() => {
    if (focusActive && !focusPaused && focusTimeLeft > 0) {
      focusRef.current = setInterval(() => {
        setFocusTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(focusRef.current);
            setFocusActive(false);
            setFocusCompleted(true);
            setFocusSessions(s => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(focusRef.current);
  }, [focusActive, focusPaused, focusTimeLeft]);

  const startFocus = () => { setFocusTimeLeft(focusMinutes * 60); setFocusActive(true); setFocusPaused(false); setFocusCompleted(false); };
  const pauseFocus = () => { setFocusPaused(!focusPaused); };
  const resetFocus = () => { clearInterval(focusRef.current); setFocusActive(false); setFocusPaused(false); setFocusTimeLeft(0); setFocusCompleted(false); };

  // ─── Todo CRUD ──────────────────────────────────────────
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    const subtaskList = newTodo.subtasks
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((text, i) => ({ id: Date.now() + i, text, done: false }));

    const dueDateTime = newTodo.dueDate
      ? new Date(`${newTodo.dueDate}T${newTodo.dueTime || '23:59'}`).toISOString()
      : null;

    const todo = {
      id: Date.now(),
      title: newTodo.title, description: newTodo.description,
      priority: newTodo.priority, mood: newTodo.mood,
      category: newTodo.category,
      completed: false, createdAt: new Date().toISOString(),
      dueDate: dueDateTime,
      subtasks: subtaskList,
      songs: songBucket[newTodo.mood] || [],
      notes: '',
      status: newTodo.status || 'backlog',
      effort: Number(newTodo.effort) || 2,
      tags: String(newTodo.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    setTodos(prev => [normalizeTodo(todo), ...prev]);
    setNewTodo({
      title: '', description: '', priority: 'medium',
      mood: currentMood || 'Calm', category: 'Personal',
      dueDate: '', dueTime: '', subtasks: '',
      effort: 2, tags: '', status: 'backlog',
    });
    setShowForm(false);
  };

  const toggleComplete = (id) => setTodos(prev => prev.map(t => {
    if (t.id !== id) return t;
    const nextCompleted = !t.completed;
    return {
      ...t,
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : null,
      status: nextCompleted ? 'done' : (t.status === 'done' ? 'today' : t.status),
    };
  }));
  const deleteTodo = (id) => { setTodos(prev => prev.filter(t => t.id !== id)); if (selectedTodo?.id === id) setSelectedTodo(null); };
  const toggleSubtask = (todoId, subId) => setTodos(prev => prev.map(t => t.id === todoId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) } : t));
  const updateNote = (id, notes) => setTodos(prev => prev.map(t => t.id === id ? { ...t, notes } : t));

  const moveTaskStatus = (id, direction) => {
    setTodos((prev) => prev.map((task) => {
      if (task.id !== id) return task;
      const currentIndex = STATUS_FLOW.indexOf(task.status || (task.completed ? 'done' : 'backlog'));
      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = Math.max(0, Math.min(STATUS_FLOW.length - 1, safeIndex + direction));
      const status = STATUS_FLOW[nextIndex];
      const completed = status === 'done';
      return {
        ...task,
        status,
        completed,
        completedAt: completed ? (task.completedAt || new Date().toISOString()) : null,
      };
    }));
  };

  const addQuickTask = () => {
    const title = quickCapture.trim();
    if (!title) return;
    const quickTodo = normalizeTodo({
      id: Date.now(),
      title,
      description: '',
      priority: 'medium',
      mood: currentMood || 'Calm',
      category: 'Personal',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: null,
      dueTime: '',
      subtasks: [],
      songs: songBucket[currentMood || 'Calm'] || [],
      notes: '',
      status: 'today',
      effort: 1,
      tags: ['quick-capture'],
    });

    setTodos((prev) => [quickTodo, ...prev]);
    setQuickCapture('');
  };

  // ─── Habits ─────────────────────────────────────────────
  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;
    const habit = {
      id: Date.now(), title: newHabit.title, frequency: newHabit.frequency,
      mood: newHabit.mood, streak: 0, lastCompleted: null,
      completions: [],
    };
    setHabits(prev => [...prev, habit]);
    setNewHabit({ title: '', frequency: 'daily', mood: 'Calm' });
    setShowHabitForm(false);
  };

  const completeHabit = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const today = new Date().toDateString();
      if (h.lastCompleted === today) return h; // already done today
      const wasYesterday = h.lastCompleted && new Date(h.lastCompleted).toDateString() === new Date(Date.now() - 86400000).toDateString();
      return {
        ...h, lastCompleted: today,
        streak: wasYesterday || !h.lastCompleted ? h.streak + 1 : 1,
        completions: [...(h.completions || []), today],
      };
    }));
  };

  const deleteHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id));
  const isHabitDoneToday = (h) => h.lastCompleted === new Date().toDateString();

  // ─── Derived Data ───────────────────────────────────────
  const filteredTodos = todos
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      if (filter === 'today') return isToday(t.dueDate) || isToday(t.createdAt);
      if (filter === 'overdue') return !t.completed && isOverdue(t.dueDate);
      return true;
    })
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'priority') { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority]; }
      if (sortBy === 'due') { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate) - new Date(b.dueDate); }
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  const boardBuckets = useMemo(() => {
    const buckets = {
      backlog: [],
      today: [],
      'in-progress': [],
      done: [],
    };

    filteredTodos.forEach((todo) => {
      const status = STATUS_FLOW.includes(todo.status) ? todo.status : (todo.completed ? 'done' : 'backlog');
      buckets[status].push(todo);
    });

    return buckets;
  }, [filteredTodos]);

  const activeTasks = todos.filter((todo) => !todo.completed);
  const todayLoad = todos
    .filter((todo) => !todo.completed && (todo.status === 'today' || todo.status === 'in-progress'))
    .reduce((sum, todo) => sum + Number(todo.effort || 0), 0);

  const nextBestTask = useMemo(() => {
    if (!activeTasks.length) return null;

    return [...activeTasks]
      .sort((a, b) => getTaskScore(b, energyBudget) - getTaskScore(a, energyBudget))[0] || null;
  }, [activeTasks, energyBudget]);

  const workloadLabel = todayLoad <= energyBudget
    ? 'Balanced'
    : todayLoad <= energyBudget + 3
      ? 'Heavy'
      : 'Overloaded';

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => !t.completed && isOverdue(t.dueDate)).length,
    todayDone: todos.filter(t => t.completed && isToday(t.completedAt)).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const detectedMood = currentMood || 'Calm';
  const mc = moodConfig[detectedMood] || moodConfig.Calm;

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <AppShell>
      <SEO title="Wellness Planner" description="Mood-aware planner with focus timer, habits, and music integration" path="/todo" />

      <div className="relative z-10 pt-14 lg:pt-4 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* ─── Top Bar ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/60 hover:bg-neutral-800/70 border border-neutral-800 rounded-xl text-sm text-neutral-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </motion.button>
          <OptionsMenu currentPage="/todo" />
        </div>

        {/* ─── Header + Mood Affirmation ───────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 mb-2">Wellness Planner</h1>
          <p className="text-neutral-500 text-sm mb-4">Plan tasks around your emotional capacity</p>

          {/* Mood affirmation banner */}
          <div className={`${mc.bg} border ${mc.border} rounded-xl px-5 py-3.5 flex items-center gap-3`}>
            <span className="text-xl">{mc.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${mc.text} uppercase tracking-wider mb-0.5`}>
                Current Mood: {detectedMood}
              </p>
              <p className="text-neutral-400 text-sm">{affirmations[detectedMood]}</p>
            </div>
            <button onClick={() => navigate('/mood-detect')} className={`text-xs ${mc.text} hover:underline whitespace-nowrap`}>
              Update Mood
            </button>
          </div>
        </motion.div>

        {/* ─── Planner Cockpit ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Active Tasks', value: stats.active, color: 'text-indigo-300', hint: 'Not completed yet' },
            { label: 'Done Today', value: stats.todayDone, color: 'text-emerald-300', hint: 'Completed this day' },
            { label: 'Overdue', value: stats.overdue, color: stats.overdue > 0 ? 'text-rose-300' : 'text-neutral-400', hint: 'Needs immediate attention' },
            { label: 'Completion', value: `${completionRate}%`, color: 'text-amber-300', hint: 'Overall finish rate' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-2xl border border-neutral-800/70 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_40%),rgba(10,14,24,0.8)] px-4 py-3"
            >
              <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color} mt-0.5`}>{s.value}</p>
              <p className="text-[10px] text-neutral-600 mt-1">{s.hint}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
          <div className="lg:col-span-2 rounded-2xl border border-neutral-800/70 bg-neutral-900/50 p-4">
            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold mb-2">Quick Capture</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={quickCapture}
                onChange={(e) => setQuickCapture(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addQuickTask();
                  }
                }}
                placeholder="Dump a task fast... it lands in Today"
                className="flex-1 px-4 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
              <button
                onClick={addQuickTask}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/80 hover:bg-indigo-500 text-white transition-colors"
              >
                Add Quick Task
              </button>
            </div>
            {nextBestTask && (
              <div className="mt-3 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-2.5">
                <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold mb-1">Suggested Next Task</p>
                <p className="text-sm text-neutral-100 font-medium truncate">{nextBestTask.title}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {priorityConfig[nextBestTask.priority]?.label || 'Medium'} priority • Effort {nextBestTask.effort || 2}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-800/70 bg-neutral-900/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Energy Budget</p>
              <span className="text-xs text-neutral-300">{energyBudget}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyBudget}
              onChange={(e) => setEnergyBudget(Number(e.target.value))}
              className="w-full"
              aria-label="Energy budget"
            />
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Today load</span>
              <span className={`${todayLoad > energyBudget ? 'text-rose-300' : 'text-emerald-300'} font-semibold`}>
                {todayLoad} pts • {workloadLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Tabs ───────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'tasks', label: 'Planner', icon: '📋' },
            { key: 'habits', label: 'Habits', icon: '🔄' },
            { key: 'focus', label: 'Focus', icon: '⏱️' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <span className="text-sm">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════
            TAB: TASKS
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Action bar */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="inline-flex items-center gap-1 rounded-xl border border-neutral-800/70 bg-neutral-900/45 p-1">
                  {[{ key: 'list', label: 'List' }, { key: 'board', label: 'Board' }].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setViewMode(mode.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === mode.key
                          ? 'bg-neutral-200 text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                <button onClick={() => setShowForm(!showForm)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    showForm ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-700 text-neutral-100 hover:bg-neutral-600'
                  }`}
                >
                  {showForm ? 'Cancel' : '+ New Task'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-800/60 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Filters */}
                {['all', 'active', 'today', 'overdue', 'completed'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      filter === f ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                    }`}
                  >{f}</button>
                ))}

                {/* Sort */}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-900/50 border border-neutral-800/60 rounded-lg text-xs text-neutral-400 focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="priority">Priority</option>
                  <option value="due">Due Date</option>
                </select>
              </div>
            </div>
            </div>

            {/* Add Task Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                  <form onSubmit={handleAddTodo} className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Task Title *</label>
                        <input type="text" required value={newTodo.title} onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                          placeholder="What do you need to do?"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Description</label>
                        <textarea value={newTodo.description} onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 resize-none"
                          placeholder="Add details..." rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Priority</label>
                        <div className="flex gap-2">
                          {PRIORITIES.map(p => (
                            <button key={p} type="button" onClick={() => setNewTodo({ ...newTodo, priority: p })}
                              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                                newTodo.priority === p
                                  ? `${priorityConfig[p].bg} ${priorityConfig[p].border} border ${priorityConfig[p].color}`
                                  : 'bg-neutral-800/40 border border-neutral-800/60 text-neutral-500 hover:text-neutral-300'
                              }`}
                            >{p}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Category</label>
                        <select value={newTodo.category} onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-300 focus:outline-none"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Workflow</label>
                        <select value={newTodo.status} onChange={(e) => setNewTodo({ ...newTodo, status: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-300 focus:outline-none"
                        >
                          {STATUS_FLOW.filter((s) => s !== 'done').map((status) => (
                            <option key={status} value={status}>{statusConfig[status].label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Mood / Music</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {MOODS.map(m => (
                            <button key={m} type="button" onClick={() => setNewTodo({ ...newTodo, mood: m })}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                newTodo.mood === m
                                  ? `${moodConfig[m].bg} ${moodConfig[m].border} border ${moodConfig[m].text}`
                                  : 'bg-neutral-800/40 border border-neutral-800/60 text-neutral-500'
                              }`}
                            >{moodConfig[m].emoji} {m}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Effort (Points)</label>
                        <div className="flex gap-2">
                          {EFFORT_VALUES.map((effort) => (
                            <button
                              key={effort}
                              type="button"
                              onClick={() => setNewTodo({ ...newTodo, effort })}
                              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                                Number(newTodo.effort) === effort
                                  ? 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-200'
                                  : 'bg-neutral-800/40 border border-neutral-800/60 text-neutral-500 hover:text-neutral-300'
                              }`}
                            >
                              {effort}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Due Date & Time</label>
                        <div className="flex gap-2">
                          <input type="date" value={newTodo.dueDate} onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                            className="flex-1 px-3 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-300 focus:outline-none"
                          />
                          <input type="time" value={newTodo.dueTime} onChange={(e) => setNewTodo({ ...newTodo, dueTime: e.target.value })}
                            className="w-28 px-3 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-300 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Tags <span className="text-neutral-600">(comma separated)</span></label>
                        <input type="text" value={newTodo.tags} onChange={(e) => setNewTodo({ ...newTodo, tags: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none"
                          placeholder="deep-work, writing, sprint"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Subtasks <span className="text-neutral-600">(one per line)</span></label>
                        <textarea value={newTodo.subtasks} onChange={(e) => setNewTodo({ ...newTodo, subtasks: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none resize-none"
                          placeholder={"Research topic\nWrite draft\nReview & submit"} rows={3}
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-xl font-semibold text-sm transition-all">
                      Add Task
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task List */}
                <div className="lg:col-span-2 space-y-3">
                  {filteredTodos.length === 0 ? (
                    <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-2xl p-10 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 bg-neutral-800/60 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </div>
                      <h3 className="text-neutral-300 font-semibold mb-1">No tasks found</h3>
                      <p className="text-neutral-600 text-sm">Create a new task to get started</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredTodos.map((todo, idx) => {
                        const pc = priorityConfig[todo.priority];
                        const mc2 = moodConfig[todo.mood] || moodConfig.Calm;
                        const status = statusConfig[todo.status || 'backlog'] || statusConfig.backlog;
                        const subtasksDone = todo.subtasks?.filter(s => s.done).length || 0;
                        const subtasksTotal = todo.subtasks?.length || 0;
                        const due = formatDueDate(todo.dueDate);
                        const overdue = !todo.completed && isOverdue(todo.dueDate);

                        return (
                          <motion.div key={todo.id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setSelectedTodo(todo)}
                            className={`bg-neutral-900/40 border rounded-xl p-4 cursor-pointer transition-all hover:bg-neutral-800/40 group ${
                              selectedTodo?.id === todo.id ? 'border-indigo-500/40 bg-neutral-800/30' : 'border-neutral-800/60'
                            } ${todo.completed ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <button onClick={(e) => { e.stopPropagation(); toggleComplete(todo.id); }}
                                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  todo.completed ? 'bg-emerald-500/80 border-emerald-500/80' : 'border-neutral-600 hover:border-indigo-400 group-hover:border-neutral-500'
                                }`}
                              >
                                {todo.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className={`text-sm font-semibold ${todo.completed ? 'line-through text-neutral-600' : 'text-neutral-100'}`}>
                                    {todo.title}
                                  </h4>
                                  <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-600 hover:text-rose-400 transition-all"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>

                                {todo.description && (
                                  <p className={`text-xs mb-2 ${todo.completed ? 'line-through text-neutral-700' : 'text-neutral-500'}`}>
                                    {todo.description}
                                  </p>
                                )}

                                {subtasksTotal > 0 && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden max-w-[120px]">
                                      <div className="h-full bg-indigo-500/70 rounded-full transition-all" style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] text-neutral-600">{subtasksDone}/{subtasksTotal}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${pc.bg} ${pc.border} border ${pc.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} /> {pc.label}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${mc2.bg} ${mc2.border} border ${mc2.text}`}>
                                    {mc2.emoji} {todo.mood}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${status.bg} ${status.border} ${status.tone}`}>
                                    {status.label}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-800/50 border border-neutral-800/60 text-neutral-400">
                                    Effort {todo.effort || 2}
                                  </span>
                                  {todo.tags?.slice(0, 2).map((tag) => (
                                    <span key={`${todo.id}-${tag}`} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-800/40 border border-neutral-800/50 text-neutral-500">
                                      #{tag}
                                    </span>
                                  ))}
                                  {due && (
                                    <span className={`text-[10px] font-medium ${overdue ? 'text-rose-400' : 'text-neutral-500'}`}>
                                      {overdue && '⚠ '}{due}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Detail / Music Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-5 sticky top-20">
                    {selectedTodo ? (
                      <SelectedTodoPanel
                        todo={selectedTodo}
                        toggleSubtask={toggleSubtask}
                        updateNote={updateNote}
                        navigate={navigate}
                        moveTaskStatus={moveTaskStatus}
                      />
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-12 h-12 mx-auto mb-3 bg-neutral-800/50 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        </div>
                        <h4 className="text-neutral-400 font-medium text-sm mb-1">Select a Task</h4>
                        <p className="text-neutral-600 text-xs">See subtasks, notes, workflow controls, and mood music</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {STATUS_FLOW.map((statusKey) => {
                  const column = boardBuckets[statusKey] || [];
                  const style = statusConfig[statusKey] || statusConfig.backlog;

                  return (
                    <div key={statusKey} className={`rounded-2xl border p-3 ${style.bg} ${style.border}`}>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${style.tone}`}>{style.label}</h3>
                        <span className="text-[11px] text-neutral-400">{column.length}</span>
                      </div>

                      <div className="space-y-2 min-h-[180px]">
                        {column.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-neutral-700/60 px-3 py-5 text-center text-[11px] text-neutral-500">
                            No tasks
                          </div>
                        ) : (
                          column.map((task) => {
                            const priority = priorityConfig[task.priority] || priorityConfig.medium;
                            return (
                              <div key={task.id} className="rounded-xl border border-neutral-800/70 bg-neutral-950/70 p-3">
                                <p className="text-sm font-semibold text-neutral-100 truncate">{task.title}</p>
                                <p className="text-[11px] text-neutral-500 mt-0.5">Effort {task.effort || 2} • {priority.label}</p>

                                <div className="mt-2 flex items-center gap-1.5">
                                  <button
                                    onClick={() => moveTaskStatus(task.id, -1)}
                                    disabled={statusKey === 'backlog'}
                                    className="flex-1 rounded-lg border border-neutral-700/70 px-2 py-1 text-[11px] text-neutral-400 disabled:opacity-30 hover:text-neutral-200"
                                  >
                                    ←
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedTodo(task);
                                      setViewMode('list');
                                    }}
                                    className="flex-[1.4] rounded-lg border border-neutral-700/70 px-2 py-1 text-[11px] text-neutral-300 hover:text-white"
                                  >
                                    Open
                                  </button>
                                  <button
                                    onClick={() => moveTaskStatus(task.id, 1)}
                                    disabled={statusKey === 'done'}
                                    className="flex-1 rounded-lg border border-neutral-700/70 px-2 py-1 text-[11px] text-neutral-400 disabled:opacity-30 hover:text-neutral-200"
                                  >
                                    →
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB: HABITS
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'habits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-200">Daily Habits</h2>
                <p className="text-xs text-neutral-500">Build consistency with mood-aligned habits</p>
              </div>
              <button onClick={() => setShowHabitForm(!showHabitForm)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  showHabitForm ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-700 text-neutral-100 hover:bg-neutral-600'
                }`}
              >{showHabitForm ? 'Cancel' : '+ New Habit'}</button>
            </div>

            <AnimatePresence>
              {showHabitForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  onSubmit={addHabit} className="overflow-hidden mb-6"
                >
                  <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
                    <div>
                      <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Habit Name *</label>
                      <input type="text" required value={newHabit.title} onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                        placeholder="e.g. Morning meditation, 30 min walk..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Frequency</label>
                        <select value={newHabit.frequency} onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                          className="w-full px-3 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-300 focus:outline-none"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Mood</label>
                        <select value={newHabit.mood} onChange={(e) => setNewHabit({ ...newHabit, mood: e.target.value })}
                          className="w-full px-3 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-300 focus:outline-none"
                        >
                          {MOODS.map(m => <option key={m} value={m}>{moodConfig[m].emoji} {m}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-xl font-semibold text-sm transition-all">
                      Add Habit
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {habits.length === 0 ? (
              <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-neutral-800/60 rounded-xl flex items-center justify-center text-2xl">🔄</div>
                <h3 className="text-neutral-300 font-semibold mb-1">No habits yet</h3>
                <p className="text-neutral-600 text-sm">Create a daily habit to build consistency</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.map((h, idx) => {
                  const done = isHabitDoneToday(h);
                  const hm = moodConfig[h.mood] || moodConfig.Calm;
                  return (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className={`bg-neutral-900/40 border rounded-xl p-4 transition-all ${done ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-neutral-800/60'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{hm.emoji}</span>
                          <h4 className="text-sm font-semibold text-neutral-200">{h.title}</h4>
                        </div>
                        <button onClick={() => deleteHabit(h.id)} className="text-neutral-700 hover:text-rose-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-500 uppercase font-semibold">{h.frequency}</span>
                          <span className="text-[10px] text-amber-400 font-semibold">🔥 {h.streak} streak</span>
                        </div>
                        <button onClick={() => completeHabit(h.id)} disabled={done}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            done ? 'bg-emerald-500/15 text-emerald-400 cursor-default' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          {done ? '✓ Done' : 'Complete'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB: FOCUS TIMER
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'focus' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto">
            <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-8 text-center">
              {/* Session counter */}
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-6">
                {focusSessions} sessions completed
              </p>

              {!focusActive && !focusCompleted ? (
                /* Setup */
                <>
                  <h2 className="text-xl font-semibold text-neutral-200 mb-6">Focus Session</h2>
                  <div className="mb-6">
                    <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">Duration (minutes)</p>
                    <div className="flex justify-center gap-2">
                      {[15, 25, 45, 60].map(m => (
                        <button key={m} onClick={() => setFocusMinutes(m)}
                          className={`w-14 py-2 rounded-lg text-sm font-medium transition-all ${
                            focusMinutes === m ? 'bg-neutral-700 text-neutral-100 shadow' : 'bg-neutral-800/50 text-neutral-500 hover:text-neutral-300'
                          }`}
                        >{m}</button>
                      ))}
                    </div>
                  </div>

                  {/* Mood-based music suggestion */}
                  <div className={`${mc.bg} border ${mc.border} rounded-xl px-4 py-3 mb-6 text-left`}>
                    <p className={`text-[10px] ${mc.text} font-semibold uppercase tracking-wider mb-1`}>Suggested Focus Music ({detectedMood})</p>
                    <div className="space-y-1.5">
                      {(songBucket[detectedMood] || songBucket.Calm).map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                          <span className="text-[10px]">▶</span> {s.title}
                        </a>
                      ))}
                    </div>
                  </div>

                  <button onClick={startFocus} className="w-full py-3.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-xl font-semibold text-sm transition-all">
                    Start Focusing
                  </button>
                </>
              ) : focusCompleted ? (
                /* Complete */
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto mb-4 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-neutral-100 mb-1">Focus Complete!</h3>
                  <p className="text-neutral-500 text-sm mb-6">{focusMinutes} minutes of deep work — well done.</p>
                  <div className="flex gap-3">
                    <button onClick={() => { resetFocus(); navigate('/music'); }} className="flex-1 py-2.5 bg-neutral-800/60 hover:bg-neutral-800 rounded-xl text-sm font-medium text-neutral-300 transition-all">
                      🎵 Listen to Music
                    </button>
                    <button onClick={resetFocus} className="flex-1 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-xl text-sm font-semibold transition-all">
                      New Session
                    </button>
                  </div>
                </>
              ) : (
                /* Active timer */
                <>
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.04)" strokeWidth="6" fill="none" />
                      <motion.circle cx="96" cy="96" r="88"
                        stroke={focusPaused ? '#6b7280' : '#818cf8'}
                        strokeWidth="6" fill="none"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeLinecap="round"
                        animate={{ strokeDashoffset: 2 * Math.PI * 88 * (focusTimeLeft / (focusMinutes * 60)) }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-mono font-light text-neutral-100 tracking-wider">{formatTime(focusTimeLeft)}</span>
                      <span className={`text-[10px] uppercase tracking-widest font-semibold mt-1 ${focusPaused ? 'text-neutral-500' : 'text-indigo-400'}`}>
                        {focusPaused ? 'Paused' : 'Focusing'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={pauseFocus} className="px-6 py-2.5 bg-neutral-800/60 hover:bg-neutral-700/60 border border-neutral-700/50 rounded-xl text-sm font-medium text-neutral-300 transition-all">
                      {focusPaused ? '▶ Resume' : '⏸ Pause'}
                    </button>
                    <button onClick={resetFocus} className="px-6 py-2.5 bg-neutral-800/30 hover:bg-neutral-800/50 border border-neutral-800/50 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-400 transition-all">
                      Stop
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => navigate('/music')} className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-4 text-left hover:bg-neutral-800/40 transition-all group">
                <span className="text-lg mb-1 block">🎵</span>
                <h4 className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">Music Page</h4>
                <p className="text-[11px] text-neutral-600">Listen while you work</p>
              </button>
              <button onClick={() => navigate('/mood-detect')} className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-4 text-left hover:bg-neutral-800/40 transition-all group">
                <span className="text-lg mb-1 block">🔍</span>
                <h4 className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">Detect Mood</h4>
                <p className="text-[11px] text-neutral-600">Update current state</p>
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </AppShell>
  );
};

// ═════════════════════════════════════════════════════════════
//  SELECTED TODO PANEL
// ═════════════════════════════════════════════════════════════
function SelectedTodoPanel({ todo, toggleSubtask, updateNote, navigate, moveTaskStatus }) {
  const [note, setNote] = useState(todo.notes || '');
  const mc = moodConfig[todo.mood] || moodConfig.Calm;
  const songs = todo.songs || songBucket[todo.mood] || [];
  const status = statusConfig[todo.status || 'backlog'] || statusConfig.backlog;
  const statusIndex = STATUS_FLOW.indexOf(todo.status || 'backlog');

  useEffect(() => { setNote(todo.notes || ''); }, [todo.id, todo.notes]);

  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${mc.dot}`} />
          <span className={`text-[10px] font-semibold ${mc.text} uppercase tracking-wider`}>{todo.mood} Mode</span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${status.bg} ${status.border} ${status.tone}`}>
            {status.label}
          </span>
        </div>
        <h3 className="text-base font-semibold text-neutral-100 mb-1">{todo.title}</h3>
        {todo.description && <p className="text-xs text-neutral-500">{todo.description}</p>}
        {todo.dueDate && (
          <p className={`text-[11px] mt-1.5 ${isOverdue(todo.dueDate) ? 'text-rose-400' : 'text-neutral-500'}`}>
            Due: {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(todo.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        <p className="text-[11px] text-neutral-500 mt-1">Effort {todo.effort || 2}</p>
        {!!todo.tags?.length && (
          <div className="flex flex-wrap gap-1 mt-2">
            {todo.tags.map((tag) => (
              <span key={`${todo.id}-${tag}`} className="text-[10px] px-2 py-0.5 rounded-md border border-neutral-700/60 bg-neutral-800/50 text-neutral-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Workflow controls */}
      <div className="mb-4">
        <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">Workflow</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => moveTaskStatus?.(todo.id, -1)}
            disabled={statusIndex <= 0}
            className="flex-1 px-2.5 py-2 rounded-lg border border-neutral-700/70 text-xs text-neutral-300 disabled:opacity-40"
          >
            Move Left
          </button>
          <button
            onClick={() => moveTaskStatus?.(todo.id, 1)}
            disabled={statusIndex >= STATUS_FLOW.length - 1}
            className="flex-1 px-2.5 py-2 rounded-lg border border-neutral-700/70 text-xs text-neutral-300 disabled:opacity-40"
          >
            Move Right
          </button>
        </div>
      </div>

      {/* Subtasks */}
      {todo.subtasks?.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">
            Subtasks ({todo.subtasks.filter(s => s.done).length}/{todo.subtasks.length})
          </p>
          <div className="space-y-1.5">
            {todo.subtasks.map(sub => (
              <button key={sub.id} onClick={() => toggleSubtask(todo.id, sub.id)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-800/30 hover:bg-neutral-800/50 rounded-lg transition-all text-left"
              >
                <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                  sub.done ? 'bg-emerald-500/70 border-emerald-500/70' : 'border-neutral-600'
                }`}>
                  {sub.done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
                <span className={`text-xs ${sub.done ? 'line-through text-neutral-600' : 'text-neutral-300'}`}>{sub.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-4">
        <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">Quick Notes</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          onBlur={() => updateNote(todo.id, note)}
          className="w-full px-3 py-2 bg-neutral-800/30 border border-neutral-800/50 rounded-lg text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
          placeholder="Add notes for this task..." rows={3}
        />
      </div>

      {/* Music Recommendations */}
      <div>
        <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">
          {todo.mood} Music
        </p>
        <div className="space-y-1.5">
          {songs.map((song, i) => (
            <a key={i} href={song.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 bg-neutral-800/30 hover:bg-neutral-800/50 rounded-lg transition-all group"
            >
              <div className={`w-7 h-7 rounded-md ${mc.bg} flex items-center justify-center flex-shrink-0`}>
                <svg className={`w-3 h-3 ${mc.text}`} fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
              </div>
              <span className="text-xs text-neutral-400 group-hover:text-neutral-200 truncate transition-colors">{song.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Go to music */}
      <button onClick={() => navigate('/music')} className="w-full mt-4 py-2 bg-neutral-800/40 hover:bg-neutral-800/60 border border-neutral-800/50 rounded-lg text-[11px] font-medium text-neutral-500 hover:text-neutral-300 transition-all">
        🎵 Open Music Page
      </button>
    </>
  );
}

export default TodoPlanner;

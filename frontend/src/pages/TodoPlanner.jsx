import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import OptionsMenu from '../components/OptionsMenu';

const TodoPlanner = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    mood: 'Calm'
  });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedTodo, setSelectedTodo] = useState(null);

  // Load todos from localStorage on mount
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem('echona_todos');
      if (savedTodos) {
        const parsed = JSON.parse(savedTodos);
        if (Array.isArray(parsed)) setTodos(parsed);
      }
    } catch (err) {
      console.error('Failed to load saved todos:', err);
      localStorage.removeItem('echona_todos');
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('echona_todos', JSON.stringify(todos));
  }, [todos]);

  // Song bucket for each mood
  const songBucket = {
    Happy: [
      { title: "Happy - Pharrell Williams", url: "https://www.youtube.com/watch?v=ZbZSe6N_BXs" },
      { title: "Walking on Sunshine", url: "https://www.youtube.com/watch?v=iPUmE-tne5U" },
      { title: "Good Vibrations", url: "https://www.youtube.com/watch?v=Eab_beh07HU" }
    ],
    Calm: [
      { title: "Weightless - Marconi Union", url: "https://www.youtube.com/watch?v=UfcAVejslrU" },
      { title: "Clair de Lune", url: "https://www.youtube.com/watch?v=CvFH_6DNRCY" },
      { title: "Aqueous Transmission", url: "https://www.youtube.com/watch?v=3k0-sGqxIiQ" }
    ],
    Excited: [
      { title: "Eye of the Tiger", url: "https://www.youtube.com/watch?v=btPJPFnesV4" },
      { title: "Uptown Funk", url: "https://www.youtube.com/watch?v=OPf0YbXqDm0" },
      { title: "Can't Stop the Feeling", url: "https://www.youtube.com/watch?v=ru0K8uYEZWw" }
    ],
    Sad: [
      { title: "Someone Like You", url: "https://www.youtube.com/watch?v=hLQl3WQQoQ0" },
      { title: "Fix You - Coldplay", url: "https://www.youtube.com/watch?v=k4V3Mo61fJM" },
      { title: "The Night We Met", url: "https://www.youtube.com/watch?v=KIkrHlAHKO4" }
    ],
    Angry: [
      { title: "Lose Yourself - Eminem", url: "https://www.youtube.com/watch?v=_Yhyp-_hX2s" },
      { title: "In the End", url: "https://www.youtube.com/watch?v=eVTXPUF4Oz4" },
      { title: "Break Stuff", url: "https://www.youtube.com/watch?v=ZpUYjpKg9KY" }
    ],
    Anxious: [
      { title: "Breathe Me - Sia", url: "https://www.youtube.com/watch?v=SFGvmrJ5rjM" },
      { title: "Mad World", url: "https://www.youtube.com/watch?v=4N3N1MlvVc4" },
      { title: "Skinny Love", url: "https://www.youtube.com/watch?v=ssdgFoHLwnk" }
    ]
  };

  const priorityColors = {
    high: 'from-rose-500 to-red-500',
    medium: 'from-amber-500 to-orange-500',
    low: 'from-teal-500 to-emerald-500'
  };

  const moodColors = {
    Happy: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    Calm: 'bg-gradient-to-br from-teal-400 to-cyan-500',
    Excited: 'bg-gradient-to-br from-orange-400 to-rose-500',
    Sad: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    Angry: 'bg-gradient-to-br from-red-500 to-rose-600',
    Anxious: 'bg-gradient-to-br from-purple-400 to-pink-500'
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.title.trim()) {
      const todo = {
        id: Date.now(),
        ...newTodo,
        completed: false,
        createdAt: new Date().toISOString(),
        songs: songBucket[newTodo.mood] || []
      };
      setTodos([todo, ...todos]);
      setNewTodo({ title: '', description: '', priority: 'medium', mood: 'Calm' });
      setShowForm(false);
    }
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    if (selectedTodo?.id === id) {
      setSelectedTodo(null);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  return (
    <AppShell>
      
      <div className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header with Back Button and Options Menu */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full text-sm text-slate-200 transition-all group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <OptionsMenu currentPage="/todo-planner" />
          </motion.div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-full mb-4">
            <span className="text-violet-200 font-bold text-sm tracking-wider">PLANNER</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Todo Planner
          </h1>
          <p className="text-neutral-400 text-lg">Organize your tasks with mood-based music</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium mb-1">Total Tasks</p>
                <p className="text-4xl font-bold text-neutral-100">{stats.total}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/50">
                <span className="text-white font-bold text-lg">ALL</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium mb-1">Active</p>
                <p className="text-4xl font-bold text-violet-400">{stats.active}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/50">
                <span className="text-white font-bold text-lg">NOW</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium mb-1">Completed</p>
                <p className="text-4xl font-bold text-emerald-400">{stats.completed}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <span className="text-white font-bold text-lg">DONE</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-900/40'
                    : 'bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/60'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'active'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40'
                    : 'bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/60'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                    : 'bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/60'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 ${
                  showForm 
                  ? 'bg-neutral-700 text-white' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40'
              }`}
            >
              {showForm ? 'CANCEL' : '+ NEW TASK'}
            </button>
          </div>
        </div>

        {/* Add Todo Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-8 mb-8"
            >
              <form onSubmit={handleAddTodo} className="space-y-6">
                <div>
                  <label className="block text-neutral-200 font-semibold mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    className="input"
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-200 font-semibold mb-2">Description</label>
                  <textarea
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    className="input"
                    placeholder="Add details..."
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-200 font-semibold mb-2">Priority</label>
                    <select
                      value={newTodo.priority}
                      onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                      className="input"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-200 font-semibold mb-2">Mood / Music Theme</label>
                    <select
                      value={newTodo.mood}
                      onChange={(e) => setNewTodo({ ...newTodo, mood: e.target.value })}
                      className="input"
                    >
                      <option value="Calm">Calm</option>
                      <option value="Happy">Happy</option>
                      <option value="Excited">Excited</option>
                      <option value="Sad">Sad</option>
                      <option value="Angry">Angry</option>
                      <option value="Anxious">Anxious</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-lg font-bold"
                >
                  ADD TASK
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Todo List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Todo Items */}
          <div className="lg:col-span-2 space-y-4">
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">START</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-100 mb-2">No tasks yet</h3>
                <p className="text-neutral-400">Click "NEW TASK" to get started</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card p-6 hover:shadow-glow transition-all cursor-pointer ${
                      selectedTodo?.id === todo.id ? 'ring-4 ring-amber-500' : ''
                    }`}
                    onClick={() => setSelectedTodo(todo)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(todo.id);
                        }}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                          todo.completed
                            ? 'bg-gradient-to-br from-teal-500 to-emerald-500 border-teal-500'
                            : 'border-neutral-500 hover:border-amber-500'
                        }`}
                      >
                        {todo.completed && (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`text-lg font-bold ${todo.completed ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>
                            {todo.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTodo(todo.id);
                            }}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            DELETE
                          </button>
                        </div>

                        {todo.description && (
                          <p className={`text-sm mb-3 ${todo.completed ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                            {todo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Priority Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${priorityColors[todo.priority]}`}>
                            {todo.priority.toUpperCase()}
                          </span>

                          {/* Mood Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${moodColors[todo.mood]}`}>
                            {todo.mood.toUpperCase()}
                          </span>

                          {/* Date */}
                          <span className="text-xs text-neutral-500">
                            {new Date(todo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Right: Song Bucket */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {selectedTodo ? (
                <>
                  <div className="mb-6">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-3">
                      <span className="text-white font-bold text-xs tracking-wider">MUSIC BUCKET</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-100 mb-2">{selectedTodo.title}</h3>
                    <p className="text-sm text-neutral-400 mb-4">
                      Recommended {selectedTodo.mood} songs for this task
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedTodo.songs.map((song, index) => (
                      <motion.a
                        key={index}
                        href={song.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="block p-4 bg-neutral-800/60 rounded-xl hover:bg-neutral-700/60 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-100 truncate">{song.title}</p>
                            <p className="text-xs text-neutral-400">Click to play</p>
                          </div>
                          <svg className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">MUSIC</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-100 mb-2">Select a Task</h3>
                  <p className="text-sm text-neutral-400">Click on any task to see mood-based music recommendations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default TodoPlanner;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const TodoPlanner = () => {
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
    const savedTodos = localStorage.getItem('echona_todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('echona_todos', JSON.stringify(todos));
    }
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-teal-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full mb-4">
            <span className="text-white font-bold text-sm tracking-wider">PLANNER</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Todo Planner
          </h1>
          <p className="text-gray-600 text-lg">Organize your tasks with mood-based music</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Tasks</p>
                <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">ALL</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Active</p>
                <p className="text-4xl font-bold text-teal-600">{stats.active}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">NOW</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Completed</p>
                <p className="text-4xl font-bold text-rose-600">{stats.completed}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DONE</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'active'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
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
              className="bg-white rounded-2xl p-8 shadow-lg mb-8"
            >
              <form onSubmit={handleAddTodo} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="Add details..."
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Priority</label>
                    <select
                      value={newTodo.priority}
                      onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Mood / Music Theme</label>
                    <select
                      value={newTodo.mood}
                      onChange={(e) => setNewTodo({ ...newTodo, mood: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
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
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
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
                className="bg-white rounded-2xl p-12 shadow-lg text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">START</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No tasks yet</h3>
                <p className="text-gray-600">Click "NEW TASK" to get started</p>
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
                    className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
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
                            : 'border-gray-300 hover:border-amber-500'
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
                          <h3 className={`text-lg font-bold ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
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
                          <p className={`text-sm mb-3 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
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
                          <span className="text-xs text-gray-500">
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
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              {selectedTodo ? (
                <>
                  <div className="mb-6">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-3">
                      <span className="text-white font-bold text-xs tracking-wider">MUSIC BUCKET</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedTodo.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
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
                        className="block p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-amber-50 hover:to-orange-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{song.title}</p>
                            <p className="text-xs text-gray-500">Click to play</p>
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
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Select a Task</h3>
                  <p className="text-sm text-gray-600">Click on any task to see mood-based music recommendations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPlanner;

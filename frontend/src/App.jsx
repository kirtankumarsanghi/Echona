import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import { DashboardSkeleton, MusicSkeleton } from "./components/Skeletons";

// Lazy-loaded pages (#19 Code Splitting)
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MoodDetect = lazy(() => import("./pages/MoodDetect"));
const Music = lazy(() => import("./pages/Music"));
const TodoPlanner = lazy(() => import("./pages/TodoPlanner"));
const Callback = lazy(() => import("./pages/Callback"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Protection
import ProtectedRoute from "./components/ProtectedRoute";

// Page transition wrapper (#12)
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// Minimal loader for lazy pages
function PageLoader({ skeleton }) {
  return skeleton || (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}>
            <RouteErrorBoundary name="Home">
              <PageTransition><Home /></PageTransition>
            </RouteErrorBoundary>
          </Suspense>
        } />
        <Route path="/auth" element={
          <Suspense fallback={<PageLoader />}>
            <RouteErrorBoundary name="Auth">
              <PageTransition><Auth /></PageTransition>
            </RouteErrorBoundary>
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<PageLoader />}>
            <RouteErrorBoundary name="Login">
              <PageTransition><Auth /></PageTransition>
            </RouteErrorBoundary>
          </Suspense>
        } />
        <Route path="/callback" element={
          <Suspense fallback={<PageLoader />}>
            <Callback />
          </Suspense>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader skeleton={<DashboardSkeleton />} />}>
              <RouteErrorBoundary name="Dashboard">
                <PageTransition><Dashboard /></PageTransition>
              </RouteErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/mood-detect" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <RouteErrorBoundary name="MoodDetect">
                <PageTransition><MoodDetect /></PageTransition>
              </RouteErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/music" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader skeleton={<MusicSkeleton />} />}>
              <RouteErrorBoundary name="Music">
                <PageTransition><Music /></PageTransition>
              </RouteErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/todo" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <RouteErrorBoundary name="TodoPlanner">
                <PageTransition><TodoPlanner /></PageTransition>
              </RouteErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/todo-planner" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <RouteErrorBoundary name="TodoPlanner">
                <PageTransition><TodoPlanner /></PageTransition>
              </RouteErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        } />

        {/* 404 Fallback (#5) */}
        <Route path="*" element={
          <Suspense fallback={<PageLoader />}>
            <PageTransition><NotFound /></PageTransition>
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default App;

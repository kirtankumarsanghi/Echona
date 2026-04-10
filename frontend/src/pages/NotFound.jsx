import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="app-typography-refresh min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-indigo-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-lg"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <span className="text-[120px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 leading-none">
            404
          </span>
        </motion.div>

        <h1 className="workspace-title mb-4">Page Not Found</h1>
        <p className="workspace-subtitle text-neutral-400 text-lg mb-8 leading-relaxed mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="btn-primary px-8 py-3 rounded-full text-lg"
          >
            Go Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="btn-secondary px-8 py-3 rounded-full text-lg"
          >
            Go Back
          </motion.button>
        </div>

        <p className="text-neutral-600 text-sm mt-12">ECHONA &bull; Mental Wellness Platform</p>
      </motion.div>
    </div>
  );
}

export default NotFound;

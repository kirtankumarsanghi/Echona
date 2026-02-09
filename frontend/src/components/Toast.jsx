import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "from-green-500 to-emerald-600" : 
                  type === "error" ? "from-red-500 to-pink-600" : 
                  "from-blue-500 to-cyan-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r ${bgColor} text-white font-semibold flex items-center gap-3 max-w-md`}
    >
      <span className="text-2xl">
        {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}
      </span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-xl">
        ×
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <AnimatePresence>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${index * 80 + 16}px` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </AnimatePresence>
  );

  return { showToast, ToastContainer };
};

export default Toast;

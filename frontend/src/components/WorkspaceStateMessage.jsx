import { motion } from "framer-motion";

function WorkspaceStateMessage({
  variant = "info",
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) {
  const variantStyles = {
    info: "border-sky-500/25 bg-sky-500/10 text-sky-200",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-200",
    error: "border-rose-500/25 bg-rose-500/10 text-rose-200",
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 sm:p-5 ${style}`}
    >
      <h3 className={`${compact ? "text-sm" : "text-base"} font-semibold`}>{title}</h3>
      <p className={`${compact ? "text-xs" : "text-sm"} opacity-90 mt-1`}>{description}</p>
      {actionLabel && typeof onAction === "function" && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 px-3.5 py-2 rounded-lg border border-white/20 bg-black/20 hover:bg-black/30 text-xs sm:text-sm font-semibold transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

export default WorkspaceStateMessage;

import { motion } from "framer-motion";

function ExperienceGuideStrip({
  eyebrow = "Guided Experience",
  title,
  description,
  steps = [],
  actions = [],
  tone = "indigo",
}) {
  const toneClass =
    tone === "emerald"
      ? "from-emerald-500/15 via-teal-500/10 to-sky-500/10"
      : tone === "sky"
        ? "from-sky-500/15 via-indigo-500/10 to-cyan-500/10"
        : "from-indigo-500/15 via-sky-500/10 to-emerald-500/10";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-900/65 backdrop-blur-sm p-4 sm:p-5"
    >
      <div className={`rounded-xl border border-slate-700/60 bg-gradient-to-r p-4 sm:p-5 ${toneClass}`}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">{eyebrow}</p>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-1">{title}</h2>
        <p className="text-sm text-slate-300 mb-4 max-w-3xl">{description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
          {steps.slice(0, 3).map((step, index) => (
            <div key={`${step}-${index}`} className="rounded-lg border border-slate-700/70 bg-slate-950/55 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Step {index + 1}</p>
              <p className="text-xs sm:text-sm text-slate-200">{step}</p>
            </div>
          ))}
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  action.variant === "primary"
                    ? "bg-slate-200 hover:bg-slate-100 text-slate-900 border border-slate-300/70"
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default ExperienceGuideStrip;

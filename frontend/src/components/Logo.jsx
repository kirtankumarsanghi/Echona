import React from "react";

const Logo = ({ size = "default", showText = true, className = "" }) => {
  const sizes = {
    small: { container: "w-8 h-8", text: "text-sm", subtext: "text-[8px]" },
    default: { container: "w-10 h-10", text: "text-xl", subtext: "text-[10px]" },
    large: { container: "w-16 h-16", text: "text-3xl", subtext: "text-xs" }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${currentSize.container} flex-shrink-0`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 blur-md" />

        <div className="absolute inset-0 rounded-2xl border border-sky-300/20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 shadow-lg shadow-sky-500/20 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="14" stroke="rgba(125,211,252,0.55)" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="9" stroke="rgba(125,211,252,0.35)" strokeWidth="1.5" />

            <path
              d="M12 20c2.4-3.2 4.4-4.8 6.2-4.8 2 0 3 1.3 4.4 3.3 1 1.4 2 2.7 3.8 2.7"
              stroke="rgba(186,230,253,0.95)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <rect x="9" y="26" width="3" height="6" rx="1.5" fill="rgba(186,230,253,0.9)" />
            <rect x="14" y="24" width="3" height="8" rx="1.5" fill="rgba(186,230,253,0.9)" />
            <rect x="19" y="22" width="3" height="10" rx="1.5" fill="rgba(186,230,253,0.9)" />
            <rect x="24" y="24" width="3" height="8" rx="1.5" fill="rgba(186,230,253,0.9)" />
            <rect x="29" y="26" width="3" height="6" rx="1.5" fill="rgba(186,230,253,0.9)" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-wide text-neutral-100 leading-none ${currentSize.text}`}>
            ECHONA
          </span>
          <span className={`text-neutral-500 tracking-wider uppercase font-medium leading-none mt-0.5 ${currentSize.subtext}`}>
            Wellness Intelligence
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

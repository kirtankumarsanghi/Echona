import React from "react";

/**
 * ECHONA Logo Component
 * Unique design featuring concentric circles with a sound wave pattern
 * representing the fusion of mental wellness and music therapy
 */
const Logo = ({ size = "default", showText = true, className = "" }) => {
  const sizes = {
    small: { container: "w-8 h-8", text: "text-sm", subtext: "text-[8px]" },
    default: { container: "w-10 h-10", text: "text-xl", subtext: "text-[10px]" },
    large: { container: "w-16 h-16", text: "text-3xl", subtext: "text-xs" }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`relative ${currentSize.container} flex-shrink-0`}>
        {/* Outer glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl blur-md" />
        
        {/* Main container */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-2xl shadow-lg shadow-indigo-500/30 overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
          
          {/* Sound wave pattern */}
          <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 40 40" fill="none">
            {/* Center circle */}
            <circle cx="20" cy="20" r="3" fill="white" opacity="0.9" />
            
            {/* Concentric circles */}
            <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="1.5" opacity="0.6" fill="none" />
            <circle cx="20" cy="20" r="13" stroke="white" strokeWidth="1.5" opacity="0.4" fill="none" />
            
            {/* Sound wave bars */}
            <g opacity="0.8">
              <rect x="10" y="15" width="1.5" height="10" rx="0.75" fill="white" />
              <rect x="14" y="12" width="1.5" height="16" rx="0.75" fill="white" />
              <rect x="18" y="8" width="1.5" height="24" rx="0.75" fill="white" />
              <rect x="22" y="8" width="1.5" height="24" rx="0.75" fill="white" />
              <rect x="26" y="12" width="1.5" height="16" rx="0.75" fill="white" />
              <rect x="30" y="15" width="1.5" height="10" rx="0.75" fill="white" />
            </g>
          </svg>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-wide text-neutral-100 leading-none ${currentSize.text}`}>
            ECHONA
          </span>
          <span className={`text-neutral-500 tracking-wider uppercase font-medium leading-none mt-0.5 ${currentSize.subtext}`}>
            Mental Wellness
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

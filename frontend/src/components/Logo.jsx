import React from "react";

const Logo = ({ size = "default", showText = true, className = "" }) => {
  const sizes = {
    small: {
      icon: "w-9 h-9",
      iconWrap: "p-1.5 rounded-xl",
      banner: "h-11 max-w-[210px]",
      bannerWrap: "px-2 py-1 rounded-xl",
      fallbackText: "text-sm"
    },
    default: {
      icon: "w-12 h-12",
      iconWrap: "p-2 rounded-2xl",
      banner: "h-14 max-w-[280px]",
      bannerWrap: "px-2.5 py-1.5 rounded-2xl",
      fallbackText: "text-base"
    },
    large: {
      icon: "w-20 h-20",
      iconWrap: "p-2.5 rounded-2xl",
      banner: "h-24 max-w-[440px]",
      bannerWrap: "px-3 py-2 rounded-2xl",
      fallbackText: "text-2xl"
    },
  };

  const currentSize = sizes[size] || sizes.default;

  if (showText) {
    return (
      <div className={`flex items-center ${className}`}>
        <div
          className={`${currentSize.bannerWrap} bg-slate-950/75 border border-sky-300/30 backdrop-blur-md shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_14px_36px_rgba(2,6,23,0.55)]`}
        >
          <img
            src="/echona-brand.svg"
            alt="ECHONA Mental Wellness"
            className={`${currentSize.banner} w-auto object-contain drop-shadow-[0_0_18px_rgba(56,189,248,0.24)]`}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`${currentSize.iconWrap} bg-slate-950/75 border border-sky-300/30 backdrop-blur-md shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_10px_28px_rgba(2,6,23,0.55)]`}
      >
        <img
          src="/echona-orb.svg"
          alt="ECHONA"
          className={`${currentSize.icon} object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.3)]`}
          loading="eager"
          decoding="async"
        />
      </div>
      <span className={`sr-only ${currentSize.fallbackText}`}>ECHONA</span>
    </div>
  );
};

export default Logo;

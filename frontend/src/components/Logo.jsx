import React, { useMemo } from "react";

const LOGO_MARKUP = `
<svg class="echona-logo-svg" viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<defs>
  <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#334155" stop-opacity="0"></stop>
    <stop offset="25%" stop-color="#475569"></stop>
    <stop offset="50%" stop-color="#38bdf8"></stop>
    <stop offset="75%" stop-color="#64748b"></stop>
    <stop offset="100%" stop-color="#334155" stop-opacity="0"></stop>
  </linearGradient>
  <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#64748b"></stop>
    <stop offset="100%" stop-color="#0ea5e9"></stop>
  </linearGradient>
  <linearGradient id="gLeft" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" stop-color="#334155" stop-opacity="0.62"></stop>
    <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.62"></stop>
  </linearGradient>
  <linearGradient id="gRight" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" stop-color="#475569" stop-opacity="0.62"></stop>
    <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.62"></stop>
  </linearGradient>
  <radialGradient id="orbFill" cx="50%" cy="40%" r="60%">
    <stop offset="0%" stop-color="#111827"></stop>
    <stop offset="65%" stop-color="#0b1220"></stop>
    <stop offset="100%" stop-color="#020617"></stop>
  </radialGradient>
  <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#0f172a" stop-opacity="0.58"></stop>
    <stop offset="100%" stop-color="#020617" stop-opacity="0"></stop>
  </radialGradient>
  <clipPath id="cp"><rect x="20" y="20" width="520" height="180" rx="20"></rect></clipPath>
  <mask id="fm">
    <rect x="20" y="20" width="520" height="180" fill="white"></rect>
    <rect x="20" y="20" width="100" height="180" fill="url(#fl)"></rect>
    <rect x="440" y="20" width="100" height="180" fill="url(#fr)"></rect>
  </mask>
  <linearGradient id="fl" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="black"></stop>
    <stop offset="100%" stop-color="white"></stop>
  </linearGradient>
  <linearGradient id="fr" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="white"></stop>
    <stop offset="100%" stop-color="black"></stop>
  </linearGradient>
</defs>

<rect x="20" y="20" width="520" height="180" rx="20" fill="url(#bgGlow)" opacity="0.3"></rect>
<rect x="20" y="20" width="520" height="180" rx="20" fill="none" stroke="url(#g1)" stroke-width="0.6" opacity="0.14"></rect>

<g clip-path="url(#cp)" mask="url(#fm)">
  <rect x="36"  y="91"  width="5" height="38" rx="2.5" fill="url(#gLeft)"  style="transform-origin:38px 110px; animation:logoBar 0.70s ease-in-out infinite; --h:0.3;"></rect>
  <rect x="45"  y="81"  width="5" height="58" rx="2.5" fill="url(#gLeft)"  style="transform-origin:47px 110px; animation:logoBar 0.90s ease-in-out 0.10s infinite; --h:0.4;"></rect>
  <rect x="54"  y="71"  width="5" height="78" rx="2.5" fill="url(#gLeft)"  style="transform-origin:56px 110px; animation:logoBar 0.62s ease-in-out 0.20s infinite; --h:0.35;"></rect>
  <rect x="63"  y="86"  width="5" height="48" rx="2.5" fill="url(#gLeft)"  style="transform-origin:65px 110px; animation:logoBar 1.10s ease-in-out 0.05s infinite; --h:0.45;"></rect>
  <rect x="72"  y="76"  width="5" height="68" rx="2.5" fill="url(#gLeft)"  style="transform-origin:74px 110px; animation:logoBar 0.80s ease-in-out 0.30s infinite; --h:0.30;"></rect>
  <rect x="81"  y="66"  width="5" height="88" rx="2.5" fill="url(#gLeft)"  style="transform-origin:83px 110px; animation:logoBar 0.75s ease-in-out 0.15s infinite; --h:0.40;"></rect>
  <rect x="90"  y="81"  width="5" height="58" rx="2.5" fill="url(#gLeft)"  style="transform-origin:92px 110px; animation:logoBar 0.95s ease-in-out 0.25s infinite; --h:0.50;"></rect>
  <rect x="99"  y="91"  width="5" height="38" rx="2.5" fill="url(#gLeft)"  style="transform-origin:101px 110px; animation:logoBar 0.65s ease-in-out 0.10s infinite; --h:0.35;"></rect>
  <rect x="108" y="101" width="5" height="18" rx="2.5" fill="url(#gLeft)"  style="transform-origin:110px 110px; animation:logoBar 1.00s ease-in-out 0.35s infinite; --h:0.55;"></rect>
  <rect x="117" y="96"  width="5" height="28" rx="2.5" fill="url(#gLeft)"  style="transform-origin:119px 110px; animation:logoBar 0.85s ease-in-out 0.20s infinite; --h:0.40;"></rect>
  <rect x="126" y="86"  width="5" height="48" rx="2.5" fill="url(#gLeft)"  style="transform-origin:128px 110px; animation:logoBar 0.72s ease-in-out 0.08s infinite; --h:0.30;"></rect>
  <rect x="135" y="76"  width="5" height="68" rx="2.5" fill="url(#gLeft)"  style="transform-origin:137px 110px; animation:logoBar 0.88s ease-in-out 0.40s infinite; --h:0.45;"></rect>
  <rect x="144" y="81"  width="5" height="58" rx="2.5" fill="url(#gLeft)"  style="transform-origin:146px 110px; animation:logoBar 1.05s ease-in-out 0.18s infinite; --h:0.50;"></rect>
  <rect x="153" y="71"  width="5" height="78" rx="2.5" fill="url(#gLeft)"  style="transform-origin:155px 110px; animation:logoBar 0.68s ease-in-out 0.28s infinite; --h:0.35;"></rect>
  <rect x="162" y="91"  width="5" height="38" rx="2.5" fill="url(#gLeft)"  style="transform-origin:164px 110px; animation:logoBar 0.92s ease-in-out 0.12s infinite; --h:0.42;"></rect>

  <rect x="393" y="81"  width="5" height="58" rx="2.5" fill="url(#gRight)" style="transform-origin:395px 110px; animation:logoBar 0.88s ease-in-out 0.12s infinite; --h:0.35;"></rect>
  <rect x="402" y="71"  width="5" height="78" rx="2.5" fill="url(#gRight)" style="transform-origin:404px 110px; animation:logoBar 0.72s ease-in-out 0.22s infinite; --h:0.45;"></rect>
  <rect x="411" y="86"  width="5" height="48" rx="2.5" fill="url(#gRight)" style="transform-origin:413px 110px; animation:logoBar 1.00s ease-in-out 0.05s infinite; --h:0.30;"></rect>
  <rect x="420" y="76"  width="5" height="68" rx="2.5" fill="url(#gRight)" style="transform-origin:422px 110px; animation:logoBar 0.65s ease-in-out 0.32s infinite; --h:0.50;"></rect>
  <rect x="429" y="91"  width="5" height="38" rx="2.5" fill="url(#gRight)" style="transform-origin:431px 110px; animation:logoBar 0.95s ease-in-out 0.18s infinite; --h:0.40;"></rect>
  <rect x="438" y="66"  width="5" height="88" rx="2.5" fill="url(#gRight)" style="transform-origin:440px 110px; animation:logoBar 0.80s ease-in-out 0.28s infinite; --h:0.35;"></rect>
  <rect x="447" y="76"  width="5" height="68" rx="2.5" fill="url(#gRight)" style="transform-origin:449px 110px; animation:logoBar 1.10s ease-in-out 0.08s infinite; --h:0.45;"></rect>
  <rect x="456" y="81"  width="5" height="58" rx="2.5" fill="url(#gRight)" style="transform-origin:458px 110px; animation:logoBar 0.78s ease-in-out 0.38s infinite; --h:0.30;"></rect>
  <rect x="465" y="91"  width="5" height="38" rx="2.5" fill="url(#gRight)" style="transform-origin:467px 110px; animation:logoBar 0.92s ease-in-out 0.14s infinite; --h:0.55;"></rect>
  <rect x="474" y="86"  width="5" height="48" rx="2.5" fill="url(#gRight)" style="transform-origin:476px 110px; animation:logoBar 0.68s ease-in-out 0.24s infinite; --h:0.40;"></rect>
  <rect x="483" y="96"  width="5" height="28" rx="2.5" fill="url(#gRight)" style="transform-origin:485px 110px; animation:logoBar 1.05s ease-in-out 0.10s infinite; --h:0.35;"></rect>
  <rect x="492" y="101" width="5" height="18" rx="2.5" fill="url(#gRight)" style="transform-origin:494px 110px; animation:logoBar 0.82s ease-in-out 0.30s infinite; --h:0.45;"></rect>
  <rect x="501" y="91"  width="5" height="38" rx="2.5" fill="url(#gRight)" style="transform-origin:503px 110px; animation:logoBar 0.75s ease-in-out 0.04s infinite; --h:0.30;"></rect>
  <rect x="510" y="81"  width="5" height="58" rx="2.5" fill="url(#gRight)" style="transform-origin:512px 110px; animation:logoBar 0.98s ease-in-out 0.16s infinite; --h:0.40;"></rect>
  <rect x="519" y="71"  width="5" height="78" rx="2.5" fill="url(#gRight)" style="transform-origin:521px 110px; animation:logoBar 0.70s ease-in-out 0.36s infinite; --h:0.42;"></rect>
</g>

<circle cx="280" cy="110" r="36" fill="url(#orbFill)"></circle>
<circle cx="280" cy="110" r="36" fill="none" stroke="url(#g2)" stroke-width="1.5" style="transform-origin:280px 110px; animation:logoBreathe 2.5s ease-in-out infinite;"></circle>
<circle cx="280" cy="110" r="50" fill="none" stroke="#475569" stroke-width="0.6" stroke-dasharray="4 6" opacity="0.34" style="transform-origin:280px 110px; animation:logoSpin 18s linear infinite;"></circle>
<circle cx="280" cy="110" r="60" fill="none" stroke="#38bdf8" stroke-width="0.4" stroke-dasharray="2 8" opacity="0.24" style="transform-origin:280px 110px; animation:logoSpinR 24s linear infinite;"></circle>
<circle cx="280" cy="60"  r="3.5" fill="#64748b" style="transform-origin:280px 110px; animation:logoSpin 18s linear infinite;"></circle>
<circle cx="330" cy="110" r="3" fill="#38bdf8" style="transform-origin:280px 110px; animation:logoSpin 18s linear infinite;"></circle>
<circle cx="280" cy="160" r="3.5" fill="#64748b" style="transform-origin:280px 110px; animation:logoSpinR 24s linear infinite;"></circle>
<circle cx="230" cy="110" r="3" fill="#38bdf8" style="transform-origin:280px 110px; animation:logoSpinR 24s linear infinite;"></circle>

<circle cx="280" cy="110" r="36" fill="none" stroke="#38bdf8" stroke-width="0.8" opacity="0">
  <animate attributeName="r" values="36;72" dur="2.2s" repeatCount="indefinite"></animate>
  <animate attributeName="opacity" values="0.32;0" dur="2.2s" repeatCount="indefinite"></animate>
</circle>

<g transform="translate(208,104)">
  <path d="M0,6 C9,-7 18,19 27,6 C36,-7 45,19 54,6 C63,-7 72,19 81,6 C90,-7 99,19 108,6 C117,-7 126,19 135,6 C144,-7 153,19 162,6 C171,-7 180,19 189,6"
    fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.85"
    style="animation:logoWave 2.2s ease-in-out infinite;"></path>
</g>

<text x="280" y="102"
  font-family="Arial Black, Impact, sans-serif"
  font-size="52" font-weight="900"
  fill="white" text-anchor="middle" dominant-baseline="auto"
  letter-spacing="10"
  style="animation:logoTextGlow 2.5s ease-in-out infinite, logoFadeIn 0.6s 0.1s both;">
  ECHONA
</text>

<line x1="175" y1="128" x2="385" y2="128" stroke="url(#g1)" stroke-width="0.6" opacity="0.7"></line>

<text x="280" y="148"
  font-family="Arial, sans-serif"
  font-size="13" font-weight="700"
  fill="#dbeafe" text-anchor="middle" dominant-baseline="auto"
  letter-spacing="2"
  style="animation:logoTagFade 0.8s ease-out 0.35s both; opacity:0; filter:drop-shadow(0 0 5px rgba(56,189,248,0.25));">
  WHERE EMOTIONS ECHO THROUGH MUSIC
</text>

<text x="50" y="50" font-family="serif" font-size="18" fill="#64748b" opacity="0" style="animation:logoNoteDrop 3.5s ease-in-out 0.5s infinite;">♩</text>
<text x="494" y="58" font-family="serif" font-size="14" fill="#38bdf8" opacity="0" style="animation:logoNoteDrop 4.0s ease-in-out 1.2s infinite;">♪</text>
<text x="36" y="168" font-family="serif" font-size="12" fill="#334155" opacity="0" style="animation:logoNoteDrop 3.2s ease-in-out 2.0s infinite;">♫</text>
<text x="508" y="175" font-family="serif" font-size="16" fill="#94a3b8" opacity="0" style="animation:logoNoteDrop 4.5s ease-in-out 0.8s infinite;">♬</text>
</svg>
`;

const SVG_IDS = ["g1", "g2", "gLeft", "gRight", "orbFill", "bgGlow", "cp", "fm", "fl", "fr"];

function buildScopedLogoMarkup(scopeId) {
  let scoped = LOGO_MARKUP;
  for (const id of SVG_IDS) {
    const scopedId = `${scopeId}-${id}`;
    scoped = scoped
      .replaceAll(`id="${id}"`, `id="${scopedId}"`)
      .replaceAll(`url(#${id})`, `url(#${scopedId})`);
  }
  return scoped;
}

const Logo = ({ size = "default", showText = true, className = "" }) => {
  const scopeId = useMemo(() => `echona-logo-${Math.random().toString(36).slice(2, 10)}`, []);
  const scopedMarkup = useMemo(() => buildScopedLogoMarkup(scopeId), [scopeId]);

  const sizes = {
    small: {
      full: "w-[210px]",
      icon: "w-11 h-11",
    },
    default: {
      full: "w-[280px]",
      icon: "w-12 h-12",
    },
    large: {
      full: "w-[380px]",
      icon: "w-20 h-20",
    },
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`echona-logo-root flex items-center ${className}`}>
      <style>{`
        .echona-logo-root * { box-sizing: border-box; }
        .echona-logo-canvas { line-height: 0; }
        .echona-logo-svg { width: 100%; height: auto; display: block; }

        .echona-logo-root {
          filter: drop-shadow(0 4px 10px rgba(2, 6, 23, 0.2));
        }

        @keyframes logoBar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(var(--h))} }
        @keyframes logoSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes logoSpinR { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes logoBreathe { 0%,100%{transform:scale(1); opacity:0.9} 50%{transform:scale(1.07); opacity:1} }
        @keyframes logoNoteDrop { 0%{transform:translateY(-18px) rotate(-12deg);opacity:0} 20%{opacity:1} 80%{opacity:0.6} 100%{transform:translateY(18px) rotate(10deg);opacity:0} }
        @keyframes logoTextGlow { 0%,100%{filter:drop-shadow(0 0 4px rgba(56,189,248,0.22))} 50%{filter:drop-shadow(0 0 9px rgba(56,189,248,0.4))} }
        @keyframes logoFadeIn { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
        @keyframes logoTagFade { from{opacity:0; letter-spacing:3.2px} to{opacity:1; letter-spacing:2px} }
        @keyframes logoWave {
          0%   { d:path("M0,6 C9,-7 18,19 27,6 C36,-7 45,19 54,6 C63,-7 72,19 81,6 C90,-7 99,19 108,6 C117,-7 126,19 135,6 C144,-7 153,19 162,6 C171,-7 180,19 189,6") }
          50%  { d:path("M0,6 C9,19 18,-7 27,6 C36,19 45,-7 54,6 C63,19 72,-7 81,6 C90,19 99,-7 108,6 C117,19 126,-7 135,6 C144,19 153,-7 162,6 C171,19 180,-7 189,6") }
          100% { d:path("M0,6 C9,-7 18,19 27,6 C36,-7 45,19 54,6 C63,-7 72,19 81,6 C90,-7 99,19 108,6 C117,-7 126,19 135,6 C144,-7 153,19 162,6 C171,-7 180,19 189,6") }
        }

        .echona-logo-icon-crop {
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.1);
          background: radial-gradient(circle at 40% 35%, rgba(15, 23, 42, 0.35), rgba(2, 6, 23, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .echona-logo-icon-inner {
          width: 220px;
          transform: translateX(-70px) scale(1.08);
          transform-origin: center;
        }
      `}</style>

      {showText ? (
        <div
          className={`echona-logo-canvas ${currentSize.full}`}
          dangerouslySetInnerHTML={{ __html: scopedMarkup }}
        />
      ) : (
        <div className={currentSize.icon}>
          <div className="echona-logo-icon-crop">
            <div
              className="echona-logo-icon-inner"
              dangerouslySetInnerHTML={{ __html: scopedMarkup }}
            />
          </div>
          <span className="sr-only">ECHONA</span>
        </div>
      )}
    </div>
  );
};

export default Logo;

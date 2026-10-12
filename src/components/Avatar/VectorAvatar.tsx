import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AvatarState, Emotion } from '../../types/assistant';

interface VectorAvatarProps {
  state: AvatarState;
  emotion?: Emotion;
  lipSyncAmplitude?: number;
  onClick?: () => void;
}

export const VectorAvatar: React.FC<VectorAvatarProps> = ({
  state,
  emotion = 'neutral',
  lipSyncAmplitude = 0,
  onClick,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let timer: number;
    const loopBlink = () => {
      const wait = state === 'speaking' ? 2400 + Math.random() * 1800 : 3600 + Math.random() * 2000;
      timer = window.setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          loopBlink();
        }, 150);
      }, wait);
    };
    loopBlink();
    return () => clearTimeout(timer);
  }, [state]);

  const eyeOffsetY = state === 'thinking' ? -3 : state === 'listening' ? 1 : 0;
  const mouthHeight = state === 'speaking' ? Math.max(4, lipSyncAmplitude * 18) : 4;

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center cursor-pointer select-none"
    >
      {/* Ambient Radial Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: state === 'listening' ? [1, 1.2, 1.1] : state === 'speaking' ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-64 h-64 rounded-full bg-rose-500/20 blur-3xl"
        />
      </div>

      {/* SVG Canvas for Bengali Character */}
      <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-rose-400/40 bg-gradient-to-b from-slate-900 to-indigo-950 shadow-2xl flex items-center justify-center">
        <svg viewBox="0 0 240 240" className="w-full h-full">
          <defs>
            {/* Skin Tone Gradient */}
            <radialGradient id="skin" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#f3c9a6" />
              <stop offset="70%" stopColor="#e5b28b" />
              <stop offset="100%" stopColor="#c89269" />
            </radialGradient>
            {/* Hair Gradient */}
            <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e181b" />
              <stop offset="50%" stopColor="#120f11" />
              <stop offset="100%" stopColor="#0a0809" />
            </linearGradient>
            {/* Saree Gradient */}
            <linearGradient id="saree" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="60%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
            {/* Gold Accents */}
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Hair Background Waves */}
          <path d="M 60 70 C 40 100, 35 170, 70 230 C 80 240, 160 240, 170 230 C 205 170, 200 100, 180 70 Z" fill="url(#hair)" />

          {/* Shoulders / Saree drape */}
          <path d="M 40 240 C 50 180, 190 180, 200 240 Z" fill="url(#saree)" />
          {/* Gold Zari Border of Saree */}
          <path d="M 65 190 Q 120 220 175 190" stroke="url(#gold)" strokeWidth="4" fill="none" />

          {/* Neck */}
          <path d="M 105 150 L 105 185 Q 120 190 135 185 L 135 150 Z" fill="#d89f78" />
          {/* Delicate Gold Necklace */}
          <path d="M 105 168 Q 120 180 135 168" stroke="url(#gold)" strokeWidth="2.5" fill="none" />
          <circle cx="120" cy="180" r="3" fill="url(#gold)" />

          {/* Face Base */}
          <path d="M 75 90 C 75 55, 165 55, 165 90 C 165 135, 145 165, 120 165 C 95 165, 75 135, 75 90 Z" fill="url(#skin)" />

          {/* Front Hair Strands & Parting (Seethi) */}
          <path d="M 75 80 C 85 45, 120 40, 120 52 C 120 40, 155 45, 165 80 C 145 65, 95 65, 75 80 Z" fill="url(#hair)" />

          {/* Red Bindi on Forehead */}
          <circle cx="120" cy="85" r="3.5" fill="#dc2626" />

          {/* Eyebrows */}
          <path
            d={
              state === 'thinking'
                ? "M 92 98 Q 102 93 112 97"
                : "M 92 97 Q 102 94 112 98"
            }
            stroke="#1f1a1d"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={
              state === 'thinking'
                ? "M 128 97 Q 138 93 148 98"
                : "M 128 98 Q 138 94 148 97"
            }
            stroke="#1f1a1d"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes (Left & Right) */}
          {isBlinking ? (
            <>
              {/* Blinking line */}
              <path d="M 94 109 Q 103 113 112 109" stroke="#1f1a1d" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 128 109 Q 137 113 146 109" stroke="#1f1a1d" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left Eye Whites & Kajal */}
              <path d="M 92 108 C 96 103, 110 103, 114 108 C 110 113, 96 113, 92 108 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.2" />
              <circle cx="103" cy={108 + eyeOffsetY} r="4.2" fill="#2d1c16" />
              <circle cx="104.5" cy={106.5 + eyeOffsetY} r="1.5" fill="#ffffff" />

              {/* Right Eye Whites & Kajal */}
              <path d="M 126 108 C 130 103, 144 103, 148 108 C 144 113, 130 113, 126 108 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.2" />
              <circle cx="137" cy={108 + eyeOffsetY} r="4.2" fill="#2d1c16" />
              <circle cx="138.5" cy={106.5 + eyeOffsetY} r="1.5" fill="#ffffff" />
            </>
          )}

          {/* Delicate Nose */}
          <path d="M 120 110 L 118 126 Q 120 128 122 126" stroke="#c89269" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Subtle Nath/Nose Pin Sparkle */}
          <circle cx="116" cy="125" r="1.2" fill="url(#gold)" />

          {/* Cheeks blush */}
          <circle cx="90" cy="122" r="7" fill="#fb7185" opacity="0.25" />
          <circle cx="150" cy="122" r="7" fill="#fb7185" opacity="0.25" />

          {/* Mouth (Dynamic Lip Sync) */}
          {state === 'speaking' && mouthHeight > 5 ? (
            <path
              d={`M 110 142 Q 120 ${142 + mouthHeight} 130 142 Q 120 139 110 142 Z`}
              fill="#be123c"
              stroke="#881337"
              strokeWidth="1.5"
            />
          ) : (
            <path
              d="M 112 142 Q 120 147 128 142"
              stroke="#be123c"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Traditional Jhumka Earrings with sway */}
          <g transform={`rotate(${state === 'listening' ? -4 : 0} 74 125)`}>
            <circle cx="74" cy="125" r="2.5" fill="url(#gold)" />
            <path d="M 70 131 Q 74 127 78 131 Z" fill="url(#gold)" />
            <circle cx="72" cy="133" r="1" fill="url(#gold)" />
            <circle cx="74" cy="134" r="1" fill="url(#gold)" />
            <circle cx="76" cy="133" r="1" fill="url(#gold)" />
          </g>

          <g transform={`rotate(${state === 'listening' ? 4 : 0} 166 125)`}>
            <circle cx="166" cy="125" r="2.5" fill="url(#gold)" />
            <path d="M 162 131 Q 166 127 170 131 Z" fill="url(#gold)" />
            <circle cx="164" cy="133" r="1" fill="url(#gold)" />
            <circle cx="166" cy="134" r="1" fill="url(#gold)" />
            <circle cx="168" cy="133" r="1" fill="url(#gold)" />
          </g>
        </svg>
      </div>

      <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <span className="text-xs font-semibold text-rose-300">
          নুনুনতি (Nununti)
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          {state}
        </span>
      </div>
    </div>
  );
};

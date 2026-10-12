import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarState, Emotion } from '../../types/assistant';
import CYBER_CHARACTER_IMG from '../../assets/images/nununti_cyber_character_1791817848597.jpg';

interface AnimatedAvatarProps {
  state: AvatarState;
  emotion?: Emotion;
  lipSyncAmplitude?: number; // 0 to 1
  onClick?: () => void;
  interactive?: boolean;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  state,
  emotion = 'neutral',
  lipSyncAmplitude = 0,
  onClick,
  interactive = true,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Natural blinking interval
  useEffect(() => {
    let blinkTimeout: number;

    const scheduleBlink = () => {
      const delay = state === 'speaking' ? 2200 + Math.random() * 2000 : 3500 + Math.random() * 2500;
      blinkTimeout = window.setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, [state]);

  // Subtle interactive parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);
    setParallax({ x: Math.max(-1, Math.min(1, dx)) * 6, y: Math.max(-1, Math.min(1, dy)) * 4 });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  // Cybernetic State styles
  const stateMeta = {
    idle: {
      bengali: 'স্ট্যান্ডবাই // অ্যাক্টিভ',
      english: 'STANDBY // READY',
      glow: 'shadow-[0_0_50px_rgba(255,0,85,0.25)]',
      border: 'border-rose-500/40',
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
      ringColor: 'border-rose-500/30',
    },
    listening: {
      bengali: 'শুনছি // সিগন্যাল ইন্টারসেপ্ট',
      english: 'INTERCEPTING AUDIO',
      glow: 'shadow-[0_0_60px_rgba(0,240,255,0.4)]',
      border: 'border-cyan-400',
      badgeColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40',
      ringColor: 'border-cyan-400/50',
    },
    thinking: {
      bengali: 'ডিক্রিপ্ট করছি // Groq Llama 3',
      english: 'PROCESSING // LLAMA-3',
      glow: 'shadow-[0_0_60px_rgba(0,255,136,0.4)]',
      border: 'border-emerald-400',
      badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40',
      ringColor: 'border-emerald-400/50',
    },
    speaking: {
      bengali: 'ভয়েস ট্রান্সমিশন চলছে...',
      english: 'VOICE TRANSMITTING',
      glow: 'shadow-[0_0_70px_rgba(255,70,120,0.5)]',
      border: 'border-rose-400',
      badgeColor: 'text-rose-300 border-rose-500/40 bg-rose-950/40',
      ringColor: 'border-rose-400/60',
    },
  }[state];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      }`}
    >
      {/* Outer Hologram Cyber Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: state === 'listening' ? [1, 1.08, 1] : state === 'speaking' ? [1, 1.05 + lipSyncAmplitude * 0.1, 1] : [1, 1.02, 1],
            opacity: state === 'idle' ? 0.4 : 0.8,
          }}
          transition={{ repeat: Infinity, duration: state === 'speaking' ? 0.6 : 2.5 }}
          className={`w-72 sm:w-96 h-[460px] rounded-[36px] bg-gradient-to-t from-rose-600/20 via-cyan-500/10 to-transparent blur-3xl`}
        />
      </div>

      {/* Full Body Character Frame */}
      <motion.div
        animate={{
          x: parallax.x,
          y: parallax.y,
          scale: state === 'speaking' ? 1 + lipSyncAmplitude * 0.015 : 1,
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className={`relative z-10 w-[240px] sm:w-[280px] md:w-[310px] h-[400px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden border-2 ${stateMeta.border} ${stateMeta.glow} bg-slate-950 shadow-2xl transition-all duration-300`}
      >
        {/* Full Body Bold Cyber Hunter Character Artwork */}
        <img
          src={CYBER_CHARACTER_IMG}
          alt="Nununti Cyber Hunter AI"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-[1.03] transition-transform duration-700 pointer-events-none"
        />

        {/* Holographic Scanlines & Matrix Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,255,200,0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />

        {/* Dynamic Sweeping Cyber Radar Laser Line */}
        <motion.div
          animate={{
            top: ['-10%', '110%'],
          }}
          transition={{
            repeat: Infinity,
            duration: state === 'listening' ? 1.5 : 3.5,
            ease: 'linear',
          }}
          className={`absolute left-0 right-0 h-[2px] ${
            state === 'listening'
              ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00ffff]'
              : 'bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_#ff0055]'
          } pointer-events-none`}
        />

        {/* Interactive Eye Glow / Blinking Mask */}
        <AnimatePresence>
          {isBlinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Left Eye Blink */}
              <div
                className="absolute bg-[#1a080c] rounded-full blur-[0.3px]"
                style={{
                  top: '17.2%',
                  left: '46.8%',
                  width: '3.6%',
                  height: '0.9%',
                  transform: 'rotate(-2deg)',
                }}
              />
              {/* Right Eye Blink */}
              <div
                className="absolute bg-[#1a080c] rounded-full blur-[0.3px]"
                style={{
                  top: '17.2%',
                  left: '52.6%',
                  width: '3.6%',
                  height: '0.9%',
                  transform: 'rotate(2deg)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Mouth Lip-Sync Overlay */}
        {state === 'speaking' && lipSyncAmplitude > 0.08 && (
          <div
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              top: '21.5%',
              left: '50.5%',
              width: '4.5%',
              height: '1.6%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              animate={{
                scaleY: 0.4 + lipSyncAmplitude * 1.8,
                scaleX: 0.9 + lipSyncAmplitude * 0.3,
              }}
              transition={{ duration: 0.06 }}
              className="w-full h-full rounded-full bg-[#3d0912] shadow-inner border border-rose-500/50"
            />
          </div>
        )}

        {/* Cyber HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-rose-500 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-rose-500 pointer-events-none" />

        {/* Holographic HUD Targeting Reticle */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 pointer-events-none">
          <span className="font-mono text-[9px] text-cyan-400 tracking-wider">SEC_LVL: 09</span>
          <span className="font-mono text-[9px] text-rose-400 tracking-wider">HUD_SYNAPSE: OK</span>
        </div>

        {/* Vignette bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* Cyberpunk Status Banner */}
      <div className="mt-4 flex flex-col items-center gap-1.5 z-20">
        <div
          className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-lg ${stateMeta.badgeColor}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'listening'
                ? 'bg-cyan-400 animate-ping'
                : state === 'thinking'
                ? 'bg-emerald-400 animate-pulse'
                : state === 'speaking'
                ? 'bg-rose-400 animate-bounce'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-xs font-bold tracking-wide font-mono">
            {stateMeta.bengali}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest opacity-75">
            {stateMeta.english}
          </span>
        </div>
      </div>
    </div>
  );
};

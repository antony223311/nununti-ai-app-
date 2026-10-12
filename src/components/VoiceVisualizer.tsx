import React from 'react';
import { motion } from 'motion/react';
import { AvatarState } from '../types/assistant';

interface VoiceVisualizerProps {
  state: AvatarState;
  amplitude?: number; // 0 to 1
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ state, amplitude = 0 }) => {
  const bars = 28;

  return (
    <div className="flex items-center justify-center gap-[3px] h-10 px-4 py-1.5 rounded-2xl bg-slate-950/60 border border-slate-900/80 backdrop-blur-md">
      {Array.from({ length: bars }).map((_, i) => {
        // Distance from center
        const distFromCenter = Math.abs(i - bars / 2) / (bars / 2);
        const centerWeight = 1 - distFromCenter * 0.65;

        let height = 4;
        let color = 'bg-slate-800';

        if (state === 'listening') {
          height = Math.max(
            6,
            (Math.sin((i / bars) * Math.PI * 4 + Date.now() / 160) * 0.5 + 0.5) * 32 * centerWeight
          );
          color = 'bg-cyan-400 shadow-[0_0_8px_#00ffff]';
        } else if (state === 'speaking') {
          const dynamicAmp = amplitude > 0 ? amplitude : (Math.sin(i * 1.8 + Date.now() / 120) * 0.45 + 0.55);
          height = Math.max(6, dynamicAmp * 36 * centerWeight);
          color = 'bg-gradient-to-t from-rose-500 to-amber-300 shadow-[0_0_8px_#ff0055]';
        } else if (state === 'thinking') {
          height = Math.max(
            4,
            (Math.sin(i * 0.9 + Date.now() / 150) * 0.5 + 0.5) * 20 * centerWeight
          );
          color = 'bg-emerald-400 shadow-[0_0_6px_#00ff88]';
        } else {
          // Idle low rhythm
          height = 4 + Math.sin(i * 0.6 + Date.now() / 600) * 3;
          color = 'bg-slate-700/60';
        }

        return (
          <motion.div
            key={i}
            animate={{
              height: `${height}px`,
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 24,
            }}
            className={`w-[3px] rounded-full ${color} transition-colors duration-200`}
          />
        );
      })}
    </div>
  );
};

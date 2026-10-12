import React, { useState, useEffect } from 'react';
import { Bell, Play, Pause, RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { playActionChime } from '../../services/speechService';

interface AlarmModalProps {
  initialSeconds?: number;
  onClose: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  initialSeconds = 300,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isActive && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && !isFinished) {
      setIsFinished(true);
      setIsActive(false);
      playActionChime();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, isFinished]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / initialSeconds;

  const resetTimer = () => {
    setSecondsLeft(initialSeconds);
    setIsActive(true);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-400 mb-6">
          <Bell className="w-5 h-5" />
          <span className="font-semibold text-sm">Nununti Alarm & Timer (অ্যালার্ম)</span>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-rose-500 transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={276}
              strokeDashoffset={276 * progress}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-slate-100 tabular-nums">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              {isFinished ? 'সময় শেষ! (Time Up)' : 'চলছে...'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-transform"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

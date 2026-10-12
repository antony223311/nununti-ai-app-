import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Flashlight, Camera, Mic, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LOCKSCREEN_BG from '../../assets/images/nununti_lockscreen_wallpaper_1791816674895.jpg';
import { AnimatedAvatar } from '../Avatar/AnimatedAvatar';
import { VoiceVisualizer } from '../VoiceVisualizer';
import { AvatarState } from '../../types/assistant';

interface LockScreenViewProps {
  onUnlock: () => void;
  onWakeWordTrigger: () => void;
  isListening: boolean;
  avatarState: AvatarState;
  assistantReply: string;
  userTranscript: string;
}

export const LockScreenView: React.FC<LockScreenViewProps> = ({
  onUnlock,
  onWakeWordTrigger,
  isListening,
  avatarState,
  assistantReply,
  userTranscript,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [bengaliDateStr, setBengaliDateStr] = useState('');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      );

      // Bengali date presentation
      const weekdaysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const bnDay = weekdaysBn[now.getDay()];
      setBengaliDateStr(`${bnDay}, ${now.getDate()}ই কার্তিক`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // When listening is active, open the overlay automatically
  useEffect(() => {
    if (isListening || avatarState !== 'idle') {
      setIsOverlayOpen(true);
    }
  }, [isListening, avatarState]);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 select-none overflow-hidden flex flex-col justify-between">
      {/* Background Image Wallpaper */}
      <img
        src={LOCKSCREEN_BG}
        alt="Lock Screen Wallpaper"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-950/40 to-black/80 pointer-events-none" />

      {/* Top Status Bar & Clock */}
      <div className="relative z-10 pt-12 px-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>লক স্ক্রিন (Lock Screen)</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-light tracking-tight text-white font-mono tabular-nums drop-shadow-md">
          {timeStr || '22:08'}
        </h1>
        <p className="text-sm font-medium text-slate-200 mt-2">{dateStr}</p>
        <p className="text-xs text-rose-300/80 font-medium mt-0.5">{bengaliDateStr}</p>

        {/* Low-Power Wake-word Banner */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mt-6 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-lg shadow-xl"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-200">
            হাত খালি রেখেই বলুন: <span className="font-bold text-rose-400">"Nununti"</span>
          </span>
        </motion.div>
      </div>

      {/* Lock Screen Overlay of Nununti if awakened */}
      <AnimatePresence>
        {isOverlayOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="relative z-20 mx-4 p-5 rounded-3xl bg-slate-900/90 border border-rose-500/30 backdrop-blur-2xl shadow-2xl flex flex-col items-center"
          >
            <div className="w-8 h-1 rounded-full bg-slate-700 mb-3" />

            <div className="scale-75 -my-6">
              <AnimatedAvatar
                state={avatarState}
                interactive={false}
              />
            </div>

            <VoiceVisualizer state={avatarState} />

            {/* Transcript or Assistant reply */}
            <div className="w-full text-center mt-2 px-2">
              {userTranscript ? (
                <p className="text-xs text-cyan-300 font-medium italic">
                  "{userTranscript}"
                </p>
              ) : assistantReply ? (
                <p className="text-xs text-slate-100 font-medium">
                  {assistantReply}
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  নুনুনতি শুনছে... আদেশ দিন (যেমন: "Open YouTube", "Call Mom")
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={onWakeWordTrigger}
                className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>কথা বলুন</span>
              </button>
              <button
                onClick={() => setIsOverlayOpen(false)}
                className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar: Flashlight, Unlock Swipe & Camera */}
      <div className="relative z-10 pb-8 px-8 flex flex-col items-center gap-6">
        {/* Wake-Word Quick Orb */}
        {!isOverlayOpen && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOverlayOpen(true);
              onWakeWordTrigger();
            }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 border border-rose-400/30 backdrop-blur-md"
          >
            <Mic className="w-4 h-4 animate-bounce" />
            <span className="text-xs font-bold tracking-wide">
              নুনুনতিকে ডাকুন (Tap or Say "Nununti")
            </span>
          </motion.button>
        )}

        {/* Swipe Up to Unlock */}
        <button
          onClick={onUnlock}
          className="flex flex-col items-center gap-1 text-slate-300/80 hover:text-white transition-colors group"
        >
          <motion.div
            animate={{ y: [-2, 4, -2] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Unlock className="w-5 h-5 text-slate-300 group-hover:text-rose-400" />
          </motion.div>
          <span className="text-xs font-medium tracking-wide">
            আনলক করতে ট্যাপ করুন (Tap to Unlock)
          </span>
        </button>

        {/* Quick Launch Shortcuts */}
        <div className="w-full flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80">
            <Flashlight className="w-5 h-5" />
          </div>
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80">
            <Camera className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

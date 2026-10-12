import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CallingModalProps {
  contactName?: string;
  phoneNumber?: string;
  onClose: () => void;
}

export const CallingModal: React.FC<CallingModalProps> = ({
  contactName = 'Mom (মা)',
  phoneNumber = '+8801712345678',
  onClose,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');

  useEffect(() => {
    // Ringing for 2.5s then connected
    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 2400);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: number;
    if (callState === 'connected') {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center shadow-2xl text-slate-100"
      >
        {/* Contact Avatar Circle */}
        <div className="relative my-6">
          <motion.div
            animate={callState === 'ringing' ? { scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl"
          />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-rose-300/40">
            {contactName.charAt(0)}
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-100 tracking-tight">{contactName}</h3>
        <p className="text-xs text-slate-400 mt-1 font-mono">{phoneNumber}</p>

        <p className="text-sm font-medium mt-3 text-rose-400">
          {callState === 'ringing' ? 'কল হচ্ছে... (Ringing)' : `কল চলছে: ${formatTime(callDuration)}`}
        </p>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-6 my-8 w-full px-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
              isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[11px]">Mute</span>
          </button>

          <a
            href={`tel:${phoneNumber}`}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all"
            title="Open Native Dialer"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[11px]">Native Dialer</span>
          </a>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
              isSpeaker ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-[11px]">Speaker</span>
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 active:scale-95 transition-transform"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </motion.div>
    </div>
  );
};

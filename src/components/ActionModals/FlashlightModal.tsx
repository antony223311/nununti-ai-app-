import React, { useState } from 'react';
import { Flashlight, X, SunMedium } from 'lucide-react';
import { motion } from 'motion/react';

interface FlashlightModalProps {
  onClose: () => void;
}

export const FlashlightModal: React.FC<FlashlightModalProps> = ({ onClose }) => {
  const [isOn, setIsOn] = useState(true);
  const [brightness, setBrightness] = useState(100);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-300"
      style={{
        backgroundColor: isOn ? `rgba(255, 255, 255, ${brightness / 100})` : 'rgba(3, 7, 18, 0.95)',
      }}
    >
      <div className="flex items-center justify-between z-10">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
            isOn ? 'bg-slate-900/80 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Flashlight className="w-4 h-4" />
          <span>Nununti Torch (টর্চ লাইট)</span>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-full backdrop-blur-md ${
            isOn ? 'bg-slate-900/80 text-white hover:bg-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Toggle Button */}
      <div className="flex flex-col items-center justify-center gap-4 z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOn(!isOn)}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 shadow-2xl transition-all duration-300 ${
            isOn
              ? 'bg-amber-400 text-slate-950 shadow-amber-400/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <Flashlight className="w-10 h-10" />
          <span className="text-xs font-bold uppercase tracking-wider">{isOn ? 'ON' : 'OFF'}</span>
        </motion.button>
      </div>

      {/* Bottom Brightness Slider */}
      <div className="w-full max-w-xs mx-auto z-10 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md text-white border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center gap-1.5">
            <SunMedium className="w-4 h-4 text-amber-400" /> Brightness
          </span>
          <span>{brightness}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
      </div>
    </div>
  );
};

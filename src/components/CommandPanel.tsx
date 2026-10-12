import React from 'react';
import { Phone, PlaySquare, MessageCircle, CloudSun, Timer, Flashlight, Music, Search, Terminal } from 'lucide-react';
import { SystemAction } from '../types/assistant';

interface CommandPanelProps {
  onSelectCommand: (commandText: string) => void;
  recentAction?: SystemAction;
}

const CYBER_COMMANDS = [
  {
    icon: Phone,
    code: 'CALL_MOM',
    label: 'মাকে কল করো',
    english: 'Call Mom',
    command: 'মাকে কল করো',
    accent: 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400',
  },
  {
    icon: PlaySquare,
    code: 'NET_YOUTUBE',
    label: 'ইউটিউব খোলো',
    english: 'Open YouTube',
    command: 'ইউটিউব খোলো',
    accent: 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:border-rose-400',
  },
  {
    icon: MessageCircle,
    code: 'COMMS_WA',
    label: 'হোয়াটসঅ্যাপ',
    english: 'WhatsApp',
    command: 'হোয়াটসঅ্যাপ খোলো',
    accent: 'border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-400',
  },
  {
    icon: CloudSun,
    code: 'RADAR_WEATHER',
    label: 'আবহাওয়া রিপোর্ট',
    english: 'Live Weather',
    command: 'আজকের আবহাওয়া কেমন?',
    accent: 'border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400',
  },
  {
    icon: Timer,
    code: 'COUNTDOWN',
    label: '৫ মিনিটের অ্যালার্ম',
    english: '5m Timer',
    command: '৫ মিনিটের অ্যালার্ম দাও',
    accent: 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400',
  },
  {
    icon: Flashlight,
    code: 'BEAM_LIGHT',
    label: 'টর্চ জ্বালাও',
    english: 'Cyber Torch',
    command: 'টর্চ জ্বালাও',
    accent: 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400',
  },
  {
    icon: Music,
    code: 'AUDIO_SYNTH',
    label: 'বাংলা সুর বাজাও',
    english: 'Acoustic Sitar',
    command: 'একটি মিষ্টি বাংলা সুর বাজাও',
    accent: 'border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400',
  },
  {
    icon: Search,
    code: 'INTEL_SEARCH',
    label: 'গুগল সার্চ',
    english: 'Web Search',
    command: 'গুগল সার্চ রবীন্দ্রনাথ ঠাকুর',
    accent: 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400',
  },
];

export const CommandPanel: React.FC<CommandPanelProps> = ({ onSelectCommand, recentAction }) => {
  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Active System Directive Feedback */}
      {recentAction && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/90 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-cyan-300">
                [SYS_EXECUTED: {recentAction.title}]
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{recentAction.description}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/40">
            COMPLETED
          </span>
        </div>
      )}

      {/* Cyberpunk Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Terminal className="w-3.5 h-3.5" />
          SYSTEM_SCRIPTS (কমান্ড ডিরেক্টরি)
        </span>
        <span className="text-[10px] text-slate-500">VOICE // TAP TRIGGER</span>
      </div>

      {/* Cyberpunk Command Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CYBER_COMMANDS.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectCommand(item.command)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 border text-left transition-all active:scale-[0.98] backdrop-blur-sm ${item.accent}`}
            >
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono tracking-tight text-slate-400 truncate">
                  ${item.code}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

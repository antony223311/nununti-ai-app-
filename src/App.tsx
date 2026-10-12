import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Send, 
  Settings as SettingsIcon, 
  Smartphone, 
  Lock, 
  Volume2, 
  Zap,
  Terminal,
  Activity,
  Binary
} from 'lucide-react';
import { 
  AvatarState, 
  Emotion, 
  ChatMessage, 
  SystemAction, 
  AssistantSettings 
} from './types/assistant';
import { AnimatedAvatar } from './components/Avatar/AnimatedAvatar';
import { VectorAvatar } from './components/Avatar/VectorAvatar';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { CommandPanel } from './components/CommandPanel';
import { LockScreenView } from './components/LockScreen/LockScreenView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ExportAndroidModal } from './components/ExportApk/ExportAndroidModal';
import { CallingModal } from './components/ActionModals/CallingModal';
import { AlarmModal } from './components/ActionModals/AlarmModal';
import { FlashlightModal } from './components/ActionModals/FlashlightModal';
import { MatrixRain } from './components/CyberBackground/MatrixRain';
import { askGroqOrFallback } from './services/groqService';
import { 
  speakText, 
  detectWakeWord, 
  stripWakeWord, 
  playWakeChime, 
  playActionChime, 
  playAcousticMelody 
} from './services/speechService';
import { executeSystemAction } from './services/commandHandler';
import HACKER_BG from './assets/images/nununti_cyber_hacker_bg_1791817861850.jpg';

const DEFAULT_SETTINGS: AssistantSettings = {
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  language: 'bn-BD',
  ttsVoiceName: '',
  ttsPitch: 1.05,
  ttsRate: 0.98,
  wakeWordEnabled: true,
  wakeWordSensitivity: 'medium',
  avatarStyle: 'photorealistic',
  lockScreenOverlayEnabled: true,
  soundChimeEnabled: true,
  continuousListening: true,
};

export default function App() {
  const [settings, setSettings] = useState<AssistantSettings>(() => {
    try {
      const saved = localStorage.getItem('nununti_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Assistant State
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [lipSyncAmp, setLipSyncAmp] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matrixActive, setMatrixActive] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'সিস্টেম অ্যাক্টিভেটেড। আমি নুনুনতি (Nununti) — আপনার সাইবার ভয়েস অ্যাসিস্ট্যান্ট। বলুন, কী নির্দেশ?',
      timestamp: Date.now(),
    },
  ]);
  const [activeAction, setActiveAction] = useState<SystemAction | undefined>(undefined);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [engineSource, setEngineSource] = useState<'groq' | 'fallback'>('fallback');

  // Input Box State
  const [textInput, setTextInput] = useState('');

  // Modals & Views
  const [showSettings, setShowSettings] = useState(false);
  const [showExportApk, setShowExportApk] = useState(false);
  const [isLockScreenMode, setIsLockScreenMode] = useState(false);
  const [activeModal, setActiveModal] = useState<'calling' | 'alarm' | 'flashlight' | null>(null);

  // Recognition reference
  const recognitionRef = useRef<any>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  const isProcessingRef = useRef(false);

  const handleSaveSettings = (newSettings: AssistantSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nununti_settings', JSON.stringify(newSettings));
  };

  const speakAssistant = useCallback(
    (text: string, onDone?: () => void) => {
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
      }

      setAvatarState('speaking');
      const cancel = speakText(text, {
        voiceName: settings.ttsVoiceName,
        lang: settings.language,
        pitch: settings.ttsPitch,
        rate: settings.ttsRate,
        onStart: () => {
          setAvatarState('speaking');
        },
        onLipSync: (amp) => {
          setLipSyncAmp(amp);
        },
        onEnd: () => {
          setAvatarState('idle');
          setLipSyncAmp(0);
          if (onDone) onDone();
        },
      });
      cancelSpeechRef.current = cancel;
    },
    [settings]
  );

  const handleUserPrompt = useCallback(
    async (rawPrompt: string) => {
      const cleanPrompt = stripWakeWord(rawPrompt).trim() || rawPrompt.trim();
      if (!cleanPrompt || isProcessingRef.current) return;

      isProcessingRef.current = true;
      setTranscript('');

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: cleanPrompt,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setAvatarState('thinking');

      try {
        const history = messages.slice(-4).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        const result = await askGroqOrFallback(
          cleanPrompt,
          history,
          settings.groqApiKey,
          settings.groqModel
        );

        setLastLatency(result.latencyMs);
        setEngineSource(result.source);

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.text,
          timestamp: Date.now(),
          actionExecuted: result.action,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        speakAssistant(result.text, () => {
          if (result.action) {
            setActiveAction(result.action);
            if (settings.soundChimeEnabled) playActionChime();

            if (result.action.type === 'music') {
              playAcousticMelody();
            }

            const execRes = executeSystemAction(result.action);
            if (execRes.modalToOpen) {
              setActiveModal(execRes.modalToOpen);
            }
          }
        });
      } catch (err) {
        console.error('Error handling prompt:', err);
        const errMsg = 'কমান্ড প্রক্রিয়াকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: errMsg,
            timestamp: Date.now(),
          },
        ]);
        speakAssistant(errMsg);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [messages, settings, speakAssistant]
  );

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('Web Speech Recognition API not supported in this browser');
      return;
    }

    const recognizer = new SpeechRecognitionClass();
    recognizer.continuous = settings.continuousListening;
    recognizer.interimResults = true;
    recognizer.lang = settings.language || 'bn-BD';

    recognizer.onstart = () => {
      setIsListening(true);
    };

    recognizer.onresult = (event: any) => {
      let currentInterim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      const activeText = finalTranscript || currentInterim;
      setTranscript(activeText);

      if (settings.wakeWordEnabled && detectWakeWord(activeText)) {
        if (settings.soundChimeEnabled) playWakeChime();
        setAvatarState('listening');
      }

      if (finalTranscript.trim()) {
        const cleaned = stripWakeWord(finalTranscript);
        if (cleaned) {
          handleUserPrompt(cleaned);
        }
      }
    };

    recognizer.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition status:', event.error);
      }
      setIsListening(false);
      if (avatarState === 'listening') {
        setAvatarState('idle');
      }
    };

    recognizer.onend = () => {
      setIsListening(false);
      if (settings.continuousListening && !isProcessingRef.current) {
        setTimeout(() => {
          if (settings.continuousListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (_) {}
          }
        }, 600);
      }
    };

    recognitionRef.current = recognizer;

    try {
      recognizer.start();
    } catch (_) {}

    return () => {
      try {
        recognizer.abort();
      } catch (_) {}
    };
  }, [settings.language, settings.continuousListening, settings.wakeWordEnabled, handleUserPrompt]);

  const toggleListening = () => {
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
      setAvatarState('idle');
    } else {
      setTranscript('');
      setAvatarState('listening');
      if (settings.soundChimeEnabled) playWakeChime();
      try {
        recognitionRef.current?.start();
      } catch (_) {
        setIsListening(true);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const prompt = textInput.trim();
    setTextInput('');
    handleUserPrompt(prompt);
  };

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-rose-500/40 selection:text-white overflow-x-hidden">
      {/* Background Layer 1: Dark Cyber Hacker Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={HACKER_BG}
          alt="Hacker Grid Backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25 mix-blend-luminosity filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/90 via-[#030712]/75 to-[#030712]/95" />
      </div>

      {/* Background Layer 2: Matrix Digital Stream Canvas */}
      {matrixActive && <MatrixRain />}

      {/* Cyber Grid Lines & CRT Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      {/* Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-xl">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00ffff]" />
            <span className="text-lg font-mono font-bold tracking-wider text-white">
              NUNUNTI<span className="text-rose-500">.CYBER</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider text-slate-400">
          <button
            onClick={() => setIsLockScreenMode(false)}
            className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
              !isLockScreenMode ? 'text-cyan-300 font-bold' : ''
            }`}
          >
            [01. ASSISTANT]
          </button>
          <button
            onClick={() => setIsLockScreenMode(true)}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>[02. LOCK_SCREEN]</span>
          </button>
          <button
            onClick={() => setShowExportApk(true)}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>[03. EXPORT_APK]</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>[04. CONFIG]</span>
          </button>
          <button
            onClick={() => setMatrixActive(!matrixActive)}
            className={`hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              matrixActive ? 'text-emerald-400' : 'text-slate-600'
            }`}
            title="Toggle Matrix Digital Rain"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>MATRIX: {matrixActive ? 'ON' : 'OFF'}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {settings.groqApiKey ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>GROQ // LLAMA-3</span>
              {lastLatency && <span className="text-emerald-400">· {lastLatency}ms</span>}
            </div>
          ) : (
            <button
              onClick={() => setShowSettings(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 transition-colors"
            >
              <span>+ [KEY: CONNECT_GROQ]</span>
            </button>
          )}

          <button
            onClick={toggleListening}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition-all active:scale-95 ${
              isListening || avatarState === 'listening'
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.6)]'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isListening ? 'INTERCEPTING...' : 'SAY "NUNUNTI"'}</span>
          </button>
        </div>
      </header>

      {/* Main Tactical Cyberpunk Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24">
        {/* Top Cyber Telemetry Bar */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>NEURAL_NODE: DHAKA_CYBER</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-cyan-400">AGENT: BENGAL_HUNTER</span>
          </div>
          <div className="flex items-center gap-2 text-rose-400">
            <span>VOICE: BENGALI_FEMALE</span>
          </div>
        </div>

        {/* Centerpiece: Full-Body Bold Cyber Hunter Girl Character */}
        <div className="w-full flex flex-col items-center justify-center my-auto py-2">
          {settings.avatarStyle === 'photorealistic' ? (
            <AnimatedAvatar
              state={avatarState}
              emotion={emotion}
              lipSyncAmplitude={lipSyncAmp}
              onClick={toggleListening}
            />
          ) : (
            <VectorAvatar
              state={avatarState}
              emotion={emotion}
              lipSyncAmplitude={lipSyncAmp}
              onClick={toggleListening}
            />
          )}

          {/* Cyber Neon Spectrometer */}
          <div className="w-full max-w-sm my-3">
            <VoiceVisualizer state={avatarState} amplitude={lipSyncAmp} />
          </div>

          {/* Holographic Voice Terminal Prompt & Response */}
          <div className="w-full max-w-2xl px-2 min-h-[5.5rem] flex flex-col items-center justify-center">
            {transcript ? (
              <div className="w-full p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-xl">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  AUDIO_INTERCEPT_STREAM
                </span>
                <p className="text-sm font-medium text-cyan-100 font-mono italic">
                  &gt; "{transcript}"
                </p>
              </div>
            ) : lastAssistantMessage ? (
              <div className="w-full p-4 rounded-2xl bg-slate-950/85 border border-rose-500/30 shadow-[0_0_25px_rgba(255,0,85,0.15)] backdrop-blur-xl relative">
                <div className="flex items-center justify-between text-[10px] font-mono text-rose-400 mb-1.5">
                  <span>NUNUNTI_DIRECTIVE // RESPONSE</span>
                  <button
                    onClick={() => speakAssistant(lastAssistantMessage.content)}
                    className="flex items-center gap-1 hover:text-white transition-colors text-slate-400"
                  >
                    <Volume2 className="w-3 h-3 text-rose-400" />
                    <span>[REPLAY]</span>
                  </button>
                </div>
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
                  {lastAssistantMessage.content}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Quick System Directives */}
        <div className="w-full max-w-3xl mt-2">
          <CommandPanel
            onSelectCommand={(cmd) => handleUserPrompt(cmd)}
            recentAction={activeAction}
          />
        </div>
      </main>

      {/* Cyber Floating Bottom Input Terminal */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-[#030712] via-[#030712]/95 to-transparent backdrop-blur-lg border-t border-cyan-500/20">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setIsLockScreenMode(true)}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 transition-all shrink-0"
            title="Switch to Android Lock Screen Simulator"
          >
            <Lock className="w-5 h-5" />
          </button>

          <form onSubmit={handleTextSubmit} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="কমান্ড লিখুন বা মুখে বলুন (যেমন: ইউটিউব খোলো)..."
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 font-mono text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="absolute right-2 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-25 text-slate-950 font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <button
            onClick={toggleListening}
            className={`p-3.5 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 ${
              isListening
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_#00ffff] ring-4 ring-cyan-500/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_#ff0055]'
            }`}
            title="Tap to speak"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowExportApk(true)}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 transition-all shrink-0"
            title="Export Android Studio Project & APK"
          >
            <Smartphone className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 transition-all shrink-0"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Lock Screen Mode Overlay */}
      {isLockScreenMode && (
        <LockScreenView
          onUnlock={() => setIsLockScreenMode(false)}
          onWakeWordTrigger={toggleListening}
          isListening={isListening}
          avatarState={avatarState}
          assistantReply={lastAssistantMessage?.content || ''}
          userTranscript={transcript}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Export Android APK Modal */}
      {showExportApk && (
        <ExportAndroidModal onClose={() => setShowExportApk(false)} />
      )}

      {/* Active System Action Modals */}
      {activeModal === 'calling' && (
        <CallingModal
          contactName={activeAction?.contactName || 'Mom (মা)'}
          phoneNumber={activeAction?.phoneNumber || '+8801712345678'}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'alarm' && (
        <AlarmModal
          initialSeconds={activeAction?.timerSeconds || 300}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'flashlight' && (
        <FlashlightModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

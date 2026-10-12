import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Volume2, Mic, Sliders, CheckCircle2, AlertCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { AssistantSettings } from '../../types/assistant';
import { testGroqConnection } from '../../services/groqService';
import { getAvailableVoices, VoiceOption, speakText } from '../../services/speechService';

interface SettingsModalProps {
  settings: AssistantSettings;
  onSave: (newSettings: AssistantSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<AssistantSettings>({ ...settings });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    getAvailableVoices().then((v) => setVoices(v));
  }, []);

  const handleTestKey = async () => {
    if (!formData.groqApiKey) return;
    setTestingKey(true);
    setTestResult(null);
    const res = await testGroqConnection(formData.groqApiKey, formData.groqModel);
    setTestingKey(false);
    setTestResult(res);
  };

  const handleTestVoice = () => {
    speakText('নমস্কার! আমি নুনুনতি, আপনার বাংলা এআই সহকারী।', {
      voiceName: formData.ttsVoiceName,
      lang: formData.language,
      pitch: formData.ttsPitch,
      rate: formData.ttsRate,
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Nununti Assistant Settings</h2>
              <p className="text-xs text-slate-400">Groq API, Bengali Voice & Wake-Word Config</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Groq API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-rose-400" />
                Groq API Key
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>Get Free Groq Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.groqApiKey}
                onChange={(e) => {
                  setFormData({ ...formData, groqApiKey: e.target.value });
                  setTestResult(null);
                }}
                placeholder="gsk_..."
                className="w-full px-4 py-2.5 pr-24 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-sm font-mono text-slate-200 outline-none transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-200"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  disabled={testingKey || !formData.groqApiKey}
                  onClick={handleTestKey}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-rose-300 rounded-lg transition-colors"
                >
                  {testingKey ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>
                  {testResult.success
                    ? `Connected! Latency: ${testResult.latencyMs}ms (${testResult.message})`
                    : `Connection Error: ${testResult.message}`}
                </span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              * The app also has a built-in Bengali reasoning engine that works without a key, but adding your Groq key enables ultra-fast Llama 3.3 70B speeds!
            </p>
          </div>

          {/* 2. Groq AI Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Intelligence Model (Groq)
            </label>
            <select
              value={formData.groqModel}
              onChange={(e) => setFormData({ ...formData, groqModel: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-rose-500"
            >
              <option value="llama-3.3-70b-versatile">
                Llama 3.3 70B Versatile (Recommended for Bengali & English)
              </option>
              <option value="llama-3.1-8b-instant">
                Llama 3.1 8B Instant (Ultra-fast, sub-100ms)
              </option>
              <option value="mixtral-8x7b-32768">
                Mixtral 8x7B (High Context)
              </option>
            </select>
          </div>

          {/* 3. Avatar Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Avatar Animation Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, avatarStyle: 'photorealistic' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  formData.avatarStyle === 'photorealistic'
                    ? 'border-rose-500 bg-rose-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-semibold text-rose-300">Photorealistic Animated</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Realistic Bengali character with facial morphing</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, avatarStyle: 'vector' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  formData.avatarStyle === 'vector'
                    ? 'border-rose-500 bg-rose-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-semibold text-rose-300">Stylized 2.5D Vector</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Handcrafted SVG character with saree & jhumka</div>
              </button>
            </div>
          </div>

          {/* 4. Bengali TTS & Voice Parameters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Bengali Voice (TTS) & Pitch
              </label>
              <button
                type="button"
                onClick={handleTestVoice}
                className="text-xs text-cyan-400 hover:underline"
              >
                ভয়েস শুনুন (Preview Voice)
              </button>
            </div>

            <select
              value={formData.ttsVoiceName}
              onChange={(e) => setFormData({ ...formData, ttsVoiceName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-rose-500"
            >
              <option value="">Default Bengali Female Voice (Auto-detect)</option>
              {voices.map((v, i) => (
                <option key={i} value={v.name}>
                  {v.isBengali ? '🇧🇩 [Bengali] ' : ''}{v.name} ({v.lang})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Pitch (সুর)</span>
                  <span>{formData.ttsPitch}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={formData.ttsPitch}
                  onChange={(e) => setFormData({ ...formData, ttsPitch: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Speed (গতি)</span>
                  <span>{formData.ttsRate}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={formData.ttsRate}
                  onChange={(e) => setFormData({ ...formData, ttsRate: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          {/* 5. Hands-free "Nununti" Wake-Word Service */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  "Nununti" Wake-Word Engine
                </h4>
                <p className="text-[11px] text-slate-400">
                  Hands-free trigger when you say "Nununti" or "নুনুনতি"
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.wakeWordEnabled}
                onChange={(e) => setFormData({ ...formData, wakeWordEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

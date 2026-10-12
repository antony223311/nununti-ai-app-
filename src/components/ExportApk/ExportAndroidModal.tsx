import React, { useState } from 'react';
import { X, Download, Copy, Check, Smartphone, FileCode, Terminal } from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_FILES } from '../../services/androidExportData';

interface ExportAndroidModalProps {
  onClose: () => void;
}

export const ExportAndroidModal: React.FC<ExportAndroidModalProps> = ({ onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const currentFile = ANDROID_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all project files into zip structure
      ANDROID_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      // Add README.md with build instructions
      zip.file(
        'README.md',
        `# Nununti - Android Bengali AI Voice Assistant

A complete native Android application featuring:
- Low-power background service for "Nununti" hands-free wake-word
- Lock-screen overlay support (wakes over secure lock screen)
- Groq Llama 3.3 70B & Whisper API ultra-fast intelligence
- Bengali female Voice Synthesis (TTS)
- System actions (YouTube, Call, WhatsApp, Flashlight, Alarm)

## How to Build the APK in Android Studio:
1. Extract this zip folder.
2. Launch Android Studio -> Open -> select this folder.
3. Wait for Gradle Sync to complete.
4. Go to **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
5. Transfer the generated \`app-debug.apk\` to your Android phone or run directly via USB Debugging.
6. Grant 'Record Audio' and 'Display over other apps' permissions when prompted.
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nununti-android-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Android APK Native Project Export
              </h2>
              <p className="text-xs text-slate-400">
                Production-ready Kotlin, AndroidManifest & Gradle structure for Nununti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Generating ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split: File Tree & Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left File Navigator */}
          <div className="w-full md:w-72 border-r border-slate-800 p-4 space-y-1 bg-slate-950/50 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
              Project Structure
            </div>
            {ANDROID_FILES.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                  selectedFileIndex === idx
                    ? 'bg-rose-500/15 border border-rose-500/40 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${selectedFileIndex === idx ? 'text-rose-400' : 'text-slate-500'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                </div>
              </button>
            ))}

            <div className="mt-6 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                <Terminal className="w-4 h-4" />
                <span>APK Build Steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                <li>Download and extract ZIP.</li>
                <li>Open in Android Studio.</li>
                <li>Sync Gradle dependencies.</li>
                <li>Click <strong>Build &gt; Build APK</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Right Code Viewer */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
            {/* File Path & Copy Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] truncate">
                <span className="text-slate-500">{currentFile.path}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Description Banner */}
            <div className="px-4 py-2 bg-slate-900/20 border-b border-slate-800/40 text-[11px] text-slate-400">
              {currentFile.description}
            </div>

            {/* Code Body */}
            <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-slate-300 leading-relaxed selection:bg-rose-500/30">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// Speech Recognition & Text-to-Speech Engine with Bengali Voice Support

export interface VoiceOption {
  name: string;
  lang: string;
  isBengali: boolean;
  voice: SpeechSynthesisVoice;
}

// Global audio context for chimes & synthesis
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Pleasant wake chime
export function playWakeChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Friendly two-tone upward chime (C5 to G5)
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.warn('Audio chime playback note:', e);
  }
}

// Gentle completion chime
export function playActionChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.08); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch (e) {
    console.warn('Action chime note:', e);
  }
}

// Play a short acoustic melody (Bengali sitar/flute harmonic simulation)
export function playAcousticMelody(onEnd?: () => void) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Raga Bhupali / Baul pentatonic notes: C4, D4, E4, G4, A4, C5
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.22;
      const duration = 0.3;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    if (onEnd) {
      setTimeout(onEnd, notes.length * 220 + 200);
    }
  } catch (e) {
    console.warn('Melody error:', e);
    if (onEnd) onEnd();
  }
}

// Get list of voices from browser, highlighting Bengali voices
export function getAvailableVoices(): Promise<VoiceOption[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const loadVoices = () => {
      const raw = window.speechSynthesis.getVoices();
      const options: VoiceOption[] = raw.map((v) => {
        const lang = v.lang.toLowerCase();
        const isBengali = lang.startsWith('bn') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali');
        return {
          name: v.name,
          lang: v.lang,
          isBengali,
          voice: v,
        };
      });

      // Sort so Bengali voices appear first, then English female voices
      options.sort((a, b) => {
        if (a.isBengali && !b.isBengali) return -1;
        if (!a.isBengali && b.isBengali) return 1;
        return a.name.localeCompare(b.name);
      });

      resolve(options);
    };

    const initial = window.speechSynthesis.getVoices();
    if (initial.length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
      };
      // Timeout fallback
      setTimeout(loadVoices, 500);
    }
  });
}

// Speak text using SpeechSynthesis, calling onBoundary or ticker for mouth lip sync
export function speakText(
  text: string,
  options: {
    voiceName?: string;
    lang?: string;
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onLipSync?: (amplitude: number) => void;
  }
): () => void {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported');
    if (options.onStart) options.onStart();
    if (options.onEnd) setTimeout(options.onEnd, 1500);
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = options.pitch ?? 1.1; // Slightly sweet female pitch
  utterance.rate = options.rate ?? 0.95; // Clear deliberate cadence
  utterance.lang = options.lang || 'bn-BD';

  const voices = window.speechSynthesis.getVoices();
  if (options.voiceName) {
    const matched = voices.find((v) => v.name === options.voiceName);
    if (matched) utterance.voice = matched;
  } else {
    // Auto-detect best Bengali female voice or South Asian voice
    const bengaliVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('bn') ||
        v.name.toLowerCase().includes('bangla') ||
        v.name.toLowerCase().includes('bengali')
    );
    if (bengaliVoice) {
      utterance.voice = bengaliVoice;
    }
  }

  let lipSyncInterval: number | null = null;

  utterance.onstart = () => {
    if (options.onStart) options.onStart();

    // Simulated speech phoneme cadence oscillator for mouth animation
    if (options.onLipSync) {
      lipSyncInterval = window.setInterval(() => {
        // Natural speech syllabic fluctuation: random variations between 0.3 and 1.0 with natural pauses
        const rand = Math.random();
        const amp = rand > 0.15 ? 0.35 + Math.random() * 0.65 : 0.05;
        options.onLipSync?.(amp);
      }, 70);
    }
  };

  const cleanup = () => {
    if (lipSyncInterval !== null) {
      clearInterval(lipSyncInterval);
      lipSyncInterval = null;
    }
    options.onLipSync?.(0);
  };

  utterance.onend = () => {
    cleanup();
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis utterance error:', e);
    cleanup();
    if (options.onEnd) options.onEnd();
  };

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    cleanup();
    window.speechSynthesis.cancel();
  };
}

// Check if wake-word "Nununti" is present in phrase
export function detectWakeWord(transcript: string): boolean {
  const normalized = transcript.toLowerCase().trim();
  const wakeWords = [
    'nununti',
    'nononti',
    'nunoti',
    'nunti',
    'hey nununti',
    'ok nununti',
    'হ্যালো নুনুনতি',
    'নুনুনতি',
    'নুনুন্তি',
    'ননন্তি',
    'নুনতি',
    'নুন্তি',
  ];

  return wakeWords.some((w) => normalized.includes(w));
}

// Strip wake word from prompt to get clean command
export function stripWakeWord(transcript: string): string {
  let cleaned = transcript.trim();
  const patterns = [
    /^(hey|hi|hello|ok)?\s*nununti[,.\s]*/gi,
    /^(নমস্কার|হ্যালো|ওকে)?\s*(নুনুনতি|নুনুন্তি|ননন্তি|নুন্তি)[,.\s]*/gi,
  ];

  for (const p of patterns) {
    cleaned = cleaned.replace(p, '').trim();
  }
  return cleaned;
}

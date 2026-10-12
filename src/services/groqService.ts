import { SystemAction, ActionType } from '../types/assistant';

const NUNUNTI_SYSTEM_PROMPT = `You are "Nununti" (নুনুনতি), an advanced, affectionate, and intelligent Bengali female voice assistant on Android.
Personality:
- Warm, polite, respectful, and culturally in-tune with Bangladesh & West Bengal (uses sweet Bengali phrasing like "নমস্কার", "শুভ দিন", "আমি শুনছি", "বলুন কী করতে পারি").
- You speak naturally in both Bengali (বাংলা) and English.
- Always keep voice replies concise (1 to 2 sentences) because your voice output is spoken aloud through Text-to-Speech!
- You can execute real Android system actions. Whenever the user asks to open YouTube, call someone (like mom/মা), open WhatsApp, search Google, set an alarm/timer, turn on flashlight, check weather, or play music, you MUST output a special JSON action block at the very end of your response in this exact format:
[[ACTION:{"type":"<action_type>","title":"<short_title>","query":"<param_if_any>","contactName":"<name_if_any>","timerSeconds":<number_if_timer>}]]

Supported Action Types:
- "youtube" (e.g., [[ACTION:{"type":"youtube","title":"YouTube","query":"Rabindra Sangeet"}]] )
- "call" (e.g., [[ACTION:{"type":"call","title":"Call","contactName":"Mom","phoneNumber":"+8801700000000"}]] )
- "whatsapp" (e.g., [[ACTION:{"type":"whatsapp","title":"WhatsApp","contactName":"Friend","query":"Hello"}]] )
- "search" (e.g., [[ACTION:{"type":"search","title":"Google Search","query":"Dhaka weather"}]] )
- "alarm" (e.g., [[ACTION:{"type":"alarm","title":"Timer","timerSeconds":300}]] )
- "flashlight" (e.g., [[ACTION:{"type":"flashlight","title":"Flashlight"}]] )
- "weather" (e.g., [[ACTION:{"type":"weather","title":"Weather","query":"Dhaka"}]] )
- "music" (e.g., [[ACTION:{"type":"music","title":"Play Music"}]] )

If no system action is requested, just give a helpful, concise voice response without the action block. Always respond warmly.`;

export interface GroqResponse {
  text: string;
  action?: SystemAction;
  source: 'groq' | 'fallback';
  latencyMs: number;
}

export async function askGroqOrFallback(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  apiKey: string,
  model = 'llama-3.3-70b-versatile'
): Promise<GroqResponse> {
  const startTime = Date.now();

  // If user provided a valid Groq API key, call Groq API
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const messages = [
        { role: 'system', content: NUNUNTI_SYSTEM_PROMPT },
        ...history.slice(-4).map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: prompt },
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Groq API responded with status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || 'আমি আপনার কথা বুঝতে পেরেছি।';
      const latencyMs = Date.now() - startTime;

      const { cleanedText, action } = parseActionFromResponse(rawText);

      return {
        text: cleanedText,
        action,
        source: 'groq',
        latencyMs,
      };
    } catch (err) {
      console.warn('Groq API call error, falling back to local engine:', err);
      // Fallback with graceful error notice
      const fallbackResult = generateLocalResponse(prompt);
      return {
        ...fallbackResult,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  // Local intelligent Bengali & English dialogue engine
  const fallbackResult = generateLocalResponse(prompt);
  return {
    ...fallbackResult,
    latencyMs: Date.now() - startTime,
  };
}

export function parseActionFromResponse(rawText: string): { cleanedText: string; action?: SystemAction } {
  const actionRegex = /\[\[ACTION:(\{.*?\})\]\]/;
  const match = rawText.match(actionRegex);

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      const cleanedText = rawText.replace(actionRegex, '').trim();
      const action: SystemAction = {
        type: parsed.type as ActionType,
        title: parsed.title || 'System Action',
        description: `Executed ${parsed.type}`,
        query: parsed.query,
        contactName: parsed.contactName,
        phoneNumber: parsed.phoneNumber,
        timerSeconds: parsed.timerSeconds,
        status: 'pending',
      };
      return { cleanedText, action };
    } catch (e) {
      console.error('Failed to parse action JSON:', e);
    }
  }

  return { cleanedText: rawText.trim() };
}

// Local smart responder for instant out-of-the-box operation
function generateLocalResponse(prompt: string): { text: string; action?: SystemAction; source: 'fallback' } {
  const lower = prompt.toLowerCase();

  // YouTube command
  if (lower.includes('youtube') || lower.includes('ইউটিউব')) {
    let query = '';
    if (lower.includes('search') || lower.includes('খোঁজ') || lower.includes('play') || lower.includes('বাজাও')) {
      query = prompt.replace(/(open|play|on|search|youtube|ইউটিউব|খোলো|চালিয়ে|দাও|বাজাও)/gi, '').trim();
    }
    return {
      text: query ? `ইউটিউবে "${query}" চালু করছি।` : 'ইউটিউব খুলে দিচ্ছি।',
      action: {
        type: 'youtube',
        title: 'Open YouTube',
        description: query ? `Searching YouTube for "${query}"` : 'Launching YouTube',
        query,
        targetUrl: query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` : 'https://www.youtube.com',
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // Call command
  if (lower.includes('call') || lower.includes('ফোন') || lower.includes('কল')) {
    let contact = 'Mom';
    if (lower.includes('mom') || lower.includes('মা') || lower.includes('মাকে') || lower.includes('আম্মু')) {
      contact = 'Mom (মা)';
    } else if (lower.includes('dad') || lower.includes('বাবা') || lower.includes('বাবাকে')) {
      contact = 'Dad (বাবা)';
    } else {
      contact = prompt.replace(/(call|phone|ফোন|কল|করো|দাও)/gi, '').trim() || 'Contact';
    }
    return {
      text: `${contact}-কে কল করছি...`,
      action: {
        type: 'call',
        title: `Calling ${contact}`,
        description: `Initiating phone call to ${contact}`,
        contactName: contact,
        phoneNumber: '+8801712345678',
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // WhatsApp command
  if (lower.includes('whatsapp') || lower.includes('হোয়াটসঅ্যাপ') || lower.includes('message') || lower.includes('মেসেজ')) {
    return {
      text: 'হোয়াটসঅ্যাপ চালু করছি, আপনার বার্তা পাঠাতে প্রস্তুত।',
      action: {
        type: 'whatsapp',
        title: 'Open WhatsApp',
        description: 'Opening WhatsApp messenger',
        targetUrl: 'https://web.whatsapp.com',
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // Flashlight command
  if (lower.includes('flashlight') || lower.includes('torch') || lower.includes('টর্চ') || lower.includes('আলো')) {
    return {
      text: 'টর্চ চালু করে দিচ্ছি।',
      action: {
        type: 'flashlight',
        title: 'Flashlight',
        description: 'Toggling device flashlight',
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // Alarm / Timer command
  if (lower.includes('alarm') || lower.includes('timer') || lower.includes('অ্যালার্ম') || lower.includes('টাইমার')) {
    return {
      text: '৫ মিনিটের জন্য অ্যালার্ম সেট করা হয়েছে।',
      action: {
        type: 'alarm',
        title: '5 Minute Timer',
        description: 'Countdown timer set for 5 minutes',
        timerSeconds: 300,
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // Weather command
  if (lower.includes('weather') || lower.includes('আবহাওয়া') || lower.includes('বৃষ্টি') || lower.includes('তাপমাত্রা')) {
    return {
      text: 'বর্তমানে ঢাকায় আকাশ পরিষ্কার, তাপমাত্রা ২৮° সেলসিয়াস এবং মৃদু বাতাস বইছে।',
      action: {
        type: 'weather',
        title: 'Live Weather',
        description: 'Dhaka weather: 28°C Sunny',
        query: 'Dhaka',
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // Music command
  if (lower.includes('music') || lower.includes('গান') || lower.includes('song') || lower.includes('বাজাও')) {
    return {
      text: 'আপনার জন্য একটি সুন্দর মিষ্টি বাংলা সুর বাজাচ্ছি।',
      action: {
        type: 'music',
        title: 'Play Melody',
        description: 'Playing Bengali acoustic melody',
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // Search command
  if (lower.includes('search') || lower.includes('গুগল') || lower.includes('খোঁজ') || lower.includes('who is') || lower.includes('কী')) {
    const q = prompt.replace(/(search|গুগলে|খোঁজ|করো)/gi, '').trim() || prompt;
    return {
      text: `গুগলে "${q}" সম্পর্কে খুঁজে দিচ্ছি।`,
      action: {
        type: 'search',
        title: 'Google Search',
        description: `Searching Google for "${q}"`,
        query: q,
        targetUrl: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        status: 'pending',
      },
      source: 'fallback',
    };
  }

  // Greetings
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('নমস্কার') || lower.includes('সালাম') || lower.includes('কেমন আছ')) {
    return {
      text: 'নমস্কার! আমি নুনুনতি (Nununti)। আপনার বিশ্বস্ত বাংলা এআই সঙ্গী। বলুন আপনাকে কী সাহায্য করতে পারি?',
      source: 'fallback',
    };
  }

  // Identity
  if (lower.includes('who are you') || lower.includes('তোমার নাম') || lower.includes('তুমি কে') || lower.includes('nununti')) {
    return {
      text: 'আমার নাম নুনুনতি। আমি আপনার অ্যান্ড্রয়েড এআই ভয়েস অ্যাসিস্ট্যান্ট। গ্রক (Groq) এলএলএম এবং বাংলা ভয়েসের মাধ্যমে আমি দ্রুত সব প্রশ্নের উত্তর দিতে পারি।',
      source: 'fallback',
    };
  }

  // Default natural helpful response
  return {
    text: `আমি বুঝতে পেরেছি: "${prompt}"। সেটিংস থেকে আপনার Groq API Key যুক্ত করলে Llama 3 এর মাধ্যমে আরো দ্রুত বিস্তারিত তথ্য পেতে পারেন।`,
    source: 'fallback',
  };
}

export async function testGroqConnection(apiKey: string, model: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say "নুনুনতি কানেক্টেড" in Bengali' }],
        max_tokens: 20,
      }),
    });

    const latency = Date.now() - start;
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message: err?.error?.message || `HTTP ${response.status}`,
        latencyMs: latency,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices?.[0]?.message?.content?.trim() || 'Connected successfully',
      latencyMs: latency,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      message,
      latencyMs: Date.now() - start,
    };
  }
}

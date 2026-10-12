export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type Emotion = 'neutral' | 'happy' | 'curious' | 'caring' | 'playful';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  actionExecuted?: SystemAction;
}

export type ActionType = 
  | 'youtube' 
  | 'call' 
  | 'whatsapp' 
  | 'search' 
  | 'alarm' 
  | 'flashlight' 
  | 'weather' 
  | 'music'
  | 'open_app';

export interface SystemAction {
  type: ActionType;
  title: string;
  description: string;
  query?: string;
  contactName?: string;
  phoneNumber?: string;
  timerSeconds?: number;
  targetUrl?: string;
  status: 'pending' | 'success' | 'cancelled';
}

export interface AssistantSettings {
  groqApiKey: string;
  groqModel: string;
  language: 'bn-BD' | 'en-US';
  ttsVoiceName: string;
  ttsPitch: number;
  ttsRate: number;
  wakeWordEnabled: boolean;
  wakeWordSensitivity: 'low' | 'medium' | 'high';
  avatarStyle: 'photorealistic' | 'vector';
  lockScreenOverlayEnabled: boolean;
  soundChimeEnabled: boolean;
  continuousListening: boolean;
}

export interface AndroidExportFile {
  name: string;
  path: string;
  description: string;
  content: string;
  language: string;
}

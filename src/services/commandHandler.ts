import { SystemAction } from '../types/assistant';

export interface CommandExecutionResult {
  action: SystemAction;
  modalToOpen?: 'calling' | 'alarm' | 'flashlight';
  openedExternalWindow?: boolean;
}

export function executeSystemAction(action: SystemAction): CommandExecutionResult {
  const result: CommandExecutionResult = {
    action: { ...action, status: 'success' },
  };

  switch (action.type) {
    case 'youtube': {
      const url = action.targetUrl || (
        action.query
          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(action.query)}`
          : 'https://www.youtube.com'
      );
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
        result.openedExternalWindow = true;
      } catch (e) {
        console.warn('Could not open YouTube:', e);
      }
      break;
    }

    case 'call': {
      // In mobile, tel: initiates the native dialer; in web we also show interactive calling modal
      result.modalToOpen = 'calling';
      break;
    }

    case 'whatsapp': {
      const text = action.query ? encodeURIComponent(action.query) : '';
      const phone = action.phoneNumber ? action.phoneNumber.replace(/[^0-9]/g, '') : '';
      const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://web.whatsapp.com/send?text=${text}`;
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
        result.openedExternalWindow = true;
      } catch (e) {
        console.warn('Could not open WhatsApp:', e);
      }
      break;
    }

    case 'search': {
      const url = action.targetUrl || `https://www.google.com/search?q=${encodeURIComponent(action.query || '')}`;
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
        result.openedExternalWindow = true;
      } catch (e) {
        console.warn('Could not open search:', e);
      }
      break;
    }

    case 'alarm': {
      result.modalToOpen = 'alarm';
      break;
    }

    case 'flashlight': {
      result.modalToOpen = 'flashlight';
      break;
    }

    case 'weather': {
      // Handled in voice and assistant display
      break;
    }

    case 'music': {
      // Triggers melody
      break;
    }

    default:
      break;
  }

  return result;
}

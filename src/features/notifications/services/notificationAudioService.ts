import {
  NOTIFICATIONS_SOUND_COOLDOWN_MS,
  NOTIFICATIONS_SOUND_NOTE_SECONDS,
  NOTIFICATIONS_SOUND_NOTES,
  NOTIFICATIONS_SOUND_VOLUME,
} from '../constants';
import { SoundPlayResult } from '../types';

type AudioContextConstructor = new () => AudioContext;

/** Lido por função: o estado muda depois de `resume()`, e o TS não sabe disso. */
function isRunning(context: AudioContext): boolean {
  return context.state === 'running';
}

function resolveAudioContext(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null;
  const scoped = window as Window & { webkitAudioContext?: AudioContextConstructor };
  return window.AudioContext ?? scoped.webkitAudioContext ?? null;
}

/**
 * Um único serviço de áudio por aba. O toque é sintetizado (duas notas
 * curtas, volume discreto, sem loop): não depende de arquivo nem de licença.
 *
 * Navegadores só liberam o áudio depois de um gesto. `unlock()` deve ser
 * chamado direto no clique; uma preferência salva não prova que o som esteja
 * liberado após recarregar a página.
 */
class NotificationAudioService {
  private context: AudioContext | null = null;
  private active: OscillatorNode[] = [];
  private lastPlayedAt = 0;

  isSupported(): boolean {
    return resolveAudioContext() !== null;
  }

  isUnlocked(): boolean {
    return this.context !== null && isRunning(this.context);
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    const Context = resolveAudioContext();
    if (!Context) return null;
    try {
      this.context = new Context();
    } catch {
      this.context = null;
    }
    return this.context;
  }

  /** Deve ser chamado dentro de um gesto do usuário. */
  async unlock(): Promise<boolean> {
    const context = this.ensureContext();
    if (!context) return false;
    try {
      if (!isRunning(context)) await context.resume();
    } catch {
      return false;
    }
    return isRunning(context);
  }

  /** `force` ignora o cooldown (usado pelo "Testar som"). */
  async play(force = false): Promise<SoundPlayResult> {
    const context = this.ensureContext();
    if (!context) return SoundPlayResult.UNSUPPORTED;
    const now = Date.now();
    if (!force && now - this.lastPlayedAt < NOTIFICATIONS_SOUND_COOLDOWN_MS)
      return SoundPlayResult.COOLDOWN;
    if (!isRunning(context)) {
      try {
        await context.resume();
      } catch {
        return SoundPlayResult.BLOCKED;
      }
      if (!isRunning(context)) return SoundPlayResult.BLOCKED;
    }
    try {
      this.stop();
      const gain = context.createGain();
      gain.connect(context.destination);
      const start = context.currentTime;
      gain.gain.setValueAtTime(0, start);
      NOTIFICATIONS_SOUND_NOTES.forEach((frequency, index) => {
        const noteStart = start + index * NOTIFICATIONS_SOUND_NOTE_SECONDS;
        const noteEnd = noteStart + NOTIFICATIONS_SOUND_NOTE_SECONDS;
        gain.gain.linearRampToValueAtTime(NOTIFICATIONS_SOUND_VOLUME, noteStart + 0.02);
        gain.gain.linearRampToValueAtTime(0, noteEnd);
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        oscillator.connect(gain);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd);
        oscillator.onended = () => {
          this.active = this.active.filter((item) => item !== oscillator);
        };
        this.active.push(oscillator);
      });
      this.lastPlayedAt = now;
      return SoundPlayResult.PLAYED;
    } catch {
      return SoundPlayResult.BLOCKED;
    }
  }

  /** Interrompe imediatamente qualquer toque em andamento. */
  stop(): void {
    for (const oscillator of this.active) {
      try {
        oscillator.stop();
      } catch {
        /* Já terminou. */
      }
    }
    this.active = [];
  }
}

export const notificationAudioService = new NotificationAudioService();

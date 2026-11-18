import {
  NOTIFICATIONS_EXTERNAL_BODY,
  NOTIFICATIONS_EXTERNAL_TEST_BODY,
  NOTIFICATIONS_EXTERNAL_TEST_TAG,
  NOTIFICATIONS_EXTERNAL_TITLE,
  NOTIFICATIONS_ICON,
  NOTIFICATIONS_SW_URL,
} from '../constants';
import { BrowserPermissionState } from '../types';
import { buildNotificationPath, resolvePermissionState } from '../utils';

/**
 * Notificações do navegador com o site aberto. A permissão é sempre lida do
 * navegador; o service worker só exibe avisos e trata o clique — não intercepta
 * requisições nem guarda respostas autenticadas.
 */
class BrowserNotificationService {
  private registration: Promise<ServiceWorkerRegistration | null> | null = null;

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.isSecureContext &&
      'Notification' in window &&
      'serviceWorker' in navigator
    );
  }

  permission(): BrowserPermissionState {
    const supported = this.isSupported();
    return resolvePermissionState({
      supported,
      permission: supported ? Notification.permission : null,
    });
  }

  /** Registra o worker antes de oferecer a permissão, para não perder o gesto. */
  prepare(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return Promise.resolve(null);
    if (!this.registration) {
      this.registration = navigator.serviceWorker
        .register(NOTIFICATIONS_SW_URL, { scope: '/' })
        .catch(() => {
          this.registration = null;
          return null;
        });
    }
    return this.registration;
  }

  /** Chamado diretamente no clique, sem esperar rede antes. */
  async requestPermission(): Promise<BrowserPermissionState> {
    if (!this.isSupported()) return BrowserPermissionState.UNSUPPORTED;
    try {
      await Notification.requestPermission();
    } catch {
      /* Safari antigo usa callback; o estado é relido abaixo. */
    }
    return this.permission();
  }

  private async display(tag: string, body: string, path: string): Promise<boolean> {
    if (this.permission() !== BrowserPermissionState.GRANTED) return false;
    const options: NotificationOptions = {
      body,
      tag,
      icon: NOTIFICATIONS_ICON,
      badge: NOTIFICATIONS_ICON,
      data: { path },
    };
    try {
      const registration = await this.prepare();
      if (registration) {
        await registration.showNotification(NOTIFICATIONS_EXTERNAL_TITLE, options);
        return true;
      }
      new Notification(NOTIFICATIONS_EXTERNAL_TITLE, options);
      return true;
    } catch {
      return false;
    }
  }

  /** Texto genérico: sem comentário, motivo ou dados pessoais na tela bloqueada. */
  showNotice(id: string): Promise<boolean> {
    return this.display(id, NOTIFICATIONS_EXTERNAL_BODY, buildNotificationPath(id));
  }

  showTest(): Promise<boolean> {
    return this.display(
      NOTIFICATIONS_EXTERNAL_TEST_TAG,
      NOTIFICATIONS_EXTERNAL_TEST_BODY,
      buildNotificationPath()
    );
  }

  /** Fecha avisos já exibidos (troca de conta/logout). */
  async closeAll(): Promise<void> {
    if (!this.isSupported() || !this.registration) return;
    try {
      const registration = await this.registration;
      const shown = (await registration?.getNotifications()) ?? [];
      shown.forEach((notification) => notification.close());
    } catch {
      /* Melhor esforço. */
    }
  }
}

export const browserNotificationService = new BrowserNotificationService();

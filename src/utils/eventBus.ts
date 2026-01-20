import { ErrorCategory } from './apiError';

type EventCallback<T = any> = (detail: T) => void;

class EventBus {
    private events: { [key: string]: EventCallback[] } = {};

    on<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }

    emit<T = any>(event: string, detail: T): void {
        if (!this.events[event]) return;
        this.events[event].forEach((callback) => callback(detail));
    }
}

export const eventBus = new EventBus();

export const EventTypes = {
    SHOW_TOAST: 'SHOW_TOAST',
    API_ERROR: 'API_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type ToastVariant = 'default' | 'error' | 'success' | 'warning' | 'info';

export interface ToastEvent {
    message: string;
    variant?: ToastVariant;
    autoHideDuration?: number;
}

export interface ApiErrorEvent {
    category: ErrorCategory;
    code: string | null;
    message: string;
    field: string | null;
    httpStatus: number | null;
    requiresRedirect: boolean;
    redirectTo: string | null;
}

export interface AuthErrorEvent {
    code: string;
    message: string;
    requiresLogout: boolean;
}

export interface PermissionErrorEvent {
    code: string;
    message: string;
    redirectTo: string;
}

export interface NetworkErrorEvent {
    message: string;
}

// Helper para emitir toast facilmente
export const showToast = (message: string, variant: ToastVariant = 'default', autoHideDuration?: number) => {
    eventBus.emit<ToastEvent>(EventTypes.SHOW_TOAST, { message, variant, autoHideDuration });
};

export const showSuccessToast = (message: string) => showToast(message, 'success');
export const showErrorToast = (message: string) => showToast(message, 'error');
export const showWarningToast = (message: string) => showToast(message, 'warning');
export const showInfoToast = (message: string) => showToast(message, 'info');

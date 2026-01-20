import React, { useEffect } from 'react';
import { useSnackbar, VariantType } from 'notistack';
import { eventBus, EventTypes, ToastEvent, ApiErrorEvent } from '@/utils/eventBus';

/**
 * Componente global para tratamento de erros e exibição de toasts.
 * Deve ser montado dentro do SnackbarProvider no App.tsx
 */
const GlobalErrorHandler: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        // Handler para toasts genéricos
        const handleShowToast = (detail: ToastEvent) => {
            enqueueSnackbar(detail.message, {
                variant: (detail.variant || 'default') as VariantType,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
                autoHideDuration: detail.autoHideDuration ?? 4000,
            });
        };

        // Handler para erros de API (pode ser usado para logging adicional ou ações específicas)
        const handleApiError = (detail: ApiErrorEvent) => {
            // Logging adicional em desenvolvimento
            if (import.meta.env.DEV) {
                console.log('[GlobalErrorHandler] API Error:', {
                    category: detail.category,
                    code: detail.code,
                    httpStatus: detail.httpStatus,
                });
            }

            // Ações específicas por categoria podem ser adicionadas aqui
            // Por exemplo, analytics, error reporting, etc.
        };

        // Registrar listeners
        eventBus.on(EventTypes.SHOW_TOAST, handleShowToast);
        eventBus.on(EventTypes.API_ERROR, handleApiError);

        // Cleanup
        return () => {
            eventBus.off(EventTypes.SHOW_TOAST, handleShowToast);
            eventBus.off(EventTypes.API_ERROR, handleApiError);
        };
    }, [enqueueSnackbar]);

    return null;
};

export default GlobalErrorHandler;

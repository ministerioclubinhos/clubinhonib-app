import React, { useEffect } from 'react';
import { useSnackbar, VariantType } from 'notistack';
import { eventBus, EventTypes, ToastEvent, ApiErrorEvent } from '@/utils/eventBus';

/**
 * Componente global para tratamento de erros e exibição de toasts.
 * Deve ser montado dentro do SnackbarProvider no App.tsx.
 *
 * Segue a documentação da API para tratamento por HTTP Status:
 * - 400: Mensagem de validação
 * - 401: Redireciona para login
 * - 403: Mostra "Acesso Negado"
 * - 404: Mostra "Não Encontrado"
 * - 409: Mostra conflito (ex: email já em uso)
 * - 422: Mostra erros de validação de campos
 * - 500: Mostra "Erro Interno, tente novamente"
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
                    field: detail.field,
                });
            }

            // Tratamento específico por HTTP status conforme documentação da API
            if (detail.httpStatus === 401 && detail.requiresRedirect) {
                // Erro de autenticação - o axios interceptor já trata o redirect
                // Apenas logamos aqui para analytics
                if (import.meta.env.DEV) {
                    console.log('[GlobalErrorHandler] Auth error detected, redirect should be handled by axios');
                }
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

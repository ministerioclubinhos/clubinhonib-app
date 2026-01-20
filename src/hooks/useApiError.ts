import { useState, useCallback } from 'react';
import {
    analyzeError,
    getErrorMessage,
    getErrorField,
    getApiErrorCode,
    isApiError,
    logApiError,
    AnalyzedError,
    ErrorCategory,
} from '@/utils/apiError';
import { ApiErrorCode, AuthErrorCode, UserErrorCode, ValidationErrorCode } from '@/types/api-error';

export interface FieldError {
    field: string;
    message: string;
}

export interface FormErrorState {
    message: string | null;
    fieldErrors: Record<string, string>;
    category: ErrorCategory | null;
    code: ApiErrorCode | null;
}

const initialState: FormErrorState = {
    message: null,
    fieldErrors: {},
    category: null,
    code: null,
};

/**
 * Hook para tratamento de erros de API em formulários
 *
 * @example
 * const { error, fieldErrors, handleError, clearError, setFieldError, hasFieldError, getFieldError } = useApiError();
 *
 * const handleSubmit = async () => {
 *   clearError();
 *   try {
 *     await api.post('/users', data);
 *   } catch (err) {
 *     handleError(err);
 *   }
 * };
 *
 * // No JSX:
 * <TextField
 *   error={hasFieldError('email')}
 *   helperText={getFieldError('email')}
 * />
 */
export const useApiError = () => {
    const [state, setState] = useState<FormErrorState>(initialState);

    /**
     * Processa um erro e atualiza o estado
     */
    const handleError = useCallback((error: unknown, context?: string) => {
        // Log do erro
        logApiError(error, context);

        const analyzed = analyzeError(error);
        const field = getErrorField(error);

        const newState: FormErrorState = {
            message: analyzed.message,
            fieldErrors: {},
            category: analyzed.category,
            code: analyzed.code,
        };

        // Se tem campo específico, adiciona ao fieldErrors
        if (field) {
            newState.fieldErrors[field] = analyzed.message;
        }

        // Tratamento especial para erros conhecidos com campo implícito
        if (analyzed.code) {
            switch (analyzed.code) {
                case UserErrorCode.EMAIL_IN_USE:
                    newState.fieldErrors['email'] = analyzed.message;
                    break;
                case AuthErrorCode.INVALID_CREDENTIALS:
                    newState.fieldErrors['email'] = analyzed.message;
                    newState.fieldErrors['password'] = ' '; // Marca como erro sem mensagem duplicada
                    break;
                case AuthErrorCode.CURRENT_PASSWORD_INCORRECT:
                    newState.fieldErrors['currentPassword'] = analyzed.message;
                    break;
                case AuthErrorCode.NEW_PASSWORD_SAME_AS_CURRENT:
                    newState.fieldErrors['newPassword'] = analyzed.message;
                    break;
                case UserErrorCode.INVALID_RECOVERY_CODE:
                case UserErrorCode.EXPIRED_RECOVERY_CODE:
                    newState.fieldErrors['code'] = analyzed.message;
                    break;
                case ValidationErrorCode.INVALID_DATE_RANGE:
                    newState.fieldErrors['startDate'] = analyzed.message;
                    newState.fieldErrors['endDate'] = ' ';
                    break;
            }
        }

        setState(newState);
        return analyzed;
    }, []);

    /**
     * Limpa todos os erros
     */
    const clearError = useCallback(() => {
        setState(initialState);
    }, []);

    /**
     * Limpa erro de um campo específico
     */
    const clearFieldError = useCallback((field: string) => {
        setState(prev => {
            const newFieldErrors = { ...prev.fieldErrors };
            delete newFieldErrors[field];
            return {
                ...prev,
                fieldErrors: newFieldErrors,
                // Limpa mensagem geral se não há mais erros de campo
                message: Object.keys(newFieldErrors).length === 0 ? null : prev.message,
            };
        });
    }, []);

    /**
     * Define erro para um campo específico manualmente
     */
    const setFieldError = useCallback((field: string, message: string) => {
        setState(prev => ({
            ...prev,
            fieldErrors: {
                ...prev.fieldErrors,
                [field]: message,
            },
        }));
    }, []);

    /**
     * Define mensagem de erro geral manualmente
     */
    const setError = useCallback((message: string) => {
        setState(prev => ({
            ...prev,
            message,
        }));
    }, []);

    /**
     * Verifica se um campo tem erro
     */
    const hasFieldError = useCallback((field: string): boolean => {
        return field in state.fieldErrors;
    }, [state.fieldErrors]);

    /**
     * Obtém mensagem de erro de um campo
     */
    const getFieldError = useCallback((field: string): string | undefined => {
        const error = state.fieldErrors[field];
        // Retorna undefined se o erro é apenas um marcador (' ')
        return error && error.trim() ? error : undefined;
    }, [state.fieldErrors]);

    /**
     * Verifica se é um tipo específico de erro
     */
    const isErrorCategory = useCallback((category: ErrorCategory): boolean => {
        return state.category === category;
    }, [state.category]);

    /**
     * Verifica se é um código de erro específico
     */
    const isErrorCode = useCallback((code: ApiErrorCode): boolean => {
        return state.code === code;
    }, [state.code]);

    return {
        // Estado
        error: state.message,
        fieldErrors: state.fieldErrors,
        category: state.category,
        code: state.code,
        hasError: state.message !== null || Object.keys(state.fieldErrors).length > 0,

        // Ações
        handleError,
        clearError,
        clearFieldError,
        setFieldError,
        setError,

        // Helpers
        hasFieldError,
        getFieldError,
        isErrorCategory,
        isErrorCode,
    };
};

export default useApiError;

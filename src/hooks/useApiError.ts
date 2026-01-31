import { useState, useCallback } from 'react';
import {
    analyzeError,
    getErrorField,
    logApiError,
    ErrorCategory,
    getApiErrorDetails,
} from '@/utils/apiError';
import {
    ApiErrorCode,
    AuthErrorCode,
    UserErrorCode,
    ValidationErrorCode,
    ClubErrorCode,
    ProfileErrorCode,
} from '@/types/api-error';

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

export const useApiError = () => {
    const [state, setState] = useState<FormErrorState>(initialState);

    const handleError = useCallback((error: unknown, context?: string) => {
        logApiError(error, context);

        const analyzed = analyzeError(error);
        const field = getErrorField(error);

        const newState: FormErrorState = {
            message: analyzed.message,
            fieldErrors: {},
            category: analyzed.category,
            code: analyzed.code,
        };

        if (field) {
            newState.fieldErrors[field] = analyzed.message;
        }
        if (analyzed.code) {
            switch (analyzed.code) {
                case AuthErrorCode.INVALID_CREDENTIALS:
                    newState.fieldErrors['email'] = analyzed.message;
                    newState.fieldErrors['password'] = ' ';
                    break;
                case AuthErrorCode.CURRENT_PASSWORD_INCORRECT:
                    newState.fieldErrors['currentPassword'] = analyzed.message;
                    break;
                case AuthErrorCode.NEW_PASSWORD_SAME_AS_CURRENT:
                    newState.fieldErrors['newPassword'] = analyzed.message;
                    break;

                case UserErrorCode.EMAIL_IN_USE:
                    newState.fieldErrors['email'] = analyzed.message;
                    break;
                case UserErrorCode.INVALID_RECOVERY_CODE:
                case UserErrorCode.EXPIRED_RECOVERY_CODE:
                    newState.fieldErrors['code'] = analyzed.message;
                    break;

                case ValidationErrorCode.INVALID_DATE_RANGE:
                    newState.fieldErrors['startDate'] = analyzed.message;
                    newState.fieldErrors['endDate'] = ' ';
                    break;
                case ValidationErrorCode.INVALID_FILE:
                case ValidationErrorCode.FILE_REQUIRED:
                    newState.fieldErrors['file'] = analyzed.message;
                    break;
                case ValidationErrorCode.INVALID_FORMAT:
                    if (field) {
                        newState.fieldErrors[field] = analyzed.message;
                    }
                    break;
                case ClubErrorCode.NUMBER_IN_USE:
                    newState.fieldErrors['number'] = analyzed.message;
                    break;
                case ClubErrorCode.ALREADY_EXISTS:
                    newState.fieldErrors['name'] = analyzed.message;
                    break;

                case ProfileErrorCode.ALREADY_EXISTS:
                    newState.fieldErrors['email'] = analyzed.message;
                    break;
            }
        }

        const details = getApiErrorDetails(error);
        if (details && typeof details === 'object') {
            const detailsWithErrors = details as { errors?: Array<{ field?: string; message?: string }> };
            if (Array.isArray(detailsWithErrors.errors)) {
                detailsWithErrors.errors.forEach((err) => {
                    if (err.field && err.message) {
                        newState.fieldErrors[err.field] = err.message;
                    }
                });
            }
        }

        setState(newState);
        return analyzed;
    }, []);

    const clearError = useCallback(() => {
        setState(initialState);
    }, []);

    const clearFieldError = useCallback((field: string) => {
        setState(prev => {
            const newFieldErrors = { ...prev.fieldErrors };
            delete newFieldErrors[field];
            return {
                ...prev,
                fieldErrors: newFieldErrors,
                message: Object.keys(newFieldErrors).length === 0 ? null : prev.message,
            };
        });
    }, []);

    const setFieldError = useCallback((field: string, message: string) => {
        setState(prev => ({
            ...prev,
            fieldErrors: {
                ...prev.fieldErrors,
                [field]: message,
            },
        }));
    }, []);

    const setError = useCallback((message: string) => {
        setState(prev => ({
            ...prev,
            message,
        }));
    }, []);

    const hasFieldError = useCallback((field: string): boolean => {
        return field in state.fieldErrors;
    }, [state.fieldErrors]);

    const getFieldError = useCallback((field: string): string | undefined => {
        const error = state.fieldErrors[field];
        return error && error.trim() ? error : undefined;
    }, [state.fieldErrors]);

    const isErrorCategory = useCallback((category: ErrorCategory): boolean => {
        return state.category === category;
    }, [state.category]);

    const isErrorCode = useCallback((code: ApiErrorCode): boolean => {
        return state.code === code;
    }, [state.code]);


    const requiresLogout = useCallback((): boolean => {
        if (!state.code) return false;
        return [
            AuthErrorCode.TOKEN_EXPIRED,
            AuthErrorCode.TOKEN_INVALID,
            AuthErrorCode.TOKEN_MISSING,
            AuthErrorCode.REFRESH_TOKEN_INVALID,
        ].includes(state.code as AuthErrorCode);
    }, [state.code]);

    const isConflictError = useCallback((): boolean => {
        return state.category === 'USER' || state.category === 'CLUB' || state.category === 'PROFILE';
    }, [state.category]);


    const isValidationError = useCallback((): boolean => {
        return state.category === 'VALIDATION';
    }, [state.category]);


    const isPermissionError = useCallback((): boolean => {
        return state.category === 'PERMISSION';
    }, [state.category]);


    const getErrorFields = useCallback((): string[] => {
        return Object.keys(state.fieldErrors).filter(
            field => state.fieldErrors[field] && state.fieldErrors[field].trim()
        );
    }, [state.fieldErrors]);

    return {
        error: state.message,
        fieldErrors: state.fieldErrors,
        category: state.category,
        code: state.code,
        hasError: state.message !== null || Object.keys(state.fieldErrors).length > 0,
        handleError,
        clearError,
        clearFieldError,
        setFieldError,
        setError,
        hasFieldError,
        getFieldError,
        getErrorFields,
        isErrorCategory,
        isErrorCode,
        requiresLogout,
        isConflictError,
        isValidationError,
        isPermissionError,
    };
};

export default useApiError;

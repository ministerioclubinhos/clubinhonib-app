import axios, { AxiosError } from 'axios';
import {
    ApiErrorResponse,
    ApiErrorData,
    ApiErrorCode,
    ApiErrorDetail,
    AuthErrorCode,
    UserErrorCode,
    PermissionErrorCode,
    ValidationErrorCode,
    ResourceErrorCode,
    ClubErrorCode,
    ChildErrorCode,
    ProfileErrorCode,
    ContactErrorCode,
    ContentErrorCode,
    InternalErrorCode,
} from '@/types/api-error';
import { GENERIC_ERROR_MESSAGES } from '@/constants/errorMessages';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Verifica se o erro é um erro de API padronizado
 */
export const isApiError = (error: unknown): error is AxiosError<ApiErrorResponse> => {
    if (!axios.isAxiosError(error)) return false;
    const data = error.response?.data;
    return (
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        'success' in data &&
        data.success === false
    );
};

/**
 * Verifica se o erro é um erro de rede (sem resposta do servidor)
 */
export const isNetworkError = (error: unknown): boolean => {
    return axios.isAxiosError(error) && error.code === 'ERR_NETWORK';
};

// ============================================================================
// Extractors
// ============================================================================

/**
 * Extrai o código de erro da API
 */
export const getApiErrorCode = (error: unknown): ApiErrorCode | null => {
    if (isApiError(error)) {
        return error.response?.data.error.code || null;
    }
    return null;
};

/**
 * Extrai os detalhes do erro (útil para validação de campos)
 */
export const getApiErrorDetails = (error: unknown): ApiErrorDetail | null => {
    if (isApiError(error)) {
        const details = error.response?.data.error.details;
        if (typeof details === 'object' && details !== null) {
            return details as ApiErrorDetail;
        }
    }
    return null;
};

/**
 * Extrai o campo específico do erro de validação
 */
export const getErrorField = (error: unknown): string | null => {
    const details = getApiErrorDetails(error);
    return details?.field || null;
};

/**
 * Extrai dados completos do erro para logging/debug
 */
export const getApiErrorData = (error: unknown): ApiErrorData | null => {
    if (isApiError(error)) {
        return error.response?.data.error || null;
    }
    return null;
};

/**
 * Extrai a mensagem de erro amigável
 */
export const getErrorMessage = (error: unknown, defaultMessage = GENERIC_ERROR_MESSAGES.UNEXPECTED): string => {
    if (isApiError(error)) {
        return error.response?.data.error.message || defaultMessage;
    }

    if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) return GENERIC_ERROR_MESSAGES.INTERNAL_SERVER;
        if (error.response?.status === 503) return GENERIC_ERROR_MESSAGES.SERVICE_UNAVAILABLE;
        if (error.code === 'ERR_NETWORK') return GENERIC_ERROR_MESSAGES.NETWORK_ERROR;
        if (error.code === 'ECONNABORTED') return GENERIC_ERROR_MESSAGES.TIMEOUT;
        return error.message || defaultMessage;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return defaultMessage;
};

// ============================================================================
// Error Categories
// ============================================================================

export type ErrorCategory =
    | 'AUTH'
    | 'USER'
    | 'PERMISSION'
    | 'VALIDATION'
    | 'RESOURCE'
    | 'CLUB'
    | 'CHILD'
    | 'PROFILE'
    | 'CONTACT'
    | 'CONTENT'
    | 'INTERNAL'
    | 'NETWORK'
    | 'UNKNOWN';

export interface AnalyzedError {
    category: ErrorCategory;
    code: ApiErrorCode | null;
    message: string;
    field: string | null;
    details: ApiErrorDetail | null;
    httpStatus: number | null;
    timestamp: string | null;
    path: string | null;
    requiresLogout: boolean;
    requiresRedirect: boolean;
    redirectTo: string | null;
}

/**
 * Analisa o erro e retorna informações categorizadas para tratamento
 */
export const analyzeError = (error: unknown): AnalyzedError => {
    const defaultResult: AnalyzedError = {
        category: 'UNKNOWN',
        code: null,
        message: getErrorMessage(error),
        field: null,
        details: null,
        httpStatus: null,
        timestamp: null,
        path: null,
        requiresLogout: false,
        requiresRedirect: false,
        redirectTo: null,
    };

    // Erro de rede
    if (isNetworkError(error)) {
        return {
            ...defaultResult,
            category: 'NETWORK',
            message: GENERIC_ERROR_MESSAGES.NETWORK_ERROR,
        };
    }

    // Não é erro de API padronizado
    if (!isApiError(error)) {
        return defaultResult;
    }

    const errorData = error.response?.data.error;
    if (!errorData) return defaultResult;

    const { code, message, details, timestamp, path } = errorData;
    const httpStatus = error.response?.status || null;

    const result: AnalyzedError = {
        ...defaultResult,
        code,
        message,
        details: typeof details === 'object' ? (details as ApiErrorDetail) : null,
        field: typeof details === 'object' && details !== null ? (details as ApiErrorDetail).field || null : null,
        httpStatus,
        timestamp,
        path,
    };

    // Categorizar por código de erro
    if (Object.values(AuthErrorCode).includes(code as AuthErrorCode)) {
        result.category = 'AUTH';
        // Erros que requerem logout/redirect
        if ([
            AuthErrorCode.TOKEN_EXPIRED,
            AuthErrorCode.TOKEN_INVALID,
            AuthErrorCode.TOKEN_MISSING,
            AuthErrorCode.REFRESH_TOKEN_INVALID,
        ].includes(code as AuthErrorCode)) {
            result.requiresLogout = true;
            result.requiresRedirect = true;
            result.redirectTo = '/login';
        }
    } else if (Object.values(UserErrorCode).includes(code as UserErrorCode)) {
        result.category = 'USER';
    } else if (Object.values(PermissionErrorCode).includes(code as PermissionErrorCode)) {
        result.category = 'PERMISSION';
        result.requiresRedirect = true;
        result.redirectTo = '/acesso-negado';
    } else if (Object.values(ValidationErrorCode).includes(code as ValidationErrorCode)) {
        result.category = 'VALIDATION';
    } else if (Object.values(ResourceErrorCode).includes(code as ResourceErrorCode)) {
        result.category = 'RESOURCE';
    } else if (Object.values(ClubErrorCode).includes(code as ClubErrorCode)) {
        result.category = 'CLUB';
    } else if (Object.values(ChildErrorCode).includes(code as ChildErrorCode)) {
        result.category = 'CHILD';
    } else if (Object.values(ProfileErrorCode).includes(code as ProfileErrorCode)) {
        result.category = 'PROFILE';
    } else if (Object.values(ContactErrorCode).includes(code as ContactErrorCode)) {
        result.category = 'CONTACT';
    } else if (Object.values(ContentErrorCode).includes(code as ContentErrorCode)) {
        result.category = 'CONTENT';
    } else if (Object.values(InternalErrorCode).includes(code as InternalErrorCode)) {
        result.category = 'INTERNAL';
    }

    return result;
};

// ============================================================================
// Error Code Checkers
// ============================================================================

export const isAuthError = (error: unknown): boolean => {
    const code = getApiErrorCode(error);
    return code !== null && Object.values(AuthErrorCode).includes(code as AuthErrorCode);
};

export const isPermissionError = (error: unknown): boolean => {
    const code = getApiErrorCode(error);
    return code !== null && Object.values(PermissionErrorCode).includes(code as PermissionErrorCode);
};

export const isValidationError = (error: unknown): boolean => {
    const code = getApiErrorCode(error);
    return code !== null && Object.values(ValidationErrorCode).includes(code as ValidationErrorCode);
};

export const isNotFoundError = (error: unknown): boolean => {
    const code = getApiErrorCode(error);
    if (!code) return false;

    const notFoundCodes = [
        ResourceErrorCode.NOT_FOUND,
        UserErrorCode.NOT_FOUND,
        ClubErrorCode.NOT_FOUND,
        ChildErrorCode.NOT_FOUND,
        ProfileErrorCode.NOT_FOUND,
        ProfileErrorCode.COORDINATOR_NOT_FOUND,
        ProfileErrorCode.TEACHER_NOT_FOUND,
        ContactErrorCode.NOT_FOUND,
        ...Object.values(ContentErrorCode),
    ];

    return notFoundCodes.includes(code as any);
};

export const isConflictError = (error: unknown): boolean => {
    const code = getApiErrorCode(error);
    if (!code) return false;

    const conflictCodes = [
        ResourceErrorCode.CONFLICT,
        ResourceErrorCode.ALREADY_EXISTS,
        UserErrorCode.ALREADY_EXISTS,
        UserErrorCode.EMAIL_IN_USE,
        ClubErrorCode.ALREADY_EXISTS,
        ClubErrorCode.NUMBER_IN_USE,
        ProfileErrorCode.ALREADY_EXISTS,
    ];

    return conflictCodes.includes(code as any);
};

export const isInternalError = (error: unknown): boolean => {
    const code = getApiErrorCode(error);
    return code !== null && Object.values(InternalErrorCode).includes(code as InternalErrorCode);
};

// ============================================================================
// Logging Helper
// ============================================================================

/**
 * Loga o erro com informações úteis para debug
 */
export const logApiError = (error: unknown, context?: string): void => {
    const analyzed = analyzeError(error);
    const prefix = context ? `[${context}]` : '[API Error]';

    if (import.meta.env.DEV) {
        console.group(`${prefix} ${analyzed.category}`);
        console.log('Code:', analyzed.code);
        console.log('Message:', analyzed.message);
        console.log('HTTP Status:', analyzed.httpStatus);
        console.log('Field:', analyzed.field);
        console.log('Details:', analyzed.details);
        console.log('Timestamp:', analyzed.timestamp);
        console.log('Path:', analyzed.path);
        console.groupEnd();
    } else {
        // Em produção, log simplificado
        console.error(`${prefix} [${analyzed.code}] ${analyzed.message} - ${analyzed.path}`);
    }
};

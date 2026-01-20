export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'AUTH_1001',
    TOKEN_EXPIRED = 'AUTH_1002',
    TOKEN_INVALID = 'AUTH_1003',
    TOKEN_MISSING = 'AUTH_1004',
    REFRESH_TOKEN_INVALID = 'AUTH_1005',
    CURRENT_PASSWORD_INCORRECT = 'AUTH_1006',
    NEW_PASSWORD_SAME_AS_CURRENT = 'AUTH_1007',
}

export enum UserErrorCode {
    NOT_FOUND = 'USER_2001',
    ALREADY_EXISTS = 'USER_2002',
    EMAIL_IN_USE = 'USER_2003',
    INACTIVE = 'USER_2004',
    INVALID_RECOVERY_CODE = 'USER_2005',
    EXPIRED_RECOVERY_CODE = 'USER_2006',
}

export enum PermissionErrorCode {
    ACCESS_DENIED = 'PERM_3001',
    INSUFFICIENT_PERMISSIONS = 'PERM_3002',
    FEATURE_DISABLED = 'PERM_3003',
    ROLE_NOT_ALLOWED = 'PERM_3004',
}

export enum ValidationErrorCode {
    VALIDATION_ERROR = 'VAL_4001',
    INVALID_INPUT = 'VAL_4002',
    INVALID_FILE = 'VAL_4003',
    FILE_REQUIRED = 'VAL_4004',
    INVALID_DATE_RANGE = 'VAL_4005',
    INVALID_FORMAT = 'VAL_4006',
}

export enum ResourceErrorCode {
    NOT_FOUND = 'RES_5001',
    CONFLICT = 'RES_5002',
    ALREADY_EXISTS = 'RES_5003',
}

export enum ClubErrorCode {
    NOT_FOUND = 'CLUB_6001',
    ALREADY_EXISTS = 'CLUB_6002',
    NUMBER_IN_USE = 'CLUB_6003',
    NO_ACCESS = 'CLUB_6004',
}

export enum ChildErrorCode {
    NOT_FOUND = 'CHILD_7001',
    NO_ACCESS = 'CHILD_7002',
}

export enum ProfileErrorCode {
    NOT_FOUND = 'PROFILE_8001',
    ALREADY_EXISTS = 'PROFILE_8002',
    COORDINATOR_NOT_FOUND = 'PROFILE_8003',
    TEACHER_NOT_FOUND = 'PROFILE_8004',
    INVALID_OPERATION = 'PROFILE_8005',
}

export enum ContactErrorCode {
    NOT_FOUND = 'CONTACT_8501',
}

export enum ContentErrorCode {
    DOCUMENT_NOT_FOUND = 'CONTENT_8601',
    MEDITATION_NOT_FOUND = 'CONTENT_8602',
    INFORMATIVE_NOT_FOUND = 'CONTENT_8603',
    EVENT_NOT_FOUND = 'CONTENT_8604',
    VIDEO_NOT_FOUND = 'CONTENT_8605',
    IMAGE_NOT_FOUND = 'CONTENT_8606',
    IDEA_NOT_FOUND = 'CONTENT_8607',
    ROUTE_NOT_FOUND = 'CONTENT_8608',
    COMMENT_NOT_FOUND = 'CONTENT_8609',
    FEEDBACK_NOT_FOUND = 'CONTENT_8610',
    PAGELA_NOT_FOUND = 'CONTENT_8611',
    WEEK_MATERIAL_NOT_FOUND = 'CONTENT_8612',
}

export enum InternalErrorCode {
    INTERNAL_SERVER_ERROR = 'INT_9001',
    DATABASE_ERROR = 'INT_9002',
    EXTERNAL_SERVICE_ERROR = 'INT_9003',
    FILE_UPLOAD_ERROR = 'INT_9004',
    EMAIL_SEND_ERROR = 'INT_9005',
}

export type ApiErrorCode =
    | AuthErrorCode
    | UserErrorCode
    | PermissionErrorCode
    | ValidationErrorCode
    | ResourceErrorCode
    | ClubErrorCode
    | ChildErrorCode
    | ProfileErrorCode
    | ContactErrorCode
    | ContentErrorCode
    | InternalErrorCode
    | string;

export interface ApiErrorDetail {
    field?: string;
    [key: string]: any;
}

export interface ApiErrorData {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail | unknown;
    timestamp: string;
    path: string;
}

export interface ApiErrorResponse {
    success: false;
    error: ApiErrorData;
}

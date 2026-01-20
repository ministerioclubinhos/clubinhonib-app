import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from '@/pages/Error/ErrorPage';

const logError = (error: any, info: React.ErrorInfo) => {
    console.error('[ErrorBoundary] Caught error:', error, info);
};

const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorPage}
            onError={logError}
            onReset={() => {
                console.log('[ErrorBoundary] Resetting app state...');
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

export default AppErrorBoundary;

// @vitest-environment jsdom

import axios, { AxiosError, CanceledError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { isRequestCanceled, logApiError } from './apiError';

describe('canceled API requests', () => {
    it('recognizes Axios and AbortController cancellations', () => {
        const axiosCancellation = new CanceledError('canceled');
        const codedCancellation = new AxiosError('canceled', 'ERR_CANCELED');
        const browserCancellation = new DOMException('aborted', 'AbortError');

        expect(isRequestCanceled(axiosCancellation)).toBe(true);
        expect(isRequestCanceled(codedCancellation)).toBe(true);
        expect(isRequestCanceled(browserCancellation)).toBe(true);
        expect(isRequestCanceled(new AxiosError('network', 'ERR_NETWORK'))).toBe(false);
        expect(axios.isCancel(axiosCancellation)).toBe(true);
    });

    it('does not write canceled requests to the console', () => {
        const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        logApiError(new CanceledError('canceled'), 'Axios Interceptor');

        expect(groupSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
        groupSpy.mockRestore();
        errorSpy.mockRestore();
    });
});

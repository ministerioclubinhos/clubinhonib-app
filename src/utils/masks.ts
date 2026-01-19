export const digitsOnly = (value: string | undefined | null): string => {
    if (!value) return '';
    return value.replace(/\D/g, '');
};

export const maskPhoneBR = (value: string | undefined | null): string => {
    if (!value) return '';
    const digits = digitsOnly(value);

    if (digits.length <= 10) {
        // (XX) XXXX-XXXX
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    } else {
        // (XX) XXXXX-XXXX
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }
};

export const maskCPF = (value: string | undefined | null): string => {
    if (!value) return '';
    const digits = digitsOnly(value);

    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

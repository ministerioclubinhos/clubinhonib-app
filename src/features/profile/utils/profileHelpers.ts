export type BirthdayStatus = 'today' | 'this-week' | 'this-month' | null;

/**
 * Get initials from a person's name
 * Returns first and last name initials, or just first initial if single name
 */
export const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
};

/**
 * Determine if a birthday is today, this week, or this month
 */
export const getBirthdayStatus = (birthDateStr?: string): BirthdayStatus => {
    if (!birthDateStr) return null;

    try {
        const today = new Date();
        const [, month, day] = birthDateStr.split('-').map(Number);

        const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

        if (birthdayThisYear < today &&
            !(birthdayThisYear.getDate() === today.getDate() &&
                birthdayThisYear.getMonth() === today.getMonth())) {
            birthdayThisYear.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = birthdayThisYear.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (birthdayThisYear.getDate() === today.getDate() &&
            birthdayThisYear.getMonth() === today.getMonth()) {
            return 'today';
        }

        if (diffDays > 0 && diffDays <= 7) {
            return 'this-week';
        }

        if (birthdayThisYear.getMonth() === today.getMonth() &&
            birthdayThisYear.getFullYear() === today.getFullYear()) {
            return 'this-month';
        }

        return null;
    } catch (e) {
        console.debug('getBirthdayStatus: Date parsing error', e);
        return null;
    }
};

/**
 * Calculate days until next birthday
 */
export const getDaysUntilBirthday = (birthDateStr?: string): number | null => {
    if (!birthDateStr) return null;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [, month, day] = birthDateStr.split('-').map(Number);

        const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
        birthdayThisYear.setHours(0, 0, 0, 0);

        if (birthdayThisYear < today) {
            birthdayThisYear.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = birthdayThisYear.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
        console.debug('getDaysUntilBirthday: Date parsing error', e);
        return null;
    }
};

/**
 * Format birth date as "DD de Month"
 */
export const formatBirthDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
        const [, month, day] = dateStr.split('-').map(Number);
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return `${day} de ${months[month - 1]}`;
    } catch (e) {
        console.debug('formatBirthDate: Date parsing error', e);
        return dateStr;
    }
};

/**
 * Format birth date as "DD Mon"
 */
export const formatBirthDateShort = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
        const [, month, day] = dateStr.split('-').map(Number);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${day} ${months[month - 1]}`;
    } catch (e) {
        console.debug('formatBirthDateShort: Date parsing error', e);
        return dateStr;
    }
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    try {
        const birthDate = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (e) {
        console.debug('calculateAge: Date parsing error', e);
        return null;
    }
};

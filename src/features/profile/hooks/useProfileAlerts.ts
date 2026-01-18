import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export interface ProfileAlert {
    id: string;
    message: string;
    to?: string;
}

export function useProfileAlerts() {
    const emailVerificationAlert = useSelector((state: any) => state.auth.emailVerificationAlert);
    const user = useSelector((state: any) => state.auth.user);

    return useMemo(() => {
        const alerts: ProfileAlert[] = [];

        if (emailVerificationAlert && emailVerificationAlert.verificationEmailSent) {
            alerts.push({
                id: 'email-verification',
                message: 'Um email de verificação foi enviado para o seu endereço.',
                to: '/verificar-email',
            });
        }

        if (user && (!user.image || !user.image.url)) {
            alerts.push({
                id: 'missing-photo',
                message: 'Adicione uma foto ao seu perfil.',
                to: '/meu-perfil#foto',
            });
        }

        if (user) {
            const nameParts = user.name ? user.name.trim().split(/\s+/) : [];
            const hasCompleteName = nameParts.length >= 3;
            const hasEmail = !!user.email;
            const hasPhone = !!user.phone;
            const hasCpf = !!user.cpf;

            if (!hasCompleteName || !hasEmail || !hasPhone || !hasCpf) {
                alerts.push({
                    id: 'incomplete-account-info',
                    message: "Complete 'Informações da sua conta'.",
                    to: '/meu-perfil',
                });
            }
        }

        if (user) {
            const pd = user.personalData;
            const pref = user.preferences;
            const requiredPD = ['birthDate', 'gender', 'gaLeaderName', 'gaLeaderContact'];
            const requiredPref = ['loveLanguages', 'temperaments', 'favoriteColor', 'favoriteFood', 'favoriteMusic', 'whatMakesYouSmile', 'skillsAndTalents'];
            const pdMissing = !pd || requiredPD.some((k) => !pd[k]);
            const prefMissing = !pref || requiredPref.some((k) => !pref[k]);
            if (pdMissing) {
                alerts.push({
                    id: 'missing-personaldata',
                    message: 'Complete seus dados pessoais.',
                    to: '/meu-perfil#pessoais',
                });
            }
            if (prefMissing) {
                alerts.push({
                    id: 'missing-preferences',
                    message: 'Complete suas preferências.',
                    to: '/meu-perfil#preferencias',
                });
            }
        }

        return alerts;
    }, [user, emailVerificationAlert]);
}

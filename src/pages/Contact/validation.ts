import * as Yup from 'yup';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

export const contactFormSchema = Yup.object().shape({
  name: Yup.string()
    .required(FORM_VALIDATION_MESSAGES.REQUIRED_FIELD)
    .min(2, 'Nome deve ter pelo menos 2 caracteres') // Keep specific length message or add to constants? Sticking with specific for now or use generic if available.
    .matches(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: Yup.string()
    .required(FORM_VALIDATION_MESSAGES.REQUIRED_FIELD)
    .email(FORM_VALIDATION_MESSAGES.INVALID_EMAIL),
  telefone: Yup.string()
    .required(FORM_VALIDATION_MESSAGES.REQUIRED_FIELD)
    .test('valid-phone', FORM_VALIDATION_MESSAGES.INVALID_PHONE, (val) => {
      const digits = val?.replace(/\D/g, '');
      return digits?.length === 10 || digits?.length === 11;
    }),
  mensagem: Yup.string()
    .required(FORM_VALIDATION_MESSAGES.REQUIRED_FIELD)
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});
